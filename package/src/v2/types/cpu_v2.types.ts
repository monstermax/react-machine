
import type { IoDeviceType, u8 } from "@/types/cpu.types";


export interface IoDevice {
    name: string;
    ioPort: u8;
    type: IoDeviceType;
    read(port: u8): u8;
    write(port: u8, value: u8): void;
    getSize?(): number;
    reset?(): void;
}

