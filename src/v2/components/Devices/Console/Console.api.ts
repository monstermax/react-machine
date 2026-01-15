
import { EventEmitter } from "eventemitter3";

import type { IoDeviceType, u8 } from "@/types/cpu.types";



export class Console extends EventEmitter {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;

    public width: number;
    public height: number;
    public lines: string[] = [];
    public currentLine: string;
    public maxLines: number;


    constructor(name: string, ioPort: u8 | null = null, width=30, height=15, maxLines=100) {
        //console.log(`Initializing Console`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.type = 'Time';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port

        this.width = width;
        this.height = height;
        this.maxLines = maxLines;
        this.currentLine = "";
    }


    // Device IO interface
    read(port: u8): u8 {
        // Console est write-only, retourne 0
        return 0 as u8;
    }


    write(port: u8, value: u8): void {
        switch (port) {
            case 0x00: // CONSOLE_CHAR - Écrire un caractère
                const char = String.fromCharCode(value);

                if (value === 0x0A || value === 0x0D) {
                    // Newline (LF ou CR)
                    this.lines.push(this.currentLine)

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

                } else if (value >= 0x20 && value <= 0x7E) {
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


    getAllText(): string {
        const allLines = [...this.lines];

        if (this.currentLine) {
            allLines.push(this.currentLine);
        }

        return allLines.join('\n');
    }

};

