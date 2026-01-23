
import React, { useState } from "react";

import { getOpcodeDescription, Opcode } from "@/v2/cpus/default/cpu_instructions";
import type { u8 } from "@/types/cpu.types";


interface InstructionInfo {
    opcode: string;
    mnemonic: string;
    hex: string;
    binary: string;
    description: string;
}

export type InstructionsProps = {
    hidden?: boolean;
    open?: boolean;
}

export const CpuInstructions: React.FC<InstructionsProps> = (props) => {
    const { hidden=false, open=false } = props

    const [childrenVisible, setChildrenVisible] = useState(open);
    const [searchTerm, setSearchTerm] = useState("");
    const [showHex, setShowHex] = useState(true);
    const [showBinary, setShowBinary] = useState(true);

    // Filtrer les opcodes (exclure les clés numériques inverses)
    const instructions: InstructionInfo[] = Object.entries(Opcode)
        .filter(([key, value]) =>
            typeof value === 'string' &&
            !isNaN(Number(key)) &&
            key === String(Number(key)) // S'assurer que c'est bien une clé numérique
        )
        .map(([opcode, mnemonic]) => {
            const decimal = parseInt(opcode, 10) as u8;

            return {
                opcode: opcode.toString(),
                mnemonic: mnemonic as string,
                hex: "0x" + decimal.toString(16).toUpperCase().padStart(2, '0'),
                binary: decimal.toString(2).padStart(8, '0'),
                decimal: decimal,
                description: getOpcodeDescription(decimal),
            };
        })
        .sort((a, b) => a.decimal - b.decimal);

    // Filtrer par recherche
    const filteredInstructions = instructions.filter(instruction =>
        instruction.mnemonic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instruction.hex.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instruction.binary.includes(searchTerm) ||
        instruction.opcode.includes(searchTerm)
    );

    return (
        <div className={`instructions w-auto bg-violet-950 p-1 ${hidden ? "hidden" : ""}`}>

            {/* IDE Head */}
            <div className="w-full flex bg-background-light p-2 rounded">
                <h2 className="font-bold">CPU Instructions (documentation)</h2>

                {true && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* IDE Content */}
            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-2 p-1`}>

                <div className="mt-2 rounded">
                    {/* Barre de recherche */}
                    <div className="">
                        <input
                            type="text"
                            placeholder="Search instructions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-background-light-2xl border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Table des instructions */}
                <div className="overflow-x-auto bg-background-light-3xl p-1 rounded max-h-[50vh]">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-700 bg-background-light-2xl">
                                {showHex && <th className="text-left py-3 px-4 font-semibold">Hex Opcode</th>}
                                <th className="text-left py-3 px-4 font-semibold">Mnemonic</th>
                                <th className="text-left py-3 px-4 font-semibold">Decimal Opcode</th>
                                {showBinary && <th className="text-left py-3 px-4 font-semibold">Binary Opcode</th>}
                                <th className="text-left py-3 px-4 font-semibold">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInstructions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-gray-500">
                                        No instructions found
                                    </td>
                                </tr>
                            ) : (
                                filteredInstructions.map((instruction, index) => (
                                    <tr
                                        key={instruction.opcode}
                                        className={`border-b border-gray-800 hover:bg-gray-800 ${index % 2 === 0 ? 'bg-gray-850' : ''}`}
                                    >
                                        {showHex && (
                                            <td className="py-3 px-4 font-mono text-yellow-300">
                                                {instruction.hex}
                                            </td>
                                        )}
                                        <td className="py-3 px-4 font-mono text-green-300">
                                            {instruction.mnemonic}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-blue-300">
                                            {instruction.opcode}
                                        </td>
                                        {showBinary && (
                                            <td className="py-3 px-4 font-mono text-purple-300">
                                                {instruction.binary}
                                            </td>
                                        )}
                                        <td className="py-3 px-4 font-mono text-blue-300">
                                            {instruction.description}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Légende */}
                <div className="py-2 px-4 border-t border-gray-700 bg-background-light-3xl p-1 rounded">
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-300"></div>
                            <span>Mnemonic</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-300"></div>
                            <span>Hexadecimal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-300"></div>
                            <span>Opcode</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-300"></div>
                            <span>Binary</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
