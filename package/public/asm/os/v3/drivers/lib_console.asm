; Author: yomax
; Date: 2026-01
; Name: lib_console
; Description: Console Driver


section .data
    CONSOLE_CHAR  equ 0xF070 ; TODO: a remplacer par [console_io_base]
    CONSOLE_CLEAR equ 0xF071 ; TODO: a remplacer par [console_io_base]+1



section .text

console_clear:
    mov al, 0x01
    mov [CONSOLE_CLEAR], al
    ret


; Register A = ASCII Char
console_print_char:
    mov [CONSOLE_CHAR], al
    ret



console_print_string:
    CONSOLE_PRINT_STRING_LOOP:
        ; Lire caractère depuis buffer
        ; MOV_A_PTR_CD
        ;lea al, cl, dl
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


; Affiche une string depuis un buffer mémoire
; Input: C:D = adresse du buffer, B = taille
console_print_sized_string:
    DEQUEUE:
        ; Lire caractère depuis buffer
        ;MOV_A_PTR_CD
        ;lea al, cl, dl
        ldi al, cl, dl ; A = [C:D]

        CALL console_print_char

        ; Incrémenter pointeur C:D
        inc cl
        jnc NO_CARRY_PRINT
        inc dl

    NO_CARRY_PRINT:
        ; Décrémenter compteur
        dec bl
        jnz DEQUEUE

    CONSOLE_PRINT_SIZED_STRING_END:
        RET
