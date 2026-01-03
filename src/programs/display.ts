
import { Opcode } from "@/lib/instructions";
import { MEMORY_MAP } from "@/lib/memory_map";

import type { ProgramInfo, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    blink_leds: {
        name: "LED Blinker",
        description: "Fait clignoter les LEDs en compteur binaire",
        code: new Map([
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 0x00],

            // Loop
            [0x02, Opcode.MOV_MEM_A],
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
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 0x00],

            // Boucle principale
            [0x02, Opcode.MOV_MEM_A],
            [0x03, 0x60], [0x04, 0xFF],  // 0xFF60

            [0x05, Opcode.MOV_B_IMM],
            [0x06, 0x10],

            // Délai
            [0x07, Opcode.DEC_B],
            [0x08, Opcode.JNZ],
            [0x09, 0x07], [0x0A, 0x02],  // 0x0207

            [0x0B, Opcode.INC_A],
            [0x0C, Opcode.MOV_B_IMM],
            [0x0D, 0x0F],
            [0x0E, Opcode.AND],          // A = A & 0x0F
            [0x0F, Opcode.JMP],
            [0x10, 0x02],  // Low
            [0x11, 0x02],  // High (0x0202 = PROGRAM_START + 0x02)
        ] as [u8, u8][]),
        expectedResult: "Compteur 0→F qui boucle"
    },

    hello_world: {
        name: "Hello World",
        description: "Affiche 'Hello World!' dans la console",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF],
            [0x02, 0xFE],

            // === PRINT "Hello World!\n" ===
            // H
            [0x03, Opcode.MOV_A_IMM],
            [0x04, 0x48], // 'H'
            [0x05, Opcode.MOV_MEM_A],
            [0x06, 0x70], [0x07, 0xFF],

            // e
            [0x08, Opcode.MOV_A_IMM],
            [0x09, 0x65], // 'e'
            [0x0A, Opcode.MOV_MEM_A],
            [0x0B, 0x70], [0x0C, 0xFF],

            // l
            [0x0D, Opcode.MOV_A_IMM],
            [0x0E, 0x6C], // 'l'
            [0x0F, Opcode.MOV_MEM_A],
            [0x10, 0x70], [0x11, 0xFF],

            // l
            [0x12, Opcode.MOV_A_IMM],
            [0x13, 0x6C], // 'l'
            [0x14, Opcode.MOV_MEM_A],
            [0x15, 0x70], [0x16, 0xFF],

            // o
            [0x17, Opcode.MOV_A_IMM],
            [0x18, 0x6F], // 'o'
            [0x19, Opcode.MOV_MEM_A],
            [0x1A, 0x70], [0x1B, 0xFF],

            // (space)
            [0x1C, Opcode.MOV_A_IMM],
            [0x1D, 0x20], // ' '
            [0x1E, Opcode.MOV_MEM_A],
            [0x1F, 0x70], [0x20, 0xFF],

            // W
            [0x21, Opcode.MOV_A_IMM],
            [0x22, 0x57], // 'W'
            [0x23, Opcode.MOV_MEM_A],
            [0x24, 0x70], [0x25, 0xFF],

            // o
            [0x26, Opcode.MOV_A_IMM],
            [0x27, 0x6F], // 'o'
            [0x28, Opcode.MOV_MEM_A],
            [0x29, 0x70], [0x2A, 0xFF],

            // r
            [0x2B, Opcode.MOV_A_IMM],
            [0x2C, 0x72], // 'r'
            [0x2D, Opcode.MOV_MEM_A],
            [0x2E, 0x70], [0x2F, 0xFF],

            // l
            [0x30, Opcode.MOV_A_IMM],
            [0x31, 0x6C], // 'l'
            [0x32, Opcode.MOV_MEM_A],
            [0x33, 0x70], [0x34, 0xFF],

            // d
            [0x35, Opcode.MOV_A_IMM],
            [0x36, 0x64], // 'd'
            [0x37, Opcode.MOV_MEM_A],
            [0x38, 0x70], [0x39, 0xFF],

            // !
            [0x3A, Opcode.MOV_A_IMM],
            [0x3B, 0x21], // '!'
            [0x3C, Opcode.MOV_MEM_A],
            [0x3D, 0x70], [0x3E, 0xFF],

            // Newline
            [0x3F, Opcode.MOV_A_IMM],
            [0x40, 0x0A], // '\n'
            [0x41, Opcode.MOV_MEM_A],
            [0x42, 0x70], [0x43, 0xFF],

            // HALT
            [0x44, Opcode.HALT],
        ] as [u8, u8][]),
        expectedResult: "Console affiche 'Hello World!'"
    },

    console_counter: {
        name: "Counter Console (KO)",
        description: "Compte de 0 à 9 dans la console",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF], [0x02, 0xFE],

            // Initialiser compteur C = 0
            [0x03, Opcode.MOV_C_IMM],
            [0x04, 0x00],

            // === LOOP START ===
            // Convertir C en ASCII
            [0x05, Opcode.MOV_A_IMM],
            [0x06, 0x30],               // '0'
            [0x07, Opcode.ADD],         // A = 0x30 + C

            // Afficher chiffre
            [0x08, Opcode.MOV_MEM_A],
            [0x09, 0x70], [0x0A, 0xFF], // CONSOLE_CHAR

            // Afficher newline
            [0x0B, Opcode.PUSH_A],
            [0x0C, Opcode.MOV_A_IMM],
            [0x0D, 0x0A],               // '\n'
            [0x0E, Opcode.MOV_MEM_A],
            [0x0F, 0x70], [0x10, 0xFF],
            [0x11, Opcode.POP_A],

            // Incrémenter C
            [0x12, Opcode.INC_C],

            // Comparer C avec 10
            [0x13, Opcode.MOV_A_IMM],
            [0x14, 0x0A],               // 10
            [0x15, Opcode.SUB],         // A = 10 - C

            // Si C != 10, continuer (A != 0)
            [0x16, Opcode.JNZ],
            [0x17, 0x05], [0x18, 0x02], // Retour à 0x0205

            // Fini
            [0x19, Opcode.HALT],
        ] as [u8, u8][]),
        expectedResult: "Console affiche 0-9 avec newlines"
    },

    lcd_hello: {
        name: "LCD Hello",
        description: "Affiche 'Hello' sur ligne 1 et 'World!' sur ligne 2",
        code: new Map([
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF], [0x02, 0xFE],

            // Clear LCD
            [0x03, Opcode.MOV_A_IMM],
            [0x04, 0x01], // CMD Clear
            [0x05, Opcode.MOV_MEM_A],
            [0x06, 0xA1], [0x07, 0xFF], // LCD_COMMAND

            // "Hello" ligne 1
            [0x08, Opcode.MOV_A_IMM], [0x09, 0x48], // 'H'
            [0x0A, Opcode.MOV_MEM_A], [0x0B, 0xA0], [0x0C, 0xFF],

            [0x0D, Opcode.MOV_A_IMM], [0x0E, 0x65], // 'e'
            [0x0F, Opcode.MOV_MEM_A], [0x10, 0xA0], [0x11, 0xFF],

            [0x12, Opcode.MOV_A_IMM], [0x13, 0x6C], // 'l'
            [0x14, Opcode.MOV_MEM_A], [0x15, 0xA0], [0x16, 0xFF],

            [0x17, Opcode.MOV_A_IMM], [0x18, 0x6C], // 'l'
            [0x19, Opcode.MOV_MEM_A], [0x1A, 0xA0], [0x1B, 0xFF],

            [0x1C, Opcode.MOV_A_IMM], [0x1D, 0x6F], // 'o'
            [0x1E, Opcode.MOV_MEM_A], [0x1F, 0xA0], [0x20, 0xFF],

            // Position curseur ligne 2 (row 1, col 0 = 16)
            [0x21, Opcode.MOV_A_IMM],
            [0x22, 16], // Position 16
            [0x23, Opcode.MOV_MEM_A],
            [0x24, 0xA2], [0x25, 0xFF], // LCD_CURSOR

            // "World!" ligne 2
            [0x26, Opcode.MOV_A_IMM], [0x27, 0x57], // 'W'
            [0x28, Opcode.MOV_MEM_A], [0x29, 0xA0], [0x2A, 0xFF],

            [0x2B, Opcode.MOV_A_IMM], [0x2C, 0x6F], // 'o'
            [0x2D, Opcode.MOV_MEM_A], [0x2E, 0xA0], [0x2F, 0xFF],

            [0x30, Opcode.MOV_A_IMM], [0x31, 0x72], // 'r'
            [0x32, Opcode.MOV_MEM_A], [0x33, 0xA0], [0x34, 0xFF],

            [0x35, Opcode.MOV_A_IMM], [0x36, 0x6C], // 'l'
            [0x37, Opcode.MOV_MEM_A], [0x38, 0xA0], [0x39, 0xFF],

            [0x3A, Opcode.MOV_A_IMM], [0x3B, 0x64], // 'd'
            [0x3C, Opcode.MOV_MEM_A], [0x3D, 0xA0], [0x3E, 0xFF],

            [0x3F, Opcode.MOV_A_IMM], [0x40, 0x21], // '!'
            [0x41, Opcode.MOV_MEM_A], [0x42, 0xA0], [0x43, 0xFF],

            [0x44, Opcode.HALT],
        ] as [u8, u8][]),
        expectedResult: "LCD affiche 'Hello' et 'World!'"
    },

    pixel_square: {
        name: "Pixel Square (KO)",
        description: "Dessine un carré 10x10 avec nouvelles instructions MOV",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF], [0x02, 0xFE],

            // Y = 10 à 19
            [0x03, Opcode.MOV_C_IMM],
            [0x04, 10],              // C = Y start

            // === BOUCLE Y ===
            // LOOP_Y:
            [0x05, Opcode.MOV_A_IMM],
            [0x06, 10],              // A = X start = 10

            // === BOUCLE X ===
            // LOOP_X:
            // 1. Écrire X
            [0x07, Opcode.PUSH_A],   // Sauvegarder X
            [0x08, Opcode.MOV_MEM_A],
            [0x09, 0xD0], [0x0A, 0xFF], // PIXEL_X

            // 2. Écrire Y (depuis C)
            [0x0B, Opcode.PUSH_C],   // Sauvegarder C
            [0x0C, Opcode.POP_A],    // Y dans A
            [0x0D, Opcode.MOV_MEM_A],
            [0x0E, 0xD1], [0x0F, 0xFF], // PIXEL_Y
            [0x10, Opcode.POP_C],    // Restaurer C (annule le push)

            // 3. Écrire couleur
            [0x11, Opcode.PUSH_A],
            [0x12, Opcode.MOV_A_IMM],
            [0x13, 0x01],           // Couleur = 1 (blanc)
            [0x14, Opcode.MOV_MEM_A],
            [0x15, 0xD2], [0x16, 0xFF], // PIXEL_COLOR
            [0x17, Opcode.POP_A],

            // 4. Incrémenter X et vérifier
            [0x18, Opcode.POP_A],    // Restaurer X
            [0x19, Opcode.INC_A],    // X++

            // Si X < 20, continuer boucle X
            [0x1A, Opcode.PUSH_A],   // Sauvegarder X
            [0x1B, Opcode.MOV_B_IMM],
            [0x1C, 20],              // X limit
            [0x1D, Opcode.SUB],      // A = X - 20
            [0x1E, Opcode.JNZ],      // Si X != 20
            [0x1F, 0x07], [0x20, 0x02], // Retour LOOP_X

            // 5. Fin de ligne - incrémenter Y
            [0x21, Opcode.POP_A],    // Nettoyer X
            [0x22, Opcode.INC_C],    // Y++

            // Si Y < 20, continuer boucle Y
            [0x23, Opcode.PUSH_C],   // Sauvegarder Y
            [0x24, Opcode.MOV_A_IMM],
            [0x25, 20],              // Y limit
            [0x26, Opcode.SUB],      // A = Y - 20
            // Mais Y est dans C, besoin de swap
            [0x23, Opcode.PUSH_C],   // Sauvegarder Y
            [0x24, Opcode.POP_A],    // Y dans A
            [0x25, Opcode.MOV_B_IMM],
            [0x26, 20],              // Limite
            [0x27, Opcode.SUB],      // A = Y - 20
            [0x28, Opcode.JNZ],      // Si Y != 20
            [0x29, 0x05], [0x2A, 0x02], // Retour LOOP_Y

            // Fin
            [0x2B, Opcode.HALT],
        ] as [u8, u8][]),
        expectedResult: "Carré 10x10 pixels à position (10,10)"
    },

    pixel_line: {
        name: "Pixel Line",
        description: "Dessine une ligne diagonale",
        code: new Map([
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF], [0x02, 0xFE],

            // Compteur 0-31
            [0x03, Opcode.MOV_A_IMM], [0x04, 0],
            [0x05, Opcode.MOV_B_IMM], [0x06, 32],

            // LOOP:
            // Set X = A
            [0x07, Opcode.MOV_MEM_A],
            [0x08, 0xD0], [0x09, 0xFF], // PIXEL_X

            // Set Y = A
            [0x0A, Opcode.MOV_MEM_A],
            [0x0B, 0xD1], [0x0C, 0xFF], // PIXEL_Y

            // Set COLOR = 1
            [0x0D, Opcode.PUSH_A],
            [0x0E, Opcode.MOV_A_IMM], [0x0F, 0x01],
            [0x10, Opcode.MOV_MEM_A],
            [0x11, 0xD2], [0x12, 0xFF], // PIXEL_COLOR
            [0x13, Opcode.POP_A],

            // A++
            [0x14, Opcode.INC_A],

            // B--
            [0x15, Opcode.DEC_B],
            [0x16, Opcode.JNZ],
            [0x17, 0x07], [0x18, 0x02], // LOOP

            [0x19, Opcode.HALT],
        ] as [u8, u8][]),
        expectedResult: "Ligne diagonale de (0,0) à (31,31)"
    },

    lcd_counter: {
        name: "LCD Counter",
        description: "Compte de 0 à 99 sur LCD",
        code: new Map([
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF], [0x02, 0xFE],

            // Clear LCD
            [0x03, Opcode.MOV_A_IMM], [0x04, 0x01],
            [0x05, Opcode.MOV_MEM_A],
            [0x06, 0xA1], [0x07, 0xFF],

            // Counter = 0
            [0x08, Opcode.MOV_A_IMM], [0x09, 0],

            // LOOP:
            // Position curseur (0,0)
            [0x0A, Opcode.PUSH_A],
            [0x0B, Opcode.MOV_A_IMM], [0x0C, 0],
            [0x0D, Opcode.MOV_MEM_A],
            [0x0E, 0xA2], [0x0F, 0xFF], // LCD_CURSOR
            [0x10, Opcode.POP_A],

            // Convertir A en ASCII dizaines
            [0x11, Opcode.PUSH_A],
            [0x12, Opcode.MOV_B_IMM], [0x13, 10],
            // Division par 10 simplifiée (assume A < 100)
            [0x14, Opcode.MOV_C_IMM], [0x15, 0], // Quotient
            // DIV_LOOP:
            [0x16, Opcode.SUB], // A = A - B
            [0x17, Opcode.INC_C],
            [0x18, Opcode.MOV_B_IMM], [0x19, 10],
            [0x1A, Opcode.JC], // Si carry (A < 0), sortir
            [0x1B, 0x1F], [0x1C, 0x02],
            [0x1D, Opcode.JMP],
            [0x1E, 0x16], [0x1F, 0x02], // DIV_LOOP

            // Afficher dizaine
            [0x20, Opcode.MOV_A_IMM], [0x21, 0x00],
            [0x22, Opcode.ADD], // A = C
            [0x23, Opcode.MOV_B_IMM], [0x24, 0x30], // '0'
            [0x25, Opcode.ADD], // A = C + '0'
            [0x26, Opcode.MOV_MEM_A],
            [0x27, 0xA0], [0x28, 0xFF], // LCD_DATA
            [0x29, Opcode.POP_A],

            // Afficher unité (A % 10)
            [0x2A, Opcode.PUSH_A],
            // Modulo 10 simplifié
            [0x2B, Opcode.AND], // Reset
            [0x2C, Opcode.MOV_B_IMM], [0x2D, 10],
            // MOD_LOOP:
            [0x2E, Opcode.SUB],
            [0x2F, Opcode.JC],
            [0x30, 0x33], [0x31, 0x02],
            [0x32, Opcode.JMP],
            [0x33, 0x2E], [0x34, 0x02],

            [0x35, Opcode.MOV_B_IMM], [0x36, 0x30],
            [0x37, Opcode.ADD],
            [0x38, Opcode.MOV_MEM_A],
            [0x39, 0xA0], [0x3A, 0xFF],
            [0x3B, Opcode.POP_A],

            // Delay
            [0x3C, Opcode.PUSH_A],
            [0x3D, Opcode.MOV_B_IMM], [0x3E, 0xFF],
            [0x3F, Opcode.DEC_B],
            [0x40, Opcode.JNZ],
            [0x41, 0x3F], [0x42, 0x02],
            [0x43, Opcode.POP_A],

            // Incrémenter
            [0x44, Opcode.INC_A],

            // Check < 100
            [0x45, Opcode.MOV_B_IMM], [0x46, 100],
            [0x47, Opcode.SUB],
            [0x48, Opcode.JNZ],
            [0x49, 0x0A], [0x4A, 0x02],

            [0x4B, Opcode.HALT],
        ] as [u8, u8][]),
        expectedResult: "LCD compte de 00 à 99"
    },
}





