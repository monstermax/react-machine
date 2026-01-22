
import { EventEmitter } from "eventemitter3";

import type { Computer } from "./Computer.api";
import type { Motherboard } from "./Motherboard.api";



export class PowerSupply extends EventEmitter {
    public id: number;
    public motherboard: Motherboard;


    constructor(motherboard: Motherboard) {
        //console.log(`Initializing PowerSupply`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.motherboard = motherboard;
    }

}
