
import { useState } from "react";

import type { KeyboardDevice } from "@/v1/hooks/devices/useKeyboard";


export const WidgetKeyboard: React.FC<{ device: KeyboardDevice }> = ({ device }) => {
    //console.log('RENDER ComputerPage.IosDevices.WidgetKeyboard')

    const [inputValue, setInputValue] = useState("");

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key.length === 1) {
            device.simulateKeyPress(e.key);
        }
    };

    const handleSimulate = () => {
        if (inputValue) {
            for (const char of inputValue) {
                device.simulateKeyPress(char);
            }
            setInputValue("");
        }
    };

    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h2 className="text-xl font-semibold mb-3 text-purple-400">Keyboard</h2>

            <div className="space-y-4">
                {/* Status */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-900/50 rounded">
                    <div>
                        <div className="text-xs text-slate-400 mb-1">Last Char:</div>
                        <div className="text-2xl font-mono text-green-400">
                            {device.lastChar > 0 ? (
                                <>
                                    '{String.fromCharCode(device.lastChar)}'
                                    <span className="text-sm text-slate-400 ml-2">
                                        (0x{device.lastChar.toString(16).padStart(2, '0')})
                                    </span>
                                </>
                            ) : (
                                <span className="text-slate-600">--</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 mb-1">Status:</div>
                        <div className="flex items-center gap-2 mt-2">
                            <div 
                                className={`w-4 h-4 rounded-full ${
                                    device.hasChar ? 'bg-green-500 animate-pulse' : 'bg-slate-700'
                                }`}
                            />
                            <span className="text-sm text-slate-300">
                                {device.hasChar ? 'Char Available' : 'Waiting'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Simulate input */}
                <div className="p-3 bg-slate-900/50 rounded border border-slate-600">
                    <div className="text-xs text-slate-400 mb-2">Simulate Keyboard Input:</div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type or paste text..."
                            className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                        <button
                            onClick={handleSimulate}
                            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm transition-colors"
                        >
                            Send
                        </button>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                        💡 Tip: Type directly or paste text and click "Send"
                    </div>
                </div>

                {/* Info */}
                <div className="text-xs text-slate-400 p-2 bg-slate-900/30 rounded">
                    <div>📍 I/O Address: 0xFF50-0xFF51</div>
                    <div>📍 IRQ: 1 (Keyboard)</div>
                </div>
            </div>
        </div>
    );
};

