
import { type JSX, useState, useRef, useMemo, useEffect } from 'react';


export enum GateType {
    NOT = 0,
    AND = 1,
    OR = 2,
    XOR = 3,
    NAND = 4,
    NOR = 5,
    XNOR = 6,
    TRUE = 7,
    FALSE = 8,
    BTN = 9,
}


type LogicalGate = {
    inputs: number,
    outputs: number,
    resolve: (inputs: boolean[]) => boolean,
}


export const LogicalGates: Record<GateType, LogicalGate> = {
    [GateType.NOT]  : { inputs: 1, outputs: 1, resolve: (inputs: [boolean]): boolean => !inputs[0] },
    [GateType.AND]  : { inputs: 2, outputs: 1, resolve: (inputs: [boolean, boolean]): boolean => inputs[0] && inputs[1] },
    [GateType.OR]   : { inputs: 2, outputs: 1, resolve: (inputs: [boolean, boolean]): boolean => inputs[0] || inputs[1] },
    [GateType.XOR]  : { inputs: 2, outputs: 1, resolve: (inputs: [boolean, boolean]): boolean => inputs[0] !== inputs[1] },
    [GateType.NAND] : { inputs: 2, outputs: 1, resolve: (inputs: [boolean, boolean]): boolean => !(inputs[0] && inputs[1]) },
    [GateType.NOR]  : { inputs: 2, outputs: 1, resolve: (inputs: [boolean, boolean]): boolean => !(inputs[0] || inputs[1]) },
    [GateType.XNOR] : { inputs: 2, outputs: 1, resolve: (inputs: [boolean, boolean]): boolean => inputs[0] === inputs[1] },
    [GateType.TRUE] : { inputs: 0, outputs: 1, resolve: (): boolean => true },
    [GateType.FALSE]: { inputs: 0, outputs: 1, resolve: (): boolean => false },
    [GateType.BTN]  : { inputs: 1, outputs: 1, resolve: (inputs: [boolean]): boolean => inputs[0] },
}

