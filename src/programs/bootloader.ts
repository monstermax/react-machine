
//import type { u8, u16 } from "@/types/cpu.types";
import type { u16, u8 } from "@/types/cpu.types";
import { Opcode } from "../lib/instructions";
import { MEMORY_MAP } from "../lib/memory_map";
import { high16, low16 } from "@/lib/integers";
import { compileCode } from "@/lib/compiler";


// TODO: bootloader v2 qui copie le contenu de osDisk en RAM puis boot dessus

// ALTERNATIVE: bootloader v3 qui boote sur le disk (sans passer par la RAM. requiert des instructions d'accès disk)


// Bootloader ROM : Initialise le système et saute à l'OS

const BootloaderSourceCode = `
:INIT
SET_SP MEMORY_MAP.STACK_END # Initialiser le Stack Pointer

:WAIT_FOR_OS
MOV_A_MEM MEMORY_MAP.OS_START # Vérifie si un OS est chargé en mémoire
NOP
JZ $WAIT_FOR_OS # Si pas d'OS détecté on boucle

:RUN_OS
JMP MEMORY_MAP.OS_START # Lance l'OS
`;

export const BOOTLOADER: Map<u16, u8> = compileCode(BootloaderSourceCode, MEMORY_MAP.ROM_START).code;


