
import React, { useCallback, useEffect, useRef, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';

import type { u16, u8 } from '@/types/cpu.types';
import { U8 } from '@/lib/integers';
import { useComputer } from '../../Computer/ComputerContext';


export type ConsoleProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    width?: number;
    height?: number;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Console) => void,
}


export const Console: React.FC<ConsoleProps> = (props) => {
    const { hidden, name, ioPort, width = 35, height = 15, children, onInstanceCreated } = props;
    const { devicesManagerRef } = useComputer();

    // Core
    const [deviceInstance, setDeviceInstance] = useState<cpuApi.Console | null>(null);

    // Core Dependencies
    const devicesManagerInstance = devicesManagerRef.current;

    // UI snapshot state
    const [lines, setLines] = useState<string[]>([])
    const [currentLine, setCurrentLine] = useState<string>("")

    // UI
    const [contentVisible, setContentVisible] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);


    // Instanciate Device
    useEffect(() => {
        if (!devicesManagerInstance) return;

        if (ioPort !== undefined && devicesManagerInstance.devices.has(ioPort as u8)) {
            // test
            const deviceInstance = devicesManagerInstance.devices.get(ioPort as u8) as cpuApi.Console | null

            if (deviceInstance) {
                setDeviceInstance(deviceInstance);
            }
            return
        }

        const _instanciateDevice = () => {
            const device = new cpuApi.Console(name, ioPort as u8 | null, width, height)
            setDeviceInstance(device);

            // Handle state updates
            device.on('state', (state) => {
                //console.log('Console state update', state)

                if (state.lines !== undefined) {
                    setLines(state.lines)
                }

                if (state.currentLine !== undefined) {
                    setCurrentLine(state.currentLine)
                }
            })

            // Emit initial state
            // TODO

            //setInstanciated(true)
        }

        const timer = setTimeout(_instanciateDevice, 100);
        return () => clearTimeout(timer);
    }, [devicesManagerInstance]);


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
                    console.log(`Invalid component mounted into Device Console : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;

            }
        }
        return child;
    });


    // Auto-scroll vers le bas quand du nouveau texte arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines, currentLine]);


    const handleClear = () => {
        if (!deviceInstance) return;
        deviceInstance.write(0x01 as u8, 0 as u8); // CONSOLE_CLEAR
    };


    if (!deviceInstance) {
        return (
            <>Loading Console</>
        )
    }


    return (
        <div className={`device w-auto ${hidden ? "hidden" : ""}`}>

            {/* Device Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Console</h2>

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
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1 min-w-[450px]`}>

                {/* Console */}
                <div className="p-2 rounded bg-background-light-2xl flex gap-4 items-center">
                    <div
                        ref={scrollRef}
                        className="bg-black rounded-lg p-4 font-mono text-sm overflow-y-auto border border-green-500/30 mx-auto"
                        style={{ height: `${height*1.15}em`, width: `${width*1.1}ch` }}
                    >
                        {lines.length === 0 && !currentLine ? (
                            <div className="text-green-500/50 italic">
                                Console output will appear here...
                            </div>
                        ) : (
                            <>
                                {lines.map((line, i) => (
                                    <div key={i} className="text-green-400">
                                        {line || '\u00A0'} {/* Non-breaking space pour lignes vides */}
                                    </div>
                                ))}
                                {currentLine && (
                                    <div className="text-green-400">
                                        {currentLine}
                                        <span className="animate-pulse">_</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleClear}
                        className="mt-1 mx-2 ms-auto bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                    >
                        Clear
                    </button>
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

