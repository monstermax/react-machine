
import { finalizeCompilation, preCompileCode } from "@/cpus/default/asm_compiler";
import { compile, formatBytecode, getBytecodeArray } from "@/cpus/default/v2";
import { formatCompiledCodeArray } from "@/pages/CompilePage";
import type { CompiledCode, u16 } from "@/types/cpu.types";
import { U16 } from "./integers";


export const universalCompiler = async (codeSource: string, memoryOffset: u16 = U16(0), lineOffset: u16 = U16(0), compilerType: 'nasm' | 'custom' | 'auto' = 'auto') => {
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
        const compiled = compile(codeSource);
        code = getBytecodeArray(compiled)
    }

    return code;
}



export const openAsmFile = async (filePath: string) => {
    // RAW Mode
    if (true) {
        const content = (await import(`../../resources/asm/${filePath}?raw`))?.default;
        //console.log('content:', content)
        return content;
    }

    // URL Mode
    if (false) {
        const url = (await import(`../../resources/asm/${filePath}?url`))?.default;
        const content = await fetch(url).then(r => r.text());
        //console.log('content:', content)
        return content;
    }
}

