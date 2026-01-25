
import { compilerV2, loadSourceCodeFromFile, setCompilationAsmBaseUrl } from "react-machine-package";
const { compileCode, formatBytecode } = compilerV2;


async function main() {
    //console.log('START')
    await new Promise(r => setTimeout(r, 2000))

    setCompilationAsmBaseUrl('http://localhost:3938');

    //const sourceCode = await loadSourceCodeFromFile("bootloader/bootloader_v1.asm")

    const sourceCode = `

;.include "bootloader/bootloader.lib.asm"

section .text
    mov al, 4
    mov al, 5
    mov al, 6

section .data
    VAR01 db 0x01
    VAR02 db 0x02
    VAR03 db 0x03

 ;   CONST01 equ 100
 ;   VAR10 dw 0xF010
 ;   VAR20 dw 0xF020


    `;

    const compiled = await compileCode(sourceCode);

    //console.log('compiled:', compiled)

    const [text, data, bss] = compiled.sections

    console.log('text:', text)
    console.log('data:', data)
}

main();



