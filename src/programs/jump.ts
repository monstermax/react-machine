
import { Opcode } from "@/lib/instructions";
import { MEMORY_MAP } from "@/lib/memory_map";

import type { ProgramInfo, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    conditional_jump: {
        name: "Saut Conditionnel",
        description: "If A == 0, skip increment",
        code: new Map([
            [0x00, Opcode.MOV_A_IMM],
            [0x01, 0],          // A = 0
            [0x02, Opcode.JZ],      // If zero, jump
            [0x03, 0x06],       // Jump to LOAD_A 100
            [0x04, Opcode.INC_A],   // This will be skipped
            [0x05, Opcode.HALT],
            [0x06, Opcode.MOV_A_IMM],
            [0x07, 100],        // A = 100
            [0x08, Opcode.SYSCALL],
            [0x09, 0],               // ← Syscall 0 = exit
        ] as [u8, u8][]),
        expectedResult: "A = 100"
    },
}
