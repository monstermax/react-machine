import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../api/api';
import { MemoryBus } from './MemoryBus';
import { Cpu } from './Cpu';
import { Devices } from './Devices';
import { os_list } from '@/programs/mini_os';
import { programs } from '@/lib/programs';
import type { OsInfo, ProgramInfo, u8 } from '@/types/cpu.types';
import { MEMORY_MAP } from '@/lib/memory_map';
import { loadCodeFromFile } from '@/lib/compiler';


export const Computer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [computer, setComputer] = useState<cpuApi.Computer | null>(null);
    const [cpuInstance, setCpuInstance] = useState<cpuApi.Cpu | null>(null);
    const [memoryBusInstance, setMemoryBusInstance] = useState<cpuApi.MemoryBus | null>(null);
    //const [ramInstance, setRamInstance] = useState<cpuApi.Ram | null>(null);
    const [devicesInstance, setDevicesInstance] = useState<cpuApi.IO | null>(null);
    const [childrenVisible, setChildrenVisible] = useState(true);

    const [selectedOs, setSelectedOs] = useState<string | null>(null);
    const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

    const ramInstance = cpuApi.ramRef.current;

    const isOsUnloaded = false; // TODO
    const isProgramUnloaded = false; // TODO


    // Instanciate Computer
    useEffect(() => {
        const _instanciateComputer = () => {
            const computer = new cpuApi.Computer;
            setComputer(computer);

            // Save Computer Ref
            cpuApi.computerRef.current = computer;

            // Handle state updates
            computer.on('state', (state) => {
                console.log('Computer state update', state)

            })
        }

        const timer = setTimeout(_instanciateComputer, 100);
        return () => clearTimeout(timer);
    }, []);


    // Mount CPU - récupère l'instance du CPU depuis les enfants
    useEffect(() => {
        if (!computer) return;

        if (cpuInstance && !computer.cpu) {
            computer.cpu = cpuInstance;
            console.log('CPU monté dans Computer:', cpuInstance);
        }
    }, [computer, cpuInstance]);


    // Mount MemoryBus - récupère l'instance du MemoryBus depuis les enfants
    useEffect(() => {
        if (!computer) return;

        if (memoryBusInstance && !computer.memoryBus) {
            computer.memoryBus = memoryBusInstance;
            console.log('MemoryBus monté dans Computer:', cpuInstance);
        }
    }, [computer, memoryBusInstance]);


    // Mount Devices - récupère l'instance du Devices depuis les enfants
    useEffect(() => {
        if (!computer?.memoryBus) return;

        if (devicesInstance && !computer.memoryBus.io) {
            computer.memoryBus.io = devicesInstance;
            console.log('Devices monté dans MemoryBus via Computer:', devicesInstance);
        }
    }, [computer, devicesInstance]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case Cpu:
                    return React.cloneElement(childElement, {
                        onInstanceCreated: (instance: cpuApi.Cpu) => {
                            setCpuInstance(instance);
                        }
                    });
                    break;

                case MemoryBus:
                    return React.cloneElement(childElement, {
                        onInstanceCreated: (instance: cpuApi.MemoryBus) => {
                            setMemoryBusInstance(instance);
                        }
                    });
                    break;
                case Devices:
                    return React.cloneElement(childElement, {
                        onInstanceCreated: (instance: cpuApi.IO) => {
                            setDevicesInstance(instance);
                        }
                    });
                    break;

                default:
                    console.log(`Invalid component mounted into Computer : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;
            }
        }
        return child;
    });


    const loadOsInRam = async (osName: string) => {
        if (!ramInstance || !computer) return;

        const os: OsInfo | null = osName ? os_list[osName] : null;
        if (!os?.filepath) return;

        const memoryOffset = MEMORY_MAP.OS_START;
        const code = await loadCodeFromFile(os.filepath, memoryOffset)

        if (os) {
            ramInstance.loadCodeInRam(code, memoryOffset);

        } else {
            ramInstance.write(memoryOffset, 0 as u8);
        }

        ramInstance.emit('state', { storage: new Map(ramInstance.storage) })

        computer.loadedOs = osName;
        computer.emit('state', { loadedOs: osName })
    }


    const loadProgramInRam = async (programName: string) => {
        if (!ramInstance || !computer) return;

        const program: ProgramInfo | null = programName ? programs[programName] : null;
        if (!program?.filepath) return;

        const memoryOffset = MEMORY_MAP.PROGRAM_START;
        const code = await loadCodeFromFile(program.filepath, MEMORY_MAP.PROGRAM_START)

        if (program) {
            ramInstance.loadCodeInRam(code, memoryOffset);

        } else {
            ramInstance.write(memoryOffset, 0 as u8);
        }

        ramInstance.emit('state', { storage: new Map(ramInstance.storage) })

        computer.loadedProgram = programName;
        computer.emit('state', { loadedProgram: programName })

    }


    if (!computer) {
        return <>Loading Computer</>;
    }

    return (
        <div className="computer bg-background-light-2xl m-2 p-1 rounded">

            {/* Computer Head */}
            <div className="w-full flex bg-background-light p-2 rounded">
                <h2 className="font-bold">Computer</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* Computer Content */}
            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>

                <div className="p-2 rounded bg-background-light-2xl flex gap-2 justify-around">
                    <div className="w-5/12 bg-background-light-xl px-2 py-1 rounded flex gap-2 items-center">
                        <div>
                            Main OS:
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={selectedOs ?? ''}
                                onChange={(e) => setSelectedOs(e.target.value || null)}
                                className="w-full bg-background-light border border-slate-600 rounded px-4 py-2 text-white"
                            >
                                <option key="none" value="">
                                    None
                                </option>
                                {Object.entries(os_list).map(([key, prog]) => (
                                    <option key={key} value={key}>
                                        {prog.name} - {prog.description}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => {
                                    loadOsInRam(selectedOs ?? '');
                                }}
                                disabled={!selectedOs}
                                className="bg-blue-900 hover:bg-blue-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                            >
                                {(computer.loadedOs && computer.loadedOs === selectedOs && !isOsUnloaded) ? "Reload" : "Load"}
                            </button>
                        </div>
                    </div>
                    <div className="w-5/12 bg-background-light-xl px-2 py-1 rounded flex gap-2 items-center">
                        <div>
                            Program:
                        </div>

                        <div className="flex gap-4">
                            <select
                                value={selectedProgram ?? ''}
                                onChange={(e) => setSelectedProgram(e.target.value || null)}
                                className="w-full bg-background-light border border-slate-600 rounded px-4 py-2 text-white"
                            >
                                <option key="none" value="">
                                    None
                                </option>
                                {Object.entries(programs).map(([key, prog]) => (
                                    <option key={key} value={key}>
                                        {prog.name} - {prog.description}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => {
                                    loadProgramInRam(selectedProgram ?? '');
                                }}
                                disabled={!selectedProgram}
                                className="bg-blue-900 hover:bg-blue-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                            >
                                {(computer.loadedProgram && computer.loadedProgram === selectedProgram && !isProgramUnloaded) ? "Reload" : "Load"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Computer Children */}
                {childrenWithProps && (
                    <div className="computer-children flex space-x-4 space-y-4">
                        {childrenWithProps}
                    </div>
                )}

            </div>
        </div>
    );
};

