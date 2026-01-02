
import { useState, useCallback, useMemo } from "react";

import { MINI_OS } from "@/lib/mini_os";
import { useDiskDevice, type DiskDevice } from "./devices/useDiskDevice";

import type { Device, u16, u8 } from "@/types/cpu.types";
import { useLeds, type LedsDevice } from "./devices/useLeds";
import { useInterrupt, type InterruptHook } from "./useInterrupt";
import { useSevenSegment, type SevenSegmentHook } from "./devices/useSevenSegment";
import { U8 } from "@/lib/integers";


// Device Map: commence à 0xFF00, chaque device a 16 ports (0xFF00-0xFF0F, 0xFF10-0xFF1F, etc.)
const DEVICE_PORT_SIZE = 0x10;


export const useIo = (): IOHook => {
    // Devices
    const osDisk = useDiskDevice(MINI_OS as unknown as Map<u16, u8>);      // Device 0: 0xFF00-0xFF0F
    const programDisk = useDiskDevice(new Map); // Device 1: 0xFF10-0xFF1F
    const leds = useLeds(); // Device 3: 0xFF20-0xFF2F
    const interrupt = useInterrupt(); // Device 4
    const sevenSegment = useSevenSegment(); // Device 6


    // Device registry
    const devices = useMemo(() => new Map<u8, Device>([
        [0x00, osDisk],       // OS disk
        [0x01, programDisk],  // Program disk
        [0x03, leds],         // LEDs
        [0x04, interrupt],    // Interrupt
        [0x06, sevenSegment], // Seven Segment Display
    ] as [any, Device][]), [osDisk, programDisk, leds, interrupt, sevenSegment]);


    // I/O read: router vers le bon device
    const read = useCallback((ioPort: u8): u8 => {
        const deviceId = U8(Math.floor(ioPort / DEVICE_PORT_SIZE));
        const devicePort = U8(ioPort % DEVICE_PORT_SIZE);

        const device = devices.get(deviceId);

        if (device) {
            return device.read(devicePort);
        }

        console.warn(`Read from unknown I/O port 0xFF${ioPort.toString(16).padStart(2, '0')}`);
        return 0 as u8;
    }, [devices]);


    // I/O write: router vers le bon device
    const write = useCallback((ioPort: u8, value: u8) => {
        const deviceId = U8(Math.floor(ioPort / DEVICE_PORT_SIZE));
        const devicePort = U8(ioPort % DEVICE_PORT_SIZE);

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
        leds,
        interrupt,
        sevenSegment,
    };
};


export type IOHook = {
    read: (ioPort: u8) => u8;
    write: (ioPort: u8, value: u8) => void;
    devices: Map<u8, Device>;
    osDisk: DiskDevice;
    programDisk: DiskDevice;
    leds: LedsDevice;
    interrupt: InterruptHook;
    sevenSegment: SevenSegmentHook;
};

