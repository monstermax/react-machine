
import { useCallback, useEffect, useState } from "react";

import { useComputer, type ComputerHook } from "@/hooks/useComputer";

import { PanelMemory } from "@/components/computer/PanelMemory";
import { PanelControls } from "@/components/computer/PanelControls";
import { PanelRegisters } from "@/components/computer/PanelRegisters";
import { PanelInterrupt } from "@/components/computer/PanelInterrupt";
import { WidgetSevenSegmentDisplay } from "@/components/io/WidgetSevenSegmentDisplay";
import { WidgetLEDsDisplay } from "@/components/io/WidgetLEDsDisplay";
import { WidgetKeyboard } from "@/components/io/WidgetKeyboard";
import { WidgetConsole } from "@/components/io/WidgetConsole";
import { WidgetPixelDisplay } from "@/components/io/WidgetPixelDisplay";
import { WidgetLCDDisplay } from "@/components/io/WidgetLcdDisplay";


export const ComputerPage: React.FC = () => {
    const computerHook = useComputer();
    const { resetComputer, loadProgram, unloadProgram } = computerHook;

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
                        loadProgram={loadProgram}
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



const IosDevices: React.FC<{ computerHook: ComputerHook }> = ({ computerHook }) => {
    return (
        <div className="space-y-6">
            {/* Row 1: Small devices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <WidgetLEDsDisplay device={computerHook.ioHook.leds} />

                <WidgetSevenSegmentDisplay
                    device={computerHook.ioHook.sevenSegment}
                    label="Display 1"
                />

                <WidgetKeyboard device={computerHook.ioHook.keyboard} />
            </div>

            {/* Row 2: Medium devices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WidgetLCDDisplay device={computerHook.ioHook.lcd} />

                <WidgetPixelDisplay device={computerHook.ioHook.pixelDisplay} />
            </div>

            {/* Row 3: Large devices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WidgetConsole device={computerHook.ioHook.console} />

                <PanelInterrupt interruptHook={computerHook.ioHook.interrupt} />
            </div>
        </div>
    );
}



