
.include "bootloader/lib_math.asm"
.include "bootloader/lib_string.asm"


section .data
    ; Device table
    DEVICE_TABLE_COUNT  equ 0x0500
    DEVICE_TABLE_START  equ 0x0501
    DEVICE_ENTRY_SIZE   equ 6

    ; drivers constants
    LEDS_STATE_ALL_OFF  equ 0x00
    LEDS_STATE_HALF_1   equ 0x55
    LEDS_STATE_HALF_2   equ 0xAA

    ; Variables temporaires pour find_device
    _find_name_ptr   dw 0x0000
    _find_table_ptr  dw 0x0000
    _find_counter    db 0x00

    ; Strings des devices
    str_leds         db "leds", 0
    str_os_disk      db "os_disk", 0
    str_dma          db "dma", 0
    str_console      db "console", 0

    ; Résultats de la détection
    leds_device_idx     db 0x00
    leds_io_base        dw 0x0000
    os_disk_device_idx  db 0x00
    os_disk_io_base     dw 0x0000
    dma_device_idx      db 0x00
    dma_io_base         dw 0x0000
    console_device_idx  db 0x00
    console_io_base     dw 0x0000


section .text


; -----------------------------------------------
; FIND_DEVICE_BY_NAME
; Entrée : A:B = pointeur vers le nom cherché
; Sortie : C:D = pointeur vers l'entrée table (ou 0x0000)
; -----------------------------------------------
FIND_DEVICE_BY_NAME:
    ; Sauvegarder le nom cherché en RAM
    mov [_find_name_ptr], al
    mov [_find_name_ptr + 1], bl

    ; Lire le nombre de devices
    mov el, [DEVICE_TABLE_COUNT]
    cmp el, 0
    je FIND_DEVICE_NOT_FOUND ; aucune device presente
    mov [_find_counter], el

    ; Initialiser le pointeur table
    lea cl, dl, DEVICE_TABLE_START
    mov [_find_table_ptr], cl
    mov [_find_table_ptr + 1], dl

FIND_DEVICE_LOOP:
    ; Charger le pointeur table courant dans C:D
    ;lea cl, dl, [_find_table_ptr]
    mov cl, [_find_table_ptr]
    mov dl, [_find_table_ptr + 1]

    ; Avancer de 4 pour lire le name_ptr (offset +4)
    mov el, 4
    call ADD_CD_E

    ; Lire name_ptr (2 bytes, little-endian)
    ldi fl, cl, dl           ; low byte du name_ptr

    mov el, 1
    call ADD_CD_E
    ldi el, cl, dl           ; high byte du name_ptr

    ; C:D = pointeur vers le nom du device
    mov cl, fl
    mov dl, el

    ; A:B = pointeur vers le nom cherché
    mov al, [_find_name_ptr]
    mov bl, [_find_name_ptr + 1]

    ; Comparer
    call STRCMP
    je FIND_DEVICE_FOUND

    ; Pas trouvé, avancer au prochain entry
    mov cl, [_find_table_ptr]
    mov dl, [_find_table_ptr + 1]
    mov el, DEVICE_ENTRY_SIZE

    call ADD_CD_E
    mov [_find_table_ptr], cl
    mov [_find_table_ptr + 1], dl

    ; Décrémenter le compteur
    mov el, [_find_counter]
    dec el
    mov [_find_counter], el
    jnz FIND_DEVICE_LOOP

FIND_DEVICE_NOT_FOUND:
    ; Retourner 0x0000
    mov cl, 0
    mov dl, 0
    ret

FIND_DEVICE_FOUND:
    ; C:D = pointeur vers l'entrée table
    mov cl, [_find_table_ptr]
    mov dl, [_find_table_ptr + 1]
    ret



; == Initialisation des devices ==

; Device LEDs

; Détecter le device LEDs => Sortie : (C:D) = pointeur vers l'entrée table (ou 0x0000)
INIT_LEDS:
    lea al, bl, [str_leds]
    call FIND_DEVICE_BY_NAME

    ; C:D = pointeur entrée table (ou 0x0000)
    ; Vérifier si trouvé
    mov el, cl
    or el, dl
    jz LEDS_NOT_FOUND

    ldi fl, cl, dl ; lit l'idx du device au 1er emplacement de l'entrée
    mov [leds_device_idx], fl ; enregistre l'idx du device à l'adresse leds_device_idx

    ; Lire l'adresse I/O base (offset +2 dans l'entrée)
    mov el, 2
    call ADD_CD_E
    ldi fl, cl, dl           ; low byte de l'adresse I/O

    mov el, 1
    call ADD_CD_E
    ldi el, cl, dl           ; high byte

    ; Stocker dans leds_io_base
    mov [leds_io_base], fl
    mov [leds_io_base + 1], el

    ret

LEDS_NOT_FOUND:
    hlt ; LEDS not found


; Device OS_DISK

; Détecter le device OS_DISK => Sortie : (C:D) = pointeur vers l'entrée table (ou 0x0000)
INIT_OS_DISK:
    lea al, bl, [str_os_disk]
    call FIND_DEVICE_BY_NAME

    ; C:D = pointeur entrée table (ou 0x0000)
    ; Vérifier si trouvé
    mov el, cl
    or el, dl
    jz OS_DISK_NOT_FOUND

    ldi fl, cl, dl ; lit l'idx du device au 1er emplacement de l'entrée
    mov [os_disk_device_idx], fl ; enregistre l'idx du device à l'adresse os_disk_device_idx

    ; Lire l'adresse I/O base (offset +2 dans l'entrée)
    mov el, 2
    call ADD_CD_E
    ldi fl, cl, dl           ; low byte de l'adresse I/O

    mov el, 1
    call ADD_CD_E
    ldi el, cl, dl           ; high byte

    ; Stocker dans os_disk_io_base
    mov [os_disk_io_base], fl
    mov [os_disk_io_base + 1], el

    ret

OS_DISK_NOT_FOUND:
    hlt ; OS_DISK not found


; Device DMA

; Détecter le device DMA => Sortie : (C:D) = pointeur vers l'entrée table (ou 0x0000)
INIT_DMA:
    lea al, bl, [str_dma]
    call FIND_DEVICE_BY_NAME

    ; C:D = pointeur entrée table (ou 0x0000)
    ; Vérifier si trouvé
    mov el, cl
    or el, dl
    jz DMA_NOT_FOUND

    ldi fl, cl, dl ; lit l'idx du device au 1er emplacement de l'entrée
    mov [dma_device_idx], fl ; enregistre l'idx du device à l'adresse dma_device_idx

    ; Lire l'adresse I/O base (offset +2 dans l'entrée)
    mov el, 2
    call ADD_CD_E
    ldi fl, cl, dl           ; low byte de l'adresse I/O

    mov el, 1
    call ADD_CD_E
    ldi el, cl, dl           ; high byte

    ; Stocker dans dma_io_base
    mov [dma_io_base], fl
    mov [dma_io_base + 1], el

    ret

DMA_NOT_FOUND:
    hlt ; DMA not found


; Device CONSOLE

; Détecter le device CONSOLE => Sortie : (C:D) = pointeur vers l'entrée table (ou 0x0000)
INIT_CONSOLE:
    lea al, bl, [str_console]
    call FIND_DEVICE_BY_NAME

    ; C:D = pointeur entrée table (ou 0x0000)
    ; Vérifier si trouvé
    mov el, cl
    or el, dl
    jz CONSOLE_NOT_FOUND

    ldi fl, cl, dl ; lit l'idx du device au 1er emplacement de l'entrée
    mov [console_device_idx], fl ; enregistre l'idx du device à l'adresse console_device_idx

    ; Lire l'adresse I/O base (offset +2 dans l'entrée)
    mov el, 2
    call ADD_CD_E
    ldi fl, cl, dl           ; low byte de l'adresse I/O

    mov el, 1
    call ADD_CD_E
    ldi el, cl, dl           ; high byte

    ; Stocker dans console_io_base
    mov [console_io_base], fl
    mov [console_io_base + 1], el

    ret

CONSOLE_NOT_FOUND:
    hlt ; CONSOLE not found


