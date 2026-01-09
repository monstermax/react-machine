
import type { u16, u8 } from "@/types/cpu.types";


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



