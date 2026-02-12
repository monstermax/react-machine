
section .text
    global STRCMP


; -----------------------------------------------
; STRCMP : compare string [A:B] vs [C:D] (null-terminated)
; Résultat : flag zero=1 si égales
; -----------------------------------------------
STRCMP:
    ldi el, al, bl ; E = [A:B]
    ldi fl, cl, dl ; F = [C:D]
    cmp el, fl

    jne STRCMP_END

    cmp el, 0
    je STRCMP_END

    mov el, 1
    call ADD_AB_E
    call ADD_CD_E
    jmp STRCMP

    STRCMP_END:
    ret

