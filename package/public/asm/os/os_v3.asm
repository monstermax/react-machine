; Author: yomax
; Date: 2026-01
; Name: os_v3
; Description: OS for React Machine (v3)


.include "os/v3/drivers/lib_console.asm"


section .data
    OS_VERSION         equ 3
    KEYBOARD_DATA      equ 0xF050
    KEYBOARD_STATUS    equ 0xF051
    CONSOLE_CHAR       equ 0xF070

    STR_WELCOME_LINE_1 dw "OS v3", 13, 0
    STR_CONSOLE_PROMPT dw "root@react-machine $ ", 0
    STR_RUN_COMMAND dw "running command...", 13, 0


section .text

_start:
    mov dl, OS_VERSION

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


run_shell:

    run_shell_print_info:
    lea cl, dl, [STR_WELCOME_LINE_1]
    call console_print_string

    run_shell_print_prompt:
    lea cl, dl, [STR_CONSOLE_PROMPT]
    call console_print_string

    run_shell_readline:
    mov al, [KEYBOARD_STATUS]
    cmp al, 0
    je run_shell_readline ; loop to wait for keyboard

    run_shell_readchar:
    mov al, [KEYBOARD_DATA]

    run_shell_write_console:
    call console_print_char
    mov [KEYBOARD_STATUS], 0

    ; check return key
    cmp al, 13
    je run_shell_run_command

    jmp run_shell_readline

    run_shell_run_command:
    lea cl, dl, [STR_RUN_COMMAND]
    call console_print_string

    ; TODO: parse command + find executable + load + run
    ; 1. splitter par espaces
    ; 2. si primitive => jump & direct exec
    ;    sinon parser fullpath de la command et/ou chercher dans le PATH

    hlt

