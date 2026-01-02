
// Instructions
export enum Opcode {
    // Contrôle
    NOP = 0x00,
    SYSCALL = 0x0E,
    HALT = 0x0F,

    // Registers
    R_LOAD_A = 0x10,     // R_LOAD A, immediate (8-bit)
    R_LOAD_B = 0x11,     // R_LOAD B, immediate (8-bit)
    R_LOAD_C = 0x12,     // R_LOAD C, immediate (8-bit)
    R_LOAD_D = 0x13,     // R_LOAD D, immediate (8-bit)

    // Memory
    M_STORE_A = 0x14,  // M_STORE A, addr16 (16-bit address)
    M_STORE_B = 0x15,  // M_STORE B, addr16 (16-bit address)
    M_STORE_C = 0x16,  // M_STORE C, addr16 (16-bit address)
    M_STORE_D = 0x17,  // M_STORE D, addr16 (16-bit address)
    M_LOAD_A = 0x18,   // M_LOAD A, addr16 (16-bit address)
    M_LOAD_B = 0x19,   // M_LOAD B, addr16 (16-bit address)
    M_LOAD_C = 0x1A,   // M_LOAD C, addr16 (16-bit address)
    M_LOAD_D = 0x1B,   // M_LOAD D, addr16 (16-bit address)

    // ALU
    ADD = 0x20,
    SUB = 0x21,
    AND = 0x22,
    OR = 0x23,
    XOR = 0x24,
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
    //PUSH_FLAGS = 0x3E, // push flags
    //POP_FLAGS = 0x3F,  // pop flags

    // Interrupts (0x3D-0x3F)
    EI = 0x3D,         // Enable Interrupts
    DI = 0x3E,         // Disable Interrupts
    IRET = 0x3F,       // Return from Interrupt

    // Sauts
    JMP = 0x40,        // JMP addr16 (16-bit address)
    JZ = 0x41,         // JZ addr16 (16-bit address)
    JNZ = 0x42,        // JNZ addr16 (16-bit address)
    JC = 0x43,         // JC addr16 (16-bit address)

    //XCHG_A_B = 0x50,  // Échange A et B

}


// Instructions avec 1 opérande 8-bit
export const INSTRUCTIONS_WITH_OPERAND = [
    Opcode.R_LOAD_A,
    Opcode.R_LOAD_B,
    Opcode.R_LOAD_C,
    Opcode.R_LOAD_D,
    Opcode.SYSCALL,
];


// Instructions avec 1 opérande 16-bit (2 bytes: low, high)
export const INSTRUCTIONS_WITH_TWO_OPERANDS = [
    Opcode.JMP,
    Opcode.JZ,
    Opcode.JNZ,
    Opcode.JC,
    Opcode.M_STORE_A,
    Opcode.M_STORE_B,
    Opcode.M_STORE_C,
    Opcode.M_STORE_D,
    Opcode.M_LOAD_A,
    Opcode.M_LOAD_B,
    Opcode.M_LOAD_C,
    Opcode.M_LOAD_D,
    Opcode.SET_SP,
    Opcode.CALL,
];


//export const STACK_INSTRUCTIONS = [
//    Opcode.PUSH_A,
//    Opcode.POP_A,
//    Opcode.CALL,
//    Opcode.RET,
//    Opcode.SET_SP,
//];


export const getOpcodeName = (opcode: number): string => {
    switch (opcode) {
        case Opcode.NOP: return "NOP";
        case Opcode.R_LOAD_A: return "LOAD A";
        case Opcode.R_LOAD_B: return "LOAD B";
        case Opcode.R_LOAD_C: return "LOAD C";
        case Opcode.R_LOAD_D: return "LOAD D";
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
        case Opcode.JMP: return "JMP";
        case Opcode.JZ: return "JZ";
        case Opcode.JNZ: return "JNZ";
        case Opcode.JC: return "JC";
        case Opcode.M_STORE_A: return "STORE_MEM_A";
        case Opcode.M_STORE_B: return "STORE_MEM_B";
        case Opcode.M_STORE_C: return "STORE_MEM_C";
        case Opcode.M_STORE_D: return "STORE_MEM_D";
        case Opcode.M_LOAD_A: return "LOAD_MEM_A";
        case Opcode.M_LOAD_B: return "LOAD_MEM_B";
        case Opcode.M_LOAD_C: return "LOAD_MEM_C";
        case Opcode.M_LOAD_D: return "LOAD_MEM_D";
        case Opcode.SYSCALL: return "SYSCALL";
        case Opcode.PUSH_A: return "PUSH A";
        case Opcode.PUSH_B: return "PUSH B";
        case Opcode.PUSH_C: return "PUSH C";
        case Opcode.PUSH_D: return "PUSH D";
        case Opcode.POP_A: return "POP A";
        case Opcode.POP_B: return "POP B";
        case Opcode.POP_C: return "POP C";
        case Opcode.POP_D: return "POP D";
        case Opcode.SET_SP: return "SET SP";
        case Opcode.CALL: return "CALL";
        case Opcode.RET: return "RET";
        case Opcode.EI: return "EI";
        case Opcode.DI: return "DI";
        case Opcode.IRET: return "IRET";
        case Opcode.HALT: return "HALT";
        default: return "???";
    }

};

// Utile pour incrémenter PC correctement
export const getInstructionLength = (opcode: number): number => {
    if (INSTRUCTIONS_WITH_OPERAND.includes(opcode)) {
        return 2; // opcode + 1 byte
    }
    if (INSTRUCTIONS_WITH_TWO_OPERANDS.includes(opcode)) {
        return 3; // opcode + 2 bytes
    }
    return 1; // opcode seul
};
