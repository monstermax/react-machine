
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../api/api';

import type { u16, u8 } from '@/types/cpu.types';


export type LedsDisplayProps = {
    name: string;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.LedsDisplay) => void,
}

export const LedsDisplay: React.FC<LedsDisplayProps> = (props) => {
    const { name, children, onInstanceCreated } = props;

    const [deviceInstance, setDeviceInstance] = useState<cpuApi.LedsDisplay | null>(null);

    const [contentVisible, setContentVisible] = useState(true);

    // UI snapshot state
    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);


    // Instanciate Device
    useEffect(() => {
        const _instanciateDevice = () => {
            const device = new cpuApi.LedsDisplay(name)
            setDeviceInstance(device);

            // Handle state updates
            device.on('state', (state) => {
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


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into Device LedsDisplay : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;

            }
        }
        return child;
    });


    if (! deviceInstance) {
        return (
            <>Loading Leds</>
        )
    }


    return (
        <div className="device w-full">

            {/* Device Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Device Leds</h2>

                {true && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setContentVisible(b => !b)}
                    >
                        {contentVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* Device Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>

                {/* LEDS */}
                <div className="p-2 rounded bg-background-light-2xl flex gap-4 items-center">
                    <h3>LEDS</h3>

                    <div className="flex gap-2 ms-auto">
                        {deviceInstance.getLeds().map((on, i) => (
                            <div key={i} className={`w-8 h-8 rounded-full ${on ? 'bg-yellow-500' : 'bg-gray-700'}`} />
                        ))}
                    </div>
                </div>

                {/* Device Children */}
                <div className={`flex-col space-y-1 bg-background-light-3xl p-1`}>
                    {childrenWithProps && (
                        <div className="device-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                            {childrenWithProps}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

