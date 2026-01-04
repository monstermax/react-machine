
import { useState, useCallback } from "react";

import { high16, low16, U16, U8 } from "@/lib/integers";
import { useFileSystem, type FsHook } from "../useFileSystem";

import type { Device, u16, u8 } from "@/types/cpu.types";

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


export const useDiskDevice = (data: Map<u16, u8>): DiskDevice => {
    const [storage, setStorage] = useState<Map<u16, u8>>(data);
    const [currentAddress, setCurrentAddress] = useState<u16>(0 as u16);

    // File System Hook (utilise le même storage)
    const fsHook = useFileSystem(storage, setStorage);

    const read = useCallback((port: u8): u8 => {
        switch (port) {
            // ===== MODE RAW =====
            case 0: // DISK_DATA - lecture byte à l'adresse courante
                return storage.get(currentAddress) ?? 0 as u8;

            case 1: // DISK_SIZE - taille disque
                return U8(storage.size); // Low byte

            case 2: // DISK_ADDR_LOW - adresse courante (low)
                return low16(currentAddress);

            case 3: // DISK_ADDR_HIGH - adresse courante (high)
                return high16(currentAddress);

            // ===== MODE FILE SYSTEM =====
            case 4: // FS_STATUS - retourne nombre de fichiers
                const files = fsHook.listFiles();
                return U8(files.length);

            case 5: // FS_RESULT - résultat dernière commande
                return fsHook.lastCommandResult;

            case 6: // FS_DATA - lire byte depuis fichier ouvert
                return fsHook.readData();

            case 7: // FS_HANDLE_LOW - handle fichier ouvert (low)
                return low16(fsHook.currentFileHandle);

            case 8: // FS_HANDLE_HIGH - handle fichier ouvert (high)
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
                setStorage(s => {
                    const newStorage = new Map(s);
                    newStorage.set(currentAddress, value);
                    return newStorage;
                });
                // Auto-increment
                setCurrentAddress(addr => U16(addr + 1));
                break;

            case 2: // DISK_ADDR_LOW - définir adresse (low)
                setCurrentAddress(prev => U16((prev & 0xFF00) | value));
                break;

            case 3: // DISK_ADDR_HIGH - définir adresse (high)
                setCurrentAddress(prev => U16((prev & 0x00FF) | (value << 8)));
                break;

            // ===== MODE FILE SYSTEM =====
            case 5: // FS_COMMAND - exécuter commande FS
                fsHook.executeCommand(value);
                break;

            case 6: // FS_DATA - écrire byte dans fichier ouvert
                fsHook.writeData(value);
                break;

            case 7: // FS_FILENAME_CHAR - ajouter caractère au nom de fichier
                fsHook.writeFilenameChar(value);
                break;

            default:
                console.warn(`Disk: Unknown write port ${port}`);
                break;
        }
    }, [currentAddress, fsHook]);

    const getSize = useCallback(() => storage.size, [storage]);

    const diskDeviceHook: DiskDevice = {
        storage,
        fsHook,
        read,
        write,
        getSize,
        setStorage,
    };

    return diskDeviceHook;
};


export type DiskDevice = Device & {
    storage: Map<u16, u8>;
    fsHook: FsHook;
    setStorage: React.Dispatch<React.SetStateAction<Map<u16, u8>>>;
};

