
import React, { useCallback, useEffect, useState, type JSXElementConstructor } from 'react';

import * as cpuApi from '@/v2/api';
import { useComputer } from './ComputerContext';
import { Cpu, CpuIcon } from '../Cpu/Cpu';
import { MemoryBus } from '../Memory/MemoryBus';
import { Clock, ClockIcon } from '../Cpu/Clock';
import { DevicesManager } from '../Devices/DevicesManager';
import { Ram, RAMIcon } from '../Memory/Ram';
import { PowerSupply } from './PowerSupply';


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
    const [powerSupplyInstance, setPowerSupplyInstance] = useState<cpuApi.PowerSupply | null>(null);

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


    const addPowerSupply = (powerSupply: cpuApi.PowerSupply) => {
        if (powerSupplyInstance) return;

        // Save Instance
        setPowerSupplyInstance(powerSupply);

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


    const childrenWithPropsPowerSupply: React.ReactElement<any, string | React.JSXElementConstructor<any>>[] = []
    const childrenWithPropsCpu: React.ReactElement<any, string | React.JSXElementConstructor<any>>[] = []
    const childrenWithPropsClock: React.ReactElement<any, string | React.JSXElementConstructor<any>>[] = []
    const childrenWithPropsMemoryBus: React.ReactElement<any, string | React.JSXElementConstructor<any>>[] = []
    const childrenWithPropsDevicesManager: React.ReactElement<any, string | React.JSXElementConstructor<any>>[] = []

    const childrenWithProps = React.Children.map(children, (child, childIdx) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                case PowerSupply: {
                    //return React.cloneElement(childElement, { onInstanceCreated: addPowerSupply });
                    const key = `${childElement.type.name}-${childIdx}`;
                    const element = React.cloneElement(childElement, { onInstanceCreated: addPowerSupply, key });
                    childrenWithPropsPowerSupply.push(element);
                    return null;
                }

                case Cpu: {
                    //return React.cloneElement(childElement, { onInstanceCreated: (cpuInstance: cpuApi.Cpu) => addCpu(cpuInstance, childIdx) });
                    const key = `${childElement.type.name}-${childIdx}`;
                    const element = React.cloneElement(childElement, { onInstanceCreated: addCpu, key });
                    childrenWithPropsCpu.push(element);
                    return null;
                }

                case Clock: {
                    //return React.cloneElement(childElement, { onInstanceCreated: addClock });
                    const key = `${childElement.type.name}-${childIdx}`;
                    const element = React.cloneElement(childElement, { onInstanceCreated: addClock, key });
                    childrenWithPropsClock.push(element);
                    return null;
                }

                case MemoryBus: {
                    //return React.cloneElement(childElement, { onInstanceCreated: addMemoryBus });
                    const key = `${childElement.type.name}-${childIdx}`;
                    const element = React.cloneElement(childElement, { onInstanceCreated: addMemoryBus, key });
                    childrenWithPropsMemoryBus.push(element);
                    return null;
                }

                case DevicesManager: {
                    //return React.cloneElement(childElement, { onInstanceCreated: addDevicesManager });
                    const key = `${childElement.type.name}-${childIdx}`;
                    const element = React.cloneElement(childElement, { onInstanceCreated: addDevicesManager, key, internal: true });
                    childrenWithPropsDevicesManager.push(element);
                    return null;
                }

                default:
                    console.log(`Invalid component mounted into Motherboard : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
            }
        }
        return child;
    });


    return (
        <div className={`motherboard w-auto bg-lime-900 p-1 ${hidden ? "hidden" : ""}`}>
            {/* Motherboard Head */}
            <div className="flex bg-background-light p-2 rounded">
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
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-2 mt-2`}>

                {/* Motherboard Children */}
                <div className="motherboard-children flex space-x-1 space-y-1">

                    {/* Motherboard Known Children */}
                    <div className="motherboard-known-children grid grid-cols-3 w-full space-x-4">

                        <div className="motherboard-cpu-and-clock space-y-4">

                            {/* PowerSupply */}
                            <div className="computer-power-supply">
                                {childrenWithPropsPowerSupply.length > 0 && (
                                    <>
                                        {childrenWithPropsPowerSupply}
                                    </>
                                )}

                                {childrenWithPropsPowerSupply.length === 0 && (
                                    <>
                                        <div className="bg-background-light-2xl m-auto w-96 h-32 border border-dashed border-foreground-light-xl flex flex-col justify-center items-center">
                                            <i>Insert <strong>Power Supply</strong> here</i>
                                            <pre className="m-2">{`<PowerSupply />`}</pre>
                                            {/* <PowerSupplyIcon /> */}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Clock */}
                            <div className="motherboard-clock">
                                {childrenWithPropsClock.length > 0 && (
                                    <>
                                        {childrenWithPropsClock}
                                    </>
                                )}

                                {childrenWithPropsClock.length === 0 && (
                                    <>
                                        <div className="bg-background-light-2xl m-auto w-96 h-48 border border-dashed border-foreground-light-xl flex flex-col justify-center items-center">
                                            <i>Insert <strong>Clock</strong> here</i>
                                        <pre className="m-2">{`<Clock />`}</pre>
                                            <ClockIcon />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Cpu */}
                            <div className="motherboard-cpu">

                                {/* Cpu OK */}
                                {childrenWithPropsCpu.length > 0 && (
                                    <div className="min-w-96 min-h-[200px] h-full justify-center flex flex-col gap-4">
                                        {childrenWithPropsCpu}
                                    </div>
                                )}

                                {/* Cpu Not Found */}
                                {childrenWithPropsCpu.length === 0 && (
                                    <>
                                        <div className="bg-background-light-2xl m-auto w-96 h-full min-h-96 flex flex-col justify-center border border-foreground-light-xl items-center border-dashed">
                                            <i>Insert <strong>CPU</strong> here</i>
                                        <pre className="m-2">{`<Cpu />`}</pre>
                                            <CpuIcon />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* MemoryBus */}
                        <div className="motherboard-memorybus">
                            {childrenWithPropsMemoryBus.length > 0 && (
                                <>
                                    {childrenWithPropsMemoryBus}
                                </>
                            )}

                            {childrenWithPropsMemoryBus.length === 0 && (
                                <>
                                    <div className="bg-background-light-2xl w-96 h-[600px] border border-dashed border-foreground-light-xl flex flex-col justify-center items-center">
                                        <i>Insert <strong>Memory</strong> here</i>
                                        <pre className="m-2">{`<Memory />`}</pre>
                                        <RAMIcon />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* DevicesManager */}
                        <div className="motherboard-device-manager max-w-[30vw]">
                            {childrenWithPropsDevicesManager.length > 0 && (
                                <>
                                    {childrenWithPropsDevicesManager}
                                </>
                            )}

                            {childrenWithPropsDevicesManager.length === 0 && (
                                <>
                                    <div className="bg-background-light-2xl w-96 h-[600px] border border-dashed border-foreground-light-xl flex flex-col justify-center items-center">
                                        <i>Insert <strong>Internal Devices</strong> here</i>
                                        <pre className="m-2">{`<InternalDevices />`}</pre>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Motherboard Other Children */}
                    {childrenWithProps && (
                        <div className="motherboard-other-children">
                            {childrenWithProps}
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}

