
import React, { useEffect, useState } from "react";


export const TestV3Component: React.FC = () => {
    const [wasm, setWasm] = useState<WebAssembly.Instance | null>(null);
    const [computerPointer, setComputerPointer] = useState<number | null>(null);

    const [memory] = useState(() => new WebAssembly.Memory({ initial: 256 }));


    useEffect(() => {
        const _initWasm = async () => {
            if (wasm) return;

            const imports = {
                env: {
                    memory,
                    abort: (ptr: number) => { throw new Error(`abort ${ptr}`); },
                    'console.log' : (ptr: number) => console.log ("[WASM]", readString(ptr)),
                    'console.warn': (ptr: number) => console.warn("[WASM]", readString(ptr)),
                },
            };

            const importUrl = await import(`../build/release.wasm?url`);
            const url = importUrl.default;

            const response = fetch(url);

            const _wasm = await WebAssembly.instantiateStreaming(response, imports)
            const _computerPointer = _wasm.instance.exports.instanciateComputer()

            setWasm(_wasm.instance);
            setComputerPointer(_computerPointer);
        }

        const timer = setTimeout(_initWasm, 100);
        return () => clearTimeout(timer);

    }, [])


    const readString = (ptr: number) => {
        //if (1) return ""; // TODO

        console.log('readString1', computerPointer)
        console.log('memory:', memory)
        const memoryArray = new Uint8Array(memory, ptr, 0xFF)
        console.log('memoryArray:', memoryArray)

        let end = ptr;
        //while (memoryArray[end] !== 0) end++;

        const str = ""; // TODO: subarray(ptr, end)
        return str;

    }


    const testClick = () => {
        if (!wasm || computerPointer === null) return;

        //console.log('testClick')
        //console.log('computerPtr:', computerPointer);

        wasm.exports.computerRunCycle(computerPointer);

        const cycles = wasm.exports.computerGetCycles(computerPointer);
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

