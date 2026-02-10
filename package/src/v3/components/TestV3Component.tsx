
import React, { useCallback, useEffect, useRef, useState } from "react";

import { IoDevice } from "./devices/IoDevice";
import { Keyboard, KeyboardDevice } from "./devices/keyboard";
import { Console, ConsoleDevice } from "./devices/console";
import { Clock } from "./devices/clock";

import type { u16, u8, u32 } from "@/types/cpu.types";


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
    computerloadCode(computerPtr: number, addresses: Uint8Array, values: Uint8Array): void
}

declare global {
    interface Window {
        wasm?: WebAssembly.Instance;
    }
}


export const TestV3Component: React.FC = () => {
    const wasmRef = useRef<WebAssembly.Instance | null>(null);
    const [computerPointer, setComputerPointer] = useState<number | null>(null);
    const devicesRef = useRef<Map<number, IoDevice>>(new Map);
    const [clock] = useState(() => new Clock)

    const [cyclesPerSecond, setCyclesPerSecond] = useState(0);
    const [keyboardDevice, setKeyboardDevice] = useState<KeyboardDevice | null>(null)
    const [consoleDevice, setConsoleDevice] = useState<ConsoleDevice | null>(null)


    useEffect(() => {
        const _initWasm = async () => {
            if (wasmRef.current) return;

            const imports = {
                env: {
                    memory: new WebAssembly.Memory({ initial: 256 }),
                    abort: (ptr: number) => { throw new Error("[WASM ABORT] " + readString(ptr)) },
                    'console.log' : (ptr: number) => console.log ("[WASM LOG]", readString(ptr)),
                    'console.warn': (ptr: number) => console.warn("[WASM WARN]", readString(ptr)),
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

            const exports = _wasm.instance.exports as WasmExports;

            const _computerPointer = exports.instanciateComputer()
            setComputerPointer(_computerPointer);

            //addDevice('keyboard', 'input')
            //addDevice('console', 'input')

            //exports.computerloadCode(_computerPointer, new Uint8Array([0x0006]), new Uint8Array([62])) // DO NOT WORK // TODO

            //console.log('new wasm:', _wasm.instance)
            console.log('memory:', exports.memory)
        }

        const timer = setTimeout(_initWasm, 100);
        return () => clearTimeout(timer);

    }, [])


    useEffect(() => {
        if (!computerPointer) return;

        const speedFactor = 1 as u32;

        const _initClock = () => {
            let lastCycles = 0n;
            let lastCyclesDate = Date.now();

            clock.on('tick', () => {
                //console.log('found tick');

                if (wasmRef.current && computerPointer) {
                    const exports = wasmRef.current.exports as WasmExports;

                    // Run cycle
                    exports.computerRunCycles(computerPointer, speedFactor);

                    // Compute speed
                    const newCycles = exports.computerGetCycles(computerPointer);
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


    const readString = (ptr: number, charSize=2) => {
        if (!wasmRef.current) throw new Error("wasm not found in readString");

        //console.log('readString1', ptr)
        //console.log('memory:', memory)

        const exports = wasmRef.current.exports as WasmExports;
        const memory = exports.memory as WebAssembly.Memory;
        const bytes = new Uint8Array(memory.buffer, ptr)
        //console.log('bytes:', bytes)

        let end = 0;
        while (bytes[end] !== 0) end += charSize;
        const str = new TextDecoder().decode(bytes.subarray(0, end));

        return str;

    }


    const addDevice = (name: string, type: string, vendor='', model='') => {
        if (!wasmRef.current || !computerPointer || !devicesRef.current) return;

        const exports = wasmRef.current.exports as WasmExports;
        const deviceIdx = exports.computerAddDevice(computerPointer, name, type, vendor, model)
        console.log(`Device #${deviceIdx} added`);

        if (name === 'keyboard') {
            const device = new KeyboardDevice('keyboard', { type: 'input' });
            setKeyboardDevice(device)
            devicesRef.current.set(deviceIdx, device)
            device.start()

            //exports.computerloadCode(computerPointer, new Uint8Array([0x0006]), new Uint8Array([62])) // DO NOT WORK // TODO

            return
        }

        if (name === 'console') {
            const device = new ConsoleDevice('console', { type: 'output' });
            setConsoleDevice(device)
            devicesRef.current.set(deviceIdx, device)
            return
        }

        const device: IoDevice = {
            idx: deviceIdx,
            name,
            type,
            vendor,
            model,
            read: (port: u8) => 42 as u8,
            write: (port: u8, value: u8) => {},
        }

        devicesRef.current.set(deviceIdx, device)
    }


    const startClock = () => {
        //clock.setFrequency(200)
        //clock.setSpeedFactor(50)
        clock.start()
    }


    const stopClock = () => {
        clock.stop()
    }


    const runCycle = () => {
        if (!wasmRef.current || computerPointer === null) return;

        //console.log('testClick')
        //console.log('computerPtr:', computerPointer);

        const exports = wasmRef.current.exports as WasmExports;

        const cycles_before = exports.computerGetCycles(computerPointer);
        const PC_before = exports.computerGetRegisterPC(computerPointer);
        const IR_before = exports.computerGetRegisterIR(computerPointer);
        const A_before = exports.computerGetRegisterA(computerPointer);
        const B_before = exports.computerGetRegisterB(computerPointer);
        const C_before = exports.computerGetRegisterC(computerPointer);
        const D_before = exports.computerGetRegisterD(computerPointer);
        console.log('BEFORE', { cycles: cycles_before, PC: PC_before, IR: IR_before, A: A_before, B: B_before, C: C_before, D: D_before });


        exports.computerRunCycles(computerPointer, 1);
        //console.log('memory:', exports.memory);

        const cycles_after = exports.computerGetCycles(computerPointer);
        const PC_after = exports.computerGetRegisterPC(computerPointer);
        const IR_after = exports.computerGetRegisterIR(computerPointer);
        const A_after = exports.computerGetRegisterA(computerPointer);
        const B_after = exports.computerGetRegisterB(computerPointer);
        const C_after = exports.computerGetRegisterC(computerPointer);
        const D_after = exports.computerGetRegisterD(computerPointer);
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
                <button className="p-2 border rounded cursor-pointer" onClick={() => addDevice('keyboard', 'input', '', '')}>add Keyboard</button>
                <button className="p-2 border rounded cursor-pointer" onClick={() => addDevice('console', 'output', '', '')}>add Console</button>
                <button className="p-2 border rounded cursor-pointer" onClick={() => runCycle()}>runCycle</button>
                <button className="p-2 border rounded cursor-pointer" onClick={() => startClock()}>start</button>
                <button className="p-2 border rounded cursor-pointer" onClick={() => stopClock()}>stop</button>
            </div>

            <hr />

            <div>Speed: {Math.round(10 * cyclesPerSecond)/10}/sec.</div>

            <hr />

            <div>
                {/* Console */}
                <Console deviceInstance={consoleDevice} />
            </div>

            <hr />

            <div>
                <Keyboard deviceInstance={keyboardDevice} />
            </div>
        </div>
    );
}


