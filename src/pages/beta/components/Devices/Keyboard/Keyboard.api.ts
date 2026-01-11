
import { EventEmitter } from "eventemitter3";

import type { Device, IoDeviceType, u8 } from "@/types/cpu.types";


export class Keyboard extends EventEmitter {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;

    public lastChar: u8 = 0 as u8;
    public hasChar: boolean = false;
    public isEnable: boolean = true;
    public irqEnabled: boolean = false;


    constructor(name: string, ioPort: u8 | null = null) {
        //console.log(`Initializing SevenSegmentDisplay`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.type = 'Input';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port

        this.start();
    }


    // Écouter les touches du clavier
    start() {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!this.isEnable) return;

            // Ignorer les touches spéciales (Ctrl, Alt, etc.)
            if (event.ctrlKey || event.altKey || event.metaKey) return;

            // Ignorer si la touche ne produit pas de caractère
            if (event.key.length !== 1) return;

            const charCode = event.key.charCodeAt(0);

            // Limiter aux caractères ASCII valides (0-127)
            if (charCode > 127) return;

            this.lastChar = charCode as u8;
            this.hasChar = true;

            this.emit('state', { lastChar: this.lastChar, hasChar: this.hasChar })

            console.log(`⌨️  Key pressed: '${event.key}' (ASCII: ${charCode})`);

            // Déclencher interruption clavier (IRQ 1)
            //if (this.irqEnabled && interruptHook?.requestInterrupt) {
            //    interruptHook.requestInterrupt(U8(MEMORY_MAP.IRQ_KEYBOARD));
            //}
        };

        window.addEventListener('keydown', handleKeyDown);
    }

    // Device IO interface
    read(port: u8): u8 {
        switch (port) {
            case 0x00: // KEYBOARD_DATA
                return this.lastChar;

            case 0x01: // KEYBOARD_STATUS
                return ((this.hasChar ? 0x01 : 0x00) | (this.irqEnabled ? 0x02 : 0x00)) as u8;

            default:
                return 0 as u8;
        }
    }


    write(port: u8, value: u8): void {
        switch (port) {
            case 0x00: // KEYBOARD_DATA - write-only pour clear
                this.lastChar = 0 as u8;
                this.hasChar = false;
                this.emit('state', { lastChar: this.lastChar, hasChar: this.hasChar })
                break;

            case 0x01: // KEYBOARD_STATUS - peut être écrit pour clear le flag
                // Bit 0: clear le flag hasChar
                if ((value & 0x01) === 0) {
                    this.hasChar = false;
                    this.emit('state', { hasChar: this.hasChar })
                }
                // Bit 1: enable/disable IRQ
                this.irqEnabled = (value & 0x02) !== 0;
                break;
        }
    }


    reset() {
        this.lastChar = 0 as u8;
        this.hasChar = false;
        this.irqEnabled = false;
        this.emit('state', { lastChar: this.lastChar, hasChar: this.hasChar })
    }


    // Fonction pour simuler une touche (pour testing)
    simulateKeyPress(char: string) {
        if (char.length !== 1) return;

        const charCode = char.charCodeAt(0);
        if (charCode > 127) return;

        this.lastChar = charCode as u8;
        this.hasChar = true;

        this.emit('state', { lastChar: this.lastChar, hasChar: this.hasChar })

        //if (interruptHook?.requestInterrupt) {
        //    interruptHook.requestInterrupt(U8(MEMORY_MAP.IRQ_KEYBOARD));
        //}
    }


};

