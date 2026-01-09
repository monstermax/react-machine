import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../api/api';


export type StorageDiskProps = {
    name: string;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.StorageDisk) => void,
}


export const StorageDisk: React.FC<StorageDiskProps> = (props) => {
    const { name, children, onInstanceCreated } = props

    const [storageDisk, setStorageDisk] = useState<cpuApi.StorageDisk | null>(null);
    const [childrenVisible, setChildrenVisible] = useState(true);


    // Instanciate StorageDisk
    useEffect(() => {
        const _instanciateStorageDisk = () => {
            setStorageDisk(new cpuApi.StorageDisk(name));
        }

        const timer = setTimeout(_instanciateStorageDisk, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le StorageDisk est créé
    useEffect(() => {
        if (storageDisk && onInstanceCreated) {
            onInstanceCreated(storageDisk);
        }
    }, [storageDisk, onInstanceCreated]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into StorageDisk : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;

            }
        }
        return child;
    });


    return (
        <div className="storage-disk">

            {/* StorageDisk Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Storage Disk "{name}"</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* StorageDisk Content */}
            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>

                {/* StorageDisk Children */}
                <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>
                    {childrenWithProps && (
                        <div className="io-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                            {childrenWithProps}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

