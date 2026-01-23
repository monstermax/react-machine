
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';
import { U8 } from '@/v2/lib/integers';

import type { u8 } from '@/types/cpu.types';
import { useComputer } from '../../Computer/ComputerContext';


export type TimerProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Timer) => void,
}

export const Timer: React.FC<TimerProps> = (props) => {
    const { name, ioPort, hidden, children, onInstanceCreated } = props;
    const { motherboardRef, devicesManagerRef } = useComputer()

    // Core
    const [timerInstance, setTimerInstance] = useState<cpuApi.Timer | null>(null);

    // UI
    const [counter, setCounter] = useState<u8>(0 as u8)
    const [period, setPeriod] = useState<u8>(10 as u8)
    const [enabled, setEnabled] = useState<boolean>(false)


    // Instanciate Timer
    useEffect(() => {
        if (!devicesManagerRef.current) return;
        if (!motherboardRef.current) return;
        if (timerInstance) return;

        const _instanciateTimer = () => {
            if (!devicesManagerRef.current) return;

            const timer = new cpuApi.Timer(devicesManagerRef.current, name, ioPort as u8 | null);
            setTimerInstance(timer);

            // Handle state updates
            timer.on('state', (state) => {
                if (!timer) return
                //console.log('Timer state update', state)

                if (state.counter !== undefined) {
                    setCounter(state.counter)
                }

                if (state.period !== undefined) {
                    setPeriod(state.period)
                }

                if (state.enabled !== undefined) {
                    setEnabled(state.enabled)
                }
            })

            if (motherboardRef.current) {
                if (motherboardRef.current.clock) {
                    // Listen for clock ticks
                    motherboardRef.current.clock.on('tick', ({cycle}) => {
                        //if (motherboardRef.current) {
                        //    for (const cpu of motherboardRef.current.getCpus()) {
                        //        if (!cpu) continue;
                        //        console.log(`Clock cycle for cpu #${cpu.idx} : ${cycle}`)
                        //    }
                        //}
                        if (devicesManagerRef.current) {
                            const timer = devicesManagerRef.current.getDeviceByName('timer');

                            if (timer) {
                                timer.write(0x03 as u8, 0 as u8) // declenche le tick du timer
                            }
                        }
                    })
                }
            }

            // Emit initial state
            timer.emit('state', {
                counter: timer.counter,
                period: timer.period,
                enabled: timer.enabled,
            })

            //setInstanciated(true)

            //console.log(`Timer Initialized`)
        }

        const timer = setTimeout(_instanciateTimer, 100);
        return () => clearTimeout(timer);
    }, [motherboardRef.current, devicesManagerRef.current]);


    // Notifie le parent quand le Timer est créé
    useEffect(() => {
        if (timerInstance && onInstanceCreated) {
            onInstanceCreated(timerInstance);
        }
    }, [timerInstance, onInstanceCreated]);


    if (!timerInstance) {
        if (hidden) return null;

        return (
            <>Loading Timer</>
        )
    }


    return (
        <div className={`w-full rounded bg-background-light-2xl ${hidden ? "hidden" : ""}`}>
            <h3 className="bg-background-light-xl mb-1 px-2 py-1 rounded">Timer</h3>

            <div>
                <div className="flex items-center gap-2 px-1">
                    <div>Enabled: {enabled ? "YES" : "NO"}</div>
                    <div>Period: {period}</div>
                    <div>Counter: {counter}</div>
                </div>
            </div>

            <div>
                {children}
            </div>
        </div>
    );
}
