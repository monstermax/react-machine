# Author: yomax
# Date: 2026-01
# Name: os_v2
# Description: OS for React Machine (v2)

@include os/devices/console/console.lib.asm


OS_START:

MAIN:
    SET_FREQ 50
    CALL $START_CORE_TEST()
    JMP $HANDLE_USER_MENU


STR_WELCOME_LINE_1:
    .string "OS v2"

STR_WELCOME_LINE_2:
    .string "1:Run 2:Info 3:Clear"

STR_WELCOME_LINE_3:
    .ascii "> "

STR_INVALID_KEY:
    .string "Invalid key"


HANDLE_USER_MENU:
    CLEAR_CONSOLE:
        MOV_A_IMM 0x01
        MOV_MEM_A @CONSOLE_CLEAR

        CALL_PRINT_MENU:
        CALL $PRINT_MENU()


    WAIT_KEY_INIT:
        SET_FREQ 5

    WAIT_KEY:
        NOP
        MOV_A_MEM @KEYBOARD_STATUS
        NOP
        JZ $WAIT_KEY


    SET_FREQ 50
    MOV_A_MEM @KEYBOARD_DATA
    MOV_B_IMM 0x00
    MOV_MEM_B @KEYBOARD_STATUS


    DISPATCH:
        PUSH_A # sauvegarde la touche appuyée sur la pile

        DISPATCH_KEY_1:
            MOV_B_IMM 0x31 # valeur de la touche "1"
            SUB
            JZ $RUN_PROGRAM # Go to Run Program

        POP_A
        PUSH_A

        DISPATCH_KEY_2:
            MOV_B_IMM 0x32 # valeur de la touche "2"
            SUB
            JZ $RUN_PRINT_INFO # Go to Info

        POP_A
        PUSH_A

        DISPATCH_KEY_3:
            MOV_B_IMM 0x33 # valeur de la touche "3"
            SUB
            JZ $CLEAR_CONSOLE # Go to Clear Console

        DISPATCH_KEY_OTHER:
            # Touche inconnue
            MOV_C_IMM <$STR_INVALID_KEY
            MOV_D_IMM >$STR_INVALID_KEY
            CALL $CONSOLE_PRINT_STRING()

            POP_A
            JMP $CALL_PRINT_MENU # Go to Menu


    RUN_PRINT_INFO:
        CALL $CONSOLE_PRINT_OK()
        SET_FREQ 5
        JMP $WAIT_KEY


    CALL_PROGRAM_NOT_FOUND:
        CALL $CONSOLE_PRINT_ERROR()
        JMP $WAIT_KEY # Go to WAIT KEY


    RUN_PROGRAM:
        POP_A
        MOV_A_MEM @PROGRAM_START
        JZ $CALL_PROGRAM_NOT_FOUND

        CALL $CONSOLE_PRINT_START_PROGRAM() # display START PROGRAM
        SET_FREQ 10
        CALL @PROGRAM_START
        SET_FREQ 50
        CALL $CONSOLE_PRINT_STOP_PROGRAM() # display STOP PROGRAM
        JMP $CLEAR_CONSOLE


    PRINT_MENU():
        MOV_C_IMM <$STR_WELCOME_LINE_1
        MOV_D_IMM >$STR_WELCOME_LINE_1
        CALL $CONSOLE_PRINT_STRING()

        MOV_C_IMM <$STR_WELCOME_LINE_2
        MOV_D_IMM >$STR_WELCOME_LINE_2
        CALL $CONSOLE_PRINT_STRING()

        MOV_C_IMM <$STR_WELCOME_LINE_3
        MOV_D_IMM >$STR_WELCOME_LINE_3
        CALL $CONSOLE_PRINT_STRING()

        RET



START_CORE_TEST():
    CORE_START 0x01
    RET



