
import { EventEmitter } from "eventemitter3";

import type { IoDeviceType, u8 } from "@/types/cpu.types";


export class SevenSegmentDisplay extends EventEmitter {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;

    public currentValue: u8 = 0 as u8;
    public rawSegments: u8 = 0 as u8;


    constructor(name: string, ioPort: u8 | null = null) {
        //console.log(`Initializing SevenSegmentDisplay`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.type = 'Display';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port
    }


    // Mapping chiffre -> segments (bitmask)
    // Format: DP g f e d c b a (bit 7 = DP, bit 0 = segment a)
    public digitToSegments = [
        0b00111111, // 0: segments a,b,c,d,e,f
        0b00000110, // 1: segments b,c
        0b01011011, // 2: segments a,b,d,e,g
        0b01001111, // 3: segments a,b,c,d,g
        0b01100110, // 4: segments b,c,f,g
        0b01101101, // 5: segments a,c,d,f,g
        0b01111101, // 6: segments a,c,d,e,f,g
        0b00000111, // 7: segments a,b,c
        0b01111111, // 8: tous les segments
        0b01101111, // 9: segments a,b,c,d,f,g
        0b01110111, // A: segments a,b,c,e,f,g
        0b01111100, // b: segments c,d,e,f,g
        0b00111001, // C: segments a,d,e,f
        0b01011110, // d: segments b,c,d,e,g
        0b01111001, // E: segments a,d,e,f,g
        0b01110001, // F: segments a,e,f,g
    ] as u8[]


    read(port: u8): u8 {
        switch (port) {
            case 0: // Port 0 = DATA
                return this.currentValue;
            case 1: // Port 1 = RAW
                return this.rawSegments;
            default:
                return 0 as u8;
        }
    }


    write(port: u8, value: u8): void {
        switch (port) {
            case 0: // Port 0 = DATA (0xFF60)
                const digit = (value & 0x0F) as u8;
                this.currentValue = digit;
                this.rawSegments = this.digitToSegments[digit] || 0 as u8;
                this.emit('state', { rawSegments: this.rawSegments, currentValue: this.currentValue })
                break;

            case 1: // Port 1 = RAW (0xFF61)
                this.rawSegments = (value & 0x7F) as u8;
                this.emit('state', { rawSegments: this.rawSegments })
                break;
        }
    }


    // Pour l'affichage UI
    getSegments(): boolean[] {
        const segments: boolean[] = [];

        for (let i = 0; i < 8; i++) {
            segments[i] = ((this.rawSegments >> i) & 1) === 1;
        }

        return segments;
    }


    getCurrentDigit(): u8 {
        return this.currentValue;
    }


    reset() {
        this.currentValue = 0 as u8;
        this.rawSegments = 0 as u8;
        this.emit('state', { rawSegments: this.rawSegments, currentValue: this.currentValue })
    }

}

