
import React, { useEffect, useState } from 'react'
import { Link } from 'wouter';

import { Computer, Cpu, Memory, Motherboard, Rom, Ram, ExternalDevices, InternalDevices, Clock, PowerSupply } from 'react-machine-package/core-components'
import { Dma, Interrupt, Timer, CpuInstructions, MemoryMap, IDE } from 'react-machine-package/core-components'
import { StorageDisk, LedsDisplay, Buzzer, PixelDisplay, Rng, Rtc, LcdDisplay, Console, SevenSegmentDisplay, Keyboard } from 'react-machine-package/devices-components'
import { MEMORY_MAP, loadSourceCodeFromFile, compilerV2 } from 'react-machine-package';

const { universalCompiler } = compilerV2;

import type { u16, u8 } from 'react-machine-package/types';


export const ComputerPageBeta: React.FC = () => {
    //console.log('RENDER ComputerBeta')

    const [bootloader, setBootloader] = useState<Map<u16, u8>>(new Map);

    // Load BOOTLOADER
    useEffect(() => {
        const _compile = async () => {
            const bootloaderSourceCode = await loadSourceCodeFromFile("bootloader/bootloader_v2.asm");

            const compiled = await universalCompiler(bootloaderSourceCode, MEMORY_MAP.ROM_START);
            if (compiled) {
                setBootloader(compiled)
            }
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
                        <PowerSupply hidden />

                        <Cpu registers>
                            <Interrupt ioPort={4} open={false} />
                        </Cpu>

                        <Memory>
                            <Rom data={bootloader} open />
                            <Ram />
                            <Dma ioPort={0x11} hidden />
                        </Memory>

                        <InternalDevices>
                            <Clock ioPort={18} frequency={1} />

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

                    <MemoryMap />

                    <CpuInstructions />

                    <IDE />
                </Computer>
            </div>

        </div>
    );
}


