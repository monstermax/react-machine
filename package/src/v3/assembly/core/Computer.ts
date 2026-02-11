
import { toHex } from "../utils";
import { Cpu } from "./Cpu";
import { IoManager } from "./IoManager";
import { MemoryBus, Ram, Rom } from "./Memory";


export class Computer {
    public memoryBus: MemoryBus | null = null;
    public rom: Rom | null = null;
    public ram: Ram | null = null;
    public ioManager: IoManager | null = null;
    public cpus: Cpu[] = [];


    constructor() {
    }

    addMemoryBus(): void {
        this.memoryBus = new MemoryBus(this);
    }

    addMemoryRam(): void {
        this.ram = new Ram(this);

        //const ram = this.ram;
        //if (ram) {
        //    const ptr = changetype<usize>(ram) as i32;
        //    console.log(`Ram mounted at address ${toHex(ptr)}`)
        //}
    }

    addMemoryRom(): void {
        this.rom = new Rom(this);
    }

    addMemoryIoManager(): void {
        this.ioManager = new IoManager(this);
    }

    addMemoryCpu(): void {
        this.cpus.push(new Cpu(this));
    }
}

