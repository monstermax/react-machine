
import { finalizeCompilation, preCompileCode } from "@/v1/cpus/default/asm_compiler";
import { compileCode, formatBytecode, getBytecodeArray } from "@/v1/cpus/default/v2";
import { U16 } from "./integers";

import type { CompiledCode, u16 } from "@/types/cpu.types";


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
        const compiled = compileCode(codeSource);
        code = getBytecodeArray(compiled)
    }

    return code;
}


