; Author: Claude + yomax
; Date: 2026-02
; Name: demo_sprites_pack2
; Description: Collection de sprites 16x16 en pixel art
;
; Dépendances : lib_sprites.asm (draw_sprite)
;
; Convention draw_sprite : A:B=adresse sprite, F=X, E=Y


.include "os/v3/graphics/lib_sprites.asm"


section .data

; --- Palette ---
COL_TRANSPARENT equ 0x00
COL_RED         equ 0x01
COL_BROWN       equ 0x08
COL_SKIN        equ 0x18
COL_YELLOW      equ 0x2A
COL_GREEN       equ 0x55
COL_CYAN        equ 0x6E
COL_BLUE_LIGHT  equ 0x80
COL_BLUE_DARK   equ 0xAA
COL_PURPLE      equ 0xBB
COL_PINK        equ 0xD5
COL_WHITE       equ 0xC0
COL_ORANGE      equ 0x10

_X equ COL_TRANSPARENT


; ============================================================================
; PAC-MAN 16x16 (bouche ouverte, orienté droite)
;
;     . . . . . . Y Y Y Y Y . . . . .
;     . . . . Y Y Y Y Y Y Y Y . . . .
;     . . . Y Y Y Y Y Y Y Y Y Y . . .
;     . . Y Y Y Y Y Y Y Y Y Y Y . . .
;     . Y Y Y Y Y Y Y Y Y Y . . . . .
;     . Y Y Y Y Y Y Y Y Y . . . . . .
;     Y Y Y Y Y Y Y Y Y . . . . . . .
;     Y Y Y Y Y Y Y Y . . . . . . . .
;     Y Y Y Y Y Y Y Y . . . . . . . .
;     Y Y Y Y Y Y Y Y Y . . . . . . .
;     . Y Y Y Y Y Y Y Y Y . . . . . .
;     . Y Y Y Y Y Y Y Y Y Y . . . . .
;     . . Y Y Y Y Y Y Y Y Y Y Y . . .
;     . . . Y Y Y Y Y Y Y Y Y Y . . .
;     . . . . Y Y Y Y Y Y Y Y . . . .
;     . . . . . . Y Y Y Y Y . . . . .
; ============================================================================

_Y equ COL_YELLOW

sprite_pacman:
    db _X, _X, _X, _X, _X, _X, _Y, _Y, _Y, _Y, _Y, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _X, _X, _X, _X
    db _X, _X, _X, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _X, _X, _X
    db _X, _X, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _X, _X, _X
    db _X, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _X, _X, _X, _X, _X
    db _X, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _X, _X, _X, _X, _X, _X
    db _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _X, _X, _X, _X, _X, _X, _X
    db _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _X, _X, _X, _X, _X, _X, _X, _X
    db _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _X, _X, _X, _X, _X, _X, _X, _X
    db _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _X, _X, _X, _X, _X, _X, _X
    db _X, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _X, _X, _X, _X, _X, _X
    db _X, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _X, _X, _X, _X, _X
    db _X, _X, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _X, _X, _X
    db _X, _X, _X, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _X, _X, _X
    db _X, _X, _X, _X, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _Y, _X, _X, _X, _X
    db _X, _X, _X, _X, _X, _X, _Y, _Y, _Y, _Y, _Y, _X, _X, _X, _X, _X


; ============================================================================
; FANTÔME (style Pac-Man, rouge)
;
;     . . . . . . R R R R . . . . . .
;     . . . . R R R R R R R R . . . .
;     . . . R R R R R R R R R R . . .
;     . . R R R W W R R W W R R R . .
;     . . R R W W W R R W W W R R . .
;     . R R R W K W R R W K W R R R .
;     . R R R R W R R R R W R R R R .
;     . R R R R R R R R R R R R R R .
;     . R R R R R R R R R R R R R R .
;     . R R R R R R R R R R R R R R .
;     . R R R R R R R R R R R R R R .
;     . R R R R R R R R R R R R R R .
;     . R R R . R R R R R R . R R R .
;     . R R . . . R R R R . . . R R .
;     . R . . . . . R R . . . . . R .
;     . . . . . . . . . . . . . . . .
; ============================================================================

_R equ COL_RED
_W equ COL_WHITE
_K equ COL_BROWN

sprite_ghost:
    db _X, _X, _X, _X, _X, _X, _R, _R, _R, _R, _X, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _R, _R, _R, _R, _R, _R, _R, _R, _X, _X, _X, _X
    db _X, _X, _X, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _X, _X, _X
    db _X, _X, _R, _R, _R, _W, _W, _R, _R, _W, _W, _R, _R, _R, _X, _X
    db _X, _X, _R, _R, _W, _W, _W, _R, _R, _W, _W, _W, _R, _R, _X, _X
    db _X, _R, _R, _R, _W, _K, _W, _R, _R, _W, _K, _W, _R, _R, _R, _X
    db _X, _R, _R, _R, _R, _W, _R, _R, _R, _R, _W, _R, _R, _R, _R, _X
    db _X, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _X
    db _X, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _X
    db _X, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _X
    db _X, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _X
    db _X, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _X
    db _X, _R, _R, _R, _X, _R, _R, _R, _R, _R, _R, _X, _R, _R, _R, _X
    db _X, _R, _R, _X, _X, _X, _R, _R, _R, _R, _X, _X, _X, _R, _R, _X
    db _X, _R, _X, _X, _X, _X, _X, _R, _R, _X, _X, _X, _X, _X, _R, _X
    db _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X


; ============================================================================
; SPACE INVADER (le classique, type "crabe")
;
;     . . . . G . . . . . . G . . . .
;     . . . . . G . . . . G . . . . .
;     . . . . G G G G G G G G . . . .
;     . . . G G . G G G G . G G . . .
;     . . G G G G G G G G G G G G . .
;     . . G . G G G G G G G G . G . .
;     . . G . G . . . . . . G . G . .
;     . . . . . G G . . G G . . . . .
;     . . . . . . . . . . . . . . . .
;     . . . . . . . . . . . . . . . .
;     . . . . G . . . . . . G . . . .
;     . . . . . G . . . . G . . . . .
;     . . . . G G G G G G G G . . . .
;     . . . G G . G G G G . G G . . .
;     . . G G G G G G G G G G G G . .
;     . . G . G . . . . . . G . G . .
; ============================================================================

_G equ COL_GREEN

sprite_invader:
    db _X, _X, _X, _X, _G, _X, _X, _X, _X, _X, _X, _G, _X, _X, _X, _X
    db _X, _X, _X, _X, _X, _G, _X, _X, _X, _X, _G, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _G, _G, _G, _G, _G, _G, _G, _G, _X, _X, _X, _X
    db _X, _X, _X, _G, _G, _X, _G, _G, _G, _G, _X, _G, _G, _X, _X, _X
    db _X, _X, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _X, _X
    db _X, _X, _G, _X, _G, _G, _G, _G, _G, _G, _G, _G, _X, _G, _X, _X
    db _X, _X, _G, _X, _G, _X, _X, _X, _X, _X, _X, _G, _X, _G, _X, _X
    db _X, _X, _X, _X, _X, _G, _G, _X, _X, _G, _G, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _G, _X, _X, _X, _X, _X, _X, _G, _X, _X, _X, _X
    db _X, _X, _X, _X, _X, _G, _X, _X, _X, _X, _G, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _G, _G, _G, _G, _G, _G, _G, _G, _X, _X, _X, _X
    db _X, _X, _X, _G, _G, _X, _G, _G, _G, _G, _X, _G, _G, _X, _X, _X
    db _X, _X, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _X, _X
    db _X, _X, _G, _X, _G, _X, _X, _X, _X, _X, _X, _G, _X, _G, _X, _X


; ============================================================================
; COEUR 16x16
;
;     . . . R R R . . . . R R R . . .
;     . . R R R R R . . R R R R R . .
;     . R R R R R R R R R R R R R R .
;     . R R R R R R R R R R R R R R .
;     . R R R R R R R R R R R R R R .
;     . R R R R R R R R R R R R R R .
;     . . R R R R R R R R R R R R . .
;     . . . R R R R R R R R R R . . .
;     . . . . R R R R R R R R . . . .
;     . . . . . R R R R R R . . . . .
;     . . . . . . R R R R . . . . . .
;     . . . . . . . R R . . . . . . .
;     . . . . . . . . . . . . . . . .
;     . . . . . . . . . . . . . . . .
;     . . . . . . . . . . . . . . . .
;     . . . . . . . . . . . . . . . .
; ============================================================================

_H equ COL_RED

sprite_heart:
    db _X, _X, _X, _H, _H, _H, _X, _X, _X, _X, _H, _H, _H, _X, _X, _X
    db _X, _X, _H, _H, _H, _H, _H, _X, _X, _H, _H, _H, _H, _H, _X, _X
    db _X, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _X
    db _X, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _X
    db _X, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _X
    db _X, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _X
    db _X, _X, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _X, _X
    db _X, _X, _X, _H, _H, _H, _H, _H, _H, _H, _H, _H, _H, _X, _X, _X
    db _X, _X, _X, _X, _H, _H, _H, _H, _H, _H, _H, _H, _X, _X, _X, _X
    db _X, _X, _X, _X, _X, _H, _H, _H, _H, _H, _H, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _X, _X, _H, _H, _H, _H, _X, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _X, _X, _X, _H, _H, _X, _X, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X


; ============================================================================
; CHAMPIGNON (Super Mario - 1UP)
;
;     . . . . . . W W W W . . . . . .
;     . . . . W W G G G G W W . . . .
;     . . . W G G G G G G G G W . . .
;     . . W G G W W G G W W G G W . .
;     . W G G W W W W W W W W G G W .
;     . W G G W W W W W W W W G G W .
;     . W G G G W W W W W W G G G W .
;     . . W G G G G G G G G G G W . .
;     . . . W W G G G G G G W W . . .
;     . . . . W W W W W W W W . . . .
;     . . . W W S S W W S S W W . . .
;     . . W S S S S S S S S S S W . .
;     . . W S S S S S S S S S S W . .
;     . . W S S S S S S S S S S W . .
;     . . . W S S S S S S S S W . . .
;     . . . . W W W W W W W W . . . .
; ============================================================================

_S equ COL_SKIN

sprite_mushroom:
    db _X, _X, _X, _X, _X, _X, _W, _W, _W, _W, _X, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _W, _W, _G, _G, _G, _G, _W, _W, _X, _X, _X, _X
    db _X, _X, _X, _W, _G, _G, _G, _G, _G, _G, _G, _G, _W, _X, _X, _X
    db _X, _X, _W, _G, _G, _W, _W, _G, _G, _W, _W, _G, _G, _W, _X, _X
    db _X, _W, _G, _G, _W, _W, _W, _W, _W, _W, _W, _W, _G, _G, _W, _X
    db _X, _W, _G, _G, _W, _W, _W, _W, _W, _W, _W, _W, _G, _G, _W, _X
    db _X, _W, _G, _G, _G, _W, _W, _W, _W, _W, _W, _G, _G, _G, _W, _X
    db _X, _X, _W, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _W, _X, _X
    db _X, _X, _X, _W, _W, _G, _G, _G, _G, _G, _G, _W, _W, _X, _X, _X
    db _X, _X, _X, _X, _W, _W, _W, _W, _W, _W, _W, _W, _X, _X, _X, _X
    db _X, _X, _X, _W, _W, _S, _S, _W, _W, _S, _S, _W, _W, _X, _X, _X
    db _X, _X, _W, _S, _S, _S, _S, _S, _S, _S, _S, _S, _S, _W, _X, _X
    db _X, _X, _W, _S, _S, _S, _S, _S, _S, _S, _S, _S, _S, _W, _X, _X
    db _X, _X, _W, _S, _S, _S, _S, _S, _S, _S, _S, _S, _S, _W, _X, _X
    db _X, _X, _X, _W, _S, _S, _S, _S, _S, _S, _S, _S, _W, _X, _X, _X
    db _X, _X, _X, _X, _W, _W, _W, _W, _W, _W, _W, _W, _X, _X, _X, _X


; ============================================================================
; CREEPER (Minecraft) - juste la tête
;
;     . . G G G G G G G G G G G G . .
;     . G G G G G G G G G G G G G G .
;     . G G G G G G G G G G G G G G .
;     . G G K K G G G G G G K K G G .
;     . G G K K G G G G G G K K G G .
;     . G G G G G G K K G G G G G G .
;     . G G G G G K K K K G G G G G .
;     . G G G G G K K K K G G G G G .
;     . G G G G G K K K K G G G G G .
;     . G G G G K K G G K K G G G G .
;     . G G G G K G G G G K G G G G .
;     . G G G G G G G G G G G G G G .
;     . G G G G G G G G G G G G G G .
;     . G G G G G G G G G G G G G G .
;     . . G G G G G G G G G G G G . .
;     . . . . . . . . . . . . . . . .
; ============================================================================

sprite_creeper:
    db _X, _X, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _X, _X
    db _X, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _X
    db _X, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _X
    db _X, _G, _G, _K, _K, _G, _G, _G, _G, _G, _G, _K, _K, _G, _G, _X
    db _X, _G, _G, _K, _K, _G, _G, _G, _G, _G, _G, _K, _K, _G, _G, _X
    db _X, _G, _G, _G, _G, _G, _G, _K, _K, _G, _G, _G, _G, _G, _G, _X
    db _X, _G, _G, _G, _G, _G, _K, _K, _K, _K, _G, _G, _G, _G, _G, _X
    db _X, _G, _G, _G, _G, _G, _K, _K, _K, _K, _G, _G, _G, _G, _G, _X
    db _X, _G, _G, _G, _G, _G, _K, _K, _K, _K, _G, _G, _G, _G, _G, _X
    db _X, _G, _G, _G, _G, _K, _K, _G, _G, _K, _K, _G, _G, _G, _G, _X
    db _X, _G, _G, _G, _G, _K, _G, _G, _G, _G, _K, _G, _G, _G, _G, _X
    db _X, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _X
    db _X, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _X
    db _X, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _X
    db _X, _X, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _G, _X, _X
    db _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X


section .text
    global draw_pacman
    global draw_ghost
    global draw_invader
    global draw_heart
    global draw_mushroom
    global draw_creeper
    global draw_arcade_scene


; ============================================================================
; Fonctions de dessin individuelles
; Chaque sprite est positionné à un endroit par défaut
; ============================================================================

draw_pacman:
    push al
    push bl
    push el
    push fl
    lea al, bl, sprite_pacman
    mov fl, 8
    mov el, 8
    call draw_sprite
    pop fl
    pop el
    pop bl
    pop al
    ret

draw_ghost:
    push al
    push bl
    push el
    push fl
    lea al, bl, sprite_ghost
    mov fl, 8
    mov el, 8
    call draw_sprite
    pop fl
    pop el
    pop bl
    pop al
    ret

draw_invader:
    push al
    push bl
    push el
    push fl
    lea al, bl, sprite_invader
    mov fl, 8
    mov el, 8
    call draw_sprite
    pop fl
    pop el
    pop bl
    pop al
    ret

draw_heart:
    push al
    push bl
    push el
    push fl
    lea al, bl, sprite_heart
    mov fl, 8
    mov el, 8
    call draw_sprite
    pop fl
    pop el
    pop bl
    pop al
    ret

draw_mushroom:
    push al
    push bl
    push el
    push fl
    lea al, bl, sprite_mushroom
    mov fl, 8
    mov el, 8
    call draw_sprite
    pop fl
    pop el
    pop bl
    pop al
    ret

draw_creeper:
    push al
    push bl
    push el
    push fl
    lea al, bl, sprite_creeper
    mov fl, 8
    mov el, 8
    call draw_sprite
    pop fl
    pop el
    pop bl
    pop al
    ret


; ============================================================================
; DRAW_ARCADE_SCENE
; Scène complète : Pac-Man + Fantôme côte à côte
; Pac-Man à gauche (1, 8), Fantôme à droite (17, 8)
; ============================================================================
draw_arcade_scene:
    push al
    push bl
    push el
    push fl

    ; Pac-Man à gauche
    lea al, bl, sprite_pacman
    mov fl, 1
    mov el, 8
    call draw_sprite

    ; Fantôme à droite
    lea al, bl, sprite_ghost
    mov fl, 17
    mov el, 8
    call draw_sprite

    pop fl
    pop el
    pop bl
    pop al
    ret
