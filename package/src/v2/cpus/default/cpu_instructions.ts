
import type { u16, u8 } from "@/types/cpu.types";

// 8086 instruction set
// https://www.eng.auburn.edu/~sylee/ee2220/8086_instruction_set.html
// https://www.tutorialspoint.com/microprocessor/microprocessor_8086_instruction_sets.htm
// https://www.geeksforgeeks.org/electronics-engineering/8086-instruction-set/


// Instructions
export enum Opcode {
    // Contrôle
    NOP = 0x00,
    GET_FREQ = 0x0A,        // <=== TODO: a remplacer par un Device IO
    SET_FREQ = 0x0B,        // <=== TODO: a remplacer par un Device IO
    BREAKPOINT_JS = 0x0C,
    BREAKPOINT = 0x0D,
    SYSCALL = 0x0E,
    HALT = 0x0F,

    // Cores
    CORE_HALT = 0xE0,
    CORE_START = 0xE1,
    CORE_INIT = 0xE2,
    CORE_STATUS = 0xE3,
    CORES_COUNT = 0xE4,

    // CPUs
    CPU_HALT = 0xE8,
    CPU_START = 0xE9,
    CPU_INIT = 0xEA,
    CPU_STATUS = 0xEB,
    CPUS_COUNT = 0xEC,

    // Registers
    //R_LOAD_A = 0x10,     // R_LOAD A, immediate (8-bit) => remplacé par MOV_A_IMM
    //R_LOAD_B = 0x11,     // R_LOAD B, immediate (8-bit) => remplacé par MOV_B_IMM
    //R_LOAD_C = 0x12,     // R_LOAD C, immediate (8-bit) => remplacé par MOV_C_IMM
    //R_LOAD_D = 0x13,     // R_LOAD D, immediate (8-bit) => remplacé par MOV_D_IMM

    // Memory
    //M_STORE_A = 0x14,  // M_STORE A, addr16 (16-bit address) => remplacé par MOV_MEM_A
    //M_STORE_B = 0x15,  // M_STORE B, addr16 (16-bit address) => remplacé par MOV_MEM_B
    //M_STORE_C = 0x16,  // M_STORE C, addr16 (16-bit address) => remplacé par MOV_MEM_C
    //M_STORE_D = 0x17,  // M_STORE D, addr16 (16-bit address) => remplacé par MOV_MEM_D
    //M_LOAD_A = 0x18,   // M_LOAD A, addr16 (16-bit address) => remplacé par MOV_A_MEM
    //M_LOAD_B = 0x19,   // M_LOAD B, addr16 (16-bit address) => remplacé par MOV_B_MEM
    //M_LOAD_C = 0x1A,   // M_LOAD C, addr16 (16-bit address) => remplacé par MOV_C_MEM
    //M_LOAD_D = 0x1B,   // M_LOAD D, addr16 (16-bit address) => remplacé par MOV_D_MEM

    // ALU
    ADD = 0x20,        // A = A + B
    SUB = 0x21,        // A = A - B
    AND = 0x22,        // A = A & B
    OR = 0x23,         // A = A | B
    XOR = 0x24,        // A = A ^ B

    INC_A = 0x25,
    DEC_A = 0x26,
    INC_B = 0x27,
    DEC_B = 0x28,
    INC_C = 0x29,
    DEC_C = 0x2A,
    INC_D = 0x2B,
    DEC_D = 0x2C,


    ADD_AA = 0x50,        // A = A + A
    SUB_AA = 0x60,        // A = A - A
    AND_AA = 0x70,        // A = A & A
    OR_AA = 0x80,         // A = A | A
    XOR_AA = 0x90,        // A = A ^ A

    ADD_AB = 0x51,        // A = A + B
    SUB_AB = 0x61,        // A = A - B
    AND_AB = 0x71,        // A = A & B
    OR_AB = 0x81,         // A = A | B
    XOR_AB = 0x91,        // A = A ^ B

    ADD_AC = 0x52,        // A = A + C
    SUB_AC = 0x62,        // A = A - C
    AND_AC = 0x72,        // A = A & C
    OR_AC = 0x82,         // A = A | C
    XOR_AC = 0x92,        // A = A ^ C

    ADD_AD = 0x53,        // A = A + D
    SUB_AD = 0x63,        // A = A - D
    AND_AD = 0x73,        // A = A & D
    OR_AD = 0x83,         // A = A | D
    XOR_AD = 0x93,        // A = A ^ D


    ADD_BA = 0x54,        // B = B + A
    SUB_BA = 0x64,        // B = B - A
    AND_BA = 0x74,        // B = B & A
    OR_BA = 0x84,         // B = B | A
    XOR_BA = 0x94,        // B = B ^ A

    SUB_BB = 0x65,        // B = B - B
    ADD_BB = 0x55,        // B = B + B
    AND_BB = 0x75,        // B = B & B
    OR_BB = 0x85,         // B = B | B
    XOR_BB = 0x95,        // B = B ^ B

    ADD_BC = 0x56,        // B = B + C
    SUB_BC = 0x66,        // B = B - C
    AND_BC = 0x76,        // B = B & C
    OR_BC = 0x86,         // B = B | C
    XOR_BC = 0x96,        // B = B ^ C

    ADD_BD = 0x57,        // B = B + D
    SUB_BD = 0x67,        // B = B - D
    AND_BD = 0x77,        // B = B & D
    OR_BD = 0x87,         // B = B | D
    XOR_BD = 0x97,        // B = B ^ D


    ADD_CA = 0x58,        // C = C + A
    SUB_CA = 0x68,        // C = C - A
    AND_CA = 0x78,        // C = C & A
    OR_CA = 0x88,         // C = C | A
    XOR_CA = 0x98,        // C = C ^ A

    SUB_CB = 0x69,        // C = C - B
    ADD_CB = 0x59,        // C = C + B
    AND_CB = 0x79,        // C = C & B
    OR_CB = 0x89,         // C = C | B
    XOR_CB = 0x99,        // C = C ^ B

    ADD_CC = 0x5A,        // C = C + C
    SUB_CC = 0x6A,        // C = C - C
    AND_CC = 0x7A,        // C = C & C
    OR_CC = 0x8A,         // C = C | C
    XOR_CC = 0x9A,        // C = C ^ C

    ADD_CD = 0x5B,        // C = C + D
    SUB_CD = 0x6B,        // C = C - D
    AND_CD = 0x7B,        // C = C & D
    OR_CD = 0x8B,         // C = C | D
    XOR_CD = 0x9B,        // C = C ^ D


    ADD_DA = 0x5C,        // D = D + A
    SUB_DA = 0x6C,        // D = D - A
    AND_DA = 0x7C,        // D = D & A
    OR_DA = 0x8C,         // D = D | A
    XOR_DA = 0x9C,        // D = D ^ A

    SUB_DB = 0x6D,        // D = D - B
    ADD_DB = 0x5D,        // D = D + B
    AND_DB = 0x7D,        // D = D & B
    OR_DB = 0x8D,         // D = D | B
    XOR_DB = 0x9D,        // D = D ^ B

    ADD_DC = 0x5E,        // D = D + C
    SUB_DC = 0x6E,        // D = D - C
    AND_DC = 0x7E,        // D = D & C
    OR_DC = 0x8E,         // D = D | C
    XOR_DC = 0x9E,        // D = D ^ C

    ADD_DD = 0x5F,        // D = D + D
    SUB_DD = 0x6F,        // D = D - D
    AND_DD = 0x7F,        // D = D & D
    OR_DD = 0x8F,         // D = D | D
    XOR_DD = 0x9F,        // D = D ^ D


    // Stack (0x30-0x37)
    PUSH_A = 0x30,     // PUSH A
    PUSH_B = 0x31,     // PUSH B
    PUSH_C = 0x32,     // PUSH C
    PUSH_D = 0x33,     // PUSH D
    POP_A = 0x34,      // POP A
    POP_B = 0x35,      // POP B
    POP_C = 0x36,      // POP C
    POP_D = 0x37,      // POP D

    // Contrôle Stack (0x39-0x3C)
    GET_SP = 0x39,     // GET SP
    SET_SP = 0x3A,     // SET SP, imm16
    CALL = 0x3B,       // CALL addr16 (push PC+3, then JMP)
    RET = 0x3C,        // RET (pop PC)

    // Interrupts (0x3D-0x3F)
    EI = 0x3D,         // Enable Interrupts
    DI = 0x3E,         // Disable Interrupts
    IRET = 0x3F,       // Return from Interrupt

    // Sauts
    JMP = 0x40,        // JMP addr16 (16-bit address)
    JZ = 0x41,         // JZ addr16 (16-bit address)
    JNZ = 0x42,        // JNZ addr16 (16-bit address)
    JC = 0x43,         // JC addr16 (16-bit address)
    JNC = 0x44,        // JNC addr16 (16-bit address)

    // MOV Instructions (Register to Register)
    MOV_AB = 0xA0,  // Move A to B
    MOV_AC = 0xA1,  // Move A to C  
    MOV_AD = 0xA2,  // Move A to D
    MOV_BA = 0xA3,  // Move B to A
    MOV_BC = 0xA4,  // Move B to C
    MOV_BD = 0xA5,  // Move B to D
    MOV_CA = 0xA6,  // Move C to A
    MOV_CB = 0xA7,  // Move C to B
    MOV_CD = 0xA8,  // Move C to D
    MOV_DA = 0xA9,  // Move D to A
    MOV_DB = 0xAA,  // Move D to B
    MOV_DC = 0xAB,  // Move D to C

    // MOV with Immediate (8-bit)
    MOV_A_IMM = 0xAC,  // MOV A, imm8
    MOV_B_IMM = 0xAD,  // MOV B, imm8
    MOV_C_IMM = 0xAE,  // MOV C, imm8
    MOV_D_IMM = 0xAF,  // MOV D, imm8

    // MOV Memory to Register
    MOV_A_MEM = 0xB0,  // MOV A, [addr16]
    MOV_B_MEM = 0xB1,  // MOV B, [addr16]
    MOV_C_MEM = 0xB2,  // MOV C, [addr16]
    MOV_D_MEM = 0xB3,  // MOV D, [addr16]

    // MOV Register to Memory
    MOV_MEM_A = 0xB4,  // MOV [addr16], A
    MOV_MEM_B = 0xB5,  // MOV [addr16], B
    MOV_MEM_C = 0xB6,  // MOV [addr16], C
    MOV_MEM_D = 0xB7,  // MOV [addr16], D

    // MOV Memory to Register (indirect via C:D)
    MOV_A_PTR_CD = 0xB8,  // A = [[C:D]]
    MOV_B_PTR_CD = 0xB9,  // B = [[C:D]]

    // MOV Register to Memory (indirect via C:D)
    MOV_PTR_CD_A = 0xBA,  // [C:D] = A
    MOV_PTR_CD_B = 0xBB,  // [C:D] = B
}


// Instructions avec 1 opérande 8-bit
export const INSTRUCTIONS_WITH_OPERAND = [
    Opcode.MOV_A_IMM,
    Opcode.MOV_B_IMM,
    Opcode.MOV_C_IMM,
    Opcode.MOV_D_IMM,
    Opcode.SYSCALL,
    Opcode.SET_FREQ,
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

        // ALU
        case Opcode.ADD: return "ADD";
        case Opcode.SUB: return "SUB";
        case Opcode.AND: return "AND";
        case Opcode.OR: return "OR";
        case Opcode.XOR: return "XOR";
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

        // ALU
        case Opcode.ADD: return "Add : A = A + B (with carry flag update)";
        case Opcode.SUB: return "Subtract : A = A - B (with borrow flag update)";
        case Opcode.AND: return "Bitwise AND : A = A & B";
        case Opcode.OR: return "Bitwise OR : A = A | B";
        case Opcode.XOR: return "Bitwise XOR : A = A ^ B";
        case Opcode.INC_A: return "Increment A : A = A + 1";
        case Opcode.DEC_A: return "Decrement A : A = A - 1";
        case Opcode.INC_B: return "Increment B : B = B + 1";
        case Opcode.DEC_B: return "Decrement B : B = B - 1";
        case Opcode.INC_C: return "Increment C : C = C + 1";
        case Opcode.DEC_C: return "Decrement C : C = C - 1";
        case Opcode.INC_D: return "Increment D : D = D + 1";
        case Opcode.DEC_D: return "Decrement D : D = D - 1";

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
