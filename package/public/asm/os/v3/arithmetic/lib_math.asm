; Author: yomax
; Date: 2026-01
; Name: lib_math
; Description: 8 bits Math Library


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



; TODO: code à verifier / corriger


; --------------------------------------------------------
; mul8 - Multiplication non signée 8 bits
; Entrée: al = multiplicande, bl = multiplicateur
; Sortie: al = résultat (produit 8 bits)
; --------------------------------------------------------
mul8:
    push cx          ; Sauvegarde cx
    xor cl, cl       ; cl = compteur
    mov dl, al       ; dl = copie du multiplicande
    xor al, al       ; al = résultat (initialisé à 0)

.mul_loop:
    test bl, 1       ; Test bit de poids faible
    jz .no_add
    add al, dl       ; Ajoute le multiplicande au résultat

.no_add:
    shl dl, 1        ; Multiplicande << 1 (double)
    shr bl, 1        ; Multiplicateur >> 1 (décalage)
    inc cl           ; Incrémente compteur
    cmp cl, 8        ; 8 itérations max
    jl .mul_loop

    pop cx           ; Restaure cx
    ret


; --------------------------------------------------------
; mul8_signed - Multiplication signée 8 bits
; Entrée: al = multiplicande, bl = multiplicateur
; Sortie: al = résultat (produit 8 bits)
; --------------------------------------------------------
mul8_signed:
    push cx
    push dx

    ; Gestion des signes
    mov cl, 0        ; cl = flag signe (0=positif, 1=négatif)

    test al, 0x80    ; Test signe de al
    jz .check_bl
    not al           ; Complément à 1
    add al, 1        ; Complément à 2 (valeur absolue)
    xor cl, 1        ; Inverse flag signe

.check_bl:
    test bl, 0x80    ; Test signe de bl
    jz .do_mult
    not bl           ; Complément à 1
    add bl, 1        ; Complément à 2
    xor cl, 1        ; Inverse flag signe

.do_mult:
    call mul8        ; Multiplication non signée

    ; Applique le signe si nécessaire
    test cl, cl
    jz .end
    not al           ; Complément à 1
    add al, 1        ; Complément à 2

.end:
    pop dx
    pop cx
    ret


; --------------------------------------------------------
; div8 - Division non signée 8 bits (sans RCL)
; Entrée: al = dividende, bl = diviseur
; Sortie: al = quotient, bl = reste
; --------------------------------------------------------
div8:
    push cx
    push dx

    ; TODO: a refaire. sans registres 16 bits

    cmp bl, 0
    jz .error

    mov cl, 8        ; 8 bits
    xor ch, ch       ; ch = quotient
    mov dl, al       ; dl = dividende (reste partiel)

.bit_loop:
    ; Décale quotient et reste
    shl ch, 1        ; quotient << 1
    shl dl, 1        ; reste << 1

    ; Compare avec diviseur
    cmp dl, bl
    jb .zero_bit

    ; Bit = 1
    sub dl, bl       ; soustrait diviseur
    or ch, 1         ; met bit à 1

.zero_bit:
    ; Bit = 0 (déjà fait par shl ch,1)

    dec cl
    jnz .bit_loop

    ; Résultats
    mov al, ch       ; quotient
    mov bl, dl       ; reste
    jmp .end

.error:
    mov al, 0xFF
    mov bl, 0xFF

.end:
    pop dx
    pop cx
    ret


; --------------------------------------------------------
; mod8 - Modulo non signé 8 bits
; Entrée: al = dividende, bl = diviseur
; Sortie: al = reste
; --------------------------------------------------------
mod8:
    call div8
    mov al, bl       ; al = reste
    ret


; --------------------------------------------------------
; square8 - Carré d'un nombre 8 bits
; Entrée: al = nombre
; Sortie: al = carré
; --------------------------------------------------------
square8:
    push bx
    mov bl, al       ; Multiplicateur = nombre lui-même
    call mul8        ; al = al * bl
    pop bx
    ret


; --------------------------------------------------------
; power8 - Puissance 8 bits
; Entrée: al = base, bl = exposant
; Sortie: al = résultat
; --------------------------------------------------------
power8:
    push cx
    push dx

    ; TODO: a refaire. sans registres 16 bits

    cmp bl, 0        ; cas exposant = 0
    jne .not_zero
    mov al, 1        ; a^0 = 1
    jmp .power_end

.not_zero:
    mov cl, bl       ; cl = compteur d'exposant
    mov dl, al       ; dl = résultat accumulé (commence avec base)

    mov al, 1        ; al = résultat initial = 1

.power_loop:
    ; Multiplier résultat par base
    push ax
    mov al, dl       ; al = base
    mov bl, al       ; bl = résultat courant
    call mul8        ; al = base * résultat_courant
    mov dl, al       ; stocke nouveau résultat dans dl
    pop ax

    ; Utilise le bon mul8 (pas "mul")
    push bx
    mov bl, dl       ; bl = nouveau résultat
    call mul8        ; al = al * bl (accumule)
    pop bx

    dec cl
    jnz .power_loop

.power_end:
    pop dx
    pop cx
    ret


; --------------------------------------------------------
; abs8 - Valeur absolue 8 bits
; Entrée: al = nombre
; Sortie: al = valeur absolue
; --------------------------------------------------------
abs8:
    test al, 0x80    ; Test signe
    jz .positive
    not al           ; Complément à 1
    add al, 1        ; Complément à 2
.positive:
    ret


; --------------------------------------------------------
; is_even - Test parité
; Entrée: al = nombre
; Sortie: al = 1 si pair, 0 si impair
; --------------------------------------------------------
is_even:
    and al, 1        ; Garde uniquement le bit de poids faible
    xor al, 1        ; Inverse: 1→0, 0→1
    ret


; --------------------------------------------------------
; avg8 - Moyenne de deux nombres
; Entrée: al = a, bl = b
; Sortie: al = (a + b) / 2
; --------------------------------------------------------
avg8:
    add al, bl       ; al = a + b
    jnc .no_carry
    ; Gestion débordement (approximation)
    mov al, 0xFF     ; Valeur max

.no_carry:
    shr al, 1        ; Division par 2
    ret
