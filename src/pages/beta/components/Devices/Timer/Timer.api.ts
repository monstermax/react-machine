
import { EventEmitter } from "eventemitter3";

import { MEMORY_MAP } from "@/lib/memory_map";

import { U8 } from "@/lib/integers";

import type { IoDeviceType, u8 } from "@/types/cpu.types";


export class Timer extends EventEmitter {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;


    public counter = 0 as u8;
    public period = 10 as u8; // Interrupt toutes les 10 "tick"
    public enabled = false;


    constructor(name: string, ioPort: u8 | null = null, width=30, height=15, maxLines=100) {
        //console.log(`Initializing Console`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.type = 'Time';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port
    }


    // Tick appelé à chaque cycle CPU ou à intervalle fixe => A REVOIR
    tick() {
        //console.log(`⏰ Timer tick: enabled=${enabled}, counter=${counter}, period=${period}`);
        if (!this.enabled) return;

        const newVal = (this.counter + 1) as u8;
        //console.log(`⏰ Counter: ${prev} -> ${newVal}`);

        if (newVal >= this.period) {
            // Déclencher interruption
            //console.log('⏰ TIMER INTERRUPT! Requesting IRQ 0');
            //interruptHook.requestInterrupt(U8(MEMORY_MAP.IRQ_TIMER));
            return 0 as u8;
        }

        this.counter = newVal;
    }


    // Device IO interface
    read(port: u8): u8 {
        //const address = port - MEMORY_MAP.TIMER_BASE;

        switch (port) {
            case 0x00: // TIMER_COUNTER (0xFF20)
                return this.counter;

            case 0x01: // TIMER_CONTROL (0xFF21)
                return (this.enabled ? 1 : 0) as u8;

            case 0x02: // TIMER_PRESCALER (0xFF22)
                return this.period;
            default:
                return 0 as u8;
        }
    }


    write(port: u8, value: u8): void {
        //const port = address - MEMORY_MAP.TIMER_BASE;

        switch (port) {
            case 0x01: // TIMER_CONTROL (0xFF21)
                this.enabled = (value & 0x01) !== 0;
                this.emit('state', { enabled: this.enabled })

                if ((value & 0x02) !== 0) { // Reset bit
                    this.counter = 0 as u8;
                    this.emit('state', { counter: this.counter })
                }
                break;

            case 0x02: // TIMER_PRESCALER/PERIOD (0xFF22)
                this.period = (value & 0xFF) as u8;
                this.emit('state', { period: this.period })
                break;
        }
    }


    reset() {
        this.counter = 0 as u8
        this.period = 10 as u8
        this.enabled = false
        this.emit('state', { counter: this.counter, period: this.period, enabled: this.enabled })
    }

};

