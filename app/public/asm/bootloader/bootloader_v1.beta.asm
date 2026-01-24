
.include "bootloader/bootloader.lib.asm"


section .data
    ; Variables pour remplacer les références MEMORY_MAP
    LEDS_BASE               dw 0xF030
    CONSOLE_CHAR            dw 0xF070
    CLOCK_FREQ              dw 0xF120
    OS_START                dw 0x0500
    BOOTLOADER_STACK_END    dw 0xEE0F

    ; Définitions constantes (équivalents @define8)
    INITIAL_FREQ        equ 10
    LEDS_STATE_ALL_OFF  equ 0x00
    LEDS_STATE_HALF_1   equ 0x55
    LEDS_STATE_HALF_2   equ 0xAA

section .text
    global INIT

; TODO: "Booting from hardisk..."

INIT:

MAIN:
    ; SET_SP @BOOTLOADER_STACK_END
    mov esp, [BOOTLOADER_STACK_END]

    ; SET_FREQ $INITIAL_FREQ
    ; Note: SET_FREQ dépend de votre architecture spécifique
    ; Vous devrez adapter cette instruction
    ; mov [CLOCK_BASE], INITIAL_FREQ
    ; call SET_FREQ_FUNCTION ; À implémenter selon votre architecture
    mov al, INITIAL_FREQ
    mov [CLOCK_FREQ], al

RESET_LEDS:
    ; MOV_B_IMM $LEDS_STATE_ALL_OFF
    ; MOV_MEM_B @LEDS_BASE
    mov bl, LEDS_STATE_ALL_OFF
    mov [LEDS_BASE], bl

    call PRINT_INFO

BOOTLOADER_READY:
    inc bl

WAIT_FOR_OS:
    ; MOV_MEM_B @LEDS_BASE
    mov [LEDS_BASE], bl

    ; double la valeur de B (décalage de bits)
    ; MOV_BA
    ; ADD
    mov bl, al
    add al

    ; JZ $BOOTLOADER_READY
    jz BOOTLOADER_READY

    ; MOV_AB
    mov al, bl

    ; MOV_A_MEM @OS_START
    mov al, [OS_START]

    ; JZ $WAIT_FOR_OS
    jz WAIT_FOR_OS

RUN_OS:
    call PRINT_RUN

    ; MOV_A_IMM 0x00
    ; MOV_MEM_A @LEDS_BASE
    mov al, 0x00
    mov [LEDS_BASE], al

    ; SET_FREQ 10 (commenté dans votre code original)
    ; call @OS_START
    call [OS_START]

OS_RETURN:
    ; JMP $INIT
    jmp INIT

IDLE:
    ; MOV_A_IMM 0x4
    mov al, 0x4

IDLE_LOOP:
    ; MOV_B_IMM $LEDS_STATE_HALF_1
    ; MOV_MEM_B @LEDS_BASE
    mov bl, LEDS_STATE_HALF_1
    mov [LEDS_BASE], bl

    ; MOV_B_IMM $LEDS_STATE_HALF_2
    ; MOV_MEM_B @LEDS_BASE
    mov bl, LEDS_STATE_HALF_2
    mov [LEDS_BASE], bl

    ; DEC_A
    ; JMP $IDLE_LOOP
    dec al
    jmp IDLE_LOOP

    ; HALT
    hlt

; CONSOLE_DRIVER:

PRINT_CHAR:
    ; Fonction: PRINT_CHAR()
    ; Registre AL = ASCII Char
    ; MOV_MEM_A @CONSOLE_CHAR
    mov [CONSOLE_CHAR], al
    ret

PRINT_RUN:
    mov al, ASCII_O
    call PRINT_CHAR

    mov al, ASCII_S
    call PRINT_CHAR

    mov al, ASCII_SPACE
    call PRINT_CHAR

    mov al, ASCII_F
    call PRINT_CHAR

    mov al, ASCII_O
    call PRINT_CHAR

    mov al, ASCII_U
    call PRINT_CHAR

    mov al, ASCII_N
    call PRINT_CHAR

    mov al, ASCII_D
    call PRINT_CHAR

    mov al, ASCII_EXCLAM
    call PRINT_CHAR

    mov al, ASCII_EOL
    call PRINT_CHAR

    ret

PRINT_INFO:
    mov al, ASCII_B
    call PRINT_CHAR

    mov al, ASCII_O
    call PRINT_CHAR

    mov al, ASCII_O
    call PRINT_CHAR

    mov al, ASCII_T
    call PRINT_CHAR

    mov al, ASCII_L
    call PRINT_CHAR

    mov al, ASCII_O
    call PRINT_CHAR

    mov al, ASCII_A
    call PRINT_CHAR

    mov al, ASCII_D
    call PRINT_CHAR

    mov al, ASCII_E
    call PRINT_CHAR

    mov al, ASCII_R
    call PRINT_CHAR

    mov al, ASCII_SPACE
    call PRINT_CHAR

    mov al, ASCII_O
    call PRINT_CHAR

    mov al, ASCII_K
    call PRINT_CHAR

    mov al, ASCII_EOL
    call PRINT_CHAR

    mov al, ASCII_W
    call PRINT_CHAR

    mov al, ASCII_A
    call PRINT_CHAR

    mov al, ASCII_I
    call PRINT_CHAR

    mov al, ASCII_T
    call PRINT_CHAR

    mov al, ASCII_I
    call PRINT_CHAR

    mov al, ASCII_N
    call PRINT_CHAR

    mov al, ASCII_G
    call PRINT_CHAR

    mov al, ASCII_SPACE
    call PRINT_CHAR

    mov al, ASCII_F
    call PRINT_CHAR

    mov al, ASCII_O
    call PRINT_CHAR

    mov al, ASCII_R
    call PRINT_CHAR

    mov al, ASCII_SPACE
    call PRINT_CHAR

    mov al, ASCII_O
    call PRINT_CHAR

    mov al, ASCII_S
    call PRINT_CHAR

    mov al, ASCII_DOT
    call PRINT_CHAR

    mov al, ASCII_DOT
    call PRINT_CHAR

    mov al, ASCII_DOT
    call PRINT_CHAR

    mov al, ASCII_EOL
    call PRINT_CHAR

    ret


PRINT_GITHUB:
    ; TODO
    mov al, ASCII_G
    call PRINT_CHAR

    mov al, ASCII_I
    call PRINT_CHAR

    mov al, ASCII_T
    call PRINT_CHAR

    mov al, ASCII_H
    call PRINT_CHAR

    mov al, ASCII_U
    call PRINT_CHAR

    mov al, ASCII_B
    call PRINT_CHAR

    mov al, ASCII_DOT
    call PRINT_CHAR

    mov al, ASCII_C
    call PRINT_CHAR

    mov al, ASCII_O
    call PRINT_CHAR

    mov al, ASCII_M
    call PRINT_CHAR

    mov al, ASCII_SLASH
    call PRINT_CHAR

    mov al, ASCII_M
    call PRINT_CHAR

    mov al, ASCII_O
    call PRINT_CHAR

    mov al, ASCII_N
    call PRINT_CHAR

    mov al, ASCII_S
    call PRINT_CHAR

    mov al, ASCII_T
    call PRINT_CHAR

    mov al, ASCII_E
    call PRINT_CHAR

    mov al, ASCII_R
    call PRINT_CHAR

    mov al, ASCII_M
    call PRINT_CHAR

    mov al, ASCII_A
    call PRINT_CHAR

    mov al, ASCII_X
    call PRINT_CHAR

    ret
