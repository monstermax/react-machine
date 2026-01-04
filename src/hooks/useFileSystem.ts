
import { useCallback, useState } from "react"

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
    size: number;           // 2 bytes (taille en bytes, max 65535)
    startSector: number;    // 1 byte (secteur de départ)
    flags: number;          // 1 byte (0=libre, 1=occupé, 2=verrouillé)
    // 4 bytes réservés pour extensions
}



export const useFileSystem = (storage: Map<u16, u8>, setStorage: React.Dispatch<React.SetStateAction<Map<u16, u8>>>): FsHook => {

    const [currentSector, setCurrentSector] = useState<u8>(U8(0));
    const [currentFileHandle, setCurrentFileHandle] = useState<u16>(U16(0));
    const [lastCommandResult, setLastCommandResult] = useState<u8>(U8(0));

    const [filePointer, setFilePointer] = useState<u16>(U16(0));  // Position dans le fichier courant
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
        const size = (sizeHigh << 8) | sizeLow;

        // Lire secteur de départ
        const startSector = readByte(U16(baseAddr + 10));

        // Lire flags
        const flags = readByte(U16(baseAddr + 12));

        return { name, size, startSector, flags };
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
            return false; // Plus d'espace
        }

        // Chercher secteurs libres (simplifié: 1 secteur par fichier pour commencer)
        // TODO: Implémenter bitmap d'allocation

        const startSector = DATA_SECTORS_START; // Simplifié

        // Créer inode
        const inode: Inode = {
            name: name.padEnd(FILENAME_LENGTH, ' ').substring(0, FILENAME_LENGTH),
            size: 0,
            startSector,
            flags: 1, // Occupé
        };

        writeInode(inodeIndex, inode);
        return true;
    }, [findFreeInode, writeInode]);


    const openFile = useCallback((name: string): u16 => {
        for (let i = 0; i < MAX_FILES; i++) {
            const inode = readInode(i);
            if (inode && inode.flags === 1 && inode.name.trim() === name.trim()) {
                setCurrentFileHandle(U16(i));
                setFilePointer(U16(0)); // Réinitialiser pointeur
                return U16(i);
            }
        }
        return U16(0xFFFF); // Not found
    }, [readInode]);


    const readData = useCallback((): u8 => {
        if (currentFileHandle === 0xFFFF) return U8(0); // Aucun fichier ouvert

        const inode = readInode(currentFileHandle);
        if (!inode || inode.flags !== 1) return U8(0);

        // Vérifier si on dépasse la taille
        if (filePointer >= inode.size) return U8(0);

        // Calculer adresse
        const sectorOffset = Math.floor(filePointer / SECTOR_SIZE);
        const byteInSector = filePointer % SECTOR_SIZE;
        const sector = inode.startSector + sectorOffset;

        const address = sectorToAddress(U8(sector), U16(byteInSector));
        const value = readByte(address);

        // Avancer le pointeur
        setFilePointer(prev => U16(prev + 1));

        return value;
    }, [currentFileHandle, filePointer, sectorToAddress, readByte, readInode]);


    const writeData = useCallback((value: u8) => {
        if (currentFileHandle === 0xFFFF) return;

        const inode = readInode(currentFileHandle);
        if (!inode || inode.flags !== 1) return;

        // Calculer adresse
        const sectorOffset = Math.floor(filePointer / SECTOR_SIZE);
        const byteInSector = filePointer % SECTOR_SIZE;
        const sector = inode.startSector + sectorOffset;

        // Vérifier si on a besoin d'un nouveau secteur
        if (sector >= 256) {
            // Plus d'espace sur le disque
            setLastCommandResult(U8(0xFF)); // Erreur: plus d'espace
            return;
        }

        const address = sectorToAddress(U8(sector), U16(byteInSector));
        writeByte(address, value);

        // Mettre à jour taille si nécessaire
        if (filePointer >= inode.size) {
            // Mettre à jour l'inode avec nouvelle taille
            const newInode = { ...inode, size: filePointer + 1 };
            writeInode(currentFileHandle, newInode);
        }

        // Avancer le pointeur
        setFilePointer(prev => U16(prev + 1));
    }, [currentFileHandle, filePointer, sectorToAddress, writeByte, readInode, writeInode]);


    const executeCommand = useCallback((cmd: u8) => {
        let rc = U8(0);

        switch (cmd) {
            case 0x90: // LIST - retourne nombre de fichiers
                const files = listFiles();
                rc = U8(files.length);
                break;

            case 0x91: // CREATE - utilise filenameBuffer
                if (createFile(filenameBuffer)) {
                    rc = U8(1); // Succès
                } else {
                    rc = U8(0); // Échec
                }
                setFilenameBuffer(""); // Réinitialiser
                setFilenameIndex(0);
                break;

            case 0x92: // OPEN - ouvre fichier
                const handle = openFile(filenameBuffer);
                rc = handle === 0xFFFF ? U8(0) : U8(1);
                setFilenameBuffer("");
                setFilenameIndex(0);
                break;

            case 0x93: // CLOSE - ferme fichier courant
                setCurrentFileHandle(U16(0xFFFF));
                setFilePointer(U16(0));
                rc = U8(1);
                break;

            case 0x94: // DELETE - supprime fichier
                // TODO: Implémenter
                rc = U8(0);
                break;

            case 0x95: // SEEK - positionne pointeur
                // La valeur à seek est dans un registre CPU
                // À implémenter avec une autre commande
                break;

            default:
                rc = U8(0xFF); // Commande inconnue
        }

        setLastCommandResult(rc);
    }, [listFiles, createFile, openFile, filenameBuffer]);


    // Fonction pour ajouter un caractère au nom de fichier
    const writeFilenameChar = useCallback((charCode: u8) => {
        if (filenameIndex < FILENAME_LENGTH) {
            const char = String.fromCharCode(charCode);
            setFilenameBuffer(prev => prev + char);
            setFilenameIndex(prev => prev + 1);
        }
    }, [filenameIndex]);


    const fsHook: FsHook = {
        currentSector,
        currentFileHandle,
        lastCommandResult,
        setCurrentSector,
        setCurrentFileHandle,
        setFilePointer,
        listFiles,
        createFile,
        //readFile,
        readData,
        writeData,
        executeCommand,
        writeFilenameChar,
    }

    return fsHook;
}


export type FsHook = {
    currentSector: u8;
    currentFileHandle: u16;
    lastCommandResult: u8;
    setCurrentSector: React.Dispatch<React.SetStateAction<u8>>;
    setCurrentFileHandle: React.Dispatch<React.SetStateAction<u16>>;
    setFilePointer: React.Dispatch<React.SetStateAction<u16>>;
    listFiles: () => void;
    createFile: (name: string) => void;
    //readFile: (name: string) => void;
    readData: () => u8;
    writeData: (value: u8) => void;
    executeCommand: (cmd: u8) => void;
    writeFilenameChar: (charCode: u8) => void;
}



/*

Secteur 0 : Superbloc (métadonnées FS)
Secteur 1 : Table d'allocation (bitmap)
Secteurs 2-31 : Inodes (64 fichiers max)
Secteurs 32-255 : Données utilisateur



interface Inode {
    name: string[8];      // Nom court (8 chars)
    size: number;        // Taille en bytes (max 255)
    startSector: number; // Premier secteur de données
    flags: number;       // 0=libre, 1=occupé
}


0x01 : LIST - Lister les fichiers
0x02 : CREATE - Créer fichier
0x03 : DELETE - Supprimer fichier
0x04 : OPEN - Ouvrir fichier
0x05 : READ - Lire octet
0x06 : WRITE - Écrire octet
0x07 : SEEK - Déplacer pointeur

*/

