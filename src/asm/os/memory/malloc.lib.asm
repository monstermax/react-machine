
@define HEAP_PTR @MALLOC_START  # Pointeur vers prochaine adresse libre


# Fonction MALLOC
# Input:  A = size (low byte), B = size (high byte)
# Output: C = allocated address (low), D = allocated address (high)
#         Zero flag = 1 si échec (pas assez de mémoire)

MALLOC():
    # Charger heap pointer dans C:D
    MOV_C_MEM $HEAP_PTR
    MOV_D_MEM $HEAP_PTR
    INC_D

    # Sauvegarder adresse allouée
    PUSH_C
    PUSH_D

    # C:D += A
    CALL $ADD16_CD_A

    # Écrire nouveau heap_ptr
    MOV_MEM_C $HEAP_PTR
    INC_D
    MOV_MEM_D $HEAP_PTR

    # Restaurer résultat
    POP_D
    POP_C

    RET


# Initialiser le heap au démarrage
#MALLOC_INIT:
#    MOV_A_IMM <@MALLOC_START
#    MOV_MEM_A $HEAP_PTR
#
#    MOV_A_IMM >@MALLOC_START
#    INC_A
#    MOV_MEM_A $HEAP_PTR
#
#    RET



# Utilisation :
# # Allouer 10 bytes
# MOV_A_IMM 0x0A
# CALL $MALLOC
# # C:D = adresse allouée




# ADD16_CD_A: Additionner A à C:D (16-bit)
# Input:  C:D = valeur 16-bit, A = valeur 8-bit à ajouter
# Output: C:D = C:D + A
# Flags:  Carry si overflow

ADD16_CD_A:
    # Sauvegarder A
    PUSH_A

    # Additionner A à C (low byte)
    MOV_BA              # B = A
    MOV_AC              # A = C
    ADD                 # A = A + B (A = C + size)
    MOV_CA              # C = résultat low

    # Si carry, incrémenter D (high byte)
    JNC $ADD16_CD_A_END
    INC_D

ADD16_CD_A_END:
    # Restaurer A
    POP_A
    RET

# Helper: C:D -= A
SUB16_CD_A:
    PUSH_A
    MOV_BA
    MOV_AC
    SUB         # A = C - B
    MOV_CA
    POP_A
    RET

