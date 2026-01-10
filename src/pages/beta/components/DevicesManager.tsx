import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../api/api';
import { StorageDisk } from './StorageDisk';
import { LedsDisplay } from './LedsDisplay';
import { compileCode } from '@/lib/compiler';

import type { Device, u16, u8 } from '@/types/cpu.types';

import ledTestCodeSource from '@/programs/asm/devices/led/led_test.asm?raw'


export type DevicesManagerProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.DevicesManager) => void,
}


export const DevicesManager: React.FC<DevicesManagerProps> = (props) => {
    const { children, onInstanceCreated } = props;

    const [devicesManagerInstance, setDevicesManagerInstance] = useState<cpuApi.DevicesManager | null>(null); // aka ioInstance

    //const [devicesInstances, setDevicesInstances] = useState<Map<string, cpuApi.StorageDisk> | null>(null);

    const [childrenVisible, setChildrenVisible] = useState(true);


    // Instanciate Devices
    useEffect(() => {
        const _instanciateDevices = () => {
            const devices = new cpuApi.DevicesManager;
            setDevicesManagerInstance(devices);

            // Save DevicesManager Ref
            cpuApi.devicesManagerRef.current = devices;

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


    // Mount Device - récupère l'instance du Device depuis les enfants
    const addDevice = (instance: cpuApi.StorageDisk) => {
        if (!devicesManagerInstance) return;

        //console.log('Device created:', instance)
        const deviceCount = devicesManagerInstance.devices.size as u8

        //if (!devicesManagerInstance.devices.has(instance.name)) {
            devicesManagerInstance.devices.set(deviceCount, instance)
        //}

        //setDevicesInstances(devicesManagerInstance.devices);

        if (instance.name === 'data_2') {
            loadDiskData2()
        }
    }


    const loadDiskData2 = () => {
        if (!devicesManagerInstance) return;

        const memoryOffset = 0x2000;
        const demoProgram = compileCode(ledTestCodeSource, memoryOffset as u16)

        const devices = Array.from(devicesManagerInstance.devices.values());

        const diskName = 'data_2';
        const disk = devices.find(device => device.name === diskName) as cpuApi.StorageDisk | undefined
        if (!disk) return

        disk.loadRawData(demoProgram.code)
    }


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case StorageDisk:
                    return React.cloneElement(childElement, { onInstanceCreated: addDevice });

                case LedsDisplay:
                    return React.cloneElement(childElement, { onInstanceCreated: addDevice });

                default:
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
        <div className="devices min-w-48 grow">

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


