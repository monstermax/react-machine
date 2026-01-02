
import { useCallback, useState } from "react";

import { Opcode } from "@/lib/instructions";
import { MEMORY_MAP } from "@/lib/memory_map";
import type { MemoryHook } from "./useMemory";

import type { Register } from "@/types/cpu.types";


export const useCpu = (memory: MemoryHook): CpuHook => {

    // CPU STATES
    const [registers, setRegisters] = useState<Map<string, number>>(new Map([
        ["A", 0],
        ["B", 0],
        ["C", 0],
        ["D", 0],
        ["PC", 0],
        ["IR", 0],
        ["SP", 0],
        ["FLAGS", 0],  // Bit 0: Carry, Bit 1: Zero
    ]));

    const [halted, setHalted] = useState<boolean>(false);

    const [clockCycle, setClockCycle] = useState<number>(0);


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

    // Execute a CPU cycle
    const executeClockCycle = useCallback(() => {
        if (halted) return;

        // Increment clockCycle
        tick();

        // Read current instruction
        const pc = getRegister("PC");
        const instruction = memory.readMemory(pc);

        // Store current instruction into IR Register
        setRegister("IR", instruction);

        // Execute logical operations
        executeLogicalOperations(pc, instruction);

        // Refresh React Component
        //forceUpdate(n => n + 1);

    }, [memory]);


    const executeLogicalOperations = useCallback((pc: number, instruction: number) => {
        switch (instruction) {
            case Opcode.NOP:
                setRegister("PC", pc + 1);
                break;

            case Opcode.LOAD_A:
                setRegister("A", memory.readMemory(pc + 1));
                setRegister("PC", pc + 2);
                break;

            case Opcode.LOAD_B:
                setRegister("B", memory.readMemory(pc + 1));
                setRegister("PC", pc + 2);
                break;

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

            case Opcode.STORE:
                // STORE addr16 : Memory[addr16] = A
                const storeLow = memory.readMemory(pc + 1);
                const storeHigh = memory.readMemory(pc + 2);
                const storeAddr = (storeHigh << 8) | storeLow;
                memory.writeMemory(storeAddr, getRegister("A"));
                setRegister("PC", pc + 3);
                break;

            case Opcode.LOAD_MEM:
                // LOAD_MEM addr16 : A = Memory[addr16]
                const loadLow = memory.readMemory(pc + 1);
                const loadHigh = memory.readMemory(pc + 2);
                const loadAddr = (loadHigh << 8) | loadLow;
                const value = memory.readMemory(loadAddr);
                setRegister("A", value);
                setFlags(value === 0, false);
                setRegister("PC", pc + 3);
                break;

            case Opcode.SYSCALL:
                const syscallNum = memory.readMemory(pc + 1);

                switch (syscallNum) {
                    case 0: // exit
                        console.log("📍 Program exit (syscall 0)");
                        // Clear program memory
                        for (let addr = MEMORY_MAP.PROGRAM_START; addr <= MEMORY_MAP.PROGRAM_END; addr++) {
                            memory.writeMemory(addr, 0);
                        }

                        // Retour à l'OS
                        setRegister("PC", MEMORY_MAP.OS_START);
                        break;

                    case 1: // print_char - afficher A comme caractère
                        console.log(`📝 print_char: ${String.fromCharCode(getRegister("A"))}`);
                        setRegister("PC", pc + 2);
                        break;

                    case 2: // print_num - afficher A comme nombre
                        console.log(`📊 print_num: ${getRegister("A")}`);
                        setRegister("PC", pc + 2);
                        break;


                    // Autres syscalls possibles : read, write, etc.

                    default:
                        console.warn(`Unknown syscall: ${syscallNum}`);
                        setRegister("PC", pc + 2);
                }
                break;

            case Opcode.HALT:
                setHalted(true);
                break;

            default:
                console.error(`Unknown opcode at 0x${pc.toString(16)}: 0x${instruction.toString(16)}`);
                setHalted(true);
        }
    }, [memory]);


    const getRegister = (reg: Register): number => {
        return registers.get(reg) ?? 0;
    }

    const setRegister = (reg: Register, value: number) => {
        // PC et SP sont 16-bit, les autres 8-bit
        if (reg === "PC" || reg === "SP") {
            registers.set(reg, value & 0xFFFF); // 16-bit

        } else {
            registers.set(reg, value & 0xFF);   // 8-bit
        }
    }

    const getFlag = (flag: 'zero' | 'carry'): boolean => {
        const flags = getRegister("FLAGS");
        return flag === 'zero' ? !!(flags & 0b10) : !!(flags & 0b01);
    }

    const setFlags = (zero: boolean, carry: boolean) => {
        registers.set("FLAGS", (zero ? 0b10 : 0) | (carry ? 0b01 : 0));
    }

    const reset = () => {
        // Hard-wired reset vector - CPU démarre TOUJOURS à 0x0000 (ROM)
        setRegister("PC", MEMORY_MAP.ROM_START);

        for (const [key] of registers) {
            if (key !== "PC") {
                setRegister(key as Register, 0);
            }
        }

        setHalted(false);
        setClockCycle(0);
    }

    const tick = () => {
        setClockCycle(c => c + 1)
    }


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
        executeClockCycle,
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
    executeClockCycle: () => void,
    tick: () => void,
    reset: () => void,
}


