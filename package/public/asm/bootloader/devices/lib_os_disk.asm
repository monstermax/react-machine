; Author: yomax
; Date: 2026-02
; Name: lib_os_disk
; Description: Lib os_disk for bootloader_v2


.include "bootloader/lib_devices.asm"
.include "bootloader/lib_math.asm"


section .data
    os_disk_device_idx  db 0x00
    os_disk_io_base     dw 0x0000

    str_os_disk         db "os_disk", 0 ; libellé du device


section .text
    global init_os_disk_device



; Détecter le device OS_DISK => Sortie : (C:D) = pointeur vers l'entrée table (ou 0x0000)
init_os_disk_device:
    lea al, bl, [str_os_disk]
    call find_device_by_name

    ; C:D = pointeur entrée table (ou 0x0000)
    ; Vérifier si trouvé
    mov el, cl
    or el, dl
    jz OS_DISK_NOT_FOUND

    ldi fl, cl, dl ; lit l'idx du device au 1er emplacement de l'entrée
    mov [os_disk_device_idx], fl ; enregistre l'idx du device à l'adresse os_disk_device_idx

    ; Lire l'adresse I/O base (offset +2 dans l'entrée)
    mov el, 2
    call add_cd_e
    ldi fl, cl, dl           ; low byte de l'adresse I/O

    mov el, 1
    call add_cd_e
    ldi el, cl, dl           ; high byte

    ; Stocker dans os_disk_io_base
    mov [os_disk_io_base], fl
    mov [os_disk_io_base + 1], el
    ret

    OS_DISK_NOT_FOUND:
    ;hlt
    ret ; OS_DISK not found
