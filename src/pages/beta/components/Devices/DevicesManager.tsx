
import React, { useCallback, useEffect, useMemo, useRef, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../../api/api';
import { StorageDisk } from './StorageDisk/StorageDisk';
import { LedsDisplay } from './LedsDisplay/LedsDisplay';
import { compileCode } from '@/lib/compiler';
import { Buzzer } from './Buzzer/Buzzer';
import { useComputer } from '../Computer/Computer';

import type { Device, IoDevice, u16, u8 } from '@/types/cpu.types';

import ledTestCodeSource from '@/programs/asm/devices/led/led_test.asm?raw'


const validDeviceTypes = ['Input', 'DiskStorage', 'Display', 'Audio', 'Time', 'Random', 'Interrupt'];


export type DevicesManagerProps = {
    hidden?: boolean
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.DevicesManager) => void,
}


export const DevicesManager: React.FC<DevicesManagerProps> = (props) => {
    const { hidden, children, onInstanceCreated } = props;
    const { devicesManagerRef } = useComputer();

    // Core
    const [devicesManagerInstance, setDevicesManagerInstance] = useState<cpuApi.DevicesManager | null>(null); // aka ioInstance
    //const [devicesInstances, setDevicesInstances] = useState<Map<string, cpuApi.StorageDisk> | null>(null);

    // UI
    const [childrenVisible, setChildrenVisible] = useState(true);
    //const nextDeviceIdRef = useRef<u8>(0 as u8);


    // Instanciate Devices
    useEffect(() => {
        const _instanciateDevices = () => {
            const devices = new cpuApi.DevicesManager;
            setDevicesManagerInstance(devices);

            // Save DevicesManager Ref
            devicesManagerRef.current = devices;

            // Handle state updates
            devices.on('state', (state) => {
                //console.log('DevicesManager state update', state)

            });
        }

        const timer = setTimeout(_instanciateDevices, 100);
        return () => clearTimeout(timer);
    }, []);


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


    const loadDiskDemoProgram = (diskName: string) => {
        if (!devicesManagerInstance) return;

        const memoryOffset = 0x2000; // adresse mémoire où le code executable sera chargé pour etre executé
        const demoProgram = compileCode(ledTestCodeSource, memoryOffset as u16)

        const disk = devicesManagerInstance.getDeviceByName(diskName) as cpuApi.StorageDisk | undefined
        if (!disk) return

        disk.loadRawData(demoProgram.code)
    }


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case StorageDisk:
                case LedsDisplay:
                case Buzzer:
                    //return React.cloneElement(childElement, { onInstanceCreated: addDevice });

                default:
                    return React.cloneElement(childElement, { onInstanceCreated: addDevice });

                    console.log(`Invalid component mounted into Devices : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;

            }
        }
        return child;
    });


    if (! devicesManagerInstance) {
        return <>Loading Devices</>
    }


    return (
        <div className={`devices min-w-48 grow ${hidden ? "hidden" : ""}`}>

            {/* Devices Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Devices</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* Devices Content */}
            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-2 bg-background-light-3xl p-1`}>

                {/* Devices Children */}
                {childrenWithProps && (
                    <div className="devices-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-2">
                        {childrenWithProps}
                    </div>
                )}

            </div>
        </div>
    );
}


