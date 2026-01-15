
@include os/devices/console/console.driver.asm
@include os/memory/malloc.lib.asm
@include os/arithmetic/math2.lib.asm


@define8 ASCII_EOL 0x0A
@define8 ASCII_SPACE 0x20
@define8 ASCII_EXCLAM 0x21

@define8 ASCII_0 0x30
@define8 ASCII_1 0x31
@define8 ASCII_2 0x32
@define8 ASCII_3 0x33
@define8 ASCII_4 0x34
@define8 ASCII_5 0x35
@define8 ASCII_6 0x36
@define8 ASCII_7 0x37
@define8 ASCII_8 0x38
@define8 ASCII_9 0x39

@define8 ASCII_A 0x41
@define8 ASCII_B 0x42
@define8 ASCII_C 0x43
@define8 ASCII_D 0x44
@define8 ASCII_E 0x45
@define8 ASCII_F 0x46
@define8 ASCII_G 0x47
@define8 ASCII_H 0x48
@define8 ASCII_I 0x49
@define8 ASCII_J 0x4A
@define8 ASCII_K 0x4B
@define8 ASCII_L 0x4C
@define8 ASCII_M 0x4D
@define8 ASCII_N 0x4E
@define8 ASCII_O 0x4F
@define8 ASCII_P 0x50
@define8 ASCII_Q 0x51
@define8 ASCII_R 0x52
@define8 ASCII_S 0x53
@define8 ASCII_T 0x54
@define8 ASCII_U 0x55
@define8 ASCII_V 0x56
@define8 ASCII_W 0x57
@define8 ASCII_X 0x58
@define8 ASCII_Y 0x59
@define8 ASCII_Z 0x5A

@define8 ASCII_a 0x61
@define8 ASCII_b 0x62
@define8 ASCII_c 0x63
@define8 ASCII_d 0x64
@define8 ASCII_e 0x65
@define8 ASCII_f 0x66
@define8 ASCII_g 0x67
@define8 ASCII_h 0x68
@define8 ASCII_i 0x69
@define8 ASCII_j 0x6A
@define8 ASCII_k 0x6B
@define8 ASCII_l 0x6C
@define8 ASCII_m 0x6D
@define8 ASCII_n 0x6E
@define8 ASCII_o 0x6F
@define8 ASCII_p 0x70
@define8 ASCII_q 0x71
@define8 ASCII_r 0x72
@define8 ASCII_s 0x73
@define8 ASCII_t 0x74
@define8 ASCII_u 0x75
@define8 ASCII_v 0x76
@define8 ASCII_w 0x77
@define8 ASCII_x 0x78
@define8 ASCII_y 0x79
@define8 ASCII_z 0x7A


TEXT_DEMO:
    #.string "Welcome on OS v1"
    .string "OS v1"

TEXT_START_PROGRAM:
    #.string "Starting Program"
    .string "RUN"

TEXT_STOP_PROGRAM:
    #.string "Program Complete"
    .string "END"

STR_OK:
    .string "OK"

STR_KO:
    .string "KO"

STR_ERROR:
    .string "ERROR"



CONSOLE_PRINT_STRING():
    CONSOLE_PRINT_STRING_LOOP:
        # Lire caractère depuis buffer
        MOV_A_PTR_CD

        # Vérifier si \0 (fin de string)
        MOV_AB              # B = A (sauvegarder le caractère)
        MOV_A_IMM 0x00      # A = 0
        SUB                 # A = B - 0 (set zero flag si B = 0)
        JZ $CONSOLE_PRINT_STRING_END             # Si \0, terminer

        # Afficher le caractère
        MOV_BA              # A = B (restaurer)
        #MOV_MEM_A @CONSOLE_CHAR
        CALL $PRINT_CHAR()

        # Incrémenter pointeur C:D
        INC_C
        JNC $CONSOLE_PRINT_STRING_LOOP
        INC_D
        JMP $CONSOLE_PRINT_STRING_LOOP

    CONSOLE_PRINT_STRING_END:
        RET


# Affiche une string depuis un buffer mémoire
# Input: C:D = adresse du buffer, B = taille
CONSOLE_PRINT_SIZED_STRING():
    DEQUEUE:
        # Lire caractère depuis buffer
        MOV_A_PTR_CD
        #MOV_MEM_A @CONSOLE_CHAR
        CALL $PRINT_CHAR()

        # Incrémenter pointeur C:D
        INC_C
        JNC $NO_CARRY_PRINT
        INC_D

    NO_CARRY_PRINT:
        # Décrémenter compteur
        DEC_B
        JNZ $DEQUEUE

    CONSOLE_PRINT_SIZED_STRING_END:
        RET


CONSOLE_PRINT_OK():
    MOV_C_IMM <$STR_OK
    MOV_D_IMM >$STR_OK
    CALL $CONSOLE_PRINT_STRING()
    RET


CONSOLE_PRINT_KO():
    MOV_C_IMM <$STR_KO
    MOV_D_IMM >$STR_KO
    CALL $CONSOLE_PRINT_STRING()
    RET


CONSOLE_PRINT_ERROR():
    MOV_C_IMM <$STR_ERROR
    MOV_D_IMM >$STR_ERROR
    CALL $CONSOLE_PRINT_STRING()
    RET


CONSOLE_PRINT_WELCOME():
    MOV_C_IMM <$TEXT_DEMO
    MOV_D_IMM >$TEXT_DEMO
    CALL $CONSOLE_PRINT_STRING()
    RET


CONSOLE_PRINT_START_PROGRAM():
    MOV_C_IMM <$TEXT_START_PROGRAM
    MOV_D_IMM >$TEXT_START_PROGRAM
    CALL $CONSOLE_PRINT_STRING()
    RET


CONSOLE_PRINT_STOP_PROGRAM():
    MOV_C_IMM <$TEXT_STOP_PROGRAM
    MOV_D_IMM >$TEXT_STOP_PROGRAM
    CALL $CONSOLE_PRINT_STRING()
    RET


CONSOLE_PRINT_SIZED_STRING_DEMO():
    MOV_C_IMM <$TEXT_DEMO
    MOV_D_IMM >$TEXT_DEMO
    MOV_B_IMM 0x11
    CALL $CONSOLE_PRINT_SIZED_STRING()
    RET


CONSOLE_PRINT_SIZED_ALLOC_STRING_DEMO():
    # Allouer 5 bytes pour "YOP!\n"
    MOV_A_IMM 0x05
    PUSH_A
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

    MOV_A_IMM $ASCII_EOL
    CALL $WRITE_CHAR_AND_INC # EOL

    # Reculer pointeur au début (soustraire 5)
    POP_A
    PUSH_A
    CALL $SUB16_CD_A()

    # Afficher
    POP_B
    CALL $CONSOLE_PRINT_SIZED_STRING()
    RET



# Helper: Écrire A à [C:D] puis C:D++
WRITE_CHAR_AND_INC:
    MOV_PTR_CD_A
    INC_C
    JNC $WRITE_CHAR_RET
    INC_D

    WRITE_CHAR_RET:
        RET

