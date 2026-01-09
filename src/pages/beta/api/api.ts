
import type { Computer } from "./Computer";
import type { Cpu } from "./Cpu";
import type { MemoryBus } from "./MemoryBus";
import type { Ram } from "./Ram";

import type { u16, u8 } from "@/types/cpu.types";


export * from './Computer';
export * from './Cpu';
export * from './MemoryBus';
export * from './Rom';
export * from './Ram';
export * from './IO';
export * from './StorageDisk';
export * from './StorageFileSystem';


export const computerRef = {
    current: null as Computer | null
};

export const cpuRef = {
    current: null as Cpu | null
};

export const memoryBusRef = {
    current: null as MemoryBus | null
};

export const ramRef = {
    current: null as Ram | null
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

