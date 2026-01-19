; Author: yomax
; Date: 2026-01
; Name: os_v1
; Description: OS for React Machine (v1)

@include os/devices/console/console.lib.asm
@include os/devices/led/led.lib.asm


OS_START:

MAIN:
    SET_SP @OS_STACK_END ; Initialiser le Stack Pointer

    SET_FREQ 50
    CALL $MALLOC_INIT()

    CALL $LEDS_ON ; Allume les LEDs

    ;CALL $CONSOLE_PRINT_SIZED_STRING_DEMO()
    ;CALL $CONSOLE_PRINT_SIZED_ALLOC_STRING_DEMO()
    CALL $CONSOLE_PRINT_WELCOME()
;    CALL $CONSOLE_PRINT_HELLO_WORLD() ; Affiche Hello World sur la console

    SET_FREQ 5

    WAIT_FOR_PROGRAM:
        MOV_A_MEM @PROGRAM_START
        JZ $WAIT_FOR_PROGRAM ; Si = 0, boucler

    ; Programme trouvé
    SET_FREQ 50

    CALL $LEDS_OFF ; Eteint les LEDs

    RUN_PROGRAM:
        CALL $CONSOLE_PRINT_START_PROGRAM()
        SET_FREQ 10
        CALL @PROGRAM_START ; Lance le programme

    PROGRAM_RETURN:
        SET_FREQ 50
        CALL $CONSOLE_PRINT_STOP_PROGRAM()
        SET_FREQ 5
        MOV_A_IMM 0x00
        MOV_MEM_A @PROGRAM_START ; Unload Program

        JMP $WAIT_FOR_PROGRAM ; Retour à WAIT_FOR_PROGRAM
