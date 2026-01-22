
# Interface Graphique type "Menuconfig" pour l'OS

## Concept

Créer une interface semi-graphique style "menuconfig" Linux en utilisant uniquement du texte et des caractères spéciaux dans la console.

## Difficulté : **MOYENNE** ⭐⭐⭐☆☆

### Ce qu'il faut :

1. **Console avec positionnement du curseur** ✅ (tu l'as déjà avec LCD_CURSOR)
2. **Gestion du clavier** ✅ (tu l'as)
3. **Buffer d'écran** (besoin d'améliorer)
4. **Logique de navigation**

---

## Architecture Proposée

### Option 1 : Console étendue (RECOMMANDÉ)
Améliore ta console existante pour supporter :
- Positionnement curseur X,Y
- Couleurs/attributs (optionnel)
- Clear zones

```asm
# API Console étendue
CONSOLE_GOTO_XY     # Positionner curseur
CONSOLE_SET_COLOR   # Définir couleur (foreground/background)
CONSOLE_CLEAR_LINE  # Effacer ligne
CONSOLE_DRAW_BOX    # Dessiner une boîte
```

### Option 2 : Buffer texte 2D
Créer un buffer en RAM qui représente l'écran :

```
RAM Layout:
0x2000-0x2FFF : Screen buffer (80x25 = 2000 bytes)
0x3000-0x3FFF : Attribute buffer (colors, bold, etc.)
```

---

## Exemple d'Interface Menuconfig

```
┌────────────── System Configuration ──────────────┐
│                                                   │
│  [*] Enable Filesystem                           │
│  [ ] Enable Network                              │
│  [*] Enable LED Display                          │
│      LED Display Options --->                    │
│  [ ] Enable Serial Port                          │
│                                                   │
│  <Save>  <Load>  <Exit>                          │
│                                                   │
└───────────────────────────────────────────────────┘

Use arrows to navigate, SPACE to toggle, ENTER to select
```

---

## Implémentation Simple

### Étape 1 : Structures de données

```asm
# Menu Item Structure (8 bytes)
# Offset 0: Type (0=checkbox, 1=submenu, 2=action)
# Offset 1: State (0=unchecked, 1=checked)
# Offset 2-3: Text pointer (16-bit)
# Offset 4-5: Action pointer (16-bit)
# Offset 6-7: Reserved

:MENU_DATA
# Item 0: Filesystem
DB 0x00, 0x01  # Type=checkbox, State=checked
DW $STR_FILESYSTEM
DW $ACTION_TOGGLE_FS

# Item 1: Network
DB 0x00, 0x00  # Type=checkbox, State=unchecked
DW $STR_NETWORK
DW $ACTION_TOGGLE_NET

# Item 2: LED Display
DB 0x01, 0x00  # Type=submenu
DW $STR_LEDS
DW $SUBMENU_LEDS
```

### Étape 2 : Drawing

```asm
:DRAW_MENU
# Dessiner le cadre
CALL $DRAW_BOX

# Dessiner les items
MOV_C_IMM 0  # Current item index

:DRAW_ITEMS_LOOP
# Calculer position Y
MOV_A_C
ADD_IMM 2  # Offset for header
MOV_B_A

# Positionner curseur
CALL $GOTO_XY  # X=2, Y=B

# Charger item data
# ... (lire type, state, text)

# Dessiner checkbox ou flèche
# ...

# Dessiner texte
# ...

INC_C
MOV_A_C
MOV_B_IMM MENU_ITEM_COUNT
SUB
JNZ $DRAW_ITEMS_LOOP

RET
```

### Étape 3 : Navigation

```asm
:MENU_LOOP
CALL $DRAW_MENU

:WAIT_KEY
# Lire touche
MOV_A_MEM @KEYBOARD_DATA
JZ $WAIT_KEY

# Effacer flag keyboard
MOV_MEM_A @KEYBOARD_DATA

# Traiter touche
MOV_B_IMM 0x41  # 'A' = Arrow Up
SUB
JZ $HANDLE_UP

MOV_A_MEM @KEYBOARD_DATA
MOV_B_IMM 0x42  # 'B' = Arrow Down
SUB
JZ $HANDLE_DOWN

MOV_A_MEM @KEYBOARD_DATA
MOV_B_IMM 0x20  # Space = Toggle
SUB
JZ $HANDLE_TOGGLE

MOV_A_MEM @KEYBOARD_DATA
MOV_B_IMM 0x0D  # Enter = Select
SUB
JZ $HANDLE_SELECT

JMP $WAIT_KEY

:HANDLE_UP
# Décrémenter selected_item
# ...
JMP $MENU_LOOP

:HANDLE_DOWN
# Incrémenter selected_item
# ...
JMP $MENU_LOOP

:HANDLE_TOGGLE
# Toggle checkbox
# ...
JMP $MENU_LOOP
```

---

## Caractères de Dessin (Box Drawing)

Tu peux utiliser ASCII étendu ou des caractères simples :

```
Simple ASCII:
+---------+
| Item 1  |
| Item 2  |
+---------+

ASCII Étendu (Code page 437):
┌─────────┐
│ Item 1  │
│ Item 2  │
└─────────┘

Caractères:
┌ = 0xDA  ─ = 0xC4  ┐ = 0xBF
│ = 0xB3            │ = 0xB3
└ = 0xC0  ─ = 0xC4  ┘ = 0xD9
```

---

## Améliorations Console Nécessaires

### 1. Ajout de ports I/O

```typescript
// Console.api.ts
case 0x02: // CONSOLE_GOTO_XY
    // Value contient X dans low nibble, Y dans high nibble
    this.cursorX = value & 0x0F;
    this.cursorY = (value >> 4) & 0x0F;
    break;

case 0x03: // CONSOLE_SET_ATTR
    // Attributes: couleur, bold, etc.
    this.currentAttr = value;
    break;

case 0x04: // CONSOLE_DRAW_HLINE
    // Dessiner ligne horizontale
    break;

case 0x05: // CONSOLE_DRAW_VLINE
    // Dessiner ligne verticale
    break;
```

### 2. Buffer d'écran dans RAM

```asm
# Définir zone d'écran
@define SCREEN_WIDTH 80
@define SCREEN_HEIGHT 25
@define SCREEN_BUFFER 0x2000

# Fonctions utilitaires
:SCREEN_CLEAR
MOV_C_IMM <SCREEN_BUFFER
MOV_D_IMM >SCREEN_BUFFER
MOV_B_IMM 0  # Counter

:CLEAR_LOOP
MOV_A_IMM 0x20  # Space
MOV_PTR_CD_A
# Incrémenter C:D
# ...
INC_B
MOV_A_B
MOV_D_IMM <(SCREEN_WIDTH * SCREEN_HEIGHT)
SUB
JNZ $CLEAR_LOOP
RET
```

---

## Exemple Complet Simple

Voici un menu minimal fonctionnel :

```asm
:SIMPLE_MENU

# État du menu
@define MENU_ITEMS 3
@define SELECTED_ITEM 0x2000

:MENU_START
# Initialiser
MOV_A_IMM 0
MOV_MEM_A $SELECTED_ITEM

:MENU_DRAW
CALL $CLEAR_CONSOLE

# Titre
CALL $PRINT_TITLE

# Items
MOV_C_IMM 0
:DRAW_LOOP
CALL $DRAW_ITEM
INC_C
MOV_A_C
MOV_B_IMM MENU_ITEMS
SUB
JNZ $DRAW_LOOP

# Attendre input
:MENU_WAIT
MOV_A_MEM @KEYBOARD_DATA
JZ $MENU_WAIT

# Traiter
# ...

JMP $MENU_DRAW


:DRAW_ITEM
# C = item index
PUSH_C

# Si c'est l'item sélectionné, afficher '>'
MOV_A_MEM $SELECTED_ITEM
MOV_B_C
SUB
JZ $DRAW_SELECTED

# Sinon afficher ' '
MOV_A_IMM 0x20
JMP $DRAW_CHAR

:DRAW_SELECTED
MOV_A_IMM 0x3E  # '>'

:DRAW_CHAR
MOV_MEM_A @CONSOLE_CHAR

# Afficher le texte de l'item
# ...

POP_C
RET
```

---

## Estimation de Temps

- **Base minimale** (navigation, selection) : 2-3 jours
- **Avec box drawing** : +1 jour  
- **Avec couleurs/attributs** : +1 jour
- **Système complet style menuconfig** : 1 semaine

---

## Recommandation

**Commence simple :**

1. ✅ Menu texte basique (liste verticale)
2. ✅ Navigation haut/bas
3. ✅ Sélection avec ENTER
4. ✅ Toggle checkbox avec SPACE
5. ⭐ Ajoute les box drawing
6. ⭐ Ajoute les sous-menus
7. ⭐⭐ Ajoute les couleurs

Construis progressivement, teste à chaque étape !

---

## Code React pour Support Étendu Console

```typescript
// Console.tsx - Ajouter support positionnement curseur

interface ConsoleState {
    buffer: string[][];  // 2D array
    cursorX: number;
    cursorY: number;
    width: number;
    height: number;
}

// Render
<div className="console-grid">
    {buffer.map((row, y) => (
        <div key={y} className="console-row">
            {row.map((char, x) => (
                <span 
                    key={x}
                    className={`
                        console-cell
                        ${x === cursorX && y === cursorY ? 'cursor' : ''}
                    `}
                >
                    {char || ' '}
                </span>
            ))}
        </div>
    ))}
</div>
```

Avec du CSS pour affichage monospace grid.
