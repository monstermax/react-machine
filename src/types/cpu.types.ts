
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


export interface Device {
    read(port: u8): u8;
    write(port: u8, value: u8): void;
    getSize?(): number;
    reset?(): void;
}


export type IoDeviceType = 'DiskStorage' | 'Display' | 'Audio' | 'Random' | 'Time';


export interface IoDevice {
    name: string;
    ioPort: u8;
    type: IoDeviceType;
    read(port: u8): u8;
    write(port: u8, value: u8): void;
    getSize?(): number;
    reset?(): void;
}



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


type ProcessControlBlock = { // cf https://youtu.be/M9HHWFp84f0?t=499
    pid: u16;
    //state: ProcessState;
    program_counter: u16;
    general_purpose_registers: [u8, u8, u8];
    instruction_register: u8;
    flags: [u1, u1, u1];
    stack_pointer: u16;
    index_registers: [u16, u16]
    memory_limits: [u16, u16]
    //io_devices: Vec<IO_Device>;
    //open_files: Vec<File>;
    parent: ProcessControlBlock | null;
}

/*
# Monolithic Kernal

## Kernel Space
- File System
- Memory Management
- Device Drviers
- Code OS

## User Space
- User Applications
- Syscall to Kernel


# MicroKernel

## Kernel Space
- CPU Scheduling
- Memory Management

## User Space
- User Applications
- File System
- Device Drviers
- IPC & Syscall to Kernel

*/