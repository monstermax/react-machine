
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";
import { isIO, isROM, memoryToIOPort } from "@/lib/memory_map_16bit";
import { Rom } from "./Rom.api";
import { Ram } from "./Ram.api";
import { DevicesManager } from "../Devices/DevicesManager.api";

import type { u16, u8 } from "@/types/cpu.types";
import type { Motherboard } from "../Computer/Motherboard.api";


export class MemoryBus extends EventEmitter {
    public id: number;
    public rom: Rom | null = null;
    public ram: Ram | null = null;
    public io: DevicesManager | null = null;
    public motherboard: Motherboard;


    constructor(motherboard: Motherboard) {
        //console.log(`Initializing MemoryBus`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.motherboard = motherboard;
    }


    addRom(data?: Map<u16, u8> | [u16, u8][], maxSize?: number): Rom {
        const rom = new Rom(data, maxSize);

        if (!this.rom) {
            this.rom = rom;
            //console.log('ROM monté dans MemoryBus:', ramInstance);
        }

        return rom;
    }


    addRam(data?: Map<u16, u8> | [u16, u8][], maxSize?: number): Ram {
        const ram = new Ram(data, maxSize);

        if (!this.ram) {
            this.ram = ram;
            //console.log('RAM monté dans MemoryBus:', romInstance);
        }

        return ram;
    }


    connectDevicesManager(devicesManager: DevicesManager): void {
        if (!this.io && devicesManager) {
            this.io = devicesManager;
            //console.log('DevicesManager monté dans MemoryBus:', ramInstance);
        }
    }


    readMemory(address: u16): u8 {
        // ROM read
        if (isROM(address)) {
            if (this.rom) {
                const value = this.rom.read(address);
                //console.log(`Read Memory (ROM) @address ${toHex(address)} = ${toHex(value)}`)
                return value;
            }

            console.warn(`No ROM detected`);
            return 0 as u8
        }

        // I/O read - déléguer au gestionnaire I/O
        if (isIO(address)) {
            if (this.io) {
                const value = this.io.read(memoryToIOPort(address));
                //console.log(`Read Memory (IO) @address ${toHex(address)} = ${toHex(value)}`)
                return value;
            }

            console.warn(`No IO detected`);
            return 0 as u8
        }

        // RAM read
        if (this.ram) {
            const value = this.ram.read(address);
            //console.log(`Read Memory (RAM) @address ${toHex(address)} = ${toHex(value)}`)
            return value;
        }

        console.warn(`No RAM detected`);
        return U8(0)
    }


    writeMemory(address: u16, value: u8): void {
        // ROM is read-only!
        if (isROM(address)) {
            console.warn(`Attempted write to ROM at 0x${address.toString(16)}`);
            return;
        }

        // I/O write - déléguer au gestionnaire I/O
        if (isIO(address)) {
            if (this.io) {
                //console.log(`Write Memory (IO) @address ${toHex(address)} = ${toHex(value)}`)
                this.io.write(memoryToIOPort(address), value);
                return;
            }

            console.warn(`No IO detected`);
            return
        }

        // RAM write
        if (this.ram) {
            //console.log(`Write Memory (RAM) @address ${toHex(address)} = ${toHex(value)}`)
            this.ram.write(address, value)
            return;
        }

        console.warn(`No RAM detected`);
    }

}

