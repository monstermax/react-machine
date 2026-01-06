
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

import { compileCode, compileDemo, decompileCode, decompileDemo, preCompileCode } from "@/lib/compiler";
import { toHex, U16 } from "@/lib/integers";
import { MEMORY_MAP } from "@/lib/memory_map";

import type { CompiledCode, PreCompiledCode, u16 } from "@/types/cpu.types";


type DisplayMode = "array" | "readable" | "editable";


const demoSourceCode = `
:INIT
SET_SP MEMORY_MAP.STACK_END # Init Stack

MOV_A_IMM 0x01 # clear LCD
MOV_MEM_A MEMORY_MAP.LCD_COMMAND # clear LCD

:START
CALL $LEDS_ON # Go to LEDS_ON
MOV_A_IMM 0x0f # A = Delay counter for WAIT_LOOP
CALL $WAIT_LOOP # Go to WAIT_LOOP
CALL $LEDS_OFF # Go to LEDS_OFF
JMP $END # Go to END

:LEDS_ON
MOV_A_IMM 0xff
MOV_MEM_A MEMORY_MAP.LEDS_BASE
RET

:LEDS_OFF
MOV_A_IMM 0x00
MOV_MEM_A MEMORY_MAP.LEDS_BASE
RET

:WAIT_LOOP
DEC_A
JNZ $WAIT_LOOP # Go to WAIT_LOOP
RET

:END
SYSCALL 0

`

const demoCompiledCode = `
[
    [0x00, Opcode.SET_SP]
    [0x01, 0xff]
    [0x02, 0xfe]
    [0x03, Opcode.MOV_A_IMM]
    [0x04, 0x01]
    [0x05, Opcode.MOV_MEM_A]
    [0x06, 0xa1]
    [0x07, 0xff]
    [0x08, Opcode.MOV_D_IMM]
    [0x09, 0x00]
    [0x0a, Opcode.MOV_A_IMM]
    [0x0b, 0x02]
    [0x0c, Opcode.MOV_MEM_A]
    [0x0d, 0xa1]
    [0x0e, 0xff]
    [0x0f, Opcode.JMP]
    [0x10, 0x02]
    [0x11, 0x05]
]
`;



export const CompilePage: React.FC = () => {
    const [sourceCode, setSourceCode] = useState<string>(demoSourceCode);

    const [compiledCode, setCompiledCode] = useState<PreCompiledCode | null>(null);
    const [decompiledCode, setDecompiledCode] = useState<string>("");

    const [displayMode, setDisplayMode] = useState<DisplayMode>("array");
    const [editableCode, setEditableCode] = useState<string>("");
    const [editError, setEditError] = useState<string>("");

    const [compileMemoryOffsetStr, setCompileMemoryOffsetStr] = useState('0x00');
    const [compileMemoryOffsetUint, setCompileMemoryOffsetUint] = useState<u16>(0 as u16);


    // Synchronize compileMemoryOffsetStr & compileMemoryOffsetUint
    useEffect(() => {
        const newCompileMemoryOffsetUint = Number(compileMemoryOffsetStr)
        setCompileMemoryOffsetUint(U16(newCompileMemoryOffsetUint))

    }, [compileMemoryOffsetStr])



    const handleCompile = () => {
        try {
            const result: PreCompiledCode = preCompileCode(sourceCode, compileMemoryOffsetUint);

            const result2 = compileCode(sourceCode, compileMemoryOffsetUint);
            //const { code, comments, labels } = result2;
            console.log('result2:', result2)

            setCompiledCode(result);

            // Initialiser le contenu éditable
            setEditableCode(formatCompiledCodeArray(result));
            setEditError("");

        } catch (error) {
            console.error("Erreur de compilation:", error);
            alert("Erreur lors de la compilation");
        }
    };


    const handleDecompile = () => {
        let codeToDecompile: PreCompiledCode;

        if (displayMode === "editable") {
            // Si on est en mode éditable, utiliser le code modifié
            try {
                codeToDecompile = parseCompiledCode(editableCode);
                setCompiledCode(codeToDecompile);
                setEditError("");

            } catch (error: any) {
                setEditError(error.message);
                return;
            }

        } else {
            // Sinon utiliser le code compilé existant
            if (!compiledCode) {
                alert("Veuillez d'abord compiler du code");
                return;
            }

            codeToDecompile = compiledCode;
        }

        try {
            const result: string = decompileCode(codeToDecompile);
            setDecompiledCode(result);

        } catch (error) {
            console.error("Erreur de décompilation:", error);
            alert("Erreur lors de la décompilation");
        }
    };



    const formatCompiledCodeArray = (code: PreCompiledCode): string => {
        return '[\n' + code.map(([line, value, comment, labels], idx) => {
            let result = "";

            if (labels?.length) {
                const prefix = idx === 0 ? "" : "\n";
                result += `${prefix}    // [${labels.join(' - ')}]\n`;
            }

            result += `    [${toHex(line)}, ${value}],${comment ? ` // ${comment}` : ""}`;

            return result;
        }).join('\n') + '\n]';
    };

    const formatCompiledCodeReadable = (code: PreCompiledCode): string => {
        return code.map(([line, value, comment, labels]) => {
            const lineStr = toHex(line);
            const valueStr = value.startsWith('Opcode.') ? value : toHex(parseInt(value));
            return `${lineStr}: ${valueStr}${comment ? `  # ${comment}` : ""}${labels?.length ? ` # [${labels.join(' - ')}]` : ""}`;
        }).join('\n');
    };

    const parseCompiledCode = (text: string): PreCompiledCode => {
        const outputCode: PreCompiledCode = text
            .split('\n') // split by line
            .filter(line => line.trim() && line.includes('[') && line.includes(']') && line.trim().startsWith('[')) // discard empty lines
            .map(line => line.replace('[', '').replace(']', '').trim().split(',').slice(0, 2))
            .map(parts => [U16(Number(parts[0])), parts[1].trim() as string])

        return outputCode;
    };


    const renderCompiledCode = () => {
        if (!compiledCode) {
            return <p className="text-gray-400 italic">Compilez du code pour voir le résultat</p>;
        }

        switch (displayMode) {
            case "array":
                return (
                    <pre className="text-sm font-mono whitespace-pre-wrap text-green-400 p-1">
                        {formatCompiledCodeArray(compiledCode)}
                    </pre>
                );

            case "readable":
                return (
                    <pre className="text-sm font-mono whitespace-pre-wrap text-blue-400 p-1">
                        {formatCompiledCodeReadable(compiledCode)}
                    </pre>
                );

            case "editable":
                return (
                    <div className="h-full">
                        <textarea
                            value={editableCode}
                            onChange={(e) => {
                                setEditableCode(e.target.value);
                                setEditError("");
                            }}
                            className="w-full h-full font-mono text-sm bg-gray-800 text-yellow-300 p-1 border-none focus:outline-none resize-none"
                            spellCheck="false"
                        />
                        {editError && (
                            <div className="mt-2 p-2 bg-red-900 text-red-300 text-sm rounded">
                                {editError}
                            </div>
                        )}
                    </div>
                );
        }
    };

    const handleModeChange = (mode: DisplayMode) => {
        setDisplayMode(mode);

        // Initialiser le contenu éditable si on passe en mode editable
        if (mode === "editable" && compiledCode) {
            setEditableCode(formatCompiledCodeArray(compiledCode));
            setEditError("");
        }
    };

    return (
        <div className="p-4 bg-gray-900 text-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-white"><Link to="/">Assembler Compiler</Link></h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section Code Source */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">Source Code</h2>
                        <button
                            onClick={() => setSourceCode(demoSourceCode)}
                            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
                        >
                            Reset to Demo
                        </button>
                    </div>
                    <textarea
                        value={sourceCode}
                        onChange={(e) => setSourceCode(e.target.value)}
                        className="w-full h-96 font-mono text-sm bg-gray-800 text-green-300 border border-gray-700 rounded p-3 focus:outline-none focus:border-blue-500"
                        placeholder="Enter your assembly code..."
                        spellCheck="false"
                    />
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={handleCompile}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                            Compile
                        </button>
                        <div className="text-xs text-gray-400 mt-2">
                            {sourceCode.split('\n').filter(l => l.trim()).length} lines
                        </div>

                        <div className="ms-auto flex gap-2 items-center">
                            <div>Offset Memory:</div>

                            <input
                                type="text"
                                value={'0x' + (compileMemoryOffsetStr.startsWith('0x') ? compileMemoryOffsetStr.slice(2) : compileMemoryOffsetStr)}
                                placeholder="0x0000"
                                onChange={(event) => setCompileMemoryOffsetStr(event.target.value)}
                                className={"w-16 font-mono text-sm bg-gray-800 text-yellow-300 p-1 border-none focus:outline-none"}
                            />

                            <div className="w-16">
                                ({compileMemoryOffsetUint})
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Code Compilé */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">Compiled Code</h2>
                        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => { if (compiledCode) navigator.clipboard.writeText(formatCompiledCodeArray(compiledCode)) }}
                                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded me-4"
                            >
                                Copy
                            </button>
                            <button
                                onClick={() => handleModeChange("array")}
                                className={`px-3 py-1 text-sm rounded ${displayMode === "array" ? "bg-gray-700" : "hover:bg-gray-700"}`}
                            >
                                Array
                            </button>
                            <button
                                onClick={() => handleModeChange("readable")}
                                className={`px-3 py-1 text-sm rounded ${displayMode === "readable" ? "bg-gray-700" : "hover:bg-gray-700"}`}
                            >
                                Readable
                            </button>
                            <button
                                onClick={() => handleModeChange("editable")}
                                className={`px-3 py-1 text-sm rounded ${displayMode === "editable" ? "bg-gray-700" : "hover:bg-gray-700"}`}
                            >
                                Editable
                            </button>
                        </div>
                    </div>

                    <div className="h-96 border border-gray-700 rounded overflow-hidden bg-gray-900">
                        <div className="h-full overflow-auto">
                            {renderCompiledCode()}
                        </div>
                    </div>

                    <div className="mt-3 flex justify-between">
                        <button
                            onClick={handleDecompile}
                            disabled={!compiledCode && displayMode !== "editable"}
                            className={`px-4 py-2 rounded transition-colors ${(compiledCode || displayMode === "editable")
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            Decompile
                        </button>

                        {displayMode === "editable" && compiledCode && (
                            <button
                                onClick={() => {
                                    try {
                                        const parsed = parseCompiledCode(editableCode);
                                        setCompiledCode(parsed);
                                        setEditError("");

                                    } catch (error: any) {
                                        setEditError(error.message);
                                    }
                                }}
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
                            >
                                Update from Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Section Code Décompilé */}
                {decompiledCode && (
                    <div className="md:col-span-2">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold">Decompiled Code</h2>
                            <button
                                onClick={() => navigator.clipboard.writeText(decompiledCode)}
                                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
                            >
                                Copy
                            </button>
                        </div>
                        <div className="h-48 border border-gray-700 rounded overflow-hidden">
                            <pre className="h-full p-3 overflow-auto font-mono text-sm bg-gray-800 text-blue-300 whitespace-pre-wrap">
                                {decompiledCode}
                            </pre>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CompilePage;