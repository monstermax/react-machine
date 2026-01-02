
import { useCallback, useState } from "react";


export const useLeds = (): LedsDevice => {
    const [leds, setLeds] = useState(0); // 8 bits


    const read = (port: number): number => {
        return leds;
    }

    const write = (port: number, value: number): void => {
        setLeds(value & 0xFF); // Garder seulement 8 bits
    }


    const getLeds = useCallback((): number[] => {
        // Retourne un tableau de bits pour l'affichage UI
        return Array.from({ length: 8 }, (_, i) => (leds >> i) & 1);
    }, [leds])


    const romHook: LedsDevice = {
        read,
        write,
        getLeds,
    };

    return romHook;
};


export type LedsDevice = {
    read: (address: number) => number
    write: (address: number, value: number) => void
    getLeds: () => number[]
};
