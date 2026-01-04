
import { useCallback, useMemo, useRef, useState } from "react"

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


// Structure Inode (16 bytes)
interface Inode {
    name: string;           // 8 bytes
    size: u16;           // 2 bytes (taille en bytes, max 65535)
    startSector: u8;    // 1 byte (secteur de départ)
    flags: u8;          // 1 byte (0=libre, 1=occupé, 2=verrouillé)
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

        return { name, size, startSector, flags };
    }, [sectorToAddress, readByte]);


    // Écrire un inode
    const writeInode = useCallback((inodeIndex: number, inode: Inode) => {
        const baseAddr = sectorToAddress(INODE_TABLE_START as u8, inodeIndex * INODE_SIZE as u16);

        // BUG: fait planter le CPU

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

        // Bytes 11, 13-15 réservés (mettre à 0)
        writeByte(U16(baseAddr + 11), U8(0));
        for (let i = 13; i < INODE_SIZE; i++) {
            writeByte(U16(baseAddr + i), U8(0));
        }
    }, [sectorToAddress, writeByte]);


    // ===== IMPLÉMENTATION DES FONCTIONS =====

    const listFiles = useCallback((): string[] => {
        const files: string[] = [];

        for (let i = 0; i < MAX_FILES; i++) {
            const inode = readInode(i);

            if (inode && inode.flags === 1) { // Fichier actif
                files.push(inode.name);
            }
        }

        console.log('listFiles:', files)

        return files;
    }, [readInode]);


    const createFile = useCallback((name: string): boolean => {
        // Vérifier longueur du nom
        if (name.length > FILENAME_LENGTH || name.length === 0) {
            return false;
        }

        // Chercher inode libre
        const inodeIndex = findFreeInode();
        if (inodeIndex === -1) {
            console.log('createFile: NO_FREE_SPACE')
            return false; // Plus d'espace
        }

        // Chercher secteurs libres (simplifié: 1 secteur par fichier pour commencer)
        // TODO: Implémenter bitmap d'allocation

        const startSector = DATA_SECTORS_START as u8; // Simplifié

        // Créer inode
        const inode: Inode = {
            name: name.padEnd(FILENAME_LENGTH, ' ').substring(0, FILENAME_LENGTH),
            size: 0 as u16,
            startSector,
            flags: 1 as u8, // Occupé
        };

        console.log('createFile:', inode)

        writeInode(inodeIndex, inode);
        return true;
    }, [findFreeInode, writeInode]);


    const openFile = useCallback((name: string): u16 => {
        for (let i = 0; i < MAX_FILES; i++) {
            const inode = readInode(i);

            if (inode && inode.flags === 1 && inode.name.trim() === name.trim()) {
                console.log('openFile:', inode)
                setCurrentFileHandle(U16(i));
                filePointerRef.current = U16(0)
                return U16(i);
            }
        }

        console.log('openFile: FILE_NOT_OPENED')

        return U16(0xFFFF); // Not found
    }, [readInode]);


    const readData = useCallback((): u8 => {
        if (currentFileHandle === 0xFFFF) return U8(0); // Aucun fichier ouvert

        const inode = readInode(currentFileHandle);
        if (!inode || inode.flags !== 1) return U8(0);

        // Vérifier si on dépasse la taille
        if (filePointerRef.current >= inode.size) return U8(0);

        // Calculer adresse
        const sectorOffset = Math.floor(filePointerRef.current / SECTOR_SIZE) as u16;
        const byteInSector = filePointerRef.current % SECTOR_SIZE as u16;
        const sector = inode.startSector + sectorOffset as u16;

        const address = sectorToAddress(U8(sector), byteInSector);
        const value = readByte(address);

        // Avancer le pointeur
        filePointerRef.current = U16(filePointerRef.current + 1)

        //console.log('readData:', inode)

        return value;
    }, [currentFileHandle, sectorToAddress, readByte, readInode]);


    const writeData = useCallback((value: u8) => {
        if (currentFileHandle === 0xFFFF) return;

        const inode = readInode(currentFileHandle);
        if (!inode || inode.flags !== 1) return;

        // Calculer adresse
        const sectorOffset = Math.floor(filePointerRef.current / SECTOR_SIZE);
        const byteInSector = filePointerRef.current % SECTOR_SIZE;
        const sector = inode.startSector + sectorOffset;

        // Vérifier si on a besoin d'un nouveau secteur
        if (sector >= 256) {
            // Plus d'espace sur le disque
            console.log('writeData: NO_FREE_SPACE')
            setLastCommandResult(U8(0xFF)); // Erreur: plus d'espace
            return;
        }

        const address = sectorToAddress(U8(sector), U16(byteInSector));
        writeByte(address, value);

        // Mettre à jour taille si nécessaire
        if (filePointerRef.current >= inode.size) {
            // Mettre à jour l'inode avec nouvelle taille
            const newInode = { ...inode, size: U16(filePointerRef.current + 1) };
            writeInode(currentFileHandle, newInode);
        }

        //console.log('writeData:', inode)

        // Avancer le pointeur
        filePointerRef.current = U16(filePointerRef.current + 1);
    }, [currentFileHandle, sectorToAddress, writeByte, readInode, writeInode]);


    const executeCommand = useCallback((cmd: u8) => {
        let result = U8(0);

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

            case 0x94: // DELETE - supprime fichier
                // TODO: Implémenter
                result = U8(0);
                break;

            case 0x95: // SEEK - positionne pointeur
                // TODO: Implémenter
                break;

            default:
                result = U8(0xFF); // Commande inconnue
        }

        console.log('executeCommand:', result)

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
        setCurrentSector,
        setCurrentFileHandle,
        listFiles,
        createFile,
        openFile,
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
    setCurrentSector: React.Dispatch<React.SetStateAction<u8>>;
    setCurrentFileHandle: React.Dispatch<React.SetStateAction<u16>>;
    listFiles: () => string[];
    createFile: (name: string) => boolean;
    //readFile: (name: string) => void;
    openFile: (name: string) => u16
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

