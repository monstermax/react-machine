
import type { LCDDevice } from "@/hooks/devices/useLCD";


export const WidgetLCDDisplay: React.FC<{ device: LCDDevice }> = ({ device }) => {
    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h2 className="text-xl font-semibold mb-3 text-blue-400">LCD 16x2</h2>

            <div className="bg-green-900/30 border-4 border-slate-600 rounded-lg p-3">
                {device.display.map((row, rowIndex) => (
                    <div key={rowIndex} className="font-mono text-lg leading-tight">
                        {row.map((char, colIndex) => {
                            const isCursor = device.cursorVisible &&
                                rowIndex === device.cursorRow &&
                                colIndex === device.cursorCol;

                            return (
                                <span
                                    key={colIndex}
                                    className={`inline-block w-[1.2ch] text-center ${isCursor
                                            ? 'bg-green-400 text-slate-900 animate-pulse'
                                            : 'text-green-400'
                                        }`}
                                >
                                    {char}
                                </span>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="mt-3 text-xs text-slate-400 p-2 bg-slate-900/30 rounded">
                <div>📍 I/O: 0xFFA0-0xFFA2 (Device 0x0A)</div>
                <div>📊 Cursor: Row {device.cursorRow}, Col {device.cursorCol}</div>
                <div className="mt-1 text-slate-500">
                    Commands: 0x01=Clear, 0x02=Home, 0x0C/0x0E=Cursor
                </div>
            </div>
        </div>
    );
};
