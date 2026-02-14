; Author: yomax
; Date: 2026-01
; Name: os_v3
; Description: OS for React Machine (v3)


.include "os/v3/drivers/lib_console.asm"
.include "os/v3/arithmetic/lib_math.asm"
.include "os/v3/strings/lib_ascii.asm"


section .data
    OS_VERSION            equ 3

    keyboard_io_base      dw 0xF000 ; TODO: a remplacer par [keyboard_io_base] ; TODO: reproduire/copier/importer le code du bootloader pour initialiser les devices
    shell_command_ptr     db 0x00 ; position du pointer dans l'espace "shell_command_input"

    STR_WELCOME_LINE_1    db "== OS v3 ==", 13, 13, 0
    STR_CONSOLE_PROMPT    db "root@react-machine $ ", 0
    STR_RUN_COMMAND       db "running command...", 13, 0

    SHELL_COMMAND_MAX_LEN equ 128 ; cf shell_command_input
    ;SHELL_COMMAND_MAX_LEN equ 4 ; DEBUG

section .bss
    shell_command_input  resb 128 ; 128 bits pour stocker la commande en cours


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

    run_shell_prompt:
    mov [shell_command_ptr], 0x00 ; reinitialise le pointeur de position (de la chaine de caractere de la commande tapée)

    ; Affiche le prompt:
    lea cl, dl, [STR_CONSOLE_PROMPT]
    call console_print_string

    ; Boucle d'ecoute de touches clavier
    RUN_SHELL_READLINE:

    ; Calcul l'adresse pour acceder à la lecture du statut clavier
    mov cl, [keyboard_io_base]     ; low  byte de l'adresse de la variable keyboard_io_base
    mov dl, [keyboard_io_base + 1] ; high byte de l'adresse de la variable keyboard_io_base
    mov el, 1
    call add_cd_e ; incremente (C:D) pour atteindre KEYBOARD_STATUS

    ; Lecture du statut clavier (est-ce qu'une touche a été pressée ? oui/non)
    ldi al, cl, dl ; A = [C:D]
    cmp al, 0
    je RUN_SHELL_READLINE ; si pas de touche pressé, on retourne au label "RUN_SHELL_READLINE"


    ; Lecture du caractere clavier (et stocke la valeur dans A)
    mov cl, [keyboard_io_base]     ; low  byte de l'adresse de la variable keyboard_io_base
    mov dl, [keyboard_io_base + 1] ; high byte de l'adresse de la variable keyboard_io_base
    ldi al, cl, dl ; A = [C:D]

    ; Confirme la lecture du clavier
    mov el, 1 ; incremente (C:D) pour atteindre KEYBOARD_STATUS
    call add_cd_e
    sti cl, dl, 0 ; confirme la lecture du clavier


    mov fl, [shell_command_ptr] ; longueur de la chaine en cours

    debug 1, fl

    ; Detection touche backspace
    cmp, al, ASCII_BACKSPACE
    je HANDLE_BACKSPACE
    jmp HANDLE_NO_BACKSPACE

    ; gestion du backspace
    HANDLE_BACKSPACE:
    cmp fl, 0
    je RUN_SHELL_READLINE ; Si chaine vide, on ne fait rien. retour a l'ecoute du clavier

    ; Decremente le pointer de position
    dec [shell_command_ptr]

    jmp AFTER_HANDLE_BACKSPACE


    ; gestion du NO backspace
    HANDLE_NO_BACKSPACE:

    ; Detection si longueur maximal (de la chaine) atteinte
    ;mov fl, [shell_command_ptr]
    cmp fl, SHELL_COMMAND_MAX_LEN
    jl AFTER_CHECK_MAX_LEN ; si longueur max non atteinte, on skip la verification de entrée

    HANDLE_MAX_LEN:
    cmp al, ASCII_CR
    jne RUN_SHELL_READLINE ; si NOT touche entrée retour a lecture du clavier

    AFTER_CHECK_MAX_LEN:


    ; Ajoute le caractere au buffer "shell_command_input" (a l'aide du pointer de position "shell_command_ptr")
    lea cl, dl, [shell_command_input]
    mov el, [shell_command_ptr]
    call add_cd_e
    sti cl, dl, al

    ; Incremente le pointer de position
    inc [shell_command_ptr]

    ; fin de la gestion du backspace
    AFTER_HANDLE_BACKSPACE:


    ; Affiche le caractere sur la console
    call console_print_char

    ; Si touche Entrée, on execute la commande complete
    cmp al, ASCII_CR
    je run_shell_run_command



    ; sinon on retourne écouter le prochain caractere clavier
    jmp RUN_SHELL_READLINE


    ; Execute la commande tapée
    run_shell_run_command:

    ; Affiche un message pour indiquer l'execution de la commande
    ; lea cl, dl, [STR_RUN_COMMAND]
    ; call console_print_string

    mov bl, [shell_command_ptr] ; definit la longueur de la chaine à afficher
    lea cl, dl, [shell_command_input]
    call console_print_sized_string ; afficher la commande tapée

    ; Execute la commande tapée (TODO)

    ; TODO: parse command + find executable + load + run
    ; 1. splitter par espaces
    ; 2. si primitive => jump & direct exec
    ;    sinon parser fullpath de la command et/ou chercher dans le PATH

    call run_command

    jmp run_shell_prompt ; retour au prompt
    ret


run_command:
    ; recupere un pointer vers la chaine de caractere de la commande à executer
    lea cl, dl, [STR_RUN_COMMAND] ; (C,D) = [STR_RUN_COMMAND]
    mov bl, [shell_command_ptr] ; definit la longueur de la chaine

    ; todo

    ;hlt
    ret
