; Author: yomax
; Date: 2026-02
; Name: lib_devices
; Description: Lib devices for bootloader_v2


.include "bootloader/lib_math.asm"
.include "bootloader/lib_string.asm"


; Table Device Entry format :
; byte 1 : device index
; byte 2 : type
; byte 3 : I/O base low
; byte 4 : I/O base high
; byte 5 : name ptr low
; byte 6 : name ptr high


section .data
    ; Device table (256 bytes max : 0x0500-0x05FF)
    ; - table entries : 0x0500-0x057F (128 bytes)
    ; - devices names : 0x0580-0x05FF (128 bytes)

    DEVICE_TABLE_COUNT  equ 0x0500 ; adresse de la variable contenant le nombre de devices
    DEVICE_TABLE_START  equ 0x0501 ; adresse de début de la table d'entrées de devices
    DEVICE_ENTRY_SIZE   equ 6      ; taille de chaque entrée dans la table (6 bytes)
    ; DEVICE_MAX_ENTRIES  equ 20     ; 20 x 6 = 120 ; ne pas dépasser 128 bytes (sans compter les 128 bytes pour stocker les noms des devices)

    ; Variables temporaires pour find_device
    _find_name_ptr   dw 0x0000 ; variable contenant la string à rechercher
    _find_table_ptr  dw 0x0000 ; variable contenant le pointeur de la string à comparer (parmi les strings de la table, soit les bits 5/6 de chaque entrée)
    _find_counter    db 0x00   ; variable contenant le compteur de loop


section .text
    global find_device_by_name

; -----------------------------------------------
; find_device_by_name
; Entrée : A:B = pointeur vers le nom cherché
; Sortie : C:D = pointeur vers l'entrée table (ou 0x0000)
; -----------------------------------------------
find_device_by_name:
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
    call add_cd_e

    ; Lire name_ptr (2 bytes, little-endian)
    ldi fl, cl, dl           ; low byte du name_ptr

    mov el, 1
    call add_cd_e
    ldi el, cl, dl           ; high byte du name_ptr

    ; C:D = pointeur vers le nom du device
    mov cl, fl
    mov dl, el

    ; A:B = pointeur vers le nom cherché
    mov al, [_find_name_ptr]
    mov bl, [_find_name_ptr + 1]

    ; Comparer les strings
    call strcmp
    je FIND_DEVICE_FOUND

    ; Pas trouvé, avancer au prochain entry
    mov cl, [_find_table_ptr]
    mov dl, [_find_table_ptr + 1]
    mov el, DEVICE_ENTRY_SIZE

    call add_cd_e
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

