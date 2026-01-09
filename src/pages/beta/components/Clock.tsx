
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '../api/api';


export type ClockProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Clock) => void,
}

export const Clock: React.FC<ClockProps> = (props) => {
    const { children, onInstanceCreated } = props;

    const [clock, setClock] = useState<cpuApi.Clock | null>(null);


    // Instanciate Clock
    useEffect(() => {
        const _instanciateClock = () => {
            const clock = new cpuApi.Clock;
            setClock(clock);

            // Handle state updates
            clock.on('state', (state) => {
                console.log('MemoryBus state update', state)

            })
        }

        const timer = setTimeout(_instanciateClock, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le Clock est créé
    useEffect(() => {
        if (clock && onInstanceCreated) {
            onInstanceCreated(clock);
        }
    }, [clock, onInstanceCreated]);


    if (!clock) {
        return <>Loading Clock</>
    }


    return (
        <>
            Clock
            <div>
                {children}
            </div>
        </>
    );
}
