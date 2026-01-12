
@include os/devices/console/console_hello_world.asm
@include os/devices/led/led.lib.asm


OS_START:

MAIN:
    CALL $LEDS_ON # Allume les LEDs
    CALL $CONSOLE_HELLO_WORLD # Affiche Hello World sur la console

    WAIT_FOR_PROGRAM:
        MOV_A_MEM @PROGRAM_START
        JZ $WAIT_FOR_PROGRAM # Si = 0, boucler

    # Programme trouvé

    CALL $LEDS_OFF # Eteint les LEDs

    RUN_PROGRAM:
        SET_FREQ 10
        CALL @PROGRAM_START # Lance le programme

    PROGRAM_RETURN:
        SET_FREQ 5
        MOV_A_IMM 0x00
        MOV_MEM_A @PROGRAM_START # Unload Program

        JMP $WAIT_FOR_PROGRAM # Retour à WAIT_FOR_PROGRAM


