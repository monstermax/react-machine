
export const test = () => {
    return 'O-K-3';
}


import { INSTRUCTIONS_WITH_OPERAND, INSTRUCTIONS_WITH_TWO_OPERANDS, getOpcodeName, getOpcodeDescription, getInstructionLength } from '@/cpus/default/cpu_instructions'
export { INSTRUCTIONS_WITH_OPERAND, INSTRUCTIONS_WITH_TWO_OPERANDS, getOpcodeName, getOpcodeDescription, getInstructionLength }


import { MEMORY_MAP, IRQ_MAP, isROM, isRAM, isIO, memoryToIOPort } from '@/lib/memory_map_16x8_bits';
export { MEMORY_MAP, IRQ_MAP, isROM, isRAM, isIO, memoryToIOPort }

import { universalCompiler, openAsmFile } from '@/lib/compilation';
export { universalCompiler, openAsmFile }


import * as compilerV1 from './cpus/default/asm_compiler';
export { compilerV1 }

import * as compilerV2 from './cpus/default/v2/index';
export { compilerV2 }

