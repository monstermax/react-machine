
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getOpcodeName, INSTRUCTIONS_WITH_OPERAND, INSTRUCTIONS_WITH_TWO_OPERANDS, Opcode } from "@/lib/instructions";
import { isROM, isRAM, MEMORY_MAP, memoryToIOPort, isImportantIOAddress, isIO } from "@/lib/memory_map";

import type { ComputerHook } from "@/hooks/useComputer";
import type { Memory } from "@/types/cpu.types";


export type PanelMemoryProps = {
    computerHook: ComputerHook;
}


type MemorySection = "ROM" | "RAM" | "OS Disk" | "Program Disk";


export const PanelMemory: React.FC<PanelMemoryProps> = (props) => {
    const { computerHook } = props;
    const { cpuHook, romHook, ramHook, ioHook } = computerHook;

    const [followInstruction, setFollowInstruction] = useState(true);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const addressRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    const sections: MemorySection[] = ["ROM", "RAM", "OS Disk", "Program Disk"];
    let lastSection = "";


    // Combiner toute la mémoire (ROM + RAM + I/O)
    const fullMemoryView = useCallback((): Memory => {
        const view = new Map<number, number>();

        // ROM
        for (const [addr, value] of romHook.storage.entries()) {
            view.set(addr, value);
        }

        // RAM
        for (const [addr, value] of ramHook.storage.entries()) {
            view.set(addr, value);
        }

        // I/O - Adresses de départ des devices
        const ioStartAddresses = [
            MEMORY_MAP.OS_DISK_DATA,
            MEMORY_MAP.PROGRAM_DISK_DATA,
            MEMORY_MAP.LEDS_OUTPUT,
            MEMORY_MAP.SEVEN_SEG_DATA,
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


    const currentMemory = fullMemoryView();
    const currentPC = cpuHook.getRegister("PC");
    const sortedMemory = Array.from(currentMemory.entries()).sort(([a], [b]) => a - b);

    const MEMORY_MAP_REVERSE = Object.fromEntries(
        Object.entries(MEMORY_MAP).map(e => [e[1], e[0]])
    );


    const instructionMap = useMemo(() => {
        const isInstruction = new Map<number, boolean>();
        const operandAddresses = new Set<number>();

        const sorted = Array.from(currentMemory.entries()).sort(([a], [b]) => a - b);

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
    }, [currentMemory]);


    // Auto-scroll vers PC quand il change
    useEffect(() => {
        const pcElement = addressRefs.current.get(currentPC);
        if (followInstruction && pcElement && scrollContainerRef.current) {
            pcElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentPC, followInstruction]);


    // Navigation vers une section
    const scrollToSection = useCallback((section: MemorySection) => {
        let targetAddress = 0;

        switch (section) {
            case "ROM":
                targetAddress = MEMORY_MAP.ROM_START;
                break;
            case "RAM":
                targetAddress = MEMORY_MAP.OS_START;
                break;
            case "OS Disk":
                // Afficher le contenu du OS Disk (pas en mémoire, juste info)
                return;
            case "Program Disk":
                // Afficher le contenu du Program Disk (pas en mémoire, juste info)
                return;
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
    const getSection = (addr: number): string => {
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


    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h2 className="text-xl font-semibold mb-2 text-purple-400">Memory</h2>

            {/* Navigation buttons */}
            <div className="flex gap-2 mb-4 border-b border-slate-600 pb-2">
                {sections.map(section => (
                    <button
                        key={section}
                        onClick={() => scrollToSection(section)}
                        className="px-3 py-1 text-sm font-medium text-slate-300 hover:text-purple-400 hover:bg-slate-700/50 rounded transition-colors"
                    >
                        {section}
                    </button>
                ))}
            </div>

            {/* Memory Display */}
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
                    //const isInstruction = isInstructionAddress(addr);
                    const isInstruction = instructionMap.get(addr) ?? false;
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

            <div>
                <label className="flex gap-2">
                    <input type="checkbox" onClick={(event) => setFollowInstruction((event.target as any).checked)} />
                    <div>Follow current Instruction</div>
                </label>
            </div>
        </div>
    );
}

