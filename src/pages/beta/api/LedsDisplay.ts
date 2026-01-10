
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
        return U8(0)
    }


    write(port: u8, value: u8): void {

    }


    getLeds(): u8[] {
        // Retourne un tableau de bits pour l'affichage UI
        return Array.from({ length: 8 }, (_, i) => ((this.leds >> i) & 1) as u8);
    }

}

