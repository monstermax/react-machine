
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../../api/api';
import { useComputer } from '../Computer/Computer';


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
];


export type ClockProps = {
    frequency?: number;
    hidden?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Clock) => void,
}

export const Clock: React.FC<ClockProps> = (props) => {
    const { hidden, frequency: initialFrequency, children, onInstanceCreated } = props;
    const { cpuRef } = useComputer();

    // Core
    const [clockInstance, setClockInstance] = useState<cpuApi.Clock | null>(null);
    const cpuInstance = cpuRef.current;

    // UI
    const [clockFrequency, setClockFrequency] = useState(initialFrequency)
    const [frequencyReal, setFrequencyReal] = useState(0)
    const [lastFrequencyStat, setLastFrequencyStat] = useState<{ timestamp: number, cycles: number } | null>(null)
    const [triggerFrequencyRefresh, setTriggerFrequencyRefresh] = useState(0)


    // Instanciate Clock
    useEffect(() => {
        const _instanciateClock = () => {
            const clock = new cpuApi.Clock(initialFrequency ?? 1);
            setClockInstance(clock);

            // Handle state updates
            clock.on('state', (state) => {
                if (!clock) return
                //console.log('Clock state update', state)

                if (state.clockFrequency !== undefined) {
                    setClockFrequency(state.clockFrequency)
                }
            })

            setClockFrequency(clock.clockFrequency)

            //setInstanciated(true)
        }

        const timer = setTimeout(_instanciateClock, 100);
        return () => clearTimeout(timer);
    }, []);


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
            if (!cpuInstance) return;

            const timestamp = Date.now() / 1000;
            const cyclesNew = cpuInstance.clockCycle;

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
        clockInstance.restart()

        clockInstance.emit('state', { clockFrequency: frequency })
    }


    if (!clockInstance) {
        return <>Loading Clock</>
    }


    return (
        <div className={`w-full p-2 rounded bg-background-light-2xl ${hidden ? "hidden" : ""}`}>
            <h3 className="bg-background-light-xl mb-1 px-2 py-1 rounded">Clock</h3>

            <div>
                <div className="flex items-center gap-2 px-1">
                    <label className="text-sm font-medium text-slate-300">Clock:</label>
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
                    <div className="ms-auto">
                        ➤ {frequencyReal.toFixed(1)} Hz
                    </div>
                </div>
            </div>
            <div>
                {children}
            </div>
        </div>
    );
}
