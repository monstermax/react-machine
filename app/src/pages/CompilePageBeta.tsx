
import { useState } from "react";
import { Link } from "wouter";
import { Editor, type PrismEditor } from "prism-react-editor"
import { test } from 'react-machine-package';

import "prism-react-editor/prism/languages/nasm"
import "prism-react-editor/languages/asm"
import "prism-react-editor/layout.css"
import "prism-react-editor/themes/github-dark.css"
import { compile, formatBytecode } from "@/cpus/default/v2";


console.log('test()', test())


const demoSourceCode_x86 = `
section .data
    message db 'Hello, World!', 0
    count   dw 100

section .text
    global _start

_start:
    mov eax, 4          ; write system call
    mov ebx, 1          ; file descriptor
    mov ecx, message    ; message to write
    mov edx, 13         ; message length
    int 0x80

    mov eax, 1          ; exit system call
    mov ebx, 0          ; exit code 0
    int 0x80
`;


const demoSourceCode_custom = `
; Programme de démonstration
.org 0x100

section .data
    message db 'Hello, World!', 0
    count   dw 100

section .text
    global _start

_start:
    ; Initialisation
    MOV A, 0
    MOV B, 10

loop:
    ; Incrémenter A
    INC_A

    ; Comparer avec B
    MOV C, A
    MOV D, B
    ; (utiliser SUB pour comparer)

    ; Continuer si pas égal
    JNZ loop

    ; Fin
    MOV A, [message]
    HALT

end_program:
    HALT
`;


export const CompilePageBeta: React.FC = () => {
    const [editorContent, setEditorContent] = useState(demoSourceCode_x86);
    const [compiledCode, setCompiledCode] = useState<string | null>(null);
    const [compileConsole, setCompileConsole] = useState<string>("Cliquez sur Compile pour voir le résultat.");

    const codeChanged = (value: string, editor: PrismEditor) => {
        setEditorContent(value);
    };

    const compiledChanged = (value: string, editor: PrismEditor) => {
        setCompiledCode(value);
    };

    const handleCompile = () => {
        try {
            const compiled = compile(editorContent);

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
                    const section = compiled.sections.find(s => s.name === labelInfo.section);
                    const sectionAddress = section?.startAddress ?? 0;
                    const labelAddress = sectionAddress + labelInfo.address;

                    output += `  ${name.padEnd(20)} : 0x${labelAddress.toString(16).padStart(4, '0')} (section ${labelInfo.section} - ${labelAddress})\n`;
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
            <div className="flex gap-8 grow w-full">
                {/* Code Source */}
                <div className="mb-4 border border-gray-700 rounded w-full overflow-hidden">
                    <Editor
                        className="h-[60vh]"
                        language="nasm"
                        value={demoSourceCode_x86}
                        onUpdate={(value, editor) => codeChanged(value, editor)}
                    />
                </div>

                {/* Code Compilé */}
                <div className="mb-4 border border-gray-700 rounded w-full overflow-hidden">
                    <Editor
                        className="h-[60vh]"
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
                    🔨 Compiler
                </button>

                <button
                    onClick={() => {
                        setEditorContent(demoSourceCode_x86);
                        setCompileConsole("Code réinitialisé. Cliquez sur Compile pour compiler.");
                    }}
                    className="ml-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors cursor-pointer"
                >
                    🔄 Réinitialiser
                </button>
            </div>

            {/* Console de sortie */}
            <div className="bg-gray-800 rounded p-4 font-mono text-sm overflow-auto max-h-[30vh]">
                <pre className="whitespace-pre-wrap">{compileConsole}</pre>
            </div>

        </div>
    );
};
