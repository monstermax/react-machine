
import { EventEmitter } from "eventemitter3";

import { toHex, U16, U8 } from "@/v2/lib/integers";

import type { u16, u8 } from "@/types/cpu.types";
import type { IoDevice } from "@/v2/types/cpu_v2.types";
import { MEMORY_MAP } from "@/v2/lib/memory_map_16x8_bits";


// Device Map: commence à 0xFE00, chaque device a 16 ports (0xFE00-0xFE0F, 0xFE10-0xFE1F, etc.)
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
        const devices: IoDevice[] = Array.from(this.devices.values());
        const device = devices.find(device => device.name === deviceName) as IoDevice | undefined
        return device;
    }


    read(ioPort: u16): u8 {
        const deviceId: u8 = U8(Math.floor(ioPort / DEVICE_PORT_SIZE));
        const devicePort: u8 = U8(ioPort % DEVICE_PORT_SIZE);

        const device = this.devices.get(deviceId);

        if (device) {
            return device.read(devicePort);
        }

        console.warn(`Read from unknown I/O port 0xFF${toHex(ioPort)}`);
        return 0 as u8;
    }


    write(ioPort: u16, value: u8): void {
        const deviceId: u8 = U8(Math.floor(ioPort / DEVICE_PORT_SIZE));
        const devicePort: u8 = U8(ioPort % DEVICE_PORT_SIZE);

        const device = this.devices.get(deviceId);

        if (device) {
            device.write(devicePort, value);
            return;
        }

        console.warn(`Write to unknown I/O port ${toHex(MEMORY_MAP.IO_START + ioPort)} (device ${deviceId} port ${devicePort})`);
    }


    reset(): void {
        this.devices.forEach(device => {
            if (device.reset) {
                device.reset();
            }
        })
    }
}

