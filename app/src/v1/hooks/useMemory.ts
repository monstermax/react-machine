import { useCallback, useEffect, useMemo, useState } from "react";

import { MEMORY_MAP, isROM, isIO, memoryToIOPort } from "@/v1/lib/memory_map_16x8_bits";
import { toHex, U16, U8 } from "@/v1/lib/integers";

import type { IOHook } from "./useIo";
import type { RomHook } from "./useRom";
import type { u16, u8 } from "@/types/cpu.types";
import type { RamHook } from "./useRam";


export const useMemory = (romHook: RomHook, ramHook: RamHook, ioHook: IOHook): MemoryHook => {
    //console.log('RENDER ComputerPage.useComputer.useMemory')

    const [id] = useState(() => Math.round(Math.random() * 999_999_999));


    // DEBUG (memory changes)
    useEffect(() => {
        //console.log('memory ROM changed')
    }, [romHook])

    useEffect(() => {
        //console.log('memory RAM changed')
    }, [ramHook])

    useEffect(() => {
        //console.log('memory IO changed')
    }, [ioHook])


    // Read from Memory
    const readMemory = useCallback((address: u16): u8 => {
        // ROM read
        if (isROM(address)) {
            const value = romHook.read(address);
            //console.log(`Read Memory (ROM) @address ${toHex(address)} = ${toHex(value)}`)
            return value;
        }

        // I/O read - déléguer au gestionnaire I/O
        if (isIO(address)) {
            const value = ioHook.read(memoryToIOPort(address));
            //console.log(`Read Memory (IO) @address ${toHex(address)} = ${toHex(value)}`)
            return value;
        }

        // RAM read
        const value = ramHook.read(address);
        //console.log(`MEMORY-RAM ${id} @address ${toHex(address)} = ${value}`)
        //console.log(`Read Memory (RAM) @address ${toHex(address)} = ${toHex(value)}`)
        return value;
    }, [romHook.read, ramHook.read, ioHook.read]);


    // Write to Memory
    const writeMemory = useCallback((address: u16, value: u8) => {
        // ROM is read-only!
        if (isROM(address)) {
            console.warn(`Attempted write to ROM at 0x${address.toString(16)}`);
            return;
        }

        // I/O write - déléguer au gestionnaire I/O
        if (isIO(address)) {
            //console.log(`Write Memory (IO) @address ${toHex(address)} = ${toHex(value)}`)
            ioHook.write(memoryToIOPort(address), value);
            return;
        }

        // RAM write
        //console.log(`Write Memory (RAM) @address ${toHex(address)} = ${toHex(value)}`)
        ramHook.write(address, value)
    }, [ioHook.write, ramHook.write]);


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
        id,
        ramHook,
        readMemory,
        writeMemory,
        loadDiskInRAM,
    };

    return memoryHook;
};


export type MemoryHook = {
    id: number;
    readMemory: (address: u16) => u8;
    writeMemory: (address: u16, value: u8) => void;
    loadDiskInRAM: (data: Map<u8, u8> | Map<u16, u8>, offset: u16) => void,
    ramHook: RamHook;
};

