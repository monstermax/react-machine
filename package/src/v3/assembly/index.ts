
// The entry file of your WebAssembly module.

import { Computer } from "./core/Computer";
import { CpuRegisters } from "./core/Cpu";
import { Opcode } from "./cpu_instructions";


export function instanciateComputer(): Computer {
    const computer = new Computer;
    computer.addMemoryBus();
    computer.addMemoryRam();
    computer.addMemoryRom();
    computer.addMemoryIoManager();
    computer.addMemoryCpu();

    const memoryBus = computer.memoryBus;

    if (!computer.memoryBus) {
        throw new Error(`Cannot instanciate memoryBus`);
    }

    if (memoryBus) {
        // write some BIOS code
        memoryBus.write(0x0000, Opcode.MOV_A_IMM as u8);
        memoryBus.write(0x0001, 13);

        memoryBus.write(0x0002, Opcode.MOV_MEM_A as u8);
        memoryBus.write(0x0003, 0x00); // 0x1000 low byte
        memoryBus.write(0x0004, 0x10); // 0x1000 high byte

        memoryBus.write(0x0005, Opcode.MOV_MEM_A as u8);
        memoryBus.write(0x0006, 0x0F); // 0x000F low byte
        memoryBus.write(0x0007, 0x00); // 0x000F high byte

        memoryBus.write(0x0008, Opcode.HALT as u8);
    }

    console.log(`Computer instanciated`)

    return computer;
}


export function computerRunCycle(computer: Computer): void {
    if (computer.cpus.length > 0) {
        computer.cpus[0].runCpuCycle();
    }
}


export function computerGetCycles(computer: Computer): u64 {
    if (computer.cpus.length > 0) {
        const cpu = computer.cpus[0];
        return cpu.getCpuCycles();
    }

    return 0;
}


export function computerGetRegisterPC(computer: Computer): u16 {
    if (computer.cpus.length > 0) {
        const cpu = computer.cpus[0];
        return cpu.registers.PC
    }

    return 0;
}

export function computerGetRegisterIR(computer: Computer): u8 {
    if (computer.cpus.length > 0) {
        const cpu = computer.cpus[0];
        return cpu.registers.IR
    }

    return 0;
}

export function computerGetRegisterA(computer: Computer): u8 {
    if (computer.cpus.length > 0) {
        const cpu = computer.cpus[0];
        return cpu.registers.A
    }

    return 0;
}

export function computerGetMemory(computer: Computer, address: u16): u8 {
    const memoryBus = computer.memoryBus;

    if (memoryBus && memoryBus.read) {
        const value = memoryBus.read(address);
        return value
    }

    return 0;
}


// Pour libérer la mémoire quand on a fini
export function destroyComputer(computer: Computer): void {
    // AssemblyScript gère ça automatiquement avec son GC
    // mais c'est bien de garder une référence explicite
}
