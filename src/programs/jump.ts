
import { Opcode } from "@/lib/instructions";
import { MEMORY_MAP } from "@/lib/memory_map";

import type { ProgramInfo, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    conditional_jump: {
        name: "Saut Conditionnel",
        description: "If A == 0, skip increment",
        code: new Map([
            // Setup
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 0],          // A = 0 (donc Z flag = true)

            // Test: if A == 0, jump to SKIP
            [0x02, Opcode.JZ],
            [0x03, 0x08],       // Low byte of jump address
            [0x04, 0x02],       // High byte of jump address (0x0208)

            // This will be skipped (because A == 0)
            [0x05, Opcode.INC_A],
            [0x06, Opcode.HALT], // Should not reach here

            // SKIP: (address 0x0008)
            [0x08, Opcode.MOV_A_IMM],
            [0x09, 100],        // A = 100

            [0x0A, Opcode.HALT], // Or SYSCALL 0
        ] as [u8, u8][]),
        expectedResult: "A = 100 (INC_A skipped)"
    },
}

