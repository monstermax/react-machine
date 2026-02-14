import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Opcode } from "../assembly/core/cpu_instructions";
import { MEMORY_MAP } from "../assembly/memory_map";

import { IoDevice } from "./devices/IoDevice";
import { KeyboardDevice } from "./devices/keyboard";
import { ConsoleDevice } from "./devices/console";
import { Clock } from "./devices/clock";
import { ScreenDevice } from "./devices/screen";
import { compileCode, getBytecodeArray } from "@/v2/lib/compilation";
import { CUSTOM_CPU } from "../compiler/arch_custom";
import { LedsDevice } from "./devices/leds";
import { DmaDevice } from "./devices/dma";
import { toHex } from "@/v2/lib/integers";

import type { u16, u8, u32 } from "@/types/cpu.types";


// ─────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────

interface WasmExports extends WebAssembly.Exports {
    memory: WebAssembly.Memory;
    instanciateComputer(): number;
    computerRunCycles(computerPtr: number, cycles: number): void;
    computerGetCycles(computerPtr: number): bigint;
    computerGetRegisterPC(computerPtr: number): u16;
    computerGetRegisterSP(computerPtr: number): u16;
    computerGetRegisterIR(computerPtr: number): u8;
    computerGetRegisterA(computerPtr: number): u8;
    computerGetRegisterB(computerPtr: number): u8;
    computerGetRegisterC(computerPtr: number): u8;
    computerGetRegisterD(computerPtr: number): u8;
    computerGetRegisterE(computerPtr: number): u8;
    computerGetRegisterF(computerPtr: number): u8;
    computerGetMemory(computerPtr: number, address: u16): u8;
    computerSetMemory(computerPtr: number, address: u16, value: u8): void;
    computerAddDevice(computerPtr: number, namePtr: number, nameLen: number, typeId: u8): u8;
    computerloadCode(computerPtr: number, valPtr: number, dataLen: number): void;
    allocate(size: number): number;
}


type EmulatorState = 'idle' | 'running' | 'paused' | 'halted' | 'error';


// ─────────────────────────────────────────────────────────
//  Default code
// ─────────────────────────────────────────────────────────

const DEFAULT_CODE = `; ── Hello World ──
; Écris ton code assembleur ici
; Il sera chargé en RAM à l'adresse spécifiée

section .text

start:
    ; Exemple : allumer les LEDs
    mov al, 0xFF
    lea cl, dl, [leds_io_base]
    sti cl, dl, al

    halt

section .data
    leds_io_base  dw 0xF020
`;


// ─────────────────────────────────────────────────────────
//  Main Playground Component
// ─────────────────────────────────────────────────────────

export const Playground: React.FC = () => {
    // Wasm
    const wasmRef = useRef<WebAssembly.Instance | null>(null);
    const [computerPointer, setComputerPointer] = useState<number | null>(null);

    // Clock
    const clockFrequency = 10 as u32;
    const speedFactor = 100 as u32;
    const [clock] = useState(() => new Clock(clockFrequency));
    const [cyclesPerSecond, setCyclesPerSecond] = useState(0);

    // State
    const [emulatorState, setEmulatorState] = useState<EmulatorState>('idle');
    const [code, setCode] = useState(DEFAULT_CODE);
    const [loadAddress, setLoadAddress] = useState('0x1000');
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Registers
    const [regData, setRegData] = useState<Record<string, u8>>({});
    const [regControl, setRegControl] = useState<Record<string, number | bigint>>({});

    // Devices
    const devicesRef = useRef<Map<number, IoDevice>>(new Map);
    const [screenDevice, setScreenDevice] = useState<ScreenDevice | null>(null);
    const [consoleDevice, setConsoleDevice] = useState<ConsoleDevice | null>(null);
    const [keyboardDevice, setKeyboardDevice] = useState<KeyboardDevice | null>(null);
    const [ledsDevice, setLedsDevice] = useState<LedsDevice | null>(null);

    // UI
    const [activeTab, setActiveTab] = useState<'editor' | 'output'>('editor');
    const [showRegisters, setShowRegisters] = useState(true);
    const logEndRef = useRef<HTMLDivElement>(null);

    // Screen pixel data (for rendering)
    const [pixels, setPixels] = useState<u8[][]>([]);
    const [consoleLines, setConsoleLines] = useState<string[]>([]);
    const [consoleCurrent, setConsoleCurrent] = useState('');
    const [ledsValue, setLedsValue] = useState<u8>(0 as u8);
    const [lastKey, setLastKey] = useState<u8>(0 as u8);
    const [hasKey, setHasKey] = useState(false);


    // ── Wasm Init ──

    useEffect(() => {
        const init = async () => {
            if (wasmRef.current) return;

            const imports = {
                env: {
                    memory: new WebAssembly.Memory({ initial: 256 }),
                    abort: (ptr: number) => {
                        clock.stop();
                        const msg = readWasmString(ptr);
                        addLog(`❌ WASM ABORT: ${msg}`);
                        setEmulatorState('error');
                        setError(msg);
                    },
                    'console.log': (ptr: number) => {
                        const msg = readWasmString(ptr);
                        if (msg.startsWith('DEBUG')) addLog(`🔍 ${msg}`);
                    },
                    'console.warn': (ptr: number) => {
                        addLog(`⚠️ ${readWasmString(ptr)}`);
                    },
                    jsIoRead,
                    jsIoWrite,
                    jsCpuHalted,
                },
            };

            const importUrl = await import(`../build/release.wasm?url`);
            const response = fetch(importUrl.default);
            const _wasm = await WebAssembly.instantiateStreaming(response, imports);
            wasmRef.current = _wasm.instance;

            const wasmExports = _wasm.instance.exports as WasmExports;
            const ptr = wasmExports.instanciateComputer();
            setComputerPointer(ptr);

            addLog('✅ Emulator initialized');
        };

        const t = setTimeout(init, 50);
        return () => clearTimeout(t);
    }, []);


    // ── Load Devices ──

    useEffect(() => {
        if (!computerPointer) return;

        const load = () => {
            addDevice('keyboard', 1 as u8);
            addDevice('console', 2 as u8);
            addDevice('leds', 2 as u8);
            addDevice('screen', 2 as u8);
            addLog('✅ Devices loaded');
        };

        const t = setTimeout(load, 50);
        return () => clearTimeout(t);
    }, [computerPointer]);


    // ── Init Clock ──

    useEffect(() => {
        if (!computerPointer) return;

        let lastCycles = 0n;
        let lastTime = Date.now();

        clock.on('tick', () => {
            if (!wasmRef.current || !computerPointer) return;
            const ex = wasmRef.current.exports as WasmExports;

            ex.computerRunCycles(computerPointer, speedFactor);

            const now = Date.now();
            const cycles = ex.computerGetCycles(computerPointer);
            const diff = cycles - lastCycles;
            const dt = now - lastTime;
            if (dt > 0) setCyclesPerSecond(1000 * Number(diff) / dt);
            lastCycles = cycles;
            lastTime = now;

            // Update registers
            setRegData({
                A: ex.computerGetRegisterA(computerPointer),
                B: ex.computerGetRegisterB(computerPointer),
                C: ex.computerGetRegisterC(computerPointer),
                D: ex.computerGetRegisterD(computerPointer),
                E: ex.computerGetRegisterE(computerPointer),
                F: ex.computerGetRegisterF(computerPointer),
            });
            setRegControl({
                PC: ex.computerGetRegisterPC(computerPointer),
                SP: ex.computerGetRegisterSP(computerPointer),
                IR: ex.computerGetRegisterIR(computerPointer),
            });
        });
    }, [computerPointer]);


    // ── Device listeners ──

    useEffect(() => {
        if (screenDevice) {
            screenDevice.on('state', (s) => {
                if (s.pixels) setPixels([...s.pixels]);
            });
        }
    }, [screenDevice]);

    useEffect(() => {
        if (consoleDevice) {
            consoleDevice.on('state', (s) => {
                if (s.lines !== undefined) setConsoleLines([...s.lines]);
                if (s.currentLine !== undefined) setConsoleCurrent(s.currentLine);
            });
        }
    }, [consoleDevice]);

    useEffect(() => {
        if (ledsDevice) {
            ledsDevice.on('state', (s) => {
                if (s.leds !== undefined) setLedsValue(s.leds);
            });
        }
    }, [ledsDevice]);

    useEffect(() => {
        if (keyboardDevice) {
            keyboardDevice.on('state', (s) => {
                if (s.lastChar !== undefined) setLastKey(s.lastChar);
                if (s.hasChar !== undefined) setHasKey(s.hasChar);
            });
        }
    }, [keyboardDevice]);


    // ── Scroll logs ──
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);


    // ── Core functions ──

    const readWasmString = (ptr: number): string => {
        if (!wasmRef.current) return '';
        const mem = (wasmRef.current.exports as WasmExports).memory;
        const u16 = new Uint16Array(mem.buffer, ptr);
        let len = 0;
        while (u16[len] !== 0) len++;
        return new TextDecoder('utf-16le').decode(new Uint8Array(mem.buffer, ptr, len * 2));
    };

    const jsIoRead = (deviceIdx: u8, port: u8): u8 => {
        const device = devicesRef.current.get(deviceIdx);
        if (!device) return 0 as u8;
        return device.read(port);
    };

    const jsIoWrite = (deviceIdx: u8, port: u8, value: u8): void => {
        const device = devicesRef.current.get(deviceIdx);
        if (!device) return;
        device.write(port, value);
    };

    const jsCpuHalted = (): void => {
        clock.stop();
        setEmulatorState('halted');
        addLog('⏹ CPU halted');
    };

    const readRam = (address: u16): u8 => {
        if (!wasmRef.current || computerPointer === null) return 0 as u8;
        return (wasmRef.current.exports as WasmExports).computerGetMemory(computerPointer, address);
    };

    const writeRam = (address: u16, value: u8) => {
        if (!wasmRef.current || computerPointer === null) return;
        (wasmRef.current.exports as WasmExports).computerSetMemory(computerPointer, address, value);
    };

    const addLog = (msg: string) => {
        setLogs(prev => [...prev.slice(-200), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const addDevice = (name: string, typeId: u8) => {
        if (!wasmRef.current || !computerPointer) return;
        const ex = wasmRef.current.exports as WasmExports;

        const buf = new TextEncoder().encode(name);
        const ptr = ex.allocate(buf.length);
        new Uint8Array(ex.memory.buffer).set(buf, ptr);
        const idx = ex.computerAddDevice(computerPointer, ptr, buf.length, typeId);

        if (name === 'keyboard') {
            const d = new KeyboardDevice(idx, name, { type: 'input' });
            devicesRef.current.set(idx, d);
            setKeyboardDevice(d);
        } else if (name === 'console') {
            const d = new ConsoleDevice(idx, name, { type: 'output' });
            devicesRef.current.set(idx, d);
            setConsoleDevice(d);
        } else if (name === 'screen') {
            const d = new ScreenDevice(idx, name, { type: 'output' });
            devicesRef.current.set(idx, d);
            setScreenDevice(d);
        } else if (name === 'leds') {
            const d = new LedsDevice(idx, name, { type: 'output' });
            devicesRef.current.set(idx, d);
            setLedsDevice(d);
        } else {
            devicesRef.current.set(idx, new IoDevice(idx, name, { type: 'output' }));
        }
    };


    // ── Actions ──

    const handleCompileAndLoad = async () => {
        if (!wasmRef.current || computerPointer === null) return;

        setError(null);
        const addr = parseInt(loadAddress);
        if (isNaN(addr)) {
            setError('Invalid load address');
            return;
        }

        try {
            addLog(`📝 Compiling... (load @ ${toHex(addr, 4)})`);

            const compiled = await compileCode(code, CUSTOM_CPU, { startAddress: addr });

            if (compiled.errors.length > 0) {
                const errMsg = compiled.errors.map(e => `Line ${e.line}: ${e.message}`).join('\n');
                setError(errMsg);
                addLog(`❌ Compilation failed`);
                return;
            }

            const bytecode = getBytecodeArray(compiled);
            const ex = wasmRef.current.exports as WasmExports;

            // Write each byte to RAM at the correct address
            for (const [address, value] of bytecode.entries()) {
                ex.computerSetMemory(computerPointer, address as u16, value as u8);
            }

            addLog(`✅ Loaded ${bytecode.size} bytes @ ${toHex(addr, 4)}`);
        } catch (e: any) {
            setError(e.message || 'Compilation error');
            addLog(`❌ ${e.message}`);
        }
    };

    const handleRun = () => {
        if (!computerPointer) return;
        clock.start();
        setEmulatorState('running');
        addLog('▶ Running');
    };

    const handlePause = () => {
        clock.stop();
        setEmulatorState('paused');
        addLog('⏸ Paused');
    };

    const handleStop = () => {
        clock.stop();
        setEmulatorState('idle');
        setCyclesPerSecond(0);
        addLog('⏹ Stopped');
    };

    const handleStep = () => {
        if (!wasmRef.current || computerPointer === null) return;
        const ex = wasmRef.current.exports as WasmExports;
        ex.computerRunCycles(computerPointer, 1);
        setEmulatorState('paused');

        setRegData({
            A: ex.computerGetRegisterA(computerPointer),
            B: ex.computerGetRegisterB(computerPointer),
            C: ex.computerGetRegisterC(computerPointer),
            D: ex.computerGetRegisterD(computerPointer),
            E: ex.computerGetRegisterE(computerPointer),
            F: ex.computerGetRegisterF(computerPointer),
        });
        setRegControl({
            PC: ex.computerGetRegisterPC(computerPointer),
            SP: ex.computerGetRegisterSP(computerPointer),
            IR: ex.computerGetRegisterIR(computerPointer),
        });
    };

    const handleReset = () => {
        if (!wasmRef.current || computerPointer === null) return;
        clock.stop();

        // Clear screen, console, leds
        screenDevice?.reset();
        consoleDevice?.reset();
        ledsDevice?.reset();
        keyboardDevice?.reset();

        setEmulatorState('idle');
        setCyclesPerSecond(0);
        setPixels([]);
        setConsoleLines([]);
        setConsoleCurrent('');
        setLedsValue(0 as u8);
        addLog('🔄 Reset');
    };


    // ── Derived ──

    const leds = useMemo(() =>
        Array.from({ length: 8 }, (_, i) => ((ledsValue >> i) & 1) as u8),
        [ledsValue]
    );

    const stateColor: Record<EmulatorState, string> = {
        idle: 'text-zinc-500',
        running: 'text-emerald-400',
        paused: 'text-amber-400',
        halted: 'text-red-400',
        error: 'text-red-500',
    };

    const getPixelColor = (val: u8): string => {
        const hue = Math.round((val / 255) * 360);
        return `hsl(${hue},100%,50%)`;
    };

    const getPixel = (x: number, y: number): u8 => {
        if (!pixels.length || y < 0 || y >= 32 || x < 0 || x >= 32) return 0 as u8;
        return pixels[y]?.[x] ?? (0 as u8);
    };


    // ─────────────────────────────────────────────────────
    //  Render
    // ─────────────────────────────────────────────────────

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0f] text-zinc-200 overflow-hidden"
            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace" }}>

            {/* ── Top Bar ── */}
            <header className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80 bg-[#0d0d14]">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        <span className="text-sm font-semibold tracking-wider text-zinc-300 uppercase">
                            8-bit Playground
                        </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 tracking-wider">
                        v3
                    </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                    <span className={`${stateColor[emulatorState]} uppercase tracking-wider font-medium`}>
                        ● {emulatorState}
                    </span>
                    {emulatorState === 'running' && (
                        <span className="text-zinc-500">
                            {Math.round(cyclesPerSecond)} cyc/s
                        </span>
                    )}
                </div>
            </header>

            {/* ── Toolbar ── */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-zinc-800/60 bg-[#0b0b12]">
                {/* Compile & Load */}
                <button
                    onClick={handleCompileAndLoad}
                    className="px-3.5 py-1.5 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                    Compile & Load
                </button>

                <div className="flex items-center gap-1.5 ml-1">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider">@</label>
                    <input
                        value={loadAddress}
                        onChange={e => setLoadAddress(e.target.value)}
                        className="w-20 px-2 py-1 text-xs bg-zinc-900 border border-zinc-700/50 rounded text-zinc-300 focus:outline-none focus:border-indigo-500/60"
                        placeholder="0x1000"
                    />
                </div>

                <div className="w-px h-5 bg-zinc-800 mx-2" />

                {/* Controls */}
                <button onClick={handleRun} disabled={emulatorState === 'running'}
                    className="px-3 py-1.5 text-xs rounded bg-emerald-600/90 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600/90 text-white transition-colors">
                    ▶ Run
                </button>
                <button onClick={handlePause} disabled={emulatorState !== 'running'}
                    className="px-3 py-1.5 text-xs rounded bg-amber-600/90 hover:bg-amber-500 disabled:opacity-30 disabled:hover:bg-amber-600/90 text-white transition-colors">
                    ⏸ Pause
                </button>
                <button onClick={handleStep}
                    className="px-3 py-1.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors">
                    Step
                </button>
                <button onClick={handleStop}
                    className="px-3 py-1.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors">
                    ⏹ Stop
                </button>
                <button onClick={handleReset}
                    className="px-3 py-1.5 text-xs rounded bg-red-700/70 hover:bg-red-600 text-zinc-200 transition-colors">
                    Reset
                </button>
            </div>

            {/* ── Error Bar ── */}
            {error && (
                <div className="px-5 py-2 bg-red-950/60 border-b border-red-800/40 text-red-300 text-xs whitespace-pre-wrap">
                    {error}
                    <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-300">✕</button>
                </div>
            )}

            {/* ── Main Content ── */}
            <div className="flex-1 flex overflow-hidden">

                {/* ── Left: Editor ── */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-800/60">
                    {/* Tab bar */}
                    <div className="flex border-b border-zinc-800/60 bg-[#0c0c13]">
                        <button
                            onClick={() => setActiveTab('editor')}
                            className={`px-4 py-2 text-xs tracking-wider uppercase transition-colors ${
                                activeTab === 'editor'
                                    ? 'text-zinc-200 border-b-2 border-indigo-500'
                                    : 'text-zinc-500 hover:text-zinc-400'
                            }`}
                        >
                            Editor
                        </button>
                        <button
                            onClick={() => setActiveTab('output')}
                            className={`px-4 py-2 text-xs tracking-wider uppercase transition-colors ${
                                activeTab === 'output'
                                    ? 'text-zinc-200 border-b-2 border-indigo-500'
                                    : 'text-zinc-500 hover:text-zinc-400'
                            }`}
                        >
                            Log
                        </button>
                    </div>

                    {activeTab === 'editor' ? (
                        <textarea
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            spellCheck={false}
                            className="flex-1 w-full p-4 bg-[#0a0a10] text-emerald-300/90 text-sm leading-6 resize-none focus:outline-none selection:bg-indigo-500/30 placeholder:text-zinc-700"
                            style={{ tabSize: 4 }}
                            placeholder="; Write your assembly here..."
                        />
                    ) : (
                        <div className="flex-1 overflow-y-auto p-4 bg-[#08080d] text-xs leading-5">
                            {logs.length === 0 ? (
                                <div className="text-zinc-600 italic">No logs yet.</div>
                            ) : (
                                logs.map((l, i) => (
                                    <div key={i} className="text-zinc-400">{l}</div>
                                ))
                            )}
                            <div ref={logEndRef} />
                        </div>
                    )}
                </div>

                {/* ── Right: Emulator Output ── */}
                <div className="w-[360px] flex flex-col bg-[#09090e] overflow-y-auto">

                    {/* Screen */}
                    <div className="p-4 border-b border-zinc-800/50">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Screen</h3>
                            <button
                                onClick={() => screenDevice?.clear()}
                                className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-500 transition-colors"
                            >
                                Clear
                            </button>
                        </div>

                        <div className="bg-black rounded-lg p-1.5 border border-zinc-800/40 mx-auto"
                            style={{ width: 'fit-content', imageRendering: 'pixelated' }}>
                            <div className="grid" style={{
                                gridTemplateColumns: 'repeat(32, 1fr)',
                                gap: '0.5px',
                            }}>
                                {Array.from({ length: 32 }).map((_, y) =>
                                    Array.from({ length: 32 }).map((_, x) => {
                                        const c = getPixel(x, y);
                                        return (
                                            <div key={`${y}-${x}`}
                                                className="w-[9px] h-[9px]"
                                                style={{
                                                    backgroundColor: c ? getPixelColor(c) : '#111118',
                                                }}
                                            />
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Console */}
                    <div className="p-4 border-b border-zinc-800/50">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Console</h3>
                            <button
                                onClick={() => consoleDevice?.reset()}
                                className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-500 transition-colors"
                            >
                                Clear
                            </button>
                        </div>

                        <div className="bg-black rounded-lg p-3 h-32 overflow-y-auto border border-zinc-800/40 text-xs leading-5">
                            {consoleLines.length === 0 && !consoleCurrent ? (
                                <div className="text-zinc-700 italic">Console output...</div>
                            ) : (
                                <>
                                    {consoleLines.map((l, i) => (
                                        <div key={i} className="text-emerald-400">{l || '\u00A0'}</div>
                                    ))}
                                    {consoleCurrent && (
                                        <div className="text-emerald-400">
                                            {consoleCurrent}<span className="animate-pulse opacity-70">_</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* LEDs + Keyboard */}
                    <div className="p-4 border-b border-zinc-800/50 flex gap-6">
                        {/* LEDs */}
                        <div className="flex-1">
                            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium mb-3">LEDs</h3>
                            <div className="flex gap-1.5 justify-center">
                                {leds.map((on, i) => (
                                    <div key={i}
                                        className="w-5 h-5 rounded-full transition-all duration-150"
                                        style={{
                                            backgroundColor: on ? '#facc15' : '#1e1e2a',
                                            boxShadow: on ? '0 0 10px rgba(250,204,21,0.5)' : 'none',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Keyboard */}
                        <div className="flex-1">
                            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium mb-3">Keyboard</h3>
                            <div className="flex items-center gap-2 justify-center">
                                <span className="text-lg text-emerald-400 font-mono">
                                    {lastKey > 0 ? `'${String.fromCharCode(lastKey)}'` : '--'}
                                </span>
                                <div className={`w-2.5 h-2.5 rounded-full ${hasKey ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
                            </div>
                        </div>
                    </div>

                    {/* Registers */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Registers</h3>
                            <button onClick={() => setShowRegisters(r => !r)}
                                className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">
                                {showRegisters ? '▲' : '▼'}
                            </button>
                        </div>

                        {showRegisters && (
                            <div className="grid grid-cols-3 gap-x-3 gap-y-1.5 text-xs">
                                {Object.entries(regData).map(([name, value]) => (
                                    <div key={name} className="flex justify-between px-2 py-1 rounded bg-zinc-900/60">
                                        <span className="text-indigo-400">{name}</span>
                                        <span className="text-zinc-400">{toHex(value)}</span>
                                    </div>
                                ))}
                                <div className="col-span-3 h-px bg-zinc-800/60 my-1" />
                                {Object.entries(regControl).map(([name, value]) => (
                                    <div key={name} className="flex justify-between px-2 py-1 rounded bg-zinc-900/60">
                                        <span className="text-amber-400/80">{name}</span>
                                        <span className="text-zinc-400">{toHex(Number(value), name === 'IR' ? 2 : 4)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
