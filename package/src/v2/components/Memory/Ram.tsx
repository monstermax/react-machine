import React, { useCallback, useEffect, useMemo, useRef, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';
import { compileFile } from '@/v2/cpus/default/compiler_v1/asm_compiler';
import { MEMORY_MAP } from '@/v2/lib/memory_map_16x8_bits';
import { U16 } from '@/v2/lib/integers';
import { os_list } from '@/v2/cpus/default/programs_example/mini_os';
import { programs } from '@/v2/cpus/default/programs_example/programs_index';
import { MemoryTable } from './MemoryTable';
import { useComputer } from '../Computer/ComputerContext';

import type { CompiledCode, OsInfo, ProgramInfo, u16, u8 } from '@/types/cpu.types';


export type RamProps = {
    data?: Map<u16, u8> | [u16, u8][];
    size?: number;
    open?: boolean;
    hidden?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Ram) => void,
}

export const Ram: React.FC<RamProps> = (props) => {
    const { data, open = false, hidden = false, size: maxSize = 1 + MEMORY_MAP.RAM_END - MEMORY_MAP.RAM_START, children, onInstanceCreated } = props;
    const { memoryBusRef } = useComputer();

    // Core
    const [ramInstance, setRamInstance] = useState<cpuApi.Ram | null>(null);

    // UI snapshot state
    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);

    // UI
    const [contentVisible, setContentVisible] = useState(open);
    const [mouseDownOffset, setMouseDownOffset] = useState<null | { x: number, y: number }>(null);
    const [isDivAbsolute, setIsDivAbsolute] = useState(false)
    const divRef = useRef<HTMLDivElement>(null);


    // Instanciate Ram
    useEffect(() => {
        if (!memoryBusRef.current) return;
        //if (ramRef.current) return;
        if (memoryBusRef.current.ram) return;
        if (ramInstance) return;

        const _instanciateRam = () => {
            if (!memoryBusRef.current) return;

            // Save Instance for UI
            const ram = memoryBusRef.current.addRam(data, maxSize);
            setRamInstance(ram);

            // Handle state updates for UI
            ram.on('state', (state) => {
                //console.log('RAM state update', state)

                if (state.storage) {
                    setStorage(new Map(state.storage))
                }
            })

            // Emit initial state
            ram.emit('state', { storage: new Map(ram.storage) })

            //setInstanciated(true)
        }

        const timer = setTimeout(_instanciateRam, 100);
        return () => clearTimeout(timer);
    }, [memoryBusRef.current]);


    // Notifie le parent quand le Ram est créé
    useEffect(() => {
        if (ramInstance && onInstanceCreated) {
            onInstanceCreated(ramInstance);
        }
    }, [ramInstance, onInstanceCreated]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into Ram : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;

            }
        }
        return child;
    });


    const loadOsInRam = async (osName: string) => {
        if (!memoryBusRef.current) return;

        if (!memoryBusRef.current.dma) {
            console.warn(`Cannot load program in RAM. DMA not loaded.`);
            return;
        }

        const computerInstance = memoryBusRef.current.motherboard.computer
        if (!computerInstance) return;

        const osCode: CompiledCode | null = await computerInstance.loadOsCode(osName);
        const memoryOffset = MEMORY_MAP.OS_START;
        await memoryBusRef.current.dma.loadCodeInRam(osCode, memoryOffset);
    }


    const loadProgramInRam = async (programName: string) => {
        if (!memoryBusRef.current) return;

        if (!memoryBusRef.current.dma) {
            console.warn(`Cannot load program in RAM. DMA not loaded.`);
            return;
        }

        const computerInstance = memoryBusRef.current.motherboard.computer
        if (!computerInstance) return;

        const programCode: CompiledCode | null = await computerInstance.loadProgramCode(programName);
        const memoryOffset = MEMORY_MAP.PROGRAM_START;
        await memoryBusRef.current.dma.loadCodeInRam(programCode, memoryOffset);
    }


    // Handle Absolute Position + Draggable
    useEffect(() => {
        if (!divRef.current) return;

        if (mouseDownOffset) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)

            //divRef.current.style.position = 'absolute';
            //setIsDivAbsolute(true)

            return () => {
                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('mouseup', handleMouseUp)
            }

        } else {
            //setDivStatic();
        }
    }, [mouseDownOffset])

    const setDivStatic = () => {
        if (!divRef.current) return;
        divRef.current.style.position = 'static';
        setIsDivAbsolute(false)
    }

    const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
        if (!divRef.current) return;
        if (event.button !== 0) return;
        const rect = divRef.current.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        setMouseDownOffset({ x: offsetX, y: offsetY })
        document.body.classList.add('select-none');
    }

    const handleMouseUp = () => {
        if (!divRef.current) return;
        setMouseDownOffset(null)
        document.body.classList.remove('select-none');
    }

    const handleMouseMove = (event: MouseEvent) => {
        if (divRef.current && mouseDownOffset) {
            const newX = event.pageX - mouseDownOffset.x;
            const newY = event.pageY - mouseDownOffset.y;

            const diffX = Math.abs(newX - parseInt(divRef.current.style.left));
            const diffY = Math.abs(newY - parseInt(divRef.current.style.top));
            //console.log({diffX, diffY})

            if (diffX < 5 && diffY < 5) return;

            if (!isDivAbsolute) {
                divRef.current.style.position = 'absolute';
                setIsDivAbsolute(true)
            }

            divRef.current.style.left = newX + 'px';
            divRef.current.style.top = newY + 'px';
        }
    }


    if (!ramInstance) {
        return <>Loading RAM</>
    }


    return (
        <div ref={divRef} className={`ram w-auto bg-cyan-900 p-1 rounded ${hidden ? "hidden" : ""}`}>

            {/* RAM Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold cursor-move" onMouseDown={(event) => handleMouseDown(event)}>RAM</h2>

                {true && (
                    <div className="ms-auto ">
                        {isDivAbsolute && (
                            <button
                                className="cursor-pointer px-3 bg-background-light-xl rounded"
                                onClick={() => setDivStatic()}
                            >
                                ⤴
                            </button>
                        )}

                        <button
                            className="cursor-pointer px-3 bg-background-light-xl rounded"
                            onClick={() => setContentVisible(b => !b)}
                        >
                            {contentVisible ? "-" : "+"}
                        </button>
                    </div>
                )}
            </div>

            {/* RAM Preview */}
            <div className={`${contentVisible ? "hidden" : "flex"} flex justify-center p-1 min-w-[200px]`}>
                <RAMIcon />
            </div>

            {/* RAM Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-1 p-1 min-w-[350px]`}>

                {/* Storage */}
                <div className="p-2 rounded bg-background-light-2xl">
                    <div className="flex justify-between items-center">
                        <h3>RAM Storage</h3>

                        <div className="text-xs text-slate-400 mb-2">
                            Total: {storage.size} bytes
                        </div>
                    </div>

                    <MemoryTable name="ram" storage={storage} />
                </div>

                {/* Buttons */}
                <div className="p-2 rounded bg-background-light-2xl flex gap-2">
                    <button
                        onClick={() => loadOsInRam('MINI_OS_V1')}
                        className="bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                    >
                        Load OS v1
                    </button>

                    <button
                        onClick={() => loadProgramInRam('leds_test_2')}
                        className="bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ms-auto"
                    >
                        Load LEDs
                    </button>
                </div>

                {/* RAM Children */}
                <div className={`flex-col space-y-1 bg-background-light-3xl p-1`}>
                    {childrenWithProps && (
                        <div className="ram-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                            {childrenWithProps}
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}


export const RAMIcon = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 160 60"
            width="160"
            height="60"
        >
            {/* Corps principal de la barrette RAM (longue et fine) */}
            <path
                d="M10,10 L150,10 L150,50 L10,50 Z M95,0 Z"
                fill="#2563eb"
                stroke="#1d4ed8"
                strokeWidth="1"
            />

            {/* Pins sur le côté long inférieur */}
            <g fill="#ca8a04">
                <path d="M15,50 L20,50 L20,60 L15,60 Z" />
                <path d="M30,50 L35,50 L35,60 L30,60 Z" />
                <path d="M45,50 L50,50 L50,60 L45,60 Z" />
                <path d="M60,50 L65,50 L65,60 L60,60 Z" />
                <path d="M75,50 L80,50 L80,60 L75,60 Z" />
                <path d="M90,50 L95,50 L95,60 L90,60 Z" />
                <path d="M105,50 L110,50 L110,60 L105,60 Z" />
                <path d="M120,50 L125,50 L125,60 L120,60 Z" />
                <path d="M135,50 L140,50 L140,60 L135,60 Z" />
            </g>

            {/* Puces mémoire simplifiées */}
            <g fill="#1e293b">
                <path d="M20,15 L40,15 L40,25 L20,25 Z" />
                <path d="M50,15 L70,15 L70,25 L50,25 Z" />
                <path d="M80,15 L100,15 L100,25 L80,25 Z" />
                <path d="M110,15 L130,15 L130,25 L110,25 Z" />
                <path d="M20,35 L40,35 L40,45 L20,45 Z" />
                <path d="M50,35 L70,35 L70,45 L50,45 Z" />
                <path d="M80,35 L100,35 L100,45 L80,45 Z" />
                <path d="M110,35 L130,35 L130,45 L110,45 Z" />
            </g>
        </svg>
    );
};


