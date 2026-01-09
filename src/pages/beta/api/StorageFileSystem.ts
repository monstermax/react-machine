
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";

import type { StorageDisk } from "./StorageDisk";



export class StorageFileSystem extends EventEmitter {
    public id: number;
    private storageDisk: StorageDisk;

    constructor(storageDisk: StorageDisk) {
        console.log(`Initializing StorageFileSystem (${storageDisk.name})`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.storageDisk = storageDisk;
    }

}

