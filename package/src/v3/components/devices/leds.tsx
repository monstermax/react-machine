
import { useCallback, useEffect, useRef, useState } from "react";

import { IoDevice } from "./IoDevice";

import type { u8 } from "@/types";


export type LedsDeviceParams = {
    type: string;
    vendor?: string;
    model?: string;
}

export class LedsDevice extends IoDevice {
    name = 'leds';
    type = 'output';
    vendor = '';
    model = '';

    private leds: u8 = 0 as u8;


    constructor(idx: u8, name: string, params: LedsDeviceParams) {
        super(idx, name, params);

    }


    read(port: u8): u8 {
        switch (port) {
            case 0x00:
                return this.leds;

            default:
                return 0 as u8;
        }
    }

    write(port: u8, value: u8): void {
        switch (port) {
            case 0x00:
                this.leds = value;
                this.emit('state', { leds: this.leds })
                break;
        }
    }


    getLeds(): u8[] {
        // Retourne un tableau de bits pour l'affichage UI
        return Array.from({ length: 8 }, (_, i) => ((this.leds >> i) & 1) as u8);
    }


    reset(): void {
        this.leds = 0 as u8;
        this.emit('state', { leds: this.leds })
    }
}




export type LedsProps = {
    deviceInstance: LedsDevice | null;
}


export const Leds: React.FC<LedsProps> = (props) => {
    const { deviceInstance } = props;

    const [leds, setLeds] = useState<u8>(0 as u8)


    useEffect(() => {
        if (!deviceInstance) return;

        deviceInstance.on('state', (state) => {
            //console.log('Leds state update', state)

            if (state.leds !== undefined) {
                setLeds(state.leds)
            }
        })

    }, [deviceInstance])


    const getLeds = useCallback((): u8[] => {
        return Array.from({ length: 8 }, (_, i) => ((leds >> i) & 1) as u8);
    }, [leds])


    if (!deviceInstance) {
        return (
            <>Loading Leds...</>
        );
    }

    return (
        <>
            <div className="p-2 rounded flex gap-4 items-center">

                <div className="flex gap-2 mx-auto">
                    {getLeds().map((on, i) => (
                        <div key={i} className={`w-6 h-6 rounded-full ${on ? 'bg-yellow-500' : 'bg-gray-700'}`} />
                    ))}
                </div>
            </div>
        </>
    );
}

