
import { useCallback } from "react";

import type { PixelDisplayDevice } from "@/v1/hooks/devices/usePixelDisplay";


export const WidgetPixelDisplay: React.FC<{ device: PixelDisplayDevice }> = ({ device }) => {
    //console.log('RENDER ComputerPage.IosDevices.WidgetPixelDisplay')

    const handleClear = useCallback(() => {
        device.clear();
    }, [device]);

    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-cyan-400">Pixel Display 32x32</h2>
                <button
                    onClick={handleClear}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                >
                    Clear
                </button>
            </div>

            <div
                className="bg-black border-4 border-slate-600 rounded-lg p-2 inline-block"
                style={{
                    imageRendering: 'pixelated',
                    width: 'fit-content'
                }}
            >
                <div className="grid gap-0" style={{
                    gridTemplateColumns: `repeat(${device.width}, 1fr)`,
                    gap: '1px'
                }}>
                    {Array.from({ length: device.height }).map((_, y) =>
                        Array.from({ length: device.width }).map((_, x) => {
                            const isPixelOn = device.getPixel(x, y);
                            const isCursor = x === device.currentX && y === device.currentY;

                            return (
                                <div
                                    key={`${y}-${x}`}
                                    className={`w-3 h-3 ${isPixelOn
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

            <div className="mt-3 text-xs text-slate-400 p-2 bg-slate-900/30 rounded">
                <div>📍 I/O: 0xFFD0-0xFFD2 (Device 0x0D)</div>
                <div>📊 Cursor: X={device.currentX}, Y={device.currentY}</div>
                <div className="mt-1 text-slate-500">
                    Write X, Y, then COLOR (0=black, 1=white)
                </div>
            </div>
        </div>
    );
};