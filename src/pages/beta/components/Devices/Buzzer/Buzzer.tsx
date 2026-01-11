
import React, { useCallback, useEffect, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../../../api/api';

import type { u16, u8 } from '@/types/cpu.types';
import { U8 } from '@/lib/integers';


export type BuzzerProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Buzzer) => void,
}


export const Buzzer: React.FC<BuzzerProps> = (props) => {
    const { name, ioPort, hidden, children, onInstanceCreated } = props;

    // core
    const [deviceInstance, setDeviceInstance] = useState<cpuApi.Buzzer | null>(null);

    // UI
    const [contentVisible, setContentVisible] = useState(true);


    // Instanciate Device
    useEffect(() => {
        const _instanciateDevice = () => {
            const device = new cpuApi.Buzzer(name, ioPort as u8 | null)
            setDeviceInstance(device);

            // Handle state updates
            device.on('state', (state) => {
                //console.log('Buzzer state update', state)

            })
        }

        const timer = setTimeout(_instanciateDevice, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le Device est créé
    useEffect(() => {
        if (deviceInstance && onInstanceCreated) {
            onInstanceCreated(deviceInstance);
        }
    }, [deviceInstance, onInstanceCreated]);


    if (!deviceInstance) {
        if (hidden) return null;

        return (
            <>Loading Buzzer</>
        )
    }


    return (
        <div className={`w-full p-0 rounded bg-background-light-2xl ${hidden ? "hidden" : ""}`}>
            <h3 className="bg-background-light-xl mb-1 px-2 py-1 rounded">Buzzer</h3>

            <div>
                <div className="flex items-center gap-2 px-1">
                </div>
            </div>
        </div>
    );
}
