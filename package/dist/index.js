import { p as r, f as c, U as n } from "./asm_compiler-D5qO57i2.js";
import { I as g, a as A, b as M, M as N, c as _, g as P, d as T, e as w, i as x, h as U, j as z, m as D } from "./asm_compiler-D5qO57i2.js";
import { c as m, g as l } from "./index-DmkRuyCg.js";
import { i as S } from "./index-DmkRuyCg.js";
const O = async (s, t = n(0), i = n(0), e = "auto") => {
  let o = null;
  if (e === "auto" && (e = s.toLowerCase().includes("section .text") ? "nasm" : "custom"), e === "custom") {
    const a = await r(s, t, i);
    o = c(a.code).code;
  } else if (e === "nasm") {
    const a = m(s);
    o = l(a);
  }
  return o;
}, u = async (s) => {
  var t;
  return (t = await import(`../../resources/asm/${s}?raw`)) == null ? void 0 : t.default;
}, I = () => "O-K-3";
export {
  g as INSTRUCTIONS_WITH_OPERAND,
  A as INSTRUCTIONS_WITH_TWO_OPERANDS,
  M as IRQ_MAP,
  N as MEMORY_MAP,
  _ as compilerV1,
  S as compilerV2,
  P as getInstructionLength,
  T as getOpcodeDescription,
  w as getOpcodeName,
  x as isIO,
  U as isRAM,
  z as isROM,
  D as memoryToIOPort,
  u as openAsmFile,
  I as test,
  O as universalCompiler
};
