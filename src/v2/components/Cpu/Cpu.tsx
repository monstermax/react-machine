
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';
import { Clock } from './Clock';

import { useComputer } from '../Computer/ComputerContext';
import { Interrupt } from './Interrupt';

import type { u16, u8 } from '@/types/cpu.types';


export type CpuProps = {
    hidden?: boolean,
    cores?: number,
    type?: string,
    active?: boolean,
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Cpu) => void,
}


export const Cpu: React.FC<CpuProps> = (props) => {
    const { hidden, cores: coresCount, type: cpuType, active: cpuActiveAtInit, children, onInstanceCreated } = props;
    const { motherboardRef, devicesManagerRef } = useComputer();

    // Core
    const [cpuInstance, setCpuInstance] = useState<cpuApi.Cpu | null>(null);

    // Core Children
    //const [clockInstance, setClockInstance] = useState<cpuApi.Clock | null>(null);
    const [interruptInstance, setInterruptInstance] = useState<cpuApi.Interrupt | null>(null);

    // UI snapshot state
    const [paused, setPaused] = useState(false);
    const [halted, setHalted] = useState(true);
    const [clockPaused, setClockPaused] = useState(true);
    const [clockCycle, setClockCycle] = useState(0);
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

            // Save Instance for UI
            const cpu = motherboardRef.current.addCpu(coresCount);
            setCpuInstance(cpu);

            // Handle CPU state updates for UI
            cpu.on('state', (state) => {
                //console.log('CPU state update', state)

                if (state.cpuHalted !== undefined) {
                    setHalted(state.cpuHalted)
                }

                if (state.clockCycle !== undefined) {
                    setClockCycle(state.clockCycle)
                }

                if (state.paused !== undefined) {
                    setPaused(state.paused)
                }
            })

            // Handle CORES state updates for UI
            for (let i=0; i<cpu.cores.length; i++) {
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
                        setCoresCoreCycle(r => {
                            const n = new Map(r);
                            n.set(coreIdx, state.coreCycle);
                            return n;
                        })
                    }

                    if (state.registers) {
                        setCoresRegisters(r => {
                            const n = new Map(r);
                            n.set(coreIdx, state.registers);
                            return n;
                        })
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


            // Emit initial state
            cpu.emit('state', {
                //registers: this.cores[0].registers,
                clockCycle: cpu.clockCycle,
                paused: cpu.paused,
                cpuHalted: cpu.cpuHalted,
            })

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

        console.log(`runStep cycle #${clockCycle + 1}`);

        cpuInstance.executeCycle();
    };

    const enableCpu = () => {
        if (!cpuInstance) return;

        console.log(`runLoop cycle #${clockCycle + 1}`);

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
        <div className={`cpu w-120 ${hidden ? "hidden" : ""}`}>

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
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-2 bg-background-light-3xl p-1`}>

                {/* Buttons */}
                <div className="p-2 rounded bg-background-light-2xl flex gap-2">
                    <button
                        onClick={() => resetCpu()}
                        className="bg-red-900 hover:bg-red-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                    >
                        ⟳ Reset
                    </button>

                    <button
                        disabled={halted}
                        onClick={() => enableCpu()}
                        className={`disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ${!paused
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : "bg-green-900 hover:bg-green-700"
                            }`}
                    >
                        {paused ? "Auto" : "Manual"}
                    </button>

                    <button
                        disabled={halted || (!paused && !clockPaused)}
                        onClick={() => runStep()}
                        className="bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ms-auto"
                    >
                        ⏭ Step
                    </button>
                </div>

                {/* Cycles */}
                {/*
                <div className="p-2 rounded bg-background-light-2xl">
                    CPU Cycle #{clockCycle}
                </div>
                */}

                {/* CPU Children */}
                {childrenWithProps && (
                    <div className="cpu-children flex space-x-4 space-y-4">
                        {childrenWithProps}
                    </div>
                )}

                {/* Registers */}
                {coresIds.map(coreIdx => (
                    <Registers key={coreIdx}
                        coreIdx={coreIdx}
                        coreHalted={coresHalted.get(coreIdx) ?? true}
                        coreCycle={coresCoreCycle.get(coreIdx) ?? 0}
                        registers={coresRegisters.get(coreIdx) ?? new Map}
                        paused={paused}
                        cpuHalted={halted}
                        clockPaused={clockPaused}
                        clockCycle={clockCycle}
                    />
                ))}
            </div>
        </div>
    );
};


const Registers: React.FC<{ coreIdx: number, coreHalted: boolean, cpuHalted: boolean, paused: boolean, clockPaused: boolean, clockCycle: number, coreCycle: number, registers: Map<string, u8 | u16> }> = (props) => {
    const { coreIdx, coreHalted, cpuHalted, paused, clockPaused, clockCycle, coreCycle, registers } = props;

    return (
        <div className={`p-2 rounded bg-background-light-2xl`}>
            <h3 className="bg-background-light-xl mb-1 px-2 py-1 rounded">Registers Core #{coreIdx}</h3>

            <div className="grid grid-cols-2 space-x-2 space-y-2">
                {Array.from(registers.entries()).map(([reg, value]) => (
                    <div
                        key={reg}
                        className={`flex w-full h-full border justify-between px-2 pt-2 rounded ${(reg === "PC")
                            ? "bg-blue-900/50"
                            : (reg === "A" && coreHalted)
                                ? "bg-green-900/50 border border-green-500"
                                : "bg-slate-900/50"
                            }`}
                    >
                        <span className="text-cyan-400">{reg}:</span>
                        <span className="text-green-400 ps-2 min-w-24 text-right">
                            {reg !== "FLAGS" && (
                                <>
                                    {value} (0x{value.toString(16).padStart(
                                        (reg === "PC" || reg === "SP" ? 4 : 2),  // 4 digits pour PC/SP, 2 pour les autres
                                        "0"
                                    )})
                                </>
                            )}
                            {reg === "FLAGS" && ` [Z:${(!!(value & 0b10)) ? 1 : 0} C:${(!!(value & 0b01)) ? 1 : 0}]`}
                        </span>
                    </div>
                ))}

                <div className="flex w-full h-full justify-between px-2 pt-2 rounded bg-slate-900/50 border border-red-500/30">
                    <span className="text-red-400">Status:</span>
                    <span className={(cpuHalted || coreHalted) ? "text-red-400" : (paused ? "text-slate-400" : "text-yellow-400")}>
                        {
                            cpuHalted
                                ? "CPU HALTED"
                                : coreHalted
                                    ? "CORE HALTED"
                                    : paused
                                        ? "MANUAL"
                                        : clockPaused
                                            ? "ACTIVE"
                                            : "RUNNING"
                        }
                    </span>
                </div>
                <div className="flex w-full h-full justify-between px-2 pt-2 rounded bg-slate-900/50 border border-cyan-500/30">
                    <span className="text-cyan-400">Core Cycles:</span>
                    <span className="text-green-400">{coreCycle}</span>
                </div>
            </div>
        </div>
    );
}