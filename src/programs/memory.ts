
import { Opcode } from "@/lib/instructions";
import { MEMORY_MAP } from "@/lib/memory_map";

import type { u8 } from "@/types/cpu.types";


export const programs = {
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
        ] as [u8, u8][]),
        expectedResult: "A = 42, Memory[0x80] = 42"
    },
}
