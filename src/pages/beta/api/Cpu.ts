
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";
import { Opcode } from "@/lib/instructions";
import { initialRegisters } from "./api";

import type { MemoryBus } from "./MemoryBus";
import type { Register, Register16, u16, u8 } from "@/types/cpu.types";


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
        this.halted = false;
        this.clockCycle = 0;
        this.registers = new Map(initialRegisters);
        //this.paused = true;
        this.interruptsEnabled = false;
        this.inInterruptHandler = false;
        this.currentBreakpoint = null;
        //this.uiFrequency = 1;
        //this.lastUiSync = null;

        // Update UI State
        this.emit('state', {
            halted: this.halted,
            clockCycle: this.clockCycle,
            registers: this.registers,
            interruptsEnabled: this.interruptsEnabled,
            inInterruptHandler: this.inInterruptHandler,
            currentBreakpoint: this.currentBreakpoint,
        })
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

