
import { useCallback, useEffect, useMemo, useState } from "react";

//import { BOOTLOADER } from "@/programs/bootloader";
import { toHex } from "@/lib/integers";
import { compileCode } from "@/lib/compiler";
import { MEMORY_MAP } from "@/lib/memory_map";

import type { u16, u8 } from "@/types/cpu.types";

import BootloaderSourceCode from '@/programs/asm/boot/bootloader.asm?raw'


export const useRom = (): RomHook => {
    //console.log('RENDER ComputerPage.useComputer.useRom')

    // ROM est immuable, initialisée avec le bootloader
    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);


    // Load BOOTLOADER
    useEffect(() => {
        const _compile = async () => {
            const compiled = await compileCode(BootloaderSourceCode, MEMORY_MAP.ROM_START);
            const BOOTLOADER: Map<u16, u8> = compiled.code;
            setStorage(BOOTLOADER)
        }

        const timer = setTimeout(_compile, 100)
        return () => clearTimeout(timer);
    }, [])


    const read = useCallback((address: u16): u8 => {
        const value = storage.get(address) ?? 0 as u8;
        //console.log(`Read Memory (ROM) @address ${toHex(address, 4)} = ${toHex(value)}`)
        return value;
    }, [storage])


    const write = (address: u16, value: u8) => {
        console.warn(`Cannot write ROM`);
    }


    const romHook: RomHook = {
        storage,
        read,
        write,
    };

    return romHook;
};


export type RomHook = {
    storage: Map<u16, u8>;
    read: (address: u16) => u8;
    write: (address: u16, value: u8) => void;
};
