
import { useCallback, useEffect, useRef, useState } from "react";

import { IoDevice } from "./IoDevice";

import type { u8 } from "@/types";


export type ScreenDeviceParams = {
    type: string;
    vendor?: string;
    model?: string;
    width?: number;
    height?: number;
    maxLines?: number;
}

export class ScreenDevice extends IoDevice {
    name = 'screen';
    type = 'output';
    vendor = '';
    model = '';

    width = 32;
    height = 32;
    private pixels: Uint8Array[];
    private currentX: u8 = 0 as u8;
    private currentY: u8 = 0 as u8;

    constructor(idx: u8, name: string, params: ScreenDeviceParams) {
        super(idx, name, params);

        this.width = params.width ?? this.width;
        this.height = params.height ?? this.height;
        this.pixels = Array(this.height).fill(null).map(() => new Uint8Array(this.width))
    }


    read(port: u8): u8 {
        switch (port) {
            case 0x00: // PIXEL_X
                return this.currentX;

            case 0x01: // PIXEL_Y
                return this.currentY;

            case 0x02: // PIXEL_COLOR
                if (this.currentY < this.height && this.currentX < this.width) {
                    return (this.pixels[this.currentY][this.currentX] ? 1 : 0) as u8;
                }
                return 0 as u8;

            default:
                return 0 as u8;
        }
    }

    write(port: u8, value: u8): void {
        switch (port) {
            case 0x00: // PIXEL_X
                this.currentX = (value % this.width) as u8;
                this.emit('state', { currentX: this.currentX, })
                break;

            case 0x01: // PIXEL_Y
                this.currentY = (value % this.height) as u8;
                this.emit('state', { currentY: this.currentY, })
                break;

            case 0x02: // PIXEL_COLOR - Écrire pixel à (currentX, currentY)
                if (this.currentY < this.height && this.currentX < this.width) {
                    //const color = (value & 0x01) !== 0;
                    const color = value;
                    this.pixels[this.currentY][this.currentX] = color;

                    this.emit('state', { pixels: this.pixels})
                }
                break;
        }
    }


    getPixel(x: number, y: number): u8 {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
            return this.pixels[y][x] as u8;
        }
        return 0 as u8;
    }


    clear() {
        this.pixels = Array(this.height).fill(null).map(() => new Uint8Array(this.width));
        this.emit('state', { pixels: this.pixels})
    }

    reset() {
        this.clear();

        this.currentX = 0 as u8;
        this.currentY = 0 as u8;

        this.emit('state', {
            currentX: this.currentX,
            currentY: this.currentY,
        })
    }
}



export type ScreenProps = {
    deviceInstance: ScreenDevice | null;
    width?: number;
    height?: number;
}


export const Screen: React.FC<ScreenProps> = (props) => {
    const { deviceInstance, width = 32, height = 32 } = props;

    const [pixels, setPixels] = useState<u8[][]>([])
    const [currentX, setCurrentX] = useState<number>(0)
    const [currentY, setCurrentY] = useState<number>(0)


    useEffect(() => {
        if (!deviceInstance) return;

        deviceInstance.on('state', (state) => {
            //console.log('Screen state update', state)

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

    }, [deviceInstance])


    const handleClear = useCallback(() => {
        if (!deviceInstance) return;
        deviceInstance.clear();
    }, [deviceInstance]);


    const getPixel = useCallback((x: number, y: number): u8 => {
        if (pixels.length === 0) return 0 as u8;

        if (y >= 0 && y < height && x >= 0 && x < width) {
            return pixels[y][x];
        }
        return 0 as u8;
    }, [pixels])


    if (!deviceInstance) {
        return (
            <>Loading Screen...</>
        );
    }

    return (
        <>
            <h2>Screen</h2>

            <div className="flex justify-between gap-4">

                <div>
                    <div className="flex flex-col gap-2">
                        <div className="mt-3 text-xs text-slate-400 p-2 bg-slate-900/30 rounded">
                            Cursor:
                            <ul>
                                <li>X={currentX}</li>
                                <li>Y={currentY}</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleClear}
                            className="cursor-pointer bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>

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
                                const pixelColor = getPixel(x, y);
                                const isCursor = deviceInstance && (x === currentX) && (y === currentY);

                                return (
                                    <div
                                        key={`${y}-${x}`}
                                        className={`w-2 h-2 ${pixelColor
                                            ? ''
                                            : isCursor
                                                ? 'bg-red-500/50'
                                                : 'bg-slate-900'
                                            }`}
                                        style={{
                                            transition: 'background-color 0.1s',
                                            backgroundColor: pixelColor ? getPixelColor(pixelColor) : '',
                                        }}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}



function getPixelColor(pixelColor: u8, x?: u8, y?: u8) {
    let teinte = Math.round((pixelColor / 255) * 360);
    let htmlColor = `hsl(${teinte},100%,50%)`;
    return htmlColor;
    //return `bg-[${htmlColor}]`;
    //return 'bg-green-400';
}

