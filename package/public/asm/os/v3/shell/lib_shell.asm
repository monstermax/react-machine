; Author: yomax
; Date: 2026-02
; Name: lib_shell
; Description: Shell Library


.include "os/v3/arithmetic/lib_math.asm"
.include "os/v3/drivers/lib_leds.asm"
.include "os/v3/drivers/lib_keyboard.asm"
.include "os/v3/drivers/lib_screen.asm"
.include "os/v3/strings/lib_ascii.asm"
.include "os/v3/strings/lib_string.asm"
.include "os/v3/graphics/demo_sprites_pack1.asm"
.include "os/v3/graphics/demo_sprites_pack2.asm"
.include "os/v3/graphics/demo_sprite_youtube.asm"


section .data
    ;keyboard_io_base      dw 0xF000 ; TODO: a remplacer par [keyboard_io_base] ; TODO: reproduire/copier/importer le code du bootloader pour initialiser les devices

    shell_command_ptr     db 0x00 ; position du pointer dans l'espace "shell_command_input"

    STR_WELCOME_LINE_1    db "== OS v3 ==", 13, 13, 0
    STR_CONSOLE_PROMPT    db "root@react-machine $ ", 0
    STR_RUN_COMMAND       db "running command...", 13, 0
    STR_COMMAND_NOT_FOUND db "command not found", 13, 0
    STR_COMMAND_HELP_TEST db "Commands:", 13, " - help : this message", 13, " - halt : halt the computer", 13, " - leds : toggle leds", 13, " - ls : list files", 13, " - pixels : screen demo", 13, " - sprites : screen demo", 13, " - custom : run custom code", 13, 0
    STR_COMMAND_LS_TEST   db "files list here...", 13, 0

    STR_COMMANDS_BEGIN    db 0
    STR_COMMAND_PIXELS    db "pixels", 0
    STR_COMMAND_SPRITE    db "sprite", 0
    STR_COMMAND_CLEAR     db "clear", 0
    STR_COMMAND_HELP      db "help", 0
    STR_COMMAND_HALT      db "halt", 0
    STR_COMMAND_LEDS      db "leds", 0
    STR_COMMAND_CUSTOM    db "custom", 0
    STR_COMMAND_LS        db "ls", 0
    STR_COMMANDS_END      db 0

    SHELL_COMMAND_MAX_LEN equ 128 ; longueur max de la chaine shell_command_input

    LEDS_STATE_HALF_1   equ 0x55
    LEDS_STATE_HALF_2   equ 0xAA


section .bss
    shell_command_input  resb 128 ; 128 bits pour stocker la commande en cours (la taille doit correspondre à SHELL_COMMAND_MAX_LEN)


section .text
    global run_shell


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

;    ; Calcul l'adresse pour acceder à la lecture du statut clavier
;    mov cl, [keyboard_io_base]     ; low  byte de l'adresse de la variable keyboard_io_base
;    mov dl, [keyboard_io_base + 1] ; high byte de l'adresse de la variable keyboard_io_base
;    call inc_cd ; incremente (C:D) pour atteindre KEYBOARD_STATUS
;
;    ; Lecture du statut clavier (est-ce qu'une touche a été pressée ? oui/non)
;    ldi al, cl, dl ; A = [C:D]
    call get_keyboard_status
    cmp al, 0
    je RUN_SHELL_READLINE ; si pas de touche pressé, on retourne au label "RUN_SHELL_READLINE"


    ; Lecture du caractere clavier (et stocke la valeur dans A)
;    mov cl, [keyboard_io_base]     ; low  byte de l'adresse de la variable keyboard_io_base
;    mov dl, [keyboard_io_base + 1] ; high byte de l'adresse de la variable keyboard_io_base
;    ldi al, cl, dl ; A = [C:D]
    call get_keyboard_char

    ; Confirme la lecture du clavier ; set_keyboard_status
    call inc_cd ; incremente (C:D) pour atteindre KEYBOARD_STATUS
    sti cl, dl, 0 ; confirme la lecture du clavier


    mov fl, [shell_command_ptr] ; longueur de la chaine en cours

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


    ; Affiche la commande tapée
    ;mov bl, [shell_command_ptr] ; definit la longueur de la chaine à afficher
    ;lea cl, dl, [shell_command_input]
    ;call console_print_sized_string ; afficher la commande tapée


    ; Execute la commande tapée
    call run_command

    jmp run_shell_prompt ; retour au prompt
    ret


run_command:
    ; affiche un message d'information
    ;lea cl, dl, [STR_RUN_COMMAND] ; (C,D) = [STR_RUN_COMMAND]
    ;mov bl, [shell_command_ptr] ; definit la longueur de la chaine
    ;call console_print_string

    mov fl, [shell_command_ptr] ; recupere le pointeur de position de la chaine (pour connaitre la longueur de la chaine)
    dec fl ; recupere la longueur de la chaine saisie (decremente pour retirer le EOL)
    push fl ; sauvegarde la longueur de la chaine saisie
    jz RUN_COMMAND_END

    ; TODO: on a besoin de connaitre la longueur de chaque chaine a comparer (help, ls, ...) pour que strcmp_len soit coherent


    ; HANDLE HELP

    ; recupere un pointer vers la chaine de caractere de la commande à executer
    lea al, bl, [shell_command_input]

    ; recupere un pointer vers la chaine de caractere à comparer (parmi la liste des commandes connues)
    lea cl, dl, [STR_COMMAND_HELP] ; (C,D) = [STR_COMMAND_HELP]

    pop fl ; restaure la longueur de la chaine
    push fl ; sauvegarde la longueur de la chaine
    call strcmp_len
    jne AFTER_CHECK_COMMAND_HELP
    call run_command_help
    jmp RUN_COMMAND_END
    AFTER_CHECK_COMMAND_HELP:


    ; HANDLE LS

    ; recupere un pointer vers la chaine de caractere de la commande à executer
    lea al, bl, [shell_command_input]

    ; recupere un pointer vers la chaine de caractere à comparer (parmi la liste des commandes connues)
    lea cl, dl, [STR_COMMAND_LS] ; (C,D) = [STR_COMMAND_LS]

    pop fl ; restaure la longueur de la chaine
    push fl ; sauvegarde la longueur de la chaine
    call strcmp_len
    jne AFTER_CHECK_COMMAND_LS
    call run_command_ls
    jmp RUN_COMMAND_END
    AFTER_CHECK_COMMAND_LS:


    ; HANDLE PIXELS

    ; recupere un pointer vers la chaine de caractere de la commande à executer
    lea al, bl, [shell_command_input]

    ; recupere un pointer vers la chaine de caractere à comparer (parmi la liste des commandes connues)
    lea cl, dl, [STR_COMMAND_PIXELS] ; (C,D) = [STR_COMMAND_PIXELS]

    pop fl ; restaure la longueur de la chaine
    push fl ; sauvegarde la longueur de la chaine
    call strcmp_len
    jne AFTER_CHECK_COMMAND_PIXELS
    call run_command_pixels
    jmp RUN_COMMAND_END
    AFTER_CHECK_COMMAND_PIXELS:


    ; HANDLE SPRITE

    ; recupere un pointer vers la chaine de caractere de la commande à executer
    lea al, bl, [shell_command_input]

    ; recupere un pointer vers la chaine de caractere à comparer (parmi la liste des commandes connues)
    lea cl, dl, [STR_COMMAND_SPRITE] ; (C,D) = [STR_COMMAND_SPRITE]

    pop fl ; restaure la longueur de la chaine
    push fl ; sauvegarde la longueur de la chaine
    call strcmp_len
    jne AFTER_CHECK_COMMAND_SPRITE
    call run_command_sprite
    jmp RUN_COMMAND_END
    AFTER_CHECK_COMMAND_SPRITE:


    ; HANDLE LEDS

    ; recupere un pointer vers la chaine de caractere de la commande à executer
    lea al, bl, [shell_command_input]

    ; recupere un pointer vers la chaine de caractere à comparer (parmi la liste des commandes connues)
    lea cl, dl, [STR_COMMAND_LEDS] ; (C,D) = [STR_COMMAND_LEDS]

    pop fl ; restaure la longueur de la chaine
    push fl ; sauvegarde la longueur de la chaine
    call strcmp_len
    jne AFTER_CHECK_COMMAND_LEDS
    call run_command_leds
    jmp RUN_COMMAND_END
    AFTER_CHECK_COMMAND_LEDS:


    ; HANDLE CUSTOM

    ; recupere un pointer vers la chaine de caractere de la commande à executer
    lea al, bl, [shell_command_input]

    ; recupere un pointer vers la chaine de caractere à comparer (parmi la liste des commandes connues)
    lea cl, dl, [STR_COMMAND_CUSTOM] ; (C,D) = [STR_COMMAND_CUSTOM]

    pop fl ; restaure la longueur de la chaine
    push fl ; sauvegarde la longueur de la chaine
    call strcmp_len
    jne AFTER_CHECK_COMMAND_CUSTOM
    call run_command_custom
    jmp RUN_COMMAND_END
    AFTER_CHECK_COMMAND_CUSTOM:


    ; HANDLE HALT

    ; recupere un pointer vers la chaine de caractere de la commande à executer
    lea al, bl, [shell_command_input]

    ; recupere un pointer vers la chaine de caractere à comparer (parmi la liste des commandes connues)
    lea cl, dl, [STR_COMMAND_HALT] ; (C,D) = [STR_COMMAND_HALT]

    pop fl ; restaure la longueur de la chaine
    push fl ; sauvegarde la longueur de la chaine
    call strcmp_len
    jne AFTER_CHECK_COMMAND_HALT
    call run_command_halt
    jmp RUN_COMMAND_END
    AFTER_CHECK_COMMAND_HALT:


    ; HANDLE CLEAR

    ; recupere un pointer vers la chaine de caractere de la commande à executer
    lea al, bl, [shell_command_input]

    ; recupere un pointer vers la chaine de caractere à comparer (parmi la liste des commandes connues)
    lea cl, dl, [STR_COMMAND_CLEAR] ; (C,D) = [STR_COMMAND_CLEAR]

    pop fl ; restaure la longueur de la chaine
    push fl ; sauvegarde la longueur de la chaine
    call strcmp_len
    jne AFTER_CHECK_COMMAND_CLEAR
    call run_command_clear
    jmp RUN_COMMAND_END
    AFTER_CHECK_COMMAND_CLEAR:



    COMMAND_NOT_FOUND:
    debug 9, 0xFF
    lea cl, dl, [STR_COMMAND_NOT_FOUND]
    call console_print_string
    ;hlt
    ;ret

    RUN_COMMAND_END:
    pop fl
    ;hlt
    ret



run_command_help:
    debug 9, 1
    lea cl, dl, [STR_COMMAND_HELP_TEST]
    call console_print_string
    ;hlt
    ret


run_command_ls:
    debug 9, 2
    lea cl, dl, [STR_COMMAND_LS_TEST]
    call console_print_string
    ;hlt
    ret


run_command_pixels:
    debug 9, 3
    call draw_plasma
    ;call draw_xor_pattern
    ;call draw_tunnel
    ;call draw_diamond
    ;call draw_fire_palette
    ;call draw_checkerboard_gradient
    ;call draw_rainbow_diagonal
    ;call draw_spiral
    ret


run_command_sprite:
    debug 9, 4
    ;call draw_mario
    ;call draw_mario_and_sonic ; Sonic est un peu foiré
    ;call draw_pacman
    ;call draw_ghost
    ;call draw_invader
    ;call draw_heart
    ;call draw_mushroom
    ;call draw_creeper
    ;call draw_arcade_scene
    call draw_youtube_logo
    ret


run_command_leds:
    debug 9, 5
    call leds_get_value
    cmp al, 0
    je HANDLE_COMMAND_LEDS_ON ; si eteint, on jump pour allumer (en state half_1)

    HANDLE_COMMAND_LEDS_OFF:
    cmp al, LEDS_STATE_HALF_1
    je HANDLE_COMMAND_LEDS_ON_1

    ; eteind les LEDS
    call leds_set_none
    jmp COMMAND_LEDS_END ; saute a la fin de la commande


    HANDLE_COMMAND_LEDS_ON_1:
    ; allume les LEDS (en state half_2)
    mov al, LEDS_STATE_HALF_2
    call leds_set_value
    jmp COMMAND_LEDS_END ; saute a la fin de la commande


    HANDLE_COMMAND_LEDS_ON:
    ; allume les LEDS (en state half_1)
    mov al, LEDS_STATE_HALF_1
    call leds_set_value
    jmp COMMAND_LEDS_END ; saute a la fin de la commande


    COMMAND_LEDS_END:
    ;hlt
    ret


run_command_custom:
    debug 9, 6
    ; TODO: verifier si du code est chargé à cette addresse
    call 0xA000
    ;hlt
    ret


run_command_clear:
    debug 9, 7
    call console_clear
    ret


run_command_halt:
    debug 9, 8
    hlt
    ret


