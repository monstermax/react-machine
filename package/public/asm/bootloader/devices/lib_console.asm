; Author: yomax
; Date: 2026-02
; Name: lib_console
; Description: Lib console for bootloader_v2


.include "bootloader/lib_devices.asm"
.include "bootloader/lib_math.asm"


section .data
    console_device_idx  db 0x00
    console_io_base     dw 0x0000

    str_console         db "console", 0 ; libellé du device


section .text
    global init_console_device
    global console_print_char
    global console_print_string


; print a CHAR on CONSOLE (INPUT => A = ASCII CHAR)
console_print_char:
    mov el, [console_io_base]     ; low  byte de l'adresse de la variable console_io_base
    mov fl, [console_io_base + 1] ; high byte de l'adresse de la variable console_io_base
    sti el, fl, al ; [e:f] = A
    ret


; print a STRING on CONSOLE (INPUT => (C:D) = string buffer address)
console_print_string:
    CONSOLE_PRINT_STRING_LOOP:
    ; Lire caractère depuis buffer
    ldi al, cl, dl ; A = [C:D]

    ; Vérifier si \0 (fin de string)
    cmp al, 0x00                   ; A = 0
    jz CONSOLE_PRINT_STRING_END    ; Si \0, terminer

    ; Afficher le caractère
    call console_print_char

    ; Incrémenter pointeur C:D
    mov el, 1
    call add_cd_e
    jmp CONSOLE_PRINT_STRING_LOOP

    CONSOLE_PRINT_STRING_END:
    ret



; Détecter le device CONSOLE => Sortie : (C:D) = pointeur vers l'entrée table (ou 0x0000)
init_console_device:
    lea al, bl, [str_console]
    call find_device_by_name

    ; C:D = pointeur entrée table (ou 0x0000)
    ; Vérifier si trouvé
    mov el, cl
    or el, dl
    jz CONSOLE_NOT_FOUND

    ldi fl, cl, dl ; lit l'idx du device au 1er emplacement de l'entrée
    mov [console_device_idx], fl ; enregistre l'idx du device à l'adresse console_device_idx

    ; Lire l'adresse I/O base (offset +2 dans l'entrée)
    mov el, 2
    call add_cd_e
    ldi fl, cl, dl           ; low byte de l'adresse I/O

    mov el, 1
    call add_cd_e
    ldi el, cl, dl           ; high byte

    ; Stocker dans console_io_base
    mov [console_io_base], fl
    mov [console_io_base + 1], el
    ret

    CONSOLE_NOT_FOUND:
    ;hlt
    ret ; CONSOLE not found

