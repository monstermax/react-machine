
import { programs } from "@/lib/programs";
import type { ComputerHook } from "@/hooks/useComputer";


export type PanelControlsProps = {
    computerHook: ComputerHook;
    currentProgram: string | null;
    loadProgram: () => void;
    setCurrentProgram: React.Dispatch<React.SetStateAction<string | null>>;
}


export const PanelControls: React.FC<PanelControlsProps> = (props) => {
    const { computerHook, currentProgram } = props;
    const { cpuHook, ramHook } = computerHook;
    const { loadProgram, setCurrentProgram } = props;

    const currentProgramInfo = currentProgram ? programs[currentProgram] : null;


    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-2 text-green-400">Controls</h2>

            <div className="mb-4 flex gap-4 items-center flex-wrap">
                <label className="text-sm font-medium text-slate-300">Select Program:</label>
                <select
                    value={currentProgram ?? ''}
                    onChange={(e) => setCurrentProgram(e.target.value || null)}
                    className="bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white"
                >
                    <option key={"none"} value={""}>
                        None
                    </option>
                    {Object.entries(programs).map(([key, prog]) => (
                        <option key={key} value={key}>
                            {prog.name} - {prog.description}
                        </option>
                    ))}
                </select>

                <div className="flex gap-3">
                    <button
                        onClick={loadProgram}
                        disabled={!currentProgram}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                        Load Program
                    </button>
                    <button
                        onClick={cpuHook.executeClockCycle}
                        disabled={cpuHook.halted}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 px-6 py-2 rounded transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                        Step
                    </button>
                    <button
                        onClick={() => {
                            cpuHook.reset();
                            ramHook.setStorage(new Map());
                        }}
                        className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="mt-4 p-4 bg-slate-900/50 rounded border border-slate-600">
                {currentProgramInfo && (
                    <>
                        <div className="text-sm text-slate-300">
                            <strong className="text-blue-400">Program:</strong> {currentProgramInfo.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            {currentProgramInfo.description}
                        </div>
                        <div className="mt-2 text-xs text-green-400">
                            <strong>Expected:</strong> {currentProgramInfo.expectedResult}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

