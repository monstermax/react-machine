
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Editor, type PrismEditor } from "prism-react-editor"

import "prism-react-editor/prism/languages/nasm"
import "prism-react-editor/languages/asm"
import "prism-react-editor/layout.css"
import "prism-react-editor/themes/github-dark.css"

import { compilerV2, loadSourceCodeFromFile, toHex, U16 } from "@/index" // "react-machine-package";
import { CUSTOM_CPU } from "@/v3/compiler/arch_custom";
const { compileCode, formatBytecode, getBytecodeArray } = compilerV2;



export const CompilePage: React.FC = () => {
    //const initialSourceCode = debugSourceCode_x86;
    const [initialSourceCode, setInitialSourceCode] = useState('')
    const initConsoleMessage = "Code reseted. Click on Compile to continue.";

    const [consoleOpened, setConsoleOpened] = useState(false)
    const [editorContent, setEditorContent] = useState(initialSourceCode);
    const [compiledCode, setCompiledCode] = useState<string | null>(null);
    const [compileConsole, setCompileConsole] = useState<string>(initConsoleMessage);


    useEffect(() => {
        //setInitialSourceCode(debugSourceCode_x86);
        //return;

        const loadCode = async () => {
            //const code = await loadSourceCodeFromFile('bootloader/bootloader_v2.asm') // BOOTLOADER V2
            //const code = await loadSourceCodeFromFile('os/os_v3.asm') // OS V3
            //setInitialSourceCode(code);
        }

        const timer = setTimeout(loadCode, 50);
        return () => clearTimeout(timer);
    }, [])


    const loadBootloaderCode = async () => {
        const code = await loadSourceCodeFromFile('bootloader/bootloader_v2.asm') // BOOTLOADER V2
        setInitialSourceCode(code);

    }

    const loadOsCode = async () => {
        const code = await loadSourceCodeFromFile('os/os_v3.asm') // OS V3
        setInitialSourceCode(code);
    }


    const codeChanged = (value: string, editor: PrismEditor) => {
        setEditorContent(value);
    };

    const compiledChanged = (value: string, editor: PrismEditor) => {
        setCompiledCode(value);
    };

    const handleCompile = async () => {
        //const arch = undefined;
        const arch = CUSTOM_CPU;

        try {
            const startAddress = 0;
            //const startAddress = 0x0700; // debug
            const compiled = await compileCode(editorContent, arch, { startAddress });

            const bytecode = formatBytecode(compiled);
            const compiledFormatted = `[\n${bytecode}\n]`;
            setCompiledCode(compiledFormatted)


            let output = compiled.errors.length
                ? "⚠️ Compiled with warnings\n\n"
                : "✅ Compiled with success\n\n";

            if (compiled.errors.length > 0) {
                console.error(compiled.errors);
                //setCompileConsole("❌ ERREURS DE COMPILATION:\n\n" + compiled.errors.join('\n'));
                //return;
                output += "❌ ERREURS DE COMPILATION:\n\n" + compiled.errors.map(error => JSON.stringify(error)).join('\n') + "\n";
            }

            // Afficher les labels
            if (compiled.labels.size > 0) {
                output += "=== LABELS ===\n";
                compiled.labels.forEach((labelInfo, name) => {
                    //const section = compiled.sections.find(s => s.name === labelInfo.section);
                    //const sectionAddress = section?.startAddress ?? 0;
                    const labelAddress = labelInfo.address;
                    const labelAddressGlobal = /* sectionAddress + */ labelInfo.address;

                    output += `  ${name.padEnd(20)} : ${toHex(labelAddressGlobal, 4)} (line ${labelAddressGlobal} - section ${labelInfo.section})\n`;
                });
                output += "\n";
            }

            const codeSize = compiled.sections.map(s => s.data.length).reduce((p, c) => p + c, 0);

            // Afficher les statistiques
            output += "=== STATISTIQUES ===\n";
            output += `  Taille du code       : ${codeSize} bytes\n`;
            output += `  Nombre de labels     : ${compiled.labels.size}\n`;
            output += "\n";

            // Afficher le bytecode formaté
            //output += "=== BYTECODE ===\n";
            //output += "const program: [number, number][] = [\n";
            //output += bytecode;
            //output += "\n];";

            setCompileConsole(output);

        } catch (error: any) {
            console.error("Erreur de compilation:", error);
            setCompileConsole("❌ ERREUR FATALE:\n\n" + error.message);
        }
    };

    return (
        <div className="p-4 bg-gray-900 text-gray-100 min-h-screen flex flex-col">
            <h1 className="text-2xl font-bold mb-6 text-white">
                <Link to="/">Assembly Compiler</Link>
            </h1>

            {/* Editeurs */}
            <div className="flex gap-8 grow w-full h-full overflow-hidden">
                {/* Code Source */}
                <div className="mb-4 border border-gray-700 rounded w-full overflow-hidden">
                    <Editor
                        className="h-full"
                        language="nasm"
                        value={initialSourceCode}
                        onUpdate={(value, editor) => codeChanged(value, editor)}
                    />
                </div>

                {/* Code Compilé */}
                <div className="mb-4 border border-gray-700 rounded w-full overflow-hidden">
                    <Editor
                        className="h-full"
                        language="nasm"
                        value={compiledCode ?? ''}
                        onUpdate={(value, editor) => compiledChanged(value, editor)}
                    />
                </div>
            </div>

            {/* Boutons */}
            <div className="mb-4">
                <button
                    onClick={() => handleCompile()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer font-semibold"
                >
                    🔨 Compile
                </button>

                <button
                    onClick={() => {
                        setEditorContent(initialSourceCode);
                        setCompileConsole("");
                    }}
                    className="ml-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors cursor-pointer"
                >
                    🔄 Reset
                </button>

                <button
                    onClick={() => loadBootloaderCode()}
                    className="ml-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors cursor-pointer"
                >
                    Load Bootloader
                </button>

                <button
                    onClick={() => loadOsCode()}
                    className="ml-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors cursor-pointer"
                >
                    Load OS
                </button>
            </div>

            {/* Console de sortie */}
            <div className="border rounded flex flex-col bg-background-light-xs max-h-[40%]">
                <button className="px-3 py-1 flex items-center gap-8 cursor-pointer" onClick={() => setConsoleOpened(b => !b)}>
                    <div className="font-bold flex gap-3 items-center">
                        Console

                        {!consoleOpened && !!compileConsole && (
                            <sup>🔔</sup>
                        )}
                    </div>

                    <div className="my-1 ms-auto px-2 py-1 bg-background-light-2xl rounded">
                        {consoleOpened ? "▲" : "▼"}
                    </div>
                </button>

                {consoleOpened && (
                    <div className="bg-gray-800 p-4 font-mono text-sm overflow-auto h-full">
                        <pre className="whitespace-pre-wrap">{compileConsole || initConsoleMessage}</pre>
                    </div>
                )}
            </div>

        </div>
    );
};




