


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

import type { u16, u8 } from "@/types/cpu.types";
import { U16, U8 } from "./integers";


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

    // PROGRAM + DATA (0x1000-0xFDFF) - ~60KB
    PROGRAM_START: 0x1000,
    PROGRAM_END: 0xFDFF,

    // STACK (0xFE00-0xFEFF) - 256 bytes
    STACK_START: 0xFE00,
    STACK_END: 0xFEFF,


    // ## I/O Devices ## (0xFF00-0xFFFF) - 256 ports

    IO_START: 0xFF00,
    IO_END: 0xFFFF,

    // Device 0: OS Disk (0xFF00-0xFF0F)
    OS_DISK_BASE: 0xFF00,
    OS_DISK_DATA: 0xFF00,           // Port 0: Read/Write data (RAW)
    OS_DISK_SIZE: 0xFF01,           // Port 1: Get size (RAW)
    OS_DISK_ADDR_LOW: 0xFF02,       // Port 2: Set address low (RAW)
    OS_DISK_ADDR_HIGH: 0xFF03,      // Port 3: Set address high (RAW)
    OS_DISK_FS_STATUS: 0xFF04,      // Port 4: FS status (nombre de fichiers)
    OS_DISK_FS_COMMAND: 0xFF05,     // Port 5: FS command / result
    OS_DISK_FS_DATA: 0xFF06,        // Port 6: FS data read/write
    OS_DISK_FS_FILENAME: 0xFF07,    // Port 7: FS filename char
    OS_DISK_FS_HANDLE_LOW: 0xFF08,  // Port 8: File handle low
    OS_DISK_FS_HANDLE_HIGH: 0xFF09, // Port 9: File handle high

    // Device 1: Program Disk (0xFF10-0xFF1F)
    PROGRAM_DISK_BASE: 0xFF10,
    PROGRAM_DISK_DATA: 0xFF10,
    PROGRAM_DISK_SIZE: 0xFF11,
    PROGRAM_DISK_ADDR_LOW: 0xFF12,
    PROGRAM_DISK_ADDR_HIGH: 0xFF13,
    PROGRAM_DISK_FS_STATUS: 0xFF14,
    PROGRAM_DISK_FS_COMMAND: 0xFF15,
    PROGRAM_DISK_FS_DATA: 0xFF16,
    PROGRAM_DISK_FS_FILENAME: 0xFF17,
    PROGRAM_DISK_FS_HANDLE_LOW: 0xFF18,
    PROGRAM_DISK_FS_HANDLE_HIGH: 0xFF19,

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
    RNG_BASE: 0xFFB0 as u16,
    RNG_OUTPUT: 0xFFB0 as u16,        // Nombre aléatoire 0-255
    RNG_SEED: 0xFFB1 as u16,          // Définir seed

    // === RTC (0xFFC0-0xFFCF) ===
    RTC_BASE: 0xFFC0 as u16,
    RTC_YEARS: 0xFFC1 as u16,         // Secondes (0-59)
    RTC_MONTHS: 0xFFC2 as u16,        // Secondes (0-59)
    RTC_DAYS: 0xFFC3 as u16,          // Secondes (0-59)
    RTC_HOURS: 0xFFC4 as u16,         // Secondes (0-59)
    RTC_MINUTES: 0xFFC5 as u16,       // Minutes (0-59)
    RTC_SECONDS: 0xFFC6 as u16,       // Heures (0-23)
    RTC_TIMESTAMP_0: 0xFFC7 as u16,   // Unix timestamp byte 0 (LSB)
    RTC_TIMESTAMP_1: 0xFFC8 as u16,   // Unix timestamp byte 1
    RTC_TIMESTAMP_2: 0xFFC9 as u16,   // Unix timestamp byte 2
    RTC_TIMESTAMP_3: 0xFFCA as u16,   // Unix timestamp byte 3 (MSB)

    // Pixel Display // Écran graphique 32x32 pixels monochrome
    PIXEL_DISPLAY_BASE: 0xFFD0,
    PIXEL_X: 0xFFD0,
    PIXEL_Y: 0xFFD1,
    PIXEL_COLOR: 0xFFD2,      // 0=noir, 1=blanc

    // UART/Serial Port // Communication série simulée
    UART_TX: 0xFFE0,          // Transmettre
    UART_RX: 0xFFE1,          // Recevoir
    UART_STATUS: 0xFFE2,      // Buffer status

    // Device 15: Data Disk (0xFFF0-0xFFFF)
    DATA_DISK_BASE: 0xFFF0,
    DATA_DISK_DATA: 0xFFF0,
    DATA_DISK_SIZE: 0xFFF1,
    DATA_DISK_ADDR_LOW: 0xFFF2,
    DATA_DISK_ADDR_HIGH: 0xFFF3,
    DATA_DISK_FS_STATUS: 0xFFF4,
    DATA_DISK_FS_COMMAND: 0xFFF5,
    DATA_DISK_FS_DATA: 0xFFF6,
    DATA_DISK_FS_FILENAME: 0xFFF7,
    DATA_DISK_FS_HANDLE_LOW: 0xFFF8,
    DATA_DISK_FS_HANDLE_HIGH: 0xFFF9,


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
