
import { EventEmitter } from "eventemitter3";

import { U8 } from "@/v2/lib/integers";
import { MEMORY_MAP } from "@/v2/lib/memory_map_16x8_bits";

import type { IoDeviceType, u16, u8 } from "@/types/cpu.types";
import type { IoDevice } from "@/v2/types/cpu_v2.types";


export class Interrupt extends EventEmitter implements IoDevice {
    public id: number;
    public name: string;
    public type: IoDeviceType;
    public ioPort: u8;

    public enabled = 0 as u8;      // IRQs activées
    public pending = 0 as u8;      // IRQs en attente
    public mask = 0 as u8;         // IRQs masquées
    public handlerAddr = MEMORY_MAP.OS_START as u16; // Default handler
    public defaultIrqCpuHandler: { cpu: number, core: number };
    public irqsCpuHandler: Map<u8, { cpu: number, core: number }>;


    constructor(ioPort: u8 | null = null) {
        //console.log(`Initializing LcdDisplay`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.name = 'interrupt';
        this.type = 'Interrupt';
        this.ioPort = ioPort ?? 0 as u8; // TODO: find free io port

        this.defaultIrqCpuHandler = { cpu: 0, core: 0 }
        this.irqsCpuHandler = new Map;
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

            case 0x06: // INTERRUPT_CPU_HANDLER
                return 0 as u8 // Write-only (a revoir)

            case 0x07: // INTERRUPT_CORE_HANDLER
                return 0 as u8 // Write-only (a revoir)

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

            case 0x06: { // INTERRUPT_CPU_HANDLER
                const irq = U8(value >> 4); // high nibble
                const irqCpuHandler = this.irqsCpuHandler.get(irq)

                if (irqCpuHandler) {
                    irqCpuHandler.cpu = U8(value & 0x0F); // low nibble

                } else {
                    console.warn(`IRQ CPU Handler not found`);
                }
                break;
            }

            case 0x07: { // INTERRUPT_CORE_HANDLER
                const irq = U8(value >> 4); // high nibble
                const irqCpuHandler = this.irqsCpuHandler.get(irq)

                if (irqCpuHandler) {
                    irqCpuHandler.core = U8(value & 0x0F); // low nibble

                } else {
                    console.warn(`IRQ CPU Handler not found`);
                }
                break;
            }

        }
    }


    // Demander une interruption (appelé par les périphériques)
    requestInterrupt(irq: u8): void {
        //console.log(`🔔 IRQ ${irq} requested (current pending: 0b${this.pending.toString(2).padStart(8, '0')})`);

        if (irq < 0 || irq > 7) {
            console.warn(`Invalid IRQ number: ${irq}`);
            return;
        }

        this.irqsCpuHandler.set(irq, this.defaultIrqCpuHandler);

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
    getPendingIRQ(callerCpuIdx?: number, callerCoreIdx?: number): u8 | null {
        const active = this.pending & this.enabled & ~this.mask;

        if (active === 0) return null;

        // Priorité simple: bit le plus bas (IRQ 0 = plus haute priorité)
        for (let irq = 0; irq < 8; irq++) {

            // envoyer l'IRQ à 1 seul CPU et 1 seul core
            const irqCpuHandler = this.irqsCpuHandler.get(irq as u8)
            if (callerCpuIdx  !== undefined && irqCpuHandler && callerCpuIdx  !== irqCpuHandler.cpu) continue;
            if (callerCoreIdx !== undefined && irqCpuHandler && callerCoreIdx !== irqCpuHandler.core) continue;

            if (active & (1 << irq)) {
                return irq as u8;
            }
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
