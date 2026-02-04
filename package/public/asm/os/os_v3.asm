; Author: yomax
; Date: 2026-01
; Name: os_v3
; Description: OS for React Machine (v3)


.include "os/v3/drivers/lib_console.asm"


section .data
    OS_VERSION equ 3
    STR_WELCOME_LINE_1 dw "OS v3"


section .text

_start:
    mov dl, OS_VERSION

    ; init drivers
    ; init virtual file system
    ; init open files
    ; init scheduler (gestion des processus et threads)
    ; init interrupts (initialisation des interruptions)
    ; init syscalls (declaration des callbacks de syscalls)

    ; run /sbin/init (then spawn a shell)

    call run_shell

    hlt


run_shell:

    lea cl, dl, [STR_WELCOME_LINE_1]
    call console_print_string

    ; TODO
    hlt

