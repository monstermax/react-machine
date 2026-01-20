
import React, { useCallback, useEffect, useMemo, useRef, useState, type JSXElementConstructor, type MouseEvent } from 'react'

import * as cpuApi from '@/v2/api';
import { Rom } from './Rom';
import { Ram } from './Ram';
import { DevicesManager } from '../Devices/DevicesManager';
import { useComputer } from '../Computer/ComputerContext';


type MemoryBusProps = {
    hidden?: boolean
    open?: boolean
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.MemoryBus) => void,

}

export const MemoryBus: React.FC<MemoryBusProps> = (props) => {
    const { hidden, open=true, children, onInstanceCreated } = props;
    const { motherboardRef, memoryBusRef } = useComputer();

    // Core
    const [memoryBusInstance, setMemoryBusInstance] = useState<cpuApi.MemoryBus | null>(null);

    // Core Children
    const [romInstance, setRomInstance] = useState<cpuApi.Rom | null>(null);
    const [ramInstance, setRamInstance] = useState<cpuApi.Ram | null>(null);

    // UI
    const [contentVisible, setContentVisible] = useState(open);
    const [mouseDownOffset, setMouseDownOffset] = useState<null | { x: number, y: number }>(null);
    const [isDivAbsolute, setIsDivAbsolute] = useState(true)
    const divRef = useRef<HTMLDivElement>(null);


    // Instanciate MemoryBus
    useEffect(() => {
        if (!motherboardRef.current) return;

        if (memoryBusRef.current) {
            setMemoryBusInstance(memoryBusRef.current);
            return;
        }

        const _instanciateMemoryBus = () => {
            if (!motherboardRef.current) return;

            // Save Instance for UI
            const memoryBusInstance = motherboardRef.current.addMemoryBus();
            setMemoryBusInstance(memoryBusInstance);

            // Save MemoryBus Ref
            memoryBusRef.current = memoryBusInstance;

            // Handle state updates for UI
            memoryBusInstance.on('state', (state) => {
                console.log('MemoryBus state update', state)

            })

            // Emit initial state
            // TODO

            //setInstanciated(true)

            //console.log(`MemoryBus Initialized`)
        }

        const timer = setTimeout(_instanciateMemoryBus, 100);
        return () => clearTimeout(timer);
    }, [motherboardRef.current]);


    // Notifie le parent quand le MemoryBus est créé
    useEffect(() => {
        if (memoryBusInstance && onInstanceCreated) {
            onInstanceCreated(memoryBusInstance);
        }
    }, [memoryBusInstance, onInstanceCreated]);


    const addRom = (romInstance: cpuApi.Rom) => {
        if (!memoryBusInstance) return;

//        if (romInstance && !memoryBusInstance.rom) {
//            memoryBusInstance.rom = romInstance;
//            //console.log('ROM monté dans MemoryBus:', romInstance);
//        }

        setRomInstance(romInstance);
    }


    const addRam = (ramInstance: cpuApi.Ram) => {
        if (!memoryBusInstance) return;

//        if (ramInstance && !memoryBusInstance.ram) {
//            memoryBusInstance.ram = ramInstance;
//            //console.log('RAM monté dans MemoryBus:', ramInstance);
//        }

        setRamInstance(ramInstance)
    }


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case Rom:
                    return React.cloneElement(childElement, { onInstanceCreated: addRom });

                case Ram:
                    return React.cloneElement(childElement, { onInstanceCreated: addRam });

                default:
                    console.log(`Invalid component mounted into MemoryBus :`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
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

            divRef.current.style.position = 'absolute';
            setIsDivAbsolute(true)

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

    const handleMouseDown = (event: MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!divRef.current) return;
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
            divRef.current.style.left = (event.pageX - mouseDownOffset.x) + 'px';
            divRef.current.style.top = (event.pageY - mouseDownOffset.y) + 'px';
        }
    }

    if (!memoryBusInstance) {
        return <>Loading Memory</>;
    }

    return (
        <div ref={divRef} className={`memory-bus w-auto ${hidden ? "hidden" : ""}`}>

            {/* MemoryBus Head */}
            <div className="flex bg-background-light-xl p-2 rounded cursor-move" onMouseDown={(event) => handleMouseDown(event)}>
                <h2 className="font-bold">Memory</h2>

                {childrenWithProps && (
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

            {/* MemoryBus Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-2 bg-background-light-3xl p-1`}>

                {/* MemoryBus Children */}
                {childrenWithProps && (
                    <div className="memory-bus-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                        {childrenWithProps}
                    </div>
                )}

            </div>
        </div>
    );
}


export const Memory = MemoryBus;

