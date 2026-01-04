
import { useCallback, useMemo, useRef, useState } from "react";

import { Opcode } from "@/lib/instructions";
import { MEMORY_MAP } from "@/lib/memory_map";
import type { MemoryHook } from "./useMemory";

import type { Register, Register16, Register8, u16, u8 } from "@/types/cpu.types";
import type { IOHook } from "./useIo";


export const useCpu = (memory: MemoryHook, ioHook: IOHook): CpuHook => {
    //console.log('RENDER ComputerPage.useComputer.useCpu')


    // CPU STATES
    const [registers, setRegisters] = useState<Map<string, u8 | u16>>(new Map([
        ["A", 0 as u8],      // Register A
        ["B", 0 as u8],      // Register B
        ["C", 0 as u8],      // Register C
        ["D", 0 as u8],      // Register D
        ["PC", 0 as u16],    // Program Counter
        ["IR", 0 as u8],     // Instruction Register
        ["SP", 0 as u16],    // Stack Pointer
        ["FLAGS", 0 as u8],  // Bit 0: Carry, Bit 1: Zero
    ] as [string, u8 | u16][]));

    const [halted, setHalted] = useState<boolean>(false);

    const [clockCycle, setClockCycle] = useState<u16>(0 as u16);
    //const clockCycleRef = useRef<u16>(0 as u16);

    const [interruptsEnabled, setInterruptsEnabled] = useState(false);
    const [inInterruptHandler, setInInterruptHandler] = useState(false);


    // ALU
    const ALU = {
        add: (a: u8, b: u8): u8 => {
            const result = ((a + b) & 0xFF) as u8;
            const carry = (a + b) > 0xFF;
            const zero = result === 0;
            setFlags(zero, carry);
            return result;
        },

        sub: (a: u8, b: u8): u8 => {
            const result = ((a - b) & 0xFF) as u8;
            const zero = result === 0;
            const carry = a < b; // Borrow
            setFlags(zero, carry);
            return result;
        },

        and: (a: u8, b: u8): u8 => {
            const result = ((a & b) & 0xFF) as u8;
            setFlags(result === 0, false);
            return result;
        },

        or: (a: u8, b: u8): u8 => {
            const result = ((a | b) & 0xFF) as u8;
            setFlags(result === 0, false);
            return result;
        },

        xor: (a: u8, b: u8): u8 => {
            const result = ((a ^ b) & 0xFF) as u8;
            setFlags(result === 0, false);
            return result;
        },

        inc: (value: u8): u8 => {
            const result = ((value + 1) & 0xFF) as u8;
            setFlags(result === 0, false);
            return result;
        },

        dec: (value: u8): u8 => {
            const result = ((value - 1) & 0xFF) as u8;
            setFlags(result === 0, false);
            return result;
        },
    }


    // CPU METHODS

    const getRegister = useCallback(<T extends Register>(reg: T): T extends Register16 ? u16 : u8 => {
        const value = registers.get(reg) ?? 0;

        if (reg === "PC" || reg === "SP") {
            return value as T extends Register16 ? u16 : u8;
        } else {
            return value as T extends Register16 ? u16 : u8;
        }
    }, [registers]);


    const setRegister = useCallback((reg: Register, value: u8 | u16) => {
        // PC et SP sont 16-bit, les autres 8-bit
        if (reg === "PC" || reg === "SP") {
            registers.set(reg, (value & 0xFFFF) as u16); // 16-bit

        } else {
            registers.set(reg, (value & 0xFF) as u8);   // 8-bit
        }
    }, [registers])


    const getFlag = useCallback((flag: 'zero' | 'carry'): boolean => {
        const flags = getRegister("FLAGS");
        return flag === 'zero' ? !!(flags & 0b10) : !!(flags & 0b01);
    }, [getRegister])


    const setFlags = useCallback((zero: boolean, carry: boolean) => {
        setRegister('FLAGS', ((zero ? 0b10 : 0) | (carry ? 0b01 : 0)) as u8)
    }, [setRegister])


    const reset = useCallback(() => {
        const resetRegisters = new Map<string, u8 | u16>([
            ["A", 0 as u8],
            ["B", 0 as u8],
            ["C", 0 as u8],
            ["D", 0 as u8],
            ["PC", MEMORY_MAP.ROM_START],
            ["IR", 0 as u8],
            ["SP", 0 as u16],
            ["FLAGS", 0 as u8],
        ] as [string, u8 | u16][]);

        setRegisters(resetRegisters);
        setHalted(false);
        setClockCycle(0 as u16);
        //clockCycleRef.current = 0 as u16;
        setInterruptsEnabled(false);
        setInInterruptHandler(false);

    }, [setRegisters, setHalted, setInterruptsEnabled, setInInterruptHandler])


    const tick = useCallback(() => {
        setClockCycle(c => (c + 1) as u16)
        //clockCycleRef.current = (clockCycleRef.current + 1) as u16;
        //console.log('tick:', clockCycleRef.current)

        // Tick du timer à chaque cycle CPU
        ioHook.timer.tick();
    }, [ioHook.timer.tick]);


    const readMem8 = useCallback((pc: u16): u8 => {
        const value = memory.readMemory((pc + 1) as u16);
        return value;
    }, [memory.readMemory])


    const readMem16 = useCallback((pc: u16): u16 => {
        const low = memory.readMemory((pc + 1) as u16);
        const high = memory.readMemory((pc + 2) as u16);
        const value = ((high << 8) | low) as u16;
        return value;
    }, [memory.readMemory])


    // Fonction pour push une valeur sur la pile
    const pushValue = useCallback((value: u8) => {
        let sp = getRegister("SP");

        // Écrire la valeur à [SP]
        memory.writeMemory(sp, value);

        // Décrémenter SP (pile descend)
        sp = ((sp - 1) & 0xFFFF) as u16;
        setRegister("SP", sp);
    }, [memory.writeMemory, getRegister, setRegister]);


    // Fonction pour pop une valeur de la pile
    const popValue = useCallback((): u8 => {
        let sp = getRegister("SP");

        // Incrémenter SP d'abord (pile remonte)
        sp = ((sp + 1) & 0xFFFF) as u16;

        // Lire la valeur à [SP]
        const value = memory.readMemory(sp);

        // Mettre à jour SP
        setRegister("SP", sp);

        return value;
    }, [memory.readMemory, getRegister, setRegister]);


    // Fonction pour CALL
    const handleSyscall = useCallback((pc: u16) => {
        const syscallNum = memory.readMemory((pc + 1) as u16);

        switch (syscallNum) {
            case 0: // exit
                console.log("📍 Program exit (syscall 0)");

                // Clear program memory - pour eviter que le programme ne se relance automatiquement (si mini_os v1)
                for (let addr = MEMORY_MAP.PROGRAM_START; addr <= MEMORY_MAP.PROGRAM_END; addr++) {
                    memory.writeMemory(addr, 0 as u8);
                    break; // TRES TRES LENT !!! => solution : on ne vide que la 1ere adresse
                }

                // Retour à l'OS
                setRegister("PC", MEMORY_MAP.OS_START);
                break;

            case 1: // pause
                // TODO: mettre en pause dans l'interface UI
                setRegister("PC", (pc + 2) as u16);
                break;

            case 2: // print_char - afficher A comme caractère
                //console.log(`📝 print_char: ${String.fromCharCode(getRegister("A"))}`);
                setRegister("PC", (pc + 2) as u16);
                break;

            case 3: // print_num - afficher A comme nombre
                //console.log(`📊 print_num: ${getRegister("A")}`);
                setRegister("PC", (pc + 2) as u16);
                break;

            case 4: // print_string - afficher string pointée par C:D
                {
                    let addr = ((getRegister("D") << 8) | getRegister("C")) as u16;

                    // Lire caractères jusqu'à '\0'
                    while (true) {
                        const char = memory.readMemory(addr);

                        if (char === 0) break; // '\0' trouvé

                        // Écrire dans console
                        ioHook.console.write(0x00 as u8, char); // CONSOLE_CHAR

                        addr = ((addr + 1) & 0xFFFF) as u16;
                    }

                    setRegister("PC", (pc + 2) as u16);
                }
                break;

            default:
                console.warn(`Unknown syscall: ${syscallNum}`);
                setRegister("PC", (pc + 2) as u16);
                break;
        }
    }, [memory.readMemory, memory.writeMemory, getRegister, setRegister]);


    const handleCall = useCallback((pc: u16) => {
        // Adresse de retour = PC + 3 (opcode + 2 bytes d'adresse)
        const returnAddr = pc + 3;

        // PUSH l'adresse de retour sur la pile (16 bits)
        let sp = getRegister("SP");

        // PUSH high byte
        memory.writeMemory(sp, ((returnAddr >> 8) & 0xFF) as u8);
        sp = ((sp - 1) & 0xFFFF) as u16;

        // PUSH low byte
        memory.writeMemory(sp, (returnAddr & 0xFF) as u8);
        sp = ((sp - 1) & 0xFFFF) as u16;

        setRegister("SP", sp);

        // Lire l'adresse de destination
        const callAddr = readMem16(pc);

        // Sauter
        setRegister("PC", callAddr);
    }, [memory.writeMemory, getRegister, setRegister, readMem16]);


    // Fonction pour RET
    const handleRet = useCallback(() => {
        let sp = getRegister("SP");

        // POP low byte
        sp = ((sp + 1) & 0xFFFF) as u16;
        const low = memory.readMemory(sp);

        // POP high byte
        sp = ((sp + 1) & 0xFFFF) as u16;
        const high = memory.readMemory(sp);

        const retAddr = ((high << 8) | low) as u16;

        // Mettre à jour SP
        setRegister("SP", sp);

        // Sauter à l'adresse retour
        setRegister("PC", retAddr);
    }, [memory.readMemory, getRegister, setRegister]);


    // Fonction pour IRET (Return from Interrupt)
    const handleIRet = useCallback(() => {
        let sp = getRegister("SP");

        // POP PC - low
        sp = ((sp + 1) & 0xFFFF) as u16;
        const pcLow = memory.readMemory(sp);

        // POP PC - high
        sp = ((sp + 1) & 0xFFFF) as u16;
        const pcHigh = memory.readMemory(sp);
        const returnAddr = ((pcHigh << 8) | pcLow) as u16;

        // POP Flags
        sp = ((sp + 1) & 0xFFFF) as u16;
        const flags = memory.readMemory(sp);

        // Mettre à jour registres
        setRegister("SP", sp);
        setRegister("PC", returnAddr);
        setRegister("FLAGS", flags);

        // Réactiver interruptions
        setInterruptsEnabled(true);
        setInInterruptHandler(false);
    }, [memory.readMemory, getRegister, setRegister, setInterruptsEnabled, setInInterruptHandler]);


    // Execute an instruction
    const executeOpcode = useCallback((pc: u16, instruction: u8) => {
        switch (instruction) {
            // ===== SYSTEM =====
            case Opcode.NOP:
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.SYSCALL:
                handleSyscall(pc);
                break;

            case Opcode.HALT:
                setHalted(true);
                break;

            // ===== ALU INSTRUCTIONS =====
            case Opcode.ADD:
                setRegister("A", ALU.add(getRegister("A"), getRegister("B")));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.SUB:
                setRegister("A", ALU.sub(getRegister("A"), getRegister("B")));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.AND:
                setRegister("A", ALU.and(getRegister("A"), getRegister("B")));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.OR:
                setRegister("A", ALU.or(getRegister("A"), getRegister("B")));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.XOR:
                setRegister("A", ALU.xor(getRegister("A"), getRegister("B")));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.INC_A:
                setRegister("A", ALU.inc(getRegister("A")));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.DEC_A:
                setRegister("A", ALU.dec(getRegister("A")));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.INC_B:
                setRegister("B", ALU.inc(getRegister("B")));
                setRegister("PC", (pc + 1) as u16);
                break;
            case Opcode.DEC_B:
                setRegister("B", ALU.dec(getRegister("B")));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.INC_C:
                setRegister("C", ALU.inc(getRegister("C")));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.DEC_C:
                setRegister("C", ALU.dec(getRegister("C")));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.INC_D:
                setRegister("D", ALU.inc(getRegister("D")));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.DEC_D:
                setRegister("D", ALU.dec(getRegister("D")));
                setRegister("PC", (pc + 1) as u16);
                break;

            // ===== JUMP INSTRUCTIONS =====
            case Opcode.JMP:
                setRegister("PC", readMem16(pc));
                break;

            case Opcode.JZ:
                if (getFlag('zero')) {
                    setRegister("PC", readMem16(pc));
                } else {
                    setRegister("PC", (pc + 3) as u16);
                }
                break;

            case Opcode.JNZ:
                if (!getFlag('zero')) {
                    setRegister("PC", readMem16(pc));
                } else {
                    setRegister("PC", (pc + 3) as u16);
                }
                break;

            case Opcode.JC:
                if (getFlag('carry')) {
                    setRegister("PC", readMem16(pc));
                } else {
                    setRegister("PC", (pc + 3) as u16);
                }
                break;

            // ===== PUSH =====
            case Opcode.PUSH_A: {
                pushValue(getRegister("A"));
                setRegister("PC", (pc + 1) as u16);
                break;
            }

            case Opcode.PUSH_B:
                pushValue(getRegister("B"));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.PUSH_C:
                pushValue(getRegister("C"));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.PUSH_D:
                pushValue(getRegister("D"));
                setRegister("PC", (pc + 1) as u16);
                break;

            // ===== POP =====
            case Opcode.POP_A:
                setRegister("A", popValue());
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.POP_B:
                setRegister("B", popValue());
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.POP_C:
                setRegister("C", popValue());
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.POP_D:
                setRegister("D", popValue());
                setRegister("PC", (pc + 1) as u16);
                break;

            // ===== STACK =====
            case Opcode.SET_SP:
                // SET_SP imm16 : SP = valeur immédiate 16-bit
                setRegister("SP", readMem16(pc));
                setRegister("PC", (pc + 3) as u16);
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
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.DI:  // Disable Interrupts
                setInterruptsEnabled(false);
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.IRET: // Return from Interrupt
                handleIRet();
                break;

            // ===== MOV =====

            // MOV Register to Register - NE PAS modifier les flags
            case Opcode.MOV_AB:  // A → B
                setRegister("B", getRegister("A"));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_AC:  // A → C
                setRegister("C", getRegister("A"));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_AD:  // A → D
                setRegister("D", getRegister("A"));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_BA:  // B → A
                setRegister("A", getRegister("B"));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_BC:  // B → C
                setRegister("C", getRegister("B"));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_BD:  // B → D
                setRegister("D", getRegister("B"));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_CA:  // C → A
                setRegister("A", getRegister("C"));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_CB:  // C → B
                setRegister("B", getRegister("C"));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_CD:  // C → D
                setRegister("D", getRegister("C"));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_DA:  // D → A
                setRegister("A", getRegister("D"));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_DB:  // D → B
                setRegister("B", getRegister("D"));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_DC:  // D → C
                setRegister("C", getRegister("D"));
                setRegister("PC", (pc + 1) as u16);
                break;

            // MOV with Immediate - DOIT mettre à jour Zero flag
            case Opcode.MOV_A_IMM:  // MOV A, imm8
                const immA = memory.readMemory((pc + 1) as u16);
                setRegister("A", immA);
                setFlags(immA === 0, false);  // Set zero flag
                setRegister("PC", (pc + 2) as u16);
                break;

            case Opcode.MOV_B_IMM:  // MOV B, imm8
                const immB = memory.readMemory((pc + 1) as u16);
                setRegister("B", immB);
                setFlags(immB === 0, false);  // Set zero flag
                setRegister("PC", (pc + 2) as u16);
                break;

            case Opcode.MOV_C_IMM:  // MOV C, imm8
                const immC = memory.readMemory((pc + 1) as u16);
                setRegister("C", immC);
                setFlags(immC === 0, false);  // Set zero flag
                setRegister("PC", (pc + 2) as u16);
                break;

            case Opcode.MOV_D_IMM:  // MOV D, imm8
                const immD = memory.readMemory((pc + 1) as u16);
                setRegister("D", immD);
                setFlags(immD === 0, false);  // Set zero flag
                setRegister("PC", (pc + 2) as u16);
                break;

            // MOV Memory to Register - DOIT mettre à jour Zero flag
            case Opcode.MOV_A_MEM:  // MOV A, [addr16]
                const addrA = readMem16(pc);
                const memValueA = memory.readMemory(addrA);
                setRegister("A", memValueA);
                setFlags(memValueA === 0, false);  // Set zero flag
                setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_B_MEM:  // MOV B, [addr16]
                const addrB = readMem16(pc);
                const memValueB = memory.readMemory(addrB);
                setRegister("B", memValueB);
                setFlags(memValueB === 0, false);  // Set zero flag
                setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_C_MEM:  // MOV C, [addr16]
                const addrC = readMem16(pc);
                const memValueC = memory.readMemory(addrC);
                setRegister("C", memValueC);
                setFlags(memValueC === 0, false);  // Set zero flag
                setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_D_MEM:  // MOV D, [addr16]
                const addrD = readMem16(pc);
                const memValueD = memory.readMemory(addrD);
                setRegister("D", memValueD);
                setFlags(memValueD === 0, false);  // Set zero flag
                setRegister("PC", (pc + 3) as u16);
                break;

            // MOV Register to Memory - NE PAS modifier les flags
            case Opcode.MOV_MEM_A:  // MOV [addr16], A
                const addrMemA = readMem16(pc);
                memory.writeMemory(addrMemA, getRegister("A"));
                setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_MEM_B:  // MOV [addr16], B
                const addrMemB = readMem16(pc);
                memory.writeMemory(addrMemB, getRegister("B"));
                setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_MEM_C:  // MOV [addr16], C
                const addrMemC = readMem16(pc);
                memory.writeMemory(addrMemC, getRegister("C"));
                setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_MEM_D:  // MOV [addr16], D
                const addrMemD = readMem16(pc);
                memory.writeMemory(addrMemD, getRegister("D"));
                setRegister("PC", (pc + 3) as u16);
                break;

            case Opcode.MOV_A_PTR_CD:  // MOV A, *[C:D]
                const ptrCD_LoadA = ((getRegister("D") << 8) | getRegister("C")) as u16;
                const valuePtr_A = memory.readMemory(ptrCD_LoadA);
                setRegister("A", valuePtr_A);
                setFlags(valuePtr_A === 0, false);  // Set zero flag
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_B_PTR_CD:  // MOV B, *[C:D]
                const ptrCD_LoadB = ((getRegister("D") << 8) | getRegister("C")) as u16;
                const valuePtr_B = memory.readMemory(ptrCD_LoadB);
                setRegister("B", valuePtr_B);
                setFlags(valuePtr_B === 0, false);  // Set zero flag
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_PTR_CD_A:  // MOV *[C:D], A
                const ptrCD_StoreA = ((getRegister("D") << 8) | getRegister("C")) as u16;
                memory.writeMemory(ptrCD_StoreA, getRegister("A"));
                setRegister("PC", (pc + 1) as u16);
                break;

            case Opcode.MOV_PTR_CD_B:  // MOV *[C:D], B
                const ptrCD_StoreB = ((getRegister("D") << 8) | getRegister("C")) as u16;
                memory.writeMemory(ptrCD_StoreB, getRegister("B"));
                setRegister("PC", (pc + 1) as u16);
                break;

            default:
                console.error(`Unknown opcode at 0x${pc.toString(16)}: 0x${instruction.toString(16)}`);
                setHalted(true);
        }
    }, [memory.readMemory, memory.writeMemory, getRegister, setRegister, pushValue, popValue, setHalted, setFlags, readMem16, readMem8, handleSyscall, handleCall, handleRet, handleIRet]);


    const handleInterrupt = useCallback(() => {
        const irq = ioHook.interrupt.getPendingIRQ();
        if (irq === null) return;

        console.log(`🎯 Handling IRQ ${irq}, handlerAddr = ${ioHook.interrupt.handlerAddr.toString(16)}`);

        // 1. Désactiver interruptions
        setInterruptsEnabled(false);
        setInInterruptHandler(true);

        // 2. Sauvegarder contexte sur la pile
        const sp = getRegister("SP");
        const pc = getRegister("PC");
        const flags = getRegister("FLAGS");

        // PUSH Flags
        memory.writeMemory(sp, flags);
        setRegister("SP", (sp - 1) as u16);

        // PUSH PC (little-endian)
        memory.writeMemory((sp - 1) as u16, ((pc >> 8) & 0xFF) as u8); // High byte
        memory.writeMemory((sp - 2) as u16, (pc & 0xFF) as u8);      // Low byte
        setRegister("SP", (sp - 3) as u16);

        // 3. Acquitter l'interruption
        ioHook.interrupt.acknowledgeInterrupt(irq);

        // 4. Sauter au handler
        let handlerAddress = ioHook.interrupt.handlerAddr;
        if (handlerAddress === 0) {
            // Vecteur par défaut: 0x0040 + irq*4
            handlerAddress = (0x0040 + (irq * 4)) as u16;
        }

        setRegister("PC", handlerAddress);

        console.log(`🔄 Interruption IRQ${irq} -> Handler 0x${handlerAddress.toString(16)}`);
    }, [ioHook.interrupt.getPendingIRQ, ioHook.interrupt.handlerAddr, ioHook.interrupt.acknowledgeInterrupt, memory.writeMemory, setRegister, getRegister, setInterruptsEnabled, setInInterruptHandler]);


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
        //console.log('executeOpcode', pc, opcode) // DEBUG
        executeOpcode(pc, opcode);

    }, [halted, interruptsEnabled, inInterruptHandler, ioHook.interrupt.hasPendingInterrupt, memory.readMemory, tick, setRegister, getRegister, handleInterrupt, executeOpcode]);


    const cpuHook: CpuHook = {
        halted,
        registers,
        clockCycle,
        //clockCycle: clockCycleRef,
        ALU,
        getRegister,
        setRegister,
        getFlag,
        setFlags,
        tick,
        executeCycle,
        reset,
    };

    return cpuHook
}


export type CpuHook = {
    halted: boolean;
    registers: Map<string, number>,
    clockCycle: u16;
    //clockCycle: React.RefObject<u16>;
    ALU: Record<string, (...args: any[]) => any>
    getRegister: (reg: Register) => u8 | u16,
    setRegister: (reg: Register, value: u8 | u16) => void,
    getFlag: (flag: "zero" | "carry") => boolean,
    setFlags: (zero: boolean, carry: boolean) => void,
    executeCycle: () => void,
    tick: () => void,
    reset: () => void,
}


