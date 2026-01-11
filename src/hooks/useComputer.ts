
import { useCallback, useEffect, useMemo, useState } from "react";

import { useCpu, type CpuHook } from "@/hooks/useCpu";
import { useRom, type RomHook } from "@/hooks/useRom";
import { useMemory, type MemoryHook } from "@/hooks/useMemory";
import { useIo, type IOHook } from "@/hooks/useIo";
import { useRam, type RamHook } from "@/hooks/useRam";
import { os_list } from "@/programs/mini_os";
import { programs } from "@/lib/programs";
import { mapAddress16, MEMORY_MAP } from "@/lib/memory_map";
import { U16 } from "@/lib/integers";
import { compileCode, compileFile } from "@/lib/compiler";

import type { OsInfo, ProgramInfo, u16, u8 } from "@/types/cpu.types";

import ledTestCodeSource from '@/programs/asm/devices/led/led_test.asm?raw'



export const useComputer = (): ComputerHook => {
    //console.log('RENDER ComputerPage.useComputer')

    const romHook = useRom();           // ROM avec bootloader
    const ramHook = useRam();
    const ioHook = useIo();             // I/O ports
    const memoryHook = useMemory(romHook, ramHook, ioHook);
    const cpuHook = useCpu(memoryHook, ioHook);

    const [loadedProgram, setLoadedProgram] = useState<string | null>(null);
    const [loadedOs, setLoadedOs] = useState<string | null>(null);


    if (true) {
        // DEBUG
        (window as any).cpuHook = cpuHook;
        (window as any).memoryHook = memoryHook;
        (window as any).ramHook = ramHook;
        (window as any).ioHook = ioHook;
        (window as any).fs = ioHook.dataDisk1.fsHook;
    }


    // Load OSDisk into RAM, when loadedOs changes
    useEffect(() => {
        const _start_os = () => {
            const currentOs = loadedOs ? os_list[loadedOs] : null

            if (currentOs) {
                memoryHook.loadDiskInRAM(ioHook.osDisk.storage, MEMORY_MAP.OS_START)

            } else {
                memoryHook.writeMemory(MEMORY_MAP.OS_START, 0 as u8);
            }

            const pc = cpuHook.getRegister('PC');

            if (pc >= MEMORY_MAP.OS_START) {
                // Restart Bootloader if OS was running
                cpuHook.setRegister('PC', MEMORY_MAP.ROM_START);
            }
        }

        const timer = setTimeout(_start_os, 100);
        return () => clearTimeout(timer);

    }, [ioHook.osDisk.storage, loadedOs])


    // Load ProgramDisk into RAM, when loadedProgram changes
    useEffect(() => {
        // Charger le programme en RAM à PROGRAM_START, quand l'osDisk ou loadedProgram change

        const _start_program = () => {
            if (loadedProgram) {
                memoryHook.loadDiskInRAM(ioHook.programDisk.storage, MEMORY_MAP.PROGRAM_START)

            } else {
                memoryHook.writeMemory(MEMORY_MAP.PROGRAM_START, 0 as u8);
            }

            const pc = cpuHook.getRegister('PC');

            if (pc >= MEMORY_MAP.PROGRAM_START) {
                // Restart OS if program was running
                cpuHook.setRegister('PC', MEMORY_MAP.OS_START);
            }
        }

        const timer = setTimeout(_start_program, 100);
        return () => clearTimeout(timer);

    }, [memoryHook.loadDiskInRAM, ioHook.programDisk.storage, loadedProgram])


    // Load DataDisk2 on component mount
    useEffect(() => {
        const memoryOffset = 0x2000;

        const _load_data_disk_2 = async () => {
            const demoProgramCompiled = await compileCode(ledTestCodeSource, memoryOffset as u16)
            ioHook.dataDisk2.setStorage(demoProgramCompiled.code)
        }

        const timer = setTimeout(_load_data_disk_2, 100);
        return () => clearTimeout(timer);
    }, [])


    // Initialize/Reset CPU & RAM
    const resetComputer = useCallback(() => {
        const _loadedOs = loadedOs;
        setLoadedProgram(null);
        setLoadedOs(null);

        // Load OsDisk into RAM (overwrite full RAM)
        //const ramStorage = mapAddress16(ioHook.osDisk.storage, MEMORY_MAP.OS_START);
        //ramHook.setStorage(ramStorage);
        ramHook.setStorage(new Map);

        // Initialize CPU
        cpuHook.reset();

        // Initialize io
        ioHook.reset()

        if (_loadedOs) {
            loadOs(_loadedOs)
        }

    }, [loadedOs, ioHook.reset, cpuHook.reset, ioHook.osDisk.storage, setLoadedProgram])


    const loadOs = useCallback((osName: string) => {
        const os: OsInfo | null = osName ? os_list[osName] : null;

        if (!os || !os.filepath) {
            console.warn(`WARNING. OS not found`)
            return;
        }


        if (os.filepath) {
            compileFile(os.filepath, MEMORY_MAP.OS_START)
                .then(({code}) => {
                    //console.log('OS code:', code)
                    ioHook.osDisk.setStorage(code)
                    setLoadedOs(osName);
                })

        } else {
            // Charger le programme sur le disk (overwrite full disk)
            //const newDiskStorage = mapAddress16(os.code, 0 as u16);
            //ioHook.osDisk.setStorage(newDiskStorage)
            //setLoadedOs(osName);
        }

    }, [ioHook.osDisk.setStorage, setLoadedOs]);


    // Charger un programme utilisateur sur le program disk
    const loadProgram = useCallback((programName: string) => {
        const program: ProgramInfo | null = programName ? programs[programName] : null;

        if (!program) {
            console.warn(`WARNING. Program not found`)
            return;
        }

        if (program.filepath) {
            compileFile(program.filepath, MEMORY_MAP.PROGRAM_START)
                .then(({code}) => {
                    //console.log('Program code:', code)

                    // Charger le programme sur le disk (overwrite full disk)
                    ioHook.programDisk.setStorage(code)
                    setLoadedProgram(programName);
                })

        } else {
            // Charger le programme sur le disk (overwrite full disk)
            const newDiskStorage = mapAddress16(program.code, 0 as u16);
            ioHook.programDisk.setStorage(newDiskStorage)

            setLoadedProgram(programName);
        }


    }, [ioHook.programDisk.setStorage, setLoadedProgram]);


    const unloadOs = useCallback(() => {
        // Vide le disk
        ioHook.osDisk.setStorage(new Map);

        // Vide la RAM (entière)
        //ramHook.setStorage(new Map);

        ramHook.setStorage(current => {
            const newRam = new Map(current); // Garder l'existant

            for (let addr = MEMORY_MAP.OS_START; addr <= MEMORY_MAP.OS_END; addr++) {
                //newRam.set(U16(addr), 0x00 as u8); // TRES TRES LENT !!! => solution : on ne vide que la 1ere adresse
                //break;
                newRam.delete(U16(addr)); // le delete est rapide
            }

            return newRam;
        });

        setLoadedOs(null);
    }, [ramHook.setStorage, ioHook.osDisk.setStorage, setLoadedOs]);


    const unloadProgram = useCallback(() => {
        // Vide le disk
        ioHook.programDisk.setStorage(new Map);

        ramHook.setStorage(current => {
            const newRam = new Map(current); // Garder l'existant

            for (let addr = MEMORY_MAP.PROGRAM_START; addr <= MEMORY_MAP.PROGRAM_END; addr++) {
                //newRam.set(U16(addr), 0x00 as u8); // TRES TRES LENT !!! => solution : on ne vide que la 1ere adresse
                //break;
                newRam.delete(U16(addr)); // le delete est rapide
            }

            return newRam;
        });

        setLoadedProgram(null);
    }, [ramHook.setStorage, ioHook.programDisk.setStorage, setLoadedProgram]);


    const computerHook: ComputerHook = {
        romHook,
        ramHook,
        ioHook,
        memoryHook,
        cpuHook,
        loadedOs,
        loadedProgram,
        resetComputer,
        loadOs,
        loadProgram,
        unloadOs,
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
    loadedOs: string | null
    loadedProgram: string | null
    resetComputer: () => void
    loadOs: (osName: string) => void
    loadProgram: (programName: string) => void
    unloadOs: () => void
    unloadProgram: () => void
    setLoadedProgram: React.Dispatch<React.SetStateAction<string | null>>
};

