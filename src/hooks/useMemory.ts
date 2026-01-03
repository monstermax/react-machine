import { useCallback, useState } from "react";

import { MEMORY_MAP, isROM, isIO, memoryToIOPort } from "@/lib/memory_map";
import type { IOHook } from "./useIo";
import type { RomHook } from "./useRom";

import type { u16, u8 } from "@/types/cpu.types";
import type { RamHook } from "./useRam";
import { U16, U8 } from "@/lib/integers";


export const useMemory = (romHook: RomHook, ramHook: RamHook, ioHook: IOHook): MemoryHook => {
    //console.log('RENDER useMemory')

    // Read from Memory
    const readMemory = useCallback((address: u16): u8 => {
        // ROM read
        if (isROM(address)) {
            return romHook.storage.get(U8(address)) ?? 0 as u8;
        }

        // I/O read - déléguer au gestionnaire I/O
        if (isIO(address)) {
            return ioHook.read(memoryToIOPort(address));
        }

        // RAM read
        return ramHook.storage.get(address) ?? 0 as u8;
    }, [ramHook.storage, ioHook, romHook.storage]);


    // Write to Memory
    const writeMemory = useCallback((address: u16, value: u8) => {
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
        ramHook.storage.set(address, (value & 0xFF) as u8);
    }, [ioHook]);


    const loadDiskInRAM = useCallback((data: Map<u8, u8> | Map<u16, u8>, offset: u16) => {
        ramHook.setStorage(current => {
            const newRam = new Map(current);

            for (const [addr, value] of data.entries()) {
                newRam.set(U16(offset + addr), value);
            }

            return newRam;
        });
    }, [ramHook.setStorage])


    const memoryHook: MemoryHook = {
        readMemory,
        writeMemory,
        loadDiskInRAM,
    };

    return memoryHook;
};


export type MemoryHook = {
    readMemory: (address: u16) => u8;
    writeMemory: (address: u16, value: u8) => void;
    loadDiskInRAM: (data: Map<u8, u8> | Map<u16, u8>, offset: u16) => void,
};

