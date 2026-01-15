
import { high16, low16 } from "@/lib/integers";
import { Opcode } from "@/lib/cpu_default/cpu_instructions";
import { MEMORY_MAP } from "@/lib/memory_map_16bit";

import type { ProgramInfo, u16, u8 } from "@/types/cpu.types";


/**
 * PROGRAMME 1: Beep simple
 * Joue un bip de 440 Hz pendant 500ms
 */
export const SIMPLE_BEEP: ProgramInfo = {
    name: "Simple Beep",
    description: "Bip simple à 440 Hz",
    code: new Map([
        [0x00, Opcode.SET_SP],
        [0x01, low16(MEMORY_MAP.STACK_END)],  // STACK_END - low
        [0x02, high16(MEMORY_MAP.STACK_END)], // STACK_END - high

        // Fréquence = 440 Hz → valeur ≈ (440-100)/7.45 ≈ 45
        [0x03, Opcode.MOV_A_IMM],
        [0x04, 45],
        [0x05, Opcode.MOV_MEM_A],
        [0x06, 0x80],
        [0x07, 0xFF], // BUZZER_FREQ

        // Durée = 500ms → 500/10 = 50
        [0x08, Opcode.MOV_A_IMM],
        [0x09, 50],
        [0x0A, Opcode.MOV_MEM_A],
        [0x0B, 0x81],
        [0x0C, 0xFF], // BUZZER_DURATION (déclenche le son)

        [0x0D, Opcode.HALT],
    ] as [u16, u8][]),
};


/**
 * PROGRAMME 2: Sirène
 * Alterne entre deux fréquences
 */
export const SIREN: ProgramInfo = {
    name: "Siren",
    description: "Sirène avec deux fréquences alternées",
    code: new Map([
        [0x00, Opcode.SET_SP],
        [0x01, 0xFF], [0x02, 0xFE],

        // Compteur dans B
        [0x03, Opcode.MOV_B_IMM], [0x04, 10], // 10 alternances

        // LOOP:
        // Fréquence haute (800 Hz → ~94)
        [0x05, Opcode.MOV_A_IMM], [0x06, 94],
        [0x07, Opcode.MOV_MEM_A],
        [0x08, 0x80], [0x09, 0xFF], // BUZZER_FREQ

        // Durée 200ms
        [0x0A, Opcode.MOV_A_IMM], [0x0B, 20],
        [0x0C, Opcode.MOV_MEM_A],
        [0x0D, 0x81], [0x0E, 0xFF], // BUZZER_DURATION

        // Attendre (boucle vide)
        [0x0F, Opcode.MOV_C_IMM], [0x10, 0xFF],
        [0x11, Opcode.DEC_C],
        [0x12, Opcode.JNZ], [0x13, 0x11], [0x14, 0x02],

        // Fréquence basse (400 Hz → ~40)
        [0x15, Opcode.MOV_A_IMM], [0x16, 40],
        [0x17, Opcode.MOV_MEM_A],
        [0x18, 0x80], [0x19, 0xFF],

        [0x1A, Opcode.MOV_A_IMM], [0x1B, 20],
        [0x1C, Opcode.MOV_MEM_A],
        [0x1D, 0x81], [0x1E, 0xFF],

        // Attendre
        [0x1F, Opcode.MOV_C_IMM], [0x20, 0xFF],
        [0x21, Opcode.DEC_C],
        [0x22, Opcode.JNZ], [0x23, 0x21], [0x24, 0x02],

        // Décrémenter compteur
        [0x25, Opcode.DEC_B],
        [0x26, Opcode.JNZ],
        [0x27, 0x05], [0x28, 0x02], // → LOOP

        [0x29, Opcode.HALT],
    ] as [u16, u8][]),
};


/**
 * PROGRAMME 3: Gamme musicale
 * Joue Do-Ré-Mi-Fa-Sol-La-Si-Do
 */
export const MUSICAL_SCALE: ProgramInfo = {
    name: "Musical Scale",
    description: "Joue une gamme de Do à Do",
    code: new Map([
        [0x00, Opcode.SET_SP],
        [0x01, 0xFF], [0x02, 0xFE],

        // Stocker les notes en RAM @ 0x8000
        // Do=262Hz→21, Ré=294→26, Mi=330→31, Fa=349→33, Sol=392→39, La=440→45, Si=494→53, Do=523→57

        [0x03, Opcode.MOV_A_IMM], [0x04, 21],
        [0x05, Opcode.MOV_MEM_A], [0x06, 0x00], [0x07, 0x80],

        [0x08, Opcode.MOV_A_IMM], [0x09, 26],
        [0x0A, Opcode.MOV_MEM_A], [0x0B, 0x01], [0x0C, 0x80],

        [0x0D, Opcode.MOV_A_IMM], [0x0E, 31],
        [0x0F, Opcode.MOV_MEM_A], [0x10, 0x02], [0x11, 0x80],

        [0x12, Opcode.MOV_A_IMM], [0x13, 33],
        [0x14, Opcode.MOV_MEM_A], [0x15, 0x03], [0x16, 0x80],

        [0x17, Opcode.MOV_A_IMM], [0x18, 39],
        [0x19, Opcode.MOV_MEM_A], [0x1A, 0x04], [0x1B, 0x80],

        [0x1C, Opcode.MOV_A_IMM], [0x1D, 45],
        [0x1E, Opcode.MOV_MEM_A], [0x1F, 0x05], [0x20, 0x80],

        [0x21, Opcode.MOV_A_IMM], [0x22, 53],
        [0x23, Opcode.MOV_MEM_A], [0x24, 0x06], [0x25, 0x80],

        [0x26, Opcode.MOV_A_IMM], [0x27, 57],
        [0x28, Opcode.MOV_MEM_A], [0x29, 0x07], [0x2A, 0x80],

        // Jouer les notes
        [0x2B, Opcode.MOV_C_IMM], [0x2C, 0x00], // Index = 0

        // LOOP:
        [0x2D, Opcode.MOV_A_MEM], // Lire note @ 0x8000 + C
        [0x2E, 0x00], [0x2F, 0x80], // FIXME: devrait être [0x80 + C]

        [0x30, Opcode.MOV_MEM_A],
        [0x31, 0x80], [0x32, 0xFF], // BUZZER_FREQ

        [0x33, Opcode.MOV_A_IMM], [0x34, 30], // 300ms
        [0x35, Opcode.MOV_MEM_A],
        [0x36, 0x81], [0x37, 0xFF], // BUZZER_DURATION

        // Attendre
        [0x38, Opcode.MOV_B_IMM], [0x39, 0xFF],
        [0x3A, Opcode.DEC_B],
        [0x3B, Opcode.JNZ], [0x3C, 0x3A], [0x3D, 0x02],

        [0x3E, Opcode.INC_C],
        [0x3F, Opcode.MOV_CA],
        [0x40, Opcode.MOV_B_IMM], [0x41, 8],
        [0x42, Opcode.SUB],
        [0x43, Opcode.JNZ],
        [0x44, 0x2D], [0x45, 0x02], // → LOOP

        [0x46, Opcode.HALT],
    ] as [u16, u8][]),
};


/**
 * PROGRAMME 4: Alarme avec RTC
 * Bip toutes les secondes
 */
export const RTC_ALARM_BEEP: ProgramInfo = {
    name: "RTC Alarm Beep",
    description: "Bip chaque seconde",
    code: new Map([
        [0x00, Opcode.SET_SP],
        [0x01, 0xFF], [0x02, 0xFE],

        // Sauver seconde actuelle
        [0x03, Opcode.MOV_A_MEM],
        [0x04, 0xC6], [0x05, 0xFF], // RTC_SECONDS
        [0x06, Opcode.MOV_CA],

        // LOOP:
        [0x07, Opcode.MOV_A_MEM],
        [0x08, 0xC6], [0x09, 0xFF], // RTC_SECONDS

        // Comparer avec C
        [0x0A, Opcode.PUSH_A],
        [0x0B, Opcode.MOV_BC],
        [0x0C, Opcode.POP_A],
        [0x0D, Opcode.SUB],
        [0x0E, Opcode.JZ], // Si égal, attendre
        [0x0F, 0x07], [0x10, 0x02],

        // Nouvelle seconde ! Bip
        [0x11, Opcode.MOV_A_MEM],
        [0x12, 0xC6], [0x13, 0xFF],
        [0x14, Opcode.MOV_CA], // Sauver

        // Fréquence 1000 Hz → ~120
        [0x15, Opcode.MOV_A_IMM], [0x16, 120],
        [0x17, Opcode.MOV_MEM_A],
        [0x18, 0x80], [0x19, 0xFF],

        // Durée 100ms
        [0x1A, Opcode.MOV_A_IMM], [0x1B, 10],
        [0x1C, Opcode.MOV_MEM_A],
        [0x1D, 0x81], [0x1E, 0xFF],

        [0x1F, Opcode.JMP],
        [0x20, 0x07], [0x21, 0x02],
    ] as [u16, u8][]),
};


/**
 * PROGRAMME 5: Buzzer random avec RNG
 * Notes aléatoires
 */
export const RANDOM_NOTES: ProgramInfo = {
    name: "Random Notes",
    description: "Joue des notes aléatoires",
    code: new Map([
        [0x00, Opcode.SET_SP],
        [0x01, 0xFF], [0x02, 0xFE],

        // Seed RNG avec timestamp
        [0x03, Opcode.MOV_A_MEM],
        [0x04, 0xC7], [0x05, 0xFF], // RTC_TIMESTAMP_0
        [0x06, Opcode.MOV_MEM_A],
        [0x07, 0xB1], [0x08, 0xFF], // RNG_SEED

        // Compteur
        [0x09, Opcode.MOV_B_IMM],
        [0x0A, 20], // notes count

        // LOOP:
        [0x0B, Opcode.MOV_A_MEM],
        [0x0C, 0xB0],
        [0x0D, 0xFF], // RNG_OUTPUT

        // Utiliser comme fréquence
        [0x0E, Opcode.MOV_MEM_A],
        [0x0F, 0x80],
        [0x10, 0xFF], // BUZZER_FREQ

        // Durée 150ms
        [0x11, Opcode.MOV_A_IMM],
        [0x12, 15],
        [0x13, Opcode.MOV_MEM_A],
        [0x14, 0x81],
        [0x15, 0xFF],

        // Attendre
        [0x16, Opcode.MOV_C_IMM],
        [0x17, 0x0F], // delay between notes
        [0x18, Opcode.DEC_C],
        [0x19, Opcode.JNZ],
        [0x1A, low16(MEMORY_MAP.PROGRAM_START + 0x18 as u16)],   // 0x18 - Low
        [0x1B, high16(MEMORY_MAP.PROGRAM_START + 0x18 as u16)],  // 0x18 - High

        [0x1C, Opcode.DEC_B],
        [0x1D, Opcode.JNZ],
        [0x1E, low16(MEMORY_MAP.PROGRAM_START + 0x0B as u16)],   // 0x0B - Low
        [0x1F, high16(MEMORY_MAP.PROGRAM_START + 0x0B as u16)],  // 0x0B - High

        [0x20, Opcode.SYSCALL],
        [0x21, 0],
    ] as [u16, u8][]),
};
