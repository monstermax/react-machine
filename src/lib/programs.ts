
import { Opcode } from "./instructions";

import { MEMORY_MAP } from "./memory_map";

import { programs as logicalPrograms } from "@/programs/logical";
import { programs as memoryPrograms } from "@/programs/memory";
import { programs as jumpPrograms } from "@/programs/jump";
import { programs as registersPrograms } from "@/programs/registers";
import { programs as stackPrograms } from "@/programs/stack";
import { programs as keyboardPrograms } from "@/programs/keyboard";
import { programs as displayPrograms } from "@/programs/display";
import { programs as timerPrograms } from "@/programs/timer";
import * as rtcPrograms from "@/programs/rtc";
import * as rngPrograms from "@/programs/rng";
import * as buzzerPrograms from "@/programs/buzzer";
import * as fsPrograms from "@/programs/fs";

import type { ProgramInfo, u8 } from "@/types/cpu.types";


export const programs: Record<string, ProgramInfo> = {
    //...logicalPrograms,
    //...memoryPrograms,
    //...jumpPrograms,
    //...registersPrograms,
    //...stackPrograms,

    // IO
    ...timerPrograms,
    ...keyboardPrograms,
    ...displayPrograms,
    ...rtcPrograms,
    ...rngPrograms,
    ...buzzerPrograms,
    ...fsPrograms,
};




