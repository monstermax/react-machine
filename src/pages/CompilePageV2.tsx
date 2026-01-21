
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Editor, type PrismEditor } from "prism-react-editor"

import "prism-react-editor/prism/languages/nasm" // Adding the language grammar
import "prism-react-editor/prism/languages/jsx" // Adding the language grammar
import "prism-react-editor/languages/asm" // Adds comment toggling and auto-indenting for language
import "prism-react-editor/languages/jsx" // Adds comment toggling and auto-indenting for language
import "prism-react-editor/layout.css"
import "prism-react-editor/themes/github-dark.css"
import type { PreCompiledCode } from "@/types/cpu.types";
import { createLexer } from "@/cpus/default/asm_compiler_v2";
import { createParser, printAST } from "@/cpus/default/v2/asm_compiler_v2_parser";
import { generateCode, generateFormattedCode } from "@/cpus/default/v2/asm_compiler_v2_generator";
import { compile, formatBytecode } from "@/cpus/default/v2";
//import "prism-react-editor/search.css"




const demoSourceCode = `
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
    xor ebx, ebx        ; exit code 0
    int 0x80
`


export const CompilePageV2: React.FC = () => {
    const [editorContent, setEditorContent] = useState("");
    const [compiledCode, setCompiledCode] = useState<PreCompiledCode | null>(null);
    const [compileConsole, setCompileConsole] = useState<string>("The compilation result will appear here.");


    const codeChanged = (value: string, editor: PrismEditor) => {
        setEditorContent(value)
    }

    const handleCompile = async () => {
        try {
            //const result = await preCompileCode(sourceCode, compileMemoryOffsetUint, compileLineOffsetUint);
            //setCompiledCode(result.code);

            /*
            const lexer = createLexer(editorContent);
            const tokens = lexer.tokenize();

            //console.log('tokens:', tokens)

            // Afficher les tokens (sauf NEWLINE et EOF pour plus de lisibilité)
            let resultInfo = '';

            tokens.forEach(token => {
                if (token.type !== 'NEWLINE' && token.type !== 'EOF') {
                    resultInfo += `L${token.line.toString().padStart(3)}:C${token.column.toString().padStart(3)} | ${token.type.padEnd(12)} | "${token.value}"\n`;

                } else if (token.type === 'NEWLINE') {
                    resultInfo += `L${token.line.toString().padStart(3)} | NEWLINE\n`;
                }
            });

            const parser = createParser(editorContent);
            const ast = parser.parse();
            const output = generateFormattedCode(ast);
            */

            const result = compile(editorContent);
            const output = formatBytecode(result);

            setCompileConsole(output)

            //console.log(output);

        } catch (error: any) {
            console.error("Erreur de compilation:", error);
            setCompileConsole(error.message);
        }
    }


    return (
        <div className="p-4 bg-gray-900 text-gray-100 min-h-screen flex flex-col">
            <h1 className="text-2xl font-bold mb-6 text-white"><Link to="/">Assembler Compiler</Link></h1>

            <div>
                <Editor className="h-full" language="nasm" value={demoSourceCode} onUpdate={(value, editor) => codeChanged(value, editor)}></Editor>
            </div>

            <div>
                <button
                    onClick={() => handleCompile()}
                    className="m-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer"
                >
                    Compile
                </button>
            </div>

            <div className="bg-background-light h-auto rounded p-1 font-mono grow m-2">
                {compileConsole.split('\n').map((line, idx) => (
                    <div key={idx}>
                        {line}
                        <br />
                    </div>
                ))}
            </div>

        </div>
    );
};

