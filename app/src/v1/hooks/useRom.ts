
import { useCallback, useEffect, useState } from "react";

import { compileCode, loadSourceCodeFromFile } from "@/v1/cpus/default/compiler_v1/asm_compiler";
import { MEMORY_MAP } from "@/v1/lib/memory_map_16x8_bits";

import type { u16, u8 } from "@/types/cpu.types";


export const useRom = (): RomHook => {
    //console.log('RENDER ComputerPage.useComputer.useRom')

    // ROM est immuable, initialisée avec le bootloader
    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);


    // Load BOOTLOADER
    useEffect(() => {
        const _compile = async () => {
            const bootloaderSourceCode = await loadSourceCodeFromFile("bootloader/bootloader_v2.asm");
            const compiled = await compileCode(bootloaderSourceCode, MEMORY_MAP.ROM_START);
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
