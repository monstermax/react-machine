
// The entry file of your WebAssembly module.

import { Computer } from "./core/Computer";
import { MemoryBus } from "./core/Memory";
import { Opcode } from "./core/cpu_instructions";


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
        //loadTmpCode(memoryBus);
    }

    console.log(`Computer instanciated`)

    //const jsreaded = jsIoRead(1, 2) // test
    //console.log(`jsreaded: ${jsreaded}`)

    //computerAddDevice(computer, 'keyboard', 'input')

    //jsIoWrite(4, 5, 6)

    return computer;
}


export function loadTmpCode(memoryBus: MemoryBus): void {
    memoryBus.write(0x0000, Opcode.MOV_REG_MEM as u8); // read keyboard status
    memoryBus.write(0x0001, 0x01); // register A
    memoryBus.write(0x0002, 0x01); // 0xF001 low byte
    memoryBus.write(0x0003, 0xF0); // 0xF001 high byte

    memoryBus.write(0x0004, Opcode.CMP_REG_IMM as u8); // compare keyboard status
    memoryBus.write(0x0005, 0x01); // register A
    memoryBus.write(0x0006, 0x00); // IMM 0

    memoryBus.write(0x0007, Opcode.JE as u8);
    memoryBus.write(0x0008, 0x00); // 0x0000 low byte
    memoryBus.write(0x0009, 0x00); // 0x0000 high byte

    memoryBus.write(0x000A, Opcode.MOV_REG_MEM as u8); // read keyboard
    memoryBus.write(0x000B, 0x01); // register A
    memoryBus.write(0x000C, 0x00); // 0xF000 low byte
    memoryBus.write(0x000D, 0xF0); // 0xF000 high byte

    memoryBus.write(0x000E, Opcode.MOV_MEM_REG as u8); // write console
    memoryBus.write(0x000F, 0x10); // 0xF010 low byte
    memoryBus.write(0x0010, 0xF0); // 0xF010 high byte
    memoryBus.write(0x0011, 0x01); // register A

    memoryBus.write(0x0012, Opcode.MOV_REG_IMM as u8); // ack keyboard status
    memoryBus.write(0x0013, 0x01); // register A
    memoryBus.write(0x0014, 0x01); // IMM 1 => keyboard ack

    memoryBus.write(0x0015, Opcode.MOV_MEM_REG as u8); // write keyboard (ack)
    memoryBus.write(0x0016, 0x00); // 0xF000 low byte
    memoryBus.write(0x0017, 0xF0); // 0xF000 high byte
    memoryBus.write(0x0018, 0x01); // register A

    memoryBus.write(0x0019, Opcode.JMP as u8); // loop to begin
    memoryBus.write(0x001A, 0x00); // 0x0000 low byte
    memoryBus.write(0x001B, 0x00); // 0x0000 high byte
}



function loadCode(memoryBus: MemoryBus, addresses: Uint8Array, values: Uint8Array): void {
    if (addresses.length !== values.length) throw new Error(`Length mismatch`);

    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        const value = values[i];
        memoryBus.write(address, value);
    }

    console.log(`${addresses.length} addresses written`)
}


export function allocate(size: i32): usize {
    const buf = new ArrayBuffer(size);
    return changetype<usize>(buf);
}


export function computerloadCode(
    computer: Computer,
    valPtr: usize,
    dataLen: i32
): void {
    const memoryBus = computer.memoryBus;

    if (!memoryBus) {
        throw new Error("Memory Bus not found");
    }

    for (let i: i32 = 0; i < dataLen; i++) {
        //const addr: u16 = load<u16>(addrPtr + i);
        const addr: u16 = i as u16;
        const val: u8 = load<u8>(valPtr + i);
        //console.log(`load code line #${i} (addr=${addr} | val=${val})`)
        memoryBus.write(addr, val);
    }
}


export function computerRunCycles(computer: Computer, cycles: u32): void {
    if (computer.cpus.length > 0) {
        for (let i: u32 = 0; i < cycles; i++) {
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

export function computerGetRegisterE(computer: Computer): u8 {
    if (computer.cpus.length > 0) {
        const cpu = computer.cpus[0];
        return cpu.registers.E
    }

    return 0;
}

export function computerGetRegisterF(computer: Computer): u8 {
    if (computer.cpus.length > 0) {
        const cpu = computer.cpus[0];
        return cpu.registers.F
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


export function computerAddDevice(
    computer: Computer,
    namePtr: usize,
    nameLen: i32,
    typeId: u8
): u8 {
    const ioManager = computer.ioManager;
    if (!ioManager) throw new Error("IoManager not found");

    // Convert raw pointer to AS string
    let name = '';
    for (let i: i32 = 0; i < nameLen; i++) {
        name += String.fromCharCode(load<u8>(namePtr + i));
    }

    return ioManager.addDevice(name, typeId);
}


// Pour libérer la mémoire quand on a fini
export function destroyComputer(computer: Computer): void {
    // AssemblyScript gère ça automatiquement avec son GC
    // mais c'est bien de garder une référence explicite
}
