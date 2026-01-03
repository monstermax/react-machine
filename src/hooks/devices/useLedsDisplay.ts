
import { useCallback, useState } from "react";

import type { u8 } from "@/types/cpu.types";


export const useLedsDisplay = (): LedsDevice => {
    const [leds, setLeds] = useState(0 as u8); // 8 bits


    const read = (port: u8): u8 => {
        switch (port) {
            case 0x00:
                return leds;
                break;
        }

        return 0 as u8;
    }

    const write = useCallback((port: u8, value: u8): void => {
        switch (port) {
            case 0x00:
                setLeds((value & 0xFF) as u8); // Garder seulement 8 bits
                break;
        }
    }, [setLeds])


    const getLeds = useCallback((): u8[] => {
        // Retourne un tableau de bits pour l'affichage UI
        return Array.from({ length: 8 }, (_, i) => ((leds >> i) & 1) as u8);
    }, [leds])


    const romHook: LedsDevice = {
        read,
        write,
        getLeds,
    };

    return romHook;
};


export type LedsDevice = {
    read: (address: u8) => u8
    write: (address: u8, value: u8) => void
    getLeds: () => u8[]
};
