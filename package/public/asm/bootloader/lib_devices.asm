
section .data
    ; Device table
    DEVICE_TABLE_COUNT  equ 0x0500
    DEVICE_TABLE_START  equ 0x0501
    DEVICE_ENTRY_SIZE   equ 6

    ; Variables temporaires pour find_device
    _find_name_ptr   dw 0x0000
    _find_table_ptr  dw 0x0000
    _find_counter    db 0x00

    ; Strings des devices
    str_leds    db "leds", 0

    ; Résultats de la détection
    leds_io_base    dw 0x0000


section .text

; -----------------------------------------------
; ADD_CD_E : C:D += E
; -----------------------------------------------
ADD_CD_E:
    add dl, el
    jnc ADD_CD_E_END
    inc cl
ADD_CD_E_END:
    ret

; -----------------------------------------------
; ADD_AB_E : A:B += E
; -----------------------------------------------
ADD_AB_E:
    add bl, el
    jnc ADD_AB_E_END
    inc al
ADD_AB_E_END:
    ret

; -----------------------------------------------
; STRCMP : compare string [A:B] vs [C:D] (null-terminated)
; Résultat : flag zero=1 si égales
; -----------------------------------------------
STRCMP:
    ldi el, A, B
    ldi fl, C, D
    cmp el, fl
    jne STRCMP_END
    cmp el, 0
    je STRCMP_END
    mov el, 1
    call ADD_AB_E
    call ADD_CD_E
    jmp STRCMP
STRCMP_END:
    ret

; -----------------------------------------------
; FIND_DEVICE_BY_NAME
; Entrée : A:B = pointeur vers le nom cherché
; Sortie : C:D = pointeur vers l'entrée table (ou 0x0000)
; -----------------------------------------------
FIND_DEVICE_BY_NAME:
    ; Sauvegarder le nom cherché en RAM
    mov [_find_name_ptr], bl
    mov [_find_name_ptr + 1], al

    ; Lire le nombre de devices
    mov el, [DEVICE_TABLE_COUNT]
    cmp el, 0
    je FIND_DEVICE_NOT_FOUND
    mov [_find_counter], el

    ; Initialiser le pointeur table
    lea C, D, DEVICE_TABLE_START
    mov [_find_table_ptr], dl
    mov [_find_table_ptr + 1], cl

FIND_DEVICE_LOOP:
    ; Charger le pointeur table courant dans C:D
    lea C, D, [_find_table_ptr]

    ; Avancer de 4 pour lire le name_ptr (offset +4)
    mov el, 4
    call ADD_CD_E

    ; Lire name_ptr (2 bytes, little-endian)
    ldi fl, C, D           ; low byte du name_ptr
    mov el, 1
    call ADD_CD_E
    ldi el, C, D           ; high byte du name_ptr

    ; C:D = pointeur vers le nom du device
    mov cl, el
    mov dl, fl

    ; A:B = pointeur vers le nom cherché
    lea A, B, [_find_name_ptr]

    ; Comparer
    call STRCMP
    je FIND_DEVICE_FOUND

    ; Pas trouvé, avancer au prochain entry
    lea C, D, [_find_table_ptr]
    mov el, DEVICE_ENTRY_SIZE
    call ADD_CD_E
    mov [_find_table_ptr], dl
    mov [_find_table_ptr + 1], cl

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
    lea C, D, [_find_table_ptr]
    ret
