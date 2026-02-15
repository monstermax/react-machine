
import EventEmitter from "eventemitter3";

import { u32 } from "@/types/cpu.types";


export class Clock extends EventEmitter {
    private timer: NodeJS.Timeout | null = null;
    private frequency: u32;

    constructor(frequency: u32) {
        super();
        this.frequency = frequency;
    }

    start(): void {
        if (this.timer) return;

        this.timer = setInterval(this.tick.bind(this), 1000 / this.frequency)

        console.log('clock started')
    }

    stop(): void {
        if (!this.timer) return;
        clearInterval(this.timer)
        this.timer = null;

        console.log('clock stopped')
    }

    status(): boolean {
        return this.timer !== null;
    }

    setFrequency(frequency: u32): void {
        this.frequency = frequency;

        if (this.timer) {
            this.stop()
            this.start()
            this.tick()
        }
    }

    private tick(): void {
        this.emit('tick');
        //console.log('clock tick')
    }

}

