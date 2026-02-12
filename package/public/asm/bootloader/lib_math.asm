
section .text

; -----------------------------------------------
; ADD_CD_E : C:D += E
; -----------------------------------------------
ADD_CD_E:
    add cl, el
    jnc ADD_CD_E_END
    inc dl
ADD_CD_E_END:
    ret


; -----------------------------------------------
; ADD_AB_E : A:B += E
; -----------------------------------------------
ADD_AB_E:
    add al, el
    jnc ADD_AB_E_END
    inc bl
ADD_AB_E_END:
    ret

