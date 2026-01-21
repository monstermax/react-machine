
import { EventEmitter } from "eventemitter3";

import { IRQ_MAP, MEMORY_MAP } from "@/lib/memory_map_16x8_bits";

import { U8 } from "@/lib/integers";

import type { IoDeviceType, u8 } from "@/types/cpu.types";
import type { DevicesManager } from "../DevicesManager.api";
import type { Interrupt } from "@/v2/api";
import type { IoDevice } from "@/v2/types/cpu_v2.types";


export class Timer extends EventEmitter implements IoDevice {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;

    public devicesManager: DevicesManager;
    public counter = 0 as u8;
    public period = 10 as u8; // Interrupt toutes les 10 "tick"
    public enabled = false;


    constructor(devicesManager: DevicesManager, name: string, ioPort: u8 | null = null, width=30, height=15, maxLines=100) {
        //console.log(`Initializing Console`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.type = 'Time';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port
        this.devicesManager = devicesManager;
    }


    // Tick appelé à chaque cycle CPU ou à intervalle fixe
    tick() {
        //console.log(`⏰ Timer tick: enabled=${this.enabled}, counter=${this.counter}, period=${this.period}`);
        if (!this.enabled) return;

        const newVal = (this.counter + 1) as u8;
        //console.log(`⏰ Counter: ${prev} -> ${newVal}`);

        if (newVal >= this.period) {
            // Déclencher interruption
            //console.log('⏰ TIMER INTERRUPT! Requesting IRQ 0');

            const interrupt = this.devicesManager.getDeviceByName('interrupt') as Interrupt | undefined;

            if (interrupt) {
                interrupt.requestInterrupt(U8(IRQ_MAP.IRQ_TIMER));

            } else {
                console.warn(`Missing Interrupt for Timer`);
            }

            this.counter = 0 as u8
            return
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

            case 0x03: // TIMER_TICK (0xFF23)
                return 0 as u8; // write-only method

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

            case 0x03: // TIMER_TICK (0xFF23)
                this.tick()
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

