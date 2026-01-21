
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';
import { DevicesManager } from '../Devices/DevicesManager';
import { os_list } from '@/cpus/default/programs/mini_os';
import { programs } from '@/cpus/default/programs/programs_index';
import { useComputer, type ViewType } from './ComputerContext';
import { Motherboard } from './Motherboard';
import { IDE } from '../Devices/IDE';


export const ComputerContainer: React.FC<{ view?: ViewType, children?: React.ReactNode }> = (props) => {
    const { view: initialView = 'open_advanced', children } = props;
    const { computerRef } = useComputer();

    // Core
    const [computerInstance, setComputerInstance] = useState<cpuApi.Computer | null>(null);

    const [motherboardInstance, setMotherboardInstance] = useState<cpuApi.Motherboard | null>(null);
    const [devicesManagerInstance, setDevicesManagerInstance] = useState<cpuApi.DevicesManager | null>(null);
    const [clockInstance, setClockInstance] = useState<cpuApi.Clock | null>(null);

    //const [cpuInstance, setCpuInstance] = useState<cpuApi.Cpu | null>(null);
    //const cpuInstance = cpuRef.current;
    //const ramInstance = ramRef.current;

    // UI
    const [contentVisible, setContentVisible] = useState(initialView !== 'closed');
    const [loadedOs, setLoadedOs] = useState<string | null>(null);
    const [loadedProgram, setLoadedProgram] = useState<string | null>(null);
    const [view, setView] = useState<ViewType>(initialView);
    const [clockActive, setClockActive] = useState(false);


    // Instanciate Computer
    useEffect(() => {
        if (computerRef.current) {
            setComputerInstance(computerRef.current);
            return;
        }

        const _instanciateComputer = () => {
            const computer = new cpuApi.Computer;
            setComputerInstance(computer);

            // Save Computer Ref
            computerRef.current = computer;

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

            // .on(clockStatus) => setClockActive(motherboardInstance?.clock?.status)
        }

        const timer = setTimeout(_instanciateComputer, 100);
        return () => clearTimeout(timer);
    }, []);


    const addMotherboard = (motherboard: cpuApi.Motherboard) => {
        if (motherboardInstance) return;

        // Save Instance
        setMotherboardInstance(motherboard);

        motherboard.on('clock-mounted', () => {
            if (!motherboard.clock) return;

            motherboard.clock.on('state', (state) => {
                if (state.status !== undefined) {
                    setClockActive(state.status);
                }
            })
        })
    }


    const addDevicesManager = (devicesManager: cpuApi.DevicesManager) => {
        if (devicesManagerInstance) return;

        // Save Instance
        setDevicesManagerInstance(devicesManager);
    }

    const onOpenCase = () => {
        setView('open_advanced')
    }

    const onCloseCase = () => {
        setView('open_simple')
    }

    const onPower = () => {
        if (!motherboardInstance?.clock) return;

        if (motherboardInstance.clock.status) {
            motherboardInstance.clock.stop()

        } else {
            motherboardInstance.clock.start()
        }
    }

    const resetComputer = () => {
        if (!computerInstance) return;
        computerInstance.reset()
    }


    const childrenWithPropsMotherboard: React.ReactElement<any, string | React.JSXElementConstructor<any>>[] = []
    const childrenWithPropsDevicesManager: React.ReactElement<any, string | React.JSXElementConstructor<any>>[] = []

    const childrenWithProps = React.Children.map(children, (child, childIdx) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                case DevicesManager: {
                    //return React.cloneElement(childElement, { onInstanceCreated: addDevicesManager });
                    const key = `${childElement.type.name}-${childIdx}`;
                    const element = React.cloneElement(childElement, { onInstanceCreated: addDevicesManager, key });
                    childrenWithPropsDevicesManager.push(element);
                    return null;
                }

                case Motherboard: {
                    //return React.cloneElement(childElement, { onInstanceCreated: addMotherboard });
                    const key = `${childElement.type.name}-${childIdx}`;
                    const element = React.cloneElement(childElement, { onInstanceCreated: addMotherboard, key });
                    childrenWithPropsMotherboard.push(element);
                    return null;
                }

                default:
                    //console.log(`Invalid component mounted into Computer :`, (childElement.type as JSXElementConstructor<any>).name);
                    //return null;
                    return childElement;
            }
        }
        return child;
    });



    if (!computerInstance) {
        return <>Loading Computer</>;
    }


    if (view === 'open_simple') {
        return (
            <div className={`computer`}>
                <ComputerCase
                    powerOn={true}
                    onOpenCase={onOpenCase}
                    onPower={onPower}
                />
            </div>
        )
    }


    return (
        <div className={`computer w-auto m-2 bg-stone-700 p-1 rounded ${view === 'hidden' ? "hidden" : ""}`}>

            {/* Computer Head */}
            <div className="w-full flex bg-background-light p-2 rounded">
                <h2 className="font-bold">Computer</h2>

                {/*
                <button
                    className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                    onClick={() => onCloseCase()}
                >
                    x
                </button>
                */}

                <button
                    className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                    onClick={() => setContentVisible(b => !b)}
                >
                    {contentVisible ? "-" : "+"}
                </button>
            </div>

            {/* Computer Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-2 p-1`}>

                <div className="flex gap-4">
                    {/* Buttons */}
                    <div className="p-2 rounded bg-background-light-2xl flex gap-2">
                        <button
                            onClick={() => onPower()}
                            className={`disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ${clockActive
                                ? "bg-green-900 hover:bg-green-700"
                                : "bg-blue-900 hover:bg-blue-700"
                            }`}
                        >
                            ⏻ Power
                        </button>
                    </div>

                    <ComputerControls
                        loadedProgram={loadedProgram}
                        loadedOs={loadedOs}
                        devicesManagerInstance={devicesManagerInstance}
                        computerInstance={computerInstance}
                        //ramInstance={ramInstance}
                        //cpuInstance={cpuInstance}
                        setLoadedOs={setLoadedOs}
                        setLoadedProgram={setLoadedProgram}
                    />

                    {/* Buttons */}
                    <div className="p-2 rounded bg-background-light-2xl flex gap-2">
                        <button
                            onClick={() => resetComputer()}
                            className="bg-red-900 hover:bg-red-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                        >
                            ⟳ Reset
                        </button>
                    </div>
                </div>

                {/* Computer Children */}
                <div className="computer-children flex flex-col space-y-4 w-full">

                    {/* Computer Known Children */}
                    <div className={`computer-known-children w-full flex space-y-4 ${childrenWithPropsMotherboard.length && childrenWithPropsMotherboard.length ? "flex-col" : ""}`}>

                        {/* Motherboard */}
                        <div className="computer-motherboard w-full">
                            {childrenWithPropsMotherboard.length > 0 && (
                                <>
                                    {childrenWithPropsMotherboard}
                                </>
                            )}

                            {childrenWithPropsMotherboard.length === 0 && (
                                <>
                                    <div className="bg-background-light-2xl m-auto w-96 h-[600px] border border-dashed border-foreground-light-xl flex flex-col justify-center items-center">
                                        <i>Insert <strong>Motherboard</strong> here</i>
                                        <pre className="m-2">{`<Motherboard />`}</pre>
                                        {/* <MotherboardIcon /> */}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* DevicesManager */}
                        <div className="computer-devices-manager w-full">
                            {childrenWithPropsDevicesManager.length > 0 && (
                                <>
                                    {childrenWithPropsDevicesManager}
                                </>
                            )}

                            {childrenWithPropsDevicesManager.length === 0 && (
                                <>
                                    <div className="bg-background-light-2xl m-auto w-96 h-[600px] border border-dashed border-foreground-light-xl flex flex-col justify-center items-center">
                                        <i>Insert <strong>External Devices</strong> here</i>
                                        <pre className="m-2">{`<ExternalDevices />`}</pre>
                                        {/* <DevicesManagerIcon /> */}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Computer Other Children */}
                    {childrenWithProps && (
                        <div className="computer-other-children space-y-4">
                            {childrenWithProps}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};



type ComputerControls = {
    loadedOs: string | null;
    loadedProgram: string | null;
    devicesManagerInstance: cpuApi.DevicesManager | null;
    computerInstance: cpuApi.Computer;
    //ramInstance: cpuApi.Ram | null
    //cpuInstance: cpuApi.Cpu | null
    setLoadedOs: React.Dispatch<React.SetStateAction<string | null>>
    setLoadedProgram: React.Dispatch<React.SetStateAction<string | null>>
}

export const ComputerControls: React.FC<ComputerControls> = (props) => {
    const { loadedOs, loadedProgram, } = props;
    const { setLoadedProgram, setLoadedOs, } = props;
    const { devicesManagerRef, computerRef } = useComputer()

    const devicesManagerInstance = devicesManagerRef.current
    const computerInstance = computerRef.current
    //const ramInstance = ramRef.current
    //const cpuInstance = cpuRef.current

    const [selectedOs, setSelectedOs] = useState<string | null>(null);
    const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

    const isOsUnloaded = false; // TODO
    const isProgramUnloaded = false; // TODO


    const loadOs = useCallback(async (osName: string) => {
        if (!computerInstance) return;
        computerInstance.loadOs(osName);
    }, [computerInstance])

    const unloadOs = useCallback(() => {
        if (!computerInstance) return;
        computerInstance.unloadOs();
    }, [computerInstance]);


    const loadProgram = useCallback(async (programName: string) => {
        if (!computerInstance) return;
        computerInstance.loadProgram(programName);
    }, [computerInstance])

    const unloadProgram = useCallback(() => {
        if (!computerInstance) return;
        computerInstance.unloadProgram();
    }, [computerInstance]);


    return (
        <>
            <div className="p-2 rounded bg-background-light-2xl flex gap-2 ">
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
                                loadProgram(selectedProgram ?? '');
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
        </>
    );
}



export type ComputerCaseProps = {
    powerOn?: boolean;
    onOpenCase?: () => void;
    onPower?: () => void;
};

export const ComputerCase: React.FC<ComputerCaseProps> = ({
    powerOn = false,
    onOpenCase,
    onPower,
}) => {
    const [hover, setHover] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-8">
            {/* Computer Tower */}
            <div className="relative">
                {/* Main Case Body */}
                <div className="w-64 h-96 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border-4 border-slate-600 shadow-2xl relative">

                    {/* Front Panel */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-600/20 to-transparent rounded-lg" />

                    {/* Top Vent */}
                    <div className="absolute top-4 left-8 right-8 h-8 bg-slate-900/50 rounded grid grid-cols-8 gap-1 p-1">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-slate-950 rounded-sm" />
                        ))}
                    </div>

                    {/* Power LED */}
                    <div className="absolute top-20 left-8 flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${powerOn
                            ? 'bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse'
                            : 'bg-slate-800'
                            }`} />
                        <span className="text-xs text-slate-400 font-mono">POWER</span>
                    </div>

                    {/* HDD LED */}
                    <div className="absolute top-28 left-8 flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full transition-all duration-100 ${powerOn
                            ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                            : 'bg-slate-800'
                            }`} />
                        <span className="text-xs text-slate-400 font-mono">HDD</span>
                    </div>

                    {/* Drive Bay */}
                    <div className="absolute top-44 left-8 right-8 h-12 bg-slate-950 border border-slate-700 rounded flex items-center justify-center">
                        <div className="w-3/4 h-1 bg-slate-800 rounded" />
                    </div>

                    {/* Another Drive Bay */}
                    <div className="absolute top-60 left-8 right-8 h-12 bg-slate-950 border border-slate-700 rounded flex items-center justify-center">
                        <div className="w-3/4 h-1 bg-slate-800 rounded" />
                    </div>

                    {/* Power Button */}
                    <div
                        className="absolute bottom-8 left-8 w-12 h-12 bg-slate-900 border-2 border-slate-600 rounded-full flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors"
                        onClick={() => { if (onPower) onPower() }}
                    >
                        <div className="w-6 h-6 border-2 border-slate-500 rounded-full relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-slate-500" />
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div className="absolute bottom-8 left-24 w-8 h-8 bg-slate-900 border-2 border-slate-600 rounded-full flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors">
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>

                    {/* Side Panel Screws */}
                    <div className="absolute top-8 right-2 w-2 h-2 bg-slate-500 rounded-full" />
                    <div className="absolute top-24 right-2 w-2 h-2 bg-slate-500 rounded-full" />
                    <div className="absolute bottom-24 right-2 w-2 h-2 bg-slate-500 rounded-full" />
                    <div className="absolute bottom-8 right-2 w-2 h-2 bg-slate-500 rounded-full" />

                    {/* Bottom Vent */}
                    <div className="absolute bottom-4 left-8 right-8 h-8 bg-slate-900/50 rounded grid grid-cols-8 gap-1 p-1">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-slate-950 rounded-sm" />
                        ))}
                    </div>
                </div>

                {/* Base/Feet */}
                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-slate-700 rounded-sm" />
                <div className="absolute -bottom-2 right-8 w-4 h-4 bg-slate-700 rounded-sm" />
            </div>

            {/* Open Case Button */}
            <button
                onClick={onOpenCase}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className="mt-12 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-3 group"
            >
                <svg
                    className="w-6 h-6 transition-transform group-hover:rotate-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                OPEN CASE
            </button>

            {/* Info Text */}
            <p className="mt-6 text-slate-500 font-mono text-sm">
                Click to access internal components
            </p>
        </div>
    );
};