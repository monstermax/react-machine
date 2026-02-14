; Author: yomax
; Date: 2026-01
; Name: os_v3
; Description: OS for React Machine (v3)


.include "os/v3/drivers/lib_console.asm"
.include "os/v3/arithmetic/lib_math.asm"


section .data
    OS_VERSION           equ 3

    keyboard_io_base     dw 0xF000 ; TODO: a remplacer par [keyboard_io_base] ; TODO: reproduire/copier/importer le code du bootloader pour initialiser les devices
    shell_command_ptr    db 0x00 ; position du pointer dans l'espace "shell_command_input"

    STR_WELCOME_LINE_1   db "== OS v3 ==", 13, 13, 0
    STR_CONSOLE_PROMPT   db "root@react-machine $ ", 0
    STR_RUN_COMMAND      db "running command...", 13, 0

section .bss
    ;shell_command_input  resb 128 ; 128 bits pour stocker la commande en cours
    shell_command_input  resb 8 ; DEBUG


section .text

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
    ; run_shell_print_info:
    lea cl, dl, [STR_WELCOME_LINE_1]
    call console_print_string

    ; run_shell_print_prompt:
    lea cl, dl, [STR_CONSOLE_PROMPT]
    call console_print_string

    ; Boucle d'ecoute de touches clavier
    run_shell_readline:

    ; Calcul l'adresse pour acceder à la lecture du statut clavier
    mov cl, [keyboard_io_base]     ; low  byte de l'adresse de la variable keyboard_io_base
    mov dl, [keyboard_io_base + 1] ; high byte de l'adresse de la variable keyboard_io_base
    mov el, 1
    call add_cd_e ; incremente (C:D) pour atteindre KEYBOARD_STATUS

    ; Lecture du statut clavier (est-ce qu'une touche a été pressée ? oui/non)
    ldi al, cl, dl ; A = [C:D]
    cmp al, 0
    je run_shell_readline ; si pas de touche pressé, on retourne au label "run_shell_readline"


    ; Lecture du caractere clavier (et stocke la valeur dans A)
    mov cl, [keyboard_io_base]     ; low  byte de l'adresse de la variable keyboard_io_base
    mov dl, [keyboard_io_base + 1] ; high byte de l'adresse de la variable keyboard_io_base
    ldi al, cl, dl ; A = [C:D]

    ; Confirme la lecture du clavier
    mov el, 1 ; incremente (C:D) pour atteindre KEYBOARD_STATUS
    call add_cd_e
    sti cl, dl, 0 ; confirme la lecture du clavier

    ; Ajoute le caractere au buffer "shell_command_input" (a l'aide du pointer de position "shell_command_ptr")
    lea cl, dl, [shell_command_input]
    mov el, [shell_command_ptr]
    call add_cd_e
    sti cl, dl, al
    debug 1, al
    debug 1, cl
    debug 1, dl
    inc [shell_command_ptr] ; incremente le pointer de position

    ; Affiche le caractere sur la console
    call console_print_char

    ; Si touche Entrée, on execute la commande complete
    cmp al, 13
    je run_shell_run_command

    ; sinon on retourne écouter le prochain caractere clavier
    jmp run_shell_readline


    ; Execute la commande tapée
    run_shell_run_command:
    ; Affiche un message pour indiquer l'execution de la commande
    lea cl, dl, [STR_RUN_COMMAND]
    call console_print_string

    mov bl, [shell_command_ptr] ; definit la longueur de la chaine à afficher
    lea cl, dl, [shell_command_input]
    call console_print_sized_string ; afficher la commande tapée

    ; Execute la commande tapée (TODO)

    ; TODO: parse command + find executable + load + run
    ; 1. splitter par espaces
    ; 2. si primitive => jump & direct exec
    ;    sinon parser fullpath de la command et/ou chercher dans le PATH

    hlt


    add fl, 1 ; bug here