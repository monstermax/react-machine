
import React, { useEffect } from 'react'
import { Link } from 'wouter';

import { Computer } from './beta/components/Computer/Computer';
import { Cpu } from './beta/components/Cpu/Cpu';
import { MemoryBus } from './beta/components/Memory/MemoryBus';
import { Ram } from './beta/components/Memory/Ram';
import { Rom } from './beta/components/Memory/Rom';
import { DevicesManager } from './beta/components/Devices/DevicesManager';
import { StorageDisk } from './beta/components/Devices/StorageDisk/StorageDisk';
import { Clock } from './beta/components/Cpu/Clock';
import { LedsDisplay } from './beta/components/Devices/LedsDisplay/LedsDisplay';
import { Buzzer } from './beta/components/Devices/Buzzer/Buzzer';
import { PixelDisplay } from './beta/components/Devices/PixelDisplay/PixelDisplay';
import { Rng } from './beta/components/Devices/Rng/Rng';
import { BOOTLOADER } from '@/programs/bootloader';
import { Rtc } from './beta/components/Devices/Rtc/Rtc';
import { LcdDisplay } from './beta/components/Devices/LcdDisplay/LcdDisplay';
import { Console } from './beta/components/Devices/Console/Console';
import { SevenSegmentDisplay } from './beta/components/Devices/7SegmentsDisplay/7SegmentsDisplay';
import { Keyboard } from './beta/components/Devices/Keyboard/Keyboard';
import { Interrupt } from './beta/components/Cpu/Interrupt';


export const ComputerBeta: React.FC = () => {
    //console.log('RENDER ComputerBeta')

    return (
        <div className="text-white">
            <h1 className="px-4 py-1 bg-background-light font-bold text-xl mb-4">
                <Link to="/">Computer Simulator</Link>
            </h1>

            <div>
                <Computer >
                    <Cpu threads={1} >
                        <Clock frequency={10} />
                        <Interrupt ioPort={4} hidden={false} />
                        {/* <Controls /> */}
                        {/* <Registers /> */}
                    </Cpu>

                    <MemoryBus >
                        <Rom data={BOOTLOADER} />
                        <Ram />
                    </MemoryBus>

                    <DevicesManager >
                        {/* Console */}
                        <Console ioPort={0x07} name="console" height={6} />

                        {/* Input */}
                        <Keyboard ioPort={0x05} name="keyboard" />

                        {/* Display */}
                        <LedsDisplay ioPort={0x03} name="leds" />
                        <LcdDisplay ioPort={0x0A} name="lcd" />
                        <PixelDisplay ioPort={0x0D} name="display_32x32" />
                        <SevenSegmentDisplay ioPort={0x06} name="7-segment" hidden />

                        {/* Audio */}
                        <Buzzer ioPort={0x08} name="buzzer" hidden />

                        {/* Random */}
                        <Rng ioPort={0x0B} name="rng" hidden />
                        <Rtc ioPort={0x0C} name="rtc" hidden />

                        {/* Storage */}
                        <StorageDisk ioPort={0x00} name="os_disk" open={false} />
                        <StorageDisk ioPort={0x01} name="program_disk" open={false} />
                        <StorageDisk ioPort={0x0E} name="data_1" persistent />
                        <StorageDisk ioPort={0x0F} name="data_2" open={false} />

                    </DevicesManager>
                </Computer>
            </div>
        </div>
    );
}

