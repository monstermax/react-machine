
import { useEffect, useRef, useState } from "react";

import { IoDevice } from "./IoDevice";

import type { u8 } from "@/types";


export type ConsoleDeviceParams = {
    type: string;
    vendor?: string;
    model?: string;
    width?: number;
    height?: number;
    maxLines?: number;
}

export class ConsoleDevice extends IoDevice {
    idx = 0 as u8;
    name = 'console';
    type = 'output';
    vendor = '';
    model = '';

    width = 30;
    height = 15;
    lines = [] as string[];
    maxLines = 100;
    currentLine = "";


    constructor(name: string, params: ConsoleDeviceParams) {
        super();

        this.name = name;
        this.type = params.type;
        this.vendor = params.vendor ?? '';
        this.model = params.model ?? '';
        this.width = params.width ?? this.width;
        this.height = params.height ?? this.height;
        this.maxLines = params.maxLines ?? this.maxLines;
    }


    read(port: u8): u8 {
        return 0 as u8; // write only
    }

    write(port: u8, value: u8): void {
        switch (port) {
            case 0x00: // CONSOLE_CHAR - Écrire un caractère
                const char = String.fromCharCode(value);

                //console.log('console char:', char)

                if (value === 0x0A || value === 0x0D) {
                    // Newline (LF ou CR)
                    this.lines.push(this.currentLine)
                    //console.log('console lines:', this.lines)

                    // Limiter le nombre de lignes
                    if (this.lines.length > this.maxLines) {
                        this.lines = this.lines.slice(-this.maxLines);
                        return;
                    }

                    this.currentLine = "";
                    //console.log(`📟 Console: "${currentLine}"`);

                    this.emit('state', { lines: this.lines, currentLine: this.currentLine })

                } else if (value === 0x08) {
                    // Backspace
                    this.currentLine = this.currentLine.slice(0, -1);
                    this.emit('state', { currentLine: this.currentLine })

                } else if (value >= 0x20 /* && value <= 0x7E */) {
                    // Caractères imprimables ASCII
                    this.currentLine = this.currentLine + char;
                    this.emit('state', { currentLine: this.currentLine })

                } else {
                    // Autres caractères de contrôle - ignorer
                    console.warn(`📟 Console: Unprintable character 0x${value.toString(16)}`);
                }
                break;

            case 0x01: // CONSOLE_CLEAR - Clear screen
                this.reset()
                //console.log(`📟 Console: Screen cleared`);
                break;
        }
    }

    reset() {
        this.lines = [];
        this.currentLine = "";
        this.emit('state', { lines: this.lines, currentLine: this.currentLine })
    }
}


//export const consoleDevice = new ConsoleDevice('console', { type: 'output' });



export type ConsoleProps = {
    deviceInstance: ConsoleDevice | null
}


export const Console: React.FC<ConsoleProps> = (props) => {
    const { deviceInstance } = props;

    const [lines, setLines] = useState<string[]>([])
    const [currentLine, setCurrentLine] = useState<string>("")
    const scrollRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (!deviceInstance) return;

        deviceInstance.on('state', (state) => {
            //console.log('Console state update', state)

            if (state.lines !== undefined) {
                setLines(state.lines)
            }

            if (state.currentLine !== undefined) {
                setCurrentLine(state.currentLine)
            }
        })

    }, [deviceInstance])

    const handleClear = () => {
        if (!deviceInstance) return;
        deviceInstance.write(0x01 as u8, 0 as u8); // CONSOLE_CLEAR
    };


    if (!deviceInstance) {
        return (
            <>Loading Console...</>
        );
    }


    return (
        <>
            <div className="flex justify-between gap-4">
                <div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleClear}
                            className="mt-1 mx-2 ms-auto bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="bg-black mx-auto rounded-lg p-4 font-mono text-sm overflow-y-auto border border-green-500/30"
                    style={{ height: `${deviceInstance.height * 1.15}em`, width: `${deviceInstance.width * 1.1}ch` }}
                >
                    {lines.length === 0 && !currentLine ? (
                        <div className="text-green-500/50 italic">
                            Console output will appear here...
                        </div>
                    ) : (
                        <>
                            {lines.map((line, i) => (
                                <div key={i} className="text-green-400">
                                    {line || '\u00A0'} {/* Non-breaking space pour lignes vides */}
                                </div>
                            ))}
                            {currentLine && (
                                <div className="text-green-400">
                                    {currentLine}
                                    <span className="animate-pulse">_</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
