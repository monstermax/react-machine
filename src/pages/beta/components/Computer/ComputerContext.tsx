
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import * as cpuApi from '../../api/api';
import { ComputerContainer } from './ComputerContainer';


const ComputerContext = createContext<ComputerContextType | undefined>(undefined);


export type ViewType = 'hidden' | 'closed' | 'open_simple' | 'open_advanced'


export const Computer: React.FC<{ view?: ViewType, children: React.ReactNode }> = ({ view='open_advanced', children }) => {
    const computerRef = useRef<cpuApi.Computer | null>(null)
    const motherboardRef = useRef<cpuApi.Motherboard | null>(null)
    const cpuRef = useRef<cpuApi.Cpu | null>(null)
    const memoryBusRef = useRef<cpuApi.MemoryBus | null>(null)
    const devicesManagerRef = useRef<cpuApi.DevicesManager | null>(null)
    const ramRef = useRef<cpuApi.Ram | null>(null)


    const computerState: ComputerContextType = {
        computerRef,
        motherboardRef,
        cpuRef,
        memoryBusRef,
        devicesManagerRef,
        ramRef,
    }


    return (
        <ComputerContext.Provider value={computerState}>
            <ComputerContainer view={view}>
                {children}
            </ComputerContainer>
        </ComputerContext.Provider>
    );
}


interface ComputerContextType {
    computerRef: React.RefObject<cpuApi.Computer | null>;
    motherboardRef: React.RefObject<cpuApi.Motherboard | null>;
    cpuRef: React.RefObject<cpuApi.Cpu | null>;
    memoryBusRef: React.RefObject<cpuApi.MemoryBus | null>;
    devicesManagerRef: React.RefObject<cpuApi.DevicesManager | null>;
    ramRef: React.RefObject<cpuApi.Ram | null>;
}


export function useComputer() {
    const context = useContext(ComputerContext);

    if (context === undefined) {
        throw new Error('useComputer must be used within a Computer');
    }

    return context;
}


