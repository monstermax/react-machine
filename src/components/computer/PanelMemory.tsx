
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getOpcodeName, INSTRUCTIONS_WITH_OPERAND, INSTRUCTIONS_WITH_TWO_OPERANDS, Opcode } from "@/lib/instructions";
import { isROM, isRAM, MEMORY_MAP, memoryToIOPort, isIO } from "@/lib/memory_map";

import type { ComputerHook } from "@/hooks/useComputer";
import type { u16, u8 } from "@/types/cpu.types";
import { U16, U8 } from "@/lib/integers";
import type { DiskDevice } from "@/hooks/devices/useDiskDevice";


export type PanelMemoryProps = {
    computerHook: ComputerHook;
}


type TabType = "memory" | "os-disk" | "program-disk" | "data-disk-1" | "data-disk-2";


export const PanelMemory: React.FC<PanelMemoryProps> = memo((props) => {
    console.log('RENDER ComputerPage.PanelMemory')

    const { computerHook } = props;
    const { cpuHook, romHook, ramHook, ioHook } = computerHook;

    const [activeTab, setActiveTab] = useState<TabType>("memory");
    const [followInstruction, setFollowInstruction] = useState(true);
    const [decodeInstructions, setDecodeInstructions] = useState(true);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const addressRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    // Correction 1: Remplace "RAM" par "OS" et "Program"
    const memorySections = ["ROM", "OS", "Program", "Stack", "I/O"];
    let lastSection = "";


    // Combiner toute la mémoire (ROM + RAM + I/O)
    const currentMemory = useMemo((): Map<u16, u8> => {
        const view = new Map<u16, u8>();

        // ROM
        for (const [addr, value] of romHook.storage.entries()) {
            view.set(U16(addr), value);
        }

        // RAM
        for (const [addr, value] of ramHook.storage.entries()) {
            view.set(addr, value);
        }

        const displayIoAddresses = false;

        if (displayIoAddresses) {
            // I/O - Adresses de départ des devices
            const ioStartAddresses: u16[] = [
                MEMORY_MAP.OS_DISK_BASE,
                MEMORY_MAP.PROGRAM_DISK_BASE,
                MEMORY_MAP.TIMER_BASE,
                MEMORY_MAP.LEDS_BASE,
                MEMORY_MAP.INTERRUPT_BASE,
                MEMORY_MAP.KEYBOARD_BASE,
                MEMORY_MAP.SEVEN_SEG_BASE,
                MEMORY_MAP.CONSOLE_BASE,
                MEMORY_MAP.LCD_BASE,
                MEMORY_MAP.PIXEL_DISPLAY_BASE,
            ].sort((a, b) => a - b);

            // Pour chaque device, lire jusqu'à trouver des zéros ou atteindre le prochain device
            for (let i = 0; i < ioStartAddresses.length; i++) {
                const startAddr = ioStartAddresses[i];
                const nextAddr = ioStartAddresses[i + 1] ?? MEMORY_MAP.IO_END + 1;

                let currentAddr = startAddr;
                let consecutiveZeros = 0;

                while (currentAddr < nextAddr) {
                    //const ioPort = memoryToIOPort(currentAddr);
                    //const value = ioHook.read(ioPort); // BUG: trigger each device at each cycle
                    const value = U8(0); // TODO

                    // Toujours afficher la première adresse du device
                    if (currentAddr === startAddr) {
                        view.set(currentAddr, value);
                        currentAddr++;
                        continue;
                    }

                    // Si on trouve des données non-nulles, continuer
                    if (value !== 0) {
                        view.set(currentAddr, value);
                        consecutiveZeros = 0;

                    } else {
                        consecutiveZeros++;
                        // Arrêter après 3 zéros consécutifs (pour ne pas tout afficher)
                        if (consecutiveZeros >= 3) {
                            break;
                        }
                        view.set(currentAddr, value);
                    }

                    currentAddr++;
                }
            }
        }

        return view;
    }, [romHook.storage, ramHook.storage, ioHook]);


    // Accès aux disks
    const osDiskStorage = useMemo(() => {
        // Récupère le stockage du OSDisk depuis le hook correspondant
        return ioHook.osDisk?.storage || new Map<u16, u8>();
    }, [ioHook]);

    const programDiskStorage = useMemo(() => {
        // Récupère le stockage du ProgramDisk
        return ioHook.programDisk?.storage || new Map<u16, u8>();
    }, [ioHook]);

    const dataDisk1Storage = useMemo(() => {
        // Récupère le stockage du DataDisk2
        return ioHook.dataDisk1?.storage || new Map<u16, u8>();
    }, [ioHook]);

    const dataDisk2Storage = useMemo(() => {
        // Récupère le stockage du DataDisk2
        return ioHook.dataDisk2?.storage || new Map<u16, u8>();
    }, [ioHook]);

    const currentPC = cpuHook.getRegister("PC");
    const sortedMemory = Array.from(currentMemory.entries()).sort(([a], [b]) => a - b);
    const sortedOsDisk = Array.from(osDiskStorage.entries()).sort(([a], [b]) => a - b);
    const sortedProgramDisk = Array.from(programDiskStorage.entries()).sort(([a], [b]) => a - b);
    const sorteddataDisk1 = Array.from(dataDisk1Storage.entries()).sort(([a], [b]) => a - b);
    const sorteddataDisk2 = Array.from(dataDisk2Storage.entries()).sort(([a], [b]) => a - b);

    const MEMORY_MAP_REVERSE = Object.fromEntries(
        Object.entries(MEMORY_MAP).map(e => [e[1], e[0]])
    );


    // Fonction pour analyser les instructions dans les disks aussi
    const analyzeInstructions = useCallback((data: Map<u16, u8> | [u16, u8][]) => {
        const entries = Array.isArray(data) ? data : Array.from(data.entries());
        const sorted = entries.sort(([a], [b]) => a - b);

        const isInstruction = new Map<number, boolean>();
        const operandAddresses = new Set<number>();

        for (const [address, value] of sorted) {
            // Si déjà marqué comme opérande, ce n'est pas une instruction
            if (operandAddresses.has(address)) {
                isInstruction.set(address, false);
                continue;
            }

            // Si c'est un opcode valide, c'est une instruction
            if (Object.values(Opcode).includes(value)) {
                isInstruction.set(address, true);

                // Marquer les opérandes suivants
                if (INSTRUCTIONS_WITH_OPERAND.includes(value)) {
                    operandAddresses.add(address + 1);
                }
                if (INSTRUCTIONS_WITH_TWO_OPERANDS.includes(value)) {
                    operandAddresses.add(address + 1);
                    operandAddresses.add(address + 2);
                }
            } else {
                isInstruction.set(address, false);
            }
        }

        return isInstruction;
    }, []);

    const memoryInstructionMap = useMemo(() =>
        analyzeInstructions(currentMemory),
        [currentMemory, analyzeInstructions]);

    const osDiskInstructionMap = useMemo(() =>
        analyzeInstructions(osDiskStorage),
        [osDiskStorage, analyzeInstructions]);

    const programDiskInstructionMap = useMemo(() =>
        analyzeInstructions(programDiskStorage),
        [programDiskStorage, analyzeInstructions]);

    const dataDisk1InstructionMap = useMemo(() =>
        analyzeInstructions(dataDisk1Storage),
        [dataDisk1Storage, analyzeInstructions]);

    const dataDisk2InstructionMap = useMemo(() =>
        analyzeInstructions(dataDisk2Storage),
        [dataDisk2Storage, analyzeInstructions]);


    const toggleBreakpoint = useCallback((addr: number) => {
        cpuHook.setBreakpoints(prev => {
            const next = new Set(prev);
            if (next.has(addr)) next.delete(addr);
            else next.add(addr);
            return next;
        });
    }, [ cpuHook.setBreakpoints ]);


    // Fonction utilitaire pour scroller dans le conteneur
    const scrollInContainer = useCallback((element: HTMLElement | null, offset = 0) => {
        const container = scrollContainerRef.current;
        if (!element || !container) return;

        const elementTop = element.offsetTop;
        const containerHeight = container.clientHeight;

        const targetScroll = elementTop - (containerHeight / 2) + offset;
        const maxScroll = container.scrollHeight - containerHeight;
        const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));

        container.scrollTo({
            top: clampedScroll,
            behavior: 'smooth'
        });
    }, []);


    // Navigation vers une section mémoire
    const scrollToMemorySection = useCallback((section: string) => {
        let targetAddress = 0;

        switch (section) {
            case "ROM":
                targetAddress = MEMORY_MAP.ROM_START;
                break;
            case "OS":
                targetAddress = MEMORY_MAP.OS_START;
                break;
            case "Program":
                targetAddress = MEMORY_MAP.PROGRAM_START;
                break;
            case "Stack":
                targetAddress = MEMORY_MAP.STACK_START;
                break;
            case "I/O":
                targetAddress = MEMORY_MAP.IO_START;
                break;
        }

        const targetElement = addressRefs.current.get(targetAddress);
        if (targetElement) {
            scrollInContainer(targetElement, -150); // Offset pour laisser voir l'en-tête
        }
    }, [scrollInContainer]);


    // Auto-scroll vers PC quand il change
    useEffect(() => {
        const pcElement = addressRefs.current.get(currentPC);
        if (followInstruction && pcElement) {
            scrollInContainer(pcElement, -200);
        }
    }, [currentPC, followInstruction, scrollInContainer]);


    // Déterminer la section d'une adresse
    const getSection = (addr: u16): string => {
        if (isROM(addr)) return "ROM";

        if (isIO(addr)) return "I/O";

        if (isRAM(addr)) {
            if (addr >= MEMORY_MAP.OS_START && addr < MEMORY_MAP.PROGRAM_START) {
                return "RAM / OS";
            }
            return "RAM / PROGRAM";
        }

        return "UNKNOWN";
    };


    // Rendu du contenu selon l'onglet actif
    const renderContent = () => {
        switch (activeTab) {
            case "memory":
                return renderMemoryTab();
            case "os-disk":
                return renderDiskTab("OS Disk", sortedOsDisk, osDiskInstructionMap, ioHook.osDisk);
            case "program-disk":
                return renderDiskTab("Program Disk", sortedProgramDisk, programDiskInstructionMap, ioHook.programDisk);
            case "data-disk-1":
                return renderDiskTab("Data Disk #1", sorteddataDisk1, dataDisk1InstructionMap, ioHook.dataDisk1);
            case "data-disk-2":
                return renderDiskTab("Data Disk #2", sorteddataDisk2, dataDisk2InstructionMap, ioHook.dataDisk2);
            default:
                return renderMemoryTab();
        }
    };


    // Rendu de l'onglet mémoire
    const renderMemoryTab = () => (
        <>
            {/* Boutons de navigation rapide pour la mémoire */}
            <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-600 pb-2">
                {memorySections.map(section => (
                    <button
                        key={section}
                        onClick={() => scrollToMemorySection(section)}
                        className="px-3 py-1 text-sm font-medium text-slate-300 hover:text-purple-400 hover:bg-slate-700/50 rounded transition-colors"
                    >
                        {section}
                    </button>
                ))}
            </div>

            {/* Affichage mémoire */}
            <div
                ref={scrollContainerRef}
                className="font-mono text-sm space-y-1 max-h-[550px] overflow-y-auto"
            >
                <div className="text-xs text-slate-400 mb-2">
                    Total: {currentMemory.size} bytes
                </div>

                {sortedMemory.map(([addr, val]) => {
                    const section = getSection(addr);
                    const isPC = addr === currentPC;
                    const isInstruction = memoryInstructionMap.get(addr) ?? false;
                    const inROM = isROM(addr);

                    // Afficher séparateur de section
                    const showSeparator = section !== lastSection;
                    lastSection = section;

                    return (
                        <div key={addr}>
                            {showSeparator && (
                                <div className="sticky top-0 bg-slate-700/90 backdrop-blur px-2 py-1 mt-2 mb-1 text-xs font-bold text-slate-300 border-b border-slate-600">
                                    === {section} ===
                                </div>
                            )}
                            <div
                                ref={(el) => {
                                    if (el) addressRefs.current.set(addr, el);
                                }}
                                className={`flex justify-between p-2 rounded ${isPC
                                    ? "bg-yellow-900/50 border-2 border-yellow-500"
                                    : inROM
                                        ? "bg-blue-900/30"
                                        : "bg-slate-900/50"
                                    }`}
                                title={MEMORY_MAP_REVERSE[addr] ?? ''}
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        onClick={() => toggleBreakpoint(addr)}
                                        className={`
                                            w-3 h-3 rounded-full cursor-pointer transition-all
                                            ${cpuHook.breakpoints.has(addr) ? 'bg-red-600' : 'bg-slate-700 hover:bg-red-500/40 border border-slate-600'}
                                            ${isInstruction ? "" : "opacity-0"}
                                        `}
                                        title="Toggle breakpoint"
                                    />
                                    <span className="text-yellow-400">
                                        {isPC && "→ "}
                                        0x{addr.toString(16).padStart(4, "0")}:
                                    </span>
                                </div>
                                <span className={isInstruction ? "text-pink-400" : "text-green-400"}>
                                    0x{val.toString(16).padStart(2, "0")}
                                    {isInstruction && ` (${getOpcodeName(val)})`}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {currentMemory.size === 0 && (
                    <div className="text-slate-500 italic text-center py-8">
                        No memory content
                    </div>
                )}
            </div>

            <div className="mt-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={followInstruction}
                        onChange={(e) => setFollowInstruction(e.target.checked)}
                        className="rounded"
                    />
                    <span className="text-slate-300">Follow current Instruction</span>
                </label>
            </div>
        </>
    );


    // Rendu d'un onglet de disque
    const renderDiskTab = (title: string, diskData: [u16, u8][], instructionMap: Map<number, boolean>, device: DiskDevice) => (
        <>
            <div className="font-mono text-sm space-y-1 max-h-[600px] overflow-y-auto">
                <div className="text-xs text-slate-400 mb-2">
                    {title}: {diskData.length} bytes
                </div>

                {diskData.length > 0 ? (
                    diskData.map(([addr, val]) => {
                        const isInstruction = (decodeInstructions && instructionMap.get(addr)) ?? false;

                        return (
                            <div
                                key={addr}
                                className="flex justify-between p-2 rounded bg-slate-900/50"
                            >
                                <span className="text-yellow-400">
                                    0x{addr.toString(16).padStart(4, "0")}:
                                </span>
                                <div className="flex gap-4">
                                    {/* Afficher aussi le caractère ASCII si c'est un caractère imprimable */}
                                    {!isInstruction && val >= 32 && val <= 126 && (
                                        <span className="text-xs text-slate-400 mt-1">
                                            '{String.fromCharCode(val)}'
                                        </span>
                                    )}

                                    <span className={`${isInstruction ? "text-pink-400" : "text-green-400"}`}>
                                        0x{val.toString(16).padStart(2, "0")}
                                        {isInstruction && ` (${getOpcodeName(val)})`}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-slate-500 italic text-center py-8">
                        {title} is empty
                    </div>
                )}
            </div>

            <div className="mt-2 flex gap-4">
                <button
                    onClick={() => setDecodeInstructions(b => !b)}
                    className="flex gap-2 cursor-pointer px-4 py-2 font-medium transition-colors bg-purple-400"
                >
                    <div>Decode Instructions</div>
                    <div>{decodeInstructions ? "✅" : "❌"}</div>
                </button>

                <button
                    onClick={() => { if (confirm(`Erase all data on disk ${device.diskName}`)) { device.setStorage(new Map) } }}
                    className={`cursor-pointer px-4 py-2 font-medium transition-colors bg-red-400`}
                >
                    Erase Disk
                </button>

                <button
                    onClick={() => { if (confirm(`Format Disk Filesystem ${device.diskName}`)) { device.formatDisk() } }}
                    className={`cursor-pointer px-4 py-2 font-medium transition-colors bg-red-400`}
                >
                    Format FS
                </button>
            </div>
        </>
    );


    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h2 className="text-xl font-semibold mb-2 text-purple-400">Memory & Storage</h2>

            {/* Onglets principaux */}
            <div className="flex border-b border-slate-600 mb-4">
                <button
                    onClick={() => setActiveTab("memory")}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === "memory"
                        ? "text-purple-400 border-b-2 border-purple-400"
                        : "text-slate-400 hover:text-slate-300"
                        }`}
                >
                    Memory
                </button>
                <button
                    onClick={() => setActiveTab("os-disk")}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === "os-disk"
                        ? "text-purple-400 border-b-2 border-purple-400"
                        : "text-slate-400 hover:text-slate-300"
                        }`}
                >
                    OS Disk
                </button>
                <button
                    onClick={() => setActiveTab("program-disk")}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === "program-disk"
                        ? "text-purple-400 border-b-2 border-purple-400"
                        : "text-slate-400 hover:text-slate-300"
                        }`}
                >
                    Program Disk
                </button>
                <button
                    onClick={() => setActiveTab("data-disk-1")}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === "data-disk-1"
                        ? "text-purple-400 border-b-2 border-purple-400"
                        : "text-slate-400 hover:text-slate-300"
                        }`}
                >
                    Data Disk #1
                </button>
                <button
                    onClick={() => setActiveTab("data-disk-2")}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === "data-disk-2"
                        ? "text-purple-400 border-b-2 border-purple-400"
                        : "text-slate-400 hover:text-slate-300"
                        }`}
                >
                    Data Disk #2
                </button>
            </div>

            {/* Contenu de l'onglet actif */}
            {renderContent()}
        </div>
    );
})
