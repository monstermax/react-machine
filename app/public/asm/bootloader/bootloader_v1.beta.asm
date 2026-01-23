
;.include "bootloader/bootloader.lib.asm"


section .data
    ; Variables pour remplacer les références MEMORY_MAP
    LEDS_BASE            equ 0x00
    CONSOLE_CHAR         equ 0xF070
    OS_START             equ 0x0500
    BOOTLOADER_STACK_END equ 0xEE0F

    ; Définitions constantes (équivalents @define8)
    INITIAL_FREQ        equ 10
    LEDS_STATE_ALL_OFF  equ 0x00
    LEDS_STATE_HALF_1   equ 0x55
    LEDS_STATE_HALF_2   equ 0xAA

    ; Codes ASCII
    ASCII_A             equ 0x41
    ASCII_B             equ 0x42
    ASCII_C             equ 0x43
    ASCII_D             equ 0x44
    ASCII_E             equ 0x45
    ASCII_F             equ 0x46
    ASCII_G             equ 0x47
    ASCII_H             equ 0x48
    ASCII_I             equ 0x49
    ASCII_J             equ 0x4A
    ASCII_K             equ 0x4B
    ASCII_L             equ 0x4C
    ASCII_M             equ 0x4D
    ASCII_N             equ 0x4E
    ASCII_O             equ 0x4F
    ASCII_P             equ 0x50
    ASCII_Q             equ 0x51
    ASCII_R             equ 0x52
    ASCII_S             equ 0x53
    ASCII_T             equ 0x54
    ASCII_U             equ 0x55
    ASCII_V             equ 0x56
    ASCII_W             equ 0x57
    ASCII_X             equ 0x58
    ASCII_Y             equ 0x59
    ASCII_Z             equ 0x5A
    ASCII_EOL           equ 0x0A
    ASCII_RET           equ 0x0D
    ASCII_ESCAPE        equ 0x1B
    ASCII_SPACE         equ 0x20
    ASCII_EXCLAM        equ 0x21
    ASCII_DBLQUOTE      equ 0x22
    ASCII_SHARP         equ 0x23
    ASCII_DOLLAR        equ 0x24
    ASCII_PERCENT       equ 0x25
    ASCII_AND           equ 0x26
    ASCII_QUOTE         equ 0x27
    ASCII_PARENTH_OPEN  equ 0x28
    ASCII_PARENTH_CLOSE equ 0x29
    ASCII_MUL           equ 0x2A
    ASCII_ADD           equ 0x2B
    ASCII_COMMA         equ 0x2C
    ASCII_SUB           equ 0x2D
    ASCII_DOT           equ 0x2E
    ASCII_SLASH         equ 0x2F
    ASCII_AROBASE       equ 0x40

section .text
    global INIT

; TODO: "Booting from hardisk..."

INIT:

MAIN:
    ; SET_SP @BOOTLOADER_STACK_END
    mov esp, BOOTLOADER_STACK_END

    ; SET_FREQ $INITIAL_FREQ
    ; Note: SET_FREQ dépend de votre architecture spécifique
    ; Vous devrez adapter cette instruction
    mov eax, INITIAL_FREQ
    ; call SET_FREQ_FUNCTION ; À implémenter selon votre architecture

RESET_LEDS:
    ; MOV_B_IMM $LEDS_STATE_ALL_OFF
    ; MOV_MEM_B @LEDS_BASE
    mov bl, LEDS_STATE_ALL_OFF
    mov LEDS_BASE, bl

    call PRINT_INFO

BOOTLOADER_READY:
    inc bl

WAIT_FOR_OS:
    ; MOV_MEM_B @LEDS_BASE
    mov LEDS_BASE, bl

    ; double la valeur de B (décalage de bits)
    ; MOV_BA
    ; ADD
    mov al, bl
    add al

    ; JZ $BOOTLOADER_READY
    jz BOOTLOADER_READY

    ; MOV_AB
    mov bl, al

    ; MOV_A_MEM @OS_START
    mov al, OS_START

    ; JZ $WAIT_FOR_OS
    jz WAIT_FOR_OS

RUN_OS:
    call PRINT_RUN

    ; MOV_A_IMM 0x00
    ; MOV_MEM_A @LEDS_BASE
    mov al, 0x00
    mov LEDS_BASE, al

    ; SET_FREQ 10 (commenté dans votre code original)
    ; call @OS_START
    call OS_START

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
    mov LEDS_BASE, bl

    ; MOV_B_IMM $LEDS_STATE_HALF_2
    ; MOV_MEM_B @LEDS_BASE
    mov bl, LEDS_STATE_HALF_2
    mov LEDS_BASE, bl

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
    mov CONSOLE_CHAR, al
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
