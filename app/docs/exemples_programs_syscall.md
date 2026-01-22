
# Exemples de Programmes avec Syscalls

## Programme 1 : Hello World (minimal)

```asm
# hello.asm - Programme minimal

:MAIN
# Print "Hello World!\n"
MOV_C_IMM <$MESSAGE
MOV_D_IMM >$MESSAGE
SYSCALL 0x03  # print_string(C:D)

# Exit proprement
MOV_A_IMM 0x00
SYSCALL 0x20  # exit(A)

:MESSAGE
DB "Hello World!", 0x0A, 0
```

---

## Programme 2 : Echo (lecture clavier)

```asm
# echo.asm - Répète ce que l'utilisateur tape

:MAIN
CALL $PRINT_PROMPT

:LOOP
# Lire caractère
SYSCALL 0x02  # read_char() -> A

# Si Enter (0x0D), quitter
MOV_B_IMM 0x0D
SUB
JZ $EXIT

# Sinon, afficher le caractère
SYSCALL 0x01  # print_char(A)

JMP $LOOP

:EXIT
MOV_A_IMM 0x00
SYSCALL 0x20  # exit(0)

:PRINT_PROMPT
MOV_C_IMM <$PROMPT
MOV_D_IMM >$PROMPT
SYSCALL 0x03  # print_string
RET

:PROMPT
DB "Type something (Enter to quit): ", 0
```

---

## Programme 3 : Cat (afficher fichier)

```asm
# cat.asm - Affiche le contenu d'un fichier
# Usage: Charge le nom du fichier à afficher

@define MODE_READ 0x01

:MAIN
# Ouvrir fichier
MOV_C_IMM <$FILENAME
MOV_D_IMM >$FILENAME
MOV_A_IMM MODE_READ
SYSCALL 0x10  # open(C:D, A) -> A=handle

# Vérifier si ouverture OK
JZ $FILE_ERROR

# Sauver handle
MOV_B_A

:READ_LOOP
# Lire byte
MOV_A_B
SYSCALL 0x11  # read(A) -> B=byte

# Si EOF (B=0), terminer
MOV_A_B
JZ $DONE

# Afficher byte
MOV_A_B
SYSCALL 0x01  # print_char(A)

JMP $READ_LOOP

:DONE
# Fermer fichier
MOV_A_B
SYSCALL 0x13  # close(A)

# Exit
MOV_A_IMM 0x00
SYSCALL 0x20  # exit(0)

:FILE_ERROR
# Afficher erreur
MOV_C_IMM <$ERROR_MSG
MOV_D_IMM >$ERROR_MSG
SYSCALL 0x03

MOV_A_IMM 0x01
SYSCALL 0x20  # exit(1)

:FILENAME
DB "README.TXT", 0

:ERROR_MSG
DB "Error: Cannot open file!", 0x0A, 0
```

---

## Programme 4 : Calculatrice Simple

```asm
# calc.asm - Calculatrice simple

:MAIN
CALL $PRINT_MENU

:INPUT_LOOP
# Lire premier nombre
CALL $PRINT_NUM1
CALL $READ_NUMBER
PUSH_A

# Lire opération
CALL $PRINT_OP
SYSCALL 0x02
MOV_B_A  # Sauver opération

# Lire second nombre
CALL $PRINT_NUM2
CALL $READ_NUMBER
MOV_C_A  # Sauver num2

# Récupérer num1
POP_A

# Effectuer calcul selon opération
MOV_D_B
MOV_B_IMM '+'
SUB
JZ $DO_ADD

MOV_D_B
MOV_B_IMM '-'
SUB
JZ $DO_SUB

MOV_D_B
MOV_B_IMM '*'
SUB
JZ $DO_MUL

MOV_D_B
MOV_B_IMM '/'
SUB
JZ $DO_DIV

JMP $INVALID_OP

:DO_ADD
ADD  # A = A + C
JMP $SHOW_RESULT

:DO_SUB
SUB  # A = A - C
JMP $SHOW_RESULT

:DO_MUL
# TODO: implémenter multiplication
JMP $SHOW_RESULT

:DO_DIV
# TODO: implémenter division
JMP $SHOW_RESULT

:SHOW_RESULT
# Afficher résultat
CALL $PRINT_RESULT
CALL $PRINT_NUMBER

# Nouvelle ligne
MOV_A_IMM 0x0A
SYSCALL 0x01

JMP $INPUT_LOOP

:INVALID_OP
MOV_C_IMM <$ERR_OP
MOV_D_IMM >$ERR_OP
SYSCALL 0x03
JMP $INPUT_LOOP

:READ_NUMBER
# Lire digits et convertir en nombre
# (simplifié - lit un seul digit)
SYSCALL 0x02
SUB_IMM '0'
RET

:PRINT_NUMBER
# Convertir nombre en ASCII et afficher
ADD_IMM '0'
SYSCALL 0x01
RET

:PRINT_MENU
MOV_C_IMM <$MENU
MOV_D_IMM >$MENU
SYSCALL 0x03
RET

:PRINT_NUM1
MOV_C_IMM <$PROMPT_NUM1
MOV_D_IMM >$PROMPT_NUM1
SYSCALL 0x03
RET

:PRINT_OP
MOV_C_IMM <$PROMPT_OP
MOV_D_IMM >$PROMPT_OP
SYSCALL 0x03
RET

:PRINT_NUM2
MOV_C_IMM <$PROMPT_NUM2
MOV_D_IMM >$PROMPT_NUM2
SYSCALL 0x03
RET

:PRINT_RESULT
MOV_C_IMM <$RESULT
MOV_D_IMM >$RESULT
SYSCALL 0x03
RET

:MENU
DB "=== Simple Calculator ===", 0x0A
DB "Operations: + - * /", 0x0A, 0x0A, 0

:PROMPT_NUM1
DB "Number 1: ", 0

:PROMPT_OP
DB "Operation: ", 0

:PROMPT_NUM2
DB "Number 2: ", 0

:RESULT
DB "Result: ", 0

:ERR_OP
DB "Invalid operation!", 0x0A, 0
```

---

## Programme 5 : File Creator

```asm
# create_file.asm - Crée un fichier texte

@define MODE_CREATE 0x02

:MAIN
# Afficher prompt
MOV_C_IMM <$PROMPT_NAME
MOV_D_IMM >$PROMPT_NAME
SYSCALL 0x03

# Lire nom fichier (simplifié)
# TODO: implémenter lecture complète

# Créer fichier
MOV_C_IMM <$FILENAME
MOV_D_IMM >$FILENAME
MOV_A_IMM MODE_CREATE
SYSCALL 0x10  # open(C:D, A) -> A=handle

JZ $CREATE_ERROR

MOV_B_A  # Sauver handle

# Écrire contenu
MOV_C_IMM 0  # Index
:WRITE_LOOP
MOV_A_MEM $CONTENT + C
JZ $WRITE_DONE

# Écrire byte
MOV_A_B  # handle
MOV_B_MEM $CONTENT + C
SYSCALL 0x12  # write(A=handle, B=byte)

INC_C
JMP $WRITE_LOOP

:WRITE_DONE
# Fermer fichier
MOV_A_B
SYSCALL 0x13

# Success message
MOV_C_IMM <$SUCCESS
MOV_D_IMM >$SUCCESS
SYSCALL 0x03

MOV_A_IMM 0x00
SYSCALL 0x20  # exit(0)

:CREATE_ERROR
MOV_C_IMM <$ERROR
MOV_D_IMM >$ERROR
SYSCALL 0x03

MOV_A_IMM 0x01
SYSCALL 0x20  # exit(1)

:PROMPT_NAME
DB "Creating test file...", 0x0A, 0

:FILENAME
DB "TEST.TXT", 0

:CONTENT
DB "Hello from file!", 0x0A
DB "This is line 2.", 0x0A
DB "This is line 3.", 0x0A, 0

:SUCCESS
DB "File created successfully!", 0x0A, 0

:ERROR
DB "Error creating file!", 0x0A, 0
```

---

## Bibliothèque Standard (stdlib.asm)

```asm
# stdlib.asm - Wrappers utiles pour syscalls

# =====================
# Affichage
# =====================

:print_char
# Input: A = caractère
SYSCALL 0x01
RET

:print_string
# Input: C:D = pointeur vers string
SYSCALL 0x03
RET

:print_newline
MOV_A_IMM 0x0A
SYSCALL 0x01
RET

:clear_screen
SYSCALL 0x04
RET

# =====================
# Saisie
# =====================

:read_char
# Output: A = caractère lu
SYSCALL 0x02
RET

:read_line
# Input: C:D = buffer, B = max length
# Lit une ligne complète jusqu'à Enter
PUSH_C
PUSH_D
MOV_D_IMM 0  # Counter

:read_line_loop
SYSCALL 0x02  # read_char
MOV_B_A

# Si Enter, terminer
MOV_A_B
MOV_C_IMM 0x0D
SUB
JZ $read_line_done

# Si Backspace, gérer
MOV_A_B
MOV_C_IMM 0x08
SUB
JZ $read_line_backspace

# Stocker caractère
POP_B
POP_C
PUSH_C
PUSH_B
MOV_A_D
ADD_C
MOV_C_A
MOV_A_B
MOV_PTR_CD_A

INC_D
JMP $read_line_loop

:read_line_backspace
# TODO: gérer backspace
JMP $read_line_loop

:read_line_done
# Ajouter null terminator
POP_B
POP_C
MOV_A_D
ADD_C
MOV_C_A
MOV_A_IMM 0
MOV_PTR_CD_A

RET

# =====================
# Fichiers
# =====================

:file_open
# Input: C:D = filename, A = mode
# Output: A = handle (0 si erreur)
SYSCALL 0x10
RET

:file_read
# Input: A = handle
# Output: B = byte
SYSCALL 0x11
RET

:file_write
# Input: A = handle, B = byte
SYSCALL 0x12
RET

:file_close
# Input: A = handle
SYSCALL 0x13
RET

# =====================
# Utilitaires
# =====================

:strlen
# Input: C:D = string
# Output: A = length
PUSH_C
PUSH_D

MOV_B_IMM 0  # Counter

:strlen_loop
MOV_A_PTR_CD
JZ $strlen_done

INC_B
# Incrémenter C:D
INC_C
MOV_A_C
JNZ $strlen_loop
INC_D
JMP $strlen_loop

:strlen_done
MOV_A_B
POP_D
POP_C
RET

:strcmp
# Input: C:D = str1, B:A = str2
# Output: A = 0 si égaux, 1 si différents
# TODO: implémenter
RET

:memcpy
# Input: C:D = dest, B:A = src, stack = length
# TODO: implémenter
RET

:exit
# Input: A = exit code
SYSCALL 0x20
```

---

## Usage de stdlib.asm

```asm
# Programme utilisant stdlib

@include stdlib.asm

:MAIN
# Clear screen
CALL $clear_screen

# Print message
MOV_C_IMM <$GREETING
MOV_D_IMM >$GREETING
CALL $print_string

# Read input
MOV_C_IMM <$BUFFER
MOV_D_IMM >$BUFFER
MOV_B_IMM 80  # Max length
CALL $read_line

# Exit
MOV_A_IMM 0
CALL $exit

:GREETING
DB "Enter your name: ", 0

:BUFFER
# Reserve 80 bytes pour input
DB 0,0,0,0,0,0,0,0,0,0  # x8 = 80 bytes
```

---

## Compilation et Exécution

```bash
# Compiler
./compile hello.asm -o HELLO.BIN

# Sur le simulateur
> ls
HELLO.BIN   128 bytes

> run HELLO.BIN
Hello World!
Program exited with code 0

> _
```
