
export type u8 = number & { readonly __brand: 'u8' };

export type u16 = number & { readonly __brand: 'u16' };


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


export interface Device {
    read(address: u8): u8;
    write(address: u8, value: u8): void;
    getSize?(): number;
    reset?(): void;
}



export type OsInfo = {
    name: string,
    description: string,
    code: CompiledCode,
}


export type ProgramInfo = {
    name: string;
    description: string;
    code: CompiledCode;
};



export type PreCompiledCode = [line: u16, code: string, comment?: string, labels?: string[]][];

export type CompiledCode = Map<u16, u8>;

