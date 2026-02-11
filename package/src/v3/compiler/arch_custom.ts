
import { Opcode } from '../assembly/core/cpu_instructions';

import type { CPUArchitecture, RegisterDef, InstructionDef } from '@/v2/cpus/default/compiler_v2/compiler.types';


const registers: RegisterDef[] = [
    { name: 'A', aliases: ['AL', 'AH', 'AX', 'EAX', 'RAX'], id: 'A', size: 8 },
    { name: 'B', aliases: ['BL', 'BH', 'BX', 'EBX', 'RBX'], id: 'B', size: 8 },
    { name: 'C', aliases: ['CL', 'CH', 'CX', 'ECX', 'RCX'], id: 'C', size: 8 },
    { name: 'D', aliases: ['DL', 'DH', 'DX', 'EDX', 'RDX'], id: 'D', size: 8 },
    //{ name: 'SI', aliases: ['ESI', 'RSI'], id: 'SI', size: 8 }, // Source Index (pointeur source)
    //{ name: 'DI', aliases: ['EDI', 'RDI'], id: 'DI', size: 8 }, // Destination Index (pointeur destination)
    { name: 'SP', aliases: ['ESP', 'RSP'], id: 'SP', size: 8 },
    //{ name: 'BP', aliases: ['EBP', 'RBP'], id: 'BP', size: 8 }, // Base Pointer (pointeur de base pour la pile)
];


const instructions: InstructionDef[] = [
    // CONTROL
    { mnemonic: 'NOP', opcode: Opcode.NOP, operands: 'NONE', size: 1 },
    { mnemonic: 'HALT', opcode: Opcode.HALT, operands: 'NONE', size: 1 },
    { mnemonic: 'HLT', opcode: Opcode.HALT, operands: 'NONE', size: 1 },

    // STACK
    {
        mnemonic: 'PUSH', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG', opcode: Opcode.PUSH_REG, size: 2, condition: (ops) => true, mnemonic: 'PUSH_REG' },
        ]
    },

    {
        mnemonic: 'POP', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG', opcode: Opcode.POP_REG, size: 2, condition: (ops) => true, mnemonic: 'POP_REG' },
        ]
    },

    {
        mnemonic: 'CALL', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.CALL, size: 3, condition: (ops) => true, mnemonic: 'CALL' },
            { operands: 'MEM', opcode: Opcode.CALL, size: 3, condition: (ops) => ops[0].type === 'LABEL', mnemonic: 'CALL' },
            { operands: 'MEM', opcode: Opcode.CALL, size: 3, condition: (ops) => ops[0].type === 'MEMORY', mnemonic: 'CALL' },
        ],
    },
    { mnemonic: 'RET', opcode: Opcode.RET, operands: 'NONE', size: 1 },

    // INTERRUPTS
    //{ mnemonic: 'EI', opcode: Opcode.EI, operands: 'NONE', size: 1 },
    //{ mnemonic: 'DI', opcode: Opcode.DI, operands: 'NONE', size: 1 },
    //{ mnemonic: 'IRET', opcode: Opcode.IRET, operands: 'NONE', size: 1 },

    // SAUTS
    {
        mnemonic: 'JMP', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JMP, size: 3, condition: (ops) => true, mnemonic: 'JMP' },
            { operands: 'MEM', opcode: Opcode.JMP, size: 3, condition: (ops) => true, mnemonic: 'JMP' },
        ],
    },
    {
        mnemonic: 'JZ', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JZ, size: 3, condition: (ops) => true, mnemonic: 'JZ' },
            { operands: 'MEM', opcode: Opcode.JZ, size: 3, condition: (ops) => true, mnemonic: 'JZ' },
        ],
    },
    {
        mnemonic: 'JE', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JE, size: 3, condition: (ops) => true, mnemonic: 'JE' },
            { operands: 'MEM', opcode: Opcode.JE, size: 3, condition: (ops) => true, mnemonic: 'JE' },
        ],
    },
    {
        mnemonic: 'JNZ', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JNZ, size: 3, condition: (ops) => true, mnemonic: 'JNZ' },
            { operands: 'MEM', opcode: Opcode.JNZ, size: 3, condition: (ops) => true, mnemonic: 'JNZ' },
        ],
    },
    {
        mnemonic: 'JNE', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JNE, size: 3, condition: (ops) => true, mnemonic: 'JNE' },
            { operands: 'MEM', opcode: Opcode.JNE, size: 3, condition: (ops) => true, mnemonic: 'JNE' },
        ],
    },
    {
        mnemonic: 'JC', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JC, size: 3, condition: (ops) => true, mnemonic: 'JC' },
            { operands: 'MEM', opcode: Opcode.JC, size: 3, condition: (ops) => true, mnemonic: 'JC' },
        ],
    },
    {
        mnemonic: 'JNC', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JNC, size: 3, condition: (ops) => true, mnemonic: 'JNC' },
            { operands: 'MEM', opcode: Opcode.JNC, size: 3, condition: (ops) => true, mnemonic: 'JNC' },
        ],
    },
    {
        mnemonic: 'JL', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JL, size: 3, condition: (ops) => true, mnemonic: 'JL' },
            { operands: 'MEM', opcode: Opcode.JL, size: 3, condition: (ops) => true, mnemonic: 'JL' },
        ],
    },
    {
        mnemonic: 'JB', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JB, size: 3, condition: (ops) => true, mnemonic: 'JB' },
            { operands: 'MEM', opcode: Opcode.JB, size: 3, condition: (ops) => true, mnemonic: 'JB' },
        ],
    },
    {
        mnemonic: 'JLE', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JLE, size: 3, condition: (ops) => true, mnemonic: 'JLE' },
            { operands: 'MEM', opcode: Opcode.JLE, size: 3, condition: (ops) => true, mnemonic: 'JLE' },
        ],
    },
    {
        mnemonic: 'JBE', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JBE, size: 3, condition: (ops) => true, mnemonic: 'JBE' },
            { operands: 'MEM', opcode: Opcode.JBE, size: 3, condition: (ops) => true, mnemonic: 'JBE' },
        ],
    },
    {
        mnemonic: 'JG', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JG, size: 3, condition: (ops) => true, mnemonic: 'JG' },
            { operands: 'MEM', opcode: Opcode.JG, size: 3, condition: (ops) => true, mnemonic: 'JG' },
        ],
    },
    {
        mnemonic: 'JA', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JA, size: 3, condition: (ops) => true, mnemonic: 'JA' },
            { operands: 'MEM', opcode: Opcode.JA, size: 3, condition: (ops) => true, mnemonic: 'JA' },
        ],
    },
    {
        mnemonic: 'JGE', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JGE, size: 3, condition: (ops) => true, mnemonic: 'JGE' },
            { operands: 'MEM', opcode: Opcode.JGE, size: 3, condition: (ops) => true, mnemonic: 'JGE' },
        ],
    },
    {
        mnemonic: 'JAE', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'IMM16', opcode: Opcode.JAE, size: 3, condition: (ops) => true, mnemonic: 'JAE' },
            { operands: 'MEM', opcode: Opcode.JAE, size: 3, condition: (ops) => true, mnemonic: 'JAE' },
        ],
    },

    // MOV
    {
        mnemonic: 'MOV', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG_IMM16', opcode: Opcode.SET_SP, size: 3, condition: (ops) => ops[0].register === 'SP', mnemonic: 'SET_SP' },

            { operands: 'REG_IMM8', opcode: Opcode.MOV_REG_IMM, size: 3, condition: (ops) => true, mnemonic: 'MOV_REG_IMM' },
            { operands: 'REG_REG', opcode: Opcode.MOV_REG_REG, size: 3, condition: (ops) => true, mnemonic: 'MOV_REG_REG' },
            { operands: 'REG_MEM', opcode: Opcode.MOV_REG_MEM, size: 4, condition: (ops) => true, mnemonic: 'MOV_REG_MEM' },

            { operands: 'MEM_REG', opcode: Opcode.MOV_MEM_REG, size: 4, condition: (ops) => true, mnemonic: 'MOV_MEM_REG' },
            { operands: 'MEM_IMM8', opcode: Opcode.MOV_MEM_IMM, size: 4, condition: (ops) => true, mnemonic: 'MOV_MEM_IMM' },
        ]
    },

    {
        mnemonic: 'LEA', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG_REG_IMM16', opcode: Opcode.LEA_REG_REG_IMM, size: 5, condition: (ops) => true, mnemonic: 'LEA_REG_REG_IMM' },
            { operands: 'REG_REG_MEM', opcode: Opcode.LEA_REG_REG_MEM, size: 5, condition: (ops) => true, mnemonic: 'LEA_REG_REG_MEM' },
        ]
    },

    {
        mnemonic: 'LDI', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG_REG_REG', opcode: Opcode.LDI_REG_REG_REG, size: 4, condition: (ops) => true, mnemonic: 'LDI_REG_REG_REG' },
        ]
    },

    {
        mnemonic: 'STI', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG_REG_REG', opcode: Opcode.STI_REG_REG_REG, size: 4, condition: (ops) => true, mnemonic: 'STI_REG_REG_REG' },
        ]
    },

    // ALU
    {
        mnemonic: 'NOT', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG', opcode: Opcode.NOT_REG, size: 2, condition: (ops) => true, mnemonic: 'NOT_REG' },
        ]
    },

    {
        mnemonic: 'INC', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG', opcode: Opcode.INC_REG, size: 2, condition: (ops) => true, mnemonic: 'INC_REG' },
        ]
    },

    {
        mnemonic: 'DEC', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG', opcode: Opcode.DEC_REG, size: 2, condition: (ops) => true, mnemonic: 'DEC_REG' },
        ]
    },

    {
        mnemonic: 'ADD', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG_IMM8', opcode: Opcode.ADD_REG_IMM, size: 3, condition: (ops) => true, mnemonic: 'ADD_REG_IMM' },
            { operands: 'REG_REG', opcode: Opcode.ADD_REG_REG, size: 3, condition: (ops) => true, mnemonic: 'ADD_REG_REG' },
        ],
    },

    {
        mnemonic: 'SUB', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG_IMM8', opcode: Opcode.SUB_REG_IMM, size: 3, condition: (ops) => true, mnemonic: 'SUB_REG_IMM' },
            { operands: 'REG_REG', opcode: Opcode.SUB_REG_REG, size: 3, condition: (ops) => true, mnemonic: 'SUB_REG_REG' },
        ],
    },

    {
        mnemonic: 'AND', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG_IMM8', opcode: Opcode.AND_REG_IMM, size: 3, condition: (ops) => true, mnemonic: 'AND_REG_IMM' },
            { operands: 'REG_REG', opcode: Opcode.AND_REG_REG, size: 3, condition: (ops) => true, mnemonic: 'AND_REG_REG' },
        ],
    },

    {
        mnemonic: 'OR', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG_IMM8', opcode: Opcode.OR_REG_IMM, size: 3, condition: (ops) => true, mnemonic: 'OR_REG_IMM' },
            { operands: 'REG_REG', opcode: Opcode.OR_REG_REG, size: 3, condition: (ops) => true, mnemonic: 'OR_REG_REG' },
        ],
    },

    {
        mnemonic: 'XOR', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG_IMM8', opcode: Opcode.XOR_REG_IMM, size: 3, condition: (ops) => true, mnemonic: 'XOR_REG_IMM' },
            { operands: 'REG_REG', opcode: Opcode.XOR_REG_REG, size: 3, condition: (ops) => true, mnemonic: 'XOR_REG_REG' },
        ],
    },

    {
        mnemonic: 'TEST', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG_REG', opcode: Opcode.TEST_REG_REG, size: 3, condition: (ops) => true, mnemonic: 'TEST_REG_REG' },
            { operands: 'REG_IMM8', opcode: Opcode.TEST_REG_IMM, size: 3, condition: (ops) => true, mnemonic: 'TEST_REG_IMM' },
        ]
    },

    {
        mnemonic: 'CMP', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG_REG', opcode: Opcode.CMP_REG_REG, size: 3, condition: (ops) => true, mnemonic: 'CMP_REG_REG' },
            { operands: 'REG_IMM8', opcode: Opcode.CMP_REG_IMM, size: 3, condition: (ops) => true, mnemonic: 'CMP_REG_IMM' },
        ]
    },

    {
        mnemonic: 'SHL', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG_IMM8', opcode: Opcode.SHL_REG_IMM, size: 3, condition: (ops) => true, mnemonic: 'SHL_REG_IMM' },
            { operands: 'REG_REG', opcode: Opcode.SHL_REG_REG, size: 3, condition: (ops) => true, mnemonic: 'SHL_REG_REG' },
        ]
    },

    {
        mnemonic: 'SHR', opcode: 0x00, operands: 'NONE', size: 1, variants: [
            { operands: 'REG_IMM8', opcode: Opcode.SHR_REG_IMM, size: 3, condition: (ops) => true, mnemonic: 'SHR_REG_IMM' },
            { operands: 'REG_REG', opcode: Opcode.SHR_REG_REG, size: 3, condition: (ops) => true, mnemonic: 'SHR_REG_REG' },
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
