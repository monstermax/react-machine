

CONSOLE_DRIVER:

    PRINT_CHAR(): # A = ASCII Char
        #MOV_A_IMM $ASCII_O   # O = 0x4F
        MOV_MEM_A @CONSOLE_CHAR
        RET
