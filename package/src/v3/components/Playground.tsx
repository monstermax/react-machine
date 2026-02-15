
import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Editor, type PrismEditor } from "prism-react-editor";
import { Link } from "wouter";

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

const defaultLoadAddress = '0xA000';

//  Default user code
const DEFAULT_CODE = `; == User Program (Loaded @ ${defaultLoadAddress}) ==
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

export const Playground: React.FC<{ autoStart?: boolean }> = (props) => {
    const { autoStart=false } = props;

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
    const editorRef = useRef<PrismEditor>(null);
    const [initialContent, setInitialContent] = useState(DEFAULT_CODE);
    const [editorContent, setEditorContent] = useState(initialContent);
    const [loadAddress, setLoadAddress] = useState(defaultLoadAddress);
    const [editorError, setEditorError] = useState<string | null>(null);
    const [editorStatus, setEditorStatus] = useState<string | null>(null);

    // ── Log ──
    const [activeTab, setActiveTab] = useState<'editor' | 'log'>('editor');
    const [rightTab, setRightTab] = useState<'devices' | 'memory' | 'sources' | 'docs'>('devices');
    const [logs, setLogs] = useState<string[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    const [clockStatus, setClockStatus] = useState(false);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);


    useEffect(() => {
        const setupKeydownEvent = (event: KeyboardEvent) => {
            if (event.key == "Tab") {
                event.preventDefault();
            }
        }

        const setupKeyupEvent = (event: KeyboardEvent) => {
            if (event.key == "Tab") {
                const active = event.target as HTMLElement

                if (active && active.matches(".pce-textarea")) {
                    event.preventDefault();

                    // todo: 
                    // - si selection : indenter la selection
                    // - si pas de selection : indenter la ligne courante

                    const selection = editorRef.current?.getSelection()
                    const activeLine = editorRef.current?.activeLine;
                    //console.log({ selection, activeLine })

                    if (selection) {
                        const parts = [
                            editorContent.slice(0, selection[0]),
                            editorContent.slice(selection[0], selection[1]).replace(/\n/g, '\n\t'),
                            editorContent.slice(selection[1]),
                        ];

                        //console.log({parts})
                        //setInitialContent(parts.join('')); // DO NOT WORK
                    }

                    return;
                }
            }
        }

        window.addEventListener("keyup", setupKeyupEvent)
        window.addEventListener("keydown", setupKeydownEvent)
    }, []);


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
        if (! autoStart || !computerPointer || !devicesLoaded || !bootloaderLoaded) return;
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
                        setClockStatus(false)
                        setCyclesPerSecond(0)
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


    const handleOpenFile = async () => {
        setIsFileModalOpen(true)
    }


    const openFile = async (filePath: string) => {
        const response = await fetch(`/asm/${filePath}`);
        const value = await response.text();
        setInitialContent(value)
    }


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
        setClockStatus(false)
        setCyclesPerSecond(0)
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

    const startClock = () => {
        clock.start();
        setClockStatus(true)
    }

    const stopClock = () => {
        clock.stop();
        setClockStatus(false)
        setCyclesPerSecond(0)
    }


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

        dumpRegisters()
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

            const compiled = await compileCode(editorContent, CUSTOM_CPU, { startAddress: addr });

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
            addLog(`Type "custom" in the shell to run your code (call ${toHex(addr, 4)})`);

        } catch (e: any) {
            setEditorError(e.message || 'Compilation error');
            addLog(`Error: ${e.message}`);
        }
    };

    const handleEditorUpdate = (value: string, editor: PrismEditor) => {
        setEditorContent(value);
    };


    // ═══════════════════════════════════════════
    //  Render
    // ═══════════════════════════════════════════

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0f] text-zinc-200 overflow-hidden"
            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace" }}>

            {/* ── Header ── */}
            <header className="flex items-center justify-between px-5 py-0 border-b border-zinc-800/80 bg-[#0d0d14] shrink-0">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex gap-2 items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        <span className="text-sm font-semibold tracking-wider text-zinc-300 uppercase">
                            8-bit Playground
                        </span>
                    </Link>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 tracking-wider">v3</span>
                </div>

                {/* ── Toolbar ── */}
                <div className="flex items-center gap-2 px-5 py-2 border-b border-zinc-800/60 bg-[#0b0b12] shrink-0 flex-wrap">
                    {/* Emulator controls */}
                    <button
                        disabled={clockStatus}
                        onClick={() => runCycle()}
                        className="px-3 py-1.5 text-xs rounded bg-blue-700 hover:bg-blue-600 disabled:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                    >
                        Step
                    </button>
                    <button
                        disabled={clockStatus}
                        onClick={() => startClock()}
                        className="px-3 py-1.5 text-xs rounded bg-emerald-700 hover:bg-emerald-600 disabled:bg-zinc-700 text-white transition-colors cursor-pointer"
                    >
                        Start
                    </button>
                    <button
                        disabled={!clockStatus}
                        onClick={() => stopClock()}
                        className="px-3 py-1.5 text-xs rounded bg-red-800/80 hover:bg-red-700 disabled:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                    >
                        Stop
                    </button>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-500 min-w-48 justify-end">
                    <div>Speed: </div>
                    {!clockStatus && (
                        <div>Stopped</div>
                    )}
                    {clockStatus && (
                        <div>{Math.round(10 * cyclesPerSecond) / 10}/sec.</div>
                    )}
                </div>
            </header>


            {/* ── Main Content ── */}
            <div className="flex-1 flex overflow-hidden">

                {/* ══════ Left: ASM Editor Panel ══════ */}
                <div className="w-[600px] flex flex-col border-r border-zinc-800/60 shrink-0">

                    {/* Editor Toolbar */}
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/50 bg-[#0c0c13] shrink-0">
                        <button
                            onClick={() => handleOpenFile()}
                            className="cursor-pointer px-3 bg-indigo-600 hover:bg-indigo-500 rounded"
                        >
                            Open File
                        </button>

                        <button onClick={handleCompileAndLoad}
                            className="ms-auto px-3.5 py-1.5 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer">
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
                            className={`px-4 py-1.5 text-[11px] tracking-wider uppercase transition-colors cursor-pointer ${activeTab === 'editor' ? 'text-zinc-200 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-400'
                                }`}>
                            Editor
                        </button>
                        <button onClick={() => setActiveTab('log')}
                            className={`px-4 py-1.5 text-[11px] tracking-wider uppercase transition-colors cursor-pointer ${activeTab === 'log' ? 'text-zinc-200 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-400'
                                }`}>
                            Log
                        </button>
                    </div>

                    {/* Editor / Log content */}
                    <div className={`flex-1 overflow-auto ${activeTab === 'editor' ? "" : "hidden"}`}>
                        <Editor
                            ref={editorRef}
                            className="h-full"
                            language="nasm"
                            value={initialContent}
                            onUpdate={handleEditorUpdate}
                            tabSize={4}
                            insertSpaces={true}
                        >
                        </Editor>
                    </div>

                    <div className={`flex-1 overflow-y-auto p-4 bg-[#08080d] text-[11px] leading-5 ${activeTab === 'log' ? "" : "hidden"}`}>
                        {logs.length === 0 ? (
                            <div className="text-zinc-600 italic">No logs yet.</div>
                        ) : (
                            logs.map((l, i) => (
                                <div key={i} className="text-zinc-400">{l}</div>
                            ))
                        )}
                        <div ref={logEndRef} />
                    </div>
                </div>

                {/* ══════ Right: Emulator ══════ */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Right panel tabs */}
                    <div className="flex border-b border-zinc-800/50 bg-[#0c0c13] shrink-0">
                        <button onClick={() => setRightTab('devices')}
                            className={`px-4 py-2 text-[11px] tracking-wider uppercase transition-colors cursor-pointer ${rightTab === 'devices' ? 'text-zinc-200 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-400'
                                }`}>
                            Devices
                        </button>

                        <button onClick={() => setRightTab('memory')}
                            className={`px-4 py-2 text-[11px] tracking-wider uppercase transition-colors cursor-pointer ${rightTab === 'memory' ? 'text-zinc-200 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-400'
                                }`}>
                            Memory
                        </button>

                        <button onClick={() => setRightTab('sources')}
                            className={`px-4 py-2 text-[11px] tracking-wider uppercase transition-colors cursor-pointer ${rightTab === 'sources' ? 'text-zinc-200 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-400'
                                }`}>
                            Sources
                        </button>

                        <button onClick={() => setRightTab('docs')}
                            className={`px-4 py-2 text-[11px] tracking-wider uppercase transition-colors cursor-pointer ${rightTab === 'docs' ? 'text-zinc-200 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-400'
                                }`}>
                            Docs
                        </button>


                        {/* ── Toolbar ── */}
                        <div className="ms-auto flex items-center gap-2 px-5 py-2 border-b border-zinc-800/60 bg-[#0b0b12] shrink-0 flex-wrap min-h-14">
                            {rightTab === 'memory' && (
                                <>
                                    <button onClick={() => dumpRam()}
                                        className="px-3 py-1.5 text-xs rounded bg-orange-700 hover:bg-orange-600 disabled:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer">
                                        Dump RAM
                                    </button>

                                    <button onClick={() => dumpMemory()}
                                        className="px-3 py-1.5 text-xs rounded bg-orange-700 hover:bg-orange-600 disabled:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer">
                                        Dump Wasm Memory
                                    </button>
                                </>
                            )}

                            {rightTab === 'devices' && (
                                <>
                                    <button onClick={() => dumpRegisters()}
                                        className="px-3 py-1 text-xs rounded bg-orange-700 hover:bg-orange-600 disabled:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer">
                                        Dump CPU State
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={`flex-1 overflow-y-auto p-4 ${rightTab === 'devices' ? "" : "hidden"}`}>
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
                            <div className="flex-1 ">
                                <div className="flex flex-col gap-3 grow-0 border border-zinc-800/50 rounded-lg p-2 bg-[#0c0c14]">
                                    <Registers registers8={registers8} registers16={registers16} />
                                </div>
                            </div>

                            {/* Disk ── */}
                            <div className="flex-1 border border-zinc-800/50 rounded-lg p-2 bg-[#0c0c14]">
                                <Disk deviceInstance={diskDevice} />
                            </div>
                        </div>
                    </div>

                    <div className={`flex-1 overflow-y-auto p-4 ${rightTab === 'memory' ? "" : "hidden"}`}>
                        <MemoryExplorer
                            memory={memory}
                            offset={0x00}
                            bytesPerLine={16}
                            linesPerPage={16}
                            open={true}
                        />
                    </div>

                    <div className={`flex-1 overflow-y-auto p-4 text-sm leading-relaxed text-zinc-300 ${rightTab === 'sources' ? "" : "hidden"}`}>
                        TODO: files explorer
                    </div>

                    <div className={`flex-1 overflow-y-auto p-4 text-sm leading-relaxed text-zinc-300 ${rightTab === 'docs' ? "" : "hidden"}`}>

                        {/* ── Intro ── */}
                        <h2 className="text-lg font-semibold text-zinc-100 mb-3 mt-0">Introduction</h2>
                        <p className="mb-4">
                            This playground runs a custom 8-bit computer emulated in WebAssembly.
                            It boots a bootloader from ROM, which loads a mini OS from disk into RAM.
                            The OS provides a shell where you can run built-in commands or execute your own assembly code.
                        </p>

                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-5">CPU</h3>
                        <p className="mb-3">
                            The CPU is an 8-bit processor with a 16-bit address bus (64KB addressable memory).
                            It runs one instruction per cycle, with a configurable clock speed.
                        </p>

                        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 mt-3">Registers</h4>
                        <p className="mb-2">6 general-purpose 8-bit data registers and 3 control registers:</p>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs mb-3 pl-2">
                            <code className="text-amber-400">A, B, C, D, E, F</code> <span className="text-zinc-400">General-purpose 8-bit registers</span>
                            <code className="text-amber-400">PC</code> <span className="text-zinc-400">Program Counter (16-bit) — current instruction address</span>
                            <code className="text-amber-400">SP</code> <span className="text-zinc-400">Stack Pointer (16-bit) — top of stack</span>
                            <code className="text-amber-400">IR</code> <span className="text-zinc-400">Instruction Register (8-bit) — current opcode</span>
                        </div>
                        <p className="mb-3 text-zinc-400 text-xs">
                            Registers C:D are often used together as a 16-bit address pair (low:high).
                        </p>

                        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 mt-3">Key Instructions</h4>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs mb-3 pl-2">
                            <code className="text-amber-400">mov</code>   <span className="text-zinc-400">Move data between registers, memory, and immediates</span>
                            <code className="text-amber-400">lea</code>   <span className="text-zinc-400">Load effective address into a register pair (C:D)</span>
                            <code className="text-amber-400">ldi</code>   <span className="text-zinc-400">Load indirect — read byte at address in C:D</span>
                            <code className="text-amber-400">sti</code>   <span className="text-zinc-400">Store indirect — write byte to address in C:D</span>
                            <code className="text-amber-400">push / pop</code> <span className="text-zinc-400">Stack operations</span>
                            <code className="text-amber-400">call / ret</code> <span className="text-zinc-400">Subroutine call and return</span>
                            <code className="text-amber-400">jmp / je / jne / jl / jg</code> <span className="text-zinc-400">Unconditional and conditional jumps</span>
                            <code className="text-amber-400">cmp</code>   <span className="text-zinc-400">Compare two values (sets flags for conditional jumps)</span>
                            <code className="text-amber-400">add / sub / inc / dec</code> <span className="text-zinc-400">Arithmetic operations</span>
                            <code className="text-amber-400">and / or / xor / shl / shr</code> <span className="text-zinc-400">Bitwise operations</span>
                            <code className="text-amber-400">hlt</code>   <span className="text-zinc-400">Halt the CPU</span>
                        </div>

                        {/* ── Memory ── */}
                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-5">Memory Map</h3>

                        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 mt-3">ROM</h4>
                        <p className="mb-2">
                            The bootloader resides in ROM starting at <code className="text-amber-400">0x0000</code>.
                            It initializes devices, copies the OS from disk to RAM, then jumps to the OS entry point.
                        </p>

                        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 mt-3">RAM</h4>
                        <p className="mb-2">
                            The OS, stack, and user programs all live in RAM. User code is loaded at the address
                            specified in the editor toolbar (default <code className="text-amber-400">{loadAddress}</code>).
                        </p>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs mb-3 pl-2">
                            <code className="text-amber-400">{toHex(MEMORY_MAP.ROM_START, 4)}-{toHex(MEMORY_MAP.ROM_END, 4)}</code>
                            <span className="text-zinc-400">ROM</span>

                            <code className="text-amber-400">{toHex(MEMORY_MAP.RAM_START, 4)}-{toHex(MEMORY_MAP.RAM_END, 4)}</code>
                            <span className="text-zinc-400">RAM</span>

                            <code className="text-amber-400">{toHex(MEMORY_MAP.IO_START, 4)}-{toHex(MEMORY_MAP.IO_END, 4)}</code>
                            <span className="text-zinc-400">I/O mapped devices</span>
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs mb-3 pl-2">
                            <code className="text-amber-400">{toHex(MEMORY_MAP.ROM_START, 4)}+</code>  
                            <span className="text-zinc-400">ROM — Bootloader</span>

                            <code className="text-amber-400">{toHex(MEMORY_MAP.OS_START, 4)}+</code> 
                            <span className="text-zinc-400">RAM — OS code and data</span>

                            <code className="text-amber-400">{loadAddress}+</code>
                            <span className="text-zinc-400">RAM — User program (default load address)</span>

                            <code className="text-amber-400">{toHex(MEMORY_MAP.STACK_END, 4)}</code>  
                            <span className="text-zinc-400">RAM — Stack top (grows downward to {toHex(MEMORY_MAP.STACK_START, 4)})</span>
                        </div>

                        {/* ── Devices ── */}
                        <h2 className="text-lg font-semibold text-zinc-100 mb-3 mt-8 pt-4 border-t border-zinc-800/50">Devices</h2>
                        <p className="mb-4">
                            All devices are memory-mapped starting at <code className="text-amber-400">{toHex(MEMORY_MAP.IO_START, 4)}</code>.
                            Write to device ports with <code className="text-amber-400">sti cl, dl, value</code> and
                            read with <code className="text-amber-400">ldi al, cl, dl</code> where C:D holds the port address.
                        </p>

                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-4">Console</h3>
                        <p className="mb-2">Text output device. Write ASCII characters one at a time.</p>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs mb-3 pl-2">
                            <code className="text-amber-400">port 0</code> <span className="text-zinc-400">Write a character (ASCII byte). Use 0x0D for newline.</span>
                            <code className="text-amber-400">port 1</code> <span className="text-zinc-400">Write any value to clear the console</span>
                        </div>

                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-4">Keyboard</h3>
                        <p className="mb-2">
                            Input device. Click the Keyboard widget in the Devices tab to give it focus, then type.
                            Characters are queued and consumed one at a time by the CPU.
                        </p>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs mb-3 pl-2">
                            <code className="text-amber-400">port 0</code> <span className="text-zinc-400">Read: last character pressed. Write 0: clear character.</span>
                            <code className="text-amber-400">port 1</code> <span className="text-zinc-400">Read: status (bit 0 = char available). Write 0: acknowledge.</span>
                        </div>

                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-4">Screen</h3>
                        <p className="mb-2">
                            32×32 pixel display. Pixel color is a hue value (0–255) mapped to HSL at 100% saturation/50% lightness.
                            Set X, then Y, then write color to draw a pixel.
                        </p>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs mb-3 pl-2">
                            <code className="text-amber-400">port 0</code> <span className="text-zinc-400">Set pixel X coordinate (0–31)</span>
                            <code className="text-amber-400">port 1</code> <span className="text-zinc-400">Set pixel Y coordinate (0–31)</span>
                            <code className="text-amber-400">port 2</code> <span className="text-zinc-400">Write pixel color (0–255 hue value)</span>
                        </div>

                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-4">LEDs</h3>
                        <p className="mb-2">8 individually controllable LEDs. Each bit of the port byte controls one LED.</p>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs mb-3 pl-2">
                            <code className="text-amber-400">port 0</code> <span className="text-zinc-400">Read/write LED state (8 bits = 8 LEDs, bit 0 = LED 0)</span>
                        </div>

                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-4">Disk</h3>
                        <p className="mb-3">
                            Sequential storage device with a 16-bit address cursor. Used by the bootloader to
                            load the OS. Supports byte-level read/write with auto-incrementing address.
                        </p>

                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-4">Custom IO Devices</h3>
                        <p className="mb-3">
                            Create your own IO devices to interract between the emulated computer and the real world.
                        </p>

                        {/* ── Assembly ── */}
                        <h2 className="text-lg font-semibold text-zinc-100 mb-3 mt-8 pt-4 border-t border-zinc-800/50">Writing Assembly</h2>

                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-4">Boot Sequence</h3>
                        <p className="mb-3">
                            On startup the bootloader (ROM) initializes all devices, reads the OS binary from disk,
                            copies it into RAM, and jumps to the OS entry point.
                            The OS launches the shell which waits for user input.
                        </p>

                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-4">Shell Commands</h3>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs mb-3 pl-2">
                            <code className="text-amber-400">help</code>    <span className="text-zinc-400">Show help information</span>
                            <code className="text-amber-400">custom</code>  <span className="text-zinc-400">Execute user code loaded in RAM</span>
                            <code className="text-amber-400">pixels</code>  <span className="text-zinc-400">Run a graphics demo on screen</span>
                            <code className="text-amber-400">sprite</code>  <span className="text-zinc-400">Draw a sprite on screen</span>
                            <code className="text-amber-400">leds</code>    <span className="text-zinc-400">Toggle LEDs on/off</span>
                            <code className="text-amber-400">clear</code>   <span className="text-zinc-400">Clear the console</span>
                            <code className="text-amber-400">ls</code>      <span className="text-zinc-400">List files</span>
                            <code className="text-amber-400">halt</code>    <span className="text-zinc-400">Halt the CPU</span>
                        </div>

                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-4">Writing Custom Programs</h3>
                        <p className="mb-2">
                            Write assembly in the left-side editor, click <strong className="text-zinc-100">Compile & Load</strong> to
                            inject it into RAM at the specified address, then type <code className="text-amber-400">custom</code> in the shell to execute it.
                        </p>
                        <p className="mb-2 text-xs text-zinc-400">Important rules:</p>
                        <ul className="list-disc list-inside mb-3 text-zinc-400 text-xs space-y-1 pl-2">
                            <li>Always end with <code className="text-amber-400">ret</code> — your code runs as a subroutine called by the shell</li>
                            <li>Balance the stack — every <code className="text-amber-400">push</code> needs a matching <code className="text-amber-400">pop</code></li>
                            <li>All registers are free to use — the shell does not rely on preserved values</li>
                            <li>Access devices via <code className="text-amber-400">sti</code> / <code className="text-amber-400">ldi</code> using their I/O base address</li>
                        </ul>

                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-4">Example: Draw a Pixel</h3>
                        <pre className="bg-[#0a0a14] border border-zinc-800/50 rounded p-3 text-xs text-emerald-300/80 mb-4 overflow-x-auto">{
                            `; Draw a red pixel at (10, 5)
mov cl, [screen_io_base]
mov dl, [screen_io_base + 1]
sti cl, dl, 10       ; X = 10
call inc_cd
sti cl, dl, 5        ; Y = 5
call inc_cd
sti cl, dl, 0x01     ; color = red (hue)
ret`
                        }</pre>

                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-4">Example: Print to Console</h3>
                        <pre className="bg-[#0a0a14] border border-zinc-800/50 rounded p-3 text-xs text-emerald-300/80 mb-6 overflow-x-auto">{
                            `; Print "Hi" followed by a newline
mov cl, [console_io_base]
mov dl, [console_io_base + 1]
sti cl, dl, 'H'
sti cl, dl, 'i'
sti cl, dl, 13       ; CR = newline
ret`
                        }</pre>

                    </div> {/* .docs */}

                </div>
            </div>


            <FileModal
                isOpen={isFileModalOpen}
                onClose={() => setIsFileModalOpen(false)}
                onSelectFile={openFile}
            />
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

            <div className="grid grid-cols-2">
                {Object.entries(registers8).map(([name, value]) => (
                    <div key={name}>
                        {name}: {toHex(value)} ({Number(value)})
                    </div>
                ))}
            </div>
        </>
    );
};



interface FileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectFile: (filePath: string) => void;
}

interface FileIndex {
    generated: string;
    count: number;
    files: string[];
}


export const FileModal: React.FC<FileModalProps> = ({
    isOpen,
    onClose,
    onSelectFile
}) => {
    const [files, setFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadFileList();
            setSearch('');
        }
    }, [isOpen]);

    const loadFileList = async () => {
        setLoading(true);
        try {
            const response = await fetch('/asm-files.json');
            const fileIndex: FileIndex = await response.json();
            setFiles(fileIndex.files);
        } catch (error) {
            console.error('Failed to load file list:', error);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleFileClick = (filePath: string) => {
        onSelectFile(filePath);
        onClose();
    };

    const filtered = search
        ? files.filter(f => f.toLowerCase().includes(search.toLowerCase()))
        : files;

    // Group files by directory
    const grouped = filtered.reduce<Record<string, string[]>>((acc, file) => {
        const parts = file.split('/');
        const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.';
        if (!acc[dir]) acc[dir] = [];
        acc[dir].push(file);
        return acc;
    }, {});

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-[#111119] border border-zinc-700/50 rounded-xl w-[480px] max-h-[70vh] overflow-hidden flex flex-col shadow-2xl shadow-black/50"
                onClick={e => e.stopPropagation()}
                style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace" }}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-zinc-800/60">
                    <div className="flex items-center gap-2.5">
                        <span className="text-indigo-400 text-sm">&#9776;</span>
                        <h2 className="text-sm font-semibold text-zinc-200 tracking-wide">Open File</h2>
                        {!loading && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                                {filtered.length} file{filtered.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors text-lg leading-none px-1 cursor-pointer"
                    >
                        &#x2715;
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-zinc-800/40">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search files..."
                        autoFocus
                        className="w-full px-3 py-2 text-xs bg-[#0a0a10] border border-zinc-700/40 rounded-lg text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                </div>

                {/* File list */}
                <div className="flex-1 overflow-y-auto px-2 py-2 min-h-0">
                    {loading ? (
                        <div className="text-center py-8 text-zinc-500 text-xs">Loading files...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 text-xs">
                            {search ? 'No matching files' : 'No files found'}
                        </div>
                    ) : (
                        Object.entries(grouped).map(([dir, dirFiles]) => (
                            <div key={dir} className="mb-2">
                                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                                    {dir}
                                </div>
                                {dirFiles.map((file, index) => {
                                    const fileName = file.split('/').pop() || file;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleFileClick(file)}
                                            className="w-full text-left px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors text-zinc-300 hover:bg-indigo-500/10 hover:text-indigo-300 flex items-center gap-2 group"
                                        >
                                            <span className="text-zinc-600 group-hover:text-indigo-400/60 text-[10px] shrink-0">
                                                &#x25B8;
                                            </span>
                                            <span className="truncate">{fileName}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end px-4 py-3 border-t border-zinc-800/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};



