
// The entry file of your WebAssembly module.

import { Computer } from "./core/Computer";
import { MemoryBus } from "./core/Memory";
import { Opcode } from "./cpu_instructions";


//@external("env", "jsIoRead")
//declare function jsIoRead(deviceIdx: u8, port: u8): u8;

//@external("env", "jsIoWrite")
//declare function jsIoWrite(deviceIdx: u8, port: u8, value: u8): void;


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
        loadTmpCode(memoryBus);
    }

    console.log(`Computer instanciated`)

    //const jsreaded = jsIoRead(1, 2) // test
    //console.log(`jsreaded: ${jsreaded}\0`)

    //computerAddDevice(computer, 'keyboard', 'input')

    //jsIoWrite(4, 5, 6)

    return computer;
}


export function loadTmpCode(memoryBus: MemoryBus): void {
    memoryBus.write(0x0000, Opcode.MOV_A_MEM as u8); // read keyboard status
    memoryBus.write(0x0001, 0x01); // 0xF001 low byte
    memoryBus.write(0x0002, 0xF0); // 0xF001 high byte

    memoryBus.write(0x0003, Opcode.CMP_A_IMM as u8); // compare keyboard status
    memoryBus.write(0x0004, 0);

    memoryBus.write(0x0005, Opcode.JE as u8);
    memoryBus.write(0x0006, 0x00); // 0x0000 low byte
    memoryBus.write(0x0007, 0x00); // 0x0000 high byte

    memoryBus.write(0x0008, Opcode.MOV_A_MEM as u8); // read keyboard
    memoryBus.write(0x0009, 0x00); // 0xF000 low byte
    memoryBus.write(0x000A, 0xF0); // 0xF000 high byte

    memoryBus.write(0x000B, Opcode.MOV_MEM_A as u8); // write console
    memoryBus.write(0x000C, 0x10); // 0xF010 low byte
    memoryBus.write(0x000D, 0xF0); // 0xF010 high byte

    memoryBus.write(0x000E, Opcode.MOV_A_IMM as u8); // ack keyboard status
    memoryBus.write(0x000F, 1); // keyboard ack

    memoryBus.write(0x0010, Opcode.MOV_MEM_A as u8); // write keyboard (ack)
    memoryBus.write(0x0011, 0x00); // 0xF000 low byte
    memoryBus.write(0x0012, 0xF0); // 0xF000 high byte

    memoryBus.write(0x0013, Opcode.JMP as u8); // loop to begin
    memoryBus.write(0x0014, 0x00); // 0x0000 low byte
    memoryBus.write(0x0015, 0x00); // 0x0000 high byte
}



function loadCode(memoryBus: MemoryBus, addresses: Uint8Array, values: Uint8Array): void {
    if (addresses.length !== values.length) throw new Error(`Length mismatch`);

    for (let i=0; i<addresses.length; i++) {
        const address = addresses[i];
        const value = values[i];
        memoryBus.write(address, value);
    }

    console.log(`${addresses.length} addresses written`)
}


export function computerloadCode(computer: Computer, addresses: Uint8Array, values: Uint8Array): void {
    const memoryBus = computer.memoryBus;

    console.log(`${addresses.length} addresses received, ${values.length} values received`)

    if (memoryBus) {
        loadCode(memoryBus, addresses, values);
        return;
    }

    throw new Error("Memory Bus not found");
}


export function computerRunCycles(computer: Computer, cycles: u32): void {
    if (computer.cpus.length > 0) {
        for (let i: u32=0; i<cycles; i++) {
            computer.cpus[0].runCpuCycle();
        }
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

export function computerGetRegisterB(computer: Computer): u8 {
    if (computer.cpus.length > 0) {
        const cpu = computer.cpus[0];
        return cpu.registers.B
    }

    return 0;
}

export function computerGetRegisterC(computer: Computer): u8 {
    if (computer.cpus.length > 0) {
        const cpu = computer.cpus[0];
        return cpu.registers.C
    }

    return 0;
}

export function computerGetRegisterD(computer: Computer): u8 {
    if (computer.cpus.length > 0) {
        const cpu = computer.cpus[0];
        return cpu.registers.D
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
