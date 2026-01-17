
import React, { useEffect, useState } from 'react';

import { useGate } from '@/components/logical/gateHook';
import { GateType } from '@/components/logical/logical_gates'
import { SmartWire } from '@/components/logical/SmartWire';


export const LogicPage: React.FC = () => {

    return (
        <div className="p-4">
            <h1 className="text-foreground text-xl font-bold mb-4">Portes Logiques Connectées</h1>

            <DemoGates />
            <DemiAdditionneur />
            <AdditionneurComplet />
            <BasculeJK />
            <Multiplexeur />

        </div>
    );
};


const DemoGates = () => {
    const gateAnd001 = useGate(GateType.AND, { x: 50, y: 20 })
    const gateOr001 = useGate(GateType.OR, { x: 150, y: 20 },)
    const gateNot001 = useGate(GateType.NOT, { x: 50, y: 100 })

    return (
        <svg width="300" height="200" className="border border-gray-300">
            {/* AND */}
            {gateAnd001.render()}

            {/* OR */}
            {gateOr001.render()}

            <SmartWire // Link gateAnd001 => gateOr001
                fromRef={gateAnd001}
                toRef={gateOr001}
                fromOutputIdx={0}
                toInputIdx={0}
            />


            {/* NOT */}
            {gateNot001.render()}

            <SmartWire // Link gateNot001 => gateOr001
                fromRef={gateNot001}
                toRef={gateOr001}
                fromOutputIdx={0}
                toInputIdx={1}
            />

        </svg>
    );
}


const DemiAdditionneur = () => {
    // Entrées
    const entreeA = useGate(GateType.BTN, { x: 20, y: 50 });
    const entreeB = useGate(GateType.BTN, { x: 20, y: 100 });

    // Calcul
    const xorSomme = useGate(GateType.XOR, { x: 120, y: 50 });
    const andRetenue = useGate(GateType.AND, { x: 120, y: 100 });

    return (
        <svg width="250" height="200" className="border border-gray-300">
            {entreeA.render()}
            {entreeB.render()}
            {xorSomme.render()}
            {andRetenue.render()}

            <SmartWire fromRef={entreeA} toRef={xorSomme} toInputIdx={0} />
            <SmartWire fromRef={entreeB} toRef={xorSomme} toInputIdx={1} />
            <SmartWire fromRef={entreeA} toRef={andRetenue} toInputIdx={0} />
            <SmartWire fromRef={entreeB} toRef={andRetenue} toInputIdx={1} />
        </svg>
    );
};




const AdditionneurComplet = () => {
    // Entrées: A, B, Cin (retenue entrante)
    const entreeA = useGate(GateType.BTN, { x: 20, y: 30 });
    const entreeB = useGate(GateType.BTN, { x: 20, y: 70 });
    const entreeCin = useGate(GateType.BTN, { x: 20, y: 110 });

    // Premier demi-additionneur (A ⊕ B)
    const xor1 = useGate(GateType.XOR, { x: 100, y: 50 });
    const and1 = useGate(GateType.AND, { x: 100, y: 90 });

    // Deuxième demi-additionneur ((A ⊕ B) ⊕ Cin)
    const xor2 = useGate(GateType.XOR, { x: 180, y: 70 });

    // OR pour la retenue sortante
    const orRetenue = useGate(GateType.OR, { x: 180, y: 120 });
    const and2 = useGate(GateType.AND, { x: 140, y: 140 });

    return (
        <svg width="300" height="200" className="border border-gray-300">
            {entreeA.render()}
            {entreeB.render()}
            {entreeCin.render()}
            {xor1.render()}
            {and1.render()}
            {xor2.render()}
            {and2.render()}
            {orRetenue.render()}

            {/* Premier demi-additionneur */}
            <SmartWire fromRef={entreeA} toRef={xor1} toInputIdx={0} />
            <SmartWire fromRef={entreeB} toRef={xor1} toInputIdx={1} />
            <SmartWire fromRef={entreeA} toRef={and1} toInputIdx={0} />
            <SmartWire fromRef={entreeB} toRef={and1} toInputIdx={1} />

            {/* Deuxième demi-additionneur */}
            <SmartWire fromRef={xor1} toRef={xor2} toInputIdx={0} />
            <SmartWire fromRef={entreeCin} toRef={xor2} toInputIdx={1} />

            {/* Calcul retenue sortante */}
            <SmartWire fromRef={xor1} toRef={and2} toInputIdx={0} />
            <SmartWire fromRef={entreeCin} toRef={and2} toInputIdx={1} />
            <SmartWire fromRef={and1} toRef={orRetenue} toInputIdx={0} />
            <SmartWire fromRef={and2} toRef={orRetenue} toInputIdx={1} />
        </svg>
    );
};


const BasculeJK = () => {
    // Entrées J, K, Clock
    const entreeJ = useGate(GateType.BTN, { x: 20, y: 30 });
    const entreeK = useGate(GateType.BTN, { x: 20, y: 70 });
    const entreeClock = useGate(GateType.BTN, { x: 20, y: 110 });

    // NOR gates pour la bascule
    const nor1 = useGate(GateType.NOR, { x: 100, y: 40 });
    const nor2 = useGate(GateType.NOR, { x: 100, y: 90 });

    // AND gates pour les entrées conditionnées
    const and1 = useGate(GateType.AND, { x: 160, y: 30 });
    const and2 = useGate(GateType.AND, { x: 160, y: 70 });
    const and3 = useGate(GateType.AND, { x: 160, y: 110 });
    const and4 = useGate(GateType.AND, { x: 160, y: 150 });

    return (
        <svg width="280" height="220" className="border border-gray-300">
            {entreeJ.render()}
            {entreeK.render()}
            {entreeClock.render()}
            {nor1.render()}
            {nor2.render()}
            {and1.render()}
            {and2.render()}
            {and3.render()}
            {and4.render()}

            {/* Connexions typiques d'une bascule JK */}
            <SmartWire fromRef={entreeJ} toRef={and1} toInputIdx={0} />
            <SmartWire fromRef={entreeClock} toRef={and1} toInputIdx={1} />
            <SmartWire fromRef={nor2} toRef={and1} toInputIdx={2} />

            <SmartWire fromRef={entreeK} toRef={and2} toInputIdx={0} />
            <SmartWire fromRef={entreeClock} toRef={and2} toInputIdx={1} />
            <SmartWire fromRef={nor1} toRef={and2} toInputIdx={2} />

            {/*
            <SmartWire fromRef={and1} toRef={nor1} toInputIdx={0} />
            <SmartWire fromRef={and2} toRef={nor2} toInputIdx={1} />
            */}

            {/* Rétroactions */}
            {/*
            <SmartWire fromRef={nor1} toRef={nor2} toInputIdx={0} />
            <SmartWire fromRef={nor2} toRef={nor1} toInputIdx={1} />
            */}
        </svg>
    );
};



const Multiplexeur = () => {
    // Entrées: I0, I1, Select
    const entreeI0 = useGate(GateType.BTN, { x: 20, y: 30 });
    const entreeI1 = useGate(GateType.BTN, { x: 20, y: 70 });
    const entreeSelect = useGate(GateType.BTN, { x: 20, y: 110 });

    // NOT pour l'inverse du select
    const notSelect = useGate(GateType.NOT, { x: 100, y: 110 });

    // AND gates
    const and0 = useGate(GateType.AND, { x: 160, y: 40 });
    const and1 = useGate(GateType.AND, { x: 160, y: 80 });

    // OR pour la sortie
    const orSortie = useGate(GateType.OR, { x: 220, y: 60 });

    return (
        <svg width="280" height="150" className="border border-gray-300">
            {entreeI0.render()}
            {entreeI1.render()}
            {entreeSelect.render()}
            {notSelect.render()}
            {and0.render()}
            {and1.render()}
            {orSortie.render()}

            {/* Connexions */}
            <SmartWire fromRef={entreeSelect} toRef={notSelect} toInputIdx={0} />

            <SmartWire fromRef={entreeI0} toRef={and0} toInputIdx={0} />
            <SmartWire fromRef={notSelect} toRef={and0} toInputIdx={1} />

            <SmartWire fromRef={entreeI1} toRef={and1} toInputIdx={0} />
            <SmartWire fromRef={entreeSelect} toRef={and1} toInputIdx={1} />

            <SmartWire fromRef={and0} toRef={orSortie} toInputIdx={0} />
            <SmartWire fromRef={and1} toRef={orSortie} toInputIdx={1} />
        </svg>
    );
};

