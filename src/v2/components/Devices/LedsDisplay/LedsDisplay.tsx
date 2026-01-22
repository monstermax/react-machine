
import React, { useCallback, useEffect, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';

import type { u16, u8 } from '@/types/cpu.types';
import { U8 } from '@/lib/integers';


export type LedsDisplayProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    open?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.LedsDisplay) => void,
}


export const LedsDisplay: React.FC<LedsDisplayProps> = (props) => {
    const { hidden=false, open=true, name, ioPort, children, onInstanceCreated } = props;

    // Core
    const [deviceInstance, setDeviceInstance] = useState<cpuApi.LedsDisplay | null>(null);

    // UI snapshot state
    const [leds, setLeds] = useState<u8>(0 as u8)

    // UI
    const [contentVisible, setContentVisible] = useState(open);


    // Instanciate Device
    useEffect(() => {
        const _instanciateDevice = () => {
            const device = new cpuApi.LedsDisplay(name, ioPort as u8 | null)
            setDeviceInstance(device);

            // Handle state updates
            device.on('state', (state) => {
                //console.log('LedsDisplay state update', state)

                if (state.leds !== undefined) {
                    setLeds(state.leds)
                }
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


    const getLeds = useCallback((): u8[] => {
        return Array.from({ length: 8 }, (_, i) => ((leds >> i) & 1) as u8);
    }, [leds])


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into Device LedsDisplay : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;

            }
        }
        return child;
    });


    if (!deviceInstance) {
        return (
            <>Loading Leds</>
        )
    }


    return (
        <div className={`device w-auto bg-teal-900 p-1 rounded ${hidden ? "hidden" : ""}`}>

            {/* Device Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Leds</h2>

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
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-1 p-1 min-w-[350px]`}>

                {/* LEDS */}
                <div className="p-2 rounded flex gap-4 items-center">

                    <div className="flex gap-2 mx-auto">
                        {getLeds().map((on, i) => (
                            <div key={i} className={`w-6 h-6 rounded-full ${on ? 'bg-yellow-500' : 'bg-gray-700'}`} />
                        ))}
                    </div>
                </div>

                {/* Device Children */}
                {childrenWithProps && (
                    <div className={`flex-col space-y-1 p-1`}>
                        <div className="device-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                            {childrenWithProps}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

