
import React, { useCallback, useEffect, useState, type JSXElementConstructor } from 'react';

import * as cpuApi from '@/v2/api';
import { useComputer } from './ComputerContext';
import { Cpu } from '../Cpu/Cpu';
import { MemoryBus } from '../Memory/MemoryBus';
import { Clock } from '../Cpu/Clock';
import { DevicesManager } from '../Devices/DevicesManager';


export type MotherboardProps = {
    hidden?: boolean,
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Motherboard) => void,
}


export const Motherboard: React.FC<MotherboardProps> = (props) => {
    const { hidden, children, onInstanceCreated } = props;
    const { computerRef, motherboardRef } = useComputer()

    // Core
    const [motherboardInstance, setMotherBoardInstance] = useState<cpuApi.Motherboard | null>(null);

    // Core Children
    const [cpuInstances, setCpuInstances] = useState<Map<number, cpuApi.Cpu>>(new Map);
    const [memoryBusInstance, setMemoryBusInstance] = useState<cpuApi.MemoryBus | null>(null);
    const [devicesManagerInstance, setDevicesManagerInstance] = useState<cpuApi.DevicesManager | null>(null);
    const [clockInstance, setClockInstance] = useState<cpuApi.Clock | null>(null);

    // UI
    const [contentVisible, setContentVisible] = useState(true);


    // Instanciate MotherBoard
    useEffect(() => {
        if (!computerRef) return;

        if (motherboardRef.current) {
            setMotherBoardInstance(motherboardRef.current);
            return;
        }

        const _instanciateMotherBoard = () => {
            if (!computerRef.current) return;

            // Init Instance
            const motherBoardInstance = computerRef.current.addMotherboard();

            // Save Instance for UI
            setMotherBoardInstance(motherBoardInstance);

            // Save MotherBoard Ref
            motherboardRef.current = motherBoardInstance;

            // Handle state updates for UI
            motherBoardInstance.on('state', (state) => {
                //console.log('MotherBoard state update', state)

            });

            //setInstanciated(true)
        }

        const timer = setTimeout(_instanciateMotherBoard, 100);
        return () => clearTimeout(timer);
    }, [computerRef.current]);


    // Notifie le parent quand le MotherBoard est créé
    useEffect(() => {
        if (motherboardInstance && onInstanceCreated) {
            onInstanceCreated(motherboardInstance);
        }
    }, [motherboardInstance, onInstanceCreated]);


    const addCpu = (cpuInstance: cpuApi.Cpu, cpuIndex=0) => {
        if (!motherboardInstance) return;
        if (cpuInstances.get(cpuInstance.idx)) return;

        setCpuInstances(old => new Map(old).set(cpuInstance.idx, cpuInstance))
    }


    const addClock = (clock: cpuApi.Clock) => {
        if (!motherboardInstance) return;
        if (clockInstance) return;

        //console.log(`Clock montée dans Motherboard:`, clock);

        setClockInstance(clock);
    }


    const addMemoryBus = (memoryBus: cpuApi.MemoryBus) => {
        if (!motherboardInstance) return;
        if (memoryBusInstance) return;

        setMemoryBusInstance(memoryBus);
    }


    const addDevicesManager = (devicesManager: cpuApi.DevicesManager) => {
        if (!motherboardInstance) return;
        if (devicesManagerInstance) return;

        setDevicesManagerInstance(devicesManager);
    }


    const childrenWithProps = React.Children.map(children, (child, childIdx) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case Cpu:
                    return React.cloneElement(childElement, { onInstanceCreated: (cpuInstance: cpuApi.Cpu) => addCpu(cpuInstance, childIdx) });

                case Clock:
                    return React.cloneElement(childElement, { onInstanceCreated: addClock });

                case MemoryBus:
                    return React.cloneElement(childElement, { onInstanceCreated: addMemoryBus });

                case DevicesManager:
                    return React.cloneElement(childElement, { onInstanceCreated: addDevicesManager });

                default:
                    console.log(`Invalid component mounted into Motherboard : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
            }
        }
        return child;
    });


    return (
        <div className={`motherboard w-auto ${hidden ? "hidden" : ""}`}>
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
                    <div className="motherboard-children bg-background-light-2xl p-1 flex space-x-1 space-y-1">
                        {childrenWithProps}
                    </div>
                )}

            </div>
        </div>
    );
}

