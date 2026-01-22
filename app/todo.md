
# TODO

## ROADMAP
- execute file: charger le code d'un programme dans un fichier du filesytem d'un disk. puis (le charger en RAM et) l'executer
- shell
- multitask
- gestionnaire des processus

## FEATURES
- gestion file system
- bootloader avec selecteur d'OS (si console, afficher. si keyboard, prompt, sinon booter l'OS par defaut)
- gérer un language de code pseudo assembleur (en texte brute)
- gestion multiples disks (io hotplug)
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



## OS + Filesystem + Run file
=> créer programme qui fait les taches suivantes :
- charger le code d'un programme demo (ex: SIMPLE_BEEP) sur le disk Data1 (raw)
- charger le contenu du disk Data1 dans un fichier du filesytem du disk Data2
- charger le contenu du fichier en RAM (à l'adresse PROGRAM_START ?)
- executer le code du fichier



# Memoire
- pagination (repartir l'espace memoire en pages)


# Multi coeurs
- HALT arrete uniquement le coeur. Il reste à l'ecoute des interruptions (timer, device, ...)



# Shell
```bash

$ run leds_blinker

$ ps
cpu core pid
0 0 1
0 1 2

$ quit

```

