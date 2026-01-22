
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
import { compile, formatBytecode, getBytecodeArray, getMemoryMap } from '@/cpus/default/v2'
import { universalCompiler } from '@/lib/compilation'


export const IDE: React.FC<{ hidden?: boolean, open?: boolean }> = (props) => {
    const { computerRef, memoryBusRef } = useComputer();
    const { hidden=false, open=false } = props

    const [childrenVisible, setChildrenVisible] = useState(open);
    const [initialContent, setInitialContent] = useState('\n'.repeat(3));
    const [editorContent, setEditorContent] = useState(initialContent);
    const [compiledCode, setCompiledCode] = useState<CompiledCode | null>(null);
    const [compiledContent, setCompiledContent] = useState("");

    const [compileMemoryOffsetStr, setCompileMemoryOffsetStr] = useState('0x00');
    const [compileMemoryOffsetUint, setCompileMemoryOffsetUint] = useState<u16>(0 as u16);
    const [compileLineOffsetStr, setCompileLineOffsetStr] = useState('0x00');
    const [compileLineOffsetUint, setCompileLineOffsetUint] = useState<u16>(0 as u16);

    const [isFileModalOpen, setIsFileModalOpen] = useState(false);


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


    const handleCompile = async (compilerType: 'nasm' | 'custom' | 'auto') => {
        let code: CompiledCode | null = null;

        if (compilerType === 'auto') {
            compilerType = editorContent.toLowerCase().includes('section .text')
                ? 'nasm'
                : 'custom';
        }

        if (compilerType === 'custom') {
            const preCompiled = await preCompileCode(editorContent, compileMemoryOffsetUint, compileLineOffsetUint);
            const finalized = finalizeCompilation(preCompiled.code);
            code = finalized.code;

            const codeFormatted = formatCompiledCodeArray(preCompiled.code)
            setCompiledContent(codeFormatted)

        } else if (compilerType === 'nasm') {
            const compiled = compile(editorContent);
            const bytecode = formatBytecode(compiled);
            const compiledFormatted = `[\n${bytecode}]`;
            code = getBytecodeArray(compiled)
            //debugger
            setCompiledContent(compiledFormatted)
            console.log('code:', code)
        }

        if (code) {
            setCompiledCode(code)
        }
    }

    const handleOpenFile = async () => {
        setIsFileModalOpen(true)
    }

    const openFile = async (filePath: string) => {
        const response = await fetch(`/asm/${filePath}`);
        const value = await response.text();
        setInitialContent(value)
    }


    const handleLoadCode = () => {
        if (!compiledCode) return;
        if (!memoryBusRef.current) return;

        if (!memoryBusRef.current.dma) {
            console.warn(`Cannot load custom code in RAM. DMA not loaded.`);
            return;
        }

        if (compileMemoryOffsetUint <= MEMORY_MAP.ROM_END) {
            if (!computerRef.current?.motherboard?.memoryBus?.rom) return;
            const rom = computerRef.current.motherboard.memoryBus.rom;
            rom.loadRawData(compiledCode)
            return;
        }

        if (compileMemoryOffsetUint >= MEMORY_MAP.RAM_START && compileMemoryOffsetUint <= MEMORY_MAP.RAM_END) {
            memoryBusRef.current.dma.loadCodeInRam(compiledCode)

            //if (!memoryBusRef.current.dma) {
            //    if (!computerRef.current?.motherboard?.memoryBus?.ram) return;
            //    const ram = computerRef.current.motherboard.memoryBus.ram;
            //    ram.loadCodeInRam(compiledCode)
            //}
        }

    }

    const codeChanged = (value: string, editor: PrismEditor) => {
        setEditorContent(value)
    }

    const compiledChanged = async (value: string, editor: PrismEditor) => {
        setCompiledContent(value);

        const code = (new Function('return ' + value))()
        setCompiledCode(code)
    };


    return (
        <div className={`ide w-auto bg-teal-900 p-1 ${hidden ? "hidden" : ""}`}>

            {/* IDE Head */}
            <div className="w-full flex bg-background-light p-2 rounded">
                <h2 className="font-bold">IDE / Playground</h2>

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

                {/* Toolbar */}
                <div className="ide-toolbar bg-background-light-xl flex justify-end gap-2 p-2">

                    <button
                        onClick={() => handleOpenFile()}
                        className="cursor-pointer px-3 bg-background-light-2xl hover:bg-background-light-3xl rounded"
                    >
                        Open File
                    </button>

                    <div className="ms-auto flex gap-2 items-center">
                        <div>Offset Memory:</div>

                        <input
                            type="search"
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
                        onClick={() => handleCompile('auto')}
                        className="cursor-pointer px-3 bg-background-light-2xl hover:bg-background-light-3xl rounded"
                    >
                        Compile
                    </button>

                    <button
                        onClick={() => handleLoadCode()}
                        className="cursor-pointer px-3 bg-background-light-2xl hover:bg-background-light-3xl rounded"
                    >
                        Load
                    </button>

                </div>

                <div className="ide-editors">
                    <div className="ide-editors-inner grid grid-cols-2 gap-8 mx-2">
                        <div className="flex flex-col">
                            <h2>Source Code</h2>
                            <Editor
                                className="ide-editor-source h-full"
                                language="nasm"
                                value={initialContent}
                                onUpdate={(value, editor) => codeChanged(value, editor)}
                            >
                            </Editor>
                        </div>
                        <div className="flex flex-col">
                            <h2>Compiled Code</h2>
                            <Editor
                                className="ide-editor-compiled h-full"
                                language="javascript"
                                value={compiledContent}
                                onUpdate={(value, editor) => compiledChanged(value, editor)}
                            >
                            </Editor>
                        </div>
                    </div>
                </div>
            </div>

            <FileModal
                isOpen={isFileModalOpen}
                onClose={() => setIsFileModalOpen(false)}
                onSelectFile={openFile}
            />
        </div>
    );
}



interface FileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectFile: (filePath: string) => void;
}

interface FileIndex {
    generated: string;
    count: number;
    files: string[];
}


export const FileModal: React.FC<FileModalProps> = ({
    isOpen,
    onClose,
    onSelectFile
}) => {
    const [files, setFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadFileList();
        }
    }, [isOpen]);

    const loadFileList = async () => {
        setLoading(true);
        try {
            const response = await fetch('/asm-files.json');
            const fileIndex: FileIndex = await response.json();
            setFiles(fileIndex.files);

        } catch (error) {
            console.error('Failed to load file list:', error);
            setFiles([]);

        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleFileClick = (filePath: string) => {
        onSelectFile(filePath);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 rounded-lg p-6 w-96 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Select a File</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-xl"
                    >
                        ×
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto mb-4">
                    {loading ? (
                        <div className="text-center py-4">Loading files...</div>
                    ) : files.length === 0 ? (
                        <div className="text-center py-4">No files found</div>
                    ) : (
                        <ul className="space-y-1">
                            {files.map((file, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => handleFileClick(file)}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded truncate cursor-pointer"
                                    >
                                        {file}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};


