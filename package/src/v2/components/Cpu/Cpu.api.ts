
import { EventEmitter } from "eventemitter3";

import { toHex, U16, U8 } from "@/v2/lib/integers";
import { Opcode } from "@/v2/cpus/default/cpu_instructions";
import { isRAM, MEMORY_MAP } from "@/v2/lib/memory_map_16x8_bits";
import { BaseCpu } from "./BaseCpu.api";

import type { MemoryBus } from "../Memory/MemoryBus.api";
import type { Register, Register16, u16, u8 } from "@/types/cpu.types";
import type { Interrupt } from "./Interrupt.api";
import type { ICpu } from "./ICpu";
import type { Motherboard } from "../Computer/Motherboard.api";


// Adresses: 16 bits
// Data: 8 bits


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



class CpuCore extends EventEmitter {
    private cpu: Cpu;
    public coreHalted: boolean = true;
    public coreCycle: number = 0;
    public registers: Map<string, u8 | u16> = new Map;
    public idx: number;


    constructor(cpu: Cpu, idx: number) {
        super()
        this.cpu = cpu;
        this.idx = idx;
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
            idx: this.idx,
            registers: this.registers,
        })
    }


    getAllRegisters(): Map<string, u8 | u16> {
        return new Map(this.registers);
    }


    getFlag(flag: 'zero' | 'carry'): boolean {
        const flags = this.getRegister("FLAGS");
        return flag === 'zero' ? !!(flags & 0b10) : !!(flags & 0b01);
    }


    setFlags(zero: boolean, carry: boolean): void {
        this.setRegister('FLAGS', ((zero ? 0b10 : 0) | (carry ? 0b01 : 0)) as u8)
    }


    executeCoreCycle() {
        if (this.coreHalted) return;
        if (!this.cpu.memoryBus) return;

        // 1. Fetch
        const pc = this.getRegister("PC");

        //if (this.currentBreakpoint) {
        //    console.log('this.currentBreakpoint:', this.currentBreakpoint)
        //    debugger;
        //}

        // Handle manual breakpoints
        if (this.cpu.currentBreakpoint === pc) {
            //debugger
            //this.currentBreakpoint = null;
        }

        if (this.cpu.currentBreakpoint === null && this.cpu.motherboard.computer.breakpoints.has(pc) && !this.cpu.cpuPaused) {
            // TODO: petit bug à corriger. si on step jusqu'a un breakpoint. quand on redémarrage il toussote
            this.cpu.currentBreakpoint = pc;

            if (this.cpu.motherboard.clock) {
                this.cpu.motherboard.clock.stop()
            }

            return;
        }

        if (this.cpu.currentBreakpoint === pc) {
            this.cpu.currentBreakpoint = null;
            //debugger
        }


        // Handle Interrupts - Vérifier les interruptions AVANT de fetch
        if (this.cpu.interrupt && this.cpu.interruptsEnabled && !this.cpu.inInterruptHandler && this.cpu.interrupt.hasPendingInterrupt()) {
            this.handleInterrupt();
            return; // On saute l'exécution normale ce cycle
        }


        if (this.coreHalted) {
            return;
        }

        this.coreCycle++


        const instruction = this.cpu.readMemory(pc);
        this.setRegister("IR", instruction);

        // 2. Decode
        const opcode = this.getRegister("IR");

        // 3. Execute


        this.executeOpcode(pc, opcode);

        // 4. Memory

        // 5. Write-back

        // Update UI State
        this.emit('state', {
            idx: this.idx,
            coreCycle: this.coreCycle,
            //registers: this.registers,
        })

    }


    handleInterrupt() {
        if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus")
        if (!this.cpu.interrupt) throw new Error("Missing Interrupt")

        const irq = this.cpu.interrupt.getPendingIRQ(this.cpu.idx, this.idx);
        if (irq === null) return;

        //console.log(`🎯 Handling IRQ ${irq}, handlerAddr = ${this.cpu.interrupt.handlerAddr.toString(16)}`);

        // 1. Désactiver interruptions
        this.cpu.interruptsEnabled = false;
        this.cpu.inInterruptHandler = true;

        // 2. Sauvegarder contexte sur la pile
        const sp = this.getRegister("SP");
        const pc = this.getRegister("PC");
        const flags = this.getRegister("FLAGS");

        // PUSH Flags
        this.cpu.writeMemory(sp, flags);
        this.setRegister("SP", (sp - 1) as u16);

        // PUSH PC (little-endian)
        this.cpu.writeMemory((sp - 1) as u16, ((pc >> 8) & 0xFF) as u8); // High byte
        this.cpu.writeMemory((sp - 2) as u16, (pc & 0xFF) as u8);      // Low byte
        this.setRegister("SP", (sp - 3) as u16);

        // 3. Acquitter l'interruption
        this.cpu.interrupt.acknowledgeInterrupt(irq);

        // 4. Sauter au handler
        let handlerAddress = this.cpu.interrupt.handlerAddr;
        if (handlerAddress === 0) {
            //// Vecteur par défaut: 0x0040 + irq*4
            //handlerAddress = (0x0040 + (irq * 4)) as u16;
            throw new Error("missing handlerAddress")
        }

        this.setRegister("PC", handlerAddress);

        //console.log(`🔄 Interruption IRQ${irq} -> Handler 0x${handlerAddress.toString(16)}`);
    }


    executeOpcode(pc: u16, instruction: u8) {
        if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus")

        switch (instruction) {
            // ===== SYSTEM =====
            case Opcode.NOP:
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.CORES_COUNT: { // A = CORE_COUNT (current CPU)
                this.setRegister("A", U8(this.cpu.cores.length));
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CORE_STATUS: { // A = Core #A status (current CPU)
                const coreIdx = this.getRegister("A");

                if (this.cpu.cores[coreIdx]) {
                    this.setRegister("A", U8(this.cpu.cores[coreIdx].coreHalted ? 0 : 1));
                    //this.setFlags(this.cpu.cores[coreIdx].coreHalted, false);

                } else {
                    this.setRegister("A", U8(0));
                    //this.setFlags(true, false);
                }

                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CORE_INIT: { // Set SP (from [CD]) of Core #A (current CPU)
                const coreIdx = this.getRegister("A");

                if (this.cpu.cores[coreIdx] && this.cpu.cores[coreIdx].coreHalted) {
                    const addrLow = this.getRegister('C');
                    const addrHigh = this.getRegister('D');
                    const address = U16((addrHigh << 8) | addrLow)
                    this.cpu.cores[coreIdx].setRegister("PC", address);
                }

                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CORE_START: { // Start Core #A (current CPU)
                const coreIdx = this.getRegister("A");

                if (this.cpu.cores[coreIdx]) {
                    this.cpu.cores[coreIdx].start()
                }

                if (coreIdx !== this.idx) {
                    this.setRegister("PC", (pc + 1) as u16);
                }
                break;
            }

            case Opcode.CORE_HALT: { // Halt Core #A (current CPU)
                const coreIdx = this.getRegister("A");

                if (this.cpu.cores[coreIdx]) {
                    this.cpu.cores[coreIdx].stop()
                }

                if (coreIdx !== this.idx) {
                    this.setRegister("PC", (pc + 1) as u16);
                }
                break;
            }

            case Opcode.CPUS_COUNT: { // A = CPU_COUNT
                this.setRegister("A", U8(this.cpu.motherboard.cpus.size));
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CPU_STATUS: { // A = CPU #A status
                const cpuIdx = this.getRegister("A");
                const cpu = this.cpu.motherboard.cpus.get(cpuIdx);

                if (cpu) {
                    this.setRegister("A", U8(cpu.cpuHalted ? 0 : 1));
                    //this.setFlags(cpu.cpuHalted, false);

                } else {
                    this.setRegister("A", U8(0));
                    //this.setFlags(true, false);
                }

                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CPU_INIT: { // Set SP (from [CD]) of cpu #A
                const cpuIdx = this.getRegister("A");
                const cpu = this.cpu.motherboard.cpus.get(cpuIdx);

                if (cpu && cpu.cpuHalted) {
                    const addrLow = this.getRegister('C');
                    const addrHigh = this.getRegister('D');
                    const address = U16((addrHigh << 8) | addrLow)
                    cpu.cores[0].setRegister("PC", address);
                }

                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CPU_START: { // Start cpu #A
                const cpuIdx = this.getRegister("A");
                const cpu = this.cpu.motherboard.cpus.get(cpuIdx);

                if (cpu) {
                    cpu.start()
                }

                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CPU_HALT: { // Halt cpu #A
                const cpuIdx = this.getRegister("A");
                const cpu = this.cpu.motherboard.cpus.get(cpuIdx);

                if (cpu) {
                    cpu.stop()
                }

                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.SYSCALL:
                this.handleSyscall(pc);
                break;

            case Opcode.GET_FREQ: // A = FREQ
                this.setRegister("A", U8(this.cpu.motherboard.clock?.clockFrequency ?? 0));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.SET_FREQ: // FREQ = imm8
                const clock = this.cpu.motherboard.clock;
                if (clock) {
                    clock.clockFrequency = this.cpu.readMem8(pc);

                    // Update UI State
                    clock.emit('state', {
                        clockFrequency: clock.clockFrequency,
                    })

                    if (clock.status) {
                        clock.restart()
                    }
                }
                this.setRegister("PC", (pc + 2) as u16);
                break;

            case Opcode.BREAKPOINT_JS:
                debugger;
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.BREAKPOINT:
                if (this.cpu.currentBreakpoint === pc) {
                    this.cpu.currentBreakpoint = null;
                    this.setRegister("PC", (pc + 1) as u16);

                } else {
                    this.cpu.currentBreakpoint = pc;

                    if (!this.cpu.cpuPaused) {
                        this.cpu.setPaused(true);
                    }
                }
                break;

            case Opcode.HALT:
                this.stop();
                break;


            // ===== ALU INSTRUCTIONS =====

            case Opcode.ADD_A_IMM: { // A = A + IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.add(this.getRegister("A"), imm);
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.SUB_A_IMM: { // A = A - IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.sub(this.getRegister("A"), imm)
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.AND_A_IMM: { // A = A & IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.and(this.getRegister("A"), imm)
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.OR_A_IMM: { // A = A | IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.or(this.getRegister("A"), imm)
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.XOR_A_IMM: { // A = A ^ IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.xor(this.getRegister("A"), imm)
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }


            case Opcode.ADD_B_IMM: { // B = B + IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.add(this.getRegister("B"), imm);
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.SUB_B_IMM: { // B = B - IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.sub(this.getRegister("B"), imm)
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.AND_B_IMM: { // B = B & IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.and(this.getRegister("B"), imm)
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.OR_B_IMM: { // B = B | IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.or(this.getRegister("B"), imm)
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.XOR_B_IMM: { // B = B ^ IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.xor(this.getRegister("B"), imm)
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }


            case Opcode.ADD_C_IMM: { // C = C + IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.add(this.getRegister("C"), imm);
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.SUB_C_IMM: { // C = C - IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.sub(this.getRegister("C"), imm)
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.AND_C_IMM: { // C = C & IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.and(this.getRegister("C"), imm)
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.OR_C_IMM: { // C = C | IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.or(this.getRegister("C"), imm)
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.XOR_C_IMM: { // C = C ^ IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.xor(this.getRegister("C"), imm)
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }


            case Opcode.ADD_D_IMM: { // D = D + IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.add(this.getRegister("D"), imm);
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.SUB_D_IMM: { // D = D - IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.sub(this.getRegister("D"), imm)
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.AND_D_IMM: { // D = D & IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.and(this.getRegister("D"), imm)
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.OR_D_IMM: { // D = D | IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.or(this.getRegister("D"), imm)
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.XOR_D_IMM: { // D = D ^ IMM
                const imm = this.cpu.readMem8(pc);
                const { result, flags } = ALU.xor(this.getRegister("D"), imm)
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }


            case Opcode.ADD_AA: { // A = A + A
                const { result, flags } = ALU.add(this.getRegister("A"), this.getRegister("A"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_AB: { // A = A + B
                const { result, flags } = ALU.add(this.getRegister("A"), this.getRegister("B"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_AC: { // A = A + C
                const { result, flags } = ALU.add(this.getRegister("A"), this.getRegister("C"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_AD: { // A = A + D
                const { result, flags } = ALU.add(this.getRegister("A"), this.getRegister("D"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_BA: { // B = B + A
                const { result, flags } = ALU.add(this.getRegister("B"), this.getRegister("A"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_BB: { // B = B + B
                const { result, flags } = ALU.add(this.getRegister("B"), this.getRegister("B"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_BC: { // B = B + C
                const { result, flags } = ALU.add(this.getRegister("B"), this.getRegister("C"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_BD: { // B = B + D
                const { result, flags } = ALU.add(this.getRegister("B"), this.getRegister("D"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_CA: { // C = C + A
                const { result, flags } = ALU.add(this.getRegister("C"), this.getRegister("A"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_CB: { // C = C + B
                const { result, flags } = ALU.add(this.getRegister("C"), this.getRegister("B"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_CC: { // C = C + C
                const { result, flags } = ALU.add(this.getRegister("C"), this.getRegister("C"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_CD: { // C = C + D
                const { result, flags } = ALU.add(this.getRegister("C"), this.getRegister("D"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_DA: { // D = D + A
                const { result, flags } = ALU.add(this.getRegister("D"), this.getRegister("A"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_DB: { // D = D + B
                const { result, flags } = ALU.add(this.getRegister("D"), this.getRegister("B"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_DC: { // D = D + C
                const { result, flags } = ALU.add(this.getRegister("D"), this.getRegister("C"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.ADD_DD: { // D = D + D
                const { result, flags } = ALU.add(this.getRegister("D"), this.getRegister("D"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_AA: { // A = A - A
                const { result, flags } = ALU.sub(this.getRegister("A"), this.getRegister("A"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_AB: { // A = A - B
                const { result, flags } = ALU.sub(this.getRegister("A"), this.getRegister("B"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_AC: { // A = A - C
                const { result, flags } = ALU.sub(this.getRegister("A"), this.getRegister("C"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_AD: { // A = A - D
                const { result, flags } = ALU.sub(this.getRegister("A"), this.getRegister("D"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_BA: { // B = B - A
                const { result, flags } = ALU.sub(this.getRegister("B"), this.getRegister("A"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_BB: { // B = B - B
                const { result, flags } = ALU.sub(this.getRegister("B"), this.getRegister("B"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_BC: { // B = B - C
                const { result, flags } = ALU.sub(this.getRegister("B"), this.getRegister("C"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_BD: { // B = B - D
                const { result, flags } = ALU.sub(this.getRegister("B"), this.getRegister("D"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_CA: { // C = C - A
                const { result, flags } = ALU.sub(this.getRegister("C"), this.getRegister("A"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_CB: { // C = C - B
                const { result, flags } = ALU.sub(this.getRegister("C"), this.getRegister("B"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_CC: { // C = C - C
                const { result, flags } = ALU.sub(this.getRegister("C"), this.getRegister("C"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_CD: { // C = C - D
                const { result, flags } = ALU.sub(this.getRegister("C"), this.getRegister("D"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_DA: { // D = D - A
                const { result, flags } = ALU.sub(this.getRegister("D"), this.getRegister("A"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_DB: { // D = D - B
                const { result, flags } = ALU.sub(this.getRegister("D"), this.getRegister("B"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_DC: { // D = D - C
                const { result, flags } = ALU.sub(this.getRegister("D"), this.getRegister("C"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.SUB_DD: { // D = D - D
                const { result, flags } = ALU.sub(this.getRegister("D"), this.getRegister("D"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_AA: { // A = A & A
                const { result, flags } = ALU.and(this.getRegister("A"), this.getRegister("A"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_AB: { // A = A & B
                const { result, flags } = ALU.and(this.getRegister("A"), this.getRegister("B"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_AC: { // A = A & C
                const { result, flags } = ALU.and(this.getRegister("A"), this.getRegister("C"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_AD: { // A = A & D
                const { result, flags } = ALU.and(this.getRegister("A"), this.getRegister("D"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_BA: { // B = B & A
                const { result, flags } = ALU.and(this.getRegister("B"), this.getRegister("A"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_BB: { // B = B & B
                const { result, flags } = ALU.and(this.getRegister("B"), this.getRegister("B"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_BC: { // B = B & C
                const { result, flags } = ALU.and(this.getRegister("B"), this.getRegister("C"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_BD: { // B = B & D
                const { result, flags } = ALU.and(this.getRegister("B"), this.getRegister("D"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_CA: { // C = C & A
                const { result, flags } = ALU.and(this.getRegister("C"), this.getRegister("A"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_CB: { // C = C & B
                const { result, flags } = ALU.and(this.getRegister("C"), this.getRegister("B"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_CC: { // C = C & C
                const { result, flags } = ALU.and(this.getRegister("C"), this.getRegister("C"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_CD: { // C = C & D
                const { result, flags } = ALU.and(this.getRegister("C"), this.getRegister("D"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_DA: { // D = D & A
                const { result, flags } = ALU.and(this.getRegister("D"), this.getRegister("A"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_DB: { // D = D & B
                const { result, flags } = ALU.and(this.getRegister("D"), this.getRegister("B"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_DC: { // D = D & C
                const { result, flags } = ALU.and(this.getRegister("D"), this.getRegister("C"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.AND_DD: { // D = D & D
                const { result, flags } = ALU.and(this.getRegister("D"), this.getRegister("D"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_AA: { // A = A | A
                const { result, flags } = ALU.or(this.getRegister("A"), this.getRegister("A"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_AB: { // A = A | B
                const { result, flags } = ALU.or(this.getRegister("A"), this.getRegister("B"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_AC: { // A = A | C
                const { result, flags } = ALU.or(this.getRegister("A"), this.getRegister("C"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_AD: { // A = A | D
                const { result, flags } = ALU.or(this.getRegister("A"), this.getRegister("D"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_BA: { // B = B | A
                const { result, flags } = ALU.or(this.getRegister("B"), this.getRegister("A"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_BB: { // B = B | B
                const { result, flags } = ALU.or(this.getRegister("B"), this.getRegister("B"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_BC: { // B = B | C
                const { result, flags } = ALU.or(this.getRegister("B"), this.getRegister("C"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_BD: { // B = B | D
                const { result, flags } = ALU.or(this.getRegister("B"), this.getRegister("D"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_CA: { // C = C | A
                const { result, flags } = ALU.or(this.getRegister("C"), this.getRegister("A"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_CB: { // C = C | B
                const { result, flags } = ALU.or(this.getRegister("C"), this.getRegister("B"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_CC: { // C = C | C
                const { result, flags } = ALU.or(this.getRegister("C"), this.getRegister("C"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_CD: { // C = C | D
                const { result, flags } = ALU.or(this.getRegister("C"), this.getRegister("D"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_DA: { // D = D | A
                const { result, flags } = ALU.or(this.getRegister("D"), this.getRegister("A"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_DB: { // D = D | B
                const { result, flags } = ALU.or(this.getRegister("D"), this.getRegister("B"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_DC: { // D = D | C
                const { result, flags } = ALU.or(this.getRegister("D"), this.getRegister("C"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.OR_DD: { // D = D | D
                const { result, flags } = ALU.or(this.getRegister("D"), this.getRegister("D"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_AA: { // A = A ^ A
                const { result, flags } = ALU.xor(this.getRegister("A"), this.getRegister("A"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_AB: { // A = A ^ B
                const { result, flags } = ALU.xor(this.getRegister("A"), this.getRegister("B"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_AC: { // A = A ^ C
                const { result, flags } = ALU.xor(this.getRegister("A"), this.getRegister("C"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_AD: { // A = A ^ D
                const { result, flags } = ALU.xor(this.getRegister("A"), this.getRegister("D"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_BA: { // B = B ^ A
                const { result, flags } = ALU.xor(this.getRegister("B"), this.getRegister("A"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_BB: { // B = B ^ B
                const { result, flags } = ALU.xor(this.getRegister("B"), this.getRegister("B"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_BC: { // B = B ^ C
                const { result, flags } = ALU.xor(this.getRegister("B"), this.getRegister("C"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_BD: { // B = B ^ D
                const { result, flags } = ALU.xor(this.getRegister("B"), this.getRegister("D"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_CA: { // C = C ^ A
                const { result, flags } = ALU.xor(this.getRegister("C"), this.getRegister("A"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_CB: { // C = C ^ B
                const { result, flags } = ALU.xor(this.getRegister("C"), this.getRegister("B"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_CC: { // C = C ^ C
                const { result, flags } = ALU.xor(this.getRegister("C"), this.getRegister("C"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_CD: { // C = C ^ D
                const { result, flags } = ALU.xor(this.getRegister("C"), this.getRegister("D"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_DA: { // D = D ^ A
                const { result, flags } = ALU.xor(this.getRegister("D"), this.getRegister("A"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_DB: { // D = D ^ B
                const { result, flags } = ALU.xor(this.getRegister("D"), this.getRegister("B"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_DC: { // D = D ^ C
                const { result, flags } = ALU.xor(this.getRegister("D"), this.getRegister("C"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }
            case Opcode.XOR_DD: { // D = D ^ D
                const { result, flags } = ALU.xor(this.getRegister("D"), this.getRegister("D"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }


            case Opcode.TEST_A:
            case Opcode.TEST_AA: { // TEST A, A
                const { flags } = ALU.test(this.getRegister("A"), this.getRegister("A"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.TEST_AB:
            case Opcode.TEST_BA: { // TEST A, B
                const { flags } = ALU.test(this.getRegister("A"), this.getRegister("B"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.TEST_AC:
            case Opcode.TEST_CA: { // TEST A, C
                const { flags } = ALU.test(this.getRegister("A"), this.getRegister("C"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.TEST_AD:
            case Opcode.TEST_DA: { // TEST A, D
                const { flags } = ALU.test(this.getRegister("A"), this.getRegister("D"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }


            case Opcode.TEST_B:    // TEST B, B
            case Opcode.TEST_BB: { // TEST B, B
                const { flags } = ALU.test(this.getRegister("B"), this.getRegister("B"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.TEST_BC:
            case Opcode.TEST_CB: { // TEST B, C
                const { flags } = ALU.test(this.getRegister("B"), this.getRegister("C"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.TEST_BD:
            case Opcode.TEST_DB: { // TEST B, D
                const { flags } = ALU.test(this.getRegister("B"), this.getRegister("D"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.TEST_C:
            case Opcode.TEST_CC: { // TEST C, C
                const { flags } = ALU.test(this.getRegister("C"), this.getRegister("C"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.TEST_CD:
            case Opcode.TEST_DC: { // TEST C, D
                const { flags } = ALU.test(this.getRegister("C"), this.getRegister("D"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.TEST_D:  // TEST D, D
            case Opcode.TEST_DD: { // TEST D, D
                const { flags } = ALU.test(this.getRegister("D"), this.getRegister("D"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }


            case Opcode.TEST_A_IMM: { // TEST A, IMM
                const imm = this.cpu.readMem8(pc);
                const { flags } = ALU.test(this.getRegister("A"), imm);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.TEST_B_IMM: { // TEST B, IMM
                const imm = this.cpu.readMem8(pc);
                const { flags } = ALU.test(this.getRegister("B"), imm);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.TEST_C_IMM: { // TEST C, IMM
                const imm = this.cpu.readMem8(pc);
                const { flags } = ALU.test(this.getRegister("C"), imm);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.TEST_D_IMM: { // TEST D, IMM
                const imm = this.cpu.readMem8(pc);
                const { flags } = ALU.test(this.getRegister("D"), imm);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }


            case Opcode.CMP_AA: { // CMP A, A
                const { flags } = ALU.cmp(this.getRegister("A"), this.getRegister("A"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_AB: { // CMP A, B
                const { flags } = ALU.cmp(this.getRegister("A"), this.getRegister("B"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_AC: { // CMP A, C
                const { flags } = ALU.cmp(this.getRegister("A"), this.getRegister("C"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_AD: { // CMP A, D
                const { flags } = ALU.cmp(this.getRegister("A"), this.getRegister("D"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_BA: { // CMP B, A
                const { flags } = ALU.cmp(this.getRegister("B"), this.getRegister("A"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_BB: { // CMP B, B
                const { flags } = ALU.cmp(this.getRegister("B"), this.getRegister("B"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_BC: { // CMP B, C
                const { flags } = ALU.cmp(this.getRegister("B"), this.getRegister("C"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_BD: { // CMP B, D
                const { flags } = ALU.cmp(this.getRegister("B"), this.getRegister("D"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_CA: { // CMP C, A
                const { flags } = ALU.cmp(this.getRegister("C"), this.getRegister("A"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_CB: { // CMP C, B
                const { flags } = ALU.cmp(this.getRegister("C"), this.getRegister("B"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_CC: { // CMP C, C
                const { flags } = ALU.cmp(this.getRegister("C"), this.getRegister("C"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_CD: { // CMP C, D
                const { flags } = ALU.cmp(this.getRegister("C"), this.getRegister("D"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_DA: { // CMP D, A
                const { flags } = ALU.cmp(this.getRegister("D"), this.getRegister("A"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_DB: { // CMP D, B
                const { flags } = ALU.cmp(this.getRegister("D"), this.getRegister("B"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_DC: { // CMP D, C
                const { flags } = ALU.cmp(this.getRegister("D"), this.getRegister("C"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CMP_DD: { // CMP D, D
                const { flags } = ALU.cmp(this.getRegister("D"), this.getRegister("D"));
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            // ===== CMP avec immédiat =====
            case Opcode.CMP_A_IMM: { // CMP A, imm8
                const imm = this.cpu.readMem8(pc);
                const { flags } = ALU.cmp(this.getRegister("A"), imm);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.CMP_B_IMM: { // CMP B, imm8
                const imm = this.cpu.readMem8(pc);
                const { flags } = ALU.cmp(this.getRegister("B"), imm);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.CMP_C_IMM: { // CMP C, imm8
                const imm = this.cpu.readMem8(pc);
                const { flags } = ALU.cmp(this.getRegister("C"), imm);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.CMP_D_IMM: { // CMP D, imm8
                const imm = this.cpu.readMem8(pc);
                const { flags } = ALU.cmp(this.getRegister("D"), imm);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }


            // ===== SHIFT INSTRUCTIONS =====
            case Opcode.SHL_A: { // Shift Left A (1 bit)
                const { result, flags } = ALU.shl(this.getRegister("A"), U8(1));
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.SHR_A: { // Shift Right A (1 bit)
                const { result, flags } = ALU.shr(this.getRegister("A"), U8(1));
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.SHL_B: { // Shift Left B (1 bit)
                const { result, flags } = ALU.shl(this.getRegister("B"), U8(1));
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.SHR_B: { // Shift Right B (1 bit)
                const { result, flags } = ALU.shr(this.getRegister("B"), U8(1));
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.SHL_C: { // Shift Left C (1 bit)
                const { result, flags } = ALU.shl(this.getRegister("C"), U8(1));
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.SHR_C: { // Shift Right C (1 bit)
                const { result, flags } = ALU.shr(this.getRegister("C"), U8(1));
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.SHL_D: { // Shift Left D (1 bit)
                const { result, flags } = ALU.shl(this.getRegister("D"), U8(1));
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.SHR_D: { // Shift Right D (1 bit)
                const { result, flags } = ALU.shr(this.getRegister("D"), U8(1));
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            // Décalage avec nombre de bits spécifié
            case Opcode.SHL_A_N: { // Shift Left A, N bits
                const count = this.cpu.readMem8(pc);
                const { result, flags } = ALU.shl(this.getRegister("A"), count);
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.SHR_A_N: { // Shift Right A, N bits
                const count = this.cpu.readMem8(pc);
                const { result, flags } = ALU.shr(this.getRegister("A"), count);
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.SHL_B_N: { // Shift Left B, N bits
                const count = this.cpu.readMem8(pc);
                const { result, flags } = ALU.shl(this.getRegister("B"), count);
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.SHR_B_N: { // Shift Right B, N bits
                const count = this.cpu.readMem8(pc);
                const { result, flags } = ALU.shr(this.getRegister("B"), count);
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.SHL_C_N: { // Shift Left C, N bits
                const count = this.cpu.readMem8(pc);
                const { result, flags } = ALU.shl(this.getRegister("C"), count);
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.SHR_C_N: { // Shift Right C, N bits
                const count = this.cpu.readMem8(pc);
                const { result, flags } = ALU.shr(this.getRegister("C"), count);
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.SHL_D_N: { // Shift Left D, N bits
                const count = this.cpu.readMem8(pc);
                const { result, flags } = ALU.shl(this.getRegister("D"), count);
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            case Opcode.SHR_D_N: { // Shift Right D, N bits
                const count = this.cpu.readMem8(pc);
                const { result, flags } = ALU.shr(this.getRegister("D"), count);
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            // Rotations
            case Opcode.ROL_A: { // Rotate Left A through carry
                const carryFlag = this.getFlag('carry');
                const { result, flags } = ALU.rol(this.getRegister("A"), U8(1), carryFlag);
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.ROR_A: { // Rotate Right A through carry
                const carryFlag = this.getFlag('carry');
                const { result, flags } = ALU.ror(this.getRegister("A"), U8(1), carryFlag);
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.ROL_B: { // Rotate Left B through carry
                const carryFlag = this.getFlag('carry');
                const { result, flags } = ALU.rol(this.getRegister("B"), U8(1), carryFlag);
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.ROR_B: { // Rotate Right B through carry
                const carryFlag = this.getFlag('carry');
                const { result, flags } = ALU.ror(this.getRegister("B"), U8(1), carryFlag);
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }


            case Opcode.NOT_A: { // A = !A
                const { result, flags } = ALU.not(this.getRegister("A"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.NOT_B: { // B = !B
                const { result, flags } = ALU.not(this.getRegister("B"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.NOT_C: { // C = !C
                const { result, flags } = ALU.not(this.getRegister("C"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.NOT_D: { // D = !D
                const { result, flags } = ALU.not(this.getRegister("D"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }


            case Opcode.INC_A: { // A = A + 1
                const { result, flags } = ALU.inc(this.getRegister("A"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.DEC_A: { // A = A - 1
                const { result, flags } = ALU.dec(this.getRegister("A"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.INC_B: { // B = B + 1
                const { result, flags } = ALU.inc(this.getRegister("B"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.DEC_B: { // B = B - 1
                const { result, flags } = ALU.dec(this.getRegister("B"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.INC_C: { // C = C + 1
                const { result, flags } = ALU.inc(this.getRegister("C"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.DEC_C: { // C = C - 1
                const { result, flags } = ALU.dec(this.getRegister("C"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.INC_D: { // D = D + 1
                const { result, flags } = ALU.inc(this.getRegister("D"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.DEC_D: { // D = D - 1
                const { result, flags } = ALU.dec(this.getRegister("D"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            // ===== JUMP INSTRUCTIONS =====
            case Opcode.JMP: // Jump
                this.setRegister("PC", this.cpu.readMem16(pc));
                break;

            case Opcode.JZ: // Jump if Zero Flag
                if (this.getFlag('zero')) {
                    this.setRegister("PC", this.cpu.readMem16(pc));
                } else {
                    this.setRegister("PC", (pc + 3) as u16);
                }
                break;

            case Opcode.JNZ: // Jump if Not Zero Flag
                if (!this.getFlag('zero')) {
                    this.setRegister("PC", this.cpu.readMem16(pc));
                } else {
                    this.setRegister("PC", (pc + 3) as u16);
                }
                break;

            case Opcode.JC: // Jump if Carry Flag
                if (this.getFlag('carry')) {
                    this.setRegister("PC", this.cpu.readMem16(pc));
                } else {
                    this.setRegister("PC", (pc + 3) as u16);
                }
                break;

            case Opcode.JNC: // Jump if Not Carry Flag
                if (!this.getFlag('carry')) {
                    this.setRegister("PC", this.cpu.readMem16(pc));
                } else {
                    this.setRegister("PC", (pc + 3) as u16);
                }
                break;

            case Opcode.JL: // Jump if Lower
                if (!this.getFlag('zero') && this.getFlag('carry')) {
                    this.setRegister("PC", this.cpu.readMem16(pc));
                } else {
                    this.setRegister("PC", (pc + 3) as u16);
                }
                break;

            case Opcode.JLE: // Jump if Lower or Equal
                if (this.getFlag('zero') || this.getFlag('carry')) {
                    this.setRegister("PC", this.cpu.readMem16(pc));
                } else {
                    this.setRegister("PC", (pc + 3) as u16);
                }
                break;

            case Opcode.JG: // Jump if Greater
                if (!this.getFlag('zero') && !this.getFlag('carry')) {
                    this.setRegister("PC", this.cpu.readMem16(pc));
                } else {
                    this.setRegister("PC", (pc + 3) as u16);
                }
                break;

            case Opcode.JGE: // Jump if Greater or Equal
                if (this.getFlag('zero') || !this.getFlag('carry')) {
                    this.setRegister("PC", this.cpu.readMem16(pc));
                } else {
                    this.setRegister("PC", (pc + 3) as u16);
                }
                break;

            // ===== PUSH =====
            case Opcode.PUSH_A: { // PUSH A
                this.pushValue(this.getRegister("A"));
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.PUSH_B: // PUSH B
                this.pushValue(this.getRegister("B"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.PUSH_C: // PUSH C
                this.pushValue(this.getRegister("C"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.PUSH_D: // PUSH D
                this.pushValue(this.getRegister("D"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            // ===== POP =====
            case Opcode.POP_A: // POP A
                this.setRegister("A", this.popValue());
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.POP_B: // POP B
                this.setRegister("B", this.popValue());
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.POP_C: // POP C
                this.setRegister("C", this.popValue());
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.POP_D: // POP D
                this.setRegister("D", this.popValue());
                this.setRegister("PC", (pc + 1) as u16);
                break;

            // ===== STACK =====
            case Opcode.GET_SP: // A = SP
                this.setRegister("A", this.getRegister("SP"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.SET_SP: // SP = imm16
                // SET_SP imm16 : SP = valeur immédiate 16-bit
                this.setRegister("SP", this.cpu.readMem16(pc));
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.CALL:
                this.handleCall(pc);
                break;

            case Opcode.RET:
                this.handleRet();
                break;

            // ===== INTERRUPTS =====
            case Opcode.EI:  // Enable Interrupts
                this.cpu.interruptsEnabled = true;
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.DI:  // Disable Interrupts
                this.cpu.interruptsEnabled = false;
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.IRET: // Return from Interrupt
                this.handleIRet();
                break;

            // ===== LEA INSTRUCTIONS =====
            case Opcode.LEA_CD_A: { // LEA A, [C:D] - Load effective address into A
                // Combine C et D pour former une adresse 16-bit
                const address = ((this.getRegister("D") << 8) | this.getRegister("C")) as u16;

                // Stocker l'adresse dans A (8-bit seulement, donc on prend le LSB)
                // Note: comme A est 8-bit, on ne peut stocker que le low byte de l'adresse
                this.setRegister("A", (address & 0xFF) as u8);

                // Mettre à jour flags (Z=1 si adresse low byte = 0)
                const zero = (address & 0xFF) === 0;
                this.setFlags(zero, false);

                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.LEA_CD_B: { // LEA B, [C:D] - Load effective address into B
                const address = ((this.getRegister("D") << 8) | this.getRegister("C")) as u16;
                this.setRegister("B", (address & 0xFF) as u8);
                const zero = (address & 0xFF) === 0;
                this.setFlags(zero, false);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.LEA_IMM_CD: { // LEA CD, imm16 - Load immediate address into C:D
                // Lire l'adresse immédiate 16-bit
                const address = this.cpu.readMem16(pc);

                // Stocker dans C:D (C = low byte, D = high byte)
                this.setRegister("C", (address & 0xFF) as u8);
                this.setRegister("D", ((address >> 8) & 0xFF) as u8);

                // Pas de mise à jour des flags (LEA ne modifie pas les flags en x86)
                this.setRegister("PC", (pc + 3) as u16);
                break;
            }

            case Opcode.LEA_A_MEM: { // LEA A, [imm16] - Load address low byte into A
                const address = this.cpu.readMem16(pc);
                this.setRegister("A", (address & 0xFF) as u8);

                // Mettre à jour zero flag si low byte = 0
                const zero = (address & 0xFF) === 0;
                this.setFlags(zero, false);

                this.setRegister("PC", (pc + 3) as u16);
                break;
            }

            case Opcode.LEA_B_MEM: { // LEA B, [imm16] - Load address low byte into B
                const address = this.cpu.readMem16(pc);
                this.setRegister("B", (address & 0xFF) as u8);

                const zero = (address & 0xFF) === 0;
                this.setFlags(zero, false);

                this.setRegister("PC", (pc + 3) as u16);
                break;
            }

            case Opcode.LEA_CD_MEM: { // LEA CD, [imm16] - Load address into C:D
                const address = this.cpu.readMem16(pc);

                // Stocker dans C:D (C = low byte, D = high byte)
                this.setRegister("C", (address & 0xFF) as u8);
                this.setRegister("D", ((address >> 8) & 0xFF) as u8);

                this.setRegister("PC", (pc + 3) as u16);
                break;
            }

            case Opcode.LEA_CD_OFFSET: { // LEA CD, [CD + imm8] - Address with offset
                const offset = this.cpu.readMem8(pc);
                const baseAddr = ((this.getRegister("D") << 8) | this.getRegister("C")) as u16;

                // Calculer la nouvelle adresse
                // Version non signée:
                const address = (baseAddr + offset) as u16;

                // Version signée (pour offset négatif):
                // const signedOffset = offset > 127 ? offset - 256 : offset;
                // const address = (baseAddr + signedOffset) as u16;

                this.setRegister("C", (address & 0xFF) as u8);
                this.setRegister("D", ((address >> 8) & 0xFF) as u8);

                this.setRegister("PC", (pc + 2) as u16);
                break;
            }

            // ===== MOV register-register =====
            case Opcode.MOV_B_A:  // A → B
                this.setRegister("B", this.getRegister("A"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_C_A:  // A → C
                this.setRegister("C", this.getRegister("A"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_D_A:  // A → D
                this.setRegister("D", this.getRegister("A"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_A_B:  // B → A
                this.setRegister("A", this.getRegister("B"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_C_B:  // B → C
                this.setRegister("C", this.getRegister("B"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_D_B:  // B → D
                this.setRegister("D", this.getRegister("B"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_A_C:  // C → A
                this.setRegister("A", this.getRegister("C"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_B_C:  // C → B
                this.setRegister("B", this.getRegister("C"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_D_C:  // C → D
                this.setRegister("D", this.getRegister("C"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_A_D:  // D → A
                this.setRegister("A", this.getRegister("D"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_B_D:  // D → B
                this.setRegister("B", this.getRegister("D"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_C_D:  // D → C
                this.setRegister("C", this.getRegister("D"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            // ===== MOV register-immediate (set flags) ===== => TODO: ne pas modifier les flags
            case Opcode.MOV_A_IMM:  // MOV A, imm8
                const immA = this.cpu.readMem8(pc);
                this.setRegister("A", immA);
                //this.setFlags(immA === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 2) as u16);
                break;

            case Opcode.MOV_B_IMM:  // MOV B, imm8
                const immB = this.cpu.readMem8(pc);
                this.setRegister("B", immB);
                //this.setFlags(immB === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 2) as u16);
                break;

            case Opcode.MOV_C_IMM:  // MOV C, imm8
                const immC = this.cpu.readMem8(pc);
                this.setRegister("C", immC);
                //this.setFlags(immC === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 2) as u16);
                break;

            case Opcode.MOV_D_IMM:  // MOV D, imm8
                const immD = this.cpu.readMem8(pc);
                this.setRegister("D", immD);
                //this.setFlags(immD === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 2) as u16);
                break;

            // ===== MOV memory-register (set flags) ===== => TODO: ne pas modifier les flags
            case Opcode.MOV_A_MEM:  // MOV A, [addr16]
                const addrA = this.cpu.readMem16(pc);
                const memValueA = this.cpu.readMemory(addrA);
                this.setRegister("A", memValueA);
                //this.setFlags(memValueA === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_B_MEM:  // MOV B, [addr16]
                const addrB = this.cpu.readMem16(pc);
                const memValueB = this.cpu.readMemory(addrB);
                this.setRegister("B", memValueB);
                //this.setFlags(memValueB === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_C_MEM:  // MOV C, [addr16]
                const addrC = this.cpu.readMem16(pc);
                const memValueC = this.cpu.readMemory(addrC);
                this.setRegister("C", memValueC);
                //this.setFlags(memValueC === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_D_MEM:  // MOV D, [addr16]
                const addrD = this.cpu.readMem16(pc);
                const memValueD = this.cpu.readMemory(addrD);
                this.setRegister("D", memValueD);
                //this.setFlags(memValueD === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 3) as u16);
                break;

            // ===== MOV register-memory =====
            case Opcode.MOV_MEM_A:  // MOV [addr16], A
                const addrMemA = this.cpu.readMem16(pc);
                this.cpu.writeMemory(addrMemA, this.getRegister("A"));
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_MEM_B:  // MOV [addr16], B
                const addrMemB = this.cpu.readMem16(pc);
                this.cpu.writeMemory(addrMemB, this.getRegister("B"));
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_MEM_C:  // MOV [addr16], C
                const addrMemC = this.cpu.readMem16(pc);
                this.cpu.writeMemory(addrMemC, this.getRegister("C"));
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_MEM_D:  // MOV [addr16], D
                const addrMemD = this.cpu.readMem16(pc);
                this.cpu.writeMemory(addrMemD, this.getRegister("D"));
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_A_PTR_CD:  // MOV A, *[C:D] => TODO: ne pas modifier les flags
                const ptrCD_LoadA = ((this.getRegister("D") << 8) | this.getRegister("C")) as u16;
                const valuePtr_A = this.cpu.readMemory(ptrCD_LoadA);
                this.setRegister("A", valuePtr_A);
                //this.setFlags(valuePtr_A === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_B_PTR_CD:  // MOV B, *[C:D] => TODO: ne pas modifier les flags
                const ptrCD_LoadB = ((this.getRegister("D") << 8) | this.getRegister("C")) as u16;
                const valuePtr_B = this.cpu.readMemory(ptrCD_LoadB);
                this.setRegister("B", valuePtr_B);
                //this.setFlags(valuePtr_B === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_PTR_CD_A:  // MOV *[C:D], A
                const ptrCD_StoreA = ((this.getRegister("D") << 8) | this.getRegister("C")) as u16;
                this.cpu.writeMemory(ptrCD_StoreA, this.getRegister("A"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_PTR_CD_B:  // MOV *[C:D], B
                const ptrCD_StoreB = ((this.getRegister("D") << 8) | this.getRegister("C")) as u16;
                this.cpu.writeMemory(ptrCD_StoreB, this.getRegister("B"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            default:
                this.setRegister("PC", (pc + 1) as u16);

                console.error(`Unknown opcode at 0x${pc.toString(16)}: 0x${instruction.toString(16)}`);
                this.stop();
                this.emit('state', {
                    idx: this.idx,
                    coreHalted: this.coreHalted,
                });
                break;
        }

    }


    // Fonction pour CALL
    handleSyscall(pc: u16) {
        if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus")

        // Linux Syscalls : https://www.chromium.org/chromium-os/developer-library/reference/linux-constants/syscalls/

        const syscallNum = this.cpu.readMem8(pc);

        switch (syscallNum) {
            case 0: // exit
                console.log("📍 Program exit (syscall 0)");

                if (this.idx !== 0) {
                    this.stop();
                    break;
                }

                // Clear program memory - pour eviter que le programme ne se relance automatiquement (si mini_os v1)
                //this.cpu.writeMemory(MEMORY_MAP.OS_START, U8(0))
                for (let addr = MEMORY_MAP.PROGRAM_START; addr <= MEMORY_MAP.PROGRAM_END; addr++) {
                    //this.cpu.writeMemory(addr, 0 as u8);
                    //break; // TRES TRES LENT !!! => solution : on ne vide que la 1ere adresse

                    if (this.cpu.memoryBus.ram) {
                        this.cpu.memoryBus.ram.storage.delete(addr);
                    }
                }

                // Clear CPUs caches
                this.cpu.motherboard.clearCpuCaches();

                // Retour à l'OS
                this.setRegister("PC", MEMORY_MAP.OS_START);
                //this.setRegister("PC", (pc + 2) as u16);
                break;

            default:
                console.warn(`Unknown syscall: ${syscallNum}`);
                this.setRegister("PC", (pc + 2) as u16);
                break;
        }
    }


    handleCall(pc: u16) {
        if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus")

        // Adresse de retour = PC + 3 (opcode + 2 bytes d'adresse)
        const returnAddr = pc + 3;

        // PUSH l'adresse de retour sur la pile (16 bits)
        let sp = this.getRegister("SP");

        // PUSH high byte
        this.cpu.writeMemory(sp, ((returnAddr >> 8) & 0xFF) as u8);
        sp = ((sp - 1) & 0xFFFF) as u16;

        // PUSH low byte
        this.cpu.writeMemory(sp, (returnAddr & 0xFF) as u8);
        sp = ((sp - 1) & 0xFFFF) as u16;

        this.setRegister("SP", sp);

        // Lire l'adresse de destination
        const callAddr = this.cpu.readMem16(pc);

        // Sauter
        this.setRegister("PC", callAddr);
    }


    // Fonction pour RET
    handleRet() {
        if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus")

        let sp = this.getRegister("SP");

        // POP low byte
        sp = ((sp + 1) & 0xFFFF) as u16;
        const low = this.cpu.readMemory(sp);

        // POP high byte
        sp = ((sp + 1) & 0xFFFF) as u16;
        const high = this.cpu.readMemory(sp);

        const retAddr = ((high << 8) | low) as u16;

        // Mettre à jour SP
        this.setRegister("SP", sp);

        // Sauter à l'adresse retour
        this.setRegister("PC", retAddr);
    }


    // Fonction pour IRET (Return from Interrupt)
    handleIRet() {
        if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus")

        let sp = this.getRegister("SP");

        // POP PC - low
        sp = ((sp + 1) & 0xFFFF) as u16;
        const pcLow = this.cpu.readMemory(sp);

        // POP PC - high
        sp = ((sp + 1) & 0xFFFF) as u16;
        const pcHigh = this.cpu.readMemory(sp);
        const returnAddr = ((pcHigh << 8) | pcLow) as u16;

        // POP Flags
        sp = ((sp + 1) & 0xFFFF) as u16;
        const flags = this.cpu.readMemory(sp);

        // Mettre à jour registres
        this.setRegister("SP", sp);
        this.setRegister("PC", returnAddr);
        this.setRegister("FLAGS", flags);

        // Réactiver interruptions
        this.cpu.interruptsEnabled = true;
        this.cpu.inInterruptHandler = false;
    }


    // Fonction pour push une valeur sur la pile
    pushValue(value: u8) {
        if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus")

        let sp = this.getRegister("SP");

        // Écrire la valeur à [SP]
        this.cpu.writeMemory(sp, value);

        // Décrémenter SP (pile descend)
        sp = ((sp - 1) & 0xFFFF) as u16;
        this.setRegister("SP", sp);
    }


    // Fonction pour pop une valeur de la pile
    popValue(): u8 {
        if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus")

        let sp = this.getRegister("SP");

        // Incrémenter SP d'abord (pile remonte)
        sp = ((sp + 1) & 0xFFFF) as u16;

        // Lire la valeur à [SP]
        const value = this.cpu.readMemory(sp);

        // Mettre à jour SP
        this.setRegister("SP", sp);

        return value;
    }


    start() {
        if (!this.coreHalted) return;

        this.coreHalted = false;

        this.emit('state', {
            idx: this.idx,
            coreHalted: this.coreHalted,
        });
    }


    stop() {
        if (this.coreHalted) return;

        this.coreHalted = true;

        this.emit('state', {
            idx: this.idx,
            coreHalted: this.coreHalted,
        });
    }


    reset() {
        this.stop();
        this.coreCycle = 0;
        this.registers = new Map(initialRegisters);

        this.emit('state', {
            idx: this.idx,
            //coreHalted: this.coreHalted,
            coreCycle: this.coreCycle,
            registers: this.registers,
        })
    }

}


export class Cpu extends BaseCpu {
    // Identification
    public type = "simple";
    public architecture: ICpu["architecture"] = "8bit";
    public id: number;

    // État
    public idx: number;
    public cores: CpuCore[] = [];
    public cpuHalted: boolean = true;
    public cpuPaused: boolean = false;
    public cpuCycle: number = 0;
    public cacheL1: Map<u16, u8> = new Map;
    public cacheL1MaxSize = 128; // bytes
    //public registers: Map<string, u8 | u16> = new Map;
    //public breakpoints: Set<number> = new Set;

    // Composants
    public memoryBus: MemoryBus | null = null;
    public interrupt: Interrupt | null = null;
    //public clock: Clock | null = null;

    public currentBreakpoint: number | null = null;
    public interruptsEnabled: boolean = true;
    public inInterruptHandler: boolean = false;


    constructor(motherboard: Motherboard, idx = 0, coresCount = 1) {
        //console.log(`Initializing Cpu`);
        super(motherboard);

        this.id = Math.round(Math.random() * 999_999_999);
        this.idx = idx;


        for (let i = 0; i < coresCount; i++) {
            const core = new CpuCore(this, i);
            this.cores.push(core)

            if (false) {
                // Ecoute le statut de chaque coeur et si tous les coeurs sont HALT, alors on HALT le CPU
                core.on('state', (state) => {
                    const coreIdx = state.idx;
                    //console.log('CPU CORE state:', state)

                    if (state.coreHalted !== undefined) {
                        const haltCpuIfAllCoresHalted = false;

                        if (haltCpuIfAllCoresHalted && state.coreHalted) {
                            let coresAlive = 0;

                            for (const core of this.cores) {
                                coresAlive += core.coreHalted ? 0 : 1;
                            }

                            if (coresAlive === 0) {
                                this.cpuHalted = true;
                            }
                        }
                    }
                })
            }
        }

        this.reset()
    }


    start() {
        if (!this.cpuHalted) return;

        this.cpuHalted = false;

        this.emit('state', {
            cpuHalted: this.cpuHalted,
        });
    }


    stop() {
        if (this.cpuHalted) return;

        this.cpuHalted = true;

        this.emit('state', {
            cpuHalted: this.cpuHalted,
        });
    }


    // Connect CPU to MemoryBus
    connectToMemoryBus(memoryBus: MemoryBus) {
        this.memoryBus = memoryBus;
        this.emit('memorybus-connected', { memoryBus });
    }


    executeCycle() {
        if (this.cpuHalted) return;
        if (this.status !== 'ready') return;

        this.status = 'executingCycle';
        this.cpuCycle++

        this.emit('state', {
            cpuCycle: this.cpuCycle,
        })


        for (const core of this.cores) {
            core.executeCoreCycle();
        }

        this.status = 'ready';
    }


    clearMemoryCache() {
        this.cacheL1 = new Map;
    }


    readMemoryCache(address: u16): u8 | null {
        const cached = this.cacheL1.get(address);
        return cached ?? null;
    }


    writeMemoryCache(address: u16, value: u8) {
        // update cache
        this.cacheL1.set(address, value);

        // delete overload
        if (this.cacheL1.size > this.cacheL1MaxSize) {
            const deleteCount = this.cacheL1.size - this.cacheL1MaxSize
            const keysToDelete = Array.from(this.cacheL1.keys()).slice(0, deleteCount)

            for (const key of keysToDelete) {
                this.cacheL1.delete(key);
            }
        }
    }


    deleteMemoryCache(address: u16) {
        // delete cache
        if (this.cacheL1.has(address)) {
            this.cacheL1.delete(address);
        }
    }


    readMemory(address: u16) {
        // read cache
        if (isRAM(address)) {
            const cached = this.readMemoryCache(address)
            if (cached !== null) return cached
        }

        if (!this.memoryBus) return U8(0);
        const value = this.memoryBus.readMemory(address);

        // write cache
        if (isRAM(address)) {
            this.writeMemoryCache(address, value)
        }

        return value;
    }


    writeMemory(address: u16, value: u8) {
        if (!this.memoryBus) throw new Error("Missing MemoryBus")

        this.memoryBus.writeMemory(address, value);

        if (isRAM(address)) {
            this.deleteMemoryCache(address)
            //this.writeMemoryCache(address, value)
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
        this.cpuCycle = 0;
        //this.setPaused(true);

        this.interruptsEnabled = true;
        this.inInterruptHandler = false;
        this.currentBreakpoint = null;
        this.cacheL1 = new Map

        //this.registers = new Map(initialRegisters);
        //this.cpuHalted = false;

        for (const core of this.cores) {
            core.reset();
        }

        if (this.cores[0]) {
            this.cores[0].start()
        }

        // Update UI State
        this.emit('state', {
            //cpuHalted: this.cpuHalted,
            cpuCycle: this.cpuCycle,
            //registers: this.registers,
            interruptsEnabled: this.interruptsEnabled,
            inInterruptHandler: this.inInterruptHandler,
            currentBreakpoint: this.currentBreakpoint,
        })
    }

}


// Arithmetic Logic Unit
const ALU = {
    not:(a: u8): { result: u8, flags: { zero: boolean, carry: boolean } } => {
        const result = ((~a) & 0xFF) as u8;
        const carry = (~a) > 0xFF;
        const zero = result === 0;
        const flags = ({ zero, carry });
        return { result, flags };
    },
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

    // Shift bits
    shl: (value: u8, count: u8 = U8(1)): { result: u8, flags: { zero: boolean, carry: boolean } } => {
        let result = value;
        let carry = false;

        for (let i = 0; i < count; i++) {
            carry = !!(result & 0x80);  // MSB -> carry
            result = ((result << 1) & 0xFF) as u8;
        }

        const zero = result === 0;
        return { result, flags: { zero, carry } };
    },

    shr: (value: u8, count: u8 = U8(1)): { result: u8, flags: { zero: boolean, carry: boolean } } => {
        let result = value;
        let carry = false;

        for (let i = 0; i < count; i++) {
            carry = !!(result & 0x01);  // LSB -> carry
            result = ((result >> 1) & 0xFF) as u8;
        }

        const zero = result === 0;
        return { result, flags: { zero, carry } };
    },

    // Rotation avec carry
    rol: (value: u8, count: u8 = U8(1), carryIn: boolean = false): { result: u8, flags: { zero: boolean, carry: boolean } } => {
        let result = value;
        let carry = carryIn;

        for (let i = 0; i < count; i++) {
            const newCarry = !!(result & 0x80);
            result = ((result << 1) & 0xFF) as u8;
            if (carry) result = U8(result | 0x01);
            carry = newCarry;
        }

        const zero = result === 0;
        return { result, flags: { zero, carry } };
    },

    ror: (value: u8, count: u8 = U8(1), carryIn: boolean = false): { result: u8, flags: { zero: boolean, carry: boolean } } => {
        let result = value;
        let carry = carryIn;

        for (let i = 0; i < count; i++) {
            const newCarry = !!(result & 0x01);
            result = ((result >> 1) & 0xFF) as u8;
            if (carry) result = U8(result | 0x80);
            carry = newCarry;
        }

        const zero = result === 0;
        return { result, flags: { zero, carry } };
    },

    // Test & Compare
    test: (a: u8, b: u8): { flags: { zero: boolean, carry: boolean } } => { // comme AND mais ne stocke pas le résultat
        const result = ((a & b) & 0xFF) as u8;
        const flags = ({ zero: result === 0, carry: false });
        return { flags };
    },

    cmp: (a: u8, b: u8): { flags: { zero: boolean, carry: boolean } } => {
        // Compare a et b: a - b (sans stocker le résultat)
        const result = ((a - b) & 0xFF) as u8;
        const zero = result === 0;
        const carry = a < b; // Borrow
        const flags = ({ zero, carry });
        return { flags };
    },
}

