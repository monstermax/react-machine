
import { useState, useCallback, useMemo } from "react";

import { MINI_OS } from "@/lib/mini_os";
import { useDiskDevice, type DiskDevice } from "./useDiskDevice";

import type { Device } from "@/types/cpu.types";


// Device Map: commence à 0xFF00, chaque device a 16 ports (0xFF00-0xFF0F, 0xFF10-0xFF1F, etc.)
const DEVICE_PORT_SIZE = 0x10;


export const useIo = (): IOHook => {
    // Devices
    const osDisk = useDiskDevice(MINI_OS);      // Device 0: 0xFF00-0xFF0F
    const programDisk = useDiskDevice(new Map); // Device 1: 0xFF10-0xFF1F


    // Device registry
    const devices = useMemo(() => new Map<number, Device>([
        [0, osDisk],       // OS disk
        [1, programDisk],  // Program disk
    ]), [osDisk, programDisk]);


    // I/O read: router vers le bon device
    const read = useCallback((ioPort: number): number => {
        const deviceId = Math.floor(ioPort / DEVICE_PORT_SIZE);
        const devicePort = ioPort % DEVICE_PORT_SIZE;

        const device = devices.get(deviceId);

        if (device) {
            return device.read(devicePort);
        }

        console.warn(`Read from unknown I/O port 0xFF${ioPort.toString(16).padStart(2, '0')}`);
        return 0;
    }, [devices]);


    // I/O write: router vers le bon device
    const write = useCallback((ioPort: number, value: number) => {
        const deviceId = Math.floor(ioPort / DEVICE_PORT_SIZE);
        const devicePort = ioPort % DEVICE_PORT_SIZE;

        const device = devices.get(deviceId);

        if (device) {
            device.write(devicePort, value);
            return;
        }

        console.warn(`Write to unknown I/O port 0xFF${ioPort.toString(16).padStart(2, '0')}`);
    }, [devices]);


    return {
        read,
        write,
        devices,
        osDisk,
        programDisk,
    };
};


export type IOHook = {
    read: (ioPort: number) => number;
    write: (ioPort: number, value: number) => void;
    devices: Map<number, Device>;
    osDisk: DiskDevice;
    programDisk: DiskDevice;
};

