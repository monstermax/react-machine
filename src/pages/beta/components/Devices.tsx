import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../lib/api';
import { StorageDisk } from './StorageDisk';


export type DevicesProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.IO) => void,
}


export const Devices: React.FC<DevicesProps> = (props) => {
    const { children, onInstanceCreated } = props;

    const [devices, setDevices] = useState<cpuApi.IO | null>(null);
    //const [devicesIo, setDevicesIo] = useState<Map<u8, Device>>();
    const [childrenVisible, setChildrenVisible] = useState(true);


    // Instanciate Devices
    useEffect(() => {
        const _instanciateDevices = () => {
            setDevices(new cpuApi.IO);
        }

        const timer = setTimeout(_instanciateDevices, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le Devices est créé
    useEffect(() => {
        if (devices && onInstanceCreated) {
            onInstanceCreated(devices);
        }
    }, [devices, onInstanceCreated]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case StorageDisk:
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
        <div className="devices">

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


