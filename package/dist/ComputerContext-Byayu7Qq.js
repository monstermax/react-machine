import { jsx as r, Fragment as H, jsxs as l } from "react/jsx-runtime";
import G, { useState as I, useRef as Q, useEffect as K, useCallback as oe, useMemo as Se, createContext as ke, useContext as Fe } from "react";
import { O as e, l as i, M as s, h as o, e as Oe, a as ce, i as me, U as Z, j as pe, k as Ee, m as be, n as Be, o as Ke, c as He, d as Ue } from "./asm_compiler-CK23_zXK.js";
function $e(g) {
  return g && g.__esModule && Object.prototype.hasOwnProperty.call(g, "default") ? g.default : g;
}
var Re = { exports: {} };
(function(g) {
  var t = Object.prototype.hasOwnProperty, n = "~";
  function c() {
  }
  Object.create && (c.prototype = /* @__PURE__ */ Object.create(null), new c().__proto__ || (n = !1));
  function a(m, b, O) {
    this.fn = m, this.context = b, this.once = O || !1;
  }
  function u(m, b, O, E, S) {
    if (typeof O != "function")
      throw new TypeError("The listener must be a function");
    var y = new a(O, E || m, S), w = n ? n + b : b;
    return m._events[w] ? m._events[w].fn ? m._events[w] = [m._events[w], y] : m._events[w].push(y) : (m._events[w] = y, m._eventsCount++), m;
  }
  function _(m, b) {
    --m._eventsCount === 0 ? m._events = new c() : delete m._events[b];
  }
  function d() {
    this._events = new c(), this._eventsCount = 0;
  }
  d.prototype.eventNames = function() {
    var b = [], O, E;
    if (this._eventsCount === 0) return b;
    for (E in O = this._events)
      t.call(O, E) && b.push(n ? E.slice(1) : E);
    return Object.getOwnPropertySymbols ? b.concat(Object.getOwnPropertySymbols(O)) : b;
  }, d.prototype.listeners = function(b) {
    var O = n ? n + b : b, E = this._events[O];
    if (!E) return [];
    if (E.fn) return [E.fn];
    for (var S = 0, y = E.length, w = new Array(y); S < y; S++)
      w[S] = E[S].fn;
    return w;
  }, d.prototype.listenerCount = function(b) {
    var O = n ? n + b : b, E = this._events[O];
    return E ? E.fn ? 1 : E.length : 0;
  }, d.prototype.emit = function(b, O, E, S, y, w) {
    var C = n ? n + b : b;
    if (!this._events[C]) return !1;
    var p = this._events[C], P = arguments.length, M, f;
    if (p.fn) {
      switch (p.once && this.removeListener(b, p.fn, void 0, !0), P) {
        case 1:
          return p.fn.call(p.context), !0;
        case 2:
          return p.fn.call(p.context, O), !0;
        case 3:
          return p.fn.call(p.context, O, E), !0;
        case 4:
          return p.fn.call(p.context, O, E, S), !0;
        case 5:
          return p.fn.call(p.context, O, E, S, y), !0;
        case 6:
          return p.fn.call(p.context, O, E, S, y, w), !0;
      }
      for (f = 1, M = new Array(P - 1); f < P; f++)
        M[f - 1] = arguments[f];
      p.fn.apply(p.context, M);
    } else {
      var V = p.length, R;
      for (f = 0; f < V; f++)
        switch (p[f].once && this.removeListener(b, p[f].fn, void 0, !0), P) {
          case 1:
            p[f].fn.call(p[f].context);
            break;
          case 2:
            p[f].fn.call(p[f].context, O);
            break;
          case 3:
            p[f].fn.call(p[f].context, O, E);
            break;
          case 4:
            p[f].fn.call(p[f].context, O, E, S);
            break;
          default:
            if (!M) for (R = 1, M = new Array(P - 1); R < P; R++)
              M[R - 1] = arguments[R];
            p[f].fn.apply(p[f].context, M);
        }
    }
    return !0;
  }, d.prototype.on = function(b, O, E) {
    return u(this, b, O, E, !1);
  }, d.prototype.once = function(b, O, E) {
    return u(this, b, O, E, !0);
  }, d.prototype.removeListener = function(b, O, E, S) {
    var y = n ? n + b : b;
    if (!this._events[y]) return this;
    if (!O)
      return _(this, y), this;
    var w = this._events[y];
    if (w.fn)
      w.fn === O && (!S || w.once) && (!E || w.context === E) && _(this, y);
    else {
      for (var C = 0, p = [], P = w.length; C < P; C++)
        (w[C].fn !== O || S && !w[C].once || E && w[C].context !== E) && p.push(w[C]);
      p.length ? this._events[y] = p.length === 1 ? p[0] : p : _(this, y);
    }
    return this;
  }, d.prototype.removeAllListeners = function(b) {
    var O;
    return b ? (O = n ? n + b : b, this._events[O] && _(this, O)) : (this._events = new c(), this._eventsCount = 0), this;
  }, d.prototype.off = d.prototype.removeListener, d.prototype.addListener = d.prototype.on, d.prefixed = n, d.EventEmitter = d, g.exports = d;
})(Re);
var Ge = Re.exports;
const te = /* @__PURE__ */ $e(Ge), ze = {
  name: "Mini OS",
  description: "Attend qu'un programme soit chargé en RAM, puis l'exécute",
  filepath: "os/os_v1.asm"
}, Ze = {
  name: "Mini OS (v2)",
  description: "Menu avec console et choix au clavier",
  filepath: "os/os_v2.asm"
}, De = {
  MINI_OS_V1: ze,
  MINI_OS_V2: Ze
}, Je = {
  keyboard_echo: {
    name: "Keyboard Echo",
    description: "Echo clavier vers console (sans interruption)",
    code: /* @__PURE__ */ new Map([
      // === SETUP ===
      [0, e.SET_SP],
      [1, 255],
      [2, 254],
      // SP = 0xFEFF
      // === MAIN LOOP ===
      // Vérifier si une touche est disponible
      [3, e.MOV_A_MEM],
      [4, 81],
      // KEYBOARD_STATUS (0xFF51)
      [5, 255],
      // Si status = 0, boucler
      [6, e.JZ],
      [7, 3],
      [8, 2],
      // Retour à 0x0203
      // Touche disponible - lire le caractère
      [9, e.MOV_A_MEM],
      [10, 80],
      // KEYBOARD_DATA (0xFF50)
      [11, 255],
      // Écrire le caractère dans la console
      [12, e.MOV_MEM_A],
      [13, 112],
      // CONSOLE_CHAR (0xFF70)
      [14, 255],
      // Clear keyboard status
      [15, e.MOV_A_IMM],
      [16, 0],
      [17, e.MOV_MEM_A],
      [18, 81],
      // KEYBOARD_STATUS (0xFF51)
      [19, 255],
      // Retour au début de la boucle
      [20, e.JMP],
      [21, 3],
      [22, 2]
    ])
  },
  keyboard_interrupt: {
    name: "Keyboard Interrupt Demo",
    description: "Echo clavier via interruptions",
    code: /* @__PURE__ */ new Map([
      // === SETUP ===
      [0, e.SET_SP],
      [1, 255],
      [2, 254],
      // Handler @ 0x0240
      [3, e.MOV_A_IMM],
      [4, 64],
      [5, e.MOV_MEM_A],
      [6, 68],
      [7, 255],
      [8, e.MOV_A_IMM],
      [9, 2],
      [10, e.MOV_MEM_A],
      [11, 69],
      [12, 255],
      // Activer IRQ keyboard (bit 1)
      [13, e.MOV_A_IMM],
      [14, 2],
      [15, e.MOV_MEM_A],
      [16, 81],
      [17, 255],
      // Activer IRQ 1 dans interrupt controller
      [18, e.MOV_A_IMM],
      [19, 2],
      [20, e.MOV_MEM_A],
      [21, 64],
      [22, 255],
      // EI
      [23, e.EI],
      // Main loop
      [24, e.NOP],
      [25, e.JMP],
      [26, 24],
      [27, 2],
      // === HANDLER @ 0x40 ===
      [64, e.PUSH_A],
      // Sauvegarder A seulement
      // Lire caractère
      [65, e.MOV_A_MEM],
      [66, 80],
      [67, 255],
      // KEYBOARD_DATA
      // Écrire dans console
      [68, e.MOV_MEM_A],
      [69, 112],
      [70, 255],
      // CONSOLE_CHAR
      // Clear keyboard status, garder IRQ enabled
      [71, e.MOV_A_IMM],
      [72, 2],
      [73, e.MOV_MEM_A],
      [74, 81],
      [75, 255],
      // KEYBOARD_STATUS
      // ACK IRQ 1
      [76, e.MOV_A_IMM],
      [77, 1],
      [78, e.MOV_MEM_A],
      [79, 66],
      [80, 255],
      // INTERRUPT_ACK
      [81, e.POP_A],
      // Restaurer A seulement
      [82, e.IRET]
    ])
  }
}, Ye = {
  leds_test_2: {
    name: "LED TEST (liveCompiled)",
    description: "Allume les LEDs",
    code: /* @__PURE__ */ new Map(),
    filepath: "os/devices/led/led.lib.test.asm"
  },
  leds_test: {
    name: "LED TEST",
    description: "Allume les LEDs",
    code: /* @__PURE__ */ new Map([
      // [INIT]
      [0, e.SET_SP],
      //  Init Stack
      [1, 255],
      [2, 254],
      [3, e.MOV_A_IMM],
      //  clear LCD
      [4, 1],
      [5, e.MOV_MEM_A],
      //  clear LCD
      [6, 161],
      [7, 255],
      // [START]
      [8, e.CALL],
      //  Go to LEDS_ON
      [9, 22],
      [10, 16],
      [11, e.MOV_A_IMM],
      //  A = Delay counter for WAIT_LOOP
      [12, 15],
      [13, e.CALL],
      //  Go to WAIT_LOOP
      [14, 34],
      [15, 16],
      [16, e.CALL],
      //  Go to LEDS_OFF
      [17, 28],
      [18, 16],
      [19, e.JMP],
      //  Go to END
      [20, 39],
      [21, 16],
      // [LEDS_ON]
      [22, e.MOV_A_IMM],
      [23, 255],
      [24, e.MOV_MEM_A],
      [25, 48],
      [26, 255],
      [27, e.RET],
      // [LEDS_OFF]
      [28, e.MOV_A_IMM],
      [29, 0],
      [30, e.MOV_MEM_A],
      [31, 48],
      [32, 255],
      [33, e.RET],
      // [WAIT_LOOP]
      [34, e.DEC_A],
      [35, e.JNZ],
      //  Go to WAIT_LOOP
      [36, 34],
      [37, 16],
      [38, e.RET],
      // [END]
      [39, e.SYSCALL],
      [40, 0]
    ])
  },
  leds_on: {
    name: "LED ON",
    description: "Allume les LEDs",
    code: /* @__PURE__ */ new Map([
      [0, e.MOV_A_IMM],
      [1, 255],
      // Loop
      [2, e.MOV_MEM_A],
      [3, i(s.LEDS_BASE)],
      // LEDS_BASE - Low byte
      [4, o(s.LEDS_BASE)],
      // LEDS_BASE - High byte (0xFF30)
      [5, e.SYSCALL],
      [6, 0]
      // ← Syscall 0 = exit
    ])
  },
  leds_off: {
    name: "LED OFF",
    description: "Eteint les LEDs",
    code: /* @__PURE__ */ new Map([
      [0, e.MOV_A_IMM],
      [1, 0],
      // Loop
      [2, e.MOV_MEM_A],
      [3, i(s.LEDS_BASE)],
      // LEDS_BASE - Low byte
      [4, o(s.LEDS_BASE)],
      // LEDS_BASE - High byte (0xFF30)
      [5, e.SYSCALL],
      [6, 0]
      // ← Syscall 0 = exit
    ])
  },
  leds_blink: {
    name: "LED Blinker",
    description: "Fait clignoter les LEDs en compteur binaire",
    code: /* @__PURE__ */ new Map([
      [0, e.MOV_A_IMM],
      [1, 0],
      // Loop
      [2, e.MOV_MEM_A],
      [3, i(s.LEDS_BASE)],
      // LEDS_BASE - Low byte
      [4, o(s.LEDS_BASE)],
      // LEDS_BASE - High byte (0xFF30)
      [5, e.INC_A],
      [6, e.JMP],
      [7, i(s.PROGRAM_START + 2)],
      // PROGRAM_START + 0x02 - Low
      [8, o(s.PROGRAM_START + 2)]
      // PROGRAM_START + 0x02 - High
    ])
  },
  seven_segments: {
    name: "7-Segment Counter",
    description: "Compte de 0 à F sur l'afficheur 7 segments",
    code: /* @__PURE__ */ new Map([
      [0, e.MOV_A_IMM],
      [1, 0],
      // Boucle principale
      [2, e.MOV_MEM_A],
      [3, i(s.SEVEN_SEG_BASE)],
      // SEVEN_SEG_BASE - low
      [4, o(s.SEVEN_SEG_BASE)],
      // SEVEN_SEG_BASE - high
      [5, e.MOV_B_IMM],
      [6, 5],
      // Délai
      [7, e.DEC_B],
      [8, e.JNZ],
      [9, i(s.PROGRAM_START + 7)],
      // PROGRAM_START + 0x07 - Low
      [10, o(s.PROGRAM_START + 7)],
      // PROGRAM_START + 0x07 - High
      [11, e.INC_A],
      [12, e.MOV_B_IMM],
      [13, 15],
      [14, e.SYSCALL],
      [15, 0]
    ])
  },
  hello_world_2: {
    name: "Hello World (liveCompiled)",
    description: "Affiche 'Hello World!' dans la console",
    code: /* @__PURE__ */ new Map(),
    filepath: "os/devices/console/console.lib.asm"
  },
  hello_world: {
    name: "Hello World",
    description: "Affiche 'Hello World!' dans la console",
    code: /* @__PURE__ */ new Map([
      // === SETUP ===
      [0, e.SET_SP],
      [1, i(s.STACK_END)],
      // STACK_END - low
      [2, o(s.STACK_END)],
      // STACK_END - high
      // === PRINT "Hello World!\n" ===
      // H
      [3, e.MOV_A_IMM],
      [4, 72],
      // 'H'
      [5, e.MOV_MEM_A],
      [6, 112],
      [7, 255],
      // e
      [8, e.MOV_A_IMM],
      [9, 101],
      // 'e'
      [10, e.MOV_MEM_A],
      [11, 112],
      [12, 255],
      // l
      [13, e.MOV_A_IMM],
      [14, 108],
      // 'l'
      [15, e.MOV_MEM_A],
      [16, 112],
      [17, 255],
      // l
      [18, e.MOV_A_IMM],
      [19, 108],
      // 'l'
      [20, e.MOV_MEM_A],
      [21, 112],
      [22, 255],
      // o
      [23, e.MOV_A_IMM],
      [24, 111],
      // 'o'
      [25, e.MOV_MEM_A],
      [26, 112],
      [27, 255],
      // (space)
      [28, e.MOV_A_IMM],
      [29, 32],
      // ' '
      [30, e.MOV_MEM_A],
      [31, 112],
      [32, 255],
      // W
      [33, e.MOV_A_IMM],
      [34, 87],
      // 'W'
      [35, e.MOV_MEM_A],
      [36, 112],
      [37, 255],
      // o
      [38, e.MOV_A_IMM],
      [39, 111],
      // 'o'
      [40, e.MOV_MEM_A],
      [41, 112],
      [42, 255],
      // r
      [43, e.MOV_A_IMM],
      [44, 114],
      // 'r'
      [45, e.MOV_MEM_A],
      [46, 112],
      [47, 255],
      // l
      [48, e.MOV_A_IMM],
      [49, 108],
      // 'l'
      [50, e.MOV_MEM_A],
      [51, 112],
      [52, 255],
      // d
      [53, e.MOV_A_IMM],
      [54, 100],
      // 'd'
      [55, e.MOV_MEM_A],
      [56, 112],
      [57, 255],
      // !
      [58, e.MOV_A_IMM],
      [59, 33],
      // '!'
      [60, e.MOV_MEM_A],
      [61, 112],
      [62, 255],
      // Newline
      [63, e.MOV_A_IMM],
      [64, 10],
      // '\n'
      [65, e.MOV_MEM_A],
      [66, 112],
      [67, 255],
      // HALT
      [68, e.SYSCALL],
      [69, 0]
    ])
  },
  console_counter: {
    name: "Counter Console",
    description: "Compte de 0 à 9 dans la console",
    code: /* @__PURE__ */ new Map([
      // === SETUP ===
      [0, e.SET_SP],
      [1, i(s.STACK_END)],
      // STACK_END - low
      [2, o(s.STACK_END)],
      // STACK_END - high
      // Initialiser compteur C = 0
      [3, e.MOV_C_IMM],
      [4, 0],
      // === LOOP START ===
      // Convertir C en ASCII
      // Copier C dans A d'abord
      [5, e.MOV_CA],
      // A = C
      [6, e.MOV_B_IMM],
      // B = '0' (0x30)
      [7, 48],
      [8, e.ADD],
      // A = A + B = C + 0x30
      // Afficher chiffre
      [9, e.MOV_MEM_A],
      [10, 112],
      [11, 255],
      // CONSOLE_CHAR
      // Afficher newline
      [12, e.PUSH_A],
      // Sauvegarder A (le chiffre)
      [13, e.MOV_A_IMM],
      [14, 10],
      // '\n'
      [15, e.MOV_MEM_A],
      [16, 112],
      [17, 255],
      // CONSOLE_CHAR
      [18, e.POP_A],
      // Restaurer A
      // Incrémenter C
      [19, e.INC_C],
      // Comparer C avec 10
      [20, e.MOV_CA],
      // A = C
      [21, e.MOV_B_IMM],
      // B = 10
      [22, 10],
      [23, e.SUB],
      // A = A - B = C - 10
      // Si C != 10, continuer (A != 0 car zero flag = false)
      [24, e.JNZ],
      [25, 5],
      [26, 2],
      // Retour à 0x0205
      // Fini
      [27, e.HALT]
    ])
  },
  lcd_hello: {
    name: "LCD Hello",
    description: "Affiche 'Hello' sur ligne 1 et 'World!' sur ligne 2",
    code: /* @__PURE__ */ new Map([
      [0, e.SET_SP],
      [1, i(s.STACK_END)],
      // STACK_END - low
      [2, o(s.STACK_END)],
      // STACK_END - high
      // Clear LCD
      [3, e.MOV_A_IMM],
      [4, 1],
      // CMD Clear
      [5, e.MOV_MEM_A],
      [6, 161],
      // LCD_COMMAND
      [7, 255],
      // LCD_COMMAND
      // "Hello" ligne 1
      [8, e.MOV_A_IMM],
      [9, 72],
      // 'H'
      [10, e.MOV_MEM_A],
      [11, 160],
      [12, 255],
      [13, e.MOV_A_IMM],
      [14, 101],
      // 'e'
      [15, e.MOV_MEM_A],
      [16, 160],
      [17, 255],
      [18, e.MOV_A_IMM],
      [19, 108],
      // 'l'
      [20, e.MOV_MEM_A],
      [21, 160],
      [22, 255],
      [23, e.MOV_A_IMM],
      [24, 108],
      // 'l'
      [25, e.MOV_MEM_A],
      [26, 160],
      [27, 255],
      [28, e.MOV_A_IMM],
      [29, 111],
      // 'o'
      [30, e.MOV_MEM_A],
      [31, 160],
      [32, 255],
      // Position curseur ligne 2 (row 1, col 0 = 16)
      [33, e.MOV_A_IMM],
      [34, 16],
      // Position 16
      [35, e.MOV_MEM_A],
      [36, 162],
      // LCD_CURSOR
      [37, 255],
      // LCD_CURSOR
      // "World!" ligne 2
      [38, e.MOV_A_IMM],
      [39, 87],
      // 'W'
      [40, e.MOV_MEM_A],
      [41, 160],
      [42, 255],
      [43, e.MOV_A_IMM],
      [44, 111],
      // 'o'
      [45, e.MOV_MEM_A],
      [46, 160],
      [47, 255],
      [48, e.MOV_A_IMM],
      [49, 114],
      // 'r'
      [50, e.MOV_MEM_A],
      [51, 160],
      [52, 255],
      [53, e.MOV_A_IMM],
      [54, 108],
      // 'l'
      [55, e.MOV_MEM_A],
      [56, 160],
      [57, 255],
      [58, e.MOV_A_IMM],
      [59, 100],
      // 'd'
      [60, e.MOV_MEM_A],
      [61, 160],
      [62, 255],
      [63, e.MOV_A_IMM],
      [64, 33],
      // '!'
      [65, e.MOV_MEM_A],
      [66, 160],
      [67, 255],
      [68, e.SYSCALL],
      [69, 0]
    ])
  },
  lcd_counter: {
    name: "LCD Counter",
    description: "Compte de 0 à 99 sur LCD avec MEMORY_MAP",
    code: /* @__PURE__ */ new Map([
      // === INITIALISATION ===
      // Initialiser SP
      [0, e.SET_SP],
      [1, i(s.STACK_END)],
      [2, o(s.STACK_END)],
      // Clear LCD (commande 0x01 = clear display)
      [3, e.MOV_A_IMM],
      [4, 1],
      // Commande clear
      [5, e.MOV_MEM_A],
      [6, i(s.LCD_COMMAND)],
      [7, o(s.LCD_COMMAND)],
      // Counter = 0 dans A
      [8, e.MOV_A_IMM],
      [9, 0],
      // === BOUCLE PRINCIPALE ===
      // LOOP: (adresse 0x0A)
      // Sauvegarder counter (A) sur la pile
      [10, e.PUSH_A],
      // Position curseur à (0,0) - commande 0x02
      [11, e.MOV_A_IMM],
      [12, 2],
      [13, e.MOV_MEM_A],
      [14, i(s.LCD_COMMAND)],
      [15, o(s.LCD_COMMAND)],
      // Restaurer counter
      [16, e.POP_A],
      // === CALCUL DIZAINES ===
      // Sauvegarder A (counter)
      [17, e.PUSH_A],
      // Mettre 10 dans B pour division
      [18, e.MOV_B_IMM],
      [19, 10],
      // Initialiser quotient (C) = 0
      [20, e.MOV_C_IMM],
      [21, 0],
      // DIV_LOOP: (adresse 0x16)
      [22, e.INC_C],
      // C++
      [23, e.SUB],
      // A = A - B
      [24, e.JC],
      // Si carry (A < B), fin division
      [25, i(s.PROGRAM_START + 30)],
      [26, o(s.PROGRAM_START + 30)],
      // Continuer division
      [27, e.JMP],
      [28, i(s.PROGRAM_START + 22)],
      [29, o(s.PROGRAM_START + 22)],
      // FIN_DIV: (adresse 0x1E)
      // Ajuster: on a soustrait une fois de trop, ajouter 10
      [30, e.ADD],
      // A = A + B (reste)
      [31, e.DEC_C],
      // C-- (quotient trop grand de 1)
      // Afficher dizaine (C contient dizaines)
      [32, e.MOV_AC],
      // C → A
      [33, e.MOV_B_IMM],
      // '0' dans B
      [34, 48],
      [35, e.ADD],
      // A = A + B
      // Écrire sur LCD (data)
      [36, e.MOV_MEM_A],
      [37, i(s.LCD_DATA)],
      [38, o(s.LCD_DATA)],
      // === CALCUL UNITÉS ===
      // Restaurer le compteur original
      [39, e.POP_A],
      // Récupère counter original
      // Sauvegarder A (pour plus tard)
      [40, e.PUSH_A],
      // Calculer unités = A % 10
      // On a déjà A original, B=10
      [41, e.MOV_B_IMM],
      [42, 10],
      // MOD_LOOP: (adresse relative: 0x2B)
      [43, e.SUB],
      // A = A - B
      [44, e.JC],
      // Si carry (A < B), fin
      [45, i(s.PROGRAM_START + 50)],
      [46, o(s.PROGRAM_START + 50)],
      // Continuer modulo
      [47, e.JMP],
      [48, i(s.PROGRAM_START + 43)],
      [49, o(s.PROGRAM_START + 43)],
      // FIN_MOD: (adresse 0x32)
      // Ajuster reste: A + B (car on a soustrait une fois de trop)
      [50, e.ADD],
      // A = reste (0-9)
      // Convertir en ASCII
      [51, e.MOV_B_IMM],
      [52, 48],
      // '0'
      [53, e.ADD],
      // A = reste + '0'
      // Écrire unité sur LCD
      [54, e.MOV_MEM_A],
      [55, i(s.LCD_DATA)],
      [56, o(s.LCD_DATA)],
      // Restaurer counter original
      [57, e.POP_A],
      // === DELAI ===
      [58, e.PUSH_A],
      [59, e.PUSH_B],
      // Double boucle de délai
      [60, e.MOV_B_IMM],
      [61, 5],
      // Boucle externe
      // DELAY_OUTER: (0x3E)
      [62, e.MOV_C_IMM],
      [63, 15],
      // Boucle interne
      // DELAY_INNER: (0x40)
      [64, e.DEC_C],
      [65, e.JNZ],
      [66, i(s.PROGRAM_START + 64)],
      [67, o(s.PROGRAM_START + 64)],
      [68, e.DEC_B],
      [69, e.JNZ],
      [70, i(s.PROGRAM_START + 62)],
      [71, o(s.PROGRAM_START + 62)],
      [72, e.POP_B],
      [73, e.POP_A],
      // === INC RÉMENTATION ET TEST ===
      [74, e.INC_A],
      // Vérifier si A < 100
      [75, e.MOV_B_IMM],
      [76, 100],
      [77, e.SUB],
      // A - 100
      [78, e.JC],
      // Si carry (A < 100), continuer
      [79, i(s.PROGRAM_START + 82)],
      [80, o(s.PROGRAM_START + 82)],
      // Sinon, terminer (A >= 100)
      [81, e.HALT],
      // Continuer boucle (restaurer A avant de boucler)
      // On a A = A - 100, besoin de A original pour boucle
      [82, e.ADD],
      // A = (A - 100) + 100 = A original
      [83, e.JMP],
      [84, i(s.PROGRAM_START + 10)],
      [85, o(s.PROGRAM_START + 10)]
    ])
  },
  pixel_line: {
    name: "Pixel Line",
    description: "Dessine une ligne diagonale",
    code: /* @__PURE__ */ new Map([
      [0, e.SET_SP],
      [1, i(s.STACK_END)],
      // STACK_END - low
      [2, o(s.STACK_END)],
      // STACK_END - high
      // Compteur 0-31
      [3, e.MOV_A_IMM],
      [4, 0],
      [5, e.MOV_B_IMM],
      [6, 32],
      // LOOP:
      // Set X = A
      [7, e.MOV_MEM_A],
      [8, 208],
      // PIXEL_X - low
      [9, 255],
      // PIXEL_X - high
      // Set Y = A
      [10, e.MOV_MEM_A],
      [11, 209],
      // PIXEL_Y - low
      [12, 255],
      // PIXEL_Y - high
      // Set COLOR = 1
      [13, e.PUSH_A],
      [14, e.MOV_A_IMM],
      [15, 1],
      [16, e.MOV_MEM_A],
      [17, 210],
      // PIXEL_COLOR - low
      [18, 255],
      // PIXEL_COLOR - high
      [19, e.POP_A],
      // A++
      [20, e.INC_A],
      // B--
      [21, e.DEC_B],
      [22, e.JNZ],
      [23, i(s.PROGRAM_START + 7)],
      // LOOP - low
      [24, o(s.PROGRAM_START + 7)],
      // LOOP - high
      [25, e.SYSCALL],
      [26, 0]
    ])
  },
  pixel_square: {
    name: "Contour Carré 10x10",
    description: "Dessine uniquement le contour d'un carré 10x10",
    code: /* @__PURE__ */ new Map([
      [0, e.PUSH_A],
      [1, e.NOP],
      [2, e.POP_A],
      //[0x00, Opcode.SET_SP],
      //[0x01, low16(MEMORY_MAP.STACK_END)],  // STACK_END - low
      //[0x02, high16(MEMORY_MAP.STACK_END)], // STACK_END - high
      // === LIGNE HAUT (Y=5, X=5 à 14) ===
      [3, e.MOV_A_IMM],
      [4, 5],
      // X = 5
      // LOOP_HAUT @ 0x05:
      [5, e.MOV_MEM_A],
      [6, 208],
      [7, 255],
      // PIXEL_X
      [8, e.MOV_B_IMM],
      [9, 5],
      // Y = 5
      [10, e.MOV_MEM_B],
      [11, 209],
      [12, 255],
      // PIXEL_Y
      [13, e.MOV_B_IMM],
      [14, 1],
      // Couleur = 1
      [15, e.MOV_MEM_B],
      [16, 210],
      [17, 255],
      // PIXEL_COLOR
      [18, e.INC_A],
      // X++
      [19, e.PUSH_A],
      // Sauver A
      [20, e.MOV_B_IMM],
      [21, 15],
      // Comparer avec 15
      [22, e.SUB],
      // A = A - 15
      [23, e.POP_A],
      // Restaurer A
      [24, e.JNZ],
      [25, i(s.PROGRAM_START + 5)],
      [26, o(s.PROGRAM_START + 5)],
      // Si A != 15, loop
      // === LIGNE BAS (Y=14, X=5 à 14) ===
      [27, e.MOV_A_IMM],
      [28, 5],
      // X = 5
      // LOOP_BAS @ 0x1D:
      [29, e.MOV_MEM_A],
      [30, 208],
      [31, 255],
      // PIXEL_X
      [32, e.MOV_B_IMM],
      [33, 14],
      // Y = 14
      [34, e.MOV_MEM_B],
      [35, 209],
      [36, 255],
      // PIXEL_Y
      [37, e.MOV_B_IMM],
      [38, 1],
      [39, e.MOV_MEM_B],
      [40, 210],
      [41, 255],
      // PIXEL_COLOR
      [42, e.INC_A],
      [43, e.PUSH_A],
      [44, e.MOV_B_IMM],
      [45, 15],
      [46, e.SUB],
      [47, e.POP_A],
      [48, e.JNZ],
      [49, i(s.PROGRAM_START + 29)],
      [50, o(s.PROGRAM_START + 29)],
      // === CÔTÉ GAUCHE (X=5, Y=6 à 13) ===
      [51, e.MOV_A_IMM],
      [52, 6],
      // Y = 6
      // LOOP_GAUCHE @ 0x35:
      [53, e.MOV_B_IMM],
      [54, 5],
      // X = 5
      [55, e.MOV_MEM_B],
      [56, 208],
      [57, 255],
      // PIXEL_X
      [58, e.MOV_MEM_A],
      [59, 209],
      [60, 255],
      // PIXEL_Y
      [61, e.MOV_B_IMM],
      [62, 1],
      [63, e.MOV_MEM_B],
      [64, 210],
      [65, 255],
      // PIXEL_COLOR
      [66, e.INC_A],
      [67, e.PUSH_A],
      [68, e.MOV_B_IMM],
      [69, 14],
      [70, e.SUB],
      [71, e.POP_A],
      [72, e.JNZ],
      [73, i(s.PROGRAM_START + 53)],
      [74, o(s.PROGRAM_START + 53)],
      // === CÔTÉ DROIT (X=14, Y=6 à 13) ===
      [75, e.MOV_A_IMM],
      [76, 6],
      // Y = 6
      // LOOP_DROIT @ 0x4D:
      [77, e.MOV_B_IMM],
      [78, 14],
      // X = 14
      [79, e.MOV_MEM_B],
      [80, 208],
      [81, 255],
      // PIXEL_X
      [82, e.MOV_MEM_A],
      [83, 209],
      [84, 255],
      // PIXEL_Y
      [85, e.MOV_B_IMM],
      [86, 1],
      [87, e.MOV_MEM_B],
      [88, 210],
      [89, 255],
      // PIXEL_COLOR
      [90, e.INC_A],
      [91, e.PUSH_A],
      [92, e.MOV_B_IMM],
      [93, 14],
      [94, e.SUB],
      [95, e.POP_A],
      [96, e.JNZ],
      [97, i(s.PROGRAM_START + 77)],
      [98, o(s.PROGRAM_START + 77)],
      [99, e.SYSCALL],
      [100, 0]
    ])
  }
}, Xe = {
  timer_01: {
    name: "Timer Interrupt",
    description: "Timer avec interruption - compte dans LEDs",
    code: /* @__PURE__ */ new Map([
      // === SETUP ===
      [0, e.SET_SP],
      [1, i(s.STACK_END)],
      [2, o(s.STACK_END)],
      // SP = 0xFEFF
      // === Configurer INTERRUPT_HANDLER @ 0x1040 ===
      // Low byte (0x40)
      [3, e.MOV_A_IMM],
      [4, 64],
      [5, e.MOV_MEM_A],
      [6, i(s.INTERRUPT_HANDLER_LOW)],
      [7, o(s.INTERRUPT_HANDLER_LOW)],
      // INTERRUPT_HANDLER_LOW (0xFF44)
      // High byte (0x10)
      [8, e.MOV_A_IMM],
      [9, 16],
      [10, e.MOV_MEM_A],
      [11, i(s.INTERRUPT_HANDLER_HIGH)],
      [12, o(s.INTERRUPT_HANDLER_HIGH)],
      // INTERRUPT_HANDLER_HIGH (0xFF45)
      // === Configurer TIMER ===
      // Period = 10 → TIMER_PRESCALER (0xFF22)
      [13, e.MOV_A_IMM],
      [14, 10],
      [15, e.MOV_MEM_A],
      [16, i(s.TIMER_PRESCALER)],
      [17, o(s.TIMER_PRESCALER)],
      // TIMER_PRESCALER (0xFF22)
      // === Activer IRQ 0 (Timer) ===
      [18, e.MOV_A_IMM],
      [19, 1],
      // IRQ 0
      [20, e.MOV_MEM_A],
      [21, i(s.INTERRUPT_ENABLE)],
      [22, o(s.INTERRUPT_ENABLE)],
      // INTERRUPT_ENABLE (0xFF40)
      // Enable timer → TIMER_CONTROL (0xFF21)
      [23, e.MOV_A_IMM],
      [24, 3],
      // Enable + reset
      [25, e.MOV_MEM_A],
      [26, i(s.TIMER_CONTROL)],
      [27, o(s.TIMER_CONTROL)],
      // TIMER_CONTROL (0xFF21)
      // === Enable Interrupts ===
      [28, e.EI],
      // === Main loop ===
      [29, e.NOP],
      [30, e.JMP],
      [31, 29],
      [32, 16],
      // Loop à 0x101D
      // === HANDLER @ offset 0x40 (adresse 0x1040) ===
      [64, e.PUSH_A],
      // Lire compteur @ 0x8000
      [65, e.MOV_A_MEM],
      [66, 0],
      [67, 128],
      // Incrémenter
      [68, e.INC_A],
      // Sauvegarder compteur
      [69, e.MOV_MEM_A],
      [70, 0],
      [71, 128],
      // Afficher dans LEDs
      [72, e.MOV_MEM_A],
      [73, i(s.LEDS_OUTPUT)],
      [74, o(s.LEDS_OUTPUT)],
      // LEDS_OUTPUT (0xFF30)
      // ACK IRQ 0
      [75, e.MOV_A_IMM],
      [76, 0],
      // IRQ 0
      [77, e.MOV_MEM_A],
      [78, i(s.INTERRUPT_ACK)],
      [79, o(s.INTERRUPT_ACK)],
      // INTERRUPT_ACK (0xFF42)
      [80, e.POP_A],
      [81, e.IRET]
    ])
  },
  timer_02: {
    name: "Interrupt Minimal",
    description: "Une seule interrupt timer, puis halt",
    code: /* @__PURE__ */ new Map([
      // === SETUP ===
      [0, e.SET_SP],
      [1, 255],
      [2, 254],
      // Handler @ 0x1050
      [3, e.MOV_A_IMM],
      [4, 80],
      [5, e.MOV_MEM_A],
      [6, i(s.INTERRUPT_HANDLER_LOW)],
      [7, o(s.INTERRUPT_HANDLER_LOW)],
      [8, e.MOV_A_IMM],
      [9, 16],
      [10, e.MOV_MEM_A],
      [11, i(s.INTERRUPT_HANDLER_HIGH)],
      [12, o(s.INTERRUPT_HANDLER_HIGH)],
      // Timer period = 10
      [13, e.MOV_A_IMM],
      [14, 10],
      [15, e.MOV_MEM_A],
      [16, i(s.TIMER_PRESCALER)],
      [17, o(s.TIMER_PRESCALER)],
      // TIMER_PRESCALER
      // Timer enable
      [18, e.MOV_A_IMM],
      [19, 1],
      [20, e.MOV_MEM_A],
      [21, i(s.TIMER_CONTROL)],
      [22, o(s.TIMER_CONTROL)],
      // TIMER_CONTROL
      // Enable IRQ 0 (Timer)
      [23, e.MOV_A_IMM],
      [24, 1],
      [25, e.MOV_MEM_A],
      [26, i(s.INTERRUPT_ENABLE)],
      [27, o(s.INTERRUPT_ENABLE)],
      // EI
      [28, e.EI],
      // === ATTENDRE L'INTERRUPT ===
      [29, e.NOP],
      [30, e.NOP],
      [31, e.NOP],
      [32, e.NOP],
      [33, e.NOP],
      [34, e.NOP],
      [35, e.NOP],
      [36, e.NOP],
      [37, e.NOP],
      [38, e.NOP],
      [39, e.NOP],
      [40, e.NOP],
      // Après IRET, on arrive ici
      [41, e.HALT],
      // ← HALT après l'interrupt !
      // === HANDLER @ 0x50 ===
      [80, e.PUSH_A],
      // Mettre 0xFF dans LEDs
      [81, e.MOV_A_IMM],
      [82, 255],
      [83, e.MOV_MEM_A],
      [84, i(s.LEDS_OUTPUT)],
      [85, o(s.LEDS_OUTPUT)],
      // LEDS_OUTPUT
      // Désactiver le timer pour éviter une 2ème interrupt
      [86, e.MOV_A_IMM],
      [87, 0],
      // Timer OFF
      [88, e.MOV_MEM_A],
      [89, i(s.TIMER_CONTROL)],
      [90, o(s.TIMER_CONTROL)],
      // TIMER_CONTROL
      // ACK IRQ 0
      [91, e.MOV_A_IMM],
      [92, 0],
      [93, e.MOV_MEM_A],
      [94, i(s.INTERRUPT_ACK)],
      [95, o(s.INTERRUPT_ACK)],
      // INTERRUPT_ACK
      // Disable IRQ 0 (Timer)
      [96, e.MOV_A_IMM],
      [97, 0],
      [98, e.MOV_MEM_A],
      [99, i(s.INTERRUPT_ENABLE)],
      [100, o(s.INTERRUPT_ENABLE)],
      [101, e.POP_A],
      [102, e.IRET]
      // Retourne à 0x0229 (le HALT)
    ])
  }
}, je = {
  name: "LCD Clock",
  description: "Affiche l'heure sur LCD 16x2",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, 255],
    [2, 254],
    // Clear LCD
    [3, e.MOV_A_IMM],
    [4, 1],
    [5, e.MOV_MEM_A],
    [6, 161],
    [7, 255],
    // LCD_COMMAND
    // LOOP:
    // Position curseur (0,0)
    [8, e.MOV_A_IMM],
    [9, 0],
    [10, e.MOV_MEM_A],
    [11, 162],
    [12, 255],
    // LCD_CURSOR
    // Afficher "Time: "
    [13, e.MOV_A_IMM],
    [14, 84],
    // 'T'
    [15, e.MOV_MEM_A],
    [16, 160],
    [17, 255],
    [18, e.MOV_A_IMM],
    [19, 105],
    // 'i'
    [20, e.MOV_MEM_A],
    [21, 160],
    [22, 255],
    [23, e.MOV_A_IMM],
    [24, 109],
    // 'm'
    [25, e.MOV_MEM_A],
    [26, 160],
    [27, 255],
    [28, e.MOV_A_IMM],
    [29, 101],
    // 'e'
    [30, e.MOV_MEM_A],
    [31, 160],
    [32, 255],
    [33, e.MOV_A_IMM],
    [34, 58],
    // ':'
    [35, e.MOV_MEM_A],
    [36, 160],
    [37, 255],
    [38, e.MOV_A_IMM],
    [39, 32],
    // ' '
    [40, e.MOV_MEM_A],
    [41, 160],
    [42, 255],
    // Lire heures
    [43, e.MOV_A_MEM],
    [44, 196],
    [45, 255],
    // RTC_HOURS
    // Convertir en ASCII (simplification: affiche hex)
    [46, e.PUSH_A],
    [47, e.MOV_B_IMM],
    [48, 48],
    // '0'
    [49, e.ADD],
    // A = heures + '0' (approximation)
    [50, e.MOV_MEM_A],
    [51, 160],
    [52, 255],
    // LCD_DATA
    [53, e.POP_A],
    // Afficher ':'
    [54, e.MOV_A_IMM],
    [55, 58],
    [56, e.MOV_MEM_A],
    [57, 160],
    [58, 255],
    // Lire minutes
    [59, e.MOV_A_MEM],
    [60, 197],
    [61, 255],
    // RTC_MINUTES
    [62, e.MOV_B_IMM],
    [63, 48],
    [64, e.ADD],
    [65, e.MOV_MEM_A],
    [66, 160],
    [67, 255],
    // Afficher ':'
    [68, e.MOV_A_IMM],
    [69, 58],
    [70, e.MOV_MEM_A],
    [71, 160],
    [72, 255],
    // Lire secondes
    [73, e.MOV_A_MEM],
    [74, 198],
    [75, 255],
    // RTC_SECONDS
    [76, e.MOV_B_IMM],
    [77, 48],
    [78, e.ADD],
    [79, e.MOV_MEM_A],
    [80, 160],
    [81, 255],
    // Délai
    [82, e.MOV_C_IMM],
    [83, 255],
    [84, e.DEC_C],
    [85, e.JNZ],
    [86, 84],
    [87, 2],
    // Loop
    [88, e.JMP],
    [89, 8],
    [90, 2]
  ])
}, qe = {
  name: "Console Date",
  description: "Affiche la date dans la console",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, 255],
    [2, 254],
    // Afficher "Date: "
    [3, e.MOV_A_IMM],
    [4, 68],
    // 'D'
    [5, e.MOV_MEM_A],
    [6, 112],
    [7, 255],
    [8, e.MOV_A_IMM],
    [9, 97],
    // 'a'
    [10, e.MOV_MEM_A],
    [11, 112],
    [12, 255],
    [13, e.MOV_A_IMM],
    [14, 116],
    // 't'
    [15, e.MOV_MEM_A],
    [16, 112],
    [17, 255],
    [18, e.MOV_A_IMM],
    [19, 101],
    // 'e'
    [20, e.MOV_MEM_A],
    [21, 112],
    [22, 255],
    [23, e.MOV_A_IMM],
    [24, 58],
    // ':'
    [25, e.MOV_MEM_A],
    [26, 112],
    [27, 255],
    [28, e.MOV_A_IMM],
    [29, 32],
    // ' '
    [30, e.MOV_MEM_A],
    [31, 112],
    [32, 255],
    // Jour
    [33, e.MOV_A_MEM],
    [34, 195],
    [35, 255],
    // RTC_DAYS
    [36, e.MOV_B_IMM],
    [37, 48],
    // '0'
    [38, e.ADD],
    [39, e.MOV_MEM_A],
    [40, 112],
    [41, 255],
    // CONSOLE_CHAR
    // '/'
    [42, e.MOV_A_IMM],
    [43, 47],
    [44, e.MOV_MEM_A],
    [45, 112],
    [46, 255],
    // Mois
    [47, e.MOV_A_MEM],
    [48, 194],
    [49, 255],
    // RTC_MONTHS
    [50, e.MOV_B_IMM],
    [51, 48],
    [52, e.ADD],
    [53, e.MOV_MEM_A],
    [54, 112],
    [55, 255],
    // '/'
    [56, e.MOV_A_IMM],
    [57, 47],
    [58, e.MOV_MEM_A],
    [59, 112],
    [60, 255],
    // Année
    [61, e.MOV_A_MEM],
    [62, 193],
    [63, 255],
    // RTC_YEARS
    [64, e.MOV_B_IMM],
    [65, 48],
    [66, e.ADD],
    [67, e.MOV_MEM_A],
    [68, 112],
    [69, 255],
    // '\n'
    [70, e.MOV_A_IMM],
    [71, 10],
    [72, e.MOV_MEM_A],
    [73, 112],
    [74, 255],
    [75, e.HALT]
  ])
}, We = {
  name: "Console DateTime",
  description: "Affiche date et heure complètes",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, 255],
    [2, 254],
    // "DD/MM/YY HH:MM:SS\n"
    // Jour
    [3, e.MOV_A_MEM],
    [4, 195],
    [5, 255],
    [6, e.MOV_B_IMM],
    [7, 48],
    [8, e.ADD],
    [9, e.MOV_MEM_A],
    [10, 112],
    [11, 255],
    [12, e.MOV_A_IMM],
    [13, 47],
    // '/'
    [14, e.MOV_MEM_A],
    [15, 112],
    [16, 255],
    // Mois
    [17, e.MOV_A_MEM],
    [18, 194],
    [19, 255],
    [20, e.MOV_B_IMM],
    [21, 48],
    [22, e.ADD],
    [23, e.MOV_MEM_A],
    [24, 112],
    [25, 255],
    [26, e.MOV_A_IMM],
    [27, 47],
    // '/'
    [28, e.MOV_MEM_A],
    [29, 112],
    [30, 255],
    // Année
    [31, e.MOV_A_MEM],
    [32, 193],
    [33, 255],
    [34, e.MOV_B_IMM],
    [35, 48],
    [36, e.ADD],
    [37, e.MOV_MEM_A],
    [38, 112],
    [39, 255],
    [40, e.MOV_A_IMM],
    [41, 32],
    // ' '
    [42, e.MOV_MEM_A],
    [43, 112],
    [44, 255],
    // Heure
    [45, e.MOV_A_MEM],
    [46, 196],
    [47, 255],
    [48, e.MOV_B_IMM],
    [49, 48],
    [50, e.ADD],
    [51, e.MOV_MEM_A],
    [52, 112],
    [53, 255],
    [54, e.MOV_A_IMM],
    [55, 58],
    // ':'
    [56, e.MOV_MEM_A],
    [57, 112],
    [58, 255],
    // Minutes
    [59, e.MOV_A_MEM],
    [60, 197],
    [61, 255],
    [62, e.MOV_B_IMM],
    [63, 48],
    [64, e.ADD],
    [65, e.MOV_MEM_A],
    [66, 112],
    [67, 255],
    [68, e.MOV_A_IMM],
    [69, 58],
    // ':'
    [70, e.MOV_MEM_A],
    [71, 112],
    [72, 255],
    // Secondes
    [73, e.MOV_A_MEM],
    [74, 198],
    [75, 255],
    [76, e.MOV_B_IMM],
    [77, 48],
    [78, e.ADD],
    [79, e.MOV_MEM_A],
    [80, 112],
    [81, 255],
    [82, e.MOV_A_IMM],
    [83, 10],
    // '\n'
    [84, e.MOV_MEM_A],
    [85, 112],
    [86, 255],
    [87, e.HALT]
  ])
}, Qe = {
  name: "LCD Live Clock",
  description: "Horloge LCD mise à jour en temps réel",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, 255],
    [2, 254],
    // Clear LCD une fois
    [3, e.MOV_A_IMM],
    [4, 1],
    [5, e.MOV_MEM_A],
    [6, 161],
    [7, 255],
    // LOOP: Retour curseur home
    [8, e.MOV_A_IMM],
    [9, 0],
    [10, e.MOV_MEM_A],
    [11, 162],
    [12, 255],
    // LCD_CURSOR = 0
    // HH:MM:SS
    [13, e.MOV_A_MEM],
    [14, 196],
    [15, 255],
    [16, e.MOV_B_IMM],
    [17, 48],
    [18, e.ADD],
    [19, e.MOV_MEM_A],
    [20, 160],
    [21, 255],
    [22, e.MOV_A_IMM],
    [23, 58],
    [24, e.MOV_MEM_A],
    [25, 160],
    [26, 255],
    [27, e.MOV_A_MEM],
    [28, 197],
    [29, 255],
    [30, e.MOV_B_IMM],
    [31, 48],
    [32, e.ADD],
    [33, e.MOV_MEM_A],
    [34, 160],
    [35, 255],
    [36, e.MOV_A_IMM],
    [37, 58],
    [38, e.MOV_MEM_A],
    [39, 160],
    [40, 255],
    [41, e.MOV_A_MEM],
    [42, 198],
    [43, 255],
    [44, e.MOV_B_IMM],
    [45, 48],
    [46, e.ADD],
    [47, e.MOV_MEM_A],
    [48, 160],
    [49, 255],
    // Délai
    [50, e.MOV_C_IMM],
    [51, 255],
    [52, e.DEC_C],
    [53, e.JNZ],
    [54, i(s.PROGRAM_START + 52)],
    // PROGRAM_START + 0x34 - Low
    [55, o(s.PROGRAM_START + 52)],
    // PROGRAM_START + 0x34 - High
    [56, e.JMP],
    [57, i(s.OS_START + 2)],
    // OS_START + 0x02 - Low
    [58, o(s.OS_START + 2)]
    // OS_START + 0x02 - High
  ])
}, et = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CONSOLE_DATE: qe,
  CONSOLE_DATETIME: We,
  LCD_CLOCK: je,
  LCD_LIVE_CLOCK: Qe
}, Symbol.toStringTag, { value: "Module" })), tt = {
  name: "RNG Test",
  description: "Génère 10 nombres aléatoires",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, 255],
    [2, 254],
    // Définir le seed (optionnel)
    [3, e.MOV_A_IMM],
    [4, 66],
    // Seed = 0x42
    [5, e.MOV_MEM_A],
    [6, 177],
    [7, 255],
    // RNG_SEED
    // Compteur dans B
    [8, e.MOV_B_IMM],
    [9, 10],
    // LOOP:
    [10, e.MOV_A_MEM],
    [11, 176],
    [12, 255],
    // RNG_OUTPUT → génère nombre aléatoire
    // Afficher dans LEDs
    [13, e.MOV_MEM_A],
    [14, 48],
    [15, 255],
    // LEDS_OUTPUT
    // Décrémenter compteur
    [16, e.DEC_B],
    [17, e.JNZ],
    [18, 10],
    [19, 2],
    // → LOOP
    [20, e.HALT]
  ])
}, st = {
  name: "Random Pixels",
  description: "Dessine 100 pixels aléatoires",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, 255],
    [2, 254],
    // Compteur
    [3, e.MOV_B_IMM],
    [4, 100],
    // LOOP:
    // X aléatoire
    [5, e.MOV_A_MEM],
    [6, i(s.RNG_OUTPUT)],
    // RNG_OUTPUT - low
    [7, o(s.RNG_OUTPUT)],
    // RNG_OUTPUT - high
    [8, e.MOV_MEM_A],
    [9, i(s.PIXEL_X)],
    // PIXEL_X - low
    [10, o(s.PIXEL_X)],
    // PIXEL_X - high
    // Y aléatoire
    [11, e.MOV_A_MEM],
    [12, i(s.RNG_OUTPUT)],
    // RNG_OUTPUT - low
    [13, o(s.RNG_OUTPUT)],
    // RNG_OUTPUT - high
    [14, e.MOV_MEM_A],
    [15, i(s.PIXEL_Y)],
    // PIXEL_Y - low
    [16, o(s.PIXEL_Y)],
    // PIXEL_Y - high
    // Couleur aléatoire (0-15)
    [17, e.MOV_A_MEM],
    [18, i(s.RNG_OUTPUT)],
    // RNG_OUTPUT - low
    [19, o(s.RNG_OUTPUT)],
    // RNG_OUTPUT - high
    [20, e.MOV_B_IMM],
    [21, 15],
    [22, e.AND],
    // A = A & 0x0F
    [23, e.MOV_MEM_A],
    [24, i(s.PIXEL_COLOR)],
    // PIXEL_COLOR - low
    [25, o(s.PIXEL_COLOR)],
    // PIXEL_COLOR - high
    // Décrémenter
    [26, e.DEC_B],
    [27, e.JNZ],
    // Go to Loop start
    [28, i(s.PROGRAM_START + 5)],
    [29, o(s.PROGRAM_START + 5)],
    [30, e.HALT]
  ])
}, rt = {
  name: "RTC Stopwatch",
  description: "Affiche les secondes qui passent",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, 255],
    [2, 254],
    // Sauver seconde précédente dans C
    [3, e.MOV_A_MEM],
    [4, 192],
    [5, 255],
    // RTC_SECONDS
    [6, e.MOV_CA],
    // LOOP:
    [7, e.MOV_A_MEM],
    [8, 192],
    [9, 255],
    // RTC_SECONDS
    // Comparer avec C
    [10, e.PUSH_A],
    [11, e.MOV_B_IMM],
    [12, 0],
    [13, e.MOV_BC],
    // B = C (ancienne seconde)
    [14, e.POP_A],
    [15, e.SUB],
    // A = A - B
    [16, e.JZ],
    // Si égal, loop
    [17, 7],
    [18, 2],
    // Nouvelle seconde ! Afficher
    [19, e.MOV_A_MEM],
    [20, 192],
    [21, 255],
    [22, e.MOV_CA],
    // Sauver nouvelle seconde
    [23, e.MOV_MEM_A],
    [24, 48],
    [25, 255],
    // LEDS_OUTPUT
    [26, e.JMP],
    [27, 7],
    [28, 2]
  ])
}, nt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  RANDOM_PIXELS: st,
  RNG_TEST: tt,
  RTC_STOPWATCH: rt
}, Symbol.toStringTag, { value: "Module" })), it = {
  name: "Simple Beep",
  description: "Bip simple à 440 Hz",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, i(s.STACK_END)],
    // STACK_END - low
    [2, o(s.STACK_END)],
    // STACK_END - high
    // Fréquence = 440 Hz → valeur ≈ (440-100)/7.45 ≈ 45
    [3, e.MOV_A_IMM],
    [4, 45],
    [5, e.MOV_MEM_A],
    [6, 128],
    [7, 255],
    // BUZZER_FREQ
    // Durée = 500ms → 500/10 = 50
    [8, e.MOV_A_IMM],
    [9, 50],
    [10, e.MOV_MEM_A],
    [11, 129],
    [12, 255],
    // BUZZER_DURATION (déclenche le son)
    [13, e.HALT]
  ])
}, ot = {
  name: "Siren",
  description: "Sirène avec deux fréquences alternées",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, 255],
    [2, 254],
    // Compteur dans B
    [3, e.MOV_B_IMM],
    [4, 10],
    // 10 alternances
    // LOOP:
    // Fréquence haute (800 Hz → ~94)
    [5, e.MOV_A_IMM],
    [6, 94],
    [7, e.MOV_MEM_A],
    [8, 128],
    [9, 255],
    // BUZZER_FREQ
    // Durée 200ms
    [10, e.MOV_A_IMM],
    [11, 20],
    [12, e.MOV_MEM_A],
    [13, 129],
    [14, 255],
    // BUZZER_DURATION
    // Attendre (boucle vide)
    [15, e.MOV_C_IMM],
    [16, 255],
    [17, e.DEC_C],
    [18, e.JNZ],
    [19, 17],
    [20, 2],
    // Fréquence basse (400 Hz → ~40)
    [21, e.MOV_A_IMM],
    [22, 40],
    [23, e.MOV_MEM_A],
    [24, 128],
    [25, 255],
    [26, e.MOV_A_IMM],
    [27, 20],
    [28, e.MOV_MEM_A],
    [29, 129],
    [30, 255],
    // Attendre
    [31, e.MOV_C_IMM],
    [32, 255],
    [33, e.DEC_C],
    [34, e.JNZ],
    [35, 33],
    [36, 2],
    // Décrémenter compteur
    [37, e.DEC_B],
    [38, e.JNZ],
    [39, 5],
    [40, 2],
    // → LOOP
    [41, e.HALT]
  ])
}, ct = {
  name: "Musical Scale",
  description: "Joue une gamme de Do à Do",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, 255],
    [2, 254],
    // Stocker les notes en RAM @ 0x8000
    // Do=262Hz→21, Ré=294→26, Mi=330→31, Fa=349→33, Sol=392→39, La=440→45, Si=494→53, Do=523→57
    [3, e.MOV_A_IMM],
    [4, 21],
    [5, e.MOV_MEM_A],
    [6, 0],
    [7, 128],
    [8, e.MOV_A_IMM],
    [9, 26],
    [10, e.MOV_MEM_A],
    [11, 1],
    [12, 128],
    [13, e.MOV_A_IMM],
    [14, 31],
    [15, e.MOV_MEM_A],
    [16, 2],
    [17, 128],
    [18, e.MOV_A_IMM],
    [19, 33],
    [20, e.MOV_MEM_A],
    [21, 3],
    [22, 128],
    [23, e.MOV_A_IMM],
    [24, 39],
    [25, e.MOV_MEM_A],
    [26, 4],
    [27, 128],
    [28, e.MOV_A_IMM],
    [29, 45],
    [30, e.MOV_MEM_A],
    [31, 5],
    [32, 128],
    [33, e.MOV_A_IMM],
    [34, 53],
    [35, e.MOV_MEM_A],
    [36, 6],
    [37, 128],
    [38, e.MOV_A_IMM],
    [39, 57],
    [40, e.MOV_MEM_A],
    [41, 7],
    [42, 128],
    // Jouer les notes
    [43, e.MOV_C_IMM],
    [44, 0],
    // Index = 0
    // LOOP:
    [45, e.MOV_A_MEM],
    // Lire note @ 0x8000 + C
    [46, 0],
    [47, 128],
    // FIXME: devrait être [0x80 + C]
    [48, e.MOV_MEM_A],
    [49, 128],
    [50, 255],
    // BUZZER_FREQ
    [51, e.MOV_A_IMM],
    [52, 30],
    // 300ms
    [53, e.MOV_MEM_A],
    [54, 129],
    [55, 255],
    // BUZZER_DURATION
    // Attendre
    [56, e.MOV_B_IMM],
    [57, 255],
    [58, e.DEC_B],
    [59, e.JNZ],
    [60, 58],
    [61, 2],
    [62, e.INC_C],
    [63, e.MOV_CA],
    [64, e.MOV_B_IMM],
    [65, 8],
    [66, e.SUB],
    [67, e.JNZ],
    [68, 45],
    [69, 2],
    // → LOOP
    [70, e.HALT]
  ])
}, at = {
  name: "RTC Alarm Beep",
  description: "Bip chaque seconde",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, 255],
    [2, 254],
    // Sauver seconde actuelle
    [3, e.MOV_A_MEM],
    [4, 198],
    [5, 255],
    // RTC_SECONDS
    [6, e.MOV_CA],
    // LOOP:
    [7, e.MOV_A_MEM],
    [8, 198],
    [9, 255],
    // RTC_SECONDS
    // Comparer avec C
    [10, e.PUSH_A],
    [11, e.MOV_BC],
    [12, e.POP_A],
    [13, e.SUB],
    [14, e.JZ],
    // Si égal, attendre
    [15, 7],
    [16, 2],
    // Nouvelle seconde ! Bip
    [17, e.MOV_A_MEM],
    [18, 198],
    [19, 255],
    [20, e.MOV_CA],
    // Sauver
    // Fréquence 1000 Hz → ~120
    [21, e.MOV_A_IMM],
    [22, 120],
    [23, e.MOV_MEM_A],
    [24, 128],
    [25, 255],
    // Durée 100ms
    [26, e.MOV_A_IMM],
    [27, 10],
    [28, e.MOV_MEM_A],
    [29, 129],
    [30, 255],
    [31, e.JMP],
    [32, 7],
    [33, 2]
  ])
}, lt = {
  name: "Random Notes",
  description: "Joue des notes aléatoires",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, 255],
    [2, 254],
    // Seed RNG avec timestamp
    [3, e.MOV_A_MEM],
    [4, 199],
    [5, 255],
    // RTC_TIMESTAMP_0
    [6, e.MOV_MEM_A],
    [7, 177],
    [8, 255],
    // RNG_SEED
    // Compteur
    [9, e.MOV_B_IMM],
    [10, 20],
    // notes count
    // LOOP:
    [11, e.MOV_A_MEM],
    [12, 176],
    [13, 255],
    // RNG_OUTPUT
    // Utiliser comme fréquence
    [14, e.MOV_MEM_A],
    [15, 128],
    [16, 255],
    // BUZZER_FREQ
    // Durée 150ms
    [17, e.MOV_A_IMM],
    [18, 15],
    [19, e.MOV_MEM_A],
    [20, 129],
    [21, 255],
    // Attendre
    [22, e.MOV_C_IMM],
    [23, 15],
    // delay between notes
    [24, e.DEC_C],
    [25, e.JNZ],
    [26, i(s.PROGRAM_START + 24)],
    // 0x18 - Low
    [27, o(s.PROGRAM_START + 24)],
    // 0x18 - High
    [28, e.DEC_B],
    [29, e.JNZ],
    [30, i(s.PROGRAM_START + 11)],
    // 0x0B - Low
    [31, o(s.PROGRAM_START + 11)],
    // 0x0B - High
    [32, e.SYSCALL],
    [33, 0]
  ])
}, dt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  MUSICAL_SCALE: ct,
  RANDOM_NOTES: lt,
  RTC_ALARM_BEEP: at,
  SIMPLE_BEEP: it,
  SIREN: ot
}, Symbol.toStringTag, { value: "Module" })), Mt = {
  name: "FS: Create File (liveCompiled ts)",
  description: "Créer fichier TEST.TXT avec contenu",
  code: /* @__PURE__ */ new Map(),
  filepath: "misc/fs/create_file_demo.asm"
  //filepath: 'misc/fs/create_file_demo.asm.ts',
}, ut = {
  name: "FS: Create File",
  description: "Créer fichier TEST.TXT avec contenu",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, i(s.STACK_END)],
    [2, o(s.STACK_END)],
    // === Écrire nom du fichier "TEST.TXT" ===
    // 'T'
    [3, e.MOV_A_IMM],
    [4, 84],
    [5, e.MOV_MEM_A],
    [6, i(s.DATA_DISK_FS_FILENAME)],
    [7, o(s.DATA_DISK_FS_FILENAME)],
    // 'E'
    [8, e.MOV_A_IMM],
    [9, 69],
    [10, e.MOV_MEM_A],
    [11, i(s.DATA_DISK_FS_FILENAME)],
    [12, o(s.DATA_DISK_FS_FILENAME)],
    // 'S'
    [13, e.MOV_A_IMM],
    [14, 83],
    [15, e.MOV_MEM_A],
    [16, i(s.DATA_DISK_FS_FILENAME)],
    [17, o(s.DATA_DISK_FS_FILENAME)],
    // 'T'
    [18, e.MOV_A_IMM],
    [19, 84],
    [20, e.MOV_MEM_A],
    [21, i(s.DATA_DISK_FS_FILENAME)],
    [22, o(s.DATA_DISK_FS_FILENAME)],
    // '.'
    [23, e.MOV_A_IMM],
    [24, 46],
    [25, e.MOV_MEM_A],
    [26, i(s.DATA_DISK_FS_FILENAME)],
    [27, o(s.DATA_DISK_FS_FILENAME)],
    // 'T'
    [28, e.MOV_A_IMM],
    [29, 84],
    [30, e.MOV_MEM_A],
    [31, i(s.DATA_DISK_FS_FILENAME)],
    [32, o(s.DATA_DISK_FS_FILENAME)],
    // 'X'
    [33, e.MOV_A_IMM],
    [34, 88],
    [35, e.MOV_MEM_A],
    [36, i(s.DATA_DISK_FS_FILENAME)],
    [37, o(s.DATA_DISK_FS_FILENAME)],
    // 'T'
    [38, e.MOV_A_IMM],
    [39, 84],
    [40, e.MOV_MEM_A],
    [41, i(s.DATA_DISK_FS_FILENAME)],
    [42, o(s.DATA_DISK_FS_FILENAME)],
    // === Commande CREATE (0x91) ===
    [43, e.MOV_A_IMM],
    [44, 145],
    [45, e.MOV_MEM_A],
    [46, i(s.DATA_DISK_FS_COMMAND)],
    [47, o(s.DATA_DISK_FS_COMMAND)],
    // Vérifier résultat
    [48, e.MOV_A_MEM],
    [49, i(s.DATA_DISK_FS_COMMAND)],
    [50, o(s.DATA_DISK_FS_COMMAND)],
    [51, e.JZ],
    // Si échec, halt
    [52, i(s.PROGRAM_START + 144)],
    [53, o(s.PROGRAM_START + 144)],
    // === Ouvrir le fichier ===
    // Réécrire le nom (car buffer effacé après CREATE)
    [54, e.MOV_A_IMM],
    [55, 84],
    // 'T'
    [56, e.MOV_MEM_A],
    [57, i(s.DATA_DISK_FS_FILENAME)],
    [58, o(s.DATA_DISK_FS_FILENAME)],
    [59, e.MOV_A_IMM],
    [60, 69],
    // 'E'
    [61, e.MOV_MEM_A],
    [62, i(s.DATA_DISK_FS_FILENAME)],
    [63, o(s.DATA_DISK_FS_FILENAME)],
    [64, e.MOV_A_IMM],
    [65, 83],
    // 'S'
    [66, e.MOV_MEM_A],
    [67, i(s.DATA_DISK_FS_FILENAME)],
    [68, o(s.DATA_DISK_FS_FILENAME)],
    [69, e.MOV_A_IMM],
    [70, 84],
    // 'T'
    [71, e.MOV_MEM_A],
    [72, i(s.DATA_DISK_FS_FILENAME)],
    [73, o(s.DATA_DISK_FS_FILENAME)],
    [74, e.MOV_A_IMM],
    [75, 46],
    // '.'
    [76, e.MOV_MEM_A],
    [77, i(s.DATA_DISK_FS_FILENAME)],
    [78, o(s.DATA_DISK_FS_FILENAME)],
    [79, e.MOV_A_IMM],
    [80, 84],
    // 'T'
    [81, e.MOV_MEM_A],
    [82, i(s.DATA_DISK_FS_FILENAME)],
    [83, o(s.DATA_DISK_FS_FILENAME)],
    [84, e.MOV_A_IMM],
    [85, 88],
    // 'X'
    [86, e.MOV_MEM_A],
    [87, i(s.DATA_DISK_FS_FILENAME)],
    [88, o(s.DATA_DISK_FS_FILENAME)],
    [89, e.MOV_A_IMM],
    [90, 84],
    // 'T'
    [91, e.MOV_MEM_A],
    [92, i(s.DATA_DISK_FS_FILENAME)],
    [93, o(s.DATA_DISK_FS_FILENAME)],
    // Commande OPEN (0x92)
    [94, e.MOV_A_IMM],
    [95, 146],
    [96, e.MOV_MEM_A],
    [97, i(s.DATA_DISK_FS_COMMAND)],
    [98, o(s.DATA_DISK_FS_COMMAND)],
    // === Écrire "Hello\n" dans le fichier ===
    // 'H'
    [99, e.MOV_A_IMM],
    [100, 72],
    [101, e.MOV_MEM_A],
    [102, i(s.DATA_DISK_FS_DATA)],
    [103, o(s.DATA_DISK_FS_DATA)],
    // 'e'
    [104, e.MOV_A_IMM],
    [105, 101],
    [106, e.MOV_MEM_A],
    [107, i(s.DATA_DISK_FS_DATA)],
    [108, o(s.DATA_DISK_FS_DATA)],
    // 'l'
    [109, e.MOV_A_IMM],
    [110, 108],
    [111, e.MOV_MEM_A],
    [112, i(s.DATA_DISK_FS_DATA)],
    [113, o(s.DATA_DISK_FS_DATA)],
    // 'l'
    [114, e.MOV_A_IMM],
    [115, 108],
    [116, e.MOV_MEM_A],
    [117, i(s.DATA_DISK_FS_DATA)],
    [118, o(s.DATA_DISK_FS_DATA)],
    // 'o'
    [119, e.MOV_A_IMM],
    [120, 111],
    [121, e.MOV_MEM_A],
    [122, i(s.DATA_DISK_FS_DATA)],
    [123, o(s.DATA_DISK_FS_DATA)],
    // '\n'
    [124, e.MOV_A_IMM],
    [125, 10],
    [126, e.MOV_MEM_A],
    [127, i(s.DATA_DISK_FS_DATA)],
    [128, o(s.DATA_DISK_FS_DATA)],
    // === Fermer le fichier ===
    [129, e.MOV_A_IMM],
    [130, 147],
    // CLOSE
    [131, e.MOV_MEM_A],
    [132, i(s.DATA_DISK_FS_COMMAND)],
    [133, o(s.DATA_DISK_FS_COMMAND)],
    // Fréquence = 440 Hz → valeur ≈ (440-100)/7.45 ≈ 45
    [134, e.MOV_A_IMM],
    [135, 45],
    [136, e.MOV_MEM_A],
    [137, i(s.BUZZER_FREQ)],
    // BUZZER_FREQ - low
    [138, o(s.BUZZER_FREQ)],
    // BUZZER_FREQ - high
    // Durée = 500ms → 500/10 = 50
    [139, e.MOV_A_IMM],
    [140, 50],
    [141, e.MOV_MEM_A],
    [142, i(s.BUZZER_DURATION)],
    // BUZZER_DURATION (déclenche le son) - low
    [143, o(s.BUZZER_DURATION)],
    // BUZZER_DURATION (déclenche le son) - high
    [144, e.SYSCALL],
    [145, 0]
    // ← Syscall 0 = exit
  ])
}, _t = {
  name: "FS: Create File (bis)",
  description: "Créer fichier TESS.TXT avec contenu",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, i(s.STACK_END)],
    [2, o(s.STACK_END)],
    // === Écrire nom du fichier "TEST.TXT" ===
    // 'T'
    [3, e.MOV_A_IMM],
    [4, 84],
    [5, e.MOV_MEM_A],
    [6, i(s.DATA_DISK_FS_FILENAME)],
    [7, o(s.DATA_DISK_FS_FILENAME)],
    // 'E'
    [8, e.MOV_A_IMM],
    [9, 69],
    [10, e.MOV_MEM_A],
    [11, i(s.DATA_DISK_FS_FILENAME)],
    [12, o(s.DATA_DISK_FS_FILENAME)],
    // 'S'
    [13, e.MOV_A_IMM],
    [14, 83],
    [15, e.MOV_MEM_A],
    [16, i(s.DATA_DISK_FS_FILENAME)],
    [17, o(s.DATA_DISK_FS_FILENAME)],
    // 'S'
    [18, e.MOV_A_IMM],
    [19, 83],
    [20, e.MOV_MEM_A],
    [21, i(s.DATA_DISK_FS_FILENAME)],
    [22, o(s.DATA_DISK_FS_FILENAME)],
    // '.'
    [23, e.MOV_A_IMM],
    [24, 46],
    [25, e.MOV_MEM_A],
    [26, i(s.DATA_DISK_FS_FILENAME)],
    [27, o(s.DATA_DISK_FS_FILENAME)],
    // 'T'
    [28, e.MOV_A_IMM],
    [29, 84],
    [30, e.MOV_MEM_A],
    [31, i(s.DATA_DISK_FS_FILENAME)],
    [32, o(s.DATA_DISK_FS_FILENAME)],
    // 'X'
    [33, e.MOV_A_IMM],
    [34, 88],
    [35, e.MOV_MEM_A],
    [36, i(s.DATA_DISK_FS_FILENAME)],
    [37, o(s.DATA_DISK_FS_FILENAME)],
    // 'T'
    [38, e.MOV_A_IMM],
    [39, 84],
    [40, e.MOV_MEM_A],
    [41, i(s.DATA_DISK_FS_FILENAME)],
    [42, o(s.DATA_DISK_FS_FILENAME)],
    // === Commande CREATE (0x91) ===
    [43, e.MOV_A_IMM],
    [44, 145],
    [45, e.MOV_MEM_A],
    [46, i(s.DATA_DISK_FS_COMMAND)],
    [47, o(s.DATA_DISK_FS_COMMAND)],
    // Vérifier résultat
    [48, e.MOV_A_MEM],
    [49, i(s.DATA_DISK_FS_COMMAND)],
    [50, o(s.DATA_DISK_FS_COMMAND)],
    [51, e.JZ],
    // Si échec, halt
    [52, i(s.PROGRAM_START + 144)],
    [53, o(s.PROGRAM_START + 144)],
    // === Ouvrir le fichier ===
    // Réécrire le nom (car buffer effacé après CREATE)
    [54, e.MOV_A_IMM],
    [55, 84],
    // 'T'
    [56, e.MOV_MEM_A],
    [57, i(s.DATA_DISK_FS_FILENAME)],
    [58, o(s.DATA_DISK_FS_FILENAME)],
    [59, e.MOV_A_IMM],
    [60, 69],
    // 'E'
    [61, e.MOV_MEM_A],
    [62, i(s.DATA_DISK_FS_FILENAME)],
    [63, o(s.DATA_DISK_FS_FILENAME)],
    [64, e.MOV_A_IMM],
    [65, 83],
    // 'S'
    [66, e.MOV_MEM_A],
    [67, i(s.DATA_DISK_FS_FILENAME)],
    [68, o(s.DATA_DISK_FS_FILENAME)],
    [69, e.MOV_A_IMM],
    [70, 83],
    // 'S'
    [71, e.MOV_MEM_A],
    [72, i(s.DATA_DISK_FS_FILENAME)],
    [73, o(s.DATA_DISK_FS_FILENAME)],
    [74, e.MOV_A_IMM],
    [75, 46],
    // '.'
    [76, e.MOV_MEM_A],
    [77, i(s.DATA_DISK_FS_FILENAME)],
    [78, o(s.DATA_DISK_FS_FILENAME)],
    [79, e.MOV_A_IMM],
    [80, 84],
    // 'T'
    [81, e.MOV_MEM_A],
    [82, i(s.DATA_DISK_FS_FILENAME)],
    [83, o(s.DATA_DISK_FS_FILENAME)],
    [84, e.MOV_A_IMM],
    [85, 88],
    // 'X'
    [86, e.MOV_MEM_A],
    [87, i(s.DATA_DISK_FS_FILENAME)],
    [88, o(s.DATA_DISK_FS_FILENAME)],
    [89, e.MOV_A_IMM],
    [90, 84],
    // 'T'
    [91, e.MOV_MEM_A],
    [92, i(s.DATA_DISK_FS_FILENAME)],
    [93, o(s.DATA_DISK_FS_FILENAME)],
    // Commande OPEN (0x92)
    [94, e.MOV_A_IMM],
    [95, 146],
    [96, e.MOV_MEM_A],
    [97, i(s.DATA_DISK_FS_COMMAND)],
    [98, o(s.DATA_DISK_FS_COMMAND)],
    // === Écrire "Hella\n" dans le fichier ===
    // 'H'
    [99, e.MOV_A_IMM],
    [100, 72],
    [101, e.MOV_MEM_A],
    [102, i(s.DATA_DISK_FS_DATA)],
    [103, o(s.DATA_DISK_FS_DATA)],
    // 'e'
    [104, e.MOV_A_IMM],
    [105, 101],
    [106, e.MOV_MEM_A],
    [107, i(s.DATA_DISK_FS_DATA)],
    [108, o(s.DATA_DISK_FS_DATA)],
    // 'l'
    [109, e.MOV_A_IMM],
    [110, 108],
    [111, e.MOV_MEM_A],
    [112, i(s.DATA_DISK_FS_DATA)],
    [113, o(s.DATA_DISK_FS_DATA)],
    // 'l'
    [114, e.MOV_A_IMM],
    [115, 108],
    [116, e.MOV_MEM_A],
    [117, i(s.DATA_DISK_FS_DATA)],
    [118, o(s.DATA_DISK_FS_DATA)],
    // 'a'
    [119, e.MOV_A_IMM],
    [120, 97],
    [121, e.MOV_MEM_A],
    [122, i(s.DATA_DISK_FS_DATA)],
    [123, o(s.DATA_DISK_FS_DATA)],
    // '\n'
    [124, e.MOV_A_IMM],
    [125, 10],
    [126, e.MOV_MEM_A],
    [127, i(s.DATA_DISK_FS_DATA)],
    [128, o(s.DATA_DISK_FS_DATA)],
    // === Fermer le fichier ===
    [129, e.MOV_A_IMM],
    [130, 147],
    // CLOSE
    [131, e.MOV_MEM_A],
    [132, i(s.DATA_DISK_FS_COMMAND)],
    [133, o(s.DATA_DISK_FS_COMMAND)],
    // Fréquence = 440 Hz → valeur ≈ (440-100)/7.45 ≈ 45
    [134, e.MOV_A_IMM],
    [135, 45],
    [136, e.MOV_MEM_A],
    [137, i(s.BUZZER_FREQ)],
    // BUZZER_FREQ - low
    [138, o(s.BUZZER_FREQ)],
    // BUZZER_FREQ - high
    // Durée = 500ms → 500/10 = 50
    [139, e.MOV_A_IMM],
    [140, 50],
    [141, e.MOV_MEM_A],
    [142, i(s.BUZZER_DURATION)],
    // BUZZER_DURATION (déclenche le son) - low
    [143, o(s.BUZZER_DURATION)],
    // BUZZER_DURATION (déclenche le son) - high
    [144, e.SYSCALL],
    [145, 0]
    // ← Syscall 0 = exit
  ])
}, ht = {
  name: "FS: Read File",
  description: "Lit TEST.TXT et affiche dans console",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, i(s.STACK_END)],
    [2, o(s.STACK_END)],
    // Écrire nom "TEST.TXT"
    [3, e.MOV_A_IMM],
    [4, 84],
    // 'T'
    [5, e.MOV_MEM_A],
    [6, i(s.DATA_DISK_FS_FILENAME)],
    [7, o(s.DATA_DISK_FS_FILENAME)],
    [8, e.MOV_A_IMM],
    [9, 69],
    // 'E'
    [10, e.MOV_MEM_A],
    [11, i(s.DATA_DISK_FS_FILENAME)],
    [12, o(s.DATA_DISK_FS_FILENAME)],
    [13, e.MOV_A_IMM],
    [14, 83],
    // 'S'
    [15, e.MOV_MEM_A],
    [16, i(s.DATA_DISK_FS_FILENAME)],
    [17, o(s.DATA_DISK_FS_FILENAME)],
    [18, e.MOV_A_IMM],
    [19, 84],
    // 'T'
    [20, e.MOV_MEM_A],
    [21, i(s.DATA_DISK_FS_FILENAME)],
    [22, o(s.DATA_DISK_FS_FILENAME)],
    [23, e.MOV_A_IMM],
    [24, 46],
    // '.'
    [25, e.MOV_MEM_A],
    [26, i(s.DATA_DISK_FS_FILENAME)],
    [27, o(s.DATA_DISK_FS_FILENAME)],
    [28, e.MOV_A_IMM],
    [29, 84],
    // 'T'
    [30, e.MOV_MEM_A],
    [31, i(s.DATA_DISK_FS_FILENAME)],
    [32, o(s.DATA_DISK_FS_FILENAME)],
    [33, e.MOV_A_IMM],
    [34, 88],
    // 'X'
    [35, e.MOV_MEM_A],
    [36, i(s.DATA_DISK_FS_FILENAME)],
    [37, o(s.DATA_DISK_FS_FILENAME)],
    [38, e.MOV_A_IMM],
    [39, 84],
    // 'T'
    [40, e.MOV_MEM_A],
    [41, i(s.DATA_DISK_FS_FILENAME)],
    [42, o(s.DATA_DISK_FS_FILENAME)],
    // OPEN (0x92)
    [43, e.MOV_A_IMM],
    [44, 146],
    [45, e.MOV_MEM_A],
    [46, i(s.DATA_DISK_FS_COMMAND)],
    [47, o(s.DATA_DISK_FS_COMMAND)],
    // LOOP: Lire et afficher
    // Lire byte
    [48, e.MOV_A_MEM],
    [49, i(s.DATA_DISK_FS_DATA)],
    [50, o(s.DATA_DISK_FS_DATA)],
    // Si 0, fin de fichier
    [51, e.JZ],
    [52, i(s.PROGRAM_START + 60)],
    [53, o(s.PROGRAM_START + 60)],
    // Afficher dans console
    [54, e.MOV_MEM_A],
    [55, i(s.CONSOLE_CHAR)],
    [56, o(s.CONSOLE_CHAR)],
    // Loop
    [57, e.JMP],
    [58, i(s.PROGRAM_START + 48)],
    [59, o(s.PROGRAM_START + 48)],
    // END: Fermer
    [60, e.MOV_A_IMM],
    [61, 147],
    // CLOSE
    [62, e.MOV_MEM_A],
    [63, i(s.DATA_DISK_FS_COMMAND)],
    [64, o(s.DATA_DISK_FS_COMMAND)],
    [65, e.SYSCALL],
    [66, 0]
    // ← Syscall 0 = exit
  ])
}, At = {
  name: "FS: Read File",
  description: "Lit TESS.TXT et affiche dans console",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, i(s.STACK_END)],
    [2, o(s.STACK_END)],
    // Écrire nom "TEST.TXT"
    [3, e.MOV_A_IMM],
    [4, 84],
    // 'T'
    [5, e.MOV_MEM_A],
    [6, i(s.DATA_DISK_FS_FILENAME)],
    [7, o(s.DATA_DISK_FS_FILENAME)],
    [8, e.MOV_A_IMM],
    [9, 69],
    // 'E'
    [10, e.MOV_MEM_A],
    [11, i(s.DATA_DISK_FS_FILENAME)],
    [12, o(s.DATA_DISK_FS_FILENAME)],
    [13, e.MOV_A_IMM],
    [14, 83],
    // 'S'
    [15, e.MOV_MEM_A],
    [16, i(s.DATA_DISK_FS_FILENAME)],
    [17, o(s.DATA_DISK_FS_FILENAME)],
    [18, e.MOV_A_IMM],
    [19, 83],
    // 'S'
    [20, e.MOV_MEM_A],
    [21, i(s.DATA_DISK_FS_FILENAME)],
    [22, o(s.DATA_DISK_FS_FILENAME)],
    [23, e.MOV_A_IMM],
    [24, 46],
    // '.'
    [25, e.MOV_MEM_A],
    [26, i(s.DATA_DISK_FS_FILENAME)],
    [27, o(s.DATA_DISK_FS_FILENAME)],
    [28, e.MOV_A_IMM],
    [29, 84],
    // 'T'
    [30, e.MOV_MEM_A],
    [31, i(s.DATA_DISK_FS_FILENAME)],
    [32, o(s.DATA_DISK_FS_FILENAME)],
    [33, e.MOV_A_IMM],
    [34, 88],
    // 'X'
    [35, e.MOV_MEM_A],
    [36, i(s.DATA_DISK_FS_FILENAME)],
    [37, o(s.DATA_DISK_FS_FILENAME)],
    [38, e.MOV_A_IMM],
    [39, 84],
    // 'T'
    [40, e.MOV_MEM_A],
    [41, i(s.DATA_DISK_FS_FILENAME)],
    [42, o(s.DATA_DISK_FS_FILENAME)],
    // OPEN (0x92)
    [43, e.MOV_A_IMM],
    [44, 146],
    [45, e.MOV_MEM_A],
    [46, i(s.DATA_DISK_FS_COMMAND)],
    [47, o(s.DATA_DISK_FS_COMMAND)],
    // LOOP: Lire et afficher
    // Lire byte
    [48, e.MOV_A_MEM],
    [49, i(s.DATA_DISK_FS_DATA)],
    [50, o(s.DATA_DISK_FS_DATA)],
    // Si 0, fin de fichier
    [51, e.JZ],
    [52, i(s.PROGRAM_START + 60)],
    [53, o(s.PROGRAM_START + 60)],
    // Afficher dans console
    [54, e.MOV_MEM_A],
    [55, i(s.CONSOLE_CHAR)],
    [56, o(s.CONSOLE_CHAR)],
    // Loop
    [57, e.JMP],
    [58, i(s.PROGRAM_START + 48)],
    [59, o(s.PROGRAM_START + 48)],
    // END: Fermer
    [60, e.MOV_A_IMM],
    [61, 147],
    // CLOSE
    [62, e.MOV_MEM_A],
    [63, i(s.DATA_DISK_FS_COMMAND)],
    [64, o(s.DATA_DISK_FS_COMMAND)],
    [65, e.SYSCALL],
    [66, 0]
    // ← Syscall 0 = exit
  ])
}, mt = {
  name: "FS: List Files",
  description: "Affiche nombre de fichiers",
  code: /* @__PURE__ */ new Map([
    [0, e.SET_SP],
    [1, i(s.STACK_END)],
    [2, o(s.STACK_END)],
    // Lire FS_STATUS (nombre de fichiers)
    [3, e.MOV_A_MEM],
    [4, i(s.DATA_DISK_FS_STATUS)],
    [5, o(s.DATA_DISK_FS_STATUS)],
    // Afficher dans LEDs
    [6, e.MOV_MEM_A],
    [7, i(s.LEDS_OUTPUT)],
    [8, o(s.LEDS_OUTPUT)],
    [9, e.SYSCALL],
    [10, 0]
    // ← Syscall 0 = exit
  ])
}, pt = {
  name: "Disk size",
  description: "Affiche la taille d'un disque",
  code: /* @__PURE__ */ new Map(),
  filepath: "misc/fs/disk_size.asm"
}, gt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DISK_SIZE: pt,
  FS_CREATE_FILE: ut,
  FS_CREATE_FILE_BIS: _t,
  FS_CREATE_FILE_COMPILED: Mt,
  FS_LIST_FILES: mt,
  FS_READ_FILE: ht,
  FS_READ_FILE_BIS: At
}, Symbol.toStringTag, { value: "Module" })), Ce = {
  //...logicalPrograms,
  //...memoryPrograms,
  //...jumpPrograms,
  //...registersPrograms,
  //...stackPrograms,
  // IO
  ...Xe,
  ...Je,
  ...Ye,
  ...et,
  ...nt,
  ...dt,
  ...gt
};
let ft = class extends te {
  constructor() {
    super(), this.motherboard = null, this.devicesManager = null, this.breakpoints = /* @__PURE__ */ new Set(), this.loadedOs = null, this.loadedProgram = null, this.id = Math.round(Math.random() * 999999999);
  }
  addMotherboard() {
    const t = new Tt(this);
    return this.motherboard || (this.motherboard = t), t;
  }
  addDevicesManager() {
    var n;
    const t = new xt();
    if (this.devicesManager = t, this.devicesManager || this.attachDevicesManager(t), (n = this.motherboard) != null && n.memoryBus && this.motherboard.memoryBus.connectDevicesManager(t), this.motherboard)
      for (const c of this.motherboard.getCpus())
        c != null && c.interrupt && t.devices.set(c.interrupt.ioPort, c.interrupt);
    return t;
  }
  attachDevicesManager(t) {
    this.devicesManager = t;
  }
  async loadCodeOnDisk(t, n) {
    if (!this.devicesManager) return;
    const c = this.devicesManager.getDeviceByName(t);
    c && c.type === "DiskStorage" && await c.loadRawData(n);
  }
  async loadOsCode(t) {
    const n = t ? De[t] : null;
    if (!(n != null && n.filepath)) return null;
    const c = s.OS_START, { code: a } = await Oe(n.filepath, c);
    return a;
  }
  async loadOs(t) {
    var u, _;
    const n = (_ = (u = this == null ? void 0 : this.motherboard) == null ? void 0 : u.memoryBus) == null ? void 0 : _.dma;
    if (!n) return;
    const c = await this.loadOsCode(t);
    await this.loadCodeOnDisk("os_disk", c ?? /* @__PURE__ */ new Map());
    const a = s.OS_START;
    if (await n.loadCodeInRam(c, a), this.motherboard) {
      for (const d of this.motherboard.getCpus())
        if (d) {
          for (const m of d.cores) {
            const b = m.getRegister("PC");
            b >= s.OS_START && b <= s.PROGRAM_END && m.setRegister("PC", s.ROM_START);
            break;
          }
          break;
        }
    }
    this.loadedOs = t, this.emit("state", { loadedOs: this.loadedOs });
  }
  unloadOs() {
    var n, c;
    const t = (c = (n = this == null ? void 0 : this.motherboard) == null ? void 0 : n.memoryBus) == null ? void 0 : c.ram;
    if (t) {
      if (this.devicesManager) {
        const u = this.devicesManager.getDeviceByName("os_disk");
        u && u.type === "DiskStorage" && u.eraseDisk();
      }
      if (t) {
        for (let a = s.OS_START; a <= s.OS_END; a++)
          t.storage.delete(ce(a));
        this.motherboard && this.motherboard.clearCpuCaches(), t.emit("state", { storage: new Map(t.storage) });
      }
      if (this.motherboard) {
        for (const a of this.motherboard.getCpus())
          if (a) {
            for (const u of a.cores) {
              const _ = u.getRegister("PC");
              _ >= s.OS_START && _ <= s.OS_END && u.setRegister("PC", s.ROM_START), u.idx > 0 && u.stop();
            }
            a.idx > 0 && a.stop();
          }
      }
      this.loadedOs = null, this.emit("state", { loadedOs: this.loadedOs });
    }
  }
  async loadProgram(t) {
    var u, _;
    const n = (_ = (u = this == null ? void 0 : this.motherboard) == null ? void 0 : u.memoryBus) == null ? void 0 : _.dma;
    if (!n) return;
    const c = await this.loadProgramCode(t);
    await this.loadCodeOnDisk("program_disk", c ?? /* @__PURE__ */ new Map());
    const a = s.PROGRAM_START;
    if (await n.loadCodeInRam(c, a), this.motherboard) {
      for (const d of this.motherboard.getCpus())
        if (d) {
          for (const m of d.cores) {
            const b = m.getRegister("PC");
            b >= s.PROGRAM_START && b <= s.PROGRAM_END && m.setRegister("PC", s.OS_START);
            break;
          }
          break;
        }
    }
    this.loadedProgram = t, this.emit("state", { loadedProgram: this.loadedProgram });
  }
  async loadProgramCode(t) {
    const n = t ? Ce[t] : null;
    if (!n) return null;
    const c = s.PROGRAM_START, { code: a } = n.filepath ? await Oe(n.filepath, c) : { code: n.code };
    return a;
  }
  unloadProgram() {
    var n, c;
    const t = (c = (n = this == null ? void 0 : this.motherboard) == null ? void 0 : n.memoryBus) == null ? void 0 : c.ram;
    if (t) {
      if (this.devicesManager) {
        const u = this.devicesManager.getDeviceByName("program_disk");
        u && u.type === "DiskStorage" && u.eraseDisk();
      }
      if (t) {
        for (let a = s.PROGRAM_START; a <= s.PROGRAM_END; a++)
          t.storage.delete(ce(a));
        this.motherboard && this.motherboard.clearCpuCaches(), t.emit("state", { storage: new Map(t.storage) });
      }
      if (this.motherboard) {
        for (const a of this.motherboard.getCpus())
          if (a) {
            for (const u of a.cores) {
              const _ = u.getRegister("PC");
              _ >= s.PROGRAM_START && _ <= s.PROGRAM_END && u.setRegister("PC", s.OS_START), u.idx > 0 && u.stop();
            }
            a.idx > 0 && a.stop();
          }
      }
      this.loadedProgram = null, this.emit("state", { loadedProgram: this.loadedProgram });
    }
  }
  reset() {
    var t;
    if (this.motherboard) {
      for (const n of this.motherboard.getCpus())
        n && n.reset();
      this.devicesManager && this.devicesManager.reset(), (t = this.motherboard.memoryBus) != null && t.ram && this.motherboard.memoryBus.ram.eraseRam();
    }
  }
};
class Ot extends te {
  constructor(t) {
    super(), this.cpuPaused = !0, this.cpuCycle = 0, this.status = "ready", this.memoryBus = null, this.interrupt = null, this.id = Math.round(Math.random() * 999999999), this.motherboard = t;
  }
  //abstract getRegister(name: string): u8 | u16 | null;
  //abstract setRegister(name: string, value: u8 | u16): void;
  //abstract getAllRegisters(): Map<string, u8 | u16 | u32 | u64>;
  // Méthodes communes
  setPaused(t) {
    this.cpuPaused = t, this.emit("state", {
      cpuPaused: this.cpuPaused
    });
  }
  togglePaused() {
    this.setPaused(!this.cpuPaused);
  }
  // Helpers mémoire
  readMemory(t) {
    return this.memoryBus ? this.memoryBus.readMemory(t) : (console.warn("No memory bus attached"), 0);
  }
  writeMemory(t, n) {
    if (!this.memoryBus) {
      console.warn("No memory bus attached");
      return;
    }
    this.memoryBus.writeMemory(t, n);
  }
  // Stack helpers
  pushValue(t) {
    throw new Error("push() must be implemented");
  }
  popValue() {
    throw new Error("pop() must be implemented");
  }
}
const Et = [
  ["A", 0],
  // Register A
  ["B", 0],
  // Register B
  ["C", 0],
  // Register C
  ["D", 0],
  // Register D
  ["PC", 0],
  // Program Counter
  ["IR", 0],
  // Instruction Register
  ["SP", 0],
  // Stack Pointer
  ["FLAGS", 0]
  // Bit 0: Carry, Bit 1: Zero
];
class bt extends te {
  constructor(t, n) {
    super(), this.coreHalted = !0, this.coreCycle = 0, this.registers = /* @__PURE__ */ new Map(), this.cpu = t, this.idx = n;
  }
  getRegister(t) {
    const n = this.registers.get(t) ?? 0;
    return n;
  }
  setRegister(t, n) {
    t === "PC" || t === "SP" ? this.registers.set(t, n & 65535) : this.registers.set(t, n & 255), this.emit("state", {
      idx: this.idx,
      registers: this.registers
    });
  }
  getAllRegisters() {
    return new Map(this.registers);
  }
  getFlag(t) {
    const n = this.getRegister("FLAGS");
    return t === "zero" ? !!(n & 2) : !!(n & 1);
  }
  setFlags(t, n) {
    this.setRegister("FLAGS", (t ? 2 : 0) | (n ? 1 : 0));
  }
  executeCoreCycle() {
    if (this.coreHalted || !this.cpu.memoryBus) return;
    const t = this.getRegister("PC");
    if (this.cpu.currentBreakpoint, this.cpu.currentBreakpoint === null && this.cpu.motherboard.computer.breakpoints.has(t) && !this.cpu.cpuPaused) {
      this.cpu.currentBreakpoint = t, this.cpu.motherboard.clock && this.cpu.motherboard.clock.stop();
      return;
    }
    if (this.cpu.currentBreakpoint === t && (this.cpu.currentBreakpoint = null), this.cpu.interrupt && this.cpu.interruptsEnabled && !this.cpu.inInterruptHandler && this.cpu.interrupt.hasPendingInterrupt()) {
      this.handleInterrupt();
      return;
    }
    if (this.coreHalted)
      return;
    this.coreCycle++;
    const n = this.cpu.readMemory(t);
    this.setRegister("IR", n);
    const c = this.getRegister("IR");
    this.executeOpcode(t, c), this.emit("state", {
      idx: this.idx,
      coreCycle: this.coreCycle
      //registers: this.registers,
    });
  }
  handleInterrupt() {
    if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus");
    if (!this.cpu.interrupt) throw new Error("Missing Interrupt");
    const t = this.cpu.interrupt.getPendingIRQ(this.cpu.idx, this.idx);
    if (t === null) return;
    this.cpu.interruptsEnabled = !1, this.cpu.inInterruptHandler = !0;
    const n = this.getRegister("SP"), c = this.getRegister("PC"), a = this.getRegister("FLAGS");
    this.cpu.writeMemory(n, a), this.setRegister("SP", n - 1), this.cpu.writeMemory(n - 1, c >> 8 & 255), this.cpu.writeMemory(n - 2, c & 255), this.setRegister("SP", n - 3), this.cpu.interrupt.acknowledgeInterrupt(t);
    let u = this.cpu.interrupt.handlerAddr;
    if (u === 0)
      throw new Error("missing handlerAddress");
    this.setRegister("PC", u);
  }
  executeOpcode(t, n) {
    var c;
    if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus");
    switch (n) {
      case e.NOP:
        this.setRegister("PC", t + 1);
        break;
      case e.CORES_COUNT: {
        this.setRegister("A", Z(this.cpu.cores.length)), this.setRegister("PC", t + 1);
        break;
      }
      case e.CORE_STATUS: {
        const A = this.getRegister("A");
        this.cpu.cores[A] ? (this.setRegister("A", Z(this.cpu.cores[A].coreHalted ? 0 : 1)), this.setFlags(this.cpu.cores[A].coreHalted, !1)) : (this.setRegister("A", Z(0)), this.setFlags(!0, !1)), this.setRegister("PC", t + 1);
        break;
      }
      case e.CORE_INIT: {
        const A = this.getRegister("A");
        if (this.cpu.cores[A] && this.cpu.cores[A].coreHalted) {
          const h = this.getRegister("C"), F = this.getRegister("D"), N = ce(F << 8 | h);
          this.cpu.cores[A].setRegister("PC", N);
        }
        this.setRegister("PC", t + 1);
        break;
      }
      case e.CORE_START: {
        const A = this.getRegister("A");
        this.cpu.cores[A] && this.cpu.cores[A].start(), A !== this.idx && this.setRegister("PC", t + 1);
        break;
      }
      case e.CORE_HALT: {
        const A = this.getRegister("A");
        this.cpu.cores[A] && this.cpu.cores[A].stop(), A !== this.idx && this.setRegister("PC", t + 1);
        break;
      }
      case e.CPUS_COUNT: {
        this.setRegister("A", Z(this.cpu.motherboard.cpus.size)), this.setRegister("PC", t + 1);
        break;
      }
      case e.CPU_STATUS: {
        const A = this.getRegister("A"), h = this.cpu.motherboard.cpus.get(A);
        h ? (this.setRegister("A", Z(h.cpuHalted ? 0 : 1)), this.setFlags(h.cpuHalted, !1)) : (this.setRegister("A", Z(0)), this.setFlags(!0, !1)), this.setRegister("PC", t + 1);
        break;
      }
      case e.CPU_INIT: {
        const A = this.getRegister("A"), h = this.cpu.motherboard.cpus.get(A);
        if (h && h.cpuHalted) {
          const F = this.getRegister("C"), N = this.getRegister("D"), v = ce(N << 8 | F);
          h.cores[0].setRegister("PC", v);
        }
        this.setRegister("PC", t + 1);
        break;
      }
      case e.CPU_START: {
        const A = this.getRegister("A"), h = this.cpu.motherboard.cpus.get(A);
        h && h.start(), this.setRegister("PC", t + 1);
        break;
      }
      case e.CPU_HALT: {
        const A = this.getRegister("A"), h = this.cpu.motherboard.cpus.get(A);
        h && h.stop(), this.setRegister("PC", t + 1);
        break;
      }
      case e.SYSCALL:
        this.handleSyscall(t);
        break;
      case e.GET_FREQ:
        this.setRegister("A", Z(((c = this.cpu.motherboard.clock) == null ? void 0 : c.clockFrequency) ?? 0)), this.setRegister("PC", t + 1);
        break;
      case e.SET_FREQ:
        const a = this.cpu.motherboard.clock;
        a && (a.clockFrequency = this.cpu.readMem8(t), a.emit("state", {
          clockFrequency: a.clockFrequency
        }), a.status && a.restart()), this.setRegister("PC", t + 2);
        break;
      case e.BREAKPOINT_JS:
        debugger;
        this.setRegister("PC", t + 1);
        break;
      case e.BREAKPOINT:
        this.cpu.currentBreakpoint === t ? (this.cpu.currentBreakpoint = null, this.setRegister("PC", t + 1)) : (this.cpu.currentBreakpoint = t, this.cpu.cpuPaused || this.cpu.setPaused(!0));
        break;
      case e.HALT:
        this.stop();
        break;
      case e.ADD: {
        const { result: A, flags: h } = ee.add(this.getRegister("A"), this.getRegister("B"));
        this.setRegister("A", A), this.setFlags(h.zero, h.carry), this.setRegister("PC", t + 1);
        break;
      }
      case e.SUB: {
        const { result: A, flags: h } = ee.sub(this.getRegister("A"), this.getRegister("B"));
        this.setRegister("A", A), this.setFlags(h.zero, h.carry), this.setRegister("PC", t + 1);
        break;
      }
      case e.AND: {
        const { result: A, flags: h } = ee.and(this.getRegister("A"), this.getRegister("B"));
        this.setRegister("A", A), this.setFlags(h.zero, h.carry), this.setRegister("PC", t + 1);
        break;
      }
      case e.OR: {
        const { result: A, flags: h } = ee.or(this.getRegister("A"), this.getRegister("B"));
        this.setRegister("A", A), this.setFlags(h.zero, h.carry), this.setRegister("PC", t + 1);
        break;
      }
      case e.XOR: {
        const { result: A, flags: h } = ee.xor(this.getRegister("A"), this.getRegister("B"));
        this.setRegister("A", A), this.setFlags(h.zero, h.carry), this.setRegister("PC", t + 1);
        break;
      }
      case e.INC_A: {
        const { result: A, flags: h } = ee.inc(this.getRegister("A"));
        this.setRegister("A", A), this.setFlags(h.zero, h.carry), this.setRegister("PC", t + 1);
        break;
      }
      case e.DEC_A: {
        const { result: A, flags: h } = ee.dec(this.getRegister("A"));
        this.setRegister("A", A), this.setFlags(h.zero, h.carry), this.setRegister("PC", t + 1);
        break;
      }
      case e.INC_B: {
        const { result: A, flags: h } = ee.inc(this.getRegister("B"));
        this.setRegister("B", A), this.setFlags(h.zero, h.carry), this.setRegister("PC", t + 1);
        break;
      }
      case e.DEC_B: {
        const { result: A, flags: h } = ee.dec(this.getRegister("B"));
        this.setRegister("B", A), this.setFlags(h.zero, h.carry), this.setRegister("PC", t + 1);
        break;
      }
      case e.INC_C: {
        const { result: A, flags: h } = ee.inc(this.getRegister("C"));
        this.setRegister("C", A), this.setFlags(h.zero, h.carry), this.setRegister("PC", t + 1);
        break;
      }
      case e.DEC_C: {
        const { result: A, flags: h } = ee.dec(this.getRegister("C"));
        this.setRegister("C", A), this.setFlags(h.zero, h.carry), this.setRegister("PC", t + 1);
        break;
      }
      case e.INC_D: {
        const { result: A, flags: h } = ee.inc(this.getRegister("D"));
        this.setRegister("D", A), this.setFlags(h.zero, h.carry), this.setRegister("PC", t + 1);
        break;
      }
      case e.DEC_D: {
        const { result: A, flags: h } = ee.dec(this.getRegister("D"));
        this.setRegister("D", A), this.setFlags(h.zero, h.carry), this.setRegister("PC", t + 1);
        break;
      }
      case e.JMP:
        this.setRegister("PC", this.cpu.readMem16(t));
        break;
      case e.JZ:
        this.getFlag("zero") ? this.setRegister("PC", this.cpu.readMem16(t)) : this.setRegister("PC", t + 3);
        break;
      case e.JNZ:
        this.getFlag("zero") ? this.setRegister("PC", t + 3) : this.setRegister("PC", this.cpu.readMem16(t));
        break;
      case e.JC:
        this.getFlag("carry") ? this.setRegister("PC", this.cpu.readMem16(t)) : this.setRegister("PC", t + 3);
        break;
      case e.JNC:
        this.getFlag("carry") ? this.setRegister("PC", t + 3) : this.setRegister("PC", this.cpu.readMem16(t));
        break;
      case e.PUSH_A: {
        this.pushValue(this.getRegister("A")), this.setRegister("PC", t + 1);
        break;
      }
      case e.PUSH_B:
        this.pushValue(this.getRegister("B")), this.setRegister("PC", t + 1);
        break;
      case e.PUSH_C:
        this.pushValue(this.getRegister("C")), this.setRegister("PC", t + 1);
        break;
      case e.PUSH_D:
        this.pushValue(this.getRegister("D")), this.setRegister("PC", t + 1);
        break;
      case e.POP_A:
        this.setRegister("A", this.popValue()), this.setRegister("PC", t + 1);
        break;
      case e.POP_B:
        this.setRegister("B", this.popValue()), this.setRegister("PC", t + 1);
        break;
      case e.POP_C:
        this.setRegister("C", this.popValue()), this.setRegister("PC", t + 1);
        break;
      case e.POP_D:
        this.setRegister("D", this.popValue()), this.setRegister("PC", t + 1);
        break;
      case e.GET_SP:
        this.setRegister("A", this.getRegister("SP")), this.setRegister("PC", t + 1);
        break;
      case e.SET_SP:
        this.setRegister("SP", this.cpu.readMem16(t)), this.setRegister("PC", t + 3);
        break;
      case e.CALL:
        this.handleCall(t);
        break;
      case e.RET:
        this.handleRet();
        break;
      case e.EI:
        this.cpu.interruptsEnabled = !0, this.setRegister("PC", t + 1);
        break;
      case e.DI:
        this.cpu.interruptsEnabled = !1, this.setRegister("PC", t + 1);
        break;
      case e.IRET:
        this.handleIRet();
        break;
      case e.MOV_AB:
        this.setRegister("B", this.getRegister("A")), this.setRegister("PC", t + 1);
        break;
      case e.MOV_AC:
        this.setRegister("C", this.getRegister("A")), this.setRegister("PC", t + 1);
        break;
      case e.MOV_AD:
        this.setRegister("D", this.getRegister("A")), this.setRegister("PC", t + 1);
        break;
      case e.MOV_BA:
        this.setRegister("A", this.getRegister("B")), this.setRegister("PC", t + 1);
        break;
      case e.MOV_BC:
        this.setRegister("C", this.getRegister("B")), this.setRegister("PC", t + 1);
        break;
      case e.MOV_BD:
        this.setRegister("D", this.getRegister("B")), this.setRegister("PC", t + 1);
        break;
      case e.MOV_CA:
        this.setRegister("A", this.getRegister("C")), this.setRegister("PC", t + 1);
        break;
      case e.MOV_CB:
        this.setRegister("B", this.getRegister("C")), this.setRegister("PC", t + 1);
        break;
      case e.MOV_CD:
        this.setRegister("D", this.getRegister("C")), this.setRegister("PC", t + 1);
        break;
      case e.MOV_DA:
        this.setRegister("A", this.getRegister("D")), this.setRegister("PC", t + 1);
        break;
      case e.MOV_DB:
        this.setRegister("B", this.getRegister("D")), this.setRegister("PC", t + 1);
        break;
      case e.MOV_DC:
        this.setRegister("C", this.getRegister("D")), this.setRegister("PC", t + 1);
        break;
      case e.MOV_A_IMM:
        const u = this.cpu.readMem8(t);
        this.setRegister("A", u), this.setFlags(u === 0, !1), this.setRegister("PC", t + 2);
        break;
      case e.MOV_B_IMM:
        const _ = this.cpu.readMem8(t);
        this.setRegister("B", _), this.setFlags(_ === 0, !1), this.setRegister("PC", t + 2);
        break;
      case e.MOV_C_IMM:
        const d = this.cpu.readMem8(t);
        this.setRegister("C", d), this.setFlags(d === 0, !1), this.setRegister("PC", t + 2);
        break;
      case e.MOV_D_IMM:
        const m = this.cpu.readMem8(t);
        this.setRegister("D", m), this.setFlags(m === 0, !1), this.setRegister("PC", t + 2);
        break;
      case e.MOV_A_MEM:
        const b = this.cpu.readMem16(t), O = this.cpu.readMemory(b);
        this.setRegister("A", O), this.setFlags(O === 0, !1), this.setRegister("PC", t + 3);
        break;
      case e.MOV_B_MEM:
        const E = this.cpu.readMem16(t), S = this.cpu.readMemory(E);
        this.setRegister("B", S), this.setFlags(S === 0, !1), this.setRegister("PC", t + 3);
        break;
      case e.MOV_C_MEM:
        const y = this.cpu.readMem16(t), w = this.cpu.readMemory(y);
        this.setRegister("C", w), this.setFlags(w === 0, !1), this.setRegister("PC", t + 3);
        break;
      case e.MOV_D_MEM:
        const C = this.cpu.readMem16(t), p = this.cpu.readMemory(C);
        this.setRegister("D", p), this.setFlags(p === 0, !1), this.setRegister("PC", t + 3);
        break;
      case e.MOV_MEM_A:
        const P = this.cpu.readMem16(t);
        this.cpu.writeMemory(P, this.getRegister("A")), this.setRegister("PC", t + 3);
        break;
      case e.MOV_MEM_B:
        const M = this.cpu.readMem16(t);
        this.cpu.writeMemory(M, this.getRegister("B")), this.setRegister("PC", t + 3);
        break;
      case e.MOV_MEM_C:
        const f = this.cpu.readMem16(t);
        this.cpu.writeMemory(f, this.getRegister("C")), this.setRegister("PC", t + 3);
        break;
      case e.MOV_MEM_D:
        const V = this.cpu.readMem16(t);
        this.cpu.writeMemory(V, this.getRegister("D")), this.setRegister("PC", t + 3);
        break;
      case e.MOV_A_PTR_CD:
        const R = this.getRegister("D") << 8 | this.getRegister("C"), L = this.cpu.readMemory(R);
        this.setRegister("A", L), this.setFlags(L === 0, !1), this.setRegister("PC", t + 1);
        break;
      case e.MOV_B_PTR_CD:
        const k = this.getRegister("D") << 8 | this.getRegister("C"), D = this.cpu.readMemory(k);
        this.setRegister("B", D), this.setFlags(D === 0, !1), this.setRegister("PC", t + 1);
        break;
      case e.MOV_PTR_CD_A:
        const x = this.getRegister("D") << 8 | this.getRegister("C");
        this.cpu.writeMemory(x, this.getRegister("A")), this.setRegister("PC", t + 1);
        break;
      case e.MOV_PTR_CD_B:
        const T = this.getRegister("D") << 8 | this.getRegister("C");
        this.cpu.writeMemory(T, this.getRegister("B")), this.setRegister("PC", t + 1);
        break;
      default:
        this.setRegister("PC", t + 1), console.error(`Unknown opcode at 0x${t.toString(16)}: 0x${n.toString(16)}`), this.stop(), this.emit("state", {
          idx: this.idx,
          coreHalted: this.coreHalted
        });
        break;
    }
  }
  // Fonction pour CALL
  handleSyscall(t) {
    if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus");
    const n = this.cpu.readMem8(t);
    switch (n) {
      case 0:
        if (console.log("📍 Program exit (syscall 0)"), this.idx !== 0) {
          this.stop();
          break;
        }
        for (let c = s.PROGRAM_START; c <= s.PROGRAM_END; c++)
          this.cpu.memoryBus.ram && this.cpu.memoryBus.ram.storage.delete(c);
        this.setRegister("PC", s.OS_START);
        break;
      default:
        console.warn(`Unknown syscall: ${n}`), this.setRegister("PC", t + 2);
        break;
    }
  }
  handleCall(t) {
    if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus");
    const n = t + 3;
    let c = this.getRegister("SP");
    this.cpu.writeMemory(c, n >> 8 & 255), c = c - 1 & 65535, this.cpu.writeMemory(c, n & 255), c = c - 1 & 65535, this.setRegister("SP", c);
    const a = this.cpu.readMem16(t);
    this.setRegister("PC", a);
  }
  // Fonction pour RET
  handleRet() {
    if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus");
    let t = this.getRegister("SP");
    t = t + 1 & 65535;
    const n = this.cpu.readMemory(t);
    t = t + 1 & 65535;
    const a = this.cpu.readMemory(t) << 8 | n;
    this.setRegister("SP", t), this.setRegister("PC", a);
  }
  // Fonction pour IRET (Return from Interrupt)
  handleIRet() {
    if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus");
    let t = this.getRegister("SP");
    t = t + 1 & 65535;
    const n = this.cpu.readMemory(t);
    t = t + 1 & 65535;
    const a = this.cpu.readMemory(t) << 8 | n;
    t = t + 1 & 65535;
    const u = this.cpu.readMemory(t);
    this.setRegister("SP", t), this.setRegister("PC", a), this.setRegister("FLAGS", u), this.cpu.interruptsEnabled = !0, this.cpu.inInterruptHandler = !1;
  }
  // Fonction pour push une valeur sur la pile
  pushValue(t) {
    if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus");
    let n = this.getRegister("SP");
    this.cpu.writeMemory(n, t), n = n - 1 & 65535, this.setRegister("SP", n);
  }
  // Fonction pour pop une valeur de la pile
  popValue() {
    if (!this.cpu.memoryBus) throw new Error("Missing MemoryBus");
    let t = this.getRegister("SP");
    t = t + 1 & 65535;
    const n = this.cpu.readMemory(t);
    return this.setRegister("SP", t), n;
  }
  start() {
    this.coreHalted && (this.coreHalted = !1, this.emit("state", {
      idx: this.idx,
      coreHalted: this.coreHalted
    }));
  }
  stop() {
    this.coreHalted || (this.coreHalted = !0, this.emit("state", {
      idx: this.idx,
      coreHalted: this.coreHalted
    }));
  }
  reset() {
    this.stop(), this.coreCycle = 0, this.registers = new Map(Et), this.emit("state", {
      idx: this.idx,
      //coreHalted: this.coreHalted,
      coreCycle: this.coreCycle,
      registers: this.registers
    });
  }
}
let It = class extends Ot {
  constructor(t, n = 0, c = 1) {
    super(t), this.type = "simple", this.architecture = "8bit", this.cores = [], this.cpuHalted = !0, this.cpuPaused = !1, this.cpuCycle = 0, this.cacheL1 = /* @__PURE__ */ new Map(), this.cacheL1MaxSize = 128, this.memoryBus = null, this.interrupt = null, this.currentBreakpoint = null, this.interruptsEnabled = !0, this.inInterruptHandler = !1, this.id = Math.round(Math.random() * 999999999), this.idx = n;
    for (let a = 0; a < c; a++) {
      const u = new bt(this, a);
      this.cores.push(u);
    }
    this.reset();
  }
  start() {
    this.cpuHalted && (this.cpuHalted = !1, this.emit("state", {
      cpuHalted: this.cpuHalted
    }));
  }
  stop() {
    this.cpuHalted || (this.cpuHalted = !0, this.emit("state", {
      cpuHalted: this.cpuHalted
    }));
  }
  // Connect CPU to MemoryBus
  connectToMemoryBus(t) {
    this.memoryBus = t, this.emit("memorybus-connected", { memoryBus: t });
  }
  executeCycle() {
    if (!this.cpuHalted && this.status === "ready") {
      this.status = "executingCycle", this.cpuCycle++, this.emit("state", {
        cpuCycle: this.cpuCycle
      });
      for (const t of this.cores)
        t.executeCoreCycle();
      this.status = "ready";
    }
  }
  clearMemoryCache() {
    this.cacheL1 = /* @__PURE__ */ new Map();
  }
  readMemoryCache(t) {
    return this.cacheL1.get(t) ?? null;
  }
  writeMemoryCache(t, n) {
    if (this.cacheL1.set(t, n), this.cacheL1.size > this.cacheL1MaxSize) {
      const c = this.cacheL1.size - this.cacheL1MaxSize, a = Array.from(this.cacheL1.keys()).slice(0, c);
      for (const u of a)
        this.cacheL1.delete(u);
    }
  }
  deleteMemoryCache(t) {
    this.cacheL1.has(t) && this.cacheL1.delete(t);
  }
  readMemory(t) {
    if (me(t)) {
      const c = this.readMemoryCache(t);
      if (c !== null) return c;
    }
    if (!this.memoryBus) return Z(0);
    const n = this.memoryBus.readMemory(t);
    return me(t) && this.writeMemoryCache(t, n), n;
  }
  writeMemory(t, n) {
    if (!this.memoryBus) throw new Error("Missing MemoryBus");
    this.memoryBus.writeMemory(t, n), me(t) && this.deleteMemoryCache(t);
  }
  readMem8(t) {
    return this.memoryBus ? this.memoryBus.readMemory(t + 1) : Z(0);
  }
  readMem16(t) {
    if (!this.memoryBus) return ce(0);
    const n = this.memoryBus.readMemory(t + 1);
    return this.memoryBus.readMemory(t + 2) << 8 | n;
  }
  reset() {
    this.cpuCycle = 0, this.interruptsEnabled = !0, this.inInterruptHandler = !1, this.currentBreakpoint = null, this.cacheL1 = /* @__PURE__ */ new Map();
    for (const t of this.cores)
      t.reset();
    this.cores[0] && this.cores[0].start(), this.emit("state", {
      //cpuHalted: this.cpuHalted,
      cpuCycle: this.cpuCycle,
      //registers: this.registers,
      interruptsEnabled: this.interruptsEnabled,
      inInterruptHandler: this.inInterruptHandler,
      currentBreakpoint: this.currentBreakpoint
    });
  }
};
const ee = {
  add: (g, t) => {
    const n = g + t & 255, c = g + t > 255;
    return { result: n, flags: { zero: n === 0, carry: c } };
  },
  sub: (g, t) => {
    const n = g - t & 255, c = n === 0, a = g < t;
    return { result: n, flags: { zero: c, carry: a } };
  },
  and: (g, t) => {
    const n = g & t & 255;
    return { result: n, flags: { zero: n === 0, carry: !1 } };
  },
  or: (g, t) => {
    const n = (g | t) & 255;
    return { result: n, flags: { zero: n === 0, carry: !1 } };
  },
  xor: (g, t) => {
    const n = (g ^ t) & 255;
    return { result: n, flags: { zero: n === 0, carry: !1 } };
  },
  inc: (g) => {
    const t = g + 1 & 255;
    return { result: t, flags: { zero: t === 0, carry: !1 } };
  },
  dec: (g) => {
    const t = g - 1 & 255;
    return { result: t, flags: { zero: t === 0, carry: !1 } };
  }
};
let St = class extends te {
  constructor(t, n = 1) {
    super(), this.timer = null, this.status = !1, this.id = Math.round(Math.random() * 999999999), this.motherboard = t, this.clockFrequency = n, this.clockCycles = 0;
  }
  tick() {
    this.clockCycles++, this.emit("tick", { cycle: this.clockCycles });
  }
  toggle() {
    this.status ? this.stop() : this.start();
  }
  restart() {
    this.stop(), this.start();
  }
  start() {
    if (this.timer || this.clockFrequency <= 0) return;
    const t = 1e3 / this.clockFrequency;
    this.timer = setInterval(this.tick.bind(this), t), this.status = !0, this.emit("state", { status: this.status }), console.log("Clock started"), this.tick();
  }
  stop() {
    this.timer && (clearInterval(this.timer), this.timer = null, this.status = !1, this.emit("state", { status: this.status }), console.log("Clock stopped"));
  }
  reset() {
    const t = this.status;
    this.stop(), this.clockCycles = 0, t && this.start();
  }
}, Rt = class extends te {
  constructor(t, n, c = 65535) {
    super(), this.storage = /* @__PURE__ */ new Map(), this.loadRawData = async (a) => {
      this.storage = new Map(a), this.storage.size > this.maxSize && (console.warn("ROM overloaded"), this.deleteOverload()), this.emit("state", { storage: this.storage });
    }, this.id = Math.round(Math.random() * 999999999), this.memoryBus = t, this.maxSize = c, n && this.loadRawData(new Map(n)), this.emit("state", { maxSize: c });
  }
  deleteOverload() {
    const t = this.storage.size - this.maxSize;
    if (t > 0) {
      const n = Array.from(this.storage.keys()).reverse().slice(0, t);
      for (const c of n)
        this.storage.delete(c);
    }
  }
  read(t) {
    return this.storage.get(t) || Z(0);
  }
  write(t, n) {
    throw new Error("Cannot write ROM");
  }
}, Dt = class extends te {
  constructor(t, n, c = 65535) {
    super(), this.storage = /* @__PURE__ */ new Map(), this.loadRawData = async (a) => {
      this.storage = new Map(a), this.storage.size > this.maxSize && (console.warn("RAM overloaded"), this.deleteOverload()), this.emit("state", { storage: this.storage });
    }, this.id = Math.round(Math.random() * 999999999), this.memoryBus = t, this.maxSize = c, n && this.loadRawData(new Map(n)), this.emit("state", { maxSize: c });
  }
  deleteOverload() {
    const t = this.storage.size - this.maxSize;
    if (t > 0) {
      const n = Array.from(this.storage.keys()).reverse().slice(0, t);
      for (const c of n)
        this.storage.delete(c);
    }
  }
  eraseRam() {
    this.loadRawData(/* @__PURE__ */ new Map());
  }
  read(t) {
    return this.storage.get(t) || Z(0);
  }
  write(t, n) {
    this.storage.set(t, Z(n)), this.storage.size > this.maxSize && (this.storage.delete(t), console.warn("RAM overloaded")), this.emit("state", { storage: new Map(this.storage) });
  }
}, Ct = class extends te {
  constructor(t, n = null) {
    super(), this.id = Math.round(Math.random() * 999999999), this.name = "interrupt", this.type = "Interrupt", this.ioPort = n ?? 0, this.memoryBus = t;
  }
  // Lecture depuis les ports IO
  read(t) {
    switch (t - s.INTERRUPT_BASE) {
      default:
        return 0;
    }
  }
  // Écriture vers les ports IO
  write(t, n) {
  }
  async loadCodeInRam(t, n = 0) {
    if (!this.memoryBus.ram) {
      console.warn("Cannot load code in RAM. DMA not loaded.");
      return;
    }
    if (n < s.RAM_START || n + ((t == null ? void 0 : t.size) ?? 0) > s.RAM_END) {
      console.warn("Write memory out of range");
      return;
    }
    const c = t ? t.entries() : /* @__PURE__ */ new Map([[ce(0), Z(0)]]);
    for (const [a, u] of c)
      this.memoryBus.ram.write(ce(n + a), u);
    this.memoryBus.motherboard && this.memoryBus.motherboard.clearCpuCaches(), console.log("Loaded code size in RAM:", (t == null ? void 0 : t.size) ?? 0);
  }
}, yt = class extends te {
  constructor(t) {
    super(), this.rom = null, this.ram = null, this.dma = null, this.io = null, this.id = Math.round(Math.random() * 999999999), this.motherboard = t;
  }
  addRom(t, n) {
    const c = new Rt(this, t, n);
    return this.rom || (this.rom = c, this.emit("rom-connected", { rom: c })), c;
  }
  addRam(t, n) {
    const c = new Dt(this, t, n);
    return this.ram || (this.ram = c, this.emit("ram-connected", { ram: c })), c;
  }
  addDma(t = null) {
    const n = new Ct(this, t);
    return this.dma || (this.dma = n, this.emit("dma-connected", { dma: n })), n;
  }
  connectDevicesManager(t) {
    !this.io && t && (this.io = t, this.emit("io-connected", { devicesManager: t }));
  }
  readMemory(t) {
    return pe(t) ? this.rom ? this.rom.read(t) : (console.warn("No ROM detected"), 0) : Ee(t) ? this.io ? this.io.read(be(t)) : (console.warn("No IO detected"), 0) : this.ram ? this.ram.read(t) : (console.warn("No RAM detected"), Z(0));
  }
  writeMemory(t, n) {
    if (pe(t)) {
      console.warn(`Attempted write to ROM at 0x${t.toString(16)}`);
      return;
    }
    if (Ee(t)) {
      if (this.io) {
        this.io.write(be(t), n);
        return;
      }
      console.warn("No IO detected");
      return;
    }
    if (this.ram) {
      this.ram.write(t, n);
      return;
    }
    console.warn("No RAM detected");
  }
}, wt = class extends te {
  constructor(t) {
    super(), this.id = Math.round(Math.random() * 999999999), this.motherboard = t;
  }
}, Tt = class extends te {
  constructor(t) {
    super(), this.powerSupply = null, this.cpus = /* @__PURE__ */ new Map(), this.clock = null, this.memoryBus = null, this.id = Math.round(Math.random() * 999999999), this.computer = t;
  }
  getCpus() {
    return Array.from(this.cpus.values());
  }
  addCpu(t = 1) {
    const n = this.cpus.size, c = new It(this, n, t);
    return this.cpus.set(n, c), this.emit("cpu-mounted", { idx: n, cpu: c }), this.memoryBus && c.connectToMemoryBus(this.memoryBus), c;
  }
  addClock(t = 1) {
    const n = new St(this, t);
    return this.clock = n, this.emit("clock-mounted", { clock: n }), n.on("tick", ({ cycle: c }) => {
      for (const a of this.getCpus())
        a && (a.cpuPaused || a.cpuHalted || a.executeCycle());
    }), n;
  }
  addMemoryBus() {
    const t = new yt(this);
    this.memoryBus = t, this.emit("memorybus-mounted", { memoryBus: t });
    for (const n of this.getCpus())
      n && n.connectToMemoryBus(t);
    return this.computer.devicesManager && t.connectDevicesManager(this.computer.devicesManager), t;
  }
  addPowerSupply() {
    const t = new wt(this);
    return this.powerSupply || (this.powerSupply = t), t;
  }
  clearCpuCaches() {
    for (const t of this.getCpus())
      t && t.clearMemoryCache();
  }
}, Vt = class extends te {
  constructor(t = null) {
    super(), this.enabled = 0, this.pending = 0, this.mask = 0, this.handlerAddr = s.OS_START, this.id = Math.round(Math.random() * 999999999), this.name = "interrupt", this.type = "Interrupt", this.ioPort = t ?? 0, this.defaultIrqCpuHandler = { cpu: 0, core: 0 }, this.irqsCpuHandler = /* @__PURE__ */ new Map();
  }
  // Lecture depuis les ports IO
  read(t) {
    switch (t - s.INTERRUPT_BASE) {
      case 0:
        return this.enabled;
      case 1:
        return this.pending & this.enabled & ~this.mask;
      case 2:
        return 0;
      case 3:
        return this.mask;
      case 4:
        return this.handlerAddr & 255;
      case 5:
        return this.handlerAddr >> 8 & 255;
      case 6:
        return 0;
      case 7:
        return 0;
      default:
        return 0;
    }
  }
  // Écriture vers les ports IO
  write(t, n) {
    switch (t) {
      case 0:
        this.enabled = Z(n), this.emit("state", { enabled: this.enabled });
        break;
      case 1:
        break;
      case 2:
        const a = n & 7;
        this.pending = this.pending & ~(1 << a), this.emit("state", { pending: this.pending });
        break;
      case 3:
        this.mask = n & 255, this.emit("state", { mask: this.mask });
        break;
      case 4:
        this.handlerAddr = this.handlerAddr & 65280 | n & 255, this.emit("state", { handlerAddr: this.handlerAddr });
        break;
      case 5:
        this.handlerAddr = this.handlerAddr & 255 | (n & 255) << 8, this.emit("state", { handlerAddr: this.handlerAddr });
        break;
      case 6: {
        const u = Z(n >> 4), _ = this.irqsCpuHandler.get(u);
        _ ? _.cpu = Z(n & 15) : console.warn("IRQ CPU Handler not found");
        break;
      }
      case 7: {
        const u = Z(n >> 4), _ = this.irqsCpuHandler.get(u);
        _ ? _.core = Z(n & 15) : console.warn("IRQ CPU Handler not found");
        break;
      }
    }
  }
  // Demander une interruption (appelé par les périphériques)
  requestInterrupt(t) {
    if (t < 0 || t > 7) {
      console.warn(`Invalid IRQ number: ${t}`);
      return;
    }
    this.irqsCpuHandler.set(t, this.defaultIrqCpuHandler), this.pending = this.pending | 1 << t, this.emit("state", { pending: this.pending });
  }
  // Vérifier si une interruption est prête
  hasPendingInterrupt() {
    return (this.pending & this.enabled & ~this.mask) !== 0;
  }
  // Obtenir l'IRQ la plus prioritaire en attente
  getPendingIRQ(t, n) {
    const c = this.pending & this.enabled & ~this.mask;
    if (c === 0) return null;
    for (let a = 0; a < 8; a++) {
      const u = this.irqsCpuHandler.get(a);
      if (!(t !== void 0 && u && t !== u.cpu) && !(n !== void 0 && u && n !== u.core) && c & 1 << a)
        return a;
    }
    return null;
  }
  // Fonction pour le CPU pour acquitter
  acknowledgeInterrupt(t) {
    this.pending = this.pending & ~(1 << t), this.emit("state", { pending: this.pending });
  }
  // Reset
  reset() {
    this.enabled = 0, this.pending = 0, this.mask = 0, this.handlerAddr = s.OS_START, this.emit("state", { handlerAddr: this.handlerAddr, enabled: this.enabled, pending: this.pending, mask: this.mask });
  }
};
const ue = 16;
let xt = class extends te {
  constructor() {
    super(), this.devices = /* @__PURE__ */ new Map(), this.id = Math.round(Math.random() * 999999999);
  }
  getDeviceByName(t) {
    return Array.from(this.devices.values()).find((a) => a.name === t);
  }
  read(t) {
    const n = Z(Math.floor(t / ue)), c = Z(t % ue), a = this.devices.get(n);
    return a ? a.read(c) : (console.warn(`Read from unknown I/O port 0xFF${t.toString(16).padStart(2, "0")}`), 0);
  }
  write(t, n) {
    const c = Z(Math.floor(t / ue)), a = Z(t % ue), u = this.devices.get(c);
    if (u) {
      u.write(a, n);
      return;
    }
    console.warn(`Write to unknown I/O port 0xFF${t.toString(16).padStart(2, "0")} (port ${a})`);
  }
  reset() {
    this.devices.forEach((t) => {
      t.reset && t.reset();
    });
  }
};
const Nt = ["Input", "DiskStorage", "Display", "Audio", "Time", "Random", "Interrupt"], _e = (g) => {
  const { hidden: t, open: n = !0, internal: c, children: a, onInstanceCreated: u } = g, { computerRef: _, devicesManagerRef: d } = se(), [m, b] = I(null), [O, E] = I(n), [S, y] = I(null), [w, C] = I(!1), p = Q(null);
  K(() => {
    if (!_.current || m)
      return;
    const x = setTimeout(() => {
      if (!_.current) return;
      const T = d.current ?? _.current.addDevicesManager();
      b(T), T.on("state", (A) => {
      }), d.current || (d.current = T);
    }, 100);
    return () => clearTimeout(x);
  }, [_.current]), K(() => {
    m && u && u(m);
  }, [m, u]);
  const P = oe((D) => {
    if (!m) return;
    if (!D.type || !Nt.includes(D.type)) {
      console.warn(`Device "${D.name}" has invalid invalid type (${D.type})`);
      return;
    }
    if (m.getDeviceByName(D.name)) {
      console.warn(`Device "${D.name}" already exist`);
      return;
    }
    if (m.devices.has(D.ioPort)) {
      const T = m.devices.get(D.ioPort);
      console.warn(`Device "${D.name}" wants an occuped ioPort (used by ${T == null ? void 0 : T.name})`);
      return;
    }
    m.devices.set(D.ioPort, D), D.name === "data_2" && M("data_2");
  }, [m]), M = async (D) => {
    if (!m) return;
    const x = 8192, T = await Be("os/devices/led/led.lib.test.asm"), A = await Ke(T, x), h = m.getDeviceByName(D);
    h && h.loadRawData(A.code);
  }, f = G.Children.map(a, (D) => {
    if (G.isValidElement(D)) {
      const x = D;
      switch (x.type) {
        default:
          return G.cloneElement(x, { onInstanceCreated: P });
      }
    }
    return D;
  });
  K(() => {
    if (p.current && S)
      return window.addEventListener("mousemove", k), window.addEventListener("mouseup", L), () => {
        window.removeEventListener("mousemove", k), window.removeEventListener("mouseup", L);
      };
  }, [S]);
  const V = () => {
    p.current && (p.current.style.position = "static", C(!1));
  }, R = (D) => {
    if (!p.current || D.button !== 0) return;
    const x = p.current.getBoundingClientRect(), T = D.clientX - x.left, A = D.clientY - x.top;
    y({ x: T, y: A }), document.body.classList.add("select-none");
  }, L = () => {
    p.current && (y(null), document.body.classList.remove("select-none"));
  }, k = (D) => {
    if (p.current && S) {
      w || (p.current.style.position = "absolute", C(!0));
      const x = D.pageX - S.x, T = D.pageY - S.y;
      p.current.style.left = x + "px", p.current.style.top = T + "px";
    }
  };
  return m ? /* @__PURE__ */ l("div", { ref: p, className: `devices ${c ? "w-auto max-w-[30vw]" : "w-full"} bg-amber-900 p-1 rounded ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ l("div", { className: "w-full flex bg-background-light p-2 rounded", children: [
      /* @__PURE__ */ l("h2", { className: "font-bold cursor-move", onMouseDown: (D) => R(D), children: [
        c && /* @__PURE__ */ r(H, { children: "Internal Devices" }),
        !c && /* @__PURE__ */ r(H, { children: "External Devices" })
      ] }),
      f && /* @__PURE__ */ l("div", { className: "ms-auto flex gap-2", children: [
        w && /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => V(),
            children: "⤴"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => E((D) => !D),
            children: O ? "-" : "+"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: `${O ? "flex" : "hidden"} flex-col space-y-2 mt-2`, children: f && /* @__PURE__ */ r("div", { className: "devices-children p-1 ps-2 grid grid-cols-1 space-x-2 space-y-2", children: f }) })
  ] }) : /* @__PURE__ */ r(H, { children: "Loading Devices" });
}, us = _e, _s = _e, vt = [
  "Timer",
  "Keyboard",
  "Disk",
  "UART",
  "Button",
  "Reserved",
  "Reserved",
  "Reserved"
], Pt = (g) => {
  const { hidden: t, open: n = !1, ioPort: c = null, children: a, onInstanceCreated: u } = g, [_, d] = I(null), [m, b] = I(n), [O, E] = I(0), [S, y] = I(0), [w, C] = I(0), [p, P] = I(s.OS_START);
  return K(() => {
    if (_) return;
    const f = setTimeout(() => {
      const V = new Vt(c);
      d(V), V.on("state", (R) => {
        V && (R.enabled !== void 0 && E(R.enabled), R.pending !== void 0 && y(R.pending), R.mask !== void 0 && C(R.mask), R.handlerAddr !== void 0 && P(R.handlerAddr));
      });
    }, 100);
    return () => clearTimeout(f);
  }, []), K(() => {
    _ && u && u(_);
  }, [_, u]), _ ? /* @__PURE__ */ l("div", { className: `w-full p-2 rounded bg-background-light-2xl ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ l("div", { className: "w-full flex bg-background-light-xl p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold", children: "Interrupt" }),
      /* @__PURE__ */ r(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => b((M) => !M),
          children: m ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ l("div", { className: `${m ? "flex" : "hidden"} flex-col space-y-2 bg-background-light-3xl p-1 min-w-[300px]`, children: [
      /* @__PURE__ */ r("div", { className: "flex items-center gap-2 px-1", children: /* @__PURE__ */ r("div", { className: "w-full grid grid-cols-1 gap-4", children: /* @__PURE__ */ l("div", { children: [
        /* @__PURE__ */ r("h4", { className: "text-sm font-medium text-slate-300 mb-2", children: "IRQ Status" }),
        /* @__PURE__ */ r("div", { className: "space-y-1 w-full", children: Array.from({ length: 8 }).map((M, f) => {
          const V = O >> f & 1, R = S >> f & 1, L = w >> f & 1;
          return /* @__PURE__ */ l("div", { className: "flex items-center justify-between p-2 rounded bg-slate-900/50", children: [
            /* @__PURE__ */ l("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ r("div", { className: `w-3 h-3 rounded-full ${V && R && !L ? "bg-red-500 animate-pulse" : "bg-slate-700"}` }),
              /* @__PURE__ */ l("span", { className: "text-sm", children: [
                "IRQ",
                f,
                ": ",
                vt[f]
              ] })
            ] }),
            /* @__PURE__ */ l("div", { className: "flex gap-1 text-xs", children: [
              /* @__PURE__ */ r("span", { className: V ? "text-green-400" : "text-slate-600", title: "Enabled", children: "E" }),
              /* @__PURE__ */ r("span", { className: R ? "text-red-400" : "text-slate-600", title: "Pending", children: "P" }),
              /* @__PURE__ */ r("span", { className: L ? "text-yellow-400" : "text-slate-600", title: "Masked", children: "M" })
            ] })
          ] }, f);
        }) })
      ] }) }) }),
      /* @__PURE__ */ r("div", { children: a })
    ] })
  ] }) : /* @__PURE__ */ r(H, { children: "Loading Interrupt" });
}, Lt = (g) => /* @__PURE__ */ r("div", { className: "w-auto rounded space-y-2 ", children: g.coresIds.map((t) => /* @__PURE__ */ r(
  kt,
  {
    coreIdx: t,
    coreHalted: g.coresHalted.get(t) ?? !0,
    coreCycle: g.coresCoreCycle.get(t) ?? 0,
    registers: g.coresRegisters.get(t) ?? /* @__PURE__ */ new Map(),
    cpuPaused: g.cpuPaused,
    cpuHalted: g.cpuHalted,
    clockPaused: g.clockPaused
  },
  t
)) }), kt = (g) => {
  const { coreIdx: t, coreHalted: n, cpuHalted: c, cpuPaused: a, clockPaused: u, coreCycle: _, registers: d, children: m } = g, [b, O] = I(!0);
  return /* @__PURE__ */ l("div", { className: "w-full p-2 rounded bg-background-light-2xl", children: [
    /* @__PURE__ */ l("div", { className: "w-full flex bg-background-light-xl p-2 rounded", children: [
      /* @__PURE__ */ l("h2", { className: "font-bold", children: [
        "Registers Core #",
        t
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => O((E) => !E),
          children: b ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ l("div", { className: `${b ? "flex" : "hidden"} flex-col space-y-2 bg-background-light-3xl p-1 min-w-[200px]`, children: [
      /* @__PURE__ */ l("div", { className: "grid grid-cols-2 space-x-2 space-y-2", children: [
        Array.from(d.entries()).map(([E, S]) => /* @__PURE__ */ l(
          "div",
          {
            className: `flex w-full h-full border justify-between px-2 pt-2 rounded ${E === "PC" ? "bg-blue-900/50" : E === "A" && n ? "bg-green-900/50 border border-green-500" : "bg-slate-900/50"}`,
            children: [
              /* @__PURE__ */ l("span", { className: "text-cyan-400", children: [
                E,
                ":"
              ] }),
              /* @__PURE__ */ l("span", { className: "text-green-400 ps-2 min-w-20 text-right", children: [
                E !== "FLAGS" && /* @__PURE__ */ l(H, { children: [
                  S,
                  " (0x",
                  S.toString(16).padStart(
                    E === "PC" || E === "SP" ? 4 : 2,
                    // 4 digits pour PC/SP, 2 pour les autres
                    "0"
                  ),
                  ")"
                ] }),
                E === "FLAGS" && ` [Z:${S & 2 ? 1 : 0} C:${S & 1 ? 1 : 0}]`
              ] })
            ]
          },
          E
        )),
        /* @__PURE__ */ l("div", { className: "flex w-full h-full justify-between px-2 pt-2 rounded bg-slate-900/50 border border-red-500/30", children: [
          /* @__PURE__ */ r("span", { className: "text-red-400", children: "Status:" }),
          /* @__PURE__ */ r("span", { className: c || n ? "text-red-400" : a ? "text-slate-400" : "text-yellow-400", children: c ? "CPU HALTED" : n ? "CORE HALTED" : a ? "MANUAL" : u ? "ACTIVE" : "RUNNING" })
        ] }),
        /* @__PURE__ */ l("div", { className: "flex w-full h-full justify-between px-2 pt-2 rounded bg-slate-900/50 border border-cyan-500/30", children: [
          /* @__PURE__ */ r("span", { className: "text-cyan-400", children: "Core Cycles:" }),
          /* @__PURE__ */ r("span", { className: "text-green-400", children: _ })
        ] })
      ] }),
      /* @__PURE__ */ r("div", { children: m })
    ] })
  ] });
}, Ft = (g) => {
  const { hidden: t, cores: n, type: c, active: a, controls: u = !1, registers: _ = !1, open: d = !1, children: m } = g, { onInstanceCreated: b } = g, { motherboardRef: O, devicesManagerRef: E } = se(), [S, y] = I(null), [w, C] = I(null), [p, P] = I(!1), [M, f] = I(!0), [V, R] = I(!0), [L, k] = I(0), [D, x] = I(/* @__PURE__ */ new Map()), [T, A] = I(/* @__PURE__ */ new Map()), [h, F] = I(/* @__PURE__ */ new Map()), [N, v] = I(d), [U, $] = I(null), [X, B] = I(!1), z = Q(null), j = Se(() => Array.from(h.keys()), [h]);
  K(() => {
    if (!O.current) return;
    const re = setTimeout(() => {
      if (!O.current) return;
      const q = O.current.addCpu(n);
      y(q), q.on("state", (Y) => {
        if (Y.cpuHalted !== void 0 && f(Y.cpuHalted), Y.cpuCycle !== void 0) {
          const le = Y.cpuCycle;
          k(le);
        }
        Y.cpuPaused !== void 0 && P(Y.cpuPaused);
      });
      for (let Y = 0; Y < q.cores.length; Y++)
        q.cores[Y].on("state", (ie) => {
          const Me = ie.idx;
          if (Me === void 0) {
            console.warn("CPU CORE state update => missing core idx");
            return;
          }
          ie.coreCycle && A((de) => {
            const ne = new Map(de);
            return ne.set(Me, ie.coreCycle), ne;
          }), ie.registers && x((de) => {
            const ne = new Map(de);
            return ne.set(Me, ie.registers), ne;
          }), ie.coreHalted !== void 0 && F((de) => {
            const ne = new Map(de);
            return ne.set(Me, ie.coreHalted), ne;
          });
        });
      O.current && O.current.clock && O.current.clock.on("state", (le) => {
        le.status !== void 0 && R(!le.status);
      }), q.emit("state", {
        //registers: this.cores[0].registers,
        cpuCycle: q.cpuCycle,
        cpuPaused: q.cpuPaused,
        cpuHalted: q.cpuHalted
      });
      for (const Y of q.cores)
        Y.emit("state", {
          idx: Y.idx,
          registers: Y.registers,
          coreCycle: Y.coreCycle,
          coreHalted: Y.coreHalted
        });
      (a || a === void 0 && q.idx === 0) && q.start();
    }, 100);
    return () => clearTimeout(re);
  }, [O.current]), K(() => {
    S && b && b(S);
  }, [S, b]);
  const W = (J) => {
    S && (J && !S.interrupt && (S.interrupt = J, E.current && E.current.devices.set(J.ioPort, J)), C(J));
  }, ae = G.Children.map(m, (J) => {
    if (G.isValidElement(J)) {
      const re = J;
      switch (re.type) {
        case Pt:
          return G.cloneElement(re, { onInstanceCreated: W });
        default:
          return console.log("Invalid component mounted into Cpu : null", re.type.name), null;
      }
    }
    return J;
  }), he = () => {
    S && (console.log(`runStep cycle #${L + 1}`), S.executeCycle());
  }, Ae = () => {
    S && (console.log(`runLoop cycle #${L + 1}`), S.togglePaused());
  }, ve = () => {
    S && (console.log("resetCpu"), S && S.reset());
  };
  K(() => {
    if (z.current && U)
      return window.addEventListener("mousemove", fe), window.addEventListener("mouseup", ge), () => {
        window.removeEventListener("mousemove", fe), window.removeEventListener("mouseup", ge);
      };
  }, [U]);
  const Pe = () => {
    z.current && (z.current.style.position = "static", B(!1));
  }, Le = (J) => {
    if (!z.current || J.button !== 0) return;
    const re = z.current.getBoundingClientRect(), q = J.clientX - re.left, Y = J.clientY - re.top;
    $({ x: q, y: Y }), document.body.classList.add("select-none");
  }, ge = () => {
    z.current && ($(null), document.body.classList.remove("select-none"));
  }, fe = (J) => {
    if (z.current && U) {
      X || (z.current.style.position = "absolute", B(!0));
      const re = J.pageX - U.x, q = J.pageY - U.y;
      z.current.style.left = re + "px", z.current.style.top = q + "px";
    }
  };
  return S ? /* @__PURE__ */ l("div", { ref: z, className: `cpu w-auto bg-rose-950 p-1 ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ l("div", { className: "w-full flex bg-background-light p-2 rounded", children: [
      /* @__PURE__ */ l("h2", { className: "font-bold cursor-move", onMouseDown: (J) => Le(J), children: [
        "CPU #",
        S.idx
      ] }),
      /* @__PURE__ */ l("div", { className: "ms-auto flex gap-2", children: [
        X && /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => Pe(),
            children: "⤴"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => v((J) => !J),
            children: N ? "-" : "+"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: `${N ? "hidden" : "flex"} flex-col space-y-2 p-1 min-w-[200px] items-center justify-center`, children: /* @__PURE__ */ r(ye, {}) }),
    /* @__PURE__ */ l("div", { className: `${N ? "flex" : "hidden"} flex-col space-y-2 p-1 min-w-[400px]`, children: [
      u && /* @__PURE__ */ r(H, { children: /* @__PURE__ */ l("div", { className: "p-2 rounded bg-background-light-2xl flex gap-2", children: [
        /* @__PURE__ */ r(
          "button",
          {
            onClick: () => ve(),
            className: "bg-red-900 hover:bg-red-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors",
            children: "⟳ CPU Reset"
          }
        ),
        /* @__PURE__ */ l(
          "button",
          {
            disabled: M,
            onClick: () => Ae(),
            className: `disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ${p ? "bg-blue-900 hover:bg-blue-700" : "bg-green-900 hover:bg-green-700"}`,
            children: [
              /* @__PURE__ */ r("span", { className: `${p ? "" : "font-bold"}`, children: "Auto" }),
              "/",
              /* @__PURE__ */ r("span", { className: `${p ? "font-bold" : ""}`, children: "Manual" })
            ]
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            disabled: M || !p && !V,
            onClick: () => he(),
            className: "bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ms-auto",
            children: "⏭ CPU Step"
          }
        )
      ] }) }),
      /* @__PURE__ */ l("div", { className: "p-2 rounded bg-background-light-2xl flex justify-between", children: [
        /* @__PURE__ */ l("div", { children: [
          "CPU Cycle #",
          L
        ] }),
        /* @__PURE__ */ l("div", { children: [
          "Cache L1 ",
          S.cacheL1.size,
          " bytes"
        ] })
      ] }),
      _ && /* @__PURE__ */ r(H, { children: /* @__PURE__ */ r(
        Lt,
        {
          cpuHalted: M,
          cpuPaused: p,
          clockPaused: V,
          coresIds: j,
          coresHalted: h,
          coresCoreCycle: T,
          coresRegisters: D
        }
      ) }),
      ae && /* @__PURE__ */ r("div", { className: "cpu-children flex space-x-4 space-y-4", children: ae })
    ] })
  ] }) : /* @__PURE__ */ r(H, { children: "Loading CPU" });
}, ye = () => /* @__PURE__ */ l("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 100 100", width: "100", height: "100", children: [
  /* @__PURE__ */ r("rect", { className: "cpu-body fill-[#2e4c79]", x: "10", y: "10", width: "80", height: "80", rx: "5", ry: "5" }),
  /* @__PURE__ */ r("rect", { className: "cpu-inner fill-[#111e33]", x: "20", y: "20", width: "60", height: "60", rx: "3", ry: "3" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "15", y: "5", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "25", y: "5", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "35", y: "5", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "45", y: "5", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "55", y: "5", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "65", y: "5", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "75", y: "5", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "15", y: "90", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "25", y: "90", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "35", y: "90", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "45", y: "90", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "55", y: "90", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "65", y: "90", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "75", y: "90", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "5", y: "15", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "5", y: "25", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "5", y: "35", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "5", y: "45", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "5", y: "55", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "5", y: "65", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "5", y: "75", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "90", y: "15", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "90", y: "25", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "90", y: "35", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "90", y: "45", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "90", y: "55", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "90", y: "65", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "90", y: "75", width: "5", height: "5", rx: "1", ry: "1" }),
  /* @__PURE__ */ r("text", { className: "cpu-text fill-[#4a6fa5]", x: "50", y: "55", textAnchor: "middle", dominantBaseline: "central", children: "CPU" }),
  /* @__PURE__ */ r("rect", { className: "cpu-pins fill-[#2d4466]", x: "15", y: "15", width: "8", height: "8", rx: "1", ry: "1" })
] }), we = ({ name: g, storage: t }) => {
  const { computerRef: n, motherboardRef: c } = se(), a = n.current, u = c.current, [_, d] = I(/* @__PURE__ */ new Set()), [m, b] = I(/* @__PURE__ */ new Map()), [O, E] = I(!0), S = Q(null), y = Q(/* @__PURE__ */ new Map()), w = He(t), C = Se(() => Array.from(t.entries()).sort((M, f) => M[0] - f[0]), [t]);
  K(() => {
    if (a && u && (a && (d(a.breakpoints ?? /* @__PURE__ */ new Set()), a.on("state", (M) => {
      M.breakpoints && d(new Set(M.breakpoints));
    })), u)) {
      for (const M of u.getCpus())
        if (M)
          for (const f of M.cores)
            f.on("state", (V) => {
              const R = V.idx;
              if (V.registers) {
                const L = V.registers.get("PC"), k = M.idx;
                b((D) => {
                  const x = new Map(D);
                  return x.set(`${k}-${R}`, f.coreHalted ? null : L), x;
                });
              }
            }), f.emit("state", {
              idx: f.idx,
              registers: f.registers
            });
    }
  }, [a, u]), K(() => {
    const V = m.get("0-0") ?? 0, R = y.current.get(V);
    O && R && P(R, -400);
  }, [m, O]);
  const p = oe((M) => {
    a && (a.breakpoints.has(M) ? a.breakpoints.delete(M) : a.breakpoints.add(M), a.emit("state", { breakpoints: a.breakpoints }));
  }, [a]), P = oe((M, f = 0) => {
    const V = S.current;
    if (!M || !V) return;
    const R = M.offsetTop, L = V.clientHeight, k = R - L / 2 + f, D = V.scrollHeight - L, x = Math.max(0, Math.min(k, D));
    V.scrollTo({
      top: x,
      behavior: "smooth"
    });
  }, []);
  return /* @__PURE__ */ l("div", { children: [
    /* @__PURE__ */ r(
      "div",
      {
        ref: S,
        className: "font-mono text-sm space-y-1 h-[400px] overflow-y-auto overscroll-contain",
        children: C.map(([M, f]) => {
          const V = Array.from(m.values()).includes(M), R = w.get(M) ?? !1, L = pe(M);
          return /* @__PURE__ */ r("div", { children: /* @__PURE__ */ l(
            "div",
            {
              ref: (k) => {
                k && y.current.set(M, k);
              },
              className: `flex justify-between p-2 rounded ${V ? "bg-yellow-900/50 border-2 border-yellow-500" : L ? "bg-blue-900/30" : "bg-slate-900/50"}`,
              children: [
                /* @__PURE__ */ l("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ r(
                    "div",
                    {
                      onClick: () => p(M),
                      className: `
                                            w-3 h-3 rounded-full cursor-pointer transition-all
                                            ${_.has(M) ? "bg-red-600" : "bg-slate-700 hover:bg-red-500/40 border border-slate-600"}
                                            ${R ? "" : "opacity-0"}
                                        `,
                      title: "Toggle breakpoint"
                    }
                  ),
                  /* @__PURE__ */ l("span", { className: "text-yellow-400", children: [
                    V && "→ ",
                    "0x",
                    M.toString(16).padStart(4, "0"),
                    ":"
                  ] })
                ] }),
                /* @__PURE__ */ l("span", { className: R ? "text-pink-400" : "text-green-400", children: [
                  R && /* @__PURE__ */ l(H, { children: [
                    /* @__PURE__ */ l("span", { className: "text-muted-foreground", children: [
                      "0x",
                      f.toString(16).padStart(2, "0")
                    ] }),
                    /* @__PURE__ */ l("span", { children: [
                      " ",
                      Ue(f)
                    ] })
                  ] }),
                  !R && /* @__PURE__ */ l(H, { children: [
                    "0x",
                    f.toString(16).padStart(2, "0")
                  ] })
                ] })
              ]
            }
          ) }, M);
        })
      }
    ),
    /* @__PURE__ */ r("div", { className: "mt-4", children: /* @__PURE__ */ r("label", { className: "flex items-center gap-2", children: /* @__PURE__ */ l(
      "button",
      {
        onClick: () => E((M) => !M),
        className: "flex gap-2 bg-background-light-xl hover:bg-background-light-xs disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors",
        children: [
          /* @__PURE__ */ r("div", { children: "Follow current Instruction" }),
          /* @__PURE__ */ r("div", { children: O ? "✅" : "❌" })
        ]
      }
    ) }) })
  ] });
}, Bt = (g) => {
  const { data: t, open: n = !1, hidden: c = !1, size: a = 1 + s.ROM_END - s.ROM_START, children: u, onInstanceCreated: _ } = g, { memoryBusRef: d } = se(), [m, b] = I(null), [O, E] = I(/* @__PURE__ */ new Map()), [S, y] = I(n), [w, C] = I(null), [p, P] = I(!1), M = Q(null);
  K(() => {
    if (!d.current || d.current.rom || m) return;
    const x = setTimeout(() => {
      if (!d.current) return;
      const T = d.current.addRom(t, a);
      b(T), T.on("state", (A) => {
        A.storage && E(new Map(A.storage));
      }), T.emit("state", { storage: new Map(T.storage) });
    }, 100);
    return () => clearTimeout(x);
  }, [d.current]), K(() => {
    m && _ && _(m);
  }, [m, _]);
  const f = G.Children.map(u, (D) => {
    if (G.isValidElement(D)) {
      const x = D;
      switch (x.type) {
        default:
          return console.log("Invalid component mounted into Rom : null", x.type.name), null;
      }
    }
    return D;
  });
  K(() => {
    if (M.current && w)
      return window.addEventListener("mousemove", k), window.addEventListener("mouseup", L), () => {
        window.removeEventListener("mousemove", k), window.removeEventListener("mouseup", L);
      };
  }, [w]);
  const V = () => {
    M.current && (M.current.style.position = "static", P(!1));
  }, R = (D) => {
    if (!M.current || D.button !== 0) return;
    const x = M.current.getBoundingClientRect(), T = D.clientX - x.left, A = D.clientY - x.top;
    C({ x: T, y: A }), document.body.classList.add("select-none");
  }, L = () => {
    M.current && (C(null), document.body.classList.remove("select-none"));
  }, k = (D) => {
    if (M.current && w) {
      p || (M.current.style.position = "absolute", P(!0));
      const x = D.pageX - w.x, T = D.pageY - w.y;
      M.current.style.left = x + "px", M.current.style.top = T + "px";
    }
  };
  return m ? /* @__PURE__ */ l("div", { ref: M, className: `rom w-auto bg-slate-700 p-1 rounded ${c ? "hidden" : ""}`, children: [
    /* @__PURE__ */ l("div", { className: "w-full flex bg-background-light-xl p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold cursor-move", onMouseDown: (D) => R(D), children: "ROM" }),
      /* @__PURE__ */ l("div", { className: "ms-auto ", children: [
        p && /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => V(),
            children: "⤴"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => y((D) => !D),
            children: S ? "-" : "+"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: `${S ? "hidden" : "flex"} flex justify-center p-1 min-w-[200px]`, children: /* @__PURE__ */ r(Kt, {}) }),
    /* @__PURE__ */ l("div", { className: `${S ? "flex" : "hidden"} flex-col space-y-1 p-1 min-w-[350px]`, children: [
      /* @__PURE__ */ l("div", { className: "p-2 rounded bg-background-light-2xl", children: [
        /* @__PURE__ */ l("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ r("h3", { children: "ROM Storage" }),
          /* @__PURE__ */ l("div", { className: "text-xs text-slate-400 mb-2", children: [
            "Total: ",
            O.size,
            " bytes"
          ] })
        ] }),
        /* @__PURE__ */ r(we, { name: "rom", storage: O })
      ] }),
      /* @__PURE__ */ r("div", { className: "flex-col space-y-1 bg-background-light-3xl p-1", children: f && /* @__PURE__ */ r("div", { className: "rom-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1", children: f }) })
    ] })
  ] }) : /* @__PURE__ */ r(H, { children: "Loading ROM" });
}, Kt = () => /* @__PURE__ */ l(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 120 80",
    width: "120",
    height: "80",
    children: [
      /* @__PURE__ */ r("path", { d: "M10,10 L110,10 L110,70 L10,70 Z M70,0 Z", fill: "#1e293b", stroke: "#0f172a", strokeWidth: "1" }),
      /* @__PURE__ */ r("rect", { x: "40", y: "15", width: "40", height: "20", fill: "#60a5fa", opacity: "0.3", stroke: "#3b82f6", strokeWidth: "1" }),
      /* @__PURE__ */ l("g", { fill: "#ca8a04", children: [
        /* @__PURE__ */ r("path", { d: "M5,15 L10,15 L10,20 L5,20 Z" }),
        /* @__PURE__ */ r("path", { d: "M5,25 L10,25 L10,30 L5,30 Z" }),
        /* @__PURE__ */ r("path", { d: "M5,35 L10,35 L10,40 L5,40 Z" }),
        /* @__PURE__ */ r("path", { d: "M5,45 L10,45 L10,50 L5,50 Z" }),
        /* @__PURE__ */ r("path", { d: "M5,55 L10,55 L10,60 L5,60 Z" }),
        /* @__PURE__ */ r("path", { d: "M5,65 L10,65 L10,70 L5,70 Z" }),
        /* @__PURE__ */ r("path", { d: "M110,15 L115,15 L115,20 L110,20 Z" }),
        /* @__PURE__ */ r("path", { d: "M110,25 L115,25 L115,30 L110,30 Z" }),
        /* @__PURE__ */ r("path", { d: "M110,35 L115,35 L115,40 L110,40 Z" }),
        /* @__PURE__ */ r("path", { d: "M110,45 L115,45 L115,50 L110,50 Z" }),
        /* @__PURE__ */ r("path", { d: "M110,55 L115,55 L115,60 L110,60 Z" }),
        /* @__PURE__ */ r("path", { d: "M110,65 L115,65 L115,70 L110,70 Z" })
      ] }),
      /* @__PURE__ */ r("text", { x: "60", y: "50", textAnchor: "middle", fontSize: "8", fill: "#fbbf24", fontFamily: "monospace", children: "EPROM" }),
      /* @__PURE__ */ r("text", { x: "60", y: "60", textAnchor: "middle", fontSize: "6", fill: "#d1d5db", fontFamily: "monospace", children: "27C256" })
    ]
  }
), Ht = (g) => {
  const { data: t, open: n = !1, hidden: c = !1, size: a = 1 + s.RAM_END - s.RAM_START, children: u, onInstanceCreated: _ } = g, { memoryBusRef: d } = se(), [m, b] = I(null), [O, E] = I(/* @__PURE__ */ new Map()), [S, y] = I(n), [w, C] = I(null), [p, P] = I(!1), M = Q(null);
  K(() => {
    if (!d.current || d.current.ram || m) return;
    const A = setTimeout(() => {
      if (!d.current) return;
      const h = d.current.addRam(t, a);
      b(h), h.on("state", (F) => {
        F.storage && E(new Map(F.storage));
      }), h.emit("state", { storage: new Map(h.storage) });
    }, 100);
    return () => clearTimeout(A);
  }, [d.current]), K(() => {
    m && _ && _(m);
  }, [m, _]);
  const f = G.Children.map(u, (T) => {
    if (G.isValidElement(T)) {
      const A = T;
      switch (A.type) {
        default:
          return console.log("Invalid component mounted into Ram : null", A.type.name), null;
      }
    }
    return T;
  }), V = async (T) => {
    if (!d.current) return;
    if (!d.current.dma) {
      console.warn("Cannot load program in RAM. DMA not loaded.");
      return;
    }
    const A = d.current.motherboard.computer;
    if (!A) return;
    const h = await A.loadOsCode(T), F = s.OS_START;
    await d.current.dma.loadCodeInRam(h, F);
  }, R = async (T) => {
    if (!d.current) return;
    if (!d.current.dma) {
      console.warn("Cannot load program in RAM. DMA not loaded.");
      return;
    }
    const A = d.current.motherboard.computer;
    if (!A) return;
    const h = await A.loadProgramCode(T), F = s.PROGRAM_START;
    await d.current.dma.loadCodeInRam(h, F);
  };
  K(() => {
    if (M.current && w)
      return window.addEventListener("mousemove", x), window.addEventListener("mouseup", D), () => {
        window.removeEventListener("mousemove", x), window.removeEventListener("mouseup", D);
      };
  }, [w]);
  const L = () => {
    M.current && (M.current.style.position = "static", P(!1));
  }, k = (T) => {
    if (!M.current || T.button !== 0) return;
    const A = M.current.getBoundingClientRect(), h = T.clientX - A.left, F = T.clientY - A.top;
    C({ x: h, y: F }), document.body.classList.add("select-none");
  }, D = () => {
    M.current && (C(null), document.body.classList.remove("select-none"));
  }, x = (T) => {
    if (M.current && w) {
      const A = T.pageX - w.x, h = T.pageY - w.y, F = Math.abs(A - parseInt(M.current.style.left)), N = Math.abs(h - parseInt(M.current.style.top));
      if (F < 5 && N < 5) return;
      p || (M.current.style.position = "absolute", P(!0)), M.current.style.left = A + "px", M.current.style.top = h + "px";
    }
  };
  return m ? /* @__PURE__ */ l("div", { ref: M, className: `ram w-auto bg-cyan-900 p-1 rounded ${c ? "hidden" : ""}`, children: [
    /* @__PURE__ */ l("div", { className: "w-full flex bg-background-light-xl p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold cursor-move", onMouseDown: (T) => k(T), children: "RAM" }),
      /* @__PURE__ */ l("div", { className: "ms-auto ", children: [
        p && /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => L(),
            children: "⤴"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => y((T) => !T),
            children: S ? "-" : "+"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: `${S ? "hidden" : "flex"} flex justify-center p-1 min-w-[200px]`, children: /* @__PURE__ */ r(Te, {}) }),
    /* @__PURE__ */ l("div", { className: `${S ? "flex" : "hidden"} flex-col space-y-1 p-1 min-w-[350px]`, children: [
      /* @__PURE__ */ l("div", { className: "p-2 rounded bg-background-light-2xl", children: [
        /* @__PURE__ */ l("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ r("h3", { children: "RAM Storage" }),
          /* @__PURE__ */ l("div", { className: "text-xs text-slate-400 mb-2", children: [
            "Total: ",
            O.size,
            " bytes"
          ] })
        ] }),
        /* @__PURE__ */ r(we, { name: "ram", storage: O })
      ] }),
      /* @__PURE__ */ l("div", { className: "p-2 rounded bg-background-light-2xl flex gap-2", children: [
        /* @__PURE__ */ r(
          "button",
          {
            onClick: () => V("MINI_OS_V1"),
            className: "bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors",
            children: "Load OS v1"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            onClick: () => R("leds_test_2"),
            className: "bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ms-auto",
            children: "Load LEDs"
          }
        )
      ] }),
      /* @__PURE__ */ r("div", { className: "flex-col space-y-1 bg-background-light-3xl p-1", children: f && /* @__PURE__ */ r("div", { className: "ram-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1", children: f }) })
    ] })
  ] }) : /* @__PURE__ */ r(H, { children: "Loading RAM" });
}, Te = () => /* @__PURE__ */ l(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 160 60",
    width: "160",
    height: "60",
    children: [
      /* @__PURE__ */ r(
        "path",
        {
          d: "M10,10 L150,10 L150,50 L10,50 Z M95,0 Z",
          fill: "#2563eb",
          stroke: "#1d4ed8",
          strokeWidth: "1"
        }
      ),
      /* @__PURE__ */ l("g", { fill: "#ca8a04", children: [
        /* @__PURE__ */ r("path", { d: "M15,50 L20,50 L20,60 L15,60 Z" }),
        /* @__PURE__ */ r("path", { d: "M30,50 L35,50 L35,60 L30,60 Z" }),
        /* @__PURE__ */ r("path", { d: "M45,50 L50,50 L50,60 L45,60 Z" }),
        /* @__PURE__ */ r("path", { d: "M60,50 L65,50 L65,60 L60,60 Z" }),
        /* @__PURE__ */ r("path", { d: "M75,50 L80,50 L80,60 L75,60 Z" }),
        /* @__PURE__ */ r("path", { d: "M90,50 L95,50 L95,60 L90,60 Z" }),
        /* @__PURE__ */ r("path", { d: "M105,50 L110,50 L110,60 L105,60 Z" }),
        /* @__PURE__ */ r("path", { d: "M120,50 L125,50 L125,60 L120,60 Z" }),
        /* @__PURE__ */ r("path", { d: "M135,50 L140,50 L140,60 L135,60 Z" })
      ] }),
      /* @__PURE__ */ l("g", { fill: "#1e293b", children: [
        /* @__PURE__ */ r("path", { d: "M20,15 L40,15 L40,25 L20,25 Z" }),
        /* @__PURE__ */ r("path", { d: "M50,15 L70,15 L70,25 L50,25 Z" }),
        /* @__PURE__ */ r("path", { d: "M80,15 L100,15 L100,25 L80,25 Z" }),
        /* @__PURE__ */ r("path", { d: "M110,15 L130,15 L130,25 L110,25 Z" }),
        /* @__PURE__ */ r("path", { d: "M20,35 L40,35 L40,45 L20,45 Z" }),
        /* @__PURE__ */ r("path", { d: "M50,35 L70,35 L70,45 L50,45 Z" }),
        /* @__PURE__ */ r("path", { d: "M80,35 L100,35 L100,45 L80,45 Z" }),
        /* @__PURE__ */ r("path", { d: "M110,35 L130,35 L130,45 L110,45 Z" })
      ] })
    ]
  }
), Ut = (g) => {
  const { open: t = !1, hidden: n = !1, ioPort: c = null, children: a, onInstanceCreated: u } = g, { memoryBusRef: _ } = se(), [d, m] = I(null), [b, O] = I(t), [E, S] = I(null), [y, w] = I(!1), C = Q(null);
  K(() => {
    if (!_.current || _.current.dma || d) return;
    const L = setTimeout(() => {
      if (!_.current) return;
      const k = _.current.addDma(c);
      m(k), k.on("state", (D) => {
      });
    }, 100);
    return () => clearTimeout(L);
  }, [_.current]), K(() => {
    d && u && u(d);
  }, [d, u]);
  const p = G.Children.map(a, (R) => {
    if (G.isValidElement(R)) {
      const L = R;
      switch (L.type) {
        default:
          return console.log("Invalid component mounted into Dma : null", L.type.name), null;
      }
    }
    return R;
  });
  K(() => {
    if (C.current && E)
      return window.addEventListener("mousemove", V), window.addEventListener("mouseup", f), () => {
        window.removeEventListener("mousemove", V), window.removeEventListener("mouseup", f);
      };
  }, [E]);
  const P = () => {
    C.current && (C.current.style.position = "static", w(!1));
  }, M = (R) => {
    if (!C.current || R.button !== 0) return;
    const L = C.current.getBoundingClientRect(), k = R.clientX - L.left, D = R.clientY - L.top;
    S({ x: k, y: D }), document.body.classList.add("select-none");
  }, f = () => {
    C.current && (S(null), document.body.classList.remove("select-none"));
  }, V = (R) => {
    if (C.current && E) {
      y || (C.current.style.position = "absolute", w(!0));
      const L = R.pageX - E.x, k = R.pageY - E.y;
      C.current.style.left = L + "px", C.current.style.top = k + "px";
    }
  };
  return d ? /* @__PURE__ */ l("div", { ref: C, className: `dma w-auto ${n ? "hidden" : ""}`, children: [
    /* @__PURE__ */ l("div", { className: "w-full flex bg-background-light-xl p-2 rounded cursor-move", onMouseDown: (R) => M(R), children: [
      /* @__PURE__ */ r("h2", { className: "font-bold", children: "Direct Memory Access" }),
      (p == null ? void 0 : p.length) && /* @__PURE__ */ l("div", { className: "ms-auto ", children: [
        y && /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => P(),
            children: "⤴"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => O((R) => !R),
            children: b ? "-" : "+"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: `${b ? "hidden" : "flex"} flex justify-center bg-background-light-3xl p-1 min-w-[200px]`, children: /* @__PURE__ */ r($t, {}) }),
    /* @__PURE__ */ r("div", { className: `${b ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1 min-w-[350px]`, children: /* @__PURE__ */ r("div", { className: "flex-col space-y-1 bg-background-light-3xl p-1", children: p && /* @__PURE__ */ r("div", { className: "dma-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1", children: p }) }) })
  ] }) : /* @__PURE__ */ r(H, { children: "Loading DMA" });
}, $t = () => /* @__PURE__ */ l(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 100 100",
    width: "100",
    height: "100",
    children: [
      /* @__PURE__ */ r("rect", { x: "15", y: "15", width: "70", height: "70", rx: "3", fill: "#1e293b", stroke: "#0f172a", strokeWidth: "2" }),
      /* @__PURE__ */ r("rect", { x: "25", y: "25", width: "50", height: "50", rx: "2", fill: "#374151" }),
      /* @__PURE__ */ l("g", { fill: "#d97706", children: [
        /* @__PURE__ */ r("rect", { x: "20", y: "10", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "30", y: "10", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "40", y: "10", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "50", y: "10", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "60", y: "10", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "70", y: "10", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "20", y: "85", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "30", y: "85", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "40", y: "85", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "50", y: "85", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "60", y: "85", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "70", y: "85", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "10", y: "20", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "10", y: "30", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "10", y: "40", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "10", y: "50", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "10", y: "60", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "10", y: "70", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "85", y: "20", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "85", y: "30", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "85", y: "40", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "85", y: "50", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "85", y: "60", width: "5", height: "5" }),
        /* @__PURE__ */ r("rect", { x: "85", y: "70", width: "5", height: "5" })
      ] }),
      /* @__PURE__ */ r("circle", { cx: "18", cy: "18", r: "2", fill: "#fbbf24" }),
      /* @__PURE__ */ l("g", { stroke: "#60a5fa", strokeWidth: "0.5", fill: "none", children: [
        /* @__PURE__ */ r("path", { d: "M30,35 L45,35 L45,50 L60,50" }),
        /* @__PURE__ */ r("path", { d: "M40,40 L40,60 L55,60" }),
        /* @__PURE__ */ r("path", { d: "M50,30 L50,45 L65,45" })
      ] }),
      /* @__PURE__ */ r("text", { x: "50", y: "50", textAnchor: "middle", fontSize: "8", fill: "#f3f4f6", fontFamily: "monospace", children: "µC" })
    ]
  }
), Ve = (g) => {
  const { hidden: t, open: n = !0, children: c, onInstanceCreated: a } = g, { motherboardRef: u, memoryBusRef: _ } = se(), [d, m] = I(null), [b, O] = I(null), [E, S] = I(null), [y, w] = I(null), [C, p] = I(n), [P, M] = I(null), [f, V] = I(!1), R = Q(null);
  K(() => {
    if (!u.current || d) return;
    if (_.current) {
      m(_.current);
      return;
    }
    const v = setTimeout(() => {
      if (!u.current) return;
      const U = u.current.addMemoryBus();
      m(U), _.current = U, U.on("state", ($) => {
        console.log("MemoryBus state update", $);
      });
    }, 100);
    return () => clearTimeout(v);
  }, [u.current]), K(() => {
    d && a && a(d);
  }, [d, a]);
  const L = (N) => {
    d && O(N);
  }, k = (N) => {
    d && S(N);
  }, D = (N) => {
    d && w(N);
  }, x = G.Children.map(c, (N) => {
    if (G.isValidElement(N)) {
      const v = N;
      switch (v.type) {
        case Bt:
          return G.cloneElement(v, { onInstanceCreated: L });
        case Ht:
          return G.cloneElement(v, { onInstanceCreated: k });
        case Ut:
          return G.cloneElement(v, { onInstanceCreated: D });
        default:
          return console.log("Invalid component mounted into MemoryBus :", v.type.name), null;
      }
    }
    return N;
  });
  K(() => {
    if (R.current && P)
      return window.addEventListener("mousemove", F), window.addEventListener("mouseup", h), () => {
        window.removeEventListener("mousemove", F), window.removeEventListener("mouseup", h);
      };
  }, [P]);
  const T = () => {
    R.current && (R.current.style.position = "static", V(!1));
  }, A = (N) => {
    if (!R.current || N.button !== 0) return;
    const v = R.current.getBoundingClientRect(), U = N.clientX - v.left, $ = N.clientY - v.top;
    M({ x: U, y: $ }), document.body.classList.add("select-none");
  }, h = () => {
    R.current && (M(null), document.body.classList.remove("select-none"));
  }, F = (N) => {
    if (R.current && P) {
      f || (R.current.style.position = "absolute", V(!0));
      const v = N.pageX - P.x, U = N.pageY - P.y;
      R.current.style.left = v + "px", R.current.style.top = U + "px";
    }
  };
  return d ? /* @__PURE__ */ l("div", { ref: R, className: `memory-bus w-auto max-w-[30vw] bg-slate-800 p-1 rounded ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ l("div", { className: "flex bg-background-light p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold cursor-move", onMouseDown: (N) => A(N), children: "Memory" }),
      x && /* @__PURE__ */ l("div", { className: "ms-auto flex gap-2", children: [
        f && /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => T(),
            children: "⤴"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => p((N) => !N),
            children: C ? "-" : "+"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: `${C ? "flex" : "hidden"} flex-col mt-2 space-y-2`, children: x && /* @__PURE__ */ r("div", { className: "memory-bus-children flex flex-col gap-2", children: x }) })
  ] }) : /* @__PURE__ */ r(H, { children: "Loading Memory" });
}, hs = Ve, Ie = /* @__PURE__ */ new Map(), Gt = (g, t, n, c, a) => {
  let u = `${g}-${JSON.stringify(a)}`, _ = Ie.get(u);
  const d = 1e3 / c;
  _ || (_ = { timer: null, requestDate: null, waiting: !1 }, Ie.set(u, _)), _.timer !== null && (clearTimeout(_.timer), _.timer = null), _.waiting && _.requestDate && Date.now() - _.requestDate > 1e3 / d ? (t(...a), _.waiting = !1) : (_.waiting || (_.requestDate = Date.now(), _.waiting = !0), _.timer = setTimeout(() => {
    t(...a), _ && (_.waiting = !1);
  }, n));
}, zt = [
  { label: "0.1 Hz", value: 0.1 },
  { label: "0.5 Hz", value: 0.5 },
  { label: "1 Hz (default)", value: 1 },
  { label: "2 Hz", value: 2 },
  { label: "5 Hz", value: 5 },
  { label: "10 Hz", value: 10 },
  { label: "20 Hz", value: 20 },
  { label: "50 Hz", value: 50 },
  { label: "100 Hz", value: 100 },
  { label: "150 Hz", value: 150 },
  { label: "200 Hz", value: 200 },
  { label: "300 Hz", value: 300 },
  { label: "500 Hz", value: 500 },
  { label: "1 KHz", value: 1e3 }
], Zt = (g) => {
  const { hidden: t = !1, open: n = !1, frequency: c, children: a, onInstanceCreated: u } = g, { motherboardRef: _ } = se(), [d, m] = I(null), [b, O] = I(n), [E, S] = I(null), [y, w] = I(!1), C = Q(null), [p, P] = I(!0), [M, f] = I(0), [V, R] = I(c), [L, k] = I(0), [D, x] = I(null), [T, A] = I(0);
  K(() => {
    if (!_.current || _.current.clock) return;
    const z = setTimeout(() => {
      if (!_.current) return;
      const j = _.current.addClock(c ?? 1);
      m(j), j.on("state", (W) => {
        j && (W.clockFrequency !== void 0 && R(W.clockFrequency), W.status !== void 0 && P(!W.status));
      }), j.on("tick", ({ cycle: W }) => {
        Gt("clock-cycle", (ae) => {
          f(ae);
        }, 100, 500, [W]);
      }), j.emit("state", {
        clockFrequency: j.clockFrequency
      });
    }, 100);
    return () => clearTimeout(z);
  }, [_.current]), K(() => {
    d && u && u(d);
  }, [d, u]), K(() => {
    const B = setInterval(() => {
      A((z) => z + 1);
    }, 100);
    return () => {
      clearInterval(B);
    };
  }, []), K(() => {
    (() => {
      const z = Date.now() / 1e3, j = M;
      if (D) {
        const W = z - D.timestamp;
        if (W < 1) return;
        const ae = D.cycles, he = j - ae, Ae = W ? he / W : 0;
        k(Ae);
      } else
        k(0);
      x({ timestamp: z, cycles: j });
    })();
  }, [T]);
  const h = (B) => {
    d && (d.clockFrequency = B, d.status && d.restart(), d.emit("state", { clockFrequency: B }));
  }, F = () => {
    d && (console.log(`runStep cycle #${d.clockCycles + 1}`), d.tick());
  }, N = () => {
    d && (console.log(`runLoop cycle #${d.clockCycles + 1}`), d.status ? d.stop() : d.start());
  };
  K(() => {
    if (C.current && E)
      return window.addEventListener("mousemove", X), window.addEventListener("mouseup", $), () => {
        window.removeEventListener("mousemove", X), window.removeEventListener("mouseup", $);
      };
  }, [E]);
  const v = () => {
    C.current && (C.current.style.position = "static", w(!1));
  }, U = (B) => {
    if (!C.current || B.button !== 0) return;
    const z = C.current.getBoundingClientRect(), j = B.clientX - z.left, W = B.clientY - z.top;
    S({ x: j, y: W }), document.body.classList.add("select-none");
  }, $ = () => {
    C.current && (S(null), document.body.classList.remove("select-none"));
  }, X = (B) => {
    if (C.current && E) {
      y || (C.current.style.position = "absolute", w(!0));
      const z = B.pageX - E.x, j = B.pageY - E.y;
      C.current.style.left = z + "px", C.current.style.top = j + "px";
    }
  };
  return d ? /* @__PURE__ */ l("div", { ref: C, className: `clock w-auto rounded bg-violet-950 p-1 ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ l("div", { className: "w-full flex bg-background-light p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold cursor-move", onMouseDown: (B) => U(B), children: "Clock" }),
      /* @__PURE__ */ l("div", { className: "ms-auto flex gap-2", children: [
        y && /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => v(),
            children: "⤴"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => O((B) => !B),
            children: b ? "-" : "+"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: `${b ? "hidden" : "flex"} flex justify-center p-1 min-w-[200px]`, children: /* @__PURE__ */ r(xe, {}) }),
    /* @__PURE__ */ l("div", { className: `${b ? "flex" : "hidden"} flex-col space-y-2 p-1 min-w-[200px]`, children: [
      /* @__PURE__ */ l("div", { className: "p-2 rounded bg-background-light-2xl flex gap-2", children: [
        /* @__PURE__ */ r(
          "button",
          {
            disabled: !p,
            onClick: () => F(),
            className: "bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ms-auto",
            children: "⏭ Step"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            disabled: !1,
            onClick: () => N(),
            className: `disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ${p ? "bg-blue-900 hover:bg-blue-700" : "bg-green-900 hover:bg-green-700"}`,
            children: p ? "▶ Start" : "⏸ Pause"
          }
        )
      ] }),
      /* @__PURE__ */ l("div", { className: "flex flex-col items-center gap-2 px-1", children: [
        /* @__PURE__ */ r("label", { className: "text-sm font-medium text-slate-300", children: "Freq.:" }),
        /* @__PURE__ */ r(
          "select",
          {
            value: V,
            onChange: (B) => h(Number(B.target.value)),
            className: "bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm",
            disabled: !1,
            children: zt.map(({ label: B, value: z }) => /* @__PURE__ */ r("option", { value: z, children: B }, z))
          }
        )
      ] }),
      /* @__PURE__ */ l("div", { className: "", children: [
        "Current: ",
        L.toFixed(1),
        " Hz"
      ] }),
      /* @__PURE__ */ l("div", { className: "", children: [
        "Clock Cycle: ",
        M
      ] }),
      /* @__PURE__ */ r("div", { children: a })
    ] })
  ] }) : /* @__PURE__ */ r(H, { children: "Loading Clock" });
}, xe = () => /* @__PURE__ */ l(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 100 60",
    width: "100",
    height: "60",
    children: [
      /* @__PURE__ */ r("rect", { x: "20", y: "10", width: "60", height: "40", rx: "3", fill: "#1f2937", stroke: "#374151", strokeWidth: "1" }),
      /* @__PURE__ */ r("rect", { x: "20", y: "10", width: "60", height: "8", fill: "#9ca3af" }),
      /* @__PURE__ */ r("rect", { x: "20", y: "42", width: "60", height: "8", fill: "#9ca3af" }),
      /* @__PURE__ */ r("text", { x: "50", y: "35", textAnchor: "middle", fontSize: "7", fill: "#f3f4f6", fontFamily: "monospace", children: "16.000 MHz" }),
      /* @__PURE__ */ l("g", { fill: "#6b7280", children: [
        /* @__PURE__ */ r("rect", { x: "15", y: "15", width: "5", height: "10", rx: "1" }),
        /* @__PURE__ */ r("rect", { x: "15", y: "35", width: "5", height: "10", rx: "1" }),
        /* @__PURE__ */ r("rect", { x: "80", y: "15", width: "5", height: "10", rx: "1" }),
        /* @__PURE__ */ r("rect", { x: "80", y: "35", width: "5", height: "10", rx: "1" })
      ] }),
      /* @__PURE__ */ r("path", { d: "M40,25 Q45,20 50,25 Q55,30 60,25", stroke: "#60a5fa", strokeWidth: "1.5", fill: "none" }),
      /* @__PURE__ */ r("circle", { cx: "50", cy: "25", r: "2", fill: "#60a5fa" })
    ]
  }
), Jt = (g) => {
  const { hidden: t, children: n, onInstanceCreated: c } = g, { motherboardRef: a } = se(), [u, _] = I(null), [d, m] = I(!1), [b, O] = I(null), [E, S] = I(!1), y = Q(null);
  K(() => {
    if (!a || u) return;
    const f = setTimeout(() => {
      if (!a.current) return;
      const V = a.current.addPowerSupply();
      _(V), V.on("state", (R) => {
      });
    }, 100);
    return () => clearTimeout(f);
  }, [a.current]), K(() => {
    u && c && c(u);
  }, [u, c]), K(() => {
    if (y.current && b)
      return window.addEventListener("mousemove", P), window.addEventListener("mouseup", p), () => {
        window.removeEventListener("mousemove", P), window.removeEventListener("mouseup", p);
      };
  }, [b]);
  const w = () => {
    y.current && (y.current.style.position = "static", S(!1));
  }, C = (M) => {
    if (!y.current || M.button !== 0) return;
    const f = y.current.getBoundingClientRect(), V = M.clientX - f.left, R = M.clientY - f.top;
    O({ x: V, y: R }), document.body.classList.add("select-none");
  }, p = () => {
    y.current && (O(null), document.body.classList.remove("select-none"));
  }, P = (M) => {
    if (y.current && b) {
      E || (y.current.style.position = "absolute", S(!0));
      const f = M.pageX - b.x, V = M.pageY - b.y;
      y.current.style.left = f + "px", y.current.style.top = V + "px";
    }
  };
  return u ? /* @__PURE__ */ l("div", { ref: y, className: `power-supply w-auto rounded bg-yellow-600 p-1 ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ l("div", { className: "w-full flex bg-background-light p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold cursor-move", onMouseDown: (M) => C(M), children: "Power Supply" }),
      /* @__PURE__ */ l("div", { className: "ms-auto flex gap-2", children: [
        E && /* @__PURE__ */ r(
          "button",
          {
            className: "cursor-pointer px-3 bg-background-light-xl rounded",
            onClick: () => w(),
            children: "⤴"
          }
        ),
        !1
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: `${d ? "hidden" : "flex"} flex justify-center p-1 min-w-[200px]` }),
    /* @__PURE__ */ r("div", { className: `${d ? "flex" : "hidden"} flex-col space-y-2 mt-2 min-w-[200px]`, children: n && /* @__PURE__ */ r("div", { className: "power-supply-children p-1 ps-2 grid grid-cols-1 space-x-2 space-y-2", children: n }) })
  ] }) : /* @__PURE__ */ r(H, { children: "Loading Power Supply" });
}, Yt = (g) => {
  const { hidden: t, children: n, onInstanceCreated: c } = g, { computerRef: a, motherboardRef: u } = se(), [_, d] = I(null), [m, b] = I(/* @__PURE__ */ new Map()), [O, E] = I(null), [S, y] = I(null), [w, C] = I(null), [p, P] = I(null), [M, f] = I(!0);
  K(() => {
    if (!a) return;
    if (u.current) {
      d(u.current);
      return;
    }
    const U = setTimeout(() => {
      if (!a.current) return;
      const $ = a.current.addMotherboard();
      d($), u.current = $, $.on("state", (X) => {
      });
    }, 100);
    return () => clearTimeout(U);
  }, [a.current]), K(() => {
    _ && c && c(_);
  }, [_, c]);
  const V = (v, U = 0) => {
    _ && (m.get(v.idx) || b(($) => new Map($).set(v.idx, v)));
  }, R = (v) => {
    _ && (w || C(v));
  }, L = (v) => {
    p || P(v);
  }, k = (v) => {
    _ && (O || E(v));
  }, D = (v) => {
    _ && (S || y(v));
  }, x = [], T = [], A = [], h = [], F = [], N = G.Children.map(n, (v, U) => {
    if (G.isValidElement(v)) {
      const $ = v;
      switch ($.type) {
        case Jt: {
          const X = `${$.type.name}-${U}`, B = G.cloneElement($, { onInstanceCreated: L, key: X });
          return x.push(B), null;
        }
        case Ft: {
          const X = `${$.type.name}-${U}`, B = G.cloneElement($, { onInstanceCreated: V, key: X });
          return T.push(B), null;
        }
        case Zt: {
          const X = `${$.type.name}-${U}`, B = G.cloneElement($, { onInstanceCreated: R, key: X });
          return A.push(B), null;
        }
        case Ve: {
          const X = `${$.type.name}-${U}`, B = G.cloneElement($, { onInstanceCreated: k, key: X });
          return h.push(B), null;
        }
        case _e: {
          const X = `${$.type.name}-${U}`, B = G.cloneElement($, { onInstanceCreated: D, key: X, internal: !0 });
          return F.push(B), null;
        }
        default:
          return console.log("Invalid component mounted into Motherboard : null", $.type.name), null;
      }
    }
    return v;
  });
  return /* @__PURE__ */ l("div", { className: `motherboard w-auto bg-lime-900 p-1 ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ l("div", { className: "flex bg-background-light p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold", children: "Motherboard" }),
      N && /* @__PURE__ */ r(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => f((v) => !v),
          children: M ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ r("div", { className: `${M ? "flex" : "hidden"} flex-col space-y-2 mt-2`, children: /* @__PURE__ */ l("div", { className: "motherboard-children flex space-x-1 space-y-1", children: [
      /* @__PURE__ */ l("div", { className: "motherboard-known-children grid grid-cols-3 w-full space-x-4", children: [
        /* @__PURE__ */ l("div", { className: "motherboard-cpu-and-clock space-y-4", children: [
          /* @__PURE__ */ l("div", { className: "computer-power-supply", children: [
            x.length > 0 && /* @__PURE__ */ r(H, { children: x }),
            x.length === 0 && /* @__PURE__ */ r(H, { children: /* @__PURE__ */ l("div", { className: "bg-background-light-2xl m-auto w-96 h-32 border border-dashed border-foreground-light-xl flex flex-col justify-center items-center", children: [
              /* @__PURE__ */ l("i", { children: [
                "Insert ",
                /* @__PURE__ */ r("strong", { children: "Power Supply" }),
                " here"
              ] }),
              /* @__PURE__ */ r("pre", { className: "m-2", children: "<PowerSupply />" })
            ] }) })
          ] }),
          /* @__PURE__ */ l("div", { className: "motherboard-clock", children: [
            A.length > 0 && /* @__PURE__ */ r(H, { children: A }),
            A.length === 0 && /* @__PURE__ */ r(H, { children: /* @__PURE__ */ l("div", { className: "bg-background-light-2xl m-auto w-96 h-48 border border-dashed border-foreground-light-xl flex flex-col justify-center items-center", children: [
              /* @__PURE__ */ l("i", { children: [
                "Insert ",
                /* @__PURE__ */ r("strong", { children: "Clock" }),
                " here"
              ] }),
              /* @__PURE__ */ r("pre", { className: "m-2", children: "<Clock />" }),
              /* @__PURE__ */ r(xe, {})
            ] }) })
          ] }),
          /* @__PURE__ */ l("div", { className: "motherboard-cpu", children: [
            T.length > 0 && /* @__PURE__ */ r("div", { className: "min-w-96 min-h-[200px] h-full justify-center flex flex-col gap-4", children: T }),
            T.length === 0 && /* @__PURE__ */ r(H, { children: /* @__PURE__ */ l("div", { className: "bg-background-light-2xl m-auto w-96 h-full min-h-96 flex flex-col justify-center border border-foreground-light-xl items-center border-dashed", children: [
              /* @__PURE__ */ l("i", { children: [
                "Insert ",
                /* @__PURE__ */ r("strong", { children: "CPU" }),
                " here"
              ] }),
              /* @__PURE__ */ r("pre", { className: "m-2", children: "<Cpu />" }),
              /* @__PURE__ */ r(ye, {})
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ l("div", { className: "motherboard-memorybus", children: [
          h.length > 0 && /* @__PURE__ */ r(H, { children: h }),
          h.length === 0 && /* @__PURE__ */ r(H, { children: /* @__PURE__ */ l("div", { className: "bg-background-light-2xl w-96 h-[600px] border border-dashed border-foreground-light-xl flex flex-col justify-center items-center", children: [
            /* @__PURE__ */ l("i", { children: [
              "Insert ",
              /* @__PURE__ */ r("strong", { children: "Memory" }),
              " here"
            ] }),
            /* @__PURE__ */ r("pre", { className: "m-2", children: "<Memory />" }),
            /* @__PURE__ */ r(Te, {})
          ] }) })
        ] }),
        /* @__PURE__ */ l("div", { className: "motherboard-device-manager max-w-[30vw]", children: [
          F.length > 0 && /* @__PURE__ */ r(H, { children: F }),
          F.length === 0 && /* @__PURE__ */ r(H, { children: /* @__PURE__ */ l("div", { className: "bg-background-light-2xl w-96 h-[600px] border border-dashed border-foreground-light-xl flex flex-col justify-center items-center", children: [
            /* @__PURE__ */ l("i", { children: [
              "Insert ",
              /* @__PURE__ */ r("strong", { children: "Internal Devices" }),
              " here"
            ] }),
            /* @__PURE__ */ r("pre", { className: "m-2", children: "<InternalDevices />" })
          ] }) })
        ] })
      ] }),
      N && /* @__PURE__ */ r("div", { className: "motherboard-other-children", children: N })
    ] }) })
  ] });
}, Xt = (g) => {
  const { view: t = "open_advanced", children: n } = g, { computerRef: c } = se(), [a, u] = I(null), [_, d] = I(null), [m, b] = I(null), [O, E] = I(t !== "closed"), [S, y] = I(null), [w, C] = I(null), [p, P] = I(t), [M, f] = I(!1);
  K(() => {
    if (c.current) {
      u(c.current);
      return;
    }
    const F = setTimeout(() => {
      const N = new ft();
      u(N), c.current = N, N.on("state", (v) => {
        v.loadedOs !== void 0 && y(v.loadedOs), v.loadedProgram !== void 0 && C(v.loadedProgram);
      });
    }, 100);
    return () => clearTimeout(F);
  }, []);
  const V = (h) => {
    _ || (d(h), h.on("clock-mounted", () => {
      h.clock && h.clock.on("state", (F) => {
        F.status !== void 0 && f(F.status);
      });
    }));
  }, R = (h) => {
    m || b(h);
  }, L = () => {
    P("open_advanced");
  }, k = () => {
    _ != null && _.clock && (_.clock.status ? _.clock.stop() : _.clock.start());
  }, D = () => {
    a && a.reset();
  }, x = [], T = [], A = G.Children.map(n, (h, F) => {
    if (G.isValidElement(h)) {
      const N = h;
      switch (N.type) {
        case Yt: {
          const v = `${N.type.name}-${F}`, U = G.cloneElement(N, { onInstanceCreated: V, key: v });
          return x.push(U), null;
        }
        case _e: {
          const v = `${N.type.name}-${F}`, U = G.cloneElement(N, { onInstanceCreated: R, key: v });
          return T.push(U), null;
        }
        default:
          return N;
      }
    }
    return h;
  });
  return a ? p === "open_simple" ? /* @__PURE__ */ r("div", { className: "computer", children: /* @__PURE__ */ r(
    qt,
    {
      powerOn: !0,
      onOpenCase: L,
      onPower: k
    }
  ) }) : /* @__PURE__ */ l("div", { className: `computer w-auto m-2 bg-stone-700 p-1 rounded ${p === "hidden" ? "hidden" : ""}`, children: [
    /* @__PURE__ */ l("div", { className: "w-full flex bg-background-light p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold", children: "Computer" }),
      /* @__PURE__ */ r(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => E((h) => !h),
          children: O ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ l("div", { className: `${O ? "flex" : "hidden"} flex-col space-y-2 p-1`, children: [
      /* @__PURE__ */ l("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ r("div", { className: "p-2 rounded bg-background-light-2xl flex gap-2", children: /* @__PURE__ */ r(
          "button",
          {
            onClick: () => k(),
            className: `disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ${M ? "bg-green-900 hover:bg-green-700" : "bg-blue-900 hover:bg-blue-700"}`,
            children: "⏻ Power"
          }
        ) }),
        /* @__PURE__ */ r(
          jt,
          {
            loadedProgram: w,
            loadedOs: S,
            devicesManagerInstance: m,
            computerInstance: a,
            setLoadedOs: y,
            setLoadedProgram: C
          }
        ),
        /* @__PURE__ */ r("div", { className: "p-2 rounded bg-background-light-2xl flex gap-2", children: /* @__PURE__ */ r(
          "button",
          {
            onClick: () => D(),
            className: "bg-red-900 hover:bg-red-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors",
            children: "⟳ Reset"
          }
        ) })
      ] }),
      /* @__PURE__ */ l("div", { className: "computer-children flex flex-col space-y-4 w-full", children: [
        /* @__PURE__ */ l("div", { className: `computer-known-children w-full flex space-y-4 ${x.length && x.length ? "flex-col" : ""}`, children: [
          /* @__PURE__ */ l("div", { className: "computer-motherboard w-full", children: [
            x.length > 0 && /* @__PURE__ */ r(H, { children: x }),
            x.length === 0 && /* @__PURE__ */ r(H, { children: /* @__PURE__ */ l("div", { className: "bg-background-light-2xl m-auto w-96 h-[600px] border border-dashed border-foreground-light-xl flex flex-col justify-center items-center", children: [
              /* @__PURE__ */ l("i", { children: [
                "Insert ",
                /* @__PURE__ */ r("strong", { children: "Motherboard" }),
                " here"
              ] }),
              /* @__PURE__ */ r("pre", { className: "m-2", children: "<Motherboard />" })
            ] }) })
          ] }),
          /* @__PURE__ */ l("div", { className: "computer-devices-manager w-full", children: [
            T.length > 0 && /* @__PURE__ */ r(H, { children: T }),
            T.length === 0 && /* @__PURE__ */ r(H, { children: /* @__PURE__ */ l("div", { className: "bg-background-light-2xl m-auto w-96 h-[600px] border border-dashed border-foreground-light-xl flex flex-col justify-center items-center", children: [
              /* @__PURE__ */ l("i", { children: [
                "Insert ",
                /* @__PURE__ */ r("strong", { children: "External Devices" }),
                " here"
              ] }),
              /* @__PURE__ */ r("pre", { className: "m-2", children: "<ExternalDevices />" })
            ] }) })
          ] })
        ] }),
        A && /* @__PURE__ */ r("div", { className: "computer-other-children space-y-4", children: A })
      ] })
    ] })
  ] }) : /* @__PURE__ */ r(H, { children: "Loading Computer" });
}, jt = (g) => {
  const { loadedOs: t, loadedProgram: n } = g, { setLoadedProgram: c, setLoadedOs: a } = g, { devicesManagerRef: u, computerRef: _ } = se();
  u.current;
  const d = _.current, [m, b] = I(null), [O, E] = I(null), S = !1, y = !1, w = oe(async (M) => {
    d && d.loadOs(M);
  }, [d]), C = oe(() => {
    d && d.unloadOs();
  }, [d]), p = oe(async (M) => {
    d && d.loadProgram(M);
  }, [d]), P = oe(() => {
    d && d.unloadProgram();
  }, [d]);
  return /* @__PURE__ */ r(H, { children: /* @__PURE__ */ l("div", { className: "p-2 rounded bg-background-light-2xl flex gap-2 ", children: [
    /* @__PURE__ */ l("div", { className: "w-5/12 bg-background-light-xl px-2 py-1 rounded flex gap-2 items-center", children: [
      /* @__PURE__ */ r("div", { children: "Main OS:" }),
      /* @__PURE__ */ l("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ l(
          "select",
          {
            value: m ?? "",
            onChange: (M) => b(M.target.value || null),
            className: "w-full bg-background-light border border-slate-600 rounded px-4 py-2 text-white",
            children: [
              /* @__PURE__ */ r("option", { value: "", children: "None" }, "none"),
              Object.entries(De).map(([M, f]) => /* @__PURE__ */ l("option", { value: M, children: [
                M === t && !S ? "* " : "",
                f.name,
                " - ",
                f.description
              ] }, M))
            ]
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            onClick: () => {
              w(m ?? "");
            },
            disabled: !m,
            className: `disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ${t && t === m && !S ? "bg-yellow-900 hover:bg-yellow-700" : "bg-blue-900 hover:bg-blue-700"}`,
            children: t && t === m && !S ? "Reload" : "Load"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            onClick: () => {
              C();
            },
            disabled: !t || S,
            className: "ms-auto bg-purple-900 hover:bg-purple-900 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors",
            children: "Unload"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ l("div", { className: "w-5/12 bg-background-light-xl px-2 py-1 rounded flex gap-2 items-center", children: [
      /* @__PURE__ */ r("div", { children: "Program:" }),
      /* @__PURE__ */ l("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ l(
          "select",
          {
            value: O ?? "",
            onChange: (M) => E(M.target.value || null),
            className: "w-full bg-background-light border border-slate-600 rounded px-4 py-2 text-white",
            children: [
              /* @__PURE__ */ r("option", { value: "", children: "None" }, "none"),
              Object.entries(Ce).map(([M, f]) => /* @__PURE__ */ l("option", { value: M, children: [
                M === n && !y ? "* " : "",
                f.name,
                " - ",
                f.description
              ] }, M))
            ]
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            onClick: () => {
              p(O ?? "");
            },
            disabled: !O,
            className: `disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors ${n && n === O && !y ? "bg-yellow-900 hover:bg-yellow-700" : "bg-blue-900 hover:bg-blue-700"}`,
            children: n && n === O && !y ? "Reload" : "Load"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            onClick: () => {
              P();
            },
            disabled: !n || y,
            className: "ms-auto bg-purple-900 hover:bg-purple-900 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors",
            children: "Unload"
          }
        )
      ] })
    ] })
  ] }) });
}, qt = ({
  powerOn: g = !1,
  onOpenCase: t,
  onPower: n
}) => {
  const [c, a] = I(!1);
  return /* @__PURE__ */ l("div", { className: "flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-slate-900 to-slate-950 p-8", children: [
    /* @__PURE__ */ l("div", { className: "relative", children: [
      /* @__PURE__ */ l("div", { className: "w-64 h-96 bg-linear-to-br from-slate-700 to-slate-800 rounded-lg border-4 border-slate-600 shadow-2xl relative", children: [
        /* @__PURE__ */ r("div", { className: "absolute inset-0 bg-linear-to-b from-slate-600/20 to-transparent rounded-lg" }),
        /* @__PURE__ */ r("div", { className: "absolute top-4 left-8 right-8 h-8 bg-slate-900/50 rounded grid grid-cols-8 gap-1 p-1", children: Array.from({ length: 8 }).map((u, _) => /* @__PURE__ */ r("div", { className: "bg-slate-950 rounded-sm" }, _)) }),
        /* @__PURE__ */ l("div", { className: "absolute top-20 left-8 flex items-center gap-3", children: [
          /* @__PURE__ */ r("div", { className: `w-3 h-3 rounded-full transition-all duration-300 ${g ? "bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse" : "bg-slate-800"}` }),
          /* @__PURE__ */ r("span", { className: "text-xs text-slate-400 font-mono", children: "POWER" })
        ] }),
        /* @__PURE__ */ l("div", { className: "absolute top-28 left-8 flex items-center gap-3", children: [
          /* @__PURE__ */ r("div", { className: `w-3 h-3 rounded-full transition-all duration-100 ${g ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" : "bg-slate-800"}` }),
          /* @__PURE__ */ r("span", { className: "text-xs text-slate-400 font-mono", children: "HDD" })
        ] }),
        /* @__PURE__ */ r("div", { className: "absolute top-44 left-8 right-8 h-12 bg-slate-950 border border-slate-700 rounded flex items-center justify-center", children: /* @__PURE__ */ r("div", { className: "w-3/4 h-1 bg-slate-800 rounded" }) }),
        /* @__PURE__ */ r("div", { className: "absolute top-60 left-8 right-8 h-12 bg-slate-950 border border-slate-700 rounded flex items-center justify-center", children: /* @__PURE__ */ r("div", { className: "w-3/4 h-1 bg-slate-800 rounded" }) }),
        /* @__PURE__ */ r(
          "div",
          {
            className: "absolute bottom-8 left-8 w-12 h-12 bg-slate-900 border-2 border-slate-600 rounded-full flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors",
            onClick: () => {
              n && n();
            },
            children: /* @__PURE__ */ r("div", { className: "w-6 h-6 border-2 border-slate-500 rounded-full relative", children: /* @__PURE__ */ r("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-slate-500" }) })
          }
        ),
        /* @__PURE__ */ r("div", { className: "absolute bottom-8 left-24 w-8 h-8 bg-slate-900 border-2 border-slate-600 rounded-full flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors", children: /* @__PURE__ */ r("svg", { className: "w-4 h-4 text-slate-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ r("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }) }),
        /* @__PURE__ */ r("div", { className: "absolute top-8 right-2 w-2 h-2 bg-slate-500 rounded-full" }),
        /* @__PURE__ */ r("div", { className: "absolute top-24 right-2 w-2 h-2 bg-slate-500 rounded-full" }),
        /* @__PURE__ */ r("div", { className: "absolute bottom-24 right-2 w-2 h-2 bg-slate-500 rounded-full" }),
        /* @__PURE__ */ r("div", { className: "absolute bottom-8 right-2 w-2 h-2 bg-slate-500 rounded-full" }),
        /* @__PURE__ */ r("div", { className: "absolute bottom-4 left-8 right-8 h-8 bg-slate-900/50 rounded grid grid-cols-8 gap-1 p-1", children: Array.from({ length: 8 }).map((u, _) => /* @__PURE__ */ r("div", { className: "bg-slate-950 rounded-sm" }, _)) })
      ] }),
      /* @__PURE__ */ r("div", { className: "absolute -bottom-2 left-8 w-4 h-4 bg-slate-700 rounded-sm" }),
      /* @__PURE__ */ r("div", { className: "absolute -bottom-2 right-8 w-4 h-4 bg-slate-700 rounded-sm" })
    ] }),
    /* @__PURE__ */ l(
      "button",
      {
        onClick: t,
        onMouseEnter: () => a(!0),
        onMouseLeave: () => a(!1),
        className: "mt-12 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-3 group",
        children: [
          /* @__PURE__ */ l(
            "svg",
            {
              className: "w-6 h-6 transition-transform group-hover:rotate-12",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: [
                /* @__PURE__ */ r("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }),
                /* @__PURE__ */ r("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
              ]
            }
          ),
          "OPEN CASE"
        ]
      }
    ),
    /* @__PURE__ */ r("p", { className: "mt-6 text-slate-500 font-mono text-sm", children: "Click to access internal components" })
  ] });
}, Ne = ke(void 0), As = ({ view: g = "open_advanced", children: t }) => {
  const n = Q(null), c = Q(null), a = Q(null), u = Q(null), _ = {
    computerRef: n,
    motherboardRef: c,
    memoryBusRef: a,
    devicesManagerRef: u
  };
  return /* @__PURE__ */ r(Ne.Provider, { value: _, children: /* @__PURE__ */ r(Xt, { view: g, children: t }) });
};
function se() {
  const g = Fe(Ne);
  if (g === void 0)
    throw new Error("useComputer must be used within a Computer");
  return g;
}
export {
  Zt as C,
  Ut as D,
  te as E,
  us as I,
  hs as M,
  Jt as P,
  Ht as R,
  As as a,
  Ft as b,
  _s as c,
  Pt as d,
  Yt as e,
  Bt as f,
  se as u
};
