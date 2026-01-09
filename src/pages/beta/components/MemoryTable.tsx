
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../api/api';
import { isROM } from '@/lib/memory_map';
import { buildMemoryInstructionMap, getOpcodeName } from '@/lib/instructions';
import { U16 } from '@/lib/integers';

import type { u16, u8 } from '@/types/cpu.types';


export const MemoryTable: React.FC<{ name: string, storage: Map<u16, u8> }> = ({ name, storage }) => {
    const cpuInstance = cpuApi.cpuRef.current;

    const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set);
    const [pc, setPc] = useState<u16>(0 as u16);


    const memoryInstructionMap = (() => {
        //console.log('buildMemoryInstructionMap:', name, storage)
        return buildMemoryInstructionMap(storage);
    })();

    const sortedStorage = useMemo(() => {
        return Array.from(storage.entries()).sort((entry1, entry2) => entry1[0] - entry2[0]);
    }, [storage]);


    useEffect(() => {
        setBreakpoints(cpuInstance?.breakpoints ?? new Set);

        if (cpuInstance) {
            cpuInstance.on('state', (state) => {
                if (state.breakpoints) {
                    setBreakpoints(new Set(state.breakpoints))
                }
            });

            cpuInstance.on('state', (state) => {
                if (state.registers) {
                    setPc(state.registers.get('PC'))
                }
            });
        }
    }, [cpuInstance])


    const toggleBreakpoint = useCallback((address: number) => {
        if (!cpuInstance) return;

        if (cpuInstance.breakpoints.has(address)) {
            cpuInstance.breakpoints.delete(address);

        } else {
            cpuInstance.breakpoints.add(address);
        }

        cpuInstance.emit('state', { breakpoints: cpuInstance.breakpoints })
    }, [cpuInstance])


    return (
        <div className="space-y-2">
            {sortedStorage.map(([address, value]) => {
                const isPC = cpuInstance && (address === pc);
                const isInstruction = memoryInstructionMap.get(address) ?? false;
                const inROM = isROM(address);

                return (
                    <div key={address}>
                        <div
                            className={`flex justify-between p-2 rounded ${isPC
                                ? "bg-yellow-900/50 border-2 border-yellow-500"
                                : inROM
                                    ? "bg-blue-900/30"
                                    : "bg-slate-900/50"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    onClick={() => toggleBreakpoint(address)}
                                    className={`
                                        w-3 h-3 rounded-full cursor-pointer transition-all
                                        ${(breakpoints.has(address)) ? 'bg-red-600' : 'bg-slate-700 hover:bg-red-500/40 border border-slate-600'}
                                        ${isInstruction ? "" : "opacity-0"}
                                    `}
                                    title="Toggle breakpoint"
                                />
                                <span className="text-yellow-400">
                                    {isPC && "→ "}
                                    0x{address.toString(16).padStart(4, "0")}:
                                </span>
                            </div>
                            <span className={isInstruction ? "text-pink-400" : "text-green-400"}>
                                0x{value.toString(16).padStart(2, "0")}
                                {isInstruction && ` (${getOpcodeName(value)})`}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

