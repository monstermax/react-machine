; Author: yomax
; Date: 2026-02
; Name: lib_sprites
; Description: Graphics Sprites Library


section .data
    _spr_x_start   db 0            ; X de départ sauvegardé
    _spr_y_start   db 0            ; Y de départ sauvegardé
    _spr_row       db 0            ; compteur de ligne
    _spr_col       db 0            ; compteur de colonne


section .text
    global draw_sprite


; ============================================================================
; draw_sprite
;
; Input :
;   A:B = adresse du sprite en mémoire (low:high)
;   F   = X de départ (coin haut-gauche)
;   E   = Y de départ (coin haut-gauche)
;
; Sprite 16x16. Couleur 0x00 = transparent.
; ============================================================================


section .text
    global draw_sprite


draw_sprite:
    push al
    push bl
    push cl
    push dl
    push el
    push fl

    ; Sauvegarder position de départ
    mov [_spr_x_start], fl
    mov [_spr_y_start], el

    ; Pointeur sprite dans C:D
    mov cl, al
    mov dl, bl

    mov al, 0
    mov [_spr_row], al              ; row = 0

.spr2_row_loop:
    mov al, [_spr_row]
    cmp al, 16
    je .spr2_done

    mov al, 0
    mov [_spr_col], al              ; col = 0

.spr2_col_loop:
    mov al, [_spr_col]
    cmp al, 16
    je .spr2_next_row

    ; Lire couleur depuis [C:D]
    ldi al, cl, dl                  ; A = pixel color

    ; Si transparent, skip le dessin
    cmp al, 0
    je .spr2_skip

    ; Préparer F = X_start + col, E = Y_start + row pour screen_set_pixel
    mov fl, [_spr_x_start]
    mov bl, [_spr_col]
    add fl, bl                      ; F = X_start + col

    mov el, [_spr_y_start]
    mov bl, [_spr_row]
    add el, bl                      ; E = Y_start + row

    ; A contient déjà la couleur
    call screen_set_pixel

.spr2_skip:
    ; Avancer pointeur sprite
    push el
    mov el, 1
    call add_cd_e
    pop el

    inc [_spr_col]
    jmp .spr2_col_loop

.spr2_next_row:
    inc [_spr_row]
    jmp .spr2_row_loop

.spr2_done:
    pop fl
    pop el
    pop dl
    pop cl
    pop bl
    pop al
    ret

