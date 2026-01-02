


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


/*
export type u8 = number & { readonly __brand: 'u8' };
export type u16 = number & { readonly __brand: 'u16' };


// Fonctions de création (optionnelles mais recommandées)
function u8(value: number): u8 {
    if (value < 0 || value > 255 || !Number.isInteger(value)) {
        throw new Error(`u8 invalide: ${value}`);
    }
    return value as u8;
}

function u16(value: number): u16 {
    if (value < 0 || value > 65535 || !Number.isInteger(value)) {
        throw new Error(`u16 invalide: ${value}`);
    }
    return value as u16;
}
*/


/*
export interface u8 extends Number {
    readonly __type?: 'u8';
}


export interface u16 extends Number {
    readonly __type?: 'u16';
}
*/


/*
type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

//export type u8 = IntRange<0, 255>
//export type u16 = IntRange<0, 65535>


type Ran<T extends number> = number extends T ? number :_Range<T, []>;
type _Range<T extends number, R extends unknown[]> = R['length'] extends T ? R[number] : _Range<T, [R['length'], ...R]>;

//export type u8 = Ran<255>
//export type u16 = Ran<65535>
*/



