
import { useCallback, useRef } from "react";

import type { u8 } from "@/types/cpu.types";
import type { Device } from "@/v1/types/cpu_v1.types";


/**
 * RTC (Real-Time Clock)
 * 
 * Ports:
 * - RTC_YEARS (0x01): Année (ex: 2025 → retourne 2025 % 256 = 233)
 * - RTC_MONTHS (0x02): Mois (1-12)
 * - RTC_DAYS (0x03): Jour du mois (1-31)
 * - RTC_HOURS (0x04): Heures (0-23)
 * - RTC_MINUTES (0x05): Minutes (0-59)
 * - RTC_SECONDS (0x06): Secondes (0-59)
 * - RTC_TIMESTAMP_0 (0x07): Unix timestamp byte 0 (LSB)
 * - RTC_TIMESTAMP_1 (0x08): Unix timestamp byte 1
 * - RTC_TIMESTAMP_2 (0x09): Unix timestamp byte 2
 * - RTC_TIMESTAMP_3 (0x0A): Unix timestamp byte 3 (MSB)
 * 
 * Lit l'heure système en temps réel à chaque lecture
 */


const PORTS = {
    RTC_YEARS: 0x01,
    RTC_MONTHS: 0x02,
    RTC_DAYS: 0x03,
    RTC_HOURS: 0x04,
    RTC_MINUTES: 0x05,
    RTC_SECONDS: 0x06,
    RTC_TIMESTAMP_0: 0x07,
    RTC_TIMESTAMP_1: 0x08,
    RTC_TIMESTAMP_2: 0x09,
    RTC_TIMESTAMP_3: 0x0A,
} as const;


export const useRtc = (): RtcHook => {
    // Pas de state ! On lit l'heure directement
    const timeRef = useRef({
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    const read = useCallback((port: u8): u8 => {
        // Lire l'heure système en temps réel
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000); // Unix timestamp (secondes)

        switch (port) {
            case PORTS.RTC_YEARS:
                // Retourner l'année modulo 256 (ex: 2025 % 256 = 233)
                // Ou bien les 2 derniers chiffres (2025 → 25)
                return (now.getFullYear() % 100) as u8; // 2025 → 25

            case PORTS.RTC_MONTHS:
                return (now.getMonth() + 1) as u8; // 0-11 → 1-12

            case PORTS.RTC_DAYS:
                return now.getDate() as u8; // 1-31

            case PORTS.RTC_HOURS:
                return now.getHours() as u8; // 0-23

            case PORTS.RTC_MINUTES:
                return now.getMinutes() as u8; // 0-59

            case PORTS.RTC_SECONDS:
                return now.getSeconds() as u8; // 0-59

            case PORTS.RTC_TIMESTAMP_0:
                return (timestamp & 0xFF) as u8; // Byte 0 (LSB)

            case PORTS.RTC_TIMESTAMP_1:
                return ((timestamp >> 8) & 0xFF) as u8; // Byte 1

            case PORTS.RTC_TIMESTAMP_2:
                return ((timestamp >> 16) & 0xFF) as u8; // Byte 2

            case PORTS.RTC_TIMESTAMP_3:
                return ((timestamp >> 24) & 0xFF) as u8; // Byte 3 (MSB)

            default:
                console.warn(`RTC: Unknown read port 0x${port.toString(16)}`);
                return 0 as u8;
        }
    }, []);


    const write = useCallback((port: u8, value: u8) => {
        // RTC est en lecture seule
        console.warn(`RTC: Cannot write to port 0x${port.toString(16)}, RTC is read-only`);
    }, []);


    const reset = useCallback(() => {
        // Rien à faire, on lit toujours l'heure système
        //console.log("🕒 RTC: Reset (always reads system time)");
    }, []);


    // Mettre à jour timeRef pour le state (pour debug uniquement)
    const now = new Date();
    timeRef.current = {
        years: now.getFullYear() % 100,
        months: now.getMonth() + 1,
        days: now.getDate(),
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
    };

    return {
        read,
        write,
        reset,
        state: timeRef.current,
    };
};


export type RtcHook = Device & {
    read: (port: u8) => u8;
    write: (port: u8, value: u8) => void;
    reset: () => void;
    state: {
        years: number;
        months: number;
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    };
};
