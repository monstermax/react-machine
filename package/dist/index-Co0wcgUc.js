import { n as E } from "./asm_compiler-CK23_zXK.js";
const f = [
  { name: "A", aliases: ["AL", "AH", "AX", "EAX", "RAX"], id: "A", size: 8 },
  { name: "B", aliases: ["BL", "BH", "BX", "EBX", "RBX"], id: "B", size: 8 },
  { name: "C", aliases: ["CL", "CH", "CX", "ECX", "RCX"], id: "C", size: 8 },
  { name: "D", aliases: ["DL", "DH", "DX", "EDX", "RDX"], id: "D", size: 8 },
  { name: "SI", aliases: ["ESI", "RSI"], id: "SI", size: 8 },
  { name: "DI", aliases: ["EDI", "RDI"], id: "DI", size: 8 },
  { name: "SP", aliases: ["ESP", "RSP"], id: "SP", size: 8 },
  { name: "BP", aliases: ["EBP", "RBP"], id: "BP", size: 8 }
], v = [
  { mnemonic: "NOP", opcode: 0, operands: "NONE", size: 1 },
  { mnemonic: "HALT", opcode: 15, operands: "NONE", size: 1 },
  { mnemonic: "HLT", opcode: 15, operands: "NONE", size: 1 },
  { mnemonic: "GET_FREQ", opcode: 10, operands: "NONE", size: 1 },
  { mnemonic: "SET_FREQ", opcode: 11, operands: "IMM8", size: 2 },
  { mnemonic: "BREAKPOINT", opcode: 13, operands: "NONE", size: 1 },
  {
    mnemonic: "SYSCALL",
    opcode: 14,
    operands: "IMM8",
    size: 2
  },
  {
    mnemonic: "INT",
    opcode: 14,
    operands: "IMM8",
    size: 2,
    variants: [
      { operands: "IMM8", opcode: 14, size: 2, condition: (s) => s[0].value !== "0x80" ? !1 : (s[0].value = "0xFF", !0), mnemonic: "SYSCALL" }
      // int 0x80 => SYSCALL 0xFF
    ]
  },
  {
    mnemonic: "ADD",
    opcode: 32,
    operands: "NONE",
    size: 1,
    variants: [
      { operands: "NONE", opcode: 32, size: 1, condition: (s) => s.length === 0, mnemonic: "ADD" },
      { operands: "REG", opcode: 32, size: 1, condition: (s) => s[0].register === "A" && s[0].type === "REGISTER", mnemonic: "ADD" }
    ]
  },
  {
    mnemonic: "SUB",
    opcode: 33,
    operands: "NONE",
    size: 1,
    variants: [
      { operands: "NONE", opcode: 33, size: 1, condition: (s) => s.length === 0, mnemonic: "SUB" },
      { operands: "REG", opcode: 33, size: 1, condition: (s) => s[0].register === "A" && s[0].type === "REGISTER", mnemonic: "SUB" }
    ]
  },
  {
    mnemonic: "AND",
    opcode: 34,
    operands: "NONE",
    size: 1,
    variants: [
      { operands: "NONE", opcode: 34, size: 1, condition: (s) => s.length === 0, mnemonic: "AND" },
      { operands: "REG", opcode: 34, size: 1, condition: (s) => s[0].register === "A" && s[0].type === "REGISTER", mnemonic: "AND" }
    ]
  },
  {
    mnemonic: "OR",
    opcode: 35,
    operands: "NONE",
    size: 1,
    variants: [
      { operands: "NONE", opcode: 35, size: 1, condition: (s) => s.length === 0, mnemonic: "OR" },
      { operands: "REG", opcode: 35, size: 1, condition: (s) => s[0].register === "A" && s[0].type === "REGISTER", mnemonic: "OR" }
    ]
  },
  {
    mnemonic: "XOR",
    opcode: 36,
    operands: "NONE",
    size: 1,
    variants: [
      { operands: "NONE", opcode: 36, size: 1, condition: (s) => s.length === 0, mnemonic: "XOR" },
      { operands: "REG", opcode: 36, size: 1, condition: (s) => s[0].register === "A" && s[0].type === "REGISTER", mnemonic: "XOR" }
    ]
  },
  {
    mnemonic: "INC",
    opcode: 37,
    operands: "REG",
    size: 1,
    variants: [
      { operands: "REG", opcode: 37, size: 1, condition: (s) => s[0].register === "A", mnemonic: "INC_A" },
      { operands: "REG", opcode: 39, size: 1, condition: (s) => s[0].register === "B", mnemonic: "INC_B" },
      { operands: "REG", opcode: 41, size: 1, condition: (s) => s[0].register === "C", mnemonic: "INC_C" },
      { operands: "REG", opcode: 43, size: 1, condition: (s) => s[0].register === "D", mnemonic: "INC_D" }
    ]
  },
  {
    mnemonic: "DEC",
    opcode: 38,
    operands: "REG",
    size: 1,
    variants: [
      { operands: "REG", opcode: 38, size: 1, condition: (s) => s[0].register === "A", mnemonic: "DEC_A" },
      { operands: "REG", opcode: 40, size: 1, condition: (s) => s[0].register === "B", mnemonic: "DEC_B" },
      { operands: "REG", opcode: 42, size: 1, condition: (s) => s[0].register === "C", mnemonic: "DEC_C" },
      { operands: "REG", opcode: 44, size: 1, condition: (s) => s[0].register === "D", mnemonic: "DEC_D" }
    ]
  },
  {
    mnemonic: "PUSH",
    opcode: 48,
    operands: "REG",
    size: 1,
    variants: [
      { operands: "REG", opcode: 48, size: 1, condition: (s) => s[0].register === "A", mnemonic: "PUSH_A" },
      { operands: "REG", opcode: 49, size: 1, condition: (s) => s[0].register === "B", mnemonic: "PUSH_B" },
      { operands: "REG", opcode: 50, size: 1, condition: (s) => s[0].register === "C", mnemonic: "PUSH_C" },
      { operands: "REG", opcode: 51, size: 1, condition: (s) => s[0].register === "D", mnemonic: "PUSH_D" }
    ]
  },
  {
    mnemonic: "POP",
    opcode: 52,
    operands: "REG",
    size: 1,
    variants: [
      { operands: "REG", opcode: 52, size: 1, condition: (s) => s[0].register === "A", mnemonic: "POP_A" },
      { operands: "REG", opcode: 53, size: 1, condition: (s) => s[0].register === "B", mnemonic: "POP_B" },
      { operands: "REG", opcode: 54, size: 1, condition: (s) => s[0].register === "C", mnemonic: "POP_C" },
      { operands: "REG", opcode: 55, size: 1, condition: (s) => s[0].register === "D", mnemonic: "POP_D" }
    ]
  },
  { mnemonic: "GET_SP", opcode: 57, operands: "NONE", size: 1 },
  { mnemonic: "SET_SP", opcode: 58, operands: "IMM16", size: 3 },
  {
    mnemonic: "CALL",
    opcode: 59,
    operands: "IMM16",
    size: 3,
    variants: [
      { operands: "MEM", opcode: 59, size: 3, condition: (s) => s[0].type === "LABEL", mnemonic: "CALL" },
      { operands: "MEM", opcode: 59, size: 3, condition: (s) => s[0].type === "MEMORY", mnemonic: "CALL" }
    ]
  },
  { mnemonic: "RET", opcode: 60, operands: "NONE", size: 1 },
  { mnemonic: "EI", opcode: 61, operands: "NONE", size: 1 },
  { mnemonic: "DI", opcode: 62, operands: "NONE", size: 1 },
  { mnemonic: "IRET", opcode: 63, operands: "NONE", size: 1 },
  {
    mnemonic: "JMP",
    opcode: 64,
    operands: "IMM16",
    size: 3,
    variants: [
      { operands: "MEM", opcode: 64, size: 3, condition: (s) => !0, mnemonic: "JMP" }
    ]
  },
  {
    mnemonic: "JZ",
    opcode: 65,
    operands: "IMM16",
    size: 3,
    variants: [
      { operands: "MEM", opcode: 65, size: 3, condition: (s) => !0, mnemonic: "JZ" }
    ]
  },
  {
    mnemonic: "JNZ",
    opcode: 66,
    operands: "IMM16",
    size: 3,
    variants: [
      { operands: "MEM", opcode: 66, size: 3, condition: (s) => !0, mnemonic: "JNZ" }
    ]
  },
  {
    mnemonic: "JC",
    opcode: 67,
    operands: "IMM16",
    size: 3,
    variants: [
      { operands: "MEM", opcode: 67, size: 3, condition: (s) => !0, mnemonic: "JC" }
    ]
  },
  {
    mnemonic: "JNC",
    opcode: 68,
    operands: "IMM16",
    size: 3,
    variants: [
      { operands: "MEM", opcode: 68, size: 3, condition: (s) => !0, mnemonic: "JNC" }
    ]
  },
  {
    mnemonic: "MOV",
    opcode: 144,
    operands: "REG_REG",
    size: 1,
    variants: [
      { operands: "REG_REG", opcode: 144, size: 1, condition: (s) => s[0].register === "A" && s[1].register === "B", mnemonic: "MOV_AB" },
      { operands: "REG_REG", opcode: 145, size: 1, condition: (s) => s[0].register === "A" && s[1].register === "C", mnemonic: "MOV_AC" },
      { operands: "REG_REG", opcode: 146, size: 1, condition: (s) => s[0].register === "A" && s[1].register === "D", mnemonic: "MOV_AD" },
      { operands: "REG_REG", opcode: 147, size: 1, condition: (s) => s[0].register === "B" && s[1].register === "A", mnemonic: "MOV_BA" },
      { operands: "REG_REG", opcode: 148, size: 1, condition: (s) => s[0].register === "B" && s[1].register === "C", mnemonic: "MOV_BC" },
      { operands: "REG_REG", opcode: 149, size: 1, condition: (s) => s[0].register === "B" && s[1].register === "D", mnemonic: "MOV_BD" },
      { operands: "REG_REG", opcode: 150, size: 1, condition: (s) => s[0].register === "C" && s[1].register === "A", mnemonic: "MOV_CA" },
      { operands: "REG_REG", opcode: 151, size: 1, condition: (s) => s[0].register === "C" && s[1].register === "B", mnemonic: "MOV_CB" },
      { operands: "REG_REG", opcode: 152, size: 1, condition: (s) => s[0].register === "C" && s[1].register === "D", mnemonic: "MOV_CD" },
      { operands: "REG_REG", opcode: 153, size: 1, condition: (s) => s[0].register === "D" && s[1].register === "A", mnemonic: "MOV_DA" },
      { operands: "REG_REG", opcode: 154, size: 1, condition: (s) => s[0].register === "D" && s[1].register === "B", mnemonic: "MOV_DB" },
      { operands: "REG_REG", opcode: 155, size: 1, condition: (s) => s[0].register === "D" && s[1].register === "C", mnemonic: "MOV_DC" },
      { operands: "REG_IMM8", opcode: 156, size: 2, condition: (s) => s[0].register === "A", mnemonic: "MOV_A_IMM" },
      { operands: "REG_IMM8", opcode: 157, size: 2, condition: (s) => s[0].register === "B", mnemonic: "MOV_B_IMM" },
      { operands: "REG_IMM8", opcode: 158, size: 2, condition: (s) => s[0].register === "C", mnemonic: "MOV_C_IMM" },
      { operands: "REG_IMM8", opcode: 159, size: 2, condition: (s) => s[0].register === "D", mnemonic: "MOV_D_IMM" },
      { operands: "REG_MEM", opcode: 160, size: 3, condition: (s) => s[0].register === "A", mnemonic: "MOV_A_MEM" },
      { operands: "REG_MEM", opcode: 161, size: 3, condition: (s) => s[0].register === "B", mnemonic: "MOV_B_MEM" },
      { operands: "REG_MEM", opcode: 162, size: 3, condition: (s) => s[0].register === "C", mnemonic: "MOV_C_MEM" },
      { operands: "REG_MEM", opcode: 163, size: 3, condition: (s) => s[0].register === "D", mnemonic: "MOV_D_MEM" },
      { operands: "REG_MEM", opcode: 58, size: 3, condition: (s) => s[0].register === "SP", mnemonic: "SET_SP" },
      { operands: "MEM_REG", opcode: 164, size: 3, condition: (s) => s[1].register === "A", mnemonic: "MOV_MEM_A" },
      { operands: "MEM_REG", opcode: 165, size: 3, condition: (s) => s[1].register === "B", mnemonic: "MOV_MEM_B" },
      { operands: "MEM_REG", opcode: 166, size: 3, condition: (s) => s[1].register === "C", mnemonic: "MOV_MEM_C" },
      { operands: "MEM_REG", opcode: 167, size: 3, condition: (s) => s[1].register === "D", mnemonic: "MOV_MEM_D" }
    ]
  },
  { mnemonic: "CORE_HALT", opcode: 224, operands: "NONE", size: 1 },
  { mnemonic: "CORE_START", opcode: 225, operands: "NONE", size: 1 },
  { mnemonic: "CORE_INIT", opcode: 226, operands: "NONE", size: 1 },
  { mnemonic: "CORE_STATUS", opcode: 227, operands: "NONE", size: 1 },
  { mnemonic: "CORES_COUNT", opcode: 228, operands: "NONE", size: 1 },
  { mnemonic: "CPU_HALT", opcode: 232, operands: "NONE", size: 1 },
  { mnemonic: "CPU_START", opcode: 233, operands: "NONE", size: 1 },
  { mnemonic: "CPU_INIT", opcode: 234, operands: "NONE", size: 1 },
  { mnemonic: "CPU_STATUS", opcode: 235, operands: "NONE", size: 1 },
  { mnemonic: "CPUS_COUNT", opcode: 236, operands: "NONE", size: 1 }
], h = {
  name: "Custom8bit",
  addressSize: 16,
  registers: f,
  instructions: v,
  endianness: "little"
};
class R {
  constructor(e, t, i, n, o = !1) {
    this.pos = 0, this.line = 1, this.col = 1, this.source = e;
    const a = (r) => o ? new Set(r) : new Set(r.map((c) => c.toUpperCase()));
    this.config = {
      instructions: a(t),
      registers: a(i),
      directives: a(n),
      caseSensitive: o
    };
  }
  tokenize() {
    const e = [];
    for (; !this.isAtEnd(); ) {
      const t = this.scanToken();
      t && e.push(t);
    }
    return e.push({ type: "EOF", value: "", line: this.line, column: this.col }), e;
  }
  scanToken() {
    const e = this.source[this.pos];
    switch (e) {
      case " ":
      case "	":
        return this.pos++, this.col++, null;
      case `
`:
        return this.makeToken("NEWLINE", `
`, () => {
          this.pos++, this.line++, this.col = 1;
        });
      case "\r":
        this.pos++, this.peek() === `
` && this.pos++;
        const t = this.makeToken("NEWLINE", `
`);
        return this.line++, this.col = 1, t;
      case ";":
        return this.scanComment();
      case ",":
        return this.makeToken("COMMA", ",", () => {
          this.pos++, this.col++;
        });
      case ":":
        return this.makeToken("COLON", ":", () => {
          this.pos++, this.col++;
        });
      case "+":
        return this.makeToken("PLUS", "+", () => {
          this.pos++, this.col++;
        });
      case "-":
        return this.makeToken("MINUS", "-", () => {
          this.pos++, this.col++;
        });
      case "*":
        return this.makeToken("MUL", "*", () => {
          this.pos++, this.col++;
        });
      case "[":
        return this.makeToken("LBRACKET", "[", () => {
          this.pos++, this.col++;
        });
      case "]":
        return this.makeToken("RBRACKET", "]", () => {
          this.pos++, this.col++;
        });
      case "(":
        return this.makeToken("LPAREN", "(", () => {
          this.pos++, this.col++;
        });
      case ")":
        return this.makeToken("RPAREN", ")", () => {
          this.pos++, this.col++;
        });
      case '"':
      case "'":
        return this.scanString(e);
      default:
        if (this.isDigit(e) || e === "$" || e === "0" && this.isHexPrefix(this.peek()))
          return this.scanNumber();
        if (this.isAlpha(e) || e === "_" || e === ".")
          return this.scanIdentifier();
        throw new Error(`Unexpected character: ${e} at line ${this.line}, column ${this.col}`);
    }
  }
  scanComment() {
    const e = this.col, t = this.pos;
    for (; this.peek() !== `
` && !this.isAtEnd(); )
      this.pos++, this.col++;
    return {
      type: "COMMENT",
      value: this.source.substring(t, this.pos),
      line: this.line,
      column: e
    };
  }
  scanString(e) {
    const t = this.col;
    this.pos++, this.col++;
    const i = this.pos;
    for (; !this.isAtEnd(); ) {
      const o = this.peek();
      if (o === "\\")
        this.pos++, this.col++, this.isAtEnd() || (this.pos++, this.col++);
      else {
        if (o === e)
          break;
        o === `
` && (this.line++, this.col = 0), this.pos++, this.col++;
      }
    }
    if (this.isAtEnd())
      throw new Error(`Unterminated string at line ${this.line}`);
    const n = this.source.substring(i, this.pos);
    return this.pos++, this.col++, { type: "STRING", value: n, line: this.line, column: t };
  }
  scanNumber() {
    var n, o;
    const e = this.col, t = this.pos;
    if (this.source[this.pos] === "0" && ((n = this.peek(1)) == null ? void 0 : n.toLowerCase()) === "x")
      for (this.pos += 2, this.col += 2; this.isHexDigit(this.peek()); )
        this.pos++, this.col++;
    else if (this.source[this.pos] === "$")
      for (this.pos++, this.col++; this.isHexDigit(this.peek()); )
        this.pos++, this.col++;
    else if (this.source[this.pos] === "0" && ((o = this.peek(1)) == null ? void 0 : o.toLowerCase()) === "b")
      for (this.pos += 2, this.col += 2; this.isBinaryDigit(this.peek()); )
        this.pos++, this.col++;
    else
      for (; this.isDigit(this.peek()); )
        this.pos++, this.col++;
    const i = this.peek().toLowerCase();
    return (i === "h" || i === "b" || i === "o" || i === "d") && (this.pos++, this.col++), {
      type: "NUMBER",
      value: this.source.substring(t, this.pos),
      line: this.line,
      column: e
    };
  }
  scanIdentifier() {
    const e = this.col, t = this.pos;
    for (; this.isAlphaNumeric(this.peek()) || this.peek() === "_" || this.peek() === "."; )
      this.pos++, this.col++;
    const i = this.source.substring(t, this.pos), n = this.config.caseSensitive ? i : i.toUpperCase();
    let o = "IDENTIFIER";
    return this.peek() === ":" ? o = "LABEL" : this.config.instructions.has(n) ? o = "INSTRUCTION" : this.config.registers.has(n) ? o = "REGISTER" : this.config.directives.has(n) && (o = "DIRECTIVE"), { type: o, value: i, line: this.line, column: e };
  }
  makeToken(e, t, i) {
    const n = this.col;
    return i && i(), { type: e, value: t, line: this.line, column: n };
  }
  peek(e = 0) {
    return this.source[this.pos + e] || "\0";
  }
  isAtEnd() {
    return this.pos >= this.source.length;
  }
  isHexPrefix(e) {
    return e === "x" || e === "X" || e === "b" || e === "B";
  }
  isDigit(e) {
    return e >= "0" && e <= "9";
  }
  isAlpha(e) {
    return e >= "a" && e <= "z" || e >= "A" && e <= "Z";
  }
  isAlphaNumeric(e) {
    return this.isAlpha(e) || this.isDigit(e);
  }
  isHexDigit(e) {
    return this.isDigit(e) || e >= "a" && e <= "f" || e >= "A" && e <= "F";
  }
  isBinaryDigit(e) {
    return e === "0" || e === "1";
  }
}
class u {
  constructor(e) {
    this.tokens = [], this.pos = 0, this.sections = /* @__PURE__ */ new Map(), this.includes = /* @__PURE__ */ new Map(), this.currentSection = ".text", this.currentAddress = 0, this.currentFilePath = "__main", this.labels = /* @__PURE__ */ new Map(), this.symbols = /* @__PURE__ */ new Map(), this.unresolvedRefs = [], this.errors = [], this.registerMap = /* @__PURE__ */ new Map(), this.instructionMap = /* @__PURE__ */ new Map(), this.arch = e.architecture, this.caseSensitive = e.caseSensitive || !1, this.buildRegisterMap(), this.buildInstructionMap(), this.sections.set(".text", {
      name: ".text",
      type: "code",
      startAddress: e.startAddress || 0,
      data: []
    }), this.sections.set(".data", {
      name: ".data",
      type: "data",
      startAddress: 0,
      data: []
    }), this.sections.set(".bss", {
      name: ".bss",
      type: "bss",
      startAddress: 0,
      data: []
    });
  }
  buildRegisterMap() {
    for (const e of this.arch.registers) {
      this.registerMap.set(
        this.caseSensitive ? e.name : e.name.toUpperCase(),
        e.id
      );
      for (const t of e.aliases)
        this.registerMap.set(
          this.caseSensitive ? t : t.toUpperCase(),
          e.id
        );
    }
  }
  buildInstructionMap() {
    for (const e of this.arch.instructions) {
      const t = this.caseSensitive ? e.mnemonic : e.mnemonic.toUpperCase();
      this.instructionMap.set(t, e);
    }
  }
  compile(e, t) {
    t && (this.currentFilePath = t);
    const i = Array.from(this.instructionMap.keys()), n = Array.from(this.registerMap.keys()), o = [
      "DB",
      "DW",
      "DD",
      "DQ",
      "SECTION",
      "GLOBAL",
      "EXTERN",
      ".DATA",
      ".CODE",
      ".TEXT",
      ".BSS",
      ".ORG",
      ".INCLUDE",
      "RESB",
      "RESW",
      "RESD",
      "RESQ",
      "EQU",
      "TIMES"
    ], a = new R(e, i, n, o, this.caseSensitive);
    return this.tokens = a.tokenize().filter((r) => r.type !== "COMMENT" && r.type !== "NEWLINE"), this.pass1CollectSymbols(), this.pos = 0, this.resetSections(), this.pass2GenerateCode(), this.resolveReferences(), {
      sections: Array.from(this.sections.values()),
      labels: this.labels,
      symbols: this.symbols,
      entryPoint: this.entryPoint,
      errors: this.errors
    };
  }
  resetSections() {
    const e = this.currentAddress, t = this.sections.get(".data");
    t.startAddress = e;
    for (const i of this.sections.values())
      i.data = [];
    this.currentSection = ".text", this.currentAddress = this.sections.get(".text").startAddress;
  }
  pass1CollectSymbols() {
    for (this.pos = 0, this.currentSection = ".text", this.currentAddress = this.sections.get(".text").startAddress; !this.isAtEnd(); ) {
      const e = this.peek();
      if (e.type === "DIRECTIVE") {
        this.handleDirectivePass1();
        continue;
      }
      if (e.type === "LABEL") {
        const t = e.value;
        this.labels.set(t, {
          section: this.currentSection,
          address: this.currentAddress,
          values: null,
          dataSize: 0
        }), this.symbols.set(t, {
          address: this.currentAddress,
          section: this.currentSection,
          type: "label"
        }), this.advance(), this.skip("COLON");
        continue;
      }
      if (e.type === "INSTRUCTION") {
        this.currentAddress += this.calculateInstructionSize();
        continue;
      }
      if (e.type === "IDENTIFIER") {
        const t = this.peek(1);
        if ((t == null ? void 0 : t.type) === "DIRECTIVE") {
          const i = t, n = this.normalize(i.value);
          if (["EQU", "DB", "DW", "DD", "DQ", "RESB", "RESW", "RESD", "RESQ"].includes(n)) {
            const o = e.value, a = l(n), r = this.currentAddress;
            this.labels.set(o, {
              section: this.currentSection,
              address: r,
              values: null,
              dataSize: a
            }), this.symbols.set(o, {
              address: r,
              section: this.currentSection,
              type: "variable"
            }), this.advance(), this.currentAddress += this.calculateDataSize(a), this.advance();
            const c = this.labels.get(o);
            if (!c)
              throw new Error("Missing created label");
            for (; !this.isAtEnd(); ) {
              const d = this.peek();
              if (["COMMA"].includes(d.type))
                this.advance();
              else if (["STRING", "NUMBER"].includes(d.type))
                this.advance(), c.values || (c.values = []), c.values.push(d.value);
              else
                break;
            }
            this.currentAddress;
            continue;
          }
        }
      }
      this.advance();
    }
  }
  handleDirectivePass1() {
    const e = this.normalize(this.peek().value);
    if (e === "SECTION" || e.startsWith(".")) {
      this.advance();
      let t = e;
      if (e === "SECTION" && !this.isAtEnd()) {
        const n = this.peek();
        (n.type === "IDENTIFIER" || n.type === "DIRECTIVE") && (t = this.normalize(n.value), this.advance());
      }
      if (t === ".INCLUDE" || t === "INCLUDE") {
        const o = this.peek().value, a = this.includes.get(o);
        a ? a.push(this.currentFilePath) : this.includes.set(o, [this.currentFilePath]);
      } else t === ".DATA" || t === "DATA" ? this.currentSection = ".data" : t === ".BSS" || t === "BSS" ? this.currentSection = ".bss" : this.currentSection = ".text";
      const i = this.sections.get(this.currentSection);
      if (i)
        this.currentAddress = i.startAddress;
      else
        throw new Error("Unknown case : missing section");
      return;
    }
    if (e === ".ORG") {
      if (this.advance(), this.peek().type === "NUMBER")
        this.currentAddress = this.parseNumber(this.peek().value), this.advance();
      else
        throw new Error("Unknown case : .org ...");
      return;
    }
    if (e === "GLOBAL" || e === "EXTERN") {
      for (this.advance(); !this.isAtEnd() && this.peek().type === "IDENTIFIER"; ) {
        const t = this.peek().value;
        if (e === "GLOBAL") {
          const i = this.symbols.get(t);
          if (i && (i.global = !0), t === "_start" || t === "start" || t === "main") {
            const n = this.labels.get(t);
            n !== void 0 && (this.entryPoint = n.address);
          }
        } else
          this.symbols.set(t, {
            address: 0,
            section: "",
            type: "label",
            extern: !0
          });
        this.advance(), this.peek().type === "COMMA" && this.advance();
      }
      return;
    }
    this.advance();
  }
  pass2GenerateCode() {
    for (this.pos = 0, this.currentSection = ".text", this.currentAddress = this.sections.get(".text").startAddress; !this.isAtEnd(); ) {
      const e = this.peek();
      if (e.type === "DIRECTIVE") {
        this.handleDirectivePass2();
        continue;
      }
      if (e.type === "LABEL") {
        this.advance(), this.skip("COLON");
        continue;
      }
      if (e.type === "IDENTIFIER") {
        const t = this.peek(1);
        if ((t == null ? void 0 : t.type) === "DIRECTIVE") {
          const i = this.normalize(t.value);
          if (["EQU", "DB", "DW", "DD", "DQ"].includes(i)) {
            const n = e.value;
            this.advance();
            const o = this.peek();
            this.generateData(n, this.normalize(o.value));
            continue;
          }
          if (["RESB", "RESW", "RESD", "RESQ"].includes(i)) {
            this.advance(), this.advance(), this.reserveSpace();
            continue;
          }
        }
      }
      if (e.type === "INSTRUCTION") {
        this.generateInstruction();
        continue;
      }
      this.advance();
    }
  }
  handleDirectivePass2() {
    const e = this.normalize(this.peek().value);
    if (e === "SECTION" || e.startsWith(".")) {
      this.advance();
      let t = e;
      if (e === "SECTION" && !this.isAtEnd()) {
        const n = this.peek();
        (n.type === "IDENTIFIER" || n.type === "DIRECTIVE") && (t = this.normalize(n.value), this.advance());
      }
      t === ".DATA" || t === "DATA" ? this.currentSection = ".data" : t === ".BSS" || t === "BSS" ? this.currentSection = ".bss" : this.currentSection = ".text";
      const i = this.sections.get(this.currentSection);
      i && (this.currentAddress = i.startAddress + i.data.length);
      return;
    }
    if (e === ".ORG") {
      this.advance(), this.peek().type === "NUMBER" && (this.currentAddress = this.parseNumber(this.peek().value), this.advance());
      return;
    }
    if (e === "GLOBAL" || e === "EXTERN") {
      for (this.advance(); !this.isAtEnd() && this.peek().type === "IDENTIFIER"; )
        this.advance(), this.peek().type === "COMMA" && this.advance();
      return;
    }
    this.advance();
  }
  generateData(e, t) {
    const i = this.normalize(t);
    let n = l(i);
    for (this.advance(); !this.isAtEnd(); ) {
      const o = this.peek();
      if (o.type === "IDENTIFIER") {
        const a = this.peek(1);
        if (a.type === "DIRECTIVE" && ["EQU", "DB", "DW", "DD", "DQ"].includes(this.normalize(a.value)) || a.type === "INSTRUCTION" || a.type === "LABEL")
          break;
        const r = this.labels.get(o.value);
        if (r !== void 0)
          for (let c = 0; c < n; c++)
            this.emitByte(r.address >> c * 8 & 255);
        else {
          this.unresolvedRefs.push({
            address: this.currentAddress,
            section: this.currentSection,
            label: o.value,
            size: n
          });
          for (let c = 0; c < n; c++)
            this.emitByte(0);
        }
        this.advance();
      } else
        break;
    }
  }
  reserveSpace() {
    if (this.peek().type === "NUMBER") {
      const e = this.parseNumber(this.peek().value);
      for (let t = 0; t < e; t++)
        this.emitByte(0);
      this.advance();
    }
  }
  generateInstruction() {
    const e = this.peek(), t = this.normalize(e.value), i = this.instructionMap.get(t);
    if (!i) {
      this.error(e, `Unknown instruction: ${t}`), this.advance();
      return;
    }
    this.advance();
    const n = this.parseOperands(), o = this.findInstructionVariant(i, n);
    if (!o) {
      this.error(e, `Invalid operands for ${t}`);
      return;
    }
    this.emitByte(o.opcode, o.mnemonic, !0), this.emitOperands(n, o);
  }
  parseOperands() {
    var t;
    const e = [];
    for (; !this.isAtEnd(); ) {
      const i = this.peek();
      if (i.type === "REGISTER")
        e.push({
          type: "REGISTER",
          value: i.value,
          register: this.mapRegister(i.value)
        }), this.advance();
      else if (i.type === "NUMBER")
        e.push({
          type: "IMMEDIATE",
          value: i.value,
          address: this.parseNumber(i.value)
        }), this.advance();
      else if (i.type === "LBRACKET") {
        this.advance();
        const n = this.parseMemoryOperand();
        this.skip("RBRACKET"), e.push(n);
      } else if (i.type === "IDENTIFIER")
        e.push({
          type: "LABEL",
          value: i.value,
          address: (t = this.labels.get(i.value)) == null ? void 0 : t.address
        }), this.advance();
      else if (i.type === "COMMA")
        this.advance();
      else
        break;
    }
    return e;
  }
  parseMemoryOperand() {
    var i;
    const e = {
      type: "MEMORY",
      value: ""
    }, t = this.peek();
    return t.type === "NUMBER" ? (e.address = this.parseNumber(t.value), e.value = t.value, this.advance()) : t.type === "IDENTIFIER" ? (e.value = t.value, e.address = (i = this.labels.get(t.value)) == null ? void 0 : i.address, this.advance()) : t.type === "REGISTER" && (e.base = this.mapRegister(t.value), e.value = t.value, this.advance()), e;
  }
  findInstructionVariant(e, t) {
    if (!e.variants || e.variants.length === 0)
      return this.matchesOperandPattern(e.operands, t) ? {
        operands: e.operands,
        opcode: e.opcode,
        size: e.size,
        mnemonic: e.mnemonic
      } : null;
    for (const i of e.variants)
      if (this.matchesOperandPattern(i.operands, t) && (!i.condition || i.condition(t)))
        return i;
    return null;
  }
  matchesOperandPattern(e, t) {
    if (e === "NONE")
      return t.length === 0;
    const i = e.split("_");
    if (i.length !== t.length) return !1;
    for (let n = 0; n < i.length; n++) {
      const o = i[n], a = t[n];
      if (o === "REG" && a.type !== "REGISTER" || o.startsWith("IMM") && a.type !== "IMMEDIATE" || o === "MEM" && a.type !== "MEMORY" && a.type !== "LABEL") return !1;
    }
    return !0;
  }
  emitOperands(e, t) {
    const i = t.operands;
    if (i === "NONE") return;
    const n = i.split("_");
    for (let o = 0; o < e.length; o++) {
      const a = n[o], r = e[o];
      if (a === "IMM8") {
        const c = r.address !== void 0 ? r.address : this.parseNumber(r.value);
        this.emitByte(c & 255, r.value);
      } else if (a === "IMM16" || a === "MEM") {
        let c = 0;
        if (r.type === "LABEL") {
          const d = this.labels.get(r.value), p = this.sections.get((d == null ? void 0 : d.section) || ".none");
          if (r.address === 1) debugger;
          d !== void 0 && p !== void 0 ? d.dataSize === 0 && d.values ? c = d.values ? d.values[0] : 0 : c = p.startAddress + d.address : this.unresolvedRefs.push({
            address: this.currentAddress,
            section: this.currentSection,
            label: r.value,
            size: 2
          });
        } else if (r.type === "MEMORY") {
          const d = this.labels.get(r.value);
          if (!d)
            throw new Error(`Missing label "${r.value}"`);
          c = d.values ? d.values[0] : 0;
        } else r.address !== void 0 ? c = r.address : c = this.parseNumber(r.value);
        this.arch.endianness === "little" ? (this.emitByte(c & 255, `${r.value} (low)`), this.emitByte(c >> 8 & 255, `${r.value} (high)`)) : (this.emitByte(c >> 8 & 255, `${r.value} (high)`), this.emitByte(c & 255, `${r.value} (low)`));
      }
    }
  }
  calculateInstructionSize() {
    const e = this.peek(), t = this.normalize(e.value), i = this.instructionMap.get(t);
    if (!i) return 1;
    this.advance();
    const n = this.parseOperands(), o = this.findInstructionVariant(i, n);
    return o ? o.size : 1;
  }
  calculateDataSize(e) {
    let t = 0, i = 1;
    for (; ; ) {
      const n = this.peek(i);
      if (!n || n.type === "EOF" || n.type === "INSTRUCTION" || n.type === "LABEL") break;
      if (n.type === "STRING")
        t += n.value.length, i++;
      else if (n.type === "NUMBER")
        t += e, i++;
      else if (n.type === "IDENTIFIER") {
        if (this.peek(i + 1).type === "DIRECTIVE") break;
        t += e, i++;
      } else if (n.type === "COMMA")
        i++;
      else
        break;
    }
    return t;
  }
  resolveReferences() {
    for (const e of this.unresolvedRefs) {
      const t = this.labels.get(e.label);
      if (t === void 0) {
        this.errors.push({
          line: 0,
          column: 0,
          message: `Undefined label: ${e.label}`,
          severity: "error"
        });
        continue;
      }
      const i = this.sections.get(e.section);
      if (!i) continue;
      const n = e.address - i.startAddress;
      e.size === 2 ? this.arch.endianness === "little" ? (i.data[n].value = t.address & 255, i.data[n + 1].value = t.address >> 8 & 255) : (i.data[n].value = t.address >> 8 & 255, i.data[n + 1].value = t.address & 255) : i.data[n].value = t.address & 255;
    }
  }
  emitByte(e, t, i = !1) {
    const n = this.sections.get(this.currentSection);
    n && n.data.push({
      address: this.currentAddress++,
      value: e & 255,
      section: this.currentSection,
      comment: t,
      isOpcode: i
    });
  }
  mapRegister(e) {
    const t = this.caseSensitive ? e : e.toUpperCase();
    return this.registerMap.get(t) || e;
  }
  normalize(e) {
    return this.caseSensitive ? e : e.toUpperCase();
  }
  parseNumber(e) {
    const t = e.toLowerCase();
    return t.startsWith("0x") ? parseInt(t.substring(2), 16) : t.startsWith("$") ? parseInt(t.substring(1), 16) : t.startsWith("0b") ? parseInt(t.substring(2), 2) : t.endsWith("h") ? parseInt(t.substring(0, t.length - 1), 16) : t.endsWith("b") && t.length > 1 ? parseInt(t.substring(0, t.length - 1), 2) : parseInt(e, 10);
  }
  peek(e = 0) {
    return this.tokens[this.pos + e] || { type: "EOF", value: "", line: 0, column: 0 };
  }
  advance() {
    return this.tokens[this.pos++];
  }
  skip(e) {
    this.peek().type === e && this.advance();
  }
  isAtEnd() {
    return this.peek().type === "EOF";
  }
  error(e, t) {
    this.errors.push({
      line: e.line,
      column: e.column,
      message: t,
      severity: "error"
    });
  }
}
function l(s) {
  switch (s) {
    case "EQU":
      return 0;
    case "DB":
      return 1;
    case "DW":
      return 2;
    case "DD":
      return 4;
    case "DQ":
      return 8;
    case "RESB":
      return 1;
    case "RESW":
      return 2;
    case "RESD":
      return 4;
    case "RESQ":
      return 8;
    default:
      throw new Error(`Unknown directive "${s}"`);
  }
}
async function M(s, e = h, t = {}) {
  const i = await E(s);
  return m(i, e, t);
}
function m(s, e = h, t = {}) {
  return new u({
    architecture: e,
    startAddress: t.startAddress || 0,
    caseSensitive: t.caseSensitive || !1
  }).compile(s);
}
function g(s) {
  const e = [];
  for (const t of s.sections)
    if (t.data.length !== 0) {
      e.push(`
// Section: ${t.name}`);
      for (const i of t.data) {
        const n = `0x${i.address.toString(16).padStart(4, "0").toUpperCase()}`, o = `0x${i.value.toString(16).padStart(2, "0").toUpperCase()}`;
        let a = `    [${n}, ${o}]`;
        i.comment && (a += `, // ${i.comment}`), e.push(a);
      }
    }
  return e.join(`,
`);
}
function N(s, e) {
  const t = /* @__PURE__ */ new Map();
  for (const i of s.sections)
    if (!(e && i.name !== e))
      for (const n of i.data)
        t.set(n.address, n.value);
  return t;
}
function A(s) {
  const e = /* @__PURE__ */ new Map();
  for (const t of s.sections)
    for (const i of t.data)
      e.set(i.address, i.value);
  return e;
}
const S = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CUSTOM_CPU: h,
  Compiler: u,
  compileCode: m,
  compileFile: M,
  formatBytecode: g,
  getBytecodeArray: N,
  getMemoryMap: A
}, Symbol.toStringTag, { value: "Module" }));
export {
  m as c,
  g as f,
  N as g,
  S as i
};
