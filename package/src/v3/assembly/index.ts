
// The entry file of your WebAssembly module.

import { Computer } from "./core/Computer";


export function instanciateComputer(): Computer {
    const computer = new Computer;
    computer.addMemoryBus();
    computer.addMemoryRam();
    computer.addMemoryRom();
    computer.addMemoryIoManager();
    computer.addMemoryCpu();

    if (!computer.memoryBus) {
        throw new Error(`Cannot instanciate memoryBus`);
    }

    const memoryBus = computer.memoryBus;

    if (memoryBus) {
        memoryBus.write(0x0000, 0); // Write a NOP opcode at ROM address 0x0000
    }

    return computer;
}


export function computerRunCycle(computer: Computer): void {
    if (computer.cpus.length > 0) {
        computer.cpus[0].runCpuCycle();
    }
}


export function computerGetCycles(computer: Computer): u64 {
    if (computer.cpus.length > 0) {
        return computer.cpus[0].getCpuCycles();
    }

    return 0;
}


// Pour libérer la mémoire quand on a fini
export function destroyComputer(computer: Computer): void {
    // AssemblyScript gère ça automatiquement avec son GC
    // mais c'est bien de garder une référence explicite
}
