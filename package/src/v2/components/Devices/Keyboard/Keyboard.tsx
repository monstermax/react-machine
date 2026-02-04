
import React, { useCallback, useEffect, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';

import type { u16, u8 } from '@/types/cpu.types';
import { U8 } from '@/v2/lib/integers';


export type KeyboardProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    open?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (device: cpuApi.Keyboard) => void,
}


export const Keyboard: React.FC<KeyboardProps> = (props) => {
    const { hidden, open=true, name, ioPort, children, onInstanceCreated } = props;

    // Core
    const [deviceInstance, setDeviceInstance] = useState<cpuApi.Keyboard | null>(null);

    // UI snapshot state
    const [lastChar, setLastChar] = useState<u8>(0 as u8)
    const [hasChar, setHasChar] = useState<boolean>(true)

    // UI
    const [contentVisible, setContentVisible] = useState(open);


    // Instanciate Device
    useEffect(() => {
        const _instanciateDevice = () => {
            const device = new cpuApi.Keyboard(name, ioPort as u8 | null)
            setDeviceInstance(device);

            // Handle state updates
            device.on('state', (state) => {
                //console.log('Keyboard state update', state)

                if (state.lastChar !== undefined) {
                    setLastChar(state.lastChar)
                }

                if (state.hasChar !== undefined) {
                    setHasChar(state.hasChar)
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
                    console.log(`Invalid component mounted into Device Keyboard : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;

            }
        }
        return child;
    });


    if (!deviceInstance) {
        return (
            <>Loading Keyboard</>
        )
    }


    return (
        <div className={`device w-auto p-1 bg-indigo-900 rounded ${hidden ? "hidden" : ""}`}>

            {/* Device Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Keyboard</h2>

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

                {/* Keyboard */}
                <div>
                    {/* Status */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-slate-900/50 rounded">
                        <div>
                            <div className="text-xs text-slate-400 mb-1">Last Char:</div>
                            <div className="text-2xl font-mono text-green-400">
                                {lastChar > 0 ? (
                                    <>
                                        '{String.fromCharCode(lastChar)}'
                                        <span className="text-sm text-slate-400 ml-2">
                                            (0x{lastChar.toString(16).padStart(2, '0')})
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-slate-600">--</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 mb-1">Status:</div>
                            <div className="flex items-center gap-2 mt-2">
                                <div 
                                    className={`w-4 h-4 rounded-full ${
                                        hasChar ? 'bg-green-500 animate-pulse' : 'bg-slate-700'
                                    }`}
                                />
                                <span className="text-sm text-slate-300">
                                    {hasChar ? 'Char Available' : 'Waiting'}
                                </span>
                            </div>
                        </div>
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

