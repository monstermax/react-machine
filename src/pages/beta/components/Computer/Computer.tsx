
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../../api/api';
import { MemoryBus } from '../Memory/MemoryBus';
import { Cpu } from '../Cpu/Cpu';
import { DevicesManager } from '../Devices/DevicesManager';
import { os_list } from '@/programs/mini_os';
import { programs } from '@/lib/programs';
import { MEMORY_MAP } from '@/lib/memory_map';
import { loadCodeFromFile } from '@/lib/compiler';

import type { CompiledCode, OsInfo, ProgramInfo, u8 } from '@/types/cpu.types';
import { U16 } from '@/lib/integers';


export const Computer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {

    // Core
    const [computerInstance, setComputerInstance] = useState<cpuApi.Computer | null>(null);
    const [cpuInstance, setCpuInstance] = useState<cpuApi.Cpu | null>(null);
    const [memoryBusInstance, setMemoryBusInstance] = useState<cpuApi.MemoryBus | null>(null);
    const [devicesManagerInstance, setDevicesManagerInstance] = useState<cpuApi.DevicesManager | null>(null);
    const ramInstance = cpuApi.ramRef.current;

    // UI
    const [childrenVisible, setChildrenVisible] = useState(true);
    const [selectedOs, setSelectedOs] = useState<string | null>(null);
    const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
    const [loadedOs, setLoadedOs] = useState<string | null>(null);
    const [loadedProgram, setLoadedProgram] = useState<string | null>(null);

    const isOsUnloaded = false; // TODO
    const isProgramUnloaded = false; // TODO


    // Instanciate Computer
    useEffect(() => {
        const _instanciateComputer = () => {
            const computer = new cpuApi.Computer;
            setComputerInstance(computer);

            // Save Computer Ref
            cpuApi.computerRef.current = computer;

            // Handle state updates
            computer.on('state', (state) => {
                //console.log('Computer state update', state)

                if (state.loadedOs !== undefined) {
                    setLoadedOs(state.loadedOs)
                }

                if (state.loadedProgram !== undefined) {
                    setLoadedProgram(state.loadedProgram)
                }
            })
        }

        const timer = setTimeout(_instanciateComputer, 100);
        return () => clearTimeout(timer);
    }, []);


    const addCpu = (cpuInstance: cpuApi.Cpu) => {
        if (!computerInstance) return;

        if (cpuInstance && !computerInstance.cpu) {
            computerInstance.cpu = cpuInstance;
            //console.log('CPU monté dans Computer:', cpuInstance);
        }

        setCpuInstance(cpuInstance);
    }


    const addMemoryBus = (memoryBusInstance: cpuApi.MemoryBus) => {
        if (!computerInstance) return;

        if (memoryBusInstance && !computerInstance.memoryBus) {
            computerInstance.memoryBus = memoryBusInstance;
            //console.log('MemoryBus monté dans Computer:', memoryBusInstance);
        }

        setMemoryBusInstance(memoryBusInstance);
    }


    const addDevicesManager = (devicesManagerInstance: cpuApi.DevicesManager) => {
        if (!computerInstance?.memoryBus) return;

        if (devicesManagerInstance && !computerInstance.memoryBus.io) {
            computerInstance.memoryBus.io = devicesManagerInstance;
            //console.log('Devices monté dans MemoryBus via Computer:', devicesInstance);
        }

        setDevicesManagerInstance(devicesManagerInstance);
    }


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case Cpu:
                    return React.cloneElement(childElement, { onInstanceCreated: addCpu });

                case MemoryBus:
                    return React.cloneElement(childElement, { onInstanceCreated: addMemoryBus });

                case DevicesManager:
                    return React.cloneElement(childElement, { onInstanceCreated: addDevicesManager });

                default:
                    console.log(`Invalid component mounted into Computer : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
            }
        }
        return child;
    });


    const loadOs = async (osName: string) => {
        loadOsInRam(osName);
    }


    const loadCodeOnDisk = async (diskName: string, code: CompiledCode) => {
        if (!devicesManagerInstance) return;

        const disk = devicesManagerInstance.getDeviceByName(diskName) as cpuApi.StorageDisk | undefined
        if (!disk) return;

        if (disk.type !== 'DiskStorage') return;

        await disk.loadRawData(code);
    }


    const loadOsInRam = useCallback(async (osName: string) => {
        if (!ramInstance || !computerInstance) return;

        // doublon avec Ram.loadOsInRam

        const os: OsInfo | null = osName ? os_list[osName] : null;
        if (!os?.filepath) return;

        const memoryOffset = MEMORY_MAP.OS_START;
        const code = await loadCodeFromFile(os.filepath, memoryOffset)

        if (os) {
            loadCodeOnDisk('os_disk', code); // load on disk too (for debug)
            ramInstance.loadCodeInRam(code, memoryOffset); // load in ram

        } else {
            ramInstance.write(memoryOffset, 0 as u8);
        }

        if (cpuInstance) {
            const pc = cpuInstance.getRegister('PC');

            if ((pc > MEMORY_MAP.ROM_END)) {
                cpuInstance.setRegister('PC', MEMORY_MAP.ROM_START);
            }
        }

        //ramInstance.emit('state', { storage: new Map(ramInstance.storage) })

        computerInstance.loadedOs = osName;
        computerInstance.emit('state', { loadedOs: osName })
    }, [ramInstance, computerInstance, cpuInstance])


    const loadProgramInRam = useCallback(async (programName: string) => {
        if (!ramInstance || !computerInstance) return;

        // doublon avec Ram.loadProgramInRam

        const program: ProgramInfo | null = programName ? programs[programName] : null;
        if (!program?.filepath && !(program && program.code && program.code.size > 0)) return;

        const memoryOffset = MEMORY_MAP.PROGRAM_START;
        const code = program.code.size ? program.code : await loadCodeFromFile(program.filepath as string, MEMORY_MAP.PROGRAM_START)

        if (program) {
            loadCodeOnDisk('program_disk', code); // load on disk too (for debug)
            ramInstance.loadCodeInRam(code, memoryOffset); // load in ram

        } else {
            ramInstance.write(memoryOffset, 0 as u8);
        }

        if (cpuInstance) {
            const pc = cpuInstance.getRegister('PC');

            if (pc >= MEMORY_MAP.PROGRAM_START && pc <= MEMORY_MAP.PROGRAM_END) {
                cpuInstance.setRegister('PC', MEMORY_MAP.OS_START);
            }
        }

        //ramInstance.emit('state', { storage: new Map(ramInstance.storage) })

        computerInstance.loadedProgram = programName;
        computerInstance.emit('state', { loadedProgram: programName })
    }, [cpuInstance, ramInstance, computerInstance])


    const unloadOs = useCallback(() => {
        // Vide le disk

        if (devicesManagerInstance) {
            const diskName = 'os_disk';
            const disk = devicesManagerInstance.getDeviceByName(diskName) as cpuApi.StorageDisk | undefined
            if (disk && disk.type === 'DiskStorage') {
                disk.eraseDisk();
            }
        }


        if (ramInstance) {
            for (let addr = MEMORY_MAP.OS_START; addr <= MEMORY_MAP.OS_END; addr++) {
                //ramInstance.storage.set(U16(addr), 0x00 as u8); // TRES TRES LENT !!! => solution : on ne vide que la 1ere adresse
                //break;
                ramInstance.storage.delete(U16(addr)); // le delete est rapide
            }

            ramInstance.emit('state', { storage: new Map(ramInstance.storage) })
        }

        if (cpuInstance) {
            const pc = cpuInstance.getRegister('PC');

            if ((pc > MEMORY_MAP.ROM_END)) {
                cpuInstance.setRegister('PC', MEMORY_MAP.ROM_START);
            }
        }

        setLoadedOs(null);
    }, [devicesManagerInstance, ramInstance]);


    const unloadProgram = useCallback(() => {
        // Vide le disk

        if (devicesManagerInstance) {
            const diskName = 'program_disk';
            const disk = devicesManagerInstance.getDeviceByName(diskName) as cpuApi.StorageDisk | undefined
            if (disk && disk.type === 'DiskStorage') {
                disk.eraseDisk();
            }
        }

        if (ramInstance) {
            for (let addr = MEMORY_MAP.PROGRAM_START; addr <= MEMORY_MAP.PROGRAM_END; addr++) {
                //ramInstance.storage.set(U16(addr), 0x00 as u8); // TRES TRES LENT !!! => solution : on ne vide que la 1ere adresse
                //break;
                ramInstance.storage.delete(U16(addr)); // le delete est rapide
            }

            ramInstance.emit('state', { storage: new Map(ramInstance.storage) })
        }

        if (cpuInstance) {
            const pc = cpuInstance.getRegister('PC');

            if (pc >= MEMORY_MAP.PROGRAM_START && pc <= MEMORY_MAP.PROGRAM_END) {
                cpuInstance.setRegister('PC', MEMORY_MAP.OS_START);
            }
        }

        setLoadedProgram(null);
    }, [devicesManagerInstance, ramInstance]);


    if (!computerInstance) {
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
            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-2 bg-background-light-3xl p-1`}>

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
                                        {(key === loadedOs && !isOsUnloaded) ? "* " : ""}
                                        {prog.name} - {prog.description}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => {
                                    loadOs(selectedOs ?? '');
                                }}
                                disabled={!selectedOs}
                                className={`disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ${(loadedOs && (loadedOs === selectedOs) && !isOsUnloaded)
                                    ? "bg-yellow-900 hover:bg-yellow-700"
                                    : "bg-blue-900 hover:bg-blue-700"
                                }`}
                            >
                                {(loadedOs && (loadedOs === selectedOs) && !isOsUnloaded) ? "Reload" : "Load"}
                            </button>

                            <button
                                onClick={() => { unloadOs() }}
                                disabled={!loadedOs || isOsUnloaded}
                                className="ms-auto bg-purple-900 hover:bg-purple-900 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                            >
                                Unload
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
                                        {(key === loadedProgram && !isProgramUnloaded) ? "* " : ""}
                                        {prog.name} - {prog.description}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => {
                                    loadProgramInRam(selectedProgram ?? '');
                                }}
                                disabled={!selectedProgram}
                                className={`disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ${(loadedProgram && (loadedProgram === selectedProgram) && !isProgramUnloaded)
                                    ? "bg-yellow-900 hover:bg-yellow-700"
                                    : "bg-blue-900 hover:bg-blue-700"
                                }`}
                            >
                                {(loadedProgram && (loadedProgram === selectedProgram) && !isProgramUnloaded) ? "Reload" : "Load"}
                            </button>

                            <button
                                onClick={() => { unloadProgram() }}
                                disabled={!loadedProgram || isProgramUnloaded}
                                className="ms-auto bg-purple-900 hover:bg-purple-900 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                            >
                                Unload
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

