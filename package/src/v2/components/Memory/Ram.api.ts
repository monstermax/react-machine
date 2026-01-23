
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/v2/lib/integers";

import type { CompiledCode, u16, u8 } from "@/types/cpu.types";
import { MEMORY_MAP } from "@/v2/lib/memory_map_16x8_bits";
import type { MemoryBus } from "./MemoryBus.api";


export class Ram extends EventEmitter {
    public id: number;
    public storage: Map<u16, u8> = new Map;
    public memoryBus: MemoryBus;
    private maxSize: number;


    constructor(memoryBus: MemoryBus, data?: Array<[u16, u8]> | Map<u16, u8>, maxSize=0xFFFF) {
        //console.log(`Initializing RAM`);
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
            console.warn(`RAM overloaded`);
            this.deleteOverload()
        }

        this.emit('state', { storage: this.storage })
    }


    deleteOverload() {
        const deleteCount = this.storage.size - this.maxSize;

        if (deleteCount > 0) {
            const keys = Array.from(this.storage.keys()).reverse().slice(0, deleteCount);

            for (const key of keys) {
                this.storage.delete(key)
            }
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

}


