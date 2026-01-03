
import { useCallback, useState } from "react";

import type { Device, u8 } from "@/types/cpu.types";


const PIXEL_WIDTH = 32;
const PIXEL_HEIGHT = 32;


export const usePixelDisplay = (): PixelDisplayDevice => {
    const [pixels, setPixels] = useState<boolean[][]>(() =>
        Array(PIXEL_HEIGHT).fill(null).map(() => Array(PIXEL_WIDTH).fill(false))
    );
    const [currentX, setCurrentX] = useState<u8>(0 as u8);
    const [currentY, setCurrentY] = useState<u8>(0 as u8);


    const read = useCallback((port: u8): u8 => {
        switch (port) {
            case 0x00: // PIXEL_X
                return currentX;
            case 0x01: // PIXEL_Y
                return currentY;
            case 0x02: // PIXEL_COLOR
                if (currentY < PIXEL_HEIGHT && currentX < PIXEL_WIDTH) {
                    return (pixels[currentY][currentX] ? 1 : 0) as u8;
                }
                return 0 as u8;
            default:
                return 0 as u8;
        }
    }, [currentX, currentY, pixels]);


    const write = useCallback((port: u8, value: u8): void => {
        switch (port) {
            case 0x00: // PIXEL_X
                setCurrentX((value % PIXEL_WIDTH) as u8);
                break;

            case 0x01: // PIXEL_Y
                setCurrentY((value % PIXEL_HEIGHT) as u8);
                break;

            case 0x02: // PIXEL_COLOR - Écrire pixel à (currentX, currentY)
                if (currentY < PIXEL_HEIGHT && currentX < PIXEL_WIDTH) {
                    const color = (value & 0x01) !== 0;

                    setPixels(prev => {
                        const newPixels = prev.map(row => [...row]);
                        newPixels[currentY][currentX] = color;
                        return newPixels;
                    });
                }
                break;
        }
    }, [currentX, currentY, setCurrentX, setCurrentY, setPixels]);


    const reset = useCallback(() => {
        setPixels(Array(PIXEL_HEIGHT).fill(null).map(() => Array(PIXEL_WIDTH).fill(false)));
        setCurrentX(0 as u8);
        setCurrentY(0 as u8);
    }, [setCurrentX, setCurrentY, setPixels]);


    const clear = useCallback(() => {
        setPixels(Array(PIXEL_HEIGHT).fill(null).map(() => Array(PIXEL_WIDTH).fill(false)));
    }, [setPixels]);


    const getPixel = useCallback((x: number, y: number): boolean => {
        if (y >= 0 && y < PIXEL_HEIGHT && x >= 0 && x < PIXEL_WIDTH) {
            return pixels[y][x];
        }
        return false;
    }, [pixels]);


    return {
        read,
        write,
        reset,
        clear,
        getPixel,
        pixels,
        currentX,
        currentY,
        width: PIXEL_WIDTH,
        height: PIXEL_HEIGHT,
    };
};


export type PixelDisplayDevice = Device & {
    reset: () => void;
    clear: () => void;
    getPixel: (x: number, y: number) => boolean;
    pixels: boolean[][];
    currentX: u8;
    currentY: u8;
    width: number;
    height: number;
};
