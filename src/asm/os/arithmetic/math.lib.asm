

# ADD16_CD_A: Additionner A à C:D (16-bit)
# Input:  C:D = valeur 16-bit, A = valeur 8-bit à ajouter
# Output: C:D = C:D + A
# Flags:  Carry si overflow

ADD16_CD_A():
    # Sauvegarder A
    PUSH_A

    # Additionner A à C (low byte)
    #MOV_AB              # B = A
    #MOV_CA              # A = C
    MOV_CB              # B = C
    ADD                 # A = A + B (A = C + size)
    MOV_AC              # C = résultat low

    # Si carry, incrémenter D (high byte)
    JNC $ADD16_CD_A_END
    INC_D

ADD16_CD_A_END:
    # Restaurer A
    POP_A
    RET
