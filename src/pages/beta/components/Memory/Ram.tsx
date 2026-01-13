import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../../api/api';
import { MemoryTable } from './MemoryTable';
import { os_list } from '@/programs/mini_os';
import { compileFile } from '@/lib/compiler';
import { MEMORY_MAP } from '@/lib/memory_map';
import { U16 } from '@/lib/integers';
import { programs } from '@/lib/programs';
import { useComputer } from '../Computer/ComputerContext';

import type { OsInfo, ProgramInfo, u16, u8 } from '@/types/cpu.types';


export type RamProps = {
    data?: Map<u16, u8> | [u16, u8][];
    size?: number;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Ram) => void,
}

export const Ram: React.FC<RamProps> = (props) => {
    const { data, size: maxSize, children, onInstanceCreated } = props;
    const { computerRef, memoryBusRef, ramRef } = useComputer();

    // Core
    const [ramInstance, setRamInstance] = useState<cpuApi.Ram | null>(null);

    // Core Dependencies
    const computerInstance = computerRef.current;
    const memoryBusInstance = memoryBusRef.current;

    // UI snapshot state
    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);

    // UI
    const [contentVisible, setContentVisible] = useState(true);


    // Instanciate Ram
    useEffect(() => {
        if (!memoryBusInstance) return;
        if (ramRef.current) return;

        const _instanciateRam = () => {
            const ram = new cpuApi.Ram(data, maxSize);
            setRamInstance(ram);

            // Save RamBus Ref
            ramRef.current = ram;

            // Handle state updates
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
    }, [memoryBusInstance]);


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

        // doublon avec Computer.loadOsInRam

        const os: OsInfo | null = osName ? os_list[osName] : null;
        if (!os?.filepath) return;

        const memoryOffset = MEMORY_MAP.OS_START;
        const { code } = await compileFile(os.filepath, memoryOffset)

        if (os) {
            ramInstance.loadCodeInRam(code, memoryOffset);

        } else {
            ramInstance.write(memoryOffset, 0 as u8);
        }

        //ramInstance.emit('state', { storage: new Map(ramInstance.storage) })

        computerInstance.loadedOs = osName;
        computerInstance.emit('state', { loadedOs: osName })
    }


    const loadProgramInRam = async (programName: string) => {
        if (!ramInstance || !computerInstance) return;

        // doublon avec Computer.loadProgramInRam

        const program: ProgramInfo | null = programName ? programs[programName] : null;
        if (!program?.filepath) return;

        const memoryOffset = MEMORY_MAP.PROGRAM_START;
        const { code } = await compileFile(program.filepath, memoryOffset)

        if (program) {
            ramInstance.loadCodeInRam(code, memoryOffset);

        } else {
            ramInstance.write(memoryOffset, 0 as u8);
        }

        //ramInstance.emit('state', { storage: new Map(ramInstance.storage) })

        computerInstance.loadedProgram = programName;
        computerInstance.emit('state', { loadedProgram: programName })
    }


    return (
        <div className="ram w-80">

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


