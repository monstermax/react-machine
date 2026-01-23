import { E as ge, u as ce } from "./ComputerContext-Byayu7Qq.js";
import { C as lt, a as ot, b as ct, D as dt, c as ft, I as ut, d as pt, M as ht, e as mt, P as gt, R as bt, f as xt } from "./ComputerContext-Byayu7Qq.js";
import { jsx as t, Fragment as be, jsxs as d } from "react/jsx-runtime";
import { useState as k, useEffect as Z, memo as xe, forwardRef as ve, useLayoutEffect as te, useImperativeHandle as ye, useRef as we, createContext as Ne } from "react";
import { U as Ce, I as ke, O as $e, g as Se, M as Q, t as Me, a as ne, p as Le, f as Oe, b as Te } from "./asm_compiler-CK23_zXK.js";
import { c as Ie, f as Ee, g as Ae } from "./index-Co0wcgUc.js";
let Re = class extends ge {
  constructor(a, r, i = null, s = 30, l = 15, p = 100) {
    super(), this.counter = 0, this.period = 10, this.enabled = !1, this.id = Math.round(Math.random() * 999999999), this.name = r, this.type = "Time", this.ioPort = i ?? 0, this.devicesManager = a;
  }
  // Tick appelé à chaque cycle CPU ou à intervalle fixe
  tick() {
    if (!this.enabled) return;
    const a = this.counter + 1;
    if (a >= this.period) {
      const r = this.devicesManager.getDeviceByName("interrupt");
      r ? r.requestInterrupt(Ce(ke.IRQ_TIMER)) : console.warn("Missing Interrupt for Timer"), this.counter = 0;
      return;
    }
    this.counter = a;
  }
  // Device IO interface
  read(a) {
    switch (a) {
      case 0:
        return this.counter;
      case 1:
        return this.enabled ? 1 : 0;
      case 2:
        return this.period;
      case 3:
        return 0;
      default:
        return 0;
    }
  }
  write(a, r) {
    switch (a) {
      case 1:
        this.enabled = (r & 1) !== 0, this.emit("state", { enabled: this.enabled }), r & 2 && (this.counter = 0, this.emit("state", { counter: this.counter }));
        break;
      case 2:
        this.period = r & 255, this.emit("state", { period: this.period });
        break;
      case 3:
        this.tick();
        break;
    }
  }
  reset() {
    this.counter = 0, this.period = 10, this.enabled = !1, this.emit("state", { counter: this.counter, period: this.period, enabled: this.enabled });
  }
};
const tt = (e) => {
  const { name: a, ioPort: r, hidden: i, children: s, onInstanceCreated: l } = e, { motherboardRef: p, devicesManagerRef: u } = ce(), [m, b] = k(null), [x, N] = k(0), [$, n] = k(10), [h, f] = k(!1);
  return Z(() => {
    if (!u.current || !p.current || m) return;
    const S = setTimeout(() => {
      if (!u.current) return;
      const L = new Re(u.current, a, r);
      b(L), L.on("state", (y) => {
        L && (y.counter !== void 0 && N(y.counter), y.period !== void 0 && n(y.period), y.enabled !== void 0 && f(y.enabled));
      }), p.current && p.current.clock && p.current.clock.on("tick", ({ cycle: y }) => {
        if (u.current) {
          const R = u.current.getDeviceByName("timer");
          R && R.write(3, 0);
        }
      }), L.emit("state", {
        counter: L.counter,
        period: L.period,
        enabled: L.enabled
      });
    }, 100);
    return () => clearTimeout(S);
  }, [p.current, u.current]), Z(() => {
    m && l && l(m);
  }, [m, l]), m ? /* @__PURE__ */ d("div", { className: `w-full rounded bg-background-light-2xl ${i ? "hidden" : ""}`, children: [
    /* @__PURE__ */ t("h3", { className: "bg-background-light-xl mb-1 px-2 py-1 rounded", children: "Timer" }),
    /* @__PURE__ */ t("div", { children: /* @__PURE__ */ d("div", { className: "flex items-center gap-2 px-1", children: [
      /* @__PURE__ */ d("div", { children: [
        "Enabled: ",
        h ? "YES" : "NO"
      ] }),
      /* @__PURE__ */ d("div", { children: [
        "Period: ",
        $
      ] }),
      /* @__PURE__ */ d("div", { children: [
        "Counter: ",
        x
      ] })
    ] }) }),
    /* @__PURE__ */ t("div", { children: s })
  ] }) : i ? null : /* @__PURE__ */ t(be, { children: "Loading Timer" });
}, nt = (e) => {
  const { hidden: a = !1, open: r = !1 } = e, [i, s] = k(r), [l, p] = k(""), [u, m] = k(!0), [b, x] = k(!0), $ = Object.entries($e).filter(
    ([n, h]) => typeof h == "string" && !isNaN(Number(n)) && n === String(Number(n))
    // S'assurer que c'est bien une clé numérique
  ).map(([n, h]) => {
    const f = parseInt(n, 10);
    return {
      opcode: n.toString(),
      mnemonic: h,
      hex: "0x" + f.toString(16).toUpperCase().padStart(2, "0"),
      binary: f.toString(2).padStart(8, "0"),
      decimal: f,
      description: Se(f)
    };
  }).sort((n, h) => n.decimal - h.decimal).filter(
    (n) => n.mnemonic.toLowerCase().includes(l.toLowerCase()) || n.hex.toLowerCase().includes(l.toLowerCase()) || n.binary.includes(l) || n.opcode.includes(l)
  );
  return /* @__PURE__ */ d("div", { className: `instructions w-auto bg-violet-950 p-1 ${a ? "hidden" : ""}`, children: [
    /* @__PURE__ */ d("div", { className: "w-full flex bg-background-light p-2 rounded", children: [
      /* @__PURE__ */ t("h2", { className: "font-bold", children: "CPU Instructions (documentation)" }),
      /* @__PURE__ */ t(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => s((n) => !n),
          children: i ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ d("div", { className: `${i ? "flex" : "hidden"} flex-col space-y-2 p-1`, children: [
      /* @__PURE__ */ t("div", { className: "mt-2 rounded", children: /* @__PURE__ */ t("div", { className: "", children: /* @__PURE__ */ t(
        "input",
        {
          type: "text",
          placeholder: "Search instructions...",
          value: l,
          onChange: (n) => p(n.target.value),
          className: "w-full px-4 py-2 bg-background-light-2xl border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        }
      ) }) }),
      /* @__PURE__ */ t("div", { className: "overflow-x-auto bg-background-light-3xl p-1 rounded max-h-[50vh]", children: /* @__PURE__ */ d("table", { className: "w-full border-collapse", children: [
        /* @__PURE__ */ t("thead", { children: /* @__PURE__ */ d("tr", { className: "border-b border-gray-700 bg-background-light-2xl", children: [
          u && /* @__PURE__ */ t("th", { className: "text-left py-3 px-4 font-semibold", children: "Hex Opcode" }),
          /* @__PURE__ */ t("th", { className: "text-left py-3 px-4 font-semibold", children: "Mnemonic" }),
          /* @__PURE__ */ t("th", { className: "text-left py-3 px-4 font-semibold", children: "Decimal Opcode" }),
          b && /* @__PURE__ */ t("th", { className: "text-left py-3 px-4 font-semibold", children: "Binary Opcode" }),
          /* @__PURE__ */ t("th", { className: "text-left py-3 px-4 font-semibold", children: "Description" })
        ] }) }),
        /* @__PURE__ */ t("tbody", { children: $.length === 0 ? /* @__PURE__ */ t("tr", { children: /* @__PURE__ */ t("td", { colSpan: 5, className: "text-center py-4 text-gray-500", children: "No instructions found" }) }) : $.map((n, h) => /* @__PURE__ */ d(
          "tr",
          {
            className: `border-b border-gray-800 hover:bg-gray-800 ${h % 2 === 0 ? "bg-gray-850" : ""}`,
            children: [
              u && /* @__PURE__ */ t("td", { className: "py-3 px-4 font-mono text-yellow-300", children: n.hex }),
              /* @__PURE__ */ t("td", { className: "py-3 px-4 font-mono text-green-300", children: n.mnemonic }),
              /* @__PURE__ */ t("td", { className: "py-3 px-4 font-mono text-blue-300", children: n.opcode }),
              b && /* @__PURE__ */ t("td", { className: "py-3 px-4 font-mono text-purple-300", children: n.binary }),
              /* @__PURE__ */ t("td", { className: "py-3 px-4 font-mono text-blue-300", children: n.description })
            ]
          },
          n.opcode
        )) })
      ] }) }),
      /* @__PURE__ */ t("div", { className: "py-2 px-4 border-t border-gray-700 bg-background-light-3xl p-1 rounded", children: /* @__PURE__ */ d("div", { className: "flex flex-wrap gap-4 text-sm", children: [
        /* @__PURE__ */ d("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ t("div", { className: "w-3 h-3 bg-green-300" }),
          /* @__PURE__ */ t("span", { children: "Mnemonic" })
        ] }),
        /* @__PURE__ */ d("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ t("div", { className: "w-3 h-3 bg-yellow-300" }),
          /* @__PURE__ */ t("span", { children: "Hexadecimal" })
        ] }),
        /* @__PURE__ */ d("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ t("div", { className: "w-3 h-3 bg-blue-300" }),
          /* @__PURE__ */ t("span", { children: "Opcode" })
        ] }),
        /* @__PURE__ */ d("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ t("div", { className: "w-3 h-3 bg-purple-300" }),
          /* @__PURE__ */ t("span", { children: "Binary" })
        ] })
      ] }) })
    ] })
  ] });
}, at = (e) => {
  const { hidden: a = !1, open: r = !1 } = e, [i, s] = k(r), [l, p] = k(""), [u, m] = k(!0), [b, x] = k(!0), $ = Object.entries(Q).map(([n, h], f) => {
    const v = h;
    return {
      address: h.toString(),
      label: n,
      hex: Me(v, 4),
      binary: v.toString(2).padStart(16, "0"),
      decimal: v,
      idx: f
    };
  }).sort((n, h) => n.decimal != h.decimal ? n.decimal - h.decimal : n.idx - h.idx).filter(
    (n) => n.label.toLowerCase().includes(l.toLowerCase()) || n.hex.toLowerCase().includes(l.toLowerCase()) || n.binary.includes(l) || n.address.includes(l)
  );
  return /* @__PURE__ */ d("div", { className: `memory-map w-auto bg-slate-800 p-1 ${a ? "hidden" : ""}`, children: [
    /* @__PURE__ */ d("div", { className: "w-full flex bg-background-light p-2 rounded", children: [
      /* @__PURE__ */ t("h2", { className: "font-bold", children: "Memory Map (documentation)" }),
      /* @__PURE__ */ t(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => s((n) => !n),
          children: i ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ d("div", { className: `${i ? "flex" : "hidden"} flex-col space-y-2 p-1`, children: [
      /* @__PURE__ */ t("div", { className: "mt-2 rounded", children: /* @__PURE__ */ t("div", { className: "", children: /* @__PURE__ */ t(
        "input",
        {
          type: "text",
          placeholder: "Search memory map...",
          value: l,
          onChange: (n) => p(n.target.value),
          className: "w-full px-4 py-2 bg-background-light-2xl border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        }
      ) }) }),
      /* @__PURE__ */ t("div", { className: "overflow-x-auto bg-background-light-3xl p-1 rounded max-h-[50vh]", children: /* @__PURE__ */ d("table", { className: "w-full border-collapse", children: [
        /* @__PURE__ */ t("thead", { children: /* @__PURE__ */ d("tr", { className: "border-b border-gray-700 bg-background-light-2xl", children: [
          u && /* @__PURE__ */ t("th", { className: "text-left py-3 px-4 font-semibold", children: "Hex Address" }),
          /* @__PURE__ */ t("th", { className: "text-left py-3 px-4 font-semibold", children: "Mnemonic" }),
          /* @__PURE__ */ t("th", { className: "text-left py-3 px-4 font-semibold", children: "Decimal Address" }),
          b && /* @__PURE__ */ t("th", { className: "text-left py-3 px-4 font-semibold", children: "Binary Address" })
        ] }) }),
        /* @__PURE__ */ t("tbody", { children: $.length === 0 ? /* @__PURE__ */ t("tr", { children: /* @__PURE__ */ t("td", { colSpan: 5, className: "text-center py-4 text-gray-500", children: "No address found" }) }) : $.map((n, h) => /* @__PURE__ */ d(
          "tr",
          {
            className: `border-b border-gray-800 hover:bg-gray-800 ${h % 2 === 0 ? "bg-gray-850" : ""}`,
            children: [
              u && /* @__PURE__ */ t("td", { className: "py-3 px-4 font-mono text-yellow-300", children: n.hex }),
              /* @__PURE__ */ t("td", { className: "py-3 px-4 font-mono text-green-300", children: n.label }),
              /* @__PURE__ */ t("td", { className: "py-3 px-4 font-mono text-blue-300", children: n.address }),
              b && /* @__PURE__ */ t("td", { className: "py-3 px-4 font-mono text-purple-300", children: n.binary })
            ]
          },
          n.label
        )) })
      ] }) }),
      /* @__PURE__ */ t("div", { className: "py-2 px-4 border-t border-gray-700 bg-background-light-3xl p-1 rounded", children: /* @__PURE__ */ d("div", { className: "flex flex-wrap gap-4 text-sm", children: [
        /* @__PURE__ */ d("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ t("div", { className: "w-3 h-3 bg-yellow-300" }),
          /* @__PURE__ */ t("span", { children: "Hexadecimal" })
        ] }),
        /* @__PURE__ */ d("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ t("div", { className: "w-3 h-3 bg-green-300" }),
          /* @__PURE__ */ t("span", { children: "Mnemonic" })
        ] }),
        /* @__PURE__ */ d("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ t("div", { className: "w-3 h-3 bg-blue-300" }),
          /* @__PURE__ */ t("span", { children: "Decimal" })
        ] }),
        /* @__PURE__ */ d("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ t("div", { className: "w-3 h-3 bg-purple-300" }),
          /* @__PURE__ */ t("span", { children: "Binary" })
        ] })
      ] }) })
    ] })
  ] });
};
var q = {}, U = Symbol(), H = Symbol(), de = (e) => typeof e == "string" ? B[e] : e, B = {
  plain: q,
  plaintext: q,
  text: q,
  txt: q
}, fe = (e, a) => (a[H] || ue)(e, a), ue = (e, a) => {
  for (var r = [e], i, s = [], l = 0; i = de(a[U]); )
    delete a[U], Object.assign(a, i);
  for (me(e, a, r, 0); s[l++] = r[0], r = r[1]; ) ;
  return s;
}, De = (e, a, r) => e.replace(/&/g, "&amp;").replace(a, r), ae = "</span>", G = "", j = "", pe = (e) => {
  for (var a = "", r, i = 0; r = e[i++]; ) a += he(r);
  return a;
}, he = (e) => {
  if (e instanceof z) {
    var { type: a, alias: r, content: i } = e, s = G, l = j, p = `<span class="token ${a + (r ? " " + r : "") + (a == "keyword" && typeof i == "string" ? " keyword-" + i : "")}">`;
    j += ae, G += p;
    var u = he(i);
    return G = s, j = l, p + u + ae;
  }
  return typeof e != "string" ? pe(e) : (e = De(e, /</g, "&lt;"), j && e.includes(`
`) ? e.replace(/\n/g, j + `
` + G) : e);
}, me = (e, a, r, i, s) => {
  for (var l in a)
    if (a[l]) for (var p = 0, u = a[l], m, b = Array.isArray(u) ? u : [u]; m = b[p]; p++) {
      if (s && s[0] == l && s[1] == p)
        return;
      for (var x = m.pattern || m, N = de(m.inside), $ = m.lookbehind, n = x.global, h = m.alias, f = r, v = i; f && (!s || v < s[2]); v += f[0].length, f = f[1]) {
        var S = f[0], L = 0, y;
        if (!(S instanceof z)) {
          if (x.lastIndex = n ? v : 0, y = x.exec(n ? e : S), !y && n)
            break;
          if (y && y[0]) {
            var R = $ && y[1] ? y[1].length : 0, O = y.index + R, D = y[0].slice(R), M = O + D.length, F, u;
            if (n) {
              for (; u = v + f[0].length, O >= u; f = f[1], v = u) ;
              if (f[0] instanceof z)
                continue;
              for (F = f, u = v; (u += F[0].length) < M; F = F[1], L++) ;
              S = e.slice(v, u), O -= v, M -= v;
            }
            for (var c = S.slice(M), o = v + S.length, C = new z(l, N ? fe(D, N) : D, D, h), w = f, I = 0, E; w = w[1], I++ < L; ) ;
            c && (!w || w[0] instanceof z ? w = [c, w] : w[0] = c + w[0]), v += O, f[0] = O ? S.slice(0, O) : C, O ? f = f[1] = [C, w] : f[1] = w, L && (me(e, a, f, v, E = [l, p, o]), o = E[2]), s && o > s[2] && (s[2] = o);
          }
        }
      }
    }
};
function z(e, a, r, i) {
  this.type = e, this.content = a, this.alias = i, this.length = r.length;
}
const Fe = Ne(null), re = xe(
  ve((e, a) => {
    let r = [], i = 0, s, l, p, u = 0, m = "", b, x, N = !1, $ = [], n, h;
    const f = () => n ? [n.selectionStart, n.selectionEnd, n.selectionDirection] : [0, 0, "none"], v = {}, S = {
      Escape() {
        n.blur();
      }
    }, L = {}, y = (c) => {
      if (W || c) {
        const o = f(), C = M.lines[u = Pe(m, 0, o[o[2] < "f" ? 0 : 1])];
        C != l && (l == null || l.classList.remove("active-line"), C.classList.add("active-line"), l = C), O(), R("selectionChange", o, m);
      }
    }, R = (c, ...o) => {
      var C, w, I;
      (C = v[c]) == null || C.forEach((E) => E(...o)), (I = (w = M.props)["on" + c[0].toUpperCase() + c.slice(1)]) == null || I.call(w, ...o, M);
    }, O = _(() => {
      let c = M.props, [o, C] = f(), w = c.className, I = `prism-code-editor language-${p}${c.lineNumbers == !1 ? "" : " show-line-numbers"} pce-${c.wordWrap ? "" : "no"}wrap${c.rtl ? " pce-rtl" : ""} pce-${o < C ? "has" : "no"}-selection${N ? " pce-focus" : ""}${c.readOnly ? " pce-readonly" : ""}${w ? " " + w : ""}`;
      I != x && (h.className = x = I);
    }), D = () => {
      m = n.value, $ = fe(m, B[p] || {}), R("tokenize", $, p, m);
      let c = pe($).split(`
`), o = 0, C = i, w = i = c.length;
      for (; c[o] == r[o] && o < w; ) ++o;
      for (; w && c[--w] == r[--C]; ) ;
      if (o == w && o == C) s[o + 1].innerHTML = c[o] + `
`;
      else {
        let I = C < o ? C : o - 1, E = I, g = "";
        for (; E < w; ) g += `<div class=pce-line aria-hidden=true>${c[++E]}
</div>`;
        for (E = w < o ? w : o - 1; E < C; E++) s[o + 1].remove();
        g && s[I + 1].insertAdjacentHTML("afterend", g), h.style.setProperty(
          "--number-width",
          Math.ceil(Math.log10(i + 1)) + ".001ch"
        );
      }
      R("update", m), y(!0), W && setTimeout(setTimeout, 0, () => W = !0), r = c, W = !1;
    }, M = _({
      inputCommandMap: L,
      keyCommandMap: S,
      extensions: {},
      get value() {
        return m;
      },
      get focused() {
        return N;
      },
      get tokens() {
        return $;
      },
      get activeLine() {
        return u;
      },
      on: (c, o) => ((v[c] || (v[c] = /* @__PURE__ */ new Set())).add(o), () => {
        v[c].delete(o);
      }),
      update: D,
      getSelection: f
    }), F = _((c) => {
      c && !n && (M.textarea = n = c, P(n, "keydown", (o) => {
        var C;
        (C = S[o.key]) != null && C.call(S, o, f(), m) && X(o);
      }), P(n, "beforeinput", (o) => {
        var C;
        (M.props.readOnly || o.inputType == "insertText" && ((C = L[o.data]) != null && C.call(L, o, f(), m))) && X(o);
      }), P(n, "input", D), P(n, "blur", () => {
        V = null, N = !1, O();
      }), P(n, "focus", () => {
        V = y, N = !0, O();
      }), P(n, "selectionchange", (o) => {
        y(), X(o);
      }));
    });
    return M.props = e = { language: "text", value: "", ...e }, te(
      _(() => {
        const { value: c, language: o } = M.props;
        c != b && (N || n.remove(), n.value = b = c, n.selectionEnd = 0, N || s[0].prepend(n)), p = o, D();
      }),
      [e.value, e.language]
    ), te(O), ye(a, () => M, []), /* @__PURE__ */ t(
      "div",
      {
        ref: _((c) => {
          c && (M.container = h = c);
        }),
        style: {
          ...e.style,
          tabSize: `${e.tabSize || 2}`
        },
        children: /* @__PURE__ */ t(
          "div",
          {
            className: "pce-wrapper",
            ref: _((c) => {
              c && (M.wrapper = c, M.lines = s = c.children);
            }),
            children: /* @__PURE__ */ d("div", { className: "pce-overlays", children: [
              /* @__PURE__ */ t(
                "textarea",
                {
                  spellCheck: "false",
                  autoCapitalize: "none",
                  autoComplete: "off",
                  inputMode: e.readOnly ? "none" : "text",
                  "aria-readonly": e.readOnly,
                  ...e.textareaProps,
                  className: "pce-textarea",
                  ref: F
                }
              ),
              /* @__PURE__ */ t(Fe.Provider, { value: [M, e], children: e.children })
            ] })
          }
        )
      }
    );
  })
), ie = "u" > typeof window ? document : null, X = (e) => {
  e.preventDefault(), e.stopImmediatePropagation();
}, P = (e, a, r, i) => e.addEventListener(a, r, i), _ = (e) => we(e).current, Pe = (e, a = 0, r = 1 / 0) => {
  let i = 1;
  for (; (a = e.indexOf(`
`, a) + 1) && a <= r; i++) ;
  return i;
};
ie && P(ie, "selectionchange", () => V == null ? void 0 : V());
let V, W = !0;
B.nasm = {
  comment: /;.*/,
  string: /(["'`])(?:\\.|(?!\1)[^\\\n])*\1/,
  label: {
    pattern: /(^\s*)[A-Za-z._?$][\w.?$@~#]*:/m,
    lookbehind: !0,
    alias: "function"
  },
  keyword: [
    /\[?BITS (?:16|32|64)\]?/,
    {
      pattern: /(^\s*)section\s*[a-z.]+:?/im,
      lookbehind: !0
    },
    /(?:extern|global)[^\n;]*/i,
    /(?:CPU|DEFAULT|FLOAT).*/
  ],
  register: {
    pattern: /\b(?:st\d|[xyz]mm\d\d?|[cdt]r\d|r\d\d?[bwd]?|[er]?[abcd]x|[abcd][hl]|[er]?(?:bp|di|si|sp)|[cdefgs]s)\b/i,
    alias: "variable"
  },
  number: /(?:\b|(?=\$))(?:0[hx](?:\.[a-f\d]+|[a-f\d]+(?:\.[a-f\d]+)?)(?:p[+-]?\d+)?|\d[a-f\d]+[hx]|\$\d[a-f\d]*|0[oq][0-7]+|[0-7]+[oq]|0[by][01]+|[01]+[by]|0[dt]\d+|(?:\d+(?:\.\d+)?|\.\d+)(?:\.?e[+-]?\d+)?[dt]?)\b/i,
  operator: /[[\]%&|$!=<>/*+-]/
};
var Y = (e, a) => {
  if (a.has(e)) return a.get(e);
  var r = e, i = ze.call(e).slice(8, -1);
  if (i == "Object") {
    a.set(e, r = {});
    for (var s in e)
      r[s] = Y(e[s], a);
    e[U] && (r[U] = Y(e[U], a)), e[H] && (r[H] = e[H]);
  } else if (i == "Array") {
    a.set(e, r = []);
    for (var l = 0, p = e.length; l < p; l++)
      r[l] = Y(e[l], a);
  }
  return r;
}, Be = (e) => Y(e, /* @__PURE__ */ new Map()), _e = (e, a, r) => {
  var i = {};
  for (var s in e)
    i[s] = e[s], delete e[s];
  for (var s in i)
    s == a && Object.assign(e, r), r.hasOwnProperty(s) || (e[s] = i[s]);
}, ze = {}.toString, Ue = (e, a) => e.replace(/<(\d+)>/g, (r, i) => `(?:${a[+i]})`), se = (e, a, r) => RegExp(Ue(e, a), r), le = "\\s|//.*(?!.)|/\\*(?:[^*]|\\*(?!/))*\\*/", oe = "\\{(?:[^{}]|\\{(?:[^{}]|\\{(?:[^{}]|\\{[^}]*\\})*\\})*\\})*\\}", je = (e, a) => {
  for (var r = 0, i = ue(e, a), s = 0, l = [], p = 0, u, m = 0, b, x, N, $ = () => {
    b && (x = e.slice(b, r), i[m++] = new z("plain-text", x, x), b = 0);
  }; u = i[s]; s++, r += n) {
    var n = u.length, h = u.type, f, v;
    h && (x = u.content, h == "tag" ? (v = x[0].length, f = x[2] ? e.substr(r + v, x[1].length) : "", v > 1 ? p && N[0] == f && (N = l[--p - 1]) : x[x.length - 1].length < 2 && (l[p++] = N = [f, 0])) : p && h == "punctuation" ? x == "{" ? N[1]++ : N[1] && x == "}" ? N[1]-- : h = "}()[]".includes(x) : h = !1), !h && p && !N[1] ? b || (b = r) : ($(), i[m++] = u);
  }
  return $(), i.length = m, i;
}, He = (e, a) => (_e(B[a] = e = Be(e), "regex", {
  tag: {
    pattern: se(
      `</?(?:(?!\\d)[^\\s%=<>/]+(?:<0>(?:<0>*(?:[^\\s{=<>/*]+(?:<0>*=<0>*(?!\\s)(?:"[^"]*"|'[^']*'|<1>)?|(?=[\\s/>]))|<1>))*)?<0>*/?)?>`,
      [le, oe],
      "g"
    ),
    inside: {
      punctuation: /^<\/?|\/?>$/,
      tag: {
        pattern: /^[^\s/<]+/,
        inside: {
          namespace: /^[^:]+:/,
          "class-name": /^[A-Z]\w*(?:\.[A-Z]\w*)*$/
        }
      },
      "attr-value": {
        pattern: se(`(=<0>*)(?:"[^"]*"|'[^']*')`, [le]),
        lookbehind: !0,
        inside: {
          punctuation: /^["']|["']$/g
        }
      },
      expression: {
        pattern: RegExp(oe, "g"),
        alias: "language-" + a,
        inside: e
      },
      comment: e.comment,
      "attr-equals": /=/,
      "attr-name": {
        pattern: /\S+/,
        inside: {
          namespace: /^[^:]+:/
        }
      }
    }
  }
}), e[H] = je, e), Ve = /\/\/.*|\/\*[^]*?(?:\*\/|$)/g, Ze = /(["'])(?:\\[^]|(?!\1)[^\\\n])*\1/g, qe = /\b(?:false|true)\b/, Ge = {
  punctuation: /\./
}, K = {
  "maybe-class-name": /^[A-Z].*/
};
B.js = B.javascript = {
  "doc-comment": {
    pattern: /\/\*\*(?!\/)[^]*?(?:\*\/|$)/g,
    alias: "comment",
    inside: "jsdoc"
  },
  comment: Ve,
  hashbang: {
    pattern: /^#!.*/g,
    alias: "comment"
  },
  "template-string": {
    pattern: /`(?:\\[^]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}|(?!\$\{)[^\\`])*`/g,
    inside: {
      "template-punctuation": {
        pattern: /^`|`$/,
        alias: "string"
      },
      interpolation: {
        pattern: /((?:^|[^\\])(?:\\\\)*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}/,
        lookbehind: !0,
        inside: {
          "interpolation-punctuation": {
            pattern: /^..|\}$/g,
            alias: "punctuation"
          },
          [U]: "js"
        }
      },
      string: /[^]+/
    }
  },
  "string-property": {
    pattern: /((?:^|[,{])[ 	]*)(["'])(?:\\[^]|(?!\2)[^\\\n])*\2(?=\s*:)/mg,
    lookbehind: !0,
    alias: "property"
  },
  string: Ze,
  regex: {
    pattern: /((?:^|[^$\w\xa0-\uffff"'`.)\]\s]|\b(?:return|yield))\s*)\/(?:(?:\[(?:\\.|[^\\\n\]])*\]|\\.|[^\\\n/[])+\/[dgimyus]{0,7}|(?:\[(?:\\.|[^\\\n[\]]|\[(?:\\.|[^\\\n[\]]|\[(?:\\.|[^\\\n[\]])*\])*\])*\]|\\.|[^\\\n/[])+\/[dgimyus]{0,7}v[dgimyus]{0,7})(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?!\/\*|[^()[\]{}.,:;?`\n%&|^!=<>/*+-]))/g,
    lookbehind: !0,
    inside: {
      "regex-flags": /\w+$/,
      "regex-delimiter": /^\/|\/$/,
      "regex-source": {
        pattern: /.+/,
        alias: "language-regex",
        inside: "regex"
      }
    }
  },
  "class-name": [
    {
      pattern: /(\b(?:class|extends|implements|instanceof|interface|new)\s+)(?!\d)(?:(?!\s)[$\w\xa0-\uffff.])+/,
      lookbehind: !0,
      inside: Ge
    },
    {
      pattern: /(^|[^$\w\xa0-\uffff]|\s)(?![a-z\d])(?:(?!\s)[$\w\xa0-\uffff])+(?=\.(?:constructor|prototype)\b)/,
      lookbehind: !0
    }
  ],
  // This must be declared before keyword because we use "function" inside the look-forward
  "function-variable": {
    pattern: /#?(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^)]*\))*\)|(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+)\s*=>))/,
    alias: "function",
    inside: K
  },
  parameter: [
    /(function(?:\s+(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
    /(^|[^$\w\xa0-\uffff]|\s)(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+(?=\s*=>)/,
    /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
    /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|continue|default|do|else|finally|for|if|return|switch|throw|try|while|yield|class|const|debugger|delete|enum|extends|function|[gs]et|export|from|import|implements|in|instanceof|interface|let|new|null|of|package|private|protected|public|static|super|this|typeof|undefined|var|void|with)(?![$\w\xa0-\uffff]))(?:(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/
  ].map((e) => ({
    pattern: e,
    lookbehind: !0,
    inside: "js"
  })),
  constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/,
  keyword: [
    {
      pattern: /(^|[^.]|\.{3}\s*)\b(?:as|assert(?=\s*\{)|export|from(?!\s*[^\s"'])|import)\b/,
      alias: "module",
      lookbehind: !0
    },
    {
      pattern: /(^|[^.]|\.{3}\s*)\b(?:await|break|case|catch|continue|default|do|else|finally|for|if|return|switch|throw|try|while|yield)\b/,
      alias: "control-flow",
      lookbehind: !0
    },
    {
      pattern: /(^|[^.]|\.{3}\s*)\b(?:async(?!\s*[^\s($\w\xa0-\uffff])|class|const|debugger|delete|enum|extends|function|[gs]et(?!\s*[^\s#[$\w\xa0-\uffff])|implements|in|instanceof|interface|let|new|null|of|package|private|protected|public|static|super|this|typeof|undefined|var|void|with)\b/,
      lookbehind: !0
    }
  ],
  boolean: qe,
  // Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
  function: {
    pattern: /#?(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
    inside: K
  },
  number: {
    pattern: /(^|[^$\w])(?:NaN|Infinity|0[bB][01]+(?:_[01]+)*n?|0[oO][0-7]+(?:_[0-7]+)*n?|0[xX][a-fA-F\d]+(?:_[a-fA-F\d]+)*n?|\d+(?:_\d+)*n|(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?)(?![$\w])/,
    lookbehind: !0
  },
  "literal-property": {
    pattern: /([\n,{][ 	]*)(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+(?=\s*:)/,
    lookbehind: !0,
    alias: "property"
  },
  operator: [
    {
      pattern: /=>/,
      alias: "arrow"
    },
    /--|\+\+|(?:\*\*|&&|\|\||[!=]=|>>>?|<<|[%&|^!=<>/*+-]|\?\?)=?|\.{3}|\?(?!\.)|~|:/
  ],
  "property-access": {
    pattern: /(\.\s*)#?(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+/,
    lookbehind: !0,
    inside: K
  },
  "maybe-class-name": {
    pattern: /(^|[^$\w\xa0-\uffff])[A-Z][$\w\xa0-\uffff]+/,
    lookbehind: !0
  },
  punctuation: /\?\.|[()[\]{}.,:;]/
};
He(B.js, "jsx");
const rt = (e) => {
  const { computerRef: a, memoryBusRef: r } = ce(), { hidden: i = !1, open: s = !1 } = e, [l, p] = k(s), [u, m] = k(`
`.repeat(3)), [b, x] = k(u), [N, $] = k(null), [n, h] = k(""), [f, v] = k("0x00"), [S, L] = k(0), [y, R] = k("0x00"), [O, D] = k(0), [M, F] = k(!1);
  Z(() => {
    const g = Number(f);
    L(ne(g));
  }, [f]), Z(() => {
    const g = Number(y);
    D(ne(g));
  }, [y]);
  const c = async (g) => {
    let T = null;
    if (g === "auto" && (g = b.toLowerCase().includes("section .text") ? "nasm" : "custom"), g === "custom") {
      const A = await Le(b, S, O);
      T = Oe(A.code).code;
      const J = Te(A.code);
      h(J);
    } else if (g === "nasm") {
      const A = Ie(b), J = `[
${Ee(A)}]`;
      T = Ae(A), h(J), console.log("code:", T);
    }
    T && $(T);
  }, o = async () => {
    F(!0);
  }, C = async (g) => {
    const A = await (await fetch(`/asm/${g}`)).text();
    m(A);
  }, w = () => {
    var g, T, A;
    if (N && r.current) {
      if (!r.current.dma) {
        console.warn("Cannot load custom code in RAM. DMA not loaded.");
        return;
      }
      if (S <= Q.ROM_END) {
        if (!((A = (T = (g = a.current) == null ? void 0 : g.motherboard) == null ? void 0 : T.memoryBus) != null && A.rom)) return;
        a.current.motherboard.memoryBus.rom.loadRawData(N);
        return;
      }
      S >= Q.RAM_START && S <= Q.RAM_END && r.current.dma.loadCodeInRam(N);
    }
  }, I = (g, T) => {
    x(g);
  }, E = async (g, T) => {
    h(g);
    const A = new Function("return " + g)();
    $(A);
  };
  return /* @__PURE__ */ d("div", { className: `ide w-auto bg-teal-900 p-1 ${i ? "hidden" : ""}`, children: [
    /* @__PURE__ */ d("div", { className: "w-full flex bg-background-light p-2 rounded", children: [
      /* @__PURE__ */ t("h2", { className: "font-bold", children: "IDE / Playground" }),
      /* @__PURE__ */ t(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => p((g) => !g),
          children: l ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ d("div", { className: `${l ? "flex" : "hidden"} flex-col space-y-2 p-1`, children: [
      /* @__PURE__ */ d("div", { className: "ide-toolbar bg-background-light-xl flex justify-end gap-2 p-2", children: [
        /* @__PURE__ */ t(
          "button",
          {
            onClick: () => o(),
            className: "cursor-pointer px-3 bg-background-light-2xl hover:bg-background-light-3xl rounded",
            children: "Open File"
          }
        ),
        /* @__PURE__ */ d("div", { className: "ms-auto flex gap-2 items-center", children: [
          /* @__PURE__ */ t("div", { children: "Offset Memory:" }),
          /* @__PURE__ */ t(
            "input",
            {
              type: "search",
              value: "0x" + (f.startsWith("0x") ? f.slice(2) : f),
              placeholder: "0x0000",
              list: "ide-offset-memory",
              onChange: (g) => v(g.target.value),
              className: "w-24 font-mono text-sm bg-gray-800 text-yellow-300 p-1 border-none focus:outline-none"
            }
          ),
          /* @__PURE__ */ d("datalist", { id: "ide-offset-memory", children: [
            /* @__PURE__ */ t("option", { value: "0x0000", children: "Bootloader" }),
            /* @__PURE__ */ t("option", { value: "0x0500", children: "OS" }),
            /* @__PURE__ */ t("option", { value: "0x1000", children: "Program" })
          ] }),
          /* @__PURE__ */ d("div", { className: "w-16", children: [
            "(",
            S,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ d("div", { className: "ms-auto flex gap-2 items-center", children: [
          /* @__PURE__ */ t("div", { children: "Offset Line:" }),
          /* @__PURE__ */ t(
            "input",
            {
              type: "text",
              value: "0x" + (y.startsWith("0x") ? y.slice(2) : y),
              placeholder: "0x0000",
              onChange: (g) => R(g.target.value),
              className: "w-24 font-mono text-sm bg-gray-800 text-yellow-300 p-1 border-none focus:outline-none"
            }
          ),
          /* @__PURE__ */ d("div", { className: "w-16", children: [
            "(",
            O,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            onClick: () => c("auto"),
            className: "cursor-pointer px-3 bg-background-light-2xl hover:bg-background-light-3xl rounded",
            children: "Compile"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            onClick: () => w(),
            className: "cursor-pointer px-3 bg-background-light-2xl hover:bg-background-light-3xl rounded",
            children: "Load"
          }
        )
      ] }),
      /* @__PURE__ */ t("div", { className: "ide-editors", children: /* @__PURE__ */ d("div", { className: "ide-editors-inner grid grid-cols-2 gap-8 mx-2", children: [
        /* @__PURE__ */ d("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ t("h2", { children: "Source Code" }),
          /* @__PURE__ */ t(
            re,
            {
              className: "ide-editor-source h-full max-h-[50vh] overflow-auto",
              language: "nasm",
              value: u,
              onUpdate: (g, T) => I(g)
            }
          )
        ] }),
        /* @__PURE__ */ d("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ t("h2", { children: "Compiled Code" }),
          /* @__PURE__ */ t(
            re,
            {
              className: "ide-editor-compiled h-full max-h-[50vh] overflow-auto",
              language: "javascript",
              value: n,
              onUpdate: (g, T) => E(g)
            }
          )
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ t(
      We,
      {
        isOpen: M,
        onClose: () => F(!1),
        onSelectFile: C
      }
    )
  ] });
}, We = ({
  isOpen: e,
  onClose: a,
  onSelectFile: r
}) => {
  const [i, s] = k([]), [l, p] = k(!1);
  Z(() => {
    e && u();
  }, [e]);
  const u = async () => {
    p(!0);
    try {
      const x = await (await fetch("/asm-files.json")).json();
      s(x.files);
    } catch (b) {
      console.error("Failed to load file list:", b), s([]);
    } finally {
      p(!1);
    }
  };
  if (!e) return null;
  const m = (b) => {
    r(b), a();
  };
  return /* @__PURE__ */ t("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50", children: /* @__PURE__ */ d("div", { className: "bg-gray-800 rounded-lg p-6 w-96 overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ d("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ t("h2", { className: "text-xl font-bold", children: "Select a File" }),
      /* @__PURE__ */ t(
        "button",
        {
          onClick: a,
          className: "text-gray-400 hover:text-white text-xl",
          children: "×"
        }
      )
    ] }),
    /* @__PURE__ */ t("div", { className: "flex-1 overflow-y-auto mb-4", children: l ? /* @__PURE__ */ t("div", { className: "text-center py-4", children: "Loading files..." }) : i.length === 0 ? /* @__PURE__ */ t("div", { className: "text-center py-4", children: "No files found" }) : /* @__PURE__ */ t("ul", { className: "space-y-1", children: i.map((b, x) => /* @__PURE__ */ t("li", { children: /* @__PURE__ */ t(
      "button",
      {
        onClick: () => m(b),
        className: "w-full text-left px-3 py-2 hover:bg-gray-700 rounded truncate cursor-pointer",
        children: b
      }
    ) }, x)) }) }),
    /* @__PURE__ */ t("div", { className: "flex justify-end", children: /* @__PURE__ */ t(
      "button",
      {
        onClick: a,
        className: "px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded",
        children: "Cancel"
      }
    ) })
  ] }) });
};
export {
  lt as Clock,
  ot as Computer,
  ct as Cpu,
  nt as CpuInstructions,
  dt as Dma,
  ft as ExternalDevices,
  rt as IDE,
  ut as InternalDevices,
  pt as Interrupt,
  ht as Memory,
  at as MemoryMap,
  mt as Motherboard,
  gt as PowerSupply,
  bt as Ram,
  xt as Rom,
  tt as Timer
};
