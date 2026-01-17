
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";

import type { CompiledCode, u16, u8 } from "@/types/cpu.types";
import type { MemoryBus } from "./MemoryBus.api";


export class Rom extends EventEmitter {
    public id: number;
    public storage: Map<u16, u8> = new Map;
    public memoryBus: MemoryBus;
    private maxSize: number;


    constructor(memoryBus: MemoryBus, data?: Array<[u16, u8]> | Map<u16, u8>, maxSize=0xFFFF) {
        //console.log(`Initializing ROM`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.memoryBus = memoryBus;
        this.maxSize = maxSize;

        if (data) {
            this.loadRawData(new Map(data));
        }

        this.emit('state', { maxSize })
    }


    loadRawData = async (data: CompiledCode) => {
        this.storage = new Map(data);

        if (this.storage.size > this.maxSize) {
            console.warn(`ROM overloaded`);
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


    read(address: u16): u8 {
        return this.storage.get(address) || U8(0);
    }


    write(address: u16, value: u8): void {
        throw new Error(`Cannot write ROM`);
    }

}

