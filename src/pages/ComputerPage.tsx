
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";

import { useComputer } from "@/v1/hooks/useComputer";

import { PanelMemory } from "@/v1/components/computer/PanelMemory";
import { PanelControls } from "@/v1/components/computer/PanelControls";
import { PanelRegisters } from "@/v1/components/computer/PanelRegisters";
import { IosDevices } from "@/v1/components/io/IosDevices";


export const ComputerPage: React.FC = () => {
    //console.log('RENDER ComputerPage')

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (mounted) return
        setMounted(true)
    }, [mounted])


    if (!mounted) return null;

    return (
        <>
            <ComputerComponent />
        </>
    );
};



export const ComputerComponent: React.FC = () => {
    //console.log('RENDER ComputerPage.ComputerComponent')

    const computerHook = useComputer();
    const { resetComputer, loadOs, unloadOs, loadProgram, unloadProgram } = computerHook;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <h1 className="text-2xl font-bold px-4 py-2">
                <Link to="/">CPU Simulator</Link>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="space-y-8">

                    {/* Controls */}
                    <PanelControls
                        computerHook={computerHook}
                        loadOs={loadOs}
                        loadProgram={loadProgram}
                        unloadOs={unloadOs}
                        unloadProgram={unloadProgram}
                        resetComputer={resetComputer}
                    />

                    {/* CPU State */}
                    <PanelRegisters computerHook={computerHook} />

                </div>

                {/* Memory */}
                <PanelMemory
                    computerHook={computerHook}
                    />


                {/* IOs Devices */}
                <div className="lg:col-span-2">
                    <IosDevices computerHook={computerHook} />
                </div>

            </div>
        </div>
    );
};





