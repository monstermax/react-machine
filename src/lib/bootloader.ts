
import { Opcode } from "./instructions";
import { MEMORY_MAP } from "./memory_map";


// Bootloader ROM : Initialise le système et saute à l'OS

export const BOOTLOADER = new Map<number, number>([
    // Initialiser le Stack Pointer
    [0x00, Opcode.LOAD_A],
    [0x01, MEMORY_MAP.STACK_END & 0xFF],    // SP = 0xFF (haut de la stack)
    // TODO: On n'a pas d'instruction pour SET SP, à ajouter plus tard

    // Sauter à l'OS qui est déjà en RAM
    [0x02, Opcode.JMP],
    [0x03, MEMORY_MAP.OS_START & 0xFF],        // Low byte: 0x00
    [0x04, (MEMORY_MAP.OS_START >> 8) & 0xFF], // High byte: 0x01
]);

