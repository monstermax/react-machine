
import EventEmitter from "eventemitter3";

import { u8 } from "@/types";


export abstract class IoDevice extends EventEmitter {
    idx: u8 = 0 as u8;
    name: string = '';
    type: string = '';
    vendor: string = '';
    model: string = '';

    read(port: u8): u8 {
        return 0 as u8
    }

    write(port: u8, value: u8): void {
    }

}

