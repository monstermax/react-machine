
import { EventEmitter } from "eventemitter3";

import type { Cpu } from "./Cpu";
import type { MemoryBus } from "./MemoryBus";


export class Computer extends EventEmitter {
    public id: number;
    public cpu: Cpu | null = null;
    public memoryBus: MemoryBus | null = null;
    private loadedOs: string | null = null;
    private loadedProgram: string | null = null;


    constructor() {
        console.log(`Initializing Computer`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
    }

}

