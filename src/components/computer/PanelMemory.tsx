
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getOpcodeName, INSTRUCTIONS_WITH_OPERAND, INSTRUCTIONS_WITH_TWO_OPERANDS, Opcode } from "@/lib/instructions";
import { isROM, isRAM, MEMORY_MAP, memoryToIOPort, isImportantIOAddress, isIO } from "@/lib/memory_map";

import type { ComputerHook } from "@/hooks/useComputer";
import type { u16, u8 } from "@/types/cpu.types";
import { U16 } from "@/lib/integers";


export type PanelMemoryProps = {
    computerHook: ComputerHook;
}


type TabType = "memory" | "os-disk" | "program-disk";


export const PanelMemory: React.FC<PanelMemoryProps> = (props) => {
    const { computerHook } = props;
    const { cpuHook, romHook, ramHook, ioHook } = computerHook;

    const [activeTab, setActiveTab] = useState<TabType>("memory");
    const [followInstruction, setFollowInstruction] = useState(false);

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
                const ioPort = memoryToIOPort(currentAddr);
                const value = ioHook.read(ioPort);

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

        return view;
    }, [romHook.storage, ramHook.storage, ioHook]);


    // Accès aux disks
    const osDiskStorage = useMemo(() => {
        // Récupère le stockage du OS Disk depuis le hook correspondant
        return ioHook.osDisk?.storage || new Map<u16, u8>();
    }, [ioHook]);

    const programDiskStorage = useMemo(() => {
        // Récupère le stockage du Program Disk
        return ioHook.programDisk?.storage || new Map<u16, u8>();
    }, [ioHook]);

    const currentPC = cpuHook.getRegister("PC");
    const sortedMemory = Array.from(currentMemory.entries()).sort(([a], [b]) => a - b);
    const sortedOsDisk = Array.from(osDiskStorage.entries()).sort(([a], [b]) => a - b);
    const sortedProgramDisk = Array.from(programDiskStorage.entries()).sort(([a], [b]) => a - b);

    const MEMORY_MAP_REVERSE = Object.fromEntries(
        Object.entries(MEMORY_MAP).map(e => [e[1], e[0]])
    );


    // Correction 2: Fonction pour analyser les instructions dans les disks aussi
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


    // Auto-scroll vers PC quand il change
    useEffect(() => {
        const pcElement = addressRefs.current.get(currentPC);
        if (followInstruction && pcElement && scrollContainerRef.current) {
            pcElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentPC, followInstruction]);


    // Navigation vers une section mémoire - CORRECTION 1
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
        if (targetElement && scrollContainerRef.current) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, []);


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
                return renderDiskTab("OS Disk", sortedOsDisk, osDiskInstructionMap);
            case "program-disk":
                return renderDiskTab("Program Disk", sortedProgramDisk, programDiskInstructionMap);
            default:
                return renderMemoryTab();
        }
    };

    // Rendu de l'onglet mémoire
    const renderMemoryTab = () => (
        <>
            {/* Boutons de navigation rapide pour la mémoire - CORRECTION 1 */}
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
                                <span className="text-yellow-400">
                                    {isPC && "→ "}
                                    0x{addr.toString(16).padStart(4, "0")}:
                                </span>
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

    // Rendu d'un onglet de disque - CORRECTION 2
    const renderDiskTab = (title: string, diskData: [u16, u8][], instructionMap: Map<number, boolean>) => (
        <div className="font-mono text-sm space-y-1 max-h-[600px] overflow-y-auto">
            <div className="text-xs text-slate-400 mb-2">
                {title}: {diskData.length} bytes
            </div>

            {diskData.length > 0 ? (
                diskData.map(([addr, val]) => {
                    const isInstruction = instructionMap.get(addr) ?? false;
                    
                    return (
                        <div
                            key={addr}
                            className="flex justify-between p-2 rounded bg-slate-900/50"
                        >
                            <span className="text-yellow-400">
                                0x{addr.toString(16).padStart(4, "0")}:
                            </span>
                            <div className="flex flex-col items-end">
                                <span className={`${isInstruction ? "text-pink-400" : "text-green-400"}`}>
                                    0x{val.toString(16).padStart(2, "0")}
                                    {isInstruction && ` (${getOpcodeName(val)})`}
                                </span>
                                {/* Afficher aussi le caractère ASCII si c'est un caractère imprimable */}
                                {!isInstruction && val >= 32 && val <= 126 && (
                                    <span className="text-xs text-slate-400 mt-1">
                                        '{String.fromCharCode(val)}'
                                    </span>
                                )}
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
            </div>

            {/* Contenu de l'onglet actif */}
            {renderContent()}
        </div>
    );
}
