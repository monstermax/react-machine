import { jsxs as o, jsx as r, Fragment as $ } from "react/jsx-runtime";
import P, { useState as u, useMemo as ie, useEffect as T, useCallback as G, useRef as oe } from "react";
import { E as L, u as ae } from "./ComputerContext-Byayu7Qq.js";
import { U as l, a as c, h as Q, l as ee, c as le, d as ce } from "./asm_compiler-CK23_zXK.js";
let de = class extends L {
  constructor(t, e = null) {
    super(), this.lastChar = 0, this.hasChar = !1, this.isEnable = !0, this.irqEnabled = !1, this.id = Math.round(Math.random() * 999999999), this.name = t, this.type = "Input", this.ioPort = e ?? 0, this.start();
  }
  // Écouter les touches du clavier
  start() {
    const t = (e) => {
      var i;
      if (!this.isEnable || e.ctrlKey || e.altKey || e.metaKey || ((i = e.key) == null ? void 0 : i.length) !== 1) return;
      const s = e.key.charCodeAt(0);
      s > 127 || (this.lastChar = s, this.hasChar = !0, this.emit("state", { lastChar: this.lastChar, hasChar: this.hasChar }), console.log(`⌨️  Key pressed: '${e.key}' (ASCII: ${s})`));
    };
    window.addEventListener("keydown", t);
  }
  // Device IO interface
  read(t) {
    switch (t) {
      case 0:
        return this.lastChar;
      case 1:
        return (this.hasChar ? 1 : 0) | (this.irqEnabled ? 2 : 0);
      default:
        return 0;
    }
  }
  write(t, e) {
    switch (t) {
      case 0:
        this.lastChar = 0, this.hasChar = !1, this.emit("state", { lastChar: this.lastChar, hasChar: this.hasChar });
        break;
      case 1:
        e & 1 || (this.hasChar = !1, this.emit("state", { hasChar: this.hasChar })), this.irqEnabled = (e & 2) !== 0;
        break;
    }
  }
  reset() {
    this.lastChar = 0, this.hasChar = !1, this.irqEnabled = !1, this.emit("state", { lastChar: this.lastChar, hasChar: this.hasChar });
  }
  // Fonction pour simuler une touche (pour testing)
  simulateKeyPress(t) {
    if (t.length !== 1) return;
    const e = t.charCodeAt(0);
    e > 127 || (this.lastChar = e, this.hasChar = !0, this.emit("state", { lastChar: this.lastChar, hasChar: this.hasChar }));
  }
};
const F = 256, H = 256, W = 16, Z = 64, X = 8, re = 0, ne = 1, q = 2, te = 18, V = {
  READ: 4,
  // 4 - Lecture
  WRITE: 2,
  // 2 - Écriture  
  EXECUTE: 1
  // 1 - Exécution
}, O = V.READ | V.WRITE;
class he extends L {
  // Position dans le fichier courant
  constructor(t) {
    super(), this.currentSector = l(0), this.currentFileHandle = c(0), this.lastCommandResult = l(0), this.filenameBuffer = "", this.filenameIndex = 0, this.filePointer = c(0), this.id = Math.round(Math.random() * 999999999), this.storageDisk = t;
  }
  initializeFileSystem(t = !1) {
    const e = this.sectorToAddress(re, 0);
    if (this.readByte(e) !== 66 || t) {
      this.writeByte(e, 66), this.writeByte(this.sectorToAddress(re, 1), 1);
      for (let n = 0; n < Z; n++) {
        const a = this.sectorToAddress(q, n * W);
        this.writeByte(c(a + 12), 0), this.writeByte(c(a + 13), O);
      }
      const i = new Uint8Array(H);
      for (let n = 0; n < te; n++)
        i[n] = 1;
      for (let n = te; n < H; n++)
        i[n] = 0;
      this.setAllocationBitmap(i);
    }
  }
  // ===== FONCTIONS UTILITAIRES =====
  // Convertir secteur+offset → adresse mémoire
  sectorToAddress(t, e = 0) {
    return c(t * F + e);
  }
  // Lire un octet à une adresse
  readByte(t) {
    return this.storageDisk.storage.get(t) ?? l(0);
  }
  // Écrire un octet à une adresse
  writeByte(t, e) {
    this.storageDisk.storage.set(t, e), this.storageDisk.storage.size > this.storageDisk.maxSize && (this.storageDisk.storage.delete(t), console.warn(`Disk ${this.storageDisk.name} overloaded`));
  }
  // ===== GESTION DES INODES =====
  // Trouver un inode libre
  findFreeInode() {
    for (let t = 0; t < Z; t++) {
      const e = this.sectorToAddress(q, t * W);
      if (this.readByte(e + 12) === 0) return t;
    }
    return -1;
  }
  // Lire un inode
  readInode(t) {
    if (t < 0 || t >= Z) return null;
    const e = this.sectorToAddress(q, t * W);
    let s = "";
    for (let d = 0; d < X; d++) {
      const k = this.readByte(c(e + d));
      if (k === 0) break;
      s += String.fromCharCode(k);
    }
    const i = this.readByte(c(e + 8)), n = this.readByte(c(e + 9)), a = c(n << 8 | i), m = this.readByte(c(e + 10)), p = this.readByte(c(e + 12)), h = this.readByte(c(e + 13));
    return { name: s, size: a, startSector: m, flags: p, permissions: h };
  }
  // Écrire un inode
  writeInode(t, e) {
    const s = this.sectorToAddress(q, t * W);
    for (let i = 0; i < X; i++) {
      const n = i < e.name.length ? e.name.charCodeAt(i) : 0;
      this.writeByte(c(s + i), l(n));
    }
    this.writeByte(c(s + 8), l(e.size & 255)), this.writeByte(c(s + 9), l(e.size >> 8 & 255)), this.writeByte(c(s + 10), l(e.startSector)), this.writeByte(c(s + 12), l(e.flags)), this.writeByte(c(s + 13), l(e.permissions || O)), this.writeByte(c(s + 11), l(0));
    for (let i = 14; i < W; i++)
      this.writeByte(c(s + i), l(0));
  }
  // Vérifier si une permission est accordée
  hasPermission(t, e) {
    const s = t.permissions || O;
    switch (e) {
      case "read":
        return (s & V.READ) !== 0;
      case "write":
        return (s & V.WRITE) !== 0;
      case "execute":
        return (s & V.EXECUTE) !== 0;
      default:
        return !1;
    }
  }
  // Modifier les permissions d'un fichier
  setPermissions(t, e) {
    const s = this.readInode(t);
    if (!s || s.flags !== 1) return !1;
    const i = { ...s, permissions: e };
    return this.writeInode(t, i), !0;
  }
  // Obtenir une chaîne de permissions style Unix (ex: "rw-", "r-x")
  getPermissionString(t) {
    const e = t.permissions || O;
    return [
      e & V.READ ? "r" : "-",
      e & V.WRITE ? "w" : "-",
      e & V.EXECUTE ? "x" : "-"
    ].join("");
  }
  // Gestion du bitmap d'allocation
  getAllocationBitmap() {
    const t = new Uint8Array(H), e = this.sectorToAddress(ne, 0);
    for (let s = 0; s < H; s++)
      t[s] = this.readByte(c(e + s)) ?? 0;
    return t;
  }
  setAllocationBitmap(t) {
    const e = this.sectorToAddress(ne, 0);
    for (let s = 0; s < H; s++)
      this.writeByte(c(e + s), l(t[s] || 0));
  }
  // Trouver N secteurs libres contigus
  findFreeSectors(t) {
    const e = this.getAllocationBitmap();
    for (let s = te; s <= H - t; s++) {
      let i = !0;
      for (let n = 0; n < t; n++)
        if (e[s + n] !== 0) {
          i = !1;
          break;
        }
      if (i) return s;
    }
    return -1;
  }
  // Allouer des secteurs
  allocateSectors(t, e) {
    const s = this.getAllocationBitmap();
    for (let i = 0; i < e; i++) {
      const n = t + i;
      if (n >= H)
        return console.error(`Sector ${n} out of bounds`), !1;
      if (s[n] !== 0)
        return console.error(`Sector ${n} already occupied (value=${s[n]})`), !1;
    }
    for (let i = 0; i < e; i++)
      s[t + i] = 1;
    return this.setAllocationBitmap(s), !0;
  }
  // Libérer des secteurs
  freeSectors(t, e) {
    const s = this.getAllocationBitmap();
    for (let i = 0; i < e; i++)
      s[t + i] = 0;
    this.setAllocationBitmap(s);
  }
  // ===== IMPLÉMENTATION DES FONCTIONS =====
  listFiles() {
    const t = [];
    for (let e = 0; e < Z; e++) {
      const s = this.readInode(e);
      s && s.flags === 1 && t.push({
        name: s.name.trim(),
        permissions: this.getPermissionString(s),
        size: s.size
      });
    }
    return t;
  }
  createFile(t, e = O) {
    if (t.length > X || t.length === 0)
      return console.error(`createFile: invalid name length: ${t.length}`), !1;
    const s = this.findFreeInode();
    if (s === -1)
      return console.error("createFile: NO_FREE_INODE"), !1;
    const i = this.findFreeSectors(1);
    if (i === -1)
      return console.error("createFile: NO_FREE_SECTORS"), !1;
    if (this.getAllocationBitmap()[i] !== 0)
      return console.error(`createFile: sector ${i} is NOT free!`), !1;
    if (!this.allocateSectors(i, 1))
      return console.error("createFile: ALLOCATION_FAILED"), !1;
    const a = {
      name: t.padEnd(X, " ").substring(0, X),
      size: 0,
      startSector: i,
      flags: 1,
      // Occupé
      permissions: e
    };
    return this.writeInode(s, a), !0;
  }
  openFile(t, e = "read") {
    for (let s = 0; s < Z; s++) {
      const i = this.readInode(s);
      if (i && i.flags === 1 && i.name.trim() === t.trim())
        return e === "read" && !this.hasPermission(i, "read") ? (console.log(`openFile: Permission denied (no read access to "${t}")`), c(65535)) : e === "write" && !this.hasPermission(i, "write") ? (console.log(`openFile: Permission denied (no write access to "${t}")`), c(65535)) : (this.currentFileHandle = c(s), this.filePointer = c(0), c(s));
    }
    return c(65535);
  }
  readData() {
    if (this.currentFileHandle === 65535) return l(0);
    const t = this.readInode(this.currentFileHandle);
    if (!t || t.flags !== 1) return l(0);
    if (!this.hasPermission(t, "read"))
      return console.log("readData: Permission denied (no read access)"), l(0);
    if (this.filePointer >= t.size) return l(0);
    const e = Math.floor(this.filePointer / F), s = this.filePointer % F, i = t.startSector + e;
    if (i >= t.startSector + Math.ceil(t.size / F))
      return l(0);
    const n = this.sectorToAddress(l(i), c(s)), a = this.readByte(n);
    return this.filePointer = c(this.filePointer + 1), a;
  }
  // Fonction pour étendre un fichier si besoin
  extendFileIfNeeded(t, e) {
    const s = Math.ceil((e + 1) / F), i = Math.ceil(t.size / F);
    if (i === 0)
      return this.getAllocationBitmap()[t.startSector] === 0 ? this.allocateSectors(t.startSector, 1) : !0;
    if (s <= i)
      return !0;
    const n = s - i, a = t.startSector + i;
    return this.allocateSectors(a, n);
  }
  // writeData corrigée avec extendFileIfNeeded
  writeData(t) {
    if (this.currentFileHandle === 65535) return;
    const e = this.readInode(this.currentFileHandle);
    if (!e || e.flags !== 1) return;
    if (!this.hasPermission(e, "write")) {
      console.log("writeData: Permission denied (no write access)"), this.lastCommandResult = l(251);
      return;
    }
    if (!this.extendFileIfNeeded(e, this.filePointer)) {
      this.lastCommandResult = l(252);
      return;
    }
    const s = Math.floor(this.filePointer / F), i = this.filePointer % F, n = e.startSector + s, a = this.sectorToAddress(l(n), c(i));
    if (this.writeByte(a, t), this.filePointer >= e.size) {
      const m = {
        ...e,
        size: c(this.filePointer + 1)
      };
      this.writeInode(this.currentFileHandle, m);
    }
    this.filePointer = c(this.filePointer + 1), this.lastCommandResult = l(1);
  }
  // DEBUG: Voir les secteurs utilisés par un fichier
  getFileSectors(t) {
    const e = [], s = Math.ceil(t.size / F);
    for (let i = 0; i < s; i++)
      e.push(t.startSector + i);
    return e;
  }
  executeCommand(t) {
    let e = l(0);
    switch (t) {
      case 144:
        const s = this.listFiles();
        e = l(s.length);
        break;
      case 145:
        this.createFile(this.filenameBuffer) ? e = l(1) : e = l(0), this.filenameBuffer = "", this.filenameIndex = 0;
        break;
      case 146:
        e = this.openFile(this.filenameBuffer) === 65535 ? l(0) : l(1), this.filenameBuffer = "", this.filenameIndex = 0;
        break;
      case 147:
        this.currentFileHandle = c(65535), this.filePointer = c(0), e = l(1);
        break;
      case 148: {
        const a = this.readInode(this.currentFileHandle);
        if (a && a.flags === 1) {
          const m = Math.ceil(a.size / F);
          this.freeSectors(a.startSector, m);
          const p = { ...a, flags: 0 };
          this.writeInode(this.currentFileHandle, p), this.currentFileHandle = c(65535), this.filePointer = c(0), e = l(1);
        } else
          e = l(0);
        break;
      }
      case 149:
        break;
      case 150:
        if (this.currentFileHandle !== 65535) {
          const a = parseInt(this.filenameBuffer, 10) || 0;
          this.setPermissions(this.currentFileHandle, l(a)) && (e = l(1));
        }
        this.filenameBuffer = "", this.filenameIndex = 0;
        break;
      case 151:
        if (this.currentFileHandle !== 65535) {
          const a = this.readInode(this.currentFileHandle);
          a && (e = l(a.permissions || O));
        }
        break;
      case 152:
        const n = this.filenameBuffer.split(":");
        if (n.length === 2) {
          const [a, m] = n, p = parseInt(m, 10) || O;
          this.createFile(a, l(p)) && (e = l(1));
        } else
          this.createFile(this.filenameBuffer, O) && (e = l(1));
        this.filenameBuffer = "", this.filenameIndex = 0;
        break;
      default:
        e = l(255);
    }
    this.lastCommandResult = e;
  }
  // Fonction pour ajouter un caractère au nom de fichier
  writeFilenameChar(t) {
    if (this.filenameIndex < X) {
      const e = String.fromCharCode(t);
      this.filenameBuffer = this.filenameBuffer + e, this.filenameIndex = this.filenameIndex + 1;
    }
  }
  reset() {
    this.currentSector = l(0), this.currentFileHandle = c(0), this.lastCommandResult = l(0), this.filePointer = c(0), this.filenameBuffer = "", this.filenameIndex = 0;
  }
}
let ue = class extends L {
  constructor(t, e = null, s, i = 65535) {
    super(), this.currentAddress = c(0), this.storage = /* @__PURE__ */ new Map(), this.loadRawData = async (n) => {
      this.storage = new Map(n), this.storage.size > this.maxSize && (console.warn(`Disk ${this.name} overloaded`), this.deleteOverload()), this.emit("state", { storage: this.storage });
    }, this.id = Math.round(Math.random() * 999999999), this.name = t, this.type = "DiskStorage", this.fs = new he(this), this.ioPort = e ?? 0, this.maxSize = i, s && this.loadRawData(new Map(s)), this.emit("state", { maxSize: i });
  }
  eraseDisk() {
    this.loadRawData(/* @__PURE__ */ new Map());
  }
  formatDisk() {
    this.eraseDisk(), this.fs.initializeFileSystem(!0), this.emit("state", { storage: this.storage });
  }
  deleteOverload() {
    for (; this.storage.size > this.maxSize; ) {
      const t = this.storage.keys().next();
      if (t.done) break;
      this.storage.delete(t.value);
    }
  }
  read(t) {
    switch (t) {
      case 0:
        return this.storage.get(this.currentAddress) ?? 0;
      case 1:
        return ee(this.storage.size);
      case 2:
        return Q(this.storage.size);
      case 3:
        return ee(this.currentAddress);
      case 4:
        return Q(this.currentAddress);
      case 8:
        const e = this.fs.listFiles();
        return l(e.length);
      case 9:
        return this.fs.lastCommandResult;
      case 10:
        return this.fs.readData();
      case 12:
        return ee(this.fs.currentFileHandle);
      case 13:
        return Q(this.fs.currentFileHandle);
      default:
        return console.warn(`Disk: Unknown read port ${t}`), 0;
    }
  }
  write(t, e) {
    switch (t) {
      case 0:
        this.storage.set(this.currentAddress, e), this.storage.size > this.maxSize && (this.storage.delete(this.currentAddress), console.warn(`Disk ${this.name} overloaded`)), this.currentAddress = c(this.currentAddress + 1), this.emit("state", { storage: this.storage });
        break;
      case 3:
        this.currentAddress = c(this.currentAddress & 65280 | e);
        break;
      case 4:
        this.currentAddress = c(this.currentAddress & 255 | e << 8);
        break;
      case 9:
        this.fs.executeCommand(e), this.emit("state", { storage: this.storage });
        break;
      case 10:
        this.fs.writeData(e), this.emit("state", { storage: this.storage });
        break;
      case 11:
        this.fs.writeFilenameChar(e), this.emit("state", { storage: this.storage });
        break;
      default:
        console.warn(`Disk: Unknown write port ${t}`);
        break;
    }
  }
}, me = class extends L {
  constructor(t, e = null) {
    super(), this.leds = 0, this.id = Math.round(Math.random() * 999999999), this.name = t, this.type = "Display", this.ioPort = e ?? 0;
  }
  read(t) {
    switch (t) {
      case 0:
        return this.leds;
    }
    return 0;
  }
  write(t, e) {
    switch (t) {
      case 0:
        this.leds = l(e), this.emit("state", { leds: this.leds });
        break;
    }
  }
  getLeds() {
    return Array.from({ length: 8 }, (t, e) => this.leds >> e & 1);
  }
  reset() {
    this.leds = l(0), this.emit("state", { leds: this.leds });
  }
}, fe = class extends L {
  constructor(t, e = null, s = 32, i = 32) {
    super(), this.width = 32, this.height = 32, this.currentX = l(0), this.currentY = l(0), this.id = Math.round(Math.random() * 999999999), this.name = t, this.type = "Display", this.ioPort = e ?? 0, this.width = s, this.height = i, this.pixels = Array(i).fill(null).map(() => Array(s).fill(!1));
  }
  read(t) {
    switch (t) {
      case 0:
        return this.currentX;
      case 1:
        return this.currentY;
      case 2:
        return this.currentY < this.height && this.currentX < this.width && this.pixels[this.currentY][this.currentX] ? 1 : 0;
      default:
        return 0;
    }
  }
  write(t, e) {
    switch (t) {
      case 0:
        this.currentX = e % this.width, this.emit("state", { currentX: this.currentX });
        break;
      case 1:
        this.currentY = e % this.height, this.emit("state", { currentY: this.currentY });
        break;
      case 2:
        if (this.currentY < this.height && this.currentX < this.width) {
          const s = (e & 1) !== 0;
          this.pixels[this.currentY][this.currentX] = s, this.emit("state", { pixels: this.pixels });
        }
        break;
    }
  }
  clear() {
    this.pixels = Array(this.height).fill(null).map(() => Array(this.width).fill(!1)), this.emit("state", { pixels: this.pixels });
  }
  getPixel(t, e) {
    return e >= 0 && e < this.height && t >= 0 && t < this.width ? this.pixels[e][t] : !1;
  }
  reset() {
    this.clear(), this.currentX = 0, this.currentY = 0, this.emit("state", {
      currentX: this.currentX,
      currentY: this.currentY
    });
  }
}, ge = class extends L {
  constructor(t, e = null, s = 16, i = 2) {
    super(), this.cursorRow = 0, this.cursorCol = 0, this.cursorVisible = !0, this.id = Math.round(Math.random() * 999999999), this.name = t, this.type = "Time", this.ioPort = e ?? 0, this.width = s, this.height = i, this.display = Array(i).fill(null).map(() => Array(s).fill(" "));
  }
  read(t) {
    return 0;
  }
  write(t, e) {
    switch (t) {
      case 0:
        if (this.cursorRow < this.height && this.cursorCol < this.width) {
          const n = String.fromCharCode(e);
          this.display[this.cursorRow][this.cursorCol] = n, this.cursorCol = this.cursorCol + 1, this.cursorCol >= this.width && (this.cursorCol = 0, this.cursorRow = (this.cursorRow + 1) % this.height, this.emit("state", { cursorRow: this.cursorRow })), this.emit("state", { cursorCol: this.cursorCol });
        }
        break;
      case 1:
        switch (e) {
          case 1:
            this.display = Array(this.height).fill(null).map(() => Array(this.width).fill(" ")), this.cursorRow = 0, this.cursorCol = 0, this.emit("state", { cursorCol: this.cursorCol, cursorRow: this.cursorRow, display: this.display });
            break;
          case 2:
            this.cursorRow = 0, this.cursorCol = 0, this.emit("state", { cursorCol: this.cursorCol, cursorRow: this.cursorRow });
            break;
          case 12:
            this.cursorVisible = !1, this.emit("state", { cursorVisible: this.cursorVisible });
            break;
          case 14:
            this.cursorVisible = !0, this.emit("state", { cursorVisible: this.cursorVisible });
            break;
          case 16:
            this.cursorCol = Math.max(0, this.cursorCol - 1), this.emit("state", { cursorCol: this.cursorCol });
            break;
          case 20:
            this.cursorCol = Math.min(this.width - 1, this.cursorCol + 1), this.emit("state", { cursorCol: this.cursorCol });
            break;
        }
        break;
      case 2:
        const s = Math.floor(e / this.width) % this.height, i = e % this.width;
        this.cursorRow = s, this.cursorCol = i, this.emit("state", { cursorCol: this.cursorCol, cursorRow: this.cursorRow });
        break;
    }
  }
  reset() {
    this.display = Array(this.height).fill(null).map(() => Array(this.width).fill(" ")), this.cursorRow = 0, this.cursorCol = 0, this.cursorVisible = !0, this.emit("state", { cursorCol: this.cursorCol, cursorRow: this.cursorRow, display: this.display, cursorVisible: this.cursorVisible });
  }
  getText() {
    return this.display.map((t) => t.join(""));
  }
}, pe = class extends L {
  constructor(t, e = null, s = 30, i = 15, n = 100) {
    super(), this.lines = [], this.id = Math.round(Math.random() * 999999999), this.name = t, this.type = "Time", this.ioPort = e ?? 0, this.width = s, this.height = i, this.maxLines = n, this.currentLine = "";
  }
  // Device IO interface
  read(t) {
    return 0;
  }
  write(t, e) {
    switch (t) {
      case 0:
        const s = String.fromCharCode(e);
        if (e === 10 || e === 13) {
          if (this.lines.push(this.currentLine), this.lines.length > this.maxLines) {
            this.lines = this.lines.slice(-this.maxLines);
            return;
          }
          this.currentLine = "", this.emit("state", { lines: this.lines, currentLine: this.currentLine });
        } else e === 8 ? (this.currentLine = this.currentLine.slice(0, -1), this.emit("state", { currentLine: this.currentLine })) : e >= 32 && e <= 126 ? (this.currentLine = this.currentLine + s, this.emit("state", { currentLine: this.currentLine })) : console.warn(`📟 Console: Unprintable character 0x${e.toString(16)}`);
        break;
      case 1:
        this.reset();
        break;
    }
  }
  reset() {
    this.lines = [], this.currentLine = "", this.emit("state", { lines: this.lines, currentLine: this.currentLine });
  }
  getAllText() {
    const t = [...this.lines];
    return this.currentLine && t.push(this.currentLine), t.join(`
`);
  }
}, xe = class extends L {
  constructor(t, e = null, s = 1) {
    super(), this.displays = [], this.currentDisplay = null, this.digitToSegments = [
      63,
      // 0: segments a,b,c,d,e,f
      6,
      // 1: segments b,c
      91,
      // 2: segments a,b,d,e,g
      79,
      // 3: segments a,b,c,d,g
      102,
      // 4: segments b,c,f,g
      109,
      // 5: segments a,c,d,f,g
      125,
      // 6: segments a,c,d,e,f,g
      7,
      // 7: segments a,b,c
      127,
      // 8: tous les segments
      111,
      // 9: segments a,b,c,d,f,g
      119,
      // A: segments a,b,c,e,f,g
      124,
      // b: segments c,d,e,f,g
      57,
      // C: segments a,d,e,f
      94,
      // d: segments b,c,d,e,g
      121,
      // E: segments a,d,e,f,g
      113
      // F: segments a,e,f,g
    ], this.id = Math.round(Math.random() * 999999999), this.name = t, this.type = "Display", this.ioPort = e ?? 0, this.displaysCount = s, this.reset();
  }
  read(t) {
    switch (t) {
      case 0:
        return this.currentDisplay ? this.displays[this.currentDisplay].currentValue : 0;
      case 1:
        return this.currentDisplay ? this.displays[this.currentDisplay].rawSegments : 0;
      case 2:
        return l(this.currentDisplay ?? 0);
      default:
        return 0;
    }
  }
  write(t, e) {
    switch (t) {
      case 0:
        if (!this.currentDisplay) return;
        const s = e & 15;
        this.displays[this.currentDisplay].currentValue = s, this.displays[this.currentDisplay].rawSegments = this.digitToSegments[s] || 0, this.emit("state", {
          //rawSegments: this.rawSegments,
          //currentValue: this.currentValue,
          displays: this.displays
        });
        break;
      case 1:
        if (!this.currentDisplay) return;
        this.displays[this.currentDisplay].rawSegments = e & 127, this.emit("state", {
          //rawSegments: this.rawSegments,
          displays: this.displays
        });
        break;
      case 2:
        this.currentDisplay = e;
        break;
    }
  }
  // Pour l'affichage UI
  getSegments(t = 0) {
    const e = [];
    for (let s = 0; s < 8; s++)
      e[s] = this.displays[t] ? (this.displays[t].rawSegments >> s & 1) === 1 : !1;
    return e;
  }
  getCurrentDigit(t = 0) {
    return this.displays[t] ? this.displays[t].currentValue : 0;
  }
  reset() {
    this.displays = new Array(this.displaysCount).fill(null).map(() => ({
      currentValue: 0,
      rawSegments: 0
    })), this.currentDisplay = this.displays.length > 0 ? 0 : null, this.emit("state", {
      //rawSegments: this.rawSegments,
      //currentValue: this.currentValue,
      displays: this.displays
    });
  }
};
const j = {
  BUZZER_FREQ: 0,
  BUZZER_DURATION: 1
};
let ye = class extends L {
  constructor(t, e = null) {
    super(), this.frequency = 440, this.isPlaying = !1, this.audioContext = null, this.oscillator = null, this.gainNode = null, this.id = Math.round(Math.random() * 999999999), this.name = t, this.type = "Audio", this.ioPort = e ?? 0;
  }
  // Initialiser AudioContext à la première utilisation
  getAudioContext() {
    return this.audioContext || (this.audioContext = new (window.AudioContext || window.webkitAudioContext)()), this.audioContext;
  }
  // Arrêter le son en cours
  stopSound() {
    if (this.oscillator) {
      try {
        this.oscillator.stop(), this.oscillator.disconnect();
      } catch {
      }
      this.oscillator = null;
    }
    this.gainNode && (this.gainNode.disconnect(), this.gainNode = null), this.isPlaying = !1;
  }
  // Jouer un son
  playSound(t, e) {
    if (this.stopSound(), e === 0) return;
    const s = this.getAudioContext(), i = s.createOscillator(), n = s.createGain();
    i.type = "square", i.frequency.setValueAtTime(t, s.currentTime), n.gain.setValueAtTime(0.3, s.currentTime), n.gain.exponentialRampToValueAtTime(0.01, s.currentTime + e / 1e3), i.connect(n), n.connect(s.destination), i.start(s.currentTime), i.stop(s.currentTime + e / 1e3), this.oscillator = i, this.gainNode = n, this.isPlaying = !0, i.onended = () => {
      this.stopSound();
    }, console.log(`🔊 Buzzer: ${t.toFixed(0)} Hz for ${e} ms`);
  }
  read(t) {
    switch (t) {
      case j.BUZZER_FREQ:
        return Math.round((this.frequency - 100) / 7.45);
      case j.BUZZER_DURATION:
        return this.isPlaying ? 1 : 0;
      default:
        return console.warn(`Buzzer: Unknown read port 0x${t.toString(16)}`), 0;
    }
  }
  write(t, e) {
    switch (t) {
      case j.BUZZER_FREQ:
        const s = 100 + e * 7.45;
        this.frequency = s;
        break;
      case j.BUZZER_DURATION:
        const i = e * 10;
        this.playSound(this.frequency, i);
        break;
      default:
        console.warn(`Buzzer: Unknown write port 0x${t.toString(16)}`);
        break;
    }
  }
  reset() {
    this.stopSound(), this.frequency = 440;
  }
};
const J = {
  RNG_OUTPUT: 0,
  RNG_SEED: 1
};
let be = class extends L {
  constructor(t, e = null) {
    super(), this.id = Math.round(Math.random() * 999999999), this.name = t, this.type = "Random", this.ioPort = e ?? 0, this.seed = Date.now();
  }
  // Linear Congruential Generator (LCG)
  // Paramètres: a=1103515245, c=12345, m=2^32 (standard glibc)
  generateRandom(t) {
    const n = (1103515245 * t + 12345) % 4294967296;
    return this.seed = n, this.emit("state", { seed: n }), n >> 16 & 255;
  }
  read(t) {
    switch (t) {
      case J.RNG_OUTPUT:
        return this.generateRandom(this.seed);
      case J.RNG_SEED:
        return l(this.seed >> 24);
      default:
        return console.warn(`RNG: Unknown read port 0x${t.toString(16)}`), 0;
    }
  }
  write(t, e) {
    switch (t) {
      case J.RNG_OUTPUT:
        console.warn("RNG: Cannot write to OUTPUT port");
        break;
      case J.RNG_SEED:
        const s = e << 24 | this.seed & 16777215;
        this.seed = s, this.emit("state", { seed: s }), console.log(`🎲 RNG: Seed set to 0x${s.toString(16)}`);
        break;
      default:
        console.warn(`RNG: Unknown write port 0x${t.toString(16)}`);
        break;
    }
  }
  reset() {
    this.seed = Date.now(), this.emit("state", { seed: this.seed });
  }
};
const z = {
  RTC_YEARS: 1,
  RTC_MONTHS: 2,
  RTC_DAYS: 3,
  RTC_HOURS: 4,
  RTC_MINUTES: 5,
  RTC_SECONDS: 6,
  RTC_TIMESTAMP_0: 7,
  RTC_TIMESTAMP_1: 8,
  RTC_TIMESTAMP_2: 9,
  RTC_TIMESTAMP_3: 10
};
let we = class extends L {
  constructor(t, e = null) {
    super(), this.time = {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      offset: 0,
      time: 0
    }, this.id = Math.round(Math.random() * 999999999), this.name = t, this.type = "Time", this.ioPort = e ?? 0, this.updateTime(), setInterval(this.updateTime.bind(this), 1e3);
  }
  updateTime() {
    this.time = this.getLocalTime(), this.emit("state", { time: this.time });
  }
  getLocalTime() {
    const t = /* @__PURE__ */ new Date();
    return {
      years: t.getFullYear(),
      months: t.getMonth() + 1,
      days: t.getDate(),
      hours: t.getHours(),
      minutes: t.getMinutes(),
      seconds: t.getSeconds(),
      time: t.getTime(),
      offset: t.getTimezoneOffset()
    };
  }
  getUtcTime() {
    const t = /* @__PURE__ */ new Date();
    return {
      years: t.getUTCFullYear(),
      months: t.getUTCMonth() + 1,
      days: t.getUTCDate(),
      hours: t.getUTCHours(),
      minutes: t.getUTCMinutes(),
      seconds: t.getUTCSeconds(),
      time: t.getTime(),
      offset: 0
    };
  }
  read(t) {
    const e = /* @__PURE__ */ new Date(), s = Math.floor(e.getTime() / 1e3);
    switch (t) {
      case z.RTC_YEARS:
        return e.getFullYear() % 100;
      case z.RTC_MONTHS:
        return e.getMonth() + 1;
      case z.RTC_DAYS:
        return e.getDate();
      case z.RTC_HOURS:
        return e.getHours();
      case z.RTC_MINUTES:
        return e.getMinutes();
      case z.RTC_SECONDS:
        return e.getSeconds();
      case z.RTC_TIMESTAMP_0:
        return s & 255;
      case z.RTC_TIMESTAMP_1:
        return s >> 8 & 255;
      case z.RTC_TIMESTAMP_2:
        return s >> 16 & 255;
      case z.RTC_TIMESTAMP_3:
        return s >> 24 & 255;
      default:
        return console.warn(`RTC: Unknown read port 0x${t.toString(16)}`), 0;
    }
  }
  write(t, e) {
    console.warn(`RTC: Cannot write to port 0x${t.toString(16)}, RTC is read-only`);
  }
  reset() {
  }
};
const Le = (b) => {
  const { hidden: t, name: e, ioPort: s, persistent: i, open: n = !0, data: a, size: m, children: p, onInstanceCreated: h } = b, [d, k] = u(null), [g, v] = u(/* @__PURE__ */ new Map()), [E, C] = u(n), [N, w] = u(!1), [x, f] = u(!1), [_, B] = u(!1), [D, I] = u(!0), S = ie(() => Array.from(g.entries()).sort(([A], [R]) => A - R), [d, g]), y = ie(
    () => le(g),
    [d, g]
  );
  T(() => {
    const R = setTimeout(() => {
      if (x) return;
      const U = new ue(e, s, a, m);
      k(U), U.on("state", (se) => {
        se.storage && v(new Map(se.storage));
      }), i || B(!0), f(!0);
    }, 100);
    return () => clearTimeout(R);
  }, []), T(() => {
    d && h && h(d);
  }, [d, h]), T(() => {
    if (!d || !x || !i || _) return;
    const R = setTimeout(() => {
      Y();
    }, 100);
    return () => clearTimeout(R);
  }, [x]), T(() => {
    if (!d || !i || !x || !_) return;
    const R = setTimeout(() => {
      if (N) {
        w(!1);
        return;
      }
      M();
    }, 1e3);
    return () => clearTimeout(R);
  }, [g, x]);
  const Y = G(() => {
    if (!d || !i || !x) return;
    const A = `disk_${e}`, R = localStorage.getItem(A);
    if (R != null) {
      const U = JSON.parse(R);
      w(!0), d.storage = new Map(U), d.emit("state", { storage: d.storage }), B(!0);
    }
  }, [d, i, x]), M = G(() => {
    if (!d || !i || !x) return;
    const A = `disk_${e}`, R = JSON.stringify(Array.from(g.entries()));
    console.log(`Saving persistent disk ${e} storage`), localStorage.setItem(A, R);
  }, [e, g, d, i, x]), K = P.Children.map(p, (A) => {
    if (P.isValidElement(A)) {
      const R = A;
      switch (R.type) {
        default:
          return console.log("Invalid component mounted into StorageDisk : null", R.type.name), null;
      }
    }
    return A;
  });
  return /* @__PURE__ */ o("div", { className: `storage-disk p-1 bg-purple-900 rounded ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ o("div", { className: "w-full flex bg-background-light-xl p-2", children: [
      /* @__PURE__ */ o("h2", { className: "font-bold", children: [
        'Storage Disk "',
        e,
        '"'
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => C((A) => !A),
          children: E ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ r("div", { className: `${E ? "hidden" : "flex"} flex justify-center p-1 min-w-[200px]`, children: /* @__PURE__ */ r(Ce, {}) }),
    /* @__PURE__ */ o("div", { className: `${E ? "flex" : "hidden"} flex-col space-y-1 p-1`, children: [
      /* @__PURE__ */ o($, { children: [
        /* @__PURE__ */ o("div", { className: "font-mono text-sm space-y-1 max-h-[600px] overflow-y-auto overscroll-contain", children: [
          /* @__PURE__ */ o("div", { className: "text-xs text-slate-400 mb-2", children: [
            e,
            ": ",
            S.length,
            " bytes"
          ] }),
          S.length > 0 ? S.map(([A, R]) => {
            const U = (D && y.get(A)) ?? !1;
            return /* @__PURE__ */ o(
              "div",
              {
                className: "flex justify-between p-2 rounded bg-slate-900/50",
                children: [
                  /* @__PURE__ */ o("span", { className: "text-yellow-400", children: [
                    "0x",
                    A.toString(16).padStart(4, "0"),
                    ":"
                  ] }),
                  /* @__PURE__ */ o("div", { className: "flex gap-4", children: [
                    !U && R >= 32 && R <= 126 && /* @__PURE__ */ o("span", { className: "text-xs text-slate-400 mt-1", children: [
                      "'",
                      String.fromCharCode(R),
                      "'"
                    ] }),
                    /* @__PURE__ */ o("span", { className: `${U ? "text-pink-400" : "text-green-400"}`, children: [
                      "0x",
                      R.toString(16).padStart(2, "0"),
                      U && ` (${ce(R)})`
                    ] })
                  ] })
                ]
              },
              A
            );
          }) : /* @__PURE__ */ o("div", { className: "text-slate-500 italic text-center py-8", children: [
            e,
            " is empty"
          ] })
        ] }),
        /* @__PURE__ */ o("div", { className: "mt-2 flex gap-4 bg-background-light-2xl p-2 rounded", children: [
          /* @__PURE__ */ o(
            "button",
            {
              onClick: () => I((A) => !A),
              className: "flex gap-2 bg-background-light-xl hover:bg-background-light-xs disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors",
              children: [
                /* @__PURE__ */ r("div", { children: "Decode Instructions" }),
                /* @__PURE__ */ r("div", { children: D ? "✅" : "❌" })
              ]
            }
          ),
          /* @__PURE__ */ r(
            "button",
            {
              onClick: () => {
                confirm(`Erase all data on disk ${e}`) && d && d.eraseDisk();
              },
              className: "cursor-pointer px-2 py-1 font-medium transition-colors rounded bg-red-400",
              children: "Erase Disk"
            }
          ),
          /* @__PURE__ */ r(
            "button",
            {
              onClick: () => {
                confirm(`Format Disk Filesystem ${e}`) && d && d.formatDisk();
              },
              className: "cursor-pointer px-2 py-1 font-medium transition-colors rounded bg-red-400",
              children: "Format FS"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ r("div", { className: `${E ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`, children: K && /* @__PURE__ */ r("div", { className: "io-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1", children: K }) })
    ] })
  ] });
}, Ce = () => /* @__PURE__ */ o(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 100 70",
    width: "100",
    height: "70",
    children: [
      /* @__PURE__ */ r("circle", { cx: "50", cy: "35", r: "30", fill: "#374151", stroke: "#1f2937", strokeWidth: "1" }),
      /* @__PURE__ */ r("circle", { cx: "50", cy: "35", r: "25", fill: "#4b5563", stroke: "#374151", strokeWidth: "1" }),
      /* @__PURE__ */ r("circle", { cx: "50", cy: "35", r: "15", fill: "#6b7280", stroke: "#4b5563", strokeWidth: "1" }),
      /* @__PURE__ */ r("path", { d: "M50,35 L70,20", stroke: "#dc2626", strokeWidth: "1.5", strokeLinecap: "round" }),
      /* @__PURE__ */ r("rect", { x: "68", y: "18", width: "4", height: "4", rx: "1", fill: "#dc2626", transform: "rotate(45 70 20)" }),
      /* @__PURE__ */ r("circle", { cx: "50", cy: "35", r: "8", fill: "#9ca3af" }),
      /* @__PURE__ */ r("circle", { cx: "50", cy: "35", r: "3", fill: "#d1d5db" }),
      /* @__PURE__ */ r("rect", { x: "5", y: "5", width: "90", height: "60", rx: "5", fill: "none", stroke: "#111827", strokeWidth: "2" }),
      /* @__PURE__ */ r("rect", { x: "80", y: "20", width: "10", height: "15", fill: "#d97706", rx: "1" }),
      /* @__PURE__ */ r("rect", { x: "82", y: "22", width: "6", height: "11", fill: "#b45309" }),
      /* @__PURE__ */ r("text", { x: "50", y: "60", textAnchor: "middle", fontSize: "6", fill: "#9ca3af", fontFamily: "monospace", children: "HDD" })
    ]
  }
), Be = (b) => {
  const { name: t, ioPort: e, hidden: s, children: i, onInstanceCreated: n } = b, [a, m] = u(null), [p, h] = u(0);
  return T(() => {
    const k = setTimeout(() => {
      const g = new be(t, e);
      m(g), g.on("state", (v) => {
        g && v.seed !== void 0 && h(v.seed);
      }), h(g.seed);
    }, 100);
    return () => clearTimeout(k);
  }, []), T(() => {
    a && n && n(a);
  }, [a, n]), a ? /* @__PURE__ */ o("div", { className: `w-full rounded bg-background-light-2xl ${s ? "hidden" : ""}`, children: [
    /* @__PURE__ */ r("h3", { className: "bg-background-light-xl mb-1 px-2 py-1 rounded", children: "RNG" }),
    /* @__PURE__ */ r("div", { children: /* @__PURE__ */ o("div", { className: "flex items-center gap-2 px-1", children: [
      "Seed: ",
      p
    ] }) }),
    /* @__PURE__ */ r("div", { children: i })
  ] }) : s ? null : /* @__PURE__ */ r($, { children: "Loading Rng" });
}, Fe = (b) => {
  const { name: t, ioPort: e, hidden: s, children: i, onInstanceCreated: n } = b, [a, m] = u(null), [p, h] = u(null);
  return T(() => {
    const k = setTimeout(() => {
      const g = new we(t, e);
      m(g), g.on("state", (v) => {
        g && v.time !== void 0 && h(v.time);
      }), h(g.time);
    }, 100);
    return () => clearTimeout(k);
  }, []), T(() => {
    a && n && n(a);
  }, [a, n]), a ? /* @__PURE__ */ o("div", { className: `w-full rounded bg-background-light-2xl ${s ? "hidden" : ""}`, children: [
    /* @__PURE__ */ r("h3", { className: "bg-background-light-xl mb-1 px-2 py-1 rounded", children: "RTC" }),
    /* @__PURE__ */ r("div", { children: /* @__PURE__ */ o("div", { className: "flex items-center gap-2 px-1", children: [
      "Time: ",
      p ? new Date(p.time).toLocaleString() : "-"
    ] }) }),
    /* @__PURE__ */ r("div", { children: i })
  ] }) : s ? null : /* @__PURE__ */ r($, { children: "Loading Rtc" });
}, ze = (b) => {
  const { name: t, ioPort: e, hidden: s, children: i, onInstanceCreated: n } = b, [a, m] = u(null), [p, h] = u(!0);
  return T(() => {
    const k = setTimeout(() => {
      const g = new ye(t, e);
      m(g), g.on("state", (v) => {
      });
    }, 100);
    return () => clearTimeout(k);
  }, []), T(() => {
    a && n && n(a);
  }, [a, n]), a ? /* @__PURE__ */ o("div", { className: `w-full p-0 rounded bg-background-light-2xl ${s ? "hidden" : ""}`, children: [
    /* @__PURE__ */ r("h3", { className: "bg-background-light-xl mb-1 px-2 py-1 rounded", children: "Buzzer" }),
    /* @__PURE__ */ r("div", { children: /* @__PURE__ */ r("div", { className: "flex items-center gap-2 px-1" }) })
  ] }) : s ? null : /* @__PURE__ */ r($, { children: "Loading Buzzer" });
}, Ue = (b) => {
  const { hidden: t = !1, open: e = !0, name: s, ioPort: i, width: n = 35, height: a = 15, children: m, onInstanceCreated: p } = b, { devicesManagerRef: h } = ae(), [d, k] = u(null), g = h.current, [v, E] = u([]), [C, N] = u(""), [w, x] = u(e), f = oe(null);
  T(() => {
    if (!g) return;
    if (i !== void 0 && g.devices.has(i)) {
      const S = g.devices.get(i);
      S && k(S);
      return;
    }
    const I = setTimeout(() => {
      const S = new pe(s, i, n, a);
      k(S), S.on("state", (y) => {
        y.lines !== void 0 && E(y.lines), y.currentLine !== void 0 && N(y.currentLine);
      });
    }, 100);
    return () => clearTimeout(I);
  }, [g]), T(() => {
    d && p && p(d);
  }, [d, p]);
  const _ = P.Children.map(m, (D) => {
    if (P.isValidElement(D)) {
      const I = D;
      switch (I.type) {
        default:
          return console.log("Invalid component mounted into Device Console : null", I.type.name), null;
      }
    }
    return D;
  });
  T(() => {
    f.current && (f.current.scrollTop = f.current.scrollHeight);
  }, [v, C]);
  const B = () => {
    d && d.write(1, 0);
  };
  return d ? /* @__PURE__ */ o("div", { className: `device w-auto bg-indigo-900 p-1 rounded ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ o("div", { className: "w-full flex bg-background-light-xl p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold", children: "Console" }),
      /* @__PURE__ */ r(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => x((D) => !D),
          children: w ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ o("div", { className: `${w ? "flex" : "hidden"} flex-col space-y-1 p-1 min-w-[450px]`, children: [
      /* @__PURE__ */ o("div", { className: "flex justify-between gap-4", children: [
        /* @__PURE__ */ r("div", { children: /* @__PURE__ */ r("div", { className: "flex gap-4", children: /* @__PURE__ */ r(
          "button",
          {
            onClick: B,
            className: "mt-1 mx-2 ms-auto bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors",
            children: "Clear"
          }
        ) }) }),
        /* @__PURE__ */ r(
          "div",
          {
            ref: f,
            className: "bg-black mx-auto rounded-lg p-4 font-mono text-sm overflow-y-auto border border-green-500/30",
            style: { height: `${a * 1.15}em`, width: `${n * 1.1}ch` },
            children: v.length === 0 && !C ? /* @__PURE__ */ r("div", { className: "text-green-500/50 italic", children: "Console output will appear here..." }) : /* @__PURE__ */ o($, { children: [
              v.map((D, I) => /* @__PURE__ */ o("div", { className: "text-green-400", children: [
                D || " ",
                " "
              ] }, I)),
              C && /* @__PURE__ */ o("div", { className: "text-green-400", children: [
                C,
                /* @__PURE__ */ r("span", { className: "animate-pulse", children: "_" })
              ] })
            ] })
          }
        )
      ] }),
      _ && /* @__PURE__ */ r("div", { className: "flex-col space-y-1 p-1", children: /* @__PURE__ */ r("div", { className: "device-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1", children: _ }) })
    ] })
  ] }) : /* @__PURE__ */ r($, { children: "Loading Console" });
}, Oe = (b) => {
  const { hidden: t, open: e = !0, name: s, ioPort: i, children: n, onInstanceCreated: a } = b, [m, p] = u(null), [h, d] = u(0), [k, g] = u(!0), [v, E] = u(e);
  T(() => {
    const w = setTimeout(() => {
      const x = new de(s, i);
      p(x), x.on("state", (f) => {
        f.lastChar !== void 0 && d(f.lastChar), f.hasChar !== void 0 && g(f.hasChar);
      });
    }, 100);
    return () => clearTimeout(w);
  }, []), T(() => {
    m && a && a(m);
  }, [m, a]);
  const C = P.Children.map(n, (N) => {
    if (P.isValidElement(N)) {
      const w = N;
      switch (w.type) {
        default:
          return console.log("Invalid component mounted into Device Keyboard : null", w.type.name), null;
      }
    }
    return N;
  });
  return m ? /* @__PURE__ */ o("div", { className: `device w-auto p-1 bg-indigo-900 rounded ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ o("div", { className: "w-full flex bg-background-light-xl p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold", children: "Keyboard" }),
      /* @__PURE__ */ r(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => E((N) => !N),
          children: v ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ o("div", { className: `${v ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`, children: [
      /* @__PURE__ */ r("div", { children: /* @__PURE__ */ o("div", { className: "grid grid-cols-2 gap-4 p-3 bg-slate-900/50 rounded", children: [
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ r("div", { className: "text-xs text-slate-400 mb-1", children: "Last Char:" }),
          /* @__PURE__ */ r("div", { className: "text-2xl font-mono text-green-400", children: h > 0 ? /* @__PURE__ */ o($, { children: [
            "'",
            String.fromCharCode(h),
            "'",
            /* @__PURE__ */ o("span", { className: "text-sm text-slate-400 ml-2", children: [
              "(0x",
              h.toString(16).padStart(2, "0"),
              ")"
            ] })
          ] }) : /* @__PURE__ */ r("span", { className: "text-slate-600", children: "--" }) })
        ] }),
        /* @__PURE__ */ o("div", { children: [
          /* @__PURE__ */ r("div", { className: "text-xs text-slate-400 mb-1", children: "Status:" }),
          /* @__PURE__ */ o("div", { className: "flex items-center gap-2 mt-2", children: [
            /* @__PURE__ */ r(
              "div",
              {
                className: `w-4 h-4 rounded-full ${k ? "bg-green-500 animate-pulse" : "bg-slate-700"}`
              }
            ),
            /* @__PURE__ */ r("span", { className: "text-sm text-slate-300", children: k ? "Char Available" : "Waiting" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ r("div", { className: "flex-col space-y-1 bg-background-light-3xl p-1", children: C && /* @__PURE__ */ r("div", { className: "device-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1", children: C }) })
    ] })
  ] }) : /* @__PURE__ */ r($, { children: "Loading Keyboard" });
}, Ve = (b) => {
  const { hidden: t = !1, open: e = !0, name: s, ioPort: i, children: n, onInstanceCreated: a } = b, [m, p] = u(null), [h, d] = u(0), [k, g] = u(e);
  T(() => {
    const N = setTimeout(() => {
      const w = new me(s, i);
      p(w), w.on("state", (x) => {
        x.leds !== void 0 && d(x.leds);
      });
    }, 100);
    return () => clearTimeout(N);
  }, []), T(() => {
    m && a && a(m);
  }, [m, a]);
  const v = G(() => Array.from({ length: 8 }, (C, N) => h >> N & 1), [h]), E = P.Children.map(n, (C) => {
    if (P.isValidElement(C)) {
      const N = C;
      switch (N.type) {
        default:
          return console.log("Invalid component mounted into Device LedsDisplay : null", N.type.name), null;
      }
    }
    return C;
  });
  return m ? /* @__PURE__ */ o("div", { className: `device w-auto bg-teal-900 p-1 rounded ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ o("div", { className: "w-full flex bg-background-light-xl p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold", children: "Leds" }),
      /* @__PURE__ */ r(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => g((C) => !C),
          children: k ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ o("div", { className: `${k ? "flex" : "hidden"} flex-col space-y-1 p-1 min-w-[350px]`, children: [
      /* @__PURE__ */ r("div", { className: "p-2 rounded flex gap-4 items-center", children: /* @__PURE__ */ r("div", { className: "flex gap-2 mx-auto", children: v().map((C, N) => /* @__PURE__ */ r("div", { className: `w-6 h-6 rounded-full ${C ? "bg-yellow-500" : "bg-gray-700"}` }, N)) }) }),
      E && /* @__PURE__ */ r("div", { className: "flex-col space-y-1 p-1", children: /* @__PURE__ */ r("div", { className: "device-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1", children: E }) })
    ] })
  ] }) : /* @__PURE__ */ r($, { children: "Loading Leds" });
}, He = (b) => {
  const { hidden: t, open: e = !0, name: s, ioPort: i, width: n = 32, height: a = 32, children: m, onInstanceCreated: p } = b, [h, d] = u(null), [k, g] = u(!1), [v, E] = u([]), [C, N] = u(0), [w, x] = u(0), [f, _] = u(e);
  T(() => {
    const y = setTimeout(() => {
      if (k) return;
      const Y = new fe(s, i, n, a);
      d(Y), Y.on("state", (M) => {
        M.pixels !== void 0 && E(M.pixels), M.currentX !== void 0 && N(M.currentX), M.currentY !== void 0 && x(M.currentY);
      }), g(!0);
    }, 100);
    return () => clearTimeout(y);
  }, []), T(() => {
    h && p && p(h);
  }, [h, p]);
  const B = G(() => {
    h && h.clear();
  }, [h]), D = G((S, y) => v.length === 0 ? !1 : y >= 0 && y < a && S >= 0 && S < n ? v[y][S] : !1, [v]), I = P.Children.map(m, (S) => {
    if (P.isValidElement(S)) {
      const y = S;
      switch (y.type) {
        default:
          return console.log("Invalid component mounted into Device LedsDisplay : null", y.type.name), null;
      }
    }
    return S;
  });
  return h ? /* @__PURE__ */ o("div", { className: `device w-auto bg-pink-950 p-1 rounded ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ o("div", { className: "w-full flex bg-background-light-xl p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold", children: "Pixel Display 32x32" }),
      /* @__PURE__ */ r(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => _((S) => !S),
          children: f ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ o("div", { className: `${f ? "flex" : "hidden"} flex-col space-y-1 p-1 min-w-[400px]`, children: [
      /* @__PURE__ */ o("div", { className: "flex justify-between gap-4", children: [
        /* @__PURE__ */ r("div", { children: /* @__PURE__ */ o("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ o("div", { className: "mt-3 text-xs text-slate-400 p-2 bg-slate-900/30 rounded", children: [
            "Cursor: X=",
            C,
            ", Y=",
            w
          ] }),
          /* @__PURE__ */ r(
            "button",
            {
              onClick: B,
              className: "cursor-pointer bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors",
              children: "Clear"
            }
          )
        ] }) }),
        /* @__PURE__ */ r(
          "div",
          {
            className: "bg-black border-4 border-slate-600 rounded-lg p-2 mx-auto",
            style: {
              imageRendering: "pixelated",
              width: "fit-content"
            },
            children: /* @__PURE__ */ r("div", { className: "grid gap-0", style: {
              gridTemplateColumns: `repeat(${n}, 1fr)`,
              gap: "1px"
            }, children: Array.from({ length: a }).map(
              (S, y) => Array.from({ length: n }).map((Y, M) => {
                const K = D(M, y);
                return /* @__PURE__ */ r(
                  "div",
                  {
                    className: `w-2 h-2 ${K ? "bg-green-400" : h && M === C && y === w ? "bg-red-500/50" : "bg-slate-900"}`,
                    style: {
                      transition: "background-color 0.1s"
                    }
                  },
                  `${y}-${M}`
                );
              })
            ) })
          }
        )
      ] }),
      I && /* @__PURE__ */ r("div", { className: "flex-col space-y-1 p-1", children: /* @__PURE__ */ r("div", { className: "device-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1", children: I }) })
    ] })
  ] }) : /* @__PURE__ */ r($, { children: "Loading Pixels" });
}, Ye = (b) => {
  const { hidden: t = !1, open: e = !1, name: s, ioPort: i, width: n = 16, height: a = 2, children: m, onInstanceCreated: p } = b, [h, d] = u(null), [k, g] = u(Array(a).fill(null).map(() => Array(n).fill(" "))), [v, E] = u(0), [C, N] = u(0), [w, x] = u(!0), [f, _] = u(e);
  T(() => {
    const I = setTimeout(() => {
      const S = new ge(s, i, n, a);
      d(S), S.on("state", (y) => {
        y.display !== void 0 && g(y.display), y.cursorRow !== void 0 && E(y.cursorRow), y.cursorCol !== void 0 && N(y.cursorCol), y.cursorVisible !== void 0 && x(y.cursorVisible);
      });
    }, 100);
    return () => clearTimeout(I);
  }, []), T(() => {
    h && p && p(h);
  }, [h, p]);
  const B = P.Children.map(m, (D) => {
    if (P.isValidElement(D)) {
      const I = D;
      switch (I.type) {
        default:
          return console.log("Invalid component mounted into Device LcdDisplay : null", I.type.name), null;
      }
    }
    return D;
  });
  return h ? /* @__PURE__ */ o("div", { className: `device w-auto bg-violet-900 p-1 rounded ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ o("div", { className: "w-full flex bg-background-light-xl p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold", children: "LCD" }),
      /* @__PURE__ */ r(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => _((D) => !D),
          children: f ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ o("div", { className: `${f ? "flex" : "hidden"} flex-col space-y-1 p-1 min-w-[350px]`, children: [
      /* @__PURE__ */ r("div", { className: "p-2 rounded flex gap-4 items-center", children: /* @__PURE__ */ r("div", { className: "bg-green-900 border-4 border-slate-600 rounded-lg p-3 mx-auto", children: k.map((D, I) => /* @__PURE__ */ r("div", { className: "font-mono text-lg leading-tight", children: D.map((S, y) => /* @__PURE__ */ r(
        "span",
        {
          className: `inline-block w-[1.2ch] text-center ${w && I === v && y === C ? "bg-green-400 text-slate-900 animate-pulse" : "text-green-400"}`,
          children: S
        },
        y
      )) }, I)) }) }),
      B && B.length > 0 && /* @__PURE__ */ r("div", { className: "flex-col space-y-1 p-1", children: /* @__PURE__ */ r("div", { className: "device-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1", children: B }) })
    ] })
  ] }) : /* @__PURE__ */ r($, { children: "Loading LCD" });
}, Xe = (b) => {
  const { hidden: t, open: e = !0, name: s, ioPort: i, displays: n = 1, children: a, onInstanceCreated: m } = b, { devicesManagerRef: p } = ae(), [h, d] = u(null), [k, g] = u([]), [v, E] = u(e);
  T(() => {
    if (!p.current || h) return;
    const x = setTimeout(() => {
      const f = new xe(s, i, n);
      d(f), f.on("state", (_) => {
        _.displays !== void 0 && g(_.displays);
      }), f.emit("state", {
        displays: f.displays
      });
    }, 100);
    return () => clearTimeout(x);
  }, [p.current]), T(() => {
    h && m && m(h);
  }, [h, m]);
  const C = P.Children.map(a, (w) => {
    if (P.isValidElement(w)) {
      const x = w;
      switch (x.type) {
        default:
          return console.log("Invalid component mounted into Device SevenSegmentDisplay : null", x.type.name), null;
      }
    }
    return w;
  }), N = (w) => {
    const x = [];
    for (let f = 0; f < 8; f++)
      x[f] = (w.rawSegments >> f & 1) === 1;
    return x;
  };
  return h ? /* @__PURE__ */ o("div", { className: `device w-auto bg-violet-950 p-1 rounded ${t ? "hidden" : ""}`, children: [
    /* @__PURE__ */ o("div", { className: "w-full flex bg-background-light-xl p-2 rounded", children: [
      /* @__PURE__ */ r("h2", { className: "font-bold", children: "7-Segment" }),
      /* @__PURE__ */ r(
        "button",
        {
          className: "ms-auto cursor-pointer px-3 bg-background-light-xl rounded",
          onClick: () => E((w) => !w),
          children: v ? "-" : "+"
        }
      )
    ] }),
    /* @__PURE__ */ o("div", { className: `${v ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1 min-w-[300px]`, children: [
      /* @__PURE__ */ r("div", { className: "p-2 rounded bg-background-light-2xl flex gap-4 items-center mx-auto", children: k.map((w, x) => {
        const f = N(w);
        return /* @__PURE__ */ r("div", { className: "relative w-16 h-24 flex items-center justify-center", children: /* @__PURE__ */ o("svg", { viewBox: "0 0 100 150", className: "w-full h-full", children: [
          /* @__PURE__ */ r(
            "polygon",
            {
              points: "20,5 80,5 75,10 25,10",
              className: f[0] ? "fill-red-500" : "fill-gray-800"
            }
          ),
          /* @__PURE__ */ r(
            "polygon",
            {
              points: "80,5 85,10 85,70 80,65 75,70 75,10",
              className: f[1] ? "fill-red-500" : "fill-gray-800"
            }
          ),
          /* @__PURE__ */ r(
            "polygon",
            {
              points: "80,85 85,80 85,140 80,145 75,140 75,80",
              className: f[2] ? "fill-red-500" : "fill-gray-800"
            }
          ),
          /* @__PURE__ */ r(
            "polygon",
            {
              points: "20,145 80,145 75,140 25,140",
              className: f[3] ? "fill-red-500" : "fill-gray-800"
            }
          ),
          /* @__PURE__ */ r(
            "polygon",
            {
              points: "15,80 20,85 20,145 15,140 10,140 10,80",
              className: f[4] ? "fill-red-500" : "fill-gray-800"
            }
          ),
          /* @__PURE__ */ r(
            "polygon",
            {
              points: "15,10 20,5 20,65 15,70 10,70 10,10",
              className: f[5] ? "fill-red-500" : "fill-gray-800"
            }
          ),
          /* @__PURE__ */ r(
            "polygon",
            {
              points: "20,75 25,70 75,70 80,75 75,80 25,80",
              className: f[6] ? "fill-red-500" : "fill-gray-800"
            }
          ),
          /* @__PURE__ */ r(
            "circle",
            {
              cx: "90",
              cy: "140",
              r: "4",
              className: f[7] ? "fill-red-500" : "fill-gray-800"
            }
          )
        ] }) }, x);
      }) }),
      /* @__PURE__ */ r("div", { className: "flex-col space-y-1 bg-background-light-3xl p-1", children: C && /* @__PURE__ */ r("div", { className: "device-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1", children: C }) })
    ] })
  ] }) : /* @__PURE__ */ r($, { children: "Loading 7-Segment" });
};
export {
  ze as Buzzer,
  Ue as Console,
  Oe as Keyboard,
  Ye as LcdDisplay,
  Ve as LedsDisplay,
  He as PixelDisplay,
  Be as Rng,
  Fe as Rtc,
  Xe as SevenSegmentDisplay,
  Le as StorageDisk
};
