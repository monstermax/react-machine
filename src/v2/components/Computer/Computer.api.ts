
import { EventEmitter } from "eventemitter3";

import * as cpuApi from '@/v2/api';


export class Computer extends EventEmitter {
    public id: number;
    public motherboard: cpuApi.Motherboard | null = null;
    //public cpu: Cpu | null = null;
    //public memoryBus: MemoryBus | null = null;
    public loadedOs: string | null = null;
    public loadedProgram: string | null = null;


    constructor() {
        //console.log(`Initializing Computer`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
    }

}

