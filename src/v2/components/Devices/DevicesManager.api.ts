
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";

import type { u8 } from "@/types/cpu.types";
import type { IoDevice } from "@/v2/types/cpu_v2.types";


// Device Map: commence à 0xFF00, chaque device a 16 ports (0xFF00-0xFF0F, 0xFF10-0xFF1F, etc.)
const DEVICE_PORT_SIZE = 0x10;


export class DevicesManager extends EventEmitter {
    public id: number;
    public devices: Map<u8, IoDevice> = new Map;


    constructor() {
        //console.log(`Initializing DevicesManager`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
    }


    getDeviceByName(deviceName: string): IoDevice | undefined {
        const devices = Array.from(this.devices.values());
        const device = devices.find(device => device.name === deviceName) as IoDevice | undefined
        return device;
    }


    read(ioPort: u8): u8 {
        const deviceId = U8(Math.floor(ioPort / DEVICE_PORT_SIZE));
        const devicePort = U8(ioPort % DEVICE_PORT_SIZE);

        const device = this.devices.get(deviceId);

        if (device) {
            return device.read(devicePort);
        }

        console.warn(`Read from unknown I/O port 0xFF${ioPort.toString(16).padStart(2, '0')}`);
        return 0 as u8;
    }


    write(ioPort: u8, value: u8): void {
        const deviceId = U8(Math.floor(ioPort / DEVICE_PORT_SIZE));
        const devicePort = U8(ioPort % DEVICE_PORT_SIZE);

        const device = this.devices.get(deviceId);

        if (device) {
            device.write(devicePort, value);
            return;
        }

        console.warn(`Write to unknown I/O port 0xFF${ioPort.toString(16).padStart(2, '0')} (port ${devicePort})`);
    }


    reset(): void {
        this.devices.forEach(device => {
            if (device.reset) {
                device.reset();
            }
        })
    }
}

