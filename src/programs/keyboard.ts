
import { Opcode } from "../lib/instructions";
import { MEMORY_MAP } from "../lib/memory_map";

import type { ProgramInfo, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    keyboard_echo: {
        name: "Keyboard Echo",
        description: "Echo clavier vers console - tape des caractères pour les voir !",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF],
            [0x02, 0xFE], // SP = 0xFEFF

            // === MAIN LOOP ===
            // Vérifier si une touche est disponible
            [0x03, Opcode.MOV_A_MEM],
            [0x04, 0x51], // KEYBOARD_STATUS (0xFF51)
            [0x05, 0xFF],

            // Si status = 0, boucler
            [0x06, Opcode.JZ],
            [0x07, 0x03],
            [0x08, 0x02], // Retour à 0x0203

            // Touche disponible - lire le caractère
            [0x09, Opcode.MOV_A_MEM],
            [0x0A, 0x50], // KEYBOARD_DATA (0xFF50)
            [0x0B, 0xFF],

            // Écrire le caractère dans la console
            [0x0C, Opcode.MOV_MEM_A],
            [0x0D, 0x70], // CONSOLE_CHAR (0xFF70)
            [0x0E, 0xFF],

            // Clear keyboard status
            [0x0F, Opcode.MOV_A_IMM],
            [0x10, 0x00],
            [0x11, Opcode.MOV_MEM_A],
            [0x12, 0x51], // KEYBOARD_STATUS (0xFF51)
            [0x13, 0xFF],

            // Retour au début de la boucle
            [0x14, Opcode.JMP],
            [0x15, 0x03],
            [0x16, 0x02],
        ] as [u8, u8][]),
        expectedResult: "Les caractères tapés s'affichent dans la console"
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
    keyboard_interrupt: {
        name: "Keyboard Interrupt Demo",
        description: "Utilise les interruptions clavier pour echo",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF],
            [0x02, 0xFE],

            // Configurer handler à 0x0240
            [0x03, Opcode.MOV_A_IMM],
            [0x04, 0x40],
            [0x05, Opcode.MOV_MEM_A],
            [0x06, 0x44], [0x07, 0xFF], // INTERRUPT_HANDLER low

            [0x08, Opcode.MOV_A_IMM],
            [0x09, 0x02],
            [0x0A, Opcode.MOV_MEM_A],
            [0x0B, 0x45], [0x0C, 0xFF], // INTERRUPT_HANDLER high

            // Activer IRQ 1 (Keyboard)
            [0x0D, Opcode.MOV_A_IMM],
            [0x0E, 0b00000010], // IRQ 1
            [0x0F, Opcode.MOV_MEM_A],
            [0x10, 0x40], [0x11, 0xFF], // INTERRUPT_ENABLE

            // Activer interruptions globales
            [0x12, Opcode.EI],

            // === MAIN LOOP ===
            [0x13, Opcode.NOP],
            [0x14, Opcode.JMP],
            [0x15, 0x13], [0x16, 0x02], // Boucle infinie

            // === INTERRUPT HANDLER (0x40) ===
            [0x40, Opcode.PUSH_A],

            // Lire caractère du clavier
            [0x41, Opcode.MOV_A_MEM],
            [0x42, 0x50], [0x43, 0xFF], // KEYBOARD_DATA

            // Écrire dans console
            [0x44, Opcode.MOV_MEM_A],
            [0x45, 0x70], [0x46, 0xFF], // CONSOLE_CHAR

            // Clear keyboard status
            [0x47, Opcode.MOV_A_IMM],
            [0x48, 0x00],
            [0x49, Opcode.MOV_MEM_A],
            [0x4A, 0x51], [0x4B, 0xFF], // KEYBOARD_STATUS

            // Acquitter IRQ 1
            [0x4C, Opcode.MOV_A_IMM],
            [0x4D, 0x01],
            [0x4E, Opcode.MOV_MEM_A],
            [0x4F, 0x42], [0x50, 0xFF], // INTERRUPT_ACK

            [0x51, Opcode.POP_A],
            [0x52, Opcode.IRET],
        ] as [u8, u8][]),
        expectedResult: "Echo clavier via interruptions"
    },
};

