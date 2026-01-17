
import { EventEmitter } from "eventemitter3";
import type { Motherboard } from "../Computer/Motherboard.api";


export class Clock extends EventEmitter {
    public id: number;
    public motherboard: Motherboard;
    public clockFrequency: number;
    public clockCycles: number;
    private timer: NodeJS.Timeout | null = null;
    public status: boolean = false;


    constructor(motherboard: Motherboard, initialFrequency=1) {
        //console.log(`Initializing Clock`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.motherboard = motherboard;
        this.clockFrequency = initialFrequency;
        this.clockCycles = 0;
        //this.start();
    }


    tick(): void {
        this.clockCycles++;
        //console.log('Clock tick', this.clockCycles)
        this.emit('tick', { cycle: this.clockCycles });
    }


    toggle(): void {
        if (this.status) {
            this.stop()

        } else {
            this.start()
        }
    }


    restart(): void {
        this.stop()
        this.start()
    }


    start(): void {
        if (this.timer || this.clockFrequency <= 0) return;

        const interval = 1000 / this.clockFrequency;
        this.timer = setInterval(this.tick.bind(this), interval);
        this.status = true;

        this.emit('state', { status: this.status });

        console.log('Clock started')

        // immediate tick
        this.tick()
    }


    stop(): void {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
        this.status = false;

        this.emit('state', { status: this.status });

        console.log('Clock stopped')
    }


    reset(): void {
        const status = this.status;

        this.stop()

        this.clockCycles = 0;

        if (status) {
            this.start()
        }
    }
}


