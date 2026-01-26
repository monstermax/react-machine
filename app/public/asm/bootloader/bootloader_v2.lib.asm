; Author: yomax
; Date: 2026-01
; Name: bootloader_v2.lib
; Description: Lib for bootloader_v2


section .data
    CONSOLE_CHAR            dw 0xF070

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


    ; CONSOLE_DRIVER:

    PRINT_CHAR:
        mov [CONSOLE_CHAR], al ; print char
        ret


    PRINT_RUN:
        mov al, ASCII_O ; letter O. start of PRINT_RUN
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

        ret ; end of PRINT_RUN

    PRINT_INFO:
        mov al, ASCII_B ; letter B. start of PRINT_INFO
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

        ret ; end of PRINT_INFO



    PRINT_GITHUB:
        ; TODO
        mov al, ASCII_G ; letter G. start of PRINT_GITHUB
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

        ret ; end of PRINT_GITHUB


