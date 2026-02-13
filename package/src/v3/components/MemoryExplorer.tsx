
import { useEffect, useState } from 'react';

import { toHex } from '@/v2/lib/integers';


interface MemoryExplorerProps {
    memory: Uint8Array<ArrayBuffer> | null;
    offset?: number;
    bytesPerLine?: number;
    linesPerPage?: number;
    open?: boolean;
}

export const MemoryExplorer = (props: MemoryExplorerProps) => {
    const { memory, offset = 0, bytesPerLine = 16, linesPerPage = 16, open: isOpenAtStart=false } = props

    const [data, setData] = useState<Uint8Array>(new Uint8Array());
    const [page, setPage] = useState(0);
    const [isOpen, setIsOpen] = useState(isOpenAtStart);

    useEffect(() => {
        if (!memory) return;
        const view = memory; //new Uint8Array(memory.buffer);
        setData(view);
    }, [memory]);

    const bytesPerPage = bytesPerLine * linesPerPage;
    const totalPages = Math.ceil(data.length / bytesPerPage);
    const startOffset = offset + page * bytesPerPage;

    const bytesToHex = (bytes: Uint8Array, start: number, len: number) => {
        //let hex = '';
        const values: string[] = [];
        for (let i = 0; i < len; i++) {
            if (start + i < bytes.length) {
                const value = bytes[start + i].toString(16).padStart(2, '0');
                //hex += value + ' ';
                values.push(value);

            } else {
                //hex += '   ';
            }
        }

        return (
            <div className="flex">
                {values.map((v, idx) => (
                    <span key={idx} className={`px-1 ${idx===len/2 ? "ps-4" : ""}`}>{v}</span>
                ))}
            </div>
        );
    };

    const bytesToAscii = (bytes: Uint8Array, start: number, len: number) => {
        //let ascii = '';
        const values: string[] = [];

        for (let i = 0; i < len; i++) {
            if (start + i < bytes.length) {
                const b = bytes[start + i];
                const value = b >= 32 && b <= 126 ? String.fromCharCode(b) : '.';
                values.push(value);
                //ascii += value;
                //if (i === len/2-1) ascii += ' | ';
            }
        }

        return (
            <div className="flex">
                {values.map((v, idx) => (
                    <span key={idx} className={`px-1 ${idx===len/2 ? "ps-4" : ""}`}>{v}</span>
                ))}
            </div>
        );
    };

    const goToPage = (newPage: number) => {
        setPage(Math.max(0, Math.min(newPage, totalPages - 1)));
    };


    return (
        <div className="font-mono text-sm bg-gray-900 text-gray-100 p-4 rounded">
            {/* Navigation */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                <div className="text-gray-400">
                    Memory Explorer • Page {page + 1}/{totalPages || 1}
                </div>

                {isOpen && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => goToPage(page - 1)}
                            disabled={page === 0}
                            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800 rounded"
                        >
                            ←
                        </button>
                        <input
                            type="number"
                            value={page + 1}
                            onChange={(e) => goToPage(Number(e.target.value) - 1)}
                            className="w-16 px-2 py-1 bg-gray-800 text-center rounded"
                            min={1}
                            max={totalPages}
                        />
                        <button
                            onClick={() => goToPage(page + 1)}
                            disabled={page >= totalPages - 1}
                            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800 rounded"
                        >
                            →
                        </button>
                    </div>
                )}

                <button
                    className="bg-background px-2 py-1 rounded cursor-pointer"
                    onClick={() => setIsOpen(b => !b)}
                >
                    {isOpen ? "▲" : "▼"}
                </button>
            </div>

            {isOpen && (
                <>
                    {/* Memory view */}
                    <div className="grid grid-cols-[80px_1fr_auto] gap-2 overflow-auto">
                        <div className="text-gray-400">Offset</div>
                        <div className="text-gray-400">Hex</div>
                        <div className="text-gray-400">ASCII</div>

                        {Array.from({ length: linesPerPage }).map((_, i) => {
                            const addr = startOffset + i * bytesPerLine;
                            return (
                                <div key={addr} className="contents">
                                    <div className="text-blue-400">
                                        0x{addr.toString(16).padStart(4, '0')}
                                    </div>
                                    <div className="font-mono">
                                        {bytesToHex(data, addr, bytesPerLine)}
                                    </div>
                                    <div className="font-mono text-gray-300">
                                        {bytesToAscii(data, addr, bytesPerLine)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick jump */}
                    <div className="mt-4 pt-2 border-t border-gray-700 flex gap-2 text-xs">
                        <span className="text-gray-400">Jump to:</span>
                        {[0x0000, 0x0300, 0x0500, 0x0700, 0x1000].map(addr => (
                            <button
                                key={addr}
                                onClick={() => setPage(Math.floor(addr / bytesPerPage))}
                                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                            >
                                {toHex(addr, 4)}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
