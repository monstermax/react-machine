
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";

import type { u16, u8 } from "@/types/cpu.types";


export class Rom extends EventEmitter {
    public id: number;
    public storage: Map<u16, u8>;


    constructor(data?: Array<[u16, u8]> | Map<u16, u8>) {
        //console.log(`Initializing ROM`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.storage = new Map(data ?? []);

        this.emit('state', { storage: new Map(this.storage) })
    }


    read(address: u16): u8 {
        return this.storage.get(address) || U8(0);
    }


    write(address: u16, value: u8): void {
        throw new Error(`Cannot write ROM`);
    }

}

