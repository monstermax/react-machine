
# Universal Assembly Compiler

Compilateur assembleur configurable supportant différentes architectures CPU.

## Architecture

```
compiler/
├── types.ts          - Types TypeScript
├── lexer.ts          - Lexer universel
├── compiler.ts       - Compilateur principal
├── arch_custom.ts    - Architecture CPU custom
├── index.ts          - API publique
└── test.ts           - Tests
```

## Utilisation

```typescript
import { compile, CUSTOM_CPU } from './compiler';

const source = `
start:
    mov eax, 10
    inc a
    halt
`;

const result = compile(source, CUSTOM_CPU);

if (result.errors.length === 0) {
    console.log("Bytecode:", result.sections);
    console.log("Labels:", result.labels);
}
```

## Principe

### 1. Syntaxe assembleur standard

Le compilateur accepte la **vraie syntaxe assembleur** :
- `INC A` (pas `INC_A`)
- `PUSH BX` (pas `PUSH_BX`)
- `MOV EAX, 10`

### 2. Mapping CPU-spécifique

Chaque architecture définit comment mapper les instructions vers les opcodes :

```typescript
{
    mnemonic: 'INC',
    variants: [
        { opcode: 0x25, condition: (ops) => ops[0].register === 'A' },
        { opcode: 0x27, condition: (ops) => ops[0].register === 'B' },
    ]
}
```

### 3. Mapping des registres

Les alias de registres sont automatiquement mappés :
- `EAX`, `AX`, `AL`, `AH` → `A`
- `EBX`, `BX`, `BL`, `BH` → `B`

## Ajouter une nouvelle architecture

```typescript
// arch_z80.ts
import type { CPUArchitecture } from './types';

export const Z80: CPUArchitecture = {
    name: 'Z80',
    addressSize: 16,
    endianness: 'little',
    
    registers: [
        { name: 'A', aliases: [], id: 'A', size: 8 },
        { name: 'B', aliases: [], id: 'B', size: 8 },
        { name: 'C', aliases: [], id: 'C', size: 8 },
        { name: 'HL', aliases: [], id: 'HL', size: 16 },
    ],
    
    instructions: [
        { mnemonic: 'NOP', opcode: 0x00, operands: 'NONE', size: 1 },
        { mnemonic: 'LD', opcode: 0x06, operands: 'REG_IMM8', size: 2, variants: [
            { operands: 'REG_IMM8', opcode: 0x06, size: 2, condition: (ops) => ops[0].register === 'B' },
            { operands: 'REG_IMM8', opcode: 0x0E, size: 2, condition: (ops) => ops[0].register === 'C' },
        ]},
    ]
};
```

## Fonctionnalités

### Sections
- `.data` / `.text` / `.bss`
- `SECTION .data`

### Directives
- `DB`, `DW`, `DD` - Définition de données
- `RESB`, `RESW` - Réservation d'espace
- `.ORG` - Adresse de départ
- `GLOBAL`, `EXTERN` - Symboles

### Instructions
- Support complet des opérandes : registres, immédiats, mémoire, labels
- Forward references
- Mapping automatique des registres

### Labels
```asm
start:
    jmp loop
    
loop:
    inc a
    jmp loop
```

## API

### compile(source, architecture, options?)

```typescript
interface CompilerOptions {
    startAddress?: number;
    caseSensitive?: boolean;
}
```

### formatBytecode(program)

Formate le bytecode pour affichage.

### getBytecodeArray(program, section?)

Retourne le bytecode sous forme de tableau.

### getMemoryMap(program)

Retourne une Map<address, value>.

## Exemple complet

```typescript
const source = `
.org 0x8000

.data
    message db "Hello", 0

.text
    global _start

_start:
    mov a, [message]
    syscall 0x01
    halt
`;

const result = compile(source, CUSTOM_CPU);

console.log("Entry:", result.entryPoint);
console.log("Labels:", result.labels);
console.log("Bytecode:", formatBytecode(result));
```
