
import { useState, useCallback, useMemo } from "react";

import { MINI_OS } from "@/lib/mini_os";
import { useDiskDevice, type DiskDevice } from "./devices/useDiskDevice";

import type { Device, u16, u8 } from "@/types/cpu.types";
import { useLeds, type LedsDevice } from "./devices/useLeds";
import { useInterrupt, type InterruptHook } from "./useInterrupt";
import { useSevenSegment, type SevenSegmentHook } from "./devices/useSevenSegment";
import { U8 } from "@/lib/integers";
import { useTimer, type TimerHook } from "./devices/useTimer";
import { useKeyboard, type KeyboardDevice } from "./devices/useKeyboard";
import { useConsole, type ConsoleDevice } from "./devices/useConsole";
import { useLCD, type LCDDevice } from "./devices/useLCD";
import { usePixelDisplay, type PixelDisplayDevice } from "./devices/usepixeldisplay";


// Device Map: commence à 0xFF00, chaque device a 16 ports (0xFF00-0xFF0F, 0xFF10-0xFF1F, etc.)
const DEVICE_PORT_SIZE = 0x10;


export const useIo = (): IOHook => {
    // Devices
    const osDisk = useDiskDevice(MINI_OS as unknown as Map<u16, u8>);      // Device 0: 0xFF00-0xFF0F
    const programDisk = useDiskDevice(new Map); // Device 1: 0xFF10-0xFF1F
    const leds = useLeds(); // Device 3: 0xFF20-0xFF2F
    const interrupt = useInterrupt(); // Device 4
    const timer = useTimer(interrupt); // Device 2
    const keyboard = useKeyboard(interrupt); // Device 5
    const sevenSegment = useSevenSegment(); // Device 6: 0xFF60-0xFF6F
    const consoleDevice = useConsole(); // Device 7: 0xFF70-0xFF7F
    const lcd = useLCD(); // Device 10 (0x0A): 0xFFA0-0xFFAF
    const pixelDisplay = usePixelDisplay(); // Device 13 (0x0D): 0xFFD0-0xFFDF


    // Device registry
    const devices = useMemo(() => new Map<u8, Device>([
        [0x00, osDisk],       // OS disk
        [0x01, programDisk],  // Program disk
        [0x02, timer],        // Timer (0xFF20-0xFF2F)
        [0x03, leds],         // LEDs
        [0x04, interrupt],    // Interrupt
        [0x05, keyboard],     // Keyboard (0xFF50-0xFF5F)
        [0x06, sevenSegment], // Seven Segment Display (0xFF60-0xFF6F)
        [0x07, consoleDevice],      // Console (0xFF70-0xFF7F)
        [0x0A, lcd],          // LCD 16x2 (0xFFA0-0xFFAF)
        [0x0D, pixelDisplay], // Pixel Display 32x32 (0xFFD0-0xFFDF)
    ] as [any, Device][]), [osDisk, programDisk, timer, leds, interrupt, keyboard, sevenSegment, consoleDevice, lcd, pixelDisplay]);


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


    const ioHook: IOHook = {
        read,
        write,
        devices,
        osDisk,
        programDisk,
        timer,
        leds,
        interrupt,
        keyboard,
        sevenSegment,
        console: consoleDevice,
        lcd,
        pixelDisplay,
    };

    return ioHook
};


export type IOHook = {
    read: (ioPort: u8) => u8;
    write: (ioPort: u8, value: u8) => void;
    devices: Map<u8, Device>;
    osDisk: DiskDevice;
    programDisk: DiskDevice;
    timer: TimerHook;
    leds: LedsDevice;
    interrupt: InterruptHook;
    keyboard: KeyboardDevice;
    sevenSegment: SevenSegmentHook;
    console: ConsoleDevice;
    lcd: LCDDevice;
    pixelDisplay: PixelDisplayDevice;
};

