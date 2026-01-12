
@include os/devices/console/console_hello_world.asm
@include os/devices/led/led.lib.asm


WAIT_LOOP: # Require: registre A contient le nombre d'iterations à attendre
    NOP
    NOP
    DEC_A
    JNZ $WAIT_LOOP

    RET # Sortie de boucle. Retour à l'appelant

