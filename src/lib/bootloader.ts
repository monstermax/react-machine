
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

    // === WAIT_FOR_OS (0x00) ===
    // Vérifier si un OS est chargé à OS_START
    [0x03, Opcode.MOV_A_MEM],
    [0x04, MEMORY_MAP.OS_START & 0xFF],        // Low byte
    [0x05, (MEMORY_MAP.OS_START >> 8) & 0xFF], // High byte

    // Si pas d'OS, revenir à 0x03
    [0x06, Opcode.JZ], // Si = 0, boucler
    [0x07, 0x03],      // Low: 0x03
    [0x08, 0x00],      // High: 0x00

    // === RUN_OS (0x06) ===
    // Sauter à l'OS qui est déjà en RAM
    [0x09, Opcode.JMP],
    [0x0A, MEMORY_MAP.OS_START & 0xFF],        // Low byte: 0x00
    [0x0B, (MEMORY_MAP.OS_START >> 8) & 0xFF], // High byte: 0x01
] as [u8, u8][]);

