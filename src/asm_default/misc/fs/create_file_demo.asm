
# Créé un fichier TEST.TXT et y injecte du code venant de dataDisk2, charge le fichier en RAM, et execute le fichier
# TODO: ne pas hardcoder le nom du fichier
# TODO: ne pas hardcoder la taille du code/fichier

PROGRAM_START:

MAIN:

    # 1. Create file
    CALL $CREATE_COMMAND # Call CREATE_COMMAND
    JZ $END # Si échec, halt

    # 2. Write content
    CALL $WRITE_FILE_CONTENT # Call WRITE_FILE_CONTENT

    # 3. Play sound
    CALL $PLAY_SOUND # Call PLAY_SOUND

    # 4. Execute file
    CALL $EXECUTE_FILE # Call EXECUTE_FILE

    # 5. End
    END:
    #SYSCALL 0
    RET



WRITE_FILENAME:
    PUSH_A
    MOV_A_IMM 0x54 # "T"
    MOV_MEM_A @DATA_DISK_FS_FILENAME
    MOV_A_IMM 0x45 # "E"
    MOV_MEM_A @DATA_DISK_FS_FILENAME
    MOV_A_IMM 0x53 # "S"
    MOV_MEM_A @DATA_DISK_FS_FILENAME
    MOV_A_IMM 0x54 # "T"
    MOV_MEM_A @DATA_DISK_FS_FILENAME
    MOV_A_IMM 0x2E # "."
    MOV_MEM_A @DATA_DISK_FS_FILENAME
    MOV_A_IMM 0x54 # "T"
    MOV_MEM_A @DATA_DISK_FS_FILENAME
    MOV_A_IMM 0x58 # "X"
    MOV_MEM_A @DATA_DISK_FS_FILENAME
    MOV_A_IMM 0x54 # "T"
    MOV_MEM_A @DATA_DISK_FS_FILENAME
    POP_A
    RET


CREATE_COMMAND:
    PUSH_A
    CALL $WRITE_FILENAME # Call WRITE_FILENAME
    MOV_A_IMM 0x91 # Commande CREATE
    MOV_MEM_A @DATA_DISK_FS_COMMAND
    MOV_A_MEM @DATA_DISK_FS_COMMAND # Vérifier résultat
    POP_A
    RET


OPEN_FILE:
    PUSH_A
    CALL $WRITE_FILENAME # Call WRITE_FILENAME
    MOV_A_IMM 0x92 # Command OPEN
    MOV_MEM_A @DATA_DISK_FS_COMMAND
    POP_A
    RET


CLOSE_FILE:
    PUSH_A
    MOV_A_IMM 0x93 # Command CLOSE
    MOV_MEM_A @DATA_DISK_FS_COMMAND
    POP_A
    RET


WRITE_FILE_CONTENT:
    CALL $OPEN_FILE # Call OPEN_FILE

    READ_DISK_SIZE:
        #MOV_A_IMM 0x26 # initialise la taille du contenu a lire (hardcodé)
        MOV_A_MEM @DATA_DISK_2_SIZE_LOW  # Lit la taille du disque - A = low byte DATA_DISK_2_SIZE
        MOV_C_MEM @DATA_DISK_2_SIZE_HIGH # Lit la taille du disque - C = low byte DATA_DISK_2_SIZE

    MOV_B_IMM 0x00 # initialise la position du curseur
    MOV_MEM_B @DATA_DISK_2_ADDR_LOW   # initialise position dans le contenu à parcourir - low
    MOV_MEM_B @DATA_DISK_2_ADDR_HIGH  # initialise position dans le contenu à parcourir - high

    WRITE_FILE_CONTENT_LOOP:
        PUSH_A
        MOV_D_MEM @DATA_DISK_2_DATA # Read dataDisk2 (raw)

        MOV_MEM_D @DATA_DISK_FS_DATA # Write dataDisk (fs)

        INC_B   # update position du curseur
        MOV_MEM_B @DATA_DISK_2_ADDR_LOW   # update position dans le contenu à parcourir - low

        SUB
        POP_A
        JNZ $WRITE_FILE_CONTENT_LOOP

    CALL $CLOSE_FILE # Call CLOSE_FILE
    RET


PLAY_SOUND:
    PUSH_A
    MOV_A_IMM 45 # Fréquence = 440 Hz → valeur ≈ (440-100)/7.45 ≈ 45
    MOV_MEM_A @BUZZER_FREQ
    MOV_A_IMM 50 # Durée = 500ms → 500/10 = 50
    MOV_MEM_A @BUZZER_DURATION # déclenche le son
    POP_A
    RET


LOAD_FILE_IN_RAM:
    # charger le fichier en RAM (à l'adresse 0x2000) puis l'executer

    READ_DISK_SIZE:
        #MOV_B_IMM 0x25    # initialise la taille du contenu a lire (hardcodé)
        MOV_B_MEM @DATA_DISK_2_SIZE_LOW  # Lit la taille du disque - low byte dans B
        # TODO: lire la taille du fichier FS

    #MOV_B_IMM 0x00    # initialise la position du curseur FS (lecture) - B = position FS
    MOV_C_IMM 0x00    # initialise la position du curseur RAM (ecriture) - low
    MOV_D_IMM 0x20    # initialise la position du curseur RAM (ecriture) - high
    CALL $OPEN_FILE # Call OPEN_FILE

    LOAD_FILE_IN_RAM_LOOP:
        MOV_A_MEM @DATA_DISK_FS_DATA     # Lecture octet sur FS
        MOV_PTR_CD_A     # Ecriture octet dans RAM à 0X2000

        INC_C   # update position du curseur RAM - low
        DEC_B   # update position du curseur FS  - low

        JNZ $LOAD_FILE_IN_RAM_LOOP # si fin de fichier non atteint on retourne à LOAD_FILE_IN_RAM_LOOP

    RET


EXECUTE_FILE:
    CALL $LOAD_FILE_IN_RAM # Call LOAD_FILE_IN_RAM
    CALL $CLOSE_FILE # Call CLOSE_FILE
    CALL 0x2000
    RET

