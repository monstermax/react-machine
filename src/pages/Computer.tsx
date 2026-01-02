
import { useCallback, useEffect, useState } from "react";

import { useComputer, type ComputerHook } from "@/hooks/useComputer";

import { PanelMemory } from "@/components/computer/PanelMemory";
import { PanelControls } from "@/components/computer/PanelControls";
import { PanelRegisters } from "@/components/computer/PanelRegisters";
import { PanelInterrupt } from "@/components/computer/PanelInterrupt";
import { SevenSegmentDisplay } from "@/components/io/SevenSegmentDisplay";
import { LEDsDisplay } from "@/components/io/LEDsDisplay";
import { KeyboardDisplay } from "@/components/io/Keyboarddisplay";
import { ConsoleDisplay } from "@/components/io/Consoledisplay";


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
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {(computerHook.loadedProgram === 'blink_leds') && (
                <>
                    {/* LEDs */}
                    <LEDsDisplay device={computerHook.ioHook.leds} />
                </>
            )}

            {(computerHook.loadedProgram === 'seven_segments') && (
                <>
                    {/* Seven Segment Display */}
                    <SevenSegmentDisplay
                        device={computerHook.ioHook.sevenSegment}
                        label="Display 1"
                    />
                </>
            )}

            {(computerHook.loadedProgram === 'timer_demo') && (
                <div className="lg:col-span-3">
                    <PanelInterrupt interruptHook={computerHook.ioHook.interrupt} />
                </div>
            )}

            {/* Keyboard */}
            <KeyboardDisplay device={computerHook.ioHook.keyboard} />


            {/* Console */}
            <ConsoleDisplay device={computerHook.ioHook.console} />


        </div>
    );
}

