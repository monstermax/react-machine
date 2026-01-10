

import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";

import type { IoDeviceType, u16, u8 } from "@/types/cpu.types";


//export const PIXEL_WIDTH = 32;
//export const PIXEL_HEIGHT = 32;


export class PixelDisplay extends EventEmitter {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;
    public width = 32;
    public height = 32;
    private pixels: boolean[][];
    public currentX: u8 = U8(0);
    public currentY: u8 = U8(0);


    constructor(name: string, ioPort: u8 | null = null, width=32, height=32) {
        //console.log(`Initializing PixelDisplay`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.type = 'Display';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port

        this.width = width;
        this.height = height;
        this.pixels = Array(height).fill(null).map(() => Array(width).fill(false))
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
                    const color = (value & 0x01) !== 0;
                    this.pixels[this.currentY][this.currentX] = color;

                    this.emit('state', { pixels: this.pixels})
                }
                break;
        }
    }


    clear() {
        this.pixels = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
        this.emit('state', { pixels: this.pixels})
    }


    getPixel(x: number, y: number): boolean {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
            return this.pixels[y][x];
        }
        return false;
    }


    reset(): void {
        this.clear();

        this.currentX = 0 as u8;
        this.currentY = 0 as u8;

        this.emit('state', {
            currentX: this.currentX,
            currentY: this.currentY,
        })
    }

}

