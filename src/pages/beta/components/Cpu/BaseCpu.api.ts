
import { EventEmitter } from 'eventemitter3';

import type { ICpu } from './ICpu';
import type { u8, u16, u32, u64 } from '@/types/cpu.types';
import type { MemoryBus } from '../Memory/MemoryBus.api';
import type { Interrupt } from './Interrupt.api';
import type { Clock } from './Clock.api';


export abstract class BaseCpu extends EventEmitter implements ICpu {
    // Identification
    public abstract type: string;
    public abstract architecture: '8bit' | '16bit';
    public id: number;

    // État
    public halted = false;
    public paused = true;
    public clockCycle = 0;
    public registers: Map<string, u8 | u16> = new Map;
    public status: 'ready' | 'executingCycle' = "ready";
    public breakpoints = new Set<number>();

    // Composants
    public memoryBus: MemoryBus | null = null;
    public clock: Clock | null = null;
    public interrupt: Interrupt | null = null;


    constructor() {
        super();
        this.id = Math.round(Math.random() * 999_999_999);
    }


    // Méthodes abstraites (à implémenter par chaque CPU)
    abstract executeCycle(): void;
    abstract reset(): void;
    abstract getRegister(name: string): u8 | u16 | null;
    abstract setRegister(name: string, value: u8 | u16): void;
    abstract getAllRegisters(): Map<string, u8 | u16 | u32 | u64>;


    // Méthodes communes

    setPaused(paused: boolean) {
        this.paused = paused;

        if (this.clock) {
            if (this.paused) {
                this.clock.stop()

            } else {
                this.clock.start()
            }

        }
    }

    togglePaused(): void {
        this.setPaused(!this.paused);
    }



    // Helpers mémoire
    protected readMemory(address: u16): u8 {
        if (!this.memoryBus) {
            console.warn('No memory bus attached');
            return 0 as u8;
        }
        return this.memoryBus.readMemory(address);
    }


    protected writeMemory(address: u16, value: u8): void {
        if (!this.memoryBus) {
            console.warn('No memory bus attached');
            return;
        }
        this.memoryBus.writeMemory(address, value);
    }


    // Stack helpers
    protected pushValue(value: u8): void {
        // À implémenter selon chaque CPU
        throw new Error('push() must be implemented');
    }


    protected popValue(): u8 {
        // À implémenter selon chaque CPU
        throw new Error('pop() must be implemented');
    }

}

