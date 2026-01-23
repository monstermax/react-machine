
import { Opcode } from "@/v2/cpus/default/cpu_instructions";
import { high16, low16 } from "@/v2/lib/integers";
import { MEMORY_MAP } from "@/v2/lib/memory_map_16x8_bits";

import type { ProgramInfo, u16, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    timer_01: {
        name: "Timer Interrupt",
        description: "Timer avec interruption - compte dans LEDs",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.SET_SP],
            [0x01, low16 (MEMORY_MAP.STACK_END)],
            [0x02, high16(MEMORY_MAP.STACK_END)], // SP = 0xFEFF

            // === Configurer INTERRUPT_HANDLER @ 0x1040 ===
            // Low byte (0x40)
            [0x03, Opcode.MOV_A_IMM],
            [0x04, 0x40],
            [0x05, Opcode.MOV_MEM_A],
            [0x06, low16 (MEMORY_MAP.INTERRUPT_HANDLER_LOW)],
            [0x07, high16(MEMORY_MAP.INTERRUPT_HANDLER_LOW)], // INTERRUPT_HANDLER_LOW (0xFF44)

            // High byte (0x10)
            [0x08, Opcode.MOV_A_IMM],
            [0x09, 0x10],
            [0x0A, Opcode.MOV_MEM_A],
            [0x0B, low16 (MEMORY_MAP.INTERRUPT_HANDLER_HIGH)],
            [0x0C, high16(MEMORY_MAP.INTERRUPT_HANDLER_HIGH)], // INTERRUPT_HANDLER_HIGH (0xFF45)

            // === Configurer TIMER ===
            // Period = 10 → TIMER_PRESCALER (0xFF22)
            [0x0D, Opcode.MOV_A_IMM],
            [0x0E, 10],
            [0x0F, Opcode.MOV_MEM_A],
            [0x10, low16 (MEMORY_MAP.TIMER_PRESCALER)],
            [0x11, high16(MEMORY_MAP.TIMER_PRESCALER)], // TIMER_PRESCALER (0xFF22)

            // === Activer IRQ 0 (Timer) ===
            [0x12, Opcode.MOV_A_IMM],
            [0x13, 0b00000001], // IRQ 0
            [0x14, Opcode.MOV_MEM_A],
            [0x15, low16 (MEMORY_MAP.INTERRUPT_ENABLE)],
            [0x16, high16(MEMORY_MAP.INTERRUPT_ENABLE)], // INTERRUPT_ENABLE (0xFF40)

            // Enable timer → TIMER_CONTROL (0xFF21)
            [0x17, Opcode.MOV_A_IMM],
            [0x18, 0x03], // Enable + reset
            [0x19, Opcode.MOV_MEM_A],
            [0x1A, low16 (MEMORY_MAP.TIMER_CONTROL)],
            [0x1B, high16(MEMORY_MAP.TIMER_CONTROL)], // TIMER_CONTROL (0xFF21)

            // === Enable Interrupts ===
            [0x1C, Opcode.EI],

            // === Main loop ===
            [0x1D, Opcode.NOP],
            [0x1E, Opcode.JMP],
            [0x1F, 0x1D],
            [0x20, 0x10], // Loop à 0x101D

            // === HANDLER @ offset 0x40 (adresse 0x1040) ===
            [0x40, Opcode.PUSH_A],

            // Lire compteur @ 0x8000
            [0x41, Opcode.MOV_A_MEM],
            [0x42, 0x00],
            [0x43, 0x80],

            // Incrémenter
            [0x44, Opcode.INC_A],

            // Sauvegarder compteur
            [0x45, Opcode.MOV_MEM_A],
            [0x46, 0x00],
            [0x47, 0x80],

            // Afficher dans LEDs
            [0x48, Opcode.MOV_MEM_A],
            [0x49, low16 (MEMORY_MAP.LEDS_OUTPUT)],
            [0x4A, high16(MEMORY_MAP.LEDS_OUTPUT)], // LEDS_OUTPUT (0xFF30)

            // ACK IRQ 0
            [0x4B, Opcode.MOV_A_IMM],
            [0x4C, 0x00], // IRQ 0
            [0x4D, Opcode.MOV_MEM_A],
            [0x4E, low16 (MEMORY_MAP.INTERRUPT_ACK)],
            [0x4F, high16(MEMORY_MAP.INTERRUPT_ACK)], // INTERRUPT_ACK (0xFF42)

            [0x50, Opcode.POP_A],
            [0x51, Opcode.IRET],
        ] as [u16, u8][]),
    },

    timer_02: {
        name: "Interrupt Minimal",
        description: "Une seule interrupt timer, puis halt",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF],
            [0x02, 0xFE],

            // Handler @ 0x1050
            [0x03, Opcode.MOV_A_IMM],
            [0x04, 0x50],
            [0x05, Opcode.MOV_MEM_A],
            [0x06, low16 (MEMORY_MAP.INTERRUPT_HANDLER_LOW)],
            [0x07, high16(MEMORY_MAP.INTERRUPT_HANDLER_LOW)],
            [0x08, Opcode.MOV_A_IMM],
            [0x09, 0x10],
            [0x0A, Opcode.MOV_MEM_A],
            [0x0B, low16 (MEMORY_MAP.INTERRUPT_HANDLER_HIGH)],
            [0x0C, high16(MEMORY_MAP.INTERRUPT_HANDLER_HIGH)],

            // Timer period = 10
            [0x0D, Opcode.MOV_A_IMM],
            [0x0E, 10],
            [0x0F, Opcode.MOV_MEM_A],
            [0x10, low16 (MEMORY_MAP.TIMER_PRESCALER)],
            [0x11, high16(MEMORY_MAP.TIMER_PRESCALER)], // TIMER_PRESCALER

            // Timer enable
            [0x12, Opcode.MOV_A_IMM],
            [0x13, 0x01],
            [0x14, Opcode.MOV_MEM_A],
            [0x15, low16 (MEMORY_MAP.TIMER_CONTROL)],
            [0x16, high16(MEMORY_MAP.TIMER_CONTROL)], // TIMER_CONTROL

            // Enable IRQ 0 (Timer)
            [0x17, Opcode.MOV_A_IMM],
            [0x18, 0x01],
            [0x19, Opcode.MOV_MEM_A],
            [0x1A, low16 (MEMORY_MAP.INTERRUPT_ENABLE)],
            [0x1B, high16(MEMORY_MAP.INTERRUPT_ENABLE)],

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
            [0x51, Opcode.MOV_A_IMM],
            [0x52, 0xFF],
            [0x53, Opcode.MOV_MEM_A],
            [0x54, low16(MEMORY_MAP.LEDS_OUTPUT)],
            [0x55, high16(MEMORY_MAP.LEDS_OUTPUT)], // LEDS_OUTPUT

            // Désactiver le timer pour éviter une 2ème interrupt
            [0x56, Opcode.MOV_A_IMM],
            [0x57, 0x00], // Timer OFF
            [0x58, Opcode.MOV_MEM_A],
            [0x59, low16(MEMORY_MAP.TIMER_CONTROL)],
            [0x5A, high16(MEMORY_MAP.TIMER_CONTROL)], // TIMER_CONTROL

            // ACK IRQ 0
            [0x5B, Opcode.MOV_A_IMM],
            [0x5C, 0x00],
            [0x5D, Opcode.MOV_MEM_A],
            [0x5E, low16(MEMORY_MAP.INTERRUPT_ACK)],
            [0x5F, high16(MEMORY_MAP.INTERRUPT_ACK)], // INTERRUPT_ACK

            // Disable IRQ 0 (Timer)
            [0x60, Opcode.MOV_A_IMM],
            [0x61, 0x00],
            [0x62, Opcode.MOV_MEM_A],
            [0x63, low16 (MEMORY_MAP.INTERRUPT_ENABLE)],
            [0x64, high16(MEMORY_MAP.INTERRUPT_ENABLE)],

            [0x65, Opcode.POP_A],
            [0x66, Opcode.IRET], // Retourne à 0x0229 (le HALT)
        ] as [u16, u8][]),
    },
}

