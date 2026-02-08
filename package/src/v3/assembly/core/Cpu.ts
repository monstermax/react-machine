
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
                const immValue = memoryBus.read(cpu.registers.PC+1);
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
                const memAddressLow = memoryBus.read(cpu.registers.PC+1);
                const memAddressHigh = memoryBus.read(cpu.registers.PC+2);
                const memAddress = memAddressLow | (memAddressHigh * <u16>256);
                const memValue = memoryBus.read(memAddress);
                cpu.registers.A = memValue;
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.MOV_MEM_A: 
            action = (cpu: Cpu, memoryBus: MemoryBus) => {
                const memAddressLow = memoryBus.read(cpu.registers.PC+1);
                const memAddressHigh = memoryBus.read(cpu.registers.PC+2);
                const memAddress = memAddressLow | (memAddressHigh * <u16>256);
                memoryBus.write((memAddress), cpu.registers.A);
                cpu.registers.PC += 3;
            };
            break;
    }

    return action;
}

