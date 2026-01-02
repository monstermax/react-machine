
import { useCallback, useEffect, useState } from "react";

import { programs } from "@/lib/programs";
import { MEMORY_MAP } from "@/lib/memory_map";

import { useComputer } from "@/hooks/useComputer";

import { PanelMemory } from "@/components/computer/PanelMemory";
import { PanelControls } from "@/components/computer/PanelControls";
import { PanelRegisters } from "@/components/computer/PanelRegisters";

import type { ProgramInfo } from "@/types/cpu.types";


export const ComputerPage: React.FC = () => {
    const computerHook = useComputer();
    const { ramHook, cpuHook, romHook, ioHook } = computerHook;

    const [currentProgram, setCurrentProgram] = useState<string | null>(null);


    // Charger un programme utilisateur sur le program disk
    const loadProgram = useCallback(() => {
        const program: ProgramInfo | null = currentProgram ? programs[currentProgram] : null;

        if (!program) {
            console.warn(`WARNING. Program not found`)
            return;
        }

        // Charger le programme DIRECTEMENT en RAM à PROGRAM_START
        ramHook.setStorage(current => {
            const newRam = new Map(current); // Garder l'OS

            for (const [relAddr, value] of program.code.entries()) {
                newRam.set(MEMORY_MAP.PROGRAM_START + relAddr, value);
            }

            return newRam;
        });
    }, [currentProgram, ramHook]);


    //console.log("🔧 ROM size:", romHook.storage.size);
    //console.log("🔧 First ROM bytes:", Array.from(romHook.storage.entries()).slice(0, 5));
    //console.log("🔧 PC value:", cpuHook.getRegister("PC"));
    //console.log("🔧 Memory at 0x00:", memoryHook.readMemory(0x00));


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white">
            <h1 className="text-3xl font-bold mb-4">CPU Simulator (8-bit)</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CPU State */}
                <PanelRegisters computerHook={computerHook} />

                {/* Memory */}
                <PanelMemory
                    computerHook={computerHook}
                />

                {/* Controls */}
                <PanelControls
                    computerHook={computerHook}
                    currentProgram={currentProgram}
                    loadProgram={loadProgram}
                    setCurrentProgram={setCurrentProgram}
                />
            </div>
        </div>
    );
};

