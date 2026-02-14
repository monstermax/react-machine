
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Editor, type PrismEditor } from "prism-react-editor";

import "prism-react-editor/prism/languages/nasm";
import "prism-react-editor/languages/asm";
import "prism-react-editor/layout.css";
import "prism-react-editor/themes/github-dark.css";

import { MEMORY_MAP } from "../assembly/memory_map";

import { IoDevice } from "./devices/IoDevice";
import { Keyboard, KeyboardDevice } from "./devices/keyboard";
import { Console, ConsoleDevice } from "./devices/console";
import { Clock } from "./devices/clock";
import { Screen, ScreenDevice } from "./devices/screen";
import { compileCode, getBytecodeArray, loadSourceCodeFromFile } from "@/v2/lib/compilation";
import { CUSTOM_CPU } from "../compiler/arch_custom";
import { Leds, LedsDevice } from "./devices/leds";
import { Disk, DiskDevice } from "./devices/disk";
import { DmaDevice } from "./devices/dma";
import { MemoryExplorer } from "./MemoryExplorer";
import { toHex } from "@/v2/lib/integers";

import type { u16, u8, u32 } from "@/types/cpu.types";


// ─────────────────────────────────────────────
//  Types (same as TestV3Component)
// ─────────────────────────────────────────────

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

declare global {
    interface Window {
        wasm?: WebAssembly.Instance;
    }
}


//  Default user code
const DEFAULT_CODE = `; == User Program (Loaded @ 0xA000) ==
; Type "exec" in the shell to run it.
; IMPORTANT: end with "ret" !


section .data
    screen_io_base  dw 0xF030


section .text
    global _start


_start:
    ; Example: XOR fractal on screen
    mov el, 0

.loop_y:
    cmp el, 32
    je .done
    mov fl, 0

.loop_x:
    cmp fl, 32
    je .next_y
    mov al, fl
    xor al, el
    shl al, 3
    call screen_set_pixel
    inc fl
    jmp .loop_x

.next_y:
    inc el
    jmp .loop_y

.done:
    ret


; --- Screen Utility: screen_set_pixel ---
; Input: F=X, E=Y, AL=color
screen_set_pixel:
    push cl
    push dl
    mov cl, [screen_io_base]
    mov dl, [screen_io_base + 1]
    sti cl, dl, fl
    call _inc_cd
    sti cl, dl, el
    call _inc_cd
    sti cl, dl, al
    pop dl
    pop cl
    ret


; --- Math Utility: _inc_cd ---
_inc_cd:
    inc cl
    jnc ._no_carry
    inc dl
    ._no_carry:
    ret

`;


// ─────────────────────────────────────────────
//  Playground Component
// ─────────────────────────────────────────────

export const Playground: React.FC = () => {
    // ── Wasm ──
    const wasmRef = useRef<WebAssembly.Instance | null>(null);
    const [computerPointer, setComputerPointer] = useState<number | null>(null);

    // ── Clock ──
    const clockFrequency = 10 as u32;
    const speedFactor = 100 as u32;
    const [clock] = useState(() => new Clock(clockFrequency));
    const [cyclesPerSecond, setCyclesPerSecond] = useState(0);

    // ── Registers & Memory (on-demand only via Dump buttons, NOT synced per tick) ──
    const [registers8, setRegisters8] = useState<Record<string, u8>>({});
    const [registers16, setRegisters16] = useState<Record<string, u8 | u16 | bigint>>({});
    const [memory, setMemory] = useState<Uint8Array<ArrayBuffer> | null>(null);

    // ── Devices (ALL of them, same as TestV3Component) ──
    const devicesRef = useRef<Map<number, IoDevice>>(new Map);
    const [keyboardDevice, setKeyboardDevice] = useState<KeyboardDevice | null>(null);
    const [consoleDevice, setConsoleDevice] = useState<ConsoleDevice | null>(null);
    const [screenDevice, setScreenDevice] = useState<ScreenDevice | null>(null);
    const [ledsDevice, setLedsDevice] = useState<LedsDevice | null>(null);
    const [diskDevice, setDiskDevice] = useState<DiskDevice | null>(null);
    const [dmaDevice, setDmaDevice] = useState<DmaDevice | null>(null);

    // ── Boot state ──
    const [devicesLoaded, setDevicesLoaded] = useState(false);
    const [bootloaderLoaded, setBootloaderLoaded] = useState(false);

    // ── Editor ──
    const [code, setCode] = useState(DEFAULT_CODE);
    const [loadAddress, setLoadAddress] = useState('0xA000');
    const [editorError, setEditorError] = useState<string | null>(null);
    const [editorStatus, setEditorStatus] = useState<string | null>(null);

    // ── Log ──
    const [activeTab, setActiveTab] = useState<'editor' | 'log'>('editor');
    const [rightTab, setRightTab] = useState<'devices' | 'memory'>('devices');
    const [logs, setLogs] = useState<string[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);


    // ═══════════════════════════════════════════
    //  Logging
    // ═══════════════════════════════════════════

    const addLog = useCallback((msg: string) => {
        setLogs(prev => [...prev.slice(-300), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    }, []);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);


    // ═══════════════════════════════════════════
    //  Auto-start when bootloader + devices ready
    // ═══════════════════════════════════════════

    useEffect(() => {
        if (!computerPointer || !devicesLoaded || !bootloaderLoaded) return;
        startClock();
    }, [computerPointer, devicesLoaded, bootloaderLoaded]);


    // ═══════════════════════════════════════════
    //  Init WASM (same as TestV3Component)
    // ═══════════════════════════════════════════

    useEffect(() => {
        const _initWasm = async () => {
            if (wasmRef.current) return;

            const imports = {
                env: {
                    memory: new WebAssembly.Memory({ initial: 256 }),
                    abort: (ptr: number) => {
                        clock.stop();
                        const message = readWasmStringUtf16(ptr);
                        console.error("[WASM ERROR]", message);
                        addLog(`WASM ABORT: ${message}`);
                        throw new Error("[WASM ABORT]");
                    },
                    'console.log': (ptr: number) => {
                        const message = readWasmStringUtf16(ptr);
                        let styles: string[] = [];
                        if (message.startsWith('Executing instruction')) styles.push('color:cyan');
                        if (message.startsWith('Reading Memory')) styles.push('color:green');
                        if (message.startsWith('Writing Memory')) styles.push('color:yellow');
                        if (message.startsWith('DEBUG')) styles.push('color:orange');
                        const messages = styles.length
                            ? ["%c[WASM LOG]", styles.join(';'), message]
                            : ["[WASM LOG]", message];
                        console.log(...messages);
                    },
                    'console.warn': (ptr: number) => {
                        const message = readWasmStringUtf16(ptr);
                        console.warn("[WASM WARN]", message);
                    },
                    jsIoRead,
                    jsIoWrite,
                    jsCpuHalted,
                },
            };

            const importUrl = await import(`../build/release.wasm?url`);
            const url = importUrl.default;
            const response = fetch(url);
            const _wasm = await WebAssembly.instantiateStreaming(response, imports);
            wasmRef.current = _wasm.instance;
            window.wasm = _wasm.instance;

            const wasmExports = _wasm.instance.exports as WasmExports;
            const _computerPointer = wasmExports.instanciateComputer();
            setComputerPointer(_computerPointer);

            console.log('memory:', wasmExports.memory);
            addLog('Emulator initialized');
        };

        const timer = setTimeout(_initWasm, 100);
        return () => clearTimeout(timer);
    }, []);


    // ═══════════════════════════════════════════
    //  Load bootloader ROM (same as TestV3Component)
    // ═══════════════════════════════════════════

    useEffect(() => {
        if (!computerPointer) return;
        const timer = setTimeout(loadBootloader, 100);
        return () => clearTimeout(timer);
    }, [computerPointer]);


    // ═══════════════════════════════════════════
    //  Load devices (same as TestV3Component)
    // ═══════════════════════════════════════════

    useEffect(() => {
        if (!computerPointer) return;

        const _loadDevices = () => {
            addDevice('keyboard', 'input', '', '');
            addDevice('console', 'output', '', '');
            addDevice('leds', 'output', '', '');
            addDevice('screen', 'output', '', '');
            addDevice('os_disk', 'storage', '', '');
            addDevice('dma', 'system', '', '');
            setDevicesLoaded(true);
            addLog('Devices loaded (keyboard, console, leds, screen, os_disk, dma)');
        };

        const timer = setTimeout(_loadDevices, 100);
        return () => clearTimeout(timer);
    }, [computerPointer]);


    // ═══════════════════════════════════════════
    //  Init clock (speed measurement only, NO register/memory sync)
    // ═══════════════════════════════════════════

    useEffect(() => {
        if (!computerPointer) return;

        const _initClock = () => {
            let lastCycles = 0n;
            let lastCyclesDate = Date.now();

            clock.on('tick', () => {
                if (wasmRef.current && computerPointer) {
                    const wasmExports = wasmRef.current.exports as WasmExports;

                    // Run cycles
                    wasmExports.computerRunCycles(computerPointer, speedFactor);

                    // Compute speed only
                    const newCycles = wasmExports.computerGetCycles(computerPointer);
                    const diff = newCycles - lastCycles;
                    const duration = Date.now() - lastCyclesDate;
                    const _cyclesPerSecond = 1000 * Number(diff) / duration;
                    setCyclesPerSecond(_cyclesPerSecond);

                    lastCycles = newCycles;
                    lastCyclesDate = Date.now();
                }
            });
        };

        const timer = setTimeout(_initClock, 100);
        return () => clearTimeout(timer);
    }, [computerPointer]);


    // ═══════════════════════════════════════════
    //  I/O callbacks (same as TestV3Component)
    // ═══════════════════════════════════════════

    const jsIoRead = (deviceIdx: u8, port: u8): u8 => {
        if (!devicesRef.current) throw new Error("missing devices ref");
        const device = devicesRef.current.get(deviceIdx);
        if (!device) throw new Error(`device #${deviceIdx} not found`);
        return device.read(port);
    };

    const jsIoWrite = (deviceIdx: u8, port: u8, value: u8): void => {
        if (!devicesRef.current) throw new Error("missing devices ref");
        const device = devicesRef.current.get(deviceIdx);
        if (!device) throw new Error(`device #${deviceIdx} not found`);
        device.write(port, value);
    };

    const jsCpuHalted = (): void => {
        clock.stop();
        addLog('CPU halted');
    };


    // ═══════════════════════════════════════════
    //  WASM string helper
    // ═══════════════════════════════════════════

    const readWasmStringUtf16 = (ptr: number) => {
        if (!wasmRef.current) throw new Error("wasm not found in readString");
        const wasmExports = wasmRef.current.exports as WasmExports;
        const mem = wasmExports.memory as WebAssembly.Memory;
        const uint16 = new Uint16Array(mem.buffer, ptr);
        let len = 0;
        while (uint16[len] !== 0) len++;
        const bytes = new Uint8Array(mem.buffer, ptr, len * 2);
        return new TextDecoder('utf-16le').decode(bytes);
    };


    // ═══════════════════════════════════════════
    //  Load bootloader (same as TestV3Component)
    // ═══════════════════════════════════════════

    const loadBootloader = async () => {
        if (!wasmRef.current || !computerPointer || !devicesRef.current) return;

        const wasmExports = wasmRef.current.exports as WasmExports;

        const sourceCode = await loadSourceCodeFromFile("bootloader/bootloader_v2.asm");
        const compiled = await compileCode(sourceCode, CUSTOM_CPU);

        if (compiled.errors.length > 0) {
            const errMsg = compiled.errors.map(e => `Line ${e.line}: ${e.message}`).join('\n');
            console.warn(`Bootloader Compilation errors:`, errMsg)
            throw new Error();
        }

        const codeRaw = Array.from(getBytecodeArray(compiled).entries());
        const values = new Uint8Array(codeRaw.map(r => r[1]));

        const valPtr = wasmExports.allocate(values.length);
        new Uint8Array(wasmExports.memory.buffer).set(values, valPtr);
        wasmExports.computerloadCode(computerPointer, valPtr, values.length);

        setBootloaderLoaded(true);
        addLog(`Bootloader loaded (${values.length} bytes)`);
    };


    // ═══════════════════════════════════════════
    //  Add device (same as TestV3Component, all cases)
    // ═══════════════════════════════════════════

    const addDevice = async (name: string, type: string, vendor = '', model = '') => {
        if (!wasmRef.current || !computerPointer || !devicesRef.current) return;

        const wasmExports = wasmRef.current.exports as WasmExports;

        let typeId = 1 as u8;
        const nameBuffer = new TextEncoder().encode(name);
        const namePtr = wasmExports.allocate(nameBuffer.length);
        const memoryUint8 = new Uint8Array(wasmExports.memory.buffer);
        memoryUint8.set(nameBuffer, namePtr);

        const deviceIdx = wasmExports.computerAddDevice(computerPointer, namePtr, nameBuffer.length, typeId);

        if (name === 'keyboard') {
            const device = new KeyboardDevice(deviceIdx, 'keyboard', { type: 'input', vendor, model });
            devicesRef.current.set(deviceIdx, device);
            setKeyboardDevice(device);

        } else if (name === 'console') {
            const { width, height } = { width: 80, height: 25 };
            const device = new ConsoleDevice(deviceIdx, 'console', { type: 'output', vendor, model, width, height });
            devicesRef.current.set(deviceIdx, device);
            setConsoleDevice(device);

        } else if (name === 'screen') {
            const device = new ScreenDevice(deviceIdx, 'screen', { type: 'output', vendor, model });
            devicesRef.current.set(deviceIdx, device);
            setScreenDevice(device);

        } else if (name === 'leds') {
            const device = new LedsDevice(deviceIdx, 'leds', { type: 'output', vendor, model });
            devicesRef.current.set(deviceIdx, device);
            setLedsDevice(device);

        } else if (name === 'dma') {
            const device = new DmaDevice(deviceIdx, 'dma', { type: 'system', vendor, model, devicesRef, readRam, writeRam });
            devicesRef.current.set(deviceIdx, device);
            setDmaDevice(device);

        } else if (name === 'os_disk') {
            const startAddress = MEMORY_MAP.OS_START;
            const sourceCode = await loadSourceCodeFromFile('os/os_v3.asm');
            const compiled = await compileCode(sourceCode, CUSTOM_CPU, { startAddress });

            if (compiled.errors.length > 0) {
                const errMsg = compiled.errors.map(e => `Line ${e.line}: ${e.message}`).join('\n');
                console.warn(`OS Compilation errors:`, errMsg)
                throw new Error();
            }

            const codeRaw = Array.from(getBytecodeArray(compiled).entries());
            const data = codeRaw ?? [];

            const device = new DiskDevice(deviceIdx, 'os_disk', { type: 'storage', vendor, model, data });
            devicesRef.current.set(deviceIdx, device);
            setDiskDevice(device);

        } else {
            const device = new IoDevice(deviceIdx, name, { type });
            devicesRef.current.set(deviceIdx, device);
        }
    };


    // ═══════════════════════════════════════════
    //  RAM access
    // ═══════════════════════════════════════════

    const readRam = (address: u16): u8 => {
        if (!wasmRef.current || computerPointer === null) return 0 as u8;
        const wasmExports = wasmRef.current.exports as WasmExports;
        return wasmExports.computerGetMemory(computerPointer, address);
    };

    const writeRam = (address: u16, value: u8) => {
        if (!wasmRef.current || computerPointer === null) return;
        const wasmExports = wasmRef.current.exports as WasmExports;
        //console.log(`write ram @ ${toHex(address, 4)} : ${toHex(value)} (${value})`)
        wasmExports.computerSetMemory(computerPointer, address, value);
    };


    // ═══════════════════════════════════════════
    //  Clock controls (same as TestV3Component)
    // ═══════════════════════════════════════════

    const startClock = () => clock.start();
    const stopClock = () => clock.stop();

    const runCycle = () => {
        if (!wasmRef.current || computerPointer === null) return;
        const wasmExports = wasmRef.current.exports as WasmExports;

        const controlBefore = readControlRegisters(wasmExports, computerPointer);
        const dataBefore = readDataRegisters(wasmExports, computerPointer);
        console.log('BEFORE', controlBefore, dataBefore);

        wasmExports.computerRunCycles(computerPointer, 1);

        const controlAfter = readControlRegisters(wasmExports, computerPointer);
        const dataAfter = readDataRegisters(wasmExports, computerPointer);
        console.log('AFTER', controlAfter, dataAfter);
    };


    // ═══════════════════════════════════════════
    //  Register & memory dump (on demand only)
    // ═══════════════════════════════════════════

    const readControlRegisters = (wasmExports: WasmExports, ptr: number) => ({
        cycles: wasmExports.computerGetCycles(ptr),
        PC: wasmExports.computerGetRegisterPC(ptr),
        SP: wasmExports.computerGetRegisterSP(ptr),
        IR: wasmExports.computerGetRegisterIR(ptr),
    });

    const readDataRegisters = (wasmExports: WasmExports, ptr: number) => ({
        A: wasmExports.computerGetRegisterA(ptr),
        B: wasmExports.computerGetRegisterB(ptr),
        C: wasmExports.computerGetRegisterC(ptr),
        D: wasmExports.computerGetRegisterD(ptr),
        E: wasmExports.computerGetRegisterE(ptr),
        F: wasmExports.computerGetRegisterF(ptr),
    });

    const dumpRegisters = async () => {
        if (!wasmRef.current || computerPointer === null) return;
        const wasmExports = wasmRef.current.exports as WasmExports;
        setRegisters8(readDataRegisters(wasmExports, computerPointer));
        setRegisters16(readControlRegisters(wasmExports, computerPointer));
    };

    const dumpMemory = () => {
        if (!wasmRef.current || computerPointer === null) return;
        const wasmExports = wasmRef.current.exports as WasmExports;
        const memoryUint8Array = new Uint8Array(wasmExports.memory.buffer);
        setMemory(memoryUint8Array);
    };

    const dumpRam = () => {
        if (!wasmRef.current || computerPointer === null) return;
        const wasmExports = wasmRef.current.exports as WasmExports;
        const start = 0x0000;
        const end = MEMORY_MAP.RAM_END;
        const memoryUint8Array = new Uint8Array(1 + end - start);
        for (let address = start; address <= end; address++) {
            const value = wasmExports.computerGetMemory(computerPointer, address as u16);
            memoryUint8Array[address] = value;
        }
        setMemory(memoryUint8Array);
    };


    // ═══════════════════════════════════════════
    //  Editor: Compile & Load user code to RAM
    // ═══════════════════════════════════════════

    const handleCompileAndLoad = async () => {
        if (!wasmRef.current || computerPointer === null) return;

        setEditorError(null);
        setEditorStatus(null);

        const addr = parseInt(loadAddress);
        if (isNaN(addr) || addr < 0 || addr > 0xFFFF) {
            setEditorError('Invalid load address');
            return;
        }

        try {
            addLog(`Compiling user code... (target @ ${toHex(addr, 4)})`);

            const compiled = await compileCode(code, CUSTOM_CPU, { startAddress: addr });

            if (compiled.errors.length > 0) {
                const errMsg = compiled.errors.map(e => `Line ${e.line}: ${e.message}`).join('\n');
                setEditorError(errMsg);
                addLog('User Compilation failed');
                return;
            }

            const bytecode = getBytecodeArray(compiled);

            // Write each byte to emulator RAM at the correct address
            for (const [offset, value] of bytecode.entries()) {
                writeRam(addr + offset as u16, value as u8);
            }

            const msg = `Loaded ${bytecode.size} bytes @ ${toHex(addr, 4)}`;
            setEditorStatus(msg);
            addLog(msg);
            addLog(`Type "exec" in the shell to run your code (call ${toHex(addr, 4)})`);

        } catch (e: any) {
            setEditorError(e.message || 'Compilation error');
            addLog(`Error: ${e.message}`);
        }
    };

    const handleEditorUpdate = (value: string, editor: PrismEditor) => {
        setCode(value);
    };


    // ═══════════════════════════════════════════
    //  Render
    // ═══════════════════════════════════════════

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0f] text-zinc-200 overflow-hidden"
            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace" }}>

            {/* ── Header ── */}
            <header className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80 bg-[#0d0d14] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-sm font-semibold tracking-wider text-zinc-300 uppercase">
                        8-bit Playground
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 tracking-wider">v3</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                    Speed: {Math.round(10 * cyclesPerSecond) / 10}/sec.
                </div>
            </header>

            {/* ── Toolbar ── */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-zinc-800/60 bg-[#0b0b12] shrink-0 flex-wrap">
                {/* Emulator controls */}
                <button onClick={() => runCycle()}
                    className="px-3 py-1.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors cursor-pointer">
                    Run Cycle
                </button>
                <button onClick={() => startClock()}
                    className="px-3 py-1.5 text-xs rounded bg-emerald-700 hover:bg-emerald-600 text-white transition-colors cursor-pointer">
                    Start
                </button>
                <button onClick={() => stopClock()}
                    className="px-3 py-1.5 text-xs rounded bg-red-800/80 hover:bg-red-700 text-zinc-200 transition-colors cursor-pointer">
                    Stop
                </button>

                <div className="w-px h-5 bg-zinc-800 mx-1" />

                <button onClick={() => dumpMemory()}
                    className="px-3 py-1.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors cursor-pointer">
                    Dump Wasm Memory
                </button>
                <button onClick={() => dumpRam()}
                    className="px-3 py-1.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors cursor-pointer">
                    Dump RAM
                </button>
                <button onClick={() => dumpRegisters()}
                    className="px-3 py-1.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors cursor-pointer">
                    Dump Registers
                </button>
            </div>

            {/* ── Main Content ── */}
            <div className="flex-1 flex overflow-hidden">

                {/* ══════ Left: ASM Editor Panel ══════ */}
                <div className="w-[600px] flex flex-col border-r border-zinc-800/60 shrink-0">

                    {/* Editor Toolbar */}
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/50 bg-[#0c0c13] shrink-0">
                        <button onClick={handleCompileAndLoad}
                            className="px-3.5 py-1.5 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer">
                            Compile & Load
                        </button>
                        <div className="flex items-center gap-1.5">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider">@</label>
                            <input
                                value={loadAddress}
                                onChange={e => setLoadAddress(e.target.value)}
                                className="w-20 px-2 py-1 text-xs bg-zinc-900 border border-zinc-700/50 rounded text-zinc-300 focus:outline-none focus:border-indigo-500/60"
                            />
                        </div>
                    </div>

                    {/* Status / Error banners */}
                    {editorError && (
                        <div className="px-4 py-2 bg-red-950/60 border-b border-red-800/40 text-red-300 text-[11px] whitespace-pre-wrap">
                            {editorError}
                            <button onClick={() => setEditorError(null)} className="ml-3 text-red-500 hover:text-red-300 cursor-pointer">✕</button>
                        </div>
                    )}
                    {editorStatus && !editorError && (
                        <div className="px-4 py-1.5 bg-emerald-950/40 border-b border-emerald-800/30 text-emerald-300 text-[11px]">
                            {editorStatus}
                        </div>
                    )}

                    {/* Tabs: Editor / Log */}
                    <div className="flex border-b border-zinc-800/50 bg-[#0c0c13] shrink-0">
                        <button onClick={() => setActiveTab('editor')}
                            className={`px-4 py-1.5 text-[11px] tracking-wider uppercase transition-colors cursor-pointer ${
                                activeTab === 'editor' ? 'text-zinc-200 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-400'
                            }`}>
                            Editor
                        </button>
                        <button onClick={() => setActiveTab('log')}
                            className={`px-4 py-1.5 text-[11px] tracking-wider uppercase transition-colors cursor-pointer ${
                                activeTab === 'log' ? 'text-zinc-200 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-400'
                            }`}>
                            Log
                        </button>
                    </div>

                    {/* Editor / Log content */}
                    {activeTab === 'editor' ? (
                        <div className="flex-1 overflow-auto">
                            <Editor
                                className="h-full"
                                language="nasm"
                                value={code}
                                onUpdate={handleEditorUpdate}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-4 bg-[#08080d] text-[11px] leading-5">
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

                {/* ══════ Right: Emulator ══════ */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Right panel tabs */}
                    <div className="flex border-b border-zinc-800/50 bg-[#0c0c13] shrink-0">
                        <button onClick={() => setRightTab('devices')}
                            className={`px-4 py-2 text-[11px] tracking-wider uppercase transition-colors cursor-pointer ${
                                rightTab === 'devices' ? 'text-zinc-200 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-400'
                            }`}>
                            Devices
                        </button>
                        <button onClick={() => setRightTab('memory')}
                            className={`px-4 py-2 text-[11px] tracking-wider uppercase transition-colors cursor-pointer ${
                                rightTab === 'memory' ? 'text-zinc-200 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-400'
                            }`}>
                            Memory
                        </button>
                    </div>

                    {rightTab === 'devices' ? (
                        <div className="flex-1 overflow-y-auto p-4">
                            {/* ── Row 1: Console + Screen ── */}
                            <div className="flex gap-3 mb-3">
                                {/* Console */}
                                <div className="flex-1 border border-zinc-800/50 rounded-lg p-2 bg-[#0c0c14] min-w-0">
                                    <Console deviceInstance={consoleDevice} />
                                </div>

                                {/* Screen */}
                                <div className="border border-zinc-800/50 rounded-lg p-2 bg-[#0c0c14] shrink-0">
                                    <Screen deviceInstance={screenDevice} />
                                </div>
                            </div>

                            {/* ── Row 2: LEDs + Keyboard + CPU State ── */}
                            <div className="flex gap-3 mb-3 w-full">

                                <div className="flex-1 flex flex-col gap-3">
                                    {/* Keyboard */}
                                    <div className="flex-1 border border-zinc-800/50 rounded-lg p-2 bg-[#0c0c14] min-w-0 grow-0">
                                        <Keyboard deviceInstance={keyboardDevice} />
                                    </div>

                                    {/* LEDs */}
                                    <div className="border border-zinc-800/50 rounded-lg p-2 bg-[#0c0c14]">
                                        <Leds deviceInstance={ledsDevice} />
                                    </div>
                                </div>

                                {/* CPU State */}
                                <div className="flex-1 border border-zinc-800/50 rounded-lg p-2 bg-[#0c0c14]">
                                    <Registers registers8={registers8} registers16={registers16} />
                                </div>

                                {/* Disk ── */}
                                <div className="flex-1 border border-zinc-800/50 rounded-lg p-2 bg-[#0c0c14]">
                                    <Disk deviceInstance={diskDevice} />
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-4">
                            <MemoryExplorer
                                memory={memory}
                                offset={0x00}
                                bytesPerLine={16}
                                linesPerPage={16}
                                open={true}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// ─────────────────────────────────────────────
//  Registers sub-component (same as TestV3Component)
// ─────────────────────────────────────────────

type RegistersProps = {
    registers8: Record<string, u8>;
    registers16: Record<string, u8 | u16 | bigint>;
};

const Registers: React.FC<RegistersProps> = (props) => {
    const { registers8, registers16 } = props;

    return (
        <>
            <h2>CPU State</h2>

            <div className="flex flex-col gap-1">
                {Object.entries(registers16).map(([name, value]) => (
                    <div key={name}>
                        {name}: {toHex(Number(value))} ({Number(value)})
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-1">
                {Object.entries(registers8).map(([name, value]) => (
                    <div key={name}>
                        {name}: {toHex(value)} ({Number(value)})
                    </div>
                ))}
            </div>
        </>
    );
};
