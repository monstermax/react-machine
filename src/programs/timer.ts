
import { Opcode } from "@/lib/instructions";
import { MEMORY_MAP } from "@/lib/memory_map";

import type { ProgramInfo, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    timer_01: {
        name: "Timer Interrupt",
        description: "Timer avec interruption - compte dans LEDs",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF], [0x02, 0xFE], // SP = 0xFEFF

            // === Configurer INTERRUPT_HANDLER @ 0x0240 ===
            // Low byte (0x40)
            [0x03, Opcode.MOV_A_IMM],
            [0x04, 0x40],
            [0x05, Opcode.MOV_MEM_A],
            [0x06, 0x44], [0x07, 0xFF], // INTERRUPT_HANDLER_LOW (0xFF44)

            // High byte (0x02)
            [0x08, Opcode.MOV_A_IMM],
            [0x09, 0x02],
            [0x0A, Opcode.MOV_MEM_A],
            [0x0B, 0x45], [0x0C, 0xFF], // INTERRUPT_HANDLER_HIGH (0xFF45)

            // === Configurer TIMER ===
            // Period = 10 → TIMER_PRESCALER (0xFF22)
            [0x0D, Opcode.MOV_A_IMM],
            [0x0E, 10],
            [0x0F, Opcode.MOV_MEM_A],
            [0x10, 0x22], [0x11, 0xFF], // TIMER_PRESCALER (0xFF22) ← CORRIGÉ !

            // === Activer IRQ 0 (Timer) ===
            [0x12, Opcode.MOV_A_IMM],
            [0x13, 0b00000001], // IRQ 0
            [0x14, Opcode.MOV_MEM_A],
            [0x15, 0x40], [0x16, 0xFF], // INTERRUPT_ENABLE (0xFF40)

            // Enable timer → TIMER_CONTROL (0xFF21)
            [0x17, Opcode.MOV_A_IMM],
            [0x18, 0x03], // Enable + reset
            [0x19, Opcode.MOV_MEM_A],
            [0x1A, 0x21], [0x1B, 0xFF], // TIMER_CONTROL (0xFF21)

            // === Enable Interrupts ===
            [0x1C, Opcode.EI],

            // === Main loop ===
            [0x1D, Opcode.NOP],
            [0x1E, Opcode.JMP],
            [0x1F, 0x1D], [0x20, 0x02], // Loop à 0x021D

            // === HANDLER @ offset 0x40 (adresse 0x0240) ===
            [0x40, Opcode.PUSH_A],

            // Lire compteur @ 0x8000
            [0x41, Opcode.MOV_A_MEM],
            [0x42, 0x00], [0x43, 0x80],

            // Incrémenter
            [0x44, Opcode.INC_A],

            // Sauvegarder compteur
            [0x45, Opcode.MOV_MEM_A],
            [0x46, 0x00], [0x47, 0x80],

            // Afficher dans LEDs
            [0x48, Opcode.MOV_MEM_A],
            [0x49, 0x30], [0x4A, 0xFF], // LEDS_OUTPUT (0xFF30)

            // ACK IRQ 0
            [0x4B, Opcode.MOV_A_IMM],
            [0x4C, 0x00], // IRQ 0
            [0x4D, Opcode.MOV_MEM_A],
            [0x4E, 0x42], [0x4F, 0xFF], // INTERRUPT_ACK (0xFF42)

            [0x50, Opcode.POP_A],
            [0x51, Opcode.IRET],
        ] as [u8, u8][]),
    },

    timer_02: {
        name: "Interrupt Minimal",
        description: "Une seule interrupt timer, puis halt",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF], [0x02, 0xFE],

            // Handler @ 0x0250
            [0x03, Opcode.MOV_A_IMM], [0x04, 0x50],
            [0x05, Opcode.MOV_MEM_A], [0x06, 0x44], [0x07, 0xFF],
            [0x08, Opcode.MOV_A_IMM], [0x09, 0x02],
            [0x0A, Opcode.MOV_MEM_A], [0x0B, 0x45], [0x0C, 0xFF],

            // Timer period = 10
            [0x0D, Opcode.MOV_A_IMM], [0x0E, 10],
            [0x0F, Opcode.MOV_MEM_A],
            [0x10, 0x22], [0x11, 0xFF], // TIMER_PRESCALER

            // Timer enable
            [0x12, Opcode.MOV_A_IMM], [0x13, 0x01],
            [0x14, Opcode.MOV_MEM_A],
            [0x15, 0x21], [0x16, 0xFF], // TIMER_CONTROL

            // Enable IRQ 0
            [0x17, Opcode.MOV_A_IMM], [0x18, 0x01],
            [0x19, Opcode.MOV_MEM_A], [0x1A, 0x40], [0x1B, 0xFF],

            // EI
            [0x1C, Opcode.EI],

            // === ATTENDRE L'INTERRUPT ===
            [0x1D, Opcode.NOP],
            [0x1E, Opcode.NOP],
            [0x1F, Opcode.NOP],
            [0x20, Opcode.NOP],
            [0x21, Opcode.NOP],
            [0x22, Opcode.NOP],
            [0x23, Opcode.NOP],
            [0x24, Opcode.NOP],
            [0x25, Opcode.NOP],
            [0x26, Opcode.NOP],
            [0x27, Opcode.NOP],
            [0x28, Opcode.NOP],

            // Après IRET, on arrive ici
            [0x29, Opcode.HALT], // ← HALT après l'interrupt !

            // === HANDLER @ 0x50 ===
            [0x50, Opcode.PUSH_A],

            // Mettre 0xFF dans LEDs
            [0x51, Opcode.MOV_A_IMM], [0x52, 0xFF],
            [0x53, Opcode.MOV_MEM_A],
            [0x54, 0x30], [0x55, 0xFF], // LEDS_OUTPUT

            // Désactiver le timer pour éviter une 2ème interrupt
            [0x56, Opcode.MOV_A_IMM], [0x57, 0x00], // Timer OFF
            [0x58, Opcode.MOV_MEM_A],
            [0x59, 0x21], [0x5A, 0xFF], // TIMER_CONTROL

            // ACK IRQ 0
            [0x5B, Opcode.MOV_A_IMM], [0x5C, 0x00],
            [0x5D, Opcode.MOV_MEM_A],
            [0x5E, 0x42], [0x5F, 0xFF], // INTERRUPT_ACK

            [0x60, Opcode.POP_A],
            [0x61, Opcode.IRET], // Retourne à 0x0229 (le HALT)
        ] as [u8, u8][]),
    },
}

