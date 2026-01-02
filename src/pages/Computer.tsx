
import { useCallback, useEffect, useState } from "react";

import { programs } from "@/lib/programs";
import { MEMORY_MAP } from "@/lib/memory_map";

import { useComputer } from "@/hooks/useComputer";

import { PanelMemory } from "@/components/computer/PanelMemory";
import { PanelControls } from "@/components/computer/PanelControls";
import { PanelRegisters } from "@/components/computer/PanelRegisters";

import type { ProgramInfo } from "@/types/cpu.types";
import type { LedsDevice } from "@/hooks/devices/useLeds";
import type { SevenSegmentHook } from "@/hooks/devices/useSevenSegment";


export const ComputerPage: React.FC = () => {
    const computerHook = useComputer();
    const { ramHook, cpuHook, romHook, ioHook } = computerHook;
    const { resetComputer } = computerHook;

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
        <div className="min-h-screen bg-slate-950 text-white">
            <h1 className="text-3xl font-bold p-4">16-bit Computer</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="space-y-8">
                    {/* CPU State */}
                    <PanelRegisters computerHook={computerHook} />

                    {/* Controls */}
                    <PanelControls
                        computerHook={computerHook}
                        currentProgram={currentProgram}
                        loadProgram={loadProgram}
                        setCurrentProgram={setCurrentProgram}
                        resetComputer={resetComputer}
                    />
                </div>

                {/* Memory */}
                <PanelMemory
                    computerHook={computerHook}
                />


                {/* IOs Devices */}

                <div className="flex gap-8 mb-8">

                    {(true || currentProgram === 'blink_leds') && (
                        <>
                            {/* LEDs */}
                            <LEDsDisplay device={computerHook.ioHook.leds} />
                        </>
                    )}

                    {(true || currentProgram === 'seven_segments') && (
                        <>
                            {/* Seven Segment Display */}
                            <SevenSegmentDisplay
                                device={ioHook.sevenSegment}
                                label="Display 1"
                            />
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};



const LEDsDisplay: React.FC<{ device: LedsDevice }> = ({ device }) => {
    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h2 className="text-xl font-semibold mb-2 text-purple-400">LEDs</h2>

            <div className="flex gap-2">
                {device.getLeds().map((on, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full ${on ? 'bg-yellow-500' : 'bg-gray-700'}`} />
                ))}
            </div>
        </div>
    );
};



type SevenSegmentProps = {
    device: SevenSegmentHook;
    label?: string;
};

export const SevenSegmentDisplay: React.FC<SevenSegmentProps> = ({
    device,
    label = "Display 1"
}) => {
    const segments = device.getSegments();
    const digit = device.getCurrentDigit();

    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h2 className="text-xl font-semibold mb-2 text-purple-400">7 Segments Display</h2>

            <div className="flex flex-col items-center bg-slate-900 p-4 rounded-lg border border-slate-700">
                <div className="text-sm text-slate-300 mb-2">{label}</div>

                {/* Affichage 7 segments */}
                <div className="relative w-32 h-48 flex items-center justify-center">
                    <svg viewBox="0 0 100 150" className="w-full h-full">
                        {/* Segment a (top) */}
                        <polygon
                            points="20,5 80,5 75,10 25,10"
                            className={segments[0] ? 'fill-red-500' : 'fill-gray-800'}
                        />

                        {/* Segment b (top right) */}
                        <polygon
                            points="80,5 85,10 85,70 80,65 75,70 75,10"
                            className={segments[1] ? 'fill-red-500' : 'fill-gray-800'}
                        />

                        {/* Segment c (bottom right) */}
                        <polygon
                            points="80,85 85,80 85,140 80,145 75,140 75,80"
                            className={segments[2] ? 'fill-red-500' : 'fill-gray-800'}
                        />

                        {/* Segment d (bottom) */}
                        <polygon
                            points="20,145 80,145 75,140 25,140"
                            className={segments[3] ? 'fill-red-500' : 'fill-gray-800'}
                        />

                        {/* Segment e (bottom left) */}
                        <polygon
                            points="15,80 20,85 20,145 15,140 10,140 10,80"
                            className={segments[4] ? 'fill-red-500' : 'fill-gray-800'}
                        />

                        {/* Segment f (top left) */}
                        <polygon
                            points="15,10 20,5 20,65 15,70 10,70 10,10"
                            className={segments[5] ? 'fill-red-500' : 'fill-gray-800'}
                        />

                        {/* Segment g (middle) */}
                        <polygon
                            points="20,75 25,70 75,70 80,75 75,80 25,80"
                            className={segments[6] ? 'fill-red-500' : 'fill-gray-800'}
                        />

                        {/* Point décimal */}
                        <circle
                            cx="90"
                            cy="140"
                            r="4"
                            className={segments[7] ? 'fill-red-500' : 'fill-gray-800'}
                        />
                    </svg>
                </div>

                {/* Valeur numérique */}
                <div className="mt-2 text-center">
                    <div className="text-xs text-slate-400">Value:</div>
                    <div className="text-2xl font-bold text-green-400">
                        {digit.toString(16).toUpperCase()}
                    </div>
                    <div className="text-xs text-slate-500">
                        Binary: {digit.toString(2).padStart(4, '0')}
                    </div>
                </div>
            </div>

        </div>
    );
};

