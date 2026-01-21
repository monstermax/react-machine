
// Types pour les tokens
export type TokenType =
    | 'LABEL'           // label:
    | 'INSTRUCTION'     // MOV, ADD, etc.
    | 'REGISTER'        // AX, BX, etc.
    | 'NUMBER'          // 123, 0x1F, 0b1010
    | 'STRING'          // "hello" ou 'hello'
    | 'DIRECTIVE'       // .data, .text, DB, DW
    | 'IDENTIFIER'      // nom de variable
    | 'COMMA'           // ,
    | 'COLON'           // :
    | 'PLUS'           // +
    | 'MINUS'          // -
    | 'MUL'            // *
    | 'LBRACKET'       // [
    | 'RBRACKET'       // ]
    | 'LPAREN'         // (
    | 'RPAREN'         // )
    | 'COMMENT'        // ; commentaire
    | 'NEWLINE'        // fin de ligne
    | 'EOF';           // fin de fichier

export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}

// Configuration du lexer - Version simplifiée
export interface LexerConfig {
    instructions?: string[];
    registers?: string[];
    directives?: string[];
    caseSensitive?: boolean;
}


// Fonction createLexer pour maintenir la compatibilité
export function createLexer(source: string, customConfig?: Partial<LexerConfig>): AssemblyLexer {
    return new AssemblyLexer(source, customConfig);
}


export class AssemblyLexer {
    private source: string;
    private pos = 0;
    private line = 1;
    private col = 1;
    private tokens: Token[] = [];
    private config: LexerConfig;

    constructor(source: string, config: LexerConfig = {}) {
        this.source = source;
        this.config = {
            instructions: config.instructions || [
                'MOV', 'ADD', 'SUB', 'MUL', 'DIV', 'INC', 'DEC', 'XOR',
                'CMP', 'JMP', 'JE', 'JNE', 'JG', 'JGE', 'JL', 'JLE', 'JC', 'JNC', 'JZ', 'JNZ',
                'CALL', 'RET', 'PUSH', 'POP', 'INT', 'NOP', 'HLT'
            ],
            registers: config.registers || [
                'AX', 'BX', 'CX', 'DX',
                'SI', 'DI', 'SP', 'BP',
                'AL', 'BL', 'CL', 'DL',
                'AH', 'BH', 'CH', 'DH',
                'EAX', 'EBX', 'ECX', 'EDX',
                'ESI', 'EDI', 'ESP', 'EBP',
            ],
            directives: config.directives || [
                'DB', 'DW', 'DD', 'DQ',
                'SECTION', 'GLOBAL', 'EXTERN',
                '.DATA', '.CODE', '.TEXT', '.BSS', '.ORG',
                ".ASCII", ".STRING", ".BYTE", ".WORD", ".LONG",
            ],
            caseSensitive: config.caseSensitive || false
        };

        // Normaliser si pas sensible à la casse
        if (!this.config.caseSensitive) {
            this.config.instructions = this.config.instructions!.map(i => i.toUpperCase());
            this.config.registers = this.config.registers!.map(r => r.toUpperCase());
            this.config.directives = this.config.directives!.map(d => d.toUpperCase());
        }
    }

    private mapRegister(reg: string) {
        const mapping: Record<string, string> = {
            AL: 'A',
            AH: 'A',
            AX: 'A',
            EAX: 'A',
            RAX: 'A',
            BL: 'B',
            BH: 'B',
            BX: 'B',
            EBX: 'B',
            RBX: 'B',
            CL: 'C',
            CH: 'C',
            CX: 'C',
            ECX: 'C',
            RCX: 'C',
            DL: 'D',
            DH: 'D',
            DX: 'D',
            EDX: 'D',
            RDX: 'D',
        }

        const regNormalized = reg.toUpperCase();

        if (mapping[regNormalized]) {
            return mapping[regNormalized];
        }

        return reg;
    }

    public tokenize(): Token[] {
        while (!this.isAtEnd()) {
            this.scanToken();
        }
        this.addToken('EOF', '');
        return this.tokens;
    }

    private scanToken(): void {
        const char = this.source[this.pos];

        switch (char) {
            case ' ':
            case '\t':
                this.pos++; this.col++;
                break;

            case '\n':
                this.addToken('NEWLINE', '\n');
                this.pos++; this.line++; this.col = 1;
                break;

            case '\r':
                this.pos++; // Skip \r
                if (this.peek() === '\n') {
                    this.pos++; // Skip \n in \r\n
                }
                this.addToken('NEWLINE', '\n');
                this.line++; this.col = 1;
                break;

            case ';':
                this.scanComment();
                break;

            case ',':
                this.addToken('COMMA', ',');
                this.pos++; this.col++;
                break;

            case ':':
                this.addToken('COLON', ':');
                this.pos++; this.col++;
                break;

            case '+':
                this.addToken('PLUS', '+');
                this.pos++; this.col++;
                break;

            case '-':
                this.addToken('MINUS', '-');
                this.pos++; this.col++;
                break;

            case '*':
                this.addToken('MUL', '*');
                this.pos++; this.col++;
                break;

            case '[':
                this.addToken('LBRACKET', '[');
                this.pos++; this.col++;
                break;

            case ']':
                this.addToken('RBRACKET', ']');
                this.pos++; this.col++;
                break;

            case '(':
                this.addToken('LPAREN', '(');
                this.pos++; this.col++;
                break;

            case ')':
                this.addToken('RPAREN', ')');
                this.pos++; this.col++;
                break;

            case '"':
            case "'":
                this.scanString(char);
                break;

            default:
                if (this.isDigit(char) || char === '$' || (char === '0' && this.isHexPrefix(this.peek()))) {
                    this.scanNumber();
                } else if (this.isAlpha(char) || char === '_' || char === '.') {
                    this.scanIdentifier();
                } else {
                    throw new Error(`Caractère inattendu: ${char} à la ligne ${this.line}, colonne ${this.col}`);
                }
        }
    }

    private scanComment(): void {
        const start = this.pos;
        while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.pos++; this.col++;
        }
        const comment = this.source.substring(start, this.pos);
        this.addToken('COMMENT', comment);
    }

    private scanString(delimiter: string): void {
        this.pos++; this.col++; // Skip opening delimiter
        const start = this.pos;
        let length = 0;

        while (!this.isAtEnd()) {
            const char = this.peek();

            if (char === '\\') {
                // Skip escape sequence
                this.pos++; this.col++;
                if (!this.isAtEnd()) {
                    this.pos++; this.col++;
                }
                length += 2;
            } else if (char === delimiter) {
                break;
            } else {
                if (char === '\n') {
                    this.line++; this.col = 0;
                }
                this.pos++; this.col++;
                length++;
            }
        }

        if (this.isAtEnd()) {
            throw new Error(`Chaîne non terminée avec ${delimiter}`);
        }

        const value = this.source.substring(start, this.pos);
        this.addToken('STRING', value);
        this.pos++; this.col++; // Skip closing delimiter
    }

    private scanNumber(): void {
        const start = this.pos;
        let value = '';

        // Check prefix
        if (this.source[this.pos] === '0' && this.peek(1)?.toLowerCase() === 'x') {
            // Hex: 0x
            this.pos += 2; this.col += 2;
            while (this.isHexDigit(this.peek())) {
                value += this.source[this.pos];
                this.pos++; this.col++;
            }
        } else if (this.source[this.pos] === '$') {
            // Hex: $
            this.pos++; this.col++;
            while (this.isHexDigit(this.peek())) {
                value += this.source[this.pos];
                this.pos++; this.col++;
            }
        } else if (this.source[this.pos] === '0' && this.peek(1)?.toLowerCase() === 'b') {
            // Binary: 0b
            this.pos += 2; this.col += 2;
            while (this.isBinaryDigit(this.peek())) {
                value += this.source[this.pos];
                this.pos++; this.col++;
            }
        } else {
            // Decimal
            while (this.isDigit(this.peek())) {
                value += this.source[this.pos];
                this.pos++; this.col++;
            }
        }

        // Check suffix
        const suffix = this.peek().toLowerCase();
        if (suffix === 'h' || suffix === 'b' || suffix === 'o' || suffix === 'd') {
            value += this.source[this.pos];
            this.pos++; this.col++;
        }

        this.addToken('NUMBER', this.source.substring(start, this.pos));
    }

    private scanIdentifier(): void {
        const start = this.pos;

        while (this.isAlphaNumeric(this.peek()) || this.peek() === '_' || this.peek() === '.') {
            this.pos++; this.col++;
        }

        let value = this.source.substring(start, this.pos);
        const normalizedValue = this.config.caseSensitive ? value : value.toUpperCase();

        // Déterminer le type
        let type: TokenType = 'IDENTIFIER';

        // Vérifier si c'est un label (a un : après)
        if (this.peek() === ':') {
            type = 'LABEL';

        } else if (this.config.instructions!.includes(normalizedValue)) {
            type = 'INSTRUCTION';

        } else if (this.config.registers!.includes(normalizedValue)) {
            type = 'REGISTER';
            value = this.mapRegister(value)

        } else if (this.config.directives!.includes(normalizedValue)) {
            type = 'DIRECTIVE';
        }

        this.addToken(type, value);
    }

    private addToken(type: TokenType, value: string): void {
        // Calculer la colonne de début
        const startCol = type === 'NEWLINE' ? this.col : this.col - value.length;

        this.tokens.push({
            type,
            value,
            line: this.line,
            column: Math.max(1, startCol)
        });
    }

    private peek(offset = 0): string {
        return this.source[this.pos + offset] || '\0';
    }

    private isAtEnd(): boolean {
        return this.pos >= this.source.length;
    }

    private isHexPrefix(c: string): boolean {
        return c === 'x' || c === 'X' || c === 'b' || c === 'B';
    }

    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    private isAlpha(c: string): boolean {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
    }

    private isAlphaNumeric(c: string): boolean {
        return this.isAlpha(c) || this.isDigit(c);
    }

    private isHexDigit(c: string): boolean {
        return this.isDigit(c) || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
    }

    private isBinaryDigit(c: string): boolean {
        return c === '0' || c === '1';
    }
}


