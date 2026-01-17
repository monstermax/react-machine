
@define8 INITIAL_FREQ 0x05
@define8 LEDS_STATE_ALL_OFF 0x00
@define8 LEDS_STATE_HALF_1 0x55
@define8 LEDS_STATE_HALF_2 0xAA


INIT:

MAIN:
    SET_SP @STACK_END # Initialiser le Stack Pointer
    SET_FREQ $INITIAL_FREQ

    # Eteint les LED
    RESET_LEDS:
        MOV_B_IMM $LEDS_STATE_ALL_OFF
        MOV_MEM_B @LEDS_BASE

    INC_B

    WAIT_FOR_OS:
        MOV_MEM_B @LEDS_BASE # Allume les LED

        # double la valeur de B (decalage de bits)
        MOV_BA
        ADD
        JZ $RESET_LEDS # Go back to RESET_LEDS

        MOV_AB
        MOV_A_MEM @OS_START # Vérifie si un OS est chargé en mémoire

        JZ $WAIT_FOR_OS # Si pas d'OS détecté on retourne à WAIT_FOR_OS

    RUN_OS:
        MOV_A_IMM 0x00
        MOV_MEM_A @LEDS_BASE # Eteint les LED

        #SET_FREQ 10
        CALL @OS_START # Lance l'OS

    OS_RETURN:
        JMP $RESET_LEDS # Retour à WAIT_FOR_OS


IDLE:
    MOV_A_IMM 0x4

    IDLE_LOOP:
        MOV_B_IMM $LEDS_STATE_HALF_1
        MOV_MEM_B @LEDS_BASE

        MOV_B_IMM $LEDS_STATE_HALF_2
        MOV_MEM_B @LEDS_BASE

        DEC_A
        JMP $IDLE_LOOP

    HALT
