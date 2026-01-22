
@include os/devices/led/led.driver.asm


; Switch-ON All LEDs
LEDS_ON:
    MOV_A_IMM 0xFF
    CALL $SET_LEDS()
    RET


; Switch-OFF All LEDs
LEDS_OFF:
    MOV_A_IMM 0x00
    CALL $SET_LEDS()
    RET

