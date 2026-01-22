
# Roadmap - Évolution du Système CPU Simulator

## ✅ État Actuel

- CPU 8-bit avec adressage 16-bit
- ISA custom (~60 opcodes)
- ROM/RAM avec Memory Bus
- Système d'interruptions (IRQ)
- DevicesManager avec I/O mappés en mémoire
- Périphériques : Storage, Console, LEDs, LCD, Keyboard, etc.
- Filesystem basique sur StorageDisk
- Compilateur ASM custom
- Bootloader + Mini OS

---

## 🎯 Phase 1 : Compilateur Amélioré (1-2 jours)

### Objectif
Support des strings et directives de données dans le compilateur ASM

### Tâches
- [x] Support directive `DB` (Define Byte)
- [x] Support strings : `DB "Hello World", 0`
- [x] Support bytes : `DB 0x01, 0x02, 0x03`
- [x] Support directive `@define` pour constantes
- [ ] Intégrer `compiler_enhanced.ts` dans le projet
- [ ] Tester avec `test_strings.asm`
- [ ] Mettre à jour les programmes existants

### Livrables
- ✅ `compiler_enhanced.ts` (créé)
- ✅ `test_strings.asm` (exemple)
- ✅ Documentation

### Fichiers fournis
- `/home/claude/compiler_enhanced.ts`
- `/home/claude/test_strings.asm`

---

## 🎯 Phase 2 : Format Exécutable .BIN (2-3 jours)

### Objectif
Définir et implémenter un format de fichier exécutable simple

### Format proposé

```
Offset  Size  Description
------  ----  -----------
0x00    2     Magic number (0xBEEF)
0x02    2     Entry point (16-bit address)
0x04    2     Code size (16-bit)
0x06    2     Data size (16-bit, optionnel)
0x08    N     Code bytes
0x08+N  M     Data bytes (optionnel)
```

### Tâches
- [ ] Définir spec du format .BIN
- [ ] Créer fonction `createBinFile()` dans le compilateur
- [ ] Créer loader dans l'OS (`os_loader.asm`)
- [ ] Créer programme de test qui :
  - Crée un fichier HELLO.BIN
  - Le sauvegarde sur le filesystem
  - Le charge en RAM
  - L'exécute

### Livrables
- Format .BIN spec (document)
- Loader dans l'OS
- Programme de test fonctionnel

### Fichiers fournis
- `/home/claude/example_create_executable.asm` (exemple avancé)

---

## 🎯 Phase 3 : Syscalls Standards (2-3 jours)

### Objectif
Définir une API standard pour que les programmes puissent appeler l'OS

### Syscalls proposés

```asm
# I/O
SYSCALL 0x01  # print_char(A) - Afficher caractère
SYSCALL 0x02  # read_char() -> A - Lire caractère
SYSCALL 0x03  # print_string(C:D) - Afficher string
SYSCALL 0x04  # clear_screen()

# Fichiers
SYSCALL 0x10  # open(C:D=filename, A=mode) -> A=handle
SYSCALL 0x11  # read(A=handle) -> B=byte
SYSCALL 0x12  # write(A=handle, B=byte)
SYSCALL 0x13  # close(A=handle)
SYSCALL 0x14  # delete(C:D=filename)

# Processus
SYSCALL 0x20  # exit(A=code)
SYSCALL 0x21  # sleep(A=ticks)
SYSCALL 0x22  # get_time() -> C:D=timestamp

# Mémoire
SYSCALL 0x30  # malloc(C:D=size) -> C:D=ptr
SYSCALL 0x31  # free(C:D=ptr)
```

### Tâches
- [ ] Définir la table des syscalls
- [ ] Implémenter dispatcher dans l'OS
- [ ] Implémenter chaque syscall
- [ ] Créer bibliothèque ASM (`stdlib.asm`)
- [ ] Créer programmes de test

### Livrables
- Table syscalls (document)
- `os_syscalls.asm` (implémentation)
- `stdlib.asm` (wrappers utiles)
- Programmes de test

---

## 🎯 Phase 4 : Shell Basique (3-4 jours)

### Objectif
Interface en ligne de commande pour interagir avec l'OS

### Fonctionnalités

```
> help
Commands: ls, cat, run, rm, clear, help

> ls
HELLO.BIN   256 bytes
TEST.TXT    42 bytes

> cat TEST.TXT
Hello from file!

> run HELLO.BIN
Hello World!
Program exited with code 0

> _
```

### Tâches
- [ ] Parser de ligne de commande
- [ ] Commandes de base :
  - [ ] `ls` - Liste fichiers
  - [ ] `cat` - Afficher contenu
  - [ ] `run` - Exécuter .BIN
  - [ ] `rm` - Supprimer fichier
  - [ ] `clear` - Effacer écran
  - [ ] `help` - Aide
- [ ] Buffer d'input avec édition
- [ ] Historique de commandes (optionnel)

### Livrables
- `os_shell.asm`
- Documentation commandes
- Démo fonctionnelle

---

## 🎯 Phase 5 : Interface Menuconfig (5-7 jours)

### Objectif
Interface semi-graphique style "menuconfig" Linux

### Fonctionnalités
- Navigation au clavier (↑↓←→)
- Menus avec checkboxes
- Sous-menus
- Box drawing
- Sélection/validation

### Tâches
- [ ] Améliorer Console pour support :
  - [ ] Positionnement curseur XY
  - [ ] Clear zones
  - [ ] Attributs (optionnel)
- [ ] Créer structures de données menu
- [ ] Implémenter rendering
- [ ] Implémenter navigation
- [ ] Créer menu de config système

### Livrables
- Console étendue
- `os_menu.asm`
- Documentation

### Fichiers fournis
- `/home/claude/GUIDE_MENUCONFIG.md` (guide complet)

---

## 🎯 Phase 6 : Amélioration ISA (optionnel, long terme)

### Objectif
Ajouter des instructions utiles inspirées du Z80/6502

### Instructions proposées

```asm
# Comparaison
CMP A, B      # Compare sans modifier A (set flags)
CMP A, IMM8   # Compare avec immediate

# Shifts & Rotations
SHL A         # Shift left
SHR A         # Shift right
ROL A         # Rotate left
ROR A         # Rotate right

# Arithmétique étendue
NEG A         # Negate (A = -A)
MUL           # Multiply A × B -> A (8-bit)
DIV           # Divide A ÷ B -> A (8-bit)

# Boucles
DJNZ label    # Decrement B and Jump if Not Zero (super utile!)

# Bit operations
BIT n, A      # Test bit n
SET n, A      # Set bit n
CLR n, A      # Clear bit n

# Block operations (avancé)
LDIR          # Load Increment Repeat
CPIR          # Compare Increment Repeat
```

### Tâches
- [ ] Ajouter opcodes dans `instructions.ts`
- [ ] Implémenter dans `Cpu.api.ts`
- [ ] Mettre à jour compilateur
- [ ] Tester chaque instruction
- [ ] Mettre à jour documentation

---

## 🎯 Phase 7 : Compatibilité Z80 (très long terme)

### Objectif
Supporter l'ISA complète du Z80 pour pouvoir exécuter du code existant

### Architecture proposée

```tsx
<Cpu type="custom">  // Ton ISA actuel
  {/* ... */}
</Cpu>

<Cpu type="z80">     // ISA Z80
  {/* ... */}
</Cpu>
```

### Difficultés
- 158 opcodes Z80 vs ~60 actuels
- Registres différents (A, F, B, C, D, E, H, L + shadow)
- Flags différents (S, Z, H, P/V, N, C)
- Addressing modes complexes
- **Énorme** travail (plusieurs semaines)

### Approche
1. Créer `Cpu_z80.api.ts` séparé
2. Implémenter progressivement par groupes :
   - Load/Store (20%)
   - Arithmetic (20%)
   - Logical (15%)
   - Rotate/Shift (15%)
   - Jump/Call (10%)
   - Block operations (10%)
   - Misc (10%)
3. Tester avec programmes Z80 existants

---

## 📊 Priorités Recommandées

### Court terme (1-2 semaines)
1. ⭐⭐⭐ Phase 1 : Compilateur amélioré
2. ⭐⭐⭐ Phase 2 : Format .BIN
3. ⭐⭐⭐ Phase 3 : Syscalls

**Résultat** : Système capable de charger et exécuter des programmes depuis le filesystem

### Moyen terme (3-4 semaines)
4. ⭐⭐ Phase 4 : Shell basique
5. ⭐⭐ Phase 5 : Interface menuconfig

**Résultat** : OS complet avec interface utilisateur

### Long terme (optionnel)
6. ⭐ Phase 6 : Amélioration ISA
7. ⭐ Phase 7 : Compatibilité Z80

**Résultat** : Architecture professionnelle / Compatibilité legacy

---

## 🛠️ Outils et Ressources

### Documentation à créer
- [ ] Spec format .BIN
- [ ] Table syscalls
- [ ] Guide programmation
- [ ] Exemples de programmes

### Programmes de test
- [x] `test_strings.asm` (strings)
- [ ] `test_syscalls.asm` (syscalls)
- [ ] `hello_world.asm` (programme minimal)
- [ ] `file_io_test.asm` (I/O fichiers)
- [ ] `calculator.asm` (programme interactif)

### Bibliothèques
- [ ] `stdlib.asm` (wrappers syscalls)
- [ ] `string.asm` (manipulation strings)
- [ ] `math.asm` (opérations mathématiques)
- [ ] `io.asm` (I/O simplifié)

---

## 📈 Métriques de Succès

### Phase 1-3 : Base fonctionnelle
✅ Programme Hello World charge depuis fichier et s'exécute
✅ Syscalls fonctionnent correctement
✅ Plusieurs programmes peuvent coexister sur le filesystem

### Phase 4 : Shell
✅ Utilisateur peut lister/exécuter/supprimer fichiers
✅ Interface intuitive et responsive

### Phase 5 : Menuconfig
✅ Navigation fluide au clavier
✅ Interface visuellement propre
✅ Sauvegarde de configuration

---

## 🎓 Apprentissages

Ce projet te permet d'apprendre :
- Architecture système (OS, bootloader, filesystem)
- Conception ISA et compilation
- Gestion mémoire et I/O
- Interfaces utilisateur bas niveau
- Design d'API système

**Excellente base pour comprendre comment fonctionnent les vrais systèmes !**

