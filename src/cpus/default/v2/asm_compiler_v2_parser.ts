import { createLexer, type Token, type TokenType } from "./asm_compiler_v2_lexer";

// Types pour l'AST (Abstract Syntax Tree)
export type ASTNodeType =
    | 'PROGRAM'
    | 'SECTION'
    | 'DIRECTIVE_STMT'
    | 'INSTRUCTION'
    | 'LABEL_DEF'
    | 'DATA_DEF'
    | 'OPERAND'
    | 'EXPRESSION'
    | 'COMMENT';

export interface ASTNode {
    type: ASTNodeType;
    value?: string;
    children?: ASTNode[];
    line?: number;
    column?: number;
    // Propriétés spécifiques
    name?: string;
    size?: string; // 'BYTE', 'WORD', 'DWORD', etc.
    operands?: Operand[];
    data?: DataValue[];
}

export interface Operand {
    type: 'REGISTER' | 'IMMEDIATE' | 'MEMORY' | 'IDENTIFIER' | 'EXPRESSION';
    value: string;
    size?: string;
    // Pour mémoire : [BASE + INDEX*SCALE + DISPLACEMENT]
    base?: string;
    index?: string;
    scale?: number;
    displacement?: string;
}

export interface DataValue {
    type: 'STRING' | 'NUMBER' | 'EXPRESSION';
    value: string;
}

// Parser principal
export class AssemblyParser {
    private tokens: Token[];
    private current = 0;
    private ast: ASTNode;

    constructor(tokens: Token[]) {
        this.tokens = tokens.filter(t => t.type !== 'COMMENT'); // On ignore les commentaires pour l'AST
        this.ast = {
            type: 'PROGRAM',
            children: []
        };
    }

    // Parse le programme entier
    public parse(): ASTNode {
        while (!this.isAtEnd()) {
            const stmt = this.parseStatement();
            if (stmt) {
                this.ast.children!.push(stmt);
            }
            // Avancer sur les newlines restants
            while (this.check('NEWLINE')) {
                this.advance();
            }
        }
        return this.ast;
    }

    // Parse une instruction, directive ou label
    private parseStatement(): ASTNode | null {
        while (this.check('NEWLINE')) this.advance();
        if (this.isAtEnd()) return null;

        const token = this.peek();

        if (token.type === 'LABEL') {
            return this.parseLabelDefinition();
        }

        if (token.type === 'DIRECTIVE') {
            return this.parseDirective();
        }

        // IDENTIFIER seul pourrait être une variable sans directive ?
        // Ou alors c'est une instruction
        if (token.type === 'IDENTIFIER') {
            // Regarder le token suivant
            const nextToken = this.tokens[this.current + 1];

            // Si le prochain token est un DIRECTIVE, laisser parseDirective gérer
            if (nextToken && nextToken.type === 'DIRECTIVE') {
                // Ne pas consommer l'identifieur ici
                // parseDirective() le fera
                return this.parseDirective();
            }

            // Sinon, c'est une instruction
            return this.parseInstruction();
        }

        if (token.type === 'INSTRUCTION') {
            return this.parseInstruction();
        }

        throw new Error(`Token inattendu: ${token.type} "${token.value}"`);
    }

    // Parse une définition de label
    private parseLabelDefinition(): ASTNode {
        const labelToken = this.consume('LABEL');
        this.consume('COLON');

        // Consommer le NEWLINE si présent
        if (this.check('NEWLINE')) {
            this.advance();
        }

        return {
            type: 'LABEL_DEF',
            name: labelToken.value,
            line: labelToken.line,
            column: labelToken.column
        };
    }

    // Parse une directive
    private parseDirective(): ASTNode {
        // Peut y avoir un identifieur avant la directive
        let identifier: string | undefined;

        if (this.check('IDENTIFIER') || this.check('LABEL')) {
            const nextToken = this.tokens[this.current + 1];
            if (nextToken && nextToken.type === 'DIRECTIVE') {
                identifier = this.advance().value; // Consommer l'identifieur
            }
        }

        const directiveToken = this.consume('DIRECTIVE');
        const directiveName = directiveToken.value.toUpperCase();


        switch (directiveToken.value.toUpperCase()) {
            case 'SECTION':
            case '.DATA':
            case '.CODE':
            case '.TEXT':
            case '.BSS':
                return this.parseSectionDirective(directiveToken);

            case '.ORG':
                return this.parseOrgDirective(directiveToken);

            case 'DB':
            case 'DW':
            case 'DD':
            case 'DQ':
                if (identifier) {
                    // Utiliser l'identifieur déjà consommé
                    return this.parseDataDefinitionWithName(identifier, directiveToken);
                }
                return this.parseDataDefinition(directiveToken);

            case 'GLOBAL':
            case 'EXTERN':
                return this.parseSymbolDirective(directiveToken);

            default:
                return this.parseGenericDirective(directiveToken);
        }
    }

    private parseOrgDirective(directiveToken: Token): ASTNode {
        if (this.match('NUMBER')) {
            const address = this.previous().value;

            if (this.check('NEWLINE')) {
                this.advance();
            }

            return {
                type: 'DIRECTIVE_STMT',
                name: '.ORG',
                value: address,
                line: directiveToken.line,
                column: directiveToken.column
            };
        }
        throw new Error('Adresse attendue après .ORG');
    }


    private parseDataDefinitionWithName(name: string, directiveToken: Token): ASTNode {
        const dataValues: DataValue[] = [];

        // Parse les valeurs
        while (!this.check('NEWLINE') && !this.isAtEnd()) {
            if (this.match('STRING')) {
                dataValues.push({ type: 'STRING', value: this.previous().value });
            } else if (this.match('NUMBER')) {
                dataValues.push({ type: 'NUMBER', value: this.previous().value });
            } else if (this.match(['IDENTIFIER', 'LABEL'])) {
                dataValues.push({ type: 'EXPRESSION', value: this.previous().value });
            } else if (!this.match(['COMMA', 'PLUS', 'MINUS', 'MUL'])) {
                break;
            }
        }

        if (this.check('NEWLINE')) this.advance();

        return {
            type: 'DATA_DEF',
            name: name,
            size: this.getDataSize(directiveToken.value),
            data: dataValues,
            line: directiveToken.line,
            column: directiveToken.column
        };
    }

    // Modifions parseSectionDirective
    private parseSectionDirective(directiveToken: Token): ASTNode {
        let sectionName: string;

        // Peut être un IDENTIFIER ou un DIRECTIVE (comme ".data")
        if (this.check('IDENTIFIER') || this.check('DIRECTIVE')) {
            sectionName = this.advance().value;
        } else {
            // Si pas de nom, utiliser une valeur par défaut
            sectionName = '';
        }

        return {
            type: 'SECTION',
            name: sectionName,
            value: directiveToken.value,
            line: directiveToken.line,
            column: directiveToken.column
        };
    }

    // Modifions aussi parseDataDefinition pour être plus robuste
    private parseDataDefinition(directiveToken: Token): ASTNode {
        let identifier: string;

        // Peut être un IDENTIFIER ou un LABEL
        if (this.check('IDENTIFIER') || this.check('LABEL')) {
            identifier = this.advance().value;
        } else {
            throw new Error(`Identifieur attendu après ${directiveToken.value}`);
        }

        const dataValues: DataValue[] = [];

        // Parse les valeurs de données
        while (!this.check('NEWLINE') && !this.isAtEnd()) {
            if (this.match('STRING')) {
                dataValues.push({
                    type: 'STRING',
                    value: this.previous().value
                });
            } else if (this.match('NUMBER')) {
                dataValues.push({
                    type: 'NUMBER',
                    value: this.previous().value
                });
            } else if (this.match(['IDENTIFIER', 'LABEL'])) {
                dataValues.push({
                    type: 'EXPRESSION',
                    value: this.previous().value
                });
            } else {
                // Opérateur ou virgule
                if (!this.match(['COMMA', 'PLUS', 'MINUS'])) {
                    break;
                }
            }
        }

        // Consommer le newline
        if (this.check('NEWLINE')) {
            this.advance();
        }

        return {
            type: 'DATA_DEF',
            name: identifier,
            size: this.getDataSize(directiveToken.value),
            data: dataValues,
            line: directiveToken.line,
            column: directiveToken.column
        };
    }

    // Et modifions parseIdentifier pour accepter plus de types
    private parseIdentifier(): string {
        if (this.match(['IDENTIFIER', 'DIRECTIVE', 'LABEL'])) {
            return this.previous().value;
        }
        throw new Error(`Identifieur attendu (trouvé ${this.peek().type}: "${this.peek().value}")`);
    }

    // Ajoutons aussi une méthode match améliorée
    private match(types: TokenType | TokenType[]): boolean {
        if (!Array.isArray(types)) {
            types = [types];
        }

        if (types.some(type => this.check(type))) {
            this.advance();
            return true;
        }
        return false;
    }

    // Modifions aussi parseGenericDirective pour être plus flexible
    private parseGenericDirective(directiveToken: Token): ASTNode {
        const args: string[] = [];

        while (!this.check('NEWLINE') && !this.isAtEnd()) {
            if (this.match(['IDENTIFIER', 'NUMBER', 'STRING', 'DIRECTIVE', 'LABEL'])) {
                args.push(this.previous().value);
            } else if (this.match(['PLUS', 'MINUS', 'MUL'])) {
                args.push(this.previous().value);
            } else if (!this.match('COMMA')) {
                break;
            }
        }

        // Consommer le newline
        if (this.check('NEWLINE')) {
            this.advance();
        }

        return {
            type: 'DIRECTIVE_STMT',
            name: directiveToken.value,
            value: args.join(' '),
            line: directiveToken.line,
            column: directiveToken.column
        };
    }

    // Parse une directive de symbole (GLOBAL, EXTERN)
    private parseSymbolDirective(directiveToken: Token): ASTNode {
        const symbols: string[] = [];

        while (!this.check('NEWLINE') && !this.isAtEnd()) {
            if (this.match('IDENTIFIER')) {
                symbols.push(this.previous().value);
            }

            if (!this.match('COMMA')) {
                break;
            }
        }

        // Consommer le newline
        if (this.check('NEWLINE')) {
            this.advance();
        }

        return {
            type: 'DIRECTIVE_STMT',
            name: directiveToken.value,
            value: symbols.join(', '),
            line: directiveToken.line,
            column: directiveToken.column
        };
    }

    // Parse une instruction
    private parseInstruction(): ASTNode {
        const instructionToken = this.match(['INSTRUCTION', 'IDENTIFIER'])
            ? this.previous()
            : this.consume('INSTRUCTION');

        const operands: Operand[] = [];

        // Parse les opérandes
        if (!this.check('NEWLINE')) {
            operands.push(this.parseOperand());

            while (this.match('COMMA')) {
                operands.push(this.parseOperand());
            }
        }

        // Consommer le newline
        if (this.check('NEWLINE')) {
            this.advance();
        }

        return {
            type: 'INSTRUCTION',
            name: instructionToken.value,
            operands: operands,
            line: instructionToken.line,
            column: instructionToken.column
        };
    }

    // Parse un opérande
    private parseOperand(): Operand {
        const token = this.peek();

        // Registre
        if (token.type === 'REGISTER') {
            this.advance();
            return {
                type: 'REGISTER',
                value: token.value
            };
        }

        // Nombre immédiat
        if (token.type === 'NUMBER') {
            this.advance();
            return {
                type: 'IMMEDIATE',
                value: token.value,
            };
        }

        // Identifieur (label, variable)
        if (token.type === 'IDENTIFIER') {
            this.advance();
            return {
                type: 'IDENTIFIER',
                value: token.value
            };
        }

        // Expression entre crochets [mem]
        if (this.match('LBRACKET')) {
            const memOperand = this.parseMemoryOperand();
            this.consume('RBRACKET');
            return memOperand;
        }

        // Expression (début avec + ou -)
        if (this.match(['PLUS', 'MINUS'])) {
            const op = this.previous().value;
            const nextToken = this.peek();

            if (nextToken.type === 'NUMBER') {
                this.advance();
                return {
                    type: 'IMMEDIATE',
                    value: op + nextToken.value
                };
            } else if (nextToken.type === 'IDENTIFIER') {
                this.advance();
                return {
                    type: 'EXPRESSION',
                    value: op + nextToken.value
                };
            }

            throw new Error(`Expression invalide après ${op}`);
        }

        throw new Error(`Opérande invalide: ${token.type} "${token.value}"`);
    }

    // Parse un opérande mémoire [base + index*scale + displacement]
    private parseMemoryOperand(): Operand {
        let base: string | undefined;
        let index: string | undefined;
        let scale: number | undefined;
        let displacement: string | undefined;

        // Premier élément
        if (this.match('REGISTER')) {
            base = this.previous().value;

        } else if (this.match('IDENTIFIER')) {
            displacement = this.previous().value;

        } else if (this.match('NUMBER')) {
            displacement = this.previous().value;
        }

        // Vérifier les opérations
        while (!this.check('RBRACKET') && !this.isAtEnd()) {
            if (this.match('PLUS')) {
                if (this.match('REGISTER')) {
                    if (!base) {
                        base = this.previous().value;
                    } else if (!index) {
                        index = this.previous().value;
                        scale = 1; // Scale par défaut
                    }
                } else if (this.match(['IDENTIFIER', 'NUMBER'])) {
                    displacement = this.previous().value;
                }
            } else if (this.match('MUL')) {
                if (index && this.match('NUMBER')) {
                    scale = parseInt(this.previous().value);
                } else {
                    throw new Error('Scale attendu après *');
                }
            }
        }

        return {
            type: 'MEMORY',
            value: this.formatMemoryOperand(base, index, scale, displacement),
            base,
            index,
            scale,
            displacement
        };
    }


    // Méthodes utilitaires
    private getDataSize(directive: string): string {
        switch (directive.toUpperCase()) {
            case 'DB':
                return 'BYTE';
            case 'DW':
                return 'WORD';
            case 'DD':
                return 'DWORD';
            case 'DQ':
                return 'QWORD';
            // TODO .string .ascii .word .long .byte
            default:
                return 'BYTE';
        }
    }

    private formatMemoryOperand(
        base?: string,
        index?: string,
        scale?: number,
        displacement?: string
    ): string {
        const parts: string[] = [];

        if (base) parts.push(base);
        if (index) {
            if (scale && scale !== 1) {
                parts.push(`${index}*${scale}`);
            } else {
                parts.push(index);
            }
        }
        if (displacement) parts.push(displacement);

        return parts.join('+');
    }


    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private consume(type: TokenType): Token {
        if (this.check(type)) {
            return this.advance();
        }
        throw new Error(`Token ${type} attendu, mais trouvé ${this.peek().type}`);
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }

    private isAtEnd(): boolean {
        return this.peek().type === 'EOF';
    }
}

// Fonction utilitaire pour créer un parser
export function createParser(tokens: Token[]): AssemblyParser {
    return new AssemblyParser(tokens);
}

// Fonction pour afficher l'AST de manière lisible
export function printAST(node: ASTNode, indent = 0): void {
    const indentStr = '  '.repeat(indent);

    if (node.type === 'PROGRAM') {
        console.log(`${indentStr}PROGRAM:`);
        node.children?.forEach(child => printAST(child, indent + 1));
        return;
    }

    let lineInfo = '';
    if (node.line !== undefined) {
        lineInfo = ` [L${node.line}:C${node.column}]`;
    }

    switch (node.type) {
        case 'SECTION':
            console.log(`${indentStr}SECTION "${node.name}" (${node.value})${lineInfo}`);
            break;

        case 'LABEL_DEF':
            console.log(`${indentStr}LABEL: ${node.name}${lineInfo}`);
            break;

        case 'DATA_DEF':
            console.log(`${indentStr}DATA ${node.size} ${node.name}:`);
            node.data?.forEach((data, i) => {
                console.log(`${indentStr}  [${i}] ${data.type}: ${data.value}`);
            });
            break;

        case 'DIRECTIVE_STMT':
            console.log(`${indentStr}DIRECTIVE ${node.name}: ${node.value}${lineInfo}`);
            break;

        case 'INSTRUCTION':
            console.log(`${indentStr}${node.name}:`);
            node.operands?.forEach((op, i) => {
                console.log(`${indentStr}  Operand ${i}: ${op.type} = ${op.value}`);
            });
            break;

        default:
            console.log(`${indentStr}${node.type}: ${node.value || ''}${lineInfo}`);
    }
}


// Fonction de test
export function testParser(tokens: Token[]): void {
    console.log("\n=== Test du Parser ===");

    try {
        const parser = createParser(tokens);
        const ast = parser.parse();

        console.log("\n=== AST Résultant ===");
        printAST(ast);

        // Afficher des statistiques
        const countByType = (node: ASTNode): Record<string, number> => {
            const counts: Record<string, number> = {};

            const countNode = (n: ASTNode) => {
                counts[n.type] = (counts[n.type] || 0) + 1;
                n.children?.forEach(countNode);
            };

            countNode(node);
            return counts;
        };

        const stats = countByType(ast);
        console.log("\n=== Statistiques ===");
        Object.entries(stats).forEach(([type, count]) => {
            console.log(`${type.padEnd(15)}: ${count}`);
        });

    } catch (error) {
        console.error("Erreur de parsing:", error instanceof Error ? error.message : error);
    }
}


// Exemple d'utilisation avec votre lexer existant
export function parseAssembly(source: string): ASTNode {
    const lexer = createLexer(source);
    const tokens = lexer.tokenize();
    const parser = createParser(tokens);
    return parser.parse();
}
