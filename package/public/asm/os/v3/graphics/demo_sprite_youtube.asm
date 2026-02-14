; Author: Claude + yomax
; Date: 2026-02
; Name: demo_sprite_youtube
; Description: Logo YouTube 16x16 - rectangle rouge arrondi + triangle play blanc
;
; Dépendances : lib_sprites.asm (draw_sprite)
;
; Convention draw_sprite : A:B=adresse sprite, F=X, E=Y


.include "os/v3/graphics/lib_sprites.asm"


section .data

COL_TRANSPARENT equ 0x00
COL_RED         equ 0x01
COL_WHITE       equ 0xC0

_X equ COL_TRANSPARENT
_R equ COL_RED
_W equ COL_WHITE

; ============================================================================
; YOUTUBE 16x16
;
;     . . . . . . . . . . . . . . . .
;     . . . . . . . . . . . . . . . .
;     . . . R R R R R R R R R R . . .
;     . . R R R R R R R R R R R R . .
;     . . R R R R R R R R R R R R . .
;     . . R R R R R W R R R R R R . .
;     . . R R R R R W W R R R R R . .
;     . . R R R R R W W W R R R R . .
;     . . R R R R R W W W R R R R . .
;     . . R R R R R W W R R R R R . .
;     . . R R R R R W R R R R R R . .
;     . . R R R R R R R R R R R R . .
;     . . R R R R R R R R R R R R . .
;     . . . R R R R R R R R R R . . .
;     . . . . . . . . . . . . . . . .
;     . . . . . . . . . . . . . . . .
; ============================================================================

sprite_youtube:
    db _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X
    db _X, _X, _X, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _X, _X, _X
    db _X, _X, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _X, _X
    db _X, _X, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _X, _X
    db _X, _X, _R, _R, _R, _R, _R, _W, _R, _R, _R, _R, _R, _R, _X, _X
    db _X, _X, _R, _R, _R, _R, _R, _W, _W, _R, _R, _R, _R, _R, _X, _X
    db _X, _X, _R, _R, _R, _R, _R, _W, _W, _W, _R, _R, _R, _R, _X, _X
    db _X, _X, _R, _R, _R, _R, _R, _W, _W, _W, _R, _R, _R, _R, _X, _X
    db _X, _X, _R, _R, _R, _R, _R, _W, _W, _R, _R, _R, _R, _R, _X, _X
    db _X, _X, _R, _R, _R, _R, _R, _W, _R, _R, _R, _R, _R, _R, _X, _X
    db _X, _X, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _X, _X
    db _X, _X, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _X, _X
    db _X, _X, _X, _R, _R, _R, _R, _R, _R, _R, _R, _R, _R, _X, _X, _X
    db _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X
    db _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X, _X


section .text
    global draw_youtube_logo


; ============================================================================
; draw_youtube_logo - Dessine le logo YouTube à la position (8, 8) par défaut
; ============================================================================
draw_youtube_logo:
    push al
    push bl
    push el
    push fl
    lea al, bl, sprite_youtube
    mov fl, 8
    mov el, 8
    call draw_sprite
    pop fl
    pop el
    pop bl
    pop al
    ret
