

export type Register =
  "A" // Register A
| "B" // Register B
| "C" // Register C
| "D" // Register D
| "PC" // Program Counter // contient l'adresse de la prochaine instruction à aller chercher en mémoire avant de l'exécuter
| "IR" // Instruction Register // Stocke l'instruction en cours d'exécution pendant le cycle fetch-decode-execute.
| "SP" // Stack Pointer // Pointe vers le haut de la pile (stack) en mémoire
| "FLAGS" // Bit 0: Carry, Bit 1: Zero
;


export type ProgramInfo = {
    name: string;
    description: string;
    code: Memory;
    expectedResult: string;
};


export type Memory = Map<number, number>;


export interface Device {
    read(address: number): number;
    write(address: number, value: number): void;
    getSize?(): number;
}

