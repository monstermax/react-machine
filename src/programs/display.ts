
import { Opcode } from "@/lib/instructions";
import { MEMORY_MAP } from "@/lib/memory_map";

import type { u8 } from "@/types/cpu.types";


export const programs = {
    blink_leds: {
        name: "LED Blinker",
        description: "Fait clignoter les LEDs en compteur binaire",
        code: new Map([
            [0x00, Opcode.R_LOAD_A],
            [0x01, 0x00],

            // Loop
            [0x02, Opcode.M_STORE_A],
            [0x03, 0x30],  // Low byte
            [0x04, 0xFF],  // High byte (0xFF30)

            [0x05, Opcode.INC_A],
            [0x06, Opcode.JMP],
            [0x07, 0x02],  // Low
            [0x08, 0x02],  // High (0x0202 = PROGRAM_START + 0x02)
        ] as [u8, u8][]),
        expectedResult: "LEDs qui comptent en binaire de 0 à 255"
    },
    seven_segments: {
        name: "7-Segment Counter",
        description: "Compte de 0 à F sur l'afficheur 7 segments",
        code: new Map([
            [0x00, Opcode.R_LOAD_A],
            [0x01, 0x00],

            // Boucle principale
            [0x02, Opcode.M_STORE_A],
            [0x03, 0x60], [0x04, 0xFF],  // 0xFF60

            [0x05, Opcode.R_LOAD_B],
            [0x06, 0x10],

            // Délai
            [0x07, Opcode.DEC_B],
            [0x08, Opcode.JNZ],
            [0x09, 0x07], [0x0A, 0x02],  // 0x0207

            [0x0B, Opcode.INC_A],
            [0x0C, Opcode.R_LOAD_B],
            [0x0D, 0x0F],
            [0x0E, Opcode.AND],          // A = A & 0x0F
            [0x0F, Opcode.JMP],
            [0x10, 0x02],  // Low
            [0x11, 0x02],  // High (0x0202 = PROGRAM_START + 0x02)
        ] as [u8, u8][]),
        expectedResult: "Compteur 0→F qui boucle"
    },
    console_counter: {
        name: "Counter Console",
        description: "Compte de 0 à 9 dans la console",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF],
            [0x02, 0xFE],

            // Initialiser compteur
            [0x03, Opcode.R_LOAD_A],
            [0x04, 0x30], // '0' ASCII

            // === LOOP ===
            // Afficher le chiffre
            [0x05, Opcode.M_STORE_A],
            [0x06, 0x70], [0x07, 0xFF], // CONSOLE_CHAR

            // Ajouter newline
            [0x08, Opcode.PUSH_A],
            [0x09, Opcode.R_LOAD_A],
            [0x0A, 0x0A], // '\n'
            [0x0B, Opcode.M_STORE_A],
            [0x0C, 0x70], [0x0D, 0xFF],
            [0x0E, Opcode.POP_A],

            // Incrémenter
            [0x0F, Opcode.INC_A],

            // Comparer avec '9' + 1
            [0x10, Opcode.R_LOAD_B],
            [0x11, 0x3A], // ':' (après '9')
            [0x12, Opcode.SUB],

            // Si pas égal, continuer
            [0x13, Opcode.JNZ],
            [0x14, 0x03], [0x15, 0x02],

            // Fini - HALT
            [0x16, Opcode.HALT],
        ] as [u8, u8][]),
        expectedResult: "Console affiche 0-9 avec newlines"
    },
}
