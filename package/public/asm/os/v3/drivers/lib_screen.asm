; Author: yomax
; Date: 2026-02
; Name: lib_screen
; Description: Screen Driver

; Screen I/O ports (relatifs à screen_io_base) :
;   +0 = PIXEL_X
;   +1 = PIXEL_Y
;   +2 = PIXEL_COLOR

; Couleur HSL : 0=rouge, 42=orange, 85=jaune/vert, 128=cyan, 170=bleu, 213=violet, 255=rouge


.include "os/v3/arithmetic/lib_math.asm"


section .data
    screen_io_base  dw 0xF030  ; TODO: reproduire/copier/importer le code du bootloader pour initialiser les devices

    ; Table de "pseudo-sinus" sur 32 valeurs (0-31)
    ; Approxime sin(x) * 16 + 16, mappé sur 0..31
    ; Utilisé pour les spirales et le plasma
    sin_table:
        sin_table_0 db 16, 19, 22, 24, 27, 29, 30, 31
        sin_table_1 db 31, 31, 30, 29, 27, 24, 22, 19
        sin_table_2 db 16, 13, 10,  8,  5,  3,  2,  1
        sin_table_3 db  1,  1,  2,  3,  5,  8, 10, 13


section .text
    global screen_print_pixel
    global screen_set_pixel
    global draw_rainbow_diagonal
    global draw_diamond
    global draw_xor_pattern
    global draw_spiral
    global draw_checkerboard_gradient
    global draw_tunnel
    global draw_fire_palette
    global draw_plasma


screen_print_pixel:
    ; get pixel x - @PIXEL_X = screen_io_base
    mov cl, [screen_io_base]
    mov dl, [screen_io_base + 1]
    ldi al, cl, dl

    ; set pixel x - @PIXEL_X = screen_io_base
    ;mov cl, [screen_io_base]
    ;mov dl, [screen_io_base + 1]
    ;mov al, 0
    sti cl, dl, al

    ; set pixel y - @PIXEL_Y = screen_io_base + 1
    call inc_cd
    ;mov al, 0
    sti cl, dl, al

    ; set pixel color - @PIXEL_COLOR = screen_io_base + 2
    call inc_cd
    push al ; sauvegarde A (la position courante)
    inc al ; incremente A (pour ne pas etre à 0 lors de la 1ere iteration)
    mov bl, 10 ; multiplie par 10 => couleur = poxition+1 * 10
    push cl
    push dl
    call mul8 ; A = A * B = couleur du pixel
    pop dl
    pop cl
    debug 7, al
    sti cl, dl, al
    pop al

    call dec_cd
    call dec_cd
    inc al
    sti cl, dl, al ; met à jour le prochain PIXEL_X

    ret



; ============================================================================
; SCREEN_SET_PIXEL - Écrit un pixel à (F, E) avec la couleur AL
;
; Input:  F = X, E = Y, AL = couleur
; Uses:   C:D comme pointeur I/O (sauvegardés)
; ============================================================================
screen_set_pixel:
    push cl
    push dl

    ; Charger l'adresse I/O base dans C:D
    ;lea cl, dl, [screen_io_base]
    mov cl, [screen_io_base]
    mov dl, [screen_io_base + 1]

    ; Écrire X (port +0)
    sti cl, dl, fl              ; [C:D] = F  (PIXEL_X = F)

    ; Avancer vers port +1 (PIXEL_Y)
    call inc_cd
    sti cl, dl, el              ; [C:D] = E  (PIXEL_Y = E)

    ; Avancer vers port +2 (PIXEL_COLOR)
    call inc_cd
    sti cl, dl, al              ; [C:D] = A  (PIXEL_COLOR = A)

    pop dl
    pop cl
    ret


; ============================================================================
; DRAW_RAINBOW_DIAGONAL
; Dessine un dégradé arc-en-ciel en diagonale sur tout l'écran
; Couleur = (X + Y*8) * 4  → wrapping naturel sur 8 bits
; Rendu : bandes de couleurs en diagonale
; ============================================================================
draw_rainbow_diagonal:
    push al
    push bl
    push el
    push fl

    mov el, 0                   ; E = Y = 0

.rainbow_loop_y:
    cmp el, 32
    je .rainbow_done

    mov fl, 0                   ; F = X = 0

.rainbow_loop_x:
    cmp fl, 32
    je .rainbow_next_y

    ; Couleur = (X + Y*8) * 4
    mov al, el                  ; A = Y
    shl al, 3                   ; A = Y * 8
    add al, fl                  ; A = Y*8 + X
    shl al, 2                   ; A = (Y*8 + X) * 4  (overflow = wrap = arc-en-ciel)

    call screen_set_pixel       ; pixel(F, E) = A

    inc fl
    jmp .rainbow_loop_x

.rainbow_next_y:
    inc el
    jmp .rainbow_loop_y

.rainbow_done:
    pop fl
    pop el
    pop bl
    pop al
    ret


; ============================================================================
; DRAW_DIAMOND
; Dessine un motif diamant/losange centré avec dégradé de couleur
; Couleur = |X - 16| + |Y - 16|   (distance de Manhattan au centre)
; puis * 8 pour couvrir tout le spectre
; Rendu : losange concentrique multicolore
; ============================================================================
draw_diamond:
    push al
    push bl
    push el
    push fl

    mov el, 0                   ; E = Y = 0

.diamond_loop_y:
    cmp el, 32
    je .diamond_done

    mov fl, 0                   ; F = X = 0

.diamond_loop_x:
    cmp fl, 32
    je .diamond_next_y

    ; Calcul |X - 16|
    mov al, fl
    cmp al, 16
    jge .diamond_x_pos
    ; X < 16 : |X-16| = 16 - X
    mov bl, al
    mov al, 16
    sub al, bl
    jmp .diamond_x_done
.diamond_x_pos:
    ; X >= 16 : |X-16| = X - 16
    sub al, 16
.diamond_x_done:

    push al                     ; sauvegarde |X-16|

    ; Calcul |Y - 16|
    mov al, el
    cmp al, 16
    jge .diamond_y_pos
    mov bl, al
    mov al, 16
    sub al, bl
    jmp .diamond_y_done
.diamond_y_pos:
    sub al, 16
.diamond_y_done:

    ; A = |Y-16|, pile = |X-16|
    pop bl                      ; B = |X-16|
    add al, bl                  ; A = |X-16| + |Y-16| = distance Manhattan

    shl al, 3                   ; A = distance * 8  (étale les couleurs)

    call screen_set_pixel

    inc fl
    jmp .diamond_loop_x

.diamond_next_y:
    inc el
    jmp .diamond_loop_y

.diamond_done:
    pop fl
    pop el
    pop bl
    pop al
    ret


; ============================================================================
; DRAW_XOR_PATTERN
; Dessine le classique motif XOR (fractale de Sierpinski)
; Couleur = (X XOR Y) * 8
; Rendu : motif fractal triangulaire multicolore (très iconique en demoscene)
; ============================================================================
draw_xor_pattern:
    push al
    push el
    push fl

    mov el, 0                   ; E = Y = 0

.xor_loop_y:
    cmp el, 32
    je .xor_done

    mov fl, 0                   ; F = X = 0

.xor_loop_x:
    cmp fl, 32
    je .xor_next_y

    ; Couleur = (X XOR Y) * 8
    mov al, fl
    xor al, el                  ; A = X XOR Y
    shl al, 3                   ; A *= 8

    call screen_set_pixel

    inc fl
    jmp .xor_loop_x

.xor_next_y:
    inc el
    jmp .xor_loop_y

.xor_done:
    pop fl
    pop el
    pop al
    ret




; ============================================================================
; DRAW_SPIRAL
; Dessine un motif spirale depuis le centre
; Utilise une approximation : angle ≈ atan2 via octants + distance
; Couleur = (distance * 8 + angle_approx * 4) → spirale multicolore
;
; Simplification : angle_approx = (dx - dy) pour un look spiralé
; distance = max(|dx|, |dy|) + min(|dx|, |dy|) / 2  (approx octogonale)
; ============================================================================
draw_spiral:
    push al
    push bl
    push cl
    push dl
    push el
    push fl

    mov el, 0                       ; E = Y

.spiral_loop_y:
    cmp el, 32
    je .spiral_done

    mov fl, 0                       ; F = X

.spiral_loop_x:
    cmp fl, 32
    je .spiral_next_y

    ; --- dx = X - 16 (signé en 8-bit wrapping) ---
    mov al, fl
    sub al, 16                      ; A = dx (peut wrapper, c'est ok)

    ; --- dy = Y - 16 ---
    mov bl, el
    sub bl, 16                      ; B = dy

    ; --- "angle" approx = dx + dy*2 ---
    mov cl, bl
    shl cl, 1                       ; C = dy * 2
    add cl, al                      ; C = dx + dy*2 (angle-ish)

    ; --- distance approx = |dx| XOR |dy| + (|dx| AND |dy|) ---
    ; Simplifié : on fait juste dx*dx_approx via shifts
    ; En fait on va faire : couleur = C*6 + distance*10
    ; où distance = (|dx| + |dy|) simple

    ; |dx|
    push cl                         ; sauvegarde angle
    mov cl, al
    test cl, 0x80                   ; test signe
    jz .spiral_dx_pos
    not cl
    inc cl                          ; cl = |dx| (negate)
.spiral_dx_pos:

    ; |dy|
    mov dl, bl
    test dl, 0x80
    jz .spiral_dy_pos
    not dl
    inc dl                          ; dl = |dy|
.spiral_dy_pos:

    ; distance = |dx| + |dy|
    add cl, dl                      ; C = distance Manhattan

    pop al                          ; A = angle approx

    ; Couleur = angle * 4 + distance * 8
    push cl                         ; sauvegarde distance
    shl al, 2                       ; A = angle * 4
    pop cl
    shl cl, 3                       ; C = distance * 8
    add al, cl                      ; A = angle*4 + distance*8

    call screen_set_pixel

    inc fl
    jmp .spiral_loop_x

.spiral_next_y:
    inc el
    jmp .spiral_loop_y

.spiral_done:
    pop fl
    pop el
    pop dl
    pop cl
    pop bl
    pop al
    ret


; ============================================================================
; DRAW_CHECKERBOARD_GRADIENT
; Damier avec dégradé de couleur : chaque case change de teinte
; Case = (X/4 + Y/4), couleur alterne entre deux teintes espacées
; Rendu : damier psychédélique
; ============================================================================
draw_checkerboard_gradient:
    push al
    push bl
    push el
    push fl

    mov el, 0                       ; E = Y

.checker_loop_y:
    cmp el, 32
    je .checker_done

    mov fl, 0                       ; F = X

.checker_loop_x:
    cmp fl, 32
    je .checker_next_y

    ; case_x = X / 4
    mov al, fl
    shr al, 2                       ; A = X / 4

    ; case_y = Y / 4
    mov bl, el
    shr bl, 2                       ; B = Y / 4

    ; base_color = (case_x + case_y) * 16
    add al, bl                      ; A = case_x + case_y
    shl al, 4                       ; A = (case_x + case_y) * 16

    ; Alternance : si (case_x + case_y) est impair → +128
    mov bl, fl
    shr bl, 2
    mov cl, el
    shr cl, 2
    add bl, cl
    test bl, 1                      ; test bit 0
    jz .checker_even
    add al, 128                     ; décale la teinte de 180° (couleur complémentaire)
.checker_even:

    call screen_set_pixel

    inc fl
    jmp .checker_loop_x

.checker_next_y:
    inc el
    jmp .checker_loop_y

.checker_done:
    pop fl
    pop el
    pop bl
    pop al
    ret


; ============================================================================
; DRAW_TUNNEL
; Simule un effet tunnel (zoom infini vers le centre)
; Couleur = distance_from_center XOR (distance * 3)
; Le XOR crée des anneaux brisés, *3 étale les couleurs
; Rendu : effet hypnotique de cercles concentriques fracturés
; ============================================================================
draw_tunnel:
    push al
    push bl
    push cl
    push dl
    push el
    push fl

    mov el, 0                       ; E = Y

.tunnel_loop_y:
    cmp el, 32
    je .tunnel_done

    mov fl, 0                       ; F = X

.tunnel_loop_x:
    cmp fl, 32
    je .tunnel_next_y

    ; |dx| = |X - 16|
    mov al, fl
    cmp al, 16
    jge .tunnel_dx_pos
    mov bl, 16
    sub bl, al
    mov al, bl
    jmp .tunnel_dx_done
.tunnel_dx_pos:
    sub al, 16
.tunnel_dx_done:
    ; A = |dx|

    ; |dy| = |Y - 16|
    mov bl, el
    cmp bl, 16
    jge .tunnel_dy_pos
    mov cl, 16
    sub cl, bl
    mov bl, cl
    jmp .tunnel_dy_done
.tunnel_dy_pos:
    sub bl, 16
.tunnel_dy_done:
    ; B = |dy|

    ; Approximation distance = max(|dx|,|dy|) + min(|dx|,|dy|)/2
    ; (approximation octogonale, meilleure que Manhattan)
    cmp al, bl
    jge .tunnel_a_bigger
    ; B > A : max=B, min=A
    mov cl, al                      ; C = min = A
    shr cl, 1                       ; C = min/2
    add cl, bl                      ; C = max + min/2
    jmp .tunnel_dist_done
.tunnel_a_bigger:
    ; A >= B : max=A, min=B
    mov cl, bl                      ; C = min = B
    shr cl, 1                       ; C = min/2
    add cl, al                      ; C = max + min/2
.tunnel_dist_done:
    ; C = distance approximée

    ; Couleur = dist XOR (dist * 3)
    mov al, cl                      ; A = dist
    mov bl, cl
    shl bl, 1                       ; B = dist * 2
    add bl, cl                      ; B = dist * 3
    xor al, bl                      ; A = dist XOR (dist*3)

    shl al, 2                       ; étaler un peu plus

    call screen_set_pixel

    inc fl
    jmp .tunnel_loop_x

.tunnel_next_y:
    inc el
    jmp .tunnel_loop_y

.tunnel_done:
    pop fl
    pop el
    pop dl
    pop cl
    pop bl
    pop al
    ret


; ============================================================================
; DRAW_FIRE_PALETTE
; Dégradé vertical type "palette de feu"
; Bas de l'écran = rouge/orange, haut = bleu/violet
; Avec un peu de variation horizontale pour le relief
; Couleur = (31 - Y) * 8 + (X XOR Y) * 1
; Rendu : flammes stylisées
; ============================================================================
draw_fire_palette:
    push al
    push bl
    push el
    push fl

    mov el, 0                       ; E = Y

.fire_loop_y:
    cmp el, 32
    je .fire_done

    mov fl, 0                       ; F = X

.fire_loop_x:
    cmp fl, 32
    je .fire_next_y

    ; Base = (31 - Y) * 8  → dégradé vertical (rouge en bas, bleu en haut)
    mov al, 31
    sub al, el                      ; A = 31 - Y
    shl al, 3                       ; A = (31-Y) * 8

    ; Perturbation = (X XOR Y) & 0x0F  → un peu de texture
    mov bl, fl
    xor bl, el
    and bl, 0x0F                    ; garde les 4 bits bas
    add al, bl                      ; ajoute la perturbation

    call screen_set_pixel

    inc fl
    jmp .fire_loop_x

.fire_next_y:
    inc el
    jmp .fire_loop_y

.fire_done:
    pop fl
    pop el
    pop bl
    pop al
    ret




; ============================================================================
; DRAW_PLASMA
; Simule un effet plasma old-school avec une table de sinus
; Couleur = sin[X] + sin[Y] + sin[(X+Y) & 31]  puis * 4
; Rendu : bulles arrondies multicolores (style Amiga/demoscene)
; ============================================================================
draw_plasma:
    push al
    push bl
    push cl
    push dl
    push el
    push fl

    mov el, 0                       ; E = Y

.plasma_loop_y:
    cmp el, 32
    je .plasma_done

    mov fl, 0                       ; F = X

.plasma_loop_x:
    cmp fl, 32
    je .plasma_next_y

    ; --- sin[X] ---
    mov al, fl
    and al, 31                      ; index mod 32
    ; Lecture sin_table[AL] via pointeur
    push cl
    push dl
    lea cl, dl, sin_table
    push el
    mov el, al
    call add_cd_e                   ; C:D = &sin_table + index
    pop el
    ldi al, cl, dl                  ; A = sin_table[X]
    pop dl
    pop cl
    push al                         ; sauvegarde sin[X]

    ; --- sin[Y] ---
    mov al, el
    and al, 31
    push cl
    push dl
    lea cl, dl, sin_table
    push el
    mov el, al
    call add_cd_e
    pop el
    ldi al, cl, dl                  ; A = sin_table[Y]
    pop dl
    pop cl
    push al                         ; sauvegarde sin[Y]

    ; --- sin[(X+Y) & 31] ---
    mov al, fl
    add al, el
    and al, 31
    push cl
    push dl
    lea cl, dl, sin_table
    push el
    mov el, al
    call add_cd_e
    pop el
    ldi bl, cl, dl                  ; B = sin_table[(X+Y) & 31]
    pop dl
    pop cl

    ; Somme : A = sin[X] + sin[Y] + sin[(X+Y)]
    pop al                          ; A = sin[Y]
    add al, bl                      ; A = sin[Y] + sin[(X+Y)]
    pop bl                          ; B = sin[X]
    add al, bl                      ; A = sin[X] + sin[Y] + sin[(X+Y)]

    ; Étaler sur le spectre
    shl al, 2                       ; A *= 4

    call screen_set_pixel

    inc fl
    jmp .plasma_loop_x

.plasma_next_y:
    inc el
    jmp .plasma_loop_y

.plasma_done:
    pop fl
    pop el
    pop dl
    pop cl
    pop bl
    pop al
    ret


