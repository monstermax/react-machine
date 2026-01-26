
import { Opcode } from "@/v2/cpus/default/cpu_instructions";
import { high16, low16 } from "@/v2/lib/integers";
import { MEMORY_MAP } from "@/v2/lib/memory_map_16x8_bits";

import type { ProgramInfo, u16, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    leds_blink: {
        name: "LED Blinker",
        description: "Fait clignoter les LEDs en compteur binaire",
        code: new Map([
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 0x00],

            // Loop
            [0x02, Opcode.MOV_MEM_A],
            [0x03, low16(MEMORY_MAP.LEDS_BASE)],   // LEDS_BASE - Low byte
            [0x04, high16(MEMORY_MAP.LEDS_BASE)],  // LEDS_BASE - High byte (0xFF30)

            [0x05, Opcode.INC_A],
            [0x06, Opcode.JMP],
            [0x07, low16(MEMORY_MAP.PROGRAM_START + 0x02 as u16)],   // PROGRAM_START + 0x02 - Low
            [0x08, high16(MEMORY_MAP.PROGRAM_START + 0x02 as u16)],  // PROGRAM_START + 0x02 - High
        ] as [u16, u8][]),
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
            [0x09, low16(MEMORY_MAP.PROGRAM_START + 0x07 as u16)],  // PROGRAM_START + 0x07 - Low
            [0x0A, high16(MEMORY_MAP.PROGRAM_START + 0x07 as u16)],  // PROGRAM_START + 0x07 - High

            [0x0B, Opcode.INC_A],
            [0x0C, Opcode.MOV_B_IMM],
            [0x0D, 0x0F],

            [0x0E, Opcode.SYSCALL],
            [0x0F, 0],
        ] as [u16, u8][]),
    },

    hello_world_console: {
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
            [0x06, low16(MEMORY_MAP.CONSOLE_CHAR)],
            [0x07, high16(MEMORY_MAP.CONSOLE_CHAR)],

            // e
            [0x08, Opcode.MOV_A_IMM],
            [0x09, 0x65], // 'e'
            [0x0A, Opcode.MOV_MEM_A],
            [0x0B, low16(MEMORY_MAP.CONSOLE_CHAR)],
            [0x0C, high16(MEMORY_MAP.CONSOLE_CHAR)],

            // l
            [0x0D, Opcode.MOV_A_IMM],
            [0x0E, 0x6C], // 'l'
            [0x0F, Opcode.MOV_MEM_A],
            [0x10, low16(MEMORY_MAP.CONSOLE_CHAR)],
            [0x11, high16(MEMORY_MAP.CONSOLE_CHAR)],

            // l
            [0x12, Opcode.MOV_A_IMM],
            [0x13, 0x6C], // 'l'
            [0x14, Opcode.MOV_MEM_A],
            [0x15, low16(MEMORY_MAP.CONSOLE_CHAR)],
            [0x16, high16(MEMORY_MAP.CONSOLE_CHAR)],

            // o
            [0x17, Opcode.MOV_A_IMM],
            [0x18, 0x6F], // 'o'
            [0x19, Opcode.MOV_MEM_A],
            [0x1A, low16(MEMORY_MAP.CONSOLE_CHAR)],
            [0x1B, high16(MEMORY_MAP.CONSOLE_CHAR)],

            // (space)
            [0x1C, Opcode.MOV_A_IMM],
            [0x1D, 0x20], // ' '
            [0x1E, Opcode.MOV_MEM_A],
            [0x1F, low16(MEMORY_MAP.CONSOLE_CHAR)],
            [0x20, high16(MEMORY_MAP.CONSOLE_CHAR)],

            // W
            [0x21, Opcode.MOV_A_IMM],
            [0x22, 0x57], // 'W'
            [0x23, Opcode.MOV_MEM_A],
            [0x24, low16(MEMORY_MAP.CONSOLE_CHAR)],
            [0x25, high16(MEMORY_MAP.CONSOLE_CHAR)],

            // o
            [0x26, Opcode.MOV_A_IMM],
            [0x27, 0x6F], // 'o'
            [0x28, Opcode.MOV_MEM_A],
            [0x29, low16(MEMORY_MAP.CONSOLE_CHAR)],
            [0x2A, high16(MEMORY_MAP.CONSOLE_CHAR)],

            // r
            [0x2B, Opcode.MOV_A_IMM],
            [0x2C, 0x72], // 'r'
            [0x2D, Opcode.MOV_MEM_A],
            [0x2E, low16(MEMORY_MAP.CONSOLE_CHAR)],
            [0x2F, high16(MEMORY_MAP.CONSOLE_CHAR)],

            // l
            [0x30, Opcode.MOV_A_IMM],
            [0x31, 0x6C], // 'l'
            [0x32, Opcode.MOV_MEM_A],
            [0x33, low16(MEMORY_MAP.CONSOLE_CHAR)],
            [0x34, high16(MEMORY_MAP.CONSOLE_CHAR)],

            // d
            [0x35, Opcode.MOV_A_IMM],
            [0x36, 0x64], // 'd'
            [0x37, Opcode.MOV_MEM_A],
            [0x38, low16(MEMORY_MAP.CONSOLE_CHAR)],
            [0x39, high16(MEMORY_MAP.CONSOLE_CHAR)],

            // !
            [0x3A, Opcode.MOV_A_IMM],
            [0x3B, 0x21], // '!'
            [0x3C, Opcode.MOV_MEM_A],
            [0x3D, low16(MEMORY_MAP.CONSOLE_CHAR)],
            [0x3E, high16(MEMORY_MAP.CONSOLE_CHAR)],

            // Newline
            [0x3F, Opcode.MOV_A_IMM],
            [0x40, 0x0A], // '\n'
            [0x41, Opcode.MOV_MEM_A],
            [0x42, low16(MEMORY_MAP.CONSOLE_CHAR)],
            [0x43, high16(MEMORY_MAP.CONSOLE_CHAR)],

            // HALT
            [0x44, Opcode.SYSCALL],
            [0x45, 0],
        ] as [u16, u8][]),
    },

    lcd_hello: {
        name: "LCD Hello",
        description: "Affiche 'Hello' sur ligne 1 et 'World!' sur ligne 2",
        code: new Map([
            [0x00, Opcode.MOV_AB],
            [0x01, Opcode.MOV_AB],
            [0x02, Opcode.MOV_AB],

            // Clear LCD
            [0x03, Opcode.MOV_A_IMM],
            [0x04, 0x01], // CMD Clear
            [0x05, Opcode.MOV_MEM_A],
            [0x06, low16(MEMORY_MAP.LCD_COMMAND)], // LCD_COMMAND
            [0x07, high16(MEMORY_MAP.LCD_COMMAND)], // LCD_COMMAND

            // "Hello" ligne 1
            [0x08, Opcode.MOV_A_IMM],
            [0x09, 0x48], // 'H'
            [0x0A, Opcode.MOV_MEM_A],
            [0x0B, low16(MEMORY_MAP.LCD_BASE)],
            [0x0C, high16(MEMORY_MAP.LCD_BASE)],

            [0x0D, Opcode.MOV_A_IMM],
            [0x0E, 0x65], // 'e'
            [0x0F, Opcode.MOV_MEM_A],
            [0x10, low16(MEMORY_MAP.LCD_BASE)],
            [0x11, high16(MEMORY_MAP.LCD_BASE)],

            [0x12, Opcode.MOV_A_IMM],
            [0x13, 0x6C], // 'l'
            [0x14, Opcode.MOV_MEM_A],
            [0x15, low16(MEMORY_MAP.LCD_BASE)],
            [0x16, high16(MEMORY_MAP.LCD_BASE)],

            [0x17, Opcode.MOV_A_IMM],
            [0x18, 0x6C], // 'l'
            [0x19, Opcode.MOV_MEM_A],
            [0x1A, low16(MEMORY_MAP.LCD_BASE)],
            [0x1B, high16(MEMORY_MAP.LCD_BASE)],

            [0x1C, Opcode.MOV_A_IMM],
            [0x1D, 0x6F], // 'o'
            [0x1E, Opcode.MOV_MEM_A],
            [0x1F, low16(MEMORY_MAP.LCD_BASE)],
            [0x20, high16(MEMORY_MAP.LCD_BASE)],

            // Position curseur ligne 2 (row 1, col 0 = 16)
            [0x21, Opcode.MOV_A_IMM],
            [0x22, 16], // Position 16
            [0x23, Opcode.MOV_MEM_A],
            [0x24, low16(MEMORY_MAP.LCD_CURSOR)], // LCD_CURSOR
            [0x25, high16(MEMORY_MAP.LCD_CURSOR)], // LCD_CURSOR

            // "World!" ligne 2
            [0x26, Opcode.MOV_A_IMM],
            [0x27, 0x57], // 'W'
            [0x28, Opcode.MOV_MEM_A],
            [0x29, low16(MEMORY_MAP.LCD_BASE)],
            [0x2A, high16(MEMORY_MAP.LCD_BASE)],

            [0x2B, Opcode.MOV_A_IMM],
            [0x2C, 0x6F], // 'o'
            [0x2D, Opcode.MOV_MEM_A],
            [0x2E, low16(MEMORY_MAP.LCD_BASE)],
            [0x2F, high16(MEMORY_MAP.LCD_BASE)],

            [0x30, Opcode.MOV_A_IMM],
            [0x31, 0x72], // 'r'
            [0x32, Opcode.MOV_MEM_A],
            [0x33, low16(MEMORY_MAP.LCD_BASE)],
            [0x34, high16(MEMORY_MAP.LCD_BASE)],

            [0x35, Opcode.MOV_A_IMM],
            [0x36, 0x6C], // 'l'
            [0x37, Opcode.MOV_MEM_A],
            [0x38, low16(MEMORY_MAP.LCD_BASE)],
            [0x39, high16(MEMORY_MAP.LCD_BASE)],

            [0x3A, Opcode.MOV_A_IMM],
            [0x3B, 0x64], // 'd'
            [0x3C, Opcode.MOV_MEM_A],
            [0x3D, low16(MEMORY_MAP.LCD_BASE)],
            [0x3E, high16(MEMORY_MAP.LCD_BASE)],

            [0x3F, Opcode.MOV_A_IMM],
            [0x40, 0x21], // '!'
            [0x41, Opcode.MOV_MEM_A],
            [0x42, low16(MEMORY_MAP.LCD_BASE)],
            [0x43, high16(MEMORY_MAP.LCD_BASE)],

            [0x44, Opcode.SYSCALL],
            [0x45, 0],
        ] as [u16, u8][]),
    },

    lcd_counter: {
        name: "LCD Counter",
        description: "Compte de 0 à 99 sur LCD avec MEMORY_MAP",
        code: new Map([
            // === INITIALISATION ===
            // Initialiser SP
            [0x00, Opcode.SET_SP],
            [0x01, low16(MEMORY_MAP.STACK_END)],
            [0x02, high16(MEMORY_MAP.STACK_END)],

            // Clear LCD (commande 0x01 = clear display)
            [0x03, Opcode.MOV_A_IMM],
            [0x04, 0x01], // Commande clear
            [0x05, Opcode.MOV_MEM_A],
            [0x06, low16(MEMORY_MAP.LCD_COMMAND)],
            [0x07, high16(MEMORY_MAP.LCD_COMMAND)],

            // Counter = 0 dans A
            [0x08, Opcode.MOV_A_IMM],
            [0x09, 0],

            // === BOUCLE PRINCIPALE ===
            // LOOP: (adresse 0x0A)
            // Sauvegarder counter (A) sur la pile
            [0x0A, Opcode.PUSH_A],

            // Position curseur à (0,0) - commande 0x02
            [0x0B, Opcode.MOV_A_IMM],
            [0x0C, 0x02],
            [0x0D, Opcode.MOV_MEM_A],
            [0x0E, low16(MEMORY_MAP.LCD_COMMAND)],
            [0x0F, high16(MEMORY_MAP.LCD_COMMAND)],

            // Restaurer counter
            [0x10, Opcode.POP_A],

            // === CALCUL DIZAINES ===
            // Sauvegarder A (counter)
            [0x11, Opcode.PUSH_A],

            // Mettre 10 dans B pour division
            [0x12, Opcode.MOV_B_IMM],
            [0x13, 10],

            // Initialiser quotient (C) = 0
            [0x14, Opcode.MOV_C_IMM],
            [0x15, 0],

            // DIV_LOOP: (adresse 0x16)
            [0x16, Opcode.INC_C], // C++
            [0x17, Opcode.SUB], // A = A - B
            [0x18, Opcode.JC], // Si carry (A < B), fin division
            [0x19, low16(MEMORY_MAP.PROGRAM_START + 0x1E as u16)],
            [0x1A, high16(MEMORY_MAP.PROGRAM_START + 0x1E as u16)],

            // Continuer division
            [0x1B, Opcode.JMP],
            [0x1C, low16(MEMORY_MAP.PROGRAM_START + 0x16 as u16)],
            [0x1D, high16(MEMORY_MAP.PROGRAM_START + 0x16 as u16)],

            // FIN_DIV: (adresse 0x1E)
            // Ajuster: on a soustrait une fois de trop, ajouter 10
            [0x1E, Opcode.ADD], // A = A + B (reste)
            [0x1F, Opcode.DEC_C], // C-- (quotient trop grand de 1)

            // Afficher dizaine (C contient dizaines)
            [0x20, Opcode.MOV_AC], // C → A
            [0x21, Opcode.MOV_B_IMM], // '0' dans B
            [0x22, 0x30],
            [0x23, Opcode.ADD], // A = A + B

            // Écrire sur LCD (data)
            [0x24, Opcode.MOV_MEM_A],
            [0x25, low16(MEMORY_MAP.LCD_DATA)],
            [0x26, high16(MEMORY_MAP.LCD_DATA)],

            // === CALCUL UNITÉS ===
            // Restaurer le compteur original
            [0x27, Opcode.POP_A], // Récupère counter original

            // Sauvegarder A (pour plus tard)
            [0x28, Opcode.PUSH_A],

            // Calculer unités = A % 10
            // On a déjà A original, B=10
            [0x29, Opcode.MOV_B_IMM],
            [0x2A, 10],

            // MOD_LOOP: (adresse relative: 0x2B)
            [0x2B, Opcode.SUB], // A = A - B
            [0x2C, Opcode.JC], // Si carry (A < B), fin
            [0x2D, low16(MEMORY_MAP.PROGRAM_START + 0x32 as u16)],
            [0x2E, high16(MEMORY_MAP.PROGRAM_START + 0x32 as u16)],

            // Continuer modulo
            [0x2F, Opcode.JMP],
            [0x30, low16(MEMORY_MAP.PROGRAM_START + 0x2B as u16)],
            [0x31, high16(MEMORY_MAP.PROGRAM_START + 0x2B as u16)],

            // FIN_MOD: (adresse 0x32)
            // Ajuster reste: A + B (car on a soustrait une fois de trop)
            [0x32, Opcode.ADD], // A = reste (0-9)

            // Convertir en ASCII
            [0x33, Opcode.MOV_B_IMM],
            [0x34, 0x30], // '0'
            [0x35, Opcode.ADD], // A = reste + '0'

            // Écrire unité sur LCD
            [0x36, Opcode.MOV_MEM_A],
            [0x37, low16(MEMORY_MAP.LCD_DATA)],
            [0x38, high16(MEMORY_MAP.LCD_DATA)],

            // Restaurer counter original
            [0x39, Opcode.POP_A],

            // === DELAI ===
            [0x3A, Opcode.PUSH_A],
            [0x3B, Opcode.PUSH_B],

            // Double boucle de délai
            [0x3C, Opcode.MOV_B_IMM],
            [0x3D, 0x05], // Boucle externe

            // DELAY_OUTER: (0x3E)
            [0x3E, Opcode.MOV_C_IMM],
            [0x3F, 0x0F], // Boucle interne

            // DELAY_INNER: (0x40)
            [0x40, Opcode.DEC_C],
            [0x41, Opcode.JNZ],
            [0x42, low16(MEMORY_MAP.PROGRAM_START + 0x40 as u16)],
            [0x43, high16(MEMORY_MAP.PROGRAM_START + 0x40 as u16)],

            [0x44, Opcode.DEC_B],
            [0x45, Opcode.JNZ],
            [0x46, low16(MEMORY_MAP.PROGRAM_START + 0x3E as u16)],
            [0x47, high16(MEMORY_MAP.PROGRAM_START + 0x3E as u16)],

            [0x48, Opcode.POP_B],
            [0x49, Opcode.POP_A],

            // === INC RÉMENTATION ET TEST ===
            [0x4A, Opcode.INC_A],

            // Vérifier si A < 100
            [0x4B, Opcode.MOV_B_IMM],
            [0x4C, 100],
            [0x4D, Opcode.SUB], // A - 100
            [0x4E, Opcode.JC], // Si carry (A < 100), continuer
            [0x4F, low16(MEMORY_MAP.PROGRAM_START + 0x52 as u16)],
            [0x50, high16(MEMORY_MAP.PROGRAM_START + 0x52 as u16)],

            // Sinon, terminer (A >= 100)
            [0x51, Opcode.HALT],

            // Continuer boucle (restaurer A avant de boucler)
            // On a A = A - 100, besoin de A original pour boucle
            [0x52, Opcode.ADD], // A = (A - 100) + 100 = A original
            [0x53, Opcode.JMP],
            [0x54, low16(MEMORY_MAP.PROGRAM_START + 0x0A as u16)],
            [0x55, high16(MEMORY_MAP.PROGRAM_START + 0x0A as u16)],
        ] as [u16, u8][]),
    },

    pixel_line: {
        name: "Pixel Line",
        description: "Dessine une ligne diagonale",
        code: new Map([
            [0x00, Opcode.MOV_AB],
            [0x01, Opcode.MOV_AB],
            [0x02, Opcode.MOV_AB],

            // Compteur 0-31
            [0x03, Opcode.MOV_A_IMM],
            [0x04, 0],
            [0x05, Opcode.MOV_B_IMM],
            [0x06, 32],

            // LOOP:
            // Set X = A
            [0x07, Opcode.MOV_MEM_A],
            [0x08, low16(MEMORY_MAP.PIXEL_X)], // PIXEL_X - low
            [0x09, high16(MEMORY_MAP.PIXEL_X)], // PIXEL_X - high

            // Set Y = A
            [0x0A, Opcode.MOV_MEM_A],
            [0x0B, low16(MEMORY_MAP.PIXEL_Y)], // PIXEL_Y - low
            [0x0C, high16(MEMORY_MAP.PIXEL_Y)], // PIXEL_Y - high

            // Set COLOR = 1
            [0x0D, Opcode.PUSH_A],
            [0x0E, Opcode.MOV_A_IMM],
            [0x0F, 0x01],
            [0x10, Opcode.MOV_MEM_A],
            [0x11, low16(MEMORY_MAP.PIXEL_COLOR)], // PIXEL_COLOR - low
            [0x12, high16(MEMORY_MAP.PIXEL_COLOR)], // PIXEL_COLOR - high
            [0x13, Opcode.POP_A],

            // A++
            [0x14, Opcode.INC_A],

            // B--
            [0x15, Opcode.DEC_B],
            [0x16, Opcode.JNZ],
            [0x17, low16(MEMORY_MAP.PROGRAM_START + 0x07 as u16)], // LOOP - low
            [0x18, high16(MEMORY_MAP.PROGRAM_START + 0x07 as u16)], // LOOP - high

            [0x19, Opcode.SYSCALL],
            [0x1A, 0],
        ] as [u16, u8][]),
    },

    pixel_square: {
        name: "Contour Carré 10x10",
        description: "Dessine uniquement le contour d'un carré 10x10",
        code: new Map([
            [0x00, Opcode.PUSH_A],
            [0x01, Opcode.NOP],
            [0x02, Opcode.POP_A],
            //[0x00, Opcode.SET_SP],
            //[0x01, low16(MEMORY_MAP.STACK_END)],  // STACK_END - low
            //[0x02, high16(MEMORY_MAP.STACK_END)], // STACK_END - high

            // === LIGNE HAUT (Y=5, X=5 à 14) ===
            [0x03, Opcode.MOV_A_IMM],
            [0x04, 5],  // X = 5

            // LOOP_HAUT @ 0x05:
            [0x05, Opcode.MOV_MEM_A],
            [0x06, low16(MEMORY_MAP.PIXEL_X)],
            [0x07, high16(MEMORY_MAP.PIXEL_X)], // PIXEL_X
            [0x08, Opcode.MOV_B_IMM],
            [0x09, 5],   // Y = 5
            [0x0A, Opcode.MOV_MEM_B],
            [0x0B, low16(MEMORY_MAP.PIXEL_Y)],
            [0x0C, high16(MEMORY_MAP.PIXEL_Y)], // PIXEL_Y
            [0x0D, Opcode.MOV_B_IMM],
            [0x0E, 1],   // Couleur = 1
            [0x0F, Opcode.MOV_MEM_B],
            [0x10, low16(MEMORY_MAP.PIXEL_COLOR)],
            [0x11, high16(MEMORY_MAP.PIXEL_COLOR)], // PIXEL_COLOR

            [0x12, Opcode.INC_A],                  // X++
            [0x13, Opcode.PUSH_A],                 // Sauver A
            [0x14, Opcode.MOV_B_IMM],
            [0x15, 15],  // Comparer avec 15
            [0x16, Opcode.SUB],                    // A = A - 15
            [0x17, Opcode.POP_A],                  // Restaurer A
            [0x18, Opcode.JNZ],
            [0x19, low16(MEMORY_MAP.PROGRAM_START + 0x05 as u16)],  // LOOP_HAUT => Si A != 15, loop
            [0x1A, high16(MEMORY_MAP.PROGRAM_START + 0x05 as u16)], // LOOP_HAUT

            // === LIGNE BAS (Y=14, X=5 à 14) ===
            [0x1B, Opcode.MOV_A_IMM],
            [0x1C, 5],  // X = 5

            // LOOP_BAS @ 0x1D:
            [0x1D, Opcode.MOV_MEM_A],
            [0x1E, low16(MEMORY_MAP.PIXEL_X)],
            [0x1F, high16(MEMORY_MAP.PIXEL_X)], // PIXEL_X
            [0x20, Opcode.MOV_B_IMM],
            [0x21, 14],  // Y = 14
            [0x22, Opcode.MOV_MEM_B],
            [0x23, low16(MEMORY_MAP.PIXEL_Y)],
            [0x24, high16(MEMORY_MAP.PIXEL_Y)], // PIXEL_Y
            [0x25, Opcode.MOV_B_IMM],
            [0x26, 1],
            [0x27, Opcode.MOV_MEM_B],
            [0x28, low16(MEMORY_MAP.PIXEL_COLOR)],
            [0x29, high16(MEMORY_MAP.PIXEL_COLOR)], // PIXEL_COLOR

            [0x2A, Opcode.INC_A],
            [0x2B, Opcode.PUSH_A],
            [0x2C, Opcode.MOV_B_IMM],
            [0x2D, 15],
            [0x2E, Opcode.SUB],
            [0x2F, Opcode.POP_A],
            [0x30, Opcode.JNZ],
            [0x31, low16(MEMORY_MAP.PROGRAM_START + 0x1D as u16)],  // LOOP_BAS
            [0x32, high16(MEMORY_MAP.PROGRAM_START + 0x1D as u16)], // LOOP_BAS

            // === CÔTÉ GAUCHE (X=5, Y=6 à 13) ===
            [0x33, Opcode.MOV_A_IMM],
            [0x34, 6],  // Y = 6

            // LOOP_GAUCHE @ 0x35:
            [0x35, Opcode.MOV_B_IMM],
            [0x36, 5],   // X = 5
            [0x37, Opcode.MOV_MEM_B],
            [0x38, low16(MEMORY_MAP.PIXEL_X)],
            [0x39, high16(MEMORY_MAP.PIXEL_X)], // PIXEL_X
            [0x3A, Opcode.MOV_MEM_A],
            [0x3B, low16(MEMORY_MAP.PIXEL_Y)],
            [0x3C, high16(MEMORY_MAP.PIXEL_Y)], // PIXEL_Y
            [0x3D, Opcode.MOV_B_IMM],
            [0x3E, 1],
            [0x3F, Opcode.MOV_MEM_B],
            [0x40, low16(MEMORY_MAP.PIXEL_COLOR)],
            [0x41, high16(MEMORY_MAP.PIXEL_COLOR)], // PIXEL_COLOR

            [0x42, Opcode.INC_A],
            [0x43, Opcode.PUSH_A],
            [0x44, Opcode.MOV_B_IMM],
            [0x45, 14],
            [0x46, Opcode.SUB],
            [0x47, Opcode.POP_A],
            [0x48, Opcode.JNZ],
            [0x49, low16(MEMORY_MAP.PROGRAM_START + 0x35 as u16)],  // LOOP_GAUCHE
            [0x4A, high16(MEMORY_MAP.PROGRAM_START + 0x35 as u16)], // LOOP_GAUCHE

            // === CÔTÉ DROIT (X=14, Y=6 à 13) ===
            [0x4B, Opcode.MOV_A_IMM],
            [0x4C, 6],  // Y = 6

            // LOOP_DROIT @ 0x4D:
            [0x4D, Opcode.MOV_B_IMM],
            [0x4E, 14],  // X = 14
            [0x4F, Opcode.MOV_MEM_B],
            [0x50, low16(MEMORY_MAP.PIXEL_X)],
            [0x51, high16(MEMORY_MAP.PIXEL_X)], // PIXEL_X
            [0x52, Opcode.MOV_MEM_A],
            [0x53, low16(MEMORY_MAP.PIXEL_Y)],
            [0x54, high16(MEMORY_MAP.PIXEL_Y)], // PIXEL_Y
            [0x55, Opcode.MOV_B_IMM],
            [0x56, 1],
            [0x57, Opcode.MOV_MEM_B],
            [0x58, low16(MEMORY_MAP.PIXEL_COLOR)],
            [0x59, high16(MEMORY_MAP.PIXEL_COLOR)], // PIXEL_COLOR

            [0x5A, Opcode.INC_A],
            [0x5B, Opcode.PUSH_A],
            [0x5C, Opcode.MOV_B_IMM],
            [0x5D, 14],
            [0x5E, Opcode.SUB],
            [0x5F, Opcode.POP_A],
            [0x60, Opcode.JNZ],
            [0x61, low16(MEMORY_MAP.PROGRAM_START + 0x4D as u16)],  // LOOP_DROIT
            [0x62, high16(MEMORY_MAP.PROGRAM_START + 0x4D as u16)], // LOOP_DROIT

            [0x63, Opcode.SYSCALL],
            [0x64, 0],
        ] as [u16, u8][]),
    },

}





