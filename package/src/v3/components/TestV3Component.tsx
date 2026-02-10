
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
            //exports.computerAddDevice(_computerPointer, 'console', 'input')

            //exports.computerloadCode(_computerPointer, new Uint8Array([0x0006]), new Uint8Array([62])) // DO NOT WORK // TODO

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

        if (name === 'keyboard') {
            const device = keyboardDevice;
            devicesRef.current.set(deviceIdx, device)
            device.start()
            return
        }

        if (name === 'console') {
            const device = consoleDevice;
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


        exports.computerRunCycle(computerPointer);
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



const keyboardDevice = {
    idx: 0 as u8,
    name: 'keyboard',
    type: 'input',
    vendor: '',
    model: '',

    lastChar: 0 as u8,
    hasChar: false,
    isEnable: true,
    irqEnabled: false,

    read(port: u8): u8 {
        switch (port) {
            case 0x00: // KEYBOARD_DATA
                console.log('keyboard char:', this.lastChar)
                return this.lastChar;

            case 0x01: // KEYBOARD_STATUS
                return ((this.hasChar ? 0x01 : 0x00) | (this.irqEnabled ? 0x02 : 0x00)) as u8;
        }
        return 0 as u8
    },

    write(port: u8, value: u8): void {
        switch (port) {
            case 0x00: // KEYBOARD_DATA
                this.lastChar = 0 as u8;
                this.hasChar = false;
                break;

            case 0x01: // KEYBOARD_STATUS
                // Bit 0: clear le flag hasChar
                if ((value & 0x01) === 0) {
                    this.hasChar = false;
                }

                // Bit 1: enable/disable IRQ
                this.irqEnabled = (value & 0x02) !== 0;
                break
        }
    },

    start() {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!this.isEnable) return;

            // Ignorer les touches spéciales (Ctrl, Alt, etc.)
            //if (event.ctrlKey || event.altKey || event.metaKey) return;

            // Ignorer si la touche ne produit pas de caractère
            //if (event.key?.length !== 1) return;

            const charCode = event.key.length === 1
                ? event.key.charCodeAt(0)
                : event.keyCode;

            // Limiter aux caractères ASCII valides (0-127)
            //if (charCode > 127) return;
            if (event.key === 'F5') return; // F5
            if (charCode < 32 && charCode !== 13) return;

            this.lastChar = charCode as u8;
            this.hasChar = true;

            //this.emit('state', { lastChar: this.lastChar, hasChar: this.hasChar })

            console.log(`⌨️  Key pressed: '${event.key}' (ASCII: ${charCode})`);

            // Déclencher interruption clavier (IRQ 1)
            //if (this.irqEnabled && interruptHook?.requestInterrupt) {
            //    interruptHook.requestInterrupt(U8(MEMORY_MAP.IRQ_KEYBOARD));
            //}

            event.preventDefault()
        };

        window.addEventListener('keydown', handleKeyDown);
    },

    reset() {
        this.lastChar = 0 as u8;
        this.hasChar = false;
        this.irqEnabled = false;
    },
}


const consoleDevice = {
    idx: 0 as u8,
    name: 'console',
    type: 'output',
    vendor: '',
    model: '',

    width: 30,
    height: 15,
    lines: [] as string[],
    maxLines: 100,
    currentLine: "",

    read(port: u8): u8 {
        return 0 as u8; // write only
    },

    write(port: u8, value: u8): void {
        switch (port) {
            case 0x00: // CONSOLE_CHAR - Écrire un caractère
                const char = String.fromCharCode(value);

                console.log('console char:', char)

                if (value === 0x0A || value === 0x0D) {
                    // Newline (LF ou CR)
                    this.lines.push(this.currentLine)
                    //console.log('console lines:', this.lines)

                    // Limiter le nombre de lignes
                    if (this.lines.length > this.maxLines) {
                        this.lines = this.lines.slice(-this.maxLines);
                        return;
                    }

                    this.currentLine = "";
                    //console.log(`📟 Console: "${currentLine}"`);

                } else if (value === 0x08) {
                    // Backspace
                    this.currentLine = this.currentLine.slice(0, -1);

                } else if (value >= 0x20 && value <= 0x7E) {
                    // Caractères imprimables ASCII
                    this.currentLine = this.currentLine + char;

                } else {
                    // Autres caractères de contrôle - ignorer
                    console.warn(`📟 Console: Unprintable character 0x${value.toString(16)}`);
                }
                break;

            case 0x01: // CONSOLE_CLEAR - Clear screen
                this.reset()
                //console.log(`📟 Console: Screen cleared`);
                break;
        }
    },

    reset() {
        this.lines = [];
        this.currentLine = "";
    },
}


