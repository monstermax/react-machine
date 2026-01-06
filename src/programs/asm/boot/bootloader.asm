
:INIT
SET_SP MEMORY_MAP.STACK_END # Initialiser le Stack Pointer

:WAIT_FOR_OS
MOV_A_MEM MEMORY_MAP.OS_START # Vérifie si un OS est chargé en mémoire
NOP
JZ $WAIT_FOR_OS # Si pas d'OS détecté on boucle

:RUN_OS
JMP MEMORY_MAP.OS_START # Lance l'OS
