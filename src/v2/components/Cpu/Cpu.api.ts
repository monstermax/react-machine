
import { EventEmitter } from "eventemitter3";

import { toHex, U16, U8 } from "@/lib/integers";
import { Opcode } from "@/cpus/default/cpu_instructions";
import { MEMORY_MAP } from "@/lib/memory_map_16bit";

import type { MemoryBus } from "../Memory/MemoryBus.api";
import type { Clock } from "./Clock.api";
import type { Register, Register16, u16, u8 } from "@/types/cpu.types";
import type { Interrupt } from "./Interrupt.api";
import type { ICpu } from "./ICpu";
import { BaseCpu } from "./BaseCpu.api";


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

        if (this.cpu.currentBreakpoint === null && this.cpu.breakpoints.has(pc) && !this.cpu.paused) {
            this.cpu.setPaused(true);
            this.cpu.currentBreakpoint = pc;
            // TODO: petit bug à corriger. si on step jusqu'a un breakpoint. quand on redémarrage il toussote

            // Update UI State
            this.cpu.emit('state', {
                paused: this.cpu.paused,
            })

            return;
        }

        if (this.cpu.currentBreakpoint === pc) {
            //this.currentBreakpoint = null;
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


        const instruction = this.cpu.memoryBus.readMemory(pc);
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

        const irq = this.cpu.interrupt.getPendingIRQ();
        if (irq === null) return;

        console.log(`🎯 Handling IRQ ${irq}, handlerAddr = ${this.cpu.interrupt.handlerAddr.toString(16)}`);

        // 1. Désactiver interruptions
        this.cpu.interruptsEnabled = false;
        this.cpu.inInterruptHandler = true;

        // 2. Sauvegarder contexte sur la pile
        const sp = this.getRegister("SP");
        const pc = this.getRegister("PC");
        const flags = this.getRegister("FLAGS");

        // PUSH Flags
        this.cpu.memoryBus.writeMemory(sp, flags);
        this.setRegister("SP", (sp - 1) as u16);

        // PUSH PC (little-endian)
        this.cpu.memoryBus.writeMemory((sp - 1) as u16, ((pc >> 8) & 0xFF) as u8); // High byte
        this.cpu.memoryBus.writeMemory((sp - 2) as u16, (pc & 0xFF) as u8);      // Low byte
        this.setRegister("SP", (sp - 3) as u16);

        // 3. Acquitter l'interruption
        this.cpu.interrupt.acknowledgeInterrupt(irq);

        // 4. Sauter au handler
        let handlerAddress = this.cpu.interrupt.handlerAddr;
        if (handlerAddress === 0) {
            // Vecteur par défaut: 0x0040 + irq*4
            handlerAddress = (0x0040 + (irq * 4)) as u16;
        }

        this.setRegister("PC", handlerAddress);

        console.log(`🔄 Interruption IRQ${irq} -> Handler 0x${handlerAddress.toString(16)}`);
    }


    executeOpcode(pc: u16, instruction: u8) {
        if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus")

        switch (instruction) {
            // ===== SYSTEM =====
            case Opcode.NOP:
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.CORES_COUNT: {
                this.setRegister("A", U8(this.cpu.cores.length));
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CORE_STATUS: {
                const coreIdx = this.getRegister("A");

                if (this.cpu.cores[coreIdx]) {
                    this.setRegister("A", U8(this.cpu.cores[coreIdx].coreHalted ? 0 : 1));
                    this.setFlags(this.cpu.cores[coreIdx].coreHalted, false);

                } else {
                    this.setRegister("A", U8(0));
                    this.setFlags(true, false);
                }

                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.CORE_INIT: {
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

            case Opcode.CORE_START: {
                const coreIdx = this.getRegister("A");

                if (this.cpu.cores[coreIdx]) {
                    this.cpu.cores[coreIdx].start()
                }

                if (coreIdx !== this.idx) {
                    this.setRegister("PC", (pc + 1) as u16);
                }
                break;
            }

            case Opcode.CORE_HALT: {
                const coreIdx = this.getRegister("A");

                if (this.cpu.cores[coreIdx]) {
                    this.cpu.cores[coreIdx].stop()
                }

                if (coreIdx !== this.idx) {
                    this.setRegister("PC", (pc + 1) as u16);
                }
                break;
            }

            case Opcode.SYSCALL:
                this.handleSyscall(pc);
                break;

            case Opcode.GET_FREQ:
                this.setRegister("A", U8(this.cpu.clock?.clockFrequency ?? 0));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.SET_FREQ:
                if (this.cpu.clock) {
                    this.cpu.clock.clockFrequency = this.cpu.readMem8(pc);
                    this.cpu.clock.restart()

                    // Update UI State
                    this.cpu.clock.emit('state', {
                        clockFrequency: this.cpu.clock.clockFrequency,
                    })
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

                    if (!this.cpu.paused) {
                        this.cpu.setPaused(true);
                    }
                }
                break;

            case Opcode.HALT:
                this.stop();
                break;

            // ===== ALU INSTRUCTIONS =====
            case Opcode.ADD: {
                const { result, flags } = ALU.add(this.getRegister("A"), this.getRegister("B"));
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.SUB: {
                const { result, flags } = ALU.sub(this.getRegister("A"), this.getRegister("B"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.AND: {
                const { result, flags } = ALU.and(this.getRegister("A"), this.getRegister("B"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.OR: {
                const { result, flags } = ALU.or(this.getRegister("A"), this.getRegister("B"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.XOR: {
                const { result, flags } = ALU.xor(this.getRegister("A"), this.getRegister("B"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.INC_A: {
                const { result, flags } = ALU.inc(this.getRegister("A"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.DEC_A: {
                const { result, flags } = ALU.dec(this.getRegister("A"))
                this.setRegister("A", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.INC_B: {
                const { result, flags } = ALU.inc(this.getRegister("B"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.DEC_B: {
                const { result, flags } = ALU.dec(this.getRegister("B"))
                this.setRegister("B", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.INC_C: {
                const { result, flags } = ALU.inc(this.getRegister("C"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.DEC_C: {
                const { result, flags } = ALU.dec(this.getRegister("C"))
                this.setRegister("C", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.INC_D: {
                const { result, flags } = ALU.inc(this.getRegister("D"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.DEC_D: {
                const { result, flags } = ALU.dec(this.getRegister("D"))
                this.setRegister("D", result);
                this.setFlags(flags.zero, flags.carry);
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            // ===== JUMP INSTRUCTIONS =====
            case Opcode.JMP:
                this.setRegister("PC", this.cpu.readMem16(pc));
                break;

            case Opcode.JZ:
                if (this.getFlag('zero')) {
                    this.setRegister("PC", this.cpu.readMem16(pc));
                } else {
                    this.setRegister("PC", (pc + 3) as u16);
                }
                break;

            case Opcode.JNZ:
                if (!this.getFlag('zero')) {
                    this.setRegister("PC", this.cpu.readMem16(pc));
                } else {
                    this.setRegister("PC", (pc + 3) as u16);
                }
                break;

            case Opcode.JC:
                if (this.getFlag('carry')) {
                    this.setRegister("PC", this.cpu.readMem16(pc));
                } else {
                    this.setRegister("PC", (pc + 3) as u16);
                }
                break;

            case Opcode.JNC:
                if (!this.getFlag('carry')) {
                    this.setRegister("PC", this.cpu.readMem16(pc));
                } else {
                    this.setRegister("PC", (pc + 3) as u16);
                }
                break;

            // ===== PUSH =====
            case Opcode.PUSH_A: {
                this.pushValue(this.getRegister("A"));
                this.setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.PUSH_B:
                this.pushValue(this.getRegister("B"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.PUSH_C:
                this.pushValue(this.getRegister("C"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.PUSH_D:
                this.pushValue(this.getRegister("D"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            // ===== POP =====
            case Opcode.POP_A:
                this.setRegister("A", this.popValue());
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.POP_B:
                this.setRegister("B", this.popValue());
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.POP_C:
                this.setRegister("C", this.popValue());
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.POP_D:
                this.setRegister("D", this.popValue());
                this.setRegister("PC", (pc + 1) as u16);
                break;

            // ===== STACK =====
            case Opcode.SET_SP:
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

            // ===== MOV register-register =====
            case Opcode.MOV_AB:  // A → B
                this.setRegister("B", this.getRegister("A"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_AC:  // A → C
                this.setRegister("C", this.getRegister("A"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_AD:  // A → D
                this.setRegister("D", this.getRegister("A"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_BA:  // B → A
                this.setRegister("A", this.getRegister("B"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_BC:  // B → C
                this.setRegister("C", this.getRegister("B"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_BD:  // B → D
                this.setRegister("D", this.getRegister("B"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_CA:  // C → A
                this.setRegister("A", this.getRegister("C"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_CB:  // C → B
                this.setRegister("B", this.getRegister("C"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_CD:  // C → D
                this.setRegister("D", this.getRegister("C"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_DA:  // D → A
                this.setRegister("A", this.getRegister("D"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_DB:  // D → B
                this.setRegister("B", this.getRegister("D"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_DC:  // D → C
                this.setRegister("C", this.getRegister("D"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            // ===== MOV register-immediate (set flags) ===== => TODO: ne pas modifier les flags
            case Opcode.MOV_A_IMM:  // MOV A, imm8
                const immA = this.cpu.memoryBus.readMemory((pc + 1) as u16);
                this.setRegister("A", immA);
                this.setFlags(immA === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 2) as u16);
                break;

            case Opcode.MOV_B_IMM:  // MOV B, imm8
                const immB = this.cpu.memoryBus.readMemory((pc + 1) as u16);
                this.setRegister("B", immB);
                this.setFlags(immB === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 2) as u16);
                break;

            case Opcode.MOV_C_IMM:  // MOV C, imm8
                const immC = this.cpu.memoryBus.readMemory((pc + 1) as u16);
                this.setRegister("C", immC);
                this.setFlags(immC === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 2) as u16);
                break;

            case Opcode.MOV_D_IMM:  // MOV D, imm8
                const immD = this.cpu.memoryBus.readMemory((pc + 1) as u16);
                this.setRegister("D", immD);
                this.setFlags(immD === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 2) as u16);
                break;

            // ===== MOV memory-register (set flags) ===== => TODO: ne pas modifier les flags
            case Opcode.MOV_A_MEM:  // MOV A, [addr16]
                const addrA = this.cpu.readMem16(pc);
                const memValueA = this.cpu.memoryBus.readMemory(addrA);
                this.setRegister("A", memValueA);
                this.setFlags(memValueA === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_B_MEM:  // MOV B, [addr16]
                const addrB = this.cpu.readMem16(pc);
                const memValueB = this.cpu.memoryBus.readMemory(addrB);
                this.setRegister("B", memValueB);
                this.setFlags(memValueB === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_C_MEM:  // MOV C, [addr16]
                const addrC = this.cpu.readMem16(pc);
                const memValueC = this.cpu.memoryBus.readMemory(addrC);
                this.setRegister("C", memValueC);
                this.setFlags(memValueC === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_D_MEM:  // MOV D, [addr16]
                const addrD = this.cpu.readMem16(pc);
                const memValueD = this.cpu.memoryBus.readMemory(addrD);
                this.setRegister("D", memValueD);
                this.setFlags(memValueD === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 3) as u16);
                break;

            // ===== MOV register-memory =====
            case Opcode.MOV_MEM_A:  // MOV [addr16], A
                const addrMemA = this.cpu.readMem16(pc);
                this.cpu.memoryBus.writeMemory(addrMemA, this.getRegister("A"));
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_MEM_B:  // MOV [addr16], B
                const addrMemB = this.cpu.readMem16(pc);
                this.cpu.memoryBus.writeMemory(addrMemB, this.getRegister("B"));
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_MEM_C:  // MOV [addr16], C
                const addrMemC = this.cpu.readMem16(pc);
                this.cpu.memoryBus.writeMemory(addrMemC, this.getRegister("C"));
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_MEM_D:  // MOV [addr16], D
                const addrMemD = this.cpu.readMem16(pc);
                this.cpu.memoryBus.writeMemory(addrMemD, this.getRegister("D"));
                this.setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_A_PTR_CD:  // MOV A, *[C:D] => TODO: ne pas modifier les flags
                const ptrCD_LoadA = ((this.getRegister("D") << 8) | this.getRegister("C")) as u16;
                const valuePtr_A = this.cpu.memoryBus.readMemory(ptrCD_LoadA);
                this.setRegister("A", valuePtr_A);
                this.setFlags(valuePtr_A === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_B_PTR_CD:  // MOV B, *[C:D] => TODO: ne pas modifier les flags
                const ptrCD_LoadB = ((this.getRegister("D") << 8) | this.getRegister("C")) as u16;
                const valuePtr_B = this.cpu.memoryBus.readMemory(ptrCD_LoadB);
                this.setRegister("B", valuePtr_B);
                this.setFlags(valuePtr_B === 0, false);  // Set zero flag
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_PTR_CD_A:  // MOV *[C:D], A
                const ptrCD_StoreA = ((this.getRegister("D") << 8) | this.getRegister("C")) as u16;
                this.cpu.memoryBus.writeMemory(ptrCD_StoreA, this.getRegister("A"));
                this.setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_PTR_CD_B:  // MOV *[C:D], B
                const ptrCD_StoreB = ((this.getRegister("D") << 8) | this.getRegister("C")) as u16;
                this.cpu.memoryBus.writeMemory(ptrCD_StoreB, this.getRegister("B"));
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

        const syscallNum = this.cpu.memoryBus.readMemory((pc + 1) as u16);

        switch (syscallNum) {
            case 0: // exit
                console.log("📍 Program exit (syscall 0)");

                if (this.idx !== 0) {
                    this.stop();
                    break;
                }

                // Clear program memory - pour eviter que le programme ne se relance automatiquement (si mini_os v1)
                //this.cpu.memoryBus.writeMemory(MEMORY_MAP.OS_START, U8(0))
                for (let addr = MEMORY_MAP.PROGRAM_START; addr <= MEMORY_MAP.PROGRAM_END; addr++) {
                    //this.cpu.memoryBus.writeMemory(addr, 0 as u8);
                    //break; // TRES TRES LENT !!! => solution : on ne vide que la 1ere adresse

                    if (this.cpu.memoryBus.ram) {
                        this.cpu.memoryBus.ram.storage.delete(addr);
                    }
                }

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
        this.cpu.memoryBus.writeMemory(sp, ((returnAddr >> 8) & 0xFF) as u8);
        sp = ((sp - 1) & 0xFFFF) as u16;

        // PUSH low byte
        this.cpu.memoryBus.writeMemory(sp, (returnAddr & 0xFF) as u8);
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
        const low = this.cpu.memoryBus.readMemory(sp);

        // POP high byte
        sp = ((sp + 1) & 0xFFFF) as u16;
        const high = this.cpu.memoryBus.readMemory(sp);

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
        const pcLow = this.cpu.memoryBus.readMemory(sp);

        // POP PC - high
        sp = ((sp + 1) & 0xFFFF) as u16;
        const pcHigh = this.cpu.memoryBus.readMemory(sp);
        const returnAddr = ((pcHigh << 8) | pcLow) as u16;

        // POP Flags
        sp = ((sp + 1) & 0xFFFF) as u16;
        const flags = this.cpu.memoryBus.readMemory(sp);

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
        this.cpu.memoryBus.writeMemory(sp, value);

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
        const value = this.cpu.memoryBus.readMemory(sp);

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
    public cores: CpuCore[] = [];
    public cpuHalted: boolean = false;
    public paused: boolean = true;
    public clockCycle: number = 0;
    //public registers: Map<string, u8 | u16> = new Map;
    public breakpoints: Set<number> = new Set;

    // Composants
    public memoryBus: MemoryBus | null = null;
    public interrupt: Interrupt | null = null;
    public clock: Clock | null = null;

    public currentBreakpoint: number | null = null;
    public interruptsEnabled: boolean = false;
    public inInterruptHandler: boolean = false;


    constructor(coresCount=1) {
        //console.log(`Initializing Cpu`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);

        for (let i=0; i<coresCount; i++) {
            const core = new CpuCore(this, i);
            this.cores.push(core)

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

        this.reset()

    }


    executeCycle() {
        if (this.cpuHalted) return;
        if (this.status !== 'ready') return;

        this.status = 'executingCycle';
        this.clockCycle++

        this.emit('state', {
            clockCycle: this.clockCycle,
        })


        for (const core of this.cores) {
            core.executeCoreCycle();
        }

        this.status = 'ready';
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
        this.clockCycle = 0;
        //this.setPaused(true);

        this.interruptsEnabled = false;
        this.inInterruptHandler = false;
        this.currentBreakpoint = null;

        //this.registers = new Map(initialRegisters);
        this.cpuHalted = false;

        for (const core of this.cores) {
            core.reset();
        }

        if (this.cores[0]) {
            this.cores[0].start()
        }

        // Update UI State
        this.emit('state', {
            cpuHalted: this.cpuHalted,
            clockCycle: this.clockCycle,
            //registers: this.registers,
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

