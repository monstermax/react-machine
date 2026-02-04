
import { EventEmitter } from "eventemitter3";

import * as cpuApi from '@/v2/api';
import type { CompiledCode, OsInfo, ProgramInfo, u16, u8 } from "@/types/cpu.types";
import { os_list } from "@/v2/cpus/default/programs_example/mini_os";
import { MEMORY_MAP } from "@/v2/lib/memory_map_16x8_bits";
import { programs } from "@/v2/cpus/default/programs_example/programs_index";
import { U16, U8 } from "@/v2/lib/integers";
import { loadSourceCodeFromFile, universalCompiler } from "@/v2/lib/compilation";


export class Computer extends EventEmitter {
    public id: number;
    public motherboard: cpuApi.Motherboard | null = null;
    public devicesManager: cpuApi.DevicesManager | null = null;
    public breakpoints: Set<number> = new Set;
    public loadedOs: string | null = null;
    public loadedProgram: string | null = null;
    public disableUiSync = false;


    constructor() {
        //console.log(`Initializing Computer`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
    }


    addMotherboard() {
        const motherboard = new cpuApi.Motherboard(this);

        // Attach Motherboard to Computer
        if (!this.motherboard) {
            this.motherboard = motherboard;
            //console.log('Motherboard montée dans Computer:', motherboard);
        }

        return motherboard;
    }


    addDevicesManager() {
        const devicesManager = new cpuApi.DevicesManager;

        this.devicesManager = devicesManager;

        // Attach DevicesManager to Computer
        if (!this.devicesManager) {
            this.attachDevicesManager(devicesManager);
        }

        // Connect DevicesManager to MemoryBus
        if (this.motherboard?.memoryBus) {
            this.motherboard.memoryBus.connectDevicesManager(devicesManager);
        }

        // Attach CPUs's Interrupt to DevicesManager
        if (this.motherboard) {
            for (const cpu of this.motherboard.getCpus()) {
                if (!cpu?.interrupt) continue;
                devicesManager.devices.set(cpu.interrupt.ioPort, cpu.interrupt)
            }
        }

        return devicesManager;
    }


    attachDevicesManager(devicesManager: cpuApi.DevicesManager) {
        this.devicesManager = devicesManager;
        //console.log('DevicesManager monté dans Computer:', devicesManager);
    }


    async loadCodeOnDisk(diskName: string, code: CompiledCode) {
        if (!this.devicesManager) return;

        const disk = this.devicesManager.getDeviceByName(diskName) as cpuApi.StorageDisk | undefined
        if (!disk) return;

        if (disk.type !== 'DiskStorage') return;

        await disk.loadRawData(code);
    }


    async loadOsCode(osName: string): Promise<CompiledCode | null> {
        const os: OsInfo | null = osName ? os_list[osName] : null;
        if (!os?.filepath) return null;

        const memoryOffset = MEMORY_MAP.OS_START;

        const codeSource = await loadSourceCodeFromFile(os.filepath);
        const compiledCode = await universalCompiler(codeSource, memoryOffset, U16(0))

        return compiledCode;
    }


    async loadOs(osName: string) {
        //const ramInstance = this?.motherboard?.memoryBus?.ram;
        //if (!ramInstance) return;
        const dmaInstance = this?.motherboard?.memoryBus?.dma;
        if (!dmaInstance) return;

        const osCode: CompiledCode | null = await this.loadOsCode(osName);

        if (true) {
            // Load on disk (for debug)
            await this.loadCodeOnDisk('os_disk', osCode ?? new Map);
        }

        if (0) {
            // Load in RAM
            const memoryOffset = MEMORY_MAP.OS_START;
            await dmaInstance.loadCodeInRam(osCode, memoryOffset);

            // Check Program Counter
            if (this.motherboard) {
                for (const cpu of this.motherboard.getCpus()) {
                    if (!cpu) continue;

                    for (const core of cpu.cores) {
                        const pc = core.getRegister('PC');

                        if (pc >= MEMORY_MAP.OS_START && pc <= MEMORY_MAP.PROGRAM_END) {
                            core.setRegister('PC', MEMORY_MAP.ROM_START);
                        }

                        break; // Only on core #0
                    }

                    break; // Only on cpu #0
                }
            }
        }

        this.loadedOs = osName;
        this.emit('state', { loadedOs: this.loadedOs })
    }


    unloadOs() {
        const ramInstance = this?.motherboard?.memoryBus?.ram;
        if (!ramInstance) return;

        // Vide le disk
        if (this.devicesManager) {
            const diskName = 'os_disk';
            const disk = this.devicesManager.getDeviceByName(diskName) as cpuApi.StorageDisk | undefined
            if (disk && disk.type === 'DiskStorage') {
                disk.eraseDisk();
            }
        }

        // Nettoie la RAM
        if (ramInstance) {
            for (let addr = MEMORY_MAP.OS_START; addr <= MEMORY_MAP.OS_END; addr++) {
                //ramInstance.storage.set(U16(addr), 0x00 as u8); // TRES TRES LENT !!! => solution : on ne vide que la 1ere adresse
                //break;
                ramInstance.storage.delete(U16(addr)); // le delete est rapide
            }

            if (this.motherboard) {
                this.motherboard.clearCpuCaches();
            }

            ramInstance.emit('state', { storage: new Map(ramInstance.storage) })
        }

        if (this.motherboard) {
            for (const cpu of this.motherboard.getCpus()) {
                if (!cpu) continue;

                for (const core of cpu.cores) {
                    const pc = core.getRegister('PC');

                    if (pc >= MEMORY_MAP.OS_START && pc <= MEMORY_MAP.OS_END) {
                        core.setRegister('PC', MEMORY_MAP.ROM_START);
                    }

                    if (core.idx > 0) {
                        core.stop();
                    }
                }

                if (cpu.idx > 0) {
                    cpu.stop();
                }
            }
        }

        //setLoadedOs(null);
        this.loadedOs = null;
        this.emit('state', { loadedOs: this.loadedOs })
    }



    async loadProgram(programName: string) {
        //const ramInstance = this?.motherboard?.memoryBus?.ram;
        //if (!ramInstance) return;
        const dmaInstance = this?.motherboard?.memoryBus?.dma;
        if (!dmaInstance) return;

        const programCode: CompiledCode | null = await this.loadProgramCode(programName);

        if (true) {
            await this.loadCodeOnDisk('program_disk', programCode ?? new Map); // load on disk too (for debug)
        }

        if (true) {
            const memoryOffset = MEMORY_MAP.PROGRAM_START;
            await dmaInstance.loadCodeInRam(programCode, memoryOffset);

            if (this.motherboard) {
                for (const cpu of this.motherboard.getCpus()) {
                    if (!cpu) continue;

                    for (const core of cpu.cores) {
                        const pc = core.getRegister('PC');

                        if (pc >= MEMORY_MAP.PROGRAM_START && pc <= MEMORY_MAP.PROGRAM_END) {
                            core.setRegister('PC', MEMORY_MAP.OS_START);
                        }

                        break; // Only on core #0
                    }

                    break; // Only on cpu #0
                }
            }
        }

        this.loadedProgram = programName;
        this.emit('state', { loadedProgram: this.loadedProgram })
    }


    async loadProgramCode(programName: string): Promise<CompiledCode | null> {
        const program: ProgramInfo | null = programName ? programs[programName] : null;
        if (!program) return null;

        const memoryOffset = MEMORY_MAP.PROGRAM_START;

        let compiledCode: CompiledCode | null = null;

        if (program.filepath) {
            const codeSource = await loadSourceCodeFromFile(program.filepath);
            compiledCode = await universalCompiler(codeSource, memoryOffset)

        } else {
            compiledCode = program.code;
        }

        return compiledCode;
    }


    unloadProgram() {
        const ramInstance = this?.motherboard?.memoryBus?.ram;
        if (!ramInstance) return;

        // Vide le disk

        if (this.devicesManager) {
            const diskName = 'program_disk';
            const disk = this.devicesManager.getDeviceByName(diskName) as cpuApi.StorageDisk | undefined
            if (disk && disk.type === 'DiskStorage') {
                disk.eraseDisk();
            }
        }

        if (ramInstance) {
            for (let addr = MEMORY_MAP.PROGRAM_START; addr <= MEMORY_MAP.PROGRAM_END; addr++) {
                //ramInstance.storage.set(U16(addr), 0x00 as u8); // TRES TRES LENT !!! => solution : on ne vide que la 1ere adresse
                //break;
                ramInstance.storage.delete(U16(addr)); // le delete est rapide
            }

            if (this.motherboard) {
                this.motherboard.clearCpuCaches();
            }

            ramInstance.emit('state', { storage: new Map(ramInstance.storage) })
        }

        if (this.motherboard) {
            for (const cpu of this.motherboard.getCpus()) {
                if (!cpu) continue;

                for (const core of cpu.cores) {
                    const pc = core.getRegister('PC');

                    if (pc >= MEMORY_MAP.PROGRAM_START && pc <= MEMORY_MAP.PROGRAM_END) {
                        core.setRegister('PC', MEMORY_MAP.OS_START);
                    }

                    if (core.idx > 0) {
                        core.stop();
                    }
                }

                if (cpu.idx > 0) {
                    cpu.stop();
                }
            }
        }

        //setLoadedProgram(null);

        this.loadedProgram = null;
        this.emit('state', { loadedProgram: this.loadedProgram })
    }


    reset() {
        if (this.motherboard) {

            for (const cpu of this.motherboard.getCpus()) {
                if (!cpu) continue;
                cpu.reset()
            }

            if (this.devicesManager) {
                this.devicesManager.reset()
            }

            if (this.motherboard.memoryBus?.ram) {
                this.motherboard.memoryBus.ram.eraseRam()
            }
        }
    }

}

