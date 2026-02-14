; Author: yomax
; Date: 2026-02
; Name: bootloader_v2
; Description: Bootloader for React Machine (v2)


.include "bootloader/lib_devices.asm"
.include "bootloader/devices/lib_console.asm"
.include "bootloader/devices/lib_dma.asm"
.include "bootloader/devices/lib_leds.asm"
.include "bootloader/devices/lib_os_disk.asm"
.include "bootloader/devices/lib_screen.asm"


section .data
    ; Bootloader config
    BOOTLOADER_VERSION  equ 2
    SKIP_PRINT_INFO     equ 0x00
    SKIP_PRINT_GITHUB   equ 0x00
    SKIP_PRINT_WAITING  equ 0x00
    SKIP_PRINT_RUN      equ 0x00

    ; LEDs states
    LEDS_STATE_HALF_1   equ 0x55
    LEDS_STATE_HALF_2   equ 0xAA

    ; Emplacements memoire (voir MEMORY_MAP)
    OS_START     equ 0x1000
    STACK_END    equ 0xEFFF

    ; Strings
    ASCII_LF            equ 0x0A
    ASCII_SPACE         equ 0x20
    ASCII_MINUS         equ 0x2D
    STR_WELCOME_LINE_1  db "BOOTLOADER OK", 13, 0
    STR_GITHUB_LINK     db "GITHUB.COM/MONSTERMAX", 13, 0
    STR_WAITING_OS      db "WAITING FOR OS...", 13, 0
    STR_OS_FOUND        db "OS FOUND ON DEVICE #", 0
    STR_DEVICES_COUNT   db " devices found", 13, 0



section .text
    global _start


_start:
    ; Indique la version du bootloader => D = BOOTLOADER_VERSION
    mov dl, BOOTLOADER_VERSION

    ; Défini le stack pointer
    mov esp, STACK_END

    ; Cherche les addresses IO de chaque devices
    call init_devices

    ; Affiche la liste des devices
    call display_devices

    ; Allume la moitié des leds (retour visuel de bon fonctionnement)
    mov al, LEDS_STATE_HALF_2
    call leds_set_value

    ; Affiche les informations du bootloader
    call intro

    ; Attente d'un OS
    call init_wait_for_os ; indique au disk quelle adresse on voudra lire
    call wait_for_os

    ; Charger l'OS en RAM
    call load_os_in_ram

    ; Lance l'OS
    call run_os

    hlt


init_devices:
    call init_leds_device ; initialise le device LEDs
    call init_os_disk_device ; initialise le device OS_DISK
    call init_dma_device ; initialise le device DMA
    call init_console_device ; initialise le device Console
    call init_screen_device ; initialise le device Screen
    ret


intro:
    call leds_set_none ; eteint les LEDs

    ; print info
    mov al, SKIP_PRINT_INFO ; verifier si on skip ce print
    cmp al, 1
    je CALL_PRINT_INFO_END ; skip PRINT_INFO

    call print_info ; call PRINT_INFO
    CALL_PRINT_INFO_END:

    ; print github
    mov al, SKIP_PRINT_GITHUB ; verifier si on skip ce print
    cmp al, 1
    je CALL_PRINT_GITHUB_END ; skip PRINT_INFO

    call print_github ; call PRINT_GITHUB
    CALL_PRINT_GITHUB_END:

    mov al, ASCII_LF
    call console_print_char

    ; print waiting for os
    mov al, SKIP_PRINT_WAITING ; verifier si on skip ce print
    cmp al, 1
    je CALL_PRINT_WAITING_END ; skip PRINT_GITHUB

    call print_waiting
    CALL_PRINT_WAITING_END:

    INTRO_END:
    ret


init_wait_for_os:
    mov cl, [os_disk_io_base]
    mov dl, [os_disk_io_base + 1]

    ; défini l'adresse du disk à lire (low)
    mov el, 3
    call add_cd_e
    sti cl, dl, 0 ; [OS_DISK_ADDR_LOW] = 0

    ; défini l'adresse du disk à lire (high)
    call inc_cd ; increment (C:D)
    sti cl, dl, 0 ; [OS_DISK_ADDR_HIGH] = 0
    ret



wait_for_os:
    mov al, 1

    WAIT_FOR_OS_START:
    call leds_set_value ; allume les leds (selon la valeur de A)

    ; double la valeur de A (décalage de bits) ; decale la led à afficher
    add al, al

    ; si (plus) aucune LED allumé, on allume la 1ere (cf WAIT_FOR_OS_LEDS_REWIND)
    cmp al, 0
    jz WAIT_FOR_OS_LEDS_REWIND
    jmp CHECK_OS

    WAIT_FOR_OS_LEDS_REWIND:
    inc al ; reinitialise A = 1 (au lieu de 0)

    CHECK_OS:
    ; recuperation du pointeur vers os_disk_io_base + verification presence du disk (si adresse > 0)
    mov cl, [os_disk_io_base]
    mov dl, [os_disk_io_base + 1]

    cmp cl, 0
    jnz CHECK_DISK_PRESENT_END

    cmp dl, 0
    jnz CHECK_DISK_PRESENT_END

    jz WAIT_FOR_OS_START ; si pas de disk present on retourne à WAIT_FOR_OS_START

    CHECK_DISK_PRESENT_END:

    ; lit un byte à l'adresse configurée, depuis le disque
    ldi bl, cl, dl ; B = [C:D]
    cmp bl, 0

    jz WAIT_FOR_OS_START ; si pas d'OS chargé on retourne à WAIT_FOR_OS_START

    ; OS Trouvé, on quitte la fonction wait_for_os
    ret


run_os:
    ; Detecte s'il faut skipper l'affichage du message d'information (voir ci-apres)
    mov al, SKIP_PRINT_RUN
    cmp al, 1
    je AFTER_PRINT_RUN ; skip PRINT_RUN

    ; Affiche un message d'information
    mov al, [os_disk_device_idx]
    call print_run ; call PRINT_RUN
    AFTER_PRINT_RUN:

    ; Eteint les leds
    call leds_set_none

    ; Saute l'adresse de l'OS
    jmp OS_START
    ret ; JAmais atteint



load_os_in_ram:
    ; setup dma disk IO
    mov al, [os_disk_device_idx]
    mov cl, [dma_io_base]
    mov dl, [dma_io_base + 1]
    sti cl, dl, al ; define IO of disk on dma


    ; initialise le DMA avec la premiere adresse source du disk
    call inc_cd ; incremente (C:D)
    sti cl, dl, 0 ; [DMA_ADDR_START_LOW] = 0

    call inc_cd ; incremente (C:D)
    sti cl, dl, 0 ; [DMA_ADDR_START_HIGH] = 0

    ; lire la taille du disk et stocker dans (A:B)
    mov cl, [os_disk_io_base]
    mov dl, [os_disk_io_base + 1]

    call inc_cd ; incremente (C:D)
    ldi al, cl, dl ; [OS_DISK_SIZE_LOW] = 0

    call inc_cd ; incremente (C:D)
    ldi bl, cl, dl ; [OS_DISK_SIZE_HIGH] = 0

    ; décrementer pour obtenir l'adresse de fin : (A:B) = taille du disk - 1 = derniere adresse
    dec al
    jnc LOAD_OS_NO_CARRY
    dec bl

    LOAD_OS_NO_CARRY:
    mov cl, [dma_io_base]
    mov dl, [dma_io_base + 1]


    ; initialise le DMA avec la derniere adresse source du disk
    mov el, 3
    call add_cd_e
    sti cl, dl, al ; [DMA_ADDR_END_LOW] = A (taille du disk low)

    call inc_cd ; incremente (C:D)
    sti cl, dl, bl ; [DMA_ADDR_END_HIGH] = B (taille du disk high)


    ; initialise l'adresse de debut de l'OS dans la RAM : (A:B) = OS_START
    lea al, bl, OS_START


    ; initialise l'adresse de destination en RAM (low=A, high=B)
    call inc_cd ; incremente (C:D)
    sti cl, dl, al ; [DMA_TARGET_ADDR_LOW] = target ram address (low)

    call inc_cd ; incremente (C:D)
    sti cl, dl, bl ; [DMA_TARGET_ADDR_HIGH] = target ram address (high)


    ; Lance la copie de données via le DMA (Disk => RAM)
    call inc_cd ; incremente (C:D)
    sti cl, dl, 1 ; [DMA_DATA] = 1 (write bulk data)


    ; Vérifie que l'OS a bien été chargé en RAM
    mov bl, [OS_START]
    cmp bl, 0
    jnz OS_LOADED

    ; Si l'OS n'a pas été chargé, il doit y avoir un probleme. on arrete le CPU
    hlt

    OS_LOADED:
    ; L'OS a bien été chargé. on va ensuite le lancer

    ret


display_devices:
    mov el, [DEVICE_TABLE_COUNT]
    cmp el, 0
    je DISPLAY_DEVICES_END ; aucune device presente

    ; TODO: verifier que le device console existe (pour la sortie). sinon quitter ou halt

    mov bl, [DEVICE_TABLE_COUNT] ; nb de devices restantes à parcourir = nb de devices

    mov al, [DEVICE_TABLE_COUNT]
    add al, 48 ; conversion number en ASCII
    call console_print_char ; affiche le nombre de device trouvées

    lea cl, dl, [STR_DEVICES_COUNT]
    call console_print_string ; affiche le message " devices found"

    lea cl, dl, [DEVICE_TABLE_START + 4] ; positionnement sur le 1er [name ptr low]

    DISPLAY_DEVICES_LOOP:
    cmp bl, 0
    je DISPLAY_DEVICES_END ; Fin du parcourt des devices

    ;lea cl, dl, [DEVICE_TABLE_START] ; positionnement sur [name ptr low]
    ;mov el, 4
    ;call add_cd_e

    ; display "- "
    mov al, ASCII_MINUS
    call console_print_char
    mov al, ASCII_SPACE
    call console_print_char

    push cl
    push dl

    ldi el, cl, dl

    call inc_cd
    ldi fl, cl, dl

    mov cl, el
    mov dl, fl

    call console_print_string

    mov al, ASCII_LF
    call console_print_char

    pop dl
    pop cl

    dec bl
    jz DISPLAY_DEVICES_END

    mov el, 6
    call add_cd_e

    jmp DISPLAY_DEVICES_LOOP

    DISPLAY_DEVICES_END:
    ret



; print bootloader info (no input required)
print_info:
    lea cl, dl, [STR_WELCOME_LINE_1]
    call console_print_string
    ret ; end of PRINT_INFO


; print waiting message (no input required)
print_waiting:
    lea cl, dl, [STR_WAITING_OS]
    call console_print_string
    ret; end of PRINT_WAITING


; print "OS FOUND" (INPUT => A = deviceIdx du disque contenant l'OS)
print_run:

    ; 1. print "OS FOUND ON DEVICE #"
    push al
    lea cl, dl, [STR_OS_FOUND]
    call console_print_string
    pop al

    ; 2. print deviceIdx
    add al, 48 ; conversion number => ascii number
    call console_print_char

    ; 3. print EOL
    mov al, ASCII_LF
    call console_print_char

    ret ; end of PRINT_RUN


; print Github link (no input required)
print_github:
    lea cl, dl, [STR_GITHUB_LINK]
    call console_print_string
    ret ; end of PRINT_GITHUB

