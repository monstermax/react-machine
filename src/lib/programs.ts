
import { Opcode } from "./instructions";

import type { ProgramInfo } from "@/types/cpu.types";
import { MEMORY_MAP } from "./memory_map";


export const programs: Record<string, ProgramInfo> = {
    add_5_3: {
        name: "Addition Simple",
        description: "Calculate 5 + 3",
        code: new Map([
            [0x00, Opcode.R_LOAD_A],
            [0x01, 5],
            [0x02, Opcode.R_LOAD_B],
            [0x03, 3],
            [0x04, Opcode.ADD],
            [0x05, Opcode.SYSCALL],
            [0x06, 0],               // ← Syscall 0 = exit
        ]),
        expectedResult: "A = 8"
    },
    add_10_25: {
        name: "Addition Grande",
        description: "Calculate 10 + 25",
        code: new Map([
            [0x00, Opcode.R_LOAD_A],
            [0x01, 10],
            [0x02, Opcode.R_LOAD_B],
            [0x03, 25],
            [0x04, Opcode.ADD],
            [0x05, Opcode.SYSCALL],
            [0x06, 0],               // ← Syscall 0 = exit
        ]),
        expectedResult: "A = 35"
    },
    double_addition: {
        name: "Double Addition",
        description: "Calculate (5 + 3) + 10",
        code: new Map([
            [0x00, Opcode.R_LOAD_A],
            [0x01, 5],
            [0x02, Opcode.R_LOAD_B],
            [0x03, 3],
            [0x04, Opcode.ADD],      // A = 8
            [0x05, Opcode.R_LOAD_B],
            [0x06, 10],
            [0x07, Opcode.ADD],      // A = 18
            [0x08, Opcode.SYSCALL],
            [0x09, 0],               // ← Syscall 0 = exit
        ]),
        expectedResult: "A = 18"
    },
    subtraction: {
        name: "Soustraction",
        description: "Calculate 10 - 3",
        code: new Map([
            [0x00, Opcode.R_LOAD_A],
            [0x01, 10],
            [0x02, Opcode.R_LOAD_B],
            [0x03, 3],
            [0x04, Opcode.SUB],
            [0x05, Opcode.SYSCALL],
            [0x06, 0],               // ← Syscall 0 = exit
        ]),
        expectedResult: "A = 7"
    },
    logical_ops: {
        name: "Opérations Logiques",
        description: "AND, OR, XOR: 0b1100 & 0b1010",
        code: new Map([
            [0x00, Opcode.R_LOAD_A],
            [0x01, 0b1100],  // 12
            [0x02, Opcode.R_LOAD_B],
            [0x03, 0b1010],  // 10
            [0x04, Opcode.AND],
            [0x05, Opcode.SYSCALL],
            [0x06, 0],               // ← Syscall 0 = exit
        ]),
        expectedResult: "A = 8 (0b1000)"
    },
    increment_loop: {
        name: "Boucle d'Incrémentation",
        description: "Count from 0 to 5",
        code: new Map([
            // Initialiser A = 0
            [0x00, Opcode.R_LOAD_A],
            [0x01, 0],

            // LOOP (0x02):
            [0x02, Opcode.INC_A],      // A++

            // Comparer avec 5
            [0x03, Opcode.R_LOAD_B],
            [0x04, 5],
            [0x05, Opcode.SUB],        // A = A - 5

            // Si A != 0 (pas encore 5), continuer
            [0x06, Opcode.JNZ],
            [0x07, 0x00],              // Low byte (retour à 0x0200)
            [0x08, 0x02],              // High byte

            // A = 5, terminé
            [0x09, Opcode.R_LOAD_A],
            [0x0A, 5],                 // Restaurer A = 5 (car SUB l'a mis à 0)
            [0x0B, Opcode.SYSCALL],
            [0x0C, 0],
        ]),
        expectedResult: "A = 5"
    },
    memory_ops: {
        name: "Opérations Mémoire",
        description: "Store 42 at address 0x80, then load it",
        code: new Map([
            [0x00, Opcode.R_LOAD_A],
            [0x01, 42],
            [0x02, Opcode.M_STORE_A],
            [0x03, 0x80],       // Low byte
            [0x04, 0x00],       // High byte (0x0080)
            [0x05, Opcode.R_LOAD_A],
            [0x06, 0],
            [0x07, Opcode.M_LOAD_A],
            [0x08, 0x80],       // Low byte
            [0x09, 0x00],       // High byte (0x0080)
            [0x0A, Opcode.SYSCALL],
            [0x0B, 0],               // ← Syscall 0 = exit
        ]),
        expectedResult: "A = 42, Memory[0x80] = 42"
    },
    conditional_jump: {
        name: "Saut Conditionnel",
        description: "If A == 0, skip increment",
        code: new Map([
            [0x00, Opcode.R_LOAD_A],
            [0x01, 0],          // A = 0
            [0x02, Opcode.JZ],      // If zero, jump
            [0x03, 0x06],       // Jump to LOAD_A 100
            [0x04, Opcode.INC_A],   // This will be skipped
            [0x05, Opcode.HALT],
            [0x06, Opcode.R_LOAD_A],
            [0x07, 100],        // A = 100
            [0x08, Opcode.SYSCALL],
            [0x09, 0],               // ← Syscall 0 = exit
        ]),
        expectedResult: "A = 100"
    },
    overflow_test: {
        name: "Overflow Test",
        description: "Test 8-bit overflow: 200 + 100",
        code: new Map([
            [0x00, Opcode.R_LOAD_A],
            [0x01, 200],
            [0x02, Opcode.R_LOAD_B],
            [0x03, 100],
            [0x04, Opcode.ADD],
            [0x05, Opcode.SYSCALL],
            [0x06, 0],               // ← Syscall 0 = exit
        ]),
        expectedResult: "A = 44 (overflow), Carry flag = 1"
    },
    blink_leds: {
        name: "LED Blinker",
        description: "Fait clignoter les LEDs en compteur binaire",
        code: new Map([
            [0x00, Opcode.R_LOAD_A],
            [0x01, 0x00],

            // Loop
            [0x02, Opcode.M_STORE_A],
            [0x03, 0x30],  // Low byte
            [0x04, 0xFF],  // High byte (0xFF30)

            [0x05, Opcode.INC_A],
            [0x06, Opcode.JMP],
            [0x07, 0x02],  // Low
            [0x08, 0x02],  // High (0x0202 = PROGRAM_START + 0x02)
        ]),
        expectedResult: "LEDs qui comptent en binaire de 0 à 255"
    },
    seven_segments: {
        name: "7-Segment Counter",
        description: "Compte de 0 à F sur l'afficheur 7 segments",
        code: new Map([
            [0x00, Opcode.R_LOAD_A],
            [0x01, 0x00],

            // Boucle principale
            [0x02, Opcode.M_STORE_A],
            [0x03, 0x60], [0x04, 0xFF],  // 0xFF60

            [0x05, Opcode.R_LOAD_B],
            [0x06, 0x10],

            // Délai
            [0x07, Opcode.DEC_B],
            [0x08, Opcode.JNZ],
            [0x09, 0x07], [0x0A, 0x02],  // 0x0207

            [0x0B, Opcode.INC_A],
            [0x0C, Opcode.R_LOAD_B],
            [0x0D, 0x0F],
            [0x0E, Opcode.AND],          // A = A & 0x0F
            [0x0F, Opcode.JMP],
            [0x10, 0x02],  // Low
            [0x11, 0x02],  // High (0x0202 = PROGRAM_START + 0x02)
        ]),
        expectedResult: "Compteur 0→F qui boucle"
    },
    stack_demo: {
        name: "Stack Demo",
        description: "Démontre CALL/RET avec pile",
        code: new Map([
            // Initialiser SP
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF],
            [0x02, 0xFE], // SP = 0xFEFF (haut de pile)

            // Appeler sous-routine
            [0x03, Opcode.CALL],
            [0x04, 0x10],
            [0x05, 0x02], // Appeler à 0x0010 // (0x0210 = PROGRAM_START + 0x10)

            // Retour ici après RET
            [0x06, Opcode.SYSCALL],
            [0x07, 0],               // ← Syscall 0 = exit

            // ===== SOUS-ROUTINE (adresse 0x0010) =====
            // Sauvegarder A sur la pile
            [0x10, Opcode.PUSH_A],

            // Faire un calcul
            [0x11, Opcode.R_LOAD_A],
            [0x12, 0x42],

            // Restaurer A depuis la pile
            [0x13, Opcode.POP_A],

            // Retour à l'appelant
            [0x14, Opcode.RET],
        ]),
        expectedResult: "SP décrémenté/incrementé, PC sauvegardé/restauré"
    },
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
        ]),
        expectedResult: "Compteur incrémenté par interruption timer"
    },
    timer_demo: {
        name: "Interrupt Test",
        description: "Timer avec interruptions toutes les 10 cycles",
        code: new Map([
            // Setup
            [0x00, Opcode.SET_SP],
            [0x01, 0xFF], [0x02, 0xFE], // SP = 0xFEFF

            // Configurer l'interrupt controller
            [0x03, Opcode.R_LOAD_A],
            [0x04, 0b00000001], // Activer seulement IRQ 0 (Timer)
            [0x05, Opcode.M_STORE_A],
            [0x06, MEMORY_MAP.INTERRUPT_ENABLE & 0xFF],
            [0x07, (MEMORY_MAP.INTERRUPT_ENABLE >> 8) & 0xFF],

            // Configurer le timer
            [0x08, Opcode.R_LOAD_A],
            [0x09, 10], // Période = 10 cycles
            [0x0A, Opcode.M_STORE_A],
            [0x0B, (MEMORY_MAP.TIMER_BASE + 0x01) & 0xFF], // TIMER_PERIOD
            [0x0C, (MEMORY_MAP.TIMER_BASE + 0x01) >> 8],

            [0x0D, Opcode.R_LOAD_A],
            [0x0E, 0x01], // Activer timer
            [0x0F, Opcode.M_STORE_A],
            [0x10, (MEMORY_MAP.TIMER_BASE + 0x02) & 0xFF], // TIMER_CONTROL
            [0x11, (MEMORY_MAP.TIMER_BASE + 0x02) >> 8],

            // Activer interruptions globales
            [0x12, Opcode.EI],

            // Boucle principale (compteur)
            [0x13, Opcode.R_LOAD_A],
            [0x14, 0x00], // A = compteur
            [0x15, Opcode.INC_A],
            [0x16, Opcode.JMP],
            [0x17, 0x13], [0x18, 0x00], // Boucle infinie

            // ===== HANDLER D'INTERRUPTION (0x0040) =====
            // Sauvegarder registres
            [0x40, Opcode.PUSH_A],
            [0x41, Opcode.PUSH_B],

            // Incrémenter compteur d'interruptions
            [0x42, Opcode.R_LOAD_A],
            [0x43, 0x80], // Adresse compteur
            [0x44, Opcode.M_LOAD_A],
            [0x45, 0x80], [0x46, 0x00],
            [0x47, Opcode.INC_A],
            [0x48, Opcode.M_STORE_A],
            [0x49, 0x80], [0x4A, 0x00],

            // Acquitter l'interruption (optionnel)
            [0x4B, Opcode.R_LOAD_A],
            [0x4C, 0x00], // IRQ 0
            [0x4D, Opcode.M_STORE_A],
            [0x4E, MEMORY_MAP.INTERRUPT_ACK & 0xFF],
            [0x4F, (MEMORY_MAP.INTERRUPT_ACK >> 8) & 0xFF],

            // Restaurer registres
            [0x50, Opcode.POP_B],
            [0x51, Opcode.POP_A],

            // Retour
            [0x52, Opcode.IRET],
        ]),
        expectedResult: "Compteur à 0x0080 incrémenté par interruptions timer"
    },
    four_registers: {
        name: "4 Registers Demo",
        description: "Utilise les 4 registres A, B, C, D avec instructions valides",
        code: new Map([
            // ===== PHASE 1: Initialiser les 4 registres =====
            [0x00, Opcode.R_LOAD_A],
            [0x01, 0x01], // A = 1

            [0x02, Opcode.R_LOAD_B],
            [0x03, 0x02], // B = 2

            [0x04, Opcode.R_LOAD_C],
            [0x05, 0x03], // C = 3

            [0x06, Opcode.R_LOAD_D],
            [0x07, 0x04], // D = 4

            // ===== PHASE 2: Calcul A = A + B + C + D =====
            // Étape 1: A = A + B (1 + 2 = 3)
            [0x08, Opcode.ADD],     // A = A + B = 3

            // Étape 2: Sauvegarder A temporairement sur la pile
            [0x09, Opcode.PUSH_A],  // Empile A (3)

            // Étape 3: Mettre C dans A pour l'addition avec D
            // Problème: pas d'instruction MOVE C→A directement
            // Solution: utiliser la mémoire ou la pile

            // Option A: Via la pile (plus simple)
            [0x0A, Opcode.PUSH_C],  // Empile C (3)
            [0x0B, Opcode.POP_A],   // Dépile dans A → A = 3

            // Étape 4: A = A + D (C + D = 3 + 4 = 7)
            [0x0C, Opcode.ADD],     // A = A + D = 7

            // Étape 5: Restaurer l'ancien A depuis la pile
            [0x0D, Opcode.POP_B],   // Dépile dans B → B = 3 (ancien A)

            // Étape 6: A = A + B (7 + 3 = 10)
            [0x0E, Opcode.ADD],     // A = A + B = 10

            // ===== PHASE 3: Sauvegarder résultat =====
            // Sauvegarder A en mémoire à l'adresse 0x8000
            [0x0F, Opcode.M_STORE_A],
            [0x10, 0x00], [0x11, 0x80], // Adresse 0x8000

            [0x12, Opcode.HALT],
        ]),
        expectedResult: "A = 10 (1+2+3+4), stocké à 0x8000, B=3, C=3, D=4"
    },
};



/*

// Programme: écho clavier
LOOP:
  LOAD_MEM [KEYBOARD_STATUS]  // Touche dispo ?
  JZ LOOP
  LOAD_MEM [KEYBOARD_DATA]    // Lire touche
  STORE [CONSOLE_CHAR]        // Afficher
  JMP LOOP


// Jouer une mélodie
FOR each note:
  LOAD_A frequency
  STORE [BUZZER_FREQ]
  LOAD_A 100  // 100ms
  STORE [BUZZER_DURATION]


*/


