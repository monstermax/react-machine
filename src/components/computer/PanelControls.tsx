
import { useEffect, useState, useRef } from "react";

import { programs } from "@/lib/programs";
import type { ComputerHook } from "@/hooks/useComputer";
import { MEMORY_MAP } from "@/lib/memory_map";


export type PanelControlsProps = {
    computerHook: ComputerHook;
    loadProgram: (programName: string) => void;
    unloadProgram: () => void;
    resetComputer: () => void;
}


// Fréquences disponibles
const frequencies = [
    { label: "0.1 Hz (très lent)", value: 0.1 },
    { label: "0.5 Hz", value: 0.5 },
    { label: "1 Hz", value: 1 },
    { label: "2 Hz", value: 2 },
    { label: "5 Hz", value: 5 },
    { label: "10 Hz", value: 10 },
    { label: "20 Hz", value: 20 },
    { label: "50 Hz", value: 50 },
    { label: "100 Hz (rapide)", value: 100 },
];


export const PanelControls: React.FC<PanelControlsProps> = (props) => {
    const { computerHook } = props;
    const { cpuHook } = computerHook;
    const { loadProgram, unloadProgram, resetComputer } = props;

    const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

    // État Play/Pause
    const [isRunning, setIsRunning] = useState(false);
    const [frequency, setFrequency] = useState(1); // Hz (cycles par seconde)
    const intervalRef = useRef<number | null>(null);


    const selectedProgramInfo = selectedProgram ? programs[selectedProgram] : null;
    const loadedProgramInfo = computerHook.loadedProgram ? programs[computerHook.loadedProgram] : null;

    const programInfo = selectedProgramInfo ?? loadedProgramInfo;

    const isUnloaded = loadedProgramInfo ? (computerHook.memoryHook.readMemory(MEMORY_MAP.PROGRAM_START) === 0x00) : false;


    // Gestion du timer
    useEffect(() => {
        if (isRunning && !cpuHook.halted) {
            const interval = 1000 / frequency; // Intervalle en ms

            intervalRef.current = setInterval(() => {
                cpuHook.executeCycle();
            }, interval);

        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, frequency, cpuHook, cpuHook.halted]);


    // Arrêter automatiquement si le CPU halt
    useEffect(() => {
        if (cpuHook.halted && isRunning) {
            setIsRunning(false);
        }
    }, [cpuHook.halted, isRunning]);


    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-2 text-green-400">Controls</h2>

            {/* Sélection de programme */}
            <div className="mb-4 flex gap-4 items-center">
                <label className="text-sm font-medium text-slate-300">Select Program:</label>

                <select
                    value={selectedProgram ?? ''}
                    onChange={(e) => setSelectedProgram(e.target.value || null)}
                    className="bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white w-96"
                >
                    <option key="none" value="">
                        None
                    </option>
                    {Object.entries(programs).map(([key, prog]) => (
                        <option key={key} value={key}>
                            {prog.name} - {prog.description}
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => {
                        loadProgram(selectedProgram ?? '');
                        //setSelectedProgram(null)
                    }}
                    disabled={!selectedProgram}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-6 py-2 rounded transition-colors"
                >
                    Load
                </button>

                <button
                    onClick={() => unloadProgram()}
                    disabled={!computerHook.loadedProgram}
                    className="bg-purple-800 hover:bg-purple-900 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-6 py-2 rounded transition-colors"
                >
                    Unload
                </button>
            </div>

            <div className="mb-4 flex gap-4 items-center">

                {/* Auto-play */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        disabled={cpuHook.halted}
                        className={`${isRunning
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : "bg-green-600 hover:bg-green-700"
                            } disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-6 py-2 rounded transition-colors font-semibold`}
                    >
                        {isRunning ? "⏸ Pause" : "▶ Auto-Play"}
                    </button>

                    <label className="text-sm font-medium text-slate-300">Speed:</label>
                    <select
                        value={frequency}
                        onChange={(e) => setFrequency(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                        disabled={isRunning}
                    >
                        {frequencies.map(({ label, value }) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="ms-auto flex items-center gap-6">
                    <button
                        onClick={cpuHook.executeCycle}
                        disabled={cpuHook.halted || isRunning}
                        className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-6 py-2 rounded transition-colors"
                    >
                        ⏭ Step
                    </button>

                    <button
                        onClick={() => {
                            setIsRunning(false);
                            resetComputer();
                        }}
                        className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                        Reset
                    </button>
                </div>

            </div>


            {/* Info programme */}
            {
                programInfo && (
                    <div className="mt-4 p-4 bg-slate-900/50 rounded border border-slate-600">
                        <div className="flex text-sm text-slate-300">
                            <strong className="text-blue-400 me-2">Program:</strong> {programInfo.name}

                            {(loadedProgramInfo && (!selectedProgram || loadedProgramInfo.name === selectedProgramInfo?.name)) && (
                                <div className={`ms-auto px-6 py-2 rounded ${isUnloaded ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}`}>
                                    <>[{isUnloaded ? "UNLOADED" : "LOADED"}]</>
                                </div>
                            )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            {programInfo.description}
                        </div>
                        <div className="mt-2 text-xs text-green-400">
                            <strong>Expected:</strong> {programInfo.expectedResult}
                        </div>
                    </div>
                )
            }
        </div >
    );
}

