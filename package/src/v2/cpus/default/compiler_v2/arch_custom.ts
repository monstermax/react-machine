
import { Opcode } from '../cpu_instructions';
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
    // CONTROL
    { mnemonic: 'NOP', opcode: Opcode.NOP, operands: 'NONE', size: 1 },
    { mnemonic: 'HALT', opcode: Opcode.HALT, operands: 'NONE', size: 1 },
    { mnemonic: 'HLT', opcode: Opcode.HALT, operands: 'NONE', size: 1 },

    { mnemonic: 'GET_FREQ', opcode: Opcode.GET_FREQ, operands: 'NONE', size: 1 },
    { mnemonic: 'SET_FREQ', opcode: Opcode.SET_FREQ, operands: 'IMM8', size: 2 },
    { mnemonic: 'BREAKPOINT', opcode: Opcode.BREAKPOINT, operands: 'NONE', size: 1 },

    {
        mnemonic: 'SYSCALL', opcode: Opcode.SYSCALL, operands: 'IMM8', size: 2, // TODO: 0 arguments. read syscallCode from register A
    },

    {
        mnemonic: 'INT', opcode: 0x00, operands: 'IMM8', size: 2, variants: [
            { operands: 'IMM8', opcode: Opcode.SYSCALL, size: 2, condition: (ops) => { if (ops[0].value !== '0x80') return false; ops[0].value = '0xFF'; return true; }, mnemonic: 'SYSCALL' }, // int 0x80 => SYSCALL 0xFF
        ],
    },

    // CPU CONTROL
    { mnemonic: 'CORE_HALT', opcode: Opcode.CORE_HALT, operands: 'NONE', size: 1 },
    { mnemonic: 'CORE_START', opcode: Opcode.CORE_START, operands: 'NONE', size: 1 },
    { mnemonic: 'CORE_INIT', opcode: Opcode.CORE_INIT, operands: 'NONE', size: 1 },
    { mnemonic: 'CORE_STATUS', opcode: Opcode.CORE_STATUS, operands: 'NONE', size: 1 },
    { mnemonic: 'CORES_COUNT', opcode: Opcode.CORES_COUNT, operands: 'NONE', size: 1 },

    { mnemonic: 'CPU_HALT', opcode: Opcode.CPU_HALT, operands: 'NONE', size: 1 },
    { mnemonic: 'CPU_START', opcode: Opcode.CPU_START, operands: 'NONE', size: 1 },
    { mnemonic: 'CPU_INIT', opcode: Opcode.CPU_INIT, operands: 'NONE', size: 1 },
    { mnemonic: 'CPU_STATUS', opcode: Opcode.CPU_STATUS, operands: 'NONE', size: 1 },
    { mnemonic: 'CPUS_COUNT', opcode: Opcode.CPUS_COUNT, operands: 'NONE', size: 1 },

    // STACK
    {
        mnemonic: 'PUSH',
        opcode: 0x00,
        operands: 'REG',
        size: 1,
        variants: [
            { operands: 'REG', opcode: Opcode.PUSH_A, size: 1, condition: (ops) => ops[0].register === 'A', mnemonic: 'PUSH_A' },
            { operands: 'REG', opcode: Opcode.PUSH_B, size: 1, condition: (ops) => ops[0].register === 'B', mnemonic: 'PUSH_B' },
            { operands: 'REG', opcode: Opcode.PUSH_C, size: 1, condition: (ops) => ops[0].register === 'C', mnemonic: 'PUSH_C' },
            { operands: 'REG', opcode: Opcode.PUSH_D, size: 1, condition: (ops) => ops[0].register === 'D', mnemonic: 'PUSH_D' },
        ]
    },

    {
        mnemonic: 'POP',
        opcode: 0x00,
        operands: 'REG',
        size: 1,
        variants: [
            { operands: 'REG', opcode: Opcode.POP_A, size: 1, condition: (ops) => ops[0].register === 'A', mnemonic: 'POP_A' },
            { operands: 'REG', opcode: Opcode.POP_B, size: 1, condition: (ops) => ops[0].register === 'B', mnemonic: 'POP_B' },
            { operands: 'REG', opcode: Opcode.POP_C, size: 1, condition: (ops) => ops[0].register === 'C', mnemonic: 'POP_C' },
            { operands: 'REG', opcode: Opcode.POP_D, size: 1, condition: (ops) => ops[0].register === 'D', mnemonic: 'POP_D' },
        ]
    },

    //{ mnemonic: 'GET_SP', opcode: Opcode.GET_SP, operands: 'NONE', size: 1 },
    //{ mnemonic: 'SET_SP', opcode: Opcode.SET_SP, operands: 'IMM16', size: 3 },
    {
        mnemonic: 'CALL', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.CALL, size: 3, condition: (ops) => true, mnemonic: 'CALL' },
            { operands: 'MEM', opcode: Opcode.CALL, size: 3, condition: (ops) => ops[0].type === 'LABEL', mnemonic: 'CALL' },
            { operands: 'MEM', opcode: Opcode.CALL, size: 3, condition: (ops) => ops[0].type === 'MEMORY', mnemonic: 'CALL' },
        ],
    },
    { mnemonic: 'RET', opcode: Opcode.RET, operands: 'NONE', size: 1 },

    // INTERRUPTS
    { mnemonic: 'EI', opcode: Opcode.EI, operands: 'NONE', size: 1 },
    { mnemonic: 'DI', opcode: Opcode.DI, operands: 'NONE', size: 1 },
    { mnemonic: 'IRET', opcode: Opcode.IRET, operands: 'NONE', size: 1 },

    // SAUTS
    {
        mnemonic: 'JMP', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JMP, size: 3, condition: (ops) => true, mnemonic: 'JMP' },
            { operands: 'MEM', opcode: Opcode.JMP, size: 3, condition: (ops) => true, mnemonic: 'JMP' },
        ],
    },
    {
        mnemonic: 'JZ', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JZ, size: 3, condition: (ops) => true, mnemonic: 'JZ' },
            { operands: 'MEM', opcode: Opcode.JZ, size: 3, condition: (ops) => true, mnemonic: 'JZ' },
        ],
    },
    {
        mnemonic: 'JE', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JE, size: 3, condition: (ops) => true, mnemonic: 'JE' },
            { operands: 'MEM', opcode: Opcode.JE, size: 3, condition: (ops) => true, mnemonic: 'JE' },
        ],
    },
    {
        mnemonic: 'JNZ', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JNZ, size: 3, condition: (ops) => true, mnemonic: 'JNZ' },
            { operands: 'MEM', opcode: Opcode.JNZ, size: 3, condition: (ops) => true, mnemonic: 'JNZ' },
        ],
    },
    {
        mnemonic: 'JNE', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JNE, size: 3, condition: (ops) => true, mnemonic: 'JNE' },
            { operands: 'MEM', opcode: Opcode.JNE, size: 3, condition: (ops) => true, mnemonic: 'JNE' },
        ],
    },
    {
        mnemonic: 'JC', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JC, size: 3, condition: (ops) => true, mnemonic: 'JC' },
            { operands: 'MEM', opcode: Opcode.JC, size: 3, condition: (ops) => true, mnemonic: 'JC' },
        ],
    },
    {
        mnemonic: 'JNC', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JNC, size: 3, condition: (ops) => true, mnemonic: 'JNC' },
            { operands: 'MEM', opcode: Opcode.JNC, size: 3, condition: (ops) => true, mnemonic: 'JNC' },
        ],
    },
    {
        mnemonic: 'JL', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JL, size: 3, condition: (ops) => true, mnemonic: 'JL' },
            { operands: 'MEM', opcode: Opcode.JL, size: 3, condition: (ops) => true, mnemonic: 'JL' },
        ],
    },
    {
        mnemonic: 'JB', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JB, size: 3, condition: (ops) => true, mnemonic: 'JB' },
            { operands: 'MEM', opcode: Opcode.JB, size: 3, condition: (ops) => true, mnemonic: 'JB' },
        ],
    },
    {
        mnemonic: 'JLE', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JLE, size: 3, condition: (ops) => true, mnemonic: 'JLE' },
            { operands: 'MEM', opcode: Opcode.JLE, size: 3, condition: (ops) => true, mnemonic: 'JLE' },
        ],
    },
    {
        mnemonic: 'JBE', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JBE, size: 3, condition: (ops) => true, mnemonic: 'JBE' },
            { operands: 'MEM', opcode: Opcode.JBE, size: 3, condition: (ops) => true, mnemonic: 'JBE' },
        ],
    },
    {
        mnemonic: 'JG', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JG, size: 3, condition: (ops) => true, mnemonic: 'JG' },
            { operands: 'MEM', opcode: Opcode.JG, size: 3, condition: (ops) => true, mnemonic: 'JG' },
        ],
    },
    {
        mnemonic: 'JA', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JA, size: 3, condition: (ops) => true, mnemonic: 'JA' },
            { operands: 'MEM', opcode: Opcode.JA, size: 3, condition: (ops) => true, mnemonic: 'JA' },
        ],
    },
    {
        mnemonic: 'JGE', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JGE, size: 3, condition: (ops) => true, mnemonic: 'JGE' },
            { operands: 'MEM', opcode: Opcode.JGE, size: 3, condition: (ops) => true, mnemonic: 'JGE' },
        ],
    },
    {
        mnemonic: 'JAE', opcode: 0x00, operands: 'IMM16', size: 3, variants: [
            { operands: 'IMM16', opcode: Opcode.JAE, size: 3, condition: (ops) => true, mnemonic: 'JAE' },
            { operands: 'MEM', opcode: Opcode.JAE, size: 3, condition: (ops) => true, mnemonic: 'JAE' },
        ],
    },

    // MOV
    {
        mnemonic: 'MOV', opcode: 0x00, operands: 'REG_REG', size: 1, variants: [
            { operands: 'REG_REG', opcode: Opcode.MOV_AB, size: 1, condition: (ops) => ops[0].register === 'A' && ops[1].register === 'B', mnemonic: 'MOV_AB' },
            { operands: 'REG_REG', opcode: Opcode.MOV_AC, size: 1, condition: (ops) => ops[0].register === 'A' && ops[1].register === 'C', mnemonic: 'MOV_AC' },
            { operands: 'REG_REG', opcode: Opcode.MOV_AD, size: 1, condition: (ops) => ops[0].register === 'A' && ops[1].register === 'D', mnemonic: 'MOV_AD' },
            { operands: 'REG_REG', opcode: Opcode.MOV_BA, size: 1, condition: (ops) => ops[0].register === 'B' && ops[1].register === 'A', mnemonic: 'MOV_BA' },
            { operands: 'REG_REG', opcode: Opcode.MOV_BC, size: 1, condition: (ops) => ops[0].register === 'B' && ops[1].register === 'C', mnemonic: 'MOV_BC' },
            { operands: 'REG_REG', opcode: Opcode.MOV_BD, size: 1, condition: (ops) => ops[0].register === 'B' && ops[1].register === 'D', mnemonic: 'MOV_BD' },
            { operands: 'REG_REG', opcode: Opcode.MOV_CA, size: 1, condition: (ops) => ops[0].register === 'C' && ops[1].register === 'A', mnemonic: 'MOV_CA' },
            { operands: 'REG_REG', opcode: Opcode.MOV_CB, size: 1, condition: (ops) => ops[0].register === 'C' && ops[1].register === 'B', mnemonic: 'MOV_CB' },
            { operands: 'REG_REG', opcode: Opcode.MOV_CD, size: 1, condition: (ops) => ops[0].register === 'C' && ops[1].register === 'D', mnemonic: 'MOV_CD' },
            { operands: 'REG_REG', opcode: Opcode.MOV_DA, size: 1, condition: (ops) => ops[0].register === 'D' && ops[1].register === 'A', mnemonic: 'MOV_DA' },
            { operands: 'REG_REG', opcode: Opcode.MOV_DB, size: 1, condition: (ops) => ops[0].register === 'D' && ops[1].register === 'B', mnemonic: 'MOV_DB' },
            { operands: 'REG_REG', opcode: Opcode.MOV_DC, size: 1, condition: (ops) => ops[0].register === 'D' && ops[1].register === 'C', mnemonic: 'MOV_DC' },

            { operands: 'REG_IMM8', opcode: Opcode.MOV_A_IMM, size: 2, condition: (ops) => ops[0].register === 'A', mnemonic: 'MOV_A_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.MOV_B_IMM, size: 2, condition: (ops) => ops[0].register === 'B', mnemonic: 'MOV_B_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.MOV_C_IMM, size: 2, condition: (ops) => ops[0].register === 'C', mnemonic: 'MOV_C_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.MOV_D_IMM, size: 2, condition: (ops) => ops[0].register === 'D', mnemonic: 'MOV_D_IMM' },

            { operands: 'REG_MEM', opcode: Opcode.MOV_A_MEM, size: 3, condition: (ops) => ops[0].register === 'A', mnemonic: 'MOV_A_MEM' },
            { operands: 'REG_MEM', opcode: Opcode.MOV_B_MEM, size: 3, condition: (ops) => ops[0].register === 'B', mnemonic: 'MOV_B_MEM' },
            { operands: 'REG_MEM', opcode: Opcode.MOV_C_MEM, size: 3, condition: (ops) => ops[0].register === 'C', mnemonic: 'MOV_C_MEM' },
            { operands: 'REG_MEM', opcode: Opcode.MOV_D_MEM, size: 3, condition: (ops) => ops[0].register === 'D', mnemonic: 'MOV_D_MEM' },

            { operands: 'REG_MEM', opcode: Opcode.SET_SP, size: 3, condition: (ops) => ops[0].register === 'SP', mnemonic: 'SET_SP' },
            { operands: 'REG_IMM_IMM', opcode: Opcode.SET_SP, size: 3, condition: (ops) => ops[0].register === 'SP', mnemonic: 'SET_SP' },

            { operands: 'MEM_REG', opcode: Opcode.MOV_MEM_A, size: 3, condition: (ops) => ops[1].register === 'A', mnemonic: 'MOV_MEM_A' },
            { operands: 'MEM_REG', opcode: Opcode.MOV_MEM_B, size: 3, condition: (ops) => ops[1].register === 'B', mnemonic: 'MOV_MEM_B' },
            { operands: 'MEM_REG', opcode: Opcode.MOV_MEM_C, size: 3, condition: (ops) => ops[1].register === 'C', mnemonic: 'MOV_MEM_C' },
            { operands: 'MEM_REG', opcode: Opcode.MOV_MEM_D, size: 3, condition: (ops) => ops[1].register === 'D', mnemonic: 'MOV_MEM_D' },
        ]
    },

    {
        mnemonic: 'LEA', opcode: 0x00, operands: 'REG_MEM', size: 1, variants: [
            { operands: 'REG_MEM', opcode: Opcode.LEA_CD_A, size: 1, condition: (ops) => ops[0].register === 'A' && ops[1].type === 'MEMORY' && ops[1].register === 'CD', mnemonic: 'LEA_CD_A' },
            { operands: 'REG_MEM', opcode: Opcode.LEA_CD_B, size: 1, condition: (ops) => ops[0].register === 'B' && ops[1].type === 'MEMORY' && ops[1].register === 'CD', mnemonic: 'LEA_CD_B' },
            { operands: 'REG_IMM16', opcode: Opcode.LEA_IMM_CD, size: 3, condition: (ops) => ops[0].register === 'CD' && ops[1].type === 'IMMEDIATE', mnemonic: 'LEA_IMM_CD' },

            // LEA avec registre 8-bit et adresse immédiate
            { operands: 'REG_IMM16', opcode: Opcode.LEA_A_MEM, size: 3, condition: (ops) => ops[0].register === 'A' && ops[1].type === 'IMMEDIATE', mnemonic: 'LEA_A_MEM' },
            { operands: 'REG_IMM16', opcode: Opcode.LEA_B_MEM, size: 3, condition: (ops) => ops[0].register === 'B' && ops[1].type === 'IMMEDIATE', mnemonic: 'LEA_B_MEM' },

            // LEA avec registre 16-bit (CD) et adresse immédiate
            { operands: 'REG_IMM16', opcode: Opcode.LEA_CD_MEM, size: 3, condition: (ops) => ops[0].register === 'CD' && ops[1].type === 'IMMEDIATE', mnemonic: 'LEA_CD_MEM' },

            // LEA CD avec pointeur CD et offset
            { operands: 'REG_MEM_IMM16', opcode: Opcode.LEA_CD_OFFSET, size: 2, condition: (ops) => ops[0].register === 'CD' && ops[1].type === 'MEMORY' && ops[1].register === 'CD' && ops[2].type === 'IMMEDIATE', mnemonic: 'LEA_CD_OFFSET' },

        ]
    },

    // ALU
    {
        mnemonic: 'NOT',
        opcode: 0x00,
        operands: 'REG',
        size: 1,
        variants: [
            { operands: 'REG', opcode: Opcode.NOT_A, size: 1, condition: (ops) => ops[0].register === 'A', mnemonic: 'NOT_A' },
            { operands: 'REG', opcode: Opcode.NOT_B, size: 1, condition: (ops) => ops[0].register === 'B', mnemonic: 'NOT_B' },
            { operands: 'REG', opcode: Opcode.NOT_C, size: 1, condition: (ops) => ops[0].register === 'C', mnemonic: 'NOT_C' },
            { operands: 'REG', opcode: Opcode.NOT_D, size: 1, condition: (ops) => ops[0].register === 'D', mnemonic: 'NOT_D' },
        ]
    },

    {
        mnemonic: 'INC',
        opcode: 0x00,
        operands: 'REG',
        size: 1,
        variants: [
            { operands: 'REG', opcode: Opcode.INC_A, size: 1, condition: (ops) => ops[0].register === 'A', mnemonic: 'INC_A' },
            { operands: 'REG', opcode: Opcode.INC_B, size: 1, condition: (ops) => ops[0].register === 'B', mnemonic: 'INC_B' },
            { operands: 'REG', opcode: Opcode.INC_C, size: 1, condition: (ops) => ops[0].register === 'C', mnemonic: 'INC_C' },
            { operands: 'REG', opcode: Opcode.INC_D, size: 1, condition: (ops) => ops[0].register === 'D', mnemonic: 'INC_D' },
        ]
    },

    {
        mnemonic: 'DEC',
        opcode: 0x00,
        operands: 'REG',
        size: 1,
        variants: [
            { operands: 'REG', opcode: Opcode.DEC_A, size: 1, condition: (ops) => ops[0].register === 'A', mnemonic: 'DEC_A' },
            { operands: 'REG', opcode: Opcode.DEC_B, size: 1, condition: (ops) => ops[0].register === 'B', mnemonic: 'DEC_B' },
            { operands: 'REG', opcode: Opcode.DEC_C, size: 1, condition: (ops) => ops[0].register === 'C', mnemonic: 'DEC_C' },
            { operands: 'REG', opcode: Opcode.DEC_D, size: 1, condition: (ops) => ops[0].register === 'D', mnemonic: 'DEC_D' },
        ]
    },

    {
        mnemonic: 'ADD', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            //{ operands: 'NONE', opcode: Opcode.ADD_A_IMM, size: 1, condition: (ops) => true, mnemonic: 'ADD' },
            { operands: 'REG_IMM8', opcode: Opcode.ADD_A_IMM, size: 2, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER', mnemonic: 'ADD_A_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.ADD_B_IMM, size: 2, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER', mnemonic: 'ADD_B_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.ADD_C_IMM, size: 2, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER', mnemonic: 'ADD_C_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.ADD_D_IMM, size: 2, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER', mnemonic: 'ADD_D_IMM' },
            { operands: 'REG_REG', opcode: Opcode.ADD_AA, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'ADD_AA' },
            { operands: 'REG_REG', opcode: Opcode.ADD_AB, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'ADD_AB' },
            { operands: 'REG_REG', opcode: Opcode.ADD_AC, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'ADD_AC' },
            { operands: 'REG_REG', opcode: Opcode.ADD_AD, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'ADD_AD' },
            { operands: 'REG_REG', opcode: Opcode.ADD_BA, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'ADD_BA' },
            { operands: 'REG_REG', opcode: Opcode.ADD_BB, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'ADD_BB' },
            { operands: 'REG_REG', opcode: Opcode.ADD_BC, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'ADD_BC' },
            { operands: 'REG_REG', opcode: Opcode.ADD_BD, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'ADD_BD' },
            { operands: 'REG_REG', opcode: Opcode.ADD_CA, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'ADD_CA' },
            { operands: 'REG_REG', opcode: Opcode.ADD_CB, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'ADD_CB' },
            { operands: 'REG_REG', opcode: Opcode.ADD_CC, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'ADD_CC' },
            { operands: 'REG_REG', opcode: Opcode.ADD_CD, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'ADD_CD' },
            { operands: 'REG_REG', opcode: Opcode.ADD_DA, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'ADD_DA' },
            { operands: 'REG_REG', opcode: Opcode.ADD_DB, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'ADD_DB' },
            { operands: 'REG_REG', opcode: Opcode.ADD_DC, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'ADD_DC' },
            { operands: 'REG_REG', opcode: Opcode.ADD_DD, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'ADD_DD' },
        ],
    },

    {
        mnemonic: 'SUB', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            //{ operands: 'NONE', opcode: Opcode.SUB_A_IMM, size: 1, condition: (ops) => true, mnemonic: 'SUB' },
            { operands: 'REG_IMM8', opcode: Opcode.SUB_A_IMM, size: 2, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER', mnemonic: 'SUB_A_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.SUB_B_IMM, size: 2, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER', mnemonic: 'SUB_B_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.SUB_C_IMM, size: 2, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER', mnemonic: 'SUB_C_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.SUB_D_IMM, size: 2, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER', mnemonic: 'SUB_D_IMM' },
            { operands: 'REG_REG', opcode: Opcode.SUB_AA, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'SUB_AA' },
            { operands: 'REG_REG', opcode: Opcode.SUB_AB, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'SUB_AB' },
            { operands: 'REG_REG', opcode: Opcode.SUB_AC, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'SUB_AC' },
            { operands: 'REG_REG', opcode: Opcode.SUB_AD, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'SUB_AD' },
            { operands: 'REG_REG', opcode: Opcode.SUB_BA, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'SUB_BA' },
            { operands: 'REG_REG', opcode: Opcode.SUB_BB, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'SUB_BB' },
            { operands: 'REG_REG', opcode: Opcode.SUB_BC, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'SUB_BC' },
            { operands: 'REG_REG', opcode: Opcode.SUB_BD, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'SUB_BD' },
            { operands: 'REG_REG', opcode: Opcode.SUB_CA, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'SUB_CA' },
            { operands: 'REG_REG', opcode: Opcode.SUB_CB, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'SUB_CB' },
            { operands: 'REG_REG', opcode: Opcode.SUB_CC, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'SUB_CC' },
            { operands: 'REG_REG', opcode: Opcode.SUB_CD, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'SUB_CD' },
            { operands: 'REG_REG', opcode: Opcode.SUB_DA, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'SUB_DA' },
            { operands: 'REG_REG', opcode: Opcode.SUB_DB, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'SUB_DB' },
            { operands: 'REG_REG', opcode: Opcode.SUB_DC, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'SUB_DC' },
            { operands: 'REG_REG', opcode: Opcode.SUB_DD, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'SUB_DD' },
        ],
    },

    {
        mnemonic: 'AND', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            //{ operands: 'NONE', opcode: Opcode.AND_A_IMM, size: 1, condition: (ops) => true, mnemonic: 'AND' },
            { operands: 'REG_IMM8', opcode: Opcode.AND_A_IMM, size: 2, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER', mnemonic: 'AND_A_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.AND_B_IMM, size: 2, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER', mnemonic: 'AND_B_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.AND_C_IMM, size: 2, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER', mnemonic: 'AND_C_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.AND_D_IMM, size: 2, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER', mnemonic: 'AND_D_IMM' },
            { operands: 'REG_REG', opcode: Opcode.AND_AA, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'AND_AA' },
            { operands: 'REG_REG', opcode: Opcode.AND_AB, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'AND_AB' },
            { operands: 'REG_REG', opcode: Opcode.AND_AC, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'AND_AC' },
            { operands: 'REG_REG', opcode: Opcode.AND_AD, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'AND_AD' },
            { operands: 'REG_REG', opcode: Opcode.AND_BA, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'AND_BA' },
            { operands: 'REG_REG', opcode: Opcode.AND_BB, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'AND_BB' },
            { operands: 'REG_REG', opcode: Opcode.AND_BC, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'AND_BC' },
            { operands: 'REG_REG', opcode: Opcode.AND_BD, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'AND_BD' },
            { operands: 'REG_REG', opcode: Opcode.AND_CA, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'AND_CA' },
            { operands: 'REG_REG', opcode: Opcode.AND_CB, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'AND_CB' },
            { operands: 'REG_REG', opcode: Opcode.AND_CC, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'AND_CC' },
            { operands: 'REG_REG', opcode: Opcode.AND_CD, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'AND_CD' },
            { operands: 'REG_REG', opcode: Opcode.AND_DA, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'AND_DA' },
            { operands: 'REG_REG', opcode: Opcode.AND_DB, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'AND_DB' },
            { operands: 'REG_REG', opcode: Opcode.AND_DC, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'AND_DC' },
            { operands: 'REG_REG', opcode: Opcode.AND_DD, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'AND_DD' },
        ],
    },

    {
        mnemonic: 'OR', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            //{ operands: 'NONE', opcode: Opcode.OR_A_IMM, size: 1, condition: (ops) => true, mnemonic: 'OR' },
            { operands: 'REG_IMM8', opcode: Opcode.OR_A_IMM, size: 2, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER', mnemonic: 'OR_A_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.OR_B_IMM, size: 2, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER', mnemonic: 'OR_B_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.OR_C_IMM, size: 2, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER', mnemonic: 'OR_C_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.OR_D_IMM, size: 2, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER', mnemonic: 'OR_D_IMM' },
            { operands: 'REG_REG', opcode: Opcode.OR_AA, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'OR_AA' },
            { operands: 'REG_REG', opcode: Opcode.OR_AB, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'OR_AB' },
            { operands: 'REG_REG', opcode: Opcode.OR_AC, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'OR_AC' },
            { operands: 'REG_REG', opcode: Opcode.OR_AD, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'OR_AD' },
            { operands: 'REG_REG', opcode: Opcode.OR_BA, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'OR_BA' },
            { operands: 'REG_REG', opcode: Opcode.OR_BB, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'OR_BB' },
            { operands: 'REG_REG', opcode: Opcode.OR_BC, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'OR_BC' },
            { operands: 'REG_REG', opcode: Opcode.OR_BD, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'OR_BD' },
            { operands: 'REG_REG', opcode: Opcode.OR_CA, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'OR_CA' },
            { operands: 'REG_REG', opcode: Opcode.OR_CB, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'OR_CB' },
            { operands: 'REG_REG', opcode: Opcode.OR_CC, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'OR_CC' },
            { operands: 'REG_REG', opcode: Opcode.OR_CD, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'OR_CD' },
            { operands: 'REG_REG', opcode: Opcode.OR_DA, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'OR_DA' },
            { operands: 'REG_REG', opcode: Opcode.OR_DB, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'OR_DB' },
            { operands: 'REG_REG', opcode: Opcode.OR_DC, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'OR_DC' },
            { operands: 'REG_REG', opcode: Opcode.OR_DD, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'OR_DD' },
        ],
    },

    {
        mnemonic: 'XOR', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            //{ operands: 'NONE', opcode: Opcode.XOR_A_IMM, size: 1, condition: (ops) => true, mnemonic: 'XOR' },
            { operands: 'REG_IMM8', opcode: Opcode.XOR_A_IMM, size: 2, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER', mnemonic: 'XOR_A_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.XOR_B_IMM, size: 2, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER', mnemonic: 'XOR_B_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.XOR_C_IMM, size: 2, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER', mnemonic: 'XOR_C_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.XOR_D_IMM, size: 2, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER', mnemonic: 'XOR_D_IMM' },
            { operands: 'REG_REG', opcode: Opcode.XOR_AA, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'XOR_AA' },
            { operands: 'REG_REG', opcode: Opcode.XOR_AB, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'XOR_AB' },
            { operands: 'REG_REG', opcode: Opcode.XOR_AC, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'XOR_AC' },
            { operands: 'REG_REG', opcode: Opcode.XOR_AD, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'XOR_AD' },
            { operands: 'REG_REG', opcode: Opcode.XOR_BA, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'XOR_BA' },
            { operands: 'REG_REG', opcode: Opcode.XOR_BB, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'XOR_BB' },
            { operands: 'REG_REG', opcode: Opcode.XOR_BC, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'XOR_BC' },
            { operands: 'REG_REG', opcode: Opcode.XOR_BD, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'XOR_BD' },
            { operands: 'REG_REG', opcode: Opcode.XOR_CA, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'XOR_CA' },
            { operands: 'REG_REG', opcode: Opcode.XOR_CB, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'XOR_CB' },
            { operands: 'REG_REG', opcode: Opcode.XOR_CC, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'XOR_CC' },
            { operands: 'REG_REG', opcode: Opcode.XOR_CD, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'XOR_CD' },
            { operands: 'REG_REG', opcode: Opcode.XOR_DA, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'XOR_DA' },
            { operands: 'REG_REG', opcode: Opcode.XOR_DB, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'XOR_DB' },
            { operands: 'REG_REG', opcode: Opcode.XOR_DC, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'XOR_DC' },
            { operands: 'REG_REG', opcode: Opcode.XOR_DD, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'XOR_DD' },
        ],
    },

    {
        mnemonic: 'TEST', opcode: 0x00, operands: 'REG_REG', size: 1, variants: [
            // Test registre-registre
            { operands: 'REG_REG', opcode: Opcode.TEST_AA, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'TEST_AA' },
            { operands: 'REG_REG', opcode: Opcode.TEST_AB, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'TEST_AB' },
            { operands: 'REG_REG', opcode: Opcode.TEST_AC, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'TEST_AC' },
            { operands: 'REG_REG', opcode: Opcode.TEST_AD, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'TEST_AD' },
            { operands: 'REG_REG', opcode: Opcode.TEST_BA, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'TEST_BA' },
            { operands: 'REG_REG', opcode: Opcode.TEST_BB, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'TEST_BB' },
            { operands: 'REG_REG', opcode: Opcode.TEST_BC, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'TEST_BC' },
            { operands: 'REG_REG', opcode: Opcode.TEST_BD, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'TEST_BD' },
            { operands: 'REG_REG', opcode: Opcode.TEST_CA, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'TEST_CA' },
            { operands: 'REG_REG', opcode: Opcode.TEST_CB, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'TEST_CB' },
            { operands: 'REG_REG', opcode: Opcode.TEST_CC, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'TEST_CC' },
            { operands: 'REG_REG', opcode: Opcode.TEST_CD, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'TEST_CD' },
            { operands: 'REG_REG', opcode: Opcode.TEST_DA, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'TEST_DA' },
            { operands: 'REG_REG', opcode: Opcode.TEST_DB, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'TEST_DB' },
            { operands: 'REG_REG', opcode: Opcode.TEST_DC, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'TEST_DC' },
            { operands: 'REG_REG', opcode: Opcode.TEST_DD, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'TEST_DD' },
            // Test registre seul (test avec lui-même)
            { operands: 'REG', opcode: Opcode.TEST_A, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER', mnemonic: 'TEST_A' },
            { operands: 'REG', opcode: Opcode.TEST_B, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER', mnemonic: 'TEST_B' },
            { operands: 'REG', opcode: Opcode.TEST_C, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER', mnemonic: 'TEST_C' },
            { operands: 'REG', opcode: Opcode.TEST_D, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER', mnemonic: 'TEST_D' },

            { operands: 'REG_IMM8', opcode: Opcode.TEST_A_IMM, size: 2, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER', mnemonic: 'TEST_A_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.TEST_A_IMM, size: 2, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER', mnemonic: 'TEST_B_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.TEST_A_IMM, size: 2, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER', mnemonic: 'TEST_C_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.TEST_A_IMM, size: 2, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER', mnemonic: 'TEST_D_IMM' },
        ]
    },

    {
        mnemonic: 'CMP', opcode: 0x00, operands: 'REG_REG', size: 1, variants: [
            // CMP registre-registre
            { operands: 'REG_REG', opcode: Opcode.CMP_AA, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'CMP_AA' },
            { operands: 'REG_REG', opcode: Opcode.CMP_AB, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'CMP_AB' },
            { operands: 'REG_REG', opcode: Opcode.CMP_AC, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'CMP_AC' },
            { operands: 'REG_REG', opcode: Opcode.CMP_AD, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'CMP_AD' },
            { operands: 'REG_REG', opcode: Opcode.CMP_BA, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'CMP_BA' },
            { operands: 'REG_REG', opcode: Opcode.CMP_BB, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'CMP_BB' },
            { operands: 'REG_REG', opcode: Opcode.CMP_BC, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'CMP_BC' },
            { operands: 'REG_REG', opcode: Opcode.CMP_BD, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'CMP_BD' },
            { operands: 'REG_REG', opcode: Opcode.CMP_CA, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'CMP_CA' },
            { operands: 'REG_REG', opcode: Opcode.CMP_CB, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'CMP_CB' },
            { operands: 'REG_REG', opcode: Opcode.CMP_CC, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'CMP_CC' },
            { operands: 'REG_REG', opcode: Opcode.CMP_CD, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'CMP_CD' },
            { operands: 'REG_REG', opcode: Opcode.CMP_DA, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'A' && ops[1].type === 'REGISTER', mnemonic: 'CMP_DA' },
            { operands: 'REG_REG', opcode: Opcode.CMP_DB, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'B' && ops[1].type === 'REGISTER', mnemonic: 'CMP_DB' },
            { operands: 'REG_REG', opcode: Opcode.CMP_DC, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'C' && ops[1].type === 'REGISTER', mnemonic: 'CMP_DC' },
            { operands: 'REG_REG', opcode: Opcode.CMP_DD, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].register === 'D' && ops[1].type === 'REGISTER', mnemonic: 'CMP_DD' },
            // CMP registre-immédiat
            { operands: 'REG_IMM8', opcode: Opcode.CMP_A_IMM, size: 2, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].type === 'IMMEDIATE', mnemonic: 'CMP_A_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.CMP_B_IMM, size: 2, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].type === 'IMMEDIATE', mnemonic: 'CMP_B_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.CMP_C_IMM, size: 2, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].type === 'IMMEDIATE', mnemonic: 'CMP_C_IMM' },
            { operands: 'REG_IMM8', opcode: Opcode.CMP_D_IMM, size: 2, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].type === 'IMMEDIATE', mnemonic: 'CMP_D_IMM' },
        ]
    },

    {
        mnemonic: 'SHL', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG', opcode: Opcode.SHL_A, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER', mnemonic: 'SHL_A' },
            { operands: 'REG', opcode: Opcode.SHL_B, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER', mnemonic: 'SHL_B' },
            { operands: 'REG', opcode: Opcode.SHL_C, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER', mnemonic: 'SHL_C' },
            { operands: 'REG', opcode: Opcode.SHL_D, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER', mnemonic: 'SHL_D' },
            { operands: 'REG_IMM8', opcode: Opcode.SHL_A_N, size: 2, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].type === 'IMMEDIATE', mnemonic: 'SHL_A_N' },
            { operands: 'REG_IMM8', opcode: Opcode.SHL_B_N, size: 2, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].type === 'IMMEDIATE', mnemonic: 'SHL_B_N' },
            { operands: 'REG_IMM8', opcode: Opcode.SHL_C_N, size: 2, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].type === 'IMMEDIATE', mnemonic: 'SHL_C_N' },
            { operands: 'REG_IMM8', opcode: Opcode.SHL_D_N, size: 2, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].type === 'IMMEDIATE', mnemonic: 'SHL_D_N' },
        ]
    },

    {
        mnemonic: 'SHR', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG', opcode: Opcode.SHR_A, size: 1, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER', mnemonic: 'SHR_A' },
            { operands: 'REG', opcode: Opcode.SHR_B, size: 1, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER', mnemonic: 'SHR_B' },
            { operands: 'REG', opcode: Opcode.SHR_C, size: 1, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER', mnemonic: 'SHR_C' },
            { operands: 'REG', opcode: Opcode.SHR_D, size: 1, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER', mnemonic: 'SHR_D' },
            { operands: 'REG_IMM8', opcode: Opcode.SHR_A_N, size: 2, condition: (ops) => ops[0].register === 'A' && ops[0].type === 'REGISTER' && ops[1].type === 'IMMEDIATE', mnemonic: 'SHR_A_N' },
            { operands: 'REG_IMM8', opcode: Opcode.SHR_B_N, size: 2, condition: (ops) => ops[0].register === 'B' && ops[0].type === 'REGISTER' && ops[1].type === 'IMMEDIATE', mnemonic: 'SHR_B_N' },
            { operands: 'REG_IMM8', opcode: Opcode.SHR_C_N, size: 2, condition: (ops) => ops[0].register === 'C' && ops[0].type === 'REGISTER' && ops[1].type === 'IMMEDIATE', mnemonic: 'SHR_C_N' },
            { operands: 'REG_IMM8', opcode: Opcode.SHR_D_N, size: 2, condition: (ops) => ops[0].register === 'D' && ops[0].type === 'REGISTER' && ops[1].type === 'IMMEDIATE', mnemonic: 'SHR_D_N' },
        ]
    },
];


export const CUSTOM_CPU: CPUArchitecture = {
    name: 'Custom8bit',
    addressSize: 16,
    registers,
    instructions,
    endianness: 'little',
};
