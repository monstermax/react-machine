
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";

import type { CompiledCode, IoDeviceType, u16, u8 } from "@/types/cpu.types";
import type { MemoryBus } from "./MemoryBus.api";
import { MEMORY_MAP } from "@/lib/memory_map_16x8_bits";
import type { IoDevice } from "@/v2/types/cpu_v2.types";


export class Dma extends EventEmitter implements IoDevice {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;

    public memoryBus: MemoryBus;


    constructor(memoryBus: MemoryBus, ioPort: u8 | null = null) {
        //console.log(`Initializing DMA`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = 'interrupt';
        this.type = 'Interrupt';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port

        this.memoryBus = memoryBus;

        //this.emit('state', {  })
    }


    // Lecture depuis les ports IO
    read(address: u8): u8 {
        const port = address - MEMORY_MAP.INTERRUPT_BASE;

        // TODO

        switch (port) {

            default:
                return (0) as u8;
        }

    }


    // Écriture vers les ports IO
    write(address: u8, value: u8): void {
        const port = address;

        switch (port) {

        }
    }


    async loadCodeInRam (code: CompiledCode | null, memoryOffset: u16=0 as u16) {

        if (!this.memoryBus.ram) {
            console.warn(`Cannot load code in RAM. DMA not loaded.`);
            return;
        }

        if (memoryOffset < MEMORY_MAP.RAM_START || memoryOffset + (code?.size ?? 0) > MEMORY_MAP.RAM_END) {
            console.warn(`Write memory out of range`);
            return;
        }

        // Write Memory
        const data = code
            ? code.entries()
            : new Map([[U16(0), U8(0)]])

        for (const [addr, value] of data) {
            this.memoryBus.ram.write(U16(memoryOffset + addr), value);
        }

        // Clear CPUs cache
        if (this.memoryBus.motherboard) {
            this.memoryBus.motherboard.clearCpuCaches();
        }

        console.log('Loaded code size in RAM:', code?.size ?? 0)
    }

}

