
import { u16, u8 } from "@/types";
import { Computer } from "@/v2/api";
import React, { useCallback, useEffect, useRef, useState } from "react";


interface WasmExports extends WebAssembly.Exports {
    memory: WebAssembly.Memory;
    instanciateComputer(): number;
    computerRunCycle(computerPtr: number): void;
    computerGetCycles(computerPtr: number): number;
    computerGetRegisterPC(computerPtr: number): u16;
    computerGetRegisterIR(computerPtr: number): u8;
    computerGetRegisterA(computerPtr: number): u8;
    computerGetMemory(computerPtr: number, address: u16): u8;
    computerAddDevice(computerPtr: number, name: string, type: string, vendor?: string, model?: string): u8;
}

declare global {
    interface Window {
        wasm?: WebAssembly.Instance;
    }
}


abstract class IoDevice {
    idx: u8 = 0 as u8;
    name: string = '';
    type: string = '';
    vendor: string = '';
    model: string = '';

    read(port: u8): u8 {
        return 0 as u8
    }

    write(port: u8, value: u8): void {
    }
}


export const TestV3Component: React.FC = () => {
    const wasmRef = useRef<WebAssembly.Instance | null>(null);
    const [computerPointer, setComputerPointer] = useState<number | null>(null);
    const devicesRef = useRef<Map<number, IoDevice>>(new Map);


    useEffect(() => {
        const _initWasm = async () => {
            if (wasmRef.current) return;

            let wasmInstance: WebAssembly.Instance | null = null;

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

            //exports.computerAddDevice(_computerPointer, 'keyboard', 'input')

            //console.log('new wasm:', _wasm.instance)
            console.log('memory:', exports.memory)
        }

        const timer = setTimeout(_initWasm, 100);
        return () => clearTimeout(timer);

    }, [])


    const jsIoRead = (deviceIdx: u8, port: u8): u8 => {
        if (!devicesRef.current) throw new Error("missing devices ref");

        const device = devicesRef.current.get(deviceIdx);

        if (!device) {
            throw new Error(`device #${deviceIdx} not found`);
        }

        const value = device.read(port);

        console.log('jsIoRead:', deviceIdx, port, value)
        return value
    }

    const jsIoWrite = (deviceIdx: u8, port: u8, value: u8): void => {
        if (!devicesRef.current) throw new Error("missing devices ref");

        const device = devicesRef.current.get(deviceIdx);

        if (!device) {
            throw new Error(`device #${deviceIdx} not found`);
        }

        device.write(port, value);

        console.log('jsIoWrite:', deviceIdx, port, value)
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


    const runCycle = () => {
        if (!wasmRef.current || computerPointer === null) return;

        //console.log('testClick')
        //console.log('computerPtr:', computerPointer);

        const exports = wasmRef.current.exports as WasmExports;

        const cycles_before = exports.computerGetCycles(computerPointer);
        const PC_before = exports.computerGetRegisterPC(computerPointer);
        const IR_before = exports.computerGetRegisterIR(computerPointer);
        const A_before = exports.computerGetRegisterA(computerPointer);
        console.log('BEFORE', { cycles: cycles_before, PC: PC_before, IR: IR_before, A: A_before });


        exports.computerRunCycle(computerPointer);
        //console.log('memory:', exports.memory);

        const cycles_after = exports.computerGetCycles(computerPointer);
        const PC_after = exports.computerGetRegisterPC(computerPointer);
        const IR_after = exports.computerGetRegisterIR(computerPointer);
        const A_after = exports.computerGetRegisterA(computerPointer);
        console.log('AFTER', { cycles: cycles_after, PC: PC_after, IR: IR_after, A: A_after });

        //const memValue_0x1000 = exports.computerGetMemory(computerPointer, 0x1000);
        //console.log('memValue 0x1000:', memValue_0x1000);

        const memValue_0x000F = exports.computerGetMemory(computerPointer, 0x000F as u16);
        console.log('memValue 0x000F:', memValue_0x000F);
    }


    return (
        <div className="p-1 text-foreground">
            V3
            <hr />
            <div className="flex gap-4 m-2">
                <button className="p-2 border rounded cursor-pointer" onClick={() => addDevice('keyboard', 'input', '', '')}>add Keyboard</button>
                <button className="p-2 border rounded cursor-pointer" onClick={() => addDevice('console', 'output', '', '')}>add Console</button>
                <button className="p-2 border rounded cursor-pointer" onClick={() => runCycle()}>runCycle</button>
            </div>
        </div>
    );
}

