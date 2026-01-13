

# ============================================
# MALLOC - Allouer de la mémoire dynamique
# ============================================
# Input:  A = nombre de bytes à allouer
# Output: C:D = adresse du bloc alloué
# ============================================


MALLOC():
    # ÉTAPE 1: Lire où se trouve actuellement le heap pointer
    # (le heap pointer est stocké à l'adresse MALLOC_HEAP_PTR_LOW/HIGH)
    MOV_C_MEM @MALLOC_HEAP_PTR_LOW    # C = byte de poids faible du pointeur
    MOV_D_MEM @MALLOC_HEAP_PTR_HIGH   # D = byte de poids fort du pointeur
    # Maintenant C:D contient l'adresse où commence la mémoire libre

    # ÉTAPE 2: Sauvegarder cette adresse car c'est ce qu'on va retourner
    PUSH_C    # Sauver low byte
    PUSH_D    # Sauver high byte

    # ÉTAPE 3: Avancer le heap pointer de A bytes
    # (pour que le prochain malloc commence après)
    CALL $ADD16_CD_A    # C:D = C:D + A

    # ÉTAPE 4: Écrire le nouveau heap pointer en mémoire
    MOV_MEM_C @MALLOC_HEAP_PTR_LOW    # Écrire nouveau low byte
    MOV_MEM_D @MALLOC_HEAP_PTR_HIGH   # Écrire nouveau high byte

    # ÉTAPE 5: Récupérer l'adresse qu'on avait sauvegardée
    POP_D     # Restaurer high byte
    POP_C     # Restaurer low byte
    # C:D contient maintenant l'adresse du bloc alloué

    RET


# ============================================
# MALLOC_INIT() - Initialiser le système malloc
# À appeler UNE FOIS au démarrage
# ============================================

MALLOC_INIT():
    # Initialiser le heap pointer pour qu'il pointe
    # sur le début de la zone de données malloc

    MOV_A_IMM <@MALLOC_DATA_START     # A = low byte de l'adresse de départ
    MOV_MEM_A @MALLOC_HEAP_PTR_LOW    # Écrire en mémoire

    MOV_A_IMM >@MALLOC_DATA_START     # A = high byte de l'adresse de départ
    MOV_MEM_A @MALLOC_HEAP_PTR_HIGH   # Écrire en mémoire

    RET




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

