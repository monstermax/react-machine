
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";
import { StorageFileSystem } from "./StorageFileSystem";

import type { CompiledCode, u16, u8 } from "@/types/cpu.types";


export class StorageDisk extends EventEmitter {
    public id: number;
    public name: string;
    public storage: Map<u16, u8> = new Map;
    private fs: StorageFileSystem;

    constructor(name: string) {
        //console.log(`Initializing StorageDisk`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.fs = new StorageFileSystem(this);
    }


    loadRawData = async (data: CompiledCode) => {
        this.storage = new Map(data);

        this.emit('state', { storage: this.storage })
    }


    read(port: u8): u8 {
        return U8(0)
    }


    write(port: u8, value: u8): void {

    }

}

