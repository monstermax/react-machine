
import { isIoAddress, isRamAddress, isRomAddress, MEMORY_MAP } from "../memory_map";
import { Computer } from "./Computer";


export class MemoryBus {
    private computer: Computer;

    constructor(computer: Computer) {
        this.computer = computer;
    }

    public read(address: u16): u8 {
        if (isRomAddress(address)) {
            const rom = this.computer.rom;

            if (!rom) {
                console.warn(`No ROM found. Cannot read at address ${address}`);
                return 0;
            }

            return rom.read(address);
        }

        if (isRamAddress(address)) {
            const ram = this.computer.ram;

            if (!ram) {
                console.warn(`No RAM found. Cannot read at address ${address}`);
                return 0;
            }

            return ram.read(address);
        }

        if (isIoAddress(address)) {
            const ioManager = this.computer.ioManager;

            if (!ioManager) {
                console.warn(`No IO Manager found. Cannot read at address ${address}`);
                return 0;
            }

            const ioRelativeAddress = address - MEMORY_MAP.IO_START;
            return ioManager.read(ioRelativeAddress);
        }

        throw new Error(`Address read out of memory range : ${address}`);
    }


    public write(address: u16, value: u8): void {
        if (isRomAddress(address)) {
            const rom = this.computer.rom;

            if (!rom) {
                console.warn(`No ROM found. Cannot write at address ${address}`);
                return;
            }

            rom.write(address, value)
            return;
        }

        if (isRamAddress(address)) {
            const ram = this.computer.ram;

            if (!ram) {
                console.warn(`No RAM found. Cannot write at address ${address}`);
                return;
            }

            ram.write(address, value);
            return
        }

        if (isIoAddress(address)) {
            const ioManager = this.computer.ioManager;

            if (!ioManager) {
                console.warn(`No IO Manager found. Cannot write at address ${address}`);
                return;
            }

            ioManager.write(address, value);
            return
        }

        throw new Error(`Address write out of memory range : ${address}`);
    }
}


abstract class Memory {
    private storage: StaticArray<u8>;

    constructor(size: i32) {
        this.storage = new StaticArray(size);
    }

    public read(address: u16): u8 {
        if (address < 0 || address > <u16>this.storage.length) throw new Error(`Address out of memory range : ${address}`);
        return this.storage[address];
    }

    public write(address: u16, value: u8): void {
        if (address < 0 || address > <u16>this.storage.length) throw new Error(`Address out of memory range : ${address}`);
        this.storage[address] = value;
    }
}


export class Rom extends Memory {
    private computer: Computer

    constructor(computer: Computer) {
        super(2**16);
        this.computer = computer;
    }

}


export class Ram extends Memory {
    private computer: Computer;

    constructor(computer: Computer) {
        super(2**16);
        this.computer = computer;
    }

}

