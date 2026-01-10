import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../api/api';
import { StorageDisk } from './StorageDisk';

import type { Device, u8 } from '@/types/cpu.types';


export type DevicesProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.IO) => void,
}


export const DevicesManager: React.FC<DevicesProps> = (props) => {
    const { children, onInstanceCreated } = props;

    const [devicesManagerInstance, setDevicesManagerInstance] = useState<cpuApi.IO | null>(null); // aka ioInstance

    const [devicesInstances, setDevicesInstances] = useState<Map<string, cpuApi.StorageDisk> | null>(null);

    const [childrenVisible, setChildrenVisible] = useState(true);


    // Instanciate Devices
    useEffect(() => {
        const _instanciateDevices = () => {
            setDevicesManagerInstance(new cpuApi.IO);
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
    useEffect(() => {
        if (!devicesManagerInstance) return;

        console.log('devices detected:', devicesInstances)

        if (devicesInstances) {
            devicesInstances.forEach((d, key) => {
                if (! devicesManagerInstance.devices.has(key)) {
                    devicesManagerInstance.devices.set(key, d)
                }
            })
        }
    }, [devicesManagerInstance, devicesInstances]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case StorageDisk:
                    return React.cloneElement(childElement, {
                        onInstanceCreated: (instance: cpuApi.StorageDisk) => {
                            setDevicesInstances(devicesInstances => {
                                if (!devicesInstances) devicesInstances = new Map;
                                return devicesInstances.set(instance.name, instance)
                            });
                        }
                    });
                    break;

                default:
                    console.log(`Invalid component mounted into Devices : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;

            }
        }
        return child;
    });


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
            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>

                {/* Devices Children */}
                <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>
                    {childrenWithProps && (
                        <div className="devices-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                            {childrenWithProps}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}


