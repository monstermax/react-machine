
import React, { useCallback, useEffect, useMemo, useRef, useState, type JSXElementConstructor, type ReactNode } from 'react'

import * as cpuApi from '@/v2/api';
import { StorageDisk } from './StorageDisk/StorageDisk';
import { LedsDisplay } from './LedsDisplay/LedsDisplay';
import { compileCode, loadSourceCodeFromFile } from '@/cpus/default/asm_compiler';
import { Buzzer } from './Buzzer/Buzzer';
import { useComputer } from '../Computer/ComputerContext';

import type { u16, u8 } from '@/types/cpu.types';
import type { IoDevice } from '@/v2/types/cpu_v2.types';

//import ledTestCodeSource from '@/cpus/default/asm/os/devices/led/led.lib.test.asm?raw'


const validDeviceTypes = ['Input', 'DiskStorage', 'Display', 'Audio', 'Time', 'Random', 'Interrupt'];


export type DevicesManagerProps = {
    hidden?: boolean
    open?: boolean
    internal?: boolean
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.DevicesManager) => void,
}


export const DevicesManager: React.FC<DevicesManagerProps> = (props) => {
    const { hidden, open=true, internal, children, onInstanceCreated } = props;
    const { computerRef, devicesManagerRef } = useComputer();

    // Core
    const [devicesManagerInstance, setDevicesManagerInstance] = useState<cpuApi.DevicesManager | null>(null); // aka ioInstance

    // UI
    const [contentVisible, setContentVisible] = useState(open);
    const [mouseDownOffset, setMouseDownOffset] = useState<null | { x: number, y: number }>(null);
    const [isDivAbsolute, setIsDivAbsolute] = useState(false)
    const divRef = useRef<HTMLDivElement>(null);


    // Instanciate Devices
    useEffect(() => {
        if (!computerRef.current) return;

        if (devicesManagerInstance) {
            return;
        }

        //if (devicesManagerRef.current) {
        //    setDevicesManagerInstance(devicesManagerRef.current);
        //    return;
        //}

        const _instanciateDevices = () => {
            if (!computerRef.current) return;

            // Save Instance for UI
            const devicesManager = devicesManagerRef.current ?? computerRef.current.addDevicesManager();
            setDevicesManagerInstance(devicesManager);

            // Handle state updates
            devicesManager.on('state', (state) => {
                //console.log('DevicesManager state update', state)

            });

            if (!devicesManagerRef.current) {
                // Save DevicesManager Ref
                devicesManagerRef.current = devicesManager;

                // Emit initial state
                // TODO
            }

            //setInstanciated(true)

            //console.log(`DevicesManager Initialized`)
        }

        const timer = setTimeout(_instanciateDevices, 100);
        return () => clearTimeout(timer);
    }, [computerRef.current]);


    // Notifie le parent quand le Devices est créé
    useEffect(() => {
        if (devicesManagerInstance && onInstanceCreated) {
            onInstanceCreated(devicesManagerInstance);
        }
    }, [devicesManagerInstance, onInstanceCreated]);


    // Mount Device - récupère les instances de Device depuis les enfants
    const addDevice = useCallback((instance: IoDevice) => {
        if (!devicesManagerInstance) return;

        if (!instance.type || ! (validDeviceTypes.includes(instance.type))) {
            console.warn(`Device "${instance.name}" has invalid invalid type (${instance.type})`);
            return
        }

        //console.log('Device created:', instance)

        const device = devicesManagerInstance.getDeviceByName(instance.name);

        if (device) {
            console.warn(`Device "${instance.name}" already exist`);
            return
        }

        if (devicesManagerInstance.devices.has(instance.ioPort)) {
            const used = devicesManagerInstance.devices.get(instance.ioPort);
            console.warn(`Device "${instance.name}" wants an occuped ioPort (used by ${used?.name})`);
            return
        }

        devicesManagerInstance.devices.set(instance.ioPort, instance)
        //devicesManagerInstance.devices.set(nextDeviceIdRef.current, instance)
        //nextDeviceIdRef.current = nextDeviceIdRef.current + 1 as u8

        //setDevicesInstances(devicesManagerInstance.devices);

        // DEBUG: preload disk data_2
        if (instance.name === 'data_2') {
            loadDiskDemoProgram('data_2')
        }
    }, [devicesManagerInstance])


    const loadDiskDemoProgram = async (diskName: string) => {
        if (!devicesManagerInstance) return;

        const memoryOffset = 0x2000; // adresse mémoire où le code executable sera chargé pour etre executé
        const ledTestCodeSource = await loadSourceCodeFromFile("os/devices/led/led.lib.test.asm");
        const demoProgramCompiled = await compileCode(ledTestCodeSource, memoryOffset as u16)

        const disk = devicesManagerInstance.getDeviceByName(diskName) as cpuApi.StorageDisk | undefined
        if (!disk) return

        disk.loadRawData(demoProgramCompiled.code)
    }


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    return React.cloneElement(childElement, { onInstanceCreated: addDevice });

                    console.log(`Invalid component mounted into Devices : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
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


    if (! devicesManagerInstance) {
        return <>Loading Devices</>
    }


    return (
        <div ref={divRef} className={`devices ${internal ? "w-auto max-w-[30vw]" : "w-full"} bg-amber-900 p-1 rounded ${hidden ? "hidden" : ""}`}>

            {/* Devices Head */}
            <div className="w-full flex bg-background-light p-2 rounded">
                <h2 className="font-bold cursor-move" onMouseDown={(event) => handleMouseDown(event)}>
                    {internal && (
                        <>Internal Devices</>
                    )}

                    {!internal && (
                        <>External Devices</>
                    )}
                </h2>

                {childrenWithProps && (
                    <div className="ms-auto flex gap-2">
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

            {/* Devices Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-2 mt-2`}>

                {/* Devices Children */}
                {childrenWithProps && (
                    <div className="devices-children p-1 ps-2 grid grid-cols-1 space-x-2 space-y-2">
                        {childrenWithProps}
                    </div>
                )}

            </div>
        </div>
    );
}


export const InternalDevices = DevicesManager;
export const ExternalDevices = DevicesManager;

