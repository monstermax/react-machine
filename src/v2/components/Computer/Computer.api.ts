
import { EventEmitter } from "eventemitter3";

import * as cpuApi from '@/v2/api';
import type { CompiledCode, OsInfo, ProgramInfo, u16, u8 } from "@/types/cpu.types";
import { os_list } from "@/cpus/default/programs/mini_os";
import { compileFile } from "@/cpus/default/asm_compiler";
import { MEMORY_MAP } from "@/lib/memory_map_16x8_bits";
import { programs } from "@/cpus/default/programs/programs_index";
import { U16 } from "@/lib/integers";


export class Computer extends EventEmitter {
    public id: number;
    public motherboard: cpuApi.Motherboard | null = null;
    public devicesManager: cpuApi.DevicesManager | null = null;
    public breakpoints: Set<number> = new Set;
    public loadedOs: string | null = null;
    public loadedProgram: string | null = null;


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
            this.devicesManager = devicesManager;
            //console.log('DevicesManager monté dans Computer:', devicesManager);
        }

        // Connect DevicesManager to MemoryBus
        if (this.motherboard?.memoryBus) {
            //this.motherboard.memoryBus.io = devicesManager;
            this.motherboard.memoryBus.connectDevicesManager(devicesManager);
            //console.log('DevicesManager connecté à MemoryBus:', devicesManager);
        }

        return devicesManager;
    }


    async loadCodeInRam(code: CompiledCode | null, memoryOffset: u16) {
        const ramInstance = this?.motherboard?.memoryBus?.ram;
        if (!ramInstance) return;

        if (code) {
            ramInstance.loadCodeInRam(code, memoryOffset); // load in ram

        } else {
            ramInstance.write(memoryOffset, 0 as u8);
        }
    }


    async loadCodeOnDisk(diskName: string, code: CompiledCode) {
        if (!this.devicesManager) return;

        const disk = this.devicesManager.getDeviceByName(diskName) as cpuApi.StorageDisk | undefined
        if (!disk) return;

        if (disk.type !== 'DiskStorage') return;

        await disk.loadRawData(code);
    }


    async loadOsCode(osName: string) {
        const os: OsInfo | null = osName ? os_list[osName] : null;
        if (!os?.filepath) return null;

        const memoryOffset = MEMORY_MAP.OS_START;
        const { code } = await compileFile(os.filepath, memoryOffset)

        return code;
    }


    async loadOs(osName: string) {
        const osCode: CompiledCode | null = await this.loadOsCode(osName);

         // Load on disk (for debug)
        await this.loadCodeOnDisk('os_disk', osCode ?? new Map);

         // Load in RAM
        const memoryOffset = MEMORY_MAP.OS_START;
        await this.loadCodeInRam(osCode, memoryOffset);

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
        const programCode: CompiledCode | null = await this.loadProgramCode(programName);

        await this.loadCodeOnDisk('program_disk', programCode ?? new Map); // load on disk too (for debug)

        const memoryOffset = MEMORY_MAP.PROGRAM_START;
        await this.loadCodeInRam(programCode, memoryOffset);

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

        this.loadedProgram = programName;
        this.emit('state', { loadedProgram: this.loadedProgram })
    }


    async loadProgramCode(programName: string) {
        const program: ProgramInfo | null = programName ? programs[programName] : null;
        if (!program) return null;

        const memoryOffset = MEMORY_MAP.PROGRAM_START;

        const { code } = program.filepath
            ? await compileFile(program.filepath, memoryOffset)
            : { code: program.code }

        return code;
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

