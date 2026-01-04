
import { useEffect, useState, useRef, useCallback, memo } from "react";

import { programs } from "@/lib/programs";
import type { ComputerHook } from "@/hooks/useComputer";
import { MEMORY_MAP } from "@/lib/memory_map";
import { MINI_OS, MINI_OS_V2, os_list } from "@/programs/mini_os";
import type { OsInfo, u16, u8 } from "@/types/cpu.types";


export type PanelControlsProps = {
    computerHook: ComputerHook;
    breakpoints: Set<number>;
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

    // État Play/Pause
    const [isRunning, setIsRunning] = useState(false);
    const [frequency, setFrequency] = useState(1); // Hz (cycles par seconde)
    const [currentBreakpoint, setCurrentBreakpoint] = useState<number | null>(null);
    const lastCycleTsRef = useRef(0);

    const loadedOsInfo = computerHook.loadedOs ? os_list[computerHook.loadedOs] : null;
    const osInfo = loadedOsInfo;
    const isOsUnloaded = loadedOsInfo ? (computerHook.memoryHook.readMemory(MEMORY_MAP.OS_START) === 0x00) : false;

    const selectedProgramInfo = selectedProgram ? programs[selectedProgram] : null;
    const loadedProgramInfo = computerHook.loadedProgram ? programs[computerHook.loadedProgram] : null;
    const programInfo = selectedProgramInfo ?? loadedProgramInfo;
    const isProgramUnloaded = loadedProgramInfo ? (computerHook.memoryHook.readMemory(MEMORY_MAP.PROGRAM_START) === 0x00) : false;

    const [triggerFrequencyRefresh, setTriggerFrequencyRefresh] = useState(0)
    const [frequencyReal, setFrequencyReal] = useState(0)
    const [lastFrequencyStat, setLastFrequencyStat] = useState<{ timestamp: number, cycles: number } | null>(null)
    const [triggerCycle, setTriggerCycle] = useState(0)
    const [boost, setBoost] = useState(false) // 2 cycles per interval if enabled. 1 cycle if disabled


    // Calculer la frequence reelle
    useEffect(() => {
        const updateFrequencyStat = () => {
            const timestamp = Date.now() / 1000;
            const cyclesNew = cpuHook.clockCycle;

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
    }, [triggerFrequencyRefresh])


    useAnimationFrame((time) => {
        //console.log('CLOCK TIMER FRAME', (1000/time).toFixed(), 'FPS')

        const interval = 1000 / frequency; // Intervalle en ms
        const now = Date.now();
        const age = now - lastCycleTsRef.current

        if (isRunning) {
            if (age > interval) {
                lastCycleTsRef.current = now
                setTriggerCycle(c => c + 1);
            }
        }
    }, [frequency, isRunning, setTriggerCycle])



    // Arrêter automatiquement si le CPU halt
    useEffect(() => {
        if (cpuHook.halted && isRunning) {
            setIsRunning(false);
        }
    }, [cpuHook.halted, isRunning]);


    const execCycle = useCallback(() => {
        if (!isRunning) return;

        const pc = cpuHook.getRegister("PC");

        // Vérifier breakpoint
        if (currentBreakpoint !== pc && props.breakpoints.has(pc)) {
            setIsRunning(false);
            setCurrentBreakpoint(pc);
            return;
        }

        if (currentBreakpoint) {
            setCurrentBreakpoint(null);
        }

        cpuHook.executeCycle();
    }, [isRunning, currentBreakpoint, props.breakpoints, cpuHook.executeCycle])


    // Gestion du timer de control
    useEffect(() => {
        //console.log('CTRL TIMER UP')
        const timerCtrl = setInterval(() => setTriggerFrequencyRefresh(x => x + 1), 100);

        return () => {
            //console.log('CTRL TIMER DOWN')
            clearInterval(timerCtrl)
        };
    }, []);


    useEffect(() => {
        if (triggerCycle > 0) {
            execCycle()

            if (boost) {
                setTimeout(execCycle, (1000 / frequency) / 2)
            }
        }
    }, [triggerCycle, boost])


    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-2 text-green-400">Execution Controls</h2>

            {/* Sélection d'OS */}
            <div className="mb-4 flex gap-4 items-center">
                <label className="text-sm font-medium text-slate-300">Select OS:</label>

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
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-6 py-2 rounded transition-colors"
                >
                    {(computerHook.loadedOs && computerHook.loadedOs === selectedOs && !isOsUnloaded) ? "Reload" : "Load"}
                </button>

                <button
                    onClick={() => unloadOs()}
                    disabled={!computerHook.loadedOs || isOsUnloaded}
                    className="bg-purple-800 hover:bg-purple-900 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-6 py-2 rounded transition-colors"
                >
                    Unload
                </button>
            </div>

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
                    {(computerHook.loadedProgram && computerHook.loadedProgram === selectedProgram && !isProgramUnloaded) ? "Reload" : "Load"}
                </button>

                <button
                    onClick={() => unloadProgram()}
                    disabled={!computerHook.loadedProgram || isProgramUnloaded}
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
                            //setIsRunning(false);
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
                                <div className={`ms-auto px-6 py-2 rounded ${isProgramUnloaded ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}`}>
                                    <>[{isProgramUnloaded ? "UNLOADED" : "LOADED"}]</>
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

