
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import type { u16, u8 } from '@/types/cpu.types';


export type CpuRegistersProps = {
    coresIds: number[],
    coresHalted: Map<number, boolean>,
    coresCoreCycle: Map<number, number>
    coresRegisters: Map<number, Map<string, u8 | u16>>
    cpuHalted: boolean,
    cpuPaused: boolean,
    clockPaused: boolean,
}


export const CpuRegisters: React.FC<CpuRegistersProps> = (props) => {
    const hidden = false;

    // UI
    //const [contentVisible, setContentVisible] = useState(true);

    return (
        <div className={`w-auto rounded bg-background-light-2xl space-y-2 ${hidden ? "hidden" : ""}`}>
            {props.coresIds.map(coreIdx => (
                <CoreRegisters key={coreIdx}
                    coreIdx={coreIdx}
                    coreHalted={props.coresHalted.get(coreIdx) ?? true}
                    coreCycle={props.coresCoreCycle.get(coreIdx) ?? 0}
                    registers={props.coresRegisters.get(coreIdx) ?? new Map}
                    cpuPaused={props.cpuPaused}
                    cpuHalted={props.cpuHalted}
                    clockPaused={props.clockPaused}
                />
            ))}
        </div>
    );
}


export type CoreRegistersProps = {
    coreIdx: number,
    coreHalted: boolean,
    clockPaused: boolean,
    coreCycle: number,
    registers: Map<string, u8 | u16>,
    cpuHalted: boolean,
    cpuPaused: boolean,
    children?: React.ReactNode,
}

const CoreRegisters: React.FC<CoreRegistersProps> = (props) => {
    const { coreIdx, coreHalted, cpuHalted, cpuPaused, clockPaused, coreCycle, registers, children } = props;

    // UI
    const [contentVisible, setContentVisible] = useState(true);

    return (
        <div className={`w-full p-2 rounded bg-background-light-2xl`}>

            {/* Registers Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Registers Core #{coreIdx}</h2>

                {true && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setContentVisible(b => !b)}
                    >
                        {contentVisible ? "-" : "+"}
                    </button>
                )}
            </div>

{/* Clock Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-2 bg-background-light-3xl p-1 min-w-[200px]`}>
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
                            <span className="text-green-400 ps-2 min-w-20 text-right">
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
                        <span className={(cpuHalted || coreHalted) ? "text-red-400" : (cpuPaused ? "text-slate-400" : "text-yellow-400")}>
                            {
                                cpuHalted
                                    ? "CPU HALTED"
                                    : coreHalted
                                        ? "CORE HALTED"
                                        : cpuPaused
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

                <div>
                    {children}
                </div>
            </div>

        </div>
    );
}
