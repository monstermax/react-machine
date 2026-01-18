
import React, { useCallback, useEffect, useState, type JSXElementConstructor } from "react";

import * as cpuApi from '@/v2/api';

import { U8 } from "@/lib/integers";

import type { u8 } from "@/types/cpu.types";


export type PixelDisplayProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    open?: boolean;
    width?: number;
    height?: number;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.PixelDisplay) => void,
};


export const PixelDisplay: React.FC<PixelDisplayProps> = (props) => {
    const { hidden, open=true, name, ioPort, width=32, height=32, children, onInstanceCreated } = props;

    // Core
    const [deviceInstance, setDeviceInstance] = useState<cpuApi.PixelDisplay | null>(null);

    // UI snapshot state
    const [instanciated, setInstanciated] = useState(false)
    const [pixels, setPixels] = useState<boolean[][]>([])
    const [currentX, setCurrentX] = useState<number>(0)
    const [currentY, setCurrentY] = useState<number>(0)


    // UI
    const [contentVisible, setContentVisible] = useState(open);


    // Instanciate Device
    useEffect(() => {
        const _instanciateDevice = () => {
            if (instanciated) return;

            const device = new cpuApi.PixelDisplay(name, ioPort as u8 | null, width, height)
            setDeviceInstance(device);

            // Handle state updates
            device.on('state', (state) => {
                //console.log('PixelDisplay state update', state)

                if (state.pixels !== undefined) {
                    setPixels(state.pixels)
                }

                if (state.currentX !== undefined) {
                    setCurrentX(state.currentX)
                }

                if (state.currentY !== undefined) {
                    setCurrentY(state.currentY)
                }
            })

            setInstanciated(true)
        }

        const timer = setTimeout(_instanciateDevice, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le Device est créé
    useEffect(() => {
        if (deviceInstance && onInstanceCreated) {
            onInstanceCreated(deviceInstance);
        }
    }, [deviceInstance, onInstanceCreated]);


    const handleClear = useCallback(() => {
        if (!deviceInstance) return;
        deviceInstance.clear();
    }, [deviceInstance]);


    const getPixel = useCallback((x: number, y: number): boolean => {
        if (pixels.length === 0) return false;

        if (y >= 0 && y < height && x >= 0 && x < width) {
            return pixels[y][x];
        }
        return false;
    }, [pixels])


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into Device LedsDisplay : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;

            }
        }
        return child;
    });


    if (!deviceInstance) {
        return (
            <>Loading Pixels</>
        )
    }


    return (
        <div className={`device w-auto ${hidden ? "hidden" : ""}`}>

            {/* Device Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Pixel Display 32x32</h2>

                {true && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setContentVisible(b => !b)}
                    >
                        {contentVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* Device Content */}
            <div className={`${contentVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1 min-w-[400px]`}>

                <div
                    className="bg-black border-4 border-slate-600 rounded-lg p-2 mx-auto"
                    style={{
                        imageRendering: 'pixelated',
                        width: 'fit-content'
                    }}
                >
                    <div className="grid gap-0" style={{
                        gridTemplateColumns: `repeat(${width}, 1fr)`,
                        gap: '1px'
                    }}>
                        {Array.from({ length: height }).map((_, y) =>
                            Array.from({ length: width }).map((_, x) => {
                                const isPixelOn = getPixel(x, y);
                                const isCursor = deviceInstance && (x === currentX) && (y === currentY);

                                return (
                                    <div
                                        key={`${y}-${x}`}
                                        className={`w-2 h-2 ${isPixelOn
                                            ? 'bg-green-400'
                                            : isCursor
                                                ? 'bg-red-500/50'
                                                : 'bg-slate-900'
                                        }`}
                                        style={{
                                            transition: 'background-color 0.1s'
                                        }}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="mt-3 text-xs text-slate-400 p-2 bg-slate-900/30 rounded">
                        Cursor: X={currentX}, Y={currentY}
                    </div>

                    <button
                        onClick={handleClear}
                        className="ms-auto cursor-pointer bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                    >
                        Clear
                    </button>
                </div>

            </div>
        </div>
    );
};