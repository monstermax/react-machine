
import type { u16, u8 } from "@/types/cpu.types";

// 8086 instruction set
// https://www.eng.auburn.edu/~sylee/ee2220/8086_instruction_set.html
// https://www.tutorialspoint.com/microprocessor/microprocessor_8086_instruction_sets.htm
// https://www.geeksforgeeks.org/electronics-engineering/8086-instruction-set/


// Instructions
export enum Opcode {
    // Contrôle
    NOP = 0x00,
    HALT = 0x01,
    BREAKPOINT = 0x02,
    BREAKPOINT_JS = 0x03,
    SYSCALL = 0x04,

    // ALU
    ADD_A_IMM = 0x05,     // A = A + IMM
    SUB_A_IMM = 0x06,     // A = A - IMM
    AND_A_IMM = 0x07,     // A = A & IMM
    OR_A_IMM = 0x08,      // A = A | IMM
    XOR_A_IMM = 0x09,     // A = A ^ IMM

    ADD_B_IMM = 0x0A,     // B = B + IMM
    SUB_B_IMM = 0x0B,     // B = B - IMM
    AND_B_IMM = 0x0C,     // B = B & IMM
    OR_B_IMM = 0x0D,      // B = B | IMM
    XOR_B_IMM = 0x0E,     // B = B ^ IMM


    // Contrôle CPU
    GET_FREQ = 0x10,        // <=== TODO: a remplacer par un Device IO
    SET_FREQ = 0x11,        // <=== TODO: a remplacer par un Device IO

    // Cores
    CORE_HALT = 0x12,
    CORE_START = 0x13,
    CORE_INIT = 0x14,
    CORE_STATUS = 0x15,
    CORES_COUNT = 0x16,

    // CPUs
    CPU_HALT = 0x17,
    CPU_START = 0x18,
    CPU_INIT = 0x19,
    CPU_STATUS = 0x1A,
    CPUS_COUNT = 0x1B,


    // Stack (0x20-0x2B)
    PUSH_A = 0x20,     // PUSH A
    PUSH_B = 0x21,     // PUSH B
    PUSH_C = 0x22,     // PUSH C
    PUSH_D = 0x23,     // PUSH D
    POP_A = 0x24,      // POP A
    POP_B = 0x25,      // POP B
    POP_C = 0x26,      // POP C
    POP_D = 0x27,      // POP D

    // Contrôle Stack
    GET_SP = 0x28,     // GET SP
    SET_SP = 0x29,     // SET SP, imm16
    CALL = 0x2A,       // CALL addr16 (push PC+3, then JMP)
    RET = 0x2B,        // RET (pop PC)

    // Interrupts (0x2C-0x2E)
    EI = 0x2C,         // Enable Interrupts
    DI = 0x2D,         // Disable Interrupts
    IRET = 0x2E,       // Return from Interrupt


    // Sauts (0x30-0x36)
    JMP = 0x30,        // JMP addr16 (16-bit address)
    JZ = 0x31,         // JZ addr16 (16-bit address)
    JE = JZ,           // Jump if Equal
    JNZ = 0x32,        // JNZ addr16 (16-bit address)
    JNE = JNZ,         // Jump if Not Equal
    JC = 0x33,         // JC addr16 (16-bit address)
    JNC = 0x34,        // JNC addr16 (16-bit address)
    JL = 0x35,         // Jump if Lower
    JB = JL,           // Jump if Lower
    JLE = 0x35,        // Jump if Lower or Equal
    JBE = JLE,         // Jump if Lower or Equal
    JG = 0x37,         // Jump if Greater
    JA = JG,           // Jump if Greater
    JGE = 0x38,        // Jump if Greater or Equal
    JAE = JGE,         // Jump if Greater or Equal

    // LEA (0x39-0x3F)
    LEA_CD_A = 0x39,      // LEA A, [C:D] - Load address C:D into A
    LEA_CD_B = 0x3A,      // LEA B, [C:D] - Load address C:D into B
    LEA_IMM_CD = 0x3B,    // LEA CD, imm16 - Load immediate address into C:D (2 bytes)
    LEA_A_MEM = 0x3C,     // LEA A, [addr] - Load address into A (low byte)
    LEA_B_MEM = 0x3D,     // LEA B, [addr] - Load address into B (low byte)
    LEA_CD_MEM = 0x3E,    // LEA CD, [addr] - Load address into C:D
    LEA_CD_OFFSET = 0x3F, // LEA CD, [CD + offset] - Address with offset


    // MOV (0x40-0x5B)
    // MOV Instructions (Register to Register)
    MOV_AB = 0x40,  // Move A to B
    MOV_AC = 0x41,  // Move A to C  
    MOV_AD = 0x42,  // Move A to D
    MOV_BA = 0x43,  // Move B to A
    MOV_BC = 0x44,  // Move B to C
    MOV_BD = 0x45,  // Move B to D
    MOV_CA = 0x46,  // Move C to A
    MOV_CB = 0x47,  // Move C to B
    MOV_CD = 0x48,  // Move C to D
    MOV_DA = 0x49,  // Move D to A
    MOV_DB = 0x4A,  // Move D to B
    MOV_DC = 0x4B,  // Move D to C

    // MOV with Immediate (8-bit)
    MOV_A_IMM = 0x4C,  // MOV A, imm8
    MOV_B_IMM = 0x4D,  // MOV B, imm8
    MOV_C_IMM = 0x4E,  // MOV C, imm8
    MOV_D_IMM = 0x4F,  // MOV D, imm8

    // MOV Memory to Register
    MOV_A_MEM = 0x50,  // MOV A, [addr16]
    MOV_B_MEM = 0x51,  // MOV B, [addr16]
    MOV_C_MEM = 0x52,  // MOV C, [addr16]
    MOV_D_MEM = 0x53,  // MOV D, [addr16]

    // MOV Register to Memory
    MOV_MEM_A = 0x54,  // MOV [addr16], A
    MOV_MEM_B = 0x55,  // MOV [addr16], B
    MOV_MEM_C = 0x56,  // MOV [addr16], C
    MOV_MEM_D = 0x57,  // MOV [addr16], D

    // MOV Memory to Register (indirect via C:D)
    MOV_A_PTR_CD = 0x58,  // A = [[C:D]]
    MOV_B_PTR_CD = 0x59,  // B = [[C:D]]

    // MOV Register to Memory (indirect via C:D)
    MOV_PTR_CD_A = 0x5A,  // [C:D] = A
    MOV_PTR_CD_B = 0x5B,  // [C:D] = B


    // ALU (0x5C-0xFF)

    NOT_A = 0x5C,       // A = !A
    NOT_B = 0x5D,       // B = !B
    NOT_C = 0x5E,       // C = !C
    NOT_D = 0x5F,       // D = !D

    INC_A = 0x60,
    INC_B = 0x61,
    INC_C = 0x62,
    INC_D = 0x63,

    DEC_A = 0x64,
    DEC_B = 0x65,
    DEC_C = 0x66,
    DEC_D = 0x67,

    ADD_C_IMM = 0x68,     // C = C + IMM
    SUB_C_IMM = 0x69,     // C = C - IMM
    AND_C_IMM = 0x6A,     // C = C & IMM
    OR_C_IMM = 0x6B,      // C = C | IMM
    XOR_C_IMM = 0x6C,     // C = C ^ IMM


    // Rotation de bit (0xE4-0xE7)
    ROL_A = 0x6C,      // Rotate Left A (avec carry)
    ROR_A = 0x6D,      // Rotate Right A (avec carry)
    ROL_B = 0x6E,      // Rotate Left B (avec carry)
    ROR_B = 0x6F,      // Rotate Right B (avec carry)

    ADD_AA = 0x70,        // A = A + A
    ADD_AB = 0x71,        // A = A + B
    ADD_AC = 0x72,        // A = A + C
    ADD_AD = 0x73,        // A = A + D
    ADD_BA = 0x74,        // B = B + A
    ADD_BB = 0x75,        // B = B + B
    ADD_BC = 0x76,        // B = B + C
    ADD_BD = 0x77,        // B = B + D
    ADD_CA = 0x78,        // C = C + A
    ADD_CB = 0x79,        // C = C + B
    ADD_CC = 0x7A,        // C = C + C
    ADD_CD = 0x7B,        // C = C + D
    ADD_DA = 0x7C,        // D = D + A
    ADD_DB = 0x7D,        // D = D + B
    ADD_DC = 0x7E,        // D = D + C
    ADD_DD = 0x7F,        // D = D + D

    SUB_AA = 0x80,        // A = A - A
    SUB_AB = 0x81,        // A = A - B
    SUB_AC = 0x82,        // A = A - C
    SUB_AD = 0x83,        // A = A - D
    SUB_BA = 0x84,        // B = B - A
    SUB_BB = 0x85,        // B = B - B
    SUB_BC = 0x86,        // B = B - C
    SUB_BD = 0x87,        // B = B - D
    SUB_CA = 0x88,        // C = C - A
    SUB_CB = 0x89,        // C = C - B
    SUB_CC = 0x8A,        // C = C - C
    SUB_CD = 0x8B,        // C = C - D
    SUB_DA = 0x8C,        // D = D - A
    SUB_DB = 0x8D,        // D = D - B
    SUB_DC = 0x8E,        // D = D - C
    SUB_DD = 0x8F,        // D = D - D

    AND_AA = 0x90,        // A = A & A
    AND_AB = 0x91,        // A = A & B
    AND_AC = 0x92,        // A = A & C
    AND_AD = 0x93,        // A = A & D
    AND_BA = 0x94,        // B = B & A
    AND_BB = 0x95,        // B = B & B
    AND_BC = 0x96,        // B = B & C
    AND_BD = 0x97,        // B = B & D
    AND_CA = 0x98,        // C = C & A
    AND_CB = 0x99,        // C = C & B
    AND_CC = 0x9A,        // C = C & C
    AND_CD = 0x9B,        // C = C & D
    AND_DA = 0x9C,        // D = D & A
    AND_DB = 0x9D,        // D = D & B
    AND_DC = 0x9E,        // D = D & C
    AND_DD = 0x9F,        // D = D & D

    OR_AA = 0xA0,         // A = A | A
    OR_AB = 0xA1,         // A = A | B
    OR_AC = 0xA2,         // A = A | C
    OR_AD = 0xA3,         // A = A | D
    OR_BA = 0xA4,         // B = B | A
    OR_BB = 0xA5,         // B = B | B
    OR_BC = 0xA6,         // B = B | C
    OR_BD = 0xA7,         // B = B | D
    OR_CA = 0xA8,         // C = C | A
    OR_CB = 0xA9,         // C = C | B
    OR_CC = 0xAA,         // C = C | C
    OR_CD = 0xAB,         // C = C | D
    OR_DA = 0xAC,         // D = D | A
    OR_DB = 0xAD,         // D = D | B
    OR_DC = 0xAE,         // D = D | C
    OR_DD = 0xAF,         // D = D | D

    XOR_AA = 0xB0,        // A = A ^ A
    XOR_AB = 0xB1,        // A = A ^ B
    XOR_AC = 0xB2,        // A = A ^ C
    XOR_AD = 0xB3,        // A = A ^ D
    XOR_BA = 0xB4,        // B = B ^ A
    XOR_BB = 0xB5,        // B = B ^ B
    XOR_BC = 0xB6,        // B = B ^ C
    XOR_BD = 0xB7,        // B = B ^ D
    XOR_CA = 0xB8,        // C = C ^ A
    XOR_CB = 0xB9,        // C = C ^ B
    XOR_CC = 0xBA,        // C = C ^ C
    XOR_CD = 0xBB,        // C = C ^ D
    XOR_DA = 0xBC,        // D = D ^ A
    XOR_DB = 0xBD,        // D = D ^ B
    XOR_DC = 0xBE,        // D = D ^ C
    XOR_DD = 0xBF,        // D = D ^ D

    // TEST instructions (0xC0-0xCD)
    TEST_A = 0xC0,        // flags = A & A
    TEST_B = 0xC1,        // flags = B & B
    TEST_C = 0xC2,        // flags = C & C
    TEST_D = 0xC3,        // flags = D & D

    TEST_AA = TEST_A,
    TEST_AB = 0xC4,
    TEST_AC = 0xC5,
    TEST_AD = 0xC6,

    TEST_BA = TEST_AB,
    TEST_BB = TEST_B,
    TEST_BC = 0xC7,
    TEST_BD = 0xC8,

    TEST_CA = TEST_AC,
    TEST_CB = TEST_BC,
    TEST_CC = TEST_C,
    TEST_CD = 0xC9,

    TEST_DA = TEST_AD,
    TEST_DB = TEST_BD,
    TEST_DC = TEST_CD,
    TEST_DD = TEST_D,

    // CMP avec immédiat (0xCA-0xCD)
    TEST_A_IMM = 0xCA,
    TEST_B_IMM = 0xCB,
    TEST_C_IMM = 0xCC,
    TEST_D_IMM = 0xCD,

    // CMP instructions (0xD0-0xDF)
    CMP_AA = 0xD0,
    CMP_AB = 0xD1,
    CMP_AC = 0xD2,
    CMP_AD = 0xD3,
    CMP_BA = 0xD4,
    CMP_BB = 0xD5,
    CMP_BC = 0xD6,
    CMP_BD = 0xD7,
    CMP_CA = 0xD8,
    CMP_CB = 0xD9,
    CMP_CC = 0xDA,
    CMP_CD = 0xDB,
    CMP_DA = 0xDC,
    CMP_DB = 0xDD,
    CMP_DC = 0xDE,
    CMP_DD = 0xDF,

    // CMP avec immédiat (0xE0-0xE3)
    CMP_A_IMM = 0xE0,
    CMP_B_IMM = 0xE1,
    CMP_C_IMM = 0xE2,
    CMP_D_IMM = 0xE3,

    // ALU
    ADD_D_IMM = 0xE8,     // D = D + IMM
    SUB_D_IMM = 0xE9,     // D = D - IMM
    AND_D_IMM = 0xEA,     // D = D & IMM
    OR_D_IMM = 0xEB,      // D = D | IMM
    XOR_D_IMM = 0xEC,     // D = D ^ IMM


    // décalage de bit (0xF0-0xFF)
    SHL_A = 0xF0,      // Shift Left A (A << 1)
    SHR_A = 0xF1,      // Shift Right A (A >> 1)
    SHL_B = 0xF2,      // Shift Left B
    SHR_B = 0xF3,      // Shift Right B
    SHL_C = 0xF4,      // Shift Left C
    SHR_C = 0xF5,      // Shift Right C
    SHL_D = 0xF6,      // Shift Left D
    SHR_D = 0xF7,      // Shift Right D

    // décalage avec spécification du nombre de bits
    SHL_A_N = 0xF8,    // Shift Left A, N bits (opcode + 1 byte pour N)
    SHR_A_N = 0xF9,    // Shift Right A, N bits
    SHL_B_N = 0xFA,    // Shift Left A, N bits (opcode + 1 byte pour N)
    SHR_B_N = 0xFB,    // Shift Right A, N bits
    SHL_C_N = 0xFC,    // Shift Left A, N bits (opcode + 1 byte pour N)
    SHR_C_N = 0xFD,    // Shift Right A, N bits
    SHL_D_N = 0xFE,    // Shift Left A, N bits (opcode + 1 byte pour N)
    SHR_D_N = 0xFF,    // Shift Right A, N bits

}


// Instructions avec 1 opérande 8-bit
export const INSTRUCTIONS_WITH_OPERAND = [
    Opcode.SYSCALL,
    Opcode.SET_FREQ,
    Opcode.LEA_CD_OFFSET,
    Opcode.MOV_A_IMM,
    Opcode.MOV_B_IMM,
    Opcode.MOV_C_IMM,
    Opcode.MOV_D_IMM,
    Opcode.CMP_A_IMM,
    Opcode.CMP_B_IMM,
    Opcode.CMP_C_IMM,
    Opcode.CMP_D_IMM,
    Opcode.TEST_A_IMM,
    Opcode.TEST_B_IMM,
    Opcode.TEST_C_IMM,
    Opcode.TEST_D_IMM,
    Opcode.ADD_A_IMM,
    Opcode.SUB_A_IMM,
    Opcode.AND_A_IMM,
    Opcode.OR_A_IMM,
    Opcode.XOR_A_IMM,
    Opcode.ADD_B_IMM,
    Opcode.SUB_B_IMM,
    Opcode.AND_B_IMM,
    Opcode.OR_B_IMM,
    Opcode.XOR_B_IMM,
    Opcode.ADD_C_IMM,
    Opcode.SUB_C_IMM,
    Opcode.AND_C_IMM,
    Opcode.OR_C_IMM,
    Opcode.XOR_C_IMM,
    Opcode.ADD_D_IMM,
    Opcode.SUB_D_IMM,
    Opcode.AND_D_IMM,
    Opcode.OR_D_IMM,
    Opcode.XOR_D_IMM,
    Opcode.SHL_A_N,
    Opcode.SHR_A_N,
    Opcode.SHL_B_N,
    Opcode.SHR_B_N,
    Opcode.SHL_C_N,
    Opcode.SHR_C_N,
    Opcode.SHL_D_N,
    Opcode.SHR_D_N,
];


// Instructions avec 1 opérande 16-bit (2 bytes: low, high)
export const INSTRUCTIONS_WITH_TWO_OPERANDS = [
    Opcode.JMP,
    Opcode.JZ,
    Opcode.JNZ,
    Opcode.JC,
    Opcode.JNC,
    Opcode.SET_SP,
    Opcode.CALL,
    Opcode.MOV_A_MEM,
    Opcode.MOV_B_MEM,
    Opcode.MOV_C_MEM,
    Opcode.MOV_D_MEM,
    Opcode.MOV_MEM_A,
    Opcode.MOV_MEM_B,
    Opcode.MOV_MEM_C,
    Opcode.MOV_MEM_D,
    Opcode.LEA_A_MEM,      // LEA A, [imm16]
    Opcode.LEA_B_MEM,      // LEA B, [imm16]
    Opcode.LEA_CD_MEM,     // LEA CD, [imm16]
    Opcode.LEA_IMM_CD,     // LEA CD, imm16
];


export const getOpcodeName = (opcode: u8): string => {
    switch (opcode) {
        // Contrôle
        case Opcode.NOP: return "NOP";
        case Opcode.SYSCALL: return "SYSCALL";
        case Opcode.GET_FREQ: return "GET FREQ";
        case Opcode.SET_FREQ: return "SET FREQ";
        case Opcode.BREAKPOINT: return "BREAKPOINT ASM";
        case Opcode.BREAKPOINT_JS: return "BREAKPOINT JS";
        case Opcode.HALT: return "HALT";

        case Opcode.CORE_START: return "CORE START";
        case Opcode.CORE_HALT: return "CORE HALT";
        case Opcode.CORE_INIT: return "CORE INIT";
        case Opcode.CORE_STATUS: return "CORE STATUS";
        case Opcode.CORES_COUNT: return "CORES COUNT";

        case Opcode.CPU_START: return "CPU START";
        case Opcode.CPU_HALT: return "CPU HALT";
        case Opcode.CPU_INIT: return "CPU INIT";
        case Opcode.CPU_STATUS: return "CPU STATUS";
        case Opcode.CPUS_COUNT: return "CPUS COUNT";


        // Sauts
        case Opcode.JMP: return "JMP";
        case Opcode.JZ: return "JZ";
        case Opcode.JNZ: return "JNZ";
        case Opcode.JC: return "JC";
        case Opcode.JNC: return "JNC";

        // Stack
        case Opcode.PUSH_A: return "PUSH A";
        case Opcode.PUSH_B: return "PUSH B";
        case Opcode.PUSH_C: return "PUSH C";
        case Opcode.PUSH_D: return "PUSH D";
        case Opcode.POP_A: return "POP A";
        case Opcode.POP_B: return "POP B";
        case Opcode.POP_C: return "POP C";
        case Opcode.POP_D: return "POP D";

        // Contrôle Stack
        case Opcode.GET_SP: return "GET SP";
        case Opcode.SET_SP: return "SET SP";
        case Opcode.CALL: return "CALL";
        case Opcode.RET: return "RET";

        // Interrupts
        case Opcode.EI: return "EI";
        case Opcode.DI: return "DI";
        case Opcode.IRET: return "IRET";

        // LEA
        case Opcode.LEA_CD_A: return "LEA A, [C:D]";
        case Opcode.LEA_CD_B: return "LEA B, [C:D]";
        case Opcode.LEA_IMM_CD: return "LEA CD, imm16";
        case Opcode.LEA_A_MEM: return "LEA A, [addr]";
        case Opcode.LEA_B_MEM: return "LEA B, [addr]";
        case Opcode.LEA_CD_MEM: return "LEA CD, [addr]";
        case Opcode.LEA_CD_OFFSET: return "LEA CD, [CD+offset]";

        // MOV Register to Register
        case Opcode.MOV_AB: return "MOV A B";
        case Opcode.MOV_AC: return "MOV A C";
        case Opcode.MOV_AD: return "MOV A D";
        case Opcode.MOV_BA: return "MOV B A";
        case Opcode.MOV_BC: return "MOV B C";
        case Opcode.MOV_BD: return "MOV B D";
        case Opcode.MOV_CA: return "MOV C A";
        case Opcode.MOV_CB: return "MOV C B";
        case Opcode.MOV_CD: return "MOV C D";
        case Opcode.MOV_DA: return "MOV D A";
        case Opcode.MOV_DB: return "MOV D B";
        case Opcode.MOV_DC: return "MOV D C";

        // MOV avec Immediate
        case Opcode.MOV_A_IMM: return "MOV A IMM";
        case Opcode.MOV_B_IMM: return "MOV B IMM";
        case Opcode.MOV_C_IMM: return "MOV C IMM";
        case Opcode.MOV_D_IMM: return "MOV D IMM";

        // MOV Memory to Register
        case Opcode.MOV_A_MEM: return "MOV A MEM";
        case Opcode.MOV_B_MEM: return "MOV B MEM";
        case Opcode.MOV_C_MEM: return "MOV C MEM";
        case Opcode.MOV_D_MEM: return "MOV D MEM";

        // MOV Register to Memory
        case Opcode.MOV_MEM_A: return "MOV MEM A";
        case Opcode.MOV_MEM_B: return "MOV MEM B";
        case Opcode.MOV_MEM_C: return "MOV MEM C";
        case Opcode.MOV_MEM_D: return "MOV MEM D";

        // MOV Memory to Register (indirect via C:D)
        case Opcode.MOV_A_PTR_CD: return "MOV A PTR_CD";
        case Opcode.MOV_B_PTR_CD: return "MOV B PTR_CD";

        // MOV Register to Memory (indirect via C:D)
        case Opcode.MOV_PTR_CD_A: return "MOV PTR_CD A";
        case Opcode.MOV_PTR_CD_B: return "MOV PTR_CD B";


        // ALU
        case Opcode.ADD_A_IMM: return "ADD A IMM";
        case Opcode.SUB_A_IMM: return "SUB A IMM";
        case Opcode.AND_A_IMM: return "AND A IMM";
        case Opcode.OR_A_IMM: return "OR A IMM";
        case Opcode.XOR_A_IMM: return "XOR A IMM";

        case Opcode.ADD_B_IMM: return "ADD B IMM";
        case Opcode.SUB_B_IMM: return "SUB B IMM";
        case Opcode.AND_B_IMM: return "AND B IMM";
        case Opcode.OR_B_IMM: return "OR B IMM";
        case Opcode.XOR_B_IMM: return "XOR B IMM";

        case Opcode.ADD_C_IMM: return "ADD C IMM";
        case Opcode.SUB_C_IMM: return "SUB C IMM";
        case Opcode.AND_C_IMM: return "AND C IMM";
        case Opcode.OR_C_IMM: return "OR C IMM";
        case Opcode.XOR_C_IMM: return "XOR C IMM";

        case Opcode.ADD_D_IMM: return "ADD D IMM";
        case Opcode.SUB_D_IMM: return "SUB D IMM";
        case Opcode.AND_D_IMM: return "AND D IMM";
        case Opcode.OR_D_IMM: return "OR D IMM";
        case Opcode.XOR_D_IMM: return "XOR D IMM";

        case Opcode.NOT_A: return "NOT A";
        case Opcode.NOT_B: return "NOT B";
        case Opcode.NOT_C: return "NOT C";
        case Opcode.NOT_D: return "NOT D";

        case Opcode.INC_A: return "INC A";
        case Opcode.DEC_A: return "DEC A";
        case Opcode.INC_B: return "INC B";
        case Opcode.DEC_B: return "DEC B";
        case Opcode.INC_C: return "INC C";
        case Opcode.DEC_C: return "DEC C";
        case Opcode.INC_D: return "INC D";
        case Opcode.DEC_D: return "DEC D";


        case Opcode.ADD_AA: return "ADD A A";
        case Opcode.SUB_AA: return "SUB A A";
        case Opcode.AND_AA: return "AND A A";
        case Opcode.OR_AA: return "OR A A";
        case Opcode.XOR_AA: return "XOR A A";

        case Opcode.ADD_AB: return "ADD A B";
        case Opcode.SUB_AB: return "SUB A B";
        case Opcode.AND_AB: return "AND A B";
        case Opcode.OR_AB: return "OR A B";
        case Opcode.XOR_AB: return "XOR A B";

        case Opcode.ADD_AC: return "ADD A C";
        case Opcode.SUB_AC: return "SUB A C";
        case Opcode.AND_AC: return "AND A C";
        case Opcode.OR_AC: return "OR A C";
        case Opcode.XOR_AC: return "XOR A C";

        case Opcode.ADD_AD: return "ADD A D";
        case Opcode.SUB_AD: return "SUB A D";
        case Opcode.AND_AD: return "AND A D";
        case Opcode.OR_AD: return "OR A D";
        case Opcode.XOR_AD: return "XOR A D";


        case Opcode.ADD_BA: return "ADD B A";
        case Opcode.SUB_BA: return "SUB B A";
        case Opcode.AND_BA: return "AND B A";
        case Opcode.OR_BA: return "OR B A";
        case Opcode.XOR_BA: return "XOR B A";

        case Opcode.SUB_BB: return "SUB B B";
        case Opcode.ADD_BB: return "ADD B B";
        case Opcode.AND_BB: return "AND B B";
        case Opcode.OR_BB: return "OR B B";
        case Opcode.XOR_BB: return "XOR B B";

        case Opcode.ADD_BC: return "ADD B C";
        case Opcode.SUB_BC: return "SUB B C";
        case Opcode.AND_BC: return "AND B C";
        case Opcode.OR_BC: return "OR B C";
        case Opcode.XOR_BC: return "XOR B C";

        case Opcode.ADD_BD: return "ADD B D";
        case Opcode.SUB_BD: return "SUB B D";
        case Opcode.AND_BD: return "AND B D";
        case Opcode.OR_BD: return "OR B D";
        case Opcode.XOR_BD: return "XOR B D";


        case Opcode.ADD_CA: return "ADD C A";
        case Opcode.SUB_CA: return "SUB C A";
        case Opcode.AND_CA: return "AND C A";
        case Opcode.OR_CA: return "OR C A";
        case Opcode.XOR_CA: return "XOR C A";

        case Opcode.SUB_CB: return "SUB C B";
        case Opcode.ADD_CB: return "ADD C B";
        case Opcode.AND_CB: return "AND C B";
        case Opcode.OR_CB: return "OR C B";
        case Opcode.XOR_CB: return "XOR C B";

        case Opcode.ADD_CC: return "ADD C C";
        case Opcode.SUB_CC: return "SUB C C";
        case Opcode.AND_CC: return "AND C C";
        case Opcode.OR_CC: return "OR C C";
        case Opcode.XOR_CC: return "XOR C C";

        case Opcode.ADD_CD: return "ADD C D";
        case Opcode.SUB_CD: return "SUB C D";
        case Opcode.AND_CD: return "AND C D";
        case Opcode.OR_CD: return "OR C D";
        case Opcode.XOR_CD: return "XOR C D";


        case Opcode.ADD_DA: return "ADD D A";
        case Opcode.SUB_DA: return "SUB D A";
        case Opcode.AND_DA: return "AND D A";
        case Opcode.OR_DA: return "OR D A";
        case Opcode.XOR_DA: return "XOR D A";

        case Opcode.SUB_DB: return "SUB D B";
        case Opcode.ADD_DB: return "ADD D B";
        case Opcode.AND_DB: return "AND D B";
        case Opcode.OR_DB: return "OR D B";
        case Opcode.XOR_DB: return "XOR D B";

        case Opcode.ADD_DC: return "ADD D C";
        case Opcode.SUB_DC: return "SUB D C";
        case Opcode.AND_DC: return "AND D C";
        case Opcode.OR_DC: return "OR D C";
        case Opcode.XOR_DC: return "XOR D C";

        case Opcode.ADD_DD: return "ADD D D";
        case Opcode.SUB_DD: return "SUB D D";
        case Opcode.AND_DD: return "AND D D";
        case Opcode.OR_DD: return "OR D D";
        case Opcode.XOR_DD: return "XOR D D";

        // TEST avec immédiat
        case Opcode.TEST_A: return "TEST A";
        case Opcode.TEST_B: return "TEST B";
        case Opcode.TEST_C: return "TEST C";
        case Opcode.TEST_D: return "TEST D";

        // TEST register-register
        case Opcode.TEST_AA: return "TEST A A";
        case Opcode.TEST_AB: return "TEST A B";
        case Opcode.TEST_AC: return "TEST A C";
        case Opcode.TEST_AD: return "TEST A D";
        //case Opcode.TEST_BA: return "TEST B A";
        case Opcode.TEST_BB: return "TEST B B";
        case Opcode.TEST_BC: return "TEST B C";
        case Opcode.TEST_BD: return "TEST B D";
        //case Opcode.TEST_CA: return "TEST C A";
        //case Opcode.TEST_CB: return "TEST C B";
        case Opcode.TEST_CC: return "TEST C C";
        case Opcode.TEST_CD: return "TEST C D";
        //case Opcode.TEST_DA: return "TEST D A";
        //case Opcode.TEST_DB: return "TEST D B";
        //case Opcode.TEST_DC: return "TEST D C";
        case Opcode.TEST_DD: return "TEST D D";

        case Opcode.TEST_A_IMM: return "TEST A IMM";
        case Opcode.TEST_B_IMM: return "TEST B IMM";
        case Opcode.TEST_C_IMM: return "TEST C IMM";
        case Opcode.TEST_D_IMM: return "TEST D IMM";

        // CMP avec immédiat
        case Opcode.CMP_A_IMM: return "CMP A IMM";
        case Opcode.CMP_B_IMM: return "CMP B IMM";
        case Opcode.CMP_C_IMM: return "CMP C IMM";
        case Opcode.CMP_D_IMM: return "CMP D IMM";

        // CMP register-register
        case Opcode.CMP_AA: return "CMP A A";
        case Opcode.CMP_AB: return "CMP A B";
        case Opcode.CMP_AC: return "CMP A C";
        case Opcode.CMP_AD: return "CMP A D";
        case Opcode.CMP_BA: return "CMP B A";
        case Opcode.CMP_BB: return "CMP B B";
        case Opcode.CMP_BC: return "CMP B C";
        case Opcode.CMP_BD: return "CMP B D";
        case Opcode.CMP_CA: return "CMP C A";
        case Opcode.CMP_CB: return "CMP C B";
        case Opcode.CMP_CC: return "CMP C C";
        case Opcode.CMP_CD: return "CMP C D";
        case Opcode.CMP_DA: return "CMP D A";
        case Opcode.CMP_DB: return "CMP D B";
        case Opcode.CMP_DC: return "CMP D C";
        case Opcode.CMP_DD: return "CMP D D";

        // Shift
        case Opcode.SHL_A: return "SHL A";
        case Opcode.SHR_A: return "SHR A";
        case Opcode.SHL_B: return "SHL B";
        case Opcode.SHR_B: return "SHR B";
        case Opcode.SHL_C: return "SHL C";
        case Opcode.SHR_C: return "SHR C";
        case Opcode.SHL_D: return "SHL D";
        case Opcode.SHR_D: return "SHR D";
        case Opcode.SHL_A_N: return "SHL A N";
        case Opcode.SHR_A_N: return "SHR A N";
        case Opcode.SHL_B_N: return "SHL B N";
        case Opcode.SHR_B_N: return "SHR B N";
        case Opcode.SHL_C_N: return "SHL C N";
        case Opcode.SHR_C_N: return "SHR C N";
        case Opcode.SHL_D_N: return "SHL D N";
        case Opcode.SHR_D_N: return "SHR D N";

        // Rotate
        case Opcode.ROL_A: return "ROL A";
        case Opcode.ROR_A: return "ROR A";
        case Opcode.ROL_B: return "ROL B";
        case Opcode.ROR_B: return "ROR B";

        default: return "???";
    }

};



export const getOpcodeDescription = (opcode: u8): string => {
    switch (opcode) {
        // Contrôle
        case Opcode.NOP: return "No operation : does nothing, advances PC";
        case Opcode.SYSCALL: return "System call : invokes OS service with A as syscall number";
        case Opcode.GET_FREQ: return "Get frequency : returns current CPU frequency in A";
        case Opcode.SET_FREQ: return "Set frequency : sets CPU frequency to A";
        case Opcode.BREAKPOINT: return "Breakpoint : triggers debugger breakpoint (assembly)";
        case Opcode.BREAKPOINT_JS: return "Breakpoint JS : triggers JavaScript debugger breakpoint";
        case Opcode.HALT: return "Halt : stops CPU execution completely";

        // Cores
        case Opcode.CORE_START: return "Core start : starts execution on specified core";
        case Opcode.CORE_HALT: return "Core halt : halts execution on specified core";
        case Opcode.CORE_INIT: return "Core init : initializes core with configuration";
        case Opcode.CORE_STATUS: return "Core status : returns status of specified core in A";
        case Opcode.CORES_COUNT: return "Cores count : returns number of available cores in A";

        // CPUs
        case Opcode.CPU_START: return "CPU start : starts execution on specified CPU";
        case Opcode.CPU_HALT: return "CPU halt : halts execution on specified CPU";
        case Opcode.CPU_INIT: return "CPU init : initializes CPU with configuration";
        case Opcode.CPU_STATUS: return "CPU status : returns status of specified CPU in A";
        case Opcode.CPUS_COUNT: return "CPUs count : returns number of available CPUs in A";

        // Sauts
        case Opcode.JMP: return "Jump unconditional : PC = address";
        case Opcode.JZ: return "Jump if zero : PC = address if Z flag is set";
        case Opcode.JNZ: return "Jump if not zero : PC = address if Z flag is clear";
        case Opcode.JC: return "Jump if carry : PC = address if C flag is set";
        case Opcode.JNC: return "Jump if not carry : PC = address if C flag is clear";

        // Stack
        case Opcode.PUSH_A: return "Push A : store A on stack, decrement SP";
        case Opcode.PUSH_B: return "Push B : store B on stack, decrement SP";
        case Opcode.PUSH_C: return "Push C : store C on stack, decrement SP";
        case Opcode.PUSH_D: return "Push D : store D on stack, decrement SP";
        case Opcode.POP_A: return "Pop A : load A from stack, increment SP";
        case Opcode.POP_B: return "Pop B : load B from stack, increment SP";
        case Opcode.POP_C: return "Pop C : load C from stack, increment SP";
        case Opcode.POP_D: return "Pop D : load D from stack, increment SP";

        // Contrôle Stack
        case Opcode.GET_SP: return "Get SP : load stack pointer value into A:B";
        case Opcode.SET_SP: return "Set SP : set stack pointer to immediate 16-bit value";
        case Opcode.CALL: return "Call subroutine : push return address, jump to address";
        case Opcode.RET: return "Return from subroutine : pop return address into PC";

        // Interrupts
        case Opcode.EI: return "Enable interrupts : allow hardware interrupts";
        case Opcode.DI: return "Disable interrupts : block hardware interrupts";
        case Opcode.IRET: return "Return from interrupt : restore flags and return";

        // LEA
        case Opcode.LEA_CD_A: return "Load Effective Address into A : A = low byte of address (C:D)";
        case Opcode.LEA_CD_B: return "Load Effective Address into B : B = low byte of address (C:D)";
        case Opcode.LEA_IMM_CD: return "Load Effective Address immediate : C:D = 16-bit address (C=low, D=high)";
        case Opcode.LEA_A_MEM: return "Load Effective Address into A : A = low byte of 16-bit address";
        case Opcode.LEA_B_MEM: return "Load Effective Address into B : B = low byte of 16-bit address";
        case Opcode.LEA_CD_MEM: return "Load Effective Address into CD : C:D = 16-bit address (C=low, D=high)";
        case Opcode.LEA_CD_OFFSET: return "Load Effective Address with offset : C:D = C:D + offset (8-bit signed)";

        // MOV Register to Register
        case Opcode.MOV_AB: return "Move A to B : B = A";
        case Opcode.MOV_AC: return "Move A to C : C = A";
        case Opcode.MOV_AD: return "Move A to D : D = A";
        case Opcode.MOV_BA: return "Move B to A : A = B";
        case Opcode.MOV_BC: return "Move B to C : C = B";
        case Opcode.MOV_BD: return "Move B to D : D = B";
        case Opcode.MOV_CA: return "Move C to A : A = C";
        case Opcode.MOV_CB: return "Move C to B : B = C";
        case Opcode.MOV_CD: return "Move C to D : D = C";
        case Opcode.MOV_DA: return "Move D to A : A = D";
        case Opcode.MOV_DB: return "Move D to B : B = D";
        case Opcode.MOV_DC: return "Move D to C : C = D";

        // MOV avec Immediate
        case Opcode.MOV_A_IMM: return "Move immediate to A : A = 8-bit immediate value";
        case Opcode.MOV_B_IMM: return "Move immediate to B : B = 8-bit immediate value";
        case Opcode.MOV_C_IMM: return "Move immediate to C : C = 8-bit immediate value";
        case Opcode.MOV_D_IMM: return "Move immediate to D : D = 8-bit immediate value";

        // MOV Memory to Register
        case Opcode.MOV_A_MEM: return "Move memory to A : A = [16-bit address]";
        case Opcode.MOV_B_MEM: return "Move memory to B : B = [16-bit address]";
        case Opcode.MOV_C_MEM: return "Move memory to C : C = [16-bit address]";
        case Opcode.MOV_D_MEM: return "Move memory to D : D = [16-bit address]";

        // MOV Register to Memory
        case Opcode.MOV_MEM_A: return "Move A to memory : [16-bit address] = A";
        case Opcode.MOV_MEM_B: return "Move B to memory : [16-bit address] = B";
        case Opcode.MOV_MEM_C: return "Move C to memory : [16-bit address] = C";
        case Opcode.MOV_MEM_D: return "Move D to memory : [16-bit address] = D";

        // MOV Memory to Register (indirect via C:D)
        case Opcode.MOV_A_PTR_CD: return "Move indirect to A : A = [[C:D]] (double indirection)";
        case Opcode.MOV_B_PTR_CD: return "Move indirect to B : B = [[C:D]] (double indirection)";

        // MOV Register to Memory (indirect via C:D)
        case Opcode.MOV_PTR_CD_A: return "Move A to indirect : [C:D] = A";
        case Opcode.MOV_PTR_CD_B: return "Move B to indirect : [C:D] = B";


        // ALU
        case Opcode.ADD_A_IMM: return "Add : A = A + IMM (with carry flag update)";
        case Opcode.SUB_A_IMM: return "Subtract : A = A - IMM (with borrow flag update)";
        case Opcode.AND_A_IMM: return "Bitwise AND : A = A & IMM";
        case Opcode.OR_A_IMM: return "Bitwise OR : A = A | IMM";
        case Opcode.XOR_A_IMM: return "Bitwise XOR : A = A ^ IMM";

        case Opcode.ADD_B_IMM: return "Add : B = B + IMM (with carry flag update)";
        case Opcode.SUB_B_IMM: return "Subtract : B = B - IMM (with borrow flag update)";
        case Opcode.AND_B_IMM: return "Bitwise AND : B = B & IMM";
        case Opcode.OR_B_IMM: return "Bitwise OR : B = B | IMM";
        case Opcode.XOR_B_IMM: return "Bitwise XOR : B = B ^ IMM";

        case Opcode.ADD_C_IMM: return "Add : C = C + IMM (with carry flag update)";
        case Opcode.SUB_C_IMM: return "Subtract : C = C - IMM (with borrow flag update)";
        case Opcode.AND_C_IMM: return "Bitwise AND : C = C & IMM";
        case Opcode.OR_C_IMM: return "Bitwise OR : C = C | IMM";
        case Opcode.XOR_C_IMM: return "Bitwise XOR : C = C ^ IMM";

        case Opcode.ADD_D_IMM: return "Add : D = D + IMM (with carry flag update)";
        case Opcode.SUB_D_IMM: return "Subtract : D = D - IMM (with borrow flag update)";
        case Opcode.AND_D_IMM: return "Bitwise AND : D = D & IMM";
        case Opcode.OR_D_IMM: return "Bitwise OR : D = D | IMM";
        case Opcode.XOR_D_IMM: return "Bitwise XOR : D = D ^ IMM";

        case Opcode.NOT_A: return "Not A : A = !A";
        case Opcode.NOT_B: return "Not B : B = !B";
        case Opcode.NOT_C: return "Not C : C = !C";
        case Opcode.NOT_D: return "Not D : D = !D";

        case Opcode.INC_A: return "Increment A : A = A + 1";
        case Opcode.DEC_A: return "Decrement A : A = A - 1";
        case Opcode.INC_B: return "Increment B : B = B + 1";
        case Opcode.DEC_B: return "Decrement B : B = B - 1";
        case Opcode.INC_C: return "Increment C : C = C + 1";
        case Opcode.DEC_C: return "Decrement C : C = C - 1";
        case Opcode.INC_D: return "Increment D : D = D + 1";
        case Opcode.DEC_D: return "Decrement D : D = D - 1";

        // TEST avec immédiat
        case Opcode.TEST_A: return "Test A : set flags from A (update ZF if A == 0)";
        case Opcode.TEST_B: return "Test B : set flags from B (update ZF if B == 0)";
        case Opcode.TEST_C: return "Test C : set flags from C (update ZF if C == 0)";
        case Opcode.TEST_D: return "Test D : set flags from D (update ZF if D == 0)";

        // TEST register-register
        case Opcode.TEST_AA: return "Test A with A : set flags from A & A (logical AND without storing result)";
        case Opcode.TEST_AB: return "Test A with B : set flags from A & B (logical AND without storing result)";
        case Opcode.TEST_AC: return "Test A with C : set flags from A & C (logical AND without storing result)";
        case Opcode.TEST_AD: return "Test A with D : set flags from A & D (logical AND without storing result)";
        //case Opcode.TEST_BA: return "Test B with A : set flags from B & A (logical AND without storing result)";
        case Opcode.TEST_BB: return "Test B with B : set flags from B & B (logical AND without storing result)";
        case Opcode.TEST_BC: return "Test B with C : set flags from B & C (logical AND without storing result)";
        case Opcode.TEST_BD: return "Test B with D : set flags from B & D (logical AND without storing result)";
        //case Opcode.TEST_CA: return "Test C with A : set flags from C & A (logical AND without storing result)";
        //case Opcode.TEST_CB: return "Test C with B : set flags from C & B (logical AND without storing result)";
        case Opcode.TEST_CC: return "Test C with C : set flags from C & C (logical AND without storing result)";
        case Opcode.TEST_CD: return "Test C with D : set flags from C & D (logical AND without storing result)";
        //case Opcode.TEST_DA: return "Test D with A : set flags from D & A (logical AND without storing result)";
        //case Opcode.TEST_DB: return "Test D with B : set flags from D & B (logical AND without storing result)";
        //case Opcode.TEST_DC: return "Test D with C : set flags from D & C (logical AND without storing result)";
        case Opcode.TEST_DD: return "Test D with D : set flags from D & D (logical AND without storing result)";

        // CMP avec immédiat
        case Opcode.CMP_A_IMM: return "Compare A with immediate : set flags from A - immediate value";
        case Opcode.CMP_B_IMM: return "Compare B with immediate : set flags from B - immediate value";
        case Opcode.CMP_C_IMM: return "Compare C with immediate : set flags from C - immediate value";
        case Opcode.CMP_D_IMM: return "Compare D with immediate : set flags from D - immediate value";

        // CMP register-register
        case Opcode.CMP_AA: return "Compare A with A : set flags from A - A (always sets zero flag)";
        case Opcode.CMP_AB: return "Compare A with B : set flags from A - B";
        case Opcode.CMP_AC: return "Compare A with C : set flags from A - C";
        case Opcode.CMP_AD: return "Compare A with D : set flags from A - D";
        case Opcode.CMP_BA: return "Compare B with A : set flags from B - A";
        case Opcode.CMP_BB: return "Compare B with B : set flags from B - B (always sets zero flag)";
        case Opcode.CMP_BC: return "Compare B with C : set flags from B - C";
        case Opcode.CMP_BD: return "Compare B with D : set flags from B - D";
        case Opcode.CMP_CA: return "Compare C with A : set flags from C - A";
        case Opcode.CMP_CB: return "Compare C with B : set flags from C - B";
        case Opcode.CMP_CC: return "Compare C with C : set flags from C - C (always sets zero flag)";
        case Opcode.CMP_CD: return "Compare C with D : set flags from C - D";
        case Opcode.CMP_DA: return "Compare D with A : set flags from D - A";
        case Opcode.CMP_DB: return "Compare D with B : set flags from D - B";
        case Opcode.CMP_DC: return "Compare D with C : set flags from D - C";
        case Opcode.CMP_DD: return "Compare D with D : set flags from D - D (always sets zero flag)";

        // Shift
        case Opcode.SHL_A: return "Shift Left A : A = A << 1, MSB → carry flag";
        case Opcode.SHR_A: return "Shift Right A : A = A >> 1, LSB → carry flag";
        case Opcode.SHL_B: return "Shift Left B : B = B << 1, MSB → carry flag";
        case Opcode.SHR_B: return "Shift Right B : B = B >> 1, LSB → carry flag";
        case Opcode.SHL_C: return "Shift Left C : C = C << 1, MSB → carry flag";
        case Opcode.SHR_C: return "Shift Right C : C = C >> 1, LSB → carry flag";
        case Opcode.SHL_D: return "Shift Left D : D = D << 1, MSB → carry flag";
        case Opcode.SHR_D: return "Shift Right D : D = D >> 1, LSB → carry flag";
        case Opcode.SHL_A_N: return "Shift Left A by N bits : A = A << N";
        case Opcode.SHR_A_N: return "Shift Right A by N bits : A = A >> N";
        case Opcode.SHL_B_N: return "Shift Left A by N bits : A = A << N";
        case Opcode.SHR_B_N: return "Shift Right A by N bits : A = A >> N";
        case Opcode.SHL_C_N: return "Shift Left A by N bits : A = A << N";
        case Opcode.SHR_C_N: return "Shift Right A by N bits : A = A >> N";
        case Opcode.SHL_D_N: return "Shift Left A by N bits : A = A << N";
        case Opcode.SHR_D_N: return "Shift Right A by N bits : A = A >> N";

        // Rotate
        case Opcode.ROL_A: return "Rotate Left A through carry : A = (A << 1) | carry";
        case Opcode.ROR_A: return "Rotate Right A through carry : A = (A >> 1) | (carry << 7)";
        case Opcode.ROL_B: return "Rotate Left B through carry : B = (B << 1) | carry";
        case Opcode.ROR_B: return "Rotate Right B through carry : B = (B >> 1) | (carry << 7)";

        default: return "Unknown instruction";
    }
};


// Utile pour incrémenter PC correctement
export const getInstructionLength = (opcode: u8): number => {
    if (INSTRUCTIONS_WITH_OPERAND.includes(opcode)) {
        return 2; // opcode + 1 byte
    }
    if (INSTRUCTIONS_WITH_TWO_OPERANDS.includes(opcode)) {
        return 3; // opcode + 2 bytes
    }
    return 1; // opcode seul
};



export const buildMemoryInstructionMap = (data: Map<u16, u8> | [u16, u8][]) => {
    const entries = Array.isArray(data) ? data : Array.from(data.entries());
    const sorted = entries.sort(([a], [b]) => a - b);

    const isInstruction = new Map<number, boolean>();
    const operandAddresses = new Set<number>();

    for (const [address, value] of sorted) {
        // Si déjà marqué comme opérande, ce n'est pas une instruction
        if (operandAddresses.has(address)) {
            isInstruction.set(address, false);
            continue;
        }

        // Si c'est un opcode valide, c'est une instruction
        if (Object.values(Opcode).includes(value)) {
            isInstruction.set(address, true);

            // Marquer les opérandes suivants
            if (INSTRUCTIONS_WITH_OPERAND.includes(value)) {
                operandAddresses.add(address + 1);
            }
            if (INSTRUCTIONS_WITH_TWO_OPERANDS.includes(value)) {
                operandAddresses.add(address + 1);
                operandAddresses.add(address + 2);
            }

        } else {
            isInstruction.set(address, false);
        }
    }

    return isInstruction;
}



/*
# Instruction à ajouter
- CMP A, B (comparer sans modifier A)
- SHL/SHR (shifts)
- NEG (negate)
- DJNZ (decrement and jump if not zero - super utile pour les loops)

# Syscalls

arch	syscall NR	return	arg0	arg1	arg2	arg3	arg4	arg5
arm	    r7	        r0      r0	    r1	    r2	    r3	    r4	    r5
arm64	x8	        x0	    x0	    x1	    x2	    x3	    x4	    x5
x86	    eax	        eax	    ebx	    ecx	    edx	    esi	    edi	    ebp
x86_64	rax	        rax	    rdi	    rsi	    rdx	    r10	    r8	    r9

SYSCALL = int 80h

SYSCALL 0x00  (0)  # read
SYSCALL 0x01  (1)  # write
SYSCALL 0x02  (2)  # open
SYSCALL 0x03  (3)  # close
SYSCALL 0x04  (4)  # stat
SYSCALL 0x05  (5)  # fstat
SYSCALL 0x13 (19)  # readv
SYSCALL 0x14 (20)  # writev
SYSCALL 0x16 (22)  # pipe
SYSCALL 0x23 (35)  # nanosleep
SYSCALL 0x27 (39)  # getpid
SYSCALL 0x30 (48)  # shutdown
SYSCALL 0x39 (57)  # fork
SYSCALL 0x3b (59)  # execve
SYSCALL 0x3d (61)  # wait4
SYSCALL 0x3e (62)  # kill
SYSCALL 0x50 (80)  # chdir
SYSCALL 0x52 (82)  # rename
SYSCALL 0x53 (83)  # mkdir
SYSCALL 0x54 (84)  # rmdir
SYSCALL 0x57 (87)  # unlink
SYSCALL 0x5A (90)  # chmod
SYSCALL 0x5C (92)  # chown
SYSCALL 0x63 (99)  # sysinfo
SYSCALL 0x66 (102)  # getuid
SYSCALL 0xA9 (169)  # reboot

SYSCALL -  # print_char(A) - Afficher caractère
SYSCALL -  # print_char(A) - Afficher caractère
SYSCALL -  # read_char() -> A - Lire caractère
SYSCALL -  # print_string(C:D) - Afficher string
SYSCALL -  # clear_screen()

# Fichiers
SYSCALL -  # open(C:D=filename, A=mode) -> A=handle
SYSCALL -  # read(A=handle) -> B=byte
SYSCALL -  # write(A=handle, B=byte)
SYSCALL -  # close(A=handle)
SYSCALL -  # delete(C:D=filename)

# Processus
SYSCALL 0x3C (60)  # exit(A=code)
SYSCALL -  # sleep(A=ticks)
SYSCALL -  # get_time() -> C:D=timestamp

# Mémoire
SYSCALL -  # malloc(C:D=size) -> C:D=ptr
SYSCALL -  # free(C:D=ptr)

*/
