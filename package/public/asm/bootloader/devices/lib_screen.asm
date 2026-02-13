; Author: yomax
; Date: 2026-02
; Name: lib_screen
; Description: Lib screen for bootloader_v2


.include "bootloader/lib_devices.asm"
.include "bootloader/lib_math.asm"


section .data
    screen_device_idx  db 0x00
    screen_io_base     dw 0x0000

    str_screen         db "screen", 0 ; libellé du device


section .text
    global init_screen_device


; Détecter le device SCREEN => Sortie : (C:D) = pointeur vers l'entrée table (ou 0x0000)
init_screen_device:
    lea al, bl, [str_screen]
    call find_device_by_name

    ; C:D = pointeur entrée table (ou 0x0000)
    ; Vérifier si trouvé
    mov el, cl
    or el, dl
    jz SCREEN_NOT_FOUND

    ldi fl, cl, dl ; lit l'idx du device au 1er emplacement de l'entrée
    mov [screen_device_idx], fl ; enregistre l'idx du device à l'adresse screen_device_idx

    ; Lire l'adresse I/O base (offset +2 dans l'entrée)
    mov el, 2
    call add_cd_e
    ldi fl, cl, dl           ; low byte de l'adresse I/O

    mov el, 1
    call add_cd_e
    ldi el, cl, dl           ; high byte

    ; Stocker dans screen_io_base
    mov [screen_io_base], fl
    mov [screen_io_base + 1], el
    ret

    SCREEN_NOT_FOUND:
    ;hlt
    ret ; SCREEN not found

