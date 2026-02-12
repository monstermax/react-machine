; Author: yomax
; Date: 2026-01
; Name: bootloader_v2.lib
; Description: Lib for bootloader_v2


.include "bootloader/lib_devices.asm"


section .data
    ASCII_EOL           equ 0x0A
    STR_WELCOME_LINE_1  db "BOOTLOADER OK", 13, 0
    STR_GITHUB_LINK     db "GITHUB.COM/MONSTERMAX", 13, 0
    STR_WAITING_OS      db "WAITING FOR OS...", 13, 0
    STR_OS_FOUND        db "OS FOUND ON DEVICE #", 0


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


