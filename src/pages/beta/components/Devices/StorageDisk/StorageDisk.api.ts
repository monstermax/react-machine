
import { EventEmitter } from "eventemitter3";

import { high16, low16, U16, U8 } from "@/lib/integers";
import { StorageFileSystem } from "./StorageFileSystem.api";

import type { CompiledCode, IoDeviceType, u16, u8 } from "@/types/cpu.types";


export class StorageDisk extends EventEmitter {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;
    public currentAddress: u16 = U16(0);
    public storage: Map<u16, u8> = new Map;
    public maxSize: number;
    private fs: StorageFileSystem;


    constructor(name: string, ioPort: u8 | null = null, data?: Array<[u16, u8]> | Map<u16, u8>, maxSize=0xFFFF) {
        //console.log(`Initializing StorageDisk`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.type = 'DiskStorage';
        this.fs = new StorageFileSystem(this);
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port
        this.maxSize = maxSize;

        if (data) {
            this.loadRawData(new Map(data))
        }

        this.emit('state', { maxSize })
    }


    eraseDisk() {
        this.loadRawData(new Map);
    }


    formatDisk() {
        this.eraseDisk();
        this.fs.initializeFileSystem(true);

        this.emit('state', { storage: this.storage })
    }


    loadRawData = async (data: CompiledCode) => {
        this.storage = new Map(data);

        if (this.storage.size > this.maxSize) {
            console.warn(`Disk ${this.name} overloaded`);
            this.deleteOverload()
        }

        this.emit('state', { storage: this.storage })
    }


    deleteOverload() {
        while (this.storage.size > this.maxSize) {
            const key = this.storage.keys().next();
            if (key.done) break;
            this.storage.delete(key.value)
        }
    }


    read(port: u8): u8 {
        switch (port) {
            // ===== MODE RAW =====
            case 0: // DISK_DATA - lecture byte à l'adresse courante
                return this.storage.get(this.currentAddress) ?? 0 as u8;

            case 1: // DISK_SIZE_LOW - taille disque
                return low16(this.storage.size as u16); // Low byte

            case 2: // DISK_SIZE_HIGH - taille disque
                return high16(this.storage.size as u16); // High byte

            case 3: // DISK_ADDR_LOW - adresse courante (low)
                return low16(this.currentAddress);

            case 4: // DISK_ADDR_HIGH - adresse courante (high)
                return high16(this.currentAddress);

            // ===== MODE FILE SYSTEM =====
            case 8: // FS_STATUS - retourne nombre de fichiers
                const files = this.fs.listFiles();
                return U8(files.length);

            case 9: // FS_COMMAND - résultat dernière commande
                return this.fs.lastCommandResult;

            case 10: // FS_DATA - lire byte depuis fichier ouvert
                return this.fs.readData();

            //case 11: // PROGRAM_DISK_FS_FILENAME

            case 12: // FS_HANDLE_LOW - handle fichier ouvert (low)
                return low16(this.fs.currentFileHandle);

            case 13: // FS_HANDLE_HIGH - handle fichier ouvert (high)
                return high16(this.fs.currentFileHandle);

            default:
                console.warn(`Disk: Unknown read port ${port}`);
                return 0 as u8;
        }
    }


    write(port: u8, value: u8): void {
        switch (port) {
            // ===== MODE RAW =====
            case 0: // DISK_DATA - écrire byte à l'adresse courante
                this.storage.set(this.currentAddress, value);

                if (this.storage.size > this.maxSize) {
                    this.storage.delete(this.currentAddress)
                    console.warn(`Disk ${this.name} overloaded`);
                }

                this.currentAddress = U16(this.currentAddress + 1);
                this.emit('state', { storage: this.storage })
                break;

            case 3: // DISK_ADDR_LOW - définir adresse (low)
                this.currentAddress = U16((this.currentAddress & 0xFF00) | value);
                break;

            case 4: // DISK_ADDR_HIGH - définir adresse (high)
                this.currentAddress = U16((this.currentAddress & 0x00FF) | (value << 8));
                break;

            // ===== MODE FILE SYSTEM =====
            case 9: // FS_COMMAND - exécuter commande FS
                this.fs.executeCommand(value);
                this.emit('state', { storage: this.storage })
                break;

            case 10: // FS_DATA - écrire byte dans fichier ouvert
                this.fs.writeData(value);
                this.emit('state', { storage: this.storage })
                break;

            case 11: // FS_FILENAME - ajouter caractère au nom de fichier
                this.fs.writeFilenameChar(value);
                this.emit('state', { storage: this.storage })
                break;

            //case 12: // FS_HANDLE_LOW
            //case 13: // FS_HANDLE_HIGH

            default:
                console.warn(`Disk: Unknown write port ${port}`);
                break;
        }
    }

}

