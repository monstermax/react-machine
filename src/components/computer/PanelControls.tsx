
import { useEffect, useState, useRef } from "react";

import { programs } from "@/lib/programs";
import type { ComputerHook } from "@/hooks/useComputer";


export type PanelControlsProps = {
    computerHook: ComputerHook;
    currentProgram: string | null;
    loadProgram: () => void;
    resetComputer: () => void;
    setCurrentProgram: React.Dispatch<React.SetStateAction<string | null>>;
}


export const PanelControls: React.FC<PanelControlsProps> = (props) => {
    const { computerHook, currentProgram } = props;
    const { cpuHook } = computerHook;
    const { loadProgram, setCurrentProgram, resetComputer } = props;

    const currentProgramInfo = currentProgram ? programs[currentProgram] : null;

    // État Play/Pause
    const [isRunning, setIsRunning] = useState(false);
    const [frequency, setFrequency] = useState(1); // Hz (cycles par seconde)
    const intervalRef = useRef<number | null>(null);

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

    // Gestion du timer
    useEffect(() => {
        if (isRunning && !cpuHook.halted) {
            const interval = 1000 / frequency; // Intervalle en ms
            
            intervalRef.current = setInterval(() => {
                cpuHook.executeClockCycle();
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
            <div className="mb-4 flex gap-4 items-center flex-wrap">
                <label className="text-sm font-medium text-slate-300">Select Program:</label>
                <select
                    value={currentProgram ?? ''}
                    onChange={(e) => setCurrentProgram(e.target.value || null)}
                    className="bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white"
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
                    onClick={loadProgram}
                    disabled={!currentProgram}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-6 py-2 rounded transition-colors"
                >
                    Load Program
                </button>
            </div>

            {/* Contrôles d'exécution */}
            <div className="mb-4 flex gap-4 items-center flex-wrap">
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        disabled={cpuHook.halted}
                        className={`${
                            isRunning 
                                ? "bg-yellow-600 hover:bg-yellow-700" 
                                : "bg-green-600 hover:bg-green-700"
                        } disabled:bg-slate-600 disabled:cursor-not-allowed px-6 py-2 rounded transition-colors font-semibold`}
                    >
                        {isRunning ? "⏸ Pause" : "▶ Play"}
                    </button>

                    <button
                        onClick={cpuHook.executeClockCycle}
                        disabled={cpuHook.halted || isRunning}
                        className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-6 py-2 rounded transition-colors"
                    >
                        ⏭ Step
                    </button>

                    <button
                        onClick={() => {
                            setIsRunning(false);
                            resetComputer();
                        }}
                        className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded transition-colors"
                    >
                        🔄 Reset
                    </button>
                </div>

                {/* Sélecteur de fréquence */}
                <div className="flex items-center gap-2">
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
            </div>

            {/* Info programme */}
            {currentProgramInfo && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded border border-slate-600">
                    <div className="text-sm text-slate-300">
                        <strong className="text-blue-400">Program:</strong> {currentProgramInfo.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        {currentProgramInfo.description}
                    </div>
                    <div className="mt-2 text-xs text-green-400">
                        <strong>Expected:</strong> {currentProgramInfo.expectedResult}
                    </div>
                </div>
            )}
        </div>
    );
}

