; Author: yomax
; Date: 2026-01
; Name: lib_leds
; Description: LEDs Display Driver


section .data
    LEDS_BASE equ 0xF030 ; address of io port in memory map
    LEDS_NONE equ 0x00
    LEDS_ALL equ 0xFF


section .text

; Set LEDs value
leds_set_value: ; A = Leds Value
    mov [LEDS_BASE], al
    ret

; Switch-ON All LEDs
leds_set_all_on:
    mov al, LEDS_ALL
    call leds_set_value
    ret


; Switch-OFF All LEDs
leds_set_all_off:
    mov al, LEDS_NONE
    call leds_set_value
    ret


