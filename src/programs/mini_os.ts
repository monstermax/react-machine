
import { high16, low16 } from "@/lib/integers";
import { Opcode } from "../lib/instructions";
import { mapAddress16, MEMORY_MAP } from "../lib/memory_map";

import type { OsInfo, u16, u8 } from "@/types/cpu.types";
import { compileCode } from "@/lib/compiler";



// MINI OS v1.0 - Attente de présence d'un programme et le lance

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


export const MINI_OS_V1: OsInfo = {
    name: "Mini OS",
    description: "Attend qu'un programme soit chargé en RAM, puis l'exécute",
    code: compileCode(codeSourceV1, MEMORY_MAP.OS_START).code,
};



// MINI OS v2.0 - Menu avec console et choix au clavier - Options: 1=Run, 2=Info, 3=Clear

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
PUSH_A # sauvegarde la touche appuyée sur la pile
MOV_B_IMM 0x31 # valeur de la touche "1"
SUB
JZ $RUN_PROGRAM # Go to Run Program

POP_A
PUSH_A
MOV_B_IMM 0x32 # valeur de la touche "2"
SUB
JZ $PRINT_INFO # Go to Info

POP_A
PUSH_A
MOV_B_IMM 0x33 # valeur de la touche "3"
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



export const os_list: Record<string, OsInfo> = {
    MINI_OS_V1,
    MINI_OS_V2,
};
