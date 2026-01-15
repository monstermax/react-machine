
@include os/time/wait_loop.lib.asm
@include os/devices/led/led.lib.asm


MAIN:

    SHOW_LEDS:
        CALL $LEDS_ON # Go to LEDS_ON

    WAIT_DELAY:
        MOV_A_IMM 0x0F # A = Delay counter for WAIT_LOOP
        CALL $WAIT_LOOP() # Go to WAIT_LOOP

    HIDE_LEDS:
        CALL $LEDS_OFF # Go to LEDS_OFF
        JMP $END # Go to END

    END:
        RET
