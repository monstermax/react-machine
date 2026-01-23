
import { Opcode } from "@/v2/cpus/default/cpu_instructions";

import type { ProgramInfo, u16, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    four_registers: {
        name: "4 Registers Demo - CORRIGÉ",
        description: "Utilise les 4 registres A, B, C, D",
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
            // Version SIMPLE avec MOV
            // Étape 1: A = A + B
            [0x08, Opcode.ADD],     // A = 1 + 2 = 3

            // Étape 2: Copier C dans B pour pouvoir l'ajouter à A
            [0x09, Opcode.MOV_CB],  // B = C = 3

            // Étape 3: A = A + B (A + C)
            [0x0A, Opcode.ADD],     // A = 3 + 3 = 6

            // Étape 4: Copier D dans B pour pouvoir l'ajouter à A
            [0x0B, Opcode.MOV_DB],  // B = D = 4

            // Étape 5: A = A + B (A + D)
            [0x0C, Opcode.ADD],     // A = 6 + 4 = 10 ✅

            // ===== PHASE 3: Sauvegarder résultat =====
            // Sauvegarder A en mémoire
            [0x0D, Opcode.MOV_MEM_A],
            [0x0E, 0x00], [0x0F, 0x80], // Adresse 0x8000

            [0x10, Opcode.HALT],
        ] as [u16, u8][]),
    },
};


