
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";

import type { CompiledCode, u16, u8 } from "@/types/cpu.types";
import { MEMORY_MAP } from "@/lib/memory_map";


export class Ram extends EventEmitter {
    public id: number;
    public storage: Map<u16, u8>;


    constructor(data?: Array<[u16, u8]> | Map<u16, u8>) {
        //console.log(`Initializing RAM`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.storage = new Map(data ?? []);

        this.emit('state', { storage: new Map(this.storage) })
    }


    eraseRam() {
        this.storage = new Map;
        this.emit('state', { storage: new Map })
    }


    read(address: u16): u8 {
        return this.storage.get(address) || U8(0);
    }


    write(address: u16, value: u8): void {
        this.storage.set(address, U8(value))
        this.emit('state', { storage: new Map(this.storage) })
    }


    async loadCodeInRam (code: CompiledCode, memoryOffset: u16=0 as u16) {
        console.log('Loaded code size in RAM:', code.size)

        for (const [addr, value] of code.entries()) {
            this.write(U16(memoryOffset + addr), value);
        }
    }
}


