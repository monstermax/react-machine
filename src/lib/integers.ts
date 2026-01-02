
import type { u16, u8 } from "@/types/cpu.types";


export function U8(value: number | u16): u8 {
    return (value & 0xFF) as unknown as u8;
}


export function U16(value: number | u8): u16 {
    return (value & 0xFFFF) as unknown as u16;
}

