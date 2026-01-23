
import { finalizeCompilation, preCompileCode } from "@/v2/cpus/default/compiler_v1/asm_compiler";
import { compileCode, formatBytecode, getBytecodeArray } from "@/v2/cpus/default/compiler_v2";
import { toHex, U16 } from "./integers";

import type { CompiledCode, PreCompiledCode, u16 } from "@/types/cpu.types";


export async function loadSourceCodeFromFile(sourceFile: string): Promise<string> {
    //const sourceCodeModule = sourceFile.endsWith('.ts')
    //    ? await import(`../../cpus/default/asm/${sourceFile}`)
    //    : await import(`../../cpus/default/asm/${sourceFile}?raw`);
    //const sourceCode = sourceCodeModule.default;

    if (sourceFile.endsWith('.ts')) {
        //const sourceCodeModule = await import(`../../cpus/default/asm/${sourceFile}`)
        //const sourceCode = sourceCodeModule.default;
        //return sourceCode;
    }

    if (false) {
        //const sourceCodeModule = await import(`../../cpus/default/asm/${sourceFile}?raw`)
        //const sourceCode = sourceCodeModule.default;
        //return sourceCode;
    }

    const response = await fetch(`/asm/${sourceFile}`);
    if (!response.ok) return '';

    const content = await response.text();
    return content;
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


