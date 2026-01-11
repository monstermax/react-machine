
@include os/lib_os_v1.asm


OS_START:

MAIN:
    CALL $LEDS_ON

    WAIT_FOR_PROGRAM:
        MOV_A_MEM MEMORY_MAP.PROGRAM_START
        JZ $WAIT_FOR_PROGRAM # Si = 0, boucler

    RUN_PROGRAM:
        CALL MEMORY_MAP.PROGRAM_START # Lance le programme

    PROGRAM_RETURN:
        MOV_A_IMM 0x00
        MOV_MEM_A MEMORY_MAP.PROGRAM_START # Unload Program

        JMP $WAIT_FOR_PROGRAM # Retour à WAIT_FOR_PROGRAM


