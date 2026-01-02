


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


export type ProgramInfo = {
    name: string;
    description: string;
    code: Map<u8, u8>;
    expectedResult: string;
};


//export type Memory = Map<u16, u8>;


export interface Device {
    read(address: u8): u8;
    write(address: u8, value: u8): void;
    getSize?(): number;
}


export type u8 = number & { readonly __brand: 'u8' };
export type u16 = number & { readonly __brand: 'u16' };

