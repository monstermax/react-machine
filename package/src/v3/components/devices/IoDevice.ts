
import EventEmitter from "eventemitter3";

import { u8 } from "@/types";


export type IoDeviceParams = {
    type: string;
    vendor?: string;
    model?: string;
}


export class IoDevice extends EventEmitter {
    idx: u8;
    name: string;
    type: string;
    vendor: string;
    model: string;

    constructor(idx: u8, name: string, params: IoDeviceParams) {
        super();

        this.idx = idx;
        this.name = name;
        this.type = params.type;
        this.vendor = params.vendor ?? '';
        this.model = params.model ?? '';
    }

    read(port: u8): u8 {
        return 0 as u8
    }

    write(port: u8, value: u8): void {
    }

}

