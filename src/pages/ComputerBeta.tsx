
import React, { useEffect, useState } from 'react'
import { Link } from 'wouter';
import { Editor, type PrismEditor } from "prism-react-editor"

import "prism-react-editor/prism/languages/nasm" // Adding the language grammar
import "prism-react-editor/prism/languages/jsx" // Adding the language grammar
import "prism-react-editor/languages/asm" // Adds comment toggling and auto-indenting for language
import "prism-react-editor/languages/jsx" // Adds comment toggling and auto-indenting for language
import "prism-react-editor/layout.css"
import "prism-react-editor/themes/github-dark.css"
//import "prism-react-editor/search.css"

import { compileCode, preCompileCode } from '@/cpus/default/asm_compiler';
import { MEMORY_MAP } from '@/lib/memory_map_16x8_bits';

import { Computer } from '@/v2/components/Computer/ComputerContext';
import { Cpu } from '@/v2/components/Cpu/Cpu';
import { Memory, MemoryBus } from '@/v2/components/Memory/MemoryBus';
import { Ram } from '@/v2/components/Memory/Ram';
import { Rom } from '@/v2/components/Memory/Rom';
import { ExternalDevices, DevicesManager, InternalDevices } from '@/v2/components/Devices/DevicesManager';
import { StorageDisk } from '@/v2/components/Devices/StorageDisk/StorageDisk';
import { Clock } from '@/v2/components/Cpu/Clock';
import { LedsDisplay } from '@/v2/components/Devices/LedsDisplay/LedsDisplay';
import { Buzzer } from '@/v2/components/Devices/Buzzer/Buzzer';
import { PixelDisplay } from '@/v2/components/Devices/PixelDisplay/PixelDisplay';
import { Rng } from '@/v2/components/Devices/Rng/Rng';
import { Rtc } from '@/v2/components/Devices/Rtc/Rtc';
import { LcdDisplay } from '@/v2/components/Devices/LcdDisplay/LcdDisplay';
import { Console } from '@/v2/components/Devices/Console/Console';
import { SevenSegmentDisplay } from '@/v2/components/Devices/7SegmentsDisplay/7SegmentsDisplay';
import { Keyboard } from '@/v2/components/Devices/Keyboard/Keyboard';
import { Interrupt } from '@/v2/components/Cpu/Interrupt';
import { Motherboard } from '@/v2/components/Computer/Motherboard';
import { ComputerControls } from '@/v2/components/Computer/ComputerContainer';
import { Timer } from '@/v2/components/Devices/Timer/Timer';
import { formatCompiledCodeArray } from './CompilePage';
import { U16 } from '@/lib/integers';

import type { u16, u8 } from '@/types/cpu.types';

import BootloaderSourceCode from '@/cpus/default/asm/bootloader/bootloader_v1.asm?raw'
import OsV1SourceCode from '@/cpus/default/asm/os/os_v1.asm?raw'


export const ComputerBeta: React.FC = () => {
    //console.log('RENDER ComputerBeta')

    const [bootloader, setBootloader] = useState<Map<u16, u8>>(new Map);

    // Load BOOTLOADER
    useEffect(() => {
        const _compile = async () => {
            const compiled = await compileCode(BootloaderSourceCode, MEMORY_MAP.ROM_START);
            setBootloader(compiled.code)
        }

        const timer = setTimeout(_compile, 100)
        return () => clearTimeout(timer);
    }, [])


    return (
        <div className="text-white">
            <h1 className="px-4 py-1 bg-background-light font-bold text-xl mb-4">
                <Link to="/">Computer Simulator</Link>
            </h1>

            <div>
                <Computer>
                    <Motherboard>
                        <Clock frequency={1} />

                        <Cpu registers>
                            <Interrupt ioPort={4} open={false} />
                        </Cpu>

                        <Memory open={false}>
                            <Rom data={bootloader} />
                            <Ram />
                        </Memory>

                        <InternalDevices>
                            {/* Audio */}
                            <Buzzer ioPort={0x08} name="buzzer" hidden />

                            {/* Random */}
                            <Rng ioPort={0x0B} name="rng" hidden />
                            <Rtc ioPort={0x0C} name="rtc" hidden />
                            <Timer ioPort={0x02} name="timer" hidden />

                            {/* Storage */}
                            <StorageDisk ioPort={0x00} name="os_disk" open={false} />
                            <StorageDisk ioPort={0x01} name="program_disk" open={false} />
                            <StorageDisk ioPort={0x0E} name="data_1" persistent open={false} />
                            <StorageDisk ioPort={0x0F} name="data_2" open={false} />
                            {/* <StorageDisk ioPort={0x10} name="swap_disk" open={false} /> */}

                            {/* <Gpu /> */}
                            {/* <Network /> */}
                        </InternalDevices>
                    </Motherboard>

                    <ExternalDevices open={false} >
                        {/* Console */}
                        <Console ioPort={0x07} name="console" />

                        {/* Display */}
                        <LedsDisplay ioPort={0x03} name="leds" />
                        <LcdDisplay ioPort={0x0A} name="lcd" />
                        <PixelDisplay ioPort={0x0D} name="display_32x32" open={false} />
                        <SevenSegmentDisplay displays={4} ioPort={0x06} name="7-segment" open={false} />

                        {/* Input */}
                        <Keyboard ioPort={0x05} name="keyboard" open={false} />

                        {/* <IDE /> adapter la page de compilation en composant Device + permettre l'execution du code */}
                    </ExternalDevices>
                </Computer>
            </div>

            <IDE open={true} />
        </div>
    );
}


const IDE: React.FC<{ open?: boolean }> = (props) => {
    const { open=false } = props
    //const initialContent = BootloaderSourceCode;
    const initialContent = OsV1SourceCode;

    const [childrenVisible, setChildrenVisible] = useState(open);
    const [editorContent, setEditorContent] = useState(initialContent);
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
    }

    const handleLoad = () => {

    }

    const handleRun = () => {

    }

    const codeChanged = (value: string, editor: PrismEditor) => {
        setEditorContent(value)
    }


    return (
        <div className={`ide m-2 w-auto ${false ? "hidden" : ""}`}>

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

                    <button
                        onClick={() => handleRun()}
                        className="cursor-pointer px-3 bg-background-light-xl rounded"
                        >
                        Run
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


