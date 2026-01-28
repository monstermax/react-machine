
import { Opcode } from "@/v2/cpus/default/cpu_instructions";
import { MEMORY_MAP } from "@/v2/lib/memory_map_16x8_bits";

import type { ProgramInfo, u16, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    add_5_3: {
        name: "Addition Simple",
        description: "Calculate 5 + 3",
        code: new Map([
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 5],
            [0x02, Opcode.MOV_B_IMM],
            [0x03, 3],
            [0x04, Opcode.ADD_A_IMM],
            [0x05, Opcode.SYSCALL],
            [0x06, 0],               // ← Syscall 0 = exit
        ] as [u16, u8][]),
    },
    add_10_25: {
        name: "Addition Grande",
        description: "Calculate 10 + 25",
        code: new Map([
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 10],
            [0x02, Opcode.MOV_B_IMM],
            [0x03, 25],
            [0x04, Opcode.ADD_A_IMM],
            [0x05, Opcode.SYSCALL],
            [0x06, 0],               // ← Syscall 0 = exit
        ] as [u16, u8][]),
    },
    double_addition: {
        name: "Double Addition",
        description: "Calculate (5 + 3) + 10",
        code: new Map([
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 5],
            [0x02, Opcode.MOV_B_IMM],
            [0x03, 3],
            [0x04, Opcode.ADD_A_IMM],      // A = 8
            [0x05, Opcode.MOV_B_IMM],
            [0x06, 10],
            [0x07, Opcode.ADD_A_IMM],      // A = 18
            [0x08, Opcode.SYSCALL],
            [0x09, 0],               // ← Syscall 0 = exit
        ] as [u16, u8][]),
    },
    subtraction: {
        name: "Soustraction",
        description: "Calculate 10 - 3",
        code: new Map([
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 10],
            [0x02, Opcode.MOV_B_IMM],
            [0x03, 3],
            [0x04, Opcode.SUB_A_IMM],
            [0x05, Opcode.SYSCALL],
            [0x06, 0],               // ← Syscall 0 = exit
        ] as [u16, u8][]),
    },
    logical_ops: {
        name: "Opérations Logiques",
        description: "AND, OR, XOR: 0b1100 & 0b1010",
        code: new Map([
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 0b1100],  // 12
            [0x02, Opcode.MOV_B_IMM],
            [0x03, 0b1010],  // 10
            [0x04, Opcode.AND_A_IMM],
            [0x05, Opcode.SYSCALL],
            [0x06, 0],               // ← Syscall 0 = exit
        ] as [u16, u8][]),
    },
    increment_loop: {
        name: "Boucle d'Incrémentation",
        description: "Count from 0 to 5",
        code: new Map([
            // Initialiser A = 0
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 0],

            // LOOP (0x02):
            [0x02, Opcode.INC_A],      // A++

            // Comparer avec 5
            [0x03, Opcode.MOV_B_IMM],
            [0x04, 5],
            [0x05, Opcode.SUB_A_IMM],        // A = A - 5

            // Si A != 0 (pas encore 5), continuer
            [0x06, Opcode.JNZ],
            [0x07, 0x00],              // Low byte (retour à 0x0200)
            [0x08, 0x02],              // High byte

            // A = 5, terminé
            [0x09, Opcode.MOV_A_IMM],
            [0x0A, 5],                 // Restaurer A = 5 (car SUB l'a mis à 0)
            [0x0B, Opcode.SYSCALL],
            [0x0C, 0],
        ] as [u16, u8][]),
    },
    overflow_test: {
        name: "Overflow Test",
        description: "Test 8-bit overflow: 200 + 100",
        code: new Map([
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 200],
            [0x02, Opcode.MOV_B_IMM],
            [0x03, 100],
            [0x04, Opcode.ADD_A_IMM],
            [0x05, Opcode.SYSCALL],
            [0x06, 0],               // ← Syscall 0 = exit
        ] as [u16, u8][]),
    },
}
