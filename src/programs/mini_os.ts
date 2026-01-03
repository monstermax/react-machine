
import { Opcode } from "../lib/instructions";
import { mapAddress8To16, MEMORY_MAP } from "../lib/memory_map";

import type { u16, u8 } from "@/types/cpu.types";


// Mini OS : Attend qu'un programme soit chargé en RAM, puis l'exécute
export const MINI_OS: Map<u8, u8> = new Map([
    // === WAIT_FOR_PROGRAM (0x00) ===
    // Vérifier si un programme est chargé à PROGRAM_START
    [0x00, Opcode.MOV_A_MEM],
    [0x01, MEMORY_MAP.PROGRAM_START & 0xFF],        // Low byte
    [0x02, (MEMORY_MAP.PROGRAM_START >> 8) & 0xFF], // High byte

    [0x03, Opcode.JZ],                              // Si = 0, boucler
    [0x04, MEMORY_MAP.OS_START & 0xFF],             // Low: 0x00
    [0x05, (MEMORY_MAP.OS_START >> 8) & 0xFF],      // High: 0x01

    // === RUN_PROGRAM (0x06) ===
    // Programme détecté, sauter dessus
    [0x06, Opcode.JMP],
    [0x07, MEMORY_MAP.PROGRAM_START & 0xFF],        // Low: 0x00
    [0x08, (MEMORY_MAP.PROGRAM_START >> 8) & 0xFF], // High: 0x02

    // === PROGRAM_RETURN (0x09) ===
    // Retour au début (pour l'instant jamais atteint car HALT arrête le CPU)
    [0x09, Opcode.JMP],
    [0x0A, MEMORY_MAP.OS_START & 0xFF],             // Low: 0x00
    [0x0B, (MEMORY_MAP.OS_START >> 8) & 0xFF],      // High: 0x01
] as [u8, u8][]);



//console.log('MINI_OS:', MINI_OS)
