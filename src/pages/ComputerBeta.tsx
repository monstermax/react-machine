
import React, { useEffect, useState } from 'react'

import type { Device, Register, Register16, u16, u8 } from '@/types/cpu.types';


const initialRegisters = [
        ["A", 0 as u8],      // Register A
        ["B", 0 as u8],      // Register B
        ["C", 0 as u8],      // Register C
        ["D", 0 as u8],      // Register D
        ["PC", 0 as u16],    // Program Counter
        ["IR", 0 as u8],     // Instruction Register
        ["SP", 0 as u16],    // Stack Pointer
        ["FLAGS", 0 as u8],  // Bit 0: Carry, Bit 1: Zero
    ] as [string, u8 | u16][]
;


export const ComputerBeta: React.FC = () => {
    console.log('RENDER ComputerBeta')

    const [ computer, setComputer ] = useState<Computer | null>(null);

    const [registers, setRegisters] = useState<Map<string, u8 | u16>>(new Map(initialRegisters));


    // instanciate Computer
    useEffect(() => {
        const _instanciateComputer = () => {
            setComputer(new Computer);
        }

        const timer = setTimeout(_instanciateComputer, 100);
        return () => clearTimeout(timer);
    }, [])


    useEffect(() => {
        const _refresh_ui = () => {
            
        }

        const timer = setTimeout(_refresh_ui, 1000);
        return () => clearTimeout(timer);
    }, [])


    const boot = () => {
        if (!computer) return;

        console.log('boot')

        computer.cpu.executeCycle()
    }


    if (!computer) return null;

    return (
        <div className="text-white">
            <div>Computer {computer.id}</div>

            <div>
                <button
                    onClick={() => boot()}
                    className="bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                    >
                    Step
                </button>
            </div>

            <div>
                <PanelRegisters registers={registers} halted={false} clockCycle={computer.cpu.clockCycle} />
            </div>
        </div>
    );
}


export const PanelRegisters: React.FC<{ registers: Map<string, u8 | u16>, halted: boolean, clockCycle: number }> = ({ registers, halted, clockCycle }) => {
    //console.log('RENDER ComputerPage.PanelRegisters')

    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h2 className="text-xl font-semibold mb-2 text-blue-400">CPU Registers</h2>

            <div className="grid grid-cols-2 space-x-2 space-y-2 font-mono text-sm">
                {Array.from(registers.entries()).map(([reg, value]) => (
                    <div
                        key={reg}
                        className={`flex justify-between p-2 rounded ${reg === "PC" ? "bg-blue-900/50" :
                            reg === "A" && halted ? "bg-green-900/50 border border-green-500" :
                                "bg-slate-900/50"
                            }`}
                    >
                        <span className="text-cyan-400">{reg}:</span>
                        <span className="text-green-400">
                            {value} (0x{value.toString(16).padStart(
                                reg === "PC" || reg === "SP" ? 4 : 2,  // 4 digits pour PC/SP, 2 pour les autres
                                "0"
                            )})
                            {/* reg === "FLAGS" && ` [Z:${cpu.getFlag('zero') ? 1 : 0} C:${cpu.getFlag('carry') ? 1 : 0}]` */}
                        </span>
                    </div>
                ))}
                <div className="flex justify-between p-2 rounded bg-slate-900/50 border border-red-500/30">
                    <span className="text-red-400">Status:</span>
                    <span className={halted ? "text-red-400" : "text-green-400"}>
                        {halted ? "HALTED" : "RUNNING"}
                    </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-900/50 border border-cyan-500/30">
                    <span className="text-cyan-400">Clock:</span>
                    <span className="text-green-400">{clockCycle} cycles</span>
                </div>
            </div>
        </div>
    );
}



class Computer {
    public id: number;
    public cpu: Cpu;
    private memoryBus: MemoryBus;
    private loadedOs: string | null;
    private loadedProgram: string | null;

    constructor() {
        console.log(`Initializing Computer`);

        this.id = Math.round(Math.random() * 999_999_999);
        this.cpu = new Cpu;
        this.memoryBus = new MemoryBus;
        this.loadedOs = null;
        this.loadedProgram = null;
    }

}


class Cpu {
    public id: number;
    public registers: Map<string, u8 | u16>;
    public clockFrequency: number;
    public uiFrequency: number;
    public breakpoints: Set<number>;
    public halted: boolean;
    public paused: boolean;
    public clockCycle: number;
    private currentBreakpoint: number | null;
    private lastUiSync: number | null;
    private interruptsEnabled: boolean;
    private inInterruptHandler: boolean;

    constructor() {
        console.log(`Initializing Cpu`);

        this.id = Math.round(Math.random() * 999_999_999);
        this.registers = new Map(initialRegisters);
        this.clockFrequency = 1;
        this.uiFrequency = 1;
        this.breakpoints = new Set;
        this.currentBreakpoint = null;
        this.halted = false;
        this.paused = true;
        this.clockCycle = 0;
        this.lastUiSync = null;
        this.interruptsEnabled = false;
        this.inInterruptHandler = false;
    }


    getRegister<T extends Register>(reg: T): T extends Register16 ? u16 : u8 {
        const value = this.registers.get(reg) ?? 0;

        if (reg === "PC" || reg === "SP") {
            return value as T extends Register16 ? u16 : u8;
        } else {
            return value as T extends Register16 ? u16 : u8;
        }
    }


    getFlag(flag: 'zero' | 'carry'): boolean {
        const flags = this.getRegister("FLAGS");
        return flag === 'zero' ? !!(flags & 0b10) : !!(flags & 0b01);
    }


    executeCycle() {
        this.clockCycle++
        console.log('CPU executeCycle', this.clockCycle)
    }

}


class MemoryBus {
    public id: number;
    private rom: ROM;
    private ram: RAM;
    private io: IO;

    constructor() {
        console.log(`Initializing MemoryBus`);

        this.id = Math.round(Math.random() * 999_999_999);
        this.rom = new ROM;
        this.ram = new RAM;
        this.io = new IO;
    }

}


class ROM {
    public id: number;
    private storage: Map<u16, u8>;

    constructor() {
        console.log(`Initializing ROM`);

        this.id = Math.round(Math.random() * 999_999_999);
        this.storage = new Map;
    }

}


class RAM {
    public id: number;
    private storage: Map<u16, u8>;

    constructor() {
        console.log(`Initializing RAM`);

        this.id = Math.round(Math.random() * 999_999_999);
        this.storage = new Map;
    }

}


class IO {
    public id: number;
    private devices: Device[];

    constructor() {
        console.log(`Initializing IO`);

        this.id = Math.round(Math.random() * 999_999_999);
        this.devices = [];
    }

}


class StorageDisk {
    public id: number;
    private name: string;
    private storage: Map<u16, u8>;
    private fs: StorageFileSystem;

    constructor(name: string) {
        console.log(`Initializing StorageDisk`);

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.storage = new Map;
        this.fs = new StorageFileSystem(this);
    }

    getName() {
        return this.name;
    }

}

class StorageFileSystem {
    public id: number;
    private storageDisk: StorageDisk;

    constructor(storageDisk: StorageDisk) {
        console.log(`Initializing StorageFileSystem (${storageDisk.getName()})`);

        this.id = Math.round(Math.random() * 999_999_999);
        this.storageDisk = storageDisk;
    }

}
