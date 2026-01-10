
import { EventEmitter } from "eventemitter3";

import type { IoDeviceType, u8 } from "@/types/cpu.types";


/**
 * BUZZER - Générateur de sons simples
 * 
 * Ports:
 * - BUZZER_FREQ (0x00): Fréquence (0-255) → mappée à 100-2000 Hz
 * - BUZZER_DURATION (0x01): Durée en dizaines de ms (0-255 → 0-2550ms)
 * 
 * Écriture sur BUZZER_DURATION déclenche le son
 */


const PORTS = {
    BUZZER_FREQ: 0x00,
    BUZZER_DURATION: 0x01,
} as const;


export class Buzzer extends EventEmitter {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;

    private frequency: number = 440; // Hz
    private isPlaying: boolean = false;

    // Web Audio API
    private audioContext: AudioContext | null = null;
    private oscillator: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;


    constructor(name: string, ioPort: u8 | null = null) {
        //console.log(`Initializing Buzzer`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = name;
        this.type = 'Audio';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port
    }


    // Initialiser AudioContext à la première utilisation
    getAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
    }


    // Arrêter le son en cours
    stopSound(): void {
        if (this.oscillator) {
            try {
                this.oscillator.stop();
                this.oscillator.disconnect();
            } catch (e) {
                // Déjà arrêté
            }
            this.oscillator = null;
        }
        if (this.gainNode) {
            this.gainNode.disconnect();
            this.gainNode = null;
        }
        this.isPlaying = false;
    };


    // Jouer un son
    playSound(freq: number, durationMs: number) {
        // Arrêter son précédent
        this.stopSound();

        if (durationMs === 0) return;

        const audioContext = this.getAudioContext();

        // Créer oscillateur
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'square'; // Son type buzzer
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

        // Volume avec fade out pour éviter les clics
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + durationMs / 1000);

        // Connecter
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Démarrer
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + durationMs / 1000);

        this.oscillator = oscillator;
        this.gainNode = gainNode;
        this.isPlaying = true;

        // Auto-cleanup
        oscillator.onended = () => {
            this.stopSound();
        };

        console.log(`🔊 Buzzer: ${freq.toFixed(0)} Hz for ${durationMs} ms`);
    }


    read(port: u8): u8 {
        switch (port) {
            case PORTS.BUZZER_FREQ:
                // Retourner la fréquence actuelle (mappée inversement)
                return Math.round((this.frequency - 100) / 7.45) as u8;

            case PORTS.BUZZER_DURATION:
                // Retourner 1 si en train de jouer, 0 sinon
                return (this.isPlaying ? 1 : 0) as u8;

            default:
                console.warn(`Buzzer: Unknown read port 0x${port.toString(16)}`);
                return 0 as u8;
        }
    }


    write(port: u8, value: u8): void {
        switch (port) {
            case PORTS.BUZZER_FREQ:
                // Mapper 0-255 → 100-2000 Hz (échelle logarithmique serait mieux mais bon)
                const freq = 100 + (value * 7.45); // ~100-2000 Hz
                this.frequency = freq;
                break;

            case PORTS.BUZZER_DURATION:
                // Durée en dizaines de ms (0-255 → 0-2550 ms)
                const durationMs = value * 10;
                this.playSound(this.frequency, durationMs);
                break;

            default:
                console.warn(`Buzzer: Unknown write port 0x${port.toString(16)}`);
                break;
        }
    };


    reset(): void {
        this.stopSound();
        this.frequency = 440;
        console.log("🔊 Buzzer: Reset");
    }


};

