
import { useCallback, useState, useEffect } from "react";

import type { Device, u8 } from "@/types/cpu.types";
import type { InterruptHook } from "../useInterrupt";
import { MEMORY_MAP } from "@/lib/memory_map";
import { U8 } from "@/lib/integers";


export const useKeyboard = (interruptHook?: InterruptHook): KeyboardDevice => {
    const [lastChar, setLastChar] = useState<u8>(0 as u8);
    const [hasChar, setHasChar] = useState<boolean>(false);
    //const [isEnable, setIsEnabled] = useState(true);


    // Écouter les touches du clavier
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignorer les touches spéciales (Ctrl, Alt, etc.)
            if (event.ctrlKey || event.altKey || event.metaKey) return;

            // Ignorer si la touche ne produit pas de caractère
            if (event.key.length !== 1) return;

            const charCode = event.key.charCodeAt(0);

            // Limiter aux caractères ASCII valides (0-127)
            if (charCode > 127) return;

            setLastChar(charCode as u8);
            setHasChar(true);

            //console.log(`⌨️  Key pressed: '${event.key}' (ASCII: ${charCode})`);

            // Déclencher interruption clavier (IRQ 1)
            if (interruptHook) {
                interruptHook.requestInterrupt(U8(MEMORY_MAP.IRQ_KEYBOARD));
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [interruptHook]);


    // Device IO interface
    const read = useCallback((port: u8): u8 => {
        switch (port) {
            case 0x00: // KEYBOARD_DATA
                return lastChar;

            case 0x01: // KEYBOARD_STATUS
                return (hasChar ? 0x01 : 0x00) as u8;

            default:
                return 0 as u8;
        }
    }, [lastChar, hasChar]);


    const write = useCallback((port: u8, value: u8): void => {
        switch (port) {
            case 0x00: // KEYBOARD_DATA - write-only pour clear
                setLastChar(0 as u8);
                setHasChar(false);
                break;

            case 0x01: // KEYBOARD_STATUS - peut être écrit pour clear le flag
                if (value === 0) {
                    setHasChar(false);
                }
                break;
        }
    }, []);


    const reset = useCallback(() => {
        setLastChar(0 as u8);
        setHasChar(false);
    }, []);


    // Fonction pour simuler une touche (pour testing)
    const simulateKeyPress = useCallback((char: string) => {
        if (char.length !== 1) return;

        const charCode = char.charCodeAt(0);
        if (charCode > 127) return;

        setLastChar(charCode as u8);
        setHasChar(true);

        if (interruptHook) {
            interruptHook.requestInterrupt(U8(MEMORY_MAP.IRQ_KEYBOARD));
        }
    }, [interruptHook]);


    const hook: KeyboardDevice = {
        read,
        write,
        reset,
        simulateKeyPress,
        lastChar,
        hasChar,
    };

    return hook;
};


export type KeyboardDevice = Device & {
    reset: () => void;
    simulateKeyPress: (char: string) => void;
    lastChar: u8;
    hasChar: boolean;
};
