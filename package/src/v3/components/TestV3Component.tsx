
import React, { useCallback, useEffect, useRef, useState } from "react";

import { IoDevice } from "./devices/IoDevice";
import { Keyboard, KeyboardDevice } from "./devices/keyboard";
import { Console, ConsoleDevice } from "./devices/console";
import { Clock } from "./devices/clock";
import { Opcode } from "../assembly/core/cpu_instructions";
import { Screen, ScreenDevice } from "./devices/screen";
import { compileCode, getBytecodeArray, loadSourceCodeFromFile, universalCompiler } from "@/v2/lib/compilation";
import { CUSTOM_CPU } from "../compiler/arch_custom";
import { Leds, LedsDevice } from "./devices/leds";
import WasmMemoryViewer from "./WasmMemoryViewer";
import { Disk, DiskDevice } from "./devices/disk";
import { toHex } from "@/v2/lib/integers";
import { DmaDevice } from "./devices/dma";

import type { u16, u8, u32 } from "@/types/cpu.types";
import { MEMORY_MAP } from "../assembly/memory_map";


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


export const TestV3Component: React.FC = () => {
    const wasmRef = useRef<WebAssembly.Instance | null>(null);
    const [computerPointer, setComputerPointer] = useState<number | null>(null);

    // clock
    const clockFrequency = 200 as u32;
    const speedFactor = 5 as u32;
    const [clock] = useState(() => new Clock(clockFrequency))
    const [cyclesPerSecond, setCyclesPerSecond] = useState(0);
    const [registers, setRegisters] = useState<Record<string, u8>>({});
    const [memory, setMemory] = useState<Uint8Array<ArrayBuffer> | null>(null)

    // devices
    const devicesRef = useRef<Map<number, IoDevice>>(new Map);
    const [keyboardDevice, setKeyboardDevice] = useState<KeyboardDevice | null>(null)
    const [consoleDevice, setConsoleDevice] = useState<ConsoleDevice | null>(null)
    const [screenDevice, setScreenDevice] = useState<ScreenDevice | null>(null)
    const [ledsDevice, setLedsDevice] = useState<LedsDevice | null>(null)
    const [diskDevice, setDiskDevice] = useState<DiskDevice | null>(null)
    const [dmaDevice, setDmaDevice] = useState<DmaDevice | null>(null)


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
                        throw new Error("[WASM ABORT]");
                    },
                    'console.log': (ptr: number) => {
                        const message = readWasmStringUtf16(ptr);
                        let styles: string[] = [];

                        if (message.startsWith('Executing instruction')) {
                            styles.push('color:cyan');
                        }

                        if (message.startsWith('Reading Memory')) {
                            styles.push('color:green');
                        }

                        if (message.startsWith('Writing Memory')) {
                            styles.push('color:yellow');
                        }

                        if (message.startsWith('DEBUG')) {
                            styles.push('color:orange');
                        }

                        let messages = styles.length
                            ? ["%c[WASM LOG]", styles.join(';'), message]
                            : ["[WASM LOG]", message]

                        console.log(...messages);
                    },
                    'console.warn': (ptr: number) => {
                        const message = readWasmStringUtf16(ptr);
                        console.warn("[WASM WARN]", message);
                    },
                    jsIoRead,
                    jsIoWrite,
                },
            };

            const importUrl = await import(`../build/release.wasm?url`);
            const url = importUrl.default;

            const response = fetch(url);
            const _wasm = await WebAssembly.instantiateStreaming(response, imports)
            wasmRef.current = _wasm.instance;

            window.wasm = _wasm.instance;

            const wasmExports = _wasm.instance.exports as WasmExports;

            const _computerPointer = wasmExports.instanciateComputer()
            setComputerPointer(_computerPointer);

            console.log('memory:', wasmExports.memory)
        }

        const timer = setTimeout(_initWasm, 100);
        return () => clearTimeout(timer);

    }, [])


    // load rom code
    useEffect(() => {
        if (!computerPointer) return;

        const timer = setTimeout(loadCode, 100);
        return () => clearTimeout(timer);

    }, [computerPointer])


    // load devices
    useEffect(() => {
        if (!computerPointer) return;

        const _loadDevices = () => {
            addDevice('keyboard', 'input', '', '')
            addDevice('console', 'output', '', '')
            addDevice('leds', 'output', '', '')
            addDevice('screen', 'output', '', '')
            addDevice('os_disk', 'storage', '', '')
            addDevice('dma', 'system', '', '')
        }

        const timer = setTimeout(_loadDevices, 100);
        return () => clearTimeout(timer);

    }, [computerPointer])


    // init clock (tick handler + speed monitor)
    useEffect(() => {
        if (!computerPointer) return;

        const _initClock = () => {
            let lastCycles = 0n;
            let lastCyclesDate = Date.now();

            clock.on('tick', () => {
                //console.log('found tick');

                if (wasmRef.current && computerPointer) {
                    const wasmExports = wasmRef.current.exports as WasmExports;

                    // Run cycle
                    wasmExports.computerRunCycles(computerPointer, speedFactor);

                    // Compute speed
                    const newCycles = wasmExports.computerGetCycles(computerPointer);
                    const diff = newCycles - lastCycles;
                    const duration = Date.now() - lastCyclesDate;
                    const _cyclesPerSecond = 1000 * Number(diff) / duration;
                    setCyclesPerSecond(_cyclesPerSecond)

                    lastCycles = newCycles;
                    lastCyclesDate = Date.now();
                }
            })
        }

        const timer = setTimeout(_initClock, 100);
        return () => clearTimeout(timer);
    }, [computerPointer])


    const jsIoRead = (deviceIdx: u8, port: u8): u8 => {
        if (!devicesRef.current) throw new Error("missing devices ref");

        const device = devicesRef.current.get(deviceIdx);

        if (!device) {
            throw new Error(`device #${deviceIdx} not found`);
        }

        const value = device.read(port);

        //console.log('jsIoRead:', deviceIdx, port, value)
        return value
    }

    const jsIoWrite = (deviceIdx: u8, port: u8, value: u8): void => {
        if (!devicesRef.current) throw new Error("missing devices ref");

        const device = devicesRef.current.get(deviceIdx);

        if (!device) {
            throw new Error(`device #${deviceIdx} not found`);
        }

        device.write(port, value);

        //console.log('jsIoWrite:', deviceIdx, port, value)
    }


    const readWasmStringUtf8 = (ptr: number) => {
        if (!wasmRef.current) throw new Error("wasm not found in readString");

        const wasmExports = wasmRef.current.exports as WasmExports;
        const memory = wasmExports.memory as WebAssembly.Memory;

        let buffer = new Uint16Array(memory.buffer, ptr, memory.buffer.byteLength - ptr);
        let term = buffer.indexOf(0);

        return new TextDecoder('utf-8').decode(buffer.subarray(0, term));
    }

    const readWasmStringUtf16 = (ptr: number) => {
        if (!wasmRef.current) throw new Error("wasm not found in readString");

        const wasmExports = wasmRef.current.exports as WasmExports;
        const memory = wasmExports.memory as WebAssembly.Memory;

        const uint16 = new Uint16Array(memory.buffer, ptr);
        let len = 0;
        while (uint16[len] !== 0) len++;

        const bytes = new Uint8Array(memory.buffer, ptr, len * 2);
        const result = new TextDecoder('utf-16le').decode(bytes);
        return result;
    }


    const loadCode = async () => {
        if (!wasmRef.current || !computerPointer || !devicesRef.current) return;

        const wasmExports = wasmRef.current.exports as WasmExports;

        const codeDemo = [
            [0x0000, Opcode.MOV_REG_MEM as u8], // read keyboard status
            [0x0001, 0x01], // register A
            [0x0002, 0x01], // 0xF001 low byte
            [0x0003, 0xF0], // 0xF001 high byte

            [0x0004, Opcode.CMP_REG_IMM as u8], // compare keyboard status
            [0x0005, 0x01], // register A
            [0x0006, 0x00], // IMM 0

            [0x0007, Opcode.JE as u8],
            [0x0008, 0x00], // 0x0000 low byte
            [0x0009, 0x00], // 0x0000 high byte

            [0x000A, Opcode.MOV_REG_MEM as u8], // read keyboard
            [0x000B, 0x01], // register A
            [0x000C, 0x00], // 0xF000 low byte
            [0x000D, 0xF0], // 0xF000 high byte

            [0x000E, Opcode.MOV_MEM_REG as u8], // write console
            [0x000F, 0x10], // 0xF010 low byte
            [0x0010, 0xF0], // 0xF010 high byte
            [0x0011, 0x01], // register A

            [0x0012, Opcode.MOV_REG_IMM as u8], // ack keyboard status
            [0x0013, 0x01], // register A
            [0x0014, 0x01], // IMM 1 => keyboard ack

            [0x0015, Opcode.MOV_MEM_REG as u8], // write keyboard (ack)
            [0x0016, 0x00], // 0xF000 low byte
            [0x0017, 0xF0], // 0xF000 high byte
            [0x0018, 0x01], // register A

            [0x0019, Opcode.JMP as u8], // loop to begin
            [0x001A, 0x00], // 0x0000 low byte
            [0x001B, 0x00], // 0x0000 high byte
        ];

        //const code = codeDemo // OK
        const sourceCode = await loadSourceCodeFromFile("bootloader/bootloader_v2.asm")
        const compiled = await compileCode(sourceCode, CUSTOM_CPU);
        const codeRaw = Array.from(getBytecodeArray(compiled).entries())
        //console.log('codeRaw:', codeRaw)

        const code = codeRaw
        //.slice(0, 20) // DEBUG
        //.slice(0, 684) // DEBUG
        //console.log('code:', code)

        //const addresses = new Uint16Array(code.map(r => r[0]));
        const values = new Uint8Array(code.map(r => r[1]));

        //const addrPtr = wasmExports.allocate(addresses.length);
        const valPtr = wasmExports.allocate(values.length);

        //new Uint8Array(wasmExports.memory.buffer).set(addresses, addrPtr);
        new Uint8Array(wasmExports.memory.buffer).set(values, valPtr);

        //console.log('memory:', wasmExports.memory)

        wasmExports.computerloadCode(computerPointer, valPtr, values.length);
    }


    const addDevice = async (name: string, type: string, vendor = '', model = '') => {
        if (!wasmRef.current || !computerPointer || !devicesRef.current) return;

        const wasmExports = wasmRef.current.exports as WasmExports;

        let typeId = 1 as u8;
        const nameBuffer = new TextEncoder().encode(name);
        const namePtr = wasmExports.allocate(nameBuffer.length);

        const memoryUint8 = new Uint8Array(wasmExports.memory.buffer);
        memoryUint8.set(nameBuffer, namePtr);

        const deviceIdx = wasmExports.computerAddDevice(computerPointer, namePtr, nameBuffer.length, typeId)

        //console.log(`Device #${deviceIdx} added`);

        if (name === 'keyboard') {
            const device = new KeyboardDevice(deviceIdx, 'keyboard', { type: 'input', vendor, model });
            devicesRef.current.set(deviceIdx, device)
            setKeyboardDevice(device)

        } else if (name === 'console') {
            const device = new ConsoleDevice(deviceIdx, 'console', { type: 'output', vendor, model });
            devicesRef.current.set(deviceIdx, device)
            setConsoleDevice(device)

        } else if (name === 'screen') {
            const device = new ScreenDevice(deviceIdx, 'screen', { type: 'output', vendor, model });
            devicesRef.current.set(deviceIdx, device)
            setScreenDevice(device)

        } else if (name === 'leds') {
            const device = new LedsDevice(deviceIdx, 'leds', { type: 'output', vendor, model });
            devicesRef.current.set(deviceIdx, device)
            setLedsDevice(device)

        } else if (name === 'dma') {
            const device = new DmaDevice(deviceIdx, 'dma', { type: 'system', vendor, model, devicesRef, writeRam });
            devicesRef.current.set(deviceIdx, device)
            setDmaDevice(device)

        } else if (name === 'os_disk') {
            const arch = CUSTOM_CPU;
            const startAddress = MEMORY_MAP.OS_START;
            const sourceCode = await loadSourceCodeFromFile('os/os_v3.asm')
            const compiled = await compileCode(sourceCode, CUSTOM_CPU, { startAddress });
            const codeRaw = Array.from(getBytecodeArray(compiled).entries())

            const data = codeRaw ?? [];

            //const data = [
            //    [0, 100],
            //    [1, 101],
            //    [2, 102],
            //    [3, 103],
            //    [4, 104],
            //] as [u16, u8][]; // example disk content


            const device = new DiskDevice(deviceIdx, 'os_disk', { type: 'storage', vendor, model, data });
            devicesRef.current.set(deviceIdx, device)
            setDiskDevice(device)

        } else {
            const device = new IoDevice(deviceIdx, name, { type });
            devicesRef.current.set(deviceIdx, device)
        }

    }


    const writeRam = (address: u16, value: u8) => {
        if (!wasmRef.current || computerPointer === null) return;
        const wasmExports = wasmRef.current.exports as WasmExports;

        wasmExports.computerSetMemory(computerPointer, address, value);
    }


    const startClock = () => {
        clock.start()
    }


    const stopClock = () => {
        clock.stop()
    }


    const runCycle = () => {
        if (!wasmRef.current || computerPointer === null) return;
        const wasmExports = wasmRef.current.exports as WasmExports;

        // Debug state (before cycle)
        const controlBefore = readControlRegisters(wasmExports, computerPointer);
        const dataBefore = readDataRegisters(wasmExports, computerPointer);
        console.log('BEFORE', controlBefore, dataBefore);

        // Run cycle
        wasmExports.computerRunCycles(computerPointer, 1);

        // Debug state (after cycle)
        const controlAfter = readControlRegisters(wasmExports, computerPointer);
        const dataAfter = readDataRegisters(wasmExports, computerPointer);
        console.log('AFTER', controlAfter, dataAfter);
    }


    const readControlRegisters = (wasmExports: WasmExports, computerPointer: number) => {
        const cycles = wasmExports.computerGetCycles(computerPointer);
        const PC = wasmExports.computerGetRegisterPC(computerPointer);
        const SP = wasmExports.computerGetRegisterSP(computerPointer);
        const IR = wasmExports.computerGetRegisterIR(computerPointer);

        return { cycles, PC, SP, IR }
    }


    const readDataRegisters = (wasmExports: WasmExports, computerPointer: number) => {
        const A = wasmExports.computerGetRegisterA(computerPointer);
        const B = wasmExports.computerGetRegisterB(computerPointer);
        const C = wasmExports.computerGetRegisterC(computerPointer);
        const D = wasmExports.computerGetRegisterD(computerPointer);
        const E = wasmExports.computerGetRegisterE(computerPointer);
        const F = wasmExports.computerGetRegisterF(computerPointer);

        return { A, B, C, D, E, F }
    }


    const dumpRegisters = async () => {
        if (!wasmRef.current || computerPointer === null) return;
        const wasmExports = wasmRef.current.exports as WasmExports;

        const _registers = readDataRegisters(wasmExports, computerPointer);
        setRegisters(_registers)
    }


    const dumpMemory = () => {
        if (!wasmRef.current || computerPointer === null) return;
        const wasmExports = wasmRef.current.exports as WasmExports;

        const memoryUint8Array = new Uint8Array(wasmExports.memory.buffer);
        setMemory(memoryUint8Array);
    }


    const dumpRam = () => {
        if (!wasmRef.current || computerPointer === null) return;
        const wasmExports = wasmRef.current.exports as WasmExports;

        const start = 0x0000;
        const end = MEMORY_MAP.RAM_END;

        //const values = new Map<u16, u8>()

        const memoryUint8Array = new Uint8Array(1 + end - start);

        for (let address=start; address<=end; address++) {
            const value = wasmExports.computerGetMemory(computerPointer, address as u16)
            //values.set(address as u16, value);
            memoryUint8Array[address] = value;
        }

        setMemory(memoryUint8Array);
        //console.log('RAM:', values)
    }


    return (
        <div className="p-1 text-foreground">
            <h1>V3</h1>

            <hr />

            <div className="flex gap-4 m-2">
                <button className="p-2 border rounded cursor-pointer" onClick={() => runCycle()}>runCycle</button>
                <button className="p-2 border rounded cursor-pointer" onClick={() => startClock()}>start</button>
                <button className="p-2 border rounded cursor-pointer" onClick={() => stopClock()}>stop</button>
                <button className="p-2 border rounded cursor-pointer" onClick={() => dumpRegisters()}>dump Registers</button>
                <button className="p-2 border rounded cursor-pointer" onClick={() => dumpMemory()}>dump Wasm Memory</button>
                <button className="p-2 border rounded cursor-pointer" onClick={() => dumpRam()}>dump RAM</button>
            </div>

            <hr />

            <div>Speed: {Math.round(10 * cyclesPerSecond) / 10}/sec.</div>

            <div className="flex flex-col gap-8">
                <div className="flex gap-8 mt-4">
                    <div className="border p-2 rounded">
                        {/* Console */}
                        <Console deviceInstance={consoleDevice} />
                    </div>

                    <div className="border p-2 rounded">
                        <Screen deviceInstance={screenDevice} />
                    </div>

                    <div className="border p-2 rounded flex flex-col gap-8">
                        <div className="border p-2 rounded">
                            <Leds deviceInstance={ledsDevice} />
                        </div>

                        <div className="border p-2 rounded">
                            <Keyboard deviceInstance={keyboardDevice} />
                        </div>
                    </div>

                    <div className="border p-2 rounded">
                        {Object.entries(registers).map(([name, value]) => (
                            <div key={name}>
                                {name}: {toHex(value)}
                            </div>
                        ))}
                    </div>

                    <div className="border p-2 rounded">
                        <Disk deviceInstance={diskDevice} />
                    </div>
                </div>

                <div>
                    <WasmMemoryViewer
                        memory={memory}
                        offset={0x00}
                        bytesPerLine={16}
                        linesPerPage={16}
                    />
                </div>
            </div>
        </div>
    );
}


