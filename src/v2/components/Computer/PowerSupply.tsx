
import React, { useEffect, useRef, useState } from "react";

import * as cpuApi from '@/v2/api';
import { useComputer } from "./ComputerContext";


export type PowerSupplyProps = {
    hidden?: boolean,
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.PowerSupply) => void,
}


export const PowerSupply: React.FC<PowerSupplyProps> = (props) => {
    const { hidden, children, onInstanceCreated } = props;
    const { motherboardRef } = useComputer()

    // Core
    const [powerSupplyInstance, setPowerSupplyInstance] = useState<cpuApi.PowerSupply | null>(null);

    // UI
    const [contentVisible, setContentVisible] = useState(false);
    const [mouseDownOffset, setMouseDownOffset] = useState<null | { x: number, y: number }>(null);
    const [isDivAbsolute, setIsDivAbsolute] = useState(false)
    const divRef = useRef<HTMLDivElement>(null);


    // Instanciate PowerSupply
    useEffect(() => {
        if (!motherboardRef) return;
        if (powerSupplyInstance) return;

        const _instanciatePowerSupply = () => {
            if (!motherboardRef.current) return;

            // Init Instance
            const powerSupply = motherboardRef.current.addPowerSupply();

            // Save Instance for UI
            setPowerSupplyInstance(powerSupply);


            // Handle state updates for UI
            powerSupply.on('state', (state) => {
                //console.log('PowerSupply state update', state)

            });

            //setInstanciated(true)
        }

        const timer = setTimeout(_instanciatePowerSupply, 100);
        return () => clearTimeout(timer);
    }, [motherboardRef.current]);


    // Notifie le parent quand le PowerSupply est créé
    useEffect(() => {
        if (powerSupplyInstance && onInstanceCreated) {
            onInstanceCreated(powerSupplyInstance);
        }
    }, [powerSupplyInstance, onInstanceCreated]);


    // Handle Absolute Position + Draggable
    useEffect(() => {
        if (!divRef.current) return;

        if (mouseDownOffset) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)

            //divRef.current.style.position = 'absolute';
            //setIsDivAbsolute(true)

            return () => {
                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('mouseup', handleMouseUp)
            }

        } else {
            //setDivStatic();
        }
    }, [mouseDownOffset])

    const setDivStatic = () => {
        if (!divRef.current) return;
        divRef.current.style.position = 'static';
        setIsDivAbsolute(false)
    }

    const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
        if (!divRef.current) return;
        if (event.button !== 0) return;
        const rect = divRef.current.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        setMouseDownOffset({ x: offsetX, y: offsetY })
        document.body.classList.add('select-none');
    }

    const handleMouseUp = () => {
        if (!divRef.current) return;
        setMouseDownOffset(null)
        document.body.classList.remove('select-none');
    }

    const handleMouseMove = (event: MouseEvent) => {
        if (divRef.current && mouseDownOffset) {
            if (!isDivAbsolute) {
                divRef.current.style.position = 'absolute';
                setIsDivAbsolute(true)
            }

            const newX = event.pageX - mouseDownOffset.x;
            const newY = event.pageY - mouseDownOffset.y;
            divRef.current.style.left = newX + 'px';
            divRef.current.style.top = newY + 'px';
        }
    }


    if (!powerSupplyInstance) {
        return <>Loading Power Supply</>
    }


    return (
        <div ref={divRef} className={`power-supply w-auto rounded bg-yellow-600 p-1 ${hidden ? "hidden" : ""}`}>

            {/* PowerSupply Head */}
            <div className="w-full flex bg-background-light p-2 rounded">
                <h2 className="font-bold cursor-move" onMouseDown={(event) => handleMouseDown(event)}>Power Supply</h2>

                <div className="ms-auto flex gap-2">
                    {isDivAbsolute && (
                        <button
                            className="cursor-pointer px-3 bg-background-light-xl rounded"
                            onClick={() => setDivStatic()}
                        >
                            ⤴
                        </button>
                    )}

                    {false && (
                        <button
                            className="cursor-pointer px-3 bg-background-light-xl rounded"
                            onClick={() => setContentVisible(b => !b)}
                        >
                            {contentVisible ? "-" : "+"}
                        </button>
                    )}
                </div>
            </div>


            {/* PowerSupply Preview */}
            <div className={`${contentVisible ? "hidden" : "flex"} flex justify-center p-1 min-w-[200px]`}>
                {/* <PowerSupplyIcon /> */}
            </div>

            {/* PowerSupply Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-2 mt-2 min-w-[200px]`}>

                {/* PowerSupply Children */}
                {children && (
                    <div className="power-supply-children p-1 ps-2 grid grid-cols-1 space-x-2 space-y-2">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}

