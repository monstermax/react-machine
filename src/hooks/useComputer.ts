
import { useEffect, useState } from "react";

import { useCpu, type CpuHook } from "@/hooks/useCpu";
import { useRom, type RomHook } from "@/hooks/useRom";
import { useMemory, type MemoryHook } from "@/hooks/useMemory";
import { useIo, type IOHook } from "@/hooks/useIo";
import { useRam, type RamHook } from "@/hooks/useRam";
import { getMiniOSAbsolute } from "@/lib/mini_os";


export const useComputer = (): ComputerHook => {
    const romHook = useRom();           // ROM avec bootloader
    const ramHook = useRam();
    const ioHook = useIo();             // I/O ports
    const memoryHook = useMemory(romHook, ramHook, ioHook);
    const cpuHook = useCpu(memoryHook, ioHook);


    // Initialize RAM & CPU at boot
    useEffect(() => {
        resetComputer();
    }, [])


    const resetComputer = () => {
        // Load OS into RAM
        const ramStorage = getMiniOSAbsolute()
        ramHook.setStorage(ramStorage);

        // Initialize CPU
        cpuHook.reset();
    }


    const computerHook: ComputerHook = {
        romHook,
        ramHook,
        ioHook,
        memoryHook,
        cpuHook,
        resetComputer,
    };

    return computerHook;
};


export type ComputerHook = {
    romHook: RomHook
    ramHook: RamHook
    ioHook: IOHook
    memoryHook: MemoryHook
    cpuHook: CpuHook
    resetComputer: () => void
};

