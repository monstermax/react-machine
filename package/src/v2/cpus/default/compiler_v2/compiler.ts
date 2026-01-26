
import { Lexer, type Token } from './compiler_lexer';

import type { CPUArchitecture, CompilerOptions, CompiledProgram, Section, ByteEntry, SymbolInfo, CompilerError, ParsedOperand, InstructionDef, InstructionVariant } from './compiler.types';
import type { u16 } from '@/types/cpu.types';
import { toHex } from '@/v2/lib/integers';


export class Compiler {
    private arch: CPUArchitecture; // CPU architecture definition (registers, instructions, endianness)
    private tokens: Token[] = [];  // All tokens from lexer
    private pos = 0; // Current position in token stream

    private sections: Map<string, Section> = new Map(); // Memory sections (.text for code, .data for initialized data, .bss for uninitialized)
    private currentSection: string = '.text'; // Currently active section
    private currentAddress = 0; // Current memory address being written

    private labels: Map<string, { section: string, address: u16, values?: any[] | null, dataSize: number | null }> = new Map(); // Label definitions with their addresses and optional data values
    private symbols: Map<string, SymbolInfo> = new Map(); // Symbol table for labels and variables
    private comments: Map<number, string> = new Map(); // Comments associated with specific addresses

    // Forward references to resolve after pass1
    private unresolvedRefs: Array<{
        address: number;
        section: string;
        label: string;
        size: number;
    }> = [];

    private errors: CompilerError[] = []; // Compilation errors
    private registerMap: Map<string, string> = new Map(); // Register name/alias to ID mapping
    private instructionMap: Map<string, InstructionDef> = new Map(); // Instruction mnemonic to definition mapping

    private caseSensitive: boolean; // Whether to match case-sensitive names
    private entryPoint?: number; // Entry point address (e.g., _start, main)


    constructor(options: CompilerOptions) {
        this.arch = options.architecture;
        this.caseSensitive = options.caseSensitive || false;

        // Build lookup maps for registers and instructions
        this.buildRegisterMap();
        this.buildInstructionMap();

        // Initialize standard sections
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


    // Build register name/alias to ID mapping
    private buildRegisterMap(): void {
        // called by constructor

        for (const reg of this.arch.registers) {
            // Add register name
            this.registerMap.set(
                this.caseSensitive ? reg.name : reg.name.toUpperCase(),
                reg.id
            );

            // Add all aliases
            for (const alias of reg.aliases) {
                this.registerMap.set(
                    this.caseSensitive ? alias : alias.toUpperCase(),
                    reg.id
                );
            }
        }
    }


    // Build instruction mnemonic to definition mapping
    private buildInstructionMap(): void {
        // called by constructor

        for (const instr of this.arch.instructions) {
            const key = this.caseSensitive ? instr.mnemonic : instr.mnemonic.toUpperCase();
            this.instructionMap.set(key, instr);
        }
    }


    // Main compilation entry point - performs two-pass compilation
    public async compile(source: string): Promise<CompiledProgram> {
        // should be called externally

        // Define all recognized token types for lexer
        const instructions = Array.from(this.instructionMap.keys());
        const registers = Array.from(this.registerMap.keys());
        const directives = [
            'DB', 'DW', 'DD', 'DQ',
            'SECTION', 'GLOBAL', 'EXTERN',
            '.DATA', '.CODE', '.TEXT', '.BSS', '.ORG', '.INCLUDE',
            'RESB', 'RESW', 'RESD', 'RESQ',
            'EQU', 'TIMES',
        ];

        // Tokenize source code
        const lexer = new Lexer(source, instructions, registers, directives, this.caseSensitive);
        this.tokens = lexer.tokenize() //.filter(t => t.type !== 'COMMENT' && t.type !== 'NEWLINE');
        //console.log('lexer tokens:', this.tokens)


        // Pass 1: collect all symbols and calculate addresses
        this.pass1CollectSymbols();

        // Reset for pass 2
        this.pos = 0;
        this.resetSections();

        // Pass 2: generate actual machine code
        this.pass2GenerateCode();

        // Resolve forward references
        this.resolveReferences();

        return {
            sections: Array.from(this.sections.values()),
            labels: this.labels,
            symbols: this.symbols,
            entryPoint: this.entryPoint,
            errors: this.errors
        };
    }


    // Clear section data between passes while preserving structure
    private resetSections(): void {
        // called by compile

        //const textEnd = this.currentAddress;  // Sauvegarde où .text se termine
        //const dataSection = this.sections.get('.data')!;
        //dataSection.startAddress = textEnd;

        for (const section of this.sections.values()) {
            section.data = [];
        }
        this.currentSection = '.text';
        this.currentAddress = this.sections.get('.text')!.startAddress;
    }


    // Pass 1: scan source to collect labels, calculate addresses, and gather comments
    private pass1CollectSymbols(): void {
        // called by compile

        this.pos = 0;
        this.currentSection = '.text';
        this.currentAddress = this.sections.get('.text')!.startAddress;

        // Track last instruction/identifier address for comment association
        let lastInstructionOrIdentifierAddress: number | null = null;


        while (!this.isAtEnd()) {
            const prev = this.peek(-1);
            const token = this.peek();

            // DIRECTIVE: Handle section directives, .org, global, extern
            if (token.type === 'DIRECTIVE') {
                // example => "section .text"
                this.handleDirectivePass1();
                continue;
            }

            // LABEL: Register label with current address
            if (token.type === 'LABEL') {
                // example => "main:"
                const labelName = token.value;

                this.labels.set(labelName, {
                    section: this.currentSection,
                    address: this.currentAddress as u16,
                    values: null,
                    dataSize: null,
                });

                this.symbols.set(labelName, {
                    address: this.currentAddress,
                    section: this.currentSection,
                    type: 'label'
                });

                this.advance();
                this.skip('COLON');
                continue;
            }


            // INSTRUCTION: Calculate instruction size and advance address
            if (token.type === 'INSTRUCTION') {
                // example => "mov eax, 4"
                lastInstructionOrIdentifierAddress = this.currentAddress;
//if (this.currentAddress === 3) debugger;
                const size = this.calculateInstructionSize();
                //console.log(`[pass1] ${token.value} at ${this.currentAddress}, size=${size}`);
                this.currentAddress += size;
                continue;
            }


            // IDENTIFIER: Handle variable declarations (e.g., "my_var db 0x12")
            if (token.type === 'IDENTIFIER') {
                // example => "my_var db 0x12"
                const next = this.peek(1);

                if (next?.type === 'DIRECTIVE') {
                    const directiveToken = next;
                    const directive = this.normalize(directiveToken.value);

                    if (['EQU', 'DB', 'DW', 'DD', 'DQ', 'RESB', 'RESW', 'RESD', 'RESQ'].includes(directive)) {
                        const varName = token.value;
                        const itemSize = getDirectiveDataSize(directive);

                        lastInstructionOrIdentifierAddress = this.currentAddress;

                        const startAddress = this.currentAddress as u16;

                        this.labels.set(varName, {
                            section: this.currentSection,
                            address: startAddress,
                            values: null,
                            dataSize: itemSize,
                        });

                        this.symbols.set(varName, {
                            address: startAddress,
                            section: this.currentSection,
                            type: 'variable'
                        });

                        this.advance(); // passe l'IDENTIFIER... pour arriver sur la DIRECTIVE

                        this.currentAddress += this.calculateDataSize(itemSize);
                        this.advance();  // Passe la DIRECTIVE


                        const label = this.labels.get(varName);

                        if (!label) {
                            throw new Error("Missing created label");
                        }


                        // Parcourt les données
                        while (!this.isAtEnd()) {
                            const t = this.peek();

                            if (['COMMA'].includes(t.type)) {
                                this.advance();

                            } else if (['STRING', 'NUMBER'].includes(t.type)) {
                                this.advance();

                                if (!label.values) label.values = [];
                                label.values.push(t.value)

                            } else {
                                break;
                            }
                        }

                        const endAddress = this.currentAddress as u16;

                        continue;
                    }
                }
            }

            if (token.type === 'NEWLINE') {
                this.advance();
                lastInstructionOrIdentifierAddress = null;
                continue;
            }

            // Associate comments with their instruction/data address
            if (token.type === 'COMMENT') {
                if (lastInstructionOrIdentifierAddress !== null) {
                    this.comments.set(lastInstructionOrIdentifierAddress, token.value);
                }
                this.advance();
                lastInstructionOrIdentifierAddress = null;
                continue;
            }

            console.warn(`unknown token type: ${token.type}`)

            this.advance();
        }
    }


    // Handle directives during pass 1 (section changes, .org, global/extern)
    private handleDirectivePass1(): void {
        // called by pass1CollectSymbols

        const directive = this.normalize(this.peek().value);

        // Switch to different section (.text, .data, .bss)
        if (directive === 'SECTION' || directive.startsWith('.')) {
            this.advance();

            let sectionName = directive;
            if (directive === 'SECTION' && !this.isAtEnd()) {
                // example ?
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

            } else if (sectionName === '.TEXT' || sectionName === 'TEXT') {
                this.currentSection = '.text';

            } else if (sectionName === '.INCLUDE' || sectionName === 'INCLUDE') {
                this.skip('STRING')
                return;

            } else {
                throw new Error(`Unknown case : Unknown section "${sectionName}"`)
            }

            const section = this.sections.get(this.currentSection);
            if (section) {
                // Set data/bss section start address to current position

                if (section.type !== 'code') {
                    //console.log(`[pass1] start of ${this.currentSection} : ${this.currentAddress}`)
                    section.startAddress = this.currentAddress;
                }

            } else {
                throw new Error(`Unknown case : section "${sectionName}" not found`)
            }

            return;
        }


        // .ORG: Set origin address (.org directive)
        if (directive === '.ORG') {
            this.advance();

            if (this.peek().type === 'NUMBER') {
                this.currentAddress = this.parseNumber(this.peek().value);
                this.advance();

            } else {
                throw new Error("Unknown case : .org ...")
            }

            return;
        }


        // Mark symbols as global or extern
        if (directive === 'GLOBAL' || directive === 'EXTERN') {
            this.advance();

            while (!this.isAtEnd() && this.peek().type === 'IDENTIFIER') {
                const symbolName = this.peek().value;

                if (directive === 'GLOBAL') {
                    // Global symbol handling (commented out)

//                    const sym = this.symbols.get(symbolName);
//
//                    if (sym) {
//                        sym.global = true;
//                    }
//
//                    if (symbolName === '_start' || symbolName === 'start' || symbolName === 'main') {
//                        const labelInfo = this.labels.get(symbolName);
//
//                        if (labelInfo !== undefined) {
//                            this.entryPoint = labelInfo.address;
//                        }
//                    }

                } else {
                    // Register external symbol

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

        console.log(`Unknown directive: ${directive}`)

        this.advance();
    }


    // Pass 2: generate actual machine code bytes
    private pass2GenerateCode(): void {
        // called by compile

        this.pos = 0;
        this.currentSection = '.text';
        this.currentAddress = this.sections.get('.text')!.startAddress;

        while (!this.isAtEnd()) {
            const token = this.peek();

            // DIRECTIVE: Process section switches and directives
            if (token.type === 'DIRECTIVE') {
                // example => "section .text"
                this.handleDirectivePass2();
                continue;
            }

            // LABEL: Skip labels (already processed in pass1)
            if (token.type === 'LABEL') {
                // example => "main:"
                this.advance();
                this.skip('COLON');
                continue;
            }

            // IDENTIFIER: Generate data bytes for variables
            if (token.type === 'IDENTIFIER') {
                // example => "LEDS_BASE db 0x00"
                const next = this.peek(1);

                if (next?.type === 'DIRECTIVE') {
                    const directive = this.normalize(next.value);

                    if (['EQU', 'DB', 'DW', 'DD', 'DQ'].includes(directive)) {
                        const varName = token.value;
                        this.advance();

                        const directiveToken = this.peek();
                        this.generateData(varName, this.normalize(directiveToken.value));
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

            // INSTRUCTION: Encode instruction to bytes
            if (token.type === 'INSTRUCTION') {
//if (this.currentAddress === 3) debugger;
                const before = this.currentAddress;
                this.generateInstruction();
                const size = this.currentAddress - before;
                //console.log(`[pass2] ${token.value} at ${before}, emitted=${size}`);
                continue;
            }

            this.advance();
        }
    }


    // Handle directives during pass 2 (simpler than pass1, just section switching)
    private handleDirectivePass2(): void {
        // called by pass2GenerateCode

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

            } else if (sectionName === '.INCLUDE' || sectionName === 'INCLUDE') {
                this.advance()
                return;

            } else {
                this.currentSection = '.text';
            }

            const section = this.sections.get(this.currentSection);

            if (section) {
                //this.currentAddress = section.startAddress + section.data.length;

                // Set data/bss section start address to current position

                if (section.type !== 'code') {
                    //if (section.startAddress !== this.currentAddress) debugger;
                    //console.log(`[pass2] start of ${this.currentSection} : ${this.currentAddress}`)
                    section.startAddress = this.currentAddress;
                }

            } else {
                throw new Error(`Unknown section "${this.currentSection}"`);
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


    // Emit data bytes for variable declarations (db, dw, dd, dq)
    private generateData(varName: string | undefined, directiveName: string): void {
        // called by pass2GenerateCode (gère les valeurs situées après un couple [IDENTIFIER, DIRECTIVE]. example "my_var db 0x05, 0x06, 0x07")

        const directive = this.normalize(directiveName);

        let itemSize = getDirectiveDataSize(directive);

        this.advance();

        while (!this.isAtEnd()) {
            const token = this.peek();
            const comment = this.comments.get(this.currentAddress);

            if (token.type === 'IDENTIFIER') {
                // Vérifier si c'est une nouvelle variable
                const nextToken = this.peek(1);

                // Stop if we encounter a new variable declaration
                if (nextToken.type === 'DIRECTIVE') {
                    if (['EQU', 'DB', 'DW', 'DD', 'DQ'].includes(this.normalize(nextToken.value))) {

                    } else {
                        // Nouvel identifier, on arrête
                        break;
                    }
                }

                if (nextToken.type === 'INSTRUCTION' || nextToken.type === 'LABEL') {
                    // Nouvelle instruction ou label, on arrête
                    break;
                }

                // Sinon, c'est une référence à un label

                // Emit label address as data
                const labelInfo = this.labels.get(token.value);

                if (labelInfo !== undefined) {
                    for (let i = 0; i < itemSize; i++) {
                        const defaultComment = i === 0
                            ? `low  byte of label ${token.value} = ${labelInfo.address}`
                            : `high byte of label ${token.value} = ${labelInfo.address}`

                        this.emitByte((labelInfo.address >> (i * 8)) & 0xFF, comment || defaultComment, false);
                    }

                } else {
                    // Référence non trouvée

                    // Add to unresolved references
                    this.unresolvedRefs.push({
                        address: this.currentAddress,
                        section: this.currentSection,
                        label: token.value,
                        size: itemSize,
                    });

                    for (let i = 0; i < itemSize; i++) {
                        this.emitByte(0, comment, false);
                    }
                }

                this.advance();

            } else if (token.type === 'STRING') {
                // Emit string as ASCII bytes
                for (let i = 0; i < token.value.length; i++) {
                    this.emitByte(token.value.charCodeAt(i), comment || `'${token.value[i]}'`, false);
                }

                this.advance();

            } else if (token.type === 'NUMBER') {
                // Emit number split into bytes
                const value = this.parseNumber(token.value);

                for (let i = 0; i < itemSize; i++) {
                    const defaultComment = i === 0
                        ? `low  byte of number ${varName} = ${toHex(value)} (${value})`
                        : `high byte of number ${varName} = ${toHex(value)} (${value})`

                    const byte = (value >> (i * 8)) & 0xFF;
                    this.emitByte(byte, comment || defaultComment || (i === 0 ? token.value : undefined), false);
                }

                this.advance();

            } else if (token.type === 'COMMA') {
                this.advance();

            } else {
                break;
            }
        }
    }


    // Reserve uninitialized space (resb, resw, resd, resq)
    private reserveSpace(): void {
        // called by pass2GenerateCode

        const comment = this.comments.get(this.currentAddress);

        if (this.peek().type === 'NUMBER') {
            const count = this.parseNumber(this.peek().value);

            for (let i = 0; i < count; i++) {
                this.emitByte(0, comment || 'reserved space', false);
            }

            this.advance();
            return;
        }

        throw new Error("unknown case in reserveSpace");
    }


    // Encode instruction opcode and operands to bytes
    private generateInstruction(): void {
        // called by pass2GenerateCode

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

        // Find matching instruction variant based on operand types
        const variant = this.findInstructionVariant(instrDef, operands);
        if (!variant) {
            this.error(instrToken, `Invalid operands for ${mnemonic}`);
            return;
        }

        // Emit opcode byte
        const comment = this.comments.get(this.currentAddress);
        this.emitByte(variant.opcode, variant.mnemonic + (comment ? ` ${comment}` : ''), true);

        // Emit operand bytes
        this.emitOperands(operands, variant);
    }


    // Parse instruction operands into structured format
    private parseOperands(): ParsedOperand[] {
        // called by generateInstruction & calculateInstructionSize

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
                // Memory operand [...]
                this.advance();
                const memOperand = this.parseMemoryOperand();
                this.skip('RBRACKET');
                operands.push(memOperand);

            } else if (token.type === 'IDENTIFIER') {
                const label = this.labels.get(token.value);

                // EQU constants become immediate values
                if (label && label.dataSize === 0) {
                    operands.push({
                        type: 'IMMEDIATE',
                        value: label?.values ? label.values[0] : token.value,
                        //address: label?.address,
                        //size: 2,
                    });

                } else {
                    // Label reference
                    operands.push({
                        type: 'LABEL',
                        value: label?.values ? label.values[0] : token.value,
                        address: label?.address,
                        //size: 2,
                    });
                }

                this.advance();

            } else if (token.type === 'COMMA') {
                this.advance();

            } else {
                break;
            }
        }

        return operands;
    }


    // Parse memory addressing operand inside brackets
    private parseMemoryOperand(): ParsedOperand {
        // called by parseOperands

        const operand: ParsedOperand = {
            type: 'MEMORY',
            value: ''
        };

        const token = this.peek();

        if (token.type === 'NUMBER') {
            // Direct address [0x1234]
            operand.address = this.parseNumber(token.value);
            operand.value = token.value;
            this.advance();

        } else if (token.type === 'IDENTIFIER') {
            // Label address [my_var]
            operand.value = token.value;
            operand.address = this.labels.get(token.value)?.address;
            this.advance();

        } else if (token.type === 'REGISTER') {
            // Register indirect [eax]
            operand.base = this.mapRegister(token.value);
            operand.value = token.value;
            this.advance();
        }

        return operand;
    }


    // Find instruction variant matching operand pattern
    private findInstructionVariant(instrDef: InstructionDef, operands: ParsedOperand[]): InstructionVariant | null {
        // called by generateInstruction & calculateInstructionSize

        // No variants means single encoding
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

        // Try each variant until pattern matches
        for (const variant of instrDef.variants) {
            if (this.matchesOperandPattern(variant.operands, operands)) {
                if (!variant.condition || variant.condition(operands)) {
                    return variant;
                }
            }
        }

        return null;
    }


    // Check if operand types match expected pattern (e.g., "REG_IMM8")
    private matchesOperandPattern(pattern: string, operands: ParsedOperand[]): boolean {
        // called by findInstructionVariant

        if (pattern === 'NONE') {
            return operands.length === 0;
        }

        const parts = pattern.split('_');
        if (parts.length !== operands.length) return false;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const op = operands[i];

            const isReg = (part === 'REG');
            const isImm = (part.startsWith('IMM'));
            const isMem = (part === 'MEM');

            if (isReg && op.type !== 'REGISTER') return false;

            if (isImm && op.type !== 'IMMEDIATE' && op.type !== 'LABEL') return false;

            if (isMem && op.type !== 'MEMORY' && op.type !== 'LABEL') return false;
        }

        return true;
    }


    // Emit operand bytes based on instruction variant pattern
    private emitOperands(operands: ParsedOperand[], variant: InstructionVariant): void {
        // called by generateInstruction

        const pattern = variant.operands;

        if (pattern === 'NONE') return;

        const parts = pattern.split('_');

        for (let i = 0; i < operands.length; i++) {
            const part = parts[i];
            const op = operands[i];

            if (part === 'IMM8') {
                // 8-bit immediate value
                const value = op.address !== undefined ? op.address : this.parseNumber(op.value);
                this.emitByte(value & 0xFF, op.value, false);

            } else if (part === 'IMM16' || part === 'MEM') {
                // 16-bit immediate or memory address
                let value = 0;

                if (op.type === 'LABEL') {
                    const labelInfo = this.labels.get(op.value);
                    const labelSection = this.sections.get(labelInfo?.section || '.none')

                    if (labelInfo !== undefined && labelSection !== undefined) {
                        if (labelInfo.dataSize === 0 && labelInfo.values) {
                            // EQU constant value
                            value = labelInfo.values ? this.parseNumber(labelInfo.values[0]) : 0x00;

                        } else {
                            // Absolute address = section start + label offset
                            value = labelSection.startAddress + labelInfo.address;
                        }

                    } else {
                        // Add to unresolved references
                        this.unresolvedRefs.push({
                            address: this.currentAddress,
                            section: this.currentSection,
                            label: op.value,
                            size: 2,
                        });

                    }

                } else if (op.type === 'MEMORY') {
                    const label = this.labels.get(op.value);

                    if (!label) {
                        throw new Error(`Missing label "${op.value}"`);
                    }

                    value = label.values ? this.parseNumber(label.values[0]) : 0x00;

                } else if (op.address !== undefined) {
                    value = op.address;

                } else {
                    value = this.parseNumber(op.value);
                }

                const commentPrefix = `${isNaN(Number(op.value)) ? `${op.value} = ` : ''}${toHex(value)} (${value})`;

                // Emit 16-bit value with correct endianness
                if (this.arch.endianness === 'little') {
                    this.emitByte(value & 0xFF, `${commentPrefix} (low byte)`, false);
                    this.emitByte((value >> 8) & 0xFF, `${commentPrefix} (high byte)`, false);

                } else {
                    this.emitByte((value >> 8) & 0xFF, `${commentPrefix} (high byte)`, false);
                    this.emitByte(value & 0xFF, `${commentPrefix} (low byte)`, false);
                }
            }
        }
    }


    // Calculate instruction size in bytes (used in pass1)
    private calculateInstructionSize(): number {
        // called by pass1CollectSymbols

        const instrToken = this.peek();
        const mnemonic = this.normalize(instrToken.value);
        const instrDef = this.instructionMap.get(mnemonic);

        if (!instrDef) return 1;

        this.advance();
        const operands = this.parseOperands();

        const variant = this.findInstructionVariant(instrDef, operands);
        return variant ? variant.size : 1;
    }


    // Calculate data declaration size in bytes (db, dw, dd, dq with values)
    private calculateDataSize(itemSize: number): number {
        // called by pass1CollectSymbols

        let size = 0;
        let offset = 1; // Start after DIRECTIVE

        while (true) {
            const token = this.peek(offset);
            if (!token || token.type === 'EOF') break;

            if (token.type === 'INSTRUCTION' || token.type === 'LABEL') break;

            if (token.type === 'STRING') {
                // Each character is one byte
                size += token.value.length;
                offset++;

            } else if (token.type === 'NUMBER') {
                size += itemSize;
                offset++;

            } else if (token.type === 'IDENTIFIER') {
                const next = this.peek(offset + 1);
                if (next.type === 'DIRECTIVE') break

                size += itemSize;
                offset++;

            } else if (token.type === 'COMMA') {
                offset++;

            } else {
                break;
            }
        }

        return size;
    }


    // Resolve forward references after both passes complete
    private resolveReferences(): void {
        // called by compile

        for (const ref of this.unresolvedRefs) {
            const labelInfo = this.labels.get(ref.label);
            if (labelInfo === undefined) {
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

            // Patch bytes with correct endianness
            if (ref.size === 2) {
                if (this.arch.endianness === 'little') {
                    section.data[offset].value = labelInfo.address & 0xFF;
                    section.data[offset + 1].value = (labelInfo.address >> 8) & 0xFF;

                } else {
                    section.data[offset].value = (labelInfo.address >> 8) & 0xFF;
                    section.data[offset + 1].value = labelInfo.address & 0xFF;
                }

            } else {
                section.data[offset].value = labelInfo.address & 0xFF;
            }
        }
    }


    // Emit a single byte to current section
    private emitByte(value: number, comment?: string, isOpcode?: boolean): void {
        // used at several places

        const section = this.sections.get(this.currentSection);
        if (!section) return;

        section.data.push({
            address: this.currentAddress++,
            value: value & 0xFF,
            section: this.currentSection,
            comment,
            isOpcode,
        });
    }


    // Map register name/alias to ID
    private mapRegister(name: string): string {
        // used by parseMemoryOperand & parseOperands
        const normalized = this.caseSensitive ? name : name.toUpperCase();
        return this.registerMap.get(normalized) || name;
    }


    // Normalize string based on case sensitivity setting
    private normalize(str: string): string {
        // used at several places

        return this.caseSensitive ? str : str.toUpperCase();
    }


    // Parse number from various formats (0x, $, 0b, h suffix, b suffix, decimal)
    private parseNumber(str: string): number {
        // used at several places

        const lower = str.toLowerCase();

        if (lower.startsWith('0x')) return parseInt(lower.substring(2), 16);
        if (lower.startsWith('$')) return parseInt(lower.substring(1), 16);
        if (lower.startsWith('0b')) return parseInt(lower.substring(2), 2);
        if (lower.endsWith('h')) return parseInt(lower.substring(0, lower.length - 1), 16);
        if (lower.endsWith('b') && lower.length > 1) return parseInt(lower.substring(0, lower.length - 1), 2);

        return parseInt(str, 10);
    }


    // Look ahead at token without consuming
    private peek(offset = 0): Token {
        // used at several places

        return this.tokens[this.pos + offset] || { type: 'EOF', value: '', line: 0, column: 0 };
    }


    // Consume current token and advance
    private advance(): Token {
        // used at several places

        return this.tokens[this.pos++];
    }


    // Skip token if it matches expected type
    private skip(type: string): void {
        // used at several places

        if (this.peek().type === type) {
            this.advance();
        }
    }


    // Check if reached end of token stream
    private isAtEnd(): boolean {
        // used at several places

        return this.peek().type === 'EOF';
    }


    // Record compilation error
    private error(token: Token, message: string): void {
        // used in generateInstruction

        this.errors.push({
            line: token.line,
            column: token.column,
            message,
            severity: 'error'
        });
    }
}


// Get byte size for data directives
function getDirectiveDataSize(directive: string) {
    // called by pass1CollectSymbols

    switch (directive) {
        case 'EQU': return 0;  // Constant (no storage)
        case 'DB': return 1;   //  8 bits
        case 'DW': return 2;   // 16 bits
        case 'DD': return 4;   // 32 bits
        case 'DQ': return 8;   // 64 bits
        case 'RESB': return 1; //  8 bits (Réserve N bytes)
        case 'RESW': return 2; // 16 bits (Réserve N × 2 bytes)
        case 'RESD': return 4; // 32 bits (Réserve N × 4 bytes)
        case 'RESQ': return 8; // 64 bits (Réserve N × 8 bytes)
        default:
            throw new Error(`Unknown directive "${directive}"`)
    }
}

