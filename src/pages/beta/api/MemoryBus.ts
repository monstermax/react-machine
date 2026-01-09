
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";
import { isIO, isROM, memoryToIOPort } from "@/lib/memory_map";

import type { Rom } from "./Rom";
import type { Ram } from "./Ram";
import type { IO } from "./IO";
import type { u16, u8 } from "@/types/cpu.types";


export class MemoryBus extends EventEmitter {
    public id: number;
    public rom: Rom | null = null;
    public ram: Ram | null = null;
    public io: IO | null = null;

    constructor() {
        console.log(`Initializing MemoryBus`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        //this.rom = new ROM;
        //this.ram = new RAM;
        //this.io = new IO;
    }


    readMemory(address: u16): u8 {
        // ROM read
        if (this.rom && isROM(address)) {
            const value = this.rom.read(address);
            //console.log(`Read Memory (ROM) @address ${toHex(address)} = ${toHex(value)}`)
            return value;
        }

        // I/O read - déléguer au gestionnaire I/O
        if (this.io && isIO(address)) {
            const value = this.io.read(memoryToIOPort(address));
            //console.log(`Read Memory (IO) @address ${toHex(address)} = ${toHex(value)}`)
            return value;
        }

        // RAM read
        if (this.ram) {
            const value = this.ram.read(address);
            //console.log(`Read Memory (RAM) @address ${toHex(address)} = ${toHex(value)}`)
            return value;
        }

        return U8(0)
    }


    writeMemory(address: u16, value: u8): void {

    }

}

