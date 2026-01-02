
import { useCallback, useEffect, useState } from "react";

import { useCpu, type CpuHook } from "@/hooks/useCpu";
import { useRom, type RomHook } from "@/hooks/useRom";
import { useMemory, type MemoryHook } from "@/hooks/useMemory";
import { useIo, type IOHook } from "@/hooks/useIo";
import { useRam, type RamHook } from "@/hooks/useRam";
import { getMiniOSAbsolute } from "@/lib/mini_os";
import type { ProgramInfo } from "@/types/cpu.types";
import { programs } from "@/lib/programs";
import { MEMORY_MAP } from "@/lib/memory_map";
import { U16 } from "@/lib/integers";


export const useComputer = (): ComputerHook => {
    const romHook = useRom();           // ROM avec bootloader
    const ramHook = useRam();
    const ioHook = useIo();             // I/O ports
    const memoryHook = useMemory(romHook, ramHook, ioHook);
    const cpuHook = useCpu(memoryHook, ioHook);

    const [currentProgram, setCurrentProgram] = useState<string | null>(null);


    // Initialize RAM & CPU at boot
    useEffect(() => {
        resetComputer();
    }, [])


    const resetComputer = useCallback(() => {
        // Load OS into RAM
        const ramStorage = getMiniOSAbsolute()
        ramHook.setStorage(ramStorage);

        // Initialize CPU
        cpuHook.reset();
    }, [cpuHook, ramHook])


    // Charger un programme utilisateur sur le program disk
    const loadProgram = useCallback((programName: string) => {
        const program: ProgramInfo | null = programName ? programs[programName] : null;

        if (!program) {
            console.warn(`WARNING. Program not found`)
            return;
        }

        // Charger le programme DIRECTEMENT en RAM à PROGRAM_START
        ramHook.setStorage(current => {
            const newRam = new Map(current); // Garder l'OS

            for (const [relAddr, value] of program.code.entries()) {
                newRam.set(U16(MEMORY_MAP.PROGRAM_START + relAddr), value);
            }

            return newRam;
        });
    }, [ramHook]);


    const computerHook: ComputerHook = {
        romHook,
        ramHook,
        ioHook,
        memoryHook,
        cpuHook,
        currentProgram,
        resetComputer,
        loadProgram,
        setCurrentProgram,
    };

    return computerHook;
};


export type ComputerHook = {
    romHook: RomHook
    ramHook: RamHook
    ioHook: IOHook
    memoryHook: MemoryHook
    cpuHook: CpuHook
    currentProgram: string | null
    resetComputer: () => void
    loadProgram: (programName: string) => void
    setCurrentProgram: React.Dispatch<React.SetStateAction<string | null>>
};

