
import { EventEmitter } from "eventemitter3";

import type { Cpu } from "../Cpu/Cpu.api";
import type { MemoryBus } from "../Memory/MemoryBus.api";


export class Motherboard extends EventEmitter {
    public id: number;
    public cpu: Cpu | null = null;
    public memoryBus: MemoryBus | null = null;


    constructor() {
        //console.log(`Initializing Motherboard`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
    }

}

