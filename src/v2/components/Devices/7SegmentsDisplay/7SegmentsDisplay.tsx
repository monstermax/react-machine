
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';

import type { u16, u8 } from '@/types/cpu.types';
import { U8 } from '@/lib/integers';


export type SevenSegmentDisplayProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.SevenSegmentDisplay) => void,
}


export const SevenSegmentDisplay: React.FC<SevenSegmentDisplayProps> = (props) => {
    const { hidden, name, ioPort, children, onInstanceCreated } = props;

    // Core
    const [deviceInstance, setDeviceInstance] = useState<cpuApi.SevenSegmentDisplay | null>(null);

    // UI snapshot state
    const [currentValue, setCurrentValue] = useState<number>(0)
    const [rawSegments, setRawSegments] = useState<number>(0)

    const segments = useMemo(() => {
        const segments: boolean[] = [];

        for (let i = 0; i < 8; i++) {
            segments[i] = ((rawSegments >> i) & 1) === 1;
        }

        return segments;
    }, [rawSegments])


    // UI
    const [contentVisible, setContentVisible] = useState(true);


    // Instanciate Device
    useEffect(() => {
        const _instanciateDevice = () => {
            const device = new cpuApi.SevenSegmentDisplay(name, ioPort as u8 | null)
            setDeviceInstance(device);

            // Handle state updates
            device.on('state', (state) => {
                //console.log('SevenSegmentDisplay state update', state)

                if (state.currentValue !== undefined) {
                    setCurrentValue(state.currentValue)
                }

                if (state.rawSegments !== undefined) {
                    setRawSegments(state.rawSegments)
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


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into Device SevenSegmentDisplay : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;

            }
        }
        return child;
    });


    if (!deviceInstance) {
        return (
            <>Loading 7-Segment</>
        )
    }


    return (
        <div className={`device w-full ${hidden ? "hidden" : ""}`}>

            {/* Device Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">7-Segment</h2>

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

                {/* SevenSegment */}
                <div className="p-2 rounded bg-background-light-2xl flex gap-4 items-center mx-auto">

                    {/* Affichage 7 segments */}
                    <div className="relative w-32 h-48 flex items-center justify-center">
                        <svg viewBox="0 0 100 150" className="w-full h-full">
                            {/* Segment a (top) */}
                            <polygon
                                points="20,5 80,5 75,10 25,10"
                                className={segments[0] ? 'fill-red-500' : 'fill-gray-800'}
                            />

                            {/* Segment b (top right) */}
                            <polygon
                                points="80,5 85,10 85,70 80,65 75,70 75,10"
                                className={segments[1] ? 'fill-red-500' : 'fill-gray-800'}
                            />

                            {/* Segment c (bottom right) */}
                            <polygon
                                points="80,85 85,80 85,140 80,145 75,140 75,80"
                                className={segments[2] ? 'fill-red-500' : 'fill-gray-800'}
                            />

                            {/* Segment d (bottom) */}
                            <polygon
                                points="20,145 80,145 75,140 25,140"
                                className={segments[3] ? 'fill-red-500' : 'fill-gray-800'}
                            />

                            {/* Segment e (bottom left) */}
                            <polygon
                                points="15,80 20,85 20,145 15,140 10,140 10,80"
                                className={segments[4] ? 'fill-red-500' : 'fill-gray-800'}
                            />

                            {/* Segment f (top left) */}
                            <polygon
                                points="15,10 20,5 20,65 15,70 10,70 10,10"
                                className={segments[5] ? 'fill-red-500' : 'fill-gray-800'}
                            />

                            {/* Segment g (middle) */}
                            <polygon
                                points="20,75 25,70 75,70 80,75 75,80 25,80"
                                className={segments[6] ? 'fill-red-500' : 'fill-gray-800'}
                            />

                            {/* Point décimal */}
                            <circle
                                cx="90"
                                cy="140"
                                r="4"
                                className={segments[7] ? 'fill-red-500' : 'fill-gray-800'}
                            />
                        </svg>
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

