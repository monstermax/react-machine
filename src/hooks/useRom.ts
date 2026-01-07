
import { useCallback, useMemo, useState } from "react";

import { BOOTLOADER } from "@/programs/bootloader";

import type { u16, u8 } from "@/types/cpu.types";


export const useRom = (): RomHook => {
    //console.log('RENDER ComputerPage.useComputer.useRom')

    // ROM est immuable, initialisée avec le bootloader
    const [storage] = useState<Map<u16, u8>>(BOOTLOADER);


    const read = useCallback((address: u16): u8 => {
        return storage.get(address) ?? 0 as u8;
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
