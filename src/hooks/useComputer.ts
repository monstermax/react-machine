
import { useCallback, useEffect, useState } from "react";

import { useCpu, type CpuHook } from "@/hooks/useCpu";
import { useRom, type RomHook } from "@/hooks/useRom";
import { useMemory, type MemoryHook } from "@/hooks/useMemory";
import { useIo, type IOHook } from "@/hooks/useIo";
import { useRam, type RamHook } from "@/hooks/useRam";
import { MINI_OS, MINI_OS_V2 } from "@/programs/mini_os";
import { programs } from "@/lib/programs";
import { mapAddress16, MEMORY_MAP } from "@/lib/memory_map";
import { U16 } from "@/lib/integers";

import type { ProgramInfo, u16, u8 } from "@/types/cpu.types";


export const useComputer = (): ComputerHook => {
    //console.log('RENDER useComputer')

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


    // Load OS Code into OsDisk (at component mount, before reset)
    useEffect(() => {
        //ioHook.osDisk.setStorage(mapAddress16(MINI_OS, 0 as u16))
        ioHook.osDisk.setStorage(mapAddress16(MINI_OS_V2, 0 as u16))
    }, [])


    // Initialize/Reset CPU & RAM, when osDisk changes
    useEffect(() => {
        resetComputer();
    }, [ioHook.osDisk.storage])


    // Load ProgramDisk into RAM
    useEffect(() => {
        // Charger le programme en RAM à PROGRAM_START, quand l'osDisk ou loadedProgram change

        if (!loadedProgram) return;

        memoryHook.loadDiskInRAM(ioHook.programDisk.storage, MEMORY_MAP.PROGRAM_START)
    }, [memoryHook.loadDiskInRAM, ioHook.programDisk.storage, loadedProgram])


    // Initialize/Reset CPU & RAM
    const resetComputer = useCallback(() => {
        // Load OsDisk into RAM (overwrite full RAM)
        const ramStorage = mapAddress16(ioHook.osDisk.storage, MEMORY_MAP.OS_START);
        ramHook.setStorage(ramStorage);

        setLoadedProgram(null);

        // Initialize CPU
        cpuHook.reset();
    }, [cpuHook.reset, ramHook.setStorage, ioHook.osDisk.storage, setLoadedProgram])


    // Charger un programme utilisateur sur le program disk
    const loadProgram = useCallback((programName: string) => {
        const program: ProgramInfo | null = programName ? programs[programName] : null;

        if (!program) {
            console.warn(`WARNING. Program not found`)
            return;
        }

        // Charger le programme sur le disk (overwrite full disk)
        const newDiskStorage = mapAddress16(program.code, 0 as u16);
        ioHook.programDisk.setStorage(newDiskStorage)

        setLoadedProgram(programName);
    }, [ioHook.programDisk.setStorage, setLoadedProgram]);


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
    }, [ramHook.setStorage, setLoadedProgram]);


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

