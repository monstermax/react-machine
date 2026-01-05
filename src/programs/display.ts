
import { Opcode } from "@/lib/instructions";
import { high16, low16 } from "@/lib/integers";
import { MEMORY_MAP } from "@/lib/memory_map";

import type { ProgramInfo, u16, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    leds_on: {
        name: "LED ON",
        description: "Allume les LEDs",
        code: new Map([
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 0xff],

            // Loop
            [0x02, Opcode.MOV_MEM_A],
            [0x03, low16(MEMORY_MAP.LEDS_BASE)],   // LEDS_BASE - Low byte
            [0x04, high16(MEMORY_MAP.LEDS_BASE)],  // LEDS_BASE - High byte (0xFF30)

            [0x05, Opcode.SYSCALL],
            [0x06, 0],               // ← Syscall 0 = exit
        ] as [u8, u8][]),
    },

    leds_off: {
        name: "LED OFF",
        description: "Eteint les LEDs",
        code: new Map([
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 0x00],

            // Loop
            [0x02, Opcode.MOV_MEM_A],
            [0x03, low16(MEMORY_MAP.LEDS_BASE)],   // LEDS_BASE - Low byte
            [0x04, high16(MEMORY_MAP.LEDS_BASE)],  // LEDS_BASE - High byte (0xFF30)

            [0x05, Opcode.SYSCALL],
            [0x06, 0],               // ← Syscall 0 = exit
        ] as [u8, u8][]),
    },

    leds_blink: {
        name: "LED Blinker",
        description: "Fait clignoter les LEDs en compteur binaire",
        code: new Map([
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 0x00],

            // Loop
            [0x02, Opcode.MOV_MEM_A],
            [0x03, low16(MEMORY_MAP.LEDS_BASE)],  // LEDS_BASE - Low byte
            [0x04, high16(MEMORY_MAP.LEDS_BASE)],  // LEDS_BASE - High byte (0xFF30)

            [0x05, Opcode.INC_A],
            [0x06, Opcode.JMP],
            [0x07, low16(MEMORY_MAP.PROGRAM_START + 0x02 as u16)],   // PROGRAM_START + 0x02 - Low
            [0x08, high16(MEMORY_MAP.PROGRAM_START + 0x02 as u16)],  // PROGRAM_START + 0x02 - High
        ] as [u8, u8][]),
    },

    seven_segments: {
        name: "7-Segment Counter",
        description: "Compte de 0 à F sur l'afficheur 7 segments",
        code: new Map([
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 0x00],

            // Boucle principale
            [0x02, Opcode.MOV_MEM_A],
            [0x03, low16(MEMORY_MAP.SEVEN_SEG_BASE)],  // SEVEN_SEG_BASE - low
            [0x04, high16(MEMORY_MAP.SEVEN_SEG_BASE)],  // SEVEN_SEG_BASE - high

            [0x05, Opcode.MOV_B_IMM],
            [0x06, 0x05],

            // Délai
            [0x07, Opcode.DEC_B],
            [0x08, Opcode.JNZ],
            [0x10, low16(MEMORY_MAP.PROGRAM_START + 0x07 as u16)],   // PROGRAM_START + 0x07 - Low
            [0x11, high16(MEMORY_MAP.PROGRAM_START + 0x07 as u16)],  // PROGRAM_START + 0x07 - High

            [0x0B, Opcode.INC_A],
            [0x0C, Opcode.MOV_B_IMM],
            [0x0D, 0x0F],
            [0x0E, Opcode.AND],          // A = A & 0x0F
            [0x0F, Opcode.JMP],
            [0x10, low16(MEMORY_MAP.PROGRAM_START + 0x02 as u16)],   // PROGRAM_START + 0x02 - Low
            [0x11, high16(MEMORY_MAP.PROGRAM_START + 0x02 as u16)],  // PROGRAM_START + 0x02 - High
        ] as [u8, u8][]),
    },

    hello_world: {
        name: "Hello World",
        description: "Affiche 'Hello World!' dans la console",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.SET_SP],
            [0x01, low16(MEMORY_MAP.STACK_END)],  // STACK_END - low
            [0x02, high16(MEMORY_MAP.STACK_END)], // STACK_END - high

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
    },

    console_counter: {
        name: "Counter Console",
        description: "Compte de 0 à 9 dans la console",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.SET_SP],
            [0x01, low16(MEMORY_MAP.STACK_END)],  // STACK_END - low
            [0x02, high16(MEMORY_MAP.STACK_END)], // STACK_END - high

            // Initialiser compteur C = 0
            [0x03, Opcode.MOV_C_IMM],
            [0x04, 0x00],

            // === LOOP START ===
            // Convertir C en ASCII
            // Copier C dans A d'abord
            [0x05, Opcode.MOV_CA],          // A = C
            [0x06, Opcode.MOV_B_IMM],       // B = '0' (0x30)
            [0x07, 0x30],
            [0x08, Opcode.ADD],             // A = A + B = C + 0x30

            // Afficher chiffre
            [0x09, Opcode.MOV_MEM_A],
            [0x0A, 0x70], [0x0B, 0xFF],     // CONSOLE_CHAR

            // Afficher newline
            [0x0C, Opcode.PUSH_A],           // Sauvegarder A (le chiffre)
            [0x0D, Opcode.MOV_A_IMM],
            [0x0E, 0x0A],                   // '\n'
            [0x0F, Opcode.MOV_MEM_A],
            [0x10, 0x70], [0x11, 0xFF],     // CONSOLE_CHAR
            [0x12, Opcode.POP_A],           // Restaurer A

            // Incrémenter C
            [0x13, Opcode.INC_C],

            // Comparer C avec 10
            [0x14, Opcode.MOV_CA],          // A = C
            [0x15, Opcode.MOV_B_IMM],       // B = 10
            [0x16, 0x0A],
            [0x17, Opcode.SUB],             // A = A - B = C - 10

            // Si C != 10, continuer (A != 0 car zero flag = false)
            [0x18, Opcode.JNZ],
            [0x19, 0x05], [0x1A, 0x02],     // Retour à 0x0205

            // Fini
            [0x1B, Opcode.HALT],
        ] as [u8, u8][]),
    },

    lcd_hello: {
        name: "LCD Hello",
        description: "Affiche 'Hello' sur ligne 1 et 'World!' sur ligne 2",
        code: new Map([
            [0x00, Opcode.SET_SP],
            [0x01, low16(MEMORY_MAP.STACK_END)],  // STACK_END - low
            [0x02, high16(MEMORY_MAP.STACK_END)], // STACK_END - high

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
    },

    lcd_counter: {
        name: "LCD Counter (KO)",
        description: "Compte de 0 à 99 sur LCD",
        code: new Map([
            [0x00, Opcode.SET_SP],
            [0x01, low16(MEMORY_MAP.STACK_END)],  // STACK_END - low
            [0x02, high16(MEMORY_MAP.STACK_END)], // STACK_END - high

            // Clear LCD
            [0x03, Opcode.MOV_A_IMM],
            [0x04, 0x01],
            [0x05, Opcode.MOV_MEM_A],
            [0x06, 0xA1],
            [0x07, 0xFF],

            // Counter = 0
            [0x08, Opcode.MOV_A_IMM],
            [0x09, 0],

            // LOOP:
            // Position curseur (0,0)
            [0x0A, Opcode.PUSH_A],
            [0x0B, Opcode.MOV_A_IMM],
            [0x0C, 0],
            [0x0D, Opcode.MOV_MEM_A],
            [0x0E, 0xA2],
            [0x0F, 0xFF], // LCD_CURSOR
            [0x10, Opcode.POP_A],

            // Convertir A en ASCII dizaines
            [0x11, Opcode.PUSH_A],
            [0x12, Opcode.MOV_B_IMM],
            [0x13, 10],
            // Division par 10 simplifiée (assume A < 100)
            [0x14, Opcode.MOV_C_IMM],
            [0x15, 0], // Quotient
            // DIV_LOOP:
            [0x16, Opcode.SUB], // A = A - B
            [0x17, Opcode.INC_C],
            [0x18, Opcode.MOV_B_IMM],
            [0x19, 10],
            [0x1A, Opcode.JC], // Si carry (A < 0), sortir
            [0x1B, 0x1F],
            [0x1C, 0x02],
            [0x1D, Opcode.JMP], // DIV_LOOP
            [0x1E, low16 (MEMORY_MAP.PROGRAM_START + 0x16 as u16)],
            [0x1F, high16(MEMORY_MAP.PROGRAM_START + 0x16 as u16)],

            // Afficher dizaine
            [0x20, Opcode.MOV_A_IMM],
            [0x21, 0x00],
            [0x22, Opcode.ADD], // A = C
            [0x23, Opcode.MOV_B_IMM],
            [0x24, 0x30], // '0'
            [0x25, Opcode.ADD], // A = C + '0'
            [0x26, Opcode.MOV_MEM_A],
            [0x27, 0xA0],
            [0x28, 0xFF], // LCD_DATA
            [0x29, Opcode.POP_A],

            // Afficher unité (A % 10)
            [0x2A, Opcode.PUSH_A],
            // Modulo 10 simplifié
            [0x2B, Opcode.AND], // Reset
            [0x2C, Opcode.MOV_B_IMM],
            [0x2D, 10],
            // MOD_LOOP:
            [0x2E, Opcode.SUB],
            [0x2F, Opcode.JC],
            [0x30, 0x33],
            [0x31, 0x02],
            [0x32, Opcode.JMP],
            [0x33, low16 (MEMORY_MAP.PROGRAM_START + 0x2E as u16)],
            [0x34, high16(MEMORY_MAP.PROGRAM_START + 0x2E as u16)],

            [0x35, Opcode.MOV_B_IMM],
            [0x36, 0x30],
            [0x37, Opcode.ADD],
            [0x38, Opcode.MOV_MEM_A],
            [0x39, 0xA0],
            [0x3A, 0xFF],
            [0x3B, Opcode.POP_A],

            // Delay
            [0x3C, Opcode.PUSH_A],
            [0x3D, Opcode.MOV_B_IMM],
            [0x3E, 0xFF],
            [0x3F, Opcode.DEC_B],
            [0x40, Opcode.JNZ],
            [0x41, low16 (MEMORY_MAP.PROGRAM_START + 0x3F as u16)],
            [0x42, high16(MEMORY_MAP.PROGRAM_START + 0x3F as u16)],
            [0x43, Opcode.POP_A],

            // Incrémenter
            [0x44, Opcode.INC_A],

            // Check < 100
            [0x45, Opcode.MOV_B_IMM],
            [0x46, 100],
            [0x47, Opcode.SUB],
            [0x48, Opcode.JNZ],
            [0x49, low16 (MEMORY_MAP.PROGRAM_START + 0x0A as u16)],
            [0x4A, high16(MEMORY_MAP.PROGRAM_START + 0x0A as u16)],

            [0x4B, Opcode.HALT],
        ] as [u8, u8][]),
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
    },

    pixel_square: {
        name: "Contour Carré 10x10",
        description: "Dessine uniquement le contour d'un carré 10x10",
        code: new Map([
            [0x00, Opcode.SET_SP],
            [0x01, low16(MEMORY_MAP.STACK_END)],  // STACK_END - low
            [0x02, high16(MEMORY_MAP.STACK_END)], // STACK_END - high

            // === LIGNE HAUT (Y=5, X=5 à 14) ===
            [0x03, Opcode.MOV_A_IMM],
            [0x04, 5],  // X = 5

            // LOOP_HAUT @ 0x05:
            [0x05, Opcode.MOV_MEM_A], [0x06, 0xD0], [0x07, 0xFF], // PIXEL_X
            [0x08, Opcode.MOV_B_IMM], [0x09, 5],   // Y = 5
            [0x0A, Opcode.MOV_MEM_B], [0x0B, 0xD1], [0x0C, 0xFF], // PIXEL_Y
            [0x0D, Opcode.MOV_B_IMM], [0x0E, 1],   // Couleur = 1
            [0x0F, Opcode.MOV_MEM_B], [0x10, 0xD2], [0x11, 0xFF], // PIXEL_COLOR

            [0x12, Opcode.INC_A],                  // X++
            [0x13, Opcode.PUSH_A],                 // Sauver A
            [0x14, Opcode.MOV_B_IMM], [0x15, 15],  // Comparer avec 15
            [0x16, Opcode.SUB],                    // A = A - 15
            [0x17, Opcode.POP_A],                  // Restaurer A
            [0x18, Opcode.JNZ],
            [0x19, low16 (MEMORY_MAP.PROGRAM_START + 0x05 as u16)],
            [0x1A, high16(MEMORY_MAP.PROGRAM_START + 0x05 as u16)],            // Si A != 15, loop

            // === LIGNE BAS (Y=14, X=5 à 14) ===
            [0x1B, Opcode.MOV_A_IMM],
            [0x1C, 5],  // X = 5

            // LOOP_BAS @ 0x1D:
            [0x1D, Opcode.MOV_MEM_A],
            [0x1E, 0xD0], [0x1F, 0xFF], // PIXEL_X
            [0x20, Opcode.MOV_B_IMM],
            [0x21, 14],  // Y = 14
            [0x22, Opcode.MOV_MEM_B],
            [0x23, 0xD1], [0x24, 0xFF], // PIXEL_Y
            [0x25, Opcode.MOV_B_IMM],
            [0x26, 1],
            [0x27, Opcode.MOV_MEM_B],
            [0x28, 0xD2], [0x29, 0xFF], // PIXEL_COLOR

            [0x2A, Opcode.INC_A],
            [0x2B, Opcode.PUSH_A],
            [0x2C, Opcode.MOV_B_IMM],
            [0x2D, 15],
            [0x2E, Opcode.SUB],
            [0x2F, Opcode.POP_A],
            [0x30, Opcode.JNZ],
            [0x31, low16 (MEMORY_MAP.PROGRAM_START + 0x1D as u16)],
            [0x32, high16(MEMORY_MAP.PROGRAM_START + 0x1D as u16)],

            // === CÔTÉ GAUCHE (X=5, Y=6 à 13) ===
            [0x33, Opcode.MOV_A_IMM],
            [0x34, 6],  // Y = 6

            // LOOP_GAUCHE @ 0x35:
            [0x35, Opcode.MOV_B_IMM],
            [0x36, 5],   // X = 5
            [0x37, Opcode.MOV_MEM_B],
            [0x38, 0xD0],
            [0x39, 0xFF], // PIXEL_X
            [0x3A, Opcode.MOV_MEM_A],
            [0x3B, 0xD1],
            [0x3C, 0xFF], // PIXEL_Y
            [0x3D, Opcode.MOV_B_IMM],
            [0x3E, 1],
            [0x3F, Opcode.MOV_MEM_B],
            [0x40, 0xD2],
            [0x41, 0xFF], // PIXEL_COLOR

            [0x42, Opcode.INC_A],
            [0x43, Opcode.PUSH_A],
            [0x44, Opcode.MOV_B_IMM],
            [0x45, 14],
            [0x46, Opcode.SUB],
            [0x47, Opcode.POP_A],
            [0x48, Opcode.JNZ],
            [0x49, low16 (MEMORY_MAP.PROGRAM_START + 0x35 as u16)],
            [0x4A, high16(MEMORY_MAP.PROGRAM_START + 0x35 as u16)],

            // === CÔTÉ DROIT (X=14, Y=6 à 13) ===
            [0x4B, Opcode.MOV_A_IMM], [0x4C, 6],  // Y = 6

            // LOOP_DROIT @ 0x4D:
            [0x4D, Opcode.MOV_B_IMM], [0x4E, 14],  // X = 14
            [0x4F, Opcode.MOV_MEM_B], [0x50, 0xD0], [0x51, 0xFF], // PIXEL_X
            [0x52, Opcode.MOV_MEM_A], [0x53, 0xD1], [0x54, 0xFF], // PIXEL_Y
            [0x55, Opcode.MOV_B_IMM], [0x56, 1],
            [0x57, Opcode.MOV_MEM_B], [0x58, 0xD2], [0x59, 0xFF], // PIXEL_COLOR

            [0x5A, Opcode.INC_A],
            [0x5B, Opcode.PUSH_A],
            [0x5C, Opcode.MOV_B_IMM],
            [0x5D, 14],
            [0x5E, Opcode.SUB],
            [0x5F, Opcode.POP_A],
            [0x60, Opcode.JNZ],
            [0x61, low16 (MEMORY_MAP.PROGRAM_START + 0x4D as u16)],
            [0x62, high16(MEMORY_MAP.PROGRAM_START + 0x4D as u16)],

            [0x63, Opcode.HALT],
        ] as [u8, u8][]),
    },

}





