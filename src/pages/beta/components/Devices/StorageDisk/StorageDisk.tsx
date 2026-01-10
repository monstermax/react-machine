import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../../../api/api';
import type { u16, u8 } from '@/types/cpu.types';
import { buildMemoryInstructionMap, getOpcodeName } from '@/lib/instructions';
import { U8 } from '@/lib/integers';


export type StorageDiskProps = {
    name: string;
    ioPort: number;
    persistent?: boolean;
    open?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.StorageDisk) => void,
}


export const StorageDisk: React.FC<StorageDiskProps> = (props) => {
    const { name, ioPort, persistent, open, children, onInstanceCreated } = props

    // Core
    const [storageDiskInstance, setStorageDiskInstance] = useState<cpuApi.StorageDisk | null>(null);

    // UI snapshot state
    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);

    // UI
    const [contentVisible, setContentVisible] = useState(open === undefined ? true : open);
    const [skipStorageEffect, setSkipStorageEffect] = useState(false);
    const [instanciated, setInstanciated] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [decodeInstructions, setDecodeInstructions] = useState(true);


    const sortedDiskData = useMemo(() => {
        return Array.from(storage.entries()).sort(([a], [b]) => a - b)
    }, [storageDiskInstance, storage]);


    const diskInstructionMap = useMemo(() => {
        //console.log('buildMemoryInstructionMap:', name, storage)
        return buildMemoryInstructionMap(storage);
    },
    [storageDiskInstance, storage]);


    // Instanciate StorageDisk
    useEffect(() => {
        const _instanciateStorageDisk = () => {
            if (instanciated) return;

            const disk = new cpuApi.StorageDisk(name, U8(ioPort));
            setStorageDiskInstance(disk);

            disk.on('state', (state) => {
                //console.log(`Disk ${name} state update`, state)

                if (state.storage) {
                    setStorage(new Map(state.storage))
                }
            })

            if (!persistent) {
                setLoaded(true);
            }

            //console.log(`StorageDisk "${name}" instantiated`)
            setInstanciated(true);
        }

        const timer = setTimeout(_instanciateStorageDisk, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le StorageDisk est créé
    useEffect(() => {
        if (storageDiskInstance && onInstanceCreated) {
            onInstanceCreated(storageDiskInstance);
        }
    }, [storageDiskInstance, onInstanceCreated]);


    // Load persistent storage
    useEffect(() => {
        if (!storageDiskInstance || !instanciated || !persistent || loaded) return;

        const _load = () => {
            loadFromLocalStorage()
        }

        const timer = setTimeout(_load, 500);
        return () => clearTimeout(timer);

    }, [instanciated])


    // Save persistent storage
    useEffect(() => {
        if (!storageDiskInstance || !persistent || !instanciated || !loaded) return;

        const _save = () => {
            if (skipStorageEffect) {
                setSkipStorageEffect(false)
                return;
            }

            saveToLocalStorage()
        }

        const timer = setTimeout(_save, 100);
        return () => clearTimeout(timer);
    }, [storage, instanciated])


    const loadFromLocalStorage = useCallback(() => {
        if (!storageDiskInstance || !persistent || !instanciated) return;

        const key = `disk_${name}`
        const storageArrJson = localStorage.getItem(key);

        //console.log(`Loading persistent disk ${name} storage`);

        if (storageArrJson === null || storageArrJson === undefined) {
            // No localStorage found

        } else {
            const storageArr = JSON.parse(storageArrJson) as [u16, u8][];
            setSkipStorageEffect(true);
            //setStorage(new Map(storageArr))
            storageDiskInstance.storage = new Map(storageArr)

            storageDiskInstance.emit('state', { storage: storageDiskInstance.storage })

            setLoaded(true)
        }
    }, [storageDiskInstance, persistent, instanciated])


    const saveToLocalStorage = useCallback(() => {
        if (!storageDiskInstance || !persistent || !instanciated) return;

        const key = `disk_${name}`
        const storageArrJson = JSON.stringify(Array.from(storage.entries()))

        console.log(`Saving persistent disk ${name} storage`);
        localStorage.setItem(key, storageArrJson)
    }, [name, storage, storageDiskInstance, persistent, instanciated]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into StorageDisk : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;

            }
        }
        return child;
    });


    return (
        <div className="storage-disk">

            {/* StorageDisk Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Storage Disk "{name}"</h2>

                {true && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setContentVisible(b => !b)}
                    >
                        {contentVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* StorageDisk Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>

                <>
                    <div className="font-mono text-sm space-y-1 max-h-[600px] overflow-y-auto">
                        <div className="text-xs text-slate-400 mb-2">
                            {name}: {sortedDiskData.length} bytes
                        </div>

                        {sortedDiskData.length > 0 ? (
                            sortedDiskData.map(([addr, val]) => {
                                const isInstruction = (decodeInstructions && diskInstructionMap.get(addr)) ?? false;

                                return (
                                    <div
                                        key={addr}
                                        className="flex justify-between p-2 rounded bg-slate-900/50"
                                    >
                                        <span className="text-yellow-400">
                                            0x{addr.toString(16).padStart(4, "0")}:
                                        </span>
                                        <div className="flex gap-4">
                                            {/* Afficher aussi le caractère ASCII si c'est un caractère imprimable */}
                                            {!isInstruction && val >= 32 && val <= 126 && (
                                                <span className="text-xs text-slate-400 mt-1">
                                                    '{String.fromCharCode(val)}'
                                                </span>
                                            )}

                                            <span className={`${isInstruction ? "text-pink-400" : "text-green-400"}`}>
                                                0x{val.toString(16).padStart(2, "0")}
                                                {isInstruction && ` (${getOpcodeName(val)})`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-slate-500 italic text-center py-8">
                                {name} is empty
                            </div>
                        )}
                    </div>

                    <div className="mt-2 flex gap-4 bg-background-light-2xl p-2 rounded">
                        <button
                            onClick={() => setDecodeInstructions(b => !b)}
                            className="flex gap-2 bg-background-light-xl hover:bg-background-light-xs disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                        >
                            <div>Decode Instructions</div>
                            <div>{decodeInstructions ? "✅" : "❌"}</div>
                        </button>

                        <button
                            onClick={() => { if (confirm(`Erase all data on disk ${name}`)) { if (storageDiskInstance) storageDiskInstance.eraseDisk() } }}
                            className={`cursor-pointer px-2 py-1 font-medium transition-colors rounded bg-red-400`}
                        >
                            Erase Disk
                        </button>

                        <button
                            onClick={() => { if (confirm(`Format Disk Filesystem ${name}`)) { if (storageDiskInstance) {storageDiskInstance.formatDisk()} } }}
                            className={`cursor-pointer px-2 py-1 font-medium transition-colors rounded bg-red-400`}
                        >
                            Format FS
                        </button>
                    </div>
                </>


                {/* StorageDisk Children */}
                <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>
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

