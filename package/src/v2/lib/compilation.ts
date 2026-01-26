
import fs from 'fs';

import { CompiledProgram, Compiler, CompilerOptions, CPUArchitecture, CUSTOM_CPU } from "../cpus/default/compiler_v2";
import { resolveIncludes } from "../cpus/default/compiler_v2/compiler_preprocessor";
import { toHex, U16 } from "./integers";
import { finalizeCompilation, preCompileCode } from '../cpus/default/compiler_v1/asm_compiler';

import type { CompiledCode, PreCompiledCode, u16, u8 } from "@/types/cpu.types";


export let compilationAsmBaseUrl = '';

export function setCompilationAsmBaseUrl(newBaseUrl: string) {
    compilationAsmBaseUrl = newBaseUrl;
}


export async function loadSourceCodeFromFile(filePath: string): Promise<string> {
    const response = await fetch(`${compilationAsmBaseUrl}/asm/${filePath}`);
    if (!response.ok) return '';

    const content = await response.text();
    return content;
}


export async function compileFile(filePath: string, architecture: CPUArchitecture = CUSTOM_CPU, options: Partial<CompilerOptions> = {}): Promise<CompiledProgram> {
    const source = await loadSourceCodeFromFile(filePath);

    const result = await compileCode(source, architecture, options);
    return result;
}


export async function compileCode(source: string, architecture: CPUArchitecture = CUSTOM_CPU, options: Partial<CompilerOptions> = {}): Promise<CompiledProgram> {
    const { source: resolvedSource, stats } = await resolveIncludes(source);

    // Log des stats si besoin
    console.log('Include stats:');
    stats.forEach((stat, file) => {
        console.log(`  ${stat.file}: ${stat.references} references from [${stat.includedBy.join(', ')}]`);
    });

    const compiler = new Compiler({
        architecture,
        startAddress: options.startAddress || 0,
        caseSensitive: options.caseSensitive || false
    });

    return await compiler.compile(resolvedSource);
}


export function formatBytecode(program: CompiledProgram): string {
    const lines: string[] = [];

    for (const section of program.sections) {
        if (section.data.length === 0) continue;

        lines.push(`\n// Section: ${section.name}`);

        for (const entry of section.data) {
            const hexAddr = `0x${entry.address.toString(16).padStart(4, '0').toUpperCase()}`;
            const hexValue = `0x${entry.value.toString(16).padStart(2, '0').toUpperCase()}`;

            let line = `    [${hexAddr}, ${hexValue}],`;

            if (entry.comment) {
                line += ` // ${entry.comment}`;
            }

            lines.push(line);
        }
    }

    return lines.join('\n');
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


export const formatCompiledCodeArray = (code: PreCompiledCode): string => {
    return '[\n' + code.map(([line, value, comment, labels], idx) => {
        let result = "";

        if (labels?.length) {
            const prefix = idx === 0 ? "" : "\n";
            result += `${prefix}    // [${labels.join(' - ')}]\n`;
        }

        result += `    [${toHex(line)}, ${value}],${comment ? ` // ${comment}` : ""}`;

        return result;
    }).join('\n') + '\n]';
};


export const formatCompiledCodeReadable = (code: PreCompiledCode): string => {
    return code.map(([line, value, comment, labels]) => {
        const lineStr = toHex(line);
        const valueStr = value.startsWith('Opcode.') ? value : toHex(parseInt(value));
        return `${lineStr}: ${valueStr}${comment ? `  # ${comment}` : ""}${labels?.length ? ` # [${labels.join(' - ')}]` : ""}`;
    }).join('\n');
};


export const parseCompiledCode = (text: string): PreCompiledCode => {
    const outputCode: PreCompiledCode = text
        .split('\n') // split by line
        .filter(line => line.trim() && line.includes('[') && line.includes(']') && line.trim().startsWith('[')) // discard empty lines
        .map(line => line.replace('[', '').replace(']', '').trim().split(',').slice(0, 2))
        .map(parts => [U16(Number(parts[0])), parts[1].trim() as string])

    return outputCode;
};



export const universalCompiler = async (codeSource: string, memoryOffset: u16=U16(0), lineOffset: u16=U16(0), compilerType: 'nasm' | 'custom' | 'auto'='auto') => {
    let code: CompiledCode | null = null;

    if (compilerType === 'auto') {
        compilerType = codeSource.toLowerCase().includes('section .text')
            ? 'nasm'
            : 'custom';
    }

    if (compilerType === 'custom') {
        const preCompiled = await preCompileCode(codeSource, memoryOffset, lineOffset);
        const finalized = finalizeCompilation(preCompiled.code);
        code = finalized.code;

    } else if (compilerType === 'nasm') {
        const compiled = await compileCode(codeSource);
        code = getBytecodeArray(compiled)
    }

    return code;
}

