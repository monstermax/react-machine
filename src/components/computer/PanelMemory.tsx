
import { useCallback, useEffect, useRef } from "react";

import { getOpcodeName, INSTRUCTIONS_WITH_OPERAND, INSTRUCTIONS_WITH_TWO_OPERANDS, Opcode } from "@/lib/instructions";
import { isROM, isRAM, MEMORY_MAP } from "@/lib/memory_map";

import type { ComputerHook } from "@/hooks/useComputer";
import type { Memory } from "@/types/cpu.types";


export type PanelMemoryProps = {
    computerHook: ComputerHook;
}


type MemorySection = "ROM" | "RAM" | "OS Disk" | "Program Disk";


export const PanelMemory: React.FC<PanelMemoryProps> = (props) => {
    const { computerHook } = props;
    const { cpuHook, romHook, ramHook, ioHook } = computerHook;

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const addressRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    // Combiner toute la mémoire (ROM + RAM)
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

        return view;
    }, [romHook.storage, ramHook.storage]);

    // Déterminer si une adresse est une instruction
    const isInstructionAddress = useCallback((addr: number, storage: Memory): boolean => {
        const memArray = Array.from(storage.entries()).sort(([a], [b]) => a - b);

        for (let i = 0; i < memArray.length; i++) {
            const [address, value] = memArray[i];

            if (address === addr && Object.values(Opcode).includes(value)) {
                // Vérifier si c'est un opérande d'une instruction précédente
                if (i > 0) {
                    const [prevAddr, prevValue] = memArray[i - 1];
                    // 1 opérande
                    if (INSTRUCTIONS_WITH_OPERAND.includes(prevValue) && prevAddr === addr - 1) {
                        return false;
                    }
                    // 2 opérandes (premier ou second)
                    if (INSTRUCTIONS_WITH_TWO_OPERANDS.includes(prevValue) &&
                        (prevAddr === addr - 1 || prevAddr === addr - 2)) {
                        return false;
                    }
                }
                if (i > 1) {
                    const [prevPrevAddr, prevPrevValue] = memArray[i - 2];
                    // Second opérande d'une instruction avec 2 opérandes
                    if (INSTRUCTIONS_WITH_TWO_OPERANDS.includes(prevPrevValue) &&
                        prevPrevAddr === addr - 2) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }, []);

    const currentMemory = fullMemoryView();
    const currentPC = cpuHook.getRegister("PC");

    // Auto-scroll vers PC quand il change
    useEffect(() => {
        const pcElement = addressRefs.current.get(currentPC);
        if (pcElement && scrollContainerRef.current) {
            //pcElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentPC]);

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

        if (isRAM(addr)) {
            if (addr >= MEMORY_MAP.OS_START && addr < MEMORY_MAP.PROGRAM_START) {
                return "RAM / OS";
            }
            return "RAM / PROGRAM";
        }

        return "I/O";
    };


    const sections: MemorySection[] = ["ROM", "RAM", "OS Disk", "Program Disk"];
    const sortedMemory = Array.from(currentMemory.entries()).sort(([a], [b]) => a - b);

    // Grouper par section pour afficher les séparateurs
    let lastSection = "";


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
                className="font-mono text-sm space-y-1 max-h-[450px] overflow-y-auto"
            >
                <div className="text-xs text-slate-400 mb-2">
                    Total: {currentMemory.size} bytes
                </div>

                {sortedMemory.map(([addr, val]) => {
                    const section = getSection(addr);
                    const isPC = addr === currentPC;
                    const isInstruction = isInstructionAddress(addr, currentMemory);
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

            {/* Disks info */}
            <div className="mt-4 pt-4 border-t border-slate-600 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/50 p-2 rounded">
                    <div className="text-slate-400">OS Disk:</div>
                    <div className="text-green-400">{ioHook.osDisk.storage.size} bytes</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded">
                    <div className="text-slate-400">Program Disk:</div>
                    <div className="text-green-400">{ioHook.programDisk.storage.size} bytes</div>
                </div>
            </div>
        </div>
    );
}

