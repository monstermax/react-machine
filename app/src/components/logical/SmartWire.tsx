
import { useEffect, useMemo } from "react";

import type { GateHook } from "./gateHook";


export type SmartWireProps = {
    fromRef: GateHook,
    toRef: GateHook,
    fromOutputIdx?: number,
    toInputIdx: number,
};


export const SmartWire: React.FC<SmartWireProps> = (props) => {
    const { fromRef, toRef, fromOutputIdx=0, toInputIdx } = props;

    // Calculer les positions de connexion
    const fromX = fromRef.position.x + 40; // Sortie de la porte AND
    const fromY = fromRef.position.y + 15; // Centre vertical

    const toX = useMemo(() => toRef.position.x - (toInputIdx === 0 ? 15 : 15), [toRef]);
    const toY = useMemo(() => toRef.position.y + (toInputIdx === 0 ? 8 : 22), [toRef]);

    // L'état actif dépend de la sortie de la porte source
    const active = useMemo(() => fromRef.outputs[fromOutputIdx] || false, [fromRef]);


    useEffect(() => {
        if (!toRef || !fromRef) return;

        toRef.setInput(toInputIdx, fromRef.outputs[fromOutputIdx])
    }, [fromRef.outputs])


    useEffect(() => {
        if (!toRef || !fromRef) return;
        //console.log('add connection:', fromRef.gateType, toRef.gateType)
        toRef.setInputConnection(toInputIdx, fromRef)
        fromRef.setOutputConnection(fromOutputIdx, toRef)
    }, [])


    return (
        <path
            d={`M ${fromX} ${fromY} L ${toX} ${toY}`}
            stroke={active ? "#ef4444" : "#64748b"}
            strokeWidth={active ? 3 : 2}
            fill="none"
        />
    );
};



