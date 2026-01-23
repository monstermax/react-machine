export declare type CompiledCode = Map<u16, u8>;

export declare type CompiledCodeComments = [line: u16, comment: string][];

export declare type CompiledCodeLabels = [line: u16, labels: string[]][];

export declare type IoDeviceType = 'Input' | 'DiskStorage' | 'Display' | 'Audio' | 'Random' | 'Time' | 'Interrupt';

export declare type OsInfo = {
    name: string;
    description: string;
    filepath?: string;
};

export declare type PreCompiledCode = [line: u16, code: string, comment?: string, labels?: string[]][];

export declare type ProgramInfo = {
    name: string;
    description: string;
    code: CompiledCode;
    filepath?: string;
};

export declare type Register = Register8 | Register16;

export declare type Register16 = "PC" | "SP";

export declare type Register8 = "A" | "B" | "C" | "D" | "IR" | "FLAGS";

export declare type u16 = number & {
    readonly __brand: 'u16';
};

export declare type u8 = number & {
    readonly __brand: 'u8';
};

export { }
