

import { MEMORY_MAP } from "../lib/memory_map";
import { compileCode } from "@/lib/compiler";

import type { OsInfo, u16, u8 } from "@/types/cpu.types";


// MINI OS v1.0 - Attente de présence d'un programme et le lance

export const MINI_OS_V1: OsInfo = {
    name: "Mini OS",
    description: "Attend qu'un programme soit chargé en RAM, puis l'exécute",
    filepath: 'boot/os_v1.asm',
};



// MINI OS v2.0 - Menu avec console et choix au clavier - Options: 1=Run, 2=Info, 3=Clear

export const MINI_OS_V2: OsInfo = {
    name: "Mini OS (v2)",
    description: "Menu avec console et choix au clavier",
    filepath: 'boot/os_v2.asm',
};



export const os_list: Record<string, OsInfo> = {
    MINI_OS_V1,
    MINI_OS_V2,
};
