
**16-Bit Educational Computer Simulator**

Un simulateur complet d'ordinateur 16-bit entièrement implémenté en React/TypeScript, conçu pour l'apprentissage de l'architecture des ordinateurs.  
Le projet intègre un CPU avec 8 registres, 64 instructions assembleur, une mémoire segmentée (ROM/RAM/Stack/IO), et 12 périphériques virtuels (disques, écrans, claviers, interruptions).  
L'interface permet d'exécuter des programmes pas-à-pas, d'inspecter la mémoire en temps réel, et de visualiser l'état des registres, offrant une expérience interactive pour comprendre le fonctionnement interne d'un processeur.

**Points forts :**
- Architecture réaliste avec bootloader, OS minimal et programmes utilisateur
- Système d'interruptions et gestion de pile complète
- Interface visuelle montrant l'exécution des instructions
- Périphériques éducatifs (7 segments, LCD, pixels, console)
- Stockage persistant et système de fichiers virtuel




## 📝 **Présentation**

Simulateur complet d'ordinateur 16-bit développé en React/TypeScript, implémentant une architecture von Neumann avec CPU 8-bit, bus d'adressage 16-bit, et 64KB de mémoire adressable (ROM, RAM, I/O mappés en mémoire).  
Le système dispose d'un jeu d'instructions assembleur custom (~80 opcodes), d'un système d'interruptions matérielles avec vecteurs et handlers, et d'une stack complète (PUSH/POP/CALL/RET/IRET).  
Les périphériques I/O incluent : disques virtuels avec système de fichiers (inodes, secteurs), clavier avec interruptions, multiples affichages (LEDs, 7-segments, LCD 16x2, console terminal, pixel display 32x32), timer programmable, RTC avec timestamps Unix, RNG avec seed, et buzzer audio (Web Audio API).  
L'interface de développement offre un débogage temps réel avec breakpoints, visualisation de la mémoire désassemblée, registres CPU, et contrôle d'exécution step-by-step ou auto-play à fréquence variable.  
Un mini-OS bootable gère le chargement de programmes, la navigation menu, et les appels système.


## 📝 **Détails techniques**

**Simulateur de CPU 16-bit en React/TypeScript**

**Architecture :**
- CPU 8-bit, adressage 16-bit, 64KB mémoire (ROM/RAM/I/O memory-mapped)
- Jeu d'instructions : ~80 opcodes (ALU, MOV, JMP, CALL/RET, PUSH/POP, interrupts)
- Système d'interruptions matérielles (IRQ, handlers, IRET)
- Stack complète avec gestion SP

**Périphériques I/O :**
- Disques virtuels (64KB) avec file system (inodes, secteurs 256B)
- Clavier avec buffer circulaire et interruptions
- Affichages : LEDs, 7-segments, LCD 16x2, Console, Pixel Display 32x32
- Timer programmable (countdown, auto-reload, interruptions)
- RTC (date/heure/timestamp Unix 32-bit)
- RNG (LCG avec seed)
- Buzzer audio (Web Audio API, square wave)

**Environnement de développement :**
- Débogueur temps réel : breakpoints, step-by-step, auto-play
- Visualisation : mémoire désassemblée, registres, I/O states
- Mini-OS (243 bytes) : bootloader, menu navigation, syscalls

**Performance :**
- Fréquence CPU ajustable (0.1 Hz - 100 Hz)
- Optimisation React (useMemo, useCallback, refs)



## 📝 **Version présentation orale (30 secondes)**

*J'ai développé un simulateur complet d'ordinateur 16-bit en React.  
C'est un véritable CPU avec son assembleur custom, capable d'exécuter des programmes, de gérer des interruptions, et de piloter des périphériques comme un clavier, des écrans, un système de fichiers sur disque virtuel, et même un buzzer sonore.  
L'interface permet de débugger en temps réel avec des breakpoints, de visualiser la mémoire et les registres, et d'exécuter le code instruction par instruction. J'ai même écrit un bootloader et un mini-OS qui boot et charge des programmes.  
C'est pédagogique pour comprendre comment fonctionne un ordinateur au niveau le plus bas.*
