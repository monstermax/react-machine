; Author: yomax
; Date: 2026-02
; Name: lib_leds
; Description: Lib LEDs for bootloader_v2


.include "bootloader/lib_devices.asm"
.include "bootloader/lib_math.asm"


section .data
    leds_device_idx     db 0x00
    leds_io_base        dw 0x0000

    str_leds            db "leds", 0 ; libellé du device

    LEDS_STATE_ALL_OFF  equ 0x00
    LEDS_STATE_ALL_ON   equ 0xFF


section .text
    global init_leds_device
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


; Détecter le device LEDs => Sortie : (C:D) = pointeur vers l'entrée table (ou 0x0000)
init_leds_device:
    lea al, bl, [str_leds]
    call find_device_by_name

    ; C:D = pointeur entrée table (ou 0x0000)
    ; Vérifier si trouvé
    mov el, cl
    or el, dl
    jz LEDS_NOT_FOUND

    ldi fl, cl, dl ; lit l'idx du device au 1er emplacement de l'entrée
    mov [leds_device_idx], fl ; enregistre l'idx du device à l'adresse leds_device_idx

    ; Lire l'adresse I/O base (offset +2 dans l'entrée)
    mov el, 2
    call add_cd_e
    ldi fl, cl, dl           ; low byte de l'adresse I/O

    mov el, 1
    call add_cd_e
    ldi el, cl, dl           ; high byte

    ; Stocker dans leds_io_base
    mov [leds_io_base], fl
    mov [leds_io_base + 1], el
    ret

    LEDS_NOT_FOUND:
    ;hlt
    ret ; LEDS not found

