
import { Opcode } from "../lib/instructions";
import { mapAddress16, MEMORY_MAP } from "../lib/memory_map";

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



/**
 * MINI OS v2.0 - Menu Interactif
 * 
 * Fonctionnalités:
 * - Affiche un menu au démarrage
 * - Navigation au clavier (1-4)
 * - Peut charger des programmes
 * - Affiche info système
 * - Clear console
 */

export const MINI_OS_V2: Map<u8, u8> = new Map([
    // === INIT (0x00-0x05) ===
    [0x00, Opcode.SET_SP],
    [0x01, 0xFF], [0x02, 0xFE],

    // Clear console
    [0x03, Opcode.MOV_A_IMM], [0x04, 0x01],
    [0x05, Opcode.MOV_MEM_A],
    [0x06, 0x71], [0x07, 0xFF], // CONSOLE_CLEAR

    // === AFFICHER MENU (0x08+) ===
    // "=== MINI OS v2.0 ==="
    [0x08, Opcode.CALL], [0x09, 0x80], [0x0A, 0x01], // print_banner

    // "1. Run Program"
    [0x0B, Opcode.CALL], [0x0C, 0xA0], [0x0D, 0x01], // print_menu

    // === WAIT KEYBOARD (0x0E+) ===
    // WAIT_KEY:
    [0x0E, Opcode.MOV_A_MEM],
    [0x0F, 0x51], [0x10, 0xFF], // KEYBOARD_STATUS

    [0x11, Opcode.JZ],
    [0x12, 0x0E], [0x13, 0x01], // Loop si pas de touche

    // Lire caractère
    [0x14, Opcode.MOV_A_MEM],
    [0x15, 0x50], [0x16, 0xFF], // KEYBOARD_DATA

    // Clear keyboard
    [0x17, Opcode.MOV_B_IMM], [0x18, 0x00],
    [0x19, Opcode.MOV_MEM_B],
    [0x1A, 0x51], [0x1B, 0xFF],

    // === DISPATCHER (0x1C+) ===
    // Si '1' → Run Program
    [0x1C, Opcode.MOV_B_IMM], [0x1D, 0x31], // '1' = 0x31
    [0x1E, Opcode.SUB],
    [0x1F, Opcode.JZ],
    [0x20, 0x30], [0x21, 0x01], // Jump à run_program

    // Si '2' → Info
    [0x22, Opcode.MOV_A_MEM],
    [0x23, 0x50], [0x24, 0xFF], // Re-lire A
    [0x25, Opcode.MOV_B_IMM], [0x26, 0x32], // '2'
    [0x27, Opcode.SUB],
    [0x28, Opcode.JZ],
    [0x29, 0x50], [0x2A, 0x01], // Jump à show_info

    // Sinon → Retour menu
    [0x2B, Opcode.JMP],
    [0x2C, 0x08], [0x2D, 0x01],

    // === RUN_PROGRAM (0x30) ===
    [0x30, Opcode.MOV_A_MEM],
    [0x31, MEMORY_MAP.PROGRAM_START & 0xFF],
    [0x32, (MEMORY_MAP.PROGRAM_START >> 8) & 0xFF],

    [0x33, Opcode.JZ],
    [0x34, 0x08], [0x35, 0x01], // Pas de programme → menu

    // Programme détecté
    [0x36, Opcode.JMP],
    [0x37, MEMORY_MAP.PROGRAM_START & 0xFF],
    [0x38, (MEMORY_MAP.PROGRAM_START >> 8) & 0xFF],

    // === SHOW_INFO (0x50) ===
    [0x50, Opcode.CALL], [0x51, 0xC0], [0x52, 0x01], // print_info
    [0x53, Opcode.JMP],
    [0x54, 0x0E], [0x55, 0x01], // Retour wait_key

    // ==========================================
    // FONCTIONS UTILITAIRES
    // ==========================================

    // === PRINT_BANNER (0x80) ===
    [0x80, Opcode.MOV_A_IMM], [0x81, 0x3D], // '='
    [0x82, Opcode.MOV_MEM_A], [0x83, 0x70], [0x84, 0xFF],
    [0x85, Opcode.MOV_A_IMM], [0x86, 0x3D],
    [0x87, Opcode.MOV_MEM_A], [0x88, 0x70], [0x89, 0xFF],
    // ... (écrire "=== MINI OS v2.0 ===" caractère par caractère)
    [0x9E, Opcode.MOV_A_IMM], [0x9F, 0x0A], // '\n'
    [0xA0, Opcode.MOV_MEM_A], [0xA1, 0x70], [0xA2, 0xFF],
    [0xA3, Opcode.RET],

    // === PRINT_MENU (0xA0) ===
    [0xA0, Opcode.MOV_A_IMM], [0xA1, 0x31], // '1'
    [0xA2, Opcode.MOV_MEM_A], [0xA3, 0x70], [0xA4, 0xFF],
    // ... (écrire "1. Run Program\n2. System Info\n> ")
    [0xBE, Opcode.RET],

    // === PRINT_INFO (0xC0) ===
    [0xC0, Opcode.MOV_A_IMM], [0xC1, 0x43], // 'C'
    // ... (écrire "CPU: 16-bit\nRAM: 64KB\nTimer: OK\n")
    [0xDE, Opcode.RET],

] as [u8, u8][]);


