
import { useState } from "react";

import { BOOTLOADER } from "@/lib/bootloader";

import type { Memory } from "@/types/cpu.types";


export const useRom = (): RomHook => {
    // ROM est immuable, initialisée avec le bootloader
    const [storage] = useState<Memory>(new Map(BOOTLOADER));

    const romHook: RomHook = {
        storage,
    };

    return romHook;
};


export type RomHook = {
    storage: Memory;
};
