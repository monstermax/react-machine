
import React, { useCallback, useEffect, useMemo, useState, type JSXElementConstructor } from 'react'

import * as cpuApi from '@/v2/api';
import { useComputer } from '../Computer/ComputerContext';
import { MEMORY_MAP } from '@/lib/memory_map_16x8_bits';
import type { u16, u8 } from '@/types/cpu.types';


const irqNames = [
    "Timer", "Keyboard", "Disk", "UART",
    "Button", "Reserved", "Reserved", "Reserved"
];


export type InterruptProps = {
    ioPort?: number | u8 | null;
    hidden?: boolean;
    open?: boolean;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Interrupt) => void,
}

export const Interrupt: React.FC<InterruptProps> = (props) => {
    const { hidden, open=false, ioPort=null, children, onInstanceCreated } = props;

    // Core
    const [interruptInstance, setInterruptInstance] = useState<cpuApi.Interrupt | null>(null);

    // UI
    const [contentVisible, setContentVisible] = useState(open);
    const [enabled, setEnabled] = useState(0 as u8);      // IRQs activées
    const [pending, setPending] = useState(0 as u8);      // IRQs en attente
    const [mask, setMask] = useState(0 as u8);            // IRQs masquées
    const [handlerAddr, setHandlerAddr] = useState(MEMORY_MAP.OS_START as u16); // Default handler


    // Instanciate Interrupt
    useEffect(() => {
        if (interruptInstance) return;

        const _instanciateInterrupt = () => {

            // Init Instance
            const interrupt = new cpuApi.Interrupt(ioPort as u8 | null);

            // Save Instance for UI
            setInterruptInstance(interrupt);

            // Handle state updates
            interrupt.on('state', (state) => {
                if (!interrupt) return
                //console.log('Interrupt state update', state)

                if (state.enabled !== undefined) {
                    setEnabled(state.enabled)
                }

                if (state.pending !== undefined) {
                    setPending(state.pending)
                }

                if (state.mask !== undefined) {
                    setMask(state.mask)
                }

                if (state.handlerAddr !== undefined) {
                    setHandlerAddr(state.handlerAddr)
                }
            })

            // Emit initial state
            // TODO

            //setInstanciated(true)
        }

        const timer = setTimeout(_instanciateInterrupt, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le Interrupt est créé
    useEffect(() => {
        if (interruptInstance && onInstanceCreated) {
            onInstanceCreated(interruptInstance);
        }
    }, [interruptInstance, onInstanceCreated]);



    if (!interruptInstance) {
        return <>Loading Interrupt</>
    }


    return (
        <div className={`w-full p-2 rounded bg-background-light-2xl ${hidden ? "hidden" : ""}`}>

            {/* Interrupt Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Interrupt</h2>

                {true && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setContentVisible(b => !b)}
                    >
                        {contentVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* Interrupt Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-2 bg-background-light-3xl p-1 min-w-[300px]`}>
                <div className="flex items-center gap-2 px-1">

                    <div className="w-full grid grid-cols-1 gap-4">
                        {/* IRQ Status */}
                        <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">IRQ Status</h4>
                            <div className="space-y-1 w-full">
                                {Array.from({ length: 8 }).map((_, irq) => {
                                    const _enabled = (enabled >> irq) & 1;
                                    const _pending = (pending >> irq) & 1;
                                    const _masked = (mask >> irq) & 1;
                                    const active = _enabled && _pending && !_masked;

                                    return (
                                        <div key={irq} className="flex items-center justify-between p-2 rounded bg-slate-900/50">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${active ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`} />
                                                <span className="text-sm">
                                                    IRQ{irq}: {irqNames[irq]}
                                                </span>
                                            </div>
                                            <div className="flex gap-1 text-xs">
                                                <span className={_enabled ? 'text-green-400' : 'text-slate-600'} title="Enabled">
                                                    E
                                                </span>
                                                <span className={_pending ? 'text-red-400' : 'text-slate-600'} title="Pending">
                                                    P
                                                </span>
                                                <span className={_masked ? 'text-yellow-400' : 'text-slate-600'} title="Masked">
                                                    M
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}
