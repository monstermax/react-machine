; Author: Claude + yomax
; Date: 2026-02
; Name: demo_sprites_pack1
; Description: Dessine Mario et Sonic en pixel art sur l'écran 32x32

; Dépendances : lib_sprites.asm (draw_sprite)
;
; Convention screen_set_pixel : F=X, E=Y, AL=couleur
;
; Palette de couleurs (valeur -> teinte HSL approximative) :
;   0x00 = transparent (noir, on skip)
;   0x01 = rouge            (hue ≈ 1°)
;   0x18 = orange/peau      (hue ≈ 34°)
;   0x2A = jaune             (hue ≈ 59°)
;   0x55 = vert              (hue ≈ 120°)
;   0x6E = cyan/turquoise   (hue ≈ 156°)
;   0x80 = bleu clair        (hue ≈ 181°)
;   0xAA = bleu foncé        (hue ≈ 240°)
;   0xD5 = violet            (hue ≈ 300°)
;   0xF0 = rose/magenta     (hue ≈ 339°)
;   0xFF = rouge (wrap)      (hue ≈ 360°)
;
; Couleurs choisies pour les persos :
;   Mario : R=0x01 (rouge), S=0x18 (peau), B=0xAA (bleu), W=0x2A (jaune/boutons), K=0x08 (marron foncé)
;   Sonic : U=0x80 (bleu), S=0x18 (peau), W=0x2A (jaune), R=0x01 (rouge), K=0x08 (marron foncé)


; TODO: fix le compilateur pour gérer ces cas :
; 1) reference à un autre identifier
; _R equ COL_RED
; 2) identifier multi lignes
; sprite_mario:
;     db _X, _X
;     db _X, _X
;     ...


.include "os/v3/graphics/lib_sprites.asm"


section .data
    screen_io_base  dw 0xF030

    ; --- Couleurs ---
    COL_TRANSPARENT equ 0x00
    COL_RED         equ 0x01
    COL_BROWN       equ 0x08
    COL_SKIN        equ 0x18
    COL_YELLOW      equ 0x2A
    COL_GREEN       equ 0x55
    COL_BLUE_LIGHT  equ 0x80
    COL_BLUE_DARK   equ 0xAA
    COL_WHITE       equ 0xC0


; ============================================================================
; SPRITE : Mario 16x16
; Légende : .=transparent, R=rouge, S=peau, B=bleu, K=marron, Y=jaune, W=blanc
;
;     . . . . . R R R R R . . . . . .     row 0
;     . . . . R R R R R R R R R . . .     row 1
;     . . . . K K K S S K S . . . . .     row 2
;     . . . K S K S S S K S S S . . .     row 3
;     . . . K S K K S S S K S S S . .     row 4
;     . . . K K S S S S K K K K . . .     row 5
;     . . . . . S S S S S S S . . . .     row 6
;     . . . . R R B R R B R . . . . .     row 7
;     . . . R R R B R R B R R R . . .     row 8
;     . . R R R R B B B B R R R R . .     row 9
;     . . S S R B Y B B Y B R S S . .     row 10
;     . . S S S B B B B B B S S S . .     row 11
;     . . S S B B B B B B B B S S . .     row 12
;     . . . . B B B . . B B B . . . .     row 13
;     . . . K K K . . . . K K K . . .     row 14
;     . . K K K K . . . . K K K K . .     row 15
; ============================================================================

    _R equ COL_RED
    _S equ COL_SKIN
    _B equ COL_BLUE_DARK
    _K equ COL_BROWN
    _Y equ COL_YELLOW
    _W equ COL_WHITE
    _X equ COL_TRANSPARENT


sprite_mario:
    db _X, _X, _X, _X, _X, _R, _R, _R, _R, _R, _X, _X, _X, _X, _X, _X ; row 0 :  . . . . . R R R R R . . . . . .
    db _X, _X, _X, _X, _R, _R, _R, _R, _R, _R, _R, _R, _R, _X, _X, _X ; row 1 :  . . . . R R R R R R R R R . . .
    db _X, _X, _X, _X, _K, _K, _K, _S, _S, _K, _S, _X, _X, _X, _X, _X ; row 2 :  . . . . K K K S S K S . . . . .
    db _X, _X, _X, _K, _S, _K, _S, _S, _S, _K, _S, _S, _S, _X, _X, _X ; row 3 :  . . . K S K S S S K S S S . . .
    db _X, _X, _X, _K, _S, _K, _K, _S, _S, _S, _K, _S, _S, _S, _X, _X ; row 4 :  . . . K S K K S S S K S S S . .
    db _X, _X, _X, _K, _K, _S, _S, _S, _S, _K, _K, _K, _K, _X, _X, _X ; row 5 :  . . . K K S S S S K K K K . . .
    db _X, _X, _X, _X, _X, _S, _S, _S, _S, _S, _S, _S, _X, _X, _X, _X ; row 6 :  . . . . . S S S S S S S . . . .
    db _X, _X, _X, _X, _R, _R, _B, _R, _R, _B, _R, _X, _X, _X, _X, _X ; row 7 :  . . . . R R B R R B R . . . . .
    db _X, _X, _X, _R, _R, _R, _B, _R, _R, _B, _R, _R, _R, _X, _X, _X ; row 8 :  . . . R R R B R R B R R R . . .
    db _X, _X, _R, _R, _R, _R, _B, _B, _B, _B, _R, _R, _R, _R, _X, _X ; row 9 :  . . R R R R B B B B R R R R . .
    db _X, _X, _S, _S, _R, _B, _Y, _B, _B, _Y, _B, _R, _S, _S, _X, _X ; row 10 : . . S S R B Y B B Y B R S S . .
    db _X, _X, _S, _S, _S, _B, _B, _B, _B, _B, _B, _S, _S, _S, _X, _X ; row 11 : . . S S S B B B B B B S S S . .
    db _X, _X, _S, _S, _B, _B, _B, _B, _B, _B, _B, _B, _S, _S, _X, _X ; row 12 : . . S S B B B B B B B B S S . .
    db _X, _X, _X, _X, _B, _B, _B, _X, _X, _B, _B, _B, _X, _X, _X, _X ; row 13 : . . . . B B B . . B B B . . . .
    db _X, _X, _X, _K, _K, _K, _X, _X, _X, _X, _K, _K, _K, _X, _X, _X ; row 14 : . . . K K K . . . . K K K . . .
    db _X, _X, _K, _K, _K, _K, _X, _X, _X, _X, _K, _K, _K, _K, _X, _X ; row 15 : . . K K K K . . . . K K K K . .

sprite_mario_end:


; ============================================================================
; SPRITE : Sonic 16x16
; Couleurs : U=bleu clair, S=peau, K=marron foncé, R=rouge, Y=jaune, W=blanc
;
;     . . . . . . . . U U U . . . . .     row 0
;     . . . . . . U U U U U U . . . .     row 1
;     . . . . . U U U U U U U U . . .     row 2
;     . . . . U U U U U U U U . . . .     row 3
;     . . . U U U U U U U . . . . . .     row 4
;     . . U U U K S S S S . . . . . .     row 5
;     . . U U K W K S S S S . . . . .     row 6
;     . . U U K W K S K S S . . . . .     row 7
;     . . . U U K S S S S . . . . . .     row 8
;     . . . . U U S S Y S . . . . . .     row 9
;     . . . . . U U U U U U . . . . .     row 10
;     . . . . R R U U U U . . . . . .     row 11
;     . . . R R R R U U R R . . . . .     row 12
;     . . . . S S . . . S S . . . . .     row 13
;     . . . . S S . . . S S . . . . .     row 14
;     . . . R R R . . . R R R . . . .     row 15
; ============================================================================

_U equ COL_BLUE_LIGHT

sprite_sonic:
    db _X, _X, _X, _X, _X, _X, _X, _X, _U, _U, _U, _X, _X, _X, _X, _X ; row 0
    db _X, _X, _X, _X, _X, _X, _U, _U, _U, _U, _U, _U, _X, _X, _X, _X ; row 1
    db _X, _X, _X, _X, _X, _U, _U, _U, _U, _U, _U, _U, _U, _X, _X, _X ; row 2
    db _X, _X, _X, _X, _U, _U, _U, _U, _U, _U, _U, _U, _X, _X, _X, _X ; row 3
    db _X, _X, _X, _U, _U, _U, _U, _U, _U, _U, _X, _X, _X, _X, _X, _X ; row 4
    db _X, _X, _U, _U, _U, _K, _S, _S, _S, _S, _X, _X, _X, _X, _X, _X ; row 5 : piquants -> visage
    db _X, _X, _U, _U, _K, _W, _K, _S, _S, _S, _S, _X, _X, _X, _X, _X ; row 6 : oeil
    db _X, _X, _U, _U, _K, _W, _K, _S, _K, _S, _S, _X, _X, _X, _X, _X ; row 7 : oeil + nez
    db _X, _X, _X, _U, _U, _K, _S, _S, _S, _S, _X, _X, _X, _X, _X, _X ; row 8
    db _X, _X, _X, _X, _U, _U, _S, _S, _Y, _S, _X, _X, _X, _X, _X, _X ; row 9 : bouche (Y = jaune = sourire)
    db _X, _X, _X, _X, _X, _U, _U, _U, _U, _U, _U, _X, _X, _X, _X, _X ; row 10 : corps
    db _X, _X, _X, _X, _R, _R, _U, _U, _U, _U, _X, _X, _X, _X, _X, _X ; row 11
    db _X, _X, _X, _R, _R, _R, _R, _U, _U, _R, _R, _X, _X, _X, _X, _X ; row 12
    db _X, _X, _X, _X, _S, _S, _X, _X, _X, _S, _S, _X, _X, _X, _X, _X ; row 13 : jambes
    db _X, _X, _X, _X, _S, _S, _X, _X, _X, _S, _S, _X, _X, _X, _X, _X ; row 14
    db _X, _X, _X, _R, _R, _R, _X, _X, _X, _R, _R, _R, _X, _X, _X, _X ; row 15 : chaussures rouges

sprite_sonic_end:


section .text
    global draw_mario
    global draw_sonic
    global draw_mario_and_sonic



; ============================================================================
; DRAW_MARIO - Dessine Mario à la position (1, 8)
; ============================================================================
draw_mario:
    push al
    push bl
    push el
    push fl

    lea al, bl, sprite_mario        ; A:B = adresse du sprite Mario
    mov fl, 1                       ; X = 1 (côté gauche)
    mov el, 8                       ; Y = 8 (centré verticalement)
    call draw_sprite

    pop fl
    pop el
    pop bl
    pop al
    ret


; ============================================================================
; DRAW_SONIC - Dessine Sonic à la position (16, 8)
; ============================================================================
draw_sonic:
    push al
    push bl
    push el
    push fl

    lea al, bl, sprite_sonic        ; A:B = adresse du sprite Sonic
    mov fl, 16                      ; X = 16 (côté droit)
    mov el, 8                       ; Y = 8
    call draw_sprite

    pop fl
    pop el
    pop bl
    pop al
    ret


; ============================================================================
; DRAW_MARIO_AND_SONIC - Dessine les deux côte à côte
; ============================================================================
draw_mario_and_sonic:
    call draw_mario
    call draw_sonic
    ret
