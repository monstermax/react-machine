
import { EventEmitter } from "eventemitter3";

import { high16, low16, U16, U8 } from "@/v2/lib/integers";

import type { CompiledCode, IoDeviceType, u16, u8 } from "@/types/cpu.types";
import type { MemoryBus } from "./MemoryBus.api";
import { MEMORY_MAP, memoryToIOPort } from "@/v2/lib/memory_map_16x8_bits";
import type { IoDevice } from "@/v2/types/cpu_v2.types";


export class Dma extends EventEmitter implements IoDevice {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;

    public memoryBus: MemoryBus;
    private selectedIo = U8(0);
    private sourceStartAddress = U16(0); // disk address
    private sourceEndAddress = U16(0); // disk address
    private targetStartAddress = U16(0); // ram address


    constructor(memoryBus: MemoryBus, ioPort: u8 | null = null) {
        //console.log(`Initializing DMA`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = 'dma';
        this.type = 'Memory';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port

        this.memoryBus = memoryBus;

        //this.emit('state', {  })
    }


    // Lecture depuis les ports IO
    read(port: u8): u8 {

        // TODO

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
                return (0) as u8;
        }

    }


    // Écriture vers les ports IO
    write(port: u8, value: u8): void {

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
                const device = this.memoryBus.io?.devices.get(this.selectedIo);

                if (this.memoryBus.ram && device) {
                    const count = this.sourceEndAddress - this.sourceStartAddress;

                    for (let i=0; i<=count; i++) {
                        const diskAddress: u16 = U16(this.sourceStartAddress + i);
                        device.write(U8(0x03), low16(diskAddress));  // DISK_ADDR_LOW
                        device.write(U8(0x04), high16(diskAddress)); // DISK_ADDR_HIGH
                        const byte = device.read(U8(0x00)); // DISK_DATA

                        const ramAddress: u16 = U16(this.targetStartAddress + i);
                        this.memoryBus.ram.write(ramAddress, byte)
                    }
                }

                break;
            }


        }
    }


    async loadCodeInRam (code: CompiledCode | null, memoryOffset: u16=0 as u16) {

        if (!this.memoryBus.ram) {
            console.warn(`Cannot load code in RAM. DMA not loaded.`);
            return;
        }

        if (memoryOffset < MEMORY_MAP.RAM_START || memoryOffset + (code?.size ?? 0) > MEMORY_MAP.RAM_END) {
            console.warn(`Write memory out of range`);
            return;
        }

        // Write Memory
        const data = code
            ? code.entries()
            : new Map([[U16(0), U8(0)]])

        for (const [addr, value] of data) {
            this.memoryBus.ram.write(U16(memoryOffset + addr), value);
        }

        // Clear CPUs cache
        if (this.memoryBus.motherboard) {
            this.memoryBus.motherboard.clearCpuCaches();
        }

        console.log('Loaded code size in RAM:', code?.size ?? 0)
    }



    reset() {
        this.selectedIo = U8(0);
        this.sourceStartAddress = U16(0);
        this.sourceEndAddress = U16(0);
    }

}

