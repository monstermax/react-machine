
import { useEffect, useRef, useState } from "react";

import { IoDevice } from "./IoDevice";

import type { u8 } from "@/types";


export type KeyboardDeviceParams = {
    type: string;
    vendor?: string;
    model?: string;
}

export class KeyboardDevice extends IoDevice {
    name = 'keyboard';
    type = 'input';
    vendor = '';
    model = '';

    lastChar = 0 as u8;
    hasChar = false;
    isEnable = true;
    irqEnabled = false;
    charQueue: u8[] = [];


    constructor(idx: u8, name: string, params: KeyboardDeviceParams) {
        super(idx, name, params);
        // Keyboard listening is handled by the React component (div focus),
        // not by a global window listener.
    }

    read(port: u8): u8 {
        switch (port) {
            case 0x00: // KEYBOARD_DATA
                //console.log('keyboard char:', this.lastChar)
                return this.lastChar;

            case 0x01: // KEYBOARD_STATUS
                return ((this.hasChar ? 0x01 : 0x00) | (this.irqEnabled ? 0x02 : 0x00)) as u8;
        }
        return 0 as u8
    }

    write(port: u8, value: u8): void {
        switch (port) {
            case 0x00: // KEYBOARD_DATA
                this.lastChar = 0 as u8;
                this.hasChar = false;
                this.emit('state', { lastChar: this.lastChar, hasChar: this.hasChar })
                break;

            case 0x01: // KEYBOARD_STATUS
                // Bit 0: clear le flag hasChar
                if ((value & 0x01) === 0) {
                    this.hasChar = false;
                    this.emit('state', { hasChar: this.hasChar })

                    this.handleCharCodeDequeue()
                }

                // Bit 1: enable/disable IRQ
                this.irqEnabled = (value & 0x02) !== 0;
                break
        }
    }

    start(target: HTMLElement | Window = window) {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!this.isEnable) return;

            const charCode = event.key.length === 1
                ? event.key.charCodeAt(0)
                : event.keyCode;

            if (event.key === 'F5') return;
            if (charCode < 0x20 && charCode !== 13 && charCode !== 8) return;

            this.handleCharCodeQueued(charCode as u8);
            event.preventDefault();
            event.stopPropagation();
        };

        target.addEventListener('keydown', handleKeyDown as EventListener);

        // Return cleanup function
        return () => {
            target.removeEventListener('keydown', handleKeyDown as EventListener);
        };
    }


    reset() {
        this.lastChar = 0 as u8;
        this.hasChar = false;
        this.irqEnabled = false;
        this.emit('state', { lastChar: this.lastChar, hasChar: this.hasChar })
    }


    handleCharCodeQueued(charCode: u8) {
        this.charQueue.push(charCode)
        this.handleCharCodeDequeue()
    }


    // Fonction pour simuler une touche (pour testing)
    handleCharCodeDequeue() {
        if (this.hasChar) return; // un caractere est toujours en attente de traitement par le cpu
        if (this.charQueue.length === 0) return; //queue vide
        //if (charCode > 127) return;

        const charCode = this.charQueue.shift();

        this.lastChar = charCode as u8;
        this.hasChar = true;

        this.emit('state', { lastChar: this.lastChar, hasChar: this.hasChar })

        //if (interruptHook?.requestInterrupt) {
        //    interruptHook.requestInterrupt(U8(MEMORY_MAP.IRQ_KEYBOARD));
        //}
    }

}



export type KeyboardProps = {
    deviceInstance: KeyboardDevice | null
}

export const Keyboard: React.FC<KeyboardProps> = (props) => {
    const { deviceInstance } = props;

    const [lastChar, setLastChar] = useState<u8>(0 as u8)
    const [hasChar, setHasChar] = useState<boolean>(true)
    const [isFocused, setIsFocused] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)


    useEffect(() => {
        if (!deviceInstance) return;

        deviceInstance.on('state', (state) => {
            if (state.lastChar !== undefined) {
                setLastChar(state.lastChar)
            }

            if (state.hasChar !== undefined) {
                setHasChar(state.hasChar)
            }
        })

    }, [deviceInstance])


    // Attach keyboard listener to the container div
    useEffect(() => {
        if (!deviceInstance || !containerRef.current) return;

        const cleanup = deviceInstance.start(containerRef.current);
        return cleanup;
    }, [deviceInstance])


    if (!deviceInstance) {
        return (
            <>Loading Keyboard...</>
        );
    }


    return (
        <>
            <h2>Keyboard</h2>

            <div
                ref={containerRef}
                id="device-keyboard"
                tabIndex={0}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`grid grid-cols-2 gap-4 p-3 bg-slate-900/50 rounded outline-none cursor-pointer transition-all min-h-28 ${
                    isFocused
                        ? 'ring-2 ring-green-500/50'
                        : 'ring-1 ring-transparent hover:ring-slate-600/50'
                }`}
            >
                <div>
                    <div className="text-xs text-slate-400 mb-1">Last Char:</div>
                    <div className="text-2xl font-mono text-green-400">
                        {lastChar > 0 ? (
                            <>
                                '{String.fromCharCode(lastChar)}'
                                <span className="text-sm text-slate-400 ml-2">
                                    (0x{lastChar.toString(16).padStart(2, '0')})
                                </span>
                            </>
                        ) : (
                            <span className="text-slate-600">--</span>
                        )}
                    </div>
                </div>
                <div>
                    <div className="text-xs text-slate-400 mb-1">Status:</div>
                    <div className="flex items-center gap-2 mt-2">
                        <div
                            className={`w-4 h-4 rounded-full ${hasChar ? 'bg-green-500 animate-pulse' : 'bg-slate-700'
                                }`}
                        />
                        <span className="text-sm text-slate-300">
                            {isFocused
                                ? (hasChar ? 'Char Available' : 'Listening...')
                                : 'Click to focus'
                            }
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
