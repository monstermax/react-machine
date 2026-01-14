
import React, { useEffect, useState } from 'react'
import { Link } from 'wouter';

import { compileCode } from '@/lib/compiler';
import { MEMORY_MAP } from '@/lib/memory_map';

import { Computer } from './beta/components/Computer/ComputerContext';
import { Cpu } from './beta/components/Cpu/Cpu';
import { Memory, MemoryBus } from './beta/components/Memory/MemoryBus';
import { Ram } from './beta/components/Memory/Ram';
import { Rom } from './beta/components/Memory/Rom';
import { Devices, DevicesManager } from './beta/components/Devices/DevicesManager';
import { StorageDisk } from './beta/components/Devices/StorageDisk/StorageDisk';
import { Clock } from './beta/components/Cpu/Clock';
import { LedsDisplay } from './beta/components/Devices/LedsDisplay/LedsDisplay';
import { Buzzer } from './beta/components/Devices/Buzzer/Buzzer';
import { PixelDisplay } from './beta/components/Devices/PixelDisplay/PixelDisplay';
import { Rng } from './beta/components/Devices/Rng/Rng';
import { Rtc } from './beta/components/Devices/Rtc/Rtc';
import { LcdDisplay } from './beta/components/Devices/LcdDisplay/LcdDisplay';
import { Console } from './beta/components/Devices/Console/Console';
import { SevenSegmentDisplay } from './beta/components/Devices/7SegmentsDisplay/7SegmentsDisplay';
import { Keyboard } from './beta/components/Devices/Keyboard/Keyboard';
import { Interrupt } from './beta/components/Cpu/Interrupt';
import { Motherboard } from './beta/components/Computer/Motherboard';
import { ComputerControls } from './beta/components/Computer/ComputerContainer';
import { Timer } from './beta/components/Devices/Timer/Timer';

import type { u16, u8 } from '@/types/cpu.types';

import BootloaderSourceCode from '@/asm/bootloader/bootloader_v1.asm?raw'


export const ComputerBeta: React.FC = () => {
    //console.log('RENDER ComputerBeta')

    const [bootloader, setBootloader] = useState<Map<u16, u8>>(new Map);

    // Load BOOTLOADER
    useEffect(() => {
        const _compile = async () => {
            const compiled = await compileCode(BootloaderSourceCode, MEMORY_MAP.ROM_START);
            setBootloader(compiled.code)
        }

        const timer = setTimeout(_compile, 100)
        return () => clearTimeout(timer);
    }, [])


    return (
        <div className="text-white">
            <h1 className="px-4 py-1 bg-background-light font-bold text-xl mb-4">
                <Link to="/">Computer Simulator</Link>
            </h1>

            <div>
                <Computer>
                    <Motherboard>
                        <Cpu cores={2}>
                            <Clock frequency={10} />
                            {/* <Registers /> */}
                            <Interrupt ioPort={4} hidden={false} />
                            {/* <CpuTimer /> */}
                        </Cpu>

                        <Memory >
                            <Rom data={bootloader} />
                            <Ram />
                            {/* <Io /> */}
                        </Memory>
                    </Motherboard>

                    <Devices >
                        {/* Console */}
                        <Console ioPort={0x07} name="console" />

                        {/* Display */}
                        <LedsDisplay ioPort={0x03} name="leds" />
                        <LcdDisplay ioPort={0x0A} name="lcd" />
                        <PixelDisplay ioPort={0x0D} name="display_32x32" />
                        <SevenSegmentDisplay ioPort={0x06} name="7-segment" hidden />

                        {/* Input */}
                        <Keyboard ioPort={0x05} name="keyboard" />

                        {/* Audio */}
                        <Buzzer ioPort={0x08} name="buzzer" hidden />

                        {/* Random */}
                        <Rng ioPort={0x0B} name="rng" hidden />
                        <Rtc ioPort={0x0C} name="rtc" hidden />
                        <Timer ioPort={0x02} name="timer" hidden />

                        {/* Storage */}
                        <StorageDisk ioPort={0x00} name="os_disk" open={false} />
                        <StorageDisk ioPort={0x01} name="program_disk" open={false} />
                        <StorageDisk ioPort={0x0E} name="data_1" persistent />
                        <StorageDisk ioPort={0x0F} name="data_2" open={false} />

                        {/* <IDE /> adapter la page de compilation en composant Device + permettre l'execution du code */}

                        {/* <Gpu /> */}
                        {/* <Network /> */}

                    </Devices>
                </Computer>
            </div>
        </div>
    );
}




