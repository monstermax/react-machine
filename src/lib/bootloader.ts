
//import type { u8, u16 } from "@/types/cpu.types";
import type { u16, u8 } from "@/types/cpu.types";
import { Opcode } from "./instructions";
import { MEMORY_MAP } from "./memory_map";


// Bootloader ROM : Initialise le système et saute à l'OS

export const BOOTLOADER: Map<u8, u8> = new Map([
    // Initialiser le Stack Pointer
    [0x00, Opcode.SET_SP],
    [0x01, MEMORY_MAP.STACK_END & 0xFF],
    [0x02, (MEMORY_MAP.STACK_END >> 8) & 0xFF],

    // Sauter à l'OS qui est déjà en RAM
    [0x03, Opcode.JMP],
    [0x04, MEMORY_MAP.OS_START & 0xFF],        // Low byte: 0x00
    [0x05, (MEMORY_MAP.OS_START >> 8) & 0xFF], // High byte: 0x01
] as [u8, u8][]);

