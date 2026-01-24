
import React, { useCallback, useEffect, useMemo, useRef, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';
import { useComputer } from '../Computer/ComputerContext';
import { delayer } from '@/v2/lib/delayer';
import { u8 } from '@/types';


const frequencies = [
    { label: "0.1 Hz", value: 0.1 },
    { label: "0.5 Hz", value: 0.5 },
    { label: "1 Hz (default)", value: 1 },
    { label: "2 Hz", value: 2 },
    { label: "5 Hz", value: 5 },
    { label: "10 Hz", value: 10 },
    { label: "20 Hz", value: 20 },
    { label: "50 Hz", value: 50 },
    { label: "100 Hz", value: 100 },
    { label: "150 Hz", value: 150 },
    { label: "200 Hz", value: 200 },
    { label: "300 Hz", value: 300 },
    { label: "500 Hz", value: 500 },
    { label: "1 KHz", value: 1000 },
];


export type ClockProps = {
    ioPort?: number | u8 | null;
    frequency?: number;
    hidden?: boolean;
    open?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Clock) => void,
}


export const Clock: React.FC<ClockProps> = (props) => {
    const { hidden=false, open=false, ioPort=null, frequency: initialFrequency, children, onInstanceCreated } = props;
    const { motherboardRef } = useComputer();

    // Core
    const [clockInstance, setClockInstance] = useState<cpuApi.Clock | null>(null);

    // UI
    const [contentVisible, setContentVisible] = useState(open);
    const [mouseDownOffset, setMouseDownOffset] = useState<null | { x: number, y: number }>(null);
    const [isDivAbsolute, setIsDivAbsolute] = useState(false)
    const divRef = useRef<HTMLDivElement>(null);
    const [paused, setPaused] = useState(true);
    const [clockCycle, setClockCycle] = useState(0);
    const [clockFrequency, setClockFrequency] = useState(initialFrequency)
    const [frequencyReal, setFrequencyReal] = useState(0)
    const [lastFrequencyStat, setLastFrequencyStat] = useState<{ timestamp: number, cycles: number } | null>(null)
    const [triggerFrequencyRefresh, setTriggerFrequencyRefresh] = useState(0)


    // Instanciate Clock
    useEffect(() => {
        if (!motherboardRef.current) return;
        if (motherboardRef.current.clock) return;

        const _instanciateClock = () => {
            if (!motherboardRef.current) return;

            // Init Instance
            const clockInstance = motherboardRef.current.addClock(ioPort as u8 | null, initialFrequency ?? 1);

            // Save Instance for UI
            setClockInstance(clockInstance);

            // Handle state updates for UI
            clockInstance.on('state', (state) => {
                if (!clockInstance) return
                //console.log('Clock state update', state)

                if (state.clockFrequency !== undefined) {
                    setClockFrequency(state.clockFrequency)
                }

                if (state.status !== undefined) {
                    setPaused(!state.status)
                }
            })

            clockInstance.on('tick', ({ cycle }) => {
                //console.log('Clock tick', cycle)
                delayer('clock-cycle', (cycle: number) => {
                    setClockCycle(cycle)
                }, 100, 500, [cycle]);
            })

            // Emit initial state
            //setClockFrequency(clockInstance.clockFrequency)
            clockInstance.emit('state', {
                clockFrequency: clockInstance.clockFrequency,
            })

            //setInstanciated(true)
        }

        const timer = setTimeout(_instanciateClock, 100);
        return () => clearTimeout(timer);
    }, [motherboardRef.current]);


    // Notifie le parent quand le Clock est créé
    useEffect(() => {
        if (clockInstance && onInstanceCreated) {
            onInstanceCreated(clockInstance);
        }
    }, [clockInstance, onInstanceCreated]);


    // Gestion du timer de control (pour calcul de la frequence reelle)
    useEffect(() => {
        //console.log('CTRL TIMER UP')
        const timerCtrl = setInterval(() => {
            setTriggerFrequencyRefresh(x => x + 1)
        }, 100);

        return () => {
            //console.log('CTRL TIMER DOWN')
            clearInterval(timerCtrl)
        };
    }, []);


    // Calculer la frequence reelle
    useEffect(() => {
        const updateFrequencyStat = () => {
            //if (!cpuRef.current) return;

            const timestamp = Date.now() / 1000;
            //const cyclesNew = cpuRef.current.clockCycle;
            const cyclesNew = clockCycle;

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


    // Change la fréquence de clock
    const handleChangeFrequency = (frequency: number) => {
        if (!clockInstance) return;
        clockInstance.clockFrequency = frequency

        if (clockInstance.status) {
            clockInstance.restart()
        }

        clockInstance.emit('state', { clockFrequency: frequency })
    }


    const runStep = () => {
        if (!clockInstance) return;

        console.log(`runStep cycle #${clockInstance.clockCycles + 1}`);
        clockInstance.tick();
    };


    const runLoop = () => {
        if (!clockInstance) return;

        console.log(`runLoop cycle #${clockInstance.clockCycles + 1}`);

        if (clockInstance.status) {
            clockInstance.stop()

        } else {
            clockInstance.start()
        }
    };


    // Handle Absolute Position + Draggable
    useEffect(() => {
        if (!divRef.current) return;

        if (mouseDownOffset) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)

            //divRef.current.style.position = 'absolute';
            //setIsDivAbsolute(true)

            return () => {
                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('mouseup', handleMouseUp)
            }

        } else {
            //setDivStatic();
        }
    }, [mouseDownOffset])

    const setDivStatic = () => {
        if (!divRef.current) return;
        divRef.current.style.position = 'static';
        setIsDivAbsolute(false)
    }

    const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
        if (!divRef.current) return;
        if (event.button !== 0) return;
        const rect = divRef.current.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        setMouseDownOffset({ x: offsetX, y: offsetY })
        document.body.classList.add('select-none');
    }

    const handleMouseUp = () => {
        if (!divRef.current) return;
        setMouseDownOffset(null)
        document.body.classList.remove('select-none');
    }

    const handleMouseMove = (event: MouseEvent) => {
        if (divRef.current && mouseDownOffset) {
            if (!isDivAbsolute) {
                divRef.current.style.position = 'absolute';
                setIsDivAbsolute(true)
            }

            const newX = event.pageX - mouseDownOffset.x;
            const newY = event.pageY - mouseDownOffset.y;
            divRef.current.style.left = newX + 'px';
            divRef.current.style.top = newY + 'px';
        }
    }


    if (!clockInstance) {
        return <>Loading Clock</>
    }


    return (
        <div ref={divRef} className={`clock w-auto rounded bg-violet-950 p-1 ${hidden ? "hidden" : ""}`}>

            {/* Clock Head */}
            <div className="w-full flex bg-background-light p-2 rounded">
                <h2 className="font-bold cursor-move" onMouseDown={(event) => handleMouseDown(event)}>Clock</h2>

                {true && (
                    <div className="ms-auto flex gap-2">
                        {isDivAbsolute && (
                            <button
                                className="cursor-pointer px-3 bg-background-light-xl rounded"
                                onClick={() => setDivStatic()}
                            >
                                ⤴
                            </button>
                        )}

                        <button
                            className="cursor-pointer px-3 bg-background-light-xl rounded"
                            onClick={() => setContentVisible(b => !b)}
                        >
                            {contentVisible ? "-" : "+"}
                        </button>
                    </div>
                )}
            </div>

            {/* Clock Preview */}
            <div className={`${contentVisible ? "hidden" : "flex"} flex justify-center p-1 min-w-[200px]`}>
                <ClockIcon />
            </div>

            {/* Clock Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-2 p-1 min-w-[200px]`}>

                {/* Buttons */}
                <div className="p-2 rounded bg-background-light-2xl flex gap-2">
                    <button
                        disabled={!paused  /*|| halted*/}
                        onClick={() => runStep()}
                        className="bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ms-auto"
                    >
                        ⏭ Step
                    </button>

                    <button
                        disabled={false /*halted*/}
                        onClick={() => runLoop()}
                        className={`disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ${!paused
                            ? "bg-green-900 hover:bg-green-700"
                            : "bg-blue-900 hover:bg-blue-700"
                            }`}
                    >
                        {paused ? "▶ Start" : "⏸ Pause"}
                    </button>
                </div>

                <div className="flex flex-col items-center gap-2 px-1">
                    <label className="text-sm font-medium text-slate-300">Freq.:</label>

                    <select
                        value={clockFrequency}
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
                </div>

                <div className="">
                    Current: {frequencyReal.toFixed(1)} Hz
                </div>

                <div className="">
                    Clock Cycle: {clockCycle}
                </div>

                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}



export const ClockIcon = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 60"
            width="100"
            height="60"
        >
            {/* Boîtier du quartz/oscillateur */}
            <rect x="20" y="10" width="60" height="40" rx="3" fill="#1f2937" stroke="#374151" strokeWidth="1" />

            {/* Métallisation */}
            <rect x="20" y="10" width="60" height="8" fill="#9ca3af" />
            <rect x="20" y="42" width="60" height="8" fill="#9ca3af" />

            {/* Étiquette */}
            <text x="50" y="35" textAnchor="middle" fontSize="7" fill="#f3f4f6" fontFamily="monospace">
                16.000 MHz
            </text>

            {/* Pins */}
            <g fill="#6b7280">
                <rect x="15" y="15" width="5" height="10" rx="1" />
                <rect x="15" y="35" width="5" height="10" rx="1" />
                <rect x="80" y="15" width="5" height="10" rx="1" />
                <rect x="80" y="35" width="5" height="10" rx="1" />
            </g>

            {/* Symbole d'oscillation */}
            <path d="M40,25 Q45,20 50,25 Q55,30 60,25" stroke="#60a5fa" strokeWidth="1.5" fill="none" />
            <circle cx="50" cy="25" r="2" fill="#60a5fa" />
        </svg>
    );
};

