


/*

Memory Map:
- ROM (0x0000-0x00FF)     : Bootloader (charge l'OS depuis le disque)
- RAM (0x0100-0xFDFF)     : OS + Programme utilisateur
  - OS Zone (0x0100-0x01FF) : Mini OS
  - Program Zone (0x0200+)  : Programme utilisateur chargé par l'OS
- Stack (0xEE00-0xEFFF)   : Pile
- I/O (0xF000-0xFFFF)     : Ports d'entrée/sortie

At power-on:
1. PC = 0x0000 (hard-wired)
2. CPU exécute depuis la ROM
3. Bootloader lit le disque via I/O
4. Bootloader copie programme → RAM (0x0100+)
5. Bootloader fait JMP 0x0100
6. Programme s'exécute depuis la RAM

*/

import { U16, U8 } from "./integers";

import type { u16, u8 } from "@/types/cpu.types";


export const MEMORY_MAP = createMemoryMap({

    // ## ROM ## (0x0000-0x00FF) - 1280 bytes
    ROM_START: 0x0000,
    ROM_END: 0x04FF,


    // ## RAM ## (0x0500-0xEFFF) - ~60KB (OS + PROGRAM + MALLOC + STACK)
    RAM_START: 0x0500,
    RAM_END: 0xEFFF,

    // OS (0x0500-0x0FFF) - ~3KB
    OS_START: 0x0500,
    OS_END: 0x0FFF,

    // PROGRAM + DATA (0x1000-0xECFF) - ~60KB
    PROGRAM_START: 0x1000,
    PROGRAM_END: 0xECFF,

    // MALLOC (0xED00-0xEDFF) - 256 bytes
    MALLOC_START: 0xED00,
    MALLOC_HEAP_PTR_LOW: 0xED00,
    MALLOC_HEAP_PTR_HIGH: 0xED01,
    MALLOC_DATA_START: 0xED02,
    MALLOC_END: 0xEDFF,

    // STACK (0xEE00-0xEFFF) - 256 bytes
    STACK_START: 0xEE00,
    STACK_END: 0xEFFF,

    // STACK BOOTLOADER (0xEE00-0xEE0F) - 16 bytes
    BOOTLOADER_STACK_START: 0xEE00,
    BOOTLOADER_STACK_END: 0xEE0F,

    // STACK OS (0xEE10-0xEE7F) - 240 bytes
    OS_STACK_START: 0xEE10,
    OS_STACK_END: 0xEEFF,

    // STACK PROGRAMS (0xEF00-0xEFFF) - 256 bytes
    PROGAMS_STACK_START: 0xEF00,
    PROGAMS_STACK_END: 0xEFFF,



    // ## I/O Devices ## (0xF000-0xFFFF) - 4096 ports (256 devices x 16 ports)

    IO_START: 0xF000,
    IO_END: 0xFFFF,

    BUS_1_START: 0xF000, //  2048 ports (128 devices x 16 ports)
    BUS_1_END: 0xF7FF,

    BUS_2_START: 0xF800, //  2048 ports (128 devices x 16 ports)
    BUS_2_END: 0xFFFF,

    // Device 0: OS Disk (0xF000-0xFF0F)
    OS_DISK_BASE: 0xF000,
    OS_DISK_DATA: 0xF000,           // Port  0: Read/Write data (RAW)
    OS_DISK_SIZE_LOW: 0xF001,       // Port  1: Get size (RAW)
    OS_DISK_SIZE_HIGH: 0xF002,      // Port  2: Get size (RAW)
    OS_DISK_ADDR_LOW: 0xF003,       // Port  3: Set address low (RAW)
    OS_DISK_ADDR_HIGH: 0xF004,      // Port  4: Set address high (RAW)
    OS_DISK_FS_STATUS: 0xF008,      // Port  8: FS status (nombre de fichiers)
    OS_DISK_FS_COMMAND: 0xF009,     // Port  9: FS command / result
    OS_DISK_FS_DATA: 0xF00A,        // Port 10: FS data read/write
    OS_DISK_FS_FILENAME: 0xF00B,    // Port 11: FS filename char
    OS_DISK_FS_HANDLE_LOW: 0xF00C,  // Port 12: File handle low
    OS_DISK_FS_HANDLE_HIGH: 0xF00D, // Port 13: File handle high

    // Device 1: Program Disk (0xF010-0xF01F)
    PROGRAM_DISK_BASE: 0xF010,
    PROGRAM_DISK_DATA: 0xF010,           // Port  0: Read/Write data (RAW)
    PROGRAM_DISK_LOW_SIZE: 0xF011,       // Port  1: Get size (RAW)
    PROGRAM_DISK_HIGH_SIZE: 0xF012,      // Port  2: Get size (RAW)
    PROGRAM_DISK_ADDR_LOW: 0xF013,       // Port  3: Set address low (RAW)
    PROGRAM_DISK_ADDR_HIGH: 0xF014,      // Port  4: Set address high (RAW)
    PROGRAM_DISK_FS_STATUS: 0xF018,      // Port  8: FS status (nombre de fichiers)
    PROGRAM_DISK_FS_COMMAND: 0xF019,     // Port  9: FS command / result
    PROGRAM_DISK_FS_DATA: 0xF01A,        // Port 10: FS data read/write
    PROGRAM_DISK_FS_FILENAME: 0xF01B,    // Port 11: FS filename char
    PROGRAM_DISK_FS_HANDLE_LOW: 0xF01C,  // Port 12: File handle low
    PROGRAM_DISK_FS_HANDLE_HIGH: 0xF01D, // Port 13: File handle high

    // Timer
    TIMER_BASE: 0xF020,
    TIMER_COUNTER: 0xF020,  // Lecture seule: compteur incrémenté à chaque cycle
    TIMER_CONTROL: 0xF021,  // Écriture: 0=stop, 1=start, 2=reset
    TIMER_PRESCALER: 0xF022, // Diviseur de fréquence
    TIMER_TICK: 0xF023, // Declenchement de tick

    // Device 3: LEDs
    LEDS_BASE: 0xF030,
    LEDS_OUTPUT: 0xF030,  // 8 LEDs (chaque bit = une LED)

    // Interrupt Controller (0xF040-0xF04F)
    INTERRUPT_BASE: 0xF040,
    INTERRUPT_ENABLE: 0xF040,     // R/W - Activer/désactiver IRQs (bitmask)
    INTERRUPT_PENDING: 0xF041,    // R   - IRQs en attente (read-only pour CPU)
    INTERRUPT_ACK: 0xF042,        // W   - Acquitter une IRQ (write-only)
    INTERRUPT_MASK: 0xF043,       // R/W - Masquer des IRQs temporairement
    INTERRUPT_HANDLER_LOW: 0xF044,  // R/W - Adresse handler (low byte)
    INTERRUPT_HANDLER_HIGH: 0xF045, // R/W - Adresse handler (high byte)
    INTERRUPT_CPU_HANDLER: 0xF046, // R/W - CPU handler
    INTERRUPT_CORE_HANDLER: 0xF047, // R/W - Core handler

    // Device 5: Keyboard
    KEYBOARD_BASE: 0xF050,
    KEYBOARD_DATA: 0xF050,    // Dernier caractère tapé (ASCII)
    KEYBOARD_STATUS: 0xF051,  // Bit 0: touche disponible

    // Device 6: Afficheur 7 Segments
    SEVEN_SEG_BASE: 0xF060,
    SEVEN_SEG_DATA: 0xF060,  // Chiffre à afficher (0-15 pour 0-F)
    SEVEN_SEG_RAW: 0xF061,   // Contrôle direct des segments (bits)

    // Console // Affichage de texte comme un terminal
    CONSOLE_BASE: 0xF070,
    CONSOLE_CHAR: 0xF070,     // Écrire un caractère ASCII
    CONSOLE_CLEAR: 0xF071,    // Clear screen

    // Buzzer // Génère des sons simples
    BUZZER_FREQ: 0xF080,      // Fréquence (0-255)
    BUZZER_DURATION: 0xF081,  // Durée en ms

    // GPIO (8 pins digitaux) // Simuler des entrées/sorties comme Arduino
    GPIO_OUTPUT: 0xF090,      // 8 bits de sortie
    GPIO_INPUT: 0xF091,       // 8 bits d'entrée
    GPIO_DIRECTION: 0xF092,   // 0=input, 1=output

    // LCD Display (16x2) // Écran LCD classique type Arduino
    LCD_BASE: 0xF0A0,
    LCD_DATA: 0xF0A0,         // Caractère à écrire
    LCD_COMMAND: 0xF0A1,      // Commandes (clear, home, etc)
    LCD_CURSOR: 0xF0A2,       // Position curseur

    // === RNG (0xF0B0-0xF0BF) ===
    RNG_BASE: 0xF0B0,
    RNG_OUTPUT: 0xF0B0,        // Nombre aléatoire 0-255
    RNG_SEED: 0xF0B1,          // Définir seed

    // === RTC (0xF0C0-0xF0CF) ===
    RTC_BASE: 0xF0C0,
    RTC_YEARS: 0xF0C1,         // Secondes (0-59)
    RTC_MONTHS: 0xF0C2,        // Secondes (0-59)
    RTC_DAYS: 0xF0C3,          // Secondes (0-59)
    RTC_HOURS: 0xF0C4,         // Secondes (0-59)
    RTC_MINUTES: 0xF0C5,       // Minutes (0-59)
    RTC_SECONDS: 0xF0C6,       // Heures (0-23)
    RTC_TIMESTAMP_0: 0xF0C7,   // Unix timestamp byte 0 (LSB)
    RTC_TIMESTAMP_1: 0xF0C8,   // Unix timestamp byte 1
    RTC_TIMESTAMP_2: 0xF0C9,   // Unix timestamp byte 2
    RTC_TIMESTAMP_3: 0xF0CA,   // Unix timestamp byte 3 (MSB)

    // Pixel Display // Écran graphique 32x32 pixels monochrome
    PIXEL_DISPLAY_BASE: 0xF0D0,
    PIXEL_X: 0xF0D0,
    PIXEL_Y: 0xF0D1,
    PIXEL_COLOR: 0xF0D2,      // 0=noir, 1=blanc

    // Device 14: Data Disk (0xF0E0-0xF0EF)
    DATA_DISK_BASE: 0xF0E0,
    DATA_DISK_DATA: 0xF0E0,           // Port  0: Read/Write data (RAW)
    DATA_DISK_SIZE_LOW: 0xF0E1,       // Port  1: Get size (RAW) - low
    DATA_DISK_SIZE_HIGH: 0xF0E2,      // Port  2: Get size (RAW) - high
    DATA_DISK_ADDR_LOW: 0xF0E3,       // Port  3: Set address (RAW) - low
    DATA_DISK_ADDR_HIGH: 0xF0E4,      // Port  4: Set address (RAW) - high
    DATA_DISK_FS_STATUS: 0xF0E8,      // Port  8: FS status (nombre de fichiers)
    DATA_DISK_FS_COMMAND: 0xF0E9,     // Port  9: FS command / result
    DATA_DISK_FS_DATA: 0xF0EA,        // Port 10: FS data read/write
    DATA_DISK_FS_FILENAME: 0xF0EB,    // Port 11: FS filename char
    DATA_DISK_FS_HANDLE_LOW: 0xF0EC,  // Port 12: File handle low
    DATA_DISK_FS_HANDLE_HIGH: 0xF0ED, // Port 13: File handle high

    // Device 15: Data Disk (0xF0F0-0xF0FF)
    DATA_DISK_2_BASE: 0xF0F0,
    DATA_DISK_2_DATA: 0xF0F0,           // Port  0: Read/Write data (RAW)
    DATA_DISK_2_SIZE_LOW: 0xF0F1,       // Port  1: Get size (RAW) - low
    DATA_DISK_2_SIZE_HIGH: 0xF0F2,      // Port  2: Get size (RAW) - high
    DATA_DISK_2_ADDR_LOW: 0xF0F3,       // Port  3: Set address (RAW) - low
    DATA_DISK_2_ADDR_HIGH: 0xF0F4,      // Port  4: Set address (RAW) - high
    DATA_DISK_2_FS_STATUS: 0xF0F8,      // Port  8: FS status (nombre de fichiers)
    DATA_DISK_2_FS_COMMAND: 0xF0F9,     // Port  9: FS command / result
    DATA_DISK_2_FS_DATA: 0xF0FA,        // Port 10: FS data read/write
    DATA_DISK_2_FS_FILENAME: 0xF0FB,    // Port 11: FS filename char
    DATA_DISK_2_FS_HANDLE_LOW: 0xF0FC,  // Port 12: File handle low
    DATA_DISK_2_FS_HANDLE_HIGH: 0xF0FD, // Port 13: File handle high

    // Device 16: Data Disk (0xF100-0xF10F)
    SWAP_DISK_BASE: 0xF100,
    SWAP_DISK_DATA: 0xF100,           // Port  0: Read/Write data (RAW)
    SWAP_DISK_SIZE_LOW: 0xF101,       // Port  1: Get size (RAW) - low
    SWAP_DISK_SIZE_HIGH: 0xF102,      // Port  2: Get size (RAW) - high
    SWAP_DISK_ADDR_LOW: 0xF103,       // Port  3: Set address (RAW) - low
    SWAP_DISK_ADDR_HIGH: 0xF104,      // Port  4: Set address (RAW) - high
    SWAP_DISK_FS_STATUS: 0xF108,      // Port  8: FS status (nombre de fichiers)
    SWAP_DISK_FS_COMMAND: 0xF109,     // Port  9: FS command / result
    SWAP_DISK_FS_DATA: 0xF10A,        // Port 10: FS data read/write
    SWAP_DISK_FS_FILENAME: 0xF10B,    // Port 11: FS filename char
    SWAP_DISK_FS_HANDLE_LOW: 0xF10C,  // Port 12: File handle low
    SWAP_DISK_FS_HANDLE_HIGH: 0xF10D, // Port 13: File handle high

    // Device 17: DMA (0xF110-0xF11F) // Direct Memory Access
    DMA_BASE: 0xF110,

    // Device 18: DMA (0xF120-0xF12F) // Clock
    CLOCK_BASE: 0xF120,
    CLOCK_FREQ: 0xF120,

});



// IRQ //

export const IRQ_MAP = createMemoryMap({

    // IRQ Sources (pour référence)
    IRQ_TIMER: 0,      // Bit 0 - Timer
    IRQ_KEYBOARD: 1,   // Bit 1 - Clavier
    IRQ_DISK: 2,       // Bit 2 - Disque
    IRQ_UART: 3,       // Bit 3 - UART/Console
    IRQ_BUTTON: 4,     // Bit 4 - Boutons UI
    // Bits 5-7 réservés

});



function createMemoryMap<T extends Record<string, number>>(obj: T): { [K in keyof T]: u16 } {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, value as unknown as u16])
    ) as any;
}


export const isROM = (addr: u16) =>
    addr >= MEMORY_MAP.ROM_START && addr <= MEMORY_MAP.ROM_END;

export const isRAM = (addr: u16) =>
    addr >= MEMORY_MAP.OS_START && addr <= MEMORY_MAP.STACK_END;

export const isIO = (addr: u16) =>
    addr >= MEMORY_MAP.IO_START && addr <= MEMORY_MAP.IO_END;


// Convertir adresse mémoire absolue en port I/O relatif
export const memoryToIOPort = (addr: u16): u8 => {
    return U8((addr - MEMORY_MAP.IO_START));
};


export const mapAddress16 = (memory: Map<u8, u8> | Map<u16, u8>, offset: u16): Map<u16, u8> => {
    const absolute = new Map<u16, u8>();

    for (const [relAddr, value] of memory.entries()) {
        const absAddr = U16(offset + relAddr);
        absolute.set(absAddr, value);
    }

    return absolute;
};
