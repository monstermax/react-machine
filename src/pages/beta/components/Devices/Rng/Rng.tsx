
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../../../api/api';
import { U8 } from '@/lib/integers';



export type RngProps = {
    name: string;
    ioPort: number;
    hidden?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Rng) => void,
}

export const Rng: React.FC<RngProps> = (props) => {
    const { name, ioPort, hidden, children, onInstanceCreated } = props;

    // Core
    const [rngInstance, setRngInstance] = useState<cpuApi.Rng | null>(null);

    // UI
    const [seed, setSeed] = useState(0)


    // Instanciate Rng
    useEffect(() => {
        const _instanciateRng = () => {
            const rng = new cpuApi.Rng(name, U8(ioPort));
            setRngInstance(rng);

            // Handle state updates
            rng.on('state', (state) => {
                if (!rng) return
                //console.log('Rng state update', state)

                if (state.seed !== undefined) {
                    setSeed(state.seed)
                }
            })

            //setInstanciated(true)

            setSeed(rng.seed)
        }

        const timer = setTimeout(_instanciateRng, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le Rng est créé
    useEffect(() => {
        if (rngInstance && onInstanceCreated) {
            onInstanceCreated(rngInstance);
        }
    }, [rngInstance, onInstanceCreated]);


    if (hidden) return null;


    if (!rngInstance) {
        return <>Loading Rng</>
    }


    return (
        <div className="w-full rounded bg-background-light-2xl">
            <h3 className="bg-background-light-xl mb-1 px-2 py-1 rounded">RNG</h3>

            <div>
                <div className="flex items-center gap-2 px-1">
                    Seed: {seed}
                </div>
            </div>

            <div>
                {children}
            </div>
        </div>
    );
}
