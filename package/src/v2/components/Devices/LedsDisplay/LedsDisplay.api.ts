
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/v2/lib/integers";

import type { IoDeviceType, u16, u8 } from "@/types/cpu.types";
import type { IoDevice } from "@/v2/types/cpu_v2.types";


export class LedsDisplay extends EventEmitter implements IoDevice {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;
    private leds: u8 = 0 as u8;


    constructor(name: string, ioPort: u8 | null = null) {
        //console.log(`Initializing LedsDisplay`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.type = 'Display';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port
    }


    read(port: u8): u8 {
        switch (port) {
            case 0x00:
                return this.leds;
                break;
        }

        return 0 as u8;
    }


    write(port: u8, value: u8): void {
        switch (port) {
            case 0x00:
                this.leds = U8(value);
                this.emit('state', { leds: this.leds })
                break;
        }
    }


    getLeds(): u8[] {
        // Retourne un tableau de bits pour l'affichage UI
        return Array.from({ length: 8 }, (_, i) => ((this.leds >> i) & 1) as u8);
    }


    reset(): void {
        this.leds = U8(0);
        this.emit('state', { leds: this.leds })
    }

}

