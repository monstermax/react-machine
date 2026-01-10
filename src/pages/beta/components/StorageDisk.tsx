import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../api/api';
import type { u16, u8 } from '@/types/cpu.types';
import { buildMemoryInstructionMap, getOpcodeName } from '@/lib/instructions';


export type StorageDiskProps = {
    name: string;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.StorageDisk) => void,
}


export const StorageDisk: React.FC<StorageDiskProps> = (props) => {
    const { name, children, onInstanceCreated } = props

    const [storageDiskInstance, setStorageDiskInstance] = useState<cpuApi.StorageDisk | null>(null);

    const [contentVisible, setContentVisible] = useState(true);

    // UI snapshot state
    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);
    const [decodeInstructions, setDecodeInstructions] = useState(true);


    const sortedDiskData = useMemo(() => {
        return Array.from(storage.entries()).sort(([a], [b]) => a - b)
    }, [storage]);


    const diskInstructionMap = useMemo(() => {
        //console.log('buildMemoryInstructionMap:', name, storage)
        return buildMemoryInstructionMap(storage);
    },
    [storage]);


    // Instanciate StorageDisk
    useEffect(() => {
        const _instanciateStorageDisk = () => {
            const disk = new cpuApi.StorageDisk(name);
            setStorageDiskInstance(disk);

            disk.on('state', (state) => {
                console.log('Disk state update', state)

                if (state.storage) {
                    setStorage(state.storage)
                }
            })

            //console.log(`StorageDisk "${name}" instantiated`)
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

                {childrenWithProps && (
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
                            onClick={() => { if (confirm(`Erase all data on disk ${name}`)) { setStorage(new Map) } }}
                            className={`cursor-pointer px-2 py-1 font-medium transition-colors rounded bg-red-400`}
                        >
                            Erase Disk
                        </button>

                        <button
                            onClick={() => { if (confirm(`Format Disk Filesystem ${name}`)) { /* storageDisk.formatDisk() */ } }}
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

