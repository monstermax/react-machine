
import React, { useEffect, useState, type JSXElementConstructor } from 'react';

import * as cpuApi from '../../api/api';
import { useComputer } from './ComputerContext';
import { Cpu } from '../Cpu/Cpu';
import { MemoryBus } from '../Memory/MemoryBus';


export type MotherboardProps = {
    hidden?: boolean,
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Motherboard) => void,
}


export const Motherboard: React.FC<MotherboardProps> = (props) => {
    const { hidden, children, onInstanceCreated } = props;
    const { computerRef, motherboardRef: motherBoardRef } = useComputer()

    // Core
    const [motherboardInstance, setMotherBoardInstance] = useState<cpuApi.Motherboard | null>(null);

    // Core Children
    const [cpuInstance, setCpuInstance] = useState<cpuApi.Cpu | null>(null);
    const [memoryBusInstance, setMemoryBusInstance] = useState<cpuApi.MemoryBus | null>(null);

    // Core Dependencies
    const computerInstance = computerRef.current;

    // UI
    const [contentVisible, setContentVisible] = useState(true);


    // Instanciate MotherBoard
    useEffect(() => {
        if (!computerRef) return;

        if (motherBoardRef.current) {
            setMotherBoardInstance(motherBoardRef.current);
            return;
        }

        const _instanciateMotherBoard = () => {
            const motherBoardInstance = new cpuApi.Motherboard;
            setMotherBoardInstance(motherBoardInstance);

            // Save MotherBoard Ref
            motherBoardRef.current = motherBoardInstance;

            // Attach Motherboard to Computer
            if (computerInstance && !computerInstance.motherboard) {
                computerInstance.motherboard = motherboardInstance;
                //console.log('Motherboard monté dans Computer:', motherboardInstance);
            }

            // Handle state updates
            motherBoardInstance.on('state', (state) => {
                //console.log('MotherBoard state update', state)

            });

            //setInstanciated(true)
        }

        const timer = setTimeout(_instanciateMotherBoard, 100);
        return () => clearTimeout(timer);
    }, [computerRef]);


    // Notifie le parent quand le MotherBoard est créé
    useEffect(() => {
        if (motherboardInstance && onInstanceCreated) {
            onInstanceCreated(motherboardInstance);
        }
    }, [motherboardInstance, onInstanceCreated]);


    const addCpu = (cpuInstance: cpuApi.Cpu) => {
        if (!motherboardInstance) return;

        if (cpuInstance && !motherboardInstance.cpu) {
            motherboardInstance.cpu = cpuInstance;
            //console.log('CPU monté dans Motherboard:', cpuInstance);
        }

        setCpuInstance(cpuInstance);
    }


    const addMemoryBus = (memoryBusInstance: cpuApi.MemoryBus) => {
        if (!motherboardInstance) return;

        if (memoryBusInstance && !motherboardInstance.memoryBus) {
            motherboardInstance.memoryBus = memoryBusInstance;
            //console.log('MemoryBus monté dans Motherboard:', memoryBusInstance);
        }

        setMemoryBusInstance(memoryBusInstance);
    }


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case Cpu:
                    return React.cloneElement(childElement, { onInstanceCreated: addCpu });

                case MemoryBus:
                    return React.cloneElement(childElement, { onInstanceCreated: addMemoryBus });

                default:
                    console.log(`Invalid component mounted into Motherboard : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
            }
        }
        return child;
    });


    return (
        <div className={`motherboard min-w-48 grow ${hidden ? "hidden" : ""}`}>
            {/* Motherboard Head */}
            <div className="flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Motherboard</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setContentVisible(b => !b)}
                    >
                        {contentVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* Motherboard Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-2 bg-background-light-3xl p-1`}>

                {/* Motherboard Children */}
                {childrenWithProps && (
                    <div className="motherboard-children bg-background-light-2xl p-1 ps-2 flex space-x-1 space-y-1">
                        {childrenWithProps}
                    </div>
                )}

            </div>
        </div>
    );
}

