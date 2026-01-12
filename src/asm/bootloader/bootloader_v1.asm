
INIT:

MAIN:
    SET_SP @STACK_END # Initialiser le Stack Pointer
    SET_FREQ 5

    RESET_LEDS:
        MOV_B_IMM 0x00
        MOV_MEM_B @LEDS_BASE # Eteint les LED
        INC_B

    WAIT_FOR_OS:
        MOV_MEM_B @LEDS_BASE # Allume les LED

        # double la valeur de B (decalage de bits)
        MOV_BA
        ADD
        JZ $RESET_LEDS

        MOV_AB
        MOV_A_MEM @OS_START # Vérifie si un OS est chargé en mémoire

        JZ $WAIT_FOR_OS # Si pas d'OS détecté on retourne à WAIT_FOR_OS

    RUN_OS:
        MOV_A_IMM 0x00
        MOV_MEM_A @LEDS_BASE # Eteint les LED

        #SET_FREQ 10
        CALL @OS_START # Lance l'OS

    OS_RETURN:
        JMP $WAIT_FOR_OS # Retour à WAIT_FOR_OS

