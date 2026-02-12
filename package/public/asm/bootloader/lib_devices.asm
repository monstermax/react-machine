
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
    add cl, el
    jnc ADD_CD_E_END
    inc dl
ADD_CD_E_END:
    ret

; -----------------------------------------------
; ADD_AB_E : A:B += E
; -----------------------------------------------
ADD_AB_E:
    add al, el
    jnc ADD_AB_E_END
    inc bl
ADD_AB_E_END:
    ret

; -----------------------------------------------
; STRCMP : compare string [A:B] vs [C:D] (null-terminated)
; Résultat : flag zero=1 si égales
; -----------------------------------------------
STRCMP:
    ldi el, al, bl ; E = [A:B]
    ldi fl, cl, dl ; F = [C:D]
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

    ;debug 1, cl
    ;debug 1, dl
    ;debug 1, el
    ;debug 1, fl
    ;hlt

    ; C:D = pointeur vers le nom du device
    mov cl, el
    mov dl, fl

    ; A:B = pointeur vers le nom cherché
    lea al, bl, [_find_name_ptr]


    ; Comparer
    call STRCMP
    je FIND_DEVICE_FOUND

    ; Pas trouvé, avancer au prochain entry
    lea cl, dl, [_find_table_ptr]
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
    lea cl, dl, [_find_table_ptr]
    ret
