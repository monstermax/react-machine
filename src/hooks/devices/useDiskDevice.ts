
import { useState, useCallback } from "react";

import type { Memory, Device } from "@/types/cpu.types";


export const useDiskDevice = (data: Memory): DiskDevice => {
    const [storage, setStorage] = useState<Memory>(data);
    const [currentAddress, setCurrentAddress] = useState<number>(0);


    const read = useCallback((port: number): number => {
        switch (port) {
            case 0: // DATA port - read byte at current address
                return storage.get(currentAddress) ?? 0;
            case 1: // SIZE port - get disk size
                return storage.size;
            case 2: // ADDRESS port - get current address
                return currentAddress;
            default:
                return 0;
        }
    }, [storage, currentAddress]);


    const write = useCallback((port: number, value: number) => {
        switch (port) {
            case 2: // ADDRESS port - set read/write address
                setCurrentAddress(value);
                break;
            case 0: // DATA port - write byte at current address
                setStorage(s => {
                    const newStorage = new Map(s);
                    newStorage.set(currentAddress, value & 0xFF);
                    return newStorage;
                });
                // Auto-increment address after write
                setCurrentAddress(addr => addr + 1);
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
    storage: Memory;
};

