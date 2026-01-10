
import { EventEmitter } from "eventemitter3";

import * as cpuApi from '../api/api';
import { U16, U8 } from "@/lib/integers";

import type { CompiledCode, Device, u8 } from "@/types/cpu.types";


export class IO extends EventEmitter {
    public id: number;
    public devices: Map<string, cpuApi.StorageDisk> = new Map;


    constructor() {
        console.log(`Initializing IO`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
    }


    read(port: u8): u8 {
        return U8(0)
    }


    write(port: u8, value: u8): void {

    }

}

