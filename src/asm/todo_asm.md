

# Global: déclarer une fonction globalement accessible
```bash
.global main
```


# Text: déclarer du code executable
```asm
.bash
```


# Data: déclarer du code non executable (strings, constantes, ...)
```bash
.data
```




# Exemple complet
```bash
.global main
.text
main:
    lea message(%rip), %rdi # "load effective message" => enregistre l'adresse de memoire de "message" dans le registre rdi (rdi = 1er parametre de la fonction "printf")
    xor %rax, %rax # force la mise a jour de flag
    call printf

    mov $60, %rax # (on met 60 dans le registre rax. 60 = syscall pour terminer le programme)
    xor %rdi, %rdi # force la mise a jour de flag
    syscall

.data
message: .ascii "hello world\n"
```


- registre qui commence par "e" = registre 32 bits
- registre qui commence par "r" = registre 64 bits

