
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';
import { useComputer } from '../Computer/ComputerContext';
import { MemoryTable } from './MemoryTable';

import type { u16, u8 } from '@/types/cpu.types';


export type RomProps = {
    data?: Map<u16, u8> | [u16, u8][];
    size?: number;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Rom) => void,
}

export const Rom: React.FC<RomProps> = (props) => {
    const { data, size: maxSize, children, onInstanceCreated } = props;
    const { memoryBusRef } = useComputer();

    // Core
    const [romInstance, setRomInstance] = useState<cpuApi.Rom | null>(null);

    // UI snapshot state
    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);

    // UI
    const [contentVisible, setContentVisible] = useState(true);


    // Instanciate Rom
    useEffect(() => {
        if (!memoryBusRef.current) return;
        //if (romRef.current) return;
        if (memoryBusRef.current.rom) return;

        const _instanciateRom = () => {
        if (!memoryBusRef.current) return;

            // Save Instance for UI
            const rom = memoryBusRef.current.addRom(data, maxSize);
            setRomInstance(rom);

            // Handle state updates for UI
            rom.on('state', (state) => {
                //console.log('ROM state update', state)

                if (state.storage) {
                    setStorage(new Map(state.storage))
                }
            })

            // Emit initial state
            rom.emit('state', { storage: new Map(rom.storage) })

            //setInstanciated(true)
        }

        const timer = setTimeout(_instanciateRom, 100);
        return () => clearTimeout(timer);
    }, [memoryBusRef.current]);


    // Notifie le parent quand le Rom est créé
    useEffect(() => {
        if (romInstance && onInstanceCreated) {
            onInstanceCreated(romInstance);
        }
    }, [romInstance, onInstanceCreated]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into Rom : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;

            }
        }
        return child;
    });

    return (
        <div className="rom w-96">

            {/* ROM Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">ROM</h2>

                {true && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setContentVisible(b => !b)}
                    >
                        {contentVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* ROM Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>

                {/* Storage */}
                <div className="p-2 rounded bg-background-light-2xl">
                    <h3>ROM Storage</h3>

                    <MemoryTable name="rom" storage={storage} />
                </div>

                {/* ROM Children */}
                <div className={`flex-col space-y-1 bg-background-light-3xl p-1`}>
                    {childrenWithProps && (
                        <div className="rom-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                            {childrenWithProps}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

