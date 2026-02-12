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
    CLOCK_FREQ   equ 0xF120
    OS_START     equ 0x0500
    STACK_END    equ 0xEE0F

    OS_DISK            equ 0x00 ; io num
    OS_DISK_DATA       equ 0xF000
    OS_DISK_SIZE_LOW   equ 0xF001
    OS_DISK_SIZE_HIGH  equ 0xF002
    OS_DISK_ADDR_LOW   equ 0xF003
    OS_DISK_ADDR_HIGH  equ 0xF004

    DMA_IO               equ 0xF110
    DMA_ADDR_START_LOW   equ 0xF111
    DMA_ADDR_START_HIGH  equ 0xF112
    DMA_ADDR_END_LOW     equ 0xF113
    DMA_ADDR_END_HIGH    equ 0xF114
    DMA_TARGET_ADDR_LOW  equ 0xF115
    DMA_TARGET_ADDR_HIGH equ 0xF116
    DMA_DATA             equ 0xF117

    ;str_leds       db "leds", 0       ; le nom du device à chercher
    ;leds_io_base   dw 0x0000          ; variable qui contiendra l'adresse I/O du device



section .text
    global INIT


; TODO: "Booting from hardisk..." + Load OS in RAM (implement DMA IO read-write)


INIT:

MAIN:
    mov dl, BOOTLOADER_VERSION
    mov esp, STACK_END ; set stack pointer

;    mov al, INITIAL_FREQ
;    mov [CLOCK_FREQ], al ; set clock frequency



INIT_DEVICES:
    call INIT_LEDS


    call TEST_LEDS
    hlt


RESET_LEDS:
    mov bl, LEDS_STATE_ALL_OFF ; eteint les LEDS
    mov cl, [leds_io_base]
    mov dl, [leds_io_base+1]
    ;lea cl, dl, [leds_io_base]
    sti cl, dl, bl                    ; écrit B sur le device LEDs

    mov al, SKIP_PRINT_INFO
    cmp al, 1
    je BOOTLOADER_READY ; skip PRINT_INFO

    call PRINT_INFO ; call PRINT_INFO

BOOTLOADER_READY:
    inc bl ; label BOOTLOADER_READY

WAIT_FOR_OS:
    ; mov [leds_io_base], bl ; allume les leds (selon la valeur de B)  => Ça écrase la variable leds_io_base au lieu d'écrire sur le device
    mov cl, [leds_io_base]
    mov dl, [leds_io_base+1]
    ;lea cl, dl, [leds_io_base]
    sti cl, dl, bl              ; allume les leds (selon la valeur de B)

    ; double la valeur de B (décalage de bits) ; decale la led à afficher
    mov al, bl
    add al, bl

    cmp al, 0
    jz BOOTLOADER_READY ; apres l'affichage de la derniere LED, jump to BOOTLOADER_READY

    mov bl, al

    ; check OS on disk
    mov [OS_DISK_ADDR_LOW], 0
    mov [OS_DISK_ADDR_HIGH], 0
    mov al, [OS_DISK_DATA]
    cmp al, 0
    jz WAIT_FOR_OS ; si pas d'OS chargé on retourne à WAIT_FOR_OS
    call LOAD_OS_IN_RAM

    ; check OS in RAM
    mov al, [OS_START] ; detection de chargement de l'OS
    cmp al, 0
    jz WAIT_FOR_OS ; si pas d'OS chargé on retourne à WAIT_FOR_OS

    ; un OS a été trouvé. on se prépare à le lancer

    call RUN_OS


LOAD_OS_IN_RAM:
    mov [DMA_IO], OS_DISK ; define IO (OS_DISK=device0)

    mov [DMA_ADDR_START_LOW] , 0x00 ; define start disk address (low byte)
    mov [DMA_ADDR_START_HIGH], 0x00 ; define start disk address (high byte)

    mov al, [OS_DISK_SIZE_LOW]  ; load disk size (low)
    mov bl, [OS_DISK_SIZE_HIGH] ; load disk size (high)

    dec al
    jnc LOAD_OS_IN_RAM_NO_CARRY
    dec bl

    LOAD_OS_IN_RAM_NO_CARRY:
    mov [DMA_ADDR_END_LOW] , al ; define end disk address (low byte) ;; TODO: -1
    mov [DMA_ADDR_END_HIGH], bl ; define end disk address (high byte) ;; TODO: -1

    mov [DMA_TARGET_ADDR_LOW] , 0x00 ; define target ram address (low byte)
    mov [DMA_TARGET_ADDR_HIGH], 0x05 ; define target ram address (high byte)

    mov [DMA_DATA], 1
    ret


RUN_OS:
    mov al, SKIP_PRINT_RUN
    cmp al, 1
    je BOOTLOADER_LEAVE ; skip PRINT_RUN

    call PRINT_RUN ; label RUN_OS. call PRINT_RUN

BOOTLOADER_LEAVE:
    mov al, 0x00
;    mov [leds_io_base], al ; eteint les leds

    ; SET_FREQ 10 (commenté dans votre code original)
    ; call @OS_START
    call OS_START ; call OS_START

OS_RETURN:
    ; JMP $INIT
    jmp INIT ; os return. jump to INIT

hlt





INIT_LEDS:
    ; Détecter les LEDs
    lea al, bl, [str_leds]
    call FIND_DEVICE_BY_NAME

    ; fix hardcodé car leds_io_base est mal initialisé (probleme dans FIND_DEVICE_BY_NAME ?)
    lea cl, dl, 0x0513 ; hack car FIND_DEVICE_BY_NAME est buggué
    debug 1, cl
    debug 1, dl

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

    ;debug 2, cl
    ;debug 2, dl
    ;debug 2, el
    ;debug 2, fl
    ;hlt

    ; Stocker dans leds_io_base
    mov [leds_io_base], fl
    mov [leds_io_base + 1], el

    ret


LEDS_NOT_FOUND:
    hlt ; TODO not found


TEST_LEDS:
    ; Utiliser les LEDs
    mov al, 0x55

    ; fix hardcodé car leds_io_base est mal initialisé (probleme dans INIT_LEDS ou FIND_DEVICE_BY_NAME ?)
    ; mov [leds_io_base], 0x30
    ; mov [leds_io_base+1], 0xF0

    mov cl, [leds_io_base]
    mov dl, [leds_io_base+1]

    ; Alternative : works but hardcoded
    ;lea cl, dl, 0xF030 ; works

    sti cl, dl, al
    hlt ; debug ; ok si leds allumées
    ret

