
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';
import { Clock } from './Clock';

import { useComputer } from '../Computer/ComputerContext';
import { Interrupt } from './Interrupt';

import type { u16, u8 } from '@/types/cpu.types';
import { delayer } from '@/lib/delayer';
import { CpuRegisters } from './Registers';


export type CpuProps = {
    hidden?: boolean,
    cores?: number,
    type?: string, // simple, z80, 8086, ...
    active?: boolean,
    controls?: boolean,
    registers?: boolean,
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Cpu) => void,
}


export const Cpu: React.FC<CpuProps> = (props) => {
    const { hidden, cores: coresCount, type: cpuType, active: cpuActiveAtInit, controls: showControls=false, registers: showRegisters=false, children } = props;
    const { onInstanceCreated } = props;
    const { motherboardRef, devicesManagerRef } = useComputer();

    // Core
    const [cpuInstance, setCpuInstance] = useState<cpuApi.Cpu | null>(null);

    // Core Children
    //const [clockInstance, setClockInstance] = useState<cpuApi.Clock | null>(null);
    const [interruptInstance, setInterruptInstance] = useState<cpuApi.Interrupt | null>(null);

    // UI snapshot state
    const [cpuPaused, setCpuPaused] = useState(false);
    const [CpuHalted, setCpuHalted] = useState(true);
    const [clockPaused, setClockPaused] = useState(true);
    const [cpuCycle, setCpuCycle] = useState(0);
    const [coresRegisters, setCoresRegisters] = useState<Map<number, Map<string, u8 | u16>>>(new Map);
    const [coresCoreCycle, setCoresCoreCycle] = useState<Map<number, number>>(new Map);
    const [coresHalted, setCoresHalted] = useState<Map<number, boolean>>(new Map);

    // UI
    const [contentVisible, setContentVisible] = useState(true);

    const coresIds = useMemo(() => {
        const _coresIds = Array.from(coresHalted.keys());
        return _coresIds;
    }, [coresHalted])


    // Instanciate CPU
    useEffect(() => {
        if (!motherboardRef.current) return;
        //if (cpuRef.current) return;

        const _instanciateCpu = () => {
            if (!motherboardRef.current) return;

            // Init Instance
            const cpu = motherboardRef.current.addCpu(coresCount);

            // Save Instance for UI
            setCpuInstance(cpu);

            // Handle CPU state updates for UI
            cpu.on('state', (state) => {;
                //console.log('CPU state update', state)

                if (state.cpuHalted !== undefined) {
                    setCpuHalted(state.cpuHalted)
                }

                if (state.cpuCycle !== undefined) {
                    delayer('cpu-cycle', (cycle: number) => {
                        setCpuCycle(cycle)
                    }, 100, 500, [state.cpuCycle]);
                }

                if (state.cpuPaused !== undefined) {
                    setCpuPaused(state.cpuPaused)
                }
            })

            // Handle CORES state updates for UI
            for (let i = 0; i < cpu.cores.length; i++) {
                const core = cpu.cores[i];
                //const coreIdx = core.idx;

                core.on('state', (state) => {
                    const coreIdx = state.idx;
                    //console.log('CPU CORE state update', coreIdx, state)

                    if (coreIdx === undefined) {
                        console.warn(`CPU CORE state update => missing core idx`)
                        return;
                    }

                    if (state.coreCycle) {
                        delayer('cpu-core-cycle', (coreIdx: number) => {
                            setCoresCoreCycle(r => {
                                const n = new Map(r);
                                n.set(coreIdx, state.coreCycle);
                                return n;
                            })
                        }, 10, 100, [coreIdx]);
                    }

                    if (state.registers) {
                        delayer('cpu-core-register', (coreIdx: number) => {
                            setCoresRegisters(r => {
                                const n = new Map(r);
                                n.set(coreIdx, state.registers);
                                return n;
                            })
                        }, 10, 100, [coreIdx]);
                    }

                    if (state.coreHalted !== undefined) {
                        setCoresHalted(r => {
                            const n = new Map(r);
                            n.set(coreIdx, state.coreHalted);
                            return n;
                        })
                    }

                })
            }

            // Handle Clock state updates for UI
            if (motherboardRef.current && motherboardRef.current.clock) {
                const clockInstance = motherboardRef.current.clock;

                clockInstance.on('state', (state) => {
                    if (state.status !== undefined) {
                        setClockPaused(!state.status)
                    }
                });
            }


            // Emit initial CPU state
            cpu.emit('state', {
                //registers: this.cores[0].registers,
                cpuCycle: cpu.cpuCycle,
                cpuPaused: cpu.cpuPaused,
                cpuHalted: cpu.cpuHalted,
            })

            // Emit initial CORES state
            for (const core of cpu.cores) {
                core.emit('state', {
                    idx: core.idx,
                    registers: core.registers,
                    coreCycle: core.coreCycle,
                    coreHalted: core.coreHalted,
                })
            }


            //console.log('CPU initialized', cpuInstance.cores)
            //setInstanciated(true)

            // Start CPU
            if (cpuActiveAtInit || (cpuActiveAtInit === undefined && cpu.idx === 0)) {
                cpu.start()
            }
        }

        const timer = setTimeout(_instanciateCpu, 100);
        return () => clearTimeout(timer);
    }, [motherboardRef.current]);


    // Notifie le parent quand le CPU est créé
    useEffect(() => {
        if (cpuInstance && onInstanceCreated) {
            onInstanceCreated(cpuInstance);
        }
    }, [cpuInstance, onInstanceCreated]);


    // Mount Interrupt - récupère l'instance du Interrupt depuis les enfants
    const addInterrupt = (interruptInstance: cpuApi.Interrupt) => {
        if (!cpuInstance) return;

        if (interruptInstance && !cpuInstance.interrupt) {
            cpuInstance.interrupt = interruptInstance;

            //console.log('interrupt monté dans CPU:', interruptInstance);

            // Attach Interrupt to DevicesManager
            if (devicesManagerRef.current) {
                devicesManagerRef.current.devices.set(interruptInstance.ioPort, interruptInstance)
            }
        }

        setInterruptInstance(interruptInstance);
    }


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                //case Clock:
                //    return React.cloneElement(childElement, { onInstanceCreated: addClock });

                case Interrupt:
                    return React.cloneElement(childElement, { onInstanceCreated: addInterrupt });

                default:
                    console.log(`Invalid component mounted into Cpu : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
            }
        }
        return child;
    });


    const runStep = () => {
        if (!cpuInstance) return;

        console.log(`runStep cycle #${cpuCycle + 1}`);

        cpuInstance.executeCycle();
    };

    const enableCpu = () => {
        if (!cpuInstance) return;

        console.log(`runLoop cycle #${cpuCycle + 1}`);

        cpuInstance.togglePaused();
    };


    const resetCpu = () => {
        if (!cpuInstance) return;

        console.log('resetCpu');

        if (cpuInstance) {
            cpuInstance.reset();
        }
    };


    if (!cpuInstance) {
        return <>Loading CPU</>;
    }

    return (
        <div className={`cpu w-auto ${hidden ? "hidden" : ""}`}>

            {/* CPU Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">CPU #{cpuInstance.idx}</h2>

                {true && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setContentVisible(b => !b)}
                    >
                        {contentVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* CPU Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-2 bg-background-light-3xl p-1 min-w-[400px]`}>

                {showControls && (
                    <>
                        {/* Buttons */}
                        <div className="p-2 rounded bg-background-light-2xl flex gap-2">
                            <button
                                onClick={() => resetCpu()}
                                className="bg-red-900 hover:bg-red-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                            >
                                ⟳ Reset
                            </button>

                            <button
                                disabled={CpuHalted}
                                onClick={() => enableCpu()}
                                className={`disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ${!cpuPaused
                                    ? "bg-green-900 hover:bg-green-700"
                                    : "bg-blue-900 hover:bg-blue-700"
                                    }`}
                            >
                                <span className={`${cpuPaused ? "" : "font-bold"}`}>Auto</span>
                                /
                                <span className={`${cpuPaused ? "font-bold" : ""}`}>Manual</span>
                            </button>

                            <button
                                disabled={CpuHalted || (!cpuPaused && !clockPaused)}
                                onClick={() => runStep()}
                                className="bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ms-auto"
                            >
                                ⏭ Step
                            </button>
                        </div>
                    </>
                )}

                {/* Cycles */}
                <div className="p-2 rounded bg-background-light-2xl flex justify-between">
                    <div>CPU Cycle #{cpuCycle}</div>
                    <div>Cache L1 {cpuInstance.cacheL1.size} bytes</div>
                </div>


                {showRegisters && (
                    <>
                        {/* Registers */}
                        <CpuRegisters
                            cpuHalted={CpuHalted}
                            cpuPaused={cpuPaused}
                            clockPaused={clockPaused}
                            coresIds={coresIds}
                            coresHalted={coresHalted}
                            coresCoreCycle={coresCoreCycle}
                            coresRegisters={coresRegisters}
                        />
                    </>
                )}

                {/* CPU Children */}
                {childrenWithProps && (
                    <div className="cpu-children flex space-x-4 space-y-4">
                        {childrenWithProps}
                    </div>
                )}
            </div>
        </div>
    );
};

