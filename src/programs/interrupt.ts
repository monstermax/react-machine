
import { Opcode } from "@/lib/instructions";
import { MEMORY_MAP } from "@/lib/memory_map";

import type { u8 } from "@/types/cpu.types";


export const programs = {
    timer_01: {
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
    timer_02: {
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
    timer_03: {
        name: "Interrupt Debug",
        description: "Test basique timer interrupt - compte dans LEDs",
        code: new Map([
            // Setup SP
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF], [0x02, 0xFE],

            // Handler @ 0x0240 (PROGRAM_START + 0x40)
            [0x03, Opcode.R_LOAD_A], [0x04, 0x40],
            [0x05, Opcode.M_STORE_A], [0x06, 0x44], [0x07, 0xFF],
            [0x08, Opcode.R_LOAD_A], [0x09, 0x02],
            [0x0A, Opcode.M_STORE_A], [0x0B, 0x45], [0x0C, 0xFF],

            // Timer: period=10
            [0x0D, Opcode.R_LOAD_A], [0x0E, 10],
            [0x0F, Opcode.M_STORE_A], [0x10, 0x21], [0x11, 0xFF],

            // Timer: enable
            [0x12, Opcode.R_LOAD_A], [0x13, 0x01],
            [0x14, Opcode.M_STORE_A], [0x15, 0x22], [0x16, 0xFF],

            // Enable IRQ 0
            [0x17, Opcode.R_LOAD_A], [0x18, 0x01],
            [0x19, Opcode.M_STORE_A], [0x1A, 0x40], [0x1B, 0xFF],

            // EI
            [0x1C, Opcode.EI],

            // Wait loop (attendre l'interrupt)
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

            // Après interrupt, on arrive ici
            [0x27, Opcode.HALT],

            // === HANDLER @ offset 0x40 (adresse absolue 0x0240) ===
            [0x40, Opcode.PUSH_A],

            // Mettre 0xFF dans LEDs
            [0x41, Opcode.R_LOAD_A],
            [0x42, 0xFF],
            [0x43, Opcode.M_STORE_A],
            [0x44, 0x30], [0x45, 0xFF], // LEDS_OUTPUT

            // ACK IRQ 0
            [0x46, Opcode.R_LOAD_A],
            [0x47, 0x00], // IRQ 0
            [0x48, Opcode.M_STORE_A],
            [0x49, 0x42], [0x4A, 0xFF], // INTERRUPT_ACK

            [0x4B, Opcode.POP_A],
            [0x4C, Opcode.IRET],
        ] as [u8, u8][]),
        expectedResult: "LEDs comptent rapidement, logs montrent IRQ acknowledged"
    },
    timer_04: {
        name: "Interrupt Minimal",
        description: "Une seule interrupt timer, puis halt",
        code: new Map([
            // === SETUP ===
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF], [0x02, 0xFE],

            // Handler @ 0x0250
            [0x03, Opcode.R_LOAD_A], [0x04, 0x50],   // Low byte
            [0x05, Opcode.M_STORE_A], [0x06, 0x44], [0x07, 0xFF], // 0xFF44
            [0x08, Opcode.R_LOAD_A], [0x09, 0x02],   // High byte
            [0x0A, Opcode.M_STORE_A], [0x0B, 0x45], [0x0C, 0xFF], // 0xFF45

            // Timer period = 10 (écrit à 0xFF22)
            [0x0D, Opcode.R_LOAD_A], [0x0E, 10],
            [0x0F, Opcode.M_STORE_A], [0x10, 0x22], [0x11, 0xFF], // 0xFF22

            // Timer enable + reset (écrit à 0xFF21)
            [0x12, Opcode.R_LOAD_A], [0x13, 0x03], // Bit 0=enable, Bit 1=reset
            [0x14, Opcode.M_STORE_A], [0x15, 0x21], [0x16, 0xFF], // 0xFF21

            // Enable IRQ 0 (écrit à 0xFF40)
            [0x17, Opcode.R_LOAD_A], [0x18, 0x01],
            [0x19, Opcode.M_STORE_A], [0x1A, 0x40], [0x1B, 0xFF], // 0xFF40

            // EI
            [0x1C, Opcode.EI],

            // === MAIN LOOP ===
            [0x1D, Opcode.NOP],
            [0x1E, Opcode.JMP],
            [0x1F, 0x1D], [0x20, 0x02],

            // === HANDLER @ 0x0250 ===
            [0x50, Opcode.PUSH_A],
            [0x51, Opcode.PUSH_B],

            // Charger compteur depuis 0x8000
            [0x52, Opcode.M_LOAD_A],
            [0x53, 0x00], [0x54, 0x80],

            // Incrémenter
            [0x55, Opcode.INC_A],

            // Sauvegarder compteur
            [0x56, Opcode.M_STORE_A],
            [0x57, 0x00], [0x58, 0x80],

            // Afficher dans LEDs
            [0x59, Opcode.M_STORE_A],
            [0x5A, 0x30], [0x5B, 0xFF],

            // ACK IRQ 0
            [0x5C, Opcode.R_LOAD_A], [0x5D, 0x00],
            [0x5E, Opcode.M_STORE_A],
            [0x5F, 0x42], [0x60, 0xFF],

            [0x61, Opcode.POP_B],
            [0x62, Opcode.POP_A],
            [0x63, Opcode.IRET],
        ] as [u8, u8][]),
        expectedResult: "1 interrupt, LEDs = 0xFF, puis HALT"
    },
}

