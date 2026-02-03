
import { high16, low16 } from "@/v2/lib/integers";
import { Opcode } from "@/v2/cpus/default/cpu_instructions";
import { MEMORY_MAP } from "@/v2/lib/memory_map_16x8_bits";

import type { ProgramInfo, u16, u8 } from "@/types/cpu.types";


export const RNG_TEST: ProgramInfo = {
    name: "RNG Test",
    description: "Génère 10 nombres aléatoires",
    code: new Map([
        [0x00, Opcode.SET_SP],
        [0x01, 0xFF], [0x02, 0xFE],

        // Définir le seed (optionnel)
        [0x03, Opcode.MOV_A_IMM], [0x04, 0x42], // Seed = 0x42
        [0x05, Opcode.MOV_MEM_A],
        [0x06, 0xB1], [0x07, 0xFF], // RNG_SEED

        // Compteur dans B
        [0x08, Opcode.MOV_B_IMM], [0x09, 10],

        // LOOP:
        [0x0A, Opcode.MOV_A_MEM],
        [0x0B, 0xB0], [0x0C, 0xFF], // RNG_OUTPUT → génère nombre aléatoire

        // Afficher dans LEDs
        [0x0D, Opcode.MOV_MEM_A],
        [0x0E, 0x30], [0x0F, 0xFF], // LEDS_OUTPUT

        // Décrémenter compteur
        [0x10, Opcode.DEC_B],
        [0x11, Opcode.JNZ],
        [0x12, 0x0A], [0x13, 0x02], // → LOOP

        [0x14, Opcode.HALT],
    ] as [u16, u8][]),
};


export const RANDOM_PIXELS: ProgramInfo = {
    name: "Random Pixels",
    description: "Dessine 100 pixels aléatoires",
    code: new Map([
        [0x00, Opcode.SET_SP],
        [0x01, 0xFF], [0x02, 0xFE],

        // Compteur
        [0x03, Opcode.MOV_B_IMM], [0x04, 100],

        // LOOP:
        // X aléatoire
        [0x05, Opcode.MOV_A_MEM],
        [0x06, low16(MEMORY_MAP.RNG_OUTPUT)],  // RNG_OUTPUT - low
        [0x07, high16(MEMORY_MAP.RNG_OUTPUT)], // RNG_OUTPUT - high
        [0x08, Opcode.MOV_MEM_A],
        [0x09, low16(MEMORY_MAP.PIXEL_X)],     // PIXEL_X - low
        [0x0A, high16(MEMORY_MAP.PIXEL_X)],    // PIXEL_X - high

        // Y aléatoire
        [0x0B, Opcode.MOV_A_MEM],
        [0x0C, low16(MEMORY_MAP.RNG_OUTPUT)],  // RNG_OUTPUT - low
        [0x0D, high16(MEMORY_MAP.RNG_OUTPUT)], // RNG_OUTPUT - high
        [0x0E, Opcode.MOV_MEM_A],
        [0x0F, low16(MEMORY_MAP.PIXEL_Y)],     // PIXEL_Y - low
        [0x10, high16(MEMORY_MAP.PIXEL_Y)],    // PIXEL_Y - high

        // Couleur aléatoire (0-15)
        [0x11, Opcode.MOV_A_MEM],
        [0x12, low16(MEMORY_MAP.RNG_OUTPUT)],  // RNG_OUTPUT - low
        [0x13, high16(MEMORY_MAP.RNG_OUTPUT)], // RNG_OUTPUT - high
        [0x14, Opcode.MOV_B_IMM],
        [0x15, 0x0F],
        [0x16, Opcode.AND_A_IMM], // A = A & 0x0F
        [0x17, Opcode.MOV_MEM_A],
        [0x18, low16(MEMORY_MAP.PIXEL_COLOR)],  // PIXEL_COLOR - low
        [0x19, high16(MEMORY_MAP.PIXEL_COLOR)], // PIXEL_COLOR - high

        // Décrémenter
        [0x1A, Opcode.DEC_B],
        [0x1B, Opcode.JNZ], // Go to Loop start
        [0x1C, low16(MEMORY_MAP.PROGRAM_START + 0x05 as u16)],
        [0x1D, high16(MEMORY_MAP.PROGRAM_START + 0x05 as u16)],

        [0x1E, Opcode.HALT],
    ] as [u16, u8][]),
};


/**
 * PROGRAMME 4: Chronomètre RTC
 * Affiche secondes dans console
 */
export const RTC_STOPWATCH: ProgramInfo = {
    name: "RTC Stopwatch",
    description: "Affiche les secondes qui passent",
    code: new Map([
        [0x00, Opcode.SET_SP],
        [0x01, 0xFF], [0x02, 0xFE],

        // Sauver seconde précédente dans C
        [0x03, Opcode.MOV_A_MEM],
        [0x04, 0xC0], [0x05, 0xFF], // RTC_SECONDS
        [0x06, Opcode.MOV_A_C],

        // LOOP:
        [0x07, Opcode.MOV_A_MEM],
        [0x08, 0xC0], [0x09, 0xFF], // RTC_SECONDS

        // Comparer avec C
        [0x0A, Opcode.PUSH_A],
        [0x0B, Opcode.MOV_B_IMM], [0x0C, 0x00],
        [0x0D, Opcode.MOV_C_B], // B = C (ancienne seconde)
        [0x0E, Opcode.POP_A],
        [0x0F, Opcode.SUB_A_IMM], // A = A - B

        [0x10, Opcode.JZ], // Si égal, loop
        [0x11, 0x07], [0x12, 0x02],

        // Nouvelle seconde ! Afficher
        [0x13, Opcode.MOV_A_MEM],
        [0x14, 0xC0], [0x15, 0xFF],
        [0x16, Opcode.MOV_A_C], // Sauver nouvelle seconde

        [0x17, Opcode.MOV_MEM_A],
        [0x18, 0x30], [0x19, 0xFF], // LEDS_OUTPUT

        [0x1A, Opcode.JMP],
        [0x1B, 0x07], [0x1C, 0x02],
    ] as [u16, u8][]),
};
