
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IoDevice } from "./IoDevice";

import type { u16, u8 } from "@/types";
import { high16, low16, toHex, U16, U8 } from "@/v2/lib/integers";


export type DmaDeviceParams = {
    type: string;
    vendor?: string;
    model?: string;
    devicesRef: React.RefObject<Map<number, IoDevice>>;
    writeRam: (address: u16, value: u8) => void;
}

export class DmaDevice extends IoDevice {
    name = 'dma';
    type = 'system';
    vendor = '';
    model = '';

    private devicesRef: React.RefObject<Map<number, IoDevice>>;
    private selectedIo = U8(0);
    private sourceStartAddress = U16(0); // disk address
    private sourceEndAddress = U16(0); // disk address
    private targetStartAddress = U16(0); // ram address
    private writeRam: (address: u16, value: u8) => void;


    constructor(idx: u8, name: string, params: DmaDeviceParams) {
        super(idx, name, params);

        this.devicesRef = params.devicesRef;
        this.writeRam = params.writeRam;
    }


    read(port: u8): u8 {
        switch (port) {
            case 0x00 : { // DMA_IO - getIo
                return this.selectedIo;
            }

            case 0x01 : { // DMA_ADDR_START_LOW - getAddressLow
                return low16(this.sourceStartAddress);
            }

            case 0x02 : { // DMA_ADDR_START_HIGH - getAddressHigh
                return high16(this.sourceStartAddress);
            }

            case 0x03 : { // DMA_ADDR_END_LOW - getAddressLow
                return low16(this.sourceEndAddress);
            }

            case 0x04 : { // DMA_ADDR_END_HIGH - getAddressHigh
                return high16(this.sourceEndAddress);
            }

            case 0x05 : { // DMA_TARGET_ADDR_LOW - getAddressLow
                return low16(this.targetStartAddress);
            }

            case 0x06 : { // DMA_TARGET_ADDR_HIGH - getAddressHigh
                return high16(this.targetStartAddress);
            }

            case 0x07 : { // DMA_DATA
                return U8(0);
            }


            default:
                return 0 as u8;
        }
    }

    write(port: u8, value: u8): void {
        console.log(`DMA writing value ${toHex(value)} (${value}) on port ${toHex(port)} (${port})`);

        switch (port) {
            case 0x00 : { // DMA_IO - setIo
                this.selectedIo = value;
                break;
            }

            case 0x01 : { // DMA_ADDR_START_LOW - setAddressLow
                this.sourceStartAddress = U16(high16(this.sourceStartAddress) + value);
                break;
            }

            case 0x02 : { // DMA_ADDR_START_HIGH - setAddressHigh
                this.sourceStartAddress = U16(U16(value << 8) + low16(this.sourceStartAddress));
                break;
            }

            case 0x03 : { // DMA_ADDR_END_LOW - setAddressLow
                this.sourceEndAddress = U16(high16(this.sourceEndAddress) + value);
                break;
            }

            case 0x04 : { // DMA_ADDR_END_HIGH - setAddressHigh
                this.sourceEndAddress = U16(U16(value << 8) + low16(this.sourceEndAddress));
                break;
            }

            case 0x05 : { // DMA_TARGET_ADDR_LOW - getAddressLow
                this.targetStartAddress = U16(high16(this.targetStartAddress) + value);
                break;
            }

            case 0x06 : { // DMA_TARGET_ADDR_HIGH - getAddressHigh
                this.targetStartAddress = U16(U16(value << 8) + low16(this.targetStartAddress));
                break;
            }

            case 0x07 : { // DMA_DATA - writeData from disk to ram
                const device = this.devicesRef.current.get(this.selectedIo);

                if (device) {
                    const count = this.sourceEndAddress - this.sourceStartAddress;

                    for (let i=0; i<=count; i++) {
                        const diskAddress: u16 = U16(this.sourceStartAddress + i);
                        device.write(U8(0x03), low16(diskAddress));  // DISK_ADDR_LOW
                        device.write(U8(0x04), high16(diskAddress)); // DISK_ADDR_HIGH
                        const byte = device.read(U8(0x00)); // DISK_DATA

                        const ramAddress: u16 = U16(this.targetStartAddress + i);
                        this.writeRam(ramAddress, byte)
                    }
                }

                break;
            }


        }
    }


    reset() {
    }
}


