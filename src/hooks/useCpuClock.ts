
import { useEffect, useRef, useState } from "react";

import type { u16 } from "@/types/cpu.types";



export const useCpuClock = (halted: boolean) => {
    const [clockFrequency, setClockFrequency] = useState(1);
    //const [paused, setPaused] = useState<boolean>(true);
    const pausedRef = useRef<boolean>(true);
    const [clockCycle, setClockCycle] = useState<u16 | null>(null);


    const tick = () => {
        setClockCycle(c => (c || 0) + 1 as u16)
    }


    useEffect(() => {
        //console.log('INIT CPU Clock')
        //if (paused || halted || clockFrequency <= 0) return;
        if (pausedRef.current || halted || clockFrequency <= 0) return;

        const interval = 1000 / clockFrequency;
        //const timer = setInterval(tick, interval);

        const timer = setInterval(() => {
            if (pausedRef.current || halted || clockFrequency <= 0) return; // TODO: setPaused + pausedRef.current=
            tick()
        }, interval);

        return () => clearInterval(timer);
    }, [clockFrequency, pausedRef.current, /* paused, */ halted]);


    const clockHook: CpuClockHook = {
        clockCycle,
        clockFrequency,
        //paused,
        pausedRef,
        tick,
        //setPaused,
        setClockFrequency,
        setClockCycle,
    }

    return clockHook;
};


export type CpuClockHook = {
    clockCycle: u16 | null;
    clockFrequency: number;
    //paused: boolean;
    pausedRef: React.RefObject<boolean>
    tick: () => void;
    //setPaused: React.Dispatch<React.SetStateAction<boolean>>;
    setClockFrequency: React.Dispatch<React.SetStateAction<number>>;
    setClockCycle: React.Dispatch<React.SetStateAction<u16 | null>>;
}

