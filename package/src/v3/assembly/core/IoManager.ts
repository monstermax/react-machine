
import { MEMORY_MAP } from "../memory_map";
import { Computer } from "./Computer";


@external("env", "jsIoRead")
declare function jsIoRead(deviceIdx: u8, port: u8): u8;

@external("env", "jsIoWrite")
declare function jsIoWrite(deviceIdx: u8, port: u8, value: u8): void;


const DEVICE_PORT_SIZE: u8 = 0x10; // 16 ports per device


export class IoManager {
    private computer: Computer;
    private devices: IoDevice[] = [];
    private stringCursor: u16 = MEMORY_MAP.DEVICE_STRINGS_START;

    constructor(computer: Computer) {
        this.computer = computer;

        // Initialize device count to 0
        this.writeRam(MEMORY_MAP.DEVICE_TABLE_COUNT, 0);
    }

    public addDevice(name: string, typeId: u8): u8 {
        const deviceIdx: u8 = <u8>this.devices.length;

        if (deviceIdx >= MEMORY_MAP.DEVICE_TABLE_MAX_ENTRIES) {
            throw new Error(`Too many IO devices`);
        }

        if (deviceIdx > <u8>255) {
            throw new Error(`Too many IO devices`);
        }

        const device: IoDevice = {
            idx: deviceIdx,
            name,
            typeId,
        }

        this.devices.push(device);

        // Write device table entry to RAM
        this.writeDeviceTableEntry(deviceIdx, name, typeId);

        return deviceIdx;
    }


    private writeDeviceTableEntry(deviceIdx: u8, name: string, typeId: u8): void {
        // Write name string to RAM and get its pointer
        const namePtr = this.writeString(name);

        // Calculate entry address
        const entryAddr: u16 = MEMORY_MAP.DEVICE_TABLE_START + (deviceIdx as u16) * (MEMORY_MAP.DEVICE_TABLE_ENTRY_SIZE as u16);

        // Compute I/O base address
        const ioBase: u16 = MEMORY_MAP.IO_START + (deviceIdx as u16) * (DEVICE_PORT_SIZE as u16);

        // Convert type string to numeric
        //const typeCode: u8 = deviceTypeFromString(typeId);
        const typeCode: u8 = typeId;

        // Write entry (6 bytes)
        this.writeRam(entryAddr + 0, deviceIdx);                     // device index
        this.writeRam(entryAddr + 1, typeCode);                      // type
        this.writeRam(entryAddr + 2, (ioBase & 0xFF) as u8);         // I/O base low
        this.writeRam(entryAddr + 3, ((ioBase >> 8) & 0xFF) as u8);  // I/O base high
        this.writeRam(entryAddr + 4, (namePtr & 0xFF) as u8);        // name ptr low
        this.writeRam(entryAddr + 5, ((namePtr >> 8) & 0xFF) as u8); // name ptr high

        // Update device count
        this.writeRam(MEMORY_MAP.DEVICE_TABLE_COUNT, (deviceIdx + 1) as u8);
    }


    private writeString(str: string): u16 {
        const ptr = this.stringCursor;

        if (ptr + str.length + 1 as u16 > MEMORY_MAP.DEVICE_STRINGS_END) {
            throw new Error(`Device strings memory overflow`);
        }

        // Write each character
        for (let i = 0; i < str.length; i++) {
            this.writeRam(this.stringCursor, str.charCodeAt(i) as u8);
            this.stringCursor++;
        }

        // Null terminator
        this.writeRam(this.stringCursor, 0);
        this.stringCursor++;

        return ptr;
    }


    private writeRam(address: u16, value: u8): void {
        const ram = this.computer.ram;

        if (!ram) {
            throw new Error("RAM not available, cannot write device table");
        }

        ram.write(address, value);
    }


    public read(ioRelativeAddress: u16): u8 {
        const ioDevice: u8 = Math.floor(ioRelativeAddress / DEVICE_PORT_SIZE) as u8
        const ioPort: u8 = ioRelativeAddress % DEVICE_PORT_SIZE as u8;

        if (ioDevice < 0 || ioDevice > ((this.devices.length - 1) as u8)) {
            throw new Error(`Read from invalid IO Device #${ioDevice}`);
        }

        const device = this.devices[ioDevice];


        if (device) {
            return jsIoRead(ioDevice, ioPort)
        }

        console.warn(`No IO Device found. Cannot read device #${ioDevice} on port ${ioPort}`);

        return 0
    }


    public write(ioRelativeAddress: u16, value: u8): void {
        const ioDevice: u8 = Math.floor(ioRelativeAddress / DEVICE_PORT_SIZE) as u8
        const ioPort: u8 = ioRelativeAddress % DEVICE_PORT_SIZE as u8;

        if (ioDevice < 0 || ioDevice > ((this.devices.length - 1) as u8)) {
            throw new Error(`Write to invalid IO Device #${ioDevice}`);
        }

        const device = this.devices[ioDevice];

        if (device) {
            jsIoWrite(ioDevice, ioPort, value)
            return
        }

        console.warn(`No IO Device found. Cannot write device #${ioDevice} on port ${ioPort}`);

        return
    }
}


class IoDevice {
    idx: u8 = 0;
    name: string = '';
    typeId: u8 = 0;
    //vendor: string = '';
    //model: string = '';
}
