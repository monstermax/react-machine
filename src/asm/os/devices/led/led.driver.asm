

LEDS_DRIVER:

    SET_LEDS(): # A = Leds Value
        #MOV_A_IMM 0x00
        MOV_MEM_A @LEDS_BASE
        RET

