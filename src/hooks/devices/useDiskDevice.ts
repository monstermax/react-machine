
import { useState, useCallback } from "react";

import { U16 } from "@/lib/integers";

import type { Device, u16, u8 } from "@/types/cpu.types";


export const useDiskDevice = (data: Map<u16, u8>): DiskDevice => {
    const [storage, setStorage] = useState<Map<u16, u8>>(data);
    const [currentAddress, setCurrentAddress] = useState<u16>(0 as u16);


    const read = useCallback((port: u8): u8 => {
        switch (port) {
            case 0: // DATA port - read byte at current address
                return storage.get(currentAddress) ?? 0 as u8;
            case 1: // SIZE port - get disk size
                return (storage.size & 0xFF) as u8;
            case 2: // ADDRESS port - get current address - low
                return (currentAddress & 0xFF) as u8;
            case 3: // ADDRESS port - get current address - high
                return ((currentAddress >> 8) & 0xFF) as u8;
            default:
                return 0 as u8;
        }
    }, [storage, currentAddress]);


    const write = useCallback((port: u8, value: u8) => {
        switch (port) {
            case 0: // DATA port - write byte at current address
                setStorage(s => {
                    const newStorage = new Map(s);
                    newStorage.set(currentAddress, value);
                    return newStorage;
                });
                // Auto-increment address after write
                setCurrentAddress(addr => U16(addr + 1));
                break;

            case 2: // ADDRESS port low byte - set read/write address
                setCurrentAddress(prev => U16((prev & 0xFF00) | value));
                break;

            case 3: // ADDRESS port high byte
                setCurrentAddress(prev => U16((prev & 0x00FF) | (value << 8)));
                break;
        }
    }, [currentAddress]);


    const getSize = useCallback(() => storage.size, [storage]);


    const diskDeviceHook: DiskDevice = {
        read,
        write,
        getSize,
        storage,
    };

    return diskDeviceHook;
};


export type DiskDevice = Device & {
    storage: Map<u16, u8>;
};

