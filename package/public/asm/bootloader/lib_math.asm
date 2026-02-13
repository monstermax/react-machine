; Author: yomax
; Date: 2026-02
; Name: lib_math
; Description: Lib Math for bootloader_v2


section .text
    global inc_cd
    global dec_cd
    global add_ab_e
    global add_cd_e
    global sub_ab_e
    global sub_cd_e


; Incrémente (C:D)
inc_cd:
    inc cl
    jnc INC_CD_END
    inc dl
    INC_CD_END:
    ret


; Décrémente (C:D)
dec_cd:
    dec cl
    jnc DEC_CD_END
    dec dl
    DEC_CD_END:
    ret


; Ajoute E à (A:B) => (A:B) += E
add_ab_e:
    add al, el
    jnc ADD_AB_E_END
    inc bl
    ADD_AB_E_END:
    ret


; Ajoute E à (C:D) => (C:D) += E
add_cd_e:
    add cl, el
    jnc ADD_CD_E_END
    inc dl
    ADD_CD_E_END:
    ret


; Soustrait E de (A:B) => (A:B) -= E
sub_ab_e:
    sub al, el
    jnc SUB_AB_E_END
    dec bl
    SUB_AB_E_END:
    ret


; Soustrait E de (C:D) => (C:D) -= E
sub_cd_e:
    sub cl, el
    jnc SUB_CD_E_END
    dec dl
    SUB_CD_E_END:
    ret

