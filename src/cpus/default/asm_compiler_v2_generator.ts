
import { Opcode, INSTRUCTIONS_WITH_OPERAND, INSTRUCTIONS_WITH_TWO_OPERANDS } from './cpu_instructions';

import type { ASTNode, Operand } from './asm_compiler_v2_parser';


export interface GeneratedCode {
    address: number;
    value: number | Opcode;
    comment?: string;
}

export class CodeGenerator {
    private addressCounter = 0;
    private output: GeneratedCode[] = [];
    private labels: Map<string, number> = new Map();
    private unresolvedRefs: Array<{
        address: number;
        label: string;
        is16Bit: boolean;
    }> = [];

    constructor() { }

    public generate(ast: ASTNode): GeneratedCode[] {
        this.addressCounter = 0;
        this.output = [];
        this.labels.clear();
        this.unresolvedRefs = [];

        // Premier passage : collecter les labels
        this.collectLabels(ast);

        // Deuxième passage : générer le code
        this.addressCounter = 0;
        this.generateFromAST(ast);

        // Résoudre les références non résolues
        this.resolveReferences();

        return this.output;
    }

    private collectLabels(node: ASTNode): void {
        if (node.type === 'LABEL_DEF' && node.name) {
            this.labels.set(node.name, this.addressCounter);
            console.log(`Label collecté: ${node.name} = ${this.addressCounter}`);

        } else if (node.type === 'DATA_DEF' && node.name) {
            // Les données déclarées avec DB/DW sont aussi des labels
            this.labels.set(node.name, this.addressCounter);
            console.log(`Data label collecté: ${node.name} = ${this.addressCounter}`);

        } else if (node.type === 'INSTRUCTION') {
            this.addressCounter += this.getInstructionSize(node);

        } else if (node.type === 'DATA_DEF') {
            this.addressCounter += this.getDataSize(node);

        } else if (node.children) {
            node.children.forEach(child => this.collectLabels(child));

        } else if (node.type === 'DIRECTIVE_STMT' && node.name?.toUpperCase() === 'GLOBAL') {
            // Gérer les symboles globaux
            if (node.value) {
                node.value.split(',').forEach(sym => {
                    const trimmed = sym.trim();
                    console.log(`Symbole global: ${trimmed}`);
                });
            }
        }
    }

    private generateFromAST(node: ASTNode): void {
        switch (node.type) {
            case 'SECTION':
                this.handleSection(node);
                break;

            case 'LABEL_DEF':
                // Déjà traité dans collectLabels
                break;

            case 'DATA_DEF':
                this.handleDataDefinition(node);
                break;

            case 'DIRECTIVE_STMT':
                this.handleDirective(node);
                break;

            case 'INSTRUCTION':
                this.handleInstruction(node);
                break;

            case 'PROGRAM':
                node.children?.forEach(child => this.generateFromAST(child));
                break;
        }
    }

    private handleSection(section: ASTNode): void {
        // Ajouter un commentaire pour la section
        this.addComment(`Section: ${section.name || section.value}`);
    }

    private handleDataDefinition(data: ASTNode): void {
        const startAddress = this.addressCounter;

        if (data.name) {
            this.addComment(`${data.name}:`);
        }

        if (data.data) {
            data.data.forEach(item => {
                if (item.type === 'STRING') {
                    // Convertir la chaîne en bytes
                    for (let i = 0; i < item.value.length; i++) {
                        this.emitByte(item.value.charCodeAt(i), `'${item.value[i]}'`);
                    }
                } else if (item.type === 'NUMBER') {
                    const num = this.parseNumber(item.value);
                    this.emitByte(num, item.value);
                } else if (item.type === 'EXPRESSION') {
                    // C'est probablement un label ou expression
                    const address = this.labels.get(item.value);
                    if (address !== undefined) {
                        this.emitByte(address, item.value);
                    } else {
                        // Référence non résolue
                        this.emitByte(0, `${item.value} (placeholder)`);
                        this.unresolvedRefs.push({
                            address: this.addressCounter - 1,
                            label: item.value,
                            is16Bit: false
                        });
                    }
                }
            });
        }
    }

    private handleDirective(directive: ASTNode): void {
        const name = directive.name?.toUpperCase();

        switch (name) {
            case '.ORG':
                const addr = this.parseNumber(directive.value || '0');
                this.addressCounter = addr;
                this.addComment(`Origin: 0x${addr.toString(16).toUpperCase()}`);
                break;

            case 'GLOBAL':
                // Marquer les symboles globaux
                if (directive.value) {
                    directive.value.split(',').forEach(sym => {
                        const trimmed = sym.trim();
                        this.addComment(`Global: ${trimmed}`);
                    });
                }
                break;

            default:
                this.addComment(`Directive: ${directive.name} ${directive.value || ''}`);
        }
    }

    private handleInstruction(instr: ASTNode): void {
        const opcode = this.getOpcode(instr.name || '', instr.operands);
        if (opcode === undefined) {
            throw new Error(`Opcode inconnu: ${instr.name}`);
        }

        // Émettre l'opcode
        this.emitByte(opcode, instr.name);

        // Gérer les opérandes
        if (instr.operands) {
            for (let i = 0; i < instr.operands.length; i++) {
                const operand = instr.operands[i];
                this.handleOperand(operand, opcode, i);
            }
        }
    }

    private handleOperand(operand: Operand, opcode: Opcode, operandIndex: number): void {
        const is16BitOpcode = INSTRUCTIONS_WITH_TWO_OPERANDS.includes(opcode);
        const is8BitOpcode = INSTRUCTIONS_WITH_OPERAND.includes(opcode);

        switch (operand.type) {
            case 'REGISTER':
                // Les opcodes MOV entre registres sont déjà encodés
                // Pas besoin d'émettre de données supplémentaires
                break;

            case 'IMMEDIATE':
                const num = this.parseNumber(operand.value);
                if (is16BitOpcode) {
                    this.emit16Bit(num, operand.value);
                } else if (is8BitOpcode) {
                    this.emitByte(num, operand.value);
                }
                break;

            case 'IDENTIFIER':
                // C'est un label
                const address = this.labels.get(operand.value);
                if (address !== undefined) {
                    if (is16BitOpcode) {
                        this.emit16Bit(address, operand.value);
                    } else {
                        this.emitByte(address, operand.value);
                    }
                } else {
                    // Référence non résolue
                    if (is16BitOpcode) {
                        this.emit16Bit(0, `${operand.value} (placeholder)`);
                        this.unresolvedRefs.push({
                            address: this.addressCounter - 2,
                            label: operand.value,
                            is16Bit: true
                        });
                    } else {
                        this.emitByte(0, `${operand.value} (placeholder)`);
                        this.unresolvedRefs.push({
                            address: this.addressCounter - 1,
                            label: operand.value,
                            is16Bit: false
                        });
                    }
                }
                break;

            case 'MEMORY':
                // Pour [addr], on parse l'adresse
                const addrMatch = operand.value.match(/\[(.+)\]/);
                if (addrMatch) {
                    const addrExpr = addrMatch[1];
                    const addr = this.parseNumberOrLabel(addrExpr);
                    if (is16BitOpcode) {
                        this.emit16Bit(addr, `[${addrExpr}]`);
                    }
                }
                break;
        }
    }

    private getOpcode(instruction: string, operands?: Operand[]): Opcode | undefined {
        const upper = instruction.toUpperCase();

        // Mapping des instructions vers les opcodes
        const opcodeMap: Record<string, Opcode> = {
            // Contrôle
            'NOP': Opcode.NOP,
            'HLT': Opcode.HALT,
            'HALT': Opcode.HALT,
            'SYSCALL': Opcode.SYSCALL,
            'BREAKPOINT': Opcode.BREAKPOINT,
            'INT': Opcode.SYSCALL, // Pour INT, on utilise SYSCALL (équivalent)

            // ALU
            'ADD': Opcode.ADD,
            'SUB': Opcode.SUB,
            'AND': Opcode.AND,
            'OR': Opcode.OR,
            'XOR': Opcode.XOR,

            // Inc/Déc
            'INC': this.getIncDecOpcode(operands, true),
            'DEC': this.getIncDecOpcode(operands, false),

            // Stack
            'PUSH': this.getPushPopOpcode(operands, true),
            'POP': this.getPushPopOpcode(operands, false),
            'CALL': Opcode.CALL,
            'RET': Opcode.RET,

            // Sauts
            'JMP': Opcode.JMP,
            'JZ': Opcode.JZ,
            'JNZ': Opcode.JNZ,
            'JC': Opcode.JC,
            'JNC': Opcode.JNC,

            // MOV
            'MOV': this.getMovOpcode(operands),
        };

        const opcodeOrFunc = opcodeMap[upper];

        if (!opcodeOrFunc) {
            throw new Error(`Unknown instruction "${instruction}"`);
        }

        if (typeof opcodeOrFunc === 'function') {
            debugger;
            return opcodeOrFunc(); // ??
        }
        return opcodeOrFunc;
    }

    private getIncDecOpcode(operands: Operand[] | undefined, isInc: boolean): Opcode {
        if (!operands || operands.length === 0) {
            return isInc ? Opcode.INC_A : Opcode.DEC_A;
        }

        const reg = operands[0].value.toUpperCase();
        switch (reg) {
            case 'A': return isInc ? Opcode.INC_A : Opcode.DEC_A;
            case 'B': return isInc ? Opcode.INC_B : Opcode.DEC_B;
            case 'C': return isInc ? Opcode.INC_C : Opcode.DEC_C;
            case 'D': return isInc ? Opcode.INC_D : Opcode.DEC_D;
            default: return isInc ? Opcode.INC_A : Opcode.DEC_A;
        }
    }

    private getPushPopOpcode(operands: Operand[] | undefined, isPush: boolean): Opcode {
        if (!operands || operands.length === 0) {
            return isPush ? Opcode.PUSH_A : Opcode.POP_A;
        }

        const reg = operands[0].value.toUpperCase();
        switch (reg) {
            case 'A': return isPush ? Opcode.PUSH_A : Opcode.POP_A;
            case 'B': return isPush ? Opcode.PUSH_B : Opcode.POP_B;
            case 'C': return isPush ? Opcode.PUSH_C : Opcode.POP_C;
            case 'D': return isPush ? Opcode.PUSH_D : Opcode.POP_D;
            default: return isPush ? Opcode.PUSH_A : Opcode.POP_A;
        }
    }

    private getMovOpcode(operands?: Operand[]): Opcode {
        if (!operands || operands.length < 2) {
            return Opcode.MOV_A_IMM; // Par défaut
        }

        const dest = operands[0];
        const src = operands[1];

        // MOV registre, immédiat
        if (dest.type === 'REGISTER' && src.type === 'IMMEDIATE') {
            const reg = dest.value.toUpperCase();

            switch (reg) {
                case 'A':
                    return Opcode.MOV_A_IMM;
                case 'B':
                    return Opcode.MOV_B_IMM;
                case 'C':
                    return Opcode.MOV_C_IMM;
                case 'D':
                    return Opcode.MOV_D_IMM;
            }
        }

        if (dest.type === 'REGISTER' && src.type === 'IDENTIFIER') {
            const reg = dest.value.toUpperCase();
            //console.log("DEBUG: MOV registre, source - reg:", reg, "src.type:", src.type);
            switch (reg) {
                case 'A': return Opcode.MOV_A_MEM;
                case 'B': return Opcode.MOV_B_MEM;
                case 'C': return Opcode.MOV_C_MEM;
                case 'D': return Opcode.MOV_D_MEM;
            }
        }

        // MOV registre, registre
        if (dest.type === 'REGISTER' && src.type === 'REGISTER') {
            const destReg = dest.value.toUpperCase();
            const srcReg = src.value.toUpperCase();

            const movMap: Record<string, Record<string, Opcode>> = {
                'A': { 'B': Opcode.MOV_AB, 'C': Opcode.MOV_AC, 'D': Opcode.MOV_AD },
                'B': { 'A': Opcode.MOV_BA, 'C': Opcode.MOV_BC, 'D': Opcode.MOV_BD },
                'C': { 'A': Opcode.MOV_CA, 'B': Opcode.MOV_CB, 'D': Opcode.MOV_CD },
                'D': { 'A': Opcode.MOV_DA, 'B': Opcode.MOV_DB, 'C': Opcode.MOV_DC },
            };

            return movMap[destReg]?.[srcReg] || Opcode.MOV_A_IMM;
        }

        // MOV [mémoire], registre
        if (dest.type === 'MEMORY' && src.type === 'REGISTER') {
            const reg = src.value.toUpperCase();
            switch (reg) {
                case 'A': return Opcode.MOV_MEM_A;
                case 'B': return Opcode.MOV_MEM_B;
                case 'C': return Opcode.MOV_MEM_C;
                case 'D': return Opcode.MOV_MEM_D;
            }
        }

        // MOV registre, [mémoire]
        if (dest.type === 'REGISTER' && src.type === 'MEMORY') {
            const reg = dest.value.toUpperCase();
            switch (reg) {
                case 'A': return Opcode.MOV_A_MEM;
                case 'B': return Opcode.MOV_B_MEM;
                case 'C': return Opcode.MOV_C_MEM;
                case 'D': return Opcode.MOV_D_MEM;
            }
        }

        return Opcode.MOV_A_IMM; // Par défaut
    }

    private parseNumber(str: string): number {
        str = str.toLowerCase();

        if (str.startsWith('0x')) {
            return parseInt(str.substring(2), 16);
        } else if (str.startsWith('$')) {
            return parseInt(str.substring(1), 16);
        } else if (str.startsWith('0b')) {
            return parseInt(str.substring(2), 2);
        } else if (str.endsWith('h')) {
            return parseInt(str.substring(0, str.length - 1), 16);
        } else {
            return parseInt(str, 10);
        }
    }

    private parseNumberOrLabel(expr: string): number {
        // Essaie de parser comme nombre, sinon retourne 0 (sera résolu plus tard)
        try {
            return this.parseNumber(expr);
        } catch {
            return 0; // Placeholder pour les labels
        }
    }

    private getInstructionSize(instr: ASTNode): number {
        const opcode = this.getOpcode(instr.name || '');
        if (!opcode) return 1;

        let size = 1; // Opcode

        if (INSTRUCTIONS_WITH_OPERAND.includes(opcode)) {
            size += 1; // 8-bit operand
        } else if (INSTRUCTIONS_WITH_TWO_OPERANDS.includes(opcode)) {
            size += 2; // 16-bit operand
        }

        return size;
    }

    private getDataSize(data: ASTNode): number {
        if (!data.data) return 0;

        let size = 0;
        data.data.forEach(item => {
            if (item.type === 'STRING') {
                size += item.value.length;
            } else {
                size += 1; // NUMBER ou EXPRESSION = 1 byte
            }
        });

        return size;
    }

    private emitByte(value: number, comment?: string): void {
        this.output.push({
            address: this.addressCounter++,
            value: value & 0xFF,
            comment
        });
    }

    private emit16Bit(value: number, comment?: string): void {
        const low = value & 0xFF;
        const high = (value >> 8) & 0xFF;

        this.emitByte(low, `${comment} (low)`);
        this.emitByte(high, `${comment} (high)`);
    }

    private addComment(comment: string): void {
        this.output.push({
            address: this.addressCounter,
            value: `// ${comment}`,
            comment: `// ${comment}`,
        });
    }

    private resolveReferences(): void {
        for (const ref of this.unresolvedRefs) {
            const address = this.labels.get(ref.label);
            if (address === undefined) {
                throw new Error(`Label non défini: ${ref.label}`);
            }

            if (ref.is16Bit) {
                // Mettre à jour les 2 bytes (little-endian)
                const low = address & 0xFF;
                const high = (address >> 8) & 0xFF;

                this.output[ref.address].value = low;
                this.output[ref.address].comment = `${ref.label} (low = ${low})`;

                this.output[ref.address + 1].value = high;
                this.output[ref.address + 1].comment = `${ref.label} (high = ${high})`;

            } else {
                this.output[ref.address].value = address & 0xFF;
                this.output[ref.address].comment = `${ref.label} = ${address}`;
            }
        }
    }

    public formatOutput(): string {
        const lines: string[] = [];
        let skipOperands = 0; // Combien d'opérandes restent à sauter

        for (let i = 0; i < this.output.length; i++) {
            const item = this.output[i];

            if (typeof item.value === 'string') {
                lines.push(item.value);
                continue;
            }

            const hexAddr = `0x${item.address.toString(16).padStart(2, '0').toUpperCase()}`;
            const hexValue = `0x${item.value.toString(16).padStart(2, '0').toUpperCase()}`;
            let line = `            [${hexAddr}, ${hexValue}]`;

            // Est-ce un opcode connu ?
            const isKnownOpcode = Object.values(Opcode).includes(item.value as number);

            if (skipOperands > 0) {
                // C'est un opérande d'une instruction précédente
                if (item.comment) line += `, // ${item.comment}`;
                skipOperands--;
            } else if (isKnownOpcode) {
                // C'est un opcode - afficher son nom
                const opcodeName = Object.keys(Opcode).find(key => Opcode[key as keyof typeof Opcode] === item.value);
                line += `, // ${opcodeName}`;

                // Calculer combien d'opérandes suivent
                if (INSTRUCTIONS_WITH_OPERAND.includes(item.value)) {
                    skipOperands = 1; // 1 opérande 8-bit
                } else if (INSTRUCTIONS_WITH_TWO_OPERANDS.includes(item.value)) {
                    skipOperands = 2; // 2 opérandes 8-bit (16-bit)
                }
                // Sinon skipOperands reste à 0 (pas d'opérande)

            } else if (item.comment) {
                // C'est une donnée normale
                line += `, // ${item.comment}`;
            }

            lines.push(line);
        }

        return lines.join(',\n');
    }
}

// Fonction utilitaire
export function generateCode(ast: ASTNode): GeneratedCode[] {
    const generator = new CodeGenerator();
    const code = generator.generate(ast);
    return code;
    //return generator.formatOutput();
}


export function generateFormattedCode(ast: ASTNode): string {
    const generator = new CodeGenerator();
    const code = generator.generate(ast);
    return generator.formatOutput();
}
