
import { useEffect, useState } from "react";
import { EventEmitter } from "eventemitter3";

import { u8 } from "@/types";


type KeyboardDeviceParams = {
    type: string;
    vendor?: string;
    model?: string;
}

class KeyboardDevice extends EventEmitter {
    idx = 0 as u8;
    name = 'keyboard';
    type = 'input';
    vendor = '';
    model = '';

    lastChar = 0 as u8;
    hasChar = false;
    isEnable = true;
    irqEnabled = false;


    constructor(name: string, params: KeyboardDeviceParams) {
        super();

        this.name = name;
        this.type = params.type;
        this.vendor = params.vendor ?? '';
        this.model = params.model ?? '';
    }

    read(port: u8): u8 {
        switch (port) {
            case 0x00: // KEYBOARD_DATA
                console.log('keyboard char:', this.lastChar)
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
                }

                // Bit 1: enable/disable IRQ
                this.irqEnabled = (value & 0x02) !== 0;
                break
        }
    }

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

            console.log(`⌨️  Key pressed: '${event.key}' (ASCII: ${charCode})`);

            if (charCode < 0x20 && charCode !== 13 && charCode !== 8) return;

            this.handleCharCode(charCode);
            event.preventDefault()
        };

        window.addEventListener('keydown', handleKeyDown);
    }

    reset() {
        this.lastChar = 0 as u8;
        this.hasChar = false;
        this.irqEnabled = false;
        this.emit('state', { lastChar: this.lastChar, hasChar: this.hasChar })
    }

    // Fonction pour simuler une touche (pour testing)
    handleCharCode(charCode: number) {
        //if (charCode > 127) return;

        this.lastChar = charCode as u8;
        this.hasChar = true;

        this.emit('state', { lastChar: this.lastChar, hasChar: this.hasChar })

        //if (interruptHook?.requestInterrupt) {
        //    interruptHook.requestInterrupt(U8(MEMORY_MAP.IRQ_KEYBOARD));
        //}
    }

}


export const keyboardDevice = new KeyboardDevice('keyboard', { type: 'input' });



export type KeyboardProps = {
    deviceInstance: KeyboardDevice | null
}

export const Keyboard: React.FC<KeyboardProps> = (props) => {
    const { deviceInstance } = props;

    const [lastChar, setLastChar] = useState<u8>(0 as u8)
    const [hasChar, setHasChar] = useState<boolean>(true)


    useEffect(() => {
        if (!deviceInstance) return;

        deviceInstance.on('state', (state) => {
            //console.log('Keyboard state update', state)

            if (state.lastChar !== undefined) {
                setLastChar(state.lastChar)
            }

            if (state.hasChar !== undefined) {
                setHasChar(state.hasChar)
            }
        })

    }, [deviceInstance])


    if (!deviceInstance) {
        return (
            <>Loading Keyboard...</>
        );
    }


    return (
        <>
            <div>
                {/* Status */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-900/50 rounded">
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
                                {hasChar ? 'Char Available' : 'Waiting'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

