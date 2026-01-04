
import { useState, useCallback, useRef, useEffect, useMemo } from "react";

import type { u8 } from "@/types/cpu.types";


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


export const useBuzzer = (): BuzzerHook => {
    //console.log('RENDER ComputerPage.useComputer.useIo.useBuzzer')

    const [frequency, setFrequency] = useState<number>(440); // Hz
    const [isPlaying, setIsPlaying] = useState<boolean>(false);


    // Web Audio API
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);


    // Initialiser AudioContext à la première utilisation
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);


    // Arrêter le son en cours
    const stopSound = useCallback(() => {
        if (oscillatorRef.current) {
            try {
                oscillatorRef.current.stop();
                oscillatorRef.current.disconnect();
            } catch (e) {
                // Déjà arrêté
            }
            oscillatorRef.current = null;
        }
        if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
            gainNodeRef.current = null;
        }
        setIsPlaying(false);
    }, [setIsPlaying]);


    // Jouer un son
    const playSound = useCallback((freq: number, durationMs: number) => {
        // Arrêter son précédent
        stopSound();

        if (durationMs === 0) return;

        const audioContext = getAudioContext();

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

        oscillatorRef.current = oscillator;
        gainNodeRef.current = gainNode;
        setIsPlaying(true);

        // Auto-cleanup
        oscillator.onended = () => {
            stopSound();
        };

        console.log(`🔊 Buzzer: ${freq.toFixed(0)} Hz for ${durationMs} ms`);
    }, [setIsPlaying, getAudioContext, stopSound]);


    const read = useCallback((port: u8): u8 => {
        switch (port) {
            case PORTS.BUZZER_FREQ:
                // Retourner la fréquence actuelle (mappée inversement)
                return Math.round((frequency - 100) / 7.45) as u8;

            case PORTS.BUZZER_DURATION:
                // Retourner 1 si en train de jouer, 0 sinon
                return (isPlaying ? 1 : 0) as u8;

            default:
                console.warn(`Buzzer: Unknown read port 0x${port.toString(16)}`);
                return 0 as u8;
        }
    }, [frequency, isPlaying]);


    const write = useCallback((port: u8, value: u8) => {
        switch (port) {
            case PORTS.BUZZER_FREQ:
                // Mapper 0-255 → 100-2000 Hz (échelle logarithmique serait mieux mais bon)
                const freq = 100 + (value * 7.45); // ~100-2000 Hz
                setFrequency(freq);
                break;

            case PORTS.BUZZER_DURATION:
                // Durée en dizaines de ms (0-255 → 0-2550 ms)
                const durationMs = value * 10;
                playSound(frequency, durationMs);
                break;

            default:
                console.warn(`Buzzer: Unknown write port 0x${port.toString(16)}`);
                break;
        }
    }, [frequency, playSound]);


    const reset = useCallback(() => {
        stopSound();
        setFrequency(440);
        console.log("🔊 Buzzer: Reset");
    }, [stopSound]);


    // Cleanup au démontage
    useEffect(() => {
        return () => {
            stopSound();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [stopSound]);


    const buzzerHook: BuzzerHook = useMemo(() => ({
        read,
        write,
        reset,
        state: {
            frequency,
            isPlaying,
        },
    }), [
        frequency,
        isPlaying,
    ]);

    return buzzerHook;
};


export type BuzzerHook = {
    read: (port: u8) => u8;
    write: (port: u8, value: u8) => void;
    reset: () => void;
    state: {
        frequency: number;
        isPlaying: boolean;
    };
};
