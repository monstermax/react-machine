
INIT:

MAIN:
    SET_SP MEMORY_MAP.STACK_END # Initialiser le Stack Pointer

    WAIT_FOR_OS:
        MOV_A_MEM MEMORY_MAP.OS_START # Vérifie si un OS est chargé en mémoire
        NOP
        JZ $WAIT_FOR_OS # Si pas d'OS détecté on retourne à WAIT_FOR_OS

    RUN_OS:
        CALL MEMORY_MAP.OS_START # Lance l'OS

    OS_RETURN:
        JMP $WAIT_FOR_OS # Retour à WAIT_FOR_OS

