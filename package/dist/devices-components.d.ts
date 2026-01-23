import * as cpuApi from '@/v2/api';
import { default as default_2 } from 'react';

export declare const Buzzer: default_2.FC<BuzzerProps>;

declare type BuzzerProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.Buzzer) => void;
};

declare const Console_2: default_2.FC<ConsoleProps>;
export { Console_2 as Console }

declare type ConsoleProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    open?: boolean;
    width?: number;
    height?: number;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.Console) => void;
};

export declare const Keyboard: default_2.FC<KeyboardProps>;

declare type KeyboardProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    open?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.Keyboard) => void;
};

export declare const LcdDisplay: default_2.FC<LcdDisplayProps>;

declare type LcdDisplayProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    open?: boolean;
    width?: number;
    height?: number;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.LcdDisplay) => void;
};

export declare const LedsDisplay: default_2.FC<LedsDisplayProps>;

declare type LedsDisplayProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    open?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.LedsDisplay) => void;
};

export declare const PixelDisplay: default_2.FC<PixelDisplayProps>;

declare type PixelDisplayProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    open?: boolean;
    width?: number;
    height?: number;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.PixelDisplay) => void;
};

export declare const Rng: default_2.FC<RngProps>;

declare type RngProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.Rng) => void;
};

export declare const Rtc: default_2.FC<RtcProps>;

declare type RtcProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.Rtc) => void;
};

export declare const SevenSegmentDisplay: default_2.FC<SevenSegmentDisplayProps>;

declare type SevenSegmentDisplayProps = {
    name: string;
    ioPort: number | u8 | null;
    hidden?: boolean;
    open?: boolean;
    displays?: number;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.SevenSegmentDisplay) => void;
};

export declare const StorageDisk: default_2.FC<StorageDiskProps>;

declare type StorageDiskProps = {
    name: string;
    ioPort: u8 | number | null;
    hidden?: boolean;
    data?: Map<u16, u8> | [u16, u8][];
    persistent?: boolean;
    size?: number;
    open?: boolean;
    children?: default_2.ReactNode;
    onInstanceCreated?: (cpu: cpuApi.StorageDisk) => void;
};

declare type u16 = number & {
    readonly __brand: 'u16';
};

declare type u8 = number & {
    readonly __brand: 'u8';
};

export { }
