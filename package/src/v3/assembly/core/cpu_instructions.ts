
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
    SET_SP = 0x27,

    // ALU
    INC_REG = 0x30,
    INC_MEM = 0x31,
    DEC_REG = 0x32,
    DEC_MEM = 0x33,
    NOT_REG = 0x34,
    NOT_MEM = 0x35,

    ADD_REG_IMM = 0x36,
    ADD_REG_REG = 0x37,
    ADD_REG_MEM = 0x38,
    ADD_MEM_IMM = 0x39,
    ADD_MEM_REG = 0x3A,

    SUB_REG_IMM = 0x3B,
    SUB_REG_REG = 0x3C,
    SUB_REG_MEM = 0x3D,
    SUB_MEM_IMM = 0x3E,
    SUB_MEM_REG = 0x3F,

    AND_REG_IMM = 0x40,
    AND_REG_REG = 0x41,
    AND_REG_MEM = 0x42,
    AND_MEM_IMM = 0x43,
    AND_MEM_REG = 0x44,

    OR_REG_IMM = 0x45,
    OR_REG_REG = 0x46,
    OR_REG_MEM = 0x47,
    OR_MEM_IMM = 0x48,
    OR_MEM_REG = 0x49,

    XOR_REG_IMM = 0x4A,
    XOR_REG_REG = 0x4B,
    XOR_REG_MEM = 0x4C,
    XOR_MEM_IMM = 0x4D,
    XOR_MEM_REG = 0x4E,

    // TESTS
    CMP_REG_IMM = 0x50,
    CMP_REG_REG = 0x51,
    CMP_REG_MEM = 0x52,

    TEST_REG_IMM = 0x53,
    TEST_REG_REG = 0x54,
    TEST_REG_MEM = 0x55,

    // TODO

    // BITS ROL
    ROL_REG_IMM = 0x60,     // Rotate Left (avec carry)
    ROL_REG_REG = 0x61,     // Rotate Left (avec carry)
    ROL_REG_MEM = 0x62,     // Rotate Left (avec carry)
    ROL_MEM_IMM = 0x63,     // Rotate Left (avec carry)
    ROL_MEM_REG = 0x64,     // Rotate Left (avec carry)
    ROR_REG_IMM = 0x65,     // Rotate Right (avec carry)
    ROR_REG_REG = 0x66,     // Rotate Right (avec carry)
    ROR_REG_MEM = 0x67,     // Rotate Right (avec carry)
    ROR_MEM_IMM = 0x68,     // Rotate Right (avec carry)
    ROR_MEM_REG = 0x69,     // Rotate Right (avec carry)

    RCL_REG_IMM = 0x6A,     // Rotate Left through Carry
    RCL_REG_REG = 0x6B,     // Rotate Left through Carry
    RCL_REG_MEM = 0x6C,     // Rotate Left through Carry
    RCL_MEM_IMM = 0x6D,     // Rotate Left through Carry
    RCL_MEM_REG = 0x6E,     // Rotate Left through Carry
    RCR_REG_IMM = 0x6F,     // Rotate Right through Carry
    RCR_REG_REG = 0x70,     // Rotate Right through Carry
    RCR_REG_MEM = 0x71,     // Rotate Right through Carry
    RCR_MEM_IMM = 0x72,     // Rotate Right through Carry
    RCR_MEM_REG = 0x73,     // Rotate Right through Carry

    // BITS SHIFT
    SHL_REG_IMM = 0x74, // Shift Left, N bits
    SHL_REG_REG = 0x75, // Shift Left, N bits
    SHL_REG_MEM = 0x76, // Shift Left, N bits
    SHL_MEM_IMM = 0x77, // Shift Left, N bits
    SHL_MEM_REG = 0x78, // Shift Left, N bits
    SHR_REG_IMM = 0x79, // Shift Right, N bits
    SHR_REG_REG = 0x7A, // Shift Right, N bits
    SHR_REG_MEM = 0x7B, // Shift Right, N bits
    SHR_MEM_IMM = 0x7C, // Shift Right, N bits
    SHR_MEM_REG = 0x7D, // Shift Right, N bits

    // OK

    LEA_REG_REG_IMM = 0x80, // (REG, REG) = IMM16
    LEA_REG_REG_MEM = 0x81, // (REG, REG) = MEM   // (copie l'adresse MEM dans (REG, REG))
    LDI_REG_REG_REG = 0x82, // REG = [REG:REG]    // (load indirect)
    STI_REG_REG_REG = 0x83, // [REG:REG] = REG    // (store indirect)

};

