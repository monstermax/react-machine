
@include os/memory/malloc.lib.asm

@define ASCII_EOF 0x0A
@define ASCII_SPACE 0x20
@define ASCII_EXCLAM 0x21

@define ASCII_A 0x41
@define ASCII_B 0x42
@define ASCII_C 0x43
@define ASCII_D 0x44
@define ASCII_E 0x45
@define ASCII_F 0x46
@define ASCII_G 0x47
@define ASCII_H 0x48
@define ASCII_I 0x49
@define ASCII_J 0x4A
@define ASCII_K 0x4B
@define ASCII_L 0x4C
@define ASCII_M 0x4D
@define ASCII_N 0x4E
@define ASCII_O 0x4F
@define ASCII_P 0x50
@define ASCII_Q 0x51
@define ASCII_R 0x52
@define ASCII_S 0x53
@define ASCII_T 0x54
@define ASCII_U 0x55
@define ASCII_V 0x56
@define ASCII_W 0x57
@define ASCII_X 0x58
@define ASCII_Y 0x59
@define ASCII_Z 0x5A

@define ASCII_a 0x61
@define ASCII_b 0x62
@define ASCII_c 0x63
@define ASCII_d 0x64
@define ASCII_e 0x65
@define ASCII_f 0x66
@define ASCII_g 0x67
@define ASCII_h 0x68
@define ASCII_i 0x69
@define ASCII_j 0x6A
@define ASCII_k 0x6B
@define ASCII_l 0x6C
@define ASCII_m 0x6D
@define ASCII_n 0x6E
@define ASCII_o 0x6F
@define ASCII_p 0x70
@define ASCII_q 0x71
@define ASCII_r 0x72
@define ASCII_s 0x73
@define ASCII_t 0x74
@define ASCII_u 0x75
@define ASCII_v 0x76
@define ASCII_w 0x77
@define ASCII_x 0x78
@define ASCII_y 0x79
@define ASCII_z 0x7A


#TEXT_DEMO:
#    DB YOP "YoP!"

#CONSOLE_PRINT_STRING_DEMO:
#    MOV_C_IMM <$TEXT
#    MOV_D_IMM >$TEXT
#    MOV_B_IMM 0x04
#    CALL $CONSOLE_PRINT_STRING()
#    RET


CONSOLE_PRINT_STRING_DEMO():
    # Allouer 4 bytes pour "YOP!"
    MOV_A_IMM 0x04
    CALL $MALLOC()
    # C:D = adresse du buffer

    # Écrire string avec helper
    MOV_A_IMM $ASCII_Y
    CALL $WRITE_CHAR_AND_INC # Y

    MOV_A_IMM $ASCII_O
    CALL $WRITE_CHAR_AND_INC # O

    MOV_A_IMM $ASCII_P
    CALL $WRITE_CHAR_AND_INC # P

    MOV_A_IMM $ASCII_EXCLAM
    CALL $WRITE_CHAR_AND_INC # !

    # Reculer pointeur au début (soustraire 4)
    MOV_A_IMM 0x04
    CALL $SUB16_CD_A

    # Afficher
    MOV_B_IMM 0x04
    CALL $CONSOLE_PRINT_STRING()
    RET


# Affiche une string depuis un buffer mémoire
# Input: C:D = adresse du buffer, B = taille
CONSOLE_PRINT_STRING():
    DEQUEUE:
        # Lire caractère depuis buffer
        MOV_A_PTR_CD
        MOV_MEM_A @CONSOLE_CHAR

        # Incrémenter pointeur C:D
        INC_C
        JNC $NO_CARRY_PRINT
        INC_D

    NO_CARRY_PRINT:
        # Décrémenter compteur
        DEC_B
        JNZ $DEQUEUE

    CONSOLE_PRINT_STRING_END:
        MOV_A_IMM $ASCII_EOF
        MOV_MEM_A @CONSOLE_CHAR

        RET


# Helper: Écrire A à [C:D] puis C:D++
WRITE_CHAR_AND_INC:
    MOV_PTR_CD_A
    INC_C
    JNC $WRITE_CHAR_RET
    INC_D

    WRITE_CHAR_RET:
        RET





CONSOLE_PRINT_OK():
    MOV_A_IMM $ASCII_O        # O
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_K        # K
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_EOF      # \n
    MOV_MEM_A @CONSOLE_CHAR

    RET


CONSOLE_PRINT_KO():
    MOV_A_IMM $ASCII_K        # K
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_O        # O
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_EOF      # \n
    MOV_MEM_A @CONSOLE_CHAR

    RET


CONSOLE_PRINT_START_PROGRAM():
    MOV_A_IMM $ASCII_S        # S
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_T        # T
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_A        # A
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_R        # R
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_T        # T
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_SPACE        # SPACE
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_P        # P
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_R        # R
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_O        # O
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_G        # G
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_R        # R
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_A        # A
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_M        # M
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_EOF      # \n
    MOV_MEM_A @CONSOLE_CHAR

    RET


CONSOLE_PRINT_STOP_PROGRAM():
    MOV_A_IMM $ASCII_S        # S
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_T        # T
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_O        # O
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_P        # P
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_SPACE        # SPACE
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_P        # P
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_R        # R
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_O        # O
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_G        # G
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_R        # R
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_A        # A
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_M        # M
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_EOF      # \n
    MOV_MEM_A @CONSOLE_CHAR

    RET


CONSOLE_PRINT_ERROR():
    MOV_A_IMM $ASCII_E        # E
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_R        # R
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_R        # R
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_O        # O
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_R        # R
    MOV_MEM_A @CONSOLE_CHAR

    MOV_A_IMM $ASCII_EOF      # \n
    MOV_MEM_A @CONSOLE_CHAR

    RET



CONSOLE_PRINT_HELLO_WORLD():

    MOV_A_IMM $ASCII_H # H
    MOV_MEM_A @CONSOLE_BASE

    MOV_A_IMM $ASCII_e # e
    MOV_MEM_A @CONSOLE_BASE

    MOV_A_IMM $ASCII_l # l
    MOV_MEM_A @CONSOLE_BASE

    MOV_A_IMM $ASCII_l # l
    MOV_MEM_A @CONSOLE_BASE

    MOV_A_IMM $ASCII_o # o
    MOV_MEM_A @CONSOLE_BASE

    MOV_A_IMM $ASCII_SPACE # SPACE
    MOV_MEM_A @CONSOLE_BASE

    MOV_A_IMM $ASCII_W # W
    MOV_MEM_A @CONSOLE_BASE

    MOV_A_IMM $ASCII_o # o
    MOV_MEM_A @CONSOLE_BASE

    MOV_A_IMM $ASCII_r # r
    MOV_MEM_A @CONSOLE_BASE

    MOV_A_IMM $ASCII_l # l
    MOV_MEM_A @CONSOLE_BASE

    MOV_A_IMM $ASCII_d # d
    MOV_MEM_A @CONSOLE_BASE

    MOV_A_IMM $ASCII_EXCLAM # !
    MOV_MEM_A @CONSOLE_BASE

    MOV_A_IMM $ASCII_EOF # EOF
    MOV_MEM_A @CONSOLE_BASE

    RET

