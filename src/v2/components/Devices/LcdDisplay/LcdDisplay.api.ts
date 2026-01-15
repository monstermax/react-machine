
import { EventEmitter } from "eventemitter3";

import type { IoDeviceType, u8 } from "@/types/cpu.types";



export class LcdDisplay extends EventEmitter {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;

    public width: number;
    public height: number;
    public display: string[][];
    public cursorRow: number = 0;
    public cursorCol: number = 0;
    public cursorVisible: boolean = true;


    constructor(name: string, ioPort: u8 | null = null, width=16, height=2) {
        //console.log(`Initializing LcdDisplay`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.type = 'Time';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port

        this.width = width;
        this.height = height;
        this.display = Array(height).fill(null).map(() => Array(width).fill(' '))
    }


    read(port: u8): u8 {
        // LCD est write-only
        return 0 as u8;
    }


    write(port: u8, value: u8): void {
        switch (port) {
            case 0x00: // LCD_DATA - Écrire un caractère
                if (this.cursorRow < this.height && this.cursorCol < this.width) {
                    const char = String.fromCharCode(value);
                    this.display[this.cursorRow][this.cursorCol] = char;

                    // Auto-avancer curseur

                    this.cursorCol = this.cursorCol + 1

                    if (this.cursorCol >= this.width) {
                        this.cursorCol = 0;
                        this.cursorRow = (this.cursorRow + 1) % this.height;

                        this.emit('state', { cursorRow: this.cursorRow })
                    }

                    this.emit('state', { cursorCol: this.cursorCol })
                }
                break;

            case 0x01: // LCD_COMMAND
                switch (value) {
                    case 0x01: // Clear
                        this.display = Array(this.height).fill(null).map(() => Array(this.width).fill(' '));
                        this.cursorRow = 0;
                        this.cursorCol = 0;
                        this.emit('state', { cursorCol: this.cursorCol, cursorRow: this.cursorRow, display: this.display })
                        break;

                    case 0x02: // Home
                        this.cursorRow = 0;
                        this.cursorCol = 0;
                        this.emit('state', { cursorCol: this.cursorCol, cursorRow: this.cursorRow })
                        break;

                    case 0x0C: // Display ON, cursor OFF
                        this.cursorVisible = false;
                        this.emit('state', { cursorVisible: this.cursorVisible })
                        break;

                    case 0x0E: // Display ON, cursor ON
                        this.cursorVisible = true;
                        this.emit('state', { cursorVisible: this.cursorVisible })
                        break;

                    case 0x10: // Cursor left
                        this.cursorCol = Math.max(0, this.cursorCol - 1);
                        this.emit('state', { cursorCol: this.cursorCol })
                        break;

                    case 0x14: // Cursor right
                        this.cursorCol = Math.min(this.width - 1, this.cursorCol + 1);
                        this.emit('state', { cursorCol: this.cursorCol })
                        break;
                }
                break;

            case 0x02: // LCD_CURSOR - Position curseur (row * 16 + col)
                const row = Math.floor(value / this.width) % this.height;
                const col = value % this.width;
                this.cursorRow = row;
                this.cursorCol = col;
                this.emit('state', { cursorCol: this.cursorCol, cursorRow: this.cursorRow })
                break;
        }
    }


    reset() {
        this.display = Array(this.height).fill(null).map(() => Array(this.width).fill(' '));
        this.cursorRow = 0;
        this.cursorCol = 0;
        this.cursorVisible = true;

        this.emit('state', { cursorCol: this.cursorCol, cursorRow: this.cursorRow, display: this.display, cursorVisible: this.cursorVisible })
    }


    getText(): string[] {
        return this.display.map(row => row.join(''));
    }

};

