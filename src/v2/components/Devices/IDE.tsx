
import React, { useEffect, useState } from 'react'
import { Editor, type PrismEditor } from "prism-react-editor"

import "prism-react-editor/prism/languages/nasm" // Adding the language grammar
import "prism-react-editor/prism/languages/jsx" // Adding the language grammar
import "prism-react-editor/languages/asm" // Adds comment toggling and auto-indenting for language
import "prism-react-editor/languages/jsx" // Adds comment toggling and auto-indenting for language
import "prism-react-editor/layout.css"
import "prism-react-editor/themes/github-dark.css"
//import "prism-react-editor/search.css"

import { formatCompiledCodeArray } from '../../../pages/CompilePage';
import { U16 } from '@/lib/integers';
import { finalizeCompilation, preCompileCode } from '@/cpus/default/asm_compiler';
import { useComputer } from '../Computer/ComputerContext'
import { MEMORY_MAP } from '@/lib/memory_map_16x8_bits'

import type { CompiledCode, u16, u8 } from '@/types/cpu.types';


// const bootloaderSourceCode = await loadSourceCodeFromFile("bootloader/bootloader_v1.asm");
// const OsV1SourceCode = await loadSourceCodeFromFile("os/os_v1.asm");


export const IDE: React.FC<{ open?: boolean }> = (props) => {
    const { computerRef } = useComputer();

    const { open=false } = props
    let initialContent = '\n\n\n';
    //initialContent = BootloaderSourceCode;
    //initialContent = OsV1SourceCode;

    const [childrenVisible, setChildrenVisible] = useState(open);
    const [editorContent, setEditorContent] = useState(initialContent);
    const [compiledCode, setCompiledCode] = useState<CompiledCode | null>(null);
    const [compiledContent, setCompiledContent] = useState("");

    const [compileMemoryOffsetStr, setCompileMemoryOffsetStr] = useState('0x00');
    const [compileMemoryOffsetUint, setCompileMemoryOffsetUint] = useState<u16>(0 as u16);
    const [compileLineOffsetStr, setCompileLineOffsetStr] = useState('0x00');
    const [compileLineOffsetUint, setCompileLineOffsetUint] = useState<u16>(0 as u16);


    // Synchronize compileMemoryOffsetStr & compileMemoryOffsetUint
    useEffect(() => {
        const newCompileMemoryOffsetUint = Number(compileMemoryOffsetStr)
        setCompileMemoryOffsetUint(U16(newCompileMemoryOffsetUint))

    }, [compileMemoryOffsetStr])

    // Synchronize compileMemoryOffsetStr & compileLineOffsetUint
    useEffect(() => {
        const newCompileLineOffsetUint = Number(compileLineOffsetStr)
        setCompileLineOffsetUint(U16(newCompileLineOffsetUint))

    }, [compileLineOffsetStr])


    const handleCompile = async () => {
        const preCompiled = await preCompileCode(editorContent, compileMemoryOffsetUint, compileLineOffsetUint);
        setCompiledContent(formatCompiledCodeArray(preCompiled.code))

        const finalized = finalizeCompilation(preCompiled.code);
        setCompiledCode(finalized.code)
    }

    const handleLoad = () => {
        if (!compiledCode) return;

        if (compileMemoryOffsetUint <= MEMORY_MAP.ROM_END) {
            if (!computerRef.current?.motherboard?.memoryBus?.rom) return;
            const rom = computerRef.current.motherboard.memoryBus.rom;
            rom.loadRawData(compiledCode)
            return;
        }

        if (compileMemoryOffsetUint >= MEMORY_MAP.RAM_START && compileMemoryOffsetUint <= MEMORY_MAP.RAM_END) {
            if (!computerRef.current?.motherboard?.memoryBus?.ram) return;
            const ram = computerRef.current.motherboard.memoryBus.ram;
            ram.loadCodeInRam(compiledCode)
        }

    }

    const codeChanged = (value: string, editor: PrismEditor) => {
        setEditorContent(value)
    }


    return (
        <div className={`ide w-auto ${false ? "hidden" : ""}`}>

            {/* IDE Head */}
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">IDE</h2>

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
            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-2 bg-background-light-3xl p-1`}>
                <div className="flex justify-end gap-2 px-2">

                    <div className="ms-auto flex gap-2 items-center">
                        <div>Offset Memory:</div>

                        <input
                            type="text"
                            value={'0x' + (compileMemoryOffsetStr.startsWith('0x') ? compileMemoryOffsetStr.slice(2) : compileMemoryOffsetStr)}
                            placeholder="0x0000"
                            list="ide-offset-memory"
                            onChange={(event) => setCompileMemoryOffsetStr(event.target.value)}
                            className={"w-24 font-mono text-sm bg-gray-800 text-yellow-300 p-1 border-none focus:outline-none"}
                        />

                        <datalist id="ide-offset-memory">
                            <option value="0x0000">Bootloader</option>
                            <option value="0x0500">OS</option>
                            <option value="0x1000">Program</option>
                        </datalist>

                        <div className="w-16">
                            ({compileMemoryOffsetUint})
                        </div>
                    </div>

                    <div className="ms-auto flex gap-2 items-center">
                        <div>Offset Line:</div>

                        <input
                            type="text"
                            value={'0x' + (compileLineOffsetStr.startsWith('0x') ? compileLineOffsetStr.slice(2) : compileLineOffsetStr)}
                            placeholder="0x0000"
                            onChange={(event) => setCompileLineOffsetStr(event.target.value)}
                            className={"w-24 font-mono text-sm bg-gray-800 text-yellow-300 p-1 border-none focus:outline-none"}
                        />

                        <div className="w-16">
                            ({compileLineOffsetUint})
                        </div>
                    </div>


                    <button
                        onClick={() => handleCompile()}
                        className="cursor-pointer px-3 bg-background-light-xl rounded"
                        >
                        Compile
                    </button>

                    <button
                        onClick={() => handleLoad()}
                        className="cursor-pointer px-3 bg-background-light-xl rounded"
                        >
                        Load
                    </button>

                </div>

                <div className="h-96">
                    <div className="grid grid-cols-2 gap-8 mx-2">
                        <div>
                            <Editor className="h-full" language="nasm" value={initialContent} onUpdate={(value, editor) => codeChanged(value, editor)}></Editor>
                        </div>
                        <div>
                            <Editor className="h-full" language="javascript" value={compiledContent}></Editor>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


