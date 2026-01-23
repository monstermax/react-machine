import { p as r, f as m, U as e } from "./asm_compiler-D5qO57i2.js";
import { I as R, a as g, b as M, M as N, c as _, g as A, d as P, e as T, i as x, h as U, j as z, m as D } from "./asm_compiler-D5qO57i2.js";
import { c, g as l } from "./index-DmkRuyCg.js";
import { i as S } from "./index-DmkRuyCg.js";
const f = async (o, i = e(0), n = e(0), s = "auto") => {
  let t = null;
  if (s === "auto" && (s = o.toLowerCase().includes("section .text") ? "nasm" : "custom"), s === "custom") {
    const a = await r(o, i, n);
    t = m(a.code).code;
  } else if (s === "nasm") {
    const a = c(o);
    t = l(a);
  }
  return t;
}, I = () => "O-K-3";
export {
  R as INSTRUCTIONS_WITH_OPERAND,
  g as INSTRUCTIONS_WITH_TWO_OPERANDS,
  M as IRQ_MAP,
  N as MEMORY_MAP,
  _ as compilerV1,
  S as compilerV2,
  A as getInstructionLength,
  P as getOpcodeDescription,
  T as getOpcodeName,
  x as isIO,
  U as isRAM,
  z as isROM,
  D as memoryToIOPort,
  I as test,
  f as universalCompiler
};
