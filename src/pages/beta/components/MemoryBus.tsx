import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../api/api';
import { Rom } from './Rom';
import { Ram } from './Ram';
import { Devices } from './Devices';


type MemoryBusProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.MemoryBus) => void,

}

export const MemoryBus: React.FC<MemoryBusProps> = (props) => {
    const { children, onInstanceCreated } = props;

    const [memoryBus, setMemoryBus] = useState<cpuApi.MemoryBus | null>(null);
    const [romInstance, setRomInstance] = useState<cpuApi.Rom | null>(null);
    const [ramInstance, setRamInstance] = useState<cpuApi.Ram | null>(null);
    const [devicesInstance, setDevicesInstance] = useState<cpuApi.IO | null>(null);
    const [childrenVisible, setChildrenVisible] = useState(true);


    // Instanciate MemoryBus
    useEffect(() => {
        const _instanciateMemoryBus = () => {
            const memoryBus = new cpuApi.MemoryBus;
            setMemoryBus(memoryBus);

            // Save MemoryBus Ref
            cpuApi.memoryBusRef.current = memoryBus;

            // Attach MemoryBus to CPU
            if (cpuApi.cpuRef.current) {
                cpuApi.cpuRef.current.memoryBus = cpuApi.memoryBusRef.current;
            }

            memoryBus.on('state', (state) => {
            })
        }

        const timer = setTimeout(_instanciateMemoryBus, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le MemoryBus est créé
    useEffect(() => {
        if (memoryBus && onInstanceCreated) {
            onInstanceCreated(memoryBus);
        }
    }, [memoryBus, onInstanceCreated]);


    // Mount ROM - récupère l'instance du ROM depuis les enfants
    useEffect(() => {
        if (!memoryBus) return;

        if (romInstance) {
            memoryBus.rom = romInstance;
            console.log('ROM monté dans MemoryBus:', romInstance);
        }
    }, [memoryBus, romInstance]);


    // Mount RAM - récupère l'instance du RAM depuis les enfants
    useEffect(() => {
        if (!memoryBus) return;

        if (ramInstance) {
            memoryBus.ram = ramInstance;
            console.log('RAM monté dans MemoryBus:', ramInstance);
        }
    }, [memoryBus, ramInstance]);


    // Mount Devices - récupère l'instance du Devices depuis les enfants
    useEffect(() => {
        if (!memoryBus) return;

        if (devicesInstance) {
            memoryBus.io = devicesInstance;
            console.log('Devices monté dans MemoryBus:', devicesInstance);
        }
    }, [memoryBus, devicesInstance]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case Rom:
                    return React.cloneElement(childElement, {
                        onInstanceCreated: (instance: cpuApi.Rom) => {
                            setRomInstance(instance);
                        }
                    });
                    break;
                case Ram:
                    return React.cloneElement(childElement, {
                        onInstanceCreated: (instance: cpuApi.Ram) => {
                            setRamInstance(instance);
                        }
                    });
                    break;
                case Devices:
                    return React.cloneElement(childElement, {
                        onInstanceCreated: (instance: cpuApi.IO) => {
                            setDevicesInstance(instance);
                        }
                    });
                    break;

                default:
                    console.log(`Invalid component mounted into MemoryBus : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;
            }
        }
        return child;
    });

    if (!memoryBus) {
        return <>Loading Memory Bus</>;
    }

    return (
        <div className="memory-bus">

            {/* MemoryBus Head */}
            <div className="flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Memory Bus</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* MemoryBus Content */}
            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>

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

