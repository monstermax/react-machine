
import { useState, useCallback, useMemo, useEffect } from "react";

import { high16, low16, toHex, U16, U8 } from "@/lib/integers";
import { useFileSystem, type FsHook } from "../useFileSystem";

import type { u16, u8 } from "@/types/cpu.types";
import type { Device } from "@/v1/types/cpu_v1.types";

/**
 * Disk Device avec support RAW et FS simultané
 * 
 * MODE RAW (ports 0-3):
 * - Accès direct aux bytes
 * - Adressage manuel
 * 
 * MODE FS (ports 4-7):
 * - File system avec inodes
 * - Opérations fichiers
 */


export const useDiskDevice = (diskName: string, data: Map<u16, u8>, persistent=false, formatFs=false): DiskDevice => {
    //console.log('RENDER ComputerPage.useComputer.useIo.useDiskDevice')

    const [mounted, setMounted] = useState(false)
    const [initialized, setInitialized] = useState(false)
    const [storage, setStorage] = useState<Map<u16, u8>>(data);
    const [skipStorageEffect, setSkipStorageEffect] = useState(false);
    const [currentAddress, setCurrentAddress] = useState<u16>(0 as u16);

    // File System Hook (utilise le même storage)
    const fsHook = useFileSystem(storage, setStorage);


    useEffect(() => {
        if (mounted) return;

        const _mount = () => {
            setMounted(true)
        }

        const timer = setTimeout(_mount, 1000);

        return () => clearTimeout(timer);
    }, [mounted]);


    // Format Disk Filesystem on component mount
    useEffect(() => {
        if (!mounted || initialized) return

        const _init = () => {
            if (formatFs) {
                // Format disk (FS)
                //console.log('_init format', diskName)
                formatDisk();

            } else if (persistent) {
                // Load storage
                //console.log('_init persistent load', diskName)
                const key = `disk_${diskName}`
                const storageArrJson = localStorage.getItem(key);

                if (storageArrJson === null || storageArrJson === undefined) {
                    // No localStorage found

                } else {
                    const storageArr = JSON.parse(storageArrJson) as [u16, u8][];
                    setSkipStorageEffect(true);
                    setStorage(new Map(storageArr))
                }
            }

            setInitialized(true);
        }

        const timer = setTimeout(_init, 100);

        return () => clearTimeout(timer);
    }, [initialized, mounted, persistent, formatFs])


    // Save storage
    useEffect(() => {
        //console.log('PRE _save', diskName, mounted, initialized)
        if (!mounted || !initialized) return

        if (skipStorageEffect) {
            setSkipStorageEffect(false)
            return;
        }

        const _save = () => {
            if (!persistent) return;
            //console.log('_save persistent data', diskName)

            const key = `disk_${diskName}`
            const storageArrJson = JSON.stringify(Array.from(storage.entries()))
            localStorage.setItem(key, storageArrJson)
        }

        const timer = setTimeout(_save, 100);

        return () => clearTimeout(timer);
    }, [mounted, initialized, storage, skipStorageEffect, persistent])


    const read = useCallback((port: u8): u8 => {
        switch (port) {
            // ===== MODE RAW =====
            case 0: // DISK_DATA - lecture byte à l'adresse courante
                return storage.get(currentAddress) ?? 0 as u8;

            case 1: // DISK_SIZE_LOW - taille disque
                return low16(storage.size as u16); // Low byte

            case 2: // DISK_SIZE_HIGH - taille disque
                return high16(storage.size as u16); // High byte

            case 3: // DISK_ADDR_LOW - adresse courante (low)
                return low16(currentAddress);

            case 4: // DISK_ADDR_HIGH - adresse courante (high)
                return high16(currentAddress);

            // ===== MODE FILE SYSTEM =====
            case 8: // FS_STATUS - retourne nombre de fichiers
                const files = fsHook.listFiles();
                return U8(files.length);

            case 9: // FS_COMMAND - résultat dernière commande
                return fsHook.lastCommandResult;

            case 10: // FS_DATA - lire byte depuis fichier ouvert
                return fsHook.readData();

            //case 11: // PROGRAM_DISK_FS_FILENAME

            case 12: // FS_HANDLE_LOW - handle fichier ouvert (low)
                return low16(fsHook.currentFileHandle);

            case 13: // FS_HANDLE_HIGH - handle fichier ouvert (high)
                return high16(fsHook.currentFileHandle);

            default:
                console.warn(`Disk: Unknown read port ${port}`);
                return 0 as u8;
        }
    }, [storage, currentAddress, fsHook]);


    const write = useCallback((port: u8, value: u8) => {
        switch (port) {
            // ===== MODE RAW =====
            case 0: // DISK_DATA - écrire byte à l'adresse courante
                setStorage(s => new Map(s).set(currentAddress, value));
                // Auto-increment
                setCurrentAddress(addr => U16(addr + 1));
                break;

            case 3: // DISK_ADDR_LOW - définir adresse (low)
                setCurrentAddress(prev => U16((prev & 0xFF00) | value));
                break;

            case 4: // DISK_ADDR_HIGH - définir adresse (high)
                setCurrentAddress(prev => U16((prev & 0x00FF) | (value << 8)));
                break;

            // ===== MODE FILE SYSTEM =====
            case 9: // FS_COMMAND - exécuter commande FS
                fsHook.executeCommand(value);
                break;

            case 10: // FS_DATA - écrire byte dans fichier ouvert
                fsHook.writeData(value);
                break;

            case 11: // FS_FILENAME - ajouter caractère au nom de fichier
                fsHook.writeFilenameChar(value);
                break;

            //case 12: // FS_HANDLE_LOW
            //case 13: // FS_HANDLE_HIGH

            default:
                console.warn(`Disk: Unknown write port ${port}`);
                break;
        }
    }, [currentAddress, fsHook]);


    const getSize = useCallback(() => storage.size, [storage]);


    const formatDisk = useCallback(() => {
        fsHook.initializeFileSystem(true);
    }, [fsHook.initializeFileSystem])


    const reset = useCallback(() => {
        if (! persistent) {
            if (formatFs) {
                setStorage(new Map)
                formatDisk()

            } else {
                setStorage(data);
            }

        }

        setCurrentAddress(0 as u16);

        fsHook.reset()
    }, [data, persistent])


    const diskDeviceHook: DiskDevice = {
        diskName,
        storage,
        fsHook,
        read,
        write,
        getSize,
        setStorage,
        reset,
        formatDisk,
    };

    return diskDeviceHook;
};


export type DiskDevice = Device & {
    diskName: string;
    storage: Map<u16, u8>;
    fsHook: FsHook;
    setStorage: React.Dispatch<React.SetStateAction<Map<u16, u8>>>;
    reset: () => void;
    formatDisk: () => void
};

