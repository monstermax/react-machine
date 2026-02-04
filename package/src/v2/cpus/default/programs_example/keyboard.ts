
import { Opcode } from "@/v2/cpus/default/cpu_instructions";
import { MEMORY_MAP } from "@/v2/lib/memory_map_16x8_bits";

import type { ProgramInfo, u16, u8 } from "@/types/cpu.types";
import { high16, low16, U16 } from "@/v2/lib/integers";


export const programs: Record<string, ProgramInfo> = {
    keyboard_echo: {
        name: "Keyboard Echo",
        description: "Echo clavier vers console (sans interruption)",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.MOV_A_B],
            [0x01, Opcode.MOV_A_B],
            [0x02, Opcode.MOV_A_B],

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
        ] as [u16, u8][]),
    },

    keyboard_interrupt: {
        name: "Keyboard Interrupt Demo",
        description: "Echo clavier via interruptions",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.MOV_A_B],
            [0x01, Opcode.MOV_A_B],
            [0x02, Opcode.MOV_A_B],

            // Handler @ 0x40
            [0x03, Opcode.MOV_A_IMM],
            [0x04, low16(U16(MEMORY_MAP.PROGRAM_START + 0x40))],
            [0x05, Opcode.MOV_MEM_A],
            [0x06, low16 (MEMORY_MAP.INTERRUPT_HANDLER_LOW)], // INTERRUPT_HANDLER_LOW
            [0x07, high16(MEMORY_MAP.INTERRUPT_HANDLER_LOW)], // INTERRUPT_HANDLER_LOW
            [0x08, Opcode.MOV_A_IMM],
            [0x09, high16(U16(MEMORY_MAP.PROGRAM_START + 0x40))],
            [0x0A, Opcode.MOV_MEM_A],
            [0x0B, low16 (MEMORY_MAP.INTERRUPT_HANDLER_HIGH)], // INTERRUPT_HANDLER_HIGH
            [0x0C, high16(MEMORY_MAP.INTERRUPT_HANDLER_HIGH)], // INTERRUPT_HANDLER_HIGH

            // Activer IRQ keyboard (bit 1)
            [0x0D, Opcode.MOV_A_IMM],
            [0x0E, 0x02],
            [0x0F, Opcode.MOV_MEM_A],
            [0x10, low16 (MEMORY_MAP.KEYBOARD_STATUS)], // KEYBOARD_STATUS
            [0x11, high16(MEMORY_MAP.KEYBOARD_STATUS)], // KEYBOARD_STATUS

            // Activer IRQ 1 dans interrupt controller
            [0x12, Opcode.MOV_A_IMM],
            [0x13, 0b00000010], // bit #1 for keyboard
            [0x14, Opcode.MOV_MEM_A],
            [0x15, low16 (MEMORY_MAP.INTERRUPT_ENABLE)], // INTERRUPT_ENABLE
            [0x16, high16(MEMORY_MAP.INTERRUPT_ENABLE)], // INTERRUPT_ENABLE

            // EI
            [0x17, Opcode.EI],

            // Main loop
            [0x18, Opcode.NOP],
            [0x19, Opcode.JMP],
            [0x1A, low16 (U16(MEMORY_MAP.PROGRAM_START + 0x18))],
            [0x1B, high16(U16(MEMORY_MAP.PROGRAM_START + 0x18))],

            // === HANDLER @ 0x40 ===
            [0x40, Opcode.PUSH_A], // Sauvegarder A seulement

            // Lire caractère
            [0x41, Opcode.MOV_A_MEM],
            [0x42, low16 (MEMORY_MAP.KEYBOARD_DATA)], // KEYBOARD_DATA
            [0x43, high16(MEMORY_MAP.KEYBOARD_DATA)], // KEYBOARD_DATA

            // Écrire dans console
            [0x44, Opcode.MOV_MEM_A],
            [0x45, low16 (MEMORY_MAP.CONSOLE_CHAR)], // CONSOLE_CHAR
            [0x46, high16(MEMORY_MAP.CONSOLE_CHAR)], // CONSOLE_CHAR

            // Clear keyboard status, garder IRQ enabled
            [0x47, Opcode.MOV_A_IMM],
            [0x48, 0x02],
            [0x49, Opcode.MOV_MEM_A],
            [0x4A, low16 (MEMORY_MAP.KEYBOARD_STATUS)], // KEYBOARD_STATUS
            [0x4B, high16(MEMORY_MAP.KEYBOARD_STATUS)], // KEYBOARD_STATUS

            // ACK IRQ 1
            [0x4C, Opcode.MOV_A_IMM],
            [0x4D, 0x01],
            [0x4E, Opcode.MOV_MEM_A],
            [0x4F, low16 (MEMORY_MAP.INTERRUPT_ACK)], // INTERRUPT_ACK
            [0x50, high16(MEMORY_MAP.INTERRUPT_ACK)], // INTERRUPT_ACK

            [0x51, Opcode.POP_A], // Restaurer A
            [0x52, Opcode.IRET],
        ] as [u16, u8][]),
    },
};

