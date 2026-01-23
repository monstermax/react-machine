declare interface ByteEntry {
    address: number;
    value: number;
    section: string;
    label?: string;
    comment?: string;
    isOpcode?: boolean;
}

declare type CompilationV1 = {
    code: CompiledCode;
    comments: CompiledCodeComments;
    labels: CompiledCodeLabels;
};

declare function compile(source: string, architecture?: CPUArchitecture, options?: Partial<CompilerOptions>): CompiledProgram;

declare function compileCode(inputCode: string, memoryOffset?: u16): Promise<CompilationV1>;

declare type CompiledCode = Map<u16, u8>;

declare type CompiledCodeComments = [line: u16, comment: string][];

declare type CompiledCodeLabels = [line: u16, labels: string[]][];

declare function compileDemo(): Promise<CompilationV1>;

declare interface CompiledProgram {
    sections: Section[];
    labels: Map<string, {
        section: string;
        address: u16;
    }>;
    symbols: Map<string, SymbolInfo>;
    entryPoint?: number;
    errors: CompilerError[];
}

declare function compileFile(filePath: string, memoryOffset?: u16): Promise<CompilationV1>;

declare class Compiler {
    private arch;
    private tokens;
    private pos;
    private sections;
    private currentSection;
    private currentAddress;
    private labels;
    private symbols;
    private unresolvedRefs;
    private errors;
    private registerMap;
    private instructionMap;
    private caseSensitive;
    private entryPoint?;
    constructor(options: CompilerOptions);
    private buildRegisterMap;
    private buildInstructionMap;
    compile(source: string): CompiledProgram;
    private resetSections;
    private pass1CollectSymbols;
    private handleDirectivePass1;
    private pass2GenerateCode;
    private handleDirectivePass2;
    private generateData;
    private reserveSpace;
    private generateInstruction;
    private parseOperands;
    private parseMemoryOperand;
    private findInstructionVariant;
    private matchesOperandPattern;
    private emitOperands;
    private calculateInstructionSize;
    private calculateDataSize;
    private resolveReferences;
    private emitByte;
    private mapRegister;
    private normalize;
    private parseNumber;
    private peek;
    private advance;
    private skip;
    private isAtEnd;
    private error;
}

declare interface CompilerError {
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning';
}

declare interface CompilerOptions {
    architecture: CPUArchitecture;
    startAddress?: number;
    caseSensitive?: boolean;
}

declare namespace compilerV1 {
    export {
        loadSourceCodeFromFile,
        compileDemo,
        decompileDemo,
        compileFile,
        compileCode,
        finalizeCompilation,
        preCompileFile,
        preCompileCode,
        decompileCode
    }
}
export { compilerV1 }

declare namespace compilerV2 {
    export {
        compile,
        formatBytecode,
        getBytecodeArray,
        getMemoryMap,
        Compiler,
        OperandType,
        InstructionDef,
        InstructionVariant,
        RegisterDef,
        CPUArchitecture,
        ParsedOperand,
        CompilerOptions,
        Section,
        ByteEntry,
        CompiledProgram,
        SymbolInfo,
        CompilerError,
        CUSTOM_CPU
    }
}
export { compilerV2 }

declare interface CPUArchitecture {
    name: string;
    addressSize: number;
    registers: RegisterDef[];
    instructions: InstructionDef[];
    endianness: 'little' | 'big';
}

declare const CUSTOM_CPU: CPUArchitecture;

declare function decompileCode(inputCode: PreCompiledCode): string;

declare function decompileDemo(): string;

declare function finalizeCompilation(preCompiledCode: PreCompiledCode): CompilationV1;

declare function formatBytecode(program: CompiledProgram): string;

declare function getBytecodeArray(program: CompiledProgram, sectionName?: string): Map<u16, u8>;

export declare const getInstructionLength: (opcode: u8) => number;

declare function getMemoryMap(program: CompiledProgram): Map<number, number>;

export declare const getOpcodeDescription: (opcode: u8) => string;

export declare const getOpcodeName: (opcode: u8) => string;

declare interface InstructionDef {
    mnemonic: string;
    opcode: number;
    operands: OperandType;
    size: number;
    variants?: InstructionVariant[];
}

export declare const INSTRUCTIONS_WITH_OPERAND: Opcode[];

export declare const INSTRUCTIONS_WITH_TWO_OPERANDS: Opcode[];

declare interface InstructionVariant {
    operands: OperandType;
    opcode: number;
    size: number;
    condition?: (operands: ParsedOperand[]) => boolean;
    mnemonic: string;
}

export declare const IRQ_MAP: {
    IRQ_TIMER: u16;
    IRQ_KEYBOARD: u16;
    IRQ_DISK: u16;
    IRQ_UART: u16;
    IRQ_BUTTON: u16;
};

export declare const isIO: (addr: u16) => boolean;

export declare const isRAM: (addr: u16) => boolean;

export declare const isROM: (addr: u16) => boolean;

declare function loadSourceCodeFromFile(sourceFile: string): Promise<string>;

export declare const MEMORY_MAP: {
    ROM_START: u16;
    ROM_END: u16;
    RAM_START: u16;
    RAM_END: u16;
    OS_START: u16;
    OS_END: u16;
    PROGRAM_START: u16;
    PROGRAM_END: u16;
    MALLOC_START: u16;
    MALLOC_HEAP_PTR_LOW: u16;
    MALLOC_HEAP_PTR_HIGH: u16;
    MALLOC_DATA_START: u16;
    MALLOC_END: u16;
    STACK_START: u16;
    STACK_END: u16;
    BOOTLOADER_STACK_START: u16;
    BOOTLOADER_STACK_END: u16;
    OS_STACK_START: u16;
    OS_STACK_END: u16;
    PROGAMS_STACK_START: u16;
    PROGAMS_STACK_END: u16;
    IO_START: u16;
    IO_END: u16;
    BUS_1_START: u16;
    BUS_1_END: u16;
    BUS_2_START: u16;
    BUS_2_END: u16;
    OS_DISK_BASE: u16;
    OS_DISK_DATA: u16;
    OS_DISK_SIZE_LOW: u16;
    OS_DISK_SIZE_HIGH: u16;
    OS_DISK_ADDR_LOW: u16;
    OS_DISK_ADDR_HIGH: u16;
    OS_DISK_FS_STATUS: u16;
    OS_DISK_FS_COMMAND: u16;
    OS_DISK_FS_DATA: u16;
    OS_DISK_FS_FILENAME: u16;
    OS_DISK_FS_HANDLE_LOW: u16;
    OS_DISK_FS_HANDLE_HIGH: u16;
    PROGRAM_DISK_BASE: u16;
    PROGRAM_DISK_DATA: u16;
    PROGRAM_DISK_LOW_SIZE: u16;
    PROGRAM_DISK_HIGH_SIZE: u16;
    PROGRAM_DISK_ADDR_LOW: u16;
    PROGRAM_DISK_ADDR_HIGH: u16;
    PROGRAM_DISK_FS_STATUS: u16;
    PROGRAM_DISK_FS_COMMAND: u16;
    PROGRAM_DISK_FS_DATA: u16;
    PROGRAM_DISK_FS_FILENAME: u16;
    PROGRAM_DISK_FS_HANDLE_LOW: u16;
    PROGRAM_DISK_FS_HANDLE_HIGH: u16;
    TIMER_BASE: u16;
    TIMER_COUNTER: u16;
    TIMER_CONTROL: u16;
    TIMER_PRESCALER: u16;
    TIMER_TICK: u16;
    LEDS_BASE: u16;
    LEDS_OUTPUT: u16;
    INTERRUPT_BASE: u16;
    INTERRUPT_ENABLE: u16;
    INTERRUPT_PENDING: u16;
    INTERRUPT_ACK: u16;
    INTERRUPT_MASK: u16;
    INTERRUPT_HANDLER_LOW: u16;
    INTERRUPT_HANDLER_HIGH: u16;
    INTERRUPT_CPU_HANDLER: u16;
    INTERRUPT_CORE_HANDLER: u16;
    KEYBOARD_BASE: u16;
    KEYBOARD_DATA: u16;
    KEYBOARD_STATUS: u16;
    SEVEN_SEG_BASE: u16;
    SEVEN_SEG_DATA: u16;
    SEVEN_SEG_RAW: u16;
    CONSOLE_BASE: u16;
    CONSOLE_CHAR: u16;
    CONSOLE_CLEAR: u16;
    BUZZER_FREQ: u16;
    BUZZER_DURATION: u16;
    GPIO_OUTPUT: u16;
    GPIO_INPUT: u16;
    GPIO_DIRECTION: u16;
    LCD_BASE: u16;
    LCD_DATA: u16;
    LCD_COMMAND: u16;
    LCD_CURSOR: u16;
    RNG_BASE: u16;
    RNG_OUTPUT: u16;
    RNG_SEED: u16;
    RTC_BASE: u16;
    RTC_YEARS: u16;
    RTC_MONTHS: u16;
    RTC_DAYS: u16;
    RTC_HOURS: u16;
    RTC_MINUTES: u16;
    RTC_SECONDS: u16;
    RTC_TIMESTAMP_0: u16;
    RTC_TIMESTAMP_1: u16;
    RTC_TIMESTAMP_2: u16;
    RTC_TIMESTAMP_3: u16;
    PIXEL_DISPLAY_BASE: u16;
    PIXEL_X: u16;
    PIXEL_Y: u16;
    PIXEL_COLOR: u16;
    DATA_DISK_BASE: u16;
    DATA_DISK_DATA: u16;
    DATA_DISK_SIZE_LOW: u16;
    DATA_DISK_SIZE_HIGH: u16;
    DATA_DISK_ADDR_LOW: u16;
    DATA_DISK_ADDR_HIGH: u16;
    DATA_DISK_FS_STATUS: u16;
    DATA_DISK_FS_COMMAND: u16;
    DATA_DISK_FS_DATA: u16;
    DATA_DISK_FS_FILENAME: u16;
    DATA_DISK_FS_HANDLE_LOW: u16;
    DATA_DISK_FS_HANDLE_HIGH: u16;
    DATA_DISK_2_BASE: u16;
    DATA_DISK_2_DATA: u16;
    DATA_DISK_2_SIZE_LOW: u16;
    DATA_DISK_2_SIZE_HIGH: u16;
    DATA_DISK_2_ADDR_LOW: u16;
    DATA_DISK_2_ADDR_HIGH: u16;
    DATA_DISK_2_FS_STATUS: u16;
    DATA_DISK_2_FS_COMMAND: u16;
    DATA_DISK_2_FS_DATA: u16;
    DATA_DISK_2_FS_FILENAME: u16;
    DATA_DISK_2_FS_HANDLE_LOW: u16;
    DATA_DISK_2_FS_HANDLE_HIGH: u16;
    SWAP_DISK_BASE: u16;
    SWAP_DISK_DATA: u16;
    SWAP_DISK_SIZE_LOW: u16;
    SWAP_DISK_SIZE_HIGH: u16;
    SWAP_DISK_ADDR_LOW: u16;
    SWAP_DISK_ADDR_HIGH: u16;
    SWAP_DISK_FS_STATUS: u16;
    SWAP_DISK_FS_COMMAND: u16;
    SWAP_DISK_FS_DATA: u16;
    SWAP_DISK_FS_FILENAME: u16;
    SWAP_DISK_FS_HANDLE_LOW: u16;
    SWAP_DISK_FS_HANDLE_HIGH: u16;
    DMA_BASE: u16;
};

export declare const memoryToIOPort: (addr: u16) => u8;

declare enum Opcode {
    NOP = 0,
    GET_FREQ = 10,
    SET_FREQ = 11,
    BREAKPOINT_JS = 12,
    BREAKPOINT = 13,
    SYSCALL = 14,
    HALT = 15,
    CORE_HALT = 224,
    CORE_START = 225,
    CORE_INIT = 226,
    CORE_STATUS = 227,
    CORES_COUNT = 228,
    CPU_HALT = 232,
    CPU_START = 233,
    CPU_INIT = 234,
    CPU_STATUS = 235,
    CPUS_COUNT = 236,
    ADD = 32,// A = A + B
    SUB = 33,// A = A - B
    AND = 34,// A = A & B
    OR = 35,// A = A | B
    XOR = 36,// A = A ^ B
    INC_A = 37,
    DEC_A = 38,
    INC_B = 39,
    DEC_B = 40,
    INC_C = 41,
    DEC_C = 42,
    INC_D = 43,
    DEC_D = 44,
    PUSH_A = 48,// PUSH A
    PUSH_B = 49,// PUSH B
    PUSH_C = 50,// PUSH C
    PUSH_D = 51,// PUSH D
    POP_A = 52,// POP A
    POP_B = 53,// POP B
    POP_C = 54,// POP C
    POP_D = 55,// POP D
    GET_SP = 57,// GET SP
    SET_SP = 58,// SET SP, imm16
    CALL = 59,// CALL addr16 (push PC+3, then JMP)
    RET = 60,// RET (pop PC)
    EI = 61,// Enable Interrupts
    DI = 62,// Disable Interrupts
    IRET = 63,// Return from Interrupt
    JMP = 64,// JMP addr16 (16-bit address)
    JZ = 65,// JZ addr16 (16-bit address)
    JNZ = 66,// JNZ addr16 (16-bit address)
    JC = 67,// JC addr16 (16-bit address)
    JNC = 68,// JNC addr16 (16-bit address)
    MOV_AB = 144,// Move A to B
    MOV_AC = 145,// Move A to C  
    MOV_AD = 146,// Move A to D
    MOV_BA = 147,// Move B to A
    MOV_BC = 148,// Move B to C
    MOV_BD = 149,// Move B to D
    MOV_CA = 150,// Move C to A
    MOV_CB = 151,// Move C to B
    MOV_CD = 152,// Move C to D
    MOV_DA = 153,// Move D to A
    MOV_DB = 154,// Move D to B
    MOV_DC = 155,// Move D to C
    MOV_A_IMM = 156,// MOV A, imm8
    MOV_B_IMM = 157,// MOV B, imm8
    MOV_C_IMM = 158,// MOV C, imm8
    MOV_D_IMM = 159,// MOV D, imm8
    MOV_A_MEM = 160,// MOV A, [addr16]
    MOV_B_MEM = 161,// MOV B, [addr16]
    MOV_C_MEM = 162,// MOV C, [addr16]
    MOV_D_MEM = 163,// MOV D, [addr16]
    MOV_MEM_A = 164,// MOV [addr16], A
    MOV_MEM_B = 165,// MOV [addr16], B
    MOV_MEM_C = 166,// MOV [addr16], C
    MOV_MEM_D = 167,// MOV [addr16], D
    MOV_A_PTR_CD = 168,// A = [[C:D]]
    MOV_B_PTR_CD = 169,// B = [[C:D]]
    MOV_PTR_CD_A = 170,// [C:D] = A
    MOV_PTR_CD_B = 171
}

export declare const openFile: () => Promise<any>;

export declare const openUrl: () => Promise<string>;

declare type OperandType = 'NONE' | 'REG' | 'IMM8' | 'IMM16' | 'IMM32' | 'MEM' | 'REG_REG' | 'REG_IMM8' | 'REG_IMM16' | 'REG_MEM' | 'MEM_REG';

declare interface ParsedOperand {
    type: 'REGISTER' | 'IMMEDIATE' | 'MEMORY' | 'LABEL';
    value: string;
    register?: string;
    size?: number;
    address?: number;
    base?: string;
    index?: string;
    scale?: number;
    displacement?: number;
}

declare function preCompileCode(inputCode: string, memoryOffset?: u16, linesOffset?: u16, preIncludedFiles?: string[], preCodeLabels?: Map<string, u16>): Promise<{
    code: PreCompiledCode;
    includedFiles: string[];
    codeLabels: Map<string, u16>;
}>;

declare type PreCompiledCode = [line: u16, code: string, comment?: string, labels?: string[]][];

declare function preCompileFile(filePath: string, memoryOffset?: u16, linesOffset?: u16, preIncludedFiles?: string[], preCodeLabels?: Map<string, u16>): Promise<{
    code: PreCompiledCode;
    includedFiles: string[];
    codeLabels: Map<string, u16>;
}>;

declare interface RegisterDef {
    name: string;
    aliases: string[];
    id: string;
    size: number;
}

declare interface Section {
    name: string;
    type: 'code' | 'data' | 'bss';
    startAddress: number;
    data: ByteEntry[];
}

declare interface SymbolInfo {
    address: number;
    section: string;
    type: 'label' | 'variable' | 'function';
    size?: number;
    global?: boolean;
    extern?: boolean;
}

export declare const test: () => string;

declare type u16 = number & {
    readonly __brand: 'u16';
};

declare type u8 = number & {
    readonly __brand: 'u8';
};

export declare const universalCompiler: (codeSource: string, memoryOffset?: u16, lineOffset?: u16, compilerType?: "nasm" | "custom" | "auto") => Promise<CompiledCode | null>;

export { }
