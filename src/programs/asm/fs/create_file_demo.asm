
# Créé un fichier TEST.TXT et y injecte du code venant de dataDisk2, charge le fichier en RAM, et execute le fichier
# TODO: ne pas hardcoder le nom du fichier
# TODO: ne pas hardcoder la taille du code/fichier (detecter la taille de dataDisk2 en parcourant et tant qu'on rencontre pas 3 "0x00" d'affilé)

:PROGRAM_START

:MAIN

CALL $CREATE_COMMAND
JZ $END # Si échec, halt

CALL $WRITE_FILE_CONTENT

CALL $PLAY_SOUND
CALL $EXECUTE_FILE

JMP $END # End of main


:CREATE_COMMAND
PUSH_A
CALL $WRITE_FILENAME
MOV_A_IMM 0x91 # Commande CREATE
MOV_MEM_A MEMORY_MAP.DATA_DISK_FS_COMMAND
MOV_A_MEM MEMORY_MAP.DATA_DISK_FS_COMMAND # Vérifier résultat
POP_A
RET


:OPEN_FILE
PUSH_A
CALL $WRITE_FILENAME
MOV_A_IMM 0x92 # Command OPEN
MOV_MEM_A MEMORY_MAP.DATA_DISK_FS_COMMAND
POP_A
RET


:CLOSE_FILE
MOV_A_IMM 0x93 # Command CLOSE
MOV_MEM_A MEMORY_MAP.DATA_DISK_FS_COMMAND
RET


:WRITE_FILE_CONTENT
CALL $OPEN_FILE

MOV_B_IMM 0x26 # initialise la taille du contenu a lire (hardcodé)
MOV_A_IMM 0x00 # initialise la position du curseur
MOV_MEM_A MEMORY_MAP.DATA_DISK_2_ADDR_LOW   # initialise position dans le contenu à parcourir - low
MOV_MEM_A MEMORY_MAP.DATA_DISK_2_ADDR_HIGH  # initialise position dans le contenu à parcourir - high

:WRITE_FILE_CONTENT_LOOP
MOV_C_MEM MEMORY_MAP.DATA_DISK_2_DATA # Read dataDisk2 (raw)
MOV_MEM_C MEMORY_MAP.DATA_DISK_FS_DATA # Write dataDisk (fs)

INC_A   # update position du curseur
MOV_MEM_A MEMORY_MAP.DATA_DISK_2_ADDR_LOW   # update position dans le contenu à parcourir - low

PUSH_A
SUB
POP_A
JNZ $WRITE_FILE_CONTENT_LOOP

CALL $CLOSE_FILE
RET


:PLAY_SOUND
MOV_A_IMM 45 # Fréquence = 440 Hz → valeur ≈ (440-100)/7.45 ≈ 45
MOV_MEM_A MEMORY_MAP.BUZZER_FREQ
MOV_A_IMM 50 # Durée = 500ms → 500/10 = 50
MOV_MEM_A MEMORY_MAP.BUZZER_DURATION # déclenche le son
RET


:LOAD_FILE_IN_RAM
# charger le fichier en RAM (à l'adresse 0x2000) puis l'executer
MOV_B_IMM 0x26    # initialise la taille du contenu a lire (hardcodé)
MOV_A_IMM 0x00    # initialise la position du curseur FS l(ecture)
MOV_C_IMM 0x00    # initialise la position du curseur RAM (ecriture) - low
MOV_D_IMM 0x20    # initialise la position du curseur RAM (ecriture) - high
CALL $OPEN_FILE

:LOAD_FILE_IN_RAM_LOOP
PUSH_A
MOV_A_MEM MEMORY_MAP.DATA_DISK_FS_DATA     # Lecture octet sur FS
MOV_PTR_CD_A     # Ecriture octet dans RAM à 0X2000
POP_A

INC_C
INC_A
MOV_PTR_CD_A     # update position dans le contenu

PUSH_A
SUB
POP_A
JNZ $LOAD_FILE_IN_RAM_LOOP

RET


:EXECUTE_FILE
CALL $LOAD_FILE_IN_RAM
CALL $CLOSE_FILE
JMP 0x2000
RET



:WRITE_FILENAME
PUSH_A
MOV_A_IMM 0x54 # "T"
MOV_MEM_A MEMORY_MAP.DATA_DISK_FS_FILENAME
MOV_A_IMM 0x45 # "E"
MOV_MEM_A MEMORY_MAP.DATA_DISK_FS_FILENAME
MOV_A_IMM 0x53 # "S"
MOV_MEM_A MEMORY_MAP.DATA_DISK_FS_FILENAME
MOV_A_IMM 0x54 # "T"
MOV_MEM_A MEMORY_MAP.DATA_DISK_FS_FILENAME
MOV_A_IMM 0x2E # "."
MOV_MEM_A MEMORY_MAP.DATA_DISK_FS_FILENAME
MOV_A_IMM 0x54 # "T"
MOV_MEM_A MEMORY_MAP.DATA_DISK_FS_FILENAME
MOV_A_IMM 0x58 # "X"
MOV_MEM_A MEMORY_MAP.DATA_DISK_FS_FILENAME
MOV_A_IMM 0x54 # "T"
MOV_MEM_A MEMORY_MAP.DATA_DISK_FS_FILENAME
POP_A
RET


:END
SYSCALL 0
