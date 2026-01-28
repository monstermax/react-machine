
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


---


# Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         REACT UI LAYER                              │
│  PanelRegisters.tsx ─── ComputerPage.tsx  ─── PanelMemory.tsx       │
│  PanelControls.tsx ─────┘              └───── FileManager.tsx       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────────────────────────────────────────┐
│                     CUSTOM HOOKS LAYER                              │
│  useComputer() ────────────┐                                        │
│    ├── useCpu()            │  Contrôle principal                    │
│    ├── useMemory()         │  Gestion mémoire unifiée               │
│    ├── useIo()             │  Périphériques I/O                     │
│    │   ├── useDiskDevice() │  Disques avec système de fichiers      │
│    │   ├── useFileSystem() │  Gestion fichiers (child de disk)      │
│    │   ├── useInterrupt()  │  Contrôleur interruptions              │
│    │   └── 10+ devices...  │  Écrans, claviers, timers, etc.        │
│    ├── useRom()            │  Bootloader et ROM                     │
│    └── useRam()            │  RAM utilisateur                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────────────────────────────────────────┐
│                    CORE TYPES & CONSTANTS                           │
│  cpu.types.ts ──────┐  memory_map.ts ──────┐  instructions.ts       │
│  Register, Memory,  │  MEMORY_MAP, isROM,  │  Opcode enum,          │
│  Device, ProgramInfo│  memoryToIOPort      │  getOpcodeName         │
└─────────────────────────────────────────────────────────────────────┘
```


# 1. Boot Process

1. Power On → PC = 0x0000 (hard-wired)
2. ROM contient bootloader (adresses 0x00-0xFF)
3. Bootloader initialise SP et saute à OS (0x0100)
4. Mini-OS attend programme utilisateur à 0x0200
5. Chargement programme → exécution


# 2. Cycle d'Exécution CPU

```ts
// Dans useCpu.ts
executeCycle() {
  // 1. Vérifier interruptions
  if (interruptsEnabled && interruptHook.hasPendingInterrupt()) {
    handleInterrupt();
    return;
  }
  
  // 2. Fetch instruction
  const pc = getRegister("PC");
  const instruction = memory.readMemory(pc);
  setRegister("IR", instruction);
  
  // 3. Decode & Execute
  executeOpcode(pc, instruction);
  
  // 4. Incrémenter compteur cycles
  tick();
}
```


# 3. Mémoire Unifiée

```ts
// Dans useMemory.ts
readMemory(address: u16): u8 {
  if (isROM(address)) return romHook.read(address);
  if (isRAM(address)) return ramHook.read(address);
  if (isIO(address)) return ioHook.read(memoryToIOPort(address));
  return 0;
}
```


# Structure des Hooks

```ts
// Coordinateur de tous les sous-systèmes
export const useComputer = (): ComputerHook => {
  const romHook = useRom();           // Bootloader
  const ramHook = useRam();           // RAM utilisateur
  const ioHook = useIo();             // Tous les périphériques
  const memoryHook = useMemory(romHook, ramHook, ioHook); // Vue unifiée
  const cpuHook = useCpu(memoryHook, ioHook); // CPU avec accès mémoire
  
  // Gestion programmes
  const loadProgram = (name: string) => {
    const program = programs[name];
    ioHook.programDisk.setStorage(program.code); // Charge sur "disque"
    memoryHook.loadDiskInRAM(...);              // Copie en RAM
  };
  
  return { cpuHook, memoryHook, ioHook, loadProgram, resetComputer };
};
```


# useCpu() - Cœur du Processeur

```ts
export const useCpu = (memory: MemoryHook, io: IOHook): CpuHook => {
  // 8 registres 8/16-bit
  const [registers, setRegisters] = useState<Map<Register, number>>([
    ["A", 0], ["B", 0], ["C", 0], ["D", 0], ["IR", 0],  // 8-bit généraux
    ["PC", 0], ["SP", 0],                               // 16-bit spéciaux
    ["FLAGS", 0]                                        // Bits: Z(ero), C(arry)
  ]);
  
  // ALU complète
  const ALU = {
    add, sub, and, or, xor, inc, dec  // Opérations 8-bit
  };
  
  // 64 instructions supportées
  const executeOpcode = (pc: number, instruction: number) => {
    switch (instruction) {
      case Opcode.LOAD_A:  // Chargement immédiat
      case Opcode.ADD:     // ALU
      case Opcode.JMP:     // Sauts
      case Opcode.PUSH_A:  // Stack
      case Opcode.EI:      // Interruptions
      case Opcode.SYSCALL: // Appels système
      // ...
    }
  };
  
  return { registers, ALU, executeCycle, getRegister, setRegister };
};
```


# useIo() - Gestionnaire de Périphériques

```ts
export const useIo = (): IOHook => {
  // Chaque device occupe 16 ports (0xFF00-0xFF0F, 0xFF10-0xFF1F, etc.)
  const devices = new Map<u8, Device>([
    [0x00, osDisk],        // Disque OS (avec FS intégré)
    [0x01, programDisk],   // Disque programmes
    [0x02, timer],         // Timer avec interruptions
    [0x03, leds],          // LEDs de sortie
    [0x04, interrupt],     // Contrôleur interruptions
    [0x05, keyboard],      // Clavier virtuel
    [0x06, sevenSegment],  // Afficheur 7 segments
    [0x07, console],       // Console texte
    [0x0A, lcd],           // LCD 16x2
    [0x0D, pixelDisplay],  // Écran pixels 32x32
    [0x0B, rng],           // Générateur aléatoire
    [0x0C, rtc],           // Horloge temps réel
  ]);
  
  // Router les accès I/O
  const read = (ioPort: u8): u8 => {
    const deviceId = Math.floor(ioPort / 16);
    const devicePort = ioPort % 16;
    return devices.get(deviceId)?.read(devicePort) ?? 0;
  };
  
  return { read, write, devices, ...deviceHooks };
};
```


# useDiskDevice() + useFileSystem() - Stockage hiérarchique

```ts
// Disque enrichi avec système de fichiers
export const useDiskDevice = (data: Map<u16, u8>): DiskDevice => {
  const [storage, setStorage] = useState(data);
  const fsHook = useFileSystem(storage, setStorage); // Composition
  
  // Ports doubles: RAW (0-3) et FS (4+)
  const read = (port: u8): u8 => {
    switch (port) {
      case 0: return storage.get(currentAddress);     // Mode brut
      case 6: return fsHook.readData();               // Mode fichiers
      case 5: return fsHook.lastCommandResult;        // Résultat commande
    }
  };
  
  return { storage, fsHook, read, write };
};

// Système de fichiers minimaliste
export const useFileSystem = (storage, setStorage): FsHook => {
  // Structure: Superbloc + Bitmap + Inodes + Données
  const SECTOR_SIZE = 256;
  const MAX_FILES = 64;
  
  // Gestion inodes avec permissions rwx
  interface Inode {
    name: string;     // 8 chars
    size: u16;        // Taille
    startSector: u8;  // Premier secteur
    flags: u8;        // 0=libre, 1=occupé
    permissions: u8;  // rwx bits (Unix-like)
  }
  
  // Commandes via I/O ports
  const executeCommand = (cmd: u8) => {
    switch (cmd) {
      case 0x90: return listFiles().length;    // LIST
      case 0x91: return createFile(name);      // CREATE
      case 0x92: return openFile(name);        // OPEN
      case 0x96: return setPermissions(perms); // CHMOD
    }
  };
  
  return { executeCommand, readData, writeData, listFiles };
};
```



# Programme Utilisateur → Exécution

1. Sélection programme dans UI (PanelControls)
2. loadProgram() copie le code sur programDisk
3. programDisk → RAM (adresse 0x0200)
4. Mini-OS détecte programme en RAM
5. JMP à 0x0200, début exécution
6. CPU fetch/decode/execute chaque instruction
7. Instructions peuvent:
   - Manipuler registres (ALU)
   - Lire/écrire mémoire
   - Accéder aux I/O ports
   - Gérer pile (PUSH/POP)
   - Gérer interruptions


# Gestion des États React

```ts
// useMemo pour éviter recalculs
const devices = useMemo(() => new Map([...]), [deps]);

// useCallback pour stabilité
const read = useCallback((port: u8): u8 => {...}, [storage, fsHook]);

// useRef pour mutable state (filePointer)
const filePointerRef = useRef<u16>(U16(0));

// État localisé: chaque hook gère son propre état
// → Pas de prop drilling
// → Isolé et testable
```


# Communication entre Hooks

```
useComputer
  ├── useCpu (reçoit memoryHook, ioHook)
  ├── useMemory (combine romHook, ramHook, ioHook)
  └── useIo (orchestre devices)

useDiskDevice
  └── useFileSystem (reçoit storage parent)

Props remontées via return values des hooks
```


# Segmentation Mémoire

```ts
export const MEMORY_MAP = {
  // ROM (256 bytes) - Bootloader immuable
  ROM_START: 0x0000, ROM_END: 0x00FF,
  
  // RAM (63.5KB) - OS + Programmes
  OS_START: 0x0100, OS_END: 0x01FF,      // 256 bytes OS
  PROGRAM_START: 0x0200, PROGRAM_END: 0xFDFF, // ~63KB programmes
  
  // Stack (256 bytes) - Croît vers le bas
  STACK_START: 0xFE00, STACK_END: 0xFEFF,
  
  // I/O (256 ports) - Périphériques mappés en mémoire
  IO_START: 0xFF00, IO_END: 0xFFFF,
  
  // Ports spécifiques (Device 0: OS Disk)
  OS_DISK_BASE: 0xFF00,
  OS_DISK_DATA: 0xFF00,      // Port 0: Accès brut
  OS_DISK_COMMAND: 0xFF04,   // Port 4: Commandes FS
  FS_DATA: 0xFF06,           // Port 6: Données fichiers
};
```


# Visualisation en temps réel du state interne

```ts
// Avec React, on peut voir TOUT l'état en live :
const PanelRegisters = () => {
  const { cpuHook } = useComputer();
  
  return (
    <div>
      {Array.from(cpuHook.registers.entries()).map(([reg, value]) => (
        <div key={reg}>
          {reg}: 0x{value.toString(16)} ← **Mise à jour automatique !**
        </div>
      ))}
    </div>
  );
};
```


# Architecture déclarative

```ts
// Au lieu de:
function updateCPU() {
  // 100 lignes de mutations impératives
  cpu.pc++;
  memory[cpu.pc] = instruction;
  cpu.ir = instruction;
  // ...
}

// Avec React/Hooks:
const useCpu = () => {
  const [pc, setPc] = useState(0);
  const [ir, setIr] = useState(0);
  // L'état est DÉCLARÉ, pas muté
};
```


# Isolation et testabilité des composants

```ts
// Chaque "périphérique" est un hook indépendant:
const useDiskDevice = () => { /* état disque */ };
const useFileSystem = () => { /* état fichiers */ };
const useInterrupt = () => { /* état interruptions */ };

// Testable individuellement:
test('useDiskDevice reads sector', () => {
  const disk = useDiskDevice(testData);
  expect(disk.read(0)).toBe(0x42);
});
```


# Réactivité automatique

```ts
// Sans React:
function onMemoryWrite(address, value) {
  updateUI();        // ← DOIT APPELER MANUELLEMENT
  updateDebugger();  // ← DOIT APPELER MANUELLEMENT
  saveToHistory();   // ← DOIT APPELER MANUELLEMENT
}

// Avec React:
const useMemory = () => {
  const [storage, setStorage] = useState(new Map());
  
  const write = (address, value) => {
    setStorage(prev => new Map(prev).set(address, value));
    // UI, debugger, history se mettent à jour AUTOMATIQUEMENT
  };
};
```


---


# Intro
on va essaeyr de comprendre te reproduire le fonctionnement d'un ordinateur (composé de CPU mémoire et periphérique) directement dans notre navigateur.

il parait que le CPU est le centre du PC. Commencons par analyser son role et remontont toute la chaine d'execution d'un programme.

un cpu est une puce electronique contenant des milliards de transistors (sortes d'interrupteur electronique miniature).

## CPU
- le coeur de l'ordinateur est le PC
- le CPU contient plusieurs "registres" dans lequel il stocke temporairement des valeurs numériques
- le CPU permet d'executer des instructions, permettant de changer les valeurs des registres.
- il permet aussi d'executer des instructions, permettant de lire ou écrire dans la mémoire (RAM)
- il permet également d'executer des instructions, permettant d'intéragir avec les périphériques
- le CPU est principalement constitué d'une unité de controle, de registres et d'une ALU (unité logique et arithmétique)



# Plan
1. CPU (registres, instructions) + Mémoire (ROM + RAM) + Internal Devices (IO)
2. Clock, Power Suppply, Storage, External Devices (IO)
3. Multi coeurs, multiples CPU
4. Interruption, Timer, Direct Memory Access et Cache CPU
5. Bootloader
6. OS (stack, heap, malloc, drivers, scheduler, syscalls, fork, gestion processus, ...)
7. Compilateur


# Ordinateur, language machine, instruction et assembleur


## Instructions, code machine et assembleur
- les instructions (en langage machine) à faire éxecuter au CPU sont chargées en RAM pour que le CPU puisse les executer

## Bootloader & OS
- au démarrage, le CPU démarre sur le bootloader/bios/uefi. Ce bootloader cherche un OS (sur les différents disques) à démarrer
- L'OS, une fois démarré, prend en charge la gestion des processus, des threads, des périphériques (avec drivers), ...
- L'OS gère les accès à la mémoire, la mémoire virtuelle, les pages de mémoire, ...
- L'OS executre son propre code en mode "kernel" et le code des applications en mode "user"

## Mémoire
- La mémoire est connecté au CPU via un bus d'adresse, de données et de controle
- La mémoire contient les programmes à executer et les données nécessaires



---


Acte 1 : L'atome informatique (5 min)
- CPU = calculateur + décideur
- Registres = mémoire ultra-rapide (montrer R0, R1, PC, SP)
- ALU = calculatrice interne
- Instruction simple : ADD R0, R1 (montrer visuellement)

Acte 2 : La mémoire, bibliothèque géante (3 min)
- RAM vs ROM (livres qu'on peut modifier vs livres fixes)
- Adresses = étagères numérotées
- LOAD/STORE = aller chercher/ranger un livre

Acte 3 : Le langage secret (4 min)
- Binaire → Assembleur → C (niveaux d'abstraction)
- Démo : "A = B + C" en C → assembleur → binaire → signaux électriques

Acte 4 : La symphonie orchestrée (4 min)
- Horloge = métronome
- Pipeline = chaîne de montage
- Périphériques = monde extérieur

Acte 5 : La magie de l'abstraction (4 min)
- Du transistor au programme
- OS = chef d'orchestre
- Processus = partitions séparées



# Elements visuels à montrer
1. Animation d'un registre qui se remplit (8/16/32/64 bits)
2. Flux de données : Registre → ALU → Registre (avec couleurs)
3. Bus mémoire comme un tunnel avec des voitures (données)
4. Pipeline comme une chaîne de montage de voitures
5. Mode kernel/user comme deux étages (étage sécurisé/étage public)


---


- Votre ordinateur en 20 minutes : ce que personne ne vous a jamais montré
- Le langage secret des ordinateurs : de votre clic à l'écran pixel par pixel
- CPU décodé : ce qui se cache derrière chaque touche que vous tapez
- Comment votre ordinateur pense vraiment : le voyage d'une instruction
- L'ordinateur expliqué à un humain : du transistor à TikTok
- Comment fonctionne un ordinateur, couche par couche (même si vous n'y connaissez rien)
- Comprendre votre PC : Comment un calcul devient un jeu vidéo
- Architecture des ordinateurs : tout comprendre en partant de zéro
- La cuisine du CPU : la recette secrète qui fait tourner vos apps
- Inside the CPU : le ballet invisible qui fait vivre vos programmes




# Ressources:
- https://lions-wing.net/lessons/hardware/hard.html

