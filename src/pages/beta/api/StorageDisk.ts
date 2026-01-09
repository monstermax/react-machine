
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";
import { StorageFileSystem } from "./StorageFileSystem";

import type { u16, u8 } from "@/types/cpu.types";


export class StorageDisk extends EventEmitter {
    public id: number;
    public name: string;
    private storage: Map<u16, u8>;
    private fs: StorageFileSystem;

    constructor(name: string) {
        console.log(`Initializing StorageDisk`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.storage = new Map;
        this.fs = new StorageFileSystem(this);
    }


    read(address: u16): u8 {
        return U8(0)
    }


    write(address: u16, value: u8): void {

    }

}

