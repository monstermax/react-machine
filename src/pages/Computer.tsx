
import { useCallback, useEffect, useState } from "react";

import { useComputer } from "@/hooks/useComputer";

import { PanelMemory } from "@/components/computer/PanelMemory";
import { PanelControls } from "@/components/computer/PanelControls";
import { PanelRegisters } from "@/components/computer/PanelRegisters";
import { PanelInterrupt } from "@/components/computer/PanelInterrupt";
import { SevenSegmentDisplay } from "@/components/io/SevenSegmentDisplay";
import { LEDsDisplay } from "@/components/io/LEDsDisplay";


export const ComputerPage: React.FC = () => {
    const computerHook = useComputer();
    const { ramHook, ioHook } = computerHook;
    const { resetComputer, loadProgram } = computerHook;


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
                        resetComputer={resetComputer}
                    />
                </div>

                {/* Memory */}
                <PanelMemory
                    computerHook={computerHook}
                />


                {/* IOs Devices */}

                <div className="flex gap-8 mb-8">

                    {(true /* || currentProgram === 'blink_leds' */ ) && (
                        <>
                            {/* LEDs */}
                            <LEDsDisplay device={computerHook.ioHook.leds} />
                        </>
                    )}

                    {(true /* || currentProgram === 'seven_segments' */ ) && (
                        <>
                            {/* Seven Segment Display */}
                            <SevenSegmentDisplay
                                device={ioHook.sevenSegment}
                                label="Display 1"
                            />
                        </>
                    )}

                    {(true /* || currentProgram === 'timer_demo' */ ) && (
                        <>
                            <PanelInterrupt
                                interruptHook={ioHook.interrupt}
                            />
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

