
import { isIoAddress, isRamAddress, isRomAddress, MEMORY_MAP } from "../memory_map";
import { toHex } from "../utils";
import { Computer } from "./Computer";


export class MemoryBus {
    private computer: Computer;
    verbose: boolean = true;

    constructor(computer: Computer) {
        this.computer = computer;
    }

    public read(address: u16): u8 {
        let value: u8 = 0;

        if (isRomAddress(address)) {
            const rom = this.computer.rom;

            if (!rom || !rom.read) {
                throw new Error(`No ROM found. Cannot read at address ${toHex(address)}`);
            }

            value = rom.read(address);

        } else if (isRamAddress(address)) {
            const ram = this.computer.ram;

            if (!ram) {
                throw new Error(`No RAM found. Cannot read at address ${toHex(address)}`);
            }

            value = ram.read(address);

        } else if (isIoAddress(address)) {
            const ioManager = this.computer.ioManager;

            if (!ioManager) {
                throw new Error(`No IO Manager found. Cannot read at address ${toHex(address)}`);
            }

            const ioRelativeAddress = address - MEMORY_MAP.IO_START;

            value = ioManager.read(ioRelativeAddress);

        } else {
            throw new Error(`Address read out of memory range : ${toHex(address)}`);
        }

        if (this.verbose) {
            console.log(`Reading Memory value "${toHex(value)}" (${value}) at address "${toHex(address)} (${address})"`);
        }
        return value;
    }


    public write(address: u16, value: u8): void {
        if (this.verbose && ! isRomAddress(address)) {
            console.log(`Writing Memory value "${toHex(value)}" (${value}) at address "${toHex(address)} (${address})"`);
        }

        if (isRomAddress(address)) {
            const rom = this.computer.rom;

            if (!rom) {
                throw new Error(`No ROM found. Cannot write at address ${toHex(address)}`);
            }

            rom.write(address, value)
            return;
        }

        if (isRamAddress(address)) {
            const ram = this.computer.ram;

            if (!ram) {
                throw new Error(`No RAM found. Cannot write at address ${toHex(address)}`);
            }

            ram.write(address, value);
            return
        }

        if (isIoAddress(address)) {
            const ioManager = this.computer.ioManager;

            if (!ioManager) {
                throw new Error(`No IO Manager found. Cannot write at address ${toHex(address)}`);
            }

            const ioRelativeAddress = address - MEMORY_MAP.IO_START;

            ioManager.write(ioRelativeAddress, value);
            return
        }

        throw new Error(`Address write out of memory range : ${toHex(address)}`);
    }
}


abstract class Memory {
    protected storage: StaticArray<u8>;

    constructor(size: i32) {
        this.storage = new StaticArray<u8>(size);
    }

    public read(address: u16): u8 {
        if (address < 0 || address > <u16>this.storage.length - 1) {
            throw new Error(`Address out of memory range : ${address}`);
        }

        return this.storage[address];
    }

    public write(address: u16, value: u8): void {
        if (address < 0 || address > <u16>this.storage.length - 1) {
            throw new Error(`Address out of memory range : ${address}`);
        }

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

