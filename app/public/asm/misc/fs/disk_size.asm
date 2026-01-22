
PROGRAM_START:

MAIN:

    CLEAR_LCD_SCREEN:
        MOV_A_IMM 0x01
        MOV_MEM_A @LCD_COMMAND ; Efface l'ecran LCD

    READ_DISK_SIZE:
        MOV_C_MEM @DATA_DISK_2_SIZE_LOW  ; Lit la taille du disque - low byte dans C
        MOV_D_MEM @DATA_DISK_2_SIZE_HIGH ; Lit la taille du disque - low byte dans D

;    WRITE_LCD:
;
;        ; Afficher le HIGH byte (registre D)
;        WRITE_LCD_HIGH:
;            MOV_B_IMM 0x0A ; B = 10
;            MOV_AC
;            SUB
;            JC $WRITE_LETTER_HIGH
;
;            WRITE_NUMBER_HIGH:
;                MOV_A_IMM 0x30 ; Offset position "0" en ascii
;                MOV_MEM_D @LCD_DATA ; Ecrit la taille du disque sur l'ecran LCD - high byte
;
;            WRITE_LETTER_HIGH:
;                MOV_B_IMM 0x41 ; Offset position "A" en ascii
;                MOV_MEM_D @LCD_DATA ; Ecrit la taille du disque sur l'ecran LCD - high byte
;
;            MOV_MEM_B @LCD_DATA ; Ecrit la taille du disque sur l'ecran LCD
;            MOV_MEM_A @LCD_DATA ; Ecrit la taille du disque sur l'ecran LCD
;
;        ; Afficher un espace entre les deux bytes
;        MOV_A_IMM 0x20   ; Code ASCII pour espace
;        MOV_MEM_A @LCD_DATA
;
;
;        ; Afficher le LOW byte (registre C)
;        WRITE_LCD_LOW:
;            WRITE_NUMBER_LOW:
;            WRITE_LETTER_LOW:


    END:
    RET

