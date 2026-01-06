
//import type { u8, u16 } from "@/types/cpu.types";
import type { u16, u8 } from "@/types/cpu.types";
import { Opcode } from "../lib/instructions";
import { MEMORY_MAP } from "../lib/memory_map";
import { high16, low16 } from "@/lib/integers";


// TODO: bootloader v2 qui copie le contenu de osDisk en RAM puis boot dessus

// ALTERNATIVE: bootloader v3 qui boote sur le disk (sans passer par la RAM. requiert des instructions d'accès disk)


// Bootloader ROM : Initialise le système et saute à l'OS

export const BOOTLOADER: Map<u16, u8> = new Map([
    // Initialiser le Stack Pointer
    [0x00, Opcode.SET_SP],
    [0x01, low16(MEMORY_MAP.STACK_END)],  // STACK_END - low
    [0x02, high16(MEMORY_MAP.STACK_END)], // STACK_END - high

    // === WAIT_FOR_OS (0x00) ===
    // Vérifier si un OS est chargé à OS_START
    [0x03, Opcode.MOV_A_MEM],
    [0x04, low16(MEMORY_MAP.OS_START)],  // Low byte
    [0x05, high16(MEMORY_MAP.OS_START)], // High byte

    // Si pas d'OS, revenir à 0x03
    [0x06, Opcode.JZ], // Si = 0, boucler
    [0x07, 0x03],      // Low: 0x03
    [0x08, 0x00],      // High: 0x00

    // === RUN_OS (0x06) ===
    // Sauter à l'OS qui est déjà en RAM
    [0x09, Opcode.JMP],
    [0x0A, low16(MEMORY_MAP.OS_START)],     // Low byte: 0x00
    [0x0B, high16(MEMORY_MAP.OS_START)],    // High byte: 0x01
] as [u16, u8][]);



// Exemple de bootloader en language assembleur => TODO: remplacer le BOOTLOADER actuel par celui ci
const BootloaderSourceCode = `
:INIT
SET_SP MEMORY_MAP.STACK_END # Initialiser le Stack Pointer

:WAIT_FOR_OS
MOV_A_MEM MEMORY_MAP.OS_START # Vérifie si un OS est chargé en mémoire
NOP
JZ $WAIT_FOR_OS # Si pas d'OS détecté on boucle

:RUN_OS
JMP MEMORY_MAP.OS_START # Lance l'OS
`;
