
import { Computer } from "./Computer";


const DEVICE_PORT_SIZE: u8 = 0x10; // 16 ports per device


export class IoManager {
    private computer: Computer;
    private devices: IoDevice[] = [];

    constructor(computer: Computer) {
        this.computer = computer;
    }

    public read(ioRelativeAddress: u16): u8 {
        const ioDevice: u8 = Math.floor(ioRelativeAddress / DEVICE_PORT_SIZE) as u8
        const ioPort: u8 = ioDevice % DEVICE_PORT_SIZE;

        const device = this.devices[ioDevice];

        if (device) {
            return device.read(ioPort);
        }

        console.warn(`No IO Device found. Cannot read device #${ioDevice} on port ${ioPort}`);

        return 0
    }

    public write(ioRelativeAddress: u16, value: u8): void {
        const ioDevice: u8 = Math.floor(ioRelativeAddress / DEVICE_PORT_SIZE) as u8
        const ioPort: u8 = ioDevice % DEVICE_PORT_SIZE;

        const device = this.devices[ioDevice];

        if (device) {
            device.write(ioPort, value);
            return
        }

        console.warn(`No IO Device found. Cannot write device #${ioDevice} on port ${ioPort}`);

        return
    }
}


abstract class IoDevice {
    public read(port: u8): u8 {
        return 0
    }

    public write(port: u8, value: u8): void {

    }
}
