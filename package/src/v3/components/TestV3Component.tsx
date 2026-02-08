
import React, { useCallback, useEffect, useRef, useState } from "react";


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
                    abort: (ptr: number) => { console.warn ("[WASM ABORT]", readString(ptr)) },
                    'console.log' : (ptr: number) => console.log ("[WASM LOG]", readString(ptr)),
                    'console.warn': (ptr: number) => console.warn("[WASM WARN]", readString(ptr)),
                },
            };

            const importUrl = await import(`../build/release.wasm?url`);
            const url = importUrl.default;

            const response = fetch(url);
            const _wasm = await WebAssembly.instantiateStreaming(response, imports)
            wasmRef.current = _wasm.instance;

            const _computerPointer = _wasm.instance.exports.instanciateComputer()
            setComputerPointer(_computerPointer);

            console.log('new wasm:', _wasm.instance)
        }

        const timer = setTimeout(_initWasm, 100);
        return () => clearTimeout(timer);

    }, [])


    const readString = (ptr: number) => {
        if (!wasmRef.current) throw new Error("wasm not found in readString");

        //console.log('readString1', wasm, computerPointer)
        //console.log('memory:', memory)

        const memory = wasmRef.current.exports.memory as WebAssembly.Memory;
        const bytes = new Uint8Array(memory.buffer, ptr, 0xFF)
        //console.log('bytes:', bytes)

        let end = 0;
        while (bytes[end] !== 0) end++;
        const str = new TextDecoder().decode(bytes.subarray(ptr, ptr + end));

        return str;

    }


    const testClick = () => {
        if (!wasmRef.current || computerPointer === null) return;

        //console.log('testClick')
        //console.log('computerPtr:', computerPointer);

        wasmRef.current.exports.computerRunCycle(computerPointer);

        const cycles = wasmRef.current.exports.computerGetCycles(computerPointer);
        console.log('cycles:', cycles);
    }


    return (
        <div className="p-1 text-foreground">
            V3
            <hr />
            <button onClick={() => testClick()}>clic</button>
        </div>
    );
}

