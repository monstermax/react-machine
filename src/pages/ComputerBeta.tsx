
import React, { useEffect } from 'react'

import { Computer } from './beta/components/Computer';
import { Cpu } from './beta/components/Cpu';
import { MemoryBus } from './beta/components/MemoryBus';
import { Ram } from './beta/components/Ram';
import { Rom } from './beta/components/Rom';
import { DevicesManager } from './beta/components/DevicesManager';
import { StorageDisk } from './beta/components/StorageDisk';
import { Clock } from './beta/components/Clock';
import { compileCode } from '@/lib/compiler';
import { devicesManagerRef } from './beta/api/api';
import { LedsDisplay } from './beta/components/LedsDisplay';



export const ComputerBeta: React.FC = () => {
    console.log('RENDER ComputerBeta')

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
                        <StorageDisk name="os_disk" />
                        <StorageDisk name="program_disk" />
                        <StorageDisk name="data_1" />
                        <StorageDisk name="data_2" />
                        <LedsDisplay name="leds_demo" />
                    </DevicesManager>
                </Computer>
            </div>
        </div>
    );
}

