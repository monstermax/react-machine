
import { MEMORY_MAP } from '../../lib/memory_map_16x8_bits';
import { high16, low16, toHex, U16, U8 } from '../../lib/integers';
import { Opcode, getInstructionLength } from './cpu_instructions';

import type { CompiledCode, CompiledCodeComments, CompiledCodeLabels, PreCompiledCode, u16, u8 } from '../../types/cpu.types';


export async function loadSourceCodeFromFile(sourceFile: string): Promise<string> {
    //const sourceCodeModule = sourceFile.endsWith('.ts')
    //    ? await import(`../../cpus/default/asm/${sourceFile}`)
    //    : await import(`../../cpus/default/asm/${sourceFile}?raw`);
    //const sourceCode = sourceCodeModule.default;

    if (sourceFile.endsWith('.ts')) {
        const sourceCodeModule = await import(`../../cpus/default/asm/${sourceFile}`)
        const sourceCode = sourceCodeModule.default;
        return sourceCode;
    }

    if (false) {
        const sourceCodeModule = await import(`../../cpus/default/asm/${sourceFile}?raw`)
        const sourceCode = sourceCodeModule.default;
        return sourceCode;
    }

    const response = await fetch(`/asm/${sourceFile}`);
    if (!response.ok) return '';

    const content = await response.text();
    return content;
}


export async function compileDemo() {
    return await compileCode(demoCodeSource)
}

export function decompileDemo() {
    return decompileCode(demoCodeAsm)
}


export async function compileFile(filePath: string, memoryOffset: u16 = 0 as u16): Promise<{ code: CompiledCode, comments: CompiledCodeComments, labels: CompiledCodeLabels }> {
    const sourceCode = await loadSourceCodeFromFile(filePath);
    const compiled = await compileCode(sourceCode, memoryOffset);
    return compiled
}


export async function compileCode(inputCode: string, memoryOffset: u16 = 0 as u16): Promise<{ code: CompiledCode, comments: CompiledCodeComments, labels: CompiledCodeLabels }> {
    // Compile le code (au format PreCompiledCode)
    const preCompiled: { code: PreCompiledCode, includedFiles: string[] } = await preCompileCode(inputCode, memoryOffset)

    const finalized = finalizeCompilation(preCompiled.code);

    return finalized;
}


export function finalizeCompilation(preCompiledCode: PreCompiledCode): { code: CompiledCode, comments: CompiledCodeComments, labels: CompiledCodeLabels } {

    // Converti en format final (CompiledCode + CompiledCodeComments + CompiledCodeLabels)
    const codeArr: [line: u16, code: u8][] = preCompiledCode.map(codeParts => {
        const val = [
            codeParts[0],
            (new Function('Opcode', 'return ' + codeParts[1]))(Opcode),
        ];
        return val as [line: u16, code: u8]
    });

    const code: CompiledCode = new Map<u16, u8>(codeArr);
    const comments: CompiledCodeComments = preCompiledCode.map(codeParts => [codeParts[0], codeParts[2]] as [line: u16, comment: string]);
    const labels: CompiledCodeLabels = preCompiledCode.map(codeParts => [codeParts[0], codeParts[3]] as [line: u16, labels: string[]]);

    return { code, comments, labels };
}


export async function preCompileFile(filePath: string, memoryOffset: u16 = 0 as u16, linesOffset: u16 = 0 as u16, preIncludedFiles: string[]=[], preCodeLabels: Map<string, u16>=new Map): Promise<{ code: PreCompiledCode, includedFiles: string[], codeLabels: Map<string, u16> }> {
    const sourceCode = await loadSourceCodeFromFile(filePath);
    const preCompiled = await preCompileCode(sourceCode, memoryOffset, linesOffset, preIncludedFiles, preCodeLabels);
    return preCompiled;
}


export async function preCompileCode(inputCode: string, memoryOffset: u16 = 0 as u16, linesOffset: u16 = 0 as u16, preIncludedFiles: string[]=[], preCodeLabels: Map<string, u16>=new Map): Promise<{ code: PreCompiledCode, includedFiles: string[], codeLabels: Map<string, u16> }> {

    const preCompiledStage1 = preCompileStage1(inputCode)
    //console.log('compile preCompiledStage1:', preCompiledStage1)

    const preCompiled: { code: PreCompiledCode, includedFiles: string[], codeLabels: Map<string, u16> } = await preCompileStage2(preCompiledStage1, memoryOffset, linesOffset, preIncludedFiles, preCodeLabels)
    //console.log('compile preCompiled:', preCompiled)

    return preCompiled;
}


function preCompileStage1(code: string): { opcode: string, params: string[], comment: string }[] {

    // Step 1 : String to Lines Array + Discard empty lines + Discard comment lines
    const step1: string[] = code
        .split('\n') // split lines
        .filter(line => line.trim() && !line.trim().startsWith(';')) // discard empty lines


    type Stage1Line = { opcode: string, params: string[], comment: string };

    // Step 2: Parse Each line at format : { opcode: string, params: string[], comment: string }
    const step2: Stage1Line[] = [];

    for (const line of step1) {
        const partsComment = line.split(';');
        const instructionLine = partsComment[0]?.trim() || '';
        const comment = partsComment.slice(1)?.join(';').trim() || '';

        //const partsTmp = instructionLine.split(' ');
        const partsTmp = splitSpaceSafe(instructionLine);

        const parts = {
            opcode: partsTmp[0] || -1,
            params: partsTmp.slice(1),
            comment,
        } as Stage1Line

        step2.push(parts);
    }

    // Step3: Replace MemoryMapAddresses (16bit or 8bit using "<" or ">" modifier)
    const step3: Stage1Line[] = step2
        .map(replaceMemoryMapAddresses)

    return step3;
}


function splitSpaceSafe(str: string) {
    if (!str.includes('"')) {
        const splitted = str.split(' ');
        return splitted;
    }

    const parts = str.split('"');
    const [strPre, strIn, strPost] = parts;

    const markerString = '__string_replacement__'
    const strTmp = [strPre, markerString, strPost].join('');

    const splitted = strTmp.split(' ');

    const splittedSafe = splitted.map(s => s.replace(markerString, `"${strIn}"`));
    return splittedSafe;
}


function pushString(str: string, asmLineNum: u16, appendEol=true, appendEof=true): PreCompiledCode {
    const linesInstructions: PreCompiledCode = [];

    for (const char of str.split('')) {

        const lineInstruction: PreCompiledCode[number] = [
            asmLineNum,
            toHex(char.charCodeAt(0)),
            char,
            [],
        ];

        linesInstructions.push(lineInstruction);

        asmLineNum++;
    }

    // Append EOL
    if (appendEol) {
        const lineInstruction: PreCompiledCode[number] = [
            asmLineNum,
            toHex('\n'.charCodeAt(0)),
            '\n',
            [],
        ];

        linesInstructions.push(lineInstruction);

        asmLineNum++;
    }

    // Append EOF
    if (appendEof) {
        const lineInstruction: PreCompiledCode[number] = [
            asmLineNum,
            '0x00',
            '\\0',
            [],
        ];

        linesInstructions.push(lineInstruction);

        asmLineNum++;
    }

    return linesInstructions;
}


async function preCompileStage2(stage1: { opcode: string, params: string[], comment: string }[], memoryOffset: u16, linesOffset: u16, preIncludedFiles: string[]=[], preCodeLabels: Map<string, u16>=new Map): Promise<{ code: PreCompiledCode, includedFiles: string[], codeLabels: Map<string, u16> }> {
    const stage2Step1: PreCompiledCode = [];
    let asmLineNum = linesOffset as u16;
    let currentLabels: string[] = [];
    const includedFiles: string[] = []
    const defines: Map<string, { bytes: number, value: string }> = new Map
    const strings: Map<string, u16> = new Map
    const codeLabels: Map<string, u16> = new Map;


    for (const lineParts of stage1) {
        const { opcode, params, comment } = lineParts;
        let value0 = params[0];


        // 1. Decodage de l'instruction

        if (opcode.startsWith('.')) {
            if (opcode === '.string' || opcode === '.ascii') {
                const currentLabel = currentLabels.at(-1);

                if (! currentLabel) {
                    throw new Error(`Label not found for string "${currentLabel}"`)
                }

                const stringValue = value0.slice(1, -1);
                const appendEol = (opcode === '.string');

                const linesInstructions: PreCompiledCode = pushString(stringValue, asmLineNum, appendEol);
                stage2Step1.push(...linesInstructions)

                strings.set(currentLabel, U16(memoryOffset + asmLineNum));
                asmLineNum = U16(asmLineNum + linesInstructions.length);
            }

            currentLabels = [];
            continue;
        }

        if (opcode.endsWith(':')) {
            // Declare new Label
            const labelName = opcode.slice(0, -1);

            if (preCodeLabels.get(labelName) || codeLabels.get(labelName)) {
                throw new Error(`Duplicate Label "${labelName}"`)
            }

            currentLabels.push(labelName)
            continue;
        }


        if (opcode.startsWith('@')) {
            // Internal Function ("@include", "@define", ...)
            const command = opcode.slice(1)

            // Include file
            if (command === 'include') {
                if (!preIncludedFiles.includes(value0)) {
                    includedFiles.push(value0);
                }
            }

            // Define constant
            if (command === 'define8') {
                defines.set(value0, { bytes: 8, value: params[1] });
            }
            if (command === 'define16') {
                defines.set(value0, { bytes: 16, value: params[1] });
            }

            continue;
        }


        for (const label of currentLabels) {
            codeLabels.set(label, asmLineNum);
        }


        const lineInstruction: PreCompiledCode[number] = [
            asmLineNum,
            `Opcode.${opcode}`,
            comment,
            currentLabels,
        ]

        stage2Step1.push(lineInstruction)
        asmLineNum++;
        currentLabels = [];


        const opCodeValue = Opcode[opcode as keyof typeof Opcode] as u8;

        const instructionArgsCount = getInstructionLength(opCodeValue) - 1;

        if (instructionArgsCount === 0) {
            continue;
        }


        // 2. Decodage des paramètres

        // Jump ou Call vers un label
        const isJump = [Opcode.CALL, Opcode.JMP, Opcode.JC, Opcode.JNC, Opcode.JNZ, Opcode.JZ].includes(opCodeValue);


        let weight: 'low' | 'high' | null = null;
        if (value0 !== undefined) {
            if (value0.startsWith('<') || value0.startsWith('>')) {
                weight = value0.startsWith('<')
                    ? 'low'
                    : 'high';

                value0 = value0.slice(1);
            }
        }


        if (value0.startsWith('$')) {
            value0 = value0.slice(1);

            // Check If Jump
            if (isJump) {
                const labelName = value0;

                // Low byte
                //stage2Step1.push([asmLineNum, '$' + labelName + '$low', '', []])
                stage2Step1.push([asmLineNum, '<$' + labelName, '', []])
                asmLineNum++;

                // High byte
                //stage2Step1.push([asmLineNum, '$' + labelName + '$high', '', []])
                stage2Step1.push([asmLineNum, '>$' + labelName, '', []])
                asmLineNum++;
                continue;
            }


            // Check If Define
            const define = defines.get(value0)

            if (define !== undefined) {
                if (define.bytes === 8) {
                    stage2Step1.push([asmLineNum, toHex(U8(Number(define.value))), '', []])
                    asmLineNum++;

                } else if (define.bytes === 16) {
                    if (weight === null || weight === 'low') {
                        stage2Step1.push([asmLineNum, toHex(low16(Number(define.value) as u16)), '', []])
                        asmLineNum++;
                    }

                    if (weight === null || weight === 'high') {
                        stage2Step1.push([asmLineNum, toHex(high16(Number(define.value) as u16)), '', []])
                        asmLineNum++;
                    }
                }

                continue;
            }


            // Check If Strings
            const stringLine = strings.get(value0);

            if (stringLine !== undefined) {
                //debugger

                if (weight === 'low') {
                    const lineInstruction: PreCompiledCode[number] = [
                        asmLineNum,
                        toHex(low16(stringLine)),
                        `Address of String $${value0} (low)`,
                        [],
                    ];
                    stage2Step1.push(lineInstruction)
                    asmLineNum++;

                } else if (weight === 'high') {
                    const lineInstruction: PreCompiledCode[number] = [
                        asmLineNum,
                        toHex(high16(stringLine)),
                        `Address of String $${value0} (high)`,
                        [],
                    ];
                    stage2Step1.push(lineInstruction)
                    asmLineNum++;

                } else {
                    const lineInstruction1: PreCompiledCode[number] = [
                        asmLineNum,
                        toHex(low16(stringLine)),
                        `Address of String $${value0} (low)`,
                        [],
                    ];
                    stage2Step1.push(lineInstruction1)
                    asmLineNum++;

                    const lineInstruction2: PreCompiledCode[number] = [
                        asmLineNum,
                        toHex(high16(stringLine)),
                        `Address of String $${value0} (high)`,
                        [],
                    ];
                    stage2Step1.push(lineInstruction2)
                    asmLineNum++;
                }

                continue;
            }

            throw new Error(`Unknown error with $`)
        }


        // Parcours des arguments de l'opcode (1 ou 2 lignes suivantes)

        for (let i = 1; i <= instructionArgsCount; i++) {

            const asmLineValue = (i === 1)
                ? low16(Number(value0) as u16)
                : high16(Number(value0) as u16);

            const lineParam: PreCompiledCode[number] = [
                asmLineNum,
                toHex(asmLineValue),
                '',
                [],
            ]

            stage2Step1.push(lineParam)
            asmLineNum++;
        }

    }



    // Inclusion des fichiers @include
    const postIncludedFiles: string[] = [];
    const postCodeLabels: Map<string, u16> = new Map;
    for (const filePath of includedFiles) {
        const tmpIncludedFiles = [...preIncludedFiles, ...includedFiles, ...postIncludedFiles];
        const tmpCodeLabels = new Map([...preCodeLabels, ...codeLabels, ...postCodeLabels]);
        const preCompiled: { code: PreCompiledCode, includedFiles: string[], codeLabels: Map<string, u16> } = await preCompileFile(filePath, memoryOffset, U16(asmLineNum), tmpIncludedFiles, tmpCodeLabels);

        const lastLine = preCompiled.code.at(-1);

        postIncludedFiles.push(...preCompiled.includedFiles)

        preCompiled.codeLabels.forEach((line, label) => postCodeLabels.set(label, line))

        if (!lastLine) {
            console.log("Erreur compilation include");
            break;
        }

        asmLineNum = U16(lastLine[0] + 2);

        stage2Step1.push(...preCompiled.code)
    }

    includedFiles.push(...postIncludedFiles);


    // Detection des doublons de labels
    const uniqueLabels = new Set<string>(preCodeLabels.keys());

    for (const item of stage2Step1) {
        let labels = item[3];
        if (!labels) continue;

        for (const label of labels) {
            if (uniqueLabels.has(label)) {
                throw new Error(`Duplicate label "${label}"`)
            }

            uniqueLabels.add(label)
        }
    }


    // Résolution des adresses de CALL/JMP relatives (labels)
    const stage2Step2: PreCompiledCode = stage2Step1.map(item => {
        let line = item[0] as u16;
        let codeOrValue = item[1];
        let comment = item[2];
        let labels = item[3];

        let weight: 'low' | 'high' | null = null;
        let valueTmp = codeOrValue;


        if (valueTmp.startsWith('<') || valueTmp.startsWith('>')) {
            // Address (low/high)

            if (valueTmp.startsWith('<')) {
                valueTmp = valueTmp.slice(1)
                weight = 'low'

            } else if (valueTmp.startsWith('>')) {
                valueTmp = valueTmp.slice(1)
                weight = 'high'
            }


            if (valueTmp.startsWith('$')) {
                valueTmp = valueTmp.slice(1);

                const labelName = valueTmp;
                const labelInstruction = stage2Step1.find(item => item[3] && item[3].includes(labelName))

                if (!labelInstruction) {
                    throw new Error(`Instruction not found for label ${labelName}`)
                }

                const line = labelInstruction[0] + memoryOffset as u16;

                const valueInt = weight === 'low'
                    ? low16(line)
                    : high16(line)

                codeOrValue = toHex(valueInt);

            } else if (valueTmp.startsWith('@')) {
                valueTmp = valueTmp.slice(1);

            } else {
                throw new Error(`Action not found for label ${valueTmp}`)
            }

        }

        const _stage2: PreCompiledCode[number] = [
            line,
            codeOrValue,
            comment,
            labels,
        ]

        return _stage2
    });


    return { code: stage2Step2, includedFiles, codeLabels };
}


function replaceMemoryMapAddresses(lineParts: { opcode: string, params: string[], comment: string }): { opcode: string, params: string[], comment: string } {
    let valueParts = lineParts.params;

    for (let i = 0; i < valueParts.length; i++) {
        let valuePart = valueParts[i];
        let weight: 'low' | 'high' | null = null;

        // Modifier (low/high)
        if (valuePart.startsWith('<')) {
            weight = 'low'
            valuePart = valuePart.slice(1);

        } else if (valuePart.startsWith('>')) {
            weight = 'high'
            valuePart = valuePart.slice(1);

        }

        // Convert "@" alias to "MEMORY_MAP." javascript variable
        valuePart = valuePart.replace('@', 'MEMORY_MAP.');

        if (valuePart !== '' && valuePart.includes('MEMORY_MAP.')) {
            // Recherche de toutes les références MEMORY_MAP dans la chaîne
            const regex = /MEMORY_MAP\.(\w+)/g;
            let match;
            let result = valuePart;

            while ((match = regex.exec(valuePart)) !== null) {
                const fullAddressName = match[0];
                const addressKey = match[1];

                if (addressKey && (addressKey in MEMORY_MAP)) {
                    const memValue = MEMORY_MAP[addressKey as keyof typeof MEMORY_MAP];
                    result = result.replace(fullAddressName, memValue.toString());

                } else {
                    console.warn(`Bad substitution`);
                    break;
                }
            }


            // Évaluer l'expression mathématique, pour obtenir la valeur numérique (d'une string hexa, de "MEMORY_MAP.*", d'un number, ou d'une expression javascript combinant toutes ces possibilités)
            try {
                const evaluatedValue = new Function("MEMORY_MAP", "return " + result)(MEMORY_MAP);
                valuePart = toHex(evaluatedValue);

                if (weight === 'low') valuePart = low16(Number(valuePart) as u16).toString()
                if (weight === 'high') valuePart = high16(Number(valuePart) as u16).toString()

                valueParts[i] = valuePart;

            } catch (e) {
                debugger
                console.warn(`Could not evaluate expression: ${result}`);
            }
        }

    }

    return {
        opcode: lineParts.opcode,
        params: valueParts,
        comment: lineParts.comment,
    };
}



export function decompileCode(inputCode: PreCompiledCode): string {
    const stage1 = decompileStage1(inputCode);
    //console.log('decompile stage1:', stage1)

    const stage2 = decompileStage2(stage1);
    //console.log('decompile stage2:', stage2)
    return stage2;
}



function decompileStage1(inputCode: PreCompiledCode): { line: string, opcode: string, value: string | null }[] {
    const outputCode: { line: string, opcode: string, value: string | null }[] = [];
    let sourceLineNum = 0;

    const offset = MEMORY_MAP.PROGRAM_START;

    for (let lineIdx = 0; lineIdx < inputCode.length; lineIdx++) {
        const instructionLine = inputCode[lineIdx];
        const asmLineNum = instructionLine[0] + offset;

        const lineParts = instructionLine[1].split('.');

        if (lineParts[0] !== 'Opcode') {
            //console.warn(`Invalid instruction at line ${asmLineNum}`);
            //process.exit();
            throw new Error(`Invalid instruction at line ${asmLineNum}`)
        }
        const opcode = instructionLine[1].replace('Opcode.', '')

        //const opCodeValue = new Function('Opcode', `return Opcode.${opcode}`)(Opcode);
        const opCodeValue = Opcode[opcode as keyof typeof Opcode] as u8;
        const instructionArgsCount = getInstructionLength(opCodeValue) - 1;

        let value: number | null = null

        if (instructionArgsCount) {
            value = 0

            for (let i = 1; i <= instructionArgsCount; i++) {
                lineIdx++;
                const instructionValue = Number(inputCode[lineIdx][1]);

                const asmLineValue = (i === 1)
                    ? low16(instructionValue as u16)
                    : ((instructionValue << 8) as u16);

                value += asmLineValue;
            }
        }

        sourceLineNum++;
        const lineInstruction: { line: string, opcode: string, value: string | null } = {
            line: toHex(asmLineNum),
            opcode,
            value: (value === null) ? null : toHex(value)
        };
        outputCode.push(lineInstruction);
    }

    return outputCode;
}


function decompileStage2(inputCode: { line: string, opcode: string, value: string | null }[]): string {
    let outputCode = "";

    for (const lineParts of inputCode) {
        const { line, opcode, value: valueHex } = lineParts;
        let valueStr = '';

        if (valueHex !== null) {
            const value = parseInt(valueHex.replace('0x', ''), 16);

            // Remplacer les adresses mémoires connues par leurs noms
            valueStr = valueHex;

            const allowReplaceValue = value >= 256; //['JMP', 'JZ', 'JNZ', 'JC', 'SET_SP', 'CALL'].includes(opcode)

            if (allowReplaceValue) {
                for (const [key, memValue] of Object.entries(MEMORY_MAP)) {
                    if (key.startsWith('IRQ_')) continue;

                    if (memValue === value) {
                        valueStr = `MEMORY_MAP.${key}`;
                        break;
                    }
                }
            }
        }

        outputCode += `${line} ${opcode} ${valueStr}\n`;
    }

    return outputCode.trim();
}






const demoCodeSource: string = `
:INIT
    SET_SP MEMORY_MAP.STACK_END
    MOV_A_IMM 0x01 ; Commande clear
    MOV_MEM_A MEMORY_MAP.LCD_COMMAND

:START
    CALL $LEDS_ON
    MOV_A_IMM 0x0f
    CALL $WAIT_LOOP
    CALL $LEDS_OFF
    JMP END

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
    JNZ $WAIT_LOOP
    RET

:END
    SYSCALL 0
`;


const demoCodeAsm: PreCompiledCode = [
    [1, 'Opcode.SET_SP'],
    [2, '0xff'],
    [3, '0xfe'],
    [4, 'Opcode.MOV_A_IMM'],
    [5, '0x1'],
    [6, 'Opcode.MOV_MEM_A'],
    [7, '0xa1'],
    [8, '0xff'],
    [9, 'Opcode.MOV_D_IMM'],
    [10, '0x0'],
    [11, 'Opcode.MOV_A_IMM'],
    [12, '0x2'],
    [13, 'Opcode.MOV_MEM_A'],
    [14, '0xa1'],
    [15, '0xff'],
    [16, 'Opcode.JMP'],
    [17, '0x0'],
    [18, '0x5']
] as [u16, string][];

