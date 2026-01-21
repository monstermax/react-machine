
export type TokenType =
    | 'LABEL'
    | 'INSTRUCTION'
    | 'REGISTER'
    | 'NUMBER'
    | 'STRING'
    | 'DIRECTIVE'
    | 'IDENTIFIER'
    | 'COMMA'
    | 'COLON'
    | 'PLUS'
    | 'MINUS'
    | 'MUL'
    | 'LBRACKET'
    | 'RBRACKET'
    | 'LPAREN'
    | 'RPAREN'
    | 'COMMENT'
    | 'NEWLINE'
    | 'EOF';

export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}

interface LexerConfig {
    instructions: Set<string>;
    registers: Set<string>;
    directives: Set<string>;
    caseSensitive: boolean;
}

export class Lexer {
    private source: string;
    private pos = 0;
    private line = 1;
    private col = 1;
    private config: LexerConfig;

    constructor(
        source: string,
        instructions: string[],
        registers: string[],
        directives: string[],
        caseSensitive = false
    ) {
        this.source = source;

        const normalize = (arr: string[]) => caseSensitive
            ? new Set(arr)
            : new Set(arr.map(s => s.toUpperCase()));

        this.config = {
            instructions: normalize(instructions),
            registers: normalize(registers),
            directives: normalize(directives),
            caseSensitive
        };
    }

    public tokenize(): Token[] {
        const tokens: Token[] = [];

        while (!this.isAtEnd()) {
            const token = this.scanToken();
            if (token) tokens.push(token);
        }

        tokens.push({ type: 'EOF', value: '', line: this.line, column: this.col });
        return tokens;
    }

    private scanToken(): Token | null {
        const char = this.source[this.pos];

        switch (char) {
            case ' ':
            case '\t':
                this.pos++;
                this.col++;
                return null;

            case '\n':
                return this.makeToken('NEWLINE', '\n', () => {
                    this.pos++;
                    this.line++;
                    this.col = 1;
                });

            case '\r':
                this.pos++;
                if (this.peek() === '\n') this.pos++;
                const token = this.makeToken('NEWLINE', '\n');
                this.line++;
                this.col = 1;
                return token;

            case ';':
                return this.scanComment();

            case ',':
                return this.makeToken('COMMA', ',', () => { this.pos++; this.col++; });

            case ':':
                return this.makeToken('COLON', ':', () => { this.pos++; this.col++; });

            case '+':
                return this.makeToken('PLUS', '+', () => { this.pos++; this.col++; });

            case '-':
                return this.makeToken('MINUS', '-', () => { this.pos++; this.col++; });

            case '*':
                return this.makeToken('MUL', '*', () => { this.pos++; this.col++; });

            case '[':
                return this.makeToken('LBRACKET', '[', () => { this.pos++; this.col++; });

            case ']':
                return this.makeToken('RBRACKET', ']', () => { this.pos++; this.col++; });

            case '(':
                return this.makeToken('LPAREN', '(', () => { this.pos++; this.col++; });

            case ')':
                return this.makeToken('RPAREN', ')', () => { this.pos++; this.col++; });

            case '"':
            case "'":
                return this.scanString(char);

            default:
                if (this.isDigit(char) || char === '$' || (char === '0' && this.isHexPrefix(this.peek()))) {
                    return this.scanNumber();

                } else if (this.isAlpha(char) || char === '_' || char === '.') {
                    return this.scanIdentifier();

                } else {
                    throw new Error(`Unexpected character: ${char} at line ${this.line}, column ${this.col}`);
                }
        }
    }

    private scanComment(): Token {
        const startCol = this.col;
        const start = this.pos;

        while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.pos++;
            this.col++;
        }

        return {
            type: 'COMMENT',
            value: this.source.substring(start, this.pos),
            line: this.line,
            column: startCol
        };
    }

    private scanString(delimiter: string): Token {
        const startCol = this.col;
        this.pos++;
        this.col++;
        const start = this.pos;

        while (!this.isAtEnd()) {
            const char = this.peek();

            if (char === '\\') {
                this.pos++;
                this.col++;
                if (!this.isAtEnd()) {
                    this.pos++;
                    this.col++;
                }
            } else if (char === delimiter) {
                break;
            } else {
                if (char === '\n') {
                    this.line++;
                    this.col = 0;
                }
                this.pos++;
                this.col++;
            }
        }

        if (this.isAtEnd()) {
            throw new Error(`Unterminated string at line ${this.line}`);
        }

        const value = this.source.substring(start, this.pos);
        this.pos++;
        this.col++;

        return { type: 'STRING', value, line: this.line, column: startCol };
    }

    private scanNumber(): Token {
        const startCol = this.col;
        const start = this.pos;

        if (this.source[this.pos] === '0' && this.peek(1)?.toLowerCase() === 'x') {
            this.pos += 2;
            this.col += 2;
            while (this.isHexDigit(this.peek())) {
                this.pos++;
                this.col++;
            }
        } else if (this.source[this.pos] === '$') {
            this.pos++;
            this.col++;
            while (this.isHexDigit(this.peek())) {
                this.pos++;
                this.col++;
            }
        } else if (this.source[this.pos] === '0' && this.peek(1)?.toLowerCase() === 'b') {
            this.pos += 2;
            this.col += 2;
            while (this.isBinaryDigit(this.peek())) {
                this.pos++;
                this.col++;
            }
        } else {
            while (this.isDigit(this.peek())) {
                this.pos++;
                this.col++;
            }
        }

        const suffix = this.peek().toLowerCase();
        if (suffix === 'h' || suffix === 'b' || suffix === 'o' || suffix === 'd') {
            this.pos++;
            this.col++;
        }

        return {
            type: 'NUMBER',
            value: this.source.substring(start, this.pos),
            line: this.line,
            column: startCol
        };
    }

    private scanIdentifier(): Token {
        const startCol = this.col;
        const start = this.pos;

        while (this.isAlphaNumeric(this.peek()) || this.peek() === '_' || this.peek() === '.') {
            this.pos++;
            this.col++;
        }

        const value = this.source.substring(start, this.pos);
        const normalizedValue = this.config.caseSensitive ? value : value.toUpperCase();

        let type: TokenType = 'IDENTIFIER';

        if (this.peek() === ':') {
            type = 'LABEL';

        } else if (this.config.instructions.has(normalizedValue)) {
            type = 'INSTRUCTION';

        } else if (this.config.registers.has(normalizedValue)) {
            type = 'REGISTER';

        } else if (this.config.directives.has(normalizedValue)) {
            type = 'DIRECTIVE';
        }

        return { type, value, line: this.line, column: startCol };
    }

    private makeToken(type: TokenType, value: string, advance?: () => void): Token {
        const startCol = this.col;
        if (advance) advance();
        return { type, value, line: this.line, column: startCol };
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
