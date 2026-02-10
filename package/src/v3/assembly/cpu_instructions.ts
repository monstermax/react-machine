
export enum Opcode {
    NOP = 0x00,
    HALT = 0x01,

    MOV_A_IMM = 0x02,
    MOV_A_REG = 0x03,
    MOV_A_MEM = 0x04,
    MOV_MEM_A = 0x05,

    // TODO

    PUSH_A = 0x06,
    POP_A = 0x07,

    INC_A = 0x08,
    DEC_A = 0x09,
    NOT_A = 0x0A,

    ADD_A_IMM = 0x0B,
    ADD_A_REG = 0x0C,
    ADD_A_MEM = 0x0D,

    SUB_A_IMM = 0x0E,
    SUB_A_REG = 0x0F,
    SUB_A_MEM = 0x10,

    AND_A_IMM = 0x11,
    AND_A_REG = 0x12,
    AND_A_MEM = 0x13,

    OR_A_IMM = 0x14,
    OR_A_REG = 0x15,
    OR_A_MEM = 0x16,

    XOR_A_IMM = 0x17,
    XOR_A_REG = 0x18,
    XOR_A_MEM = 0x19,

    CMP_A_IMM = 0x1A,
    CMP_A_REG = 0x1B,
    CMP_A_MEM = 0x1C,

    TEST_A_IMM = 0x1D,
    TEST_A_REG = 0x1E,
    TEST_A_MEM = 0x1F,
};

