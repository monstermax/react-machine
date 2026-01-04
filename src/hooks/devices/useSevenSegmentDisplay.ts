
import { useCallback, useState } from "react";

import { MEMORY_MAP } from "@/lib/memory_map";

import type { u8 } from "@/types/cpu.types";


// seven_seg.ts
export const useSevenSegmentDisplay = (): SevenSegmentHook => {
    const [currentValue, setCurrentValue] = useState<u8>(0 as u8);
    const [rawSegments, setRawSegments] = useState<u8>(0 as u8);


    // Mapping chiffre -> segments (bitmask)
    // Format: DP g f e d c b a (bit 7 = DP, bit 0 = segment a)
    const [digitToSegments] = useState([
        0b00111111, // 0: segments a,b,c,d,e,f
        0b00000110, // 1: segments b,c
        0b01011011, // 2: segments a,b,d,e,g
        0b01001111, // 3: segments a,b,c,d,g
        0b01100110, // 4: segments b,c,f,g
        0b01101101, // 5: segments a,c,d,f,g
        0b01111101, // 6: segments a,c,d,e,f,g
        0b00000111, // 7: segments a,b,c
        0b01111111, // 8: tous les segments
        0b01101111, // 9: segments a,b,c,d,f,g
        0b01110111, // A: segments a,b,c,e,f,g
        0b01111100, // b: segments c,d,e,f,g
        0b00111001, // C: segments a,d,e,f
        0b01011110, // d: segments b,c,d,e,g
        0b01111001, // E: segments a,d,e,f,g
        0b01110001, // F: segments a,e,f,g
    ] as u8[])


    const read = useCallback((port: u8): u8 => {
        switch (port) {
            case 0: // Port 0 = DATA
                return currentValue;
            case 1: // Port 1 = RAW
                return rawSegments;
            default:
                return 0 as u8;
        }
    }, [currentValue, rawSegments])


    const write = useCallback((port: u8, value: u8): void => {
        switch (port) {
            case 0: // Port 0 = DATA (0xFF60)
                const digit = (value & 0x0F) as u8;
                setCurrentValue(digit);
                setRawSegments(digitToSegments[digit] || 0 as u8);
                break;

            case 1: // Port 1 = RAW (0xFF61)
                setRawSegments((value & 0x7F) as u8);
                break;
        }
    }, [setCurrentValue, setRawSegments])


    // Pour l'affichage UI
    const getSegments = useCallback((): boolean[] => {
        const segments: boolean[] = [];
        for (let i = 0; i < 8; i++) {
            segments[i] = ((rawSegments >> i) & 1) === 1;
        }
        return segments;
    }, [rawSegments])


    const getCurrentDigit = useCallback((): u8 => {
        return currentValue;
    }, [currentValue])


    const reset = useCallback(() => {
        setCurrentValue(0 as u8);
        setRawSegments(0 as u8);
    }, []);


    const hook: SevenSegmentHook = {
        read,
        write,
        getSegments,
        getCurrentDigit,
        reset,
    }

    return hook
}


export type SevenSegmentHook = {
    read: (port: u8) => u8,
    write: (port: u8, value: u8) => void,
    getSegments: () => boolean[],
    getCurrentDigit: () => number,
    reset: () => void,
}


