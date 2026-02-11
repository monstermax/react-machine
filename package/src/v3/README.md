
npx asc index.ts -o ../build/release.wasm

npx asc index.ts -o ../build/release.wasm --debug --sourceMap







```asm
.data
  var01 db 0        ; Réserve 1 octet initialisé à 0
  var02 dw 0        ; Réserve 2 octets
  var03 dd 0        ; Réserve 4 octets

.text
  ; === LIRE L'ADRESSE ===
  mov eax, var01      ; Met L'ADRESSE de var01 dans eax (ex: 0x8049000)
  ; C'est comme: eax = &var01

  ; === LIRE LE CONTENU ===
  mov al, [var01]     ; Met le CONTENU de var01 dans al (octet)
  mov ax, [var02]     ; Met le CONTENU de var02 dans ax (word)
  mov eax, [var03]    ; Met le CONTENU de var03 dans eax (dword)
  ; C'est comme: al = *var01

  ; === ÉCRIRE LE CONTENU ===
  mov [var01], al     ; Écrit al dans var01
  mov [var02], ax     ; Écrit ax dans var02
  mov [var03], eax    ; Écrit eax dans var03
  ; C'est comme: *var01 = al


; === ECRITURE EN MEMOIRE (TOUJOURS CROCHETS) ===
mov [var01], eax        ; ✅ écrit registre dans mémoire
mov [var01], 42         ; ✅ écrit constante dans mémoire
mov [var01], bl         ; ✅ écrit registre 8-bit
mov [ebx], eax          ; ✅ écrit via registre pointeur
mov [ebx+ecx*4], eax    ; ✅ écrit via adresse calculée
mov [var01 + ebx], eax  ; ✅ écrit via variable + offset

; === LECTURE DEPUIS MEMOIRE (CROCHETS AUSSI) ===
mov eax, [var01]        ; ✅ lit mémoire dans registre
mov bl, [var01]         ; ✅ lit 8-bit
mov eax, [ebx]          ; ✅ lit via pointeur

; === JAMAIS ÇA ===
mov var01, eax          ; ❌ ERREUR ! destination mémoire sans crochets
mov var01, 42           ; ❌ ERREUR ! (sauf en MASM/TASM, mais PAS en NASM)


mov eax, var01        ; eax = ADRESSE de var01
mov eax, [var01]      ; eax = CONTENU de var01
mov eax, [var01 + 5]  ; eax = CONTENU à (var01 + 5)
lea eax, [var01 + 5]  ; eax = ADRESSE (var01 + 5)
```


=> Sans crochets = adresse, Avec crochets = contenu

Note: Toujours spécifier byte, word, dword avec les immédiats



```
; === LEA = Load Effective Address ===
; LEA ne touche JAMAIS à la mémoire, il calcule juste une adresse

lea eax, [var01]     ; eax = adresse de var01 (calculée)
lea eax, [ebx+ecx*4] ; eax = ebx + ecx*4 (calcul mathématique)
lea eax, [ebx+10]    ; eax = ebx + 10 (addition simple)

; === MOV avec crochets = accès mémoire ===
mov eax, [var01]     ; Va CHERCHER en mémoire à l'adresse var01
mov eax, [ebx+ecx*4] ; Va CHERCHER en mémoire à cette adresse calculée


; Les modes d'adressage possibles pour LEA :
lea eax, [ebx]              ; adresse simple
lea eax, [ebx + ecx]        ; base + index
lea eax, [ebx + 10]         ; base + offset
lea eax, [ebx + ecx*4]      ; base + index*scale
lea eax, [ebx + ecx*4 + 10] ; base + index*scale + offset
lea eax, [var01]            ; adresse symbolique
lea eax, [var01 + ebx]      ; symbolique + registre


Notes:
Scale = seulement 1,2,4,8 (pas 9)
Scale = seulement sur un registre, pas sur une constante

[ecx*4]        ; ✅ index + scale seulement
[ecx*4 + 10]   ; ✅ index + scale + offset
[10]           ; ✅ offset seulement
[ecx]          ; ✅ index seulement (scale=1 implicite)
```
