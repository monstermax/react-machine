
import { useMemo, useState } from "react";

import type { u16, u8 } from "@/types/cpu.types";


export const useRam = (): RamHook => {
    //console.log('RENDER ComputerPage.useComputer.useRam')

    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);

    //console.log('RAM:', storage)

    const ramHook: RamHook = {
        storage,
        setStorage,
    };

    return ramHook;
};


export type RamHook = {
    storage: Map<u16, u8>;
    setStorage: React.Dispatch<React.SetStateAction<Map<u16, u8>>>;
};

