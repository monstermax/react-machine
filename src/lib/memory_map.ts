


/*

Memory Map:
- ROM (0x0000-0x00FF)     : Bootloader (charge l'OS depuis le disque)
- RAM (0x0100-0xFDFF)     : OS + Programme utilisateur
  - OS Zone (0x0100-0x01FF) : Mini OS
  - Program Zone (0x0200+)  : Programme utilisateur chargé par l'OS
- Stack (0xFE00-0xFEFF)   : Pile
- I/O (0xFF00-0xFFFF)     : Ports d'entrée/sortie

At power-on:
1. PC = 0x0000 (hard-wired)
2. CPU exécute depuis la ROM
3. Bootloader lit le disque via I/O
4. Bootloader copie programme → RAM (0x0100+)
5. Bootloader fait JMP 0x0100
6. Programme s'exécute depuis la RAM

*/


export const MEMORY_MAP = {
    // ROM
    ROM_START: 0x0000,
    ROM_END: 0x00FF,

    // RAM
    OS_START: 0x0100,
    OS_END: 0x01FF,
    PROGRAM_START: 0x0200,
    PROGRAM_END: 0xFDFF,
    STACK_START: 0xFE00,
    STACK_END: 0xFEFF,

    // I/O Devices (0xFF00-0xFFFF)
    IO_START: 0xFF00,
    IO_END: 0xFFFF,

    // Device 0: OS Disk (0xFF00-0xFF0F)
    OS_DISK_BASE: 0xFF00,
    OS_DISK_DATA: 0xFF00,      // Port 0: Read/Write data
    OS_DISK_SIZE: 0xFF01,      // Port 1: Get size
    OS_DISK_ADDR: 0xFF02,      // Port 2: Set address

    // Device 1: Program Disk (0xFF10-0xFF1F)
    PROGRAM_DISK_BASE: 0xFF10,
    PROGRAM_DISK_DATA: 0xFF10, // Port 0: Read/Write data
    PROGRAM_DISK_SIZE: 0xFF11, // Port 1: Get size
    PROGRAM_DISK_ADDR: 0xFF12, // Port 2: Set address

    // Device 3: LEDs
    LEDS_BASE: 0xFF30,
    LEDS_OUTPUT: 0xFF30,  // 8 LEDs (chaque bit = une LED)

    // Device 4: Interrupt
    INTERRUPT_BASE: 0xFF40,
    INTERRUPT_ENABLE: 0xFF40,  // Bitmask des interruptions activées
    INTERRUPT_PENDING: 0xFF41, // Interruptions en attente
    INTERRUPT_HANDLER: 0xFF42, // Adresse du handler

    // Device 6: Afficheur 7 Segments
    SEVEN_SEG_BASE: 0xFF60,
    SEVEN_SEG_DATA: 0xFF60,  // Chiffre à afficher (0-15 pour 0-F)
    SEVEN_SEG_RAW: 0xFF61,   // Contrôle direct des segments (bits)
} as const;


export const isROM = (addr: number) =>
    addr >= MEMORY_MAP.ROM_START && addr <= MEMORY_MAP.ROM_END;

export const isRAM = (addr: number) =>
    addr >= MEMORY_MAP.OS_START && addr <= MEMORY_MAP.STACK_END;

export const isIO = (addr: number) =>
    addr >= MEMORY_MAP.IO_START && addr <= MEMORY_MAP.IO_END;


// Convertir adresse mémoire absolue en port I/O relatif
export const memoryToIOPort = (addr: number): number => {
    return addr - MEMORY_MAP.IO_START;
};


export const isImportantIOAddress = (addr: number): boolean => {
    return addr === MEMORY_MAP.LEDS_OUTPUT || 
           addr === MEMORY_MAP.SEVEN_SEG_DATA ||
           addr === MEMORY_MAP.SEVEN_SEG_RAW ||
           addr === MEMORY_MAP.OS_DISK_DATA ||
           addr === MEMORY_MAP.OS_DISK_SIZE ||
           addr === MEMORY_MAP.OS_DISK_ADDR ||
           addr === MEMORY_MAP.PROGRAM_DISK_DATA ||
           addr === MEMORY_MAP.PROGRAM_DISK_SIZE ||
           addr === MEMORY_MAP.PROGRAM_DISK_ADDR;
};

