


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

import { U16, U8 } from "./integers";

import type { u16, u8 } from "@/types/cpu.types";


export const MEMORY_MAP = createMemoryMap({

    // ## ROM ## (0x0000-0x00FF) - 1280 bytes
    ROM_START: 0x0000,
    ROM_END: 0x04FF,


    // ## RAM ## (0x0500-0xFEFF) - ~64KB (OS + PROGRAM + STACK)
    RAM_START: 0x0500,
    RAM_END: 0xFEFF,

    // OS (0x0500-0x0FFF) - ~3KB
    OS_START: 0x0500,
    OS_END: 0x0FFF,

    // PROGRAM + DATA (0x1000-0xFCFF) - ~60KB
    PROGRAM_START: 0x1000,
    PROGRAM_END: 0xFCFF,

    // MALLOC (0xFD00-0xFDFF) - 256 bytes
    MALLOC_HEAP_PTR_LOW: 0xFD00,
    MALLOC_HEAP_PTR_HIGH: 0xFD01,
    MALLOC_DATA_START: 0xFD02,
    MALLOC_END: 0xFDFF,

    // STACK (0xFE00-0xFEFF) - 256 bytes
    STACK_START: 0xFE00,
    STACK_END: 0xFEFF,

    // STACK BOOTLOADER (0xFE00-0xFE0F) - 16 bytes
    BOOTLOADER_STACK_START: 0xFE00,
    BOOTLOADER_STACK_END: 0xFE0F,

    // STACK OS (0xFE10-0xFE7F) - 112 bytes
    OS_STACK_START: 0xFE10,
    OS_STACK_END: 0xFE7F,

    // STACK PROGRAMS (0xFE30-0xFEFF) - 128 bytes
    PROGAMS_STACK_START: 0xFE80,
    PROGAMS_STACK_END: 0xFEFF,



    // ## I/O Devices ## (0xFF00-0xFFFF) - 256 ports (16 devices x 16 ports)

    IO_START: 0xFF00,
    IO_END: 0xFFFF,

    // Device 0: OS Disk (0xFF00-0xFF0F)
    OS_DISK_BASE: 0xFF00,
    OS_DISK_DATA: 0xFF00,           // Port  0: Read/Write data (RAW)
    OS_DISK_SIZE_LOW: 0xFF01,       // Port  1: Get size (RAW)
    OS_DISK_SIZE_HIGH: 0xFF02,      // Port  2: Get size (RAW)
    OS_DISK_ADDR_LOW: 0xFF03,       // Port  3: Set address low (RAW)
    OS_DISK_ADDR_HIGH: 0xFF04,      // Port  4: Set address high (RAW)
    OS_DISK_FS_STATUS: 0xFF08,      // Port  8: FS status (nombre de fichiers)
    OS_DISK_FS_COMMAND: 0xFF09,     // Port  9: FS command / result
    OS_DISK_FS_DATA: 0xFF0A,        // Port 10: FS data read/write
    OS_DISK_FS_FILENAME: 0xFF0B,    // Port 11: FS filename char
    OS_DISK_FS_HANDLE_LOW: 0xFF0C,  // Port 12: File handle low
    OS_DISK_FS_HANDLE_HIGH: 0xFF0D, // Port 13: File handle high

    // Device 1: Program Disk (0xFF10-0xFF1F)
    PROGRAM_DISK_BASE: 0xFF10,
    PROGRAM_DISK_DATA: 0xFF10,           // Port  0: Read/Write data (RAW)
    PROGRAM_DISK_LOW_SIZE: 0xFF11,       // Port  1: Get size (RAW)
    PROGRAM_DISK_HIGH_SIZE: 0xFF12,      // Port  2: Get size (RAW)
    PROGRAM_DISK_ADDR_LOW: 0xFF13,       // Port  3: Set address low (RAW)
    PROGRAM_DISK_ADDR_HIGH: 0xFF14,      // Port  4: Set address high (RAW)
    PROGRAM_DISK_FS_STATUS: 0xFF18,      // Port  8: FS status (nombre de fichiers)
    PROGRAM_DISK_FS_COMMAND: 0xFF19,     // Port  9: FS command / result
    PROGRAM_DISK_FS_DATA: 0xFF1A,        // Port 10: FS data read/write
    PROGRAM_DISK_FS_FILENAME: 0xFF1B,    // Port 11: FS filename char
    PROGRAM_DISK_FS_HANDLE_LOW: 0xFF1C,  // Port 12: File handle low
    PROGRAM_DISK_FS_HANDLE_HIGH: 0xFF1D, // Port 13: File handle high

    // Timer
    TIMER_BASE: 0xFF20,
    TIMER_COUNTER: 0xFF20,  // Lecture seule: compteur incrémenté à chaque cycle
    TIMER_CONTROL: 0xFF21,  // Écriture: 0=stop, 1=start, 2=reset
    TIMER_PRESCALER: 0xFF22, // Diviseur de fréquence

    // Device 3: LEDs
    LEDS_BASE: 0xFF30,
    LEDS_OUTPUT: 0xFF30,  // 8 LEDs (chaque bit = une LED)

    // Interrupt Controller (0xFF40-0xFF4F)
    INTERRUPT_BASE: 0xFF40,
    INTERRUPT_ENABLE: 0xFF40,     // R/W - Activer/désactiver IRQs (bitmask)
    INTERRUPT_PENDING: 0xFF41,    // R   - IRQs en attente (read-only pour CPU)
    INTERRUPT_ACK: 0xFF42,        // W   - Acquitter une IRQ (write-only)
    INTERRUPT_MASK: 0xFF43,       // R/W - Masquer des IRQs temporairement
    INTERRUPT_HANDLER_LOW: 0xFF44,  // R/W - Adresse handler (low byte)
    INTERRUPT_HANDLER_HIGH: 0xFF45, // R/W - Adresse handler (high byte)

    // Device 5: Keyboard
    KEYBOARD_BASE: 0xFF50,
    KEYBOARD_DATA: 0xFF50,    // Dernier caractère tapé (ASCII)
    KEYBOARD_STATUS: 0xFF51,  // Bit 0: touche disponible

    // Device 6: Afficheur 7 Segments
    SEVEN_SEG_BASE: 0xFF60,
    SEVEN_SEG_DATA: 0xFF60,  // Chiffre à afficher (0-15 pour 0-F)
    SEVEN_SEG_RAW: 0xFF61,   // Contrôle direct des segments (bits)

    // Console // Affichage de texte comme un terminal
    CONSOLE_BASE: 0xFF70,
    CONSOLE_CHAR: 0xFF70,     // Écrire un caractère ASCII
    CONSOLE_CLEAR: 0xFF71,    // Clear screen

    // Buzzer // Génère des sons simples
    BUZZER_FREQ: 0xFF80,      // Fréquence (0-255)
    BUZZER_DURATION: 0xFF81,  // Durée en ms

    // GPIO (8 pins digitaux) // Simuler des entrées/sorties comme Arduino
    GPIO_OUTPUT: 0xFF90,      // 8 bits de sortie
    GPIO_INPUT: 0xFF91,       // 8 bits d'entrée
    GPIO_DIRECTION: 0xFF92,   // 0=input, 1=output

    // LCD Display (16x2) // Écran LCD classique type Arduino
    LCD_BASE: 0xFFA0,
    LCD_DATA: 0xFFA0,         // Caractère à écrire
    LCD_COMMAND: 0xFFA1,      // Commandes (clear, home, etc)
    LCD_CURSOR: 0xFFA2,       // Position curseur

    // === RNG (0xFFB0-0xFFBF) ===
    RNG_BASE: 0xFFB0,
    RNG_OUTPUT: 0xFFB0,        // Nombre aléatoire 0-255
    RNG_SEED: 0xFFB1,          // Définir seed

    // === RTC (0xFFC0-0xFFCF) ===
    RTC_BASE: 0xFFC0,
    RTC_YEARS: 0xFFC1,         // Secondes (0-59)
    RTC_MONTHS: 0xFFC2,        // Secondes (0-59)
    RTC_DAYS: 0xFFC3,          // Secondes (0-59)
    RTC_HOURS: 0xFFC4,         // Secondes (0-59)
    RTC_MINUTES: 0xFFC5,       // Minutes (0-59)
    RTC_SECONDS: 0xFFC6,       // Heures (0-23)
    RTC_TIMESTAMP_0: 0xFFC7,   // Unix timestamp byte 0 (LSB)
    RTC_TIMESTAMP_1: 0xFFC8,   // Unix timestamp byte 1
    RTC_TIMESTAMP_2: 0xFFC9,   // Unix timestamp byte 2
    RTC_TIMESTAMP_3: 0xFFCA,   // Unix timestamp byte 3 (MSB)

    // Pixel Display // Écran graphique 32x32 pixels monochrome
    PIXEL_DISPLAY_BASE: 0xFFD0,
    PIXEL_X: 0xFFD0,
    PIXEL_Y: 0xFFD1,
    PIXEL_COLOR: 0xFFD2,      // 0=noir, 1=blanc

    // Device 14: Data Disk (0xFFE0-0xFFEF)
    DATA_DISK_BASE: 0xFFE0,
    DATA_DISK_DATA: 0xFFE0,           // Port  0: Read/Write data (RAW)
    DATA_DISK_SIZE_LOW: 0xFFE1,       // Port  1: Get size (RAW) - low
    DATA_DISK_SIZE_HIGH: 0xFFE2,      // Port  2: Get size (RAW) - high
    DATA_DISK_ADDR_LOW: 0xFFE3,       // Port  3: Set address (RAW) - low
    DATA_DISK_ADDR_HIGH: 0xFFE4,      // Port  4: Set address (RAW) - high
    DATA_DISK_FS_STATUS: 0xFFE8,      // Port  8: FS status (nombre de fichiers)
    DATA_DISK_FS_COMMAND: 0xFFE9,     // Port  9: FS command / result
    DATA_DISK_FS_DATA: 0xFFEA,        // Port 10: FS data read/write
    DATA_DISK_FS_FILENAME: 0xFFEB,    // Port 11: FS filename char
    DATA_DISK_FS_HANDLE_LOW: 0xFFEC,  // Port 12: File handle low
    DATA_DISK_FS_HANDLE_HIGH: 0xFFED, // Port 13: File handle high

    // Device 15: Data Disk (0xFFF0-0xFFFF)
    DATA_DISK_2_BASE: 0xFFF0,
    DATA_DISK_2_DATA: 0xFFF0,           // Port  0: Read/Write data (RAW)
    DATA_DISK_2_SIZE_LOW: 0xFFF1,       // Port  1: Get size (RAW) - low
    DATA_DISK_2_SIZE_HIGH: 0xFFF2,      // Port  2: Get size (RAW) - high
    DATA_DISK_2_ADDR_LOW: 0xFFF3,       // Port  3: Set address (RAW) - low
    DATA_DISK_2_ADDR_HIGH: 0xFFF4,      // Port  4: Set address (RAW) - high
    DATA_DISK_2_FS_STATUS: 0xFFF8,      // Port  8: FS status (nombre de fichiers)
    DATA_DISK_2_FS_COMMAND: 0xFFF9,     // Port  9: FS command / result
    DATA_DISK_2_FS_DATA: 0xFFFA,        // Port 10: FS data read/write
    DATA_DISK_2_FS_FILENAME: 0xFFFB,    // Port 11: FS filename char
    DATA_DISK_2_FS_HANDLE_LOW: 0xFFFC,  // Port 12: File handle low
    DATA_DISK_2_FS_HANDLE_HIGH: 0xFFFD, // Port 13: File handle high


    // IRQ //

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
