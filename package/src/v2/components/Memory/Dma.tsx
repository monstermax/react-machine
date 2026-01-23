
import React, { useCallback, useEffect, useMemo, useRef, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';
import { useComputer } from '../Computer/ComputerContext';
import { MemoryTable } from './MemoryTable';

import type { u16, u8 } from '@/types/cpu.types';
import { MEMORY_MAP } from '@/v2/lib/memory_map_16x8_bits';


export type DmaProps = {
    ioPort?: number | u8 | null;
    open?: boolean;
    hidden?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Dma) => void,
}

export const Dma: React.FC<DmaProps> = (props) => {
    const { open = false, hidden = false, ioPort = null, children, onInstanceCreated } = props;
    const { memoryBusRef } = useComputer();

    // Core
    const [dmaInstance, setDmaInstance] = useState<cpuApi.Dma | null>(null);

    // UI snapshot state

    // UI
    const [contentVisible, setContentVisible] = useState(open);
    const [mouseDownOffset, setMouseDownOffset] = useState<null | { x: number, y: number }>(null);
    const [isDivAbsolute, setIsDivAbsolute] = useState(false)
    const divRef = useRef<HTMLDivElement>(null);


    // Instanciate Dma
    useEffect(() => {
        if (!memoryBusRef.current) return;
        //if (dmaRef.current) return;
        if (memoryBusRef.current.dma) return;
        if (dmaInstance) return;

        const _instanciateDma = () => {
            if (!memoryBusRef.current) return;

            // Save Instance for UI
            const dma = memoryBusRef.current.addDma(ioPort as u8 | null);
            setDmaInstance(dma);

            // Handle state updates for UI
            dma.on('state', (state) => {
                //console.log('DMA state update', state)

            })

            // Emit initial state
            //dma.emit('state', {  })

            //setInstanciated(true)
        }

        const timer = setTimeout(_instanciateDma, 100);
        return () => clearTimeout(timer);
    }, [memoryBusRef.current]);


    // Notifie le parent quand le Dma est créé
    useEffect(() => {
        if (dmaInstance && onInstanceCreated) {
            onInstanceCreated(dmaInstance);
        }
    }, [dmaInstance, onInstanceCreated]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into Dma : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
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


    if (!dmaInstance) {
        return <>Loading DMA</>
    }


    return (
        <div ref={divRef} className={`dma w-auto ${hidden ? "hidden" : ""}`}>

            {/* Dma Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded cursor-move" onMouseDown={(event) => handleMouseDown(event)}>
                <h2 className="font-bold">Direct Memory Access</h2>

                {childrenWithProps?.length && (
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

            {/* Dma Preview */}
            <div className={`${contentVisible ? "hidden" : "flex"} flex justify-center bg-background-light-3xl p-1 min-w-[200px]`}>
                <ChipIcon />
            </div>

            {/* Dma Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1 min-w-[350px]`}>

                {/* Dma Children */}
                <div className={`flex-col space-y-1 bg-background-light-3xl p-1`}>
                    {childrenWithProps && (
                        <div className="dma-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                            {childrenWithProps}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}


const ChipIcon = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            width="100"
            height="100"
        >
            {/* Boîtier du chip */}
            <rect x="15" y="15" width="70" height="70" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />

            {/* Die/silicium interne */}
            <rect x="25" y="25" width="50" height="50" rx="2" fill="#374151" />

            {/* Pads de connexion */}
            <g fill="#d97706">
                {/* Haut */}
                <rect x="20" y="10" width="5" height="5" />
                <rect x="30" y="10" width="5" height="5" />
                <rect x="40" y="10" width="5" height="5" />
                <rect x="50" y="10" width="5" height="5" />
                <rect x="60" y="10" width="5" height="5" />
                <rect x="70" y="10" width="5" height="5" />

                {/* Bas */}
                <rect x="20" y="85" width="5" height="5" />
                <rect x="30" y="85" width="5" height="5" />
                <rect x="40" y="85" width="5" height="5" />
                <rect x="50" y="85" width="5" height="5" />
                <rect x="60" y="85" width="5" height="5" />
                <rect x="70" y="85" width="5" height="5" />

                {/* Gauche */}
                <rect x="10" y="20" width="5" height="5" />
                <rect x="10" y="30" width="5" height="5" />
                <rect x="10" y="40" width="5" height="5" />
                <rect x="10" y="50" width="5" height="5" />
                <rect x="10" y="60" width="5" height="5" />
                <rect x="10" y="70" width="5" height="5" />

                {/* Droite */}
                <rect x="85" y="20" width="5" height="5" />
                <rect x="85" y="30" width="5" height="5" />
                <rect x="85" y="40" width="5" height="5" />
                <rect x="85" y="50" width="5" height="5" />
                <rect x="85" y="60" width="5" height="5" />
                <rect x="85" y="70" width="5" height="5" />
            </g>

            {/* Marquage/repere */}
            <circle cx="18" cy="18" r="2" fill="#fbbf24" />

            {/* Circuits internes stylisés */}
            <g stroke="#60a5fa" strokeWidth="0.5" fill="none">
                <path d="M30,35 L45,35 L45,50 L60,50" />
                <path d="M40,40 L40,60 L55,60" />
                <path d="M50,30 L50,45 L65,45" />
            </g>

            {/* Étiquette */}
            <text x="50" y="50" textAnchor="middle" fontSize="8" fill="#f3f4f6" fontFamily="monospace">
                µC
            </text>
        </svg>
    );
};
