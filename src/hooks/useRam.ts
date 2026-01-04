
import { useMemo, useState } from "react";

import type { u16, u8 } from "@/types/cpu.types";


export const useRam = (): RamHook => {
    //console.log('RENDER ComputerPage.useComputer.useRam')

    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);

    //console.log('RAM:', storage)

    const read = (address: u16): u8 => {
        return storage.get(address) ?? 0 as u8;
    }

    const write = (address: u16, value: u8) => {
        setStorage(oldMap => new Map(oldMap).set(address, value))
    }

    const ramHook: RamHook = {
        storage,
        read,
        write,
        setStorage,
    };

    return ramHook;
};


export type RamHook = {
    storage: Map<u16, u8>;
    read: (address: u16) => u8;
    write: (address: u16, value: u8) => void;
    setStorage: React.Dispatch<React.SetStateAction<Map<u16, u8>>>;
};

