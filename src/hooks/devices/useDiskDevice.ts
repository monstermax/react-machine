
import { useState, useCallback } from "react";

import { high16, low16, U16, U8 } from "@/lib/integers";
import { useFileSystem, type FsHook } from "../useFileSystem";

import type { Device, u16, u8 } from "@/types/cpu.types";


export const useDiskDevice = (data: Map<u16, u8>): DiskDevice => {
    const [storage, setStorage] = useState<Map<u16, u8>>(data);
    const [currentAddress, setCurrentAddress] = useState<u16>(0 as u16);

    const fsHook = useFileSystem(storage, setStorage);


    const read = useCallback((port: u8): u8 => {
        switch (port) {

            // ===== MODE RAW =====

            case 0: // OS_DISK_DATA - accès direct - read byte at current address
                return storage.get(currentAddress) ?? 0 as u8;

            case 1: // OS_DISK_SIZE - taille disque - get disk size
                return U8(storage.size);

            case 2: // OS_DISK_ADDR - get current address - low
                return low16(currentAddress);

            case 3: // OS_DISK_ADDR - get current address - high
                return high16(currentAddress);

            // ===== MODE FICHIERS =====

            case 4: // OS_DISK_SECTOR - secteur FS courant
                return fsHook.currentSector;

            case 5: // OS_DISK_FS_COMMAND - résultat dernière commande
                return fsHook.lastCommandResult ?? 0;

            case 6: // FS_DATA - lire octet depuis fichier
                return fsHook.readData();

            //case 7: // FS_STATUS - état du système de fichiers
            //    return fsHook.getStatus();

            default:
                // Ports 8+ pour fonctionnalités FS avancées
                if (port >= 8) {
                    //return fsHook.readExtendedPort(port - 8);
                }
                return 0 as u8;
        }
    }, [storage, currentAddress, fsHook]);


    const write = useCallback((port: u8, value: u8) => {
        switch (port) {

            // ===== MODE RAW =====

            case 0: // OS_DISK_DATA port - write byte at current address
                setStorage(s => {
                    const newStorage = new Map(s);
                    newStorage.set(currentAddress, value);
                    return newStorage;
                });
                // Auto-increment address after write
                setCurrentAddress(addr => U16(addr + 1));
                break;

            case 2: // OS_DISK_ADDR port low byte - set read/write address
                setCurrentAddress(prev => U16((prev & 0xFF00) | value));
                break;

            case 3: // OS_DISK_ADDR port high byte
                setCurrentAddress(prev => U16((prev & 0x00FF) | (value << 8)));
                break;

            // ===== MODE FICHIERS =====

            case 4: // OS_DISK_SECTOR - changer secteur FS
                fsHook.setCurrentSector(value);
                break;

            case 5: // OS_DISK_COMMAND - exécuter commande FS
                fsHook.executeCommand(value);
                break;

            case 6: // FS_DATA - écrire octet dans fichier
                fsHook.writeData(value);
                break;

            case 7: // FS_FILENAME - écrire caractère du nom
                //fsHook.writeFilenameChar(value);
                break;

            default:
                if (port >= 8) {
                    //fsHook.writeExtendedPort(port - 8, value);
                }
        }
    }, [currentAddress, setCurrentAddress, setStorage, fsHook]);


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
    fsHook: FsHook | null;
    setStorage: React.Dispatch<React.SetStateAction<Map<u16, u8>>>;
};

