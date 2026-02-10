
// The entry file of your WebAssembly module.

import { Computer } from "./core/Computer";
import { Opcode } from "./cpu_instructions";


@external("env", "jsIoRead")
declare function jsIoRead(deviceIdx: u8, port: u8): u8;

@external("env", "jsIoWrite")
declare function jsIoWrite(deviceIdx: u8, port: u8, value: u8): void;


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

        memoryBus.write(0x0005, Opcode.MOV_A_IMM as u8);
        memoryBus.write(0x0006, 66); // test

        memoryBus.write(0x0007, Opcode.MOV_A_MEM as u8); // read keyboard
        memoryBus.write(0x0008, 0x00); // 0xF000 low byte
        memoryBus.write(0x0009, 0xF0); // 0xF000 high byte

        memoryBus.write(0x000A, Opcode.MOV_MEM_A as u8); // write console
        memoryBus.write(0x000B, 0x10); // 0xF010 low byte
        memoryBus.write(0x000C, 0xF0); // 0xF010 high byte

        memoryBus.write(0x000D, Opcode.MOV_A_IMM as u8);
        memoryBus.write(0x000E, 1); // keyboard ack

        memoryBus.write(0x000F, Opcode.MOV_MEM_A as u8); // write keyboard (ack)
        memoryBus.write(0x0010, 0x00); // 0xF000 low byte
        memoryBus.write(0x0011, 0xF0); // 0xF000 high byte


        memoryBus.write(0x0012, Opcode.HALT as u8);
    }

    console.log(`Computer instanciated`)

    //const jsreaded = jsIoRead(1, 2) // test
    //console.log(`jsreaded: ${jsreaded}\0`)

    //computerAddDevice(computer, 'keyboard', 'input')

    //jsIoWrite(4, 5, 6)

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


export function computerAddDevice(computer: Computer, name: string, type: string, vendor: string, model: string): u8 {
    const ioManager = computer.ioManager;

    if (ioManager && ioManager.addDevice) {
        return ioManager.addDevice(name, type, vendor, model)
    }

    throw new Error("Io Manager not found");
}


// Pour libérer la mémoire quand on a fini
export function destroyComputer(computer: Computer): void {
    // AssemblyScript gère ça automatiquement avec son GC
    // mais c'est bien de garder une référence explicite
}
