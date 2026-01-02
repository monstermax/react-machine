
import { Opcode } from "./instructions";

import type { ProgramInfo } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    add_5_3: {
        name: "Addition Simple",
        description: "Calculate 5 + 3",
        code: new Map([
            [0x00, Opcode.LOAD_A],
            [0x01, 5],
            [0x02, Opcode.LOAD_B],
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
            [0x00, Opcode.LOAD_A],
            [0x01, 10],
            [0x02, Opcode.LOAD_B],
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
            [0x00, Opcode.LOAD_A],
            [0x01, 5],
            [0x02, Opcode.LOAD_B],
            [0x03, 3],
            [0x04, Opcode.ADD],      // A = 8
            [0x05, Opcode.LOAD_B],
            [0x06, 10],
            [0x07, Opcode.ADD],      // A = 18
            [0x05, Opcode.SYSCALL],
            [0x06, 0],               // ← Syscall 0 = exit
        ]),
        expectedResult: "A = 18"
    },
    subtraction: {
        name: "Soustraction",
        description: "Calculate 10 - 3",
        code: new Map([
            [0x00, Opcode.LOAD_A],
            [0x01, 10],
            [0x02, Opcode.LOAD_B],
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
            [0x00, Opcode.LOAD_A],
            [0x01, 0b1100],  // 12
            [0x02, Opcode.LOAD_B],
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
            [0x00, Opcode.LOAD_A],
            [0x01, 0],

            // LOOP (0x02):
            [0x02, Opcode.INC_A],      // A++

            // Comparer avec 5
            [0x03, Opcode.LOAD_B],
            [0x04, 5],
            [0x05, Opcode.SUB],        // A = A - 5

            // Si A != 0 (pas encore 5), continuer
            [0x06, Opcode.JNZ],
            [0x07, 0x00],              // Low byte (retour à 0x0200)
            [0x08, 0x02],              // High byte

            // A = 5, terminé
            [0x09, Opcode.LOAD_A],
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
            [0x00, Opcode.LOAD_A],
            [0x01, 42],
            [0x02, Opcode.STORE],
            [0x03, 0x80],       // Low byte
            [0x04, 0x00],       // High byte (0x0080)
            [0x05, Opcode.LOAD_A],
            [0x06, 0],
            [0x07, Opcode.LOAD_MEM],
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
            [0x00, Opcode.LOAD_A],
            [0x01, 0],          // A = 0
            [0x02, Opcode.JZ],      // If zero, jump
            [0x03, 0x06],       // Jump to LOAD_A 100
            [0x04, Opcode.INC_A],   // This will be skipped
            [0x05, Opcode.HALT],
            [0x06, Opcode.LOAD_A],
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
            [0x00, Opcode.LOAD_A],
            [0x01, 200],
            [0x02, Opcode.LOAD_B],
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
            [0x00, Opcode.LOAD_A],
            [0x01, 0x00],

            // Loop
            [0x02, Opcode.STORE],
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
            [0x00, Opcode.LOAD_A],
            [0x01, 0x00],

            // Boucle principale
            [0x02, Opcode.STORE],
            [0x03, 0x60], [0x04, 0xFF],  // 0xFF60

            [0x05, Opcode.LOAD_B],
            [0x06, 0x10],

            // Délai
            [0x07, Opcode.DEC_B],
            [0x08, Opcode.JNZ],
            [0x09, 0x07], [0x0A, 0x02],  // 0x0207

            [0x0B, Opcode.INC_A],
            [0x0C, Opcode.LOAD_B],
            [0x0D, 0x0F],
            [0x0E, Opcode.AND],          // A = A & 0x0F
            [0x0F, Opcode.JMP],
            [0x10, 0x02],  // Low
            [0x11, 0x02],  // High (0x0202 = PROGRAM_START + 0x02)
        ]),
        expectedResult: "Compteur 0→F qui boucle"
    },
};


