
import { EventEmitter } from "eventemitter3";

import type { Cpu } from "../components/Cpu/Cpu.api";
import type { MemoryBus } from "../components/Memory/MemoryBus.api";
import type { DevicesManager } from "../components/Devices/DevicesManager.api";


export class Computer extends EventEmitter {
    public id: number;
    public cpu: Cpu | null = null;
    public memoryBus: MemoryBus | null = null;
    public loadedOs: string | null = null;
    public loadedProgram: string | null = null;


    constructor() {
        //console.log(`Initializing Computer`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
    }

}

