
export enum Opcode {

    // CONTROL
    NOP = 0x00,
    HALT = 0x01,
    CALL = 0x02,
    RET = 0x03,

    // INTERRUPTS
    //INT = 0x04,     // TODO
    //EI = 0x05,      // TODO   // Enable Interrupts
    //DI = 0x06,      // TODO   // Disable Interrupts
    //IRET = 0x07,    // TODO   // Return from Interrupt
    //SYSCALL = 0x08, // TODO

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

    // MOV
    MOV_REG_IMM = 0x20,
    MOV_REG_REG = 0x21,
    MOV_REG_MEM = 0x22,
    MOV_MEM_REG = 0x23,
    MOV_MEM_IMM = 0x24,

    // STACK
    PUSH_REG = 0x25,
    POP_REG = 0x26,

    // ALU
    INC_REG = 0x30,
    DEC_REG = 0x31,
    NOT_REG = 0x32,

    ADD_REG_IMM = 0x33,
    ADD_REG_REG = 0x34,
    ADD_REG_MEM = 0x35,
    ADD_MEM_IMM = 0x36,
    ADD_MEM_REG = 0x37,

    SUB_REG_IMM = 0x38,
    SUB_REG_REG = 0x39,
    SUB_REG_MEM = 0x3A,
    SUB_MEM_IMM = 0x3B,
    SUB_MEM_REG = 0x3C,

    AND_REG_IMM = 0x3D,
    AND_REG_REG = 0x3E,
    AND_REG_MEM = 0x3F,
    AND_MEM_IMM = 0x40,
    AND_MEM_REG = 0x41,

    OR_REG_IMM = 0x42,
    OR_REG_REG = 0x43,
    OR_REG_MEM = 0x44,
    OR_MEM_IMM = 0x45,
    OR_MEM_REG = 0x46,

    XOR_REG_IMM = 0x47,
    XOR_REG_REG = 0x48,
    XOR_REG_MEM = 0x49,
    XOR_MEM_IMM = 0x4A,
    XOR_MEM_REG = 0x4B,

    // TESTS
    CMP_REG_IMM = 0x50,
    CMP_REG_REG = 0x51,
    CMP_REG_MEM = 0x52,

    TEST_REG_IMM = 0x53,
    TEST_REG_REG = 0x54,
    TEST_REG_MEM = 0x55,

    // TODO

    // BIT SHIFT
    ROL = 0x48,     // Rotate Left (avec carry)
    ROR = 0x49,     // Rotate Right (avec carry)
    RCL = 0x4A,     // Rotate Left through Carry
    RCR = 0x4B,     // Rotate Right through Carry
    SHL = 0x4C,     // Shift Left (val << 1)
    SHR = 0x4D,     // Shift Right (val >> 1)
    SHL_IMM = 0x4E, // Shift Left, N bits
    SHR_IMM = 0x4F, // Shift Right, N bits
    // LEA = 0x..

};

