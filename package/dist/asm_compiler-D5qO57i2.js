var R = /* @__PURE__ */ ((e) => (e[e.NOP = 0] = "NOP", e[e.GET_FREQ = 10] = "GET_FREQ", e[e.SET_FREQ = 11] = "SET_FREQ", e[e.BREAKPOINT_JS = 12] = "BREAKPOINT_JS", e[e.BREAKPOINT = 13] = "BREAKPOINT", e[e.SYSCALL = 14] = "SYSCALL", e[e.HALT = 15] = "HALT", e[e.CORE_HALT = 224] = "CORE_HALT", e[e.CORE_START = 225] = "CORE_START", e[e.CORE_INIT = 226] = "CORE_INIT", e[e.CORE_STATUS = 227] = "CORE_STATUS", e[e.CORES_COUNT = 228] = "CORES_COUNT", e[e.CPU_HALT = 232] = "CPU_HALT", e[e.CPU_START = 233] = "CPU_START", e[e.CPU_INIT = 234] = "CPU_INIT", e[e.CPU_STATUS = 235] = "CPU_STATUS", e[e.CPUS_COUNT = 236] = "CPUS_COUNT", e[e.ADD = 32] = "ADD", e[e.SUB = 33] = "SUB", e[e.AND = 34] = "AND", e[e.OR = 35] = "OR", e[e.XOR = 36] = "XOR", e[e.INC_A = 37] = "INC_A", e[e.DEC_A = 38] = "DEC_A", e[e.INC_B = 39] = "INC_B", e[e.DEC_B = 40] = "DEC_B", e[e.INC_C = 41] = "INC_C", e[e.DEC_C = 42] = "DEC_C", e[e.INC_D = 43] = "INC_D", e[e.DEC_D = 44] = "DEC_D", e[e.PUSH_A = 48] = "PUSH_A", e[e.PUSH_B = 49] = "PUSH_B", e[e.PUSH_C = 50] = "PUSH_C", e[e.PUSH_D = 51] = "PUSH_D", e[e.POP_A = 52] = "POP_A", e[e.POP_B = 53] = "POP_B", e[e.POP_C = 54] = "POP_C", e[e.POP_D = 55] = "POP_D", e[e.GET_SP = 57] = "GET_SP", e[e.SET_SP = 58] = "SET_SP", e[e.CALL = 59] = "CALL", e[e.RET = 60] = "RET", e[e.EI = 61] = "EI", e[e.DI = 62] = "DI", e[e.IRET = 63] = "IRET", e[e.JMP = 64] = "JMP", e[e.JZ = 65] = "JZ", e[e.JNZ = 66] = "JNZ", e[e.JC = 67] = "JC", e[e.JNC = 68] = "JNC", e[e.MOV_AB = 144] = "MOV_AB", e[e.MOV_AC = 145] = "MOV_AC", e[e.MOV_AD = 146] = "MOV_AD", e[e.MOV_BA = 147] = "MOV_BA", e[e.MOV_BC = 148] = "MOV_BC", e[e.MOV_BD = 149] = "MOV_BD", e[e.MOV_CA = 150] = "MOV_CA", e[e.MOV_CB = 151] = "MOV_CB", e[e.MOV_CD = 152] = "MOV_CD", e[e.MOV_DA = 153] = "MOV_DA", e[e.MOV_DB = 154] = "MOV_DB", e[e.MOV_DC = 155] = "MOV_DC", e[e.MOV_A_IMM = 156] = "MOV_A_IMM", e[e.MOV_B_IMM = 157] = "MOV_B_IMM", e[e.MOV_C_IMM = 158] = "MOV_C_IMM", e[e.MOV_D_IMM = 159] = "MOV_D_IMM", e[e.MOV_A_MEM = 160] = "MOV_A_MEM", e[e.MOV_B_MEM = 161] = "MOV_B_MEM", e[e.MOV_C_MEM = 162] = "MOV_C_MEM", e[e.MOV_D_MEM = 163] = "MOV_D_MEM", e[e.MOV_MEM_A = 164] = "MOV_MEM_A", e[e.MOV_MEM_B = 165] = "MOV_MEM_B", e[e.MOV_MEM_C = 166] = "MOV_MEM_C", e[e.MOV_MEM_D = 167] = "MOV_MEM_D", e[e.MOV_A_PTR_CD = 168] = "MOV_A_PTR_CD", e[e.MOV_B_PTR_CD = 169] = "MOV_B_PTR_CD", e[e.MOV_PTR_CD_A = 170] = "MOV_PTR_CD_A", e[e.MOV_PTR_CD_B = 171] = "MOV_PTR_CD_B", e))(R || {});
const G = [
  156,
  157,
  158,
  159,
  14,
  11
  /* SET_FREQ */
], d = [
  64,
  65,
  66,
  67,
  68,
  58,
  59,
  160,
  161,
  162,
  163,
  164,
  165,
  166,
  167
  /* MOV_MEM_D */
], _e = (e) => {
  switch (e) {
    case 0:
      return "NOP";
    case 14:
      return "SYSCALL";
    case 10:
      return "GET FREQ";
    case 11:
      return "SET FREQ";
    case 13:
      return "BREAKPOINT ASM";
    case 12:
      return "BREAKPOINT JS";
    case 15:
      return "HALT";
    case 225:
      return "CORE START";
    case 224:
      return "CORE HALT";
    case 226:
      return "CORE INIT";
    case 227:
      return "CORE STATUS";
    case 228:
      return "CORES COUNT";
    case 233:
      return "CPU START";
    case 232:
      return "CPU HALT";
    case 234:
      return "CPU INIT";
    case 235:
      return "CPU STATUS";
    case 236:
      return "CPUS COUNT";
    case 32:
      return "ADD";
    case 33:
      return "SUB";
    case 34:
      return "AND";
    case 35:
      return "OR";
    case 36:
      return "XOR";
    case 37:
      return "INC A";
    case 38:
      return "DEC A";
    case 39:
      return "INC B";
    case 40:
      return "DEC B";
    case 41:
      return "INC C";
    case 42:
      return "DEC C";
    case 43:
      return "INC D";
    case 44:
      return "DEC D";
    case 64:
      return "JMP";
    case 65:
      return "JZ";
    case 66:
      return "JNZ";
    case 67:
      return "JC";
    case 68:
      return "JNC";
    case 48:
      return "PUSH A";
    case 49:
      return "PUSH B";
    case 50:
      return "PUSH C";
    case 51:
      return "PUSH D";
    case 52:
      return "POP A";
    case 53:
      return "POP B";
    case 54:
      return "POP C";
    case 55:
      return "POP D";
    case 57:
      return "GET SP";
    case 58:
      return "SET SP";
    case 59:
      return "CALL";
    case 60:
      return "RET";
    case 61:
      return "EI";
    case 62:
      return "DI";
    case 63:
      return "IRET";
    case 144:
      return "MOV A B";
    case 145:
      return "MOV A C";
    case 146:
      return "MOV A D";
    case 147:
      return "MOV B A";
    case 148:
      return "MOV B C";
    case 149:
      return "MOV B D";
    case 150:
      return "MOV C A";
    case 151:
      return "MOV C B";
    case 152:
      return "MOV C D";
    case 153:
      return "MOV D A";
    case 154:
      return "MOV D B";
    case 155:
      return "MOV D C";
    case 156:
      return "MOV A IMM";
    case 157:
      return "MOV B IMM";
    case 158:
      return "MOV C IMM";
    case 159:
      return "MOV D IMM";
    case 160:
      return "MOV A MEM";
    case 161:
      return "MOV B MEM";
    case 162:
      return "MOV C MEM";
    case 163:
      return "MOV D MEM";
    case 164:
      return "MOV MEM A";
    case 165:
      return "MOV MEM B";
    case 166:
      return "MOV MEM C";
    case 167:
      return "MOV MEM D";
    case 168:
      return "MOV A PTR_CD";
    case 169:
      return "MOV B PTR_CD";
    case 170:
      return "MOV PTR_CD A";
    case 171:
      return "MOV PTR_CD B";
    default:
      return "???";
  }
}, ae = (e) => {
  switch (e) {
    case 0:
      return "No operation : does nothing, advances PC";
    case 14:
      return "System call : invokes OS service with A as syscall number";
    case 10:
      return "Get frequency : returns current CPU frequency in A";
    case 11:
      return "Set frequency : sets CPU frequency to A";
    case 13:
      return "Breakpoint : triggers debugger breakpoint (assembly)";
    case 12:
      return "Breakpoint JS : triggers JavaScript debugger breakpoint";
    case 15:
      return "Halt : stops CPU execution completely";
    case 225:
      return "Core start : starts execution on specified core";
    case 224:
      return "Core halt : halts execution on specified core";
    case 226:
      return "Core init : initializes core with configuration";
    case 227:
      return "Core status : returns status of specified core in A";
    case 228:
      return "Cores count : returns number of available cores in A";
    case 233:
      return "CPU start : starts execution on specified CPU";
    case 232:
      return "CPU halt : halts execution on specified CPU";
    case 234:
      return "CPU init : initializes CPU with configuration";
    case 235:
      return "CPU status : returns status of specified CPU in A";
    case 236:
      return "CPUs count : returns number of available CPUs in A";
    case 32:
      return "Add : A = A + B (with carry flag update)";
    case 33:
      return "Subtract : A = A - B (with borrow flag update)";
    case 34:
      return "Bitwise AND : A = A & B";
    case 35:
      return "Bitwise OR : A = A | B";
    case 36:
      return "Bitwise XOR : A = A ^ B";
    case 37:
      return "Increment A : A = A + 1";
    case 38:
      return "Decrement A : A = A - 1";
    case 39:
      return "Increment B : B = B + 1";
    case 40:
      return "Decrement B : B = B - 1";
    case 41:
      return "Increment C : C = C + 1";
    case 42:
      return "Decrement C : C = C - 1";
    case 43:
      return "Increment D : D = D + 1";
    case 44:
      return "Decrement D : D = D - 1";
    case 64:
      return "Jump unconditional : PC = address";
    case 65:
      return "Jump if zero : PC = address if Z flag is set";
    case 66:
      return "Jump if not zero : PC = address if Z flag is clear";
    case 67:
      return "Jump if carry : PC = address if C flag is set";
    case 68:
      return "Jump if not carry : PC = address if C flag is clear";
    case 48:
      return "Push A : store A on stack, decrement SP";
    case 49:
      return "Push B : store B on stack, decrement SP";
    case 50:
      return "Push C : store C on stack, decrement SP";
    case 51:
      return "Push D : store D on stack, decrement SP";
    case 52:
      return "Pop A : load A from stack, increment SP";
    case 53:
      return "Pop B : load B from stack, increment SP";
    case 54:
      return "Pop C : load C from stack, increment SP";
    case 55:
      return "Pop D : load D from stack, increment SP";
    case 57:
      return "Get SP : load stack pointer value into A:B";
    case 58:
      return "Set SP : set stack pointer to immediate 16-bit value";
    case 59:
      return "Call subroutine : push return address, jump to address";
    case 60:
      return "Return from subroutine : pop return address into PC";
    case 61:
      return "Enable interrupts : allow hardware interrupts";
    case 62:
      return "Disable interrupts : block hardware interrupts";
    case 63:
      return "Return from interrupt : restore flags and return";
    case 144:
      return "Move A to B : B = A";
    case 145:
      return "Move A to C : C = A";
    case 146:
      return "Move A to D : D = A";
    case 147:
      return "Move B to A : A = B";
    case 148:
      return "Move B to C : C = B";
    case 149:
      return "Move B to D : D = B";
    case 150:
      return "Move C to A : A = C";
    case 151:
      return "Move C to B : B = C";
    case 152:
      return "Move C to D : D = C";
    case 153:
      return "Move D to A : A = D";
    case 154:
      return "Move D to B : B = D";
    case 155:
      return "Move D to C : C = D";
    case 156:
      return "Move immediate to A : A = 8-bit immediate value";
    case 157:
      return "Move immediate to B : B = 8-bit immediate value";
    case 158:
      return "Move immediate to C : C = 8-bit immediate value";
    case 159:
      return "Move immediate to D : D = 8-bit immediate value";
    case 160:
      return "Move memory to A : A = [16-bit address]";
    case 161:
      return "Move memory to B : B = [16-bit address]";
    case 162:
      return "Move memory to C : C = [16-bit address]";
    case 163:
      return "Move memory to D : D = [16-bit address]";
    case 164:
      return "Move A to memory : [16-bit address] = A";
    case 165:
      return "Move B to memory : [16-bit address] = B";
    case 166:
      return "Move C to memory : [16-bit address] = C";
    case 167:
      return "Move D to memory : [16-bit address] = D";
    case 168:
      return "Move indirect to A : A = [[C:D]] (double indirection)";
    case 169:
      return "Move indirect to B : B = [[C:D]] (double indirection)";
    case 170:
      return "Move A to indirect : [C:D] = A";
    case 171:
      return "Move B to indirect : [C:D] = B";
    default:
      return "Unknown instruction";
  }
}, y = (e) => G.includes(e) ? 2 : d.includes(e) ? 3 : 1, ie = (e) => {
  const _ = (Array.isArray(e) ? e : Array.from(e.entries())).sort(([t], [r]) => t - r), n = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set();
  for (const [t, r] of _) {
    if (a.has(t)) {
      n.set(t, !1);
      continue;
    }
    Object.values(R).includes(r) ? (n.set(t, !0), G.includes(r) && a.add(t + 1), d.includes(r) && (a.add(t + 1), a.add(t + 2))) : n.set(t, !1);
  }
  return n;
};
function b(e) {
  return e & 255;
}
function H(e) {
  return e & 65535;
}
function V(e) {
  return b(e >> 8);
}
function L(e) {
  return b(e);
}
function C(e, s = 0) {
  const _ = e.toString(16).toUpperCase();
  let n = _.length % 2 === 0 ? _ : `0${_}`;
  return s && n.length < s && (n = n.padStart(s, "0")), "0x" + n;
}
const E = p({
  // ## ROM ## (0x0000-0x00FF) - 1280 bytes
  ROM_START: 0,
  ROM_END: 1279,
  // ## RAM ## (0x0500-0xEFFF) - ~60KB (OS + PROGRAM + MALLOC + STACK)
  RAM_START: 1280,
  RAM_END: 61439,
  // OS (0x0500-0x0FFF) - ~3KB
  OS_START: 1280,
  OS_END: 4095,
  // PROGRAM + DATA (0x1000-0xECFF) - ~60KB
  PROGRAM_START: 4096,
  PROGRAM_END: 60671,
  // MALLOC (0xED00-0xEDFF) - 256 bytes
  MALLOC_START: 60672,
  MALLOC_HEAP_PTR_LOW: 60672,
  MALLOC_HEAP_PTR_HIGH: 60673,
  MALLOC_DATA_START: 60674,
  MALLOC_END: 60927,
  // STACK (0xEE00-0xEFFF) - 256 bytes
  STACK_START: 60928,
  STACK_END: 61439,
  // STACK BOOTLOADER (0xEE00-0xEE0F) - 16 bytes
  BOOTLOADER_STACK_START: 60928,
  BOOTLOADER_STACK_END: 60943,
  // STACK OS (0xEE10-0xEE7F) - 240 bytes
  OS_STACK_START: 60944,
  OS_STACK_END: 61183,
  // STACK PROGRAMS (0xEF00-0xEFFF) - 256 bytes
  PROGAMS_STACK_START: 61184,
  PROGAMS_STACK_END: 61439,
  // ## I/O Devices ## (0xF000-0xFFFF) - 4096 ports (256 devices x 16 ports)
  IO_START: 61440,
  IO_END: 65535,
  BUS_1_START: 61440,
  //  2048 ports (128 devices x 16 ports)
  BUS_1_END: 63487,
  BUS_2_START: 63488,
  //  2048 ports (128 devices x 16 ports)
  BUS_2_END: 65535,
  // Device 0: OS Disk (0xF000-0xFF0F)
  OS_DISK_BASE: 61440,
  OS_DISK_DATA: 61440,
  // Port  0: Read/Write data (RAW)
  OS_DISK_SIZE_LOW: 61441,
  // Port  1: Get size (RAW)
  OS_DISK_SIZE_HIGH: 61442,
  // Port  2: Get size (RAW)
  OS_DISK_ADDR_LOW: 61443,
  // Port  3: Set address low (RAW)
  OS_DISK_ADDR_HIGH: 61444,
  // Port  4: Set address high (RAW)
  OS_DISK_FS_STATUS: 61448,
  // Port  8: FS status (nombre de fichiers)
  OS_DISK_FS_COMMAND: 61449,
  // Port  9: FS command / result
  OS_DISK_FS_DATA: 61450,
  // Port 10: FS data read/write
  OS_DISK_FS_FILENAME: 61451,
  // Port 11: FS filename char
  OS_DISK_FS_HANDLE_LOW: 61452,
  // Port 12: File handle low
  OS_DISK_FS_HANDLE_HIGH: 61453,
  // Port 13: File handle high
  // Device 1: Program Disk (0xF010-0xF01F)
  PROGRAM_DISK_BASE: 61456,
  PROGRAM_DISK_DATA: 61456,
  // Port  0: Read/Write data (RAW)
  PROGRAM_DISK_LOW_SIZE: 61457,
  // Port  1: Get size (RAW)
  PROGRAM_DISK_HIGH_SIZE: 61458,
  // Port  2: Get size (RAW)
  PROGRAM_DISK_ADDR_LOW: 61459,
  // Port  3: Set address low (RAW)
  PROGRAM_DISK_ADDR_HIGH: 61460,
  // Port  4: Set address high (RAW)
  PROGRAM_DISK_FS_STATUS: 61464,
  // Port  8: FS status (nombre de fichiers)
  PROGRAM_DISK_FS_COMMAND: 61465,
  // Port  9: FS command / result
  PROGRAM_DISK_FS_DATA: 61466,
  // Port 10: FS data read/write
  PROGRAM_DISK_FS_FILENAME: 61467,
  // Port 11: FS filename char
  PROGRAM_DISK_FS_HANDLE_LOW: 61468,
  // Port 12: File handle low
  PROGRAM_DISK_FS_HANDLE_HIGH: 61469,
  // Port 13: File handle high
  // Timer
  TIMER_BASE: 61472,
  TIMER_COUNTER: 61472,
  // Lecture seule: compteur incrémenté à chaque cycle
  TIMER_CONTROL: 61473,
  // Écriture: 0=stop, 1=start, 2=reset
  TIMER_PRESCALER: 61474,
  // Diviseur de fréquence
  TIMER_TICK: 61475,
  // Declenchement de tick
  // Device 3: LEDs
  LEDS_BASE: 61488,
  LEDS_OUTPUT: 61488,
  // 8 LEDs (chaque bit = une LED)
  // Interrupt Controller (0xF040-0xF04F)
  INTERRUPT_BASE: 61504,
  INTERRUPT_ENABLE: 61504,
  // R/W - Activer/désactiver IRQs (bitmask)
  INTERRUPT_PENDING: 61505,
  // R   - IRQs en attente (read-only pour CPU)
  INTERRUPT_ACK: 61506,
  // W   - Acquitter une IRQ (write-only)
  INTERRUPT_MASK: 61507,
  // R/W - Masquer des IRQs temporairement
  INTERRUPT_HANDLER_LOW: 61508,
  // R/W - Adresse handler (low byte)
  INTERRUPT_HANDLER_HIGH: 61509,
  // R/W - Adresse handler (high byte)
  INTERRUPT_CPU_HANDLER: 61510,
  // R/W - CPU handler
  INTERRUPT_CORE_HANDLER: 61511,
  // R/W - Core handler
  // Device 5: Keyboard
  KEYBOARD_BASE: 61520,
  KEYBOARD_DATA: 61520,
  // Dernier caractère tapé (ASCII)
  KEYBOARD_STATUS: 61521,
  // Bit 0: touche disponible
  // Device 6: Afficheur 7 Segments
  SEVEN_SEG_BASE: 61536,
  SEVEN_SEG_DATA: 61536,
  // Chiffre à afficher (0-15 pour 0-F)
  SEVEN_SEG_RAW: 61537,
  // Contrôle direct des segments (bits)
  // Console // Affichage de texte comme un terminal
  CONSOLE_BASE: 61552,
  CONSOLE_CHAR: 61552,
  // Écrire un caractère ASCII
  CONSOLE_CLEAR: 61553,
  // Clear screen
  // Buzzer // Génère des sons simples
  BUZZER_FREQ: 61568,
  // Fréquence (0-255)
  BUZZER_DURATION: 61569,
  // Durée en ms
  // GPIO (8 pins digitaux) // Simuler des entrées/sorties comme Arduino
  GPIO_OUTPUT: 61584,
  // 8 bits de sortie
  GPIO_INPUT: 61585,
  // 8 bits d'entrée
  GPIO_DIRECTION: 61586,
  // 0=input, 1=output
  // LCD Display (16x2) // Écran LCD classique type Arduino
  LCD_BASE: 61600,
  LCD_DATA: 61600,
  // Caractère à écrire
  LCD_COMMAND: 61601,
  // Commandes (clear, home, etc)
  LCD_CURSOR: 61602,
  // Position curseur
  // === RNG (0xF0B0-0xF0BF) ===
  RNG_BASE: 61616,
  RNG_OUTPUT: 61616,
  // Nombre aléatoire 0-255
  RNG_SEED: 61617,
  // Définir seed
  // === RTC (0xF0C0-0xF0CF) ===
  RTC_BASE: 61632,
  RTC_YEARS: 61633,
  // Secondes (0-59)
  RTC_MONTHS: 61634,
  // Secondes (0-59)
  RTC_DAYS: 61635,
  // Secondes (0-59)
  RTC_HOURS: 61636,
  // Secondes (0-59)
  RTC_MINUTES: 61637,
  // Minutes (0-59)
  RTC_SECONDS: 61638,
  // Heures (0-23)
  RTC_TIMESTAMP_0: 61639,
  // Unix timestamp byte 0 (LSB)
  RTC_TIMESTAMP_1: 61640,
  // Unix timestamp byte 1
  RTC_TIMESTAMP_2: 61641,
  // Unix timestamp byte 2
  RTC_TIMESTAMP_3: 61642,
  // Unix timestamp byte 3 (MSB)
  // Pixel Display // Écran graphique 32x32 pixels monochrome
  PIXEL_DISPLAY_BASE: 61648,
  PIXEL_X: 61648,
  PIXEL_Y: 61649,
  PIXEL_COLOR: 61650,
  // 0=noir, 1=blanc
  // Device 14: Data Disk (0xF0E0-0xF0EF)
  DATA_DISK_BASE: 61664,
  DATA_DISK_DATA: 61664,
  // Port  0: Read/Write data (RAW)
  DATA_DISK_SIZE_LOW: 61665,
  // Port  1: Get size (RAW) - low
  DATA_DISK_SIZE_HIGH: 61666,
  // Port  2: Get size (RAW) - high
  DATA_DISK_ADDR_LOW: 61667,
  // Port  3: Set address (RAW) - low
  DATA_DISK_ADDR_HIGH: 61668,
  // Port  4: Set address (RAW) - high
  DATA_DISK_FS_STATUS: 61672,
  // Port  8: FS status (nombre de fichiers)
  DATA_DISK_FS_COMMAND: 61673,
  // Port  9: FS command / result
  DATA_DISK_FS_DATA: 61674,
  // Port 10: FS data read/write
  DATA_DISK_FS_FILENAME: 61675,
  // Port 11: FS filename char
  DATA_DISK_FS_HANDLE_LOW: 61676,
  // Port 12: File handle low
  DATA_DISK_FS_HANDLE_HIGH: 61677,
  // Port 13: File handle high
  // Device 15: Data Disk (0xF0F0-0xF0FF)
  DATA_DISK_2_BASE: 61680,
  DATA_DISK_2_DATA: 61680,
  // Port  0: Read/Write data (RAW)
  DATA_DISK_2_SIZE_LOW: 61681,
  // Port  1: Get size (RAW) - low
  DATA_DISK_2_SIZE_HIGH: 61682,
  // Port  2: Get size (RAW) - high
  DATA_DISK_2_ADDR_LOW: 61683,
  // Port  3: Set address (RAW) - low
  DATA_DISK_2_ADDR_HIGH: 61684,
  // Port  4: Set address (RAW) - high
  DATA_DISK_2_FS_STATUS: 61688,
  // Port  8: FS status (nombre de fichiers)
  DATA_DISK_2_FS_COMMAND: 61689,
  // Port  9: FS command / result
  DATA_DISK_2_FS_DATA: 61690,
  // Port 10: FS data read/write
  DATA_DISK_2_FS_FILENAME: 61691,
  // Port 11: FS filename char
  DATA_DISK_2_FS_HANDLE_LOW: 61692,
  // Port 12: File handle low
  DATA_DISK_2_FS_HANDLE_HIGH: 61693,
  // Port 13: File handle high
  // Device 16: Data Disk (0xF100-0xF10F)
  SWAP_DISK_BASE: 61696,
  SWAP_DISK_DATA: 61696,
  // Port  0: Read/Write data (RAW)
  SWAP_DISK_SIZE_LOW: 61697,
  // Port  1: Get size (RAW) - low
  SWAP_DISK_SIZE_HIGH: 61698,
  // Port  2: Get size (RAW) - high
  SWAP_DISK_ADDR_LOW: 61699,
  // Port  3: Set address (RAW) - low
  SWAP_DISK_ADDR_HIGH: 61700,
  // Port  4: Set address (RAW) - high
  SWAP_DISK_FS_STATUS: 61704,
  // Port  8: FS status (nombre de fichiers)
  SWAP_DISK_FS_COMMAND: 61705,
  // Port  9: FS command / result
  SWAP_DISK_FS_DATA: 61706,
  // Port 10: FS data read/write
  SWAP_DISK_FS_FILENAME: 61707,
  // Port 11: FS filename char
  SWAP_DISK_FS_HANDLE_LOW: 61708,
  // Port 12: File handle low
  SWAP_DISK_FS_HANDLE_HIGH: 61709,
  // Port 13: File handle high
  // Device 17: DMA (0xF110-0xF11F) // Direct Memory Access
  DMA_BASE: 61712
}), ue = p({
  // IRQ Sources (pour référence)
  IRQ_TIMER: 0,
  // Bit 0 - Timer
  IRQ_KEYBOARD: 1,
  // Bit 1 - Clavier
  IRQ_DISK: 2,
  // Bit 2 - Disque
  IRQ_UART: 3,
  // Bit 3 - UART/Console
  IRQ_BUTTON: 4
  // Bit 4 - Boutons UI
  // Bits 5-7 réservés
});
function p(e) {
  return Object.fromEntries(
    Object.entries(e).map(([s, _]) => [s, _])
  );
}
const Ae = (e) => e >= E.ROM_START && e <= E.ROM_END, oe = (e) => e >= E.OS_START && e <= E.STACK_END, ce = (e) => e >= E.IO_START && e <= E.IO_END, Se = (e) => b(e - E.IO_START);
async function v(e) {
  e.endsWith(".ts");
  const s = await fetch(`/asm/${e}`);
  return s.ok ? await s.text() : "";
}
async function k() {
  return await F(re);
}
function Z() {
  return $(ne);
}
async function Y(e, s = 0) {
  const _ = await v(e);
  return await F(_, s);
}
async function F(e, s = 0) {
  const _ = await W(e, s);
  return J(_.code);
}
function J(e) {
  const s = e.map((t) => [
    t[0],
    new Function("Opcode", "return " + t[1])(R)
  ]), _ = new Map(s), n = e.map((t) => [t[0], t[2]]), a = e.map((t) => [t[0], t[3]]);
  return { code: _, comments: n, labels: a };
}
async function x(e, s = 0, _ = 0, n = [], a = /* @__PURE__ */ new Map()) {
  const t = await v(e);
  return await W(t, s, _, n, a);
}
async function W(e, s = 0, _ = 0, n = [], a = /* @__PURE__ */ new Map()) {
  const t = Q(e);
  return await z(t, s, _, n, a);
}
function Q(e) {
  var a, t;
  const s = e.split(`
`).filter((r) => r.trim() && !r.trim().startsWith(";")), _ = [];
  for (const r of s) {
    const A = r.split(";"), M = ((a = A[0]) == null ? void 0 : a.trim()) || "", c = ((t = A.slice(1)) == null ? void 0 : t.join(";").trim()) || "", l = j(M), m = {
      opcode: l[0] || -1,
      params: l.slice(1),
      comment: c
    };
    _.push(m);
  }
  return _.map(q);
}
function j(e) {
  if (!e.includes('"'))
    return e.split(" ");
  const s = e.split('"'), [_, n, a] = s, t = "__string_replacement__";
  return [_, t, a].join("").split(" ").map((c) => c.replace(t, `"${n}"`));
}
function X(e, s, _ = !0, n = !0) {
  const a = [];
  for (const t of e.split("")) {
    const r = [
      s,
      C(t.charCodeAt(0)),
      t,
      []
    ];
    a.push(r), s++;
  }
  if (_) {
    const t = [
      s,
      C(10),
      `
`,
      []
    ];
    a.push(t), s++;
  }
  if (n) {
    const t = [
      s,
      "0x00",
      "\\0",
      []
    ];
    a.push(t), s++;
  }
  return a;
}
async function z(e, s, _, n = [], a = /* @__PURE__ */ new Map()) {
  const t = [];
  let r = _, A = [];
  const M = [], c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map();
  for (const P of e) {
    const { opcode: S, params: T, comment: O } = P;
    let i = T[0];
    if (S.startsWith(".")) {
      if (S === ".string" || S === ".ascii") {
        const u = A.at(-1);
        if (!u)
          throw new Error(`Label not found for string "${u}"`);
        const I = i.slice(1, -1), g = X(I, r, S === ".string");
        t.push(...g), l.set(u, H(s + r)), r = H(r + g.length);
      }
      A = [];
      continue;
    }
    if (S.endsWith(":")) {
      const u = S.slice(0, -1);
      if (a.get(u) || m.get(u))
        throw new Error(`Duplicate Label "${u}"`);
      A.push(u);
      continue;
    }
    if (S.startsWith("@")) {
      const u = S.slice(1);
      u === "include" && (n.includes(i) || M.push(i)), u === "define8" && c.set(i, { bytes: 8, value: T[1] }), u === "define16" && c.set(i, { bytes: 16, value: T[1] });
      continue;
    }
    for (const u of A)
      m.set(u, r);
    const B = [
      r,
      `Opcode.${S}`,
      O,
      A
    ];
    t.push(B), r++, A = [];
    const o = R[S], w = y(o) - 1;
    if (w === 0)
      continue;
    const K = [R.CALL, R.JMP, R.JC, R.JNC, R.JNZ, R.JZ].includes(o);
    let f = null;
    if (i !== void 0 && (i.startsWith("<") || i.startsWith(">")) && (f = i.startsWith("<") ? "low" : "high", i = i.slice(1)), i.startsWith("$")) {
      if (i = i.slice(1), K) {
        const D = i;
        t.push([r, "<$" + D, "", []]), r++, t.push([r, ">$" + D, "", []]), r++;
        continue;
      }
      const u = c.get(i);
      if (u !== void 0) {
        u.bytes === 8 ? (t.push([r, C(b(Number(u.value))), "", []]), r++) : u.bytes === 16 && ((f === null || f === "low") && (t.push([r, C(L(Number(u.value))), "", []]), r++), (f === null || f === "high") && (t.push([r, C(V(Number(u.value))), "", []]), r++));
        continue;
      }
      const I = l.get(i);
      if (I !== void 0) {
        if (f === "low") {
          const D = [
            r,
            C(L(I)),
            `Address of String $${i} (low)`,
            []
          ];
          t.push(D), r++;
        } else if (f === "high") {
          const D = [
            r,
            C(V(I)),
            `Address of String $${i} (high)`,
            []
          ];
          t.push(D), r++;
        } else {
          const D = [
            r,
            C(L(I)),
            `Address of String $${i} (low)`,
            []
          ];
          t.push(D), r++;
          const g = [
            r,
            C(V(I)),
            `Address of String $${i} (high)`,
            []
          ];
          t.push(g), r++;
        }
        continue;
      }
      throw new Error("Unknown error with $");
    }
    for (let u = 1; u <= w; u++) {
      const I = u === 1 ? L(Number(i)) : V(Number(i)), D = [
        r,
        C(I),
        "",
        []
      ];
      t.push(D), r++;
    }
  }
  const N = [], h = /* @__PURE__ */ new Map();
  for (const P of M) {
    const S = [...n, ...M, ...N], T = new Map([...a, ...m, ...h]), O = await x(P, s, H(r), S, T), i = O.code.at(-1);
    if (N.push(...O.includedFiles), O.codeLabels.forEach((B, o) => h.set(o, B)), !i) {
      console.log("Erreur compilation include");
      break;
    }
    r = H(i[0] + 2), t.push(...O.code);
  }
  M.push(...N);
  const U = new Set(a.keys());
  for (const P of t) {
    let S = P[3];
    if (S)
      for (const T of S) {
        if (U.has(T))
          throw new Error(`Duplicate label "${T}"`);
        U.add(T);
      }
  }
  return { code: t.map((P) => {
    let S = P[0], T = P[1], O = P[2], i = P[3], B = null, o = T;
    if (o.startsWith("<") || o.startsWith(">"))
      if (o.startsWith("<") ? (o = o.slice(1), B = "low") : o.startsWith(">") && (o = o.slice(1), B = "high"), o.startsWith("$")) {
        o = o.slice(1);
        const K = o, f = t.find((D) => D[3] && D[3].includes(K));
        if (!f)
          throw new Error(`Instruction not found for label ${K}`);
        const u = f[0] + s, I = B === "low" ? L(u) : V(u);
        T = C(I);
      } else if (o.startsWith("@"))
        o = o.slice(1);
      else
        throw new Error(`Action not found for label ${o}`);
    return [
      S,
      T,
      O,
      i
    ];
  }), includedFiles: M, codeLabels: m };
}
function q(e) {
  let s = e.params;
  for (let _ = 0; _ < s.length; _++) {
    let n = s[_], a = null;
    if (n.startsWith("<") ? (a = "low", n = n.slice(1)) : n.startsWith(">") && (a = "high", n = n.slice(1)), n = n.replace("@", "MEMORY_MAP."), n !== "" && n.includes("MEMORY_MAP.")) {
      const t = /MEMORY_MAP\.(\w+)/g;
      let r, A = n;
      for (; (r = t.exec(n)) !== null; ) {
        const M = r[0], c = r[1];
        if (c && c in E) {
          const l = E[c];
          A = A.replace(M, l.toString());
        } else {
          console.warn("Bad substitution");
          break;
        }
      }
      try {
        const M = new Function("MEMORY_MAP", "return " + A)(E);
        n = C(M), a === "low" && (n = L(Number(n)).toString()), a === "high" && (n = V(Number(n)).toString()), s[_] = n;
      } catch {
        debugger;
        console.warn(`Could not evaluate expression: ${A}`);
      }
    }
  }
  return {
    opcode: e.opcode,
    params: s,
    comment: e.comment
  };
}
function $(e) {
  const s = ee(e);
  return te(s);
}
function ee(e) {
  const s = [], _ = E.PROGRAM_START;
  for (let n = 0; n < e.length; n++) {
    const a = e[n], t = a[0] + _;
    if (a[1].split(".")[0] !== "Opcode")
      throw new Error(`Invalid instruction at line ${t}`);
    const A = a[1].replace("Opcode.", ""), M = R[A], c = y(M) - 1;
    let l = null;
    if (c) {
      l = 0;
      for (let N = 1; N <= c; N++) {
        n++;
        const h = Number(e[n][1]), U = N === 1 ? L(h) : h << 8;
        l += U;
      }
    }
    const m = {
      line: C(t),
      opcode: A,
      value: l === null ? null : C(l)
    };
    s.push(m);
  }
  return s;
}
function te(e) {
  let s = "";
  for (const _ of e) {
    const { line: n, opcode: a, value: t } = _;
    let r = "";
    if (t !== null) {
      const A = parseInt(t.replace("0x", ""), 16);
      if (r = t, A >= 256) {
        for (const [c, l] of Object.entries(E))
          if (!c.startsWith("IRQ_") && l === A) {
            r = `MEMORY_MAP.${c}`;
            break;
          }
      }
    }
    s += `${n} ${a} ${r}
`;
  }
  return s.trim();
}
const re = `
:INIT
    SET_SP MEMORY_MAP.STACK_END
    MOV_A_IMM 0x01 ; Commande clear
    MOV_MEM_A MEMORY_MAP.LCD_COMMAND

:START
    CALL $LEDS_ON
    MOV_A_IMM 0x0f
    CALL $WAIT_LOOP
    CALL $LEDS_OFF
    JMP END

:LEDS_ON
    MOV_A_IMM 0xff
    MOV_MEM_A MEMORY_MAP.LEDS_BASE
    RET

:LEDS_OFF
    MOV_A_IMM 0x00
    MOV_MEM_A MEMORY_MAP.LEDS_BASE
    RET

:WAIT_LOOP
    DEC_A
    JNZ $WAIT_LOOP
    RET

:END
    SYSCALL 60
`, ne = [
  [1, "Opcode.SET_SP"],
  [2, "0xff"],
  [3, "0xfe"],
  [4, "Opcode.MOV_A_IMM"],
  [5, "0x1"],
  [6, "Opcode.MOV_MEM_A"],
  [7, "0xa1"],
  [8, "0xff"],
  [9, "Opcode.MOV_D_IMM"],
  [10, "0x0"],
  [11, "Opcode.MOV_A_IMM"],
  [12, "0x2"],
  [13, "Opcode.MOV_MEM_A"],
  [14, "0xa1"],
  [15, "0xff"],
  [16, "Opcode.JMP"],
  [17, "0x0"],
  [18, "0x5"]
], Me = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  compileCode: F,
  compileDemo: k,
  compileFile: Y,
  decompileCode: $,
  decompileDemo: Z,
  finalizeCompilation: J,
  loadSourceCodeFromFile: v,
  preCompileCode: W,
  preCompileFile: x
}, Symbol.toStringTag, { value: "Module" }));
export {
  G as I,
  E as M,
  R as O,
  H as U,
  d as a,
  ue as b,
  Me as c,
  ae as d,
  _e as e,
  J as f,
  y as g,
  oe as h,
  ce as i,
  Ae as j,
  b as k,
  V as l,
  Se as m,
  L as n,
  ie as o,
  W as p,
  Y as q,
  v as r,
  F as s,
  C as t
};
