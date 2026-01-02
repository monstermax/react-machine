
import { useCallback, useState, useRef, useEffect } from "react";

import { MEMORY_MAP } from "@/lib/memory_map";
import type { u16, u8 } from "@/types/cpu.types";


export const useInterrupt = () => {
    const [enabled, setEnabled] = useState(0 as u8);      // IRQs activées
    const [pending, setPending] = useState(0 as u8);      // IRQs en attente
    const [mask, setMask] = useState(0 as u8);            // IRQs masquées
    const [handlerAddr, setHandlerAddr] = useState(MEMORY_MAP.OS_START as u16); // Default handler


    // Refs synchronisées automatiquement
    const enabledRef = useRef(enabled);
    const pendingRef = useRef(pending);
    const maskRef = useRef(mask);

    useEffect(() => {
        enabledRef.current = enabled;
    }, [enabled]);

    useEffect(() => {
        pendingRef.current = pending;
    }, [pending]);

    useEffect(() => {
        maskRef.current = mask;
    }, [mask]);


    // Lecture depuis les ports IO
    const read = useCallback((address: u8): u8 => {
        const port = address;

        switch (port) {
            case 0x00: // INTERRUPT_ENABLE
                return enabledRef.current;

            case 0x01: // INTERRUPT_PENDING (read-only)
                // Retourne seulement les IRQs qui sont:
                // 1. En attente (pending)
                // 2. Activées (enabled) 
                // 3. Non masquées (mask)
                return (pendingRef.current & enabledRef.current & ~maskRef.current) as u8;

            case 0x02: // INTERRUPT_ACK est write-only, retourne 0
                return (0) as u8;

            case 0x03: // INTERRUPT_MASK
                return maskRef.current;

            case 0x04: // INTERRUPT_HANDLER low byte
                return (handlerAddr & 0xFF) as u8;
            case 0x05: // INTERRUPT_HANDLER high byte
                return ((handlerAddr >> 8) & 0xFF) as u8;

            default:
                return (0) as u8;
        }
    }, [handlerAddr]);


    // Écriture vers les ports IO
    const write = useCallback((address: u8, value: u8): void => {
        const port = address;

        switch (port) {
            case 0x00: // INTERRUPT_ENABLE
                setEnabled((value & 0xFF) as u8);
                break;

            case 0x02: // INTERRUPT_ACK - acquitter une IRQ
                const irqToAck = value & 0x07;
                setPending(prev => (prev & ~(1 << irqToAck)) as u8);
                break;

            case 0x03: // INTERRUPT_MASK
                setMask((value & 0xFF) as u8);
                break;

            case 0x04: // INTERRUPT_HANDLER low byte
                setHandlerAddr(prev => ((prev & 0xFF00) | (value & 0xFF)) as u16);
                break;
            case 0x05: // INTERRUPT_HANDLER high byte
                setHandlerAddr(prev => ((prev & 0x00FF) | ((value & 0xFF) << 8)) as u16);
                break;

            // INTERRUPT_PENDING (0x01) est read-only
        }
    }, []);


    // Demander une interruption (appelé par les périphériques)
    const requestInterrupt = useCallback((irq: u8): void => {
        if (irq < 0 || irq > 7) {
            console.warn(`Invalid IRQ number: ${irq}`);
            return;
        }

        setPending(prev => {
            const newPending = (prev | (1 << irq)) as u8;
            console.log(`🔔 IRQ ${irq} requested - Pending: 0b${newPending.toString(2).padStart(8, '0')}`);
            return newPending;
        });
    }, []);


    // Vérifier si une interruption est prête
    const hasPendingInterrupt = useCallback((): boolean => {
        const active = pendingRef.current & enabledRef.current & ~maskRef.current;
        return active !== 0;
    }, []);


    // Obtenir l'IRQ la plus prioritaire en attente
    const getPendingIRQ = useCallback((): u8 | null => {
        const active = pendingRef.current & enabledRef.current & ~maskRef.current;

        if (active === 0) return null;

        // Priorité simple: bit le plus bas (IRQ 0 = plus haute priorité)
        for (let i = 0; i < 8; i++) {
            if (active & (1 << i)) return i as u8;
        }

        return null;
    }, []);


    // Fonction pour le CPU pour acquitter
    const acknowledgeInterrupt = useCallback((irq: u8): void => {
        setPending(prev => {
            const newPending = (prev & ~(1 << irq)) as u8;
            console.log(`✅ IRQ ${irq} acknowledged - Pending: 0b${newPending.toString(2).padStart(8, '0')}`);
            return newPending;
        });
    }, []);


    // Reset
    const reset = useCallback(() => {
        setEnabled(0 as u8);
        setPending(0 as u8);
        setMask(0 as u8);
        setHandlerAddr(MEMORY_MAP.OS_START as u16);
    }, []);


    const hook: InterruptHook = {
        // Fonctions Device
        read,
        write,

        // Fonctions de contrôle
        requestInterrupt,
        acknowledgeInterrupt,
        hasPendingInterrupt,
        getPendingIRQ,
        reset,

        // État (pour UI/debug)
        enabled,
        pending,
        mask,
        handlerAddr,
    };

    return hook;
};



export type InterruptHook = {
    read: (address: u8) => u8;
    write: (address: u8, value: u8) => void;
    requestInterrupt: (irq: u8) => void;
    acknowledgeInterrupt: (irq: u8) => void;
    hasPendingInterrupt: () => boolean;
    getPendingIRQ: () => u8 | null;
    reset: () => void;
    enabled: u8;
    pending: u8;
    mask: u8;
    handlerAddr: u16;
};

