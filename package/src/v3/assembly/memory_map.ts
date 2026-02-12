export namespace MEMORY_MAP {

    // ## ROM ## (0x0000-0x04FF) - 1280 bytes
    export const ROM_START: u16 = 0x0000;
    export const ROM_END: u16 = 0x04FF;


    // ## RAM ## (0x0500-0xEFFF) - ~60KB (OS + PROGRAM + MALLOC + STACK)
    export const RAM_START: u16 = 0x0500;
    export const RAM_END: u16 = 0xEFFF;

//    // OS (0x0500-0x0FFF) - ~3KB
    export const OS_START: u16 = 0x0700;
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


    // ## Device Table ## (0x0500-0x057F) - 128 bytes
    // Header: 1 byte (device count)
    // Entries: N * 6 bytes each:
    //   offset 0: device index (1 byte)
    //   offset 1: type (1 byte) - 0x01=input, 0x02=output, 0x03=input/output
    //   offset 2-3: I/O base address (2 bytes, little-endian)
    //   offset 4-5: pointer to name string (2 bytes, little-endian)
    export const DEVICE_TABLE_COUNT: u16 = 0x0500;
    export const DEVICE_TABLE_START: u16 = 0x0501;
    export const DEVICE_TABLE_ENTRY_SIZE: u8 = 6;
    export const DEVICE_TABLE_MAX_ENTRIES: u8 = 20;

    // ## Device Name Strings ## (0x0580-0x05FF) - 128 bytes
    // Null-terminated strings, allocated sequentially
    export const DEVICE_STRINGS_START: u16 = 0x0580;
    export const DEVICE_STRINGS_END: u16 = 0x05FF;


    // ## I/O Devices ## (0xF000-0xFFFF) - 4096 ports (256 devices x 16 ports)
    export const IO_START: u16 = 0xF000;
    export const IO_END: u16 = 0xFFFF;

};


export const DEVICE_TYPE_INPUT: u8 = 0x01;
export const DEVICE_TYPE_OUTPUT: u8 = 0x02;
export const DEVICE_TYPE_INPUT_OUTPUT: u8 = 0x03;


//export function deviceTypeFromString(type: string): u8 {
//    if (type === 'input') return DEVICE_TYPE_INPUT;
//    if (type === 'output') return DEVICE_TYPE_OUTPUT;
//    if (type === 'input/output' || type === 'both') return DEVICE_TYPE_INPUT_OUTPUT;
//    return 0;
//}


export function isRomAddress(address: u16): boolean {
    return address >= MEMORY_MAP.ROM_START && address <= MEMORY_MAP.ROM_END;
}


export function isRamAddress(address: u16): boolean {
    return address >= MEMORY_MAP.RAM_START && address <= MEMORY_MAP.RAM_END;
}


export function isIoAddress(address: u16): boolean {
    return address >= MEMORY_MAP.IO_START && address <= MEMORY_MAP.IO_END;
}

