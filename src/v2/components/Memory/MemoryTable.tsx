
import React, { useCallback, useEffect, useMemo, useRef, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';
import { isROM } from '@/lib/memory_map_16x8_bits';
import { buildMemoryInstructionMap, getOpcodeName } from '@/cpus/default/cpu_instructions';
import { U16 } from '@/lib/integers';
import { useComputer } from '../Computer/ComputerContext';

import type { u16, u8 } from '@/types/cpu.types';


export const MemoryTable: React.FC<{ name: string, storage: Map<u16, u8> }> = ({ name, storage }) => {
    const { computerRef, motherboardRef } = useComputer();

    // Core
    const computerInstance = computerRef.current;
    const motherBoardInstance = motherboardRef.current;

    // UI snapshot state
    const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set);
    const [coresPc, setCoresPc] = useState<Map<string, u16>>(new Map);

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


    // CPUs Program Counter + Breakpoints
    useEffect(() => {

        if (computerInstance) {
            setBreakpoints(computerInstance.breakpoints ?? new Set);

            // CPU State updates
            computerInstance.on('state', (state) => {
                if (state.breakpoints) {
                    setBreakpoints(new Set(state.breakpoints))
                }
            });
        }

        if (motherBoardInstance) {
            for (const cpuInstance of motherBoardInstance.getCpus()) {
                if (!cpuInstance) continue;
                //console.log('init cpu', cpuInstance.idx)

                // CPU CORES State updates
                for (const core of cpuInstance.cores) {

                    core.on('state', (state) => {
                        //console.log('update', Object.keys(state))
                        const coreIdx = state.idx;

                        if (state.registers) {
                            const pc = state.registers.get('PC');

                            //delayer('core-register', (coreIdx: number) => {
                                setCoresPc(o => {
                                    const n = new Map(o);
                                    n.set(`${cpuInstance.idx}-${coreIdx}`, pc);
                                    return n;
                                })
                            //}, 100, 500, [coreIdx]);
                        }
                    });
                }
            }
        }
    }, [motherBoardInstance?.cpus]) // TODO


    // Auto-scroll vers PC quand il change
    useEffect(() => {
        const followCpuIdx = 0; // follow core #0 only
        const followCoreIdx = 0; // follow core #0 only
        const pc = coresPc.get(`${followCpuIdx}-${followCoreIdx}`) ?? 0;
        const pcElement = addressRefs.current.get(pc);

        if (followInstruction && pcElement) {
            scrollInContainer(pcElement, -200);
        }
    }, [coresPc, followInstruction]);


    const toggleBreakpoint = useCallback((address: number) => {
        if (!computerInstance) return;

        if (computerInstance.breakpoints.has(address)) {
            computerInstance.breakpoints.delete(address);

        } else {
            computerInstance.breakpoints.add(address);
        }

        computerInstance.emit('state', { breakpoints: computerInstance.breakpoints })
    }, [computerInstance])


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
                    const isPC = Array.from(coresPc.values()).includes(address);
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




const delayers: Map<string, { timer: NodeJS.Timeout | null, waiting: boolean, requestDate: number | null }> = new Map;

const delayer = (name: string, callback: (...args: any[]) => void, delay: number, maxDelay: number, args: any[]) => {
    let delayerKey = `${name}-${JSON.stringify(args)}`;
    let delayer = delayers.get(delayerKey);
    const uiFPS = 1000 / maxDelay;

    if (!delayer) {
        delayer = { timer: null, requestDate: null, waiting: false };
        //console.log('waiting: SET FALSE')
        delayers.set(delayerKey, delayer)
    }

    if (delayer.timer !== null) {
        clearTimeout(delayer.timer);
        delayer.timer = null;
    }

    if (delayer.waiting && delayer.requestDate && Date.now() - delayer.requestDate > 1000 / uiFPS) {
        console.log('delayer:', 'forced', delayer.requestDate, delayer.waiting)
        callback(...args);
        delayer.waiting = false;
        //console.log('waiting: set FALSE')

    } else {
        if (!delayer.waiting) {
            delayer.requestDate = Date.now()
            delayer.waiting = true;
            //console.log('waiting: set TRUE')
        }

        delayer.timer = setTimeout(() => {
            console.log('delayer:', 'not-forced', delayer?.requestDate, delayer.waiting)
            callback(...args);

            if (delayer) {
                delayer.waiting = false;
                //console.log('waiting: set FALSE')
            }
        }, delay);
    }
}

