
export type u1 = number & { readonly __brand: 'u1' };
export type u4 = number & { readonly __brand: 'u4' };
export type u8 = number & { readonly __brand: 'u8' };
export type u16 = number & { readonly __brand: 'u16' };
export type u32 = number & { readonly __brand: 'u32' };
export type u64 = number & { readonly __brand: 'u64' };


export type Register8 =
    "A"     // Register A
    | "B"     // Register B
    | "C"     // Register C
    | "D"     // Register D
    | "IR"    // Instruction Register // Stocke l'instruction en cours d'exécution pendant le cycle fetch-decode-execute.
    | "FLAGS" // Bit 0: Carry, Bit 1: Zero
    ;

export type Register16 =
    "PC" // Program Counter // contient l'adresse de la prochaine instruction à aller chercher en mémoire avant de l'exécuter
    | "SP" // Stack Pointer // Pointe vers le haut de la pile (stack) en mémoire
    ;

export type Register = Register8 | Register16;


export type IoDeviceType = 'Input' | 'DiskStorage' | 'Display' | 'Audio' | 'Random' | 'Time' | 'Interrupt' | 'Memory';


export type OsInfo = {
    name: string,
    description: string,
    filepath?: string,
}


export type ProgramInfo = {
    name: string;
    description: string;
    code: CompiledCode;
    filepath?: string;
};


export type PreCompiledCode = [line: u16, code: string, comment?: string, labels?: string[]][];

export type CompiledCode = Map<u16, u8>;
export type CompiledCodeComments = [line: u16, comment: string][];
export type CompiledCodeLabels = [line: u16, labels: string[]][];

export type CompilationV1 = {
    code: CompiledCode,
    comments: CompiledCodeComments,
    labels: CompiledCodeLabels,
};

