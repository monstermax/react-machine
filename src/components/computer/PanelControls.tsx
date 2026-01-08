
import { useEffect, useState, useRef, useCallback, memo } from "react";

import { programs } from "@/lib/programs";
import type { ComputerHook } from "@/hooks/useComputer";
import { MEMORY_MAP } from "@/lib/memory_map";
import { os_list } from "@/programs/mini_os";
import type { OsInfo, u16, u8 } from "@/types/cpu.types";


export type PanelControlsProps = {
    computerHook: ComputerHook;
    loadOs: (osName: string) => void;
    loadProgram: (programName: string) => void;
    unloadProgram: () => void;
    unloadOs: () => void;
    resetComputer: () => void;
}


// Fréquences disponibles
const frequencies = [
    { label: "0.1 Hz (slow)", value: 0.1 },
    { label: "0.5 Hz", value: 0.5 },
    { label: "1 Hz (default)", value: 1 },
    { label: "2 Hz", value: 2 },
    { label: "5 Hz", value: 5 },
    { label: "10 Hz", value: 10 },
    { label: "20 Hz", value: 20 },
    { label: "50 Hz", value: 50 },
    { label: "100 Hz", value: 100 },
];



export const PanelControls: React.FC<PanelControlsProps> = memo((props) => {
    //console.log('RENDER ComputerPage.PanelControls')

    const { computerHook } = props;
    const { cpuHook } = computerHook;
    const { loadOs, unloadOs, loadProgram, unloadProgram, resetComputer } = props;

    const [selectedOs, setSelectedOs] = useState<string | null>(null);
    const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

    const loadedOsInfo = computerHook.loadedOs ? os_list[computerHook.loadedOs] : null;
    //const osInfo = loadedOsInfo;
    const isOsUnloaded = loadedOsInfo ? (computerHook.memoryHook.readMemory(MEMORY_MAP.OS_START) === 0x00) : false;

    const selectedProgramInfo = selectedProgram ? programs[selectedProgram] : null;
    const loadedProgramInfo = computerHook.loadedProgram ? programs[computerHook.loadedProgram] : null;
    const programInfo = selectedProgramInfo ?? loadedProgramInfo;
    const isProgramUnloaded = loadedProgramInfo ? (computerHook.memoryHook.readMemory(MEMORY_MAP.PROGRAM_START) === 0x00) : false;

    const [triggerFrequencyRefresh, setTriggerFrequencyRefresh] = useState(0)
    //const triggerFrequencyRefreshRef = useRef(0)
    const [frequencyReal, setFrequencyReal] = useState(0)
    const [lastFrequencyStat, setLastFrequencyStat] = useState<{ timestamp: number, cycles: number } | null>(null)


    // Calculer la frequence reelle
    useEffect(() => {
        const updateFrequencyStat = () => {
            const timestamp = Date.now() / 1000;
            const cyclesNew = cpuHook.clockCycle;
            //const cyclesNew = cpuHook.clockCycleRef.current;

            if (lastFrequencyStat) {
                const duration = timestamp - lastFrequencyStat.timestamp;
                if (duration < 1) return

                const cyclesOld = lastFrequencyStat.cycles;
                const countDiff = cyclesNew - cyclesOld;
                const freq = duration ? (countDiff / duration) : 0;
                //console.log({ duration, countDiff, freq })
                setFrequencyReal(freq);

            } else {
                setFrequencyReal(0);
            }

            setLastFrequencyStat({ timestamp, cycles: cyclesNew })
        }

        updateFrequencyStat()
    }, [triggerFrequencyRefresh, cpuHook.paused, cpuHook.halted])


    // Gestion du timer de control
    useEffect(() => {
        //console.log('CTRL TIMER UP')
        const timerCtrl = setInterval(() => {
            setTriggerFrequencyRefresh(x => x + 1)
            //triggerFrequencyRefreshRef.current = triggerFrequencyRefreshRef.current + 1
        }, 100);

        return () => {
            //console.log('CTRL TIMER DOWN')
            clearInterval(timerCtrl)
        };
    }, []);


    const handleStart = () => {
        cpuHook.setPaused(b => !b);
        //setIsRunning(!isRunning)
    }

    const handleChangeFrequency = (frequency: number) => {
        //setFrequency(frequency)
        cpuHook.setClockFrequency(frequency)
    }

    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 lg:col-span-2">
            <div className="flex justify-between mb-8 pb-3 border-b">
                <h2 className="text-xl font-semibold mb-2 text-green-400">Execution Controls</h2>

                {/* Auto-play */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-300">Clock:</label>
                    <select
                        value={cpuHook.clockFrequency}
                        onChange={(e) => handleChangeFrequency(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                        disabled={false}
                    >
                        {frequencies.map(({ label, value }) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                    {frequencyReal.toFixed(1)} Hz
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleStart()}
                        disabled={cpuHook.halted}
                        className={`${!cpuHook.paused
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : "bg-green-900 hover:bg-green-700"
                            } disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors font-semibold`}
                    >
                        {!cpuHook.paused ? "⏸ Pause" : "▶ Start"}
                    </button>

                    <button
                        onClick={cpuHook.executeCycle}
                        disabled={cpuHook.halted || !cpuHook.paused}
                        className="bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                    >
                        ⏭ Step
                    </button>

                    <button
                        onClick={() => {
                            //setIsRunning(false);
                            resetComputer();
                        }}
                        className="bg-red-900 hover:bg-red-700 px-2 py-1 rounded cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                        Reset
                    </button>
                </div>

            </div>

            {/* Sélection d'OS */}
            <div className="mb-4 flex gap-4 items-center">
                <label className="text-sm font-bold text-slate-300 w-26">Main OS:</label>

                <div className="flex gap-4">
                    <select
                        value={selectedOs ?? ''}
                        onChange={(e) => setSelectedOs(e.target.value || null)}
                        className="bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white w-96"
                    >
                        <option key="none" value="">
                            None
                        </option>
                        {Object.entries(os_list).map(([key, prog]) => (
                            <option key={key} value={key}>
                                {prog.name} - {prog.description}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => {
                            loadOs(selectedOs ?? '');
                        }}
                        disabled={!selectedOs}
                        className="bg-blue-900 hover:bg-blue-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                    >
                        {(computerHook.loadedOs && computerHook.loadedOs === selectedOs && !isOsUnloaded) ? "Reload" : "Load"}
                    </button>
                </div>

                <button
                    onClick={() => unloadOs()}
                    disabled={!computerHook.loadedOs || isOsUnloaded}
                    className="ms-auto bg-purple-900 hover:bg-purple-900 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                >
                    Unload
                </button>
            </div>

            {/* Sélection de programme */}
            <div className="mb-4 flex gap-4 items-center">
                <label className="text-sm font-bold text-slate-300 w-26">Program:</label>

                <div className="flex gap-4">
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
                        className="bg-blue-900 hover:bg-blue-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                    >
                        {(computerHook.loadedProgram && computerHook.loadedProgram === selectedProgram && !isProgramUnloaded) ? "Reload" : "Load"}
                    </button>
                </div>

                <button
                    onClick={() => unloadProgram()}
                    disabled={!computerHook.loadedProgram || isProgramUnloaded}
                    className="ms-auto bg-purple-900 hover:bg-purple-900 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                >
                    Unload
                </button>
            </div>


            {/* Info programme */}
            {
                programInfo && (
                    <div className="mt-4 p-3 bg-slate-900/50 rounded border border-slate-600">
                        <div className="flex text-sm text-slate-300">
                            <strong className="text-blue-400 me-2">Program:</strong> {programInfo.name}

                            {(loadedProgramInfo && (!selectedProgram || loadedProgramInfo.name === selectedProgramInfo?.name)) && (
                                <div className={`ms-auto px-2 py-0 rounded ${isProgramUnloaded ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}`}>
                                    <>{isProgramUnloaded ? "UNLOADED" : "LOADED"}</>
                                </div>
                            )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            {programInfo.description}
                        </div>
                    </div>
                )
            }
        </div >
    );
})



const useAnimationFrame = (callback: (time: number) => void, dependencies: any[]) => {
    const requestRef = useRef<number>(null);
    const previousTimeRef = useRef<number>(null);

    const animate = (time: number) => {
        if (previousTimeRef.current != undefined) {
            const deltaTime = time - previousTimeRef.current;
            callback(deltaTime)
        }

        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        }
    }, dependencies); // Make sure the effect runs only once
}

