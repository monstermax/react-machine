
import { Opcode } from "../cpu_instructions";
import { Computer } from "./Computer";
import { MemoryBus } from "./Memory";


export class CpuRegisters {
    A: u8 = 0;
    B: u8 = 0;
    C: u8 = 0;
    D: u8 = 0;
    PC: u16 = 0;
    IR: u8 = 0;
    SP: u16 = 0;
    FLAGS: u8 = 0;
}


export class Cpu {
    private computer: Computer;
    public registers: CpuRegisters;
    public halted: boolean = false;
    public cycles: u64 = 0;
    public alu: ALU = new ALU;

    constructor(computer: Computer) {
        this.computer = computer;
        this.registers = new CpuRegisters;
    }


    public runCpuCycle(): void {
        if (this.halted) return;

        this.cycles++;
        this.fetchInstruction();
        this.executeInstruction(this.registers.IR);
    }


    private fetchInstruction(): void {
        console.log(`fetchInstruction`)
        const memoryBus = this.computer.memoryBus;
        let opcode: u8 = 0;

        if (memoryBus && memoryBus.read) {
            const address = this.registers.PC;
            opcode = memoryBus.read(address);
            console.log(`instruction: ${opcode.toString()}\0`)

        } else {
            console.warn(`MemoryBus not found`);
        }

        this.registers.IR = opcode;
    }


    public getCpuCycles(): u64 {
        return this.cycles;
    }


    public setFlags(zero: boolean, carry: boolean): void {
        this.registers.FLAGS = ((zero ? 0b10 : 0) | (carry ? 0b01 : 0))
    }


    public pushValue(value: u8): void {
        const memoryBus = this.computer.memoryBus;

        if (!memoryBus) throw new Error("Missing MemoryBus")

        // Écrire la valeur à [SP]
        memoryBus.write(this.registers.SP, value);

        // Décrémenter SP (pile descend)
        this.registers.SP = ((this.registers.SP - 1) & 0xFFFF) as u16;
    }


    public popValue(): u8 {
        const memoryBus = this.computer.memoryBus;

        if (!memoryBus) throw new Error("Missing MemoryBus")

        // Incrémenter SP d'abord (pile remonte)
        this.registers.SP = ((this.registers.SP + 1) & 0xFFFF) as u16;

        // Lire la valeur à [SP]
        const value = memoryBus.read(this.registers.SP);

        return value;
    }


    private executeInstruction(opcode: u8): void {
        console.log(`executeInstruction`)
        const memoryBus = this.computer.memoryBus;

        if (! memoryBus) {
            console.warn(`MemoryBus not found`);
            return;
        }

        const action = fetchInstructionAction(opcode);

        if (action) {
            action(this, memoryBus)
            return
        }

        throw new Error(`Instruction not found: ${opcode}`);
    }
}



function fetchInstructionAction(opcode: u8): ((cpu: Cpu, memoryBus: MemoryBus) => void) | null {
    let action: ((cpu: Cpu, memoryBus: MemoryBus) => void) | null = null;

    switch (opcode) {
        case <u8>Opcode.NOP: 
            action = (cpu: Cpu, memoryBus: MemoryBus) => {
                cpu.registers.PC++;
            };
            break;

        case <u8>Opcode.HALT: 
            action = (cpu: Cpu, memoryBus: MemoryBus) => {
                cpu.halted = true;
            };
            break;

        case <u8>Opcode.MOV_A_IMM: 
            action = (cpu: Cpu, memoryBus: MemoryBus) => {
                const immValue: u8 = memoryBus.read(cpu.registers.PC+1);
                cpu.registers.A = immValue;
                cpu.registers.PC += 2;
            };
            break;

        case <u8>Opcode.MOV_A_REG: 
            action = (cpu: Cpu, memoryBus: MemoryBus) => {
                const regIdx = memoryBus.read(cpu.registers.PC+1);
                let regValue: u8 = 0;
                if (regIdx === 1) regValue = cpu.registers.A;
                if (regIdx === 2) regValue = cpu.registers.B;
                if (regIdx === 3) regValue = cpu.registers.C;
                if (regIdx === 4) regValue = cpu.registers.D;
                cpu.registers.A = regValue;
                cpu.registers.PC += 2;
            };
            break;

        case <u8>Opcode.MOV_A_MEM: 
            action = (cpu: Cpu, memoryBus: MemoryBus) => {
                const memAddressLow: u8 = memoryBus.read(cpu.registers.PC+1);
                const memAddressHigh: u8 = memoryBus.read(cpu.registers.PC+2);
                const memAddress: u16 = memAddressLow | (memAddressHigh * <u16>256);
                const memValue = memoryBus.read(memAddress);
                //console.log(`MOV_A_MEM ${memAddress}`)
                cpu.registers.A = memValue;
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.MOV_MEM_A: 
            action = (cpu: Cpu, memoryBus: MemoryBus) => {
                const memAddressLow: u8 = memoryBus.read(cpu.registers.PC+1);
                const memAddressHigh: u8 = memoryBus.read(cpu.registers.PC+2);
                const memAddress: u16 = memAddressLow | (memAddressHigh * <u16>256);
                //console.log(`MOV_MEM_A ${memAddress}`)
                memoryBus.write(memAddress, cpu.registers.A);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.INC_A:
            action = (cpu: Cpu, memoryBus: MemoryBus) => {
                const aluResult = cpu.alu.inc(cpu.registers.A);
                cpu.registers.A = aluResult.result;
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.registers.PC += 1;
            };
            break;

        case <u8>Opcode.DEC_A:
            action = (cpu: Cpu, memoryBus: MemoryBus) => {
                const aluResult = cpu.alu.dec(cpu.registers.A);
                cpu.registers.A = aluResult.result;
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.registers.PC += 1;
            };
            break;

        case <u8>Opcode.NOT_A:
            action = (cpu: Cpu, memoryBus: MemoryBus) => {
                const aluResult: AluResult = cpu.alu.not(cpu.registers.A);
                cpu.registers.A = aluResult.result;
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.registers.PC += 1;
            };
            break;

        case <u8>Opcode.PUSH_A:
            action = (cpu: Cpu, memoryBus: MemoryBus) => {
                cpu.pushValue(cpu.registers.A)
                cpu.registers.PC += 1;
            };
            break;

        case <u8>Opcode.POP_A:
            action = (cpu: Cpu, memoryBus: MemoryBus) => {
                cpu.registers.A = cpu.popValue()
                cpu.registers.PC += 1;
            };
            break;

        case <u8>Opcode.ADD_A_IMM:
            action = (cpu: Cpu, memoryBus: MemoryBus) => {
                const immValue: u8 = memoryBus.read(cpu.registers.PC+1);
                const aluResult = cpu.alu.add(cpu.registers.A, immValue);
                cpu.registers.A = aluResult.result;
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.registers.PC += 2;
            };
            break;

        case <u8>Opcode.SUB_A_IMM:
            action = (cpu: Cpu, memoryBus: MemoryBus) => {
                const immValue: u8 = memoryBus.read(cpu.registers.PC+1);
                const aluResult = cpu.alu.sub(cpu.registers.A, immValue);
                cpu.registers.A = aluResult.result;
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.registers.PC += 2;
            };
            break;
    }

    return action;
}



class Flags {
    zero: boolean = false;
    carry: boolean = false;
}

class AluResult {
    result: u8 = 0;
    flags: Flags = { zero: false, carry: false };
}


// Arithmetic Logic Unit
class ALU {
    not(a: u8): AluResult {
        const result = ((~a) & 0xFF) as u8;
        const carry = (~a) > 0xFF;
        const zero = result === 0;
        const flags: Flags = ({ zero, carry });
        return { result, flags };
    }
    add(a: u8, b: u8): AluResult {
        const result = ((a + b) & 0xFF) as u8;
        const carry = (a + b) > 0xFF;
        const zero = result === 0;
        const flags: Flags = ({ zero, carry });
        return { result, flags };
    }

    sub(a: u8, b: u8): AluResult {
        const result = ((a - b) & 0xFF) as u8;
        const zero = result === 0;
        const carry = a < b; // Borrow
        const flags: Flags = ({ zero, carry });
        return { result, flags };
    }

    and(a: u8, b: u8): AluResult {
        const result = ((a & b) & 0xFF) as u8;
        const flags: Flags = ({ zero: result === 0, carry: false });
        return { result, flags };
    }

    or(a: u8, b: u8): AluResult {
        const result = ((a | b) & 0xFF) as u8;
        const flags: Flags = ({ zero: result === 0, carry: false });
        return { result, flags };
    }

    xor(a: u8, b: u8): AluResult {
        const result = ((a ^ b) & 0xFF) as u8;
        const flags: Flags = ({ zero: result === 0, carry: false });
        return { result, flags };
    }

    inc(value: u8): AluResult {
        const result = ((value + 1) & 0xFF) as u8;
        const flags: Flags = ({ zero: result === 0, carry: false });
        return { result, flags };
    }

    dec(value: u8): AluResult {
        const result = ((value - 1) & 0xFF) as u8;
        const flags: Flags = ({ zero: result === 0, carry: false });
        return { result, flags };
    }

    // Shift bits
    shl(value: u8, count: u8 = 1): AluResult {
        let result = value;
        let carry = false;

        for (let i = 0; i < count; i++) {
            carry = !!(result & 0x80);  // MSB -> carry
            result = ((result << 1) & 0xFF) as u8;
        }

        const zero = result === 0;
        return { result, flags: { zero, carry } };
    }

    shr(value: u8, count: u8 = 1): AluResult {
        let result = value;
        let carry = false;

        for (let i = 0; i < count; i++) {
            carry = !!(result & 0x01);  // LSB -> carry
            result = ((result >> 1) & 0xFF) as u8;
        }

        const zero = result === 0;
        return { result, flags: { zero, carry } };
    }

    // Rotation avec carry
    rol(value: u8, count: u8 = 1, carryIn: boolean = false): AluResult {
        let result = value;
        let carry = carryIn;

        for (let i = 0; i < count; i++) {
            const newCarry = !!(result & 0x80);
            result = ((result << 1) & 0xFF) as u8;
            if (carry) result = result | 0x01;
            carry = newCarry;
        }

        const zero = result === 0;
        return { result, flags: { zero, carry } };
    }

    ror(value: u8, count: u8 = 1, carryIn: boolean = false): AluResult {
        let result = value;
        let carry = carryIn;

        for (let i = 0; i < count; i++) {
            const newCarry = !!(result & 0x01);
            result = ((result >> 1) & 0xFF) as u8;
            if (carry) result = result | 0x80;
            carry = newCarry;
        }

        const zero = result === 0;
        return { result, flags: { zero, carry } };
    }

    // Test & Compare
    test(a: u8, b: u8): AluResult { // comme AND mais ne stocke pas le résultat
        const result = ((a & b) & 0xFF) as u8;
        const flags = ({ zero: result === 0, carry: false });
        return { result: 0, flags };
    }

    cmp(a: u8, b: u8): AluResult {
        // Compare a et b: a - b (sans stocker le résultat)
        const result = ((a - b) & 0xFF) as u8;
        const zero = result === 0;
        const carry = a < b; // Borrow
        const flags = ({ zero, carry });
        return { result: 0, flags };
    }
}

