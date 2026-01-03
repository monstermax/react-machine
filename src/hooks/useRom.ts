
import { useState } from "react";

import { BOOTLOADER } from "@/programs/bootloader";

import type { u8 } from "@/types/cpu.types";


export const useRom = (): RomHook => {
    // ROM est immuable, initialisée avec le bootloader
    const [storage] = useState<Map<u8, u8>>(new Map(BOOTLOADER));

    //console.log('ROM:', storage)

    const romHook: RomHook = {
        storage,
    };

    return romHook;
};


export type RomHook = {
    storage: Map<u8, u8>;
};
