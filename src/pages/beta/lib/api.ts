
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";

import type { Device, Register, Register16, u16, u8 } from "@/types/cpu.types";
import { INSTRUCTIONS_WITH_OPERAND, INSTRUCTIONS_WITH_TWO_OPERANDS, Opcode } from "@/lib/instructions";
import { isIO, isROM, memoryToIOPort } from "@/lib/memory_map";



export const computerRef = {
    current: null as Computer | null
};

export const cpuRef = {
    current: null as Cpu | null
};

export const memoryBusRef = {
    current: null as MemoryBus | null
};



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


export class Computer extends EventEmitter {
    public id: number;
    public cpu: Cpu | null = null;
    public memoryBus: MemoryBus | null = null;
    private loadedOs: string | null = null;
    private loadedProgram: string | null = null;

    constructor() {
        console.log(`Initializing Computer`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        //this.cpu = new Cpu;
        //this.memoryBus = new MemoryBus;
        //this.loadedOs = null;
        //this.loadedProgram = null;
    }

}


// Arithmetic Logic Unit
const ALU = {
    add: (a: u8, b: u8): { result: u8, flags: { zero: boolean, carry: boolean } } => {
        const result = ((a + b) & 0xFF) as u8;
        const carry = (a + b) > 0xFF;
        const zero = result === 0;
        const flags = ({ zero, carry });
        return { result, flags };
    },

    sub: (a: u8, b: u8): { result: u8, flags: { zero: boolean, carry: boolean } } => {
        const result = ((a - b) & 0xFF) as u8;
        const zero = result === 0;
        const carry = a < b; // Borrow
        const flags = ({ zero, carry });
        return { result, flags };
    },

    and: (a: u8, b: u8): { result: u8, flags: { zero: boolean, carry: boolean } } => {
        const result = ((a & b) & 0xFF) as u8;
        const flags = ({ zero: result === 0, carry: false });
        return { result, flags };
    },

    or: (a: u8, b: u8): { result: u8, flags: { zero: boolean, carry: boolean } } => {
        const result = ((a | b) & 0xFF) as u8;
        const flags = ({ zero: result === 0, carry: false });
        return { result, flags };
    },

    xor: (a: u8, b: u8): { result: u8, flags: { zero: boolean, carry: boolean } } => {
        const result = ((a ^ b) & 0xFF) as u8;
        const flags = ({ zero: result === 0, carry: false });
        return { result, flags };
    },

    inc: (value: u8): { result: u8, flags: { zero: boolean, carry: boolean } } => {
        const result = ((value + 1) & 0xFF) as u8;
        const flags = ({ zero: result === 0, carry: false });
        return { result, flags };
    },

    dec: (value: u8): { result: u8, flags: { zero: boolean, carry: boolean } } => {
        const result = ((value - 1) & 0xFF) as u8;
        const flags = ({ zero: result === 0, carry: false });
        return { result, flags };
    },
}


export class Cpu extends EventEmitter {
    public id: number;
    public memoryBus: MemoryBus | null = null;
    public registers: Map<string, u8 | u16> = new Map;
    public clockFrequency: number = 1;
    //public uiFrequency: number;
    public breakpoints: Set<number> = new Set;
    public halted: boolean = false;
    public paused: boolean = true;
    public clockCycle: number = 0;
    private currentBreakpoint: number | null = null;
    //private lastUiSync: number | null;
    private interruptsEnabled: boolean = false;
    private inInterruptHandler: boolean = false;


    constructor() {
        console.log(`Initializing Cpu`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.reset()
    }


    getRegister<T extends Register>(reg: T): T extends Register16 ? u16 : u8 {
        const value = this.registers.get(reg) ?? 0;

        if (reg === "PC" || reg === "SP") {
            return value as T extends Register16 ? u16 : u8;
        } else {
            return value as T extends Register16 ? u16 : u8;
        }
    }


    setRegister(reg: Register, value: u8 | u16): void {
        // PC et SP sont 16-bit, les autres 8-bit
        if (reg === "PC" || reg === "SP") {
            this.registers.set(reg, (value & 0xFFFF) as u16); // 16-bit

        } else {
            this.registers.set(reg, (value & 0xFF) as u8);   // 8-bit
        }

        // Update UI State
        this.emit('state', {
            registers: this.registers,
        })
    }


    getFlag(flag: 'zero' | 'carry'): boolean {
        const flags = this.getRegister("FLAGS");
        return flag === 'zero' ? !!(flags & 0b10) : !!(flags & 0b01);
    }


    setFlags(zero: boolean, carry: boolean): void {
        this.setRegister('FLAGS', ((zero ? 0b10 : 0) | (carry ? 0b01 : 0)) as u8)
    }


    executeCycle() {
        if (!this.memoryBus) return;

        this.clockCycle++
        console.log('CPU executeCycle', this.clockCycle)

        // 1. Fetch
        const pc = this.getRegister("PC");

        const instruction = this.memoryBus.readMemory(pc);
        this.setRegister("IR", instruction);

        // 2. Decode
        const opcode = this.getRegister("IR");

        // 3. Execute
        this.executeOpcode(pc, opcode);

        // 4. Memory

        // 5. Write-back

        // Update UI State
        this.emit('state', {
            clockCycle: this.clockCycle,
            //registers: this.registers,
        })
    }


    executeOpcode(pc: u16, instruction: u8) {
        switch (instruction) {
            // ===== SYSTEM =====
            case Opcode.NOP:
                this.setRegister("PC", (pc + 1) as u16);
                break;

            // ===== ALU INSTRUCTIONS =====
            case Opcode.ADD:
                const a = this.getRegister("A");
                const b = this.getRegister("B");
                const { result, flags } = ALU.add(a, b);
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;

            // ===== JUMP INSTRUCTIONS =====
            case Opcode.JMP:
                this.setRegister("PC", this.readMem16(pc));
                break;

            // ===== PUSH =====

            // ===== POP =====

            // ===== STACK =====

            // ===== INTERRUPTS =====

            // ===== MOV register-register =====

            // ===== MOV register-immediate =====

            // ===== MOV memory-register =====

            // ===== MOV register-memory =====

            default:
                this.setRegister("PC", (pc + 1) as u16);

                console.error(`Unknown opcode at 0x${pc.toString(16)}: 0x${instruction.toString(16)}`);
                this.halted = true;
                this.emit('state', { halted: this.halted });
                break;
        }

    }


    readMem8(pc: u16): u8 {
        if (!this.memoryBus) return U8(0);
        const value = this.memoryBus.readMemory((pc + 1) as u16);
        return value;
    }


    readMem16(pc: u16): u16 {
        if (!this.memoryBus) return U16(0);

        const low = this.memoryBus.readMemory((pc + 1) as u16);
        const high = this.memoryBus.readMemory((pc + 2) as u16);
        const value = ((high << 8) | low) as u16;
        return value;
    }


    reset() {
        this.registers = new Map(initialRegisters);
        this.halted = false;
        //this.paused = true;
        this.clockCycle = 0;
        this.interruptsEnabled = false;
        this.inInterruptHandler = false;
        this.currentBreakpoint = null;
        //this.uiFrequency = 1;
        //this.lastUiSync = null;
    }

}


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


export class Rom extends EventEmitter {
    public id: number;
    public storage: Map<u16, u8>;

    constructor(data?: Array<[u16, u8]> | Map<u16, u8>) {
        console.log(`Initializing ROM`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.storage = new Map(data ?? []);
    }


    read(address: u16): u8 {
        return this.storage.get(address) || U8(0);
    }


    write(address: u16, value: u8): void {
        throw new Error(`Cannot write ROM`);
    }

}


export class Ram extends EventEmitter {
    public id: number;
    public storage: Map<u16, u8>;

    constructor(data?: Array<[u16, u8]> | Map<u16, u8>) {
        console.log(`Initializing RAM`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.storage = new Map(data ?? []);
    }


    read(address: u16): u8 {
        return this.storage.get(address) || U8(0);
    }


    write(address: u16, value: u8): void {
        this.storage.set(address, U8(value))
    }

}


export class IO extends EventEmitter {
    public id: number;
    private devices: Device[];

    constructor() {
        console.log(`Initializing IO`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.devices = [];
    }


    read(port: u8): u8 {
        return U8(0)
    }


    write(port: u8, value: u8): void {

    }

}


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

