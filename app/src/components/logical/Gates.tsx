
import { type JSX, useState, useRef, useMemo, useEffect } from 'react';

import type { GateHook } from './gateHook';


export type GateProps = {
    gate: GateHook;
}


export const TRUE: React.FC<GateProps & { onClick?: any }> = (props) => {
    const { gate, onClick: handleClick } = props;
    const { outputs, position } = gate;
    const { x, y } = position;

    return (
        <g>
            <circle
                cx={x}
                cy={y+15}
                r="15"
                fill={true ? "#22c55e" : "#cbd5e1"}
                stroke="#334155"
                strokeWidth="2"
            />

            <text
                x={x}
                y={y+20}
                textAnchor="middle"
                className="text-sm font-bold fill-white"
                >
                1
            </text>

            <circle
                cx={x+25}
                cy={y+15}
                r="4"
                fill={true ? "#22c55e" : "#94a3b8"}
                className="cursor-pointer"
                onClick={() => { if (handleClick) handleClick() }}
            />
        </g>
    );
};


export const FALSE: React.FC<GateProps & { onClick?: any }> = (props) => {
    const { gate, onClick: handleClick } = props;
    const { outputs, position } = gate;
    const { x, y } = position;

    return (
        <g>
            <circle
                cx={x}
                cy={y+15}
                r="15"
                fill={false ? "#ef4444" : "#cbd5e1"}
                stroke="#334155" strokeWidth="2"
            />

            <text
                x={x}
                y={y+20}
                textAnchor="middle"
                className="text-sm font-bold fill-white"
                >
                0
            </text>

            <circle
                cx={x+25}
                cy={y+15}
                r="4"
                fill={false ? "#ef4444" : "#94a3b8"}
                className="cursor-pointer"
                onClick={() => { if (handleClick) handleClick() }}
            />
        </g>
    );
};


export const BTN: React.FC<GateProps> = (props) => {
    const { gate } = props;
    const { inputs, outputs, position, setInput } = gate;
    const { x, y } = position;

    const [active, setActive] = useState(false);

    useEffect(() => {
        setInput(0, active)
    }, [active])

    const toggle = () => {
        setActive(b => !b)
    }

    if (active) {
        return <TRUE {...props} onClick={() => toggle()} />;
    }

    return <FALSE {...props} onClick={() => toggle()} />;
};


export const AND: React.FC<GateProps> = (props) => {
    const { gate } = props
    const { inputs, outputs, setInputs, position, inputConnections } = gate

    const { x, y } = position;

    return (
        <g>
            <path
                d={`M ${x} ${y} Q ${x + 30} ${y} ${x + 30} ${y + 15} T ${x} ${y + 30}`}
                fill={outputs[0] ? "#4ade80" : "#cbd5e1"}
                stroke="#334155"
                strokeWidth="2"
            />
            <line x1={x} y1={y} x2={x} y2={y + 30} stroke="#334155" strokeWidth="2" />

            {/* Entrées */}
            <circle
                cx={x - 10}
                cy={y + 8}
                r="4"
                fill={inputs[0] ? "#4ade80" : "#94a3b8"}
                className={`${inputConnections[0] ? "" : "cursor-pointer"} `}
                onClick={() => { if (!inputConnections[0]) setInputs([!inputs[0], inputs[1]]) }}
            />
            <circle
                cx={x - 10}
                cy={y + 22}
                r="4"
                fill={inputs[1] ? "#4ade80" : "#94a3b8"}
                className={`${inputConnections[1] ? "" : "cursor-pointer"} `}
                onClick={() => { if (!inputConnections[1]) setInputs([inputs[0], !inputs[1]]) }}
            />

            {/* Sortie */}
            <circle
                cx={x + 40}
                cy={y + 15}
                r="4"
                fill={outputs[0] ? "#4ade80" : "#94a3b8"}
                id="and-output"
            />
        </g>
    );
};


export const OR: React.FC<GateProps> = (props) => {
    const { gate } = props
    const { inputs, outputs, setInputs, position, inputConnections } = gate

    const { x, y } = position;

    return (
        <g>
            <path
                d={`M ${x} ${y} Q ${x + 40} ${y + 15} ${x} ${y + 30}`}
                fill={outputs[0] ? "#60a5fa" : "#cbd5e1"}
                stroke="#334155"
                strokeWidth="2"
            />
            <path
                d={`M ${x - 10} ${y + 10} Q ${x + 5} ${y + 15} ${x - 10} ${y + 20}`}
                fill={outputs[0] ? "#60a5fa" : "#cbd5e1"}
                stroke="#334155"
                strokeWidth="2"
            />

            {/* Entrées */}
            <circle
                cx={x - 15}
                cy={y + 8}
                r="4"
                fill={inputs[0] ? "#60a5fa" : "#94a3b8"}
                className={`${inputConnections[0] ? "" : "cursor-pointer"} `}
                onClick={() => { if (!inputConnections[0]) setInputs([!inputs[0], inputs[1]]) }}
            />
            <circle
                cx={x - 15}
                cy={y + 22}
                r="4"
                fill={inputs[1] ? "#60a5fa" : "#94a3b8"}
                className={`${inputConnections[1] ? "" : "cursor-pointer"} `}
                onClick={() => { if (!inputConnections[1]) setInputs([inputs[0], !inputs[1]]) }}
            />

            {/* Sortie */}
            <circle
                cx={x + 45}
                cy={y + 15}
                r="4"
                fill={outputs[0] ? "#60a5fa" : "#94a3b8"}
            />
        </g>
    );
};


export const NOT: React.FC<GateProps> = (props) => {
    const { gate } = props
    const { inputs, outputs, setInputs, position, inputConnections } = gate

    const { x, y } = position;

    return (
        <g>
            <polygon
                points={`${x},${y} ${x + 30},${y + 15} ${x},${y + 30}`}
                fill={outputs[0] ? "#f87171" : "#cbd5e1"}
                stroke="#334155"
                strokeWidth="2"
            />
            <circle cx={x + 35} cy={y + 15} r="3" fill="#334155" />

            {/* Entrée */}
            <circle
                cx={x - 10}
                cy={y + 15}
                r="4"
                fill={inputs[0] ? "#f87171" : "#94a3b8"}
                className={`${inputConnections[0] ? "" : "cursor-pointer"} `}
                onClick={() => { if (!inputConnections[0]) setInputs([!inputs[0]]) }}
            />

            {/* Sortie */}
            <circle
                cx={x + 45}
                cy={y + 15}
                r="4"
                fill={outputs[0] ? "#f87171" : "#94a3b8"}
            />
        </g>
    );
};


export const XOR: React.FC<GateProps> = (props) => {
    const { gate } = props
    const { inputs, outputs, setInputs, position, inputConnections } = gate

    const { x, y } = position;

    return (
        <g>
            <path
                d={`M ${x} ${y} Q ${x + 40} ${y + 15} ${x} ${y + 30}`}
                fill={outputs[0] ? "#c084fc" : "#cbd5e1"}
                stroke="#334155"
                strokeWidth="2"
            />
            <path
                d={`M ${x - 5} ${y} Q ${x + 35} ${y + 15} ${x - 5} ${y + 30}`}
                fill="transparent"
                stroke="#334155"
                strokeWidth="2"
            />
            <path
                d={`M ${x - 10} ${y + 10} Q ${x + 5} ${y + 15} ${x - 10} ${y + 20}`}
                fill={outputs[0] ? "#c084fc" : "#cbd5e1"}
                stroke="#334155"
                strokeWidth="2"
            />

            {/* Entrées */}
            <circle
                cx={x - 15}
                cy={y + 8}
                r="4"
                fill={inputs[0] ? "#c084fc" : "#94a3b8"}
                className={`${inputConnections[0] ? "" : "cursor-pointer"} `}
                onClick={() => { if (!inputConnections[0]) setInputs([!inputs[0], inputs[1]]) }}
            />
            <circle
                cx={x - 15}
                cy={y + 22}
                r="4"
                fill={inputs[1] ? "#c084fc" : "#94a3b8"}
                className={`${inputConnections[1] ? "" : "cursor-pointer"} `}
                onClick={() => { if (!inputConnections[1]) setInputs([inputs[0], !inputs[1]]) }}
            />

            {/* Sortie */}
            <circle
                cx={x + 45}
                cy={y + 15}
                r="4"
                fill={outputs[0] ? "#c084fc" : "#94a3b8"}
            />
        </g>
    );
};


export const NAND: React.FC<GateProps> = (props) => {
    const { gate } = props
    const { inputs, outputs, setInputs, position, inputConnections } = gate

    const { x, y } = position;

    return (
        <g>
            <path
                d={`M ${x} ${y} Q ${x + 30} ${y} ${x + 30} ${y + 15} T ${x} ${y + 30}`}
                fill={outputs[0] ? "#f59e0b" : "#cbd5e1"}
                stroke="#334155"
                strokeWidth="2"
            />
            <line x1={x} y1={y} x2={x} y2={y + 30} stroke="#334155" strokeWidth="2" />

            <circle cx={x + 35} cy={y + 15} r="3" fill="#334155" />

            {/* Entrées */}
            <circle
                cx={x - 10}
                cy={y + 8}
                r="4"
                fill={inputs[0] ? "#f59e0b" : "#94a3b8"}
                className={`${inputConnections[0] ? "" : "cursor-pointer"} `}
                onClick={() => { if (!inputConnections[0]) setInputs([!inputs[0], inputs[1]]) }}
            />
            <circle
                cx={x - 10}
                cy={y + 22}
                r="4"
                fill={inputs[1] ? "#f59e0b" : "#94a3b8"}
                className={`${inputConnections[1] ? "" : "cursor-pointer"} `}
                onClick={() => { if (!inputConnections[1]) setInputs([inputs[0], !inputs[1]]) }}
            />

            {/* Sortie */}
            <circle
                cx={x + 45}
                cy={y + 15}
                r="4"
                fill={outputs[0] ? "#f59e0b" : "#94a3b8"}
            />
        </g>
    );
};


export const NOR: React.FC<GateProps> = (props) => {
    const { gate } = props
    const { inputs, outputs, setInputs, position, inputConnections } = gate

    const { x, y } = position;

    return (
        <g>
            <path
                d={`M ${x} ${y} Q ${x + 40} ${y + 15} ${x} ${y + 30}`}
                fill={outputs[0] ? "#10b981" : "#cbd5e1"}
                stroke="#334155"
                strokeWidth="2"
            />
            <path
                d={`M ${x - 10} ${y + 10} Q ${x + 5} ${y + 15} ${x - 10} ${y + 20}`}
                fill={outputs[0] ? "#10b981" : "#cbd5e1"}
                stroke="#334155"
                strokeWidth="2"
            />

            <circle cx={x + 35} cy={y + 15} r="3" fill="#334155" />

            {/* Entrées */}
            <circle
                cx={x - 15}
                cy={y + 10}
                r="4"
                fill={inputs[0] ? "#10b981" : "#94a3b8"}
                className={`${inputConnections[0] ? "" : "cursor-pointer"} `}
                onClick={() => { if (!inputConnections[0]) setInputs([!inputs[0], inputs[1]]) }}
            />
            <circle
                cx={x - 15}
                cy={y + 20}
                r="4"
                fill={inputs[1] ? "#10b981" : "#94a3b8"}
                className={`${inputConnections[1] ? "" : "cursor-pointer"} `}
                onClick={() => { if (!inputConnections[1]) setInputs([inputs[0], !inputs[1]]) }}
            />

            {/* Sortie */}
            <circle
                cx={x + 45}
                cy={y + 15}
                r="4"
                fill={outputs[0] ? "#10b981" : "#94a3b8"}
            />
        </g>
    );
};


export const XNOR: React.FC<GateProps> = (props) => {
    const { gate } = props
    const { inputs, outputs, setInputs, position, inputConnections } = gate

    const { x, y } = position;

    return (
        <g>
            <path
                d={`M ${x} ${y} Q ${x + 40} ${y + 15} ${x} ${y + 30}`}
                fill={outputs[0] ? "#8b5cf6" : "#cbd5e1"}
                stroke="#334155"
                strokeWidth="2"
            />
            <path
                d={`M ${x - 5} ${y} Q ${x + 35} ${y + 15} ${x - 5} ${y + 30}`}
                fill="transparent"
                stroke="#334155"
                strokeWidth="2"
            />
            <path
                d={`M ${x - 10} ${y + 10} Q ${x + 5} ${y + 15} ${x - 10} ${y + 20}`}
                fill={outputs[0] ? "#8b5cf6" : "#cbd5e1"}
                stroke="#334155"
                strokeWidth="2"
            />

            <circle cx={x + 35} cy={y + 15} r="3" fill="#334155" />

            {/* Entrées */}
            <circle
                cx={x - 15}
                cy={y + 10}
                r="4"
                fill={inputs[0] ? "#8b5cf6" : "#94a3b8"}
                className={`${inputConnections[0] ? "" : "cursor-pointer"} `}
                onClick={() => { if (!inputConnections[0]) setInputs([!inputs[0], inputs[1]]) }}
            />
            <circle
                cx={x - 15}
                cy={y + 20}
                r="4"
                fill={inputs[1] ? "#8b5cf6" : "#94a3b8"}
                className={`${inputConnections[1] ? "" : "cursor-pointer"} `}
                onClick={() => { if (!inputConnections[1]) setInputs([inputs[0], !inputs[1]]) }}
            />

            {/* Sortie */}
            <circle
                cx={x + 45}
                cy={y + 15}
                r="4"
                fill={outputs[0] ? "#8b5cf6" : "#94a3b8"}
            />
        </g>
    );
};
