
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';
import { Rom } from './Rom';
import { Ram } from './Ram';
import { DevicesManager } from '../Devices/DevicesManager';
import { useComputer } from '../Computer/ComputerContext';


type MemoryBusProps = {
    hidden?: boolean
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.MemoryBus) => void,

}

export const MemoryBus: React.FC<MemoryBusProps> = (props) => {
    const { hidden, children, onInstanceCreated } = props;
    const { motherboardRef, devicesManagerRef, memoryBusRef } = useComputer();

    // Core
    const [memoryBusInstance, setMemoryBusInstance] = useState<cpuApi.MemoryBus | null>(null);

    // Core Children
    const [romInstance, setRomInstance] = useState<cpuApi.Rom | null>(null);
    const [ramInstance, setRamInstance] = useState<cpuApi.Ram | null>(null);

    // UI
    const [contentVisible, setContentVisible] = useState(true);


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

    if (!memoryBusInstance) {
        return <>Loading Memory</>;
    }

    return (
        <div className={`memory-bus min-w-48 grow ${hidden ? "hidden" : ""}`}>

            {/* MemoryBus Head */}
            <div className="flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Memory</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setContentVisible(b => !b)}
                    >
                        {contentVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* MemoryBus Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-2 bg-background-light-3xl p-1`}>

                {/* MemoryBus Children */}
                {childrenWithProps && (
                    <div className="memory-bus-children bg-background-light-2xl p-1 ps-2 flex space-x-1 space-y-1">
                        {childrenWithProps}
                    </div>
                )}

            </div>
        </div>
    );
}


export const Memory = MemoryBus;

