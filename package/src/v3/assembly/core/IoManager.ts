
import { Computer } from "./Computer";


@external("env", "jsIoRead")
declare function jsIoRead(deviceIdx: u8, port: u8): u8;

@external("env", "jsIoWrite")
declare function jsIoWrite(deviceIdx: u8, port: u8, value: u8): void;


const DEVICE_PORT_SIZE: u8 = 0x10; // 16 ports per device


export class IoManager {
    private computer: Computer;
    private devices: IoDevice[] = [];

    constructor(computer: Computer) {
        this.computer = computer;
    }

    public addDevice(name: string, type: string, vendor: string='', model: string=''): u8 {
        const deviceIdx: u8 = <u8>this.devices.length;

        if (deviceIdx > <u8>255) {
            throw new Error(`Too many IO devices`);
        }

        const device: IoDevice = {
            idx: deviceIdx,
            name,
            type,
            vendor: vendor || '',
            model: model || '',
        }

        this.devices.push(device);

        return deviceIdx;
    }

    public read(ioRelativeAddress: u16): u8 {
        const ioDevice: u8 = Math.floor(ioRelativeAddress / DEVICE_PORT_SIZE) as u8
        const ioPort: u8 = ioDevice % DEVICE_PORT_SIZE;

        const device = this.devices[ioDevice];

        if (device) {
            return jsIoRead(ioDevice, ioPort)
        }

        console.warn(`No IO Device found. Cannot read device #${ioDevice} on port ${ioPort}`);

        return 0
    }

    public write(ioRelativeAddress: u16, value: u8): void {
        const ioDevice: u8 = Math.floor(ioRelativeAddress / DEVICE_PORT_SIZE) as u8
        const ioPort: u8 = ioDevice % DEVICE_PORT_SIZE;

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
    type: string = '';
    vendor: string = '';
    model: string = '';
}
