
import { EventEmitter } from "eventemitter3";

import { U8 } from "@/lib/integers";

import type { Device, Register, Register16, u16, u8 } from "@/types/cpu.types";



export const initialRegisters = [
        ["A", 0 as u8],      // Register A
        ["B", 0 as u8],      // Register B
        ["C", 0 as u8],      // Register C
        ["D", 0 as u8],      // Register D
        ["PC", 0 as u16],    // Program Counter
        ["IR", 0 as u8],     // Instruction Register
        ["SP", 0 as u16],    // Stack Pointer
        ["FLAGS", 0 as u8],  // Bit 0: Carry, Bit 1: Zero
    ] as [string, u8 | u16][]
;


export class Computer {
    public id: number;
    public cpu: Cpu | null = null;
    public memoryBus: MemoryBus | null = null;
    private loadedOs: string | null = null;
    private loadedProgram: string | null = null;

    constructor() {
        console.log(`Initializing Computer`);

        this.id = Math.round(Math.random() * 999_999_999);
        //this.cpu = new Cpu;
        //this.memoryBus = new MemoryBus;
        //this.loadedOs = null;
        //this.loadedProgram = null;
    }

}


export class Cpu extends EventEmitter {
    public id: number;
    public registers: Map<string, u8 | u16>;
    public clockFrequency: number;
    public uiFrequency: number;
    public breakpoints: Set<number>;
    public halted: boolean;
    public paused: boolean;
    public clockCycle: number;
    private currentBreakpoint: number | null;
    private lastUiSync: number | null;
    private interruptsEnabled: boolean;
    private inInterruptHandler: boolean;

    constructor() {
        super();

        console.log(`Initializing Cpu`);

        this.id = Math.round(Math.random() * 999_999_999);
        this.registers = new Map(initialRegisters);
        this.clockFrequency = 1;
        this.uiFrequency = 1;
        this.breakpoints = new Set;
        this.currentBreakpoint = null;
        this.halted = false;
        this.paused = true;
        this.clockCycle = 0;
        this.lastUiSync = null;
        this.interruptsEnabled = false;
        this.inInterruptHandler = false;
    }


    getRegister<T extends Register>(reg: T): T extends Register16 ? u16 : u8 {
        const value = this.registers.get(reg) ?? 0;

        if (reg === "PC" || reg === "SP") {
            return value as T extends Register16 ? u16 : u8;
        } else {
            return value as T extends Register16 ? u16 : u8;
        }
    }


    getFlag(flag: 'zero' | 'carry'): boolean {
        const flags = this.getRegister("FLAGS");
        return flag === 'zero' ? !!(flags & 0b10) : !!(flags & 0b01);
    }


    executeCycle() {
        this.clockCycle++
        this.emit('update: clockCycle', this.clockCycle)
        console.log('CPU executeCycle', this.clockCycle)
    }

}


export class MemoryBus {
    public id: number;
    public rom: ROM | null = null;
    public ram: RAM | null = null;
    public io: IO | null = null;

    constructor() {
        console.log(`Initializing MemoryBus`);

        this.id = Math.round(Math.random() * 999_999_999);
        //this.rom = new ROM;
        //this.ram = new RAM;
        //this.io = new IO;
    }

}


export class ROM {
    public id: number;
    private storage: Map<u16, u8>;

    constructor() {
        console.log(`Initializing ROM`);

        this.id = Math.round(Math.random() * 999_999_999);
        this.storage = new Map;
    }

    read(address: u16): u8 {
        return U8(0)
    }

    write(address: u16, value: u8): void {

    }

}


export class RAM {
    public id: number;
    private storage: Map<u16, u8>;

    constructor() {
        console.log(`Initializing RAM`);

        this.id = Math.round(Math.random() * 999_999_999);
        this.storage = new Map;
    }

    read(address: u16): u8 {
        return U8(0)
    }

    write(address: u16, value: u8): void {

    }

}


export class IO {
    public id: number;
    private devices: Device[];

    constructor() {
        console.log(`Initializing IO`);

        this.id = Math.round(Math.random() * 999_999_999);
        this.devices = [];
    }

    read(address: u16): u8 {
        return U8(0)
    }

    write(address: u16, value: u8): void {

    }

}


export class StorageDisk {
    public id: number;
    public name: string;
    private storage: Map<u16, u8>;
    private fs: StorageFileSystem;

    constructor(name: string) {
        console.log(`Initializing StorageDisk`);

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


export class StorageFileSystem {
    public id: number;
    private storageDisk: StorageDisk;

    constructor(storageDisk: StorageDisk) {
        console.log(`Initializing StorageFileSystem (${storageDisk.name})`);

        this.id = Math.round(Math.random() * 999_999_999);
        this.storageDisk = storageDisk;
    }

}
