
import React, { useEffect, useState } from 'react'
import { Link } from 'wouter';

import { compileCode, loadSourceCodeFromFile } from '@/cpus/default/asm_compiler';
import { MEMORY_MAP } from '@/lib/memory_map_16x8_bits';

import { Computer } from '@/v2/components/Computer/ComputerContext';
import { Cpu } from '@/v2/components/Cpu/Cpu';
import { Memory } from '@/v2/components/Memory/MemoryBus';
import { Ram } from '@/v2/components/Memory/Ram';
import { Rom } from '@/v2/components/Memory/Rom';
import { ExternalDevices, InternalDevices } from '@/v2/components/Devices/DevicesManager';
import { StorageDisk } from '@/v2/components/Devices/StorageDisk/StorageDisk';
import { Clock } from '@/v2/components/Cpu/Clock';
import { LedsDisplay } from '@/v2/components/Devices/LedsDisplay/LedsDisplay';
import { Buzzer } from '@/v2/components/Devices/Buzzer/Buzzer';
import { PixelDisplay } from '@/v2/components/Devices/PixelDisplay/PixelDisplay';
import { Rng } from '@/v2/components/Devices/Rng/Rng';
import { Rtc } from '@/v2/components/Devices/Rtc/Rtc';
import { LcdDisplay } from '@/v2/components/Devices/LcdDisplay/LcdDisplay';
import { Console } from '@/v2/components/Devices/Console/Console';
import { SevenSegmentDisplay } from '@/v2/components/Devices/7SegmentsDisplay/7SegmentsDisplay';
import { Keyboard } from '@/v2/components/Devices/Keyboard/Keyboard';
import { Interrupt } from '@/v2/components/Cpu/Interrupt';
import { Motherboard } from '@/v2/components/Computer/Motherboard';
import { Timer } from '@/v2/components/Devices/Timer/Timer';
import { IDE } from '@/v2/components/Devices/IDE';
import { Dma } from '@/v2/components/Memory/Dma';

import type { u16, u8 } from '@/types/cpu.types';
import { Instructions } from '@/v2/components/Cpu/Instructions';


export const ComputerBeta: React.FC = () => {
    //console.log('RENDER ComputerBeta')

    const [bootloader, setBootloader] = useState<Map<u16, u8>>(new Map);

    // Load BOOTLOADER
    useEffect(() => {
        const _compile = async () => {
            const bootloaderSourceCode = await loadSourceCodeFromFile("bootloader/bootloader_v1.asm");
            const compiled = await compileCode(bootloaderSourceCode, MEMORY_MAP.ROM_START);
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

            <div className="pb-1">
                <Computer>
                    <Motherboard>
                        <Clock frequency={1} />

                        <Cpu registers>
                            <Interrupt ioPort={4} open={false} />
                        </Cpu>

                        <Memory>
                            <Rom data={bootloader} />
                            <Ram />
                            <Dma ioPort={0x11} hidden />
                        </Memory>

                        <InternalDevices>
                            {/* Audio */}
                            <Buzzer ioPort={0x08} name="buzzer" hidden />

                            {/* Random */}
                            <Rng ioPort={0x0B} name="rng" hidden />
                            <Rtc ioPort={0x0C} name="rtc" hidden />
                            <Timer ioPort={0x02} name="timer" hidden />

                            {/* Storage */}
                            <StorageDisk ioPort={0x00} name="os_disk" open={false} />
                            <StorageDisk ioPort={0x01} name="program_disk" open={false} />
                            <StorageDisk ioPort={0x0E} name="data_1" persistent open={false} />
                            <StorageDisk ioPort={0x0F} name="data_2" open={false} />
                            {/* <StorageDisk ioPort={0x10} name="swap_disk" open={false} /> */}

                            {/* <Gpu /> */}
                            {/* <Network /> */}
                        </InternalDevices>
                    </Motherboard>

                    <ExternalDevices open={false} >
                        {/* Console */}
                        <Console ioPort={0x07} name="console" />

                        {/* Display */}
                        <LedsDisplay ioPort={0x03} name="leds" />
                        <LcdDisplay ioPort={0x0A} name="lcd" />
                        <PixelDisplay ioPort={0x0D} name="display_32x32" open={false} />
                        <SevenSegmentDisplay displays={4} ioPort={0x06} name="7-segment" open={false} />

                        {/* Input */}
                        <Keyboard ioPort={0x05} name="keyboard" open={false} />
                    </ExternalDevices>

                    <Instructions />

                    <IDE />
                </Computer>
            </div>

        </div>
    );
}


