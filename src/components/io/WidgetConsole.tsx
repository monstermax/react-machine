
import { useEffect, useRef } from "react";

import type { ConsoleDevice } from "@/hooks/devices/useConsole";


export const WidgetConsole: React.FC<{ device: ConsoleDevice }> = ({ device }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll vers le bas quand du nouveau texte arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [device.lines, device.currentLine]);

    const handleClear = () => {
        device.write(0x01 as any, 0 as any); // CONSOLE_CLEAR
    };

    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-green-400">Console</h2>
                <button
                    onClick={handleClear}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                >
                    Clear
                </button>
            </div>

            {/* Terminal Display */}
            <div 
                ref={scrollRef}
                className="bg-black rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto border border-green-500/30"
            >
                {device.lines.length === 0 && !device.currentLine ? (
                    <div className="text-green-500/50 italic">
                        Console output will appear here...
                    </div>
                ) : (
                    <>
                        {device.lines.map((line, i) => (
                            <div key={i} className="text-green-400">
                                {line || '\u00A0'} {/* Non-breaking space pour lignes vides */}
                            </div>
                        ))}
                        {device.currentLine && (
                            <div className="text-green-400">
                                {device.currentLine}
                                <span className="animate-pulse">_</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Info */}
            <div className="mt-3 text-xs text-slate-400 p-2 bg-slate-900/30 rounded">
                <div>📍 I/O Address: 0xFF70-0xFF71</div>
                <div>📝 Lines: {device.lines.length} / Current: "{device.currentLine}"</div>
            </div>
        </div>
    );
};
