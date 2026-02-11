
import React, { useCallback, useEffect, useRef, useState } from "react";

import { IoDevice } from "./devices/IoDevice";
import { Keyboard, KeyboardDevice } from "./devices/keyboard";
import { Console, ConsoleDevice } from "./devices/console";
import { Clock } from "./devices/clock";

import type { u16, u8, u32 } from "@/types/cpu.types";
import { Opcode } from "../assembly/core/cpu_instructions";
import { Screen, ScreenDevice } from "./devices/screen";
import { compileCode, getBytecodeArray, loadSourceCodeFromFile } from "@/v2/lib/compilation";
import { CUSTOM_CPU } from "../compiler/arch_custom";


interface WasmExports extends WebAssembly.Exports {
    memory: WebAssembly.Memory;
    instanciateComputer(): number;
    computerRunCycles(computerPtr: number, cycles: number): void;
    computerGetCycles(computerPtr: number): bigint;
    computerGetRegisterPC(computerPtr: number): u16;
    computerGetRegisterIR(computerPtr: number): u8;
    computerGetRegisterA(computerPtr: number): u8;
    computerGetRegisterB(computerPtr: number): u8;
    computerGetRegisterC(computerPtr: number): u8;
    computerGetRegisterD(computerPtr: number): u8;
    computerGetMemory(computerPtr: number, address: u16): u8;
    computerAddDevice(computerPtr: number, name: string, type: string, vendor?: string, model?: string): u8;
    computerloadCode(computerPtr: number, addrPtr: number, addrLen: number, valPtr: number, valLen: number): void;
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

    // devices
    const devicesRef = useRef<Map<number, IoDevice>>(new Map);
    const [keyboardDevice, setKeyboardDevice] = useState<KeyboardDevice | null>(null)
    const [consoleDevice, setConsoleDevice] = useState<ConsoleDevice | null>(null)
    const [screenDevice, setScreenDevice] = useState<ScreenDevice | null>(null)


    useEffect(() => {
        const _initWasm = async () => {
            if (wasmRef.current) return;

            const imports = {
                env: {
                    memory: new WebAssembly.Memory({ initial: 256 }),
                    abort: (ptr: number) => {
                        clock.stop();
                        throw new Error("[WASM ABORT] " + readString(ptr));
                    },
                    'console.log': (ptr: number) => {
                        console.log("[WASM LOG]", readString(ptr));
                    },
                    'console.warn': (ptr: number) => {
                        console.warn("[WASM WARN]", readString(ptr));
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
            addDevice('screen', 'output', '', '')
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


    const readString = (ptr: number, charSize = 2) => {
        if (!wasmRef.current) throw new Error("wasm not found in readString");

        //console.log('readString1', ptr)
        //console.log('memory:', memory)

        const wasmExports = wasmRef.current.exports as WasmExports;
        const memory = wasmExports.memory as WebAssembly.Memory;
        const bytes = new Uint8Array(memory.buffer, ptr)
        //console.log('bytes:', bytes)

        let end = 0;
        while (bytes[end] !== 0) end += charSize;
        const str = new TextDecoder().decode(bytes.subarray(0, end));

        return str;

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

        const code = Array.from(getBytecodeArray(compiled).entries())
            .slice(0, 100) // DEBUG
        //console.log({code})

        const addresses = new Uint8Array(code.map(r => r[0]));
        const values = new Uint8Array(code.map(r => r[1]));

        const addrPtr = wasmExports.allocate(addresses.length);
        const valPtr = wasmExports.allocate(values.length);

        new Uint8Array(wasmExports.memory.buffer).set(addresses, addrPtr);
        new Uint8Array(wasmExports.memory.buffer).set(values, valPtr);

        wasmExports.computerloadCode(computerPointer, addrPtr, addresses.length, valPtr, values.length);
    }


    const addDevice = (name: string, type: string, vendor = '', model = '') => {
        if (!wasmRef.current || !computerPointer || !devicesRef.current) return;

        const wasmExports = wasmRef.current.exports as WasmExports;
        const deviceIdx = wasmExports.computerAddDevice(computerPointer, name, type, vendor, model)
        console.log(`Device #${deviceIdx} added`);

        if (name === 'keyboard') {
            const device = new KeyboardDevice(deviceIdx, 'keyboard', { type: 'input' });
            devicesRef.current.set(deviceIdx, device)
            setKeyboardDevice(device)

        } else if (name === 'console') {
            const device = new ConsoleDevice(deviceIdx, 'console', { type: 'output' });
            devicesRef.current.set(deviceIdx, device)
            setConsoleDevice(device)

        } else if (name === 'screen') {
            const device = new ScreenDevice(deviceIdx, 'screen', { type: 'output' });
            devicesRef.current.set(deviceIdx, device)
            setScreenDevice(device)

        } else {
            const device = new IoDevice(deviceIdx, name, { type });
            devicesRef.current.set(deviceIdx, device)
        }

    }


    const startClock = () => {
        clock.start()
    }


    const stopClock = () => {
        clock.stop()
    }


    const runCycle = () => {
        if (!wasmRef.current || computerPointer === null) return;

        //console.log('testClick')
        //console.log('computerPtr:', computerPointer);

        const wasmExports = wasmRef.current.exports as WasmExports;

        const cycles_before = wasmExports.computerGetCycles(computerPointer);
        const PC_before = wasmExports.computerGetRegisterPC(computerPointer);
        const IR_before = wasmExports.computerGetRegisterIR(computerPointer);
        const A_before = wasmExports.computerGetRegisterA(computerPointer);
        const B_before = wasmExports.computerGetRegisterB(computerPointer);
        const C_before = wasmExports.computerGetRegisterC(computerPointer);
        const D_before = wasmExports.computerGetRegisterD(computerPointer);
        console.log('BEFORE', { cycles: cycles_before, PC: PC_before, IR: IR_before, A: A_before, B: B_before, C: C_before, D: D_before });


        wasmExports.computerRunCycles(computerPointer, 1);
        //console.log('memory:', exports.memory);

        const cycles_after = wasmExports.computerGetCycles(computerPointer);
        const PC_after = wasmExports.computerGetRegisterPC(computerPointer);
        const IR_after = wasmExports.computerGetRegisterIR(computerPointer);
        const A_after = wasmExports.computerGetRegisterA(computerPointer);
        const B_after = wasmExports.computerGetRegisterB(computerPointer);
        const C_after = wasmExports.computerGetRegisterC(computerPointer);
        const D_after = wasmExports.computerGetRegisterD(computerPointer);
        console.log('AFTER', { cycles: cycles_after, PC: PC_after, IR: IR_after, A: A_after, B: B_after, C: C_after, D: D_after });

        //const memValue_0x1000 = exports.computerGetMemory(computerPointer, 0x1000);
        //console.log('memValue 0x1000:', memValue_0x1000);

        //const memValue_0x000F = exports.computerGetMemory(computerPointer, 0x000F as u16);
        //console.log('memValue 0x000F:', memValue_0x000F);
    }


    return (
        <div className="p-1 text-foreground">
            <h1>V3</h1>

            <hr />

            <div className="flex gap-4 m-2">
                <button className="p-2 border rounded cursor-pointer" onClick={() => runCycle()}>runCycle</button>
                <button className="p-2 border rounded cursor-pointer" onClick={() => startClock()}>start</button>
                <button className="p-2 border rounded cursor-pointer" onClick={() => stopClock()}>stop</button>
            </div>

            <hr />

            <div>Speed: {Math.round(10 * cyclesPerSecond) / 10}/sec.</div>

            <hr />

            <div>
                {/* Console */}
                <Console deviceInstance={consoleDevice} />
            </div>

            <hr />

            <div>
                <Screen deviceInstance={screenDevice} />
            </div>

            <hr />

            <div>
                <Keyboard deviceInstance={keyboardDevice} />
            </div>
        </div>
    );
}


