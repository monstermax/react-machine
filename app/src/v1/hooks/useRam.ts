
import { useCallback, useMemo, useState } from "react";

import { toHex } from "@/v1/lib/integers";

import type { u16, u8 } from "@/types/cpu.types";


export const useRam = (): RamHook => {
    //console.log('RENDER ComputerPage.useComputer.useRam')

    const [id] = useState(() => Math.round(Math.random() * 999_999_999));
    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);

    //console.log('RAM:', storage)

    const read = useCallback((address: u16): u8 => {
        const value = storage.get(address) ?? 0 as u8;
        //console.log(`Read Memory (RAM) @address ${toHex(address)} = ${toHex(value)}`)
        return value;
    }, [storage])


    const write = useCallback((address: u16, value: u8) => {
        setStorage(oldMap => new Map(oldMap).set(address, value))
    }, [setStorage])


    const ramHook: RamHook = {
        id,
        storage,
        read,
        write,
        setStorage,
    };

    return ramHook;
};


export type RamHook = {
    id: number;
    storage: Map<u16, u8>;
    read: (address: u16) => u8;
    write: (address: u16, value: u8) => void;
    setStorage: React.Dispatch<React.SetStateAction<Map<u16, u8>>>;
};

