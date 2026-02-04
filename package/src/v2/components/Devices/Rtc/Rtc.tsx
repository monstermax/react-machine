
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';
import { U8 } from '@/v2/lib/integers';

import type { RtcTime } from './Rtc.api';
import type { u8 } from '@/types/cpu.types';


export type RtcProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (device: cpuApi.Rtc) => void,
}

export const Rtc: React.FC<RtcProps> = (props) => {
    const { name, ioPort, hidden, children, onInstanceCreated } = props;

    // Core
    const [rtcInstance, setRtcInstance] = useState<cpuApi.Rtc | null>(null);

    // UI
    const [time, setTime] = useState<RtcTime | null>(null)


    // Instanciate Rtc
    useEffect(() => {
        const _instanciateRtc = () => {
            const rtc = new cpuApi.Rtc(name, ioPort as u8 | null);
            setRtcInstance(rtc);

            // Handle state updates
            rtc.on('state', (state) => {
                if (!rtc) return
                //console.log('Rtc state update', state)

                if (state.time !== undefined) {
                    setTime(state.time)
                }
            })

            //setInstanciated(true)

            setTime(rtc.time)
        }

        const timer = setTimeout(_instanciateRtc, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le Rtc est créé
    useEffect(() => {
        if (rtcInstance && onInstanceCreated) {
            onInstanceCreated(rtcInstance);
        }
    }, [rtcInstance, onInstanceCreated]);


    if (!rtcInstance) {
        if (hidden) return null;

        return (
            <>Loading Rtc</>
        )
    }


    return (
        <div className={`w-full rounded bg-background-light-2xl ${hidden ? "hidden" : ""}`}>
            <h3 className="bg-background-light-xl mb-1 px-2 py-1 rounded">RTC</h3>

            <div>
                <div className="flex items-center gap-2 px-1">
                    Time: {!time ? "-" : (new Date(time.time).toLocaleString())}
                </div>
            </div>

            <div>
                {children}
            </div>
        </div>
    );
}
