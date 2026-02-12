; Author: yomax
; Date: 2026-01
; Name: bootloader_v2.lib
; Description: Lib for bootloader_v2


.include "bootloader/lib_devices.asm"


section .data
    ; Codes ASCII
    ASCII_NUL           equ 0x00
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

    STR_WELCOME_LINE_1 db "BOOTLOADER OK", 13, 0
    STR_GITHUB_LINK db "GITHUB.COM/MONSTERMAX", 13, 0
    STR_WAITING_OS db "WAITING FOR OS...", 13, 0
    STR_OS_FOUND db "OS FOUND ON DEVICE #", 0


section .text
    global PRINT_INFO
    global PRINT_WAITING
    global PRINT_RUN
    global PRINT_GITHUB



; Register A = ASCII Char
console_print_char:
    mov el, [console_io_base]     ; low  byte de l'adresse de la variable console_io_base
    mov fl, [console_io_base + 1] ; high byte de l'adresse de la variable console_io_base
    sti el, fl, al ; [e:f] = A
    ret



console_print_string:
    CONSOLE_PRINT_STRING_LOOP:
    ; Lire caractère depuis buffer
    ldi al, cl, dl ; A = [C:D]

    ; Vérifier si \0 (fin de string)
    cmp al, 0x00                   ; A = 0
    jz CONSOLE_PRINT_STRING_END    ; Si \0, terminer

    ; Afficher le caractère
    call console_print_char

    ; Incrémenter pointeur C:D
    inc cl
    jnc CONSOLE_PRINT_STRING_LOOP
    inc dl
    jmp CONSOLE_PRINT_STRING_LOOP

    CONSOLE_PRINT_STRING_END:

    ret




PRINT_CHAR:
    mov cl, [console_io_base]
    mov dl, [console_io_base + 1]
    sti cl, dl, al ; [C:D] = A
    ret


PRINT_INFO:
    lea cl, dl, [STR_WELCOME_LINE_1]
    call console_print_string
    ret ; end of PRINT_INFO


PRINT_WAITING:
    lea cl, dl, [STR_WAITING_OS]
    call console_print_string
    ret; end of PRINT_WAITING


; A = deviceIdx du disque contenant l'OS
PRINT_RUN:
    push al
    lea cl, dl, [STR_OS_FOUND]
    call console_print_string
    pop al

    add al, 48 ; conversion number => ascii number
    call console_print_char

    mov al, ASCII_EOL
    call console_print_char

    ret ; end of PRINT_RUN


PRINT_GITHUB:
    lea cl, dl, [STR_GITHUB_LINK]
    call console_print_string
    ret ; end of PRINT_GITHUB


