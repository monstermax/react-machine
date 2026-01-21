
import React, { useCallback, useEffect, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';

import type { u16, u8 } from '@/types/cpu.types';
import { U8 } from '@/lib/integers';


export type LcdDisplayProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    width?: number;
    height?: number;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.LcdDisplay) => void,
}


export const LcdDisplay: React.FC<LcdDisplayProps> = (props) => {
    const { hidden, name, ioPort, width = 16, height = 2, children, onInstanceCreated } = props;

    // Core
    const [deviceInstance, setDeviceInstance] = useState<cpuApi.LcdDisplay | null>(null);

    // UI snapshot state
    const [display, setDisplay] = useState<string[][]>(Array(height).fill(null).map(() => Array(width).fill(' ')))
    const [cursorRow, setCursorRow] = useState<number>(0)
    const [cursorCol, setCursorCol] = useState<number>(0)
    const [cursorVisible, setCursorVisible] = useState<boolean>(true)

    // UI
    const [contentVisible, setContentVisible] = useState(true);


    // Instanciate Device
    useEffect(() => {
        const _instanciateDevice = () => {
            const device = new cpuApi.LcdDisplay(name, ioPort as u8 | null, width, height)
            setDeviceInstance(device);

            // Handle state updates
            device.on('state', (state) => {
                //console.log('LcdDisplay state update', state)

                if (state.display !== undefined) {
                    setDisplay(state.display)
                }

                if (state.cursorRow !== undefined) {
                    setCursorRow(state.cursorRow)
                }

                if (state.cursorCol !== undefined) {
                    setCursorCol(state.cursorCol)
                }

                if (state.cursorVisible !== undefined) {
                    setCursorVisible(state.cursorVisible)
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
                    console.log(`Invalid component mounted into Device LcdDisplay : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;

            }
        }
        return child;
    });


    if (!deviceInstance) {
        return (
            <>Loading LCD</>
        )
    }


    return (
        <div className={`device w-auto bg-violet-900 p-1 rounded ${hidden ? "hidden" : ""}`}>

            {/* Device Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">LCD</h2>

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

                {/* LCD */}
                <div className="p-2 rounded flex gap-4 items-center">

                    <div className="bg-green-900 border-4 border-slate-600 rounded-lg p-3 mx-auto">
                        {display.map((row, rowIndex) => (
                            <div key={rowIndex} className="font-mono text-lg leading-tight">
                                {row.map((char, colIndex) => {
                                    const isCursor = cursorVisible &&
                                        rowIndex === cursorRow &&
                                        colIndex === cursorCol;

                                    return (
                                        <span
                                            key={colIndex}
                                            className={`inline-block w-[1.2ch] text-center ${isCursor
                                                ? 'bg-green-400 text-slate-900 animate-pulse'
                                                : 'text-green-400'
                                                }`}
                                        >
                                            {char}
                                        </span>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Device Children */}
                {childrenWithProps && childrenWithProps.length > 0 && (
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

