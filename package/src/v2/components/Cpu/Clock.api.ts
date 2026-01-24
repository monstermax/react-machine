
import { EventEmitter } from "eventemitter3";

import type { Motherboard } from "../Computer/Motherboard.api";
import { MEMORY_MAP } from "@/v2/lib/memory_map_16x8_bits";

import { IoDevice, IoDeviceType, u8 } from "@/types";
import { U8 } from "@/v2/lib/integers";


export class Clock extends EventEmitter implements IoDevice {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;

    public motherboard: Motherboard;
    public clockFrequency: number;
    public clockCycles: number;
    private timer: NodeJS.Timeout | null = null;
    public status: boolean = false;


    constructor(motherboard: Motherboard, ioPort: u8 | null = null, initialFrequency=1) {
        //console.log(`Initializing Clock`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = 'interrupt';
        this.type = 'Interrupt';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port

        this.motherboard = motherboard;
        this.clockFrequency = initialFrequency;
        this.clockCycles = 0;
        //this.start();
    }

    // Lecture depuis les ports IO
    read(address: u8): u8 {
        const port = address - MEMORY_MAP.INTERRUPT_BASE;

        switch (port) {
            case 0x00: // CLOCK_FREQ (0xF120)
                return U8(this.clockFrequency);

            default:
                return (0) as u8;
        }

    }


    // Écriture vers les ports IO
    write(address: u8, value: u8): void {
        const port = address;

        switch (port) {
            case 0x00: // CLOCK_FREQ (0xF120)
                this.clockFrequency = U8(value);

                if (this.status) {
                    this.restart();
                }

                this.emit('state', { clockFrequency: this.clockFrequency })
                break;


        }
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


