


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
    INTERRUPT_HANDLER: 0xFF44,    // R/W - Adresse du handler (optionnel)

    // Device 5: Keyboard
    KEYBOARD_DATA: 0xFF50,    // Dernier caractère tapé (ASCII)
    KEYBOARD_STATUS: 0xFF51,  // Bit 0: touche disponible

    // Device 6: Afficheur 7 Segments
    SEVEN_SEG_BASE: 0xFF60,
    SEVEN_SEG_DATA: 0xFF60,  // Chiffre à afficher (0-15 pour 0-F)
    SEVEN_SEG_RAW: 0xFF61,   // Contrôle direct des segments (bits)

    // Console // Affichage de texte comme un terminal
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
    LCD_DATA: 0xFFA0,         // Caractère à écrire
    LCD_COMMAND: 0xFFA1,      // Commandes (clear, home, etc)
    LCD_CURSOR: 0xFFA2,       // Position curseur

    // RNG // Random Number Generator
    RNG_OUTPUT: 0xFFB0,       // Nombre aléatoire 0-255
    RNG_SEED: 0xFFB1,         // Définir seed

    // RTC // Real-Time Clock
    RTC_SECONDS: 0xFFC0,
    RTC_MINUTES: 0xFFC1,
    RTC_HOURS: 0xFFC2,

    // Pixel Display // Écran graphique 32x32 pixels monochrome
    PIXEL_X: 0xFFD0,
    PIXEL_Y: 0xFFD1,
    PIXEL_COLOR: 0xFFD2,      // 0=noir, 1=blanc

    // UART/Serial Port // Communication série simulée
    UART_TX: 0xFFE0,          // Transmettre
    UART_RX: 0xFFE1,          // Recevoir
    UART_STATUS: 0xFFE2,      // Buffer status

    // ADC (Analog-to-Digital) // Lecture de valeurs analogiques simulées
    ADC_CHANNEL: 0xFFF0,      // Sélection canal 0-7
    ADC_VALUE: 0xFFF1,        // Valeur lue (0-255)


    // IRQ Sources (pour référence)
    IRQ_TIMER: 0,      // Bit 0 - Timer
    IRQ_KEYBOARD: 1,   // Bit 1 - Clavier
    IRQ_DISK: 2,       // Bit 2 - Disque
    IRQ_UART: 3,       // Bit 3 - UART/Console
    IRQ_BUTTON: 4,     // Bit 4 - Boutons UI
    // Bits 5-7 réservés

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

