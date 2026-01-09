import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../api/api';
import { MemoryBus } from './MemoryBus';
import { Cpu } from './Cpu';
import { Devices } from './Devices';


export const Computer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [computer, setComputer] = useState<cpuApi.Computer | null>(null);
    const [cpuInstance, setCpuInstance] = useState<cpuApi.Cpu | null>(null);
    const [memoryBusInstance, setMemoryBusInstance] = useState<cpuApi.MemoryBus | null>(null);
    const [devicesInstance, setDevicesInstance] = useState<cpuApi.IO | null>(null);
    const [childrenVisible, setChildrenVisible] = useState(true);


    // Instanciate Computer
    useEffect(() => {
        const _instanciateComputer = () => {
            const computer = new cpuApi.Computer;
            setComputer(computer);

            // Save Computer Ref
            cpuApi.computerRef.current = computer;
        }

        const timer = setTimeout(_instanciateComputer, 100);
        return () => clearTimeout(timer);
    }, []);


    // Mount CPU - récupère l'instance du CPU depuis les enfants
    useEffect(() => {
        if (!computer) return;

        if (cpuInstance && !computer.cpu) {
            computer.cpu = cpuInstance;
            console.log('CPU monté dans Computer:', cpuInstance);
        }
    }, [computer, cpuInstance]);


    // Mount MemoryBus - récupère l'instance du MemoryBus depuis les enfants
    useEffect(() => {
        if (!computer) return;

        if (memoryBusInstance && !computer.memoryBus) {
            computer.memoryBus = memoryBusInstance;
            console.log('MemoryBus monté dans Computer:', cpuInstance);
        }
    }, [computer, memoryBusInstance]);


    // Mount Devices - récupère l'instance du Devices depuis les enfants
    useEffect(() => {
        if (!computer?.memoryBus) return;

        if (devicesInstance && !computer.memoryBus.io) {
            computer.memoryBus.io = devicesInstance;
            console.log('Devices monté dans MemoryBus via Computer:', devicesInstance);
        }
    }, [computer, devicesInstance]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case Cpu:
                    return React.cloneElement(childElement, {
                        onInstanceCreated: (instance: cpuApi.Cpu) => {
                            setCpuInstance(instance);
                        }
                    });
                    break;

                case MemoryBus:
                    return React.cloneElement(childElement, {
                        onInstanceCreated: (instance: cpuApi.MemoryBus) => {
                            setMemoryBusInstance(instance);
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
                    console.log(`Invalid component mounted into Computer : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;
            }
        }
        return child;
    });


    if (!computer) {
        return <>Loading Computer</>;
    }

    return (
        <div className="computer bg-background-light-2xl m-2 p-1 rounded">

            {/* Computer Head */}
            <div className="w-full flex bg-background-light p-2 rounded">
                <h2 className="font-bold">Computer</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* Computer Content */}
            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>

                <div className="p-2 rounded bg-background-light-2xl flex gap-2 justify-around">
                    <div className="w-5/12 bg-background-light-xl px-2 py-1 rounded">
                        Main OS:
                    </div>
                    <div className="w-5/12 bg-background-light-xl px-2 py-1 rounded">
                        Program:
                    </div>
                </div>

                {/* Computer Children */}
                {childrenWithProps && (
                    <div className="computer-children flex space-x-4 space-y-4">
                        {childrenWithProps}
                    </div>
                )}

            </div>
        </div>
    );
};

