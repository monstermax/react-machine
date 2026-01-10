
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";

import type { u16, u8 } from "@/types/cpu.types";


export class LedsDisplay extends EventEmitter {
    public id: number;
    public name: string;
    private leds: u8 = 0 as u8;


    constructor(name: string) {
        console.log(`Initializing LedsDisplay`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
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
                break;
        }
    }


    getLeds(): u8[] {
        // Retourne un tableau de bits pour l'affichage UI
        return Array.from({ length: 8 }, (_, i) => ((this.leds >> i) & 1) as u8);
    }


    reset(): void {
        this.leds = U8(0);
    }

}

