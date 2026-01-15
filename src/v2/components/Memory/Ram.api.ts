
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";

import type { CompiledCode, u16, u8 } from "@/types/cpu.types";
import { MEMORY_MAP } from "@/lib/memory_map_16bit";


export class Ram extends EventEmitter {
    public id: number;
    public storage: Map<u16, u8> = new Map;
    private maxSize: number;


    constructor(data?: Array<[u16, u8]> | Map<u16, u8>, maxSize=0xFFFF) {
        //console.log(`Initializing RAM`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.maxSize = maxSize;

        if (data) {
            this.loadRawData(new Map(data));
        }

        this.emit('state', { maxSize })
    }


    loadRawData = async (data: CompiledCode) => {
        this.storage = new Map(data);

        if (this.storage.size > this.maxSize) {
            console.warn(`RAM overloaded`);
            this.deleteOverload()
        }

        this.emit('state', { storage: this.storage })
    }


    deleteOverload() {
        while (this.storage.size > this.maxSize) {
            const key = this.storage.keys().next();
            if (key.done) break;
            this.storage.delete(key.value)
        }
    }


    eraseRam() {
        this.loadRawData(new Map);
    }


    read(address: u16): u8 {
        return this.storage.get(address) || U8(0);
    }


    write(address: u16, value: u8): void {
        this.storage.set(address, U8(value))

        if (this.storage.size > this.maxSize) {
            this.storage.delete(address)
            console.warn(`RAM overloaded`);
        }

        this.emit('state', { storage: new Map(this.storage) })
    }


    async loadCodeInRam (code: CompiledCode, memoryOffset: u16=0 as u16) {
        console.log('Loaded code size in RAM:', code.size)

        for (const [addr, value] of code.entries()) {
            this.write(U16(memoryOffset + addr), value);
        }
    }
}


