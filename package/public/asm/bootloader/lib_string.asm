; Author: yomax
; Date: 2026-02
; Name: lib_string
; Description: Lib string for bootloader_v2


section .text
    global strcmp


; -----------------------------------------------
; strcmp : compare string [A:B] vs [C:D] (null-terminated)
; Résultat : flag zero=1 si égales
; -----------------------------------------------
strcmp:
    STRCMP_START:
    ldi el, al, bl ; E = [A:B]
    ldi fl, cl, dl ; F = [C:D]
    cmp el, fl

    jne STRCMP_END

    cmp el, 0
    je STRCMP_END

    mov el, 1
    call add_ab_e
    call add_cd_e
    jmp STRCMP_START

    STRCMP_END:
    ret

