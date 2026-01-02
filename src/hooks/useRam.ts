
import { useState } from "react";

import { getMiniOSAbsolute } from "@/lib/mini_os";

import type { Memory } from "@/types/cpu.types";


export const useRam = (): RamHook => {
    const [storage, setStorage] = useState<Memory>(new Map);

    //console.log('RAM:', storage)

    const ramHook: RamHook = {
        storage,
        setStorage,
    };

    return ramHook;
};


export type RamHook = {
    storage: Memory;
    setStorage: React.Dispatch<React.SetStateAction<Memory>>;
};

