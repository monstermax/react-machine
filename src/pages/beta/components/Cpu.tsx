import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../api/api';

import type { u16, u8 } from '@/types/cpu.types';


export type CpuProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Cpu) => void,
}


export const Cpu: React.FC<CpuProps> = (props) => {
    const { children, onInstanceCreated } = props;

    const [computer, setComputer] = useState<cpuApi.Computer | null>(null);
    const [cpu, setCpu] = useState<cpuApi.Cpu | null>(null);
    const [childrenVisible, setChildrenVisible] = useState(true);

    // UI snapshot state
    const [registers, setRegisters] = useState<Map<string, u8 | u16>>(new Map(cpuApi.initialRegisters));
    const [clockCycle, setClockCycle] = useState(0);
    const [halted, setHalted] = useState(0);
    const [paused, setPaused] = useState(0);


    // Instanciate CPU
    useEffect(() => {
        const _instanciateCpu = () => {
            const cpu = new cpuApi.Cpu;
            setCpu(cpu);

            // Save CPU Ref
            cpuApi.cpuRef.current = cpu;

            // Attach MemoryBus to CPU
            if (cpuApi.memoryBusRef.current) {
                cpuApi.cpuRef.current.memoryBus = cpuApi.memoryBusRef.current;
            }

            cpu.on('state', (state) => {
                if (state.clockCycle) {
                    setClockCycle(state.clockCycle)
                }
                if (state.registers) {
                    setRegisters(state.registers)
                }
            })
        }

        const timer = setTimeout(_instanciateCpu, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le CPU est créé
    useEffect(() => {
        if (cpu && onInstanceCreated) {
            onInstanceCreated(cpu);
        }
    }, [cpu, onInstanceCreated]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into Cpu : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;
            }
        }
        return child;
    });


    const runStep = () => {
        if (!cpu) return;

        console.log(`runStep cycle #${clockCycle + 1}`);

        if (cpu) {
            cpu.executeCycle();
        }
    };


    const resetCpu = () => {
        if (!cpu) return;

        console.log('resetCpu');

        if (cpu) {
            cpu.reset();
        }
    };


    if (!cpu) {
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
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* CPU Content */}
            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>

                <div className="p-2 rounded bg-background-light-2xl flex gap-2">
                    <button
                        onClick={() => resetCpu()}
                        className="bg-red-900 hover:bg-red-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                    >
                        Reset
                    </button>

                    <button
                        onClick={() => runStep()}
                        className="bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                    >
                        Step
                    </button>
                </div>

                <div className="p-2 rounded bg-background-light-2xl">
                    cycle #{clockCycle}
                </div>

                {/* Registers */}
                <div className="p-2 rounded bg-background-light-2xl">
                    <h3>Registers</h3>

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

                {/* CPU Children */}
                {childrenWithProps && (
                    <div className="cpu-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                        {childrenWithProps}
                    </div>
                )}
            </div>
        </div>
    );
};