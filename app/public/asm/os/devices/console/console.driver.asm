

CONSOLE_DRIVER:

    CLEAR_CONSOLE():
        MOV_A_IMM 0x01
        MOV_MEM_A @CONSOLE_CLEAR

    PRINT_CHAR():  ; Register A = ASCII Char
        ;MOV_A_IMM $ASCII_O   ; "O" = 0x4F
        MOV_MEM_A @CONSOLE_CHAR
        RET
