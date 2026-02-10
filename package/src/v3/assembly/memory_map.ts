

export namespace MEMORY_MAP {

    // ## ROM ## (0x0000-0x00FF) - 1280 bytes
    export const ROM_START: u16 = 0x0000;
    export const ROM_END: u16 = 0x04FF;


    // ## RAM ## (0x0500-0xEFFF) - ~60KB (OS + PROGRAM + MALLOC + STACK)
    export const RAM_START: u16 = 0x0500;
    export const RAM_END: u16 = 0xEFFF;

//    // OS (0x0500-0x0FFF) - ~3KB
//    export const OS_START: u16 = 0x0500;
//    export const OS_END: u16 = 0x0FFF;
//
//    // PROGRAM + DATA (0x1000-0xECFF) - ~60KB
//    export const PROGRAM_START: u16 = 0x1000;
//    export const PROGRAM_END: u16 = 0xECFF;
//
//    // STACK (0xEE00-0xEFFF) - 512 bytes
//    export const STACK_START: u16 = 0xEE00;
//    export const STACK_END: u16 = 0xEFFF;

    // ## I/O Devices ## (0xF000-0xFFFF) - 4096 ports (256 devices x 16 ports)
    export const IO_START: u16 = 0xF000;
    export const IO_END: u16 = 0xFFFF;

};



export function isRomAddress(address: u16): boolean {
    return address >= MEMORY_MAP.ROM_START && address <= MEMORY_MAP.ROM_END;
}


export function isRamAddress(address: u16): boolean {
    return address >= MEMORY_MAP.RAM_START && address <= MEMORY_MAP.RAM_END;
}


export function isIoAddress(address: u16): boolean {
    return address >= MEMORY_MAP.IO_START && address <= MEMORY_MAP.IO_END;
}

