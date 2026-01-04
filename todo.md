
# TODO


## FEATURES
- gestion multiples disks (io hotplug)
- gestion file system
- debugger (interrupt keyboard dans l'OS. detection touche "d")
- multitask (2 programmes én parallele)
- créer Device (IO) IDE React (pour charger du code assembleur directement en memoire)
- Multi-Threads


## PROGRAMMES
- exemple programme: quizz => question sur la console + reponse au clavier (chaque les questions/reponses en RAM, depuis le disk)
- exemple programme: snake/tetris/pong => jeu snake sur display 32x32 + controle clavier


## IDEAS
- Menu interactif (Utilise keyboard/console + Affiche menu + Navigation au clavier)
- Multitasking cooperatif (Timer interrupt toutes les 100 cycles + Context switch entre 2-3 programmes + Chaque programme doit "yield" volontairement)
- Shell basique (run, ls, help, clear. Parser de commandes + Buffer d'input ligne par ligne)
- Shell complet (avec pipes)
- Gestionnaire de processus (Table des processus + États: RUNNING, READY, BLOCKED + Scheduler round-robin)
- OS Complet (Tout ce qui précède + Syscalls étendus + File system simple + Memory manager)

