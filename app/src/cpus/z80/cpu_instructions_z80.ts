
import type { u16, u8 } from "@/types/cpu.types";

// Z80 instruction set - Jeu d'instructions complet
// Références:
// - https://www.zilog.com/docs/z80/um0080.pdf (datasheet officiel)
// - https://clrhome.org/table/ (table opcodes)
// - http://z80.info/z80code.htm (guide instructions)

/**
 * Le Z80 possède environ 158 instructions de base organisées en groupes:
 * - Load/Exchange: LD, EX, EXX, PUSH, POP
 * - Arithmetic: ADD, ADC, SUB, SBC, INC, DEC, CP, NEG, DAA
 * - Logic: AND, OR, XOR, CPL  
 * - Rotate/Shift: RLCA, RLA, RRCA, RRA, RLC, RL, RRC, RR, SLA, SRA, SRL
 * - Bit Operations: BIT, SET, RES (via prefix CB)
 * - Jump/Call: JP, JR, CALL, RET, RST, DJNZ
 * - I/O: IN, OUT
 * - Block Operations: LDI, LDIR, LDD, LDDR, CPI, CPIR, CPD, CPDR (via prefix ED)
 * - Misc: NOP, HALT, DI, EI, IM
 */

export enum OpcodeZ80 {
    // === 0x00-0x0F ===
    NOP = 0x00,
    LD_BC_nn = 0x01,
    LD_BC_ind_A = 0x02,
    INC_BC = 0x03,
    INC_B = 0x04,
    DEC_B = 0x05,
    LD_B_n = 0x06,
    RLCA = 0x07,
    EX_AF_AF = 0x08,
    ADD_HL_BC = 0x09,
    LD_A_BC_ind = 0x0A,
    DEC_BC = 0x0B,
    INC_C = 0x0C,
    DEC_C = 0x0D,
    LD_C_n = 0x0E,
    RRCA = 0x0F,

    // === 0x10-0x1F ===
    DJNZ = 0x10,
    LD_DE_nn = 0x11,
    LD_DE_ind_A = 0x12,
    INC_DE = 0x13,
    INC_D = 0x14,
    DEC_D = 0x15,
    LD_D_n = 0x16,
    RLA = 0x17,
    JR = 0x18,
    ADD_HL_DE = 0x19,
    LD_A_DE_ind = 0x1A,
    DEC_DE = 0x1B,
    INC_E = 0x1C,
    DEC_E = 0x1D,
    LD_E_n = 0x1E,
    RRA = 0x1F,

    // === 0x20-0x2F ===
    JR_NZ = 0x20,
    LD_HL_nn = 0x21,
    LD_addr_HL = 0x22,
    INC_HL = 0x23,
    INC_H = 0x24,
    DEC_H = 0x25,
    LD_H_n = 0x26,
    DAA = 0x27,
    JR_Z = 0x28,
    ADD_HL_HL = 0x29,
    LD_HL_addr = 0x2A,
    DEC_HL = 0x2B,
    INC_L = 0x2C,
    DEC_L = 0x2D,
    LD_L_n = 0x2E,
    CPL = 0x2F,

    // === 0x30-0x3F ===
    JR_NC = 0x30,
    LD_SP_nn = 0x31,
    LD_addr_A = 0x32,
    INC_SP = 0x33,
    INC_HL_ind = 0x34,
    DEC_HL_ind = 0x35,
    LD_HL_ind_n = 0x36,
    SCF = 0x37,
    JR_C = 0x38,
    ADD_HL_SP = 0x39,
    LD_A_addr = 0x3A,
    DEC_SP = 0x3B,
    INC_A = 0x3C,
    DEC_A = 0x3D,
    LD_A_n = 0x3E,
    CCF = 0x3F,

    // === 0x40-0x7F: LD r, r' ===
    LD_B_B = 0x40, LD_B_C = 0x41, LD_B_D = 0x42, LD_B_E = 0x43,
    LD_B_H = 0x44, LD_B_L = 0x45, LD_B_HL_ind = 0x46, LD_B_A = 0x47,
    LD_C_B = 0x48, LD_C_C = 0x49, LD_C_D = 0x4A, LD_C_E = 0x4B,
    LD_C_H = 0x4C, LD_C_L = 0x4D, LD_C_HL_ind = 0x4E, LD_C_A = 0x4F,
    LD_D_B = 0x50, LD_D_C = 0x51, LD_D_D = 0x52, LD_D_E = 0x53,
    LD_D_H = 0x54, LD_D_L = 0x55, LD_D_HL_ind = 0x56, LD_D_A = 0x57,
    LD_E_B = 0x58, LD_E_C = 0x59, LD_E_D = 0x5A, LD_E_E = 0x5B,
    LD_E_H = 0x5C, LD_E_L = 0x5D, LD_E_HL_ind = 0x5E, LD_E_A = 0x5F,
    LD_H_B = 0x60, LD_H_C = 0x61, LD_H_D = 0x62, LD_H_E = 0x63,
    LD_H_H = 0x64, LD_H_L = 0x65, LD_H_HL_ind = 0x66, LD_H_A = 0x67,
    LD_L_B = 0x68, LD_L_C = 0x69, LD_L_D = 0x6A, LD_L_E = 0x6B,
    LD_L_H = 0x6C, LD_L_L = 0x6D, LD_L_HL_ind = 0x6E, LD_L_A = 0x6F,
    LD_HL_ind_B = 0x70, LD_HL_ind_C = 0x71, LD_HL_ind_D = 0x72, LD_HL_ind_E = 0x73,
    LD_HL_ind_H = 0x74, LD_HL_ind_L = 0x75, HALT = 0x76, LD_HL_ind_A = 0x77,
    LD_A_B = 0x78, LD_A_C = 0x79, LD_A_D = 0x7A, LD_A_E = 0x7B,
    LD_A_H = 0x7C, LD_A_L = 0x7D, LD_A_HL_ind = 0x7E, LD_A_A = 0x7F,

    // === 0x80-0xBF: Arithmetic/Logic ===
    ADD_A_B = 0x80, ADD_A_C = 0x81, ADD_A_D = 0x82, ADD_A_E = 0x83,
    ADD_A_H = 0x84, ADD_A_L = 0x85, ADD_A_HL_ind = 0x86, ADD_A_A = 0x87,
    ADC_A_B = 0x88, ADC_A_C = 0x89, ADC_A_D = 0x8A, ADC_A_E = 0x8B,
    ADC_A_H = 0x8C, ADC_A_L = 0x8D, ADC_A_HL_ind = 0x8E, ADC_A_A = 0x8F,
    SUB_B = 0x90, SUB_C = 0x91, SUB_D = 0x92, SUB_E = 0x93,
    SUB_H = 0x94, SUB_L = 0x95, SUB_HL_ind = 0x96, SUB_A = 0x97,
    SBC_A_B = 0x98, SBC_A_C = 0x99, SBC_A_D = 0x9A, SBC_A_E = 0x9B,
    SBC_A_H = 0x9C, SBC_A_L = 0x9D, SBC_A_HL_ind = 0x9E, SBC_A_A = 0x9F,
    AND_B = 0xA0, AND_C = 0xA1, AND_D = 0xA2, AND_E = 0xA3,
    AND_H = 0xA4, AND_L = 0xA5, AND_HL_ind = 0xA6, AND_A = 0xA7,
    XOR_B = 0xA8, XOR_C = 0xA9, XOR_D = 0xAA, XOR_E = 0xAB,
    XOR_H = 0xAC, XOR_L = 0xAD, XOR_HL_ind = 0xAE, XOR_A = 0xAF,
    OR_B = 0xB0, OR_C = 0xB1, OR_D = 0xB2, OR_E = 0xB3,
    OR_H = 0xB4, OR_L = 0xB5, OR_HL_ind = 0xB6, OR_A = 0xB7,
    CP_B = 0xB8, CP_C = 0xB9, CP_D = 0xBA, CP_E = 0xBB,
    CP_H = 0xBC, CP_L = 0xBD, CP_HL_ind = 0xBE, CP_A = 0xBF,

    // === 0xC0-0xFF: Control Flow & I/O ===
    RET_NZ = 0xC0, POP_BC = 0xC1, JP_NZ_nn = 0xC2, JP_nn = 0xC3,
    CALL_NZ_nn = 0xC4, PUSH_BC = 0xC5, ADD_A_n = 0xC6, RST_00 = 0xC7,
    RET_Z = 0xC8, RET = 0xC9, JP_Z_nn = 0xCA, PREFIX_CB = 0xCB,
    CALL_Z_nn = 0xCC, CALL_nn = 0xCD, ADC_A_n = 0xCE, RST_08 = 0xCF,
    RET_NC = 0xD0, POP_DE = 0xD1, JP_NC_nn = 0xD2, OUT_n_A = 0xD3,
    CALL_NC_nn = 0xD4, PUSH_DE = 0xD5, SUB_n = 0xD6, RST_10 = 0xD7,
    RET_C = 0xD8, EXX = 0xD9, JP_C_nn = 0xDA, IN_A_n = 0xDB,
    CALL_C_nn = 0xDC, PREFIX_DD = 0xDD, SBC_A_n = 0xDE, RST_18 = 0xDF,
    RET_PO = 0xE0, POP_HL = 0xE1, JP_PO_nn = 0xE2, EX_SP_HL = 0xE3,
    CALL_PO_nn = 0xE4, PUSH_HL = 0xE5, AND_n = 0xE6, RST_20 = 0xE7,
    RET_PE = 0xE8, JP_HL = 0xE9, JP_PE_nn = 0xEA, EX_DE_HL = 0xEB,
    CALL_PE_nn = 0xEC, PREFIX_ED = 0xED, XOR_n = 0xEE, RST_28 = 0xEF,
    RET_P = 0xF0, POP_AF = 0xF1, JP_P_nn = 0xF2, DI = 0xF3,
    CALL_P_nn = 0xF4, PUSH_AF = 0xF5, OR_n = 0xF6, RST_30 = 0xF7,
    RET_M = 0xF8, LD_SP_HL = 0xF9, JP_M_nn = 0xFA, EI = 0xFB,
    CALL_M_nn = 0xFC, PREFIX_FD = 0xFD, CP_n = 0xFE, RST_38 = 0xFF,
}

// Instructions avec 1 opérande 8-bit
export const INSTRUCTIONS_WITH_OPERAND_Z80 = [
    OpcodeZ80.LD_B_n, OpcodeZ80.LD_C_n, OpcodeZ80.LD_D_n, OpcodeZ80.LD_E_n,
    OpcodeZ80.LD_H_n, OpcodeZ80.LD_L_n, OpcodeZ80.LD_A_n, OpcodeZ80.LD_HL_ind_n,
    OpcodeZ80.ADD_A_n, OpcodeZ80.ADC_A_n, OpcodeZ80.SUB_n, OpcodeZ80.SBC_A_n,
    OpcodeZ80.AND_n, OpcodeZ80.XOR_n, OpcodeZ80.OR_n, OpcodeZ80.CP_n,
    OpcodeZ80.DJNZ, OpcodeZ80.JR, OpcodeZ80.JR_NZ, OpcodeZ80.JR_Z,
    OpcodeZ80.JR_NC, OpcodeZ80.JR_C, OpcodeZ80.OUT_n_A, OpcodeZ80.IN_A_n,
];

// Instructions avec 2 opérandes 16-bit
export const INSTRUCTIONS_WITH_TWO_OPERANDS_Z80 = [
    OpcodeZ80.LD_BC_nn, OpcodeZ80.LD_DE_nn, OpcodeZ80.LD_HL_nn, OpcodeZ80.LD_SP_nn,
    OpcodeZ80.LD_addr_HL, OpcodeZ80.LD_HL_addr, OpcodeZ80.LD_addr_A, OpcodeZ80.LD_A_addr,
    OpcodeZ80.JP_nn, OpcodeZ80.CALL_nn,
    OpcodeZ80.JP_NZ_nn, OpcodeZ80.JP_Z_nn, OpcodeZ80.JP_NC_nn, OpcodeZ80.JP_C_nn,
    OpcodeZ80.JP_PO_nn, OpcodeZ80.JP_PE_nn, OpcodeZ80.JP_P_nn, OpcodeZ80.JP_M_nn,
    OpcodeZ80.CALL_NZ_nn, OpcodeZ80.CALL_Z_nn, OpcodeZ80.CALL_NC_nn, OpcodeZ80.CALL_C_nn,
    OpcodeZ80.CALL_PO_nn, OpcodeZ80.CALL_PE_nn, OpcodeZ80.CALL_P_nn, OpcodeZ80.CALL_M_nn,
];

export const getOpcodeNameZ80 = (opcode: u8): string => {
    const names: { [key: number]: string } = {
        [OpcodeZ80.NOP]: "NOP", [OpcodeZ80.HALT]: "HALT", [OpcodeZ80.EI]: "EI", [OpcodeZ80.DI]: "DI",
        [OpcodeZ80.DJNZ]: "DJNZ", [OpcodeZ80.JR]: "JR", [OpcodeZ80.JR_NZ]: "JR NZ", [OpcodeZ80.JR_Z]: "JR Z",
        [OpcodeZ80.JR_NC]: "JR NC", [OpcodeZ80.JR_C]: "JR C",
        [OpcodeZ80.LD_A_n]: "LD A,n", [OpcodeZ80.LD_B_n]: "LD B,n", [OpcodeZ80.LD_C_n]: "LD C,n",
        [OpcodeZ80.LD_D_n]: "LD D,n", [OpcodeZ80.LD_E_n]: "LD E,n", [OpcodeZ80.LD_H_n]: "LD H,n",
        [OpcodeZ80.LD_L_n]: "LD L,n", [OpcodeZ80.LD_HL_ind_n]: "LD (HL),n",
        [OpcodeZ80.ADD_A_n]: "ADD A,n", [OpcodeZ80.SUB_n]: "SUB n", [OpcodeZ80.AND_n]: "AND n",
        [OpcodeZ80.XOR_n]: "XOR n", [OpcodeZ80.OR_n]: "OR n", [OpcodeZ80.CP_n]: "CP n",
        [OpcodeZ80.JP_nn]: "JP nn", [OpcodeZ80.CALL_nn]: "CALL nn", [OpcodeZ80.RET]: "RET",
        [OpcodeZ80.PUSH_BC]: "PUSH BC", [OpcodeZ80.PUSH_DE]: "PUSH DE",
        [OpcodeZ80.PUSH_HL]: "PUSH HL", [OpcodeZ80.PUSH_AF]: "PUSH AF",
        [OpcodeZ80.POP_BC]: "POP BC", [OpcodeZ80.POP_DE]: "POP DE",
        [OpcodeZ80.POP_HL]: "POP HL", [OpcodeZ80.POP_AF]: "POP AF",
    };
    return names[opcode] || `??? (0x${opcode.toString(16).padStart(2, '0')})`;
};


export const getInstructionLengthZ80 = (opcode: u8): number => {
    if (INSTRUCTIONS_WITH_OPERAND_Z80.includes(opcode)) return 2;
    if (INSTRUCTIONS_WITH_TWO_OPERANDS_Z80.includes(opcode)) return 3;
    return 1;
};


export const buildMemoryInstructionMapZ80 = (data: Map<u16, u8> | [u16, u8][]) => {
    const entries = Array.isArray(data) ? data : Array.from(data.entries());
    const sorted = entries.sort(([a], [b]) => a - b);
    const isInstruction = new Map<number, boolean>();
    const operandAddresses = new Set<number>();

    for (const [address, value] of sorted) {
        if (operandAddresses.has(address)) {
            isInstruction.set(address, false);
            continue;
        }
        if (Object.values(OpcodeZ80).includes(value)) {
            isInstruction.set(address, true);
            const len = getInstructionLengthZ80(value);
            for (let j = 1; j < len; j++) operandAddresses.add(address + j);
        } else {
            isInstruction.set(address, false);
        }
    }
    return isInstruction;
};


// Flags Z80
export const Z80_FLAGS = {
    S: 0x80,
    Z: 0x40,
    H: 0x10,
    P: 0x04,
    N: 0x02,
    C: 0x01,
} as const;


export const setFlagZ80 = (F: u8, flag: keyof typeof Z80_FLAGS, value: boolean): u8 => {
    return value
        ? ((F | Z80_FLAGS[flag]) as u8)
        : ((F & ~Z80_FLAGS[flag]) as u8);
};


export const getFlagZ80 = (F: u8, flag: keyof typeof Z80_FLAGS): boolean => {
    return (F & Z80_FLAGS[flag]) !== 0;
};
