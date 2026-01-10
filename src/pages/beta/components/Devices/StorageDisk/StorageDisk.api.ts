
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";
import { StorageFileSystem } from "./StorageFileSystem.api";

import type { CompiledCode, IoDeviceType, u16, u8 } from "@/types/cpu.types";


export class StorageDisk extends EventEmitter {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;
    public storage: Map<u16, u8> = new Map;
    private fs: StorageFileSystem;


    constructor(name: string, ioPort: u8 | null = null) {
        //console.log(`Initializing StorageDisk`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.type = 'DiskStorage';
        this.fs = new StorageFileSystem(this);
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port
    }


    formatDisk() {
        this.fs.initializeFileSystem(true);

        this.emit('state', { storage: this.storage })
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

