
import { MEMORY_MAP } from "@/lib/memory_map";
import { useCallback, useState } from "react";


export const useInterrupt = (): InterruptHook => {
    const [enabled, setEnabled] = useState(0);
    const [pending, setPending] = useState(0);
    const [handlerAddr, setHandlerAddr] = useState(0);


    const read = useCallback((port: number): number => {
        switch (port) {
            case MEMORY_MAP.INTERRUPT_ENABLE: return enabled;
            case MEMORY_MAP.INTERRUPT_PENDING: return pending;
            case MEMORY_MAP.INTERRUPT_HANDLER: return handlerAddr;
            default: return 0;
        }
    }, [enabled, pending, handlerAddr])


    const write = useCallback((port: number, value: number): void => {
        switch (port) {
            case MEMORY_MAP.INTERRUPT_ENABLE:
                setEnabled(value & 0xFF);
                break;
            case MEMORY_MAP.INTERRUPT_HANDLER:
                setHandlerAddr(value & 0xFFFF);
                break;
        }
    }, [enabled, pending, handlerAddr])


    const requestInterrupt = (irq: number): void => {
        setPending(pending => pending |= (1 << irq));
    }

    const clearInterrupt = (irq: number): void => {
        setPending(pending => pending &= ~(1 << irq));
    }


    const romHook: InterruptHook = {
        read,
        write,
        requestInterrupt,
        clearInterrupt,
    };

    return romHook;
};


export type InterruptHook = {
    read: (address: number) => number
    write: (address: number, value: number) => void
    requestInterrupt: (irq: number) => void
    clearInterrupt: (irq: number) => void
};

