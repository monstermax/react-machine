

https://lions-wing.net/lessons/hardware/hard.html



# Z80 vs 8086 : Comparaison


## Z80 (Zilog Z80)
- Architecture : 8-bit CPU, adressage 16-bit
- Registres : A, F, B, C, D, E, H, L (+ shadow registers)
- Mémoire : 64KB max (16-bit addressing)
- Complexité : ~158 opcodes
- Bus : 8-bit data bus
- Période : 1976-présent
- Utilisé dans : ZX Spectrum, MSX, Game Boy, CP/M

## 8086 (Intel 8086)
- Architecture : 16-bit CPU, adressage 20-bit (segmenté!)
- Registres : AX, BX, CX, DX, SI, DI, BP, SP (tous 16-bit)
- Mémoire : 1MB max (20-bit addressing avec segments)
- Complexité : ~90 opcodes de base mais modes complexes
- Bus : 16-bit data bus
- Période : 1978-présent
- Utilisé dans : IBM PC, DOS, Windows (début)


```
┌─────────────────┬──────────────┬──────────┬───────────┐
│                 │ REACT CPU    │ Z80      │ 8086      │
├─────────────────┼──────────────┼──────────┼───────────┤
│ Data Width      │ 8-bit        │ 8-bit    │ 16-bit    │
│ Address Width   │ 16-bit       │ 16-bit   │ 20-bit    │
│ Max Memory      │ 64KB         │ 64KB     │ 1MB       │
│ Registers       │ A,B,C,D      │ A,B,C,D  │ AX,BX,CX  │
│                 │ (8-bit)      │ E,H,L    │ DX,SI,DI  │
│                 │              │ (8-bit)  │ (16-bit)  │
│ Stack Pointer   │ 16-bit       │ 16-bit   │ 16-bit    │
│ Flags           │ Z, C         │ S,Z,H,P  │ O,D,I,T   │
│                 │              │ N,C      │ S,Z,A,P,C │
│ Segments        │ NON          │ NON      │ OUI       │
│ Opcodes         │ ~60          │ ~158     │ ~90+      │
│ Complexité      │ ⭐           │ ⭐⭐⭐   │ ⭐⭐⭐⭐⭐│
└─────────────────┴──────────────┴──────────┴───────────┘
```



# Architecture Multi-CPU

## Concept

Supporter plusieurs types de CPU avec une architecture commune :

```tsx
<Cpu type="custom">    // Ton ISA actuel (par défaut)
<Cpu type="z80">       // Z80 compatible
<Cpu type="8086">      // 8086 compatible (futur, très lointain)
```

---

## Structure des Fichiers

```
/beta/api/
  ├── Cpu.api.ts              # Interface commune
  ├── Cpu_Custom.api.ts       # Implémentation ton ISA
  ├── Cpu_Z80.api.ts          # Implémentation Z80
  └── Cpu_8086.api.ts         # Implémentation 8086 (futur)

/beta/components/Cpu/
  ├── Cpu.tsx                 # Composant React principal
  ├── CpuFactory.ts           # Factory pour créer le bon CPU
  └── registers/
      ├── RegistersCustom.tsx
      ├── RegistersZ80.tsx
      └── Registers8086.tsx
```

---

## Interface Commune

```typescript
// Cpu.api.ts - Interface de base

export interface ICpu {
    // Identification
    type: 'custom' | 'z80' | '8086';
    architecture: '8bit' | '16bit';
    
    // Registres (abstraction)
    getRegister(name: string): u8 | u16;
    setRegister(name: string, value: u8 | u16): void;
    
    // Exécution
    executeCycle(): void;
    reset(): void;
    
    // État
    halted: boolean;
    paused: boolean;
    clockCycle: number;
    
    // Mémoire
    memoryBus: MemoryBus | null;
    
    // Interruptions
    interrupt?: Interrupt | null;
    
    // Clock
    clock?: Clock | null;
}


export abstract class BaseCpu extends EventEmitter implements ICpu {
    public abstract type: 'custom' | 'z80' | '8086';
    public abstract architecture: '8bit' | '16bit';
    
    public halted = false;
    public paused = true;
    public clockCycle = 0;
    public memoryBus: MemoryBus | null = null;
    public interrupt: Interrupt | null = null;
    public clock: Clock | null = null;
    
    abstract executeCycle(): void;
    abstract reset(): void;
    abstract getRegister(name: string): u8 | u16;
    abstract setRegister(name: string, value: u8 | u16): void;
    
    // Méthodes communes
    togglePaused(): void {
        this.paused = !this.paused;
    }
    
    readMemory(address: u16): u8 {
        if (!this.memoryBus) return U8(0);
        return this.memoryBus.readMemory(address);
    }
    
    writeMemory(address: u16, value: u8): void {
        if (!this.memoryBus) return;
        this.memoryBus.writeMemory(address, value);
    }
}
```

---

## Implémentation Custom (ton CPU actuel)

```typescript
// Cpu_Custom.api.ts

export class CpuCustom extends BaseCpu {
    public type = 'custom' as const;
    public architecture = '8bit' as const;
    
    // Registres 8-bit
    public A: u8 = U8(0);
    public B: u8 = U8(0);
    public C: u8 = U8(0);
    public D: u8 = U8(0);
    
    // Registres 16-bit
    public PC: u16 = U16(0);
    public SP: u16 = U16(0xFEFF);
    
    // Flags
    public FLAGS: u8 = U8(0);
    
    getRegister(name: string): u8 | u16 {
        switch(name) {
            case 'A': return this.A;
            case 'B': return this.B;
            case 'C': return this.C;
            case 'D': return this.D;
            case 'PC': return this.PC;
            case 'SP': return this.SP;
            case 'FLAGS': return this.FLAGS;
            default: return U8(0);
        }
    }
    
    setRegister(name: string, value: u8 | u16): void {
        switch(name) {
            case 'A': this.A = U8(value); break;
            case 'B': this.B = U8(value); break;
            case 'C': this.C = U8(value); break;
            case 'D': this.D = U8(value); break;
            case 'PC': this.PC = U16(value); break;
            case 'SP': this.SP = U16(value); break;
            case 'FLAGS': this.FLAGS = U8(value); break;
        }
    }
    
    executeCycle(): void {
        // Ton implémentation actuelle
        // ...
    }
    
    reset(): void {
        this.A = U8(0);
        this.B = U8(0);
        this.C = U8(0);
        this.D = U8(0);
        this.PC = U16(0);
        this.SP = U16(0xFEFF);
        this.FLAGS = U8(0);
        this.halted = false;
        this.clockCycle = 0;
    }
}
```

---

## Implémentation Z80

```typescript
// Cpu_Z80.api.ts

export class CpuZ80 extends BaseCpu {
    public type = 'z80' as const;
    public architecture = '8bit' as const;
    
    // Registres principaux 8-bit
    public A: u8 = U8(0);
    public F: u8 = U8(0);  // Flags
    public B: u8 = U8(0);
    public C: u8 = U8(0);
    public D: u8 = U8(0);
    public E: u8 = U8(0);
    public H: u8 = U8(0);
    public L: u8 = U8(0);
    
    // Shadow registers (alternate set)
    public A_: u8 = U8(0);
    public F_: u8 = U8(0);
    public B_: u8 = U8(0);
    public C_: u8 = U8(0);
    public D_: u8 = U8(0);
    public E_: u8 = U8(0);
    public H_: u8 = U8(0);
    public L_: u8 = U8(0);
    
    // Registres spéciaux 16-bit
    public PC: u16 = U16(0);
    public SP: u16 = U16(0xFFFF);
    public IX: u16 = U16(0);  // Index register
    public IY: u16 = U16(0);  // Index register
    
    // Registres interruption
    public I: u8 = U8(0);   // Interrupt vector
    public R: u8 = U8(0);   // Memory refresh
    public IFF1: boolean = false;  // Interrupt enable flag
    public IFF2: boolean = false;  // Interrupt temp save
    public IM: u8 = U8(0);  // Interrupt mode (0, 1, 2)
    
    // Helper: accès aux paires de registres
    get BC(): u16 { return U16((this.B << 8) | this.C); }
    set BC(val: u16) { this.B = U8(val >> 8); this.C = U8(val); }
    
    get DE(): u16 { return U16((this.D << 8) | this.E); }
    set DE(val: u16) { this.D = U8(val >> 8); this.E = U8(val); }
    
    get HL(): u16 { return U16((this.H << 8) | this.L); }
    set HL(val: u16) { this.H = U8(val >> 8); this.L = U8(val); }
    
    get AF(): u16 { return U16((this.A << 8) | this.F); }
    set AF(val: u16) { this.A = U8(val >> 8); this.F = U8(val); }
    
    getRegister(name: string): u8 | u16 {
        switch(name) {
            case 'A': return this.A;
            case 'F': return this.F;
            case 'B': return this.B;
            case 'C': return this.C;
            case 'D': return this.D;
            case 'E': return this.E;
            case 'H': return this.H;
            case 'L': return this.L;
            case 'BC': return this.BC;
            case 'DE': return this.DE;
            case 'HL': return this.HL;
            case 'AF': return this.AF;
            case 'PC': return this.PC;
            case 'SP': return this.SP;
            case 'IX': return this.IX;
            case 'IY': return this.IY;
            default: return U8(0);
        }
    }
    
    setRegister(name: string, value: u8 | u16): void {
        switch(name) {
            case 'A': this.A = U8(value); break;
            case 'F': this.F = U8(value); break;
            case 'B': this.B = U8(value); break;
            case 'C': this.C = U8(value); break;
            case 'D': this.D = U8(value); break;
            case 'E': this.E = U8(value); break;
            case 'H': this.H = U8(value); break;
            case 'L': this.L = U8(value); break;
            case 'BC': this.BC = U16(value); break;
            case 'DE': this.DE = U16(value); break;
            case 'HL': this.HL = U16(value); break;
            case 'AF': this.AF = U16(value); break;
            case 'PC': this.PC = U16(value); break;
            case 'SP': this.SP = U16(value); break;
            case 'IX': this.IX = U16(value); break;
            case 'IY': this.IY = U16(value); break;
        }
    }
    
    executeCycle(): void {
        if (this.halted || this.paused) return;
        
        // Fetch opcode
        const opcode = this.readMemory(this.PC);
        this.PC = U16(this.PC + 1);
        
        // Execute selon opcode Z80
        this.executeZ80Opcode(opcode);
        
        this.clockCycle++;
        this.emit('state', { clockCycle: this.clockCycle });
    }
    
    private executeZ80Opcode(opcode: u8): void {
        switch(opcode) {
            case 0x00: // NOP
                break;
                
            case 0x3E: // LD A, n
                this.A = this.readMemory(this.PC);
                this.PC = U16(this.PC + 1);
                break;
                
            case 0x06: // LD B, n
                this.B = this.readMemory(this.PC);
                this.PC = U16(this.PC + 1);
                break;
                
            case 0x80: // ADD A, B
                this.addA(this.B);
                break;
                
            case 0x90: // SUB B
                this.subA(this.B);
                break;
                
            case 0xC3: // JP nn
                const low = this.readMemory(this.PC);
                this.PC = U16(this.PC + 1);
                const high = this.readMemory(this.PC);
                this.PC = U16((high << 8) | low);
                break;
                
            // ... 150+ autres opcodes à implémenter
                
            default:
                console.warn(`Unknown Z80 opcode: 0x${opcode.toString(16)}`);
                this.halted = true;
        }
    }
    
    private addA(value: u8): void {
        const result = this.A + value;
        
        // Flags Z80
        this.setFlag('S', (result & 0x80) !== 0);  // Sign
        this.setFlag('Z', (result & 0xFF) === 0);  // Zero
        this.setFlag('H', ((this.A & 0x0F) + (value & 0x0F)) > 0x0F);  // Half carry
        this.setFlag('P', result > 0xFF);  // Overflow
        this.setFlag('N', false);  // Add/Sub
        this.setFlag('C', result > 0xFF);  // Carry
        
        this.A = U8(result);
    }
    
    private subA(value: u8): void {
        const result = this.A - value;
        
        this.setFlag('S', (result & 0x80) !== 0);
        this.setFlag('Z', (result & 0xFF) === 0);
        this.setFlag('H', (this.A & 0x0F) < (value & 0x0F));
        this.setFlag('P', result < 0);
        this.setFlag('N', true);
        this.setFlag('C', result < 0);
        
        this.A = U8(result);
    }
    
    private setFlag(flag: 'S'|'Z'|'H'|'P'|'N'|'C', value: boolean): void {
        const masks = {
            'S': 0x80,  // Bit 7
            'Z': 0x40,  // Bit 6
            'H': 0x10,  // Bit 4
            'P': 0x04,  // Bit 2 (Parity/Overflow)
            'N': 0x02,  // Bit 1
            'C': 0x01,  // Bit 0
        };
        
        if (value) {
            this.F = U8(this.F | masks[flag]);
        } else {
            this.F = U8(this.F & ~masks[flag]);
        }
    }
    
    reset(): void {
        this.A = this.B = this.C = this.D = this.E = this.H = this.L = U8(0);
        this.F = U8(0);
        this.A_ = this.B_ = this.C_ = this.D_ = this.E_ = this.H_ = this.L_ = U8(0);
        this.F_ = U8(0);
        this.PC = U16(0);
        this.SP = U16(0xFFFF);
        this.IX = this.IY = U16(0);
        this.I = this.R = U8(0);
        this.IFF1 = this.IFF2 = false;
        this.IM = U8(0);
        this.halted = false;
        this.clockCycle = 0;
    }
}
```

---

## Factory Pattern

```typescript
// CpuFactory.ts

export class CpuFactory {
    static create(type: 'custom' | 'z80' | '8086'): ICpu {
        switch(type) {
            case 'custom':
                return new CpuCustom();
            
            case 'z80':
                return new CpuZ80();
            
            case '8086':
                throw new Error('8086 not yet implemented');
            
            default:
                throw new Error(`Unknown CPU type: ${type}`);
        }
    }
}
```

---

## Composant React

```tsx
// Cpu.tsx

export type CpuProps = {
    type?: 'custom' | 'z80' | '8086';  // Nouveau prop
    hidden?: boolean;
    threads?: number;
    children?: React.ReactNode;
}

export const Cpu: React.FC<CpuProps> = (props) => {
    const { type = 'custom', hidden, children } = props;
    const { cpuRef } = useComputer();
    
    const [cpuInstance, setCpuInstance] = useState<ICpu | null>(null);
    
    // Instanciate CPU avec le bon type
    useEffect(() => {
        const _instanciateCpu = () => {
            const cpu = CpuFactory.create(type);
            setCpuInstance(cpu);
            cpuRef.current = cpu;
            
            // ... reste de l'initialisation
        };
        
        const timer = setTimeout(_instanciateCpu, 100);
        return () => clearTimeout(timer);
    }, [type]);  // Re-créer si type change
    
    // ... reste du composant
    
    return (
        <div className="cpu">
            {/* Afficher les bons registres selon le type */}
            {type === 'custom' && <RegistersCustom registers={registers} />}
            {type === 'z80' && <RegistersZ80 registers={registers} />}
            {type === '8086' && <Registers8086 registers={registers} />}
        </div>
    );
};
```

---

## Utilisation

```tsx
// Ton CPU actuel
<Computer>
    <Cpu type="custom">
        <Clock frequency={10} />
    </Cpu>
    {/* ... */}
</Computer>

// Mode Z80
<Computer>
    <Cpu type="z80">
        <Clock frequency={10} />
    </Cpu>
    {/* ... */}
</Computer>

// Switch dynamique
const [cpuType, setCpuType] = useState<'custom' | 'z80'>('custom');

<select value={cpuType} onChange={(e) => setCpuType(e.target.value)}>
    <option value="custom">Custom ISA</option>
    <option value="z80">Z80</option>
</select>

<Computer>
    <Cpu type={cpuType}>
        <Clock frequency={10} />
    </Cpu>
    {/* ... */}
</Computer>
```

---

## Migration Progressive

### Étape 1 : Refactoring (1-2 jours)
- Créer interface `ICpu`
- Créer `BaseCpu`
- Renommer ton CPU actuel en `CpuCustom`
- Créer `CpuFactory`
- Tout doit encore fonctionner !

### Étape 2 : Structure Z80 (1 jour)
- Créer `CpuZ80` vide qui étend `BaseCpu`
- Ajouter registres Z80
- Implémenter NOP seulement
- Tester que ça compile

### Étape 3 : Instructions de base (1 semaine)
- Load/Store (LD)
- Arithmetic (ADD, SUB, INC, DEC)
- Logic (AND, OR, XOR)
- Jumps (JP, JR, CALL, RET)

### Étape 4 : Instructions avancées (2 semaines)
- Shifts/Rotates
- Bit operations
- Block operations
- Flags complets

