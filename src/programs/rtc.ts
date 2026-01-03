
import { Opcode } from "../lib/instructions";
import { MEMORY_MAP } from "../lib/memory_map";

import type { ProgramInfo, u8 } from "@/types/cpu.types";


export const DIGITAL_CLOCK: ProgramInfo = {
    name: "Digital Clock",
    description: "Affiche l'heure dans la console",
    code: new Map([
        [0x00, Opcode.SET_SP],
        [0x01, 0xFF], [0x02, 0xFE],

        // LOOP:
        // Lire heures
        [0x03, Opcode.MOV_A_MEM],
        [0x04, 0xC2], [0x05, 0xFF], // RTC_HOURS

        // Afficher dans LEDs
        [0x06, Opcode.MOV_MEM_A],
        [0x07, 0x30], [0x08, 0xFF], // LEDS_OUTPUT

        // Attendre un peu (boucle vide)
        [0x09, Opcode.MOV_C_IMM], [0x0A, 0xFF],
        [0x0B, Opcode.DEC_C],
        [0x0C, Opcode.JNZ], [0x0D, 0x0B], [0x0E, 0x02],

        // Recommencer
        [0x0F, Opcode.JMP],
        [0x10, 0x03], [0x11, 0x02],
    ] as [u8, u8][]),
    expectedResult: "Heure actuelle affichée et mise à jour"
};


