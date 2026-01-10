
import type { Computer } from "./Computer.api";
import type { Cpu } from "../components/Cpu/Cpu.api";
import type { DevicesManager } from "../components/Devices/DevicesManager.api";
import type { MemoryBus } from "../components/Memory/MemoryBus.api";
import type { Ram } from "../components/Memory/Ram.api";

import type { u16, u8 } from "@/types/cpu.types";


export * from './Computer.api';
export * from '../components/Cpu/Cpu.api';
export * from '../components/Cpu/Clock.api';
export * from '../components/Memory/MemoryBus.api';
export * from '../components/Memory/Rom.api';
export * from '../components/Memory/Ram.api';
export * from '../components/Devices/DevicesManager.api';
export * from '../components/Devices/StorageDisk/StorageDisk.api';
export * from '../components/Devices/StorageDisk/StorageFileSystem.api';
export * from '../components/Devices/LedsDisplay/LedsDisplay.api';
export * from '../components/Devices/Buzzer/Buzzer.api';


export const computerRef = {
    current: null as Computer | null
};

export const cpuRef = {
    current: null as Cpu | null
};

export const memoryBusRef = {
    current: null as MemoryBus | null
};

export const devicesManagerRef = {
    current: null as DevicesManager | null
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

