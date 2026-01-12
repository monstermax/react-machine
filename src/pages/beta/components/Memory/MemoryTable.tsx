
import React, { useCallback, useEffect, useMemo, useRef, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../../api/api';
import { isROM } from '@/lib/memory_map';
import { buildMemoryInstructionMap, getOpcodeName } from '@/lib/instructions';
import { U16 } from '@/lib/integers';
import { useComputer } from '../Computer/ComputerContext';

import type { u16, u8 } from '@/types/cpu.types';


export const MemoryTable: React.FC<{ name: string, storage: Map<u16, u8> }> = ({ name, storage }) => {
    const { cpuRef } = useComputer();

    // Core
    const cpuInstance = cpuRef.current;

    // UI snapshot state
    const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set);
    const [pc, setPc] = useState<u16>(0 as u16);

    // UI
    const [followInstruction, setFollowInstruction] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const addressRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    const memoryInstructionMap = (() => {
        //console.log('buildMemoryInstructionMap:', name, storage)
        return buildMemoryInstructionMap(storage);
    })();

    const sortedStorage = useMemo(() => {
        return Array.from(storage.entries()).sort((entry1, entry2) => entry1[0] - entry2[0]);
    }, [storage]);


    // Breakpoints
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


    // Auto-scroll vers PC quand il change
    useEffect(() => {
        const pcElement = addressRefs.current.get(pc);
        if (followInstruction && pcElement) {
            scrollInContainer(pcElement, -200);
        }
    }, [pc, followInstruction]);


    const toggleBreakpoint = useCallback((address: number) => {
        if (!cpuInstance) return;

        if (cpuInstance.breakpoints.has(address)) {
            cpuInstance.breakpoints.delete(address);

        } else {
            cpuInstance.breakpoints.add(address);
        }

        cpuInstance.emit('state', { breakpoints: cpuInstance.breakpoints })
    }, [cpuInstance])


    // Fonction utilitaire pour scroller dans le conteneur
    const scrollInContainer = useCallback((element: HTMLElement | null, offset = 0) => {
        const container = scrollContainerRef.current;
        if (!element || !container) return;

        const elementTop = element.offsetTop;
        const containerHeight = container.clientHeight;

        const targetScroll = elementTop - (containerHeight / 2) + offset;
        const maxScroll = container.scrollHeight - containerHeight;
        const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));

        container.scrollTo({
            top: clampedScroll,
            behavior: 'smooth'
        });
    }, []);


    return (
        <div>
            <div className="text-xs text-slate-400 mb-2">
                Total: {storage.size} bytes
            </div>

            <div
                ref={scrollContainerRef}
                className="font-mono text-sm space-y-1 h-[400px] overflow-y-auto"
            >

                {sortedStorage.map(([address, value]) => {
                    const isPC = cpuInstance && (address === pc);
                    const isInstruction = memoryInstructionMap.get(address) ?? false;
                    const inROM = isROM(address);

                    return (
                        <div key={address}>
                            <div
                                ref={(el) => { if (el) addressRefs.current.set(address, el); }}
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
                                    {isInstruction && (
                                        <>
                                            <span className="text-muted-foreground">0x{value.toString(16).padStart(2, "0")}</span>
                                            <span> {getOpcodeName(value)}</span>
                                        </>
                                    )}

                                    {!isInstruction && (
                                        <>
                                            0x{value.toString(16).padStart(2, "0")}
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-4">
                <label className="flex items-center gap-2">
                    <button
                        onClick={() => setFollowInstruction(b => !b)}
                        className="flex gap-2 bg-background-light-xl hover:bg-background-light-xs disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                    >
                        <div>Follow current Instruction</div>
                        <div>{followInstruction ? "✅" : "❌"}</div>
                    </button>
                </label>
            </div>
        </div>
    )
}

