
import { CUSTOM_CPU } from './arch_custom';
import { compileCode, formatBytecode } from './index';


const test1 = `
.org 0x100

section .data
    message db 'Hello, World!', 0
    count   dw 100

section .text
    global _start

_start:
    mov eax, 4
    mov ebx, 1
    mov ecx, message
    mov edx, 13
    syscall 0x80

    mov eax, 1
    xor ebx, ebx
    halt
`;

console.log("=== Test 1: Programme complet avec sections ===\n");

const result1 = compileCode(test1, CUSTOM_CPU);

if (result1.errors.length > 0) {
    console.log("Errors:");
    result1.errors.forEach(err => console.log(`  [${err.severity}] Line ${err.line}: ${err.message}`));
} else {
    console.log("✅ Compilation successful\n");

    console.log("Labels:");
    result1.labels.forEach((labelInfo, name) => {
        console.log(`  ${name.padEnd(20)} => 0x${labelInfo.address.toString(16).padStart(4, '0')}`);
    });

    console.log("\nSections:");
    for (const section of result1.sections) {
        console.log(`  ${section.name}: ${section.data.length} bytes`);
    }

    if (result1.entryPoint !== undefined) {
        console.log(`\nEntry point: 0x${result1.entryPoint.toString(16).padStart(4, '0')}`);
    }

    console.log("\nFormatted bytecode:");
    console.log(formatBytecode(result1));
}

const test2 = `
start:
    mov a, 0
    
loop:
    inc a
    mov b, 10
    sub
    jnz loop
    
    halt
`;

console.log("\n\n=== Test 2: Programme simple avec sauts ===\n");

const result2 = compileCode(test2, CUSTOM_CPU);

if (result2.errors.length > 0) {
    console.log("Errors:");
    result2.errors.forEach(err => console.log(`  [${err.severity}] Line ${err.line}: ${err.message}`));
} else {
    console.log("✅ Compilation successful\n");

    console.log("Labels:");
    result2.labels.forEach((labelInfo, name) => {
        console.log(`  ${name.padEnd(20)} => 0x${labelInfo.address.toString(16).padStart(4, '0')}`);
    });

    console.log("\nFormatted bytecode:");
    console.log(formatBytecode(result2));
}

const test3 = `
.data
    value db 42
    buffer db 0, 0, 0

.text
main:
    push a
    push b
    
    mov a, [value]
    mov b, a
    mov [buffer], b
    
    pop b
    pop a
    
    ret
`;

console.log("\n\n=== Test 3: PUSH/POP et accès mémoire ===\n");

const result3 = compileCode(test3, CUSTOM_CPU);

if (result3.errors.length > 0) {
    console.log("Errors:");
    result3.errors.forEach(err => console.log(`  [${err.severity}] Line ${err.line}: ${err.message}`));
} else {
    console.log("✅ Compilation successful\n");

    console.log("Labels:");
    result3.labels.forEach((labelInfo, name) => {
        console.log(`  ${name.padEnd(20)} => 0x${labelInfo.address.toString(16).padStart(4, '0')}`);
    });

    console.log("\nFormatted bytecode:");
    console.log(formatBytecode(result3));
}
