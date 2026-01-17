
import { EventEmitter } from "eventemitter3";

import { Cpu } from "../Cpu/Cpu.api";
import { Clock } from "../Cpu/Clock.api";
import { MemoryBus } from "../Memory/MemoryBus.api";
import type { Computer } from "./Computer.api";



export class Motherboard extends EventEmitter {
    public id: number;
    public computer: Computer;
    public cpus: Map<number, Cpu | null> = new Map;
    public clock: Clock | null = null;
    public memoryBus: MemoryBus | null = null;


    constructor(computer: Computer) {
        //console.log(`Initializing Motherboard`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.computer = computer;
    }


    getCpus() {
        return Array.from(this.cpus.values());
    }


    addCpu(coresCount=1) {
        const cpuIdx = this.cpus.size;
        const cpu = new Cpu(this, cpuIdx, coresCount);

        this.cpus.set(cpuIdx, cpu)

        // Connect CPU to MemoryBus
        if (this.memoryBus) {
            cpu.connectToMemoryBus(this.memoryBus);
        }

        return cpu;
    }


    addClock(initialFrequency=1) {
        const clock = new Clock(this, initialFrequency);

        this.clock = clock;

        return clock;
    }


    addMemoryBus() {
        const memoryBus = new MemoryBus(this);

        this.memoryBus = memoryBus;

        // Connect MemoryBus to CPUs
        for (const cpu of this.getCpus()) {
            if (!cpu) continue;
            cpu.connectToMemoryBus(memoryBus);
        }

        // Connect MemoryBus to DevicesManager
        if (this.computer.devicesManager) {
            memoryBus.connectDevicesManager(this.computer.devicesManager)
            //console.log('DevicesManager connecté à MemoryBus:', this.computer.devicesManager);
        }

        return memoryBus;
    }

}

