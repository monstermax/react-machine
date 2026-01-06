
import { MEMORY_MAP } from './memory_map';
import { getInstructionLength } from './instructions';
import { high16, low16, toHex } from './integers';
import { Opcode } from './instructions';

import type { CompiledCode, PreCompiledCode, u16, u8 } from '../types/cpu.types';


const codeStr: string = `
:INIT
SET_SP MEMORY_MAP.STACK_END
MOV_A_IMM 0x01 # Commande clear
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


const codeAsm: PreCompiledCode = [
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


export function compileDemo() {
    return compileCode(codeStr)
}

export function decompileDemo() {
    return decompileCode(codeAsm)
}


export function preCompileCode(inputCode: string, memoryOffset: u16=0 as u16): PreCompiledCode {
    const stage1 = compileStage1(inputCode)
    //console.log('compile stage1:', stage1)

    const stage2 = compileStage2(stage1, memoryOffset)
    //console.log('compile stage2:', stage2)

    return stage2;
}

export function compileCode(inputCode: string, memoryOffset: u16=0 as u16): { code: CompiledCode, comments: [line: u16, comment: string][], labels: [line: u16, label: string[]][] } {
    const stage2 = preCompileCode(inputCode, memoryOffset)

    const codeArr = stage2.map(codeParts => {
        const val = [
            codeParts[0],
            (new Function('Opcode', 'return ' + codeParts[1]))(Opcode),
        ];
        return val as [line: u16, code: u8]
    });

    const code: CompiledCode = new Map<u16, u8>(codeArr);

    const comments = stage2.map(codeParts => [codeParts[0], codeParts[2]] as [line: u16, comment: string]);
    const labels = stage2.map(codeParts => [codeParts[0], codeParts[3]] as [line: u16, labels: string[]]);

    return { code, comments, labels };
}


export function decompileCode(inputCode: PreCompiledCode): string {
    const stage1 = decompileStage1(inputCode);
    //console.log('decompile stage1:', stage1)

    const stage2 = decompileStage2(stage1);
    //console.log('decompile stage2:', stage2)
    return stage2;
}


function compileStage1(code: string): {opcode: string, value: string, comment: string}[] {

    /* == INPUT ==
    :INIT
    SET_SP MEMORY_MAP.STACK_END
    MOV_A_IMM 0x01 # Commande clear
    MOV_MEM_A MEMORY_MAP.LCD_COMMAND
    */

    /* == OUTPUT ==
    [
      [ '0001', 'SET_SP', '0xfeff' ],
      [ '0002', 'MOV_A_IMM', '0x01' ],
    ]
    */


    const step1: string[] = code
        .split('\n') // split lines
        .filter(line => line.trim() && !line.trim().startsWith('#')) // discard empty lines
        //.map(line => line.split('#')[0]?.split('//')[0]?.trim().replace(/\s+/g, ' ') ?? '') // remove comments
/*
    const step2 = step1
        .map(line => line.split(' '))
        .map(parts => [...parts.slice(0, 1), parts.slice(1).join(' ').trim()]) // merge arguments
*/

    const step2: {opcode: string, value: string, comment: string}[] = [];

    for (const line of step1) {
        const partsComment = line.split('#');
        const instructionLine = partsComment.shift()?.trim() || '';
        const comment = partsComment.join('#');

        const partsTmp = instructionLine.split(' ');
        const parts = {
            opcode: partsTmp[0] || -1,
            value: partsTmp.slice(1).join(' ').trim(),
            comment,
        } as {opcode: string, value: string, comment: string}

        step2.push(parts);
    }

    const step3: {opcode: string, value: string, comment: string}[] = step2
        .map(replaceMemoryMapAddresses)

    return step3;
}


function compileStage2(stage1: {opcode: string, value: string, comment: string}[], memoryOffset: u16): PreCompiledCode {
    const step1: [line: number, opcode: string, labels: string[], comment: string][] = [];
    let asmLineNum = 0;
    let currentLabels: string[] = [];

    for (const lineParts of stage1) {
        const { opcode, value, comment } = lineParts;

        if (opcode.startsWith(':')) {
            currentLabels.push(opcode.slice(1))
            continue;
        }

        const lineInstruction: [line: number, opcode: string, labels: string[], comment: string] = [
            asmLineNum,
            `Opcode.${opcode}`,
            currentLabels,
            comment,
        ]

        step1.push(lineInstruction)
        asmLineNum++;
        currentLabels = [];


        const opCodeValue = Opcode[opcode as keyof typeof Opcode] as u8;
        const instructionArgsCount = getInstructionLength(opCodeValue) - 1;

        if (value.startsWith('$')) {
            const labelName = value.slice(1);
            step1.push([asmLineNum, '$' + labelName + '$low', [], ''])
            asmLineNum++;
            step1.push([asmLineNum, '$' + labelName + '$high', [], ''])
            asmLineNum++;
            continue;
        }

        for (let i = 1; i <= instructionArgsCount; i++) {
            const evaluatedValue = Number(value);

            const asmLineValue = (i === 1)
                ? low16(Number(value) as u16)
                : high16(Number(evaluatedValue) as u16);

            const lineParam: [number, string, string[], string] = [
                asmLineNum,
                toHex(asmLineValue),
                [],
                '',
            ]

            step1.push(lineParam)
            asmLineNum++;
        }

    }


    const stage2: PreCompiledCode = step1.map(item => {
        let line = item[0] as u16;
        let value = item[1];
        let labels = item[2];
        let comment = item[3];

        if (value.startsWith('$')) {
            const parts = value.split('$');
            const [_, labelName, weight] = parts;
            const labelInstruction = step1.find(item => item[2].includes(labelName))

            if (! labelInstruction) {
                throw new Error(`Instruction not found for label ${labelName}`)
            }

            const line = labelInstruction[0] + memoryOffset as u16;

            const valueInt = weight === 'low'
                ? low16(line)
                : high16(line)

            value = toHex(valueInt);
        }

        const _stage2: [line: u16, value: string, comment: string, labels: string[]] = [
            line,
            value,
            comment,
            labels,
        ]

        return _stage2
    });

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


function replaceMemoryMapAddresses(parts: {opcode: string, value: string, comment: string}): {opcode: string, value: string, comment: string} {
    //if (parts.value) {
    //    return parts;
    //}

    let valuePart = parts.value;

    if (valuePart && valuePart.includes('MEMORY_MAP.')) {
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
        //console.log('result:', result)

        // Évaluer l'expression mathématique complète
        try {
            const evaluatedValue = new Function("return " + result)();
            valuePart = toHex(evaluatedValue);

        } catch (e) {
            console.warn(`Could not evaluate expression: ${result}`);
        }
    }

    return {
        opcode: parts.opcode,
        value: valuePart,
        comment: parts.comment,
    };
}




