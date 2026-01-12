
OS_START:

SET_FREQ 50


CLEAR_CONSOLE:
    MOV_A_IMM 0x01
    MOV_MEM_A @CONSOLE_CLEAR

    CALL_PRINT_MENU:
    CALL $PRINT_MENU


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
        POP_A
        JMP $CALL_PRINT_MENU # Go to Menu

RUN_PRINT_INFO:
    CALL $PRINT_INFO()
    SET_FREQ 5
    JMP $WAIT_KEY

RUN_PROGRAM:
    POP_A
    MOV_A_MEM @PROGRAM_START
    JZ $PROGRAM_NOT_FOUND

    CALL $PRINT_INFO() # display OK
    SET_FREQ 10
    CALL @PROGRAM_START
    SET_FREQ 50
    JMP $CLEAR_CONSOLE

PRINT_MENU:
    MOV_A_IMM 0x4F                      # O
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x53                      # S
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x20                      # space
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x76                      # v
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x32                      # 2
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x0A                      # \n
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x31                      # 1
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x2D                      # -
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x52                      # R
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x75                      # u
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x6E                      # n
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x20                      # space
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x32                      # 2
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x2D                      # -
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x49                      # I
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x6E                      # n
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x66                      # f
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x6F                      # o
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x20                      # space
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x33                      # 3
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x2D                      # -
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x43                      # C
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x6C                      # l
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x72                      # r
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x0A                      # \n
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x3E                      # >
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x20                      # space
    MOV_MEM_A @CONSOLE_CHAR
    RET

PROGRAM_NOT_FOUND:
    MOV_A_IMM 0x4B                      # K
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x4F                      # O
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x0A                      # \n
    MOV_MEM_A @CONSOLE_CHAR
    JMP $WAIT_KEY # Go to WAIT KEY

PRINT_INFO():
    POP_A
    PUSH_A
    MOV_A_IMM 0x4F                      # O
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x4B                      # K
    MOV_MEM_A @CONSOLE_CHAR
    MOV_A_IMM 0x0A                      # \n
    MOV_MEM_A @CONSOLE_CHAR
    RET

