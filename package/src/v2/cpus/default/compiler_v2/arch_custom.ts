
import type { CPUArchitecture, RegisterDef, InstructionDef } from './compiler.types';


const registers: RegisterDef[] = [
    { name: 'A', aliases: ['AL', 'AH', 'AX', 'EAX', 'RAX'], id: 'A', size: 8 },
    { name: 'B', aliases: ['BL', 'BH', 'BX', 'EBX', 'RBX'], id: 'B', size: 8 },
    { name: 'C', aliases: ['CL', 'CH', 'CX', 'ECX', 'RCX'], id: 'C', size: 8 },
    { name: 'D', aliases: ['DL', 'DH', 'DX', 'EDX', 'RDX'], id: 'D', size: 8 },
    { name: 'SI', aliases: ['ESI', 'RSI'], id: 'SI', size: 8 },
    { name: 'DI', aliases: ['EDI', 'RDI'], id: 'DI', size: 8 },
    { name: 'SP', aliases: ['ESP', 'RSP'], id: 'SP', size: 8 },
    { name: 'BP', aliases: ['EBP', 'RBP'], id: 'BP', size: 8 },
];


const instructions: InstructionDef[] = [
    { mnemonic: 'NOP', opcode: 0x00, operands: 'NONE', size: 1 },
    { mnemonic: 'HALT', opcode: 0x0F, operands: 'NONE', size: 1 },
    { mnemonic: 'HLT', opcode: 0x0F, operands: 'NONE', size: 1 },

    { mnemonic: 'GET_FREQ', opcode: 0x0A, operands: 'NONE', size: 1 },
    { mnemonic: 'SET_FREQ', opcode: 0x0B, operands: 'IMM8', size: 2 },
    { mnemonic: 'BREAKPOINT', opcode: 0x0D, operands: 'NONE', size: 1 },

    {
        mnemonic: 'SYSCALL', opcode: 0x0E, operands: 'IMM8', size: 2
    },

    {
        mnemonic: 'INT', opcode: 0x0E, operands: 'IMM8', size: 2, variants: [
            { operands: 'IMM8', opcode: 0x0E, size: 2, condition: (ops) => { if (ops[0].value !== '0x80') return false; ops[0].value = '0xFF'; return true; }, mnemonic: 'SYSCALL' }, // int 0x80 => SYSCALL 0xFF
        ],
    },

    {
        mnemonic: 'ADD', opcode: 0x20, operands: 'NONE', size: 1, variants: [
            { operands: 'NONE', opcode: 0x20, size: 1, condition: (ops) => ops.length === 0, mnemonic: 'ADD' },
            { operands: 'REG', opcode: 0x20, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER', mnemonic: 'ADD' },
        ],
     },
    {
        mnemonic: 'SUB', opcode: 0x21, operands: 'NONE', size: 1, variants: [
            { operands: 'NONE', opcode: 0x21, size: 1, condition: (ops) => ops.length === 0, mnemonic: 'SUB' },
            { operands: 'REG', opcode: 0x21, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER', mnemonic: 'SUB' },
        ],
    },
    {
        mnemonic: 'AND', opcode: 0x22, operands: 'NONE', size: 1, variants: [
            { operands: 'NONE', opcode: 0x22, size: 1, condition: (ops) => ops.length === 0, mnemonic: 'AND' },
            { operands: 'REG', opcode: 0x22, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER', mnemonic: 'AND' },
        ],
    },
    {
        mnemonic: 'OR', opcode: 0x23, operands: 'NONE', size: 1, variants: [
            { operands: 'NONE', opcode: 0x23, size: 1, condition: (ops) => ops.length === 0, mnemonic: 'OR' },
            { operands: 'REG', opcode: 0x23, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER', mnemonic: 'OR' },
        ],
    },
    {
        mnemonic: 'XOR', opcode: 0x24, operands: 'NONE', size: 1, variants: [
            { operands: 'NONE', opcode: 0x24, size: 1, condition: (ops) => ops.length === 0, mnemonic: 'XOR' },
            { operands: 'REG', opcode: 0x24, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER', mnemonic: 'XOR' },
        ],
    },

    {
        mnemonic: 'INC',
        opcode: 0x25,
        operands: 'REG',
        size: 1,
        variants: [
            { operands: 'REG', opcode: 0x25, size: 1, condition: (ops) => ops[0].register === 'A', mnemonic: 'INC_A' },
            { operands: 'REG', opcode: 0x27, size: 1, condition: (ops) => ops[0].register === 'B', mnemonic: 'INC_B' },
            { operands: 'REG', opcode: 0x29, size: 1, condition: (ops) => ops[0].register === 'C', mnemonic: 'INC_C' },
            { operands: 'REG', opcode: 0x2B, size: 1, condition: (ops) => ops[0].register === 'D', mnemonic: 'INC_D' },
        ]
    },

    {
        mnemonic: 'DEC',
        opcode: 0x26,
        operands: 'REG',
        size: 1,
        variants: [
            { operands: 'REG', opcode: 0x26, size: 1, condition: (ops) => ops[0].register === 'A', mnemonic: 'DEC_A' },
            { operands: 'REG', opcode: 0x28, size: 1, condition: (ops) => ops[0].register === 'B', mnemonic: 'DEC_B' },
            { operands: 'REG', opcode: 0x2A, size: 1, condition: (ops) => ops[0].register === 'C', mnemonic: 'DEC_C' },
            { operands: 'REG', opcode: 0x2C, size: 1, condition: (ops) => ops[0].register === 'D', mnemonic: 'DEC_D' },
        ]
    },

    {
        mnemonic: 'PUSH',
        opcode: 0x30,
        operands: 'REG',
        size: 1,
        variants: [
            { operands: 'REG', opcode: 0x30, size: 1, condition: (ops) => ops[0].register === 'A', mnemonic: 'PUSH_A' },
            { operands: 'REG', opcode: 0x31, size: 1, condition: (ops) => ops[0].register === 'B', mnemonic: 'PUSH_B' },
            { operands: 'REG', opcode: 0x32, size: 1, condition: (ops) => ops[0].register === 'C', mnemonic: 'PUSH_C' },
            { operands: 'REG', opcode: 0x33, size: 1, condition: (ops) => ops[0].register === 'D', mnemonic: 'PUSH_D' },
        ]
    },

    {
        mnemonic: 'POP',
        opcode: 0x34,
        operands: 'REG',
        size: 1,
        variants: [
            { operands: 'REG', opcode: 0x34, size: 1, condition: (ops) => ops[0].register === 'A', mnemonic: 'POP_A' },
            { operands: 'REG', opcode: 0x35, size: 1, condition: (ops) => ops[0].register === 'B', mnemonic: 'POP_B' },
            { operands: 'REG', opcode: 0x36, size: 1, condition: (ops) => ops[0].register === 'C', mnemonic: 'POP_C' },
            { operands: 'REG', opcode: 0x37, size: 1, condition: (ops) => ops[0].register === 'D', mnemonic: 'POP_D' },
        ]
    },

    { mnemonic: 'GET_SP', opcode: 0x39, operands: 'NONE', size: 1 },
    { mnemonic: 'SET_SP', opcode: 0x3A, operands: 'IMM16', size: 3 },
    {
        mnemonic: 'CALL', opcode: 0x3B, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: 0x3B, size: 3, condition: (ops) => true, mnemonic: 'CALL' },
            { operands: 'MEM', opcode: 0x3B, size: 3, condition: (ops) => ops[0].type === 'LABEL', mnemonic: 'CALL' },
            { operands: 'MEM', opcode: 0x3B, size: 3, condition: (ops) => ops[0].type === 'MEMORY', mnemonic: 'CALL' },
        ],
    },
    { mnemonic: 'RET', opcode: 0x3C, operands: 'NONE', size: 1 },

    { mnemonic: 'EI', opcode: 0x3D, operands: 'NONE', size: 1 },
    { mnemonic: 'DI', opcode: 0x3E, operands: 'NONE', size: 1 },
    { mnemonic: 'IRET', opcode: 0x3F, operands: 'NONE', size: 1 },

    {
        mnemonic: 'JMP', opcode: 0x40, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: 0x40, size: 3, condition: (ops) => true, mnemonic: 'JMP' },
            { operands: 'MEM', opcode: 0x40, size: 3, condition: (ops) => true, mnemonic: 'JMP' },
        ],
    },
    {
        mnemonic: 'JZ', opcode: 0x41, operands: 'IMM16', size: 3, variants: [
            { operands: 'MEM', opcode: 0x41, size: 3, condition: (ops) => true, mnemonic: 'JZ' },
        ],
    },
    {
        mnemonic: 'JNZ', opcode: 0x42, operands: 'IMM16', size: 3, variants: [
            { operands: 'MEM', opcode: 0x42, size: 3, condition: (ops) => true, mnemonic: 'JNZ' },
        ],
    },
    {
        mnemonic: 'JC', opcode: 0x43, operands: 'IMM16', size: 3, variants: [
            { operands: 'MEM', opcode: 0x43, size: 3, condition: (ops) => true, mnemonic: 'JC' },
        ],
    },
    {
        mnemonic: 'JNC', opcode: 0x44, operands: 'IMM16', size: 3, variants: [
            { operands: 'MEM', opcode: 0x44, size: 3, condition: (ops) => true, mnemonic: 'JNC' },
        ],
    },

    {
        mnemonic: 'MOV', opcode: 0x90, operands: 'REG_REG', size: 1, variants: [
            { operands: 'REG_REG', opcode: 0x90, size: 1, condition: (ops) => ops[0].register === 'A' && ops[1].register === 'B', mnemonic: 'MOV_AB' },
            { operands: 'REG_REG', opcode: 0x91, size: 1, condition: (ops) => ops[0].register === 'A' && ops[1].register === 'C', mnemonic: 'MOV_AC' },
            { operands: 'REG_REG', opcode: 0x92, size: 1, condition: (ops) => ops[0].register === 'A' && ops[1].register === 'D', mnemonic: 'MOV_AD' },
            { operands: 'REG_REG', opcode: 0x93, size: 1, condition: (ops) => ops[0].register === 'B' && ops[1].register === 'A', mnemonic: 'MOV_BA' },
            { operands: 'REG_REG', opcode: 0x94, size: 1, condition: (ops) => ops[0].register === 'B' && ops[1].register === 'C', mnemonic: 'MOV_BC' },
            { operands: 'REG_REG', opcode: 0x95, size: 1, condition: (ops) => ops[0].register === 'B' && ops[1].register === 'D', mnemonic: 'MOV_BD' },
            { operands: 'REG_REG', opcode: 0x96, size: 1, condition: (ops) => ops[0].register === 'C' && ops[1].register === 'A', mnemonic: 'MOV_CA' },
            { operands: 'REG_REG', opcode: 0x97, size: 1, condition: (ops) => ops[0].register === 'C' && ops[1].register === 'B', mnemonic: 'MOV_CB' },
            { operands: 'REG_REG', opcode: 0x98, size: 1, condition: (ops) => ops[0].register === 'C' && ops[1].register === 'D', mnemonic: 'MOV_CD' },
            { operands: 'REG_REG', opcode: 0x99, size: 1, condition: (ops) => ops[0].register === 'D' && ops[1].register === 'A', mnemonic: 'MOV_DA' },
            { operands: 'REG_REG', opcode: 0x9A, size: 1, condition: (ops) => ops[0].register === 'D' && ops[1].register === 'B', mnemonic: 'MOV_DB' },
            { operands: 'REG_REG', opcode: 0x9B, size: 1, condition: (ops) => ops[0].register === 'D' && ops[1].register === 'C', mnemonic: 'MOV_DC' },

            { operands: 'REG_IMM8', opcode: 0x9C, size: 2, condition: (ops) => ops[0].register === 'A', mnemonic: 'MOV_A_IMM' },
            { operands: 'REG_IMM8', opcode: 0x9D, size: 2, condition: (ops) => ops[0].register === 'B', mnemonic: 'MOV_B_IMM' },
            { operands: 'REG_IMM8', opcode: 0x9E, size: 2, condition: (ops) => ops[0].register === 'C', mnemonic: 'MOV_C_IMM' },
            { operands: 'REG_IMM8', opcode: 0x9F, size: 2, condition: (ops) => ops[0].register === 'D', mnemonic: 'MOV_D_IMM' },

            { operands: 'REG_MEM', opcode: 0xA0, size: 3, condition: (ops) => ops[0].register === 'A', mnemonic: 'MOV_A_MEM' },
            { operands: 'REG_MEM', opcode: 0xA1, size: 3, condition: (ops) => ops[0].register === 'B', mnemonic: 'MOV_B_MEM' },
            { operands: 'REG_MEM', opcode: 0xA2, size: 3, condition: (ops) => ops[0].register === 'C', mnemonic: 'MOV_C_MEM' },
            { operands: 'REG_MEM', opcode: 0xA3, size: 3, condition: (ops) => ops[0].register === 'D', mnemonic: 'MOV_D_MEM' },
            { operands: 'REG_MEM', opcode: 0x3A, size: 3, condition: (ops) => ops[0].register === 'SP', mnemonic: 'SET_SP' },
            { operands: 'REG_IMM_IMM', opcode: 0x3A, size: 3, condition: (ops) => ops[0].register === 'SP', mnemonic: 'SET_SP' },

            { operands: 'MEM_REG', opcode: 0xA4, size: 3, condition: (ops) => ops[1].register === 'A', mnemonic: 'MOV_MEM_A' },
            { operands: 'MEM_REG', opcode: 0xA5, size: 3, condition: (ops) => ops[1].register === 'B', mnemonic: 'MOV_MEM_B' },
            { operands: 'MEM_REG', opcode: 0xA6, size: 3, condition: (ops) => ops[1].register === 'C', mnemonic: 'MOV_MEM_C' },
            { operands: 'MEM_REG', opcode: 0xA7, size: 3, condition: (ops) => ops[1].register === 'D', mnemonic: 'MOV_MEM_D' },
        ]
    },

    { mnemonic: 'CORE_HALT', opcode: 0xE0, operands: 'NONE', size: 1 },
    { mnemonic: 'CORE_START', opcode: 0xE1, operands: 'NONE', size: 1 },
    { mnemonic: 'CORE_INIT', opcode: 0xE2, operands: 'NONE', size: 1 },
    { mnemonic: 'CORE_STATUS', opcode: 0xE3, operands: 'NONE', size: 1 },
    { mnemonic: 'CORES_COUNT', opcode: 0xE4, operands: 'NONE', size: 1 },

    { mnemonic: 'CPU_HALT', opcode: 0xE8, operands: 'NONE', size: 1 },
    { mnemonic: 'CPU_START', opcode: 0xE9, operands: 'NONE', size: 1 },
    { mnemonic: 'CPU_INIT', opcode: 0xEA, operands: 'NONE', size: 1 },
    { mnemonic: 'CPU_STATUS', opcode: 0xEB, operands: 'NONE', size: 1 },
    { mnemonic: 'CPUS_COUNT', opcode: 0xEC, operands: 'NONE', size: 1 },
];


export const CUSTOM_CPU: CPUArchitecture = {
    name: 'Custom8bit',
    addressSize: 16,
    registers,
    instructions,
    endianness: 'little',
};
