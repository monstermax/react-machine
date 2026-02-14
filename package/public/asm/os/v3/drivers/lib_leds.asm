; Author: yomax
; Date: 2026-01
; Name: lib_leds
; Description: LEDs Display Driver


; DEPREACTED / EDIT ME => voir lib_leds du bootloader


section .data
    leds_io_base  dw 0xF020  ; TODO: reproduire/copier/importer le code du bootloader pour initialiser les devices

    LEDS_STATE_ALL_OFF  equ 0x00
    LEDS_STATE_ALL_ON   equ 0xFF


section .text
    global leds_get_value
    global leds_set_value
    global leds_set_all
    global leds_set_none



; Retourne la valeur des LEDS dans A
leds_get_value:
    mov cl, [leds_io_base]
    mov dl, [leds_io_base+1]
    ldi al, cl, dl
    ret


; Set LEDs value => INPUT : A = LEDs value
leds_set_value:
    mov cl, [leds_io_base]
    mov dl, [leds_io_base+1]
    sti cl, dl, al

    ret


; Switch on all LEDs (no required input)
leds_set_all:
    mov al, LEDS_STATE_ALL_ON
    call leds_set_value
    ret


; Switch off all LEDs (no required input)
leds_set_none:
    mov al, LEDS_STATE_ALL_OFF
    call leds_set_value
    ret

