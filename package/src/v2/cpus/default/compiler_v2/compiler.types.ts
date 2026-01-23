
import type { u16 } from "@/types/cpu.types";

export type OperandType = 
    | 'NONE'
    | 'REG'
    | 'IMM8'
    | 'IMM16'
    | 'IMM32'
    | 'MEM'
    | 'REG_REG'
    | 'REG_IMM8'
    | 'REG_IMM16'
    | 'REG_MEM'
    | 'MEM_REG';

export interface InstructionDef {
    mnemonic: string;
    opcode: number;
    operands: OperandType;
    size: number;
    variants?: InstructionVariant[];
}

export interface InstructionVariant {
    operands: OperandType;
    opcode: number;
    size: number;
    condition?: (operands: ParsedOperand[]) => boolean;
    mnemonic: string;
}

export interface RegisterDef {
    name: string;
    aliases: string[];
    id: string;
    size: number;
}

export interface CPUArchitecture {
    name: string;
    addressSize: number;
    registers: RegisterDef[];
    instructions: InstructionDef[];
    endianness: 'little' | 'big';
}

export interface ParsedOperand {
    type: 'REGISTER' | 'IMMEDIATE' | 'MEMORY' | 'LABEL';
    value: string;
    register?: string;
    size?: number;
    address?: number;
    base?: string;
    index?: string;
    scale?: number;
    displacement?: number;
}

export interface CompilerOptions {
    architecture: CPUArchitecture;
    startAddress?: number;
    caseSensitive?: boolean;
}

export interface Section {
    name: string;
    type: 'code' | 'data' | 'bss';
    startAddress: number;
    data: ByteEntry[];
}

export interface ByteEntry {
    address: number;
    value: number;
    section: string;
    label?: string;
    comment?: string;
    isOpcode?: boolean;
}

export interface CompiledProgram {
    sections: Section[];
    labels: Map<string, { section: string, address: u16 }>;
    symbols: Map<string, SymbolInfo>;
    entryPoint?: number;
    errors: CompilerError[];
}

export interface SymbolInfo {
    address: number;
    section: string;
    type: 'label' | 'variable' | 'function';
    size?: number;
    global?: boolean;
    extern?: boolean;
}

export interface CompilerError {
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning';
}
