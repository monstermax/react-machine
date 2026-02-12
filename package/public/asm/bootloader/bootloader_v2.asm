; Author: yomax
; Date: 2026-01
; Name: bootloader_v2
; Description: Bootloader for React Machine (v2)


.include "bootloader/bootloader_v2.lib.asm"
.include "bootloader/lib_devices.asm"


section .data
    ; bootloader config
    BOOTLOADER_VERSION  equ 2
    INITIAL_FREQ        equ 10
    SKIP_PRINT_INFO     equ 0x01
    SKIP_PRINT_RUN      equ 0x01

    ; drivers constants
    LEDS_STATE_ALL_OFF  equ 0x00
    LEDS_STATE_HALF_1   equ 0x55
    LEDS_STATE_HALF_2   equ 0xAA

    ; Variables (références à MEMORY_MAP par exemple)
    ;LEDS_BASE    equ 0xF030
    ;CLOCK_FREQ   equ 0xF120
    OS_START     equ 0x0700
    STACK_END    equ 0xEE0F

    ;OS_DISK            equ 0x04 ; io num
    ;OS_DISK_DATA       equ 0xF000
    ;OS_DISK_SIZE_LOW   equ 0xF001
    ;OS_DISK_SIZE_HIGH  equ 0xF002
    ;OS_DISK_ADDR_LOW   equ 0xF003
    ;OS_DISK_ADDR_HIGH  equ 0xF004

    ;DMA_IO               equ 0xF110
    ;DMA_ADDR_START_LOW   equ 0xF111
    ;DMA_ADDR_START_HIGH  equ 0xF112
    ;DMA_ADDR_END_LOW     equ 0xF113
    ;DMA_ADDR_END_HIGH    equ 0xF114
    ;DMA_TARGET_ADDR_LOW  equ 0xF115
    ;DMA_TARGET_ADDR_HIGH equ 0xF116
    ;DMA_DATA             equ 0xF117

    ;str_leds       db "leds", 0       ; le nom du device à chercher
    ;leds_io_base   dw 0x0000          ; variable qui contiendra l'adresse I/O du device



section .text
    global _start



_start:
    mov dl, BOOTLOADER_VERSION ; set register D with bootloader version
    mov esp, STACK_END ; set stack pointer

    call INIT_DEVICES ; cherche les addresses IO de chaque devices
    call DISPLAY_DEVICES ; affiche la liste des devices
    call TEST_LEDS ; allume la moitié des leds (retour visuel de bon fonctionnement)

    call INTRO ; affiche les informations du bootloader

    call INIT_WAIT_FOR_OS ; indique au disk quelle adresse on voudra lire
    call WAIT_FOR_OS
    hlt


INIT_DEVICES:
    call INIT_LEDS ; initialise le device LEDs
    call INIT_OS_DISK ; initialise le device OS_DISK
    call INIT_DMA ; initialise le device DMA
    ret


INTRO:
    mov bl, LEDS_STATE_ALL_OFF ; eteint les LEDS
    mov cl, [leds_io_base]
    mov dl, [leds_io_base+1]
    sti cl, dl, bl                    ; écrit B sur le device LEDs

    mov al, SKIP_PRINT_INFO
    cmp al, 1
    je INTRO_END ; skip PRINT_INFO

    call PRINT_INFO ; call PRINT_INFO

    INTRO_END:
    ret


INIT_WAIT_FOR_OS:
    mov cl, [os_disk_io_base]
    mov dl, [os_disk_io_base + 1]

    ; défini l'adresse du disk à lire (low)
    mov el, 3
    call ADD_CD_E
    sti cl, dl, 0 ; [OS_DISK_ADDR_LOW] = 0

    ; défini l'adresse du disk à lire (high)
    mov el, 1
    call ADD_CD_E
    sti cl, dl, 0 ; [OS_DISK_ADDR_HIGH] = 0
    ret



WAIT_FOR_OS:
    mov cl, [leds_io_base]
    mov dl, [leds_io_base+1]
    sti cl, dl, bl              ; allume les leds (selon la valeur de B)

    ; double la valeur de B (décalage de bits) ; decale la led à afficher
    add bl, bl

    ; apres l'affichage de la derniere LED, jump to WAIT_FOR_OS_LEDS_REWIND
    ;cmp bl, 0
    ;jz WAIT_FOR_OS_LEDS_REWIND
    jc WAIT_FOR_OS_LEDS_REWIND
    jmp CHECK_OS

    WAIT_FOR_OS_LEDS_REWIND:
    inc bl ; reinitialise B = 1 (au lieu de 0)

    CHECK_OS:
    ; lit un byte à l'adresse configurée, depuis le disque
    mov cl, [os_disk_io_base]
    mov dl, [os_disk_io_base + 1]
    ldi al, cl, dl

    cmp al, 0
    jz WAIT_FOR_OS ; si pas d'OS chargé on retourne à WAIT_FOR_OS
    call LOAD_OS_IN_RAM

    ; check OS in RAM
    mov al, [OS_START] ; detection de chargement de l'OS
    cmp al, 0
    jz WAIT_FOR_OS ; si pas d'OS chargé on retourne à WAIT_FOR_OS

    ; un OS a été trouvé. on se prépare à le lancer

    call RUN_OS
    ret


LOAD_OS_IN_RAM:
    ; setup dma disk IO
    mov al, [os_disk_io_idx]
    mov cl, [dma_io_base]
    mov dl, [dma_io_base + 1]
    sti cl, dl, al ; define IO of disk on dma

    ; setup dma disk start address (low)
    mov el, 1
    call ADD_CD_E
    sti cl, dl, 0 ; [DMA_ADDR_START_LOW] = 0

    ; setup dma disk start address (high)
    mov el, 1
    call ADD_CD_E
    sti cl, dl, 0 ; [DMA_ADDR_START_HIGH] = 0

    ; lire la taille du disk et stocker dans (A:B)
    mov cl, [os_disk_io_base]
    mov dl, [os_disk_io_base + 1]

    mov el, 1
    call ADD_CD_E
    ldi al, cl, dl ; [OS_DISK_SIZE_LOW] = 0

    ;mov el, 1
    call ADD_CD_E
    ldi bl, cl, dl ; [OS_DISK_SIZE_HIGH] = 0

    ; décrementer pour obtenir l'adresse de fin ( = taille du disk - 1)
    dec al
    jnc LOAD_OS_IN_RAM_NO_CARRY
    dec bl

LOAD_OS_IN_RAM_NO_CARRY:
    mov cl, [dma_io_base]
    mov dl, [dma_io_base + 1]

    mov el, 3
    call ADD_CD_E
    sti cl, dl, al ; [DMA_ADDR_END_LOW] = A (taille du disk low)

    mov el, 1
    call ADD_CD_E
    sti cl, dl, bl ; [DMA_ADDR_END_HIGH] = B (taille du disk high)

    ;mov [dma_io_base + 3], al ; DMA_ADDR_END_LOW : define end disk address (low byte) ;; TODO: -1
    ;mov [dma_io_base + 4], bl ; DMA_ADDR_END_HIGH : define end disk address (high byte) ;; TODO: -1

    lea al, bl, OS_START

    mov el, 1
    call ADD_CD_E
    sti cl, dl, al ; [DMA_TARGET_ADDR_LOW] = target ram address (low)

    mov el, 1
    call ADD_CD_E
    sti cl, dl, bl ; [DMA_TARGET_ADDR_HIGH] = target ram address (high)

    mov el, 1
    call ADD_CD_E
    sti cl, dl, 1 ; [DMA_DATA] = 1 (write bulk data)

    ret


RUN_OS:
    mov al, SKIP_PRINT_RUN
    cmp al, 1
    je BOOTLOADER_LEAVE ; skip PRINT_RUN

    call PRINT_RUN ; label RUN_OS. call PRINT_RUN

BOOTLOADER_LEAVE:
    mov al, 0x00
;    mov [leds_io_base], al ; eteint les leds

    call OS_START ; call OS_START

OS_RETURN:
    jmp _start ; os return. jump to _start

hlt





INIT_LEDS:
    ; Détecter les LEDs
    lea al, bl, [str_leds]
    call FIND_DEVICE_BY_NAME

    ; C:D = pointeur entrée table (ou 0x0000)
    ; Vérifier si trouvé
    mov el, cl
    or el, dl
    jz LEDS_NOT_FOUND

    ; Lire l'adresse I/O base (offset +2 dans l'entrée)
    mov el, 2
    call ADD_CD_E
    ldi fl, cl, dl           ; low byte de l'adresse I/O

    mov el, 1
    call ADD_CD_E
    ldi el, cl, dl           ; high byte

    ; Stocker dans leds_io_base
    mov [leds_io_base], fl
    mov [leds_io_base + 1], el

    ret

LEDS_NOT_FOUND:
    hlt ; LEDS not found



INIT_OS_DISK:
    ; Détecter OS_DISK
    lea al, bl, [str_os_disk]
    call FIND_DEVICE_BY_NAME

    ; C:D = pointeur entrée table (ou 0x0000)
    ; Vérifier si trouvé
    mov el, cl
    or el, dl
    jz OS_DISK_NOT_FOUND

    ldi fl, cl, dl
    mov [os_disk_io_idx], fl

    ; Lire l'adresse I/O base (offset +2 dans l'entrée)
    mov el, 2
    call ADD_CD_E
    ldi fl, cl, dl           ; low byte de l'adresse I/O

    mov el, 1
    call ADD_CD_E
    ldi el, cl, dl           ; high byte

    ; Stocker dans os_disk_io_base
    mov [os_disk_io_base], fl
    mov [os_disk_io_base + 1], el

    ret

OS_DISK_NOT_FOUND:
    hlt ; OS_DISK not found



INIT_DMA:
    ; Détecter les DMA
    lea al, bl, [str_dma]
    call FIND_DEVICE_BY_NAME

    ; C:D = pointeur entrée table (ou 0x0000)
    ; Vérifier si trouvé
    mov el, cl
    or el, dl
    jz DMA_NOT_FOUND

    ldi fl, cl, dl
    mov [dma_io_idx], fl

    ; Lire l'adresse I/O base (offset +2 dans l'entrée)
    mov el, 2
    call ADD_CD_E
    ldi fl, cl, dl           ; low byte de l'adresse I/O

    mov el, 1
    call ADD_CD_E
    ldi el, cl, dl           ; high byte

    ; Stocker dans dma_io_base
    mov [dma_io_base], fl
    mov [dma_io_base + 1], el

    ret

DMA_NOT_FOUND:
    hlt ; DMA not found




TEST_LEDS:
    ; Utiliser les LEDs
    mov al, LEDS_STATE_HALF_2

    mov cl, [leds_io_base]
    mov dl, [leds_io_base+1]
    sti cl, dl, al

    ret



DISPLAY_DEVICES:
    mov el, [DEVICE_TABLE_COUNT]
    cmp el, 0
    je DISPLAY_DEVICES_END ; aucune device presente

    ; TODO: lister les devices (id + name) // commencer par verifier que le device console existe (pour la sortie)

    DISPLAY_DEVICES_END:
    ret

