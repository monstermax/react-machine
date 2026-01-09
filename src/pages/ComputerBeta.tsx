
import React from 'react'

import { Computer } from './beta/components/Computer';
import { Cpu } from './beta/components/Cpu';
import { MemoryBus } from './beta/components/MemoryBus';
import { Ram } from './beta/components/Ram';
import { Rom } from './beta/components/Rom';
import { Devices } from './beta/components/Devices';
import { StorageDisk } from './beta/components/StorageDisk';
import { Clock } from './beta/components/Clock';


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
                    <Devices>
                        <StorageDisk name="os_disk" />
                        <StorageDisk name="program_disk" />
                    </Devices>
                </Computer>
            </div>
        </div>
    );
}

