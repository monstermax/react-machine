
import { useCallback, useState, useEffect } from "react";

import type { InterruptHook } from "../useInterrupt";
import { MEMORY_MAP } from "@/lib/memory_map_16x8_bits";
import { U8 } from "@/lib/integers";

import type { u8 } from "@/types/cpu.types";
import type { Device } from "@/v1/types/cpu_v1.types";


export const useKeyboard = (interruptHook?: InterruptHook): KeyboardDevice => {
    const [lastChar, setLastChar] = useState<u8>(0 as u8);
    const [hasChar, setHasChar] = useState<boolean>(false);
    const [isEnable, setIsEnabled] = useState(true); // enable/disable handleKeyDown (but allow simulateKeyPress)
    const [irqEnabled, setIrqEnabled] = useState<boolean>(false);


    // Écouter les touches du clavier
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isEnable) return;

            // Ignorer les touches spéciales (Ctrl, Alt, etc.)
            if (event.ctrlKey || event.altKey || event.metaKey) return;

            // Ignorer si la touche ne produit pas de caractère
            if (event.key.length !== 1) return;

            const charCode = event.key.charCodeAt(0);

            // Limiter aux caractères ASCII valides (0-127)
            if (charCode > 127) return;

            setLastChar(charCode as u8);
            setHasChar(true);

            console.log(`⌨️  Key pressed: '${event.key}' (ASCII: ${charCode})`);

            // Déclencher interruption clavier (IRQ 1)
            if (irqEnabled && interruptHook?.requestInterrupt) {
                interruptHook.requestInterrupt(U8(MEMORY_MAP.IRQ_KEYBOARD));
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [interruptHook?.requestInterrupt, isEnable, irqEnabled, setLastChar, setHasChar]);


    // Device IO interface
    const read = useCallback((port: u8): u8 => {
        switch (port) {
            case 0x00: // KEYBOARD_DATA
                return lastChar;

            case 0x01: // KEYBOARD_STATUS
                return ((hasChar ? 0x01 : 0x00) | (irqEnabled ? 0x02 : 0x00)) as u8;

            default:
                return 0 as u8;
        }
    }, [lastChar, hasChar, irqEnabled]);


    const write = useCallback((port: u8, value: u8): void => {
        switch (port) {
            case 0x00: // KEYBOARD_DATA - write-only pour clear
                setLastChar(0 as u8);
                setHasChar(false);
                break;

            case 0x01: // KEYBOARD_STATUS - peut être écrit pour clear le flag
                // Bit 0: clear le flag hasChar
                if ((value & 0x01) === 0) {
                    setHasChar(false);
                }
                // Bit 1: enable/disable IRQ
                setIrqEnabled((value & 0x02) !== 0);
                break;
        }
    }, [setLastChar, setHasChar, setIrqEnabled]);


    const reset = useCallback(() => {
        setLastChar(0 as u8);
        setHasChar(false);
        setIrqEnabled(false);
    }, [setLastChar, setHasChar, setIrqEnabled]);


    // Fonction pour simuler une touche (pour testing)
    const simulateKeyPress = useCallback((char: string) => {
        if (char.length !== 1) return;

        const charCode = char.charCodeAt(0);
        if (charCode > 127) return;

        setLastChar(charCode as u8);
        setHasChar(true);

        if (interruptHook?.requestInterrupt) {
            interruptHook.requestInterrupt(U8(MEMORY_MAP.IRQ_KEYBOARD));
        }
    }, [interruptHook?.requestInterrupt, setLastChar, setHasChar]);


    const hook: KeyboardDevice = {
        isEnable,
        lastChar,
        hasChar,
        read,
        write,
        simulateKeyPress,
        setIsEnabled,
        reset,
    };

    return hook;
};


export type KeyboardDevice = Device & {
    isEnable: boolean
    lastChar: u8;
    hasChar: boolean;
    setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>
    simulateKeyPress: (char: string) => void;
    reset: () => void;
};

