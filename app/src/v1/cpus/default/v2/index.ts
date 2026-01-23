
import { CUSTOM_CPU } from './arch_custom';
import { Compiler } from './compiler';
import { loadSourceCodeFromFile } from '../asm_compiler';

import type { CompiledCode, u16, u8 } from '@/types/cpu.types';
import type { CPUArchitecture, CompiledProgram, CompilerOptions } from './compiler.types';


export async function compileFile(filePath: string, architecture: CPUArchitecture = CUSTOM_CPU, options: Partial<CompilerOptions> = {}): Promise<CompiledProgram> {
    const source = await loadSourceCodeFromFile(filePath);
    const result = compileCode(source, architecture, options);
    return result;
}


export function compileCode(source: string, architecture: CPUArchitecture = CUSTOM_CPU, options: Partial<CompilerOptions> = {}): CompiledProgram {
    const compiler = new Compiler({
        architecture,
        startAddress: options.startAddress || 0,
        caseSensitive: options.caseSensitive || false
    });

    return compiler.compile(source);
}


export function formatBytecode(program: CompiledProgram): string {
    const lines: string[] = [];

    for (const section of program.sections) {
        if (section.data.length === 0) continue;

        lines.push(`\n// Section: ${section.name}`);

        for (const entry of section.data) {
            const hexAddr = `0x${entry.address.toString(16).padStart(4, '0').toUpperCase()}`;
            const hexValue = `0x${entry.value.toString(16).padStart(2, '0').toUpperCase()}`;

            let line = `    [${hexAddr}, ${hexValue}]`;

            if (entry.comment) {
                line += `, // ${entry.comment}`;
            }

            lines.push(line);
        }
    }

    return lines.join(',\n');
}


export function getBytecodeArray(program: CompiledProgram, sectionName?: string): Map<u16, u8> {
    const code: Map<u16, u8> = new Map;

    for (const section of program.sections) {
        if (sectionName && section.name !== sectionName) continue;

        for (const entry of section.data) {
            code.set(entry.address as u16, entry.value as u8);
        }
    }

    return code;
}


export function getMemoryMap(program: CompiledProgram): Map<number, number> {
    const memory = new Map<number, number>();

    for (const section of program.sections) {
        for (const entry of section.data) {
            memory.set(entry.address, entry.value);
        }
    }

    return memory;
}

export * from './compiler.types';
export * from './arch_custom';
export { Compiler };
