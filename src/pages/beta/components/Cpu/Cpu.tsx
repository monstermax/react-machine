
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../../api/api';
import { Clock } from './Clock';

import type { u16, u8 } from '@/types/cpu.types';


export type CpuProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Cpu) => void,
}


export const Cpu: React.FC<CpuProps> = (props) => {
    const { children, onInstanceCreated } = props;

    // Core
    const [cpuInstance, setCpuInstance] = useState<cpuApi.Cpu | null>(null);
    const [clockInstance, setClockInstance] = useState<cpuApi.Clock | null>(null);

    // UI snapshot state
    const [registers, setRegisters] = useState<Map<string, u8 | u16>>(new Map(cpuApi.initialRegisters));
    const [clockCycle, setClockCycle] = useState(0);
    const [halted, setHalted] = useState(false);
    const [paused, setPaused] = useState(true);

    // UI
    const [contentVisible, setContentVisible] = useState(true);


    // Instanciate CPU
    useEffect(() => {
        const _instanciateCpu = () => {
            const cpu = new cpuApi.Cpu;
            setCpuInstance(cpu);

            // Save CPU Ref
            cpuApi.cpuRef.current = cpu;

            // Attach MemoryBus to CPU
            if (cpuApi.memoryBusRef.current) {
                cpuApi.cpuRef.current.memoryBus = cpuApi.memoryBusRef.current;
            }

            // Handle state updates
            cpu.on('state', (state) => {
                //console.log('CPU state update', state)

                if (state.clockCycle) {
                    setClockCycle(state.clockCycle)
                }
                if (state.registers) {
                    setRegisters(state.registers)
                }
                if (state.paused !== undefined) {
                    setPaused(state.paused)
                }
            })
        }

        const timer = setTimeout(_instanciateCpu, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le CPU est créé
    useEffect(() => {
        if (cpuInstance && onInstanceCreated) {
            onInstanceCreated(cpuInstance);
        }
    }, [cpuInstance, onInstanceCreated]);


    // Mount Clock - récupère l'instance du Clock depuis les enfants
    const addClock = (clockInstance: cpuApi.Clock) => {
        if (!cpuInstance) return;

        if (clockInstance && !cpuInstance.clock) {
            cpuInstance.clock = clockInstance;

            // Handle state updates
            clockInstance.on('tick', () => {
                if (cpuInstance.paused) return;
                cpuInstance.executeCycle()
            })

            //console.log('Clock monté dans CPU:', clockInstance);
        }

        setClockInstance(clockInstance);
    }


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case Clock:
                    return React.cloneElement(childElement, { onInstanceCreated: addClock });

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

        if (cpuInstance) {
            cpuInstance.executeCycle();
        }
    };


    const runLoop = () => {
        if (!cpuInstance) return;

        console.log(`runLoop cycle #${clockCycle + 1}`);

        if (cpuInstance) {
            cpuInstance.paused = ! cpuInstance.paused;
            cpuInstance.emit('state', { paused: cpuInstance.paused })
        }
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
        <div className="cpu w-96">

            {/* CPU Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">CPU</h2>

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
                        disabled={!paused}
                        onClick={() => runStep()}
                        className="bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ms-auto"
                    >
                        ⏭ Step
                    </button>

                    <button
                        onClick={() => runLoop()}
                        className={`disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ${!paused
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : "bg-green-900 hover:bg-green-700"
                            }`}
                    >
                        {paused ? "▶ Start" : "⏸ Pause"}
                    </button>
                </div>

                {/* Cycles */}
                <div className="p-2 rounded bg-background-light-2xl">
                    CPU Cycle #{clockCycle}
                </div>

                {/* CPU Children */}
                {childrenWithProps && (
                    <div className="cpu-children flex space-x-4 space-y-4">
                        {childrenWithProps}
                    </div>
                )}

                {/* Registers */}
                <Registers
                    halted={halted}
                    clockCycle={clockCycle}
                    registers={registers}
                />
            </div>
        </div>
    );
};


const Registers: React.FC<{ halted: boolean, clockCycle: number, registers: Map<string, u8 | u16> }> = (props) => {
    const { halted, clockCycle, registers } = props;

    return (
        <div className="p-2 rounded bg-background-light-2xl">
            <h3 className="bg-background-light-xl mb-1 px-2 py-1 rounded">Registers</h3>

            <div className="grid grid-cols-2 space-x-2 space-y-2">
                {Array.from(registers.entries()).map(([reg, value]) => (
                    <div
                        key={reg}
                        className={`flex w-full h-full border justify-between px-2 pt-2 rounded ${(reg === "PC")
                            ? "bg-blue-900/50"
                            : (reg === "A" && halted)
                                ? "bg-green-900/50 border border-green-500"
                                : "bg-slate-900/50"
                            }`}
                    >
                        <span className="text-cyan-400">{reg}:</span>
                        <span className="text-green-400 ps-4 min-w-24 text-right">
                            {value} (0x{value.toString(16).padStart(
                                (reg === "PC" || reg === "SP" ? 4 : 2),  // 4 digits pour PC/SP, 2 pour les autres
                                "0"
                            )})
                            {/* reg === "FLAGS" && ` [Z:${cpu.getFlag('zero') ? 1 : 0} C:${cpu.getFlag('carry') ? 1 : 0}]` */}
                        </span>
                    </div>
                ))}

                <div className="flex w-full h-full justify-between px-2 pt-2 rounded bg-slate-900/50 border border-red-500/30">
                    <span className="text-red-400">Status:</span>
                    <span className={halted ? "text-red-400" : "text-green-400"}>
                        {halted ? "HALTED" : "RUNNING"}
                    </span>
                </div>
                <div className="flex w-full h-full justify-between px-2 pt-2 rounded bg-slate-900/50 border border-cyan-500/30">
                    <span className="text-cyan-400">Clock:</span>
                    <span className="text-green-400">{clockCycle} cycles</span>
                </div>
            </div>
        </div>
    );
}