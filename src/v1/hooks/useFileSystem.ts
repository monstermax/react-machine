
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type { u16, u8 } from "@/types/cpu.types"
import { U16, U8 } from "@/lib/integers";


const SECTOR_SIZE = 256;  // 256 bytes par secteur (standard pour disques virtuels)
const MAX_SECTORS = 256;  // 256 secteurs × 256 bytes = 64KB total
const INODE_SIZE = 16;    // 16 bytes par inode
const MAX_FILES = 64;     // 64 fichiers max
const FILENAME_LENGTH = 8; // 8 chars max par nom

// Adresses réservées
const SUPERBLOCK_SECTOR = 0;     // Secteur 0: superbloc
const ALLOCATION_SECTOR = 1;     // Secteur 1: bitmap d'allocation
const INODE_TABLE_START = 2;     // Secteurs 2-17: table d'inodes (16 secteurs)
const DATA_SECTORS_START = 18;   // Secteurs 18-255: données utilisateur

// Bits de permission (style Unix)
const PERMISSION_BITS = {
    READ: 0b100,  // 4 - Lecture
    WRITE: 0b010,  // 2 - Écriture  
    EXECUTE: 0b001,  // 1 - Exécution
} as const;

// Valeurs par défaut
const DEFAULT_PERMISSIONS = PERMISSION_BITS.READ | PERMISSION_BITS.WRITE; // rw- (lecture/écriture)
const EXECUTABLE_PERMISSIONS = DEFAULT_PERMISSIONS | PERMISSION_BITS.EXECUTE; // rwx
const READ_ONLY_PERMISSIONS = PERMISSION_BITS.READ; // r-- (lecture seule)


type Permission = 'read' | 'write' | 'execute';

// Structure Inode (16 bytes)
interface Inode {
    name: string;       // 8 bytes
    size: u16;          // 2 bytes (taille en bytes, max 65535)
    startSector: u8;    // 1 byte (secteur de départ)
    flags: u8;          // 1 byte (0=libre, 1=occupé, 2=verrouillé)
    permissions: u8;    // 1 byte : rwx bits (propriétaire seulement)
    // 4 bytes réservés pour extensions
}



export const useFileSystem = (storage: Map<u16, u8>, setStorage: React.Dispatch<React.SetStateAction<Map<u16, u8>>>): FsHook => {
    //console.log('RENDER ComputerPage.useComputer.useIo.useDiskDevice')
    const [currentSector, setCurrentSector] = useState<u8>(U8(0)); // TODO: useRef
    const [currentFileHandle, setCurrentFileHandle] = useState<u16>(U16(0)); // TODO: useRef
    const [lastCommandResult, setLastCommandResult] = useState<u8>(U8(0));

    const filePointerRef = useRef<u16>(U16(0));  // Position dans le fichier courant
    const [filenameBuffer, setFilenameBuffer] = useState<string>("");
    const [filenameIndex, setFilenameIndex] = useState<number>(0);


    // ===== FONCTIONS UTILITAIRES =====

    // Convertir secteur+offset → adresse mémoire
    const sectorToAddress = useCallback((sector: u8, offset: u16 = 0 as u16): u16 => {
        return U16((sector * SECTOR_SIZE) + offset);
    }, []);


    // Lire un octet à une adresse
    const readByte = useCallback((address: u16): u8 => {
        return storage.get(address) ?? U8(0);
    }, [storage]);


    // Écrire un octet à une adresse
    const writeByte = useCallback((address: u16, value: u8) => {
        setStorage(s => new Map(s).set(address, value));
    }, [setStorage]);


    // ===== GESTION DES INODES =====

    // Trouver un inode libre
    const findFreeInode = useCallback((): number => {
        for (let i = 0; i < MAX_FILES; i++) {
            const inodeAddr = sectorToAddress(INODE_TABLE_START as u8, i * INODE_SIZE as u16);
            const flags = readByte(inodeAddr + 12 as u16); // Byte 12 = flags
            if (flags === 0) return i; // Libre
        }

        return -1; // Plus de place
    }, [sectorToAddress, readByte]);


    // Lire un inode
    const readInode = useCallback((inodeIndex: number): Inode | null => {
        if (inodeIndex < 0 || inodeIndex >= MAX_FILES) return null;

        const baseAddr = sectorToAddress(INODE_TABLE_START as u8, inodeIndex * INODE_SIZE as u16);

        // Lire nom (8 bytes)
        let name = "";
        for (let i = 0; i < FILENAME_LENGTH; i++) {
            const charCode = readByte(U16(baseAddr + i));
            if (charCode === 0) break;
            name += String.fromCharCode(charCode);
        }

        // Lire taille (2 bytes)
        const sizeLow = readByte(U16(baseAddr + 8));
        const sizeHigh = readByte(U16(baseAddr + 9));
        const size = U16((sizeHigh << 8) | sizeLow);

        // Lire secteur de départ
        const startSector = readByte(U16(baseAddr + 10));

        // Lire flags
        const flags = readByte(U16(baseAddr + 12));

        // Lire permissions (byte 13)
        const permissions = readByte(U16(baseAddr + 13));

        return { name, size, startSector, flags, permissions };
    }, [sectorToAddress, readByte]);


    // Écrire un inode
    const writeInode = useCallback((inodeIndex: number, inode: Inode) => {
        const baseAddr = sectorToAddress(INODE_TABLE_START as u8, inodeIndex * INODE_SIZE as u16);

        // Écrire nom (8 bytes max)
        for (let i = 0; i < FILENAME_LENGTH; i++) {
            const charCode = i < inode.name.length ? inode.name.charCodeAt(i) : 0;
            writeByte(U16(baseAddr + i), U8(charCode));
        }

        // Écrire taille (2 bytes)
        writeByte(U16(baseAddr + 8), U8(inode.size & 0xFF)); // Low
        writeByte(U16(baseAddr + 9), U8((inode.size >> 8) & 0xFF)); // High

        // Écrire secteur de départ
        writeByte(U16(baseAddr + 10), U8(inode.startSector));

        // Écrire flags
        writeByte(U16(baseAddr + 12), U8(inode.flags));

        // Écrire permissions (byte 13)
        writeByte(U16(baseAddr + 13), U8(inode.permissions || DEFAULT_PERMISSIONS));

        // Bytes 11, 14-15 réservés (mettre à 0)
        writeByte(U16(baseAddr + 11), U8(0));
        for (let i = 14; i < INODE_SIZE; i++) {
            writeByte(U16(baseAddr + i), U8(0));
        }
    }, [sectorToAddress, writeByte]);

    // Vérifier si une permission est accordée
    const hasPermission = useCallback((inode: Inode, permission: Permission): boolean => {
        const permBits = inode.permissions || DEFAULT_PERMISSIONS;

        switch (permission) {
            case 'read':
                return (permBits & PERMISSION_BITS.READ) !== 0;
            case 'write':
                return (permBits & PERMISSION_BITS.WRITE) !== 0;
            case 'execute':
                return (permBits & PERMISSION_BITS.EXECUTE) !== 0;
            default:
                return false;
        }
    }, []);


    // Modifier les permissions d'un fichier
    const setPermissions = useCallback((inodeIndex: number, permissions: u8): boolean => {
        const inode = readInode(inodeIndex);
        if (!inode || inode.flags !== 1) return false;

        const updatedInode = { ...inode, permissions };
        writeInode(inodeIndex, updatedInode);
        return true;
    }, [readInode, writeInode]);


    // Obtenir une chaîne de permissions style Unix (ex: "rw-", "r-x")
    const getPermissionString = useCallback((inode: Inode): string => {
        const perm = inode.permissions || DEFAULT_PERMISSIONS;
        return [
            (perm & PERMISSION_BITS.READ) ? 'r' : '-',
            (perm & PERMISSION_BITS.WRITE) ? 'w' : '-',
            (perm & PERMISSION_BITS.EXECUTE) ? 'x' : '-'
        ].join('');
    }, []);


    // Gestion du bitmap d'allocation
    const getAllocationBitmap = useCallback((): Uint8Array => {
        const bitmap = new Uint8Array(MAX_SECTORS);
        const sectorAddr = sectorToAddress(ALLOCATION_SECTOR as u8, 0 as u16);

        // Lire le bitmap depuis le stockage
        for (let i = 0; i < MAX_SECTORS; i++) {
            bitmap[i] = readByte(U16(sectorAddr + i)) ?? 0;
        }

        return bitmap;
    }, [sectorToAddress, readByte]);


    const setAllocationBitmap = useCallback((bitmap: Uint8Array) => {
        const sectorAddr = sectorToAddress(ALLOCATION_SECTOR as u8, 0 as u16);

        // Écrire le bitmap dans le stockage
        for (let i = 0; i < MAX_SECTORS; i++) {
            writeByte(U16(sectorAddr + i), U8(bitmap[i] || 0));
        }
    }, [sectorToAddress, writeByte]);


    // Trouver N secteurs libres contigus
    const findFreeSectors = useCallback((count: number): number => {
        const bitmap = getAllocationBitmap();

        for (let start = DATA_SECTORS_START; start <= MAX_SECTORS - count; start++) {
            let free = true;

            // Vérifier si les 'count' secteurs sont libres
            for (let i = 0; i < count; i++) {
                if (bitmap[start + i] !== 0) {
                    free = false;
                    break;
                }
            }

            if (free) return start; // Retourner le premier secteur libre
        }

        return -1; // Pas assez de place
    }, [getAllocationBitmap]);


    // Allouer des secteurs
    const allocateSectors = useCallback((startSector: number, count: number): boolean => {
        //console(`allocateSectors: start=${startSector}, count=${count}`);

        const bitmap = getAllocationBitmap();

        // Vérifier que tous les secteurs sont libres
        for (let i = 0; i < count; i++) {
            const sector = startSector + i;
            if (sector >= MAX_SECTORS) {
                console.error(`Sector ${sector} out of bounds`);
                return false;
            }
            if (bitmap[sector] !== 0) {
                console.error(`Sector ${sector} already occupied (value=${bitmap[sector]})`);
                //console(`Bitmap around sector ${sector}:`, bitmap.slice(Math.max(0, sector - 5), Math.min(MAX_SECTORS, sector + 6)));
                return false;
            }
        }

        // Marquer comme occupés
        for (let i = 0; i < count; i++) {
            bitmap[startSector + i] = 1;
        }

        // Sauvegarder
        setAllocationBitmap(bitmap);
        //console(`Allocation successful: ${true}`);
        return true;
    }, [getAllocationBitmap, setAllocationBitmap]);


    // Libérer des secteurs
    const freeSectors = useCallback((startSector: number, count: number) => {
        const bitmap = getAllocationBitmap();

        for (let i = 0; i < count; i++) {
            bitmap[startSector + i] = 0;
        }

        setAllocationBitmap(bitmap);
    }, [getAllocationBitmap, setAllocationBitmap]);


    const initializeFileSystem = useCallback((force=false) => {
        // Vérifier si déjà initialisé (magic number)
        const magicAddr = sectorToAddress(SUPERBLOCK_SECTOR as u8, 0 as u16);
        const magic = readByte(magicAddr);

        if (magic !== 0x42 || force) { // Notre magic number
            //console('Initializing new filesystem...');

            // Écrire magic number
            writeByte(magicAddr, 0x42 as u8);

            // Écrire version
            writeByte(sectorToAddress(SUPERBLOCK_SECTOR as u8, 1 as u16), 0x01 as u8);

            // Initialiser tous les inodes comme libres
            for (let i = 0; i < MAX_FILES; i++) {
                const inodeAddr = sectorToAddress(INODE_TABLE_START as u8, i * INODE_SIZE as u16);
                // Marquer comme libre (flags = 0)
                writeByte(U16(inodeAddr + 12), 0 as u8);

                // Permissions par défaut (byte 13)
                writeByte(U16(inodeAddr + 13), DEFAULT_PERMISSIONS as u8);
            }

            // Initialiser le bitmap d'allocation
            const bitmap = new Uint8Array(MAX_SECTORS);
            // Secteurs 0-17 réservés (superbloc, bitmap, inodes)
            for (let i = 0; i < DATA_SECTORS_START; i++) {
                bitmap[i] = 1; // Occupés (système)
            }

            // Secteurs 18-255 libres (données utilisateur)
            for (let i = DATA_SECTORS_START; i < MAX_SECTORS; i++) {
                bitmap[i] = 0; // Libres
            }

            setAllocationBitmap(bitmap);

            //console('Filesystem initialized. Free sectors:', MAX_SECTORS - DATA_SECTORS_START);

        } else {
            //console('Filesystem already initialized');
        }
    }, [sectorToAddress, readByte, writeByte, setAllocationBitmap]);


    // ===== IMPLÉMENTATION DES FONCTIONS =====

    const listFiles = useCallback((): { name: string, permissions: string, size: number }[] => {
        const files: { name: string, permissions: string, size: number }[] = [];

        for (let i = 0; i < MAX_FILES; i++) {
            const inode = readInode(i);

            if (inode && inode.flags === 1) {
                files.push({
                    name: inode.name.trim(),
                    permissions: getPermissionString(inode),
                    size: inode.size
                });
            }
        }

        return files;
    }, [readInode, getPermissionString]);


    const createFile = useCallback((name: string, permissions: u8 = DEFAULT_PERMISSIONS as u8): boolean => {
        // Vérifier longueur du nom
        if (name.length > FILENAME_LENGTH || name.length === 0) {
            console.error(`createFile: invalid name length: ${name.length}`);
            return false;
        }

        // Chercher inode libre
        const inodeIndex = findFreeInode();
        if (inodeIndex === -1) {
            console.error('createFile: NO_FREE_INODE');
            return false; // Plus d'inodes libres
        }

        // Chercher 1 secteur libre
        const startSector = findFreeSectors(1);
        if (startSector === -1) {
            console.error('createFile: NO_FREE_SECTORS');
            return false; // Plus d'espace sur le disque
        }

        //console(`createFile: found free sector ${startSector} for inode ${inodeIndex}`);

        // Vérifier que le secteur est vraiment libre
        const bitmap = getAllocationBitmap();
        if (bitmap[startSector] !== 0) {
            console.error(`createFile: sector ${startSector} is NOT free!`);
            return false;
        }

        // Allouer le secteur
        if (!allocateSectors(startSector, 1)) {
            console.error('createFile: ALLOCATION_FAILED');
            return false;
        }

        // Créer inode
        const inode: Inode = {
            name: name.padEnd(FILENAME_LENGTH, ' ').substring(0, FILENAME_LENGTH),
            size: 0 as u16,
            startSector: startSector as u8,
            flags: 1 as u8, // Occupé
            permissions,
        };

        //console(`createFile: writing inode ${inodeIndex}:`, inode);

        writeInode(inodeIndex, inode);
        return true;
    }, [findFreeInode, findFreeSectors, allocateSectors, writeInode, getAllocationBitmap]);


    const openFile = useCallback((name: string, mode: 'read' | 'write' = 'read'): u16 => {
        for (let i = 0; i < MAX_FILES; i++) {
            const inode = readInode(i);

            if (inode && inode.flags === 1 && inode.name.trim() === name.trim()) {
                // VÉRIFIER LES PERMISSIONS
                if (mode === 'read' && !hasPermission(inode, 'read')) {
                    console.log(`openFile: Permission denied (no read access to "${name}")`);
                    return U16(0xFFFF);
                }
                if (mode === 'write' && !hasPermission(inode, 'write')) {
                    console.log(`openFile: Permission denied (no write access to "${name}")`);
                    return U16(0xFFFF);
                }

                setCurrentFileHandle(U16(i));
                filePointerRef.current = U16(0);
                return U16(i);
            }
        }

        return U16(0xFFFF); // Not found
    }, [readInode, hasPermission]);


    const readData = useCallback((): u8 => {
        if (currentFileHandle === 0xFFFF) return U8(0);

        const inode = readInode(currentFileHandle);
        if (!inode || inode.flags !== 1) return U8(0);

        // VÉRIFIER PERMISSION LECTURE
        if (!hasPermission(inode, 'read')) {
            console.log('readData: Permission denied (no read access)');
            return U8(0);
        }

        // Vérifier si on dépasse la taille
        if (filePointerRef.current >= inode.size) return U8(0);

        // Calculer adresse avec gestion multi-secteurs
        const sectorOffset = Math.floor(filePointerRef.current / SECTOR_SIZE);
        const byteInSector = filePointerRef.current % SECTOR_SIZE;
        const sector = inode.startSector + sectorOffset;

        // Vérifier que le secteur est alloué
        if (sector >= inode.startSector + Math.ceil(inode.size / SECTOR_SIZE)) {
            return U8(0); // Secteur non alloué
        }

        const address = sectorToAddress(U8(sector), U16(byteInSector));
        const value = readByte(address);

        // Avancer le pointeur
        filePointerRef.current = U16(filePointerRef.current + 1);

        return value;
    }, [currentFileHandle, sectorToAddress, readByte, readInode]);


    // Fonction pour étendre un fichier si besoin
    const extendFileIfNeeded = useCallback((inode: Inode, targetPosition: number): boolean => {
        //console(`extendFileIfNeeded: inode.size=${inode.size}, targetPosition=${targetPosition}, startSector=${inode.startSector}`);

        const neededSectors = Math.ceil((targetPosition + 1) / SECTOR_SIZE);
        const allocatedSectors = Math.ceil(inode.size / SECTOR_SIZE);

        //console(`neededSectors=${neededSectors}, allocatedSectors=${allocatedSectors}`);

        // CAS SPÉCIAL : Fichier vide, première écriture
        if (allocatedSectors === 0) {
            // Vérifier si le premier secteur est déjà alloué
            const bitmap = getAllocationBitmap();
            if (bitmap[inode.startSector] === 0) {
                //console(`First write: allocating sector ${inode.startSector}`);
                return allocateSectors(inode.startSector, 1);

            } else {
                //console(`First write: sector ${inode.startSector} already allocated (good)`);
                return true; // Déjà alloué par createFile
            }
        }

        // Si on a déjà assez de secteurs
        if (neededSectors <= allocatedSectors) {
            return true;
        }

        // Besoin de secteurs supplémentaires
        const additionalSectors = neededSectors - allocatedSectors;
        const startAllocation = inode.startSector + allocatedSectors;

        //console(`Need ${additionalSectors} more sectors starting at ${startAllocation}`);

        return allocateSectors(startAllocation, additionalSectors);
    }, [allocateSectors, getAllocationBitmap]);


    // writeData corrigée avec extendFileIfNeeded
    const writeData = useCallback((value: u8) => {
        if (currentFileHandle === 0xFFFF) return;

        const inode = readInode(currentFileHandle);
        if (!inode || inode.flags !== 1) return;

        // VÉRIFIER PERMISSION ÉCRITURE
        if (!hasPermission(inode, 'write')) {
            console.log('writeData: Permission denied (no write access)');
            setLastCommandResult(U8(0xFB)); // Erreur: permission refusée
            return;
        }

        // 1. Étendre le fichier si besoin
        if (!extendFileIfNeeded(inode, filePointerRef.current)) {
            //console('writeData: CANNOT_EXTEND_FILE');
            setLastCommandResult(U8(0xFC)); // Erreur: extension impossible
            return;
        }

        // 2. Calculer adresse
        const sectorOffset = Math.floor(filePointerRef.current / SECTOR_SIZE);
        const byteInSector = filePointerRef.current % SECTOR_SIZE;
        const sector = inode.startSector + sectorOffset;

        const address = sectorToAddress(U8(sector), U16(byteInSector));

        //console(`Writing byte ${value} at position ${filePointerRef.current}, ` + `sector ${sector} (offset ${byteInSector}), ` + `file sectors: ${getFileSectors(inode).join(',')}`);

        // 3. Écrire
        writeByte(address, value);

        // 4. Mettre à jour taille
        if (filePointerRef.current >= inode.size) {
            const newInode = {
                ...inode,
                size: U16(filePointerRef.current + 1)
            };
            writeInode(currentFileHandle, newInode);
        }

        // 5. Avancer pointeur
        filePointerRef.current = U16(filePointerRef.current + 1);

        setLastCommandResult(U8(0x01)); // Succès

    }, [currentFileHandle, readInode, extendFileIfNeeded, sectorToAddress, writeByte, writeInode]);


    // DEBUG: Voir les secteurs utilisés par un fichier
    const getFileSectors = useCallback((inode: Inode): number[] => {
        const sectors: number[] = [];
        const sectorCount = Math.ceil(inode.size / SECTOR_SIZE);

        for (let i = 0; i < sectorCount; i++) {
            sectors.push(inode.startSector + i);
        }

        return sectors;
    }, []);


    const executeCommand = useCallback((cmd: u8) => {
        let result = U8(0);

        //console(`FS Command: 0x${cmd.toString(16)}, filenameBuffer="${filenameBuffer}"`);

        switch (cmd) {
            case 0x90: // LIST - retourne nombre de fichiers
                const files = listFiles();
                result = U8(files.length);
                break;

            case 0x91: // CREATE - utilise filenameBuffer
                if (createFile(filenameBuffer)) {
                    result = U8(1); // Succès
                } else {
                    result = U8(0); // Échec
                }
                setFilenameBuffer(""); // Réinitialiser
                setFilenameIndex(0);
                break;

            case 0x92: // OPEN - ouvre fichier
                const handle = openFile(filenameBuffer);
                result = handle === 0xFFFF ? U8(0) : U8(1);
                setFilenameBuffer("");
                setFilenameIndex(0);
                break;

            case 0x93: // CLOSE - ferme fichier courant
                setCurrentFileHandle(U16(0xFFFF));
                filePointerRef.current = U16(0)
                result = U8(1);
                break;

            // Dans executeCommand, case 0x94: // DELETE
            case 0x94: { // DELETE - supprime fichier
                const inode = readInode(currentFileHandle);
                if (inode && inode.flags === 1) {
                    // Calculer combien de secteurs ce fichier utilise
                    const sectorsUsed = Math.ceil(inode.size / SECTOR_SIZE);

                    // Libérer les secteurs
                    freeSectors(inode.startSector, sectorsUsed);

                    // Marquer l'inode comme libre
                    const newInode = { ...inode, flags: 0 as u8 };
                    writeInode(currentFileHandle, newInode);

                    // Fermer le fichier
                    setCurrentFileHandle(U16(0xFFFF));
                    filePointerRef.current = U16(0);

                    result = U8(1); // Succès
                } else {
                    result = U8(0); // Échec
                }
                break;
            }

            case 0x95: // SEEK - positionne pointeur
                // TODO: Implémenter
                break;

            case 0x96: // CHMOD - changer permissions du fichier courant
                // La valeur des permissions est dans filenameBuffer (ex: "rwx" = 0b111 = 7)
                if (currentFileHandle !== 0xFFFF) {
                    const permValue = parseInt(filenameBuffer, 10) || 0;
                    if (setPermissions(currentFileHandle, U8(permValue))) {
                        result = U8(1);
                    }
                }
                setFilenameBuffer("");
                setFilenameIndex(0);
                break;

            case 0x97: // GET_PERM - lire permissions du fichier courant
                if (currentFileHandle !== 0xFFFF) {
                    const inode = readInode(currentFileHandle);
                    if (inode) {
                        result = U8(inode.permissions || DEFAULT_PERMISSIONS);
                    }
                }
                break;

            case 0x98: // CREATE_WITH_PERM - créer fichier avec permissions
                // Format: "FILENAME:PERM" ex: "TEST.TXT:6" (6 = rw-)
                const parts = filenameBuffer.split(':');
                if (parts.length === 2) {
                    const [name, permStr] = parts;
                    const permissions = parseInt(permStr, 10) || DEFAULT_PERMISSIONS;
                    if (createFile(name, U8(permissions))) {
                        result = U8(1);
                    }
                } else {
                    // Créer avec permissions par défaut
                    if (createFile(filenameBuffer, DEFAULT_PERMISSIONS as u8)) {
                        result = U8(1);
                    }
                }
                setFilenameBuffer("");
                setFilenameIndex(0);
                break;

            default:
                result = U8(0xFF); // Commande inconnue
        }

        //console('executeCommand:', result)

        setLastCommandResult(result);
    }, [listFiles, createFile, openFile, filenameBuffer]);


    // Fonction pour ajouter un caractère au nom de fichier
    const writeFilenameChar = useCallback((charCode: u8) => {
        // TODO: a remplacer par une commande
        if (filenameIndex < FILENAME_LENGTH) {
            const char = String.fromCharCode(charCode);
            setFilenameBuffer(prev => prev + char);
            setFilenameIndex(prev => prev + 1);
        }
    }, [filenameIndex]);


    const reset = useCallback(() => {
        setCurrentSector(U8(0));
        setCurrentFileHandle(U16(0));
        setLastCommandResult(U8(0));

        filePointerRef.current = U16(0)
        setFilenameBuffer("");
        setFilenameIndex(0);
    }, [])


    const fsHook: FsHook = {
        currentSector,
        currentFileHandle,
        lastCommandResult,
        initializeFileSystem,
        setCurrentSector,
        setCurrentFileHandle,
        listFiles,
        createFile,
        openFile,
        hasPermission,
        setPermissions,
        getPermissionString,
        //readFile,
        readData,
        writeData,
        executeCommand,
        writeFilenameChar,
        reset,
    };

    return fsHook;
}


export type FsHook = {
    currentSector: u8;
    currentFileHandle: u16;
    lastCommandResult: u8;
    initializeFileSystem: (force?: boolean) => void;
    setCurrentSector: React.Dispatch<React.SetStateAction<u8>>;
    setCurrentFileHandle: React.Dispatch<React.SetStateAction<u16>>;
    listFiles: () => {name: string, permissions: string, size: number}[];
    createFile: (name: string, permissions?: u8) => boolean;
    //readFile: (name: string) => void;
    openFile: (name: string, mode?: 'read' | 'write') => u16;
    hasPermission: (inode: Inode, permission: Permission) => boolean;
    setPermissions: (inodeIndex: number, permissions: u8) => boolean;
    getPermissionString: (inode: Inode) => string;
    readData: () => u8;
    writeData: (value: u8) => void;
    executeCommand: (cmd: u8) => void;
    writeFilenameChar: (charCode: u8) => void;
    reset: () => void;
}



/*

Port 4: FS_STATUS     - Lecture → nombre de fichiers
Port 5: FS_COMMAND    - Écriture → commande, Lecture → résultat
Port 6: FS_DATA       - Read/Write bytes du fichier ouvert
Port 7: FS_FILENAME   - Écriture → ajouter char au nom
Port 8: FS_HANDLE_LOW - Lecture → handle fichier (low)
Port 9: FS_HANDLE_HIGH- Lecture → handle fichier (high)


0x90: LIST    - Compter fichiers
0x91: CREATE  - Créer fichier (utilise filename buffer)
0x92: OPEN    - Ouvrir fichier (utilise filename buffer)
0x93: CLOSE   - Fermer fichier courant
0x94: DELETE  - Supprimer (TODO)
0x95: SEEK    - Positionner pointeur (TODO)
```

### **💡 Workflow typique**
```
1. Écrire nom → port 7 (caractère par caractère)
2. Créer → port 5 = 0x91
3. Réécrire nom → port 7
4. Ouvrir → port 5 = 0x92
5. Écrire données → port 6
6. Fermer → port 5 = 0x93

*/

