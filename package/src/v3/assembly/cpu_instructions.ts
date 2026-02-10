
export enum Opcode {

    // CONTROL
    NOP = 0x00,
    HALT = 0x01,

    // JUMP
    JMP = 0x10, // Jump
    JZ = 0x11,  // Jump if Zero (Equals)
    JNZ = 0x12, // Jump if Not Zero (Not Equals)
    JC = 0x13,  // Jump if Carry
    JNC = 0x14, // Jump if Not Carry
    JL = 0x15,  // Jump if Lower
    JLE = 0x16, // Jump if Lower or Equals
    JG = 0x17,  // Jump if Greater
    JGE = 0x18, // Jump if Greater or Equals
    JE = JZ,    // Jump if Equals (Zero)
    JNE = JNZ,  // Jump if Not Equals (Not Zero)
    JA = JG,    // Jump if Greater
    JAE = JGE,  // Jump if Greater or Equals
    JB = JL,    // Jump if Lower
    JBE = JLE,  // Jump if Lower or Equals

    // REGISTER A
    MOV_A_IMM = 0x20,
    MOV_A_REG = 0x21,
    MOV_A_MEM = 0x22,
    MOV_MEM_A = 0x23,

    PUSH_A = 0x24,
    POP_A = 0x25,

    INC_A = 0x26,
    DEC_A = 0x27,
    NOT_A = 0x28,

    ADD_A_IMM = 0x29,
    ADD_A_REG = 0x2A,
    ADD_A_MEM = 0x2B,

    SUB_A_IMM = 0x2C,
    SUB_A_REG = 0x2D,
    SUB_A_MEM = 0x2E,

    AND_A_IMM = 0x2F,
    AND_A_REG = 0x30,
    AND_A_MEM = 0x31,

    OR_A_IMM = 0x32,
    OR_A_REG = 0x33,
    OR_A_MEM = 0x34,

    XOR_A_IMM = 0x35,
    XOR_A_REG = 0x36,
    XOR_A_MEM = 0x37,

    CMP_A_IMM = 0x38,
    CMP_A_REG = 0x39,
    CMP_A_MEM = 0x3A,

    TEST_A_IMM = 0x3B,
    TEST_A_REG = 0x3C,
    TEST_A_MEM = 0x3D,
};

