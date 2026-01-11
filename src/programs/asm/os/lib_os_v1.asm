
@include devices/led/led.lib.asm


WAIT_LOOP:
    DEC_A
    JNZ $WAIT_LOOP
    RET
