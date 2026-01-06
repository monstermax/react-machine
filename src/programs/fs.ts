
import { Opcode } from "../lib/instructions";

import { MEMORY_MAP } from "../lib/memory_map";
import { high16, low16 } from "@/lib/integers";

import type { ProgramInfo, u16, u8 } from "@/types/cpu.types";


/**
 * PROGRAMME 1: Créer un fichier et écrire dedans
 * Créer "TEST.TXT" et écrire "Hello\n"
 */
export const FS_CREATE_FILE: ProgramInfo = {
    name: "FS: Create File",
    description: "Créer fichier TEST.TXT avec contenu",
    code: new Map([
        [0x00, Opcode.SET_SP],
        [0x01, low16(MEMORY_MAP.STACK_END)],
        [0x02, high16(MEMORY_MAP.STACK_END)],

        // === Écrire nom du fichier "TEST.TXT" ===
        // 'T'
        [0x03, Opcode.MOV_A_IMM], [0x04, 0x54],
        [0x05, Opcode.MOV_MEM_A],
        [0x06, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x07, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // 'E'
        [0x08, Opcode.MOV_A_IMM], [0x09, 0x45],
        [0x0A, Opcode.MOV_MEM_A],
        [0x0B, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x0C, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // 'S'
        [0x0D, Opcode.MOV_A_IMM], [0x0E, 0x53],
        [0x0F, Opcode.MOV_MEM_A],
        [0x10, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x11, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // 'T'
        [0x12, Opcode.MOV_A_IMM], [0x13, 0x54],
        [0x14, Opcode.MOV_MEM_A],
        [0x15, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x16, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // '.'
        [0x17, Opcode.MOV_A_IMM], [0x18, 0x2E],
        [0x19, Opcode.MOV_MEM_A],
        [0x1A, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x1B, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // 'T'
        [0x1C, Opcode.MOV_A_IMM], [0x1D, 0x54],
        [0x1E, Opcode.MOV_MEM_A],
        [0x1F, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x20, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // 'X'
        [0x21, Opcode.MOV_A_IMM], [0x22, 0x58],
        [0x23, Opcode.MOV_MEM_A],
        [0x24, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x25, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // 'T'
        [0x26, Opcode.MOV_A_IMM], [0x27, 0x54],
        [0x28, Opcode.MOV_MEM_A],
        [0x29, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x2A, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // === Commande CREATE (0x91) ===
        [0x2B, Opcode.MOV_A_IMM],
        [0x2C, 0x91],
        [0x2D, Opcode.MOV_MEM_A],
        [0x2E, low16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],
        [0x2F, high16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],

        // Vérifier résultat
        [0x30, Opcode.MOV_A_MEM],
        [0x31, low16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],
        [0x32, high16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],

        [0x33, Opcode.JZ], // Si échec, halt
        [0x34, low16(MEMORY_MAP.PROGRAM_START + 0x90 as u16)],
        [0x35, high16(MEMORY_MAP.PROGRAM_START + 0x90 as u16)],

        // === Ouvrir le fichier ===
        // Réécrire le nom (car buffer effacé après CREATE)
        [0x36, Opcode.MOV_A_IMM], [0x37, 0x54], // 'T'
        [0x38, Opcode.MOV_MEM_A],
        [0x39, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x3A, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x3B, Opcode.MOV_A_IMM], [0x3C, 0x45], // 'E'
        [0x3D, Opcode.MOV_MEM_A],
        [0x3E, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x3F, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x40, Opcode.MOV_A_IMM], [0x41, 0x53], // 'S'
        [0x42, Opcode.MOV_MEM_A],
        [0x43, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x44, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x45, Opcode.MOV_A_IMM], [0x46, 0x54], // 'T'
        [0x47, Opcode.MOV_MEM_A],
        [0x48, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x49, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x4A, Opcode.MOV_A_IMM], [0x4B, 0x2E], // '.'
        [0x4C, Opcode.MOV_MEM_A],
        [0x4D, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x4E, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x4F, Opcode.MOV_A_IMM], [0x50, 0x54], // 'T'
        [0x51, Opcode.MOV_MEM_A],
        [0x52, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x53, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x54, Opcode.MOV_A_IMM], [0x55, 0x58], // 'X'
        [0x56, Opcode.MOV_MEM_A],
        [0x57, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x58, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x59, Opcode.MOV_A_IMM], [0x5A, 0x54], // 'T'
        [0x5B, Opcode.MOV_MEM_A],
        [0x5C, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x5D, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // Commande OPEN (0x92)
        [0x5E, Opcode.MOV_A_IMM], [0x5F, 0x92],
        [0x60, Opcode.MOV_MEM_A],
        [0x61, low16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],
        [0x62, high16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],

        // === Écrire "Hello\n" dans le fichier ===
        // 'H'
        [0x63, Opcode.MOV_A_IMM], [0x64, 0x48],
        [0x65, Opcode.MOV_MEM_A],
        [0x66, low16(MEMORY_MAP.DATA_DISK_FS_DATA)],
        [0x67, high16(MEMORY_MAP.DATA_DISK_FS_DATA)],

        // 'e'
        [0x68, Opcode.MOV_A_IMM], [0x69, 0x65],
        [0x6A, Opcode.MOV_MEM_A],
        [0x6B, low16(MEMORY_MAP.DATA_DISK_FS_DATA)],
        [0x6C, high16(MEMORY_MAP.DATA_DISK_FS_DATA)],

        // 'l'
        [0x6D, Opcode.MOV_A_IMM], [0x6E, 0x6C],
        [0x6F, Opcode.MOV_MEM_A],
        [0x70, low16(MEMORY_MAP.DATA_DISK_FS_DATA)],
        [0x71, high16(MEMORY_MAP.DATA_DISK_FS_DATA)],

        // 'l'
        [0x72, Opcode.MOV_A_IMM], [0x73, 0x6C],
        [0x74, Opcode.MOV_MEM_A],
        [0x75, low16(MEMORY_MAP.DATA_DISK_FS_DATA)],
        [0x76, high16(MEMORY_MAP.DATA_DISK_FS_DATA)],

        // 'o'
        [0x77, Opcode.MOV_A_IMM], [0x78, 0x6F],
        [0x79, Opcode.MOV_MEM_A],
        [0x7A, low16(MEMORY_MAP.DATA_DISK_FS_DATA)],
        [0x7B, high16(MEMORY_MAP.DATA_DISK_FS_DATA)],

        // '\n'
        [0x7C, Opcode.MOV_A_IMM], [0x7D, 0x0A],
        [0x7E, Opcode.MOV_MEM_A],
        [0x7F, low16(MEMORY_MAP.DATA_DISK_FS_DATA)],
        [0x80, high16(MEMORY_MAP.DATA_DISK_FS_DATA)],

        // === Fermer le fichier ===
        [0x81, Opcode.MOV_A_IMM],
        [0x82, 0x93], // CLOSE
        [0x83, Opcode.MOV_MEM_A],
        [0x84, low16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],
        [0x85, high16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],

        // Fréquence = 440 Hz → valeur ≈ (440-100)/7.45 ≈ 45
        [0x86, Opcode.MOV_A_IMM],
        [0x87, 45],
        [0x88, Opcode.MOV_MEM_A],
        [0x89, low16(MEMORY_MAP.BUZZER_FREQ)],  // BUZZER_FREQ - low
        [0x8A, high16(MEMORY_MAP.BUZZER_FREQ)], // BUZZER_FREQ - high

        // Durée = 500ms → 500/10 = 50
        [0x8B, Opcode.MOV_A_IMM],
        [0x8C, 50],
        [0x8D, Opcode.MOV_MEM_A],
        [0x8E, low16(MEMORY_MAP.BUZZER_DURATION)],  // BUZZER_DURATION (déclenche le son) - low
        [0x8F, high16(MEMORY_MAP.BUZZER_DURATION)], // BUZZER_DURATION (déclenche le son) - high

        [0x90, Opcode.SYSCALL],
        [0x91, 0],               // ← Syscall 0 = exit
    ] as [u16, u8][]),
};



export const FS_CREATE_FILE_BIS: ProgramInfo = {
    name: "FS: Create File (bis)",
    description: "Créer fichier TESS.TXT avec contenu",
    code: new Map([
        [0x00, Opcode.SET_SP],
        [0x01, low16(MEMORY_MAP.STACK_END)],
        [0x02, high16(MEMORY_MAP.STACK_END)],

        // === Écrire nom du fichier "TEST.TXT" ===
        // 'T'
        [0x03, Opcode.MOV_A_IMM], [0x04, 0x54],
        [0x05, Opcode.MOV_MEM_A],
        [0x06, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x07, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // 'E'
        [0x08, Opcode.MOV_A_IMM], [0x09, 0x45],
        [0x0A, Opcode.MOV_MEM_A],
        [0x0B, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x0C, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // 'S'
        [0x0D, Opcode.MOV_A_IMM], [0x0E, 0x53],
        [0x0F, Opcode.MOV_MEM_A],
        [0x10, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x11, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // 'S'
        [0x12, Opcode.MOV_A_IMM], [0x13, 0x53],
        [0x14, Opcode.MOV_MEM_A],
        [0x15, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x16, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // '.'
        [0x17, Opcode.MOV_A_IMM], [0x18, 0x2E],
        [0x19, Opcode.MOV_MEM_A],
        [0x1A, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x1B, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // 'T'
        [0x1C, Opcode.MOV_A_IMM], [0x1D, 0x54],
        [0x1E, Opcode.MOV_MEM_A],
        [0x1F, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x20, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // 'X'
        [0x21, Opcode.MOV_A_IMM], [0x22, 0x58],
        [0x23, Opcode.MOV_MEM_A],
        [0x24, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x25, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // 'T'
        [0x26, Opcode.MOV_A_IMM], [0x27, 0x54],
        [0x28, Opcode.MOV_MEM_A],
        [0x29, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x2A, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // === Commande CREATE (0x91) ===
        [0x2B, Opcode.MOV_A_IMM],
        [0x2C, 0x91],
        [0x2D, Opcode.MOV_MEM_A],
        [0x2E, low16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],
        [0x2F, high16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],

        // Vérifier résultat
        [0x30, Opcode.MOV_A_MEM],
        [0x31, low16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],
        [0x32, high16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],

        [0x33, Opcode.JZ], // Si échec, halt
        [0x34, low16(MEMORY_MAP.PROGRAM_START + 0x90 as u16)],
        [0x35, high16(MEMORY_MAP.PROGRAM_START + 0x90 as u16)],

        // === Ouvrir le fichier ===
        // Réécrire le nom (car buffer effacé après CREATE)
        [0x36, Opcode.MOV_A_IMM], [0x37, 0x54], // 'T'
        [0x38, Opcode.MOV_MEM_A],
        [0x39, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x3A, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x3B, Opcode.MOV_A_IMM], [0x3C, 0x45], // 'E'
        [0x3D, Opcode.MOV_MEM_A],
        [0x3E, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x3F, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x40, Opcode.MOV_A_IMM], [0x41, 0x53], // 'S'
        [0x42, Opcode.MOV_MEM_A],
        [0x43, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x44, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x45, Opcode.MOV_A_IMM], [0x46, 0x53], // 'S'
        [0x47, Opcode.MOV_MEM_A],
        [0x48, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x49, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x4A, Opcode.MOV_A_IMM], [0x4B, 0x2E], // '.'
        [0x4C, Opcode.MOV_MEM_A],
        [0x4D, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x4E, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x4F, Opcode.MOV_A_IMM], [0x50, 0x54], // 'T'
        [0x51, Opcode.MOV_MEM_A],
        [0x52, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x53, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x54, Opcode.MOV_A_IMM], [0x55, 0x58], // 'X'
        [0x56, Opcode.MOV_MEM_A],
        [0x57, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x58, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x59, Opcode.MOV_A_IMM], [0x5A, 0x54], // 'T'
        [0x5B, Opcode.MOV_MEM_A],
        [0x5C, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x5D, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // Commande OPEN (0x92)
        [0x5E, Opcode.MOV_A_IMM], [0x5F, 0x92],
        [0x60, Opcode.MOV_MEM_A],
        [0x61, low16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],
        [0x62, high16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],

        // === Écrire "Hella\n" dans le fichier ===
        // 'H'
        [0x63, Opcode.MOV_A_IMM], [0x64, 0x48],
        [0x65, Opcode.MOV_MEM_A],
        [0x66, low16(MEMORY_MAP.DATA_DISK_FS_DATA)],
        [0x67, high16(MEMORY_MAP.DATA_DISK_FS_DATA)],

        // 'e'
        [0x68, Opcode.MOV_A_IMM], [0x69, 0x65],
        [0x6A, Opcode.MOV_MEM_A],
        [0x6B, low16(MEMORY_MAP.DATA_DISK_FS_DATA)],
        [0x6C, high16(MEMORY_MAP.DATA_DISK_FS_DATA)],

        // 'l'
        [0x6D, Opcode.MOV_A_IMM], [0x6E, 0x6C],
        [0x6F, Opcode.MOV_MEM_A],
        [0x70, low16(MEMORY_MAP.DATA_DISK_FS_DATA)],
        [0x71, high16(MEMORY_MAP.DATA_DISK_FS_DATA)],

        // 'l'
        [0x72, Opcode.MOV_A_IMM], [0x73, 0x6C],
        [0x74, Opcode.MOV_MEM_A],
        [0x75, low16(MEMORY_MAP.DATA_DISK_FS_DATA)],
        [0x76, high16(MEMORY_MAP.DATA_DISK_FS_DATA)],

        // 'a'
        [0x77, Opcode.MOV_A_IMM], [0x78, 0x61],
        [0x79, Opcode.MOV_MEM_A],
        [0x7A, low16(MEMORY_MAP.DATA_DISK_FS_DATA)],
        [0x7B, high16(MEMORY_MAP.DATA_DISK_FS_DATA)],

        // '\n'
        [0x7C, Opcode.MOV_A_IMM], [0x7D, 0x0A],
        [0x7E, Opcode.MOV_MEM_A],
        [0x7F, low16(MEMORY_MAP.DATA_DISK_FS_DATA)],
        [0x80, high16(MEMORY_MAP.DATA_DISK_FS_DATA)],

        // === Fermer le fichier ===
        [0x81, Opcode.MOV_A_IMM],
        [0x82, 0x93], // CLOSE
        [0x83, Opcode.MOV_MEM_A],
        [0x84, low16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],
        [0x85, high16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],

        // Fréquence = 440 Hz → valeur ≈ (440-100)/7.45 ≈ 45
        [0x86, Opcode.MOV_A_IMM],
        [0x87, 45],
        [0x88, Opcode.MOV_MEM_A],
        [0x89, low16(MEMORY_MAP.BUZZER_FREQ)],  // BUZZER_FREQ - low
        [0x8A, high16(MEMORY_MAP.BUZZER_FREQ)], // BUZZER_FREQ - high

        // Durée = 500ms → 500/10 = 50
        [0x8B, Opcode.MOV_A_IMM],
        [0x8C, 50],
        [0x8D, Opcode.MOV_MEM_A],
        [0x8E, low16(MEMORY_MAP.BUZZER_DURATION)],  // BUZZER_DURATION (déclenche le son) - low
        [0x8F, high16(MEMORY_MAP.BUZZER_DURATION)], // BUZZER_DURATION (déclenche le son) - high

        [0x90, Opcode.SYSCALL],
        [0x91, 0],               // ← Syscall 0 = exit
    ] as [u16, u8][]),
};




/**
 * PROGRAMME 2: Lire un fichier
 * Ouvre TEST.TXT et affiche son contenu dans la console
 */
export const FS_READ_FILE: ProgramInfo = {
    name: "FS: Read File",
    description: "Lit TEST.TXT et affiche dans console",
    code: new Map([
        [0x00, Opcode.SET_SP],
        [0x01, low16(MEMORY_MAP.STACK_END)],
        [0x02, high16(MEMORY_MAP.STACK_END)],

        // Écrire nom "TEST.TXT"
        [0x03, Opcode.MOV_A_IMM], [0x04, 0x54], // 'T'
        [0x05, Opcode.MOV_MEM_A],
        [0x06, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x07, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x08, Opcode.MOV_A_IMM], [0x09, 0x45], // 'E'
        [0x0A, Opcode.MOV_MEM_A],
        [0x0B, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x0C, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x0D, Opcode.MOV_A_IMM], [0x0E, 0x53], // 'S'
        [0x0F, Opcode.MOV_MEM_A],
        [0x10, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x11, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x12, Opcode.MOV_A_IMM], [0x13, 0x54], // 'T'
        [0x14, Opcode.MOV_MEM_A],
        [0x15, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x16, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x17, Opcode.MOV_A_IMM], [0x18, 0x2E], // '.'
        [0x19, Opcode.MOV_MEM_A],
        [0x1A, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x1B, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x1C, Opcode.MOV_A_IMM], [0x1D, 0x54], // 'T'
        [0x1E, Opcode.MOV_MEM_A],
        [0x1F, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x20, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x21, Opcode.MOV_A_IMM], [0x22, 0x58], // 'X'
        [0x23, Opcode.MOV_MEM_A],
        [0x24, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x25, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x26, Opcode.MOV_A_IMM], [0x27, 0x54], // 'T'
        [0x28, Opcode.MOV_MEM_A],
        [0x29, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x2A, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // OPEN (0x92)
        [0x2B, Opcode.MOV_A_IMM], [0x2C, 0x92],
        [0x2D, Opcode.MOV_MEM_A],
        [0x2E, low16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],
        [0x2F, high16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],

        // LOOP: Lire et afficher
        // Lire byte
        [0x30, Opcode.MOV_A_MEM],
        [0x31, low16(MEMORY_MAP.DATA_DISK_FS_DATA)],
        [0x32, high16(MEMORY_MAP.DATA_DISK_FS_DATA)],

        // Si 0, fin de fichier
        [0x33, Opcode.JZ],
        [0x34, low16(MEMORY_MAP.PROGRAM_START + 0x3C as u16)],
        [0x35, high16(MEMORY_MAP.PROGRAM_START + 0x3C as u16)],

        // Afficher dans console
        [0x36, Opcode.MOV_MEM_A],
        [0x37, low16(MEMORY_MAP.CONSOLE_CHAR)],
        [0x38, high16(MEMORY_MAP.CONSOLE_CHAR)],

        // Loop
        [0x39, Opcode.JMP],
        [0x3A, low16(MEMORY_MAP.PROGRAM_START + 0x30 as u16)],
        [0x3B, high16(MEMORY_MAP.PROGRAM_START + 0x30 as u16)],

        // END: Fermer
        [0x3C, Opcode.MOV_A_IMM], [0x3D, 0x93], // CLOSE
        [0x3E, Opcode.MOV_MEM_A],
        [0x3F, low16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],
        [0x40, high16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],

        [0x41, Opcode.SYSCALL],
        [0x42, 0],               // ← Syscall 0 = exit
    ] as [u16, u8][]),
};



export const FS_READ_FILE_BIS: ProgramInfo = {
    name: "FS: Read File",
    description: "Lit TESS.TXT et affiche dans console",
    code: new Map([
        [0x00, Opcode.SET_SP],
        [0x01, low16(MEMORY_MAP.STACK_END)],
        [0x02, high16(MEMORY_MAP.STACK_END)],

        // Écrire nom "TEST.TXT"
        [0x03, Opcode.MOV_A_IMM], [0x04, 0x54], // 'T'
        [0x05, Opcode.MOV_MEM_A],
        [0x06, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x07, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x08, Opcode.MOV_A_IMM], [0x09, 0x45], // 'E'
        [0x0A, Opcode.MOV_MEM_A],
        [0x0B, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x0C, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x0D, Opcode.MOV_A_IMM], [0x0E, 0x53], // 'S'
        [0x0F, Opcode.MOV_MEM_A],
        [0x10, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x11, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x12, Opcode.MOV_A_IMM], [0x13, 0x53], // 'S'
        [0x14, Opcode.MOV_MEM_A],
        [0x15, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x16, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x17, Opcode.MOV_A_IMM], [0x18, 0x2E], // '.'
        [0x19, Opcode.MOV_MEM_A],
        [0x1A, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x1B, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x1C, Opcode.MOV_A_IMM], [0x1D, 0x54], // 'T'
        [0x1E, Opcode.MOV_MEM_A],
        [0x1F, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x20, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x21, Opcode.MOV_A_IMM], [0x22, 0x58], // 'X'
        [0x23, Opcode.MOV_MEM_A],
        [0x24, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x25, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        [0x26, Opcode.MOV_A_IMM], [0x27, 0x54], // 'T'
        [0x28, Opcode.MOV_MEM_A],
        [0x29, low16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],
        [0x2A, high16(MEMORY_MAP.DATA_DISK_FS_FILENAME)],

        // OPEN (0x92)
        [0x2B, Opcode.MOV_A_IMM], [0x2C, 0x92],
        [0x2D, Opcode.MOV_MEM_A],
        [0x2E, low16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],
        [0x2F, high16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],

        // LOOP: Lire et afficher
        // Lire byte
        [0x30, Opcode.MOV_A_MEM],
        [0x31, low16(MEMORY_MAP.DATA_DISK_FS_DATA)],
        [0x32, high16(MEMORY_MAP.DATA_DISK_FS_DATA)],

        // Si 0, fin de fichier
        [0x33, Opcode.JZ],
        [0x34, low16(MEMORY_MAP.PROGRAM_START + 0x3C as u16)],
        [0x35, high16(MEMORY_MAP.PROGRAM_START + 0x3C as u16)],

        // Afficher dans console
        [0x36, Opcode.MOV_MEM_A],
        [0x37, low16(MEMORY_MAP.CONSOLE_CHAR)],
        [0x38, high16(MEMORY_MAP.CONSOLE_CHAR)],

        // Loop
        [0x39, Opcode.JMP],
        [0x3A, low16(MEMORY_MAP.PROGRAM_START + 0x30 as u16)],
        [0x3B, high16(MEMORY_MAP.PROGRAM_START + 0x30 as u16)],

        // END: Fermer
        [0x3C, Opcode.MOV_A_IMM], [0x3D, 0x93], // CLOSE
        [0x3E, Opcode.MOV_MEM_A],
        [0x3F, low16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],
        [0x40, high16(MEMORY_MAP.DATA_DISK_FS_COMMAND)],

        [0x41, Opcode.SYSCALL],
        [0x42, 0],               // ← Syscall 0 = exit
    ] as [u16, u8][]),
};



/**
 * PROGRAMME 3: Lister les fichiers
 * Affiche le nombre de fichiers sur le disque
 */
export const FS_LIST_FILES: ProgramInfo = {
    name: "FS: List Files",
    description: "Affiche nombre de fichiers",
    code: new Map([
        [0x00, Opcode.SET_SP],
        [0x01, low16(MEMORY_MAP.STACK_END)],
        [0x02, high16(MEMORY_MAP.STACK_END)],

        // Lire FS_STATUS (nombre de fichiers)
        [0x03, Opcode.MOV_A_MEM],
        [0x04, low16(MEMORY_MAP.DATA_DISK_FS_STATUS)],
        [0x05, high16(MEMORY_MAP.DATA_DISK_FS_STATUS)],

        // Afficher dans LEDs
        [0x06, Opcode.MOV_MEM_A],
        [0x07, low16(MEMORY_MAP.LEDS_OUTPUT)],
        [0x08, high16(MEMORY_MAP.LEDS_OUTPUT)],

        [0x09, Opcode.SYSCALL],
        [0x0A, 0],               // ← Syscall 0 = exit
    ] as [u16, u8][]),
};


