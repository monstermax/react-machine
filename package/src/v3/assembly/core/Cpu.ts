
import { Opcode } from "./cpu_instructions";
import { Computer } from "./Computer";
import { toHex } from "../utils";


export class CpuRegisters {
    A: u8 = 0;
    B: u8 = 0;
    C: u8 = 0;
    D: u8 = 0;
    E: u8 = 0;
    F: u8 = 0;
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
        //console.log(`fetchInstruction`)
        let opcode: u8 = 0;

        const address = this.registers.PC;
        opcode = this.readMemory(address);
        //console.log(`instruction: ${opcode.toString()}`)

        console.log(`Executing instruction ${toHex(opcode)} (${opcode}) at address ${toHex(address)} (${address})`);

        this.registers.IR = opcode;
    }


    public getCpuCycles(): u64 {
        return this.cycles;
    }


    public getFlag(flag: string): boolean {
        // flag type: 'zero' | 'carry'
        return flag === 'zero'
            ? !!(this.registers.FLAGS & 0b10)
            : !!(this.registers.FLAGS & 0b01);
    }


    public setFlags(zero: boolean, carry: boolean): void {
        this.registers.FLAGS = ((zero ? 0b10 : 0) | (carry ? 0b01 : 0))
    }


    public readMem8(pc: u16): u8 {
        const memoryBus = this.computer.memoryBus;
        if (!memoryBus) throw new Error("Missing MemoryBus")

        const value = this.readMemory((pc + 1) as u16);
        return value;
    }


    public readMem16(pc: u16): u16 {
        const memoryBus = this.computer.memoryBus;
        if (!memoryBus) throw new Error("Missing MemoryBus")

        // little endian
        const low = this.readMemory((pc + 1) as u16);
        const high = this.readMemory((pc + 2) as u16);
        //const value = ((high << 8) | low) as u16;
        const value = ((high * 256) + low) as u16;
        return value;
    }


    public readMemory(address: u16): u8 {
        const memoryBus = this.computer.memoryBus;
        if (!memoryBus) throw new Error("Missing MemoryBus")

        const value = memoryBus.read(address)
        return value;
    }

    public writeMemory(address: u16, value: u8): void {
        const memoryBus = this.computer.memoryBus;
        if (!memoryBus) throw new Error("Missing MemoryBus")

        memoryBus.write(address, value)
    }


    public pushValue(value: u8): void {
        const memoryBus = this.computer.memoryBus;
        if (!memoryBus) throw new Error("Missing MemoryBus")

        // Écrire la valeur à [SP]
        this.writeMemory(this.registers.SP, value);

        // Décrémenter SP (pile descend)
        this.registers.SP = ((this.registers.SP - 1) & 0xFFFF) as u16;
    }


    public popValue(): u8 {
        const memoryBus = this.computer.memoryBus;
        if (!memoryBus) throw new Error("Missing MemoryBus")

        // Incrémenter SP d'abord (pile remonte)
        this.registers.SP = ((this.registers.SP + 1) & 0xFFFF) as u16;

        // Lire la valeur à [SP]
        const value = this.readMemory(this.registers.SP);

        return value;
    }


    public getRegisterValueByIdx(regIdx: u8): u8 {
        if (regIdx === 1) return this.registers.A;
        if (regIdx === 2) return this.registers.B;
        if (regIdx === 3) return this.registers.C;
        if (regIdx === 4) return this.registers.D;
        if (regIdx === 5) return this.registers.E;
        if (regIdx === 6) return this.registers.F;
        //if (regIdx === 11) return this.registers.SP; // TODO: u16

        throw new Error(`Register #${regIdx} not found`);
    }

    public setRegisterValueByIdx(regIdx: u8, value: u8): void {
        if (regIdx === 1) {
            this.registers.A = value;
            return;
        }
        if (regIdx === 2) {
            this.registers.B = value;
            return;
        }
        if (regIdx === 3) {
            this.registers.C = value;
            return;
        }
        if (regIdx === 4) {
            this.registers.D = value;
            return;
        }
        if (regIdx === 5) {
            this.registers.E = value;
            return;
        }
        if (regIdx === 6) {
            this.registers.F = value;
            return;
        }
        //if (regIdx === 11) {
        //    this.registers.SP = value; // TODO: u16
        //    return;
        //}

        throw new Error(`Register #${regIdx} not found`);
    }


    private executeInstruction(opcode: u8): void {
        //console.log(`executeInstruction`)
        const memoryBus = this.computer.memoryBus;

        if (!memoryBus) {
            console.warn(`MemoryBus not found`);
            return;
        }

        const action = fetchInstructionAction(opcode);

        if (action) {
            action(this)
            return
        }

        throw new Error(`Instruction not found: ${opcode}`);
    }
}



function fetchInstructionAction(opcode: u8): ((cpu: Cpu) => void) | null {
    let action: ((cpu: Cpu) => void) | null = null;

    switch (opcode) {
        case <u8>Opcode.NOP:
            action = (cpu: Cpu) => {
                cpu.registers.PC++;
            };
            break;

        case <u8>Opcode.HALT:
            action = (cpu: Cpu) => {
                cpu.halted = true;
                console.log(`CPU Halted`)
            };
            break;

        case <u8>Opcode.SET_SP:
            action = (cpu: Cpu) => {
                const imm16 = cpu.readMem16(cpu.registers.PC);
                cpu.registers.SP = imm16
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.CALL:
            action = (cpu: Cpu) => {
                // Adresse de retour = PC + 3 (opcode + 2 bytes d'adresse)
                const returnAddr = cpu.registers.PC + 3;

                // PUSH l'adresse de retour sur la pile (16 bits)

                // PUSH high byte
                cpu.writeMemory(cpu.registers.SP, ((returnAddr >> 8) & 0xFF) as u8);
                cpu.registers.SP--

                // PUSH low byte
                cpu.writeMemory(cpu.registers.SP, (returnAddr & 0xFF) as u8);
                cpu.registers.SP--

                // Lire l'adresse de destination
                const callAddr = cpu.readMem16(cpu.registers.PC);

                // Sauter
                cpu.registers.PC = callAddr;
            };
            break;

        case <u8>Opcode.RET:
            action = (cpu: Cpu) => {
                // POP low byte
                cpu.registers.SP++
                const low = cpu.readMemory(cpu.registers.SP);

                // POP high byte
                cpu.registers.SP++
                const high = cpu.readMemory(cpu.registers.SP);

                //const retAddr = ((high << 8) | low) as u16;
                const retAddr = ((high * 256) + low) as u16;

                // Sauter à l'adresse retour
                cpu.registers.PC = retAddr;
            };
            break;

        case <u8>Opcode.JMP:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                cpu.registers.PC = memAddress;
            };
            break;

        case <u8>Opcode.JC:
            action = (cpu: Cpu) => {
                if (cpu.getFlag('carry')) {
                    const memAddress = cpu.readMem16(cpu.registers.PC);
                    cpu.registers.PC = memAddress;

                } else {
                    cpu.registers.PC += 3;
                }
            };
            break;

        case <u8>Opcode.JNC:
            action = (cpu: Cpu) => {
                if (!cpu.getFlag('carry')) {
                    const memAddress = cpu.readMem16(cpu.registers.PC);
                    cpu.registers.PC = memAddress;

                } else {
                    cpu.registers.PC += 3;
                }
            };
            break;

        case <u8>Opcode.JZ:
            action = (cpu: Cpu) => {
                if (cpu.getFlag('zero')) {
                    const memAddress = cpu.readMem16(cpu.registers.PC);
                    cpu.registers.PC = memAddress;

                } else {
                    cpu.registers.PC += 3;
                }
            };
            break;

        case <u8>Opcode.JNZ:
            action = (cpu: Cpu) => {
                if (!cpu.getFlag('zero')) {
                    const memAddress = cpu.readMem16(cpu.registers.PC);
                    cpu.registers.PC = memAddress;

                } else {
                    cpu.registers.PC += 3;
                }
            };
            break;

        case <u8>Opcode.JL:
            action = (cpu: Cpu) => {
                if (!cpu.getFlag('zero') && cpu.getFlag('carry')) {
                    const memAddress = cpu.readMem16(cpu.registers.PC);
                    cpu.registers.PC = memAddress;

                } else {
                    cpu.registers.PC += 3;
                }
            };
            break;

        case <u8>Opcode.JLE:
            action = (cpu: Cpu) => {
                if (cpu.getFlag('zero') || cpu.getFlag('carry')) {
                    const memAddress = cpu.readMem16(cpu.registers.PC);
                    cpu.registers.PC = memAddress;

                } else {
                    cpu.registers.PC += 3;
                }
            };
            break;

        case <u8>Opcode.JG:
            action = (cpu: Cpu) => {
                if (!cpu.getFlag('zero') && !cpu.getFlag('carry')) {
                    const memAddress = cpu.readMem16(cpu.registers.PC);
                    cpu.registers.PC = memAddress;

                } else {
                    cpu.registers.PC += 3;
                }
            };
            break;

        case <u8>Opcode.JGE:
            action = (cpu: Cpu) => {
                if (cpu.getFlag('zero') || !cpu.getFlag('carry')) {
                    const memAddress = cpu.readMem16(cpu.registers.PC);
                    cpu.registers.PC = memAddress;

                } else {
                    cpu.registers.PC += 3;
                }
            };
            break;

        case <u8>Opcode.MOV_MEM_IMM:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const immValue: u8 = cpu.readMem8(cpu.registers.PC + 2);
                cpu.writeMemory(memAddress, immValue);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.MOV_REG_IMM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const immValue: u8 = cpu.readMem8(cpu.registers.PC + 1);
                cpu.setRegisterValueByIdx(regIdx, immValue);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.MOV_REG_REG:
            action = (cpu: Cpu) => {
                const targetRegIdx = cpu.readMem8(cpu.registers.PC);
                const sourceRegIdx = cpu.readMem8(cpu.registers.PC + 1);
                const sourceRegValue: u8 = cpu.getRegisterValueByIdx(sourceRegIdx);
                cpu.setRegisterValueByIdx(targetRegIdx, sourceRegValue);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.MOV_REG_MEM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const memAddress = cpu.readMem16(cpu.registers.PC + 1);
                const memValue = cpu.readMemory(memAddress);
                cpu.setRegisterValueByIdx(regIdx, memValue);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.MOV_MEM_REG:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const regIdx = cpu.readMem8(cpu.registers.PC + 2);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                cpu.writeMemory(memAddress, regValue);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.PUSH_REG:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                cpu.pushValue(regValue)
                cpu.registers.PC += 2;
            };
            break;

        case <u8>Opcode.POP_REG:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const popValue = cpu.popValue()
                cpu.setRegisterValueByIdx(regIdx, popValue);
                cpu.registers.PC += 2;
            };
            break;

        case <u8>Opcode.INC_REG:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const aluResult = cpu.alu.inc(regValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(regIdx, aluResult.result);
                cpu.registers.PC += 2;
            };
            break;

        case <u8>Opcode.INC_MEM:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const memValue = cpu.readMemory(memAddress);
                const aluResult = cpu.alu.inc(memValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.writeMemory(memAddress, aluResult.result);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.DEC_REG:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const aluResult = cpu.alu.dec(regValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(regIdx, aluResult.result);
                cpu.registers.PC += 2;
            };
            break;

        case <u8>Opcode.DEC_MEM:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const memValue = cpu.readMemory(memAddress);
                const aluResult = cpu.alu.dec(memValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.writeMemory(memAddress, aluResult.result);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.NOT_REG:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const aluResult: AluResult = cpu.alu.not(regValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(regIdx, aluResult.result);
                cpu.registers.PC += 2;
            };
            break;

        case <u8>Opcode.NOT_MEM:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const memValue = cpu.readMemory(memAddress);
                const aluResult = cpu.alu.not(memValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.writeMemory(memAddress, aluResult.result);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.ADD_REG_IMM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const immValue: u8 = cpu.readMem8(cpu.registers.PC + 1);
                const aluResult = cpu.alu.add(regValue, immValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(regIdx, aluResult.result);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.ADD_REG_REG:
            action = (cpu: Cpu) => {
                const targetRegIdx = cpu.readMem8(cpu.registers.PC);
                const targetRegValue: u8 = cpu.getRegisterValueByIdx(targetRegIdx);
                const sourceRegIdx = cpu.readMem8(cpu.registers.PC + 1);
                const sourceRegValue: u8 = cpu.getRegisterValueByIdx(sourceRegIdx);
                const aluResult = cpu.alu.add(targetRegValue, sourceRegValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(targetRegIdx, aluResult.result);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.ADD_REG_MEM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const memAddress = cpu.readMem16(cpu.registers.PC + 1);
                const memValue = cpu.readMemory(memAddress);
                const aluResult = cpu.alu.add(regValue, memValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(regIdx, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.ADD_MEM_IMM:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const memValue = cpu.readMemory(memAddress);
                const immValue: u8 = cpu.readMem8(cpu.registers.PC + 1);
                const aluResult = cpu.alu.add(memValue, immValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.writeMemory(memAddress, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.ADD_MEM_REG:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const memValue = cpu.readMemory(memAddress);
                const regIdx = cpu.readMem8(cpu.registers.PC + 1);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const aluResult = cpu.alu.add(memValue, regValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.writeMemory(memAddress, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.SUB_REG_IMM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const immValue: u8 = cpu.readMem8(cpu.registers.PC + 1);
                const aluResult = cpu.alu.sub(regValue, immValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(regIdx, aluResult.result);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.SUB_REG_REG:
            action = (cpu: Cpu) => {
                const targetRegIdx = cpu.readMem8(cpu.registers.PC);
                const targetRegValue: u8 = cpu.getRegisterValueByIdx(targetRegIdx);
                const sourceRegIdx = cpu.readMem8(cpu.registers.PC + 1);
                const sourceRegValue: u8 = cpu.getRegisterValueByIdx(sourceRegIdx);
                const aluResult = cpu.alu.sub(targetRegValue, sourceRegValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(targetRegIdx, aluResult.result);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.SUB_REG_MEM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const memAddress = cpu.readMem16(cpu.registers.PC + 1);
                const memValue = cpu.readMemory(memAddress);
                const aluResult = cpu.alu.sub(regValue, memValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(regIdx, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.SUB_MEM_IMM:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const memValue = cpu.readMemory(memAddress);
                const immValue: u8 = cpu.readMem8(cpu.registers.PC + 1);
                const aluResult = cpu.alu.sub(memValue, immValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.writeMemory(memAddress, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.SUB_MEM_REG:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const memValue = cpu.readMemory(memAddress);
                const regIdx = cpu.readMem8(cpu.registers.PC + 1);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const aluResult = cpu.alu.sub(memValue, regValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.writeMemory(memAddress, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.AND_REG_IMM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const immValue: u8 = cpu.readMem8(cpu.registers.PC + 1);
                const aluResult = cpu.alu.and(regValue, immValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(regIdx, aluResult.result);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.AND_REG_REG:
            action = (cpu: Cpu) => {
                const targetRegIdx = cpu.readMem8(cpu.registers.PC);
                const targetRegValue: u8 = cpu.getRegisterValueByIdx(targetRegIdx);
                const sourceRegIdx = cpu.readMem8(cpu.registers.PC + 1);
                const sourceRegValue: u8 = cpu.getRegisterValueByIdx(sourceRegIdx);
                const aluResult = cpu.alu.and(targetRegValue, sourceRegValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(targetRegIdx, aluResult.result);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.AND_REG_MEM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const memAddress = cpu.readMem16(cpu.registers.PC + 1);
                const memValue = cpu.readMemory(memAddress);
                const aluResult = cpu.alu.and(regValue, memValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(regIdx, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.AND_MEM_IMM:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const memValue = cpu.readMemory(memAddress);
                const immValue: u8 = cpu.readMem8(cpu.registers.PC + 1);
                const aluResult = cpu.alu.and(memValue, immValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.writeMemory(memAddress, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.AND_MEM_REG:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const memValue = cpu.readMemory(memAddress);
                const regIdx = cpu.readMem8(cpu.registers.PC + 1);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const aluResult = cpu.alu.and(memValue, regValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.writeMemory(memAddress, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.OR_REG_IMM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const immValue: u8 = cpu.readMem8(cpu.registers.PC + 1);
                const aluResult = cpu.alu.or(regValue, immValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(regIdx, aluResult.result);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.OR_REG_REG:
            action = (cpu: Cpu) => {
                const targetRegIdx = cpu.readMem8(cpu.registers.PC);
                const targetRegValue: u8 = cpu.getRegisterValueByIdx(targetRegIdx);
                const sourceRegIdx = cpu.readMem8(cpu.registers.PC + 1);
                const sourceRegValue: u8 = cpu.getRegisterValueByIdx(sourceRegIdx);
                const aluResult = cpu.alu.or(targetRegValue, sourceRegValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(targetRegIdx, aluResult.result);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.OR_REG_MEM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const memAddress = cpu.readMem16(cpu.registers.PC + 1);
                const memValue = cpu.readMemory(memAddress);
                const aluResult = cpu.alu.or(regValue, memValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(regIdx, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.OR_MEM_IMM:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const memValue = cpu.readMemory(memAddress);
                const immValue: u8 = cpu.readMem8(cpu.registers.PC + 1);
                const aluResult = cpu.alu.or(memValue, immValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.writeMemory(memAddress, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.OR_MEM_REG:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const memValue = cpu.readMemory(memAddress);
                const regIdx = cpu.readMem8(cpu.registers.PC + 1);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const aluResult = cpu.alu.or(memValue, regValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.writeMemory(memAddress, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.XOR_REG_IMM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const immValue: u8 = cpu.readMem8(cpu.registers.PC + 1);
                const aluResult = cpu.alu.xor(regValue, immValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(regIdx, aluResult.result);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.XOR_REG_REG:
            action = (cpu: Cpu) => {
                const targetRegIdx = cpu.readMem8(cpu.registers.PC);
                const targetRegValue: u8 = cpu.getRegisterValueByIdx(targetRegIdx);
                const sourceRegIdx = cpu.readMem8(cpu.registers.PC + 1);
                const sourceRegValue: u8 = cpu.getRegisterValueByIdx(sourceRegIdx);
                const aluResult = cpu.alu.xor(targetRegValue, sourceRegValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(targetRegIdx, aluResult.result);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.XOR_REG_MEM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const memAddress = cpu.readMem16(cpu.registers.PC + 1);
                const memValue = cpu.readMemory(memAddress);
                const aluResult = cpu.alu.xor(regValue, memValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.setRegisterValueByIdx(regIdx, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.XOR_MEM_IMM:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const memValue = cpu.readMemory(memAddress);
                const immValue: u8 = cpu.readMem8(cpu.registers.PC + 1);
                const aluResult = cpu.alu.xor(memValue, immValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.writeMemory(memAddress, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.XOR_MEM_REG:
            action = (cpu: Cpu) => {
                const memAddress = cpu.readMem16(cpu.registers.PC);
                const memValue = cpu.readMemory(memAddress);
                const regIdx = cpu.readMem8(cpu.registers.PC + 1);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const aluResult = cpu.alu.xor(memValue, regValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.writeMemory(memAddress, aluResult.result);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.CMP_REG_IMM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const immValue: u8 = cpu.readMem8(cpu.registers.PC + 1);
                const aluResult = cpu.alu.cmp(regValue, immValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.CMP_REG_REG:
            action = (cpu: Cpu) => {
                const reg1Idx = cpu.readMem8(cpu.registers.PC);
                const reg1Value: u8 = cpu.getRegisterValueByIdx(reg1Idx);
                const reg2Idx = cpu.readMem8(cpu.registers.PC + 1);
                const reg2Value: u8 = cpu.getRegisterValueByIdx(reg2Idx);
                const aluResult = cpu.alu.cmp(reg1Value, reg2Value);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.CMP_REG_MEM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const memAddress = cpu.readMem16(cpu.registers.PC + 1);
                const memValue = cpu.readMemory(memAddress);
                const aluResult = cpu.alu.cmp(regValue, memValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.registers.PC += 4;
            };
            break;

        case <u8>Opcode.TEST_REG_IMM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const immValue: u8 = cpu.readMem8(cpu.registers.PC + 1);
                const aluResult = cpu.alu.test(regValue, immValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.TEST_REG_REG:
            action = (cpu: Cpu) => {
                const reg1Idx = cpu.readMem8(cpu.registers.PC);
                const reg1Value: u8 = cpu.getRegisterValueByIdx(reg1Idx);
                const reg2Idx = cpu.readMem8(cpu.registers.PC + 1);
                const reg2Value: u8 = cpu.getRegisterValueByIdx(reg2Idx);
                const aluResult = cpu.alu.test(reg1Value, reg2Value);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.registers.PC += 3;
            };
            break;

        case <u8>Opcode.TEST_REG_MEM:
            action = (cpu: Cpu) => {
                const regIdx = cpu.readMem8(cpu.registers.PC);
                const regValue: u8 = cpu.getRegisterValueByIdx(regIdx);
                const memAddress = cpu.readMem16(cpu.registers.PC + 1);
                const memValue = cpu.readMemory(memAddress);
                const aluResult = cpu.alu.test(regValue, memValue);
                cpu.setFlags(aluResult.flags.zero, aluResult.flags.carry);
                cpu.registers.PC += 4;
            };
            break;


        // LEA_REG_REG_IMM: (regLow, regHigh) = imm16
        // Encoding: [opcode] [regLow] [regHigh] [imm16_low] [imm16_high]
        case <u8>Opcode.LEA_REG_REG_IMM:
            action = (cpu: Cpu) => {
                const regLowIdx = cpu.readMem8(cpu.registers.PC);
                const regHighIdx = cpu.readMem8(cpu.registers.PC + 1);
                const imm16 = cpu.readMem16(cpu.registers.PC + 2);
                cpu.setRegisterValueByIdx(regHighIdx, ((imm16 >> 8) & 0xFF) as u8);
                cpu.setRegisterValueByIdx(regLowIdx, (imm16 & 0xFF) as u8);
                cpu.registers.PC += 5;
            };
            break;

        // LEA_REG_REG_MEM: (regLow, regHigh) = mem16[addr] // Reads 2 bytes from memory (little-endian) into register pair
        // Encoding: [opcode] [regLow] [regHigh] [addr_low] [addr_high]
        case <u8>Opcode.LEA_REG_REG_MEM:
            action = (cpu: Cpu) => {
                const regLowIdx = cpu.readMem8(cpu.registers.PC);
                const regHighIdx = cpu.readMem8(cpu.registers.PC + 1);
                const memAddress = cpu.readMem16(cpu.registers.PC + 2);
                const low = cpu.readMemory(memAddress);
                const high = cpu.readMemory((memAddress + 1) as u16);
                cpu.setRegisterValueByIdx(regHighIdx, high);
                cpu.setRegisterValueByIdx(regLowIdx, low);
                cpu.registers.PC += 5;
            };
            break;

        // LDI_REG_REG_REG: destReg = memory[regLow:regHigh] // Load indirect: read value at address formed by register pair
        // Encoding: [opcode] [destReg] [regLow] [regHigh]
        case <u8>Opcode.LDI_REG_REG_REG:
            action = (cpu: Cpu) => {
                const destRegIdx = cpu.readMem8(cpu.registers.PC);
                const regLowIdx = cpu.readMem8(cpu.registers.PC + 1);
                const regHighIdx = cpu.readMem8(cpu.registers.PC + 2);
                const high: u16 = cpu.getRegisterValueByIdx(regHighIdx) as u16;
                const low: u16 = cpu.getRegisterValueByIdx(regLowIdx) as u16;
                const address: u16 = ((high * 256) + low) as u16;
                const value = cpu.readMemory(address);
                cpu.setRegisterValueByIdx(destRegIdx, value);
                cpu.registers.PC += 4;
            };
            break;

        // STI_REG_REG_REG: memory[regLow:regHigh] = srcReg // Store indirect: write value to address formed by register pair
        // Encoding: [opcode] [regLow] [regHigh] [srcReg]
        case <u8>Opcode.STI_REG_REG_REG:
            action = (cpu: Cpu) => {
                const regLowIdx = cpu.readMem8(cpu.registers.PC);
                const regHighIdx = cpu.readMem8(cpu.registers.PC + 1);
                const srcRegIdx = cpu.readMem8(cpu.registers.PC + 2);
                const high: u16 = cpu.getRegisterValueByIdx(regHighIdx) as u16;
                const low: u16 = cpu.getRegisterValueByIdx(regLowIdx) as u16;
                const address: u16 = ((high * 256) + low) as u16;
                const value = cpu.getRegisterValueByIdx(srcRegIdx);
                cpu.writeMemory(address, value);
                cpu.registers.PC += 4;
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

    // Test & Compare
    test(a: u8, b: u8): AluResult { // comme AND mais ne stocke pas le résultat
        const result = ((a & b) & 0xFF) as u8;
        const flags: Flags = ({ zero: result === 0, carry: false });
        return { result: 0, flags };
    }

    cmp(a: u8, b: u8): AluResult {
        // Compare a et b: a - b (sans stocker le résultat)
        const result = ((a - b) & 0xFF) as u8;
        const zero = result === 0;
        const carry = a < b; // Borrow
        const flags: Flags = ({ zero, carry });
        return { result: 0, flags };
    }

    // ROL - Rotate Left (sans utiliser le carry comme entrée)
    rol(value: u8, count: u8 = 1): AluResult {  // Pas de paramètre carryIn!
        let result = value;
        let carry = false;

        for (let i = 0; i < count; i++) {
            const msb = !!(result & 0x80);  // Bit qui va sortir
            result = ((result << 1) & 0xFF) as u8;

            // ROL: le bit qui sort à gauche rentre à droite
            if (msb) {
                result = result | 0x01;  // L'ancien MSB devient LSB
            }

            carry = msb;  // Le MSB devient le flag carry
        }

        const zero = result === 0;
        return { result, flags: { zero, carry } };
    }

    // ROR - Rotate Right (sans utiliser le carry comme entrée)
    ror(value: u8, count: u8 = 1): AluResult {  // Pas de paramètre carryIn!
        let result = value;
        let carry = false;

        for (let i = 0; i < count; i++) {
            const lsb = !!(result & 0x01);  // Bit qui va sortir
            result = ((result >> 1) & 0xFF) as u8;

            // ROR: le bit qui sort à droite rentre à gauche
            if (lsb) {
                result = result | 0x80;  // L'ancien LSB devient MSB
            }

            carry = lsb;  // Le LSB devient le flag carry
        }

        const zero = result === 0;
        return { result, flags: { zero, carry } };
    }

    // RCL - Rotate Left through Carry (utilise le carry comme entrée)
    rcl(value: u8, count: u8 = 1, carryIn: boolean = false): AluResult {
        let result = value;
        let carry = carryIn;

        for (let i = 0; i < count; i++) {
            const msb = !!(result & 0x80);  // Bit qui va sortir
            result = ((result << 1) & 0xFF) as u8;

            // RCL: l'ancien flag carry rentre à droite
            if (carry) {
                result = result | 0x01;  // L'ancien carry devient LSB
            }

            carry = msb;  // Le MSB devient le nouveau flag carry
        }

        const zero = result === 0;
        return { result, flags: { zero, carry } };
    }

    // RCR - Rotate Right through Carry (utilise le carry comme entrée)
    rcr(value: u8, count: u8 = 1, carryIn: boolean = false): AluResult {
        let result = value;
        let carry = carryIn;

        for (let i = 0; i < count; i++) {
            const lsb = !!(result & 0x01);  // Bit qui va sortir
            result = ((result >> 1) & 0xFF) as u8;

            // RCR: l'ancien flag carry rentre à gauche
            if (carry) {
                result = result | 0x80;  // L'ancien carry devient MSB
            }

            carry = lsb;  // Le LSB devient le nouveau flag carry
        }

        const zero = result === 0;
        return { result, flags: { zero, carry } };
    }

    // Shift bits

    // SHL (Shift Left) - Décalage à gauche
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

    // SHR (Shift Right) - Décalage à droite
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

    // Arithmetic Shifts

    // SAL - Shift Arithmetic Left (SAL est identique à SHL)
    sal(value: u8, count: u8 = 1): AluResult {
        return this.shl(value, count);  // SAL = SHL
    }

    // SAR - Shift Arithmetic Right (préserve le signe)
    sar(value: u8, count: u8 = 1): AluResult {
        let result = value;
        let carry = false;

        for (let i = 0; i < count; i++) {
            const msb = result & 0x80;  // Bit de signe
            carry = !!(result & 0x01);  // LSB -> carry

            // Décalage à droite avec préservation du signe
            result = ((result >> 1) & 0xFF) as u8;
            if (msb) {
                result = result | 0x80;  // Restaure le bit de signe
            }
        }

        const zero = result === 0;
        return { result, flags: { zero, carry } };
    }
}

