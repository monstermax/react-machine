
import { Opcode } from "../lib/instructions";
import { MEMORY_MAP } from "../lib/memory_map";

import type { ProgramInfo, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    keyboard_echo: {
        name: "Keyboard Echo",
        description: "Echo clavier vers console (sans interruption)",
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
    },

    keyboard_interrupt: {
        name: "Keyboard Interrupt Demo",
        description: "Echo clavier via interruptions",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF], [0x02, 0xFE],

            // Handler @ 0x0240
            [0x03, Opcode.MOV_A_IMM], [0x04, 0x40],
            [0x05, Opcode.MOV_MEM_A], [0x06, 0x44], [0x07, 0xFF],
            [0x08, Opcode.MOV_A_IMM], [0x09, 0x02],
            [0x0A, Opcode.MOV_MEM_A], [0x0B, 0x45], [0x0C, 0xFF],

            // Activer IRQ keyboard (bit 1)
            [0x0D, Opcode.MOV_A_IMM], [0x0E, 0x02],
            [0x0F, Opcode.MOV_MEM_A], [0x10, 0x51], [0x11, 0xFF],

            // Activer IRQ 1 dans interrupt controller
            [0x12, Opcode.MOV_A_IMM], [0x13, 0b00000010],
            [0x14, Opcode.MOV_MEM_A], [0x15, 0x40], [0x16, 0xFF],

            // EI
            [0x17, Opcode.EI],

            // Main loop
            [0x18, Opcode.NOP],
            [0x19, Opcode.JMP], [0x1A, 0x18], [0x1B, 0x02],

            // === HANDLER @ 0x40 ===
            [0x40, Opcode.PUSH_A], // Sauvegarder A seulement

            // Lire caractère
            [0x41, Opcode.MOV_A_MEM],
            [0x42, 0x50], [0x43, 0xFF], // KEYBOARD_DATA

            // Écrire dans console
            [0x44, Opcode.MOV_MEM_A],
            [0x45, 0x70], [0x46, 0xFF], // CONSOLE_CHAR

            // Clear keyboard status, garder IRQ enabled
            [0x47, Opcode.MOV_A_IMM], [0x48, 0x02],
            [0x49, Opcode.MOV_MEM_A],
            [0x4A, 0x51], [0x4B, 0xFF], // KEYBOARD_STATUS

            // ACK IRQ 1
            [0x4C, Opcode.MOV_A_IMM], [0x4D, 0x01],
            [0x4E, Opcode.MOV_MEM_A],
            [0x4F, 0x42], [0x50, 0xFF], // INTERRUPT_ACK

            [0x51, Opcode.POP_A], // Restaurer A seulement
            [0x52, Opcode.IRET],
        ] as [u8, u8][]),
    },
};

