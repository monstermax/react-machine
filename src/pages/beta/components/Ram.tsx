import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../lib/api';
import { MemoryTable } from './MemoryTable';

import type { u16, u8 } from '@/types/cpu.types';


export type RamProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Ram) => void,
}

export const Ram: React.FC<RamProps> = (props) => {
    const { children, onInstanceCreated } = props;

    const [ram, setRam] = useState<cpuApi.Ram | null>(null);
    const [childrenVisible, setChildrenVisible] = useState(true);

    // UI snapshot state
    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);


    // Instanciate Ram
    useEffect(() => {
        const _instanciateRam = () => {
            const ram = new cpuApi.Ram;
            setRam(ram);

            // TEST: import test data
            ram.storage = new Map([[0x0500, 123], [0x0501, 124]] as [u16, u8][])

            // UI snapshot state
            setStorage(ram.storage);
        }

        const timer = setTimeout(_instanciateRam, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le Ram est créé
    useEffect(() => {
        if (ram && onInstanceCreated) {
            onInstanceCreated(ram);
        }
    }, [ram, onInstanceCreated]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into Ram : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;

            }
        }
        return child;
    });

    return (
        <div className="ram">

            {/* RAM Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">RAM</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* RAM Content */}
            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>

                {/* Storage */}
                <div className="p-2 rounded bg-background-light-2xl">
                    <h3>Storage</h3>

                    <MemoryTable storage={storage} />
                </div>

                {/* RAM Children */}
                <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>
                    {childrenWithProps && (
                        <div className="ram-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                            {childrenWithProps}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}


