
import { useCallback, useEffect, useRef, useState } from "react";

import { MEMORY_MAP } from "@/lib/memory_map";
import type { InterruptHook } from "../useInterrupt";


export const useTimer = (interruptHook: InterruptHook): TimerHook => {
    const [counter, setCounter] = useState(0);
    const [period, setPeriod] = useState(10); // Interrupt toutes les 10 "ticks"
    const [enabled, setEnabled] = useState(false);


    // Tick appelé à chaque cycle CPU ou à intervalle fixe
    const tick = useCallback(() => {
        if (!enabled) return;

        setCounter(prev => {
            const newVal = prev + 1;
            if (newVal >= period) {
                // Déclencher interruption
                interruptHook.requestInterrupt(MEMORY_MAP.IRQ_TIMER);
                return 0;
            }
            return newVal;
        });
    }, [enabled, period, interruptHook]);


    // Device IO interface
    const read = useCallback((address: number): number => {
        const port = address - MEMORY_MAP.TIMER_BASE;

        switch (port) {
            case 0x00: // TIMER_COUNTER
                return counter;
            case 0x01: // TIMER_PERIOD
                return period;
            case 0x02: // TIMER_CONTROL
                return enabled ? 1 : 0;
            default:
                return 0;
        }
    }, [counter, period, enabled]);


    const write = useCallback((address: number, value: number): void => {
        const port = address - MEMORY_MAP.TIMER_BASE;

        switch (port) {
            case 0x01: // TIMER_PERIOD
                setPeriod(value & 0xFF);
                break;
            case 0x02: // TIMER_CONTROL
                setEnabled((value & 0x01) !== 0);
                if ((value & 0x02) !== 0) { // Reset bit
                    setCounter(0);
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
    read: (address: number) => number;
    write: (address: number, value: number) => void;
    tick: () => void;
    counter: number;
    enabled: boolean;
    period: number;
};

