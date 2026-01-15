
import type { u8 } from "@/types/cpu.types";


export interface Device {
    read(port: u8): u8;
    write(port: u8, value: u8): void;
    getSize?(): number;
    reset?(): void;
}
