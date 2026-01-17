
import { type JSX, useState, useRef, useMemo, useEffect } from 'react';

import { GateType, LogicalGates } from './logical_gates';
import { AND, BTN, FALSE, NAND, NOR, NOT, OR, TRUE, XNOR, XOR } from './Gates';


export type GateHook = {
    gateType: GateType;
    inputs: boolean[];
    outputs: boolean[];
    position: {
        x: number;
        y: number;
    };
    inputConnections: (GateHook | null)[]
    outputConnections: (GateHook | null)[]
    render: () => JSX.Element | null;
    setInputs: React.Dispatch<React.SetStateAction<boolean[]>>;
    setInput: (idx: number, value: boolean) => void;
    setInputConnection: (fromOutputIdx: number, gate: GateHook | null) => void
    setOutputConnection: (toInputIdx: number, gate: GateHook | null) => void
}



export const useGate = (gateType: GateType, position: { x: number, y: number }, initialInputs?: boolean[]) => {
    const logicalGate = LogicalGates[gateType];
    const inputsCount = logicalGate.inputs
    const outputsCount = logicalGate.outputs

    const [inputs, setInputs] = useState<boolean[]>(initialInputs ?? new Array(inputsCount).fill(false));
    const [outputs, setOutputs] = useState<boolean[]>(new Array(outputsCount).fill(false));
    const [inputConnections, setInputConnections] = useState<(null | GateHook)[]>(new Array(outputsCount).fill(null));
    const [outputConnections, setOutputConnections] = useState<(null | GateHook)[]>(new Array(outputsCount).fill(null));

    const setInput = (idx: number, value: boolean) => {
        setInputs(old => old.map((input, _idx) => _idx === idx ? value : input))
    }


    useEffect(() => {
        if (!logicalGate.resolve) return;

        const outputs = logicalGate.resolve(inputs);

        //console.log(`gateType ${gateType} => new outputs:`, outputs)
        setOutputs([outputs])
    }, [inputs])


    const setInputConnection = (fromOutputIdx: number, gate: GateHook | null) => {
        setInputConnections(old => old.map((input, _idx) => _idx === fromOutputIdx ? gate : input))
    }

    const setOutputConnection = (toInputIdx: number, gate: GateHook | null) => {
        setOutputConnections(old => old.map((input, _idx) => _idx === toInputIdx ? gate : input))
    }


    const render = () => {
        switch (gateType) {
            case GateType.AND:
                return <AND gate={gateHook} />;

            case GateType.OR:
                return <OR gate={gateHook} />;

            case GateType.NOT:
                return <NOT gate={gateHook} />;

            case GateType.XOR:
                return <XOR gate={gateHook} />;

            case GateType.NAND:
                return <NAND gate={gateHook} />;

            case GateType.NOR:
                return <NOR gate={gateHook} />;

            case GateType.XNOR:
                return <XNOR gate={gateHook} />;

            case GateType.TRUE:
                return <TRUE gate={gateHook} />;

            case GateType.FALSE:
                return <FALSE gate={gateHook} />;

            case GateType.BTN:
                return <BTN gate={gateHook} />;
        }

        return null;
    }


    const gateHook: GateHook = {
        gateType,
        inputs,
        outputs,
        position,
        inputConnections,
        outputConnections,
        render,
        setInputs,
        setInput,
        setInputConnection,
        setOutputConnection,
    }

    return gateHook;
}
