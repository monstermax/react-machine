
import { useState, useCallback, useEffect } from "react";

import type { u8 } from "@/types/cpu.types";


/**
 * RTC (Real-Time Clock)
 * 
 * Ports:
 * - RTC_SECONDS (0x00): Lecture → secondes (0-59)
 * - RTC_MINUTES (0x01): Lecture → minutes (0-59)
 * - RTC_HOURS (0x02): Lecture → heures (0-23)
 * 
 * Met à jour automatiquement chaque seconde
 */


const PORTS = {
    RTC_SECONDS: 0x00,
    RTC_MINUTES: 0x01,
    RTC_HOURS: 0x02,
} as const;


export const useRtc = (): RtcHook => {
    const [time, setTime] = useState({
        seconds: 0,
        minutes: 0,
        hours: 0,
    });


    // Mettre à jour l'horloge chaque seconde
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();

            setTime({
                seconds: now.getSeconds(),
                minutes: now.getMinutes(),
                hours: now.getHours(),
            });
        };

        // Mise à jour immédiate
        updateClock();

        // Puis mise à jour chaque seconde
        const interval = setInterval(updateClock, 1000);

        return () => clearInterval(interval);
    }, []);


    const read = useCallback((port: u8): u8 => {
        switch (port) {
            case PORTS.RTC_SECONDS:
                return time.seconds as u8;

            case PORTS.RTC_MINUTES:
                return time.minutes as u8;

            case PORTS.RTC_HOURS:
                return time.hours as u8;

            default:
                console.warn(`RTC: Unknown read port 0x${port.toString(16)}`);
                return 0 as u8;
        }
    }, [time]);


    const write = useCallback((port: u8, value: u8) => {
        // RTC est en lecture seule
        console.warn(`RTC: Cannot write to port 0x${port.toString(16)}, RTC is read-only`);
    }, []);


    const reset = useCallback(() => {
        const now = new Date();

        setTime({
            seconds: now.getSeconds(),
            minutes: now.getMinutes(),
            hours: now.getHours(),
        });
        console.log("🕒 RTC: Reset to current time");
    }, []);


    return {
        read,
        write,
        reset,
        state: time,
    };
};


export type RtcHook = {
    read: (port: u8) => u8;
    write: (port: u8, value: u8) => void;
    reset: () => void;
    state: {
        seconds: number;
        minutes: number;
        hours: number;
    };
};
