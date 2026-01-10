
import React, { useEffect } from 'react'

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


export const ComputerBeta: React.FC = () => {
    //console.log('RENDER ComputerBeta')

    return (
        <div className="text-white">
            <h1 className="px-4 py-1 bg-background-light font-bold text-xl mb-4">Computer Simulator</h1>

            <div>
                <Computer>
                    <Cpu>
                        <Clock />
                    </Cpu>
                    <MemoryBus>
                        <Rom />
                        <Ram />
                    </MemoryBus>
                    <DevicesManager>
                        <LedsDisplay ioPort={3} name="leds_demo" />
                        <Buzzer ioPort={8} name="buzzer" />
                        <StorageDisk ioPort={0} name="os_disk" open={false} />
                        <StorageDisk ioPort={1} name="program_disk" open={false} />
                        <StorageDisk ioPort={14} name="data_1" persistent />
                        <StorageDisk ioPort={15} name="data_2" open={false} />
                    </DevicesManager>
                </Computer>
            </div>
        </div>
    );
}

