
import React, { useCallback, useEffect, useMemo, useRef, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';
import { useComputer } from '../Computer/ComputerContext';
import { MemoryTable } from './MemoryTable';

import type { u16, u8 } from '@/types/cpu.types';
import { MEMORY_MAP } from '@/v2/lib/memory_map_16x8_bits';


export type RomProps = {
    data?: Map<u16, u8> | [u16, u8][];
    size?: number;
    open?: boolean;
    hidden?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Rom) => void,
}

export const Rom: React.FC<RomProps> = (props) => {
    const { data, open = false, hidden = false, size: maxSize = 1 + MEMORY_MAP.ROM_END - MEMORY_MAP.ROM_START, children, onInstanceCreated } = props;
    const { memoryBusRef } = useComputer();

    // Core
    const [romInstance, setRomInstance] = useState<cpuApi.Rom | null>(null);

    // UI snapshot state
    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);

    // UI
    const [contentVisible, setContentVisible] = useState(open);
    const [mouseDownOffset, setMouseDownOffset] = useState<null | { x: number, y: number }>(null);
    const [isDivAbsolute, setIsDivAbsolute] = useState(false)
    const divRef = useRef<HTMLDivElement>(null);


    // Instanciate Rom
    useEffect(() => {
        if (!memoryBusRef.current) return;
        //if (romRef.current) return;
        if (memoryBusRef.current.rom) return;
        if (romInstance) return;

        const _instanciateRom = () => {
            if (!memoryBusRef.current) return;

            // Save Instance for UI
            const rom = memoryBusRef.current.addRom(data, maxSize);
            setRomInstance(rom);

            // Handle state updates for UI
            rom.on('state', (state) => {
                //console.log('ROM state update', state)

                if (state.storage) {
                    setStorage(new Map(state.storage))
                }
            })

            // Emit initial state
            rom.emit('state', { storage: new Map(rom.storage) })

            //setInstanciated(true)
        }

        const timer = setTimeout(_instanciateRom, 100);
        return () => clearTimeout(timer);
    }, [memoryBusRef.current]);


    // Notifie le parent quand le Rom est créé
    useEffect(() => {
        if (romInstance && onInstanceCreated) {
            onInstanceCreated(romInstance);
        }
    }, [romInstance, onInstanceCreated]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into Rom : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;

            }
        }
        return child;
    });


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
            if (!isDivAbsolute) {
                divRef.current.style.position = 'absolute';
                setIsDivAbsolute(true)
            }

            const newX = event.pageX - mouseDownOffset.x;
            const newY = event.pageY - mouseDownOffset.y;
            divRef.current.style.left = newX + 'px';
            divRef.current.style.top = newY + 'px';
        }
    }


    if (!romInstance) {
        return <>Loading ROM</>
    }


    return (
        <div ref={divRef} className={`rom w-auto bg-slate-700 p-1 rounded ${hidden ? "hidden" : ""}`}>

            {/* ROM Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold cursor-move" onMouseDown={(event) => handleMouseDown(event)}>ROM</h2>

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

            {/* ROM Preview */}
            <div className={`${contentVisible ? "hidden" : "flex"} flex justify-center p-1 min-w-[200px]`}>
                <ROMIcon />
            </div>

            {/* ROM Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-1 p-1 min-w-[350px]`}>

                {/* Storage */}
                <div className="p-2 rounded bg-background-light-2xl">
                    <div className="flex justify-between items-center">
                        <h3>ROM Storage</h3>

                        <div className="text-xs text-slate-400 mb-2">
                            Total: {storage.size} bytes
                        </div>
                    </div>

                    <MemoryTable name="rom" storage={storage} />
                </div>

                {/* ROM Children */}
                <div className={`flex-col space-y-1 bg-background-light-3xl p-1`}>
                    {childrenWithProps && (
                        <div className="rom-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                            {childrenWithProps}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}


const ROMIcon = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 120 80"
            width="120"
            height="80"
        >
            {/* Corps de l'EPROM */}
            <path d="M10,10 L110,10 L110,70 L10,70 Z M70,0 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />

            {/* Fenêtre de quartz (transparente) */}
            <rect x="40" y="15" width="40" height="20" fill="#60a5fa" opacity="0.3" stroke="#3b82f6" strokeWidth="1" />

            {/* Pins */}
            <g fill="#ca8a04">
                {/* Pin 1 (carré - repère) */}
                <path d="M5,15 L10,15 L10,20 L5,20 Z" />
                {/* Autres pins */}
                <path d="M5,25 L10,25 L10,30 L5,30 Z" />
                <path d="M5,35 L10,35 L10,40 L5,40 Z" />
                <path d="M5,45 L10,45 L10,50 L5,50 Z" />
                <path d="M5,55 L10,55 L10,60 L5,60 Z" />
                <path d="M5,65 L10,65 L10,70 L5,70 Z" />

                <path d="M110,15 L115,15 L115,20 L110,20 Z" />
                <path d="M110,25 L115,25 L115,30 L110,30 Z" />
                <path d="M110,35 L115,35 L115,40 L110,40 Z" />
                <path d="M110,45 L115,45 L115,50 L110,50 Z" />
                <path d="M110,55 L115,55 L115,60 L110,60 Z" />
                <path d="M110,65 L115,65 L115,70 L110,70 Z" />
            </g>

            {/* Étiquette */}
            <text x="60" y="50" textAnchor="middle" fontSize="8" fill="#fbbf24" fontFamily="monospace">
                EPROM
            </text>
            <text x="60" y="60" textAnchor="middle" fontSize="6" fill="#d1d5db" fontFamily="monospace">
                27C256
            </text>
        </svg>
    );
};
