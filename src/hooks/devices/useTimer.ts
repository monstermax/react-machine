
import { useCallback, useEffect, useRef, useState } from "react";

import { MEMORY_MAP } from "@/lib/memory_map";
import type { InterruptHook } from "../useInterrupt";
import type { u8 } from "@/types/cpu.types";


export const useTimer = (interruptHook: InterruptHook): TimerHook => {
    const [counter, setCounter] = useState(0 as u8);
    const [period, setPeriod] = useState(10 as u8); // Interrupt toutes les 10 "ticks"
    const [enabled, setEnabled] = useState(false);


    // Tick appelé à chaque cycle CPU ou à intervalle fixe
    const tick = useCallback(() => {
        if (!enabled) return;

        setCounter(prev => {
            const newVal = (prev + 1) as u8;
            if (newVal >= period) {
                // Déclencher interruption
                interruptHook.requestInterrupt(MEMORY_MAP.IRQ_TIMER);
                return 0 as u8;
            }
            return newVal;
        });
    }, [enabled, period, interruptHook]);


    // Device IO interface
    const read = useCallback((address: u8): u8 => {
        const port = address - MEMORY_MAP.TIMER_BASE;

        switch (port) {
            case 0x00: // TIMER_COUNTER
                return counter;
            case 0x01: // TIMER_PERIOD
                return period;
            case 0x02: // TIMER_CONTROL
                return (enabled ? 1 : 0) as u8;
            default:
                return 0 as u8;
        }
    }, [counter, period, enabled]);


    const write = useCallback((address: number, value: number): void => {
        const port = address - MEMORY_MAP.TIMER_BASE;

        switch (port) {
            case 0x01: // TIMER_PERIOD
                setPeriod((value & 0xFF) as u8);
                break;
            case 0x02: // TIMER_CONTROL
                setEnabled((value & 0x01) !== 0);
                if ((value & 0x02) !== 0) { // Reset bit
                    setCounter(0 as u8);
                }
                break;
        }
    }, []);


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
    counter: number;
    enabled: boolean;
    period: number;
};

