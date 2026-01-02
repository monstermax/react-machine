import { useCallback, useState } from "react";

import { MEMORY_MAP, isROM, isIO, memoryToIOPort } from "@/lib/memory_map";
import type { IOHook } from "./useIo";
import type { RomHook } from "./useRom";

import type { Memory } from "@/types/cpu.types";
import type { RamHook } from "./useRam";


export const useMemory = (romHook: RomHook, ramHook: RamHook, ioHook: IOHook): MemoryHook => {

    // Read from Memory
    const readMemory = useCallback((address: number): number => {
        // ROM read
        if (isROM(address)) {
            return romHook.storage.get(address) ?? 0;
        }

        // I/O read - déléguer au gestionnaire I/O
        if (isIO(address)) {
            return ioHook.read(memoryToIOPort(address));
        }

        // RAM read
        return ramHook.storage.get(address) ?? 0;
    }, [ramHook.storage, ioHook, romHook.storage]);


    // Write to Memory
    const writeMemory = useCallback((address: number, value: number) => {
        // ROM is read-only!
        if (isROM(address)) {
            console.warn(`Attempted write to ROM at 0x${address.toString(16)}`);
            return;
        }

        // I/O write - déléguer au gestionnaire I/O
        if (isIO(address)) {
            ioHook.write(memoryToIOPort(address), value);
            return;
        }

        // RAM write
        ramHook.setStorage(m => {
            const newMap = new Map(m);
            newMap.set(address, value & 0xFF);
            return newMap;
        });
    }, [ioHook]);


    const memoryHook: MemoryHook = {
        readMemory,
        writeMemory,
    };

    return memoryHook;
};


export type MemoryHook = {
    readMemory: (address: number) => number;
    writeMemory: (address: number, value: number) => void;
};
