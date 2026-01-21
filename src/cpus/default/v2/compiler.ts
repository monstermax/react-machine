
import { Lexer, type Token } from './compiler_lexer';

import type {
    CPUArchitecture,
    CompilerOptions,
    CompiledProgram,
    Section,
    ByteEntry,
    SymbolInfo,
    CompilerError,
    ParsedOperand,
    InstructionDef,
    InstructionVariant
} from './compiler.types';


export class Compiler {
    private arch: CPUArchitecture;
    private tokens: Token[] = [];
    private pos = 0;

    private sections: Map<string, Section> = new Map();
    private currentSection: string = '.text';
    private currentAddress = 0;

    private labels: Map<string, number> = new Map();
    private symbols: Map<string, SymbolInfo> = new Map();
    private unresolvedRefs: Array<{
        address: number;
        section: string;
        label: string;
        size: number;
    }> = [];

    private errors: CompilerError[] = [];
    private registerMap: Map<string, string> = new Map();
    private instructionMap: Map<string, InstructionDef> = new Map();

    private caseSensitive: boolean;
    private entryPoint?: number;

    constructor(options: CompilerOptions) {
        this.arch = options.architecture;
        this.caseSensitive = options.caseSensitive || false;

        this.buildRegisterMap();
        this.buildInstructionMap();

        this.sections.set('.text', {
            name: '.text',
            type: 'code',
            startAddress: options.startAddress || 0,
            data: []
        });

        this.sections.set('.data', {
            name: '.data',
            type: 'data',
            startAddress: 0,
            data: []
        });

        this.sections.set('.bss', {
            name: '.bss',
            type: 'bss',
            startAddress: 0,
            data: []
        });
    }

    private buildRegisterMap(): void {
        for (const reg of this.arch.registers) {
            this.registerMap.set(
                this.caseSensitive ? reg.name : reg.name.toUpperCase(),
                reg.id
            );

            for (const alias of reg.aliases) {
                this.registerMap.set(
                    this.caseSensitive ? alias : alias.toUpperCase(),
                    reg.id
                );
            }
        }
    }

    private buildInstructionMap(): void {
        for (const instr of this.arch.instructions) {
            const key = this.caseSensitive ? instr.mnemonic : instr.mnemonic.toUpperCase();
            this.instructionMap.set(key, instr);
        }
    }

    public compile(source: string): CompiledProgram {
        const instructions = Array.from(this.instructionMap.keys());
        const registers = Array.from(this.registerMap.keys());
        const directives = [
            'DB', 'DW', 'DD', 'DQ',
            'SECTION', 'GLOBAL', 'EXTERN',
            '.DATA', '.CODE', '.TEXT', '.BSS', '.ORG',
            'RESB', 'RESW', 'RESD', 'RESQ',
            'EQU', 'TIMES'
        ];

        const lexer = new Lexer(source, instructions, registers, directives, this.caseSensitive);
        this.tokens = lexer.tokenize().filter(t => t.type !== 'COMMENT' && t.type !== 'NEWLINE');

        this.pass1CollectSymbols();

        this.pos = 0;
        this.resetSections();

        this.pass2GenerateCode();

        this.resolveReferences();

        return {
            sections: Array.from(this.sections.values()),
            labels: this.labels,
            symbols: this.symbols,
            entryPoint: this.entryPoint,
            errors: this.errors
        };
    }

    private resetSections(): void {
        for (const section of this.sections.values()) {
            section.data = [];
        }
        this.currentSection = '.text';
        this.currentAddress = this.sections.get('.text')!.startAddress;
    }

    private pass1CollectSymbols(): void {
        this.pos = 0;
        this.currentSection = '.text';
        this.currentAddress = this.sections.get('.text')!.startAddress;

        while (!this.isAtEnd()) {
            const token = this.peek();

            if (token.type === 'DIRECTIVE') {
                this.handleDirectivePass1();
                continue;
            }

            if (token.type === 'LABEL') {
                const labelName = token.value;
                this.labels.set(labelName, this.currentAddress);
                this.symbols.set(labelName, {
                    address: this.currentAddress,
                    section: this.currentSection,
                    type: 'label'
                });
                this.advance();
                this.skip('COLON');
                continue;
            }

            if (token.type === 'IDENTIFIER') {
                const next = this.peek(1);
                if (next?.type === 'DIRECTIVE') {
                    const directive = this.normalize(next.value);
                    if (['DB', 'DW', 'DD', 'DQ', 'RESB', 'RESW', 'RESD', 'RESQ'].includes(directive)) {
                        const varName = token.value;
                        this.labels.set(varName, this.currentAddress);
                        this.symbols.set(varName, {
                            address: this.currentAddress,
                            section: this.currentSection,
                            type: 'variable'
                        });
                        this.advance();
                        this.advance();
                        this.currentAddress += this.calculateDataSize();
                        continue;
                    }
                }
            }

            if (token.type === 'INSTRUCTION') {
                this.currentAddress += this.calculateInstructionSize();
                continue;
            }

            this.advance();
        }
    }

    private handleDirectivePass1(): void {
        const directive = this.normalize(this.peek().value);

        if (directive === 'SECTION' || directive.startsWith('.')) {
            this.advance();

            let sectionName = directive;
            if (directive === 'SECTION' && !this.isAtEnd()) {
                const nameToken = this.peek();
                if (nameToken.type === 'IDENTIFIER' || nameToken.type === 'DIRECTIVE') {
                    sectionName = this.normalize(nameToken.value);
                    this.advance();
                }
            }

            if (sectionName === '.DATA' || sectionName === 'DATA') {
                this.currentSection = '.data';
            } else if (sectionName === '.BSS' || sectionName === 'BSS') {
                this.currentSection = '.bss';
            } else {
                this.currentSection = '.text';
            }

            const section = this.sections.get(this.currentSection);
            if (section) {
                this.currentAddress = section.startAddress;
            }
            return;
        }

        if (directive === '.ORG') {
            this.advance();
            if (this.peek().type === 'NUMBER') {
                this.currentAddress = this.parseNumber(this.peek().value);
                this.advance();
            }
            return;
        }

        if (directive === 'GLOBAL' || directive === 'EXTERN') {
            this.advance();
            while (!this.isAtEnd() && this.peek().type === 'IDENTIFIER') {
                const symbolName = this.peek().value;

                if (directive === 'GLOBAL') {
                    const sym = this.symbols.get(symbolName);
                    if (sym) {
                        sym.global = true;
                    }

                    if (symbolName === '_start' || symbolName === 'start' || symbolName === 'main') {
                        const addr = this.labels.get(symbolName);
                        if (addr !== undefined) {
                            this.entryPoint = addr;
                        }
                    }
                } else {
                    this.symbols.set(symbolName, {
                        address: 0,
                        section: '',
                        type: 'label',
                        extern: true
                    });
                }

                this.advance();
                if (this.peek().type === 'COMMA') this.advance();
            }
            return;
        }

        this.advance();
    }

    private pass2GenerateCode(): void {
        this.pos = 0;
        this.currentSection = '.text';
        this.currentAddress = this.sections.get('.text')!.startAddress;

        while (!this.isAtEnd()) {
            const token = this.peek();

            if (token.type === 'DIRECTIVE') {
                this.handleDirectivePass2();
                continue;
            }

            if (token.type === 'LABEL') {
                this.advance();
                this.skip('COLON');
                continue;
            }

            if (token.type === 'IDENTIFIER') {
                const next = this.peek(1);
                if (next?.type === 'DIRECTIVE') {
                    const directive = this.normalize(next.value);
                    if (['DB', 'DW', 'DD', 'DQ'].includes(directive)) {
                        const varName = token.value;
                        this.advance();
                        this.advance();
                        this.generateData(varName);
                        continue;
                    }
                    if (['RESB', 'RESW', 'RESD', 'RESQ'].includes(directive)) {
                        this.advance();
                        this.advance();
                        this.reserveSpace();
                        continue;
                    }
                }
            }

            if (token.type === 'INSTRUCTION') {
                this.generateInstruction();
                continue;
            }

            this.advance();
        }
    }

    private handleDirectivePass2(): void {
        const directive = this.normalize(this.peek().value);

        if (directive === 'SECTION' || directive.startsWith('.')) {
            this.advance();

            let sectionName = directive;
            if (directive === 'SECTION' && !this.isAtEnd()) {
                const nameToken = this.peek();
                if (nameToken.type === 'IDENTIFIER' || nameToken.type === 'DIRECTIVE') {
                    sectionName = this.normalize(nameToken.value);
                    this.advance();
                }
            }

            if (sectionName === '.DATA' || sectionName === 'DATA') {
                this.currentSection = '.data';
            } else if (sectionName === '.BSS' || sectionName === 'BSS') {
                this.currentSection = '.bss';
            } else {
                this.currentSection = '.text';
            }

            const section = this.sections.get(this.currentSection);
            if (section) {
                this.currentAddress = section.startAddress + section.data.length;
            }
            return;
        }

        if (directive === '.ORG') {
            this.advance();
            if (this.peek().type === 'NUMBER') {
                this.currentAddress = this.parseNumber(this.peek().value);
                this.advance();
            }
            return;
        }

        if (directive === 'GLOBAL' || directive === 'EXTERN') {
            this.advance();
            while (!this.isAtEnd() && this.peek().type === 'IDENTIFIER') {
                this.advance();
                if (this.peek().type === 'COMMA') this.advance();
            }
            return;
        }

        this.advance();
    }

    private generateData(varName?: string): void {
        while (!this.isAtEnd()) {
            const token = this.peek();

            if (token.type === 'STRING') {
                for (let i = 0; i < token.value.length; i++) {
                    this.emitByte(token.value.charCodeAt(i), `'${token.value[i]}'`);
                }
                this.advance();
            } else if (token.type === 'NUMBER') {
                const value = this.parseNumber(token.value);
                this.emitByte(value, token.value);
                this.advance();
            } else if (token.type === 'IDENTIFIER') {
                const addr = this.labels.get(token.value);
                if (addr !== undefined) {
                    this.emitByte(addr & 0xFF);
                    if (this.arch.addressSize > 8) {
                        this.emitByte((addr >> 8) & 0xFF);
                    }
                } else {
                    this.unresolvedRefs.push({
                        address: this.currentAddress,
                        section: this.currentSection,
                        label: token.value,
                        size: this.arch.addressSize > 8 ? 2 : 1
                    });
                    this.emitByte(0);
                    if (this.arch.addressSize > 8) {
                        this.emitByte(0);
                    }
                }
                this.advance();
            } else if (token.type === 'COMMA') {
                this.advance();
            } else {
                break;
            }
        }
    }

    private reserveSpace(): void {
        if (this.peek().type === 'NUMBER') {
            const count = this.parseNumber(this.peek().value);
            for (let i = 0; i < count; i++) {
                this.emitByte(0);
            }
            this.advance();
        }
    }

    private generateInstruction(): void {
        const instrToken = this.peek();
        const mnemonic = this.normalize(instrToken.value);

        const instrDef = this.instructionMap.get(mnemonic);
        if (!instrDef) {
            this.error(instrToken, `Unknown instruction: ${mnemonic}`);
            this.advance();
            return;
        }

        this.advance();

        const operands = this.parseOperands();

        const variant = this.findInstructionVariant(instrDef, operands);
        if (!variant) {
            this.error(instrToken, `Invalid operands for ${mnemonic}`);
            return;
        }

        this.emitByte(variant.opcode, variant.mnemonic, true);

        this.emitOperands(operands, variant);
    }

    private parseOperands(): ParsedOperand[] {
        const operands: ParsedOperand[] = [];

        while (!this.isAtEnd()) {
            const token = this.peek();

            if (token.type === 'REGISTER') {
                operands.push({
                    type: 'REGISTER',
                    value: token.value,
                    register: this.mapRegister(token.value)
                });
                this.advance();
            } else if (token.type === 'NUMBER') {
                operands.push({
                    type: 'IMMEDIATE',
                    value: token.value,
                    address: this.parseNumber(token.value)
                });
                this.advance();
            } else if (token.type === 'LBRACKET') {
                this.advance();
                const memOperand = this.parseMemoryOperand();
                this.skip('RBRACKET');
                operands.push(memOperand);
            } else if (token.type === 'IDENTIFIER') {
                operands.push({
                    type: 'LABEL',
                    value: token.value,
                    address: this.labels.get(token.value)
                });
                this.advance();
            } else if (token.type === 'COMMA') {
                this.advance();
            } else {
                break;
            }
        }

        return operands;
    }

    private parseMemoryOperand(): ParsedOperand {
        const operand: ParsedOperand = {
            type: 'MEMORY',
            value: ''
        };

        const token = this.peek();

        if (token.type === 'NUMBER') {
            operand.address = this.parseNumber(token.value);
            operand.value = token.value;
            this.advance();
        } else if (token.type === 'IDENTIFIER') {
            operand.value = token.value;
            operand.address = this.labels.get(token.value);
            this.advance();
        } else if (token.type === 'REGISTER') {
            operand.base = this.mapRegister(token.value);
            operand.value = token.value;
            this.advance();
        }

        return operand;
    }

    private findInstructionVariant(instrDef: InstructionDef, operands: ParsedOperand[]): InstructionVariant | null {
        if (!instrDef.variants || instrDef.variants.length === 0) {
            if (this.matchesOperandPattern(instrDef.operands, operands)) {
                return {
                    operands: instrDef.operands,
                    opcode: instrDef.opcode,
                    size: instrDef.size,
                    mnemonic: instrDef.mnemonic,
                };
            }
            return null;
        }

        for (const variant of instrDef.variants) {
            if (this.matchesOperandPattern(variant.operands, operands)) {
                if (!variant.condition || variant.condition(operands)) {
                    return variant;
                }
            }
        }

        return null;
    }

    private matchesOperandPattern(pattern: string, operands: ParsedOperand[]): boolean {
        if (pattern === 'NONE') return operands.length === 0;

        const parts = pattern.split('_');
        if (parts.length !== operands.length) return false;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const op = operands[i];

            if (part === 'REG' && op.type !== 'REGISTER') return false;
            if (part.startsWith('IMM') && op.type !== 'IMMEDIATE') return false;
            if (part === 'MEM' && op.type !== 'MEMORY' && op.type !== 'LABEL') return false;
        }

        return true;
    }

    private emitOperands(operands: ParsedOperand[], variant: InstructionVariant): void {
        const pattern = variant.operands;

        if (pattern === 'NONE') return;

        const parts = pattern.split('_');

        for (let i = 0; i < operands.length; i++) {
            const part = parts[i];
            const op = operands[i];

            if (part === 'IMM8') {
                const value = op.address !== undefined ? op.address : this.parseNumber(op.value);
                this.emitByte(value & 0xFF, op.value);
            } else if (part === 'IMM16' || part === 'MEM') {
                let value = 0;

                if (op.address !== undefined) {
                    value = op.address;
                } else if (op.type === 'LABEL') {
                    const addr = this.labels.get(op.value);
                    if (addr !== undefined) {
                        value = addr;
                    } else {
                        this.unresolvedRefs.push({
                            address: this.currentAddress,
                            section: this.currentSection,
                            label: op.value,
                            size: 2
                        });
                    }
                } else {
                    value = this.parseNumber(op.value);
                }

                if (this.arch.endianness === 'little') {
                    this.emitByte(value & 0xFF, `${op.value} (low)`);
                    this.emitByte((value >> 8) & 0xFF, `${op.value} (high)`);
                } else {
                    this.emitByte((value >> 8) & 0xFF, `${op.value} (high)`);
                    this.emitByte(value & 0xFF, `${op.value} (low)`);
                }
            }
        }
    }

    private calculateInstructionSize(): number {
        const instrToken = this.peek();
        const mnemonic = this.normalize(instrToken.value);
        const instrDef = this.instructionMap.get(mnemonic);

        if (!instrDef) return 1;

        this.advance();
        const operands = this.parseOperands();

        const variant = this.findInstructionVariant(instrDef, operands);
        return variant ? variant.size : 1;
    }

    private calculateDataSize(): number {
        let size = 0;

        while (!this.isAtEnd()) {
            const token = this.peek();

            if (token.type === 'STRING') {
                size += token.value.length;
                this.advance();
            } else if (token.type === 'NUMBER') {
                size += 1;
                this.advance();
            } else if (token.type === 'IDENTIFIER') {
                size += this.arch.addressSize > 8 ? 2 : 1;
                this.advance();
            } else if (token.type === 'COMMA') {
                this.advance();
            } else {
                break;
            }
        }

        return size;
    }

    private resolveReferences(): void {
        for (const ref of this.unresolvedRefs) {
            const addr = this.labels.get(ref.label);
            if (addr === undefined) {
                this.errors.push({
                    line: 0,
                    column: 0,
                    message: `Undefined label: ${ref.label}`,
                    severity: 'error'
                });
                continue;
            }

            const section = this.sections.get(ref.section);
            if (!section) continue;

            const offset = ref.address - section.startAddress;

            if (ref.size === 2) {
                if (this.arch.endianness === 'little') {
                    section.data[offset].value = addr & 0xFF;
                    section.data[offset + 1].value = (addr >> 8) & 0xFF;
                } else {
                    section.data[offset].value = (addr >> 8) & 0xFF;
                    section.data[offset + 1].value = addr & 0xFF;
                }
            } else {
                section.data[offset].value = addr & 0xFF;
            }
        }
    }

    private emitByte(value: number, comment?: string, isOpcode = false): void {
        const section = this.sections.get(this.currentSection);
        if (!section) return;

        section.data.push({
            address: this.currentAddress++,
            value: value & 0xFF,
            section: this.currentSection,
            comment,
            isOpcode
        });
    }

    private mapRegister(name: string): string {
        const normalized = this.caseSensitive ? name : name.toUpperCase();
        return this.registerMap.get(normalized) || name;
    }

    private normalize(str: string): string {
        return this.caseSensitive ? str : str.toUpperCase();
    }

    private parseNumber(str: string): number {
        const lower = str.toLowerCase();

        if (lower.startsWith('0x')) return parseInt(lower.substring(2), 16);
        if (lower.startsWith('$')) return parseInt(lower.substring(1), 16);
        if (lower.startsWith('0b')) return parseInt(lower.substring(2), 2);
        if (lower.endsWith('h')) return parseInt(lower.substring(0, lower.length - 1), 16);
        if (lower.endsWith('b') && lower.length > 1) return parseInt(lower.substring(0, lower.length - 1), 2);

        return parseInt(str, 10);
    }

    private peek(offset = 0): Token {
        return this.tokens[this.pos + offset] || { type: 'EOF', value: '', line: 0, column: 0 };
    }

    private advance(): Token {
        return this.tokens[this.pos++];
    }

    private skip(type: string): void {
        if (this.peek().type === type) {
            this.advance();
        }
    }

    private isAtEnd(): boolean {
        return this.peek().type === 'EOF';
    }

    private error(token: Token, message: string): void {
        this.errors.push({
            line: token.line,
            column: token.column,
            message,
            severity: 'error'
        });
    }
}
