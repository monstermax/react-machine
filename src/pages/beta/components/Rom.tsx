import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../api/api';
import { BOOTLOADER } from '@/programs/bootloader';
import { MemoryTable } from './MemoryTable';

import type { u16, u8 } from '@/types/cpu.types';


export type RomProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Rom) => void,
}

export const Rom: React.FC<RomProps> = (props) => {
    const { children, onInstanceCreated } = props;

    const [rom, setRom] = useState<cpuApi.Rom | null>(null);
    const [contentVisible, setContentVisible] = useState(true);

    // UI snapshot state
    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);


    // Instanciate Rom
    useEffect(() => {
        const _instanciateRom = () => {
            const rom = new cpuApi.Rom(BOOTLOADER)
            setRom(rom);

            rom.on('state', (state) => {
            })

            // UI snapshot state
            setStorage(rom.storage);
        }

        const timer = setTimeout(_instanciateRom, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le Rom est créé
    useEffect(() => {
        if (rom && onInstanceCreated) {
            onInstanceCreated(rom);
        }
    }, [rom, onInstanceCreated]);


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

