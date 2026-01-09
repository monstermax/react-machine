
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";

import type { Device, u8 } from "@/types/cpu.types";


export class IO extends EventEmitter {
    public id: number;
    private devices: Device[];

    constructor() {
        console.log(`Initializing IO`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.devices = [];
    }


    read(port: u8): u8 {
        return U8(0)
    }


    write(port: u8, value: u8): void {

    }

}

