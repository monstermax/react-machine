import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../api/api';
import { MemoryTable } from './MemoryTable';

import type { OsInfo, u16, u8 } from '@/types/cpu.types';
import { os_list } from '@/programs/mini_os';
import { loadCodeFromFile } from '@/lib/compiler';
import { MEMORY_MAP } from '@/lib/memory_map';
import { U16 } from '@/lib/integers';


export type RamProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Ram) => void,
}

export const Ram: React.FC<RamProps> = (props) => {
    const { children, onInstanceCreated } = props;

    const [ramInstance, setRamInstance] = useState<cpuApi.Ram | null>(null);

    const [contentVisible, setContentVisible] = useState(true);

    // UI snapshot state
    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);

    const computerInstance = cpuApi.computerRef.current;


    // Instanciate Ram
    useEffect(() => {
        const _instanciateRam = () => {
            const ram = new cpuApi.Ram;
            setRamInstance(ram);

            // Save RamBus Ref
            cpuApi.ramRef.current = ram;

            // Handle state updates
            ram.on('state', (state) => {
                console.log('RAM state update', state)

                if (state.storage) {
                    setStorage(state.storage)
                }
            })

            // UI snapshot state
            setStorage(ram.storage);
        }

        const timer = setTimeout(_instanciateRam, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le Ram est créé
    useEffect(() => {
        if (ramInstance && onInstanceCreated) {
            onInstanceCreated(ramInstance);
        }
    }, [ramInstance, onInstanceCreated]);


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


    const loadOsInRam = async (osName: string) => {
        if (!ramInstance || !computerInstance) return;

        const currentOs: OsInfo | null = osName ? os_list[osName] : null;
        if (!currentOs?.filepath) return;

        const memoryOffset = MEMORY_MAP.OS_START;
        const code = await loadCodeFromFile(currentOs.filepath, memoryOffset)

        if (currentOs) {
            ramInstance.loadCodeInRam(code);

        } else {
            ramInstance.write(memoryOffset, 0 as u8);
        }

        ramInstance.emit('state', { storage: new Map(ramInstance.storage) })

        computerInstance.loadedOs = osName;
        computerInstance.emit('state', { loadedOs: osName })
    }


    return (
        <div className="ram w-96">

            {/* RAM Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">RAM</h2>

                {true && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setContentVisible(b => !b)}
                    >
                        {contentVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* RAM Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>

                {/* Buttons */}
                <div className="p-2 rounded bg-background-light-2xl flex gap-2">
                    <button
                        onClick={() => loadOsInRam('MINI_OS_V1')}
                        className="bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                        >
                        Load OS
                    </button>
                </div>

                {/* Storage */}
                <div className="p-2 rounded bg-background-light-2xl">
                    <h3>RAM Storage</h3>

                    <MemoryTable name="ram" storage={storage} />
                </div>

                {/* RAM Children */}
                <div className={`flex-col space-y-1 bg-background-light-3xl p-1`}>
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


