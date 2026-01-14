
import type { u16, u8 } from "@/types/cpu.types";

// 8086 instruction set
// https://www.eng.auburn.edu/~sylee/ee2220/8086_instruction_set.html
// https://www.tutorialspoint.com/microprocessor/microprocessor_8086_instruction_sets.htm
// https://www.geeksforgeeks.org/electronics-engineering/8086-instruction-set/


// Instructions
export enum Opcode {
    // Contrôle
    NOP = 0x00,
    GET_FREQ = 0x0A,
    SET_FREQ = 0x0B,
    BREAKPOINT_JS = 0x0C,
    BREAKPOINT = 0x0D,
    SYSCALL = 0x0E,
    HALT = 0x0F,

    // Cores
    CORE_HALT = 0xE0,
    CORE_START = 0xE1,

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

    // Stack (0x30-0x37)
    PUSH_A = 0x30,     // PUSH A
    PUSH_B = 0x31,     // PUSH B
    PUSH_C = 0x32,     // PUSH C
    PUSH_D = 0x33,     // PUSH D
    POP_A = 0x34,      // POP A
    POP_B = 0x35,      // POP B
    POP_C = 0x36,      // POP C
    POP_D = 0x37,      // POP D

    // Contrôle Stack (0x3A-0x3C)
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

    //XCHG_A_B = 0x50,  // Échange A et B

    // MOV Instructions (Register to Register)
    MOV_AB = 0x90,  // Move A to B
    MOV_AC = 0x91,  // Move A to C  
    MOV_AD = 0x92,  // Move A to D
    MOV_BA = 0x93,  // Move B to A
    MOV_BC = 0x94,  // Move B to C
    MOV_BD = 0x95,  // Move B to D
    MOV_CA = 0x96,  // Move C to A
    MOV_CB = 0x97,  // Move C to B
    MOV_CD = 0x98,  // Move C to D
    MOV_DA = 0x99,  // Move D to A
    MOV_DB = 0x9A,  // Move D to B
    MOV_DC = 0x9B,  // Move D to C

    // MOV with Immediate (8-bit)
    MOV_A_IMM = 0x9C,  // MOV A, imm8
    MOV_B_IMM = 0x9D,  // MOV B, imm8
    MOV_C_IMM = 0x9E,  // MOV C, imm8
    MOV_D_IMM = 0x9F,  // MOV D, imm8

    // MOV Memory to Register
    MOV_A_MEM = 0xA0,  // MOV A, [addr16]
    MOV_B_MEM = 0xA1,  // MOV B, [addr16]
    MOV_C_MEM = 0xA2,  // MOV C, [addr16]
    MOV_D_MEM = 0xA3,  // MOV D, [addr16]

    // MOV Register to Memory
    MOV_MEM_A = 0xA4,  // MOV [addr16], A
    MOV_MEM_B = 0xA5,  // MOV [addr16], B
    MOV_MEM_C = 0xA6,  // MOV [addr16], C
    MOV_MEM_D = 0xA7,  // MOV [addr16], D

    // MOV Memory to Register (indirect via C:D)
    MOV_A_PTR_CD = 0xA8,  // A = [[C:D]]
    MOV_B_PTR_CD = 0xA9,  // B = [[C:D]]

    // MOV Register to Memory (indirect via C:D)
    MOV_PTR_CD_A = 0xAA,  // [C:D] = A
    MOV_PTR_CD_B = 0xAB,  // [C:D] = B
}

/*
# Instruction à ajouter
- CMP A, B (comparer sans modifier A)
- SHL/SHR (shifts)
- NEG (negate)
- DJNZ (decrement and jump if not zero - super utile pour les loops)

# I/O
SYSCALL 0x01  # print_char(A) - Afficher caractère
SYSCALL 0x02  # read_char() -> A - Lire caractère
SYSCALL 0x03  # print_string(C:D) - Afficher string
SYSCALL 0x04  # clear_screen()

# Fichiers
SYSCALL 0x10  # open(C:D=filename, A=mode) -> A=handle
SYSCALL 0x11  # read(A=handle) -> B=byte
SYSCALL 0x12  # write(A=handle, B=byte)
SYSCALL 0x13  # close(A=handle)
SYSCALL 0x14  # delete(C:D=filename)

# Processus
SYSCALL 0x20  # exit(A=code)
SYSCALL 0x21  # sleep(A=ticks)
SYSCALL 0x22  # get_time() -> C:D=timestamp

# Mémoire
SYSCALL 0x30  # malloc(C:D=size) -> C:D=ptr
SYSCALL 0x31  # free(C:D=ptr)
*/


// Instructions avec 1 opérande 8-bit
export const INSTRUCTIONS_WITH_OPERAND = [
    Opcode.MOV_A_IMM,
    Opcode.MOV_B_IMM,
    Opcode.MOV_C_IMM,
    Opcode.MOV_D_IMM,
    Opcode.SYSCALL,
    Opcode.SET_FREQ,
    Opcode.CORE_HALT,
    Opcode.CORE_START,
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

