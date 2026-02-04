; Author: yomax
; Date: 2026-01
; Name: bootloader_v2
; Description: OS for React Machine (v2)


.include "bootloader/bootloader_v2.lib.asm"


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
    LEDS_BASE    equ 0xF030
    CLOCK_FREQ   equ 0xF120
    OS_START     equ 0x0500
    STACK_END    equ 0xEE0F

    OS_DISK            equ 0x00 ; io num
    OS_DISK_DATA       equ 0xF000
    OS_DISK_SIZE_LOW   equ 0xF001
    OS_DISK_SIZE_HIGH  equ 0xF002
    OS_DISK_ADDR_LOW   equ 0xF003
    OS_DISK_ADDR_HIGH  equ 0xF004

    DMA_IO equ 0xF110
    DMA_ADDR_START_LOW equ 0xF111
    DMA_ADDR_START_HIGH equ 0xF112
    DMA_ADDR_END_LOW equ 0xF113
    DMA_ADDR_END_HIGH equ 0xF114
    DMA_TARGET_ADDR_LOW equ 0xF115
    DMA_TARGET_ADDR_HIGH equ 0xF116
    DMA_DATA           equ 0xF117


section .text
    global INIT


; TODO: "Booting from hardisk..." + Load OS in RAM (implement DMA IO read-write)


INIT:

MAIN:
    mov dl, BOOTLOADER_VERSION
    mov esp, STACK_END ; set stack pointer

    mov al, INITIAL_FREQ
    mov [CLOCK_FREQ], al ; set clock frequency

RESET_LEDS:
    nop
    mov bl, LEDS_STATE_ALL_OFF
    mov [LEDS_BASE], bl ; eteint les LEDS

    mov al, SKIP_PRINT_INFO
    cmp al, 1
    je BOOTLOADER_READY ; skip PRINT_INFO

    call PRINT_INFO ; call PRINT_INFO

BOOTLOADER_READY:
    inc bl ; label BOOTLOADER_READY

WAIT_FOR_OS:
    mov [LEDS_BASE], bl ; allume les leds (selon la valeur de B)

    ; double la valeur de B (décalage de bits) ; decale la led à afficher
    mov al, bl
    add al, bl

    test al
    jz BOOTLOADER_READY ; apres l'affichage de la derniere LED, jump to BOOTLOADER_READY

    mov bl, al

    ; check OS on disk
    mov [OS_DISK_ADDR_LOW], 0
    mov [OS_DISK_ADDR_HIGH], 0
    mov al, [OS_DISK_DATA]
    test al
    jz WAIT_FOR_OS ; si pas d'OS chargé on retourne à WAIT_FOR_OS
    call LOAD_OS_IN_RAM

    ; check OS in RAM
    mov al, [OS_START] ; detection de chargement de l'OS
    test al
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
    mov [LEDS_BASE], al ; eteint les leds

    ; SET_FREQ 10 (commenté dans votre code original)
    ; call @OS_START
    call OS_START ; call OS_START

OS_RETURN:
    ; JMP $INIT
    jmp INIT ; os return. jump to INIT

hlt

