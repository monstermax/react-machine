; Author: yomax
; Date: 2026-01
; Name: os_v3
; Description: OS for React Machine (v3)


.include "os/v3/drivers/lib_console.asm"
.include "os/v3/shell/lib_shell.asm"


section .data
    OS_VERSION    equ 3


section .text
    global _start


_start:
    mov dl, OS_VERSION ; set register D with the OS version => D = OS_VERSION

    call console_clear

    ; init virtual file system
    call init_vfs

    ; init drivers
    call init_drivers

    ; init open files
    call init_open_files

    ; init scheduler (gestion des processus et threads)
    call init_scheduler

    ; init interrupts (initialisation des interruptions)
    call init_interrupts

    ; init syscalls (declaration des callbacks de syscalls)
    call init_syscalls

    ; init gestion des utilisateurs
    call init_users

    ; run /sbin/init (then spawn a shell)
    call run_shell

    hlt


init_vfs:
    ; todo
    ret


init_drivers:
    ; todo
    ret


init_open_files:
    ; todo
    ret


init_scheduler:
    ; todo
    ret


init_interrupts:
    ; todo
    ret


init_syscalls:
    ; todo
    ret


init_users:
    ; todo
    ret

