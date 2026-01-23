import { p as c, f as r, U as i } from "./asm_compiler-D5qO57i2.js";
import { I as M, a as N, b as _, M as A, c as w, g as x, d as P, e as T, i as U, h, j as y, m as z } from "./asm_compiler-D5qO57i2.js";
import { c as m, g as l } from "./index-DmkRuyCg.js";
import { i as E } from "./index-DmkRuyCg.js";
const u = async (t, o = i(0), s = i(0), e = "auto") => {
  let a = null;
  if (e === "auto" && (e = t.toLowerCase().includes("section .text") ? "nasm" : "custom"), e === "custom") {
    const n = await c(t, o, s);
    a = r(n.code).code;
  } else if (e === "nasm") {
    const n = m(t);
    a = l(n);
  }
  return a;
}, O = async () => {
  var o;
  return (o = await import("./demo-DHu4VJ_R.js")) == null ? void 0 : o.default;
}, I = async () => {
  var s;
  const t = (s = await import("./demo-BOHn_ISk.js")) == null ? void 0 : s.default;
  return await fetch(t).then((e) => e.text());
}, C = () => "O-K-3";
export {
  M as INSTRUCTIONS_WITH_OPERAND,
  N as INSTRUCTIONS_WITH_TWO_OPERANDS,
  _ as IRQ_MAP,
  A as MEMORY_MAP,
  w as compilerV1,
  E as compilerV2,
  x as getInstructionLength,
  P as getOpcodeDescription,
  T as getOpcodeName,
  U as isIO,
  h as isRAM,
  y as isROM,
  z as memoryToIOPort,
  O as openFile,
  I as openUrl,
  C as test,
  u as universalCompiler
};
