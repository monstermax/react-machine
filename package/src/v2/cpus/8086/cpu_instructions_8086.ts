
import type { u16, u8 } from "@/types/cpu.types";

// 8086 instruction set - Architecture 16-bit avec segmentation
// Références:
// - https://www.intel.com/content/dam/www/public/us/en/documents/manuals/64-ia-32-architectures-software-developer-vol-2a-manual.pdf
// - https://www.eng.auburn.edu/~sylee/ee2220/8086_instruction_set.html
// - http://www.gabrielececchetti.it/Teaching/CalcolatoriElettronici/Docs/i8086_instruction_set.pdf

/**
 * ATTENTION: Le 8086 est BEAUCOUP plus complexe que le Z80 !
 * 
 * - Architecture 16-bit (vs 8-bit du Z80)
 * - Adressage 20-bit via SEGMENTATION (CS, DS, ES, SS)
 * - Registres 16-bit : AX, BX, CX, DX (divisibles en AH/AL, BH/BL, etc.)
 * - Modes d'adressage multiples (direct, indirect, indexed, based+indexed, etc.)
 * - ~90 opcodes de base × modes = ~400+ variantes
 * 
 * Ce fichier est SIMPLIFIÉ. L'implémentation complète nécessite:
 * - Gestion de la segmentation (Adresse = Segment × 16 + Offset)
 * - ModR/M byte (décode source/destination et mode)
 * - Calcul d'adresses effectives complexe
 * - Préfixes (segment override, repeat, lock)
 */

export enum Opcode8086 {
    // === Data Transfer (0x88-0x8F, 0xA0-0xA3, 0xB0-0xBF) ===

    // MOV reg/mem, reg/mem (8-bit)
    MOV_RM8_R8 = 0x88,      // MOV r/m8, r8
    MOV_RM16_R16 = 0x89,    // MOV r/m16, r16
    MOV_R8_RM8 = 0x8A,      // MOV r8, r/m8
    MOV_R16_RM16 = 0x8B,    // MOV r16, r/m16

    // MOV avec segment registers
    MOV_RM16_SEG = 0x8C,    // MOV r/m16, Sreg
    MOV_SEG_RM16 = 0x8E,    // MOV Sreg, r/m16

    // MOV accumulator direct
    MOV_AL_MOFFS8 = 0xA0,   // MOV AL, [addr]
    MOV_AX_MOFFS16 = 0xA1,  // MOV AX, [addr]
    MOV_MOFFS8_AL = 0xA2,   // MOV [addr], AL
    MOV_MOFFS16_AX = 0xA3,  // MOV [addr], AX

    // MOV immediate to register
    MOV_AL_IMM8 = 0xB0,     // MOV AL, imm8
    MOV_CL_IMM8 = 0xB1,     // MOV CL, imm8
    MOV_DL_IMM8 = 0xB2,     // MOV DL, imm8
    MOV_BL_IMM8 = 0xB3,     // MOV BL, imm8
    MOV_AH_IMM8 = 0xB4,     // MOV AH, imm8
    MOV_CH_IMM8 = 0xB5,     // MOV CH, imm8
    MOV_DH_IMM8 = 0xB6,     // MOV DH, imm8
    MOV_BH_IMM8 = 0xB7,     // MOV BH, imm8

    MOV_AX_IMM16 = 0xB8,    // MOV AX, imm16
    MOV_CX_IMM16 = 0xB9,    // MOV CX, imm16
    MOV_DX_IMM16 = 0xBA,    // MOV DX, imm16
    MOV_BX_IMM16 = 0xBB,    // MOV BX, imm16
    MOV_SP_IMM16 = 0xBC,    // MOV SP, imm16
    MOV_BP_IMM16 = 0xBD,    // MOV BP, imm16
    MOV_SI_IMM16 = 0xBE,    // MOV SI, imm16
    MOV_DI_IMM16 = 0xBF,    // MOV DI, imm16

    // PUSH/POP
    PUSH_ES = 0x06,
    POP_ES = 0x07,
    PUSH_CS = 0x0E,
    PUSH_SS = 0x16,
    POP_SS = 0x17,
    PUSH_DS = 0x1E,
    POP_DS = 0x1F,

    PUSH_AX = 0x50,
    PUSH_CX = 0x51,
    PUSH_DX = 0x52,
    PUSH_BX = 0x53,
    PUSH_SP = 0x54,
    PUSH_BP = 0x55,
    PUSH_SI = 0x56,
    PUSH_DI = 0x57,

    POP_AX = 0x58,
    POP_CX = 0x59,
    POP_DX = 0x5A,
    POP_BX = 0x5B,
    POP_SP = 0x5C,
    POP_BP = 0x5D,
    POP_SI = 0x5E,
    POP_DI = 0x5F,

    // XCHG
    XCHG_AX_CX = 0x91,
    XCHG_AX_DX = 0x92,
    XCHG_AX_BX = 0x93,
    XCHG_AX_SP = 0x94,
    XCHG_AX_BP = 0x95,
    XCHG_AX_SI = 0x96,
    XCHG_AX_DI = 0x97,

    // IN/OUT
    IN_AL_IMM8 = 0xE4,      // IN AL, imm8
    IN_AX_IMM8 = 0xE5,      // IN AX, imm8
    OUT_IMM8_AL = 0xE6,     // OUT imm8, AL
    OUT_IMM8_AX = 0xE7,     // OUT imm8, AX
    IN_AL_DX = 0xEC,        // IN AL, DX
    IN_AX_DX = 0xED,        // IN AX, DX
    OUT_DX_AL = 0xEE,       // OUT DX, AL
    OUT_DX_AX = 0xEF,       // OUT DX, AX

    // LEA, LDS, LES
    LEA = 0x8D,             // LEA r16, m16 (Load Effective Address)
    LDS = 0xC5,             // LDS r16, m32 (Load DS:reg)
    LES = 0xC4,             // LES r16, m32 (Load ES:reg)

    // === Arithmetic (0x00-0x05, 0x28-0x2D, 0x80-0x83, 0xD0-0xD3, 0xF6-0xF7) ===

    // ADD
    ADD_RM8_R8 = 0x00,      // ADD r/m8, r8
    ADD_RM16_R16 = 0x01,    // ADD r/m16, r16
    ADD_R8_RM8 = 0x02,      // ADD r8, r/m8
    ADD_R16_RM16 = 0x03,    // ADD r16, r/m16
    ADD_AL_IMM8 = 0x04,     // ADD AL, imm8
    ADD_AX_IMM16 = 0x05,    // ADD AX, imm16

    // SUB
    SUB_RM8_R8 = 0x28,      // SUB r/m8, r8
    SUB_RM16_R16 = 0x29,    // SUB r/m16, r16
    SUB_R8_RM8 = 0x2A,      // SUB r8, r/m8
    SUB_R16_RM16 = 0x2B,    // SUB r16, r/m16
    SUB_AL_IMM8 = 0x2C,     // SUB AL, imm8
    SUB_AX_IMM16 = 0x2D,    // SUB AX, imm16

    // CMP
    CMP_RM8_R8 = 0x38,      // CMP r/m8, r8
    CMP_RM16_R16 = 0x39,    // CMP r/m16, r16
    CMP_R8_RM8 = 0x3A,      // CMP r8, r/m8
    CMP_R16_RM16 = 0x3B,    // CMP r16, r/m16
    CMP_AL_IMM8 = 0x3C,     // CMP AL, imm8
    CMP_AX_IMM16 = 0x3D,    // CMP AX, imm16

    // INC/DEC register
    INC_AX = 0x40,
    INC_CX = 0x41,
    INC_DX = 0x42,
    INC_BX = 0x43,
    INC_SP = 0x44,
    INC_BP = 0x45,
    INC_SI = 0x46,
    INC_DI = 0x47,

    DEC_AX = 0x48,
    DEC_CX = 0x49,
    DEC_DX = 0x4A,
    DEC_BX = 0x4B,
    DEC_SP = 0x4C,
    DEC_BP = 0x4D,
    DEC_SI = 0x4E,
    DEC_DI = 0x4F,

    // MUL/DIV/IDIV (nécessitent ModR/M byte)
    // Groupe 0xF6-0xF7 (opcode + ModR/M)

    // === Logic (0x20-0x27, 0x84-0x85, 0xA8-0xA9) ===

    // AND
    AND_RM8_R8 = 0x20,
    AND_RM16_R16 = 0x21,
    AND_R8_RM8 = 0x22,
    AND_R16_RM16 = 0x23,
    AND_AL_IMM8 = 0x24,
    AND_AX_IMM16 = 0x25,

    // OR
    OR_RM8_R8 = 0x08,
    OR_RM16_R16 = 0x09,
    OR_R8_RM8 = 0x0A,
    OR_R16_RM16 = 0x0B,
    OR_AL_IMM8 = 0x0C,
    OR_AX_IMM16 = 0x0D,

    // XOR
    XOR_RM8_R8 = 0x30,
    XOR_RM16_R16 = 0x31,
    XOR_R8_RM8 = 0x32,
    XOR_R16_RM16 = 0x33,
    XOR_AL_IMM8 = 0x34,
    XOR_AX_IMM16 = 0x35,

    // TEST
    TEST_RM8_R8 = 0x84,
    TEST_RM16_R16 = 0x85,
    TEST_AL_IMM8 = 0xA8,
    TEST_AX_IMM16 = 0xA9,

    // NOT/NEG (groupe 0xF6-0xF7)

    // === Shifts/Rotates (0xD0-0xD3, 0xC0-0xC1) ===
    // ROL, ROR, RCL, RCR, SHL, SHR, SAR
    // Nécessitent ModR/M byte pour spécifier l'opération

    // === Control Flow (0x70-0x7F, 0xE0-0xE3, 0xE8-0xEB, 0x9A, 0xC2-0xC3, 0xCA-0xCB, 0xCF) ===

    // Conditional Jumps (short - 8-bit relative)
    JO = 0x70,              // Jump if Overflow
    JNO = 0x71,             // Jump if Not Overflow
    JB = 0x72,              // Jump if Below (Carry)
    JNB = 0x73,             // Jump if Not Below
    JZ = 0x74,              // Jump if Zero
    JNZ = 0x75,             // Jump if Not Zero
    JBE = 0x76,             // Jump if Below or Equal
    JNBE = 0x77,            // Jump if Not Below or Equal
    JS = 0x78,              // Jump if Sign
    JNS = 0x79,             // Jump if Not Sign
    JP = 0x7A,              // Jump if Parity
    JNP = 0x7B,             // Jump if Not Parity
    JL = 0x7C,              // Jump if Less
    JNL = 0x7D,             // Jump if Not Less
    JLE = 0x7E,             // Jump if Less or Equal
    JNLE = 0x7F,            // Jump if Not Less or Equal

    // Unconditional Jumps
    JMP_SHORT = 0xEB,       // JMP rel8 (short)
    JMP_NEAR = 0xE9,        // JMP rel16 (near)
    JMP_FAR = 0xEA,         // JMP ptr16:16 (far - segment:offset)

    // CALL
    CALL_NEAR = 0xE8,       // CALL rel16 (near)
    CALL_FAR = 0x9A,        // CALL ptr16:16 (far)

    // RET
    RET_NEAR = 0xC3,        // RET (near)
    RET_NEAR_IMM16 = 0xC2,  // RET imm16 (near + pop imm16 bytes)
    RET_FAR = 0xCB,         // RET (far)
    RET_FAR_IMM16 = 0xCA,   // RET imm16 (far + pop imm16 bytes)

    // Loop instructions
    LOOPNZ = 0xE0,          // LOOP if CX != 0 and ZF = 0
    LOOPZ = 0xE1,           // LOOP if CX != 0 and ZF = 1
    LOOP = 0xE2,            // LOOP (decrement CX, jump if CX != 0)
    JCXZ = 0xE3,            // Jump if CX = 0

    // Interrupt
    INT_N = 0xCD,           // INT imm8
    INT3 = 0xCC,            // INT 3 (breakpoint)
    INTO = 0xCE,            // INT if Overflow
    IRET = 0xCF,            // Return from Interrupt

    // === String Operations (0xA4-0xA7, 0xAA-0xAF) ===
    MOVSB = 0xA4,           // Move String Byte
    MOVSW = 0xA5,           // Move String Word
    CMPSB = 0xA6,           // Compare String Byte
    CMPSW = 0xA7,           // Compare String Word
    STOSB = 0xAA,           // Store String Byte
    STOSW = 0xAB,           // Store String Word
    LODSB = 0xAC,           // Load String Byte
    LODSW = 0xAD,           // Load String Word
    SCASB = 0xAE,           // Scan String Byte
    SCASW = 0xAF,           // Scan String Word

    // === Flags (0xF8-0xFD) ===
    CLC = 0xF8,             // Clear Carry Flag
    STC = 0xF9,             // Set Carry Flag
    CLI = 0xFA,             // Clear Interrupt Flag
    STI = 0xFB,             // Set Interrupt Flag
    CLD = 0xFC,             // Clear Direction Flag
    STD = 0xFD,             // Set Direction Flag

    // === Misc ===
    NOP = 0x90,             // No Operation (équivalent à XCHG AX, AX)
    HLT = 0xF4,             // Halt
    WAIT = 0x9B,            // Wait
    LOCK = 0xF0,            // Lock prefix

    // Segment Override Prefixes
    ES_PREFIX = 0x26,
    CS_PREFIX = 0x2E,
    SS_PREFIX = 0x36,
    DS_PREFIX = 0x3E,

    // Repeat Prefixes (for string ops)
    REP = 0xF3,             // Repeat while CX != 0
    REPNE = 0xF2,           // Repeat while CX != 0 and ZF = 0
}

/**
 * ATTENTION: Le 8086 utilise des "ModR/M bytes" pour beaucoup d'instructions
 * 
 * Format ModR/M:
 * ┌──────┬──────┬──────┐
 * │ Mod  │ Reg  │ R/M  │
 * │ 2bit │ 3bit │ 3bit │
 * └──────┴──────┴──────┘
 * 
 * - Mod: Mode (00=memory no disp, 01=mem+disp8, 10=mem+disp16, 11=register)
 * - Reg: Register code
 * - R/M: Register or Memory operand
 * 
 * Exemple: MOV AX, BX = 0x89 0xD8
 *          0x89 = opcode MOV r/m16, r16
 *          0xD8 = ModR/M: Mod=11 (reg), Reg=011 (BX), R/M=000 (AX)
 */

// Instructions nécessitant 1 byte d'opérande
export const INSTRUCTIONS_WITH_OPERAND_8086 = [
    Opcode8086.MOV_AL_IMM8, Opcode8086.MOV_CL_IMM8, Opcode8086.MOV_DL_IMM8, Opcode8086.MOV_BL_IMM8,
    Opcode8086.MOV_AH_IMM8, Opcode8086.MOV_CH_IMM8, Opcode8086.MOV_DH_IMM8, Opcode8086.MOV_BH_IMM8,
    Opcode8086.ADD_AL_IMM8, Opcode8086.SUB_AL_IMM8, Opcode8086.CMP_AL_IMM8,
    Opcode8086.AND_AL_IMM8, Opcode8086.OR_AL_IMM8, Opcode8086.XOR_AL_IMM8, Opcode8086.TEST_AL_IMM8,
    Opcode8086.IN_AL_IMM8, Opcode8086.OUT_IMM8_AL,
    Opcode8086.INT_N,
    // Conditional jumps (tous rel8)
    Opcode8086.JO, Opcode8086.JNO, Opcode8086.JB, Opcode8086.JNB,
    Opcode8086.JZ, Opcode8086.JNZ, Opcode8086.JBE, Opcode8086.JNBE,
    Opcode8086.JS, Opcode8086.JNS, Opcode8086.JP, Opcode8086.JNP,
    Opcode8086.JL, Opcode8086.JNL, Opcode8086.JLE, Opcode8086.JNLE,
    Opcode8086.JMP_SHORT, Opcode8086.LOOPNZ, Opcode8086.LOOPZ, Opcode8086.LOOP, Opcode8086.JCXZ,
];

// Instructions nécessitant 2 bytes d'opérandes
export const INSTRUCTIONS_WITH_TWO_OPERANDS_8086 = [
    Opcode8086.MOV_AX_IMM16, Opcode8086.MOV_CX_IMM16, Opcode8086.MOV_DX_IMM16, Opcode8086.MOV_BX_IMM16,
    Opcode8086.MOV_SP_IMM16, Opcode8086.MOV_BP_IMM16, Opcode8086.MOV_SI_IMM16, Opcode8086.MOV_DI_IMM16,
    Opcode8086.MOV_AX_MOFFS16, Opcode8086.MOV_MOFFS16_AX,
    Opcode8086.ADD_AX_IMM16, Opcode8086.SUB_AX_IMM16, Opcode8086.CMP_AX_IMM16,
    Opcode8086.AND_AX_IMM16, Opcode8086.OR_AX_IMM16, Opcode8086.XOR_AX_IMM16, Opcode8086.TEST_AX_IMM16,
    Opcode8086.JMP_NEAR, Opcode8086.CALL_NEAR,
    Opcode8086.RET_NEAR_IMM16, Opcode8086.RET_FAR_IMM16,
];

export const getOpcodeName8086 = (opcode: u8): string => {
    const names: { [key: number]: string } = {
        [Opcode8086.NOP]: "NOP",
        [Opcode8086.HLT]: "HLT",
        [Opcode8086.MOV_AL_IMM8]: "MOV AL, imm8",
        [Opcode8086.MOV_AX_IMM16]: "MOV AX, imm16",
        [Opcode8086.ADD_AL_IMM8]: "ADD AL, imm8",
        [Opcode8086.SUB_AL_IMM8]: "SUB AL, imm8",
        [Opcode8086.CMP_AL_IMM8]: "CMP AL, imm8",
        [Opcode8086.JMP_SHORT]: "JMP short",
        [Opcode8086.JMP_NEAR]: "JMP near",
        [Opcode8086.JZ]: "JZ",
        [Opcode8086.JNZ]: "JNZ",
        [Opcode8086.CALL_NEAR]: "CALL near",
        [Opcode8086.RET_NEAR]: "RET",
        [Opcode8086.INT_N]: "INT",
        [Opcode8086.PUSH_AX]: "PUSH AX",
        [Opcode8086.POP_AX]: "POP AX",
        [Opcode8086.INC_AX]: "INC AX",
        [Opcode8086.DEC_AX]: "DEC AX",
    };
    return names[opcode] || `??? (0x${opcode.toString(16).padStart(2, '0')})`;
};

export const getInstructionLength8086 = (opcode: u8): number => {
    // TRÈS SIMPLIFIÉ - en réalité il faut decoder le ModR/M byte
    if (INSTRUCTIONS_WITH_OPERAND_8086.includes(opcode)) return 2;
    if (INSTRUCTIONS_WITH_TWO_OPERANDS_8086.includes(opcode)) return 3;

    // Instructions avec ModR/M nécessitent analyse du byte suivant
    // Peut aller de 2 à 6 bytes selon le mode d'adressage !
    return 1;
};

// Flags 8086 (register FLAGS - 16-bit mais seuls 9 bits utilisés)
export const FLAGS_8086 = {
    CF: 0x0001,  // Carry
    PF: 0x0004,  // Parity
    AF: 0x0010,  // Auxiliary Carry
    ZF: 0x0040,  // Zero
    SF: 0x0080,  // Sign
    TF: 0x0100,  // Trap (single step)
    IF: 0x0200,  // Interrupt Enable
    DF: 0x0400,  // Direction
    OF: 0x0800,  // Overflow
} as const;

export const setFlag8086 = (FLAGS: u16, flag: keyof typeof FLAGS_8086, value: boolean): u16 => {
    return value ? ((FLAGS | FLAGS_8086[flag]) as u16) : ((FLAGS & ~FLAGS_8086[flag]) as u16);
};

export const getFlag8086 = (FLAGS: u16, flag: keyof typeof FLAGS_8086): boolean => {
    return (FLAGS & FLAGS_8086[flag]) !== 0;
};

/**
 * NOTE IMPORTANTE:
 * 
 * Le 8086 est BEAUCOUP trop complexe pour être implémenté facilement.
 * Ce fichier donne juste une idée de la structure des opcodes.
 * 
 * Pour un vrai émulateur 8086, il faudrait:
 * - Décodeur ModR/M complet (8 modes × 8 registres)
 * - Calcul d'adresses effectives (EA)
 * - Gestion segmentation (CS, DS, ES, SS)
 * - Préfixes (segment override, repeat, lock)
 * - Interruptions DOS (INT 21h avec 80+ fonctions)
 * - ~3000 lignes de code minimum
 * 
 * RECOMMANDATION: Utilise Z80 à la place ! 😅
 */
