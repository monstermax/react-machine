
import { useState, useCallback, useMemo } from "react";

import { useDiskDevice, type DiskDevice } from "./devices/useDiskDevice";

import { useLedsDisplay, type LedsDevice } from "./devices/useLedsDisplay";
import { useInterrupt, type InterruptHook } from "./useInterrupt";
import { useSevenSegmentDisplay, type SevenSegmentHook } from "./devices/useSevenSegmentDisplay";
import { U8 } from "@/lib/integers";
import { useTimer, type TimerHook } from "./useTimer";
import { useKeyboard, type KeyboardDevice } from "./devices/useKeyboard";
import { useConsole, type ConsoleDevice } from "./devices/useConsole";
import { useLcdDisplay, type LCDDevice } from "./devices/useLcdDisplay";
import { usePixelDisplay, type PixelDisplayDevice } from "./devices/usePixelDisplay";
import { mapAddress16 } from "@/lib/memory_map_16x8_bits";
import { useRtc, type RtcHook } from "./devices/useRtc";
import { useRng, type RngHook } from "./devices/useRng";
import { useBuzzer, type BuzzerHook } from "./devices/useBuzzer";

import type { Device, u16, u8 } from "@/types/cpu.types";


// Device Map: commence à 0xFF00, chaque device a 16 ports (0xFF00-0xFF0F, 0xFF10-0xFF1F, etc.)
const DEVICE_PORT_SIZE = 0x10;


export const useIo = (): IOHook => {
    //console.log('RENDER ComputerPage.useComputer.useIo')

    // Devices
    const osDisk = useDiskDevice('os', new Map);      // Device 0: 0xFF00-0xFF0F // temporary disk
    const programDisk = useDiskDevice('program', new Map); // Device 1: 0xFF10-0xFF1F // temporary disk
    const interrupt = useInterrupt(); // Device 4: 0xFF40-0xFF4F
    const timer = useTimer(interrupt); // Device 2: 0xFF20-0xFF2F
    const leds = useLedsDisplay(); // Device 3: 0xFF30-0xFF3F
    const keyboard = useKeyboard(interrupt); // Device 5: 0xFF50-0xFF5F
    const sevenSegment = useSevenSegmentDisplay(); // Device 6: 0xFF60-0xFF6F
    const consoleDevice = useConsole(); // Device 7: 0xFF70-0xFF7F
    const buzzer = useBuzzer(); // 0xFF80-0xFF8F
    const lcd = useLcdDisplay(); // Device 10 (0x0A): 0xFFA0-0xFFAF
    const rng = useRng(); // 0xFFB0-0xFFBF
    const rtc = useRtc(); // 0xFFC0-0xFFCF
    const pixelDisplay = usePixelDisplay(); // Device 13 (0x0D): 0xFFD0-0xFFDF
    const dataDisk1 = useDiskDevice('data_1', new Map, true); // 0xFFE0-0xFFEF // persistent disk
    const dataDisk2 = useDiskDevice('data_2', new Map); // 0xFFF0-0xFFFF // temporary disk


    // Device registry
    const devices = useMemo(() => new Map<u8, Device>([
            [0x00, osDisk],         // OS disk
            [0x01, programDisk],    // Program disk
            [0x02, timer],          // Timer (0xFF20-0xFF2F)
            [0x03, leds],           // LEDs
            [0x04, interrupt],      // Interrupt
            [0x05, keyboard],       // Keyboard (0xFF50-0xFF5F)
            [0x06, sevenSegment],   // Seven Segment Display (0xFF60-0xFF6F)
            [0x07, consoleDevice],  // Console (0xFF70-0xFF7F)
            [0x08, buzzer],         // Buzzer (0xFF80-0xFF8F)
            [0x0A, lcd],            // LCD 16x2 (0xFFA0-0xFFAF)
            [0x0B, rng],            // Random Number Generator
            [0x0C, rtc],            // Real-Time Clock
            [0x0D, pixelDisplay],   // Pixel Display 32x32 (0xFFD0-0xFFDF)
            [0x0E, dataDisk1],      // Data disk 1
            [0x0F, dataDisk2],      // Data disk 2
        ] as [any, Device][])
    , [osDisk, programDisk, timer, leds, interrupt, keyboard, sevenSegment, consoleDevice, buzzer, lcd, rng, rtc, pixelDisplay, dataDisk1, dataDisk2]);


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


    const reset = useCallback(() => {
        devices.forEach(device => {
            if (device.reset) {
                device.reset();
            }
        })
    }, [devices])


    const ioHook: IOHook = {
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
        buzzer,
        pixelDisplay,
        rng,
        rtc,
        dataDisk1,
        dataDisk2,
        read,
        write,
        reset,
    };

    return ioHook
};


export type IOHook = {
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
    buzzer: BuzzerHook;
    pixelDisplay: PixelDisplayDevice;
    dataDisk1: DiskDevice;
    dataDisk2: DiskDevice;
    rng: RngHook;
    rtc: RtcHook;
    read: (ioPort: u8) => u8;
    write: (ioPort: u8, value: u8) => void;
    reset: () => void;
};

