
.include "os/v3/arithmetic/lib_math.asm"


section .data
    ;STACK_END    dw 0xEE0F


section .text
    ;mov esp, [STACK_END]

    mov al, 3
    mov bl, 4

    call mul8
    ;call div8
    ;call power8

    hlt
