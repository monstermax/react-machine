
import { Opcode } from "@/lib/instructions";
import { MEMORY_MAP } from "@/lib/memory_map";

import type { u8 } from "@/types/cpu.types";


export const programs = {
    interrupt_demo: {
        name: "Interrupt Demo",
        description: "Timer avec interruption toutes les 10ms",
        code: new Map([
            // Setup
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF], [0x02, 0xFE], // SP = 0xFEFF

            // Configurer handler d'interruption
            [0x03, Opcode.R_LOAD_A],
            [0x04, 0x50], // Handler à 0x0050
            [0x05, Opcode.M_STORE_A],
            [0x06, MEMORY_MAP.INTERRUPT_HANDLER & 0xFF],
            [0x07, (MEMORY_MAP.INTERRUPT_HANDLER >> 8) & 0xFF],

            // Activer IRQ 0 (Timer)
            [0x08, Opcode.R_LOAD_A],
            [0x09, 0b00000001], // Activer IRQ 0 seulement
            [0x0A, Opcode.M_STORE_A],
            [0x0B, MEMORY_MAP.INTERRUPT_ENABLE & 0xFF],
            [0x0C, (MEMORY_MAP.INTERRUPT_ENABLE >> 8) & 0xFF],

            // Activer interruptions globales
            [0x0D, Opcode.EI],

            // Boucle principale
            [0x0E, Opcode.R_LOAD_A],
            [0x0F, 0x00],
            [0x10, Opcode.INC_A],
            [0x11, Opcode.JMP],
            [0x12, 0x0E], [0x13, 0x00], // Boucle infinie

            // ===== HANDLER D'INTERRUPTION (0x0050) =====
            // Sauvegarder A
            [0x50, Opcode.PUSH_A],

            // Faire quelque chose (ex: incrémenter un compteur)
            [0x51, Opcode.R_LOAD_A],
            [0x52, 0x80], // Adresse compteur
            [0x53, Opcode.M_LOAD_A],
            [0x54, 0x80], [0x55, 0x00],
            [0x56, Opcode.INC_A],
            [0x57, Opcode.M_STORE_A],
            [0x58, 0x80], [0x59, 0x00],

            // Restaurer A
            [0x5A, Opcode.POP_A],

            // Retour d'interruption
            [0x5B, Opcode.IRET],
        ] as [u8, u8][]),
        expectedResult: "Compteur incrémenté par interruption timer"
    },
    timer_demo: {
        name: "Timer Interrupt Test",
        description: "Test des interruptions timer - handler à 0x0240",
        code: new Map([
            // === SETUP (0x00-0x02) ===
            // Initialiser Stack Pointer
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF],
            [0x02, 0xFE], // SP = 0xFEFF

            // === CONFIGURER HANDLER (0x03-0x09) ===
            // Écrire l'adresse du handler (0x0240) dans INTERRUPT_HANDLER
            [0x03, Opcode.R_LOAD_A],
            [0x04, 0x40], // Low byte du handler
            [0x05, Opcode.M_STORE_A],
            [0x06, 0x44], // INTERRUPT_HANDLER low (0xFF44)
            [0x07, 0xFF],

            [0x08, Opcode.R_LOAD_A],
            [0x09, 0x02], // High byte du handler
            [0x0A, Opcode.M_STORE_A],
            [0x0B, 0x45], // INTERRUPT_HANDLER high (0xFF45)
            [0x0C, 0xFF],

            // === CONFIGURER TIMER (0x0D-0x15) ===
            // Configurer la période du timer (10 cycles)
            [0x0D, Opcode.R_LOAD_A],
            [0x0E, 10], // Période = 10 cycles
            [0x0F, Opcode.M_STORE_A],
            [0x10, 0x21], // TIMER_PERIOD (0xFF21)
            [0x11, 0xFF],

            // Activer le timer
            [0x12, Opcode.R_LOAD_A],
            [0x13, 0x01], // 0x01 = activer
            [0x14, Opcode.M_STORE_A],
            [0x15, 0x22], // TIMER_CONTROL (0xFF22)
            [0x16, 0xFF],

            // === CONFIGURER INTERRUPT CONTROLLER (0x17-0x1C) ===
            // Activer IRQ 0 (Timer)
            [0x17, Opcode.R_LOAD_A],
            [0x18, 0b00000001], // Activer seulement IRQ 0
            [0x19, Opcode.M_STORE_A],
            [0x1A, 0x40], // INTERRUPT_ENABLE (0xFF40)
            [0x1B, 0xFF],

            // === ACTIVER INTERRUPTIONS GLOBALES (0x1C) ===
            [0x1C, Opcode.EI],

            // === BOUCLE PRINCIPALE (0x1D-0x21) ===
            // Boucle infinie qui incrémente A
            [0x1D, Opcode.R_LOAD_A],
            [0x1E, 0x00], // A = 0

            // LOOP:
            [0x1F, Opcode.INC_A],
            [0x20, Opcode.M_STORE_A], // Sauvegarder A à 0x8000
            [0x21, 0x00],
            [0x22, 0x80],

            [0x23, Opcode.JMP], // Boucle infinie
            [0x24, 0x1F],
            [0x25, 0x02], // Jump à 0x021F

            // === HANDLER D'INTERRUPTION (0x40 = offset depuis PROGRAM_START) ===
            // Sauvegarder A et B
            [0x40, Opcode.PUSH_A],
            [0x41, Opcode.PUSH_B],

            // Incrémenter compteur d'interruptions à 0x8010
            [0x42, Opcode.M_LOAD_A],
            [0x43, 0x10], // Adresse 0x8010
            [0x44, 0x80],

            [0x45, Opcode.INC_A],

            [0x46, Opcode.M_STORE_A],
            [0x47, 0x10], // Sauvegarder à 0x8010
            [0x48, 0x80],

            // Écrire le compteur dans les LEDs pour visualisation
            [0x49, Opcode.M_STORE_A],
            [0x4A, 0x30], // LEDS_OUTPUT (0xFF30)
            [0x4B, 0xFF],

            // Acquitter l'interruption IRQ 0
            [0x4C, Opcode.R_LOAD_A],
            [0x4D, 0x00], // IRQ 0
            [0x4E, Opcode.M_STORE_A],
            [0x4F, 0x42], // INTERRUPT_ACK (0xFF42)
            [0x50, 0xFF],

            // Restaurer registres
            [0x51, Opcode.POP_B],
            [0x52, Opcode.POP_A],

            // Retour d'interruption
            [0x53, Opcode.IRET],
        ] as [u8, u8][]),
        expectedResult: "LEDs comptent les interruptions timer"
    },
}

