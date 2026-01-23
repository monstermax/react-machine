
import { toHex } from "@/v2/lib/integers";
import { MEMORY_MAP } from "@/v2/lib/memory_map_16x8_bits";
import React, { useState } from "react";




interface MemoryMapInfo {
    address: string;
    label: string;
    hex: string;
    binary: string;
}

export type MemoryMapProps = {
    hidden?: boolean;
    open?: boolean;
}

export const MemoryMap: React.FC<MemoryMapProps> = (props) => {
    const { hidden=false, open=false } = props

    const [childrenVisible, setChildrenVisible] = useState(open);
    const [searchTerm, setSearchTerm] = useState("");
    const [showHex, setShowHex] = useState(true);
    const [showBinary, setShowBinary] = useState(true);

    // Filtrer les opcodes (exclure les clés numériques inverses)
    const memoryMap: MemoryMapInfo[] = Object.entries(MEMORY_MAP)
        .map(([key, address], idx) => {
            const decimal = address;

            return {
                address: address.toString(),
                label: key as string,
                hex: toHex(decimal, 4),
                binary: decimal.toString(2).padStart(16, '0'),
                decimal: decimal,
                idx,
            };
        })
        .sort((a, b) => {
            if (a.decimal != b.decimal) {
                return a.decimal - b.decimal
            }
            return a.idx - b.idx
            //return a.label.length - b.label.length
        });

    // Filtrer par recherche
    const filteredMemoryMap = memoryMap.filter(instruction =>
        instruction.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instruction.hex.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instruction.binary.includes(searchTerm) ||
        instruction.address.includes(searchTerm)
    );


    return (
        <div className={`memory-map w-auto bg-slate-800 p-1 ${hidden ? "hidden" : ""}`}>

            {/* MemoryMap Head */}
            <div className="w-full flex bg-background-light p-2 rounded">
                <h2 className="font-bold">Memory Map (documentation)</h2>

                {true && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            {/* MemoryMap Content */}
            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-2 p-1`}>

                <div className="mt-2 rounded">
                    {/* Barre de recherche */}
                    <div className="">
                        <input
                            type="text"
                            placeholder="Search memory map..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-background-light-2xl border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Table des memory-map */}
                <div className="overflow-x-auto bg-background-light-3xl p-1 rounded max-h-[50vh]">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-700 bg-background-light-2xl">
                                {showHex && <th className="text-left py-3 px-4 font-semibold">Hex Address</th>}
                                <th className="text-left py-3 px-4 font-semibold">Mnemonic</th>
                                <th className="text-left py-3 px-4 font-semibold">Decimal Address</th>
                                {showBinary && <th className="text-left py-3 px-4 font-semibold">Binary Address</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMemoryMap.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-gray-500">
                                        No address found
                                    </td>
                                </tr>
                            ) : (
                                filteredMemoryMap.map((adressMap, index) => (
                                    <tr
                                        key={adressMap.label}
                                        className={`border-b border-gray-800 hover:bg-gray-800 ${index % 2 === 0 ? 'bg-gray-850' : ''}`}
                                    >
                                        {showHex && (
                                            <td className="py-3 px-4 font-mono text-yellow-300">
                                                {adressMap.hex}
                                            </td>
                                        )}
                                        <td className="py-3 px-4 font-mono text-green-300">
                                            {adressMap.label}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-blue-300">
                                            {adressMap.address}
                                        </td>
                                        {showBinary && (
                                            <td className="py-3 px-4 font-mono text-purple-300">
                                                {adressMap.binary}
                                            </td>
                                        )}
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
                            <div className="w-3 h-3 bg-yellow-300"></div>
                            <span>Hexadecimal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-300"></div>
                            <span>Mnemonic</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-300"></div>
                            <span>Decimal</span>
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
