
INIT:

MAIN:
    SET_SP MEMORY_MAP.STACK_END # Initialiser le Stack Pointer

    RESET_LEDS:
        MOV_B_IMM 0x00
        MOV_MEM_B MEMORY_MAP.LEDS_BASE # Eteint les LED
        INC_B

    WAIT_FOR_OS:
        MOV_MEM_B MEMORY_MAP.LEDS_BASE # Allume les LED

        # double la valeur de B (decalage de bits)
        MOV_BA
        ADD
        JZ $RESET_LEDS

        MOV_AB
        MOV_A_MEM MEMORY_MAP.OS_START # Vérifie si un OS est chargé en mémoire

        JZ $WAIT_FOR_OS # Si pas d'OS détecté on retourne à WAIT_FOR_OS

    RUN_OS:
        MOV_A_IMM 0x00
        MOV_MEM_A MEMORY_MAP.LEDS_BASE # Eteint les LED

        CALL MEMORY_MAP.OS_START # Lance l'OS

    OS_RETURN:
        JMP $WAIT_FOR_OS # Retour à WAIT_FOR_OS

