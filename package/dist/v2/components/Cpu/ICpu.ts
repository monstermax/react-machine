

import type { u8, u16, u32, u64 } from '@/types/cpu.types';
import type { MemoryBus } from '../Memory/MemoryBus.api';
import type { Clock } from '../Cpu/Clock.api';
import type { Interrupt } from '../Cpu/Interrupt.api';
import type { Motherboard } from '../Computer/Motherboard.api';


export interface ICpu {
    // Identification
    type: string;
    architecture: '8bit' | '16bit';
    id: number;

    // État
    //halted: boolean;
    motherboard: Motherboard;
    cpuPaused: boolean;
    cpuCycle: number;
    //breakpoints: Set<number>;

    // Composants
    memoryBus: MemoryBus | null;
    //clock: Clock | null;
    interrupt: Interrupt | null;

    // Méthodes obligatoires
    executeCycle(): void;
    reset(): void;
    togglePaused(): void;
    setPaused(paused: boolean): void;

    // Registres (abstraction)
    //getRegister(name: string): u8 | u16 | u32 | u64 | null;
    //setRegister(name: string, value: u8 | u16 | u32 | u64): void;
    //getAllRegisters(): Map<string, u8 | u16 | u32 | u64>;

    // EventEmitter
    on(event: string, handler: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
}

