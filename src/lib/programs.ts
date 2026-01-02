
import { Opcode } from "./instructions";

import { MEMORY_MAP } from "./memory_map";

import { programs as displayPrograms } from "@/programs/display";
import { programs as interruptPrograms } from "@/programs/interrupt";
import { programs as jumpPrograms } from "@/programs/jump";
import { programs as keyboardPrograms } from "@/programs/keyboard";
import { programs as logicalPrograms } from "@/programs/logical";
import { programs as memoryPrograms } from "@/programs/memory";
import { programs as registersPrograms } from "@/programs/registers";
import { programs as stackPrograms } from "@/programs/stack";

import type { ProgramInfo, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    ...displayPrograms,
    ...interruptPrograms,
    ...jumpPrograms,
    ...keyboardPrograms,
    ...logicalPrograms,
    ...memoryPrograms,
    ...registersPrograms,
    ...stackPrograms,
    ...displayPrograms,
    ...interruptPrograms,
    ...jumpPrograms,
    ...keyboardPrograms,
    ...logicalPrograms,
    ...memoryPrograms,
    ...registersPrograms,
    ...stackPrograms,
};



/*

// Programme: écho clavier
LOOP:
  LOAD_MEM [KEYBOARD_STATUS]  // Touche dispo ?
  JZ LOOP
  LOAD_MEM [KEYBOARD_DATA]    // Lire touche
  STORE [CONSOLE_CHAR]        // Afficher
  JMP LOOP


// Jouer une mélodie
FOR each note:
  LOAD_A frequency
  STORE [BUZZER_FREQ]
  LOAD_A 100  // 100ms
  STORE [BUZZER_DURATION]


*/


