
import { Opcode } from "@/lib/instructions";

import type { ProgramInfo, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    four_registers: {
        name: "4 Registers Demo",
        description: "Utilise les 4 registres A, B, C, D avec instructions valides",
        code: new Map([
            // ===== PHASE 1: Initialiser les 4 registres =====
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 0x01], // A = 1

            [0x02, Opcode.MOV_B_IMM],
            [0x03, 0x02], // B = 2

            [0x04, Opcode.MOV_C_IMM],
            [0x05, 0x03], // C = 3

            [0x06, Opcode.MOV_D_IMM],
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
            [0x0F, Opcode.MOV_MEM_A],
            [0x10, 0x00], [0x11, 0x80], // Adresse 0x8000

            [0x12, Opcode.HALT],
        ] as [u8, u8][]),
        expectedResult: "A = 10 (1+2+3+4), stocké à 0x8000, B=3, C=3, D=4"
    },
};
