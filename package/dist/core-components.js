import { E as De, u as Ne } from "./ComputerContext-B7pvKa0D.js";
import { C as Qt, a as Jt, b as Xt, D as en, c as tn, I as nn, d as rn, M as an, e as sn, P as on, R as ln, f as cn } from "./ComputerContext-B7pvKa0D.js";
import { jsx as r, Fragment as Pe, jsxs as b } from "react/jsx-runtime";
import * as Q from "react";
import Ce, { useState as O, useEffect as G, memo as Be, forwardRef as Ee, useLayoutEffect as le, useImperativeHandle as Ue, useRef as je, createContext as ae, isValidElement as He, cloneElement as Fe, createElement as Ve, useContext as ze } from "react";
import { k as Ge, b as Ke, O as qe, d as Ze, M as W, t as Oe, U as ce, p as We, f as Ye } from "./asm_compiler-D5qO57i2.js";
import { c as Qe, f as Je, g as Xe } from "./index-DmkRuyCg.js";
let et = class extends De {
  constructor(t, a, i = null, s = 30, l = 15, d = 100) {
    super(), this.counter = 0, this.period = 10, this.enabled = !1, this.id = Math.round(Math.random() * 999999999), this.name = a, this.type = "Time", this.ioPort = i ?? 0, this.devicesManager = t;
  }
  // Tick appelé à chaque cycle CPU ou à intervalle fixe
  tick() {
    if (!this.enabled) return;
    const t = this.counter + 1;
    if (t >= this.period) {
      const a = this.devicesManager.getDeviceByName("interrupt");
      a ? a.requestInterrupt(Ge(Ke.IRQ_TIMER)) : console.warn("Missing Interrupt for Timer"), this.counter = 0;
      return;
    }
    this.counter = t;
  }
  // Device IO interface
  read(t) {
    switch (t) {
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
  write(t, a) {
    switch (t) {
      case 1:
        this.enabled = (a & 1) !== 0, this.emit("state", { enabled: this.enabled }), a & 2 && (this.counter = 0, this.emit("state", { counter: this.counter }));
        break;
      case 2:
        this.period = a & 255, this.emit("state", { period: this.period });
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
const Gt = (e) => {
  const { name: t, ioPort: a, hidden: i, children: s, onInstanceCreated: l } = e, { motherboardRef: d, devicesManagerRef: u } = Ne(), [h, x] = O(null), [v, f] = O(0), [y, n] = O(10), [c, o] = O(!1);
  return G(() => {
    if (!u.current || !d.current || h) return;
    const w = setTimeout(() => {
      if (!u.current) return;
      const k = new et(u.current, t, a);
      x(k), k.on("state", (N) => {
        k && (N.counter !== void 0 && f(N.counter), N.period !== void 0 && n(N.period), N.enabled !== void 0 && o(N.enabled));
      }), d.current && d.current.clock && d.current.clock.on("tick", ({ cycle: N }) => {
        if (u.current) {
          const I = u.current.getDeviceByName("timer");
          I && I.write(3, 0);
        }
      }), k.emit("state", {
        counter: k.counter,
        period: k.period,
        enabled: k.enabled
      });
    }, 100);
    return () => clearTimeout(w);
  }, [d.current, u.current]), G(() => {
    h && l && l(h);
  }, [h, l]), h ? /* @__PURE__ */ b("div", { className: `w-full rounded bg-background-light-2xl ${i ? "hidden" : ""}`, children: [
    /* @__PURE__ */ r("h3", { className: "bg-background-light-xl mb-1 px-2 py-1 rounded", children: "Timer" }),
    /* @__PURE__ */ r("div", { children: /* @__PURE__ */ b("div", { className: "flex items-center gap-2 px-1", children: [
      /* @__PURE__ */ b("div", { children: [
        "Enabled: ",
        c ? "YES" : "NO"
      ] }),
      /* @__PURE__ */ b("div", { children: [
        "Period: ",
        y
      ] }),
      /* @__PURE__ */ b("div", { children: [
        "Counter: ",
        v
      ] })
    ] }) }),
    /* @__PURE__ */ r("div", { children: s })
  ] }) : i ? null : /* @__PURE__ */ r(Pe, { children: "Loading Timer" });
}, Kt = (e) => {
  const { hidden: t = !1, open: a = !1 } = e, [i, s] = O(a), [l, d] = O(""), [u, h] = O(!0), [x, v] = O(!0), y = Object.entries(qe).filter(
    ([n, c]) => typeof c == "string" && !isNaN(Number(n)) && n === String(Number(n))
    // S'assurer que c'est bien une clé numérique
  ).map(([n, c]) => {
    const o = parseInt(n, 10);
    return {
      opcode: n.toString(),
      mnemonic: c,
      hex: "0x" + o.toString(16).toUpperCase().padStart(2, "0"),
      binary: o.toString(2).padStart(8, "0"),
      decimal: o,
      description: Ze(o)
    };
  }).sort((n, c) => n.decimal - c.decimal).filter(
    (n) => n.mnemonic.toLowerCase().includes(l.toLowerCase()) || n.hex.toLowerCase().includes(l.toLowerCase()) || n.binary.includes(l) || n.opcode.includes(l)
  );
  return /* @__PURE__ */ b("div", { className: `instructions w-auto bg-violet-950 p-1 ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ b("div", { className: "w-full flex bg-background-light p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold", children: "CPU Instructions (documentation)" }),
      /* @__PURE__ */ r(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => s((n) => !n),
          children: i ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ b("div", { className: `${i ? "flex" : "hidden"} flex-col space-y-2 p-1`, children: [
      /* @__PURE__ */ r("div", { className: "mt-2 rounded", children: /* @__PURE__ */ r("div", { className: "", children: /* @__PURE__ */ r(
        "input",
        {
          type: "text",
          placeholder: "Search instructions...",
          value: l,
          onChange: (n) => d(n.target.value),
          className: "w-full px-4 py-2 bg-background-light-2xl border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        }
      ) }) }),
      /* @__PURE__ */ r("div", { className: "overflow-x-auto bg-background-light-3xl p-1 rounded max-h-[50vh]", children: /* @__PURE__ */ b("table", { className: "w-full border-collapse", children: [
        /* @__PURE__ */ r("thead", { children: /* @__PURE__ */ b("tr", { className: "border-b border-gray-700 bg-background-light-2xl", children: [
          u && /* @__PURE__ */ r("th", { className: "text-left py-3 px-4 font-semibold", children: "Hex Opcode" }),
          /* @__PURE__ */ r("th", { className: "text-left py-3 px-4 font-semibold", children: "Mnemonic" }),
          /* @__PURE__ */ r("th", { className: "text-left py-3 px-4 font-semibold", children: "Decimal Opcode" }),
          x && /* @__PURE__ */ r("th", { className: "text-left py-3 px-4 font-semibold", children: "Binary Opcode" }),
          /* @__PURE__ */ r("th", { className: "text-left py-3 px-4 font-semibold", children: "Description" })
        ] }) }),
        /* @__PURE__ */ r("tbody", { children: y.length === 0 ? /* @__PURE__ */ r("tr", { children: /* @__PURE__ */ r("td", { colSpan: 5, className: "text-center py-4 text-gray-500", children: "No instructions found" }) }) : y.map((n, c) => /* @__PURE__ */ b(
          "tr",
          {
            className: `border-b border-gray-800 hover:bg-gray-800 ${c % 2 === 0 ? "bg-gray-850" : ""}`,
            children: [
              u && /* @__PURE__ */ r("td", { className: "py-3 px-4 font-mono text-yellow-300", children: n.hex }),
              /* @__PURE__ */ r("td", { className: "py-3 px-4 font-mono text-green-300", children: n.mnemonic }),
              /* @__PURE__ */ r("td", { className: "py-3 px-4 font-mono text-blue-300", children: n.opcode }),
              x && /* @__PURE__ */ r("td", { className: "py-3 px-4 font-mono text-purple-300", children: n.binary }),
              /* @__PURE__ */ r("td", { className: "py-3 px-4 font-mono text-blue-300", children: n.description })
            ]
          },
          n.opcode
        )) })
      ] }) }),
      /* @__PURE__ */ r("div", { className: "py-2 px-4 border-t border-gray-700 bg-background-light-3xl p-1 rounded", children: /* @__PURE__ */ b("div", { className: "flex flex-wrap gap-4 text-sm", children: [
        /* @__PURE__ */ b("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ r("div", { className: "w-3 h-3 bg-green-300" }),
          /* @__PURE__ */ r("span", { children: "Mnemonic" })
        ] }),
        /* @__PURE__ */ b("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ r("div", { className: "w-3 h-3 bg-yellow-300" }),
          /* @__PURE__ */ r("span", { children: "Hexadecimal" })
        ] }),
        /* @__PURE__ */ b("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ r("div", { className: "w-3 h-3 bg-blue-300" }),
          /* @__PURE__ */ r("span", { children: "Opcode" })
        ] }),
        /* @__PURE__ */ b("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ r("div", { className: "w-3 h-3 bg-purple-300" }),
          /* @__PURE__ */ r("span", { children: "Binary" })
        ] })
      ] }) })
    ] })
  ] });
}, qt = (e) => {
  const { hidden: t = !1, open: a = !1 } = e, [i, s] = O(a), [l, d] = O(""), [u, h] = O(!0), [x, v] = O(!0), y = Object.entries(W).map(([n, c], o) => {
    const m = c;
    return {
      address: c.toString(),
      label: n,
      hex: Oe(m, 4),
      binary: m.toString(2).padStart(16, "0"),
      decimal: m,
      idx: o
    };
  }).sort((n, c) => n.decimal != c.decimal ? n.decimal - c.decimal : n.idx - c.idx).filter(
    (n) => n.label.toLowerCase().includes(l.toLowerCase()) || n.hex.toLowerCase().includes(l.toLowerCase()) || n.binary.includes(l) || n.address.includes(l)
  );
  return /* @__PURE__ */ b("div", { className: `memory-map w-auto bg-slate-800 p-1 ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ b("div", { className: "w-full flex bg-background-light p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold", children: "Memory Map (documentation)" }),
      /* @__PURE__ */ r(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => s((n) => !n),
          children: i ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ b("div", { className: `${i ? "flex" : "hidden"} flex-col space-y-2 p-1`, children: [
      /* @__PURE__ */ r("div", { className: "mt-2 rounded", children: /* @__PURE__ */ r("div", { className: "", children: /* @__PURE__ */ r(
        "input",
        {
          type: "text",
          placeholder: "Search memory map...",
          value: l,
          onChange: (n) => d(n.target.value),
          className: "w-full px-4 py-2 bg-background-light-2xl border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        }
      ) }) }),
      /* @__PURE__ */ r("div", { className: "overflow-x-auto bg-background-light-3xl p-1 rounded max-h-[50vh]", children: /* @__PURE__ */ b("table", { className: "w-full border-collapse", children: [
        /* @__PURE__ */ r("thead", { children: /* @__PURE__ */ b("tr", { className: "border-b border-gray-700 bg-background-light-2xl", children: [
          u && /* @__PURE__ */ r("th", { className: "text-left py-3 px-4 font-semibold", children: "Hex Address" }),
          /* @__PURE__ */ r("th", { className: "text-left py-3 px-4 font-semibold", children: "Mnemonic" }),
          /* @__PURE__ */ r("th", { className: "text-left py-3 px-4 font-semibold", children: "Decimal Address" }),
          x && /* @__PURE__ */ r("th", { className: "text-left py-3 px-4 font-semibold", children: "Binary Address" })
        ] }) }),
        /* @__PURE__ */ r("tbody", { children: y.length === 0 ? /* @__PURE__ */ r("tr", { children: /* @__PURE__ */ r("td", { colSpan: 5, className: "text-center py-4 text-gray-500", children: "No address found" }) }) : y.map((n, c) => /* @__PURE__ */ b(
          "tr",
          {
            className: `border-b border-gray-800 hover:bg-gray-800 ${c % 2 === 0 ? "bg-gray-850" : ""}`,
            children: [
              u && /* @__PURE__ */ r("td", { className: "py-3 px-4 font-mono text-yellow-300", children: n.hex }),
              /* @__PURE__ */ r("td", { className: "py-3 px-4 font-mono text-green-300", children: n.label }),
              /* @__PURE__ */ r("td", { className: "py-3 px-4 font-mono text-blue-300", children: n.address }),
              x && /* @__PURE__ */ r("td", { className: "py-3 px-4 font-mono text-purple-300", children: n.binary })
            ]
          },
          n.label
        )) })
      ] }) }),
      /* @__PURE__ */ r("div", { className: "py-2 px-4 border-t border-gray-700 bg-background-light-3xl p-1 rounded", children: /* @__PURE__ */ b("div", { className: "flex flex-wrap gap-4 text-sm", children: [
        /* @__PURE__ */ b("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ r("div", { className: "w-3 h-3 bg-yellow-300" }),
          /* @__PURE__ */ r("span", { children: "Hexadecimal" })
        ] }),
        /* @__PURE__ */ b("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ r("div", { className: "w-3 h-3 bg-green-300" }),
          /* @__PURE__ */ r("span", { children: "Mnemonic" })
        ] }),
        /* @__PURE__ */ b("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ r("div", { className: "w-3 h-3 bg-blue-300" }),
          /* @__PURE__ */ r("span", { children: "Decimal" })
        ] }),
        /* @__PURE__ */ b("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ r("div", { className: "w-3 h-3 bg-purple-300" }),
          /* @__PURE__ */ r("span", { children: "Binary" })
        ] })
      ] }) })
    ] })
  ] });
};
var K = {}, H = Symbol(), V = Symbol(), ke = (e) => typeof e == "string" ? B[e] : e, B = {
  plain: K,
  plaintext: K,
  text: K,
  txt: K
}, _e = (e, t) => (t[V] || $e)(e, t), $e = (e, t) => {
  for (var a = [e], i, s = [], l = 0; i = ke(t[H]); )
    delete t[H], Object.assign(t, i);
  for (Te(e, t, a, 0); s[l++] = a[0], a = a[1]; ) ;
  return s;
}, tt = (e, t, a) => e.replace(/&/g, "&amp;").replace(t, a), de = "</span>", q = "", F = "", Le = (e) => {
  for (var t = "", a, i = 0; a = e[i++]; ) t += Me(a);
  return t;
}, Me = (e) => {
  if (e instanceof j) {
    var { type: t, alias: a, content: i } = e, s = q, l = F, d = `<span class="token ${t + (a ? " " + a : "") + (t == "keyword" && typeof i == "string" ? " keyword-" + i : "")}">`;
    F += de, q += d;
    var u = Me(i);
    return q = s, F = l, d + u + de;
  }
  return typeof e != "string" ? Le(e) : (e = tt(e, /</g, "&lt;"), F && e.includes(`
`) ? e.replace(/\n/g, F + `
` + q) : e);
}, Te = (e, t, a, i, s) => {
  for (var l in t)
    if (t[l]) for (var d = 0, u = t[l], h, x = Array.isArray(u) ? u : [u]; h = x[d]; d++) {
      if (s && s[0] == l && s[1] == d)
        return;
      for (var v = h.pattern || h, f = ke(h.inside), y = h.lookbehind, n = v.global, c = h.alias, o = a, m = i; o && (!s || m < s[2]); m += o[0].length, o = o[1]) {
        var w = o[0], k = 0, N;
        if (!(w instanceof j)) {
          if (v.lastIndex = n ? m : 0, N = v.exec(n ? e : w), !N && n)
            break;
          if (N && N[0]) {
            var I = y && N[1] ? N[1].length : 0, $ = N.index + I, A = N[0].slice(I), _ = $ + A.length, D, u;
            if (n) {
              for (; u = m + o[0].length, $ >= u; o = o[1], m = u) ;
              if (o[0] instanceof j)
                continue;
              for (D = o, u = m; (u += D[0].length) < _; D = D[1], k++) ;
              w = e.slice(m, u), $ -= m, _ -= m;
            }
            for (var g = w.slice(_), p = m + w.length, E = new j(l, f ? _e(A, f) : A, A, c), C = o, M = 0, T; C = C[1], M++ < k; ) ;
            g && (!C || C[0] instanceof j ? C = [g, C] : C[0] = g + C[0]), m += $, o[0] = $ ? w.slice(0, $) : E, $ ? o = o[1] = [E, C] : o[1] = C, k && (Te(e, t, o, m, T = [l, d, p]), p = T[2]), s && p > s[2] && (s[2] = p);
          }
        }
      }
    }
};
function j(e, t, a, i) {
  this.type = e, this.content = t, this.alias = i, this.length = a.length;
}
const nt = ae(null), ue = Be(
  Ee((e, t) => {
    let a = [], i = 0, s, l, d, u = 0, h = "", x, v, f = !1, y = [], n, c;
    const o = () => n ? [n.selectionStart, n.selectionEnd, n.selectionDirection] : [0, 0, "none"], m = {}, w = {
      Escape() {
        n.blur();
      }
    }, k = {}, N = (g) => {
      if (Z || g) {
        const p = o(), E = _.lines[u = rt(h, 0, p[p[2] < "f" ? 0 : 1])];
        E != l && (l == null || l.classList.remove("active-line"), E.classList.add("active-line"), l = E), $(), I("selectionChange", p, h);
      }
    }, I = (g, ...p) => {
      var E, C, M;
      (E = m[g]) == null || E.forEach((T) => T(...p)), (M = (C = _.props)["on" + g[0].toUpperCase() + g.slice(1)]) == null || M.call(C, ...p, _);
    }, $ = U(() => {
      let g = _.props, [p, E] = o(), C = g.className, M = `prism-code-editor language-${d}${g.lineNumbers == !1 ? "" : " show-line-numbers"} pce-${g.wordWrap ? "" : "no"}wrap${g.rtl ? " pce-rtl" : ""} pce-${p < E ? "has" : "no"}-selection${f ? " pce-focus" : ""}${g.readOnly ? " pce-readonly" : ""}${C ? " " + C : ""}`;
      M != v && (c.className = v = M);
    }), A = () => {
      h = n.value, y = _e(h, B[d] || {}), I("tokenize", y, d, h);
      let g = Le(y).split(`
`), p = 0, E = i, C = i = g.length;
      for (; g[p] == a[p] && p < C; ) ++p;
      for (; C && g[--C] == a[--E]; ) ;
      if (p == C && p == E) s[p + 1].innerHTML = g[p] + `
`;
      else {
        let M = E < p ? E : p - 1, T = M, S = "";
        for (; T < C; ) S += `<div class=pce-line aria-hidden=true>${g[++T]}
</div>`;
        for (T = C < p ? C : p - 1; T < E; T++) s[p + 1].remove();
        S && s[M + 1].insertAdjacentHTML("afterend", S), c.style.setProperty(
          "--number-width",
          Math.ceil(Math.log10(i + 1)) + ".001ch"
        );
      }
      I("update", h), N(!0), Z && setTimeout(setTimeout, 0, () => Z = !0), a = g, Z = !1;
    }, _ = U({
      inputCommandMap: k,
      keyCommandMap: w,
      extensions: {},
      get value() {
        return h;
      },
      get focused() {
        return f;
      },
      get tokens() {
        return y;
      },
      get activeLine() {
        return u;
      },
      on: (g, p) => ((m[g] || (m[g] = /* @__PURE__ */ new Set())).add(p), () => {
        m[g].delete(p);
      }),
      update: A,
      getSelection: o
    }), D = U((g) => {
      g && !n && (_.textarea = n = g, P(n, "keydown", (p) => {
        var E;
        (E = w[p.key]) != null && E.call(w, p, o(), h) && X(p);
      }), P(n, "beforeinput", (p) => {
        var E;
        (_.props.readOnly || p.inputType == "insertText" && ((E = k[p.data]) != null && E.call(k, p, o(), h))) && X(p);
      }), P(n, "input", A), P(n, "blur", () => {
        z = null, f = !1, $();
      }), P(n, "focus", () => {
        z = N, f = !0, $();
      }), P(n, "selectionchange", (p) => {
        N(), X(p);
      }));
    });
    return _.props = e = { language: "text", value: "", ...e }, le(
      U(() => {
        const { value: g, language: p } = _.props;
        g != x && (f || n.remove(), n.value = x = g, n.selectionEnd = 0, f || s[0].prepend(n)), d = p, A();
      }),
      [e.value, e.language]
    ), le($), Ue(t, () => _, []), /* @__PURE__ */ r(
      "div",
      {
        ref: U((g) => {
          g && (_.container = c = g);
        }),
        style: {
          ...e.style,
          tabSize: `${e.tabSize || 2}`
        },
        children: /* @__PURE__ */ r(
          "div",
          {
            className: "pce-wrapper",
            ref: U((g) => {
              g && (_.wrapper = g, _.lines = s = g.children);
            }),
            children: /* @__PURE__ */ b("div", { className: "pce-overlays", children: [
              /* @__PURE__ */ r(
                "textarea",
                {
                  spellCheck: "false",
                  autoCapitalize: "none",
                  autoComplete: "off",
                  inputMode: e.readOnly ? "none" : "text",
                  "aria-readonly": e.readOnly,
                  ...e.textareaProps,
                  className: "pce-textarea",
                  ref: D
                }
              ),
              /* @__PURE__ */ r(nt.Provider, { value: [_, e], children: e.children })
            ] })
          }
        )
      }
    );
  })
), fe = "u" > typeof window ? document : null, X = (e) => {
  e.preventDefault(), e.stopImmediatePropagation();
}, P = (e, t, a, i) => e.addEventListener(t, a, i), U = (e) => je(e).current, rt = (e, t = 0, a = 1 / 0) => {
  let i = 1;
  for (; (t = e.indexOf(`
`, t) + 1) && t <= a; i++) ;
  return i;
};
fe && P(fe, "selectionchange", () => z == null ? void 0 : z());
let z, Z = !0;
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
var Y = (e, t) => {
  if (t.has(e)) return t.get(e);
  var a = e, i = it.call(e).slice(8, -1);
  if (i == "Object") {
    t.set(e, a = {});
    for (var s in e)
      a[s] = Y(e[s], t);
    e[H] && (a[H] = Y(e[H], t)), e[V] && (a[V] = e[V]);
  } else if (i == "Array") {
    t.set(e, a = []);
    for (var l = 0, d = e.length; l < d; l++)
      a[l] = Y(e[l], t);
  }
  return a;
}, at = (e) => Y(e, /* @__PURE__ */ new Map()), st = (e, t, a) => {
  var i = {};
  for (var s in e)
    i[s] = e[s], delete e[s];
  for (var s in i)
    s == t && Object.assign(e, a), a.hasOwnProperty(s) || (e[s] = i[s]);
}, it = {}.toString, ot = (e, t) => e.replace(/<(\d+)>/g, (a, i) => `(?:${t[+i]})`), pe = (e, t, a) => RegExp(ot(e, t), a), he = "\\s|//.*(?!.)|/\\*(?:[^*]|\\*(?!/))*\\*/", me = "\\{(?:[^{}]|\\{(?:[^{}]|\\{(?:[^{}]|\\{[^}]*\\})*\\})*\\})*\\}", lt = (e, t) => {
  for (var a = 0, i = $e(e, t), s = 0, l = [], d = 0, u, h = 0, x, v, f, y = () => {
    x && (v = e.slice(x, a), i[h++] = new j("plain-text", v, v), x = 0);
  }; u = i[s]; s++, a += n) {
    var n = u.length, c = u.type, o, m;
    c && (v = u.content, c == "tag" ? (m = v[0].length, o = v[2] ? e.substr(a + m, v[1].length) : "", m > 1 ? d && f[0] == o && (f = l[--d - 1]) : v[v.length - 1].length < 2 && (l[d++] = f = [o, 0])) : d && c == "punctuation" ? v == "{" ? f[1]++ : f[1] && v == "}" ? f[1]-- : c = "}()[]".includes(v) : c = !1), !c && d && !f[1] ? x || (x = a) : (y(), i[h++] = u);
  }
  return y(), i.length = h, i;
}, ct = (e, t) => (st(B[t] = e = at(e), "regex", {
  tag: {
    pattern: pe(
      `</?(?:(?!\\d)[^\\s%=<>/]+(?:<0>(?:<0>*(?:[^\\s{=<>/*]+(?:<0>*=<0>*(?!\\s)(?:"[^"]*"|'[^']*'|<1>)?|(?=[\\s/>]))|<1>))*)?<0>*/?)?>`,
      [he, me],
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
        pattern: pe(`(=<0>*)(?:"[^"]*"|'[^']*')`, [he]),
        lookbehind: !0,
        inside: {
          punctuation: /^["']|["']$/g
        }
      },
      expression: {
        pattern: RegExp(me, "g"),
        alias: "language-" + t,
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
}), e[V] = lt, e), dt = /\/\/.*|\/\*[^]*?(?:\*\/|$)/g, ut = /(["'])(?:\\[^]|(?!\1)[^\\\n])*\1/g, ft = /\b(?:false|true)\b/, pt = {
  punctuation: /\./
}, ee = {
  "maybe-class-name": /^[A-Z].*/
};
B.js = B.javascript = {
  "doc-comment": {
    pattern: /\/\*\*(?!\/)[^]*?(?:\*\/|$)/g,
    alias: "comment",
    inside: "jsdoc"
  },
  comment: dt,
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
          [H]: "js"
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
  string: ut,
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
      inside: pt
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
    inside: ee
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
  boolean: ft,
  // Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
  function: {
    pattern: /#?(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
    inside: ee
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
    inside: ee
  },
  "maybe-class-name": {
    pattern: /(^|[^$\w\xa0-\uffff])[A-Z][$\w\xa0-\uffff]+/,
    lookbehind: !0
  },
  punctuation: /\?\.|[()[\]{}.,:;]/
};
ct(B.js, "jsx");
function ht(e, t) {
  if (e instanceof RegExp) return { keys: !1, pattern: e };
  var a, i, s, l, d = [], u = "", h = e.split("/");
  for (h[0] || h.shift(); s = h.shift(); )
    a = s[0], a === "*" ? (d.push(a), u += s[1] === "?" ? "(?:/(.*))?" : "/(.*)") : a === ":" ? (i = s.indexOf("?", 1), l = s.indexOf(".", 1), d.push(s.substring(1, ~i ? i : ~l ? l : s.length)), u += ~i && !~l ? "(?:/([^/]+?))?" : "/([^/]+?)", ~l && (u += (~i ? "?" : "") + "\\" + s.substring(l))) : u += "/" + s;
  return {
    keys: d,
    pattern: new RegExp("^" + u + (t ? "(?=$|/)" : "/?$"), "i")
  };
}
var re = { exports: {} }, te = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ge;
function mt() {
  if (ge) return te;
  ge = 1;
  var e = Ce;
  function t(f, y) {
    return f === y && (f !== 0 || 1 / f === 1 / y) || f !== f && y !== y;
  }
  var a = typeof Object.is == "function" ? Object.is : t, i = e.useState, s = e.useEffect, l = e.useLayoutEffect, d = e.useDebugValue;
  function u(f, y) {
    var n = y(), c = i({ inst: { value: n, getSnapshot: y } }), o = c[0].inst, m = c[1];
    return l(
      function() {
        o.value = n, o.getSnapshot = y, h(o) && m({ inst: o });
      },
      [f, n, y]
    ), s(
      function() {
        return h(o) && m({ inst: o }), f(function() {
          h(o) && m({ inst: o });
        });
      },
      [f]
    ), d(n), n;
  }
  function h(f) {
    var y = f.getSnapshot;
    f = f.value;
    try {
      var n = y();
      return !a(f, n);
    } catch {
      return !0;
    }
  }
  function x(f, y) {
    return y();
  }
  var v = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? x : u;
  return te.useSyncExternalStore = e.useSyncExternalStore !== void 0 ? e.useSyncExternalStore : v, te;
}
var ne = {};
/**
 * @license React
 * use-sync-external-store-shim.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var be;
function gt() {
  return be || (be = 1, process.env.NODE_ENV !== "production" && function() {
    function e(n, c) {
      return n === c && (n !== 0 || 1 / n === 1 / c) || n !== n && c !== c;
    }
    function t(n, c) {
      v || s.startTransition === void 0 || (v = !0, console.error(
        "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
      ));
      var o = c();
      if (!f) {
        var m = c();
        l(o, m) || (console.error(
          "The result of getSnapshot should be cached to avoid an infinite loop"
        ), f = !0);
      }
      m = d({
        inst: { value: o, getSnapshot: c }
      });
      var w = m[0].inst, k = m[1];
      return h(
        function() {
          w.value = o, w.getSnapshot = c, a(w) && k({ inst: w });
        },
        [n, o, c]
      ), u(
        function() {
          return a(w) && k({ inst: w }), n(function() {
            a(w) && k({ inst: w });
          });
        },
        [n]
      ), x(o), o;
    }
    function a(n) {
      var c = n.getSnapshot;
      n = n.value;
      try {
        var o = c();
        return !l(n, o);
      } catch {
        return !0;
      }
    }
    function i(n, c) {
      return c();
    }
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var s = Ce, l = typeof Object.is == "function" ? Object.is : e, d = s.useState, u = s.useEffect, h = s.useLayoutEffect, x = s.useDebugValue, v = !1, f = !1, y = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? i : t;
    ne.useSyncExternalStore = s.useSyncExternalStore !== void 0 ? s.useSyncExternalStore : y, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
  }()), ne;
}
process.env.NODE_ENV === "production" ? re.exports = mt() : re.exports = gt();
var bt = re.exports;
const vt = Q.useInsertionEffect, xt = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u", yt = xt ? Q.useLayoutEffect : Q.useEffect, wt = vt || yt, Re = (e) => {
  const t = Q.useRef([e, (...a) => t[0](...a)]).current;
  return wt(() => {
    t[0] = e;
  }), t[1];
}, St = "popstate", se = "pushState", ie = "replaceState", Nt = "hashchange", ve = [
  St,
  se,
  ie,
  Nt
], Ct = (e) => {
  for (const t of ve)
    addEventListener(t, e);
  return () => {
    for (const t of ve)
      removeEventListener(t, e);
  };
}, Ie = (e, t) => bt.useSyncExternalStore(Ct, e, t), xe = () => location.search, Et = ({ ssrSearch: e } = {}) => Ie(
  xe,
  // != null checks for both null and undefined, but allows empty string ""
  // This allows proper hydration: server renders with ssrSearch="?foo",
  // client hydrates with just <Router /> and reads from location.search
  e != null ? () => e : xe
), ye = () => location.pathname, Ot = ({ ssrPath: e } = {}) => Ie(
  ye,
  // != null checks for both null and undefined, but allows empty string ""
  // This allows proper hydration: server renders with ssrPath="/foo",
  // client hydrates with just <Router /> and reads from location.pathname
  e != null ? () => e : ye
), kt = (e, { replace: t = !1, state: a = null } = {}) => history[t ? ie : se](a, "", e), _t = (e = {}) => [Ot(e), kt], we = Symbol.for("wouter_v3");
if (typeof history < "u" && typeof window[we] > "u") {
  for (const e of [se, ie]) {
    const t = history[e];
    history[e] = function() {
      const a = t.apply(this, arguments), i = new Event(e);
      return i.arguments = arguments, dispatchEvent(i), a;
    };
  }
  Object.defineProperty(window, we, { value: !0 });
}
const $t = (e, t) => t.toLowerCase().indexOf(e.toLowerCase()) ? "~" + t : t.slice(e.length) || "/", Ae = (e = "") => e === "/" ? "" : e, Lt = (e, t) => e[0] === "~" ? e.slice(1) : Ae(t) + e, Mt = (e = "", t) => $t(Se(Ae(e)), Se(t)), Se = (e) => {
  try {
    return decodeURI(e);
  } catch {
    return e;
  }
}, Tt = {
  hook: _t,
  searchHook: Et,
  parser: ht,
  base: "",
  // this option is used to override the current location during SSR
  ssrPath: void 0,
  ssrSearch: void 0,
  // optional context to track render state during SSR
  ssrContext: void 0,
  // customizes how `href` props are transformed for <Link />
  hrefs: (e) => e,
  // wraps navigate calls, useful for view transitions
  aroundNav: (e, t, a) => e(t, a)
}, Rt = ae(Tt), It = () => ze(Rt), At = {};
ae(At);
const Dt = (e) => {
  const [t, a] = e.hook(e);
  return [
    Mt(e.base, t),
    Re(
      (i, s) => e.aroundNav(a, Lt(i, e.base), s)
    )
  ];
};
Ee((e, t) => {
  const a = It(), [i, s] = Dt(a), {
    to: l = "",
    href: d = l,
    onClick: u,
    asChild: h,
    children: x,
    className: v,
    /* eslint-disable no-unused-vars */
    replace: f,
    state: y,
    transition: n,
    /* eslint-enable no-unused-vars */
    ...c
  } = e, o = Re((w) => {
    w.ctrlKey || w.metaKey || w.altKey || w.shiftKey || w.button !== 0 || (u == null || u(w), w.defaultPrevented || (w.preventDefault(), s(d, e)));
  }), m = a.hrefs(
    d[0] === "~" ? d.slice(1) : a.base + d,
    a
    // pass router as a second argument for convinience
  );
  return h && He(x) ? Fe(x, { onClick: o, href: m }) : Ve("a", {
    ...c,
    onClick: o,
    href: m,
    // `className` can be a function to apply the class if this link is active
    className: v != null && v.call ? v(i === d) : v,
    children: x,
    ref: t
  });
});
const Pt = (e) => `[
` + e.map(([t, a, i, s], l) => {
  let d = "";
  return s != null && s.length && (d += `${l === 0 ? "" : `
`}    // [${s.join(" - ")}]
`), d += `    [${Oe(t)}, ${a}],${i ? ` // ${i}` : ""}`, d;
}).join(`
`) + `
]`, Zt = (e) => {
  const { computerRef: t, memoryBusRef: a } = Ne(), { hidden: i = !1, open: s = !1 } = e, [l, d] = O(s), [u, h] = O(`
`.repeat(3)), [x, v] = O(u), [f, y] = O(null), [n, c] = O(""), [o, m] = O("0x00"), [w, k] = O(0), [N, I] = O("0x00"), [$, A] = O(0), [_, D] = O(!1);
  G(() => {
    const S = Number(o);
    k(ce(S));
  }, [o]), G(() => {
    const S = Number(N);
    A(ce(S));
  }, [N]);
  const g = async (S) => {
    let L = null;
    if (S === "auto" && (S = x.toLowerCase().includes("section .text") ? "nasm" : "custom"), S === "custom") {
      const R = await We(x, w, $);
      L = Ye(R.code).code;
      const J = Pt(R.code);
      c(J);
    } else if (S === "nasm") {
      const R = Qe(x), J = `[
${Je(R)}]`;
      L = Xe(R), c(J), console.log("code:", L);
    }
    L && y(L);
  }, p = async () => {
    D(!0);
  }, E = async (S) => {
    const R = await (await fetch(`/asm/${S}`)).text();
    h(R);
  }, C = () => {
    var S, L, R;
    if (f && a.current) {
      if (!a.current.dma) {
        console.warn("Cannot load custom code in RAM. DMA not loaded.");
        return;
      }
      if (w <= W.ROM_END) {
        if (!((R = (L = (S = t.current) == null ? void 0 : S.motherboard) == null ? void 0 : L.memoryBus) != null && R.rom)) return;
        t.current.motherboard.memoryBus.rom.loadRawData(f);
        return;
      }
      w >= W.RAM_START && w <= W.RAM_END && a.current.dma.loadCodeInRam(f);
    }
  }, M = (S, L) => {
    v(S);
  }, T = async (S, L) => {
    c(S);
    const R = new Function("return " + S)();
    y(R);
  };
  return /* @__PURE__ */ b("div", { className: `ide w-auto bg-teal-900 p-1 ${i ? "hidden" : ""}`, children: [
    /* @__PURE__ */ b("div", { className: "w-full flex bg-background-light p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold", children: "IDE / Playground" }),
      /* @__PURE__ */ r(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => d((S) => !S),
          children: l ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ b("div", { className: `${l ? "flex" : "hidden"} flex-col space-y-2 p-1`, children: [
      /* @__PURE__ */ b("div", { className: "ide-toolbar bg-background-light-xl flex justify-end gap-2 p-2", children: [
        /* @__PURE__ */ r(
          "button",
          {
            onClick: () => p(),
            className: "cursor-pointer px-3 bg-background-light-2xl hover:bg-background-light-3xl rounded",
            children: "Open File"
          }
        ),
        /* @__PURE__ */ b("div", { className: "ms-auto flex gap-2 items-center", children: [
          /* @__PURE__ */ r("div", { children: "Offset Memory:" }),
          /* @__PURE__ */ r(
            "input",
            {
              type: "search",
              value: "0x" + (o.startsWith("0x") ? o.slice(2) : o),
              placeholder: "0x0000",
              list: "ide-offset-memory",
              onChange: (S) => m(S.target.value),
              className: "w-24 font-mono text-sm bg-gray-800 text-yellow-300 p-1 border-none focus:outline-none"
            }
          ),
          /* @__PURE__ */ b("datalist", { id: "ide-offset-memory", children: [
            /* @__PURE__ */ r("option", { value: "0x0000", children: "Bootloader" }),
            /* @__PURE__ */ r("option", { value: "0x0500", children: "OS" }),
            /* @__PURE__ */ r("option", { value: "0x1000", children: "Program" })
          ] }),
          /* @__PURE__ */ b("div", { className: "w-16", children: [
            "(",
            w,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ b("div", { className: "ms-auto flex gap-2 items-center", children: [
          /* @__PURE__ */ r("div", { children: "Offset Line:" }),
          /* @__PURE__ */ r(
            "input",
            {
              type: "text",
              value: "0x" + (N.startsWith("0x") ? N.slice(2) : N),
              placeholder: "0x0000",
              onChange: (S) => I(S.target.value),
              className: "w-24 font-mono text-sm bg-gray-800 text-yellow-300 p-1 border-none focus:outline-none"
            }
          ),
          /* @__PURE__ */ b("div", { className: "w-16", children: [
            "(",
            $,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            onClick: () => g("auto"),
            className: "cursor-pointer px-3 bg-background-light-2xl hover:bg-background-light-3xl rounded",
            children: "Compile"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            onClick: () => C(),
            className: "cursor-pointer px-3 bg-background-light-2xl hover:bg-background-light-3xl rounded",
            children: "Load"
          }
        )
      ] }),
      /* @__PURE__ */ r("div", { className: "ide-editors", children: /* @__PURE__ */ b("div", { className: "ide-editors-inner grid grid-cols-2 gap-8 mx-2", children: [
        /* @__PURE__ */ b("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ r("h2", { children: "Source Code" }),
          /* @__PURE__ */ r(
            ue,
            {
              className: "ide-editor-source h-full",
              language: "nasm",
              value: u,
              onUpdate: (S, L) => M(S)
            }
          )
        ] }),
        /* @__PURE__ */ b("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ r("h2", { children: "Compiled Code" }),
          /* @__PURE__ */ r(
            ue,
            {
              className: "ide-editor-compiled h-full",
              language: "javascript",
              value: n,
              onUpdate: (S, L) => T(S)
            }
          )
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ r(
      Bt,
      {
        isOpen: _,
        onClose: () => D(!1),
        onSelectFile: E
      }
    )
  ] });
}, Bt = ({
  isOpen: e,
  onClose: t,
  onSelectFile: a
}) => {
  const [i, s] = O([]), [l, d] = O(!1);
  G(() => {
    e && u();
  }, [e]);
  const u = async () => {
    d(!0);
    try {
      const v = await (await fetch("/asm-files.json")).json();
      s(v.files);
    } catch (x) {
      console.error("Failed to load file list:", x), s([]);
    } finally {
      d(!1);
    }
  };
  if (!e) return null;
  const h = (x) => {
    a(x), t();
  };
  return /* @__PURE__ */ r("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50", children: /* @__PURE__ */ b("div", { className: "bg-gray-800 rounded-lg p-6 w-96 overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ b("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ r("h2", { className: "text-xl font-bold", children: "Select a File" }),
      /* @__PURE__ */ r(
        "button",
        {
          onClick: t,
          className: "text-gray-400 hover:text-white text-xl",
          children: "×"
        }
      )
    ] }),
    /* @__PURE__ */ r("div", { className: "flex-1 overflow-y-auto mb-4", children: l ? /* @__PURE__ */ r("div", { className: "text-center py-4", children: "Loading files..." }) : i.length === 0 ? /* @__PURE__ */ r("div", { className: "text-center py-4", children: "No files found" }) : /* @__PURE__ */ r("ul", { className: "space-y-1", children: i.map((x, v) => /* @__PURE__ */ r("li", { children: /* @__PURE__ */ r(
      "button",
      {
        onClick: () => h(x),
        className: "w-full text-left px-3 py-2 hover:bg-gray-700 rounded truncate cursor-pointer",
        children: x
      }
    ) }, v)) }) }),
    /* @__PURE__ */ r("div", { className: "flex justify-end", children: /* @__PURE__ */ r(
      "button",
      {
        onClick: t,
        className: "px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded",
        children: "Cancel"
      }
    ) })
  ] }) });
};
export {
  Qt as Clock,
  Jt as Computer,
  Xt as Cpu,
  Kt as CpuInstructions,
  en as Dma,
  tn as ExternalDevices,
  Zt as IDE,
  nn as InternalDevices,
  rn as Interrupt,
  an as Memory,
  qt as MemoryMap,
  sn as Motherboard,
  on as PowerSupply,
  ln as Ram,
  cn as Rom,
  Gt as Timer
};
