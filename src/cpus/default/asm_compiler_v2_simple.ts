
import { Opcode, INSTRUCTIONS_WITH_OPERAND, INSTRUCTIONS_WITH_TWO_OPERANDS } from './cpu_instructions';
import { createLexer, type Token } from './asm_compiler_v2_lexer';

/**
 * Compilateur assembleur simplifié pour CPU 8-bit personnalisé
 * 
 * Principe : 2 passes simples
 * - Passe 1 : Collecter les labels et leur adresse
 * - Passe 2 : Générer le bytecode
 */

export interface CompilerOutput {
    bytecode: number[];
    labels: Map<string, number>;
    errors: string[];
    formatted: string;
}

interface ByteEntry {
    address: number;
    value: number;
    comment?: string;
    isOpcode?: boolean;
}

export class SimpleAssemblyCompiler {
    private tokens: Token[] = [];
    private pos = 0;

    // Résultats
    private bytecode: ByteEntry[] = [];
    private labels: Map<string, number> = new Map();
    private errors: string[] = [];
    private currentAddress = 0;

    // Références à résoudre (pour les labels forward)
    private unresolvedRefs: Array<{
        address: number;
        label: string;
        is16bit: boolean;
    }> = [];

    constructor(source: string) {
        const lexer = createLexer(source);
        // Filtrer les tokens inutiles
        this.tokens = lexer.tokenize().filter(
            t => t.type !== 'COMMENT' && t.type !== 'NEWLINE' && t.type !== 'EOF'
        );
    }

    public compile(): CompilerOutput {
        try {
            // Passe 1 : Collecter les labels
            this.pass1CollectLabels();

            // Reset pour passe 2
            this.pos = 0;
            this.currentAddress = 0;
            this.bytecode = [];

            // Passe 2 : Générer le bytecode
            this.pass2GenerateCode();

            // Résoudre les références forward
            this.resolveForwardReferences();

        } catch (error: any) {
            this.errors.push(error.message);
        }

        return {
            bytecode: this.bytecode.map(b => b.value),
            labels: this.labels,
            errors: this.errors,
            formatted: this.formatOutput()
        };
    }

    // ============================================================
    // PASSE 1 : COLLECTE DES LABELS
    // ============================================================

    private pass1CollectLabels(): void {
        this.currentAddress = 0;
        this.pos = 0;

        while (!this.isAtEnd()) {
            const token = this.peek();

            // Directive .ORG
            if (token.type === 'DIRECTIVE' && token.value.toUpperCase() === '.ORG') {
                this.advance(); // Consommer .ORG
                const addrToken = this.expect('NUMBER');
                this.currentAddress = this.parseNumber(addrToken.value);
                continue;
            }

            // Label definition
            if (token.type === 'LABEL') {
                const labelName = token.value;
                this.labels.set(labelName, this.currentAddress);
                this.advance(); // Consommer LABEL
                this.advance(); // Consommer COLON
                continue;
            }

            // Data definition (DB, DW, etc.)
            if (token.type === 'IDENTIFIER') {
                const nextToken = this.tokens[this.pos + 1];
                if (nextToken?.type === 'DIRECTIVE') {
                    const directive = nextToken.value.toUpperCase();
                    if (['DB', 'DW', 'DD'].includes(directive)) {
                        // C'est une définition de données avec label
                        this.labels.set(token.value, this.currentAddress);
                        this.advance(); // IDENTIFIER
                        this.advance(); // DIRECTIVE

                        // Calculer la taille des données
                        const dataSize = this.calculateDataSize();
                        this.currentAddress += dataSize;
                        continue;
                    }
                }
            }

            // Instruction
            if (token.type === 'INSTRUCTION') {
                const instrSize = this.calculateInstructionSize();
                this.currentAddress += instrSize;
                continue;
            }

            // Ignorer les autres tokens
            this.advance();
        }
    }

    private calculateInstructionSize(): number {
        const instrToken = this.peek();
        this.advance(); // Consommer l'instruction

        const mnemonic = instrToken.value.toUpperCase();

        // Instructions sans opérande
        const noOperandInstructions = [
            'NOP', 'HALT', 'HLT', 'RET', 'IRET',
            'ADD', 'SUB', 'AND', 'OR', 'XOR',
            'EI', 'DI', 'GET_SP', 'GET_FREQ',
            'INC', 'DEC',
            'PUSH', 'POP',
            'CORE_HALT', 'CORE_START', 'CORE_INIT', 'CORE_STATUS', 'CORES_COUNT',
            'CPU_HALT', 'CPU_START', 'CPU_INIT', 'CPU_STATUS', 'CPUS_COUNT'
        ];

        // Si c'est une instruction spécifique avec registre (PUSH_A, INC_A, etc.)
        if (noOperandInstructions.includes(mnemonic) ||
            mnemonic.match(/^(PUSH|POP|INC|DEC)_[ABCD]$/)) {
            return 1; // Juste l'opcode
        }

        // Instructions avec 1 opérande 8-bit
        const oneByteOperandInstructions = ['SYSCALL', 'SET_FREQ'];

        // Instructions avec 1 opérande 16-bit
        const twoByteOperandInstructions = [
            'JMP', 'JZ', 'JNZ', 'JC', 'JNC',
            'CALL', 'SET_SP'
        ];

        // MOV nécessite une analyse des opérandes
        if (mnemonic === 'MOV') {
            // Lire les opérandes pour déterminer le type
            const destToken = this.peek();
            if (!destToken) return 1;

            this.advance(); // dest
            if (this.peek()?.type === 'COMMA') this.advance();

            const srcToken = this.peek();
            if (!srcToken) return 1;

            this.advance(); // src

            // MOV reg, immediate => 2 bytes (opcode + imm8)
            if (destToken.type === 'REGISTER' && srcToken.type === 'NUMBER') {
                return 2;
            }

            // MOV reg, [mem] ou MOV [mem], reg => 3 bytes (opcode + addr16)
            if ((destToken.type === 'REGISTER' && srcToken.type === 'LBRACKET') ||
                (destToken.type === 'LBRACKET' && srcToken.type === 'REGISTER')) {
                // Skip jusqu'au RBRACKET
                while (this.peek()?.type !== 'RBRACKET' && !this.isAtEnd()) {
                    this.advance();
                }
                if (this.peek()?.type === 'RBRACKET') this.advance();
                return 3;
            }

            // MOV reg, identifier (label) => 3 bytes
            if (destToken.type === 'REGISTER' && srcToken.type === 'IDENTIFIER') {
                return 3;
            }

            // MOV reg, reg => 1 byte
            return 1;
        }

        if (oneByteOperandInstructions.includes(mnemonic)) {
            // Skip l'opérande
            if (!this.isAtEnd()) this.advance();
            return 2; // opcode + 1 byte
        }

        if (twoByteOperandInstructions.includes(mnemonic)) {
            // Skip l'opérande
            if (!this.isAtEnd()) this.advance();
            return 3; // opcode + 2 bytes
        }

        return 1; // Par défaut
    }

    private calculateDataSize(): number {
        let size = 0;

        while (!this.isAtEnd()) {
            const token = this.peek();

            if (token.type === 'STRING') {
                size += token.value.length;
                this.advance();
            } else if (token.type === 'NUMBER') {
                size += 1; // 1 byte par nombre
                this.advance();
            } else if (token.type === 'COMMA') {
                this.advance();
            } else {
                break; // Fin des données
            }
        }

        return size;
    }

    // ============================================================
    // PASSE 2 : GÉNÉRATION DU CODE
    // ============================================================

    private pass2GenerateCode(): void {
        this.currentAddress = 0;
        this.pos = 0;

        while (!this.isAtEnd()) {
            const token = this.peek();

            // Directive .ORG
            if (token.type === 'DIRECTIVE' && token.value.toUpperCase() === '.ORG') {
                this.advance(); // .ORG
                const addrToken = this.expect('NUMBER');
                this.currentAddress = this.parseNumber(addrToken.value);
                this.addComment(`ORG 0x${this.currentAddress.toString(16).toUpperCase()}`);
                continue;
            }

            // Label (déjà traité en passe 1, juste ajouter un commentaire)
            if (token.type === 'LABEL') {
                const labelName = token.value;
                this.addComment(`${labelName}:`);
                this.advance(); // LABEL
                this.advance(); // COLON
                continue;
            }

            // Data definition
            if (token.type === 'IDENTIFIER') {
                const nextToken = this.tokens[this.pos + 1];
                if (nextToken?.type === 'DIRECTIVE') {
                    const directive = nextToken.value.toUpperCase();
                    if (['DB', 'DW', 'DD'].includes(directive)) {
                        const varName = token.value;
                        this.advance(); // IDENTIFIER
                        this.advance(); // DIRECTIVE
                        this.generateData(varName);
                        continue;
                    }
                }
            }

            // Instruction
            if (token.type === 'INSTRUCTION') {
                this.generateInstruction();
                continue;
            }

            // Section (ignorer)
            if (token.type === 'DIRECTIVE') {
                const directive = token.value.toUpperCase();
                if (['SECTION', '.DATA', '.TEXT', '.CODE', '.BSS', 'GLOBAL', 'EXTERN'].includes(directive)) {
                    this.advance();
                    // Skip le nom de section si présent
                    if (!this.isAtEnd() && this.peek().type === 'IDENTIFIER') {
                        this.advance();
                    }
                    continue;
                }
            }

            // Token inattendu
            this.advance();
        }
    }

    private generateData(varName: string): void {
        this.addComment(`${varName}:`);

        while (!this.isAtEnd()) {
            const token = this.peek();

            if (token.type === 'STRING') {
                const str = token.value;
                for (let i = 0; i < str.length; i++) {
                    this.emitByte(str.charCodeAt(i), `'${str[i]}'`);
                }
                this.advance();
            } else if (token.type === 'NUMBER') {
                const num = this.parseNumber(token.value);
                this.emitByte(num, token.value);
                this.advance();
            } else if (token.type === 'COMMA') {
                this.advance();
            } else {
                break;
            }
        }
    }

    private generateInstruction(): void {
        const instrToken = this.expect('INSTRUCTION');
        const mnemonic = instrToken.value.toUpperCase();

        // Instructions simples sans opérande
        if (this.tryEmitSimpleInstruction(mnemonic)) {
            return;
        }

        // MOV instruction (la plus complexe)
        if (mnemonic === 'MOV') {
            this.generateMov();
            return;
        }

        // Instructions de saut
        if (['JMP', 'JZ', 'JNZ', 'JC', 'JNC', 'CALL'].includes(mnemonic)) {
            this.generateJump(mnemonic);
            return;
        }

        // Instructions avec opérande 8-bit
        if (['SYSCALL', 'SET_FREQ', 'SET_SP'].includes(mnemonic)) {
            this.generateWithImmediate(mnemonic);
            return;
        }

        throw new Error(`Instruction non supportée: ${mnemonic}`);
    }

    private tryEmitSimpleInstruction(mnemonic: string): boolean {
        const simpleOpcodes: Record<string, Opcode> = {
            'NOP': Opcode.NOP,
            'HALT': Opcode.HALT,
            'HLT': Opcode.HALT,
            'ADD': Opcode.ADD,
            'SUB': Opcode.SUB,
            'AND': Opcode.AND,
            'OR': Opcode.OR,
            'XOR': Opcode.XOR,
            'RET': Opcode.RET,
            'IRET': Opcode.IRET,
            'EI': Opcode.EI,
            'DI': Opcode.DI,
            'GET_SP': Opcode.GET_SP,
            'GET_FREQ': Opcode.GET_FREQ,
            'BREAKPOINT': Opcode.BREAKPOINT,

            // Stack operations
            'PUSH_A': Opcode.PUSH_A,
            'PUSH_B': Opcode.PUSH_B,
            'PUSH_C': Opcode.PUSH_C,
            'PUSH_D': Opcode.PUSH_D,
            'POP_A': Opcode.POP_A,
            'POP_B': Opcode.POP_B,
            'POP_C': Opcode.POP_C,
            'POP_D': Opcode.POP_D,

            // ALU avec registre spécifique
            'INC_A': Opcode.INC_A,
            'DEC_A': Opcode.DEC_A,
            'INC_B': Opcode.INC_B,
            'DEC_B': Opcode.DEC_B,
            'INC_C': Opcode.INC_C,
            'DEC_C': Opcode.DEC_C,
            'INC_D': Opcode.INC_D,
            'DEC_D': Opcode.DEC_D,

            // Core operations
            'CORE_HALT': Opcode.CORE_HALT,
            'CORE_START': Opcode.CORE_START,
            'CORE_INIT': Opcode.CORE_INIT,
            'CORE_STATUS': Opcode.CORE_STATUS,
            'CORES_COUNT': Opcode.CORES_COUNT,

            // CPU operations
            'CPU_HALT': Opcode.CPU_HALT,
            'CPU_START': Opcode.CPU_START,
            'CPU_INIT': Opcode.CPU_INIT,
            'CPU_STATUS': Opcode.CPU_STATUS,
            'CPUS_COUNT': Opcode.CPUS_COUNT,
        };

        // Gestion des variations PUSH/POP/INC/DEC avec registre
        if (mnemonic.startsWith('PUSH') || mnemonic.startsWith('POP') ||
            mnemonic.startsWith('INC') || mnemonic.startsWith('DEC')) {

            // PUSH A => PUSH_A
            const normalized = mnemonic.includes('_') ? mnemonic : mnemonic + '_' + this.peek()?.value;

            if (simpleOpcodes[normalized]) {
                this.emitByte(simpleOpcodes[normalized], normalized, true);
                if (!mnemonic.includes('_')) {
                    this.advance(); // Consommer le registre
                }
                return true;
            }
        }

        if (simpleOpcodes[mnemonic]) {
            this.emitByte(simpleOpcodes[mnemonic], mnemonic, true);
            return true;
        }

        return false;
    }

    private generateMov(): void {
        // MOV dest, src
        const dest = this.peek();
        if (!dest) throw new Error('MOV: destination attendue');

        this.advance();
        if (this.peek()?.type === 'COMMA') this.advance();

        const src = this.peek();
        if (!src) throw new Error('MOV: source attendue');

        // MOV reg, reg
        if (dest.type === 'REGISTER' && src.type === 'REGISTER') {
            const opcode = this.getMovRegRegOpcode(dest.value, src.value);
            this.emitByte(opcode, `MOV ${dest.value}, ${src.value}`, true);
            this.advance();
            return;
        }

        // MOV reg, immediate
        if (dest.type === 'REGISTER' && src.type === 'NUMBER') {
            const opcode = this.getMovRegImmOpcode(dest.value);
            const value = this.parseNumber(src.value);
            this.emitByte(opcode, `MOV ${dest.value}, ${src.value}`, true);
            this.emitByte(value, `immediate: ${src.value}`);
            this.advance();
            return;
        }

        // MOV reg, [mem]
        if (dest.type === 'REGISTER' && src.type === 'LBRACKET') {
            this.advance(); // src
            this.advance(); // [

            const addr = this.parseMemoryAddress();
            const opcode = this.getMovRegMemOpcode(dest.value);

            this.emitByte(opcode, `MOV ${dest.value}, [mem]`, true);
            this.emit16bit(addr.value, addr.label);

            this.expect('RBRACKET');
            return;
        }

        // MOV [mem], reg
        if (dest.type === 'LBRACKET' && src.type === 'REGISTER') {
            this.advance(); // [

            const addr = this.parseMemoryAddress();
            const opcode = this.getMovMemRegOpcode(src.value);

            this.expect('RBRACKET');
            if (this.peek()?.type === 'COMMA') this.advance();
            this.advance(); // src register

            this.emitByte(opcode, `MOV [mem], ${src.value}`, true);
            this.emit16bit(addr.value, addr.label);
            return;
        }

        // MOV reg, label
        if (dest.type === 'REGISTER' && src.type === 'IDENTIFIER') {
            const opcode = this.getMovRegMemOpcode(dest.value);
            const labelAddr = this.labels.get(src.value) || 0;

            this.emitByte(opcode, `MOV ${dest.value}, ${src.value}`, true);

            if (this.labels.has(src.value)) {
                this.emit16bit(labelAddr, src.value);
            } else {
                // Forward reference
                this.unresolvedRefs.push({
                    address: this.currentAddress,
                    label: src.value,
                    is16bit: true
                });
                this.emit16bit(0, `${src.value} (unresolved)`);
            }

            this.advance();
            return;
        }

        throw new Error(`MOV: combinaison d'opérandes non supportée`);
    }

    private generateJump(mnemonic: string): void {
        const opcodes: Record<string, Opcode> = {
            'JMP': Opcode.JMP,
            'JZ': Opcode.JZ,
            'JNZ': Opcode.JNZ,
            'JC': Opcode.JC,
            'JNC': Opcode.JNC,
            'CALL': Opcode.CALL,
        };

        const opcode = opcodes[mnemonic];
        if (!opcode) throw new Error(`Jump inconnu: ${mnemonic}`);

        const target = this.peek();
        if (!target) throw new Error(`${mnemonic}: cible attendue`);

        this.emitByte(opcode, mnemonic, true);

        if (target.type === 'NUMBER') {
            const addr = this.parseNumber(target.value);
            this.emit16bit(addr, target.value);
        } else if (target.type === 'IDENTIFIER') {
            const labelAddr = this.labels.get(target.value);
            if (labelAddr !== undefined) {
                this.emit16bit(labelAddr, target.value);
            } else {
                // Forward reference
                this.unresolvedRefs.push({
                    address: this.currentAddress,
                    label: target.value,
                    is16bit: true
                });
                this.emit16bit(0, `${target.value} (unresolved)`);
            }
        }

        this.advance();
    }

    private generateWithImmediate(mnemonic: string): void {
        const opcodes: Record<string, Opcode> = {
            'SYSCALL': Opcode.SYSCALL,
            'SET_FREQ': Opcode.SET_FREQ,
            'SET_SP': Opcode.SET_SP,
        };

        const opcode = opcodes[mnemonic];
        if (!opcode) throw new Error(`Instruction inconnue: ${mnemonic}`);

        this.emitByte(opcode, mnemonic, true);

        const operand = this.peek();
        if (!operand || operand.type !== 'NUMBER') {
            throw new Error(`${mnemonic}: valeur numérique attendue`);
        }

        const value = this.parseNumber(operand.value);

        if (mnemonic === 'SET_SP') {
            this.emit16bit(value, operand.value);
        } else {
            this.emitByte(value, operand.value);
        }

        this.advance();
    }

    private parseMemoryAddress(): { value: number; label?: string } {
        const token = this.peek();
        if (!token) throw new Error('Adresse mémoire attendue');

        if (token.type === 'NUMBER') {
            const value = this.parseNumber(token.value);
            this.advance();
            return { value };
        }

        if (token.type === 'IDENTIFIER') {
            const label = token.value;
            const addr = this.labels.get(label);
            this.advance();

            if (addr !== undefined) {
                return { value: addr, label };
            } else {
                // Forward reference sera résolu plus tard
                return { value: 0, label };
            }
        }

        throw new Error('Adresse mémoire invalide');
    }

    // ============================================================
    // OPCODES HELPERS
    // ============================================================

    private getMovRegRegOpcode(dest: string, src: string): Opcode {
        const map: Record<string, Record<string, Opcode>> = {
            'A': { 'B': Opcode.MOV_AB, 'C': Opcode.MOV_AC, 'D': Opcode.MOV_AD },
            'B': { 'A': Opcode.MOV_BA, 'C': Opcode.MOV_BC, 'D': Opcode.MOV_BD },
            'C': { 'A': Opcode.MOV_CA, 'B': Opcode.MOV_CB, 'D': Opcode.MOV_CD },
            'D': { 'A': Opcode.MOV_DA, 'B': Opcode.MOV_DB, 'C': Opcode.MOV_DC },
        };

        const destUpper = dest.toUpperCase();
        const srcUpper = src.toUpperCase();

        if (!map[destUpper] || !map[destUpper][srcUpper]) {
            throw new Error(`MOV ${dest}, ${src}: combinaison invalide`);
        }

        return map[destUpper][srcUpper];
    }

    private getMovRegImmOpcode(reg: string): Opcode {
        const map: Record<string, Opcode> = {
            'A': Opcode.MOV_A_IMM,
            'B': Opcode.MOV_B_IMM,
            'C': Opcode.MOV_C_IMM,
            'D': Opcode.MOV_D_IMM,
        };

        const regUpper = reg.toUpperCase();
        if (!map[regUpper]) {
            throw new Error(`MOV ${reg}, imm: registre invalide`);
        }

        return map[regUpper];
    }

    private getMovRegMemOpcode(reg: string): Opcode {
        const map: Record<string, Opcode> = {
            'A': Opcode.MOV_A_MEM,
            'B': Opcode.MOV_B_MEM,
            'C': Opcode.MOV_C_MEM,
            'D': Opcode.MOV_D_MEM,
        };

        const regUpper = reg.toUpperCase();
        if (!map[regUpper]) {
            throw new Error(`MOV ${reg}, [mem]: registre invalide`);
        }

        return map[regUpper];
    }

    private getMovMemRegOpcode(reg: string): Opcode {
        const map: Record<string, Opcode> = {
            'A': Opcode.MOV_MEM_A,
            'B': Opcode.MOV_MEM_B,
            'C': Opcode.MOV_MEM_C,
            'D': Opcode.MOV_MEM_D,
        };

        const regUpper = reg.toUpperCase();
        if (!map[regUpper]) {
            throw new Error(`MOV [mem], ${reg}: registre invalide`);
        }

        return map[regUpper];
    }

    // ============================================================
    // RÉSOLUTION DES RÉFÉRENCES FORWARD
    // ============================================================

    private resolveForwardReferences(): void {
        for (const ref of this.unresolvedRefs) {
            const addr = this.labels.get(ref.label);
            if (addr === undefined) {
                this.errors.push(`Label non défini: ${ref.label}`);
                continue;
            }

            if (ref.is16bit) {
                // Mettre à jour 2 bytes (little-endian)
                const low = addr & 0xFF;
                const high = (addr >> 8) & 0xFF;

                this.bytecode[ref.address].value = low;
                this.bytecode[ref.address].comment = `${ref.label} (low = ${low})`;

                this.bytecode[ref.address + 1].value = high;
                this.bytecode[ref.address + 1].comment = `${ref.label} (high = ${high})`;
            } else {
                this.bytecode[ref.address].value = addr & 0xFF;
                this.bytecode[ref.address].comment = `${ref.label} = ${addr}`;
            }
        }
    }

    // ============================================================
    // UTILITAIRES
    // ============================================================

    private parseNumber(str: string): number {
        const lower = str.toLowerCase();

        if (lower.startsWith('0x')) return parseInt(lower.substring(2), 16);
        if (lower.startsWith('$')) return parseInt(lower.substring(1), 16);
        if (lower.startsWith('0b')) return parseInt(lower.substring(2), 2);
        if (lower.endsWith('h')) return parseInt(lower.substring(0, lower.length - 1), 16);
        if (lower.endsWith('b')) return parseInt(lower.substring(0, lower.length - 1), 2);

        return parseInt(str, 10);
    }

    private emitByte(value: number, comment?: string, isOpcode: boolean = false): void {
        this.bytecode.push({
            address: this.currentAddress++,
            value: value & 0xFF,
            comment,
            isOpcode
        });
    }

    private emit16bit(value: number, comment?: string): void {
        const low = value & 0xFF;
        const high = (value >> 8) & 0xFF;

        this.emitByte(low, comment ? `${comment} (low)` : '');
        this.emitByte(high, comment ? `${comment} (high)` : '');
    }

    private addComment(text: string): void {
        // Les commentaires ne prennent pas d'espace mémoire
        // On peut les ajouter avec une adresse négative pour les distinguer
    }

    // ============================================================
    // FORMATAGE DE LA SORTIE
    // ============================================================

    private formatOutput(): string {
        const lines: string[] = [];

        for (const entry of this.bytecode) {
            const hexAddr = `0x${entry.address.toString(16).padStart(4, '0').toUpperCase()}`;
            const hexValue = `0x${entry.value.toString(16).padStart(2, '0').toUpperCase()}`;

            let line = `            [${hexAddr}, ${hexValue}]`;

            if (entry.comment) {
                line += `, // ${entry.comment}`;
            }

            lines.push(line);
        }

        return lines.join(',\n');
    }

    // ============================================================
    // TOKEN HELPERS
    // ============================================================

    private peek(offset: number = 0): Token | undefined {
        return this.tokens[this.pos + offset];
    }

    private advance(): Token {
        return this.tokens[this.pos++];
    }

    private expect(type: string): Token {
        const token = this.peek();
        if (!token || token.type !== type) {
            throw new Error(`Token ${type} attendu, trouvé ${token?.type || 'EOF'}`);
        }
        return this.advance();
    }

    private isAtEnd(): boolean {
        return this.pos >= this.tokens.length;
    }
}

// ============================================================
// API PUBLIQUE
// ============================================================

export function compileAssembly(source: string): CompilerOutput {
    const compiler = new SimpleAssemblyCompiler(source);
    return compiler.compile();
}
