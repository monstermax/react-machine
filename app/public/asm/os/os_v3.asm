; Author: yomax
; Date: 2026-01
; Name: os_v3
; Description: OS for React Machine (v3)


section .data
    OS_VERSION equ 3


section .text
    mov dl, OS_VERSION

    ; init scheduler (gestion des processus et threads)
    ; init interrupts (initialisation des interruptions)
    ; init syscalls (declaration des callbacks de syscalls)


    hlt
