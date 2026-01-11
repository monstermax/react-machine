
import { EventEmitter } from "eventemitter3";

import type { IoDeviceType, u8 } from "@/types/cpu.types";


export type RtcTime = {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    time: number;
    offset: number;
};


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


export class Rtc extends EventEmitter {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;

    public time: RtcTime = {
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        offset: 0,
        time: 0,
    };


    constructor(name: string, ioPort: u8 | null = null) {
        //console.log(`Initializing Rtc`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.type = 'Time';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port

        // Mettre à jour time pour le state (pour debug uniquement)
        this.updateTime()

        setInterval(this.updateTime.bind(this), 1000);
    }


    updateTime() {
        this.time = this.getLocalTime();
        this.emit('state', { time: this.time })
    }


    getLocalTime() {
        const now = new Date();

        const time = {
            years: now.getFullYear(),
            months: now.getMonth() + 1,
            days: now.getDate(),
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds(),
            time: now.getTime(),
            offset: now.getTimezoneOffset(),
        };

        return time;
    }


    getUtcTime() {
        const now = new Date();

        const time = {
            years: now.getUTCFullYear(),
            months: now.getUTCMonth() + 1,
            days: now.getUTCDate(),
            hours: now.getUTCHours(),
            minutes: now.getUTCMinutes(),
            seconds: now.getUTCSeconds(),
            time: now.getTime(),
            offset: 0,
        };

        return time;
    }


    read(port: u8): u8 {
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
    }


    write(port: u8, value: u8) {
        // RTC est en lecture seule
        console.warn(`RTC: Cannot write to port 0x${port.toString(16)}, RTC is read-only`);
    }


    reset() {
        // Rien à faire, on lit toujours l'heure système
        //console.log("🕒 RTC: Reset (always reads system time)");
    }



};
