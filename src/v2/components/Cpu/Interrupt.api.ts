
import { EventEmitter } from "eventemitter3";

import { U16, U8 } from "@/lib/integers";
import { isIO, isROM, MEMORY_MAP, memoryToIOPort } from "@/lib/memory_map_16x8_bits";
import type { DevicesManager } from "../Devices/DevicesManager.api";

import type { IoDeviceType, u16, u8 } from "@/types/cpu.types";


export class Interrupt extends EventEmitter {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;

    public enabled = 0 as u8;      // IRQs activées
    public pending = 0 as u8;      // IRQs en attente
    public mask = 0 as u8;         // IRQs masquées
    public handlerAddr = MEMORY_MAP.OS_START as u16; // Default handler


    constructor(ioPort: u8 | null = null) {
        //console.log(`Initializing LcdDisplay`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = 'interrupt';
        this.type = 'Interrupt';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port
    }


    // Lecture depuis les ports IO
    read(address: u8): u8 {
        const port = address - MEMORY_MAP.INTERRUPT_BASE;

        switch (port) {
            case 0x00: // INTERRUPT_ENABLE (0xFF40)
                return this.enabled;

            case 0x01: // INTERRUPT_PENDING (0xFF41)
                // Retourne seulement les IRQs qui sont:
                // 1. En attente (pending)
                // 2. Activées (enabled) 
                // 3. Non masquées (mask)
                return (this.pending & this.enabled & ~this.mask) as u8;

            case 0x02: // INTERRUPT_ACK est write-only, retourne 0
                return (0) as u8;

            case 0x03: // INTERRUPT_MASK
                return this.mask;

            case 0x04: // INTERRUPT_HANDLER_LOW
                return (this.handlerAddr & 0xFF) as u8;

            case 0x05: // INTERRUPT_HANDLER_HIGH
                return ((this.handlerAddr >> 8) & 0xFF) as u8;

            default:
                return (0) as u8;
        }
    }


    // Écriture vers les ports IO
    write(address: u8, value: u8): void {
        const port = address;

        switch (port) {
            case 0x00: // INTERRUPT_ENABLE
                this.enabled = U8(value);
                this.emit('state', { enabled: this.enabled })
                break;

            case 0x01: // INTERRUPT_PENDING (0xFF41) - READ-ONLY
                break;

            case 0x02: // INTERRUPT_ACK - acquitter une IRQ
                const irqToAck = value & 0x07;
                this.pending = (this.pending & ~(1 << irqToAck)) as u8;
                this.emit('state', { pending: this.pending })
                break;

            case 0x03: // INTERRUPT_MASK
                this.mask = (value & 0xFF) as u8;
                this.emit('state', { mask: this.mask })
                break;

            case 0x04: // INTERRUPT_HANDLER_LOW
                this.handlerAddr = ((this.handlerAddr & 0xFF00) | (value & 0xFF)) as u16;
                this.emit('state', { handlerAddr: this.handlerAddr })
                break;
            case 0x05: // INTERRUPT_HANDLER_HIGH
                this.handlerAddr = ((this.handlerAddr & 0x00FF) | ((value & 0xFF) << 8)) as u16;
                this.emit('state', { handlerAddr: this.handlerAddr })
                break;

            // INTERRUPT_PENDING (0x01) est read-only
        }
    }


    // Demander une interruption (appelé par les périphériques)
    requestInterrupt(irq: u8): void {
        //console.log(`🔔 IRQ ${irq} requested (current pending: 0b${this.pending.toString(2).padStart(8, '0')})`);

        if (irq < 0 || irq > 7) {
            console.warn(`Invalid IRQ number: ${irq}`);
            return;
        }

        this.pending = (this.pending | (1 << irq)) as u8;
        //console.log(`🔔 [IRQ ${irq}] New pending: 0b${this.pending.toString(2).padStart(8, '0')}`);

        this.emit('state', { pending: this.pending })
    }


    // Vérifier si une interruption est prête
    hasPendingInterrupt(): boolean {
        const active = this.pending & this.enabled & ~this.mask;
        return active !== 0;
    }


    // Obtenir l'IRQ la plus prioritaire en attente
    getPendingIRQ(): u8 | null {
        const active = this.pending & this.enabled & ~this.mask;

        if (active === 0) return null;

        // Priorité simple: bit le plus bas (IRQ 0 = plus haute priorité)
        for (let i = 0; i < 8; i++) {
            if (active & (1 << i)) return i as u8;
        }

        return null;
    }


    // Fonction pour le CPU pour acquitter
    acknowledgeInterrupt(irq: u8): void {
        this.pending = (this.pending & ~(1 << irq)) as u8;
        //console.log(`✅ IRQ ${irq} acknowledged - Pending: 0b${this.pending.toString(2).padStart(8, '0')}`);

        this.emit('state', { pending: this.pending })
    }


    // Reset
    reset() {
        this.enabled = 0 as u8;
        this.pending = 0 as u8;
        this.mask = 0 as u8;
        this.handlerAddr = MEMORY_MAP.OS_START as u16;

        this.emit('state', { handlerAddr: this.handlerAddr, enabled: this.enabled, pending: this.pending, mask: this.mask })
    }

};
