
import { useCallback, useEffect, useState } from "react";

import { useCpu, type CpuHook } from "@/hooks/useCpu";
import { useRom, type RomHook } from "@/hooks/useRom";
import { useMemory, type MemoryHook } from "@/hooks/useMemory";
import { useIo, type IOHook } from "@/hooks/useIo";
import { useRam, type RamHook } from "@/hooks/useRam";
import { MINI_OS } from "@/programs/mini_os";
import { programs } from "@/lib/programs";
import { mapAddress16, MEMORY_MAP } from "@/lib/memory_map";
import { U16 } from "@/lib/integers";

import type { ProgramInfo, u16, u8 } from "@/types/cpu.types";


export const useComputer = (): ComputerHook => {
    const romHook = useRom();           // ROM avec bootloader
    const ramHook = useRam();
    const ioHook = useIo();             // I/O ports
    const memoryHook = useMemory(romHook, ramHook, ioHook);
    const cpuHook = useCpu(memoryHook, ioHook);

    const [loadedProgram, setLoadedProgram] = useState<string | null>(null);


    if (true) {
        // DEBUG
        (window as any).ioHook = ioHook;
    }


    // Initialize RAM & CPU at boot
    useEffect(() => {
        resetComputer();
    }, [])


    const resetComputer = useCallback(() => {
        // Load OS into RAM
        //const ramStorage = mapAddress16(MINI_OS, MEMORY_MAP.OS_START);
        const ramStorage = mapAddress16(ioHook.osDisk.storage, MEMORY_MAP.OS_START);
        ramHook.setStorage(ramStorage);

        setLoadedProgram(null);

        // Initialize CPU
        cpuHook.reset();
    }, [cpuHook, ramHook, ioHook])


    // Charger un programme utilisateur sur le program disk
    const loadProgram = useCallback((programName: string) => {
        const program: ProgramInfo | null = programName ? programs[programName] : null;

        if (!program) {
            console.warn(`WARNING. Program not found`)
            return;
        }

        const ADDRESS_START = MEMORY_MAP.PROGRAM_START;

        // Charger le programme DIRECTEMENT en RAM à PROGRAM_START
        ramHook.setStorage(current => {
            const newRam = new Map(current); // Garder l'OS

            for (const [relAddr, value] of program.code.entries()) {
                newRam.set(U16(ADDRESS_START + relAddr), value);
            }

            return newRam;
        });

        setLoadedProgram(programName);
    }, [ramHook]);


    const unloadProgram = useCallback(() => {
        ramHook.setStorage(current => {
            const newRam = new Map(current); // Garder l'OS

            for (let addr = MEMORY_MAP.PROGRAM_START; addr <= MEMORY_MAP.PROGRAM_END; addr++) {
                newRam.set(U16(addr), 0x00 as u8);
                break; // TRES TRES LENT !!! => solution : on ne vide que la 1ere adresse
            }

            return newRam;
        });

        setLoadedProgram(null);
    }, [ramHook]);


    const computerHook: ComputerHook = {
        romHook,
        ramHook,
        ioHook,
        memoryHook,
        cpuHook,
        loadedProgram,
        resetComputer,
        loadProgram,
        unloadProgram,
        setLoadedProgram,
    };

    return computerHook;
};


export type ComputerHook = {
    romHook: RomHook
    ramHook: RamHook
    ioHook: IOHook
    memoryHook: MemoryHook
    cpuHook: CpuHook
    loadedProgram: string | null
    resetComputer: () => void
    loadProgram: (programName: string) => void
    unloadProgram: () => void
    setLoadedProgram: React.Dispatch<React.SetStateAction<string | null>>
};

