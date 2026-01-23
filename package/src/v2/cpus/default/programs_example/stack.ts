
import { Opcode } from "@/v2/cpus/default/cpu_instructions";
import { high16, low16 } from "@/v2/lib/integers";
import { MEMORY_MAP } from "@/v2/lib/memory_map_16x8_bits";

import type { ProgramInfo, u16, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    stack_demo: {
        name: "Stack Demo",
        description: "Démontre CALL/RET avec pile",
        code: new Map([
            // Initialiser SP
            [0x00, Opcode.SET_SP],
            [0x01, low16(MEMORY_MAP.STACK_END)],  // STACK_END - low
            [0x02, high16(MEMORY_MAP.STACK_END)], // STACK_END - high

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
            [0x11, Opcode.MOV_A_IMM],
            [0x12, 0x42],

            // Restaurer A depuis la pile
            [0x13, Opcode.POP_A],

            // Retour à l'appelant
            [0x14, Opcode.RET],
        ] as [u16, u8][]),
    },
}
