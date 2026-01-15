
import React, { useEffect, useState } from 'react'
import { Link } from 'wouter';

import { compileCode } from '@/lib/cpu_default/asm_compiler';
import { MEMORY_MAP } from '@/lib/memory_map_16bit';

import { Computer } from '@/v2/components/Computer/ComputerContext';
import { Cpu } from '@/v2/components/Cpu/Cpu';
import { Memory, MemoryBus } from '@/v2/components/Memory/MemoryBus';
import { Ram } from '@/v2/components/Memory/Ram';
import { Rom } from '@/v2/components/Memory/Rom';
import { Devices, DevicesManager } from '@/v2/components/Devices/DevicesManager';
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
import { ComputerControls } from '@/v2/components/Computer/ComputerContainer';
import { Timer } from '@/v2/components/Devices/Timer/Timer';

import type { u16, u8 } from '@/types/cpu.types';

import BootloaderSourceCode from '@/asm_default/bootloader/bootloader_v1.asm?raw'


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




