
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IoDevice } from "./IoDevice";

import type { u16, u8 } from "@/types";
import { high16, low16, toHex, U16, U8 } from "@/v2/lib/integers";


export type DmaDeviceParams = {
    type: string;
    vendor?: string;
    model?: string;
    devicesRef: React.RefObject<Map<number, IoDevice>>;
    readRam: (address: u16) => u8;
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
    private readRam: (address: u16) => u8;
    private writeRam: (address: u16, value: u8) => void;


    constructor(idx: u8, name: string, params: DmaDeviceParams) {
        super(idx, name, params);

        this.devicesRef = params.devicesRef;
        this.readRam = params.readRam;
        this.writeRam = params.writeRam;
    }


    read(port: u8): u8 {
        switch (port) {
            case 0x00 : { // DMA_IO - getIo
                return this.selectedIo;
            }

            // Source Config
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

            // Target Config
            case 0x05 : { // DMA_TARGET_ADDR_LOW - getAddressLow
                return low16(this.targetStartAddress);
            }

            case 0x06 : { // DMA_TARGET_ADDR_HIGH - getAddressHigh
                return high16(this.targetStartAddress);
            }

            // DATA Processing
            case 0x07 : { // DMA_DATA
                // write-only
                return U8(0);
            }

            case 0x08 : { // DMA_DATA_REVERSE
                // write-only
                return U8(0);
            }

            case 0x09 : { // DMA_STATUS: TODO: lire le statut de copie (running oui/non)
                // probablement inutile car la copie en ram est synchrone (le cpu attend la fin de la copie avant de passer a la prochaine instruction)
                return U8(0);
            }

            default:
                return 0 as u8;
        }
    }

    write(port: u8, value: u8): void {
        //console.log(`DMA writing value ${toHex(value)} (${value}) on port ${toHex(port)} (${port})`);

        switch (port) {
            case 0x00 : { // DMA_IO - setIo
                this.selectedIo = value;
                break;
            }

            // Source Config
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

            // Target Config
            case 0x05 : { // DMA_TARGET_ADDR_LOW - getAddressLow
                this.targetStartAddress = U16(high16(this.targetStartAddress) + value);
                break;
            }

            case 0x06 : { // DMA_TARGET_ADDR_HIGH - getAddressHigh
                this.targetStartAddress = U16(U16(value << 8) + low16(this.targetStartAddress));
                break;
            }

            // Process DATA
            case 0x07 : { // DMA_DATA - writeData from device to RAM
                const device = this.devicesRef.current.get(this.selectedIo);

                if (device) {
                    const count = this.sourceEndAddress - this.sourceStartAddress;
                    //console.log(`DEBUG DMA copying ${count} bytes from device #${this.selectedIo} to RAM`)

                    for (let offset=0; offset<=count; offset++) {
                        const diskAddress: u16 = U16(this.sourceStartAddress + offset);
                        const ramAddress: u16 = U16(this.targetStartAddress + offset);

                        // configure device
                        device.write(U8(0x03), low16(diskAddress));  // DISK_ADDR_LOW
                        device.write(U8(0x04), high16(diskAddress)); // DISK_ADDR_HIGH

                        // read device
                        const byte = device.read(U8(0x00)); // DISK_DATA

                        // write RAM
                        this.writeRam(ramAddress, byte)
                    }

                } else {
                    console.warn(`Device #${this.selectedIo} not found on DMA`);
                }

                break;
            }

            case 0x08: {
                // DMA_DATA_REVERSE - writeData from RAM to device
                const device = this.devicesRef.current.get(this.selectedIo);

                if (device) {
                    const count = this.sourceEndAddress - this.sourceStartAddress;
                    //console.log(`DEBUG DMA copying ${count} bytes from RAM to device #${this.selectedIo}`)

                    for (let offset=0; offset<=count; offset++) {
                        const ramAddress: u16 = U16(this.sourceStartAddress + offset);
                        const diskAddress: u16 = U16(this.targetStartAddress + offset);

                        // read RAM
                        const byte = this.readRam(ramAddress)

                        // configure device
                        device.write(U8(0x03), low16(diskAddress));  // DISK_ADDR_LOW
                        device.write(U8(0x04), high16(diskAddress)); // DISK_ADDR_HIGH

                        // write device
                        device.write(U8(0x00), byte); // DISK_DATA
                    }

                } else {
                    console.warn(`Device #${this.selectedIo} not found on DMA`);
                }
                break;
            }

            case 0x09: {
                // DMA_STATUS
                // read-only data
                break;
            }

        }
    }


    reset() {
    }
}


