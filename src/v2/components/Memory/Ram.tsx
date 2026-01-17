import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';
import { compileFile } from '@/cpus/default/asm_compiler';
import { MEMORY_MAP } from '@/lib/memory_map_16x8_bits';
import { U16 } from '@/lib/integers';
import { os_list } from '@/cpus/default/programs/mini_os';
import { programs } from '@/cpus/default/programs/programs_index';
import { MemoryTable } from './MemoryTable';
import { useComputer } from '../Computer/ComputerContext';

import type { CompiledCode, OsInfo, ProgramInfo, u16, u8 } from '@/types/cpu.types';


export type RamProps = {
    data?: Map<u16, u8> | [u16, u8][];
    size?: number;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Ram) => void,
}

export const Ram: React.FC<RamProps> = (props) => {
    const { data, size: maxSize=1+MEMORY_MAP.RAM_END-MEMORY_MAP.RAM_START, children, onInstanceCreated } = props;
    const { memoryBusRef } = useComputer();

    // Core
    const [ramInstance, setRamInstance] = useState<cpuApi.Ram | null>(null);

    // UI snapshot state
    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);

    // UI
    const [contentVisible, setContentVisible] = useState(true);


    // Instanciate Ram
    useEffect(() => {
        if (!memoryBusRef.current) return;
        //if (ramRef.current) return;
        if (memoryBusRef.current.ram) return;

        const _instanciateRam = () => {
        if (!memoryBusRef.current) return;

            // Save Instance for UI
            const ram = memoryBusRef.current.addRam(data, maxSize);
            setRamInstance(ram);

            // Handle state updates for UI
            ram.on('state', (state) => {
                //console.log('RAM state update', state)

                if (state.storage) {
                    setStorage(new Map(state.storage))
                }
            })

            // Emit initial state
            ram.emit('state', { storage: new Map(ram.storage) })

            //setInstanciated(true)
        }

        const timer = setTimeout(_instanciateRam, 100);
        return () => clearTimeout(timer);
    }, [memoryBusRef.current]);


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
        if (!memoryBusRef.current) return;

        const computerInstance = memoryBusRef.current.motherboard.computer
        if (!computerInstance) return;

        const osCode: CompiledCode | null = await computerInstance.loadOsCode(osName);
        const memoryOffset = MEMORY_MAP.OS_START;
        await computerInstance.loadCodeInRam(osCode, memoryOffset);
    }


    const loadProgramInRam = async (programName: string) => {
        if (!memoryBusRef.current) return;

        const computerInstance = memoryBusRef.current.motherboard.computer
        if (!computerInstance) return;

        const programCode: CompiledCode | null = await computerInstance.loadProgramCode(programName);
        const memoryOffset = MEMORY_MAP.PROGRAM_START;
        await computerInstance.loadCodeInRam(programCode, memoryOffset);
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

                {/* Storage */}
                <div className="p-2 rounded bg-background-light-2xl">
                    <h3>RAM Storage</h3>

                    <MemoryTable name="ram" storage={storage} />
                </div>

                {/* Buttons */}
                <div className="p-2 rounded bg-background-light-2xl flex gap-2">
                    <button
                        onClick={() => loadOsInRam('MINI_OS_V1')}
                        className="bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                        >
                        Load OS
                    </button>

                    <button
                        onClick={() => loadProgramInRam('leds_test_2')}
                        className="bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ms-auto"
                        >
                        Load LEDs
                    </button>

                    <button
                        onClick={() => loadProgramInRam('FS_CREATE_FILE_COMPILED')}
                        className="bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                        >
                        Load Test FS
                    </button>
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


