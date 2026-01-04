
import { useState, useCallback } from "react";

import type { u8 } from "@/types/cpu.types";
import { U8 } from "@/lib/integers";


/**
 * RNG (Random Number Generator)
 * 
 * Ports:
 * - RNG_OUTPUT (0x00): Lecture → génère et retourne un nombre aléatoire 0-255
 * - RNG_SEED (0x01): Écriture → définir le seed
 */


const PORTS = {
    RNG_OUTPUT: 0x00,
    RNG_SEED: 0x01,
} as const;


export const useRng = (): RngHook => {
    const [seed, setSeed] = useState<number>(Date.now());

    // Linear Congruential Generator (LCG)
    // Paramètres: a=1103515245, c=12345, m=2^32 (standard glibc)
    const generateRandom = useCallback((currentSeed: number): number => {
        const a = 1103515245;
        const c = 12345;
        const m = 0x100000000; // 2^32

        const nextSeed = (a * currentSeed + c) % m;
        setSeed(nextSeed);

        // Retourner un byte (0-255)
        return (nextSeed >> 16) & 0xFF;
    }, [setSeed]);


    const read = useCallback((port: u8): u8 => {
        switch (port) {
            case PORTS.RNG_OUTPUT:
                // Générer un nouveau nombre aléatoire
                const random = generateRandom(seed);
                console.log(`🎲 RNG: Generated ${random}`);
                return random as u8;

            case PORTS.RNG_SEED:
                // Lecture du seed actuel (high byte)
                return U8(seed >> 24);

            default:
                console.warn(`RNG: Unknown read port 0x${port.toString(16)}`);
                return 0 as u8;
        }
    }, [seed, generateRandom]);


    const write = useCallback((port: u8, value: u8) => {
        switch (port) {
            case PORTS.RNG_OUTPUT:
                // Écriture sur OUTPUT n'a pas d'effet
                console.warn(`RNG: Cannot write to OUTPUT port`);
                break;

            case PORTS.RNG_SEED:
                // Définir un nouveau seed
                const newSeed = (value << 24) | (seed & 0x00FFFFFF);
                setSeed(newSeed);
                console.log(`🎲 RNG: Seed set to 0x${newSeed.toString(16)}`);
                break;

            default:
                console.warn(`RNG: Unknown write port 0x${port.toString(16)}`);
                break;
        }
    }, [seed, setSeed]);


    const reset = useCallback(() => {
        setSeed(Date.now());
        //console.log("🎲 RNG: Reset");
    }, [setSeed]);


    return {
        read,
        write,
        reset,
        state: { seed },
    };
};

export type RngHook = {
    read: (port: u8) => u8;
    write: (port: u8, value: u8) => void;
    reset: () => void;
    state: { seed: number; };
};
