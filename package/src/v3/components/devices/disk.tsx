
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IoDevice } from "./IoDevice";

import type { u16, u8 } from "@/types";
import { high16, low16, toHex, U16 } from "@/v2/lib/integers";


export type DiskDeviceParams = {
    type: string;
    vendor?: string;
    model?: string;
    data?: Array<[u16, u8]> | Map<u16, u8>;
    maxSize?: u16;
}

export class DiskDevice extends IoDevice {
    name = 'disk';
    type = 'output';
    vendor = '';
    model = '';

    private currentAddress: u16 = 0 as u16;
    public storage: Map<u16, u8> = new Map;
    maxSize = 0xFFFF as u16;


    constructor(idx: u8, name: string, params: DiskDeviceParams) {
        super(idx, name, params);

        this.maxSize = params.maxSize ?? this.maxSize;

        if (params.data) {
            this.loadRawData(new Map(params.data))
        }

        this.emit('state', { maxSize: this.maxSize })
    }


    read(port: u8): u8 {
        //console.log(`DEBUG Reading Disk value on port ${toHex(port)} (${port})`);

        switch (port) {
            // ===== MODE RAW =====
            case 0: // DISK_DATA - lecture byte à l'adresse courante
                return this.storage.get(this.currentAddress) ?? 0 as u8;

            case 1: // DISK_SIZE_LOW - taille disque
                return low16(this.storage.size as u16); // Low byte

            case 2: // DISK_SIZE_HIGH - taille disque
                return high16(this.storage.size as u16); // High byte

            case 3: // DISK_ADDR_LOW - adresse courante (low)
                return low16(this.currentAddress);

            case 4: // DISK_ADDR_HIGH - adresse courante (high)
                return high16(this.currentAddress);


            default:
                return 0 as u8;
        }
    }

    write(port: u8, value: u8): void {
        //console.log(`DEBUG Writing Disk value ${toHex(value)} (${value}) on port ${toHex(port)} (${port})`);

        switch (port) {
            // ===== MODE RAW =====
            case 0: // DISK_DATA - écrire byte à l'adresse courante
                this.storage.set(this.currentAddress, value);

                if (this.storage.size > this.maxSize) {
                    this.storage.delete(this.currentAddress)
                    console.warn(`Disk ${this.name} overloaded`);
                }

                this.currentAddress = U16(this.currentAddress + 1);
                this.emit('state', { storage: this.storage })
                break;

            case 3: // DISK_ADDR_LOW - définir adresse (low)
                this.currentAddress = U16((this.currentAddress & 0xFF00) | value);
                break;

            case 4: // DISK_ADDR_HIGH - définir adresse (high)
                this.currentAddress = U16((this.currentAddress & 0x00FF) | (value << 8));
                break;

        }
    }


    loadRawData = (data: Map<u16, u8>) => {
        this.storage = new Map(data);

        if (this.storage.size > this.maxSize) {
            console.warn(`Disk ${this.name} overloaded`);
            this.deleteOverload()
        }

        this.emit('state', { storage: this.storage })
    }


    deleteOverload() {
        while (this.storage.size > this.maxSize) {
            const key = this.storage.keys().next();
            if (key.done) break;
            this.storage.delete(key.value)
        }
    }


    reset() {
        this.currentAddress = 0 as u16;
    }
}



export type DiskProps = {
    deviceInstance: DiskDevice | null;
}


export const Disk: React.FC<DiskProps> = (props) => {
    const { deviceInstance } = props;

    const [storage, setStorage] = useState<Map<u16, u8>>(new Map);
    const [decodeInstructions, setDecodeInstructions] = useState(true);

    const diskInstructionMap = new Map;


    const sortedDiskData = useMemo(() => {
        return Array.from(storage.entries()).sort(([a], [b]) => a - b)
    }, [deviceInstance, storage]);



    useEffect(() => {
        if (!deviceInstance) return;

        deviceInstance.on('state', (state) => {
            //console.log('Disk state update', state)

            if (state.storage) {
                setStorage(new Map(state.storage))
            }
        })

        setStorage(new Map(deviceInstance.storage))

    }, [deviceInstance])


    if (!deviceInstance) {
        return (
            <>Loading Disk...</>
        );
    }

    return (
        <>
            <h2>Disk</h2>

            <div className="font-mono text-sm space-y-1 max-h-[250px] overflow-y-auto overscroll-contain">
                <div className="text-xs text-slate-400 mb-2">
                    {deviceInstance.name} | Data: {sortedDiskData.length} bytes
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
                        Disk is empty
                    </div>
                )}
            </div>
        </>
    );
}


function getOpcodeName(val: u8) {
    return `OP ${toHex(val)}`
}

