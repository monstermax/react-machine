
import { high16, low16 } from "@/lib/integers";
import { Opcode } from "../lib/instructions";
import { mapAddress16, MEMORY_MAP } from "../lib/memory_map";

import type { OsInfo, u16, u8 } from "@/types/cpu.types";
import { compileCode } from "@/lib/compiler";



const codeSourceV1 = `
:OS_START

:CHECK_PROGRAM_LOADED
MOV_A_MEM MEMORY_MAP.PROGRAM_START
JZ $CHECK_PROGRAM_LOADED # Si = 0, boucler

:PROGRAM_JUMP
JMP MEMORY_MAP.PROGRAM_START

:PROGRAM_RETURN
JMP $CHECK_PROGRAM_LOADED
`;


export const MINI_OS: OsInfo = {
    name: "Mini OS",
    description: "Attend qu'un programme soit chargé en RAM, puis l'exécute",
    code: compileCode(codeSourceV1, MEMORY_MAP.OS_START).code,
};



// Mini OS : Attend qu'un programme soit chargé en RAM, puis l'exécute
export const MINI_OS_OLD: OsInfo = {
    name: "Mini OS - OLD",
    description: "Attend qu'un programme soit chargé en RAM, puis l'exécute",
    code: new Map([
        // === WAIT_FOR_PROGRAM (0x00) ===
        // Vérifier si un programme est chargé à PROGRAM_START
        [0x00, Opcode.MOV_A_MEM],
        [0x01, low16(MEMORY_MAP.PROGRAM_START)],  // Low byte
        [0x02, high16(MEMORY_MAP.PROGRAM_START)], // High byte

        [0x03, Opcode.JZ],                        // Si = 0, boucler
        [0x04, low16(MEMORY_MAP.OS_START)],       // Low: 0x00
        [0x05, high16(MEMORY_MAP.OS_START)],      // High: 0x01

        // === RUN_PROGRAM (0x06) ===
        // Programme détecté, sauter dessus
        [0x06, Opcode.JMP],
        [0x07, low16(MEMORY_MAP.PROGRAM_START)],  // Low: 0x00
        [0x08, high16(MEMORY_MAP.PROGRAM_START)], // High: 0x02

        // === PROGRAM_RETURN (0x09) ===
        // Retour au début
        [0x09, Opcode.JMP],
        [0x0A, low16(MEMORY_MAP.OS_START)],       // Low: 0x00
        [0x0B, high16(MEMORY_MAP.OS_START)],      // High: 0x01
    ] as [u16, u8][]),
};




/**
 * MINI OS v2.0
 * 
 * Menu avec console et choix au clavier
 * Options: 1=Run, 2=Info, 3=Clear
 */


const codeSourceV2 = `
:OS_START

:CLEAR_CONSOLE
MOV_A_IMM 0x01
MOV_MEM_A MEMORY_MAP.CONSOLE_CLEAR

:CALL_PRINT_MENU
CALL $PRINT_MENU

:WAIT_KEY
MOV_A_MEM MEMORY_MAP.KEYBOARD_STATUS
JZ $WAIT_KEY
MOV_A_MEM MEMORY_MAP.KEYBOARD_DATA
MOV_B_IMM 0x00
MOV_MEM_B MEMORY_MAP.KEYBOARD_STATUS

:DISPATCH
PUSH_A
MOV_B_IMM 0x31
SUB
JZ $RUN_PROGRAM # Go to Run Program

POP_A
PUSH_A
MOV_B_IMM 0x32
SUB
JZ $PRINT_INFO # Go to Info

POP_A
PUSH_A
MOV_B_IMM 0x33
SUB
JZ $CLEAR_CONSOLE # Go to Clear Console

POP_A
JMP $CALL_PRINT_MENU # Go to Menu

:RUN_PROGRAM
POP_A
MOV_A_MEM MEMORY_MAP.PROGRAM_START
JZ $PROGRAM_NOT_FOUND
JMP MEMORY_MAP.PROGRAM_START

:PRINT_MENU
MOV_A_IMM 0x4F                      # O
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x53                      # S
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x20                      # space
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x76                      # v
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x32                      # 2
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x0A                      # \n
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x31                      # 1
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x2D                      # -
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x52                      # R
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x75                      # u
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x6E                      # n
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x20                      # space
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x32                      # 2
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x2D                      # -
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x49                      # I
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x6E                      # n
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x66                      # f
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x6F                      # o
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x20                      # space
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x33                      # 3
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x2D                      # -
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x43                      # C
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x6C                      # l
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x72                      # r
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x0A                      # \n
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x3E                      # >
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x20                      # space
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
RET

:PROGRAM_NOT_FOUND
MOV_A_IMM 0x4B                      # K
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x4F                      # O
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x0A                      # \n
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
JMP $WAIT_KEY # Go to WAIT KEY

:PRINT_INFO
POP_A
MOV_A_IMM 0x4F                      # O
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x4B                      # K
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
MOV_A_IMM 0x0A                      # \n
MOV_MEM_A MEMORY_MAP.CONSOLE_CHAR
JMP $WAIT_KEY # Go to WAIT KEY
`;



export const MINI_OS_V2: OsInfo = {
    name: "Mini OS (v2)",
    description: "Menu avec console et choix au clavier",
    code: compileCode(codeSourceV2, MEMORY_MAP.OS_START).code,
};



export const MINI_OS_V2_OLD: OsInfo = {
    name: "Mini OS (v2) - OLD",
    description: "Menu avec console et choix au clavier",
    code: new Map([
        // === INIT (0x100-0x107) ===
        //[0x00, Opcode.SET_SP],
        //[0x01, low16(MEMORY_MAP.STACK_END)],  // STACK_END - low
        //[0x02, high16(MEMORY_MAP.STACK_END)], // STACK_END - high

        [0x00, Opcode.ADD],
        [0x01, Opcode.NOP],
        [0x02, Opcode.NOP],

        // Clear console
        [0x03, Opcode.MOV_A_IMM],
        [0x04, 0x01],
        [0x05, Opcode.MOV_MEM_A],
        [0x06, low16(MEMORY_MAP.CONSOLE_CLEAR)],  // CONSOLE_CLEAR - low
        [0x07, high16(MEMORY_MAP.CONSOLE_CLEAR)], // CONSOLE_CLEAR - high

        // === MENU (0x108-0x10C) ===
        [0x08, Opcode.CALL],
        [0x09, low16(MEMORY_MAP.OS_START + 0x40 as u16)],  // $MENU - low
        [0x0A, high16(MEMORY_MAP.OS_START + 0x40 as u16)], // $MENU - high

        // === WAIT KEY (0x10D-0x119) ===
        [0x0B, Opcode.MOV_A_MEM],
        [0x0C, low16(MEMORY_MAP.KEYBOARD_STATUS)],    // read KEYBOARD_STATUS - low
        [0x0D, high16(MEMORY_MAP.KEYBOARD_STATUS)],   // read KEYBOARD_STATUS - high
        [0x0E, Opcode.JZ],
        [0x0F, low16((MEMORY_MAP.OS_START + 0x0B as u16))],   // loop to WAIT KEY - low
        [0x10, high16((MEMORY_MAP.OS_START + 0x0B as u16))],  // loop to WAIT KEY - high
        [0x11, Opcode.MOV_A_MEM],
        [0x12, low16(MEMORY_MAP.KEYBOARD_DATA)],  // read KEYBOARD_DATA - low
        [0x13, high16(MEMORY_MAP.KEYBOARD_DATA)], // read KEYBOARD_DATA - high
        [0x14, Opcode.MOV_B_IMM],
        [0x15, 0x00],
        [0x16, Opcode.MOV_MEM_B],
        [0x17, low16(MEMORY_MAP.KEYBOARD_STATUS)],  // write KEYBOARD_STATUS - low
        [0x18, high16(MEMORY_MAP.KEYBOARD_STATUS)], // write KEYBOARD_STATUS - high

        // === DISPATCH (0x11A-0x12F) ===
        [0x19, Opcode.PUSH_A],
        [0x1A, Opcode.MOV_B_IMM],
        [0x1B, 0x31],
        [0x1C, Opcode.SUB],
        [0x1D, Opcode.JZ], // Go to Run Program
        [0x1E, low16((MEMORY_MAP.OS_START + 0x34 as u16))],  // $Run - low
        [0x1F, high16((MEMORY_MAP.OS_START + 0x34 as u16))], // $Run - high

        [0x20, Opcode.POP_A],
        [0x21, Opcode.PUSH_A],
        [0x22, Opcode.MOV_B_IMM],
        [0x23, 0x32],
        [0x24, Opcode.SUB],
        [0x25, Opcode.JZ], // Go to Info
        [0x26, low16((MEMORY_MAP.OS_START + 0xE0 as u16))],  // $Info - low
        [0x27, high16((MEMORY_MAP.OS_START + 0xE0 as u16))], // $Info - high

        [0x28, Opcode.POP_A],
        [0x29, Opcode.PUSH_A],
        [0x2A, Opcode.MOV_B_IMM],
        [0x2B, 0x33],
        [0x2C, Opcode.SUB],
        [0x2D, Opcode.JZ], // Go to Clear Console
        [0x2E, low16((MEMORY_MAP.OS_START + 0x03 as u16))],  // $ClearConsole - low
        [0x2F, high16((MEMORY_MAP.OS_START + 0x03 as u16))], // $ClearConsole - high

        [0x30, Opcode.POP_A],
        [0x31, Opcode.JMP], // Go to Menu
        [0x32, low16((MEMORY_MAP.OS_START + 0x08 as u16))],  // MENU - low
        [0x33, high16((MEMORY_MAP.OS_START + 0x08 as u16))], // MENU - high

        // === OPT 1: RUN (0x131-0x138) ===
        [0x34, Opcode.POP_A],
        [0x35, Opcode.JMP],
        [0x36, low16(MEMORY_MAP.PROGRAM_START)],      // low
        [0x37, high16(MEMORY_MAP.PROGRAM_START)],     // high

        // === PRINT MENU (0x140-0x1DF) "OS v2\n1-Run 2-Info 3-Clr\n> " ===
        [0x40, Opcode.MOV_A_IMM], [0x41, 0x4F], [0x42, Opcode.MOV_MEM_A], [0x43, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x44, high16(MEMORY_MAP.CONSOLE_CHAR)], // O
        [0x45, Opcode.MOV_A_IMM], [0x46, 0x53], [0x47, Opcode.MOV_MEM_A], [0x48, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x49, high16(MEMORY_MAP.CONSOLE_CHAR)], // S
        [0x4A, Opcode.MOV_A_IMM], [0x4B, 0x20], [0x4C, Opcode.MOV_MEM_A], [0x4D, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x4E, high16(MEMORY_MAP.CONSOLE_CHAR)], // space
        [0x4F, Opcode.MOV_A_IMM], [0x50, 0x76], [0x51, Opcode.MOV_MEM_A], [0x52, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x53, high16(MEMORY_MAP.CONSOLE_CHAR)], // v
        [0x54, Opcode.MOV_A_IMM], [0x55, 0x32], [0x56, Opcode.MOV_MEM_A], [0x57, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x58, high16(MEMORY_MAP.CONSOLE_CHAR)], // 2
        [0x59, Opcode.MOV_A_IMM], [0x5A, 0x0A], [0x5B, Opcode.MOV_MEM_A], [0x5C, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x5D, high16(MEMORY_MAP.CONSOLE_CHAR)], // \n

        [0x5E, Opcode.MOV_A_IMM], [0x5F, 0x31], [0x60, Opcode.MOV_MEM_A], [0x61, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x62, high16(MEMORY_MAP.CONSOLE_CHAR)], // 1
        [0x63, Opcode.MOV_A_IMM], [0x64, 0x2D], [0x65, Opcode.MOV_MEM_A], [0x66, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x67, high16(MEMORY_MAP.CONSOLE_CHAR)], // -
        [0x68, Opcode.MOV_A_IMM], [0x69, 0x52], [0x6A, Opcode.MOV_MEM_A], [0x6B, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x6C, high16(MEMORY_MAP.CONSOLE_CHAR)], // R
        [0x6D, Opcode.MOV_A_IMM], [0x6E, 0x75], [0x6F, Opcode.MOV_MEM_A], [0x70, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x71, high16(MEMORY_MAP.CONSOLE_CHAR)], // u
        [0x72, Opcode.MOV_A_IMM], [0x73, 0x6E], [0x74, Opcode.MOV_MEM_A], [0x75, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x76, high16(MEMORY_MAP.CONSOLE_CHAR)], // n
        [0x77, Opcode.MOV_A_IMM], [0x78, 0x20], [0x79, Opcode.MOV_MEM_A], [0x7A, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x7B, high16(MEMORY_MAP.CONSOLE_CHAR)], // space

        [0x7C, Opcode.MOV_A_IMM], [0x7D, 0x32], [0x7E, Opcode.MOV_MEM_A], [0x7F, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x80, high16(MEMORY_MAP.CONSOLE_CHAR)], // 2
        [0x81, Opcode.MOV_A_IMM], [0x82, 0x2D], [0x83, Opcode.MOV_MEM_A], [0x84, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x85, high16(MEMORY_MAP.CONSOLE_CHAR)], // -
        [0x86, Opcode.MOV_A_IMM], [0x87, 0x49], [0x88, Opcode.MOV_MEM_A], [0x89, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x8A, high16(MEMORY_MAP.CONSOLE_CHAR)], // I
        [0x8B, Opcode.MOV_A_IMM], [0x8C, 0x6E], [0x8D, Opcode.MOV_MEM_A], [0x8E, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x8F, high16(MEMORY_MAP.CONSOLE_CHAR)], // n
        [0x90, Opcode.MOV_A_IMM], [0x91, 0x66], [0x92, Opcode.MOV_MEM_A], [0x93, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x94, high16(MEMORY_MAP.CONSOLE_CHAR)], // f
        [0x95, Opcode.MOV_A_IMM], [0x96, 0x6F], [0x97, Opcode.MOV_MEM_A], [0x98, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x99, high16(MEMORY_MAP.CONSOLE_CHAR)], // o
        [0x9A, Opcode.MOV_A_IMM], [0x9B, 0x20], [0x9C, Opcode.MOV_MEM_A], [0x9D, low16(MEMORY_MAP.CONSOLE_CHAR)], [0x9E, high16(MEMORY_MAP.CONSOLE_CHAR)], // space

        [0x9F, Opcode.MOV_A_IMM], [0xA0, 0x33], [0xA1, Opcode.MOV_MEM_A], [0xA2, low16(MEMORY_MAP.CONSOLE_CHAR)], [0xA3, high16(MEMORY_MAP.CONSOLE_CHAR)], // 3
        [0xA4, Opcode.MOV_A_IMM], [0xA5, 0x2D], [0xA6, Opcode.MOV_MEM_A], [0xA7, low16(MEMORY_MAP.CONSOLE_CHAR)], [0xA8, high16(MEMORY_MAP.CONSOLE_CHAR)], // -
        [0xA9, Opcode.MOV_A_IMM], [0xAA, 0x43], [0xAB, Opcode.MOV_MEM_A], [0xAC, low16(MEMORY_MAP.CONSOLE_CHAR)], [0xAD, high16(MEMORY_MAP.CONSOLE_CHAR)], // C
        [0xAE, Opcode.MOV_A_IMM], [0xAF, 0x6C], [0xB0, Opcode.MOV_MEM_A], [0xB1, low16(MEMORY_MAP.CONSOLE_CHAR)], [0xB2, high16(MEMORY_MAP.CONSOLE_CHAR)], // l
        [0xB3, Opcode.MOV_A_IMM], [0xB4, 0x72], [0xB5, Opcode.MOV_MEM_A], [0xB6, low16(MEMORY_MAP.CONSOLE_CHAR)], [0xB7, high16(MEMORY_MAP.CONSOLE_CHAR)], // r
        [0xB8, Opcode.MOV_A_IMM], [0xB9, 0x0A], [0xBA, Opcode.MOV_MEM_A], [0xBB, low16(MEMORY_MAP.CONSOLE_CHAR)], [0xBC, high16(MEMORY_MAP.CONSOLE_CHAR)], // \n

        [0xBD, Opcode.MOV_A_IMM], [0xBE, 0x3E], [0xBF, Opcode.MOV_MEM_A], [0xC0, low16(MEMORY_MAP.CONSOLE_CHAR)], [0xC1, high16(MEMORY_MAP.CONSOLE_CHAR)], // >
        [0xC2, Opcode.MOV_A_IMM], [0xC3, 0x20], [0xC4, Opcode.MOV_MEM_A], [0xC5, low16(MEMORY_MAP.CONSOLE_CHAR)], [0xC6, high16(MEMORY_MAP.CONSOLE_CHAR)], // space
        [0xC7, Opcode.RET],

        // === OPT 2: INFO (0x1E0-0x1F5) "OK\n" ===
        [0xE0, Opcode.POP_A],
        [0xE1, Opcode.MOV_A_IMM], [0xE2, 0x4F], [0xE3, Opcode.MOV_MEM_A], [0xE4, low16(MEMORY_MAP.CONSOLE_CHAR)], [0xE5, high16(MEMORY_MAP.CONSOLE_CHAR)], // O
        [0xE6, Opcode.MOV_A_IMM], [0xE7, 0x4B], [0xE8, Opcode.MOV_MEM_A], [0xE9, low16(MEMORY_MAP.CONSOLE_CHAR)], [0xEA, high16(MEMORY_MAP.CONSOLE_CHAR)], // K
        [0xEB, Opcode.MOV_A_IMM], [0xEC, 0x0A], [0xED, Opcode.MOV_MEM_A], [0xEE, low16(MEMORY_MAP.CONSOLE_CHAR)], [0xEF, high16(MEMORY_MAP.CONSOLE_CHAR)], // \n

        [0xF0, Opcode.JMP], // Go to WAIT KEY
        [0xF1, low16((MEMORY_MAP.OS_START + 0x0B as u16))],  // $WAIT_KEY - low
        [0xF2, high16((MEMORY_MAP.OS_START + 0x0B as u16))], // $WAIT_KEY - high

    ] as [u16, u8][]),
};



export const os_list: Record<string, OsInfo> = {
    MINI_OS,
    //MINI_OS_OLD,
    MINI_OS_V2,
    //MINI_OS_V2_OLD,
};
