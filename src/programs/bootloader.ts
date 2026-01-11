
import { MEMORY_MAP } from "../lib/memory_map";
import { compileCode } from "@/lib/compiler";

import type { u16, u8 } from "@/types/cpu.types";

import BootloaderSourceCode from '@/programs/asm/boot/bootloader.asm?raw'


// TODO: bootloader v2 qui copie le contenu de osDisk en RAM puis boot dessus

// ALTERNATIVE: bootloader v3 qui boote sur le disk (sans passer par la RAM. requiert des instructions d'accès disk)


// Bootloader ROM : Initialise le système et saute à l'OS


//export const BOOTLOADER: Map<u16, u8> = compileCode(BootloaderSourceCode, MEMORY_MAP.ROM_START).code;


