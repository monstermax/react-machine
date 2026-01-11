
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import * as cpuApi from '../../api/api';
import { ComputerContainer } from './ComputerContainer';


const ComputerContext = createContext<ComputerContextType | undefined>(undefined);


export function Computer({ children }: { children: React.ReactNode }) {
    const computerRef = useRef<cpuApi.Computer | null>(null)
    const cpuRef = useRef<cpuApi.Cpu | null>(null)
    const memoryBusRef = useRef<cpuApi.MemoryBus | null>(null)
    const devicesManagerRef = useRef<cpuApi.DevicesManager | null>(null)
    const ramRef = useRef<cpuApi.Ram | null>(null)


    const computerState: ComputerContextType = {
        computerRef,
        cpuRef,
        memoryBusRef,
        devicesManagerRef,
        ramRef,
    }


    return (
        <ComputerContext.Provider value={computerState}>
            <ComputerContainer>
                {children}
            </ComputerContainer>
        </ComputerContext.Provider>
    );
}


interface ComputerContextType {
    computerRef: React.RefObject<cpuApi.Computer | null>;
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


