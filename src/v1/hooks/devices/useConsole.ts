
import { useCallback, useState } from "react";

import type { u8 } from "@/types/cpu.types";
import type { Device } from "@/v1/types/cpu_v1.types";


const MAX_CONSOLE_LINES = 100; // Nombre maximum de lignes dans le buffer


export const useConsole = (): ConsoleDevice => {
    const [lines, setLines] = useState<string[]>([]);
    const [currentLine, setCurrentLine] = useState<string>("");


    // Device IO interface
    const read = useCallback((port: u8): u8 => {
        // Console est write-only, retourne 0
        return 0 as u8;
    }, []);


    const write = useCallback((port: u8, value: u8): void => {
        switch (port) {
            case 0x00: // CONSOLE_CHAR - Écrire un caractère
                const char = String.fromCharCode(value);

                if (value === 0x0A || value === 0x0D) {
                    // Newline (LF ou CR)
                    setLines(prev => {
                        const newLines = [...prev, currentLine];
                        // Limiter le nombre de lignes
                        if (newLines.length > MAX_CONSOLE_LINES) {
                            return newLines.slice(-MAX_CONSOLE_LINES);
                        }
                        return newLines;
                    });
                    setCurrentLine("");
                    //console.log(`📟 Console: "${currentLine}"`);

                } else if (value === 0x08) {
                    // Backspace
                    setCurrentLine(prev => prev.slice(0, -1));

                } else if (value >= 0x20 && value <= 0x7E) {
                    // Caractères imprimables ASCII
                    setCurrentLine(prev => prev + char);

                } else {
                    // Autres caractères de contrôle - ignorer
                    console.warn(`📟 Console: Unprintable character 0x${value.toString(16)}`);
                }
                break;

            case 0x01: // CONSOLE_CLEAR - Clear screen
                setLines([]);
                setCurrentLine("");
                //console.log(`📟 Console: Screen cleared`);
                break;
        }
    }, [currentLine, setLines, setCurrentLine]);


    const reset = useCallback(() => {
        setLines([]);
        setCurrentLine("");
    }, []);


    const getAllText = useCallback((): string => {
        const allLines = [...lines];
        if (currentLine) {
            allLines.push(currentLine);
        }
        return allLines.join('\n');
    }, [lines, currentLine]);


    const hook: ConsoleDevice = {
        read,
        write,
        reset,
        getAllText,
        lines,
        currentLine,
    };

    return hook;
};


export type ConsoleDevice = Device & {
    reset: () => void;
    getAllText: () => string;
    lines: string[];
    currentLine: string;
};
