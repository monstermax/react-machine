
import { useCallback, useEffect, useRef, useState } from "react";

import { MEMORY_MAP } from "@/lib/memory_map";
import type { InterruptHook } from "./useInterrupt";
import { U8 } from "@/lib/integers";

import type { u8 } from "@/types/cpu.types";


export const useTimer = (interruptHook: InterruptHook): TimerHook => {
    const [counter, setCounter] = useState(0 as u8);
    const [period, setPeriod] = useState(10 as u8); // Interrupt toutes les 10 "ticks"
    const [enabled, setEnabled] = useState(false);


    // Tick appelé à chaque cycle CPU ou à intervalle fixe
    const tick = useCallback(() => {
        console.log(`⏰ Timer tick: enabled=${enabled}, counter=${counter}, period=${period}`);
        if (!enabled) return;

        setCounter(prev => {
            const newVal = (prev + 1) as u8;
            console.log(`⏰ Counter: ${prev} -> ${newVal}`);

            if (newVal >= period) {
                // Déclencher interruption
                console.log('⏰ TIMER INTERRUPT! Requesting IRQ 0');
                interruptHook.requestInterrupt(U8(MEMORY_MAP.IRQ_TIMER));
                console.log('TIMER')
                return 0 as u8;
            }

            return newVal;
        });
    }, [enabled, period, interruptHook.requestInterrupt, setCounter]);


    // Device IO interface
    const read = useCallback((port: u8): u8 => {
        //const address = port - MEMORY_MAP.TIMER_BASE;

        switch (port) {
            case 0x00: // TIMER_COUNTER (0xFF20)
                return counter;
            case 0x01: // TIMER_CONTROL (0xFF21)
                return (enabled ? 1 : 0) as u8;
            case 0x02: // TIMER_PRESCALER (0xFF22)
                return period;
            default:
                return 0 as u8;
        }
    }, [counter, period, enabled]);


    const write = useCallback((port: u8, value: u8): void => {
        //const port = address - MEMORY_MAP.TIMER_BASE;

        switch (port) {
            case 0x01: // TIMER_CONTROL (0xFF21)
                setEnabled((value & 0x01) !== 0);

                if ((value & 0x02) !== 0) { // Reset bit
                    setCounter(0 as u8);
                }
                break;

            case 0x02: // TIMER_PRESCALER/PERIOD (0xFF22)
                setPeriod((value & 0xFF) as u8);
                break;
        }
    }, [setEnabled, setCounter, setPeriod]);


    const hook: TimerHook = {
        read,
        write,
        tick,
        counter,
        enabled,
        period,
    };

    return hook;
};


export type TimerHook = {
    read: (address: u8) => u8;
    write: (address: u8, value: u8) => void;
    tick: () => void;
    counter: u8;
    enabled: boolean;
    period: u8;
};

