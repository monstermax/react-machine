
import { useCallback, useState } from "react";

import { Opcode } from "@/lib/instructions";
import { MEMORY_MAP } from "@/lib/memory_map";
import type { MemoryHook } from "./useMemory";

import type { Register } from "@/types/cpu.types";
import type { IOHook } from "./useIo";


export const useCpu = (memory: MemoryHook, ioHook: IOHook): CpuHook => {

    // CPU STATES
    const [registers, setRegisters] = useState<Map<string, number>>(new Map([
        ["A", 0],      // Register A
        ["B", 0],      // Register B
        ["C", 0],      // Register C
        ["D", 0],      // Register D
        ["PC", 0],     // Program Counter
        ["IR", 0],     // Instruction Register
        ["SP", 0],     // Stack Pointer
        ["FLAGS", 0],  // Bit 0: Carry, Bit 1: Zero
    ]));

    const [halted, setHalted] = useState<boolean>(false);

    const [clockCycle, setClockCycle] = useState<number>(0);

    const [interruptsEnabled, setInterruptsEnabled] = useState(false);
    const [inInterruptHandler, setInInterruptHandler] = useState(false);


    // ALU
    const ALU = {
        add: (a: number, b: number): number => {
            const result = (a + b) & 0xFF;
            const carry = (a + b) > 0xFF;
            const zero = result === 0;
            setFlags(zero, carry);
            return result;
        },

        sub: (a: number, b: number): number => {
            const result = (a - b) & 0xFF;
            const zero = result === 0;
            const carry = a < b; // Borrow
            setFlags(zero, carry);
            return result;
        },

        and: (a: number, b: number): number => {
            const result = (a & b) & 0xFF;
            setFlags(result === 0, false);
            return result;
        },

        or: (a: number, b: number): number => {
            const result = (a | b) & 0xFF;
            setFlags(result === 0, false);
            return result;
        },

        xor: (a: number, b: number): number => {
            const result = (a ^ b) & 0xFF;
            setFlags(result === 0, false);
            return result;
        },

        inc: (value: number): number => {
            const result = (value + 1) & 0xFF;
            setFlags(result === 0, false);
            return result;
        },

        dec: (value: number): number => {
            const result = (value - 1) & 0xFF;
            setFlags(result === 0, false);
            return result;
        },
    }


    // CPU METHODS

    const getRegister = useCallback((reg: Register): number => {
        return registers.get(reg) ?? 0;
    }, [registers])


    const setRegister = useCallback((reg: Register, value: number) => {
        // PC et SP sont 16-bit, les autres 8-bit
        if (reg === "PC" || reg === "SP") {
            registers.set(reg, value & 0xFFFF); // 16-bit

        } else {
            registers.set(reg, value & 0xFF);   // 8-bit
        }
    }, [registers])


    const getFlag = (flag: 'zero' | 'carry'): boolean => {
        const flags = getRegister("FLAGS");
        return flag === 'zero' ? !!(flags & 0b10) : !!(flags & 0b01);
    }


    const setFlags = useCallback((zero: boolean, carry: boolean) => {
        registers.set("FLAGS", (zero ? 0b10 : 0) | (carry ? 0b01 : 0));
    }, [registers])


    const reset = useCallback(() => {
        // Hard-wired reset vector - CPU démarre TOUJOURS à 0x0000 (ROM)
        setRegister("PC", MEMORY_MAP.ROM_START);

        for (const [key] of registers) {
            if (key !== "PC") {
                setRegister(key as Register, 0);
            }
        }

        setHalted(false);
        setClockCycle(0);
    }, [registers])


    const tick = () => {
        setClockCycle(c => c + 1)
    }


    // Execute a CPU cycle
    const executeCycle = useCallback(() => {
        if (halted) return;

        // Increment clockCycle
        tick();

        // Vérifier les interruptions AVANT de fetch
        if (interruptsEnabled && !inInterruptHandler && ioHook.interrupt.hasPendingInterrupt()) {
            handleInterrupt();
            return; // On saute l'exécution normale ce cycle
        }

        // Read current instruction
        const pc = getRegister("PC");
        const instruction = memory.readMemory(pc);

        // Store current instruction into IR Register
        setRegister("IR", instruction);

        const opcode = getRegister("IR");

        // Execute logical operations
        executeOpcode(pc, opcode);

    }, [halted, memory, interruptsEnabled, inInterruptHandler, ioHook]);


    const handleInterrupt = useCallback(() => {
        const irq = ioHook.interrupt.getPendingIRQ();
        if (irq === null) return;

        // 1. Désactiver interruptions
        setInterruptsEnabled(false);
        setInInterruptHandler(true);

        // 2. Sauvegarder contexte sur la pile
        const sp = getRegister("SP");
        const pc = getRegister("PC");
        const flags = getRegister("FLAGS");

        // PUSH Flags
        memory.writeMemory(sp, flags);
        setRegister("SP", sp - 1);

        // PUSH PC (little-endian)
        memory.writeMemory(sp - 1, pc & 0xFF);      // Low byte
        memory.writeMemory(sp - 2, (pc >> 8) & 0xFF); // High byte
        setRegister("SP", sp - 3);

        // 3. Acquitter l'interruption
        ioHook.interrupt.acknowledgeInterrupt(irq);

        // 4. Sauter au handler
        let handlerAddress = ioHook.interrupt.handlerAddr;
        if (handlerAddress === 0) {
            // Vecteur par défaut: 0x0040 + irq*4
            handlerAddress = 0x0040 + (irq * 4);
        }

        setRegister("PC", handlerAddress);

        console.log(`🔄 Interruption IRQ${irq} -> Handler 0x${handlerAddress.toString(16)}`);
    }, [ioHook.interrupt, memory]);


    // Execute an instruction
    const executeOpcode = useCallback((pc: number, instruction: number) => {
        switch (instruction) {
            // ===== SYSTEM =====
            case Opcode.NOP:
                setRegister("PC", pc + 1);
                break;

            case Opcode.SYSCALL:
                handleSyscall(pc);
                break;

            case Opcode.HALT:
                setHalted(true);
                break;

            // ===== REGISTERS INSTRUCTIONS =====
            case Opcode.R_LOAD_A:
                setRegister("A", memory.readMemory(pc + 1));
                setRegister("PC", pc + 2);
                break;

            case Opcode.R_LOAD_B:
                setRegister("B", memory.readMemory(pc + 1));
                setRegister("PC", pc + 2);
                break;

            case Opcode.R_LOAD_C:
                setRegister("C", memory.readMemory(pc + 1));
                setRegister("PC", pc + 2);
                break;

            case Opcode.R_LOAD_D:
                setRegister("D", memory.readMemory(pc + 1));
                setRegister("PC", pc + 2);
                break;

            // ===== ALU INSTRUCTIONS =====
            case Opcode.ADD:
                setRegister("A", ALU.add(getRegister("A"), getRegister("B")));
                setRegister("PC", pc + 1);
                break;

            case Opcode.SUB:
                setRegister("A", ALU.sub(getRegister("A"), getRegister("B")));
                setRegister("PC", pc + 1);
                break;

            case Opcode.AND:
                setRegister("A", ALU.and(getRegister("A"), getRegister("B")));
                setRegister("PC", pc + 1);
                break;

            case Opcode.OR:
                setRegister("A", ALU.or(getRegister("A"), getRegister("B")));
                setRegister("PC", pc + 1);
                break;

            case Opcode.XOR:
                setRegister("A", ALU.xor(getRegister("A"), getRegister("B")));
                setRegister("PC", pc + 1);
                break;

            case Opcode.INC_A:
                setRegister("A", ALU.inc(getRegister("A")));
                setRegister("PC", pc + 1);
                break;

            case Opcode.DEC_A:
                setRegister("A", ALU.dec(getRegister("A")));
                setRegister("PC", pc + 1);
                break;

            case Opcode.INC_B:
                setRegister("B", ALU.inc(getRegister("B")));
                setRegister("PC", pc + 1);
                break;
            case Opcode.DEC_B:
                setRegister("B", ALU.dec(getRegister("B")));
                setRegister("PC", pc + 1);
                break;

            case Opcode.INC_C:
                setRegister("C", ALU.inc(getRegister("C")));
                setRegister("PC", pc + 1);
                break;

            case Opcode.DEC_C:
                setRegister("C", ALU.dec(getRegister("C")));
                setRegister("PC", pc + 1);
                break;

            case Opcode.INC_D:
                setRegister("D", ALU.inc(getRegister("D")));
                setRegister("PC", pc + 1);
                break;

            case Opcode.DEC_D:
                setRegister("D", ALU.dec(getRegister("D")));
                setRegister("PC", pc + 1);
                break;

            // ===== JUMP INSTRUCTIONS =====
            case Opcode.JMP:
                const jmpLow = memory.readMemory(pc + 1);
                const jmpHigh = memory.readMemory(pc + 2);
                const jmpAddr = (jmpHigh << 8) | jmpLow;
                setRegister("PC", jmpAddr);
                break;

            case Opcode.JZ:
                if (getFlag('zero')) {
                    const jzLow = memory.readMemory(pc + 1);
                    const jzHigh = memory.readMemory(pc + 2);
                    const jzAddr = (jzHigh << 8) | jzLow;
                    setRegister("PC", jzAddr);
                } else {
                    setRegister("PC", pc + 3);
                }
                break;

            case Opcode.JNZ:
                if (!getFlag('zero')) {
                    const jnzLow = memory.readMemory(pc + 1);
                    const jnzHigh = memory.readMemory(pc + 2);
                    const jnzAddr = (jnzHigh << 8) | jnzLow;
                    setRegister("PC", jnzAddr);
                } else {
                    setRegister("PC", pc + 3);
                }
                break;

            case Opcode.JC:
                if (getFlag('carry')) {
                    const jcLow = memory.readMemory(pc + 1);
                    const jcHigh = memory.readMemory(pc + 2);
                    const jcAddr = (jcHigh << 8) | jcLow;
                    setRegister("PC", jcAddr);
                } else {
                    setRegister("PC", pc + 3);
                }
                break;

            // ===== MEMORY STORE INSTRUCTIONS =====
            case Opcode.M_STORE_A:
                // M_STORE_A addr16 : Memory[addr16] = A
                const storeLow = memory.readMemory(pc + 1);
                const storeHigh = memory.readMemory(pc + 2);
                const storeAddr = (storeHigh << 8) | storeLow;
                memory.writeMemory(storeAddr, getRegister("A"));
                setRegister("PC", pc + 3);
                break;

            case Opcode.M_STORE_B:
                // M_STORE_B addr16 : Memory[addr16] = B
                const storeBLow = memory.readMemory(pc + 1);
                const storeBHigh = memory.readMemory(pc + 2);
                const storeBAddr = (storeBHigh << 8) | storeBLow;
                memory.writeMemory(storeBAddr, getRegister("B"));
                setRegister("PC", pc + 3);
                break;

            case Opcode.M_STORE_C:
                // M_STORE_C addr16 : Memory[addr16] = C
                const storeCLow = memory.readMemory(pc + 1);
                const storeCHigh = memory.readMemory(pc + 2);
                const storeCAddr = (storeCHigh << 8) | storeCLow;
                memory.writeMemory(storeCAddr, getRegister("C"));
                setRegister("PC", pc + 3);
                break;

            case Opcode.M_STORE_D:
                // M_STORE_D addr16 : Memory[addr16] = D
                const storeDLow = memory.readMemory(pc + 1);
                const storeDHigh = memory.readMemory(pc + 2);
                const storeDAddr = (storeDHigh << 8) | storeDLow;
                memory.writeMemory(storeDAddr, getRegister("D"));
                setRegister("PC", pc + 3);
                break;

            // ===== MEMORY LOAD INSTRUCTIONS =====
            case Opcode.M_LOAD_A:
                // M_LOAD_A addr16 : A = Memory[addr16]
                const loadLow = memory.readMemory(pc + 1);
                const loadHigh = memory.readMemory(pc + 2);
                const loadAddr = (loadHigh << 8) | loadLow;
                const value = memory.readMemory(loadAddr);
                setRegister("A", value);
                setFlags(value === 0, false);
                setRegister("PC", pc + 3);
                break;

            case Opcode.M_LOAD_B:
                // M_LOAD_B addr16 : B = Memory[addr16]
                const loadBLow = memory.readMemory(pc + 1);
                const loadBHigh = memory.readMemory(pc + 2);
                const loadBAddr = (loadBHigh << 8) | loadBLow;
                const valueB = memory.readMemory(loadBAddr);
                setRegister("B", valueB);
                setFlags(valueB === 0, false);
                setRegister("PC", pc + 3);
                break;

            case Opcode.M_LOAD_C:
                // M_LOAD_C addr16 : C = Memory[addr16]
                const loadCLow = memory.readMemory(pc + 1);
                const loadCHigh = memory.readMemory(pc + 2);
                const loadCAddr = (loadCHigh << 8) | loadCLow;
                const valueC = memory.readMemory(loadCAddr);
                setRegister("C", valueC);
                setFlags(valueC === 0, false);
                setRegister("PC", pc + 3);
                break;

            case Opcode.M_LOAD_D:
                // M_LOAD_D addr16 : D = Memory[addr16]
                const loadDLow = memory.readMemory(pc + 1);
                const loadDHigh = memory.readMemory(pc + 2);
                const loadDAddr = (loadDHigh << 8) | loadDLow;
                const valueD = memory.readMemory(loadDAddr);
                setRegister("D", valueD);
                setFlags(valueD === 0, false);
                setRegister("PC", pc + 3);
                break;

            // ===== PUSH =====
            case Opcode.PUSH_A: {
                pushValue(getRegister("A"));
                setRegister("PC", pc + 1);
                break;
            }

            case Opcode.PUSH_B:
                pushValue(getRegister("B"));
                setRegister("PC", pc + 1);
                break;

            case Opcode.PUSH_C:
                pushValue(getRegister("C"));
                setRegister("PC", pc + 1);
                break;

            case Opcode.PUSH_D:
                pushValue(getRegister("D"));
                setRegister("PC", pc + 1);
                break;

            // ===== POP =====
            case Opcode.POP_A:
                setRegister("A", popValue());
                setRegister("PC", pc + 1);
                break;

            case Opcode.POP_B:
                setRegister("B", popValue());
                setRegister("PC", pc + 1);
                break;

            case Opcode.POP_C:
                setRegister("C", popValue());
                setRegister("PC", pc + 1);
                break;

            case Opcode.POP_D:
                setRegister("D", popValue());
                setRegister("PC", pc + 1);
                break;

            // ===== STACK =====
            case Opcode.SET_SP:
                // SET_SP imm16 : SP = valeur immédiate 16-bit
                const spLow = memory.readMemory(pc + 1);
                const spHigh = memory.readMemory(pc + 2);
                const newSP = (spHigh << 8) | spLow;

                setRegister("SP", newSP);
                setRegister("PC", pc + 3);
                break;

            case Opcode.CALL:
                handleCall(pc);
                break;

            case Opcode.RET:
                handleRet();
                break;

            // ===== INTERRUPTS =====
            case Opcode.EI:  // Enable Interrupts
                setInterruptsEnabled(true);
                setRegister("PC", pc + 1);
                break;

            case Opcode.DI:  // Disable Interrupts
                setInterruptsEnabled(false);
                setRegister("PC", pc + 1);
                break;

            case Opcode.IRET: // Return from Interrupt
                handleIRet();
                break;

            default:
                console.error(`Unknown opcode at 0x${pc.toString(16)}: 0x${instruction.toString(16)}`);
                setHalted(true);
        }
    }, [memory]);


    // Fonction pour push une valeur sur la pile
    const pushValue = useCallback((value: number) => {
        let sp = getRegister("SP");

        // Écrire la valeur à [SP]
        memory.writeMemory(sp, value);

        // Décrémenter SP (pile descend)
        sp = (sp - 1) & 0xFFFF;
        setRegister("SP", sp);
    }, [memory, getRegister, setRegister]);


    // Fonction pour pop une valeur de la pile
    const popValue = useCallback((): number => {
        let sp = getRegister("SP");

        // Incrémenter SP d'abord (pile remonte)
        sp = (sp + 1) & 0xFFFF;

        // Lire la valeur à [SP]
        const value = memory.readMemory(sp);

        // Mettre à jour SP
        setRegister("SP", sp);

        return value;
    }, [memory, getRegister, setRegister]);


    // Fonction pour CALL
    const handleSyscall = useCallback((pc: number) => {
        const syscallNum = memory.readMemory(pc + 1);

        switch (syscallNum) {
            case 0: // exit
                console.log("📍 Program exit (syscall 0)");
                // Clear program memory
                for (let addr = MEMORY_MAP.PROGRAM_START; addr <= MEMORY_MAP.PROGRAM_END; addr++) {
                    memory.writeMemory(addr, 0);
                    break; // TRES TRES LENT !!! => on ne vide que la 1ere adresse
                }

                // Retour à l'OS
                setRegister("PC", MEMORY_MAP.OS_START);
                break;

            case 1: // pause
                // TODO: mettre en pause dans l'interface UI
                setRegister("PC", pc + 2);
                break;

            case 2: // print_char - afficher A comme caractère
                console.log(`📝 print_char: ${String.fromCharCode(getRegister("A"))}`);
                setRegister("PC", pc + 2);
                break;

            case 3: // print_num - afficher A comme nombre
                console.log(`📊 print_num: ${getRegister("A")}`);
                setRegister("PC", pc + 2);
                break;

            // Autres syscalls possibles : read, write, etc.

            default:
                console.warn(`Unknown syscall: ${syscallNum}`);
                setRegister("PC", pc + 2);
                break;
        }
    }, [memory, getRegister, setRegister]);


    const handleCall = useCallback((pc: number) => {
        // Adresse de retour = PC + 3 (opcode + 2 bytes d'adresse)
        const returnAddr = pc + 3;

        // PUSH l'adresse de retour sur la pile (16 bits)
        let sp = getRegister("SP");

        // PUSH high byte
        memory.writeMemory(sp, (returnAddr >> 8) & 0xFF);
        sp = (sp - 1) & 0xFFFF;

        // PUSH low byte
        memory.writeMemory(sp, returnAddr & 0xFF);
        sp = (sp - 1) & 0xFFFF;

        setRegister("SP", sp);

        // Lire l'adresse de destination
        const addrLow = memory.readMemory(pc + 1);
        const addrHigh = memory.readMemory(pc + 2);
        const callAddr = (addrHigh << 8) | addrLow;

        // Sauter
        setRegister("PC", callAddr);
    }, [memory, getRegister, setRegister]);


    // Fonction pour RET
    const handleRet = useCallback(() => {
        let sp = getRegister("SP");

        // POP low byte
        sp = (sp + 1) & 0xFFFF;
        const low = memory.readMemory(sp);

        // POP high byte
        sp = (sp + 1) & 0xFFFF;
        const high = memory.readMemory(sp);

        const retAddr = (high << 8) | low;

        // Mettre à jour SP
        setRegister("SP", sp);

        // Sauter à l'adresse retour
        setRegister("PC", retAddr);
    }, [memory, getRegister, setRegister]);


    // Fonction pour IRET (Return from Interrupt)
    const handleIRet = useCallback(() => {
        let sp = getRegister("SP");

        // POP PC
        sp = (sp + 1) & 0xFFFF;
        const pcLow = memory.readMemory(sp);

        sp = (sp + 1) & 0xFFFF;
        const pcHigh = memory.readMemory(sp);
        const returnAddr = (pcHigh << 8) | pcLow;

        // POP Flags
        sp = (sp + 1) & 0xFFFF;
        const flags = memory.readMemory(sp);

        // Mettre à jour registres
        setRegister("SP", sp);
        setRegister("PC", returnAddr);
        setRegister("FLAGS", flags);

        // Réactiver interruptions
        setInterruptsEnabled(true);
        setInInterruptHandler(false);
    }, [memory, getRegister, setRegister, setInterruptsEnabled, setInInterruptHandler]);


    const cpuHook: CpuHook = {
        halted,
        registers,
        clockCycle,
        ALU,
        getRegister,
        setRegister,
        getFlag,
        setFlags,
        tick,
        executeCycle,
        reset,
    }

    return cpuHook
}


export type CpuHook = {
    halted: boolean;
    registers: Map<string, number>,
    clockCycle: number;
    ALU: Record<string, (...args: any[]) => any>
    getRegister: (reg: Register) => number,
    setRegister: (reg: Register, value: number) => void,
    getFlag: (flag: "zero" | "carry") => boolean,
    setFlags: (zero: boolean, carry: boolean) => void,
    executeCycle: () => void,
    tick: () => void,
    reset: () => void,
}


