
import { useCallback, useEffect, useState } from "react";

import { useComputer } from "@/hooks/useComputer";

import { PanelMemory } from "@/components/computer/PanelMemory";
import { PanelControls } from "@/components/computer/PanelControls";
import { PanelRegisters } from "@/components/computer/PanelRegisters";
import { IosDevices } from "@/components/io/IosDevices";


export const ComputerPage: React.FC = () => {
    const computerHook = useComputer();
    const { resetComputer, loadOs, unloadOs, loadProgram, unloadProgram } = computerHook;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <h1 className="text-3xl font-bold p-4">16-bit Computer</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="space-y-8">
                    {/* CPU State */}
                    <PanelRegisters computerHook={computerHook} />

                    {/* Controls */}
                    <PanelControls
                        computerHook={computerHook}
                        loadOs={loadOs}
                        loadProgram={loadProgram}
                        unloadOs={unloadOs}
                        unloadProgram={unloadProgram}
                        resetComputer={resetComputer}
                    />
                </div>

                {/* Memory */}
                <PanelMemory computerHook={computerHook} />


                {/* IOs Devices */}
                <div className="lg:col-span-2">
                    <IosDevices computerHook={computerHook} />
                </div>

            </div>
        </div>
    );
};





