
import { useCallback, useState } from "react";

import type { Device, u8 } from "@/types/cpu.types";


const LCD_ROWS = 2;
const LCD_COLS = 16;


export const useLcdDisplay = (): LCDDevice => {
    const [display, setDisplay] = useState<string[][]>(() =>
        Array(LCD_ROWS).fill(null).map(() => Array(LCD_COLS).fill(' '))
    );
    const [cursorRow, setCursorRow] = useState<number>(0);
    const [cursorCol, setCursorCol] = useState<number>(0);
    const [cursorVisible, setCursorVisible] = useState<boolean>(true);


    const read = useCallback((port: u8): u8 => {
        // LCD est write-only
        return 0 as u8;
    }, []);


    const write = useCallback((port: u8, value: u8): void => {
        switch (port) {
            case 0x00: // LCD_DATA - Écrire un caractère
                if (cursorRow < LCD_ROWS && cursorCol < LCD_COLS) {
                    const char = String.fromCharCode(value);
                    setDisplay(prev => {
                        const newDisplay = prev.map(row => [...row]);
                        newDisplay[cursorRow][cursorCol] = char;
                        return newDisplay;
                    });

                    // Auto-avancer curseur
                    setCursorCol(prev => {
                        const newCol = prev + 1;
                        if (newCol >= LCD_COLS) {
                            setCursorRow(r => (r + 1) % LCD_ROWS);
                            return 0;
                        }
                        return newCol;
                    });
                }
                break;

            case 0x01: // LCD_COMMAND
                switch (value) {
                    case 0x01: // Clear
                        setDisplay(Array(LCD_ROWS).fill(null).map(() => Array(LCD_COLS).fill(' ')));
                        setCursorRow(0);
                        setCursorCol(0);
                        break;

                    case 0x02: // Home
                        setCursorRow(0);
                        setCursorCol(0);
                        break;

                    case 0x0C: // Display ON, cursor OFF
                        setCursorVisible(false);
                        break;

                    case 0x0E: // Display ON, cursor ON
                        setCursorVisible(true);
                        break;

                    case 0x10: // Cursor left
                        setCursorCol(prev => Math.max(0, prev - 1));
                        break;

                    case 0x14: // Cursor right
                        setCursorCol(prev => Math.min(LCD_COLS - 1, prev + 1));
                        break;
                }
                break;

            case 0x02: // LCD_CURSOR - Position curseur (row * 16 + col)
                const row = Math.floor(value / LCD_COLS) % LCD_ROWS;
                const col = value % LCD_COLS;
                setCursorRow(row);
                setCursorCol(col);
                break;
        }
    }, [cursorRow, cursorCol, setDisplay, setCursorRow, setCursorCol, setCursorVisible]);


    const reset = useCallback(() => {
        setDisplay(Array(LCD_ROWS).fill(null).map(() => Array(LCD_COLS).fill(' ')));
        setCursorRow(0);
        setCursorCol(0);
        setCursorVisible(true);
    }, [setDisplay, setCursorRow, setCursorCol, setCursorVisible]);


    const getText = useCallback((): string[] => {
        return display.map(row => row.join(''));
    }, [display]);


    return {
        read,
        write,
        reset,
        getText,
        display,
        cursorRow,
        cursorCol,
        cursorVisible,
    };
};


export type LCDDevice = Device & {
    reset: () => void;
    getText: () => string[];
    display: string[][];
    cursorRow: number;
    cursorCol: number;
    cursorVisible: boolean;
};
