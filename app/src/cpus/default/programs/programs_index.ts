
import { programs as logicalPrograms } from "./logical";
import { programs as memoryPrograms } from "./memory";
import { programs as jumpPrograms } from "./jump";
import { programs as registersPrograms } from "./registers";
import { programs as stackPrograms } from "./stack";
import { programs as keyboardPrograms } from "./keyboard";
import { programs as displayPrograms } from "./display";
import { programs as timerPrograms } from "./timer";
import * as rtcPrograms from "./rtc";
import * as rngPrograms from "./rng";
import * as buzzerPrograms from "./buzzer";
import * as fsPrograms from "./fs";

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




