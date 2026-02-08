
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
}

declare global {
    interface Window {
        wasm?: WebAssembly.Instance;
    }
}


export const TestV3Component: React.FC = () => {
    const wasmRef = useRef<WebAssembly.Instance | null>(null);
    const [computerPointer, setComputerPointer] = useState<number | null>(null);


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

            //console.log('new wasm:', _wasm.instance)
            console.log('memory:', exports.memory)
        }

        const timer = setTimeout(_initWasm, 100);
        return () => clearTimeout(timer);

    }, [])


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


    const testClick = () => {
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
            <button onClick={() => testClick()}>clic</button>
        </div>
    );
}

