import * as cpuApi from '@/v2/api';
import { default as default_2 } from 'react';

export declare const Clock: default_2.FC<ClockProps>;

declare type ClockProps = {
    frequency?: number;
    hidden?: boolean;
    open?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.Clock) => void;
};

export declare const Computer: default_2.FC<{
    view?: ViewType;
    children?: default_2.ReactNode;
}>;

export declare const Cpu: default_2.FC<CpuProps>;

export declare const CpuInstructions: default_2.FC<InstructionsProps>;

declare type CpuProps = {
    hidden?: boolean;
    open?: boolean;
    cores?: number;
    type?: string;
    active?: boolean;
    controls?: boolean;
    registers?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.Cpu) => void;
};

declare type DevicesManagerProps = {
    hidden?: boolean;
    open?: boolean;
    internal?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.DevicesManager) => void;
};

export declare const Dma: default_2.FC<DmaProps>;

declare type DmaProps = {
    ioPort?: number | u8 | null;
    open?: boolean;
    hidden?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.Dma) => void;
};

export declare const ExternalDevices: default_2.FC<DevicesManagerProps>;

export declare const IDE: default_2.FC<{
    hidden?: boolean;
    open?: boolean;
}>;

declare type InstructionsProps = {
    hidden?: boolean;
    open?: boolean;
};

export declare const InternalDevices: default_2.FC<DevicesManagerProps>;

export declare const Interrupt: default_2.FC<InterruptProps>;

declare type InterruptProps = {
    ioPort?: number | u8 | null;
    hidden?: boolean;
    open?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.Interrupt) => void;
};

export declare const Memory: default_2.FC<MemoryBusProps>;

declare type MemoryBusProps = {
    hidden?: boolean;
    open?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.MemoryBus) => void;
};

export declare const MemoryMap: default_2.FC<MemoryMapProps>;

declare type MemoryMapProps = {
    hidden?: boolean;
    open?: boolean;
};

export declare const Motherboard: default_2.FC<MotherboardProps>;

declare type MotherboardProps = {
    hidden?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.Motherboard) => void;
};

export declare const PowerSupply: default_2.FC<PowerSupplyProps>;

declare type PowerSupplyProps = {
    hidden?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.PowerSupply) => void;
};

export declare const Ram: default_2.FC<RamProps>;

declare type RamProps = {
    data?: Map<u16, u8> | [u16, u8][];
    size?: number;
    open?: boolean;
    hidden?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.Ram) => void;
};

export declare const Rom: default_2.FC<RomProps>;

declare type RomProps = {
    data?: Map<u16, u8> | [u16, u8][];
    size?: number;
    open?: boolean;
    hidden?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.Rom) => void;
};

export declare const Timer: default_2.FC<TimerProps>;

declare type TimerProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.Timer) => void;
};

declare type u16 = number & {
    readonly __brand: 'u16';
};

declare type u8 = number & {
    readonly __brand: 'u8';
};

declare type ViewType = 'hidden' | 'closed' | 'open_simple' | 'open_advanced';

export { }
