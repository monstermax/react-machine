
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../../../api/api';
import { U8 } from '@/lib/integers';

import type { u8 } from '@/types/cpu.types';


export type TimerProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Timer) => void,
}

export const Timer: React.FC<TimerProps> = (props) => {
    const { name, ioPort, hidden, children, onInstanceCreated } = props;

    // Core
    const [timerInstance, setTimerInstance] = useState<cpuApi.Timer | null>(null);

    // UI
    const [counter, setCounter] = useState<u8>(0 as u8)
    const [period, setPeriod] = useState<u8>(10 as u8)
    const [enabled, setEnabled] = useState<boolean>(false)


    // Instanciate Timer
    useEffect(() => {
        const _instanciateTimer = () => {
            const timer = new cpuApi.Timer(name, ioPort as u8 | null);
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

            // Emit initial state
            timer.emit('state', { counter: timer.counter, period: timer.period, enabled: timer.enabled })

            //setInstanciated(true)
        }

        const timer = setTimeout(_instanciateTimer, 100);
        return () => clearTimeout(timer);
    }, []);


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
