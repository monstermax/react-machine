
.include "bootloader/bootloader.lib.asm"


section .data
    ; Variables pour remplacer les références MEMORY_MAP
    LEDS_BASE               dw 0xF030
    CLOCK_FREQ              dw 0xF120
    OS_START                dw 0x0500
    BOOTLOADER_STACK_END    dw 0xEE0F

    ; Définitions constantes (équivalents @define8)
    INITIAL_FREQ        equ 10
    LEDS_STATE_ALL_OFF  equ 0x00
    LEDS_STATE_HALF_1   equ 0x55
    LEDS_STATE_HALF_2   equ 0xAA

section .text
    global INIT

; TODO: "Booting from hardisk..."

INIT:

MAIN:
    mov esp, [BOOTLOADER_STACK_END] ; set stack pointer

    mov al, INITIAL_FREQ
    mov [CLOCK_FREQ], al ; set clock frequency

RESET_LEDS:
    nop
    mov bl, LEDS_STATE_ALL_OFF
    mov [LEDS_BASE], bl ; eteint les LEDS

    call PRINT_INFO ; call PRINT_INFO

BOOTLOADER_READY:
    inc bl ; label BOOTLOADER_READY

WAIT_FOR_OS:
    mov [LEDS_BASE], bl ; allume les leds (selon la valeur de B)

    ; double la valeur de B (décalage de bits) ; decale la led à afficher
    mov bl, al
    add al

    jz BOOTLOADER_READY ; apres l'affichage de la derniere LED, jump to BOOTLOADER_READY

    mov al, bl

    mov al, [OS_START] ; detection de chargement de l'OS
    jz WAIT_FOR_OS ; si pas d'OS chargé on retourne à WAIT_FOR_OS

    ; un OS a été trouvé. on se prépare à le lancer

RUN_OS:
    call PRINT_RUN ; label RUN_OS. call PRINT_RUN

    mov al, 0x00
    mov [LEDS_BASE], al ; eteint les leds

    ; SET_FREQ 10 (commenté dans votre code original)
    ; call @OS_START
    call [OS_START] ; call OS_START

OS_RETURN:
    ; JMP $INIT
    jmp INIT ; os return. jump to INIT

hlt

