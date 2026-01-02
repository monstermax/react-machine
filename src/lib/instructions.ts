
// Instructions
export enum Opcode {
    NOP = 0x00,
    LOAD_A = 0x01,     // LOAD A, immediate (8-bit)
    LOAD_B = 0x02,     // LOAD B, immediate (8-bit)
    ADD = 0x03,
    SUB = 0x04,
    AND = 0x05,
    OR = 0x06,
    XOR = 0x07,
    INC_A = 0x08,
    DEC_A = 0x09,
    INC_B = 0x0A,
    DEC_B = 0x0B,
    JMP = 0x10,        // JMP addr16 (16-bit address)
    JZ = 0x11,         // JZ addr16 (16-bit address)
    JNZ = 0x12,        // JNZ addr16 (16-bit address)
    JC = 0x13,         // JC addr16 (16-bit address)
    STORE = 0x20,      // STORE addr16 (16-bit address)
    LOAD_MEM = 0x21,   // LOAD_MEM addr16 (16-bit address)
    SYSCALL = 0x80,
    HALT = 0xFF,
}


// Instructions avec 1 opérande 8-bit
export const INSTRUCTIONS_WITH_OPERAND = [
    Opcode.LOAD_A,
    Opcode.LOAD_B,
    Opcode.SYSCALL,
];


// Instructions avec 1 opérande 16-bit (2 bytes: low, high)
export const INSTRUCTIONS_WITH_TWO_OPERANDS = [
    Opcode.JMP,
    Opcode.JZ,
    Opcode.JNZ,
    Opcode.JC,
    Opcode.STORE,
    Opcode.LOAD_MEM,
];


export const getOpcodeName = (opcode: number): string => {
    switch (opcode) {
        case Opcode.NOP: return "NOP";
        case Opcode.LOAD_A: return "LOAD A";
        case Opcode.LOAD_B: return "LOAD B";
        case Opcode.ADD: return "ADD";
        case Opcode.SUB: return "SUB";
        case Opcode.AND: return "AND";
        case Opcode.OR: return "OR";
        case Opcode.XOR: return "XOR";
        case Opcode.INC_A: return "INC A";
        case Opcode.DEC_A: return "DEC A";
        case Opcode.INC_B: return "INC B";
        case Opcode.DEC_B: return "DEC B";
        case Opcode.JMP: return "JMP";
        case Opcode.JZ: return "JZ";
        case Opcode.JNZ: return "JNZ";
        case Opcode.JC: return "JC";
        case Opcode.STORE: return "STORE";
        case Opcode.LOAD_MEM: return "LOAD";
        case Opcode.SYSCALL: return "SYSCALL";
        case Opcode.HALT: return "HALT";
        default: return "???";
    }
};
