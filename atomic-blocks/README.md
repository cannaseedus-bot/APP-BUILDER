# Atomic Blocks (MX2⟁☣)

> **The fundamental unit of computation in the MX2LM operating system.**

---

## What Are Atomic Blocks?

An **Atomic Block** is the smallest meaningful unit of a system that can be:
- Reasoned about
- Executed
- Visualized
- Evolved
- Trained against

```
Atomic Block = (vectors, states, flows)
```

| Part | Symbol | Purpose |
|------|--------|---------|
| **@control** | ⟁ | Intent & control vectors |
| **@state** | ☣ | Mutable reality (CSS vars) |
| **@flow** | → | Transitions & causality |

---

## Why Atomic Blocks?

Traditional web stacks have no clean answer to:

> "What is the smallest unit of a system?"

| Approach | Unit | Problems |
|----------|------|----------|
| React | Component | Implicit state, render coupling |
| Vue | Component | Same |
| Vanilla JS | Function | No structure, no visibility |
| **Atomic Block** | Causal block | Explicit, serializable, trainable |

---

## Atomic Block Structure

```json
{
  "@id": "block.atomic",
  "@state": {
    "--var-name": "value"
  },
  "@control": {
    "@action_name": { "@pi": "function.name" }
  },
  "@flow": ["@init", "@derive", "@render"]
}
```

### @state

CSS variables that represent mutable state. Automatically reflected in CSS runtime.

```json
"@state": {
  "--count": 0,
  "--mode": "idle",
  "--entropy": 0.42,
  "--level": "ok"
}
```

### @control

Named control vectors that map to K'UHUL π functions or I/O operations.

```json
"@control": {
  "@increment": { "@pi": "counter.inc" },
  "@decrement": { "@pi": "counter.dec" },
  "@persist": { "@io": "idb.put", "@key": "state" },
  "@restore": { "@io": "idb.get", "@key": "state" }
}
```

### @flow

Ordered sequence of control vectors executed on state transitions.

```json
"@flow": ["@restore", "@derive", "@render"]
```

---

## Execution Model

```
┌─────────────────────────────────────────┐
│         ATOMIC BLOCK (MX2⟁☣)            │
│  { @state, @control, @flow }            │
└──────────────────┬──────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
┌──────▼──────┐         ┌──────▼──────┐
│ CSS RUNTIME │         │  K'UHUL π   │
│ Render from │         │ Compute     │
│ vars/attrs  │         │ deltas      │
└─────────────┘         └─────────────┘
```

1. **Atomic Block** holds state as CSS variables
2. **CSS Runtime** renders UI from vars (no JS rendering)
3. **K'UHUL π** computes state deltas
4. **JavaScript** only bridges I/O (events, fetch, IDB)

---

## Folder Structure

```
atomic-blocks/
├── README.md              # This file
├── agl-registry.json      # Atomic Glyph Language registry
├── api-runtime.json       # Glyph → API endpoint mappings
├── templates/             # Reusable atomic block templates
│   ├── counter.atomic.json
│   ├── form.atomic.json
│   └── dashboard.atomic.json
├── runtime/               # K'UHUL π functions & sw.js
│   ├── core.pi
│   ├── sw.js
│   └── patterns.css
├── flux-capacitor/        # ⚡ Temporal-Energy Execution Core
│   ├── README.md
│   ├── core.pi            # FLUX opcode implementations
│   ├── opcodes.json       # Opcode → AST mappings
│   └── flux.css           # CSS runtime integration
└── examples/              # Complete working examples & studio templates
    ├── counter-app/
    ├── black-code-editor/      # CANONICAL REFERENCE
    ├── quantum-fusion-engine/  # K'UHUL ⇄ C@@L ⇄ MX2LM Unification
    ├── entropy-processor/      # Entropy visualization UI
    ├── css-runtime/            # CSS Runtime controller
    └── atomic-portal/          # API command portal
```

---

## ⚡ FLUX_CAPACITOR — Temporal-Energy Spine

The **FLUX_CAPACITOR** (`flux-capacitor/`) is the temporal authority for all Atomic systems:

| Opcode | Purpose |
|--------|---------|
| `@flux.init` | Initialize temporal spine |
| `@flux.tick` | Advance exactly one lawful tick |
| `@flux.phase` | Transition execution phase |
| `@flux.energy` | Set/query system energy |
| `@flux.entropy` | Manage system entropy |
| `@flux.sync` | Synchronize subsystems |
| `@flux.halt` | Emergency temporal halt |

### Prime Law
```text
No component may create, measure, or advance time outside FLUX_CAPACITOR.
```

See `flux-capacitor/README.md` for complete documentation.

---

## ⚛️ Atomic Glyph Language (AGL)

The **AGL Registry** (`agl-registry.json`) defines all semantic glyphs:

| Glyph | Semantic | Domain |
|-------|----------|--------|
| `⟁flex` | layout.flex_container | layout |
| `⟁grid` | layout.grid_container | layout |
| `⟁danger` | state.hazard.elevated | state |
| `⟁warn` | state.hazard.warning | state |
| `⟁ok` | state.hazard.nominal | state |
| `⟁train` | cognition.training.active | cognition |
| `⟁prime` | cognition.inference.prime | cognition |

Each glyph includes:
- `@semantic` — Meaning
- `@xcfe` — Control flow binding
- `@css` — CSS selector/rule
- `@ast` — Structural definition
- `@hazard` — Hazard domain
- `@flux` — Temporal binding

---

## Canonical Example: Black Code Editor

The **Black Code Editor** (`examples/black-code-editor/`) is the canonical reference implementation demonstrating:

| Feature | Implementation |
|---------|----------------|
| **Atomic Block** | Complete `@state`, `@control`, `@flow`, `@css`, `@events` |
| **CSS Runtime** | `atomic-glyph.css` - state-driven rendering |
| **Glyphs** | `glyphs.css` - base64 SVG icons via `data-g` |
| **K'UHUL π** | `core.pi` - pure computation functions |
| **Service Worker** | `sw.js` - THE ONLY JavaScript |
| **XCFE Patterns** | `@if_then_else`, `@dispatch` control flow |
| **Tape System** | Multi-tape navigation without page changes |
| **Theme System** | CSS variable-based theming |

### Studio Base Template

This example also serves as a **studio base template** for building:
- Code editors
- Design tools
- Dashboard applications
- Canvas-based applications
- Any three-panel workspace

### Files

```
black-code-editor/
├── index.html         # Structure + embedded Atomic Block
├── atomic-glyph.css   # CSS Runtime (state → rendering)
├── glyphs.css         # Base64 SVG icon system
├── sw.js              # Service Worker (I/O only)
└── core.pi            # K'UHUL π functions
```

---

## ⚛️ Quantum Fusion Engine Example

The **Quantum Fusion Engine** (`examples/quantum-fusion-engine/`) demonstrates the K'UHUL ⇄ C@@L ⇄ MX2LM unification architecture:

| Feature | Implementation |
|---------|----------------|
| **Quantum Operators** | ⤍ Init, ⟿ Bind, ⟲ Execute, ↻ Transform, ⤨ Emit, ⤓ Collapse, ⤒ Entangle |
| **Three-Panel Layout** | Quantum Kernel, Fusion Engine, Quantum Monitor |
| **Weight Matrix** | 8×8 visualization of K'UHUL ⇄ C@@L binding weights |
| **Draggable Nodes** | Interactive quantum node positioning |
| **Real-time Metrics** | Superposition, Entanglement, Coherence, Entropy, Compression, Cipher |
| **Quantum Operations** | Entangle, Collapse, Superpose, Measure, Decohere, Reset |
| **CSS-Driven Animation** | Quantum paths, pulse effects, phase transitions |

### Quantum Operator Semantics

| Symbol | Operation | C@@L Binding |
|--------|-----------|--------------|
| ⤍ | Initialize | `c@@l.init` |
| ⟿ | Bind | `c@@l.bind` |
| ⟲ | Execute | `c@@l.exec` |
| ↻ | Transform | `c@@l.transform` |
| ⤨ | Emit | `c@@l.emit` |
| ⤓ | Collapse | `c@@l.collapse` |
| ⤒ | Entangle | `c@@l.entangle` |

### Files

```
quantum-fusion-engine/
└── index.html         # Complete quantum visualization
```

---

## 🌀 Entropy Processor UI Kit

The **Entropy Processor** (`examples/entropy-processor/`) demonstrates CSS-driven entropy visualization:

| Feature | Implementation |
|---------|----------------|
| **CSS Variables** | `--entropy` drives all visual properties |
| **Derived Properties** | `--energy`, `--pulse`, `--glow`, `--hue`, `--scale` |
| **Entropy Meter** | Animated progress bar with gradient fill |
| **Particle System** | Dynamic particles based on entropy level |
| **Grid Visualization** | 10×10 grid showing active entropy cells |
| **State Classes** | `.state-low`, `.state-medium`, `.state-high` |
| **Interactive Controls** | Increase, Decrease, Randomize, Stabilize |

### Entropy-Driven CSS

```css
:root {
  --entropy: 0.6;
  --glow: calc(var(--entropy) * 0.7);
  --hue: calc(var(--entropy) * 360);
  --scale: calc(1 + var(--entropy) * 0.15);
}
```

---

## 🎨 CSS Runtime UI Kit

The **CSS Runtime** (`examples/css-runtime/`) showcases the complete atomic CSS system:

| Feature | Implementation |
|---------|----------------|
| **Glyph API Endpoints** | ⟁ SCX, ⚡ Control, 🌀 State, 🧬 Execution, 🎨 Render |
| **Runtime Controls** | Entropy, Velocity, Signal, Glow, Blur, Hazard sliders |
| **Physics Simulation** | CSS-driven box with force application |
| **XCFE Control Flow** | Perception, Representation, Reasoning, Decision, Action |
| **API State Visualization** | Real-time response display |
| **Atomic Attributes** | `[⟁flex]`, `[⟁grid]`, `[⟁ghost]`, etc. |

### XCFE State Classes

```css
.xcfe-perception { filter: blur(calc(var(--blur)*1px)); }
.xcfe-representation { transform: scale(calc(1 + var(--entropy)*0.1)); }
.xcfe-reasoning { border-left: 3px solid var(--accent); }
.xcfe-decision { color: var(--accent); font-weight: 600; }
.xcfe-action { background: var(--accent-soft); }
```

---

## ⚡ Atomic Portal UI Kit

The **Atomic Portal** (`examples/atomic-portal/`) is a complete API command interface:

| Feature | Implementation |
|---------|----------------|
| **JSON API Commander** | Execute `@control` commands via textarea |
| **Quick Commands** | Pre-built buttons for common operations |
| **State Visualizer** | Real-time entropy, innovation, stability bars |
| **Render Zone** | Dynamic content rendering from API |
| **API Log** | Command execution history |
| **Live Feed** | Real-time event stream |
| **Embedded API Schema** | `<script type="application/json">` definition |

### API Command Format

```json
{
  "@control": "@render",
  "@data": {
    "type": "welcome",
    "message": "Portal Active",
    "energy": 0.9
  }
}
```

### Available Endpoints

| Command | Handler | Description |
|---------|---------|-------------|
| `@render` | `renderHandler` | Render templates to DOM |
| `@update_energy` | `energyHandler` | Update CSS variables |
| `@animate` | `animateHandler` | Apply animations |
| `@render_block` | `blockHandler` | Render atomic blocks |
| `@execute_sequence` | `sequenceHandler` | Run command sequences |

---

## 🔌 API Runtime Specification

The **API Runtime** (`api-runtime.json`) defines the glyph → API endpoint mapping:

| Glyph | Endpoint | Method | Description |
|-------|----------|--------|-------------|
| ⟁ | `/scx/execute` | POST | SCX Atomic CSS operations |
| ⚡ | `/control/flow` | POST | Control flow and logic |
| 🌀 | `/state/variable` | PUT | State variable management |
| 🧬 | `/execution/engine` | POST | Execution engine operations |
| 🎨 | `/render/engine` | POST | Rendering and visualization |

### K'UHUL Phase Endpoints

| Phase | Endpoint | Description |
|-------|----------|-------------|
| `[Pop]` | `/phase/activate` | Activation - system boot |
| `[Wo]` | `/phase/intention` | Intention - planning |
| `[Sek]` | `/phase/execute` | Execution - doing work |
| `[Xul]` | `/phase/transform` | Transformation - changing form |
| `[Ch'en]` | `/phase/render` | Render - making visible |

---

## CSS Runtime Integration

Atomic state maps directly to CSS:

```css
:root {
  /* State from @state */
  --count: 0;
  --mode: idle;
  --entropy: 0.42;
  --level: ok;
}

/* Rendering driven by state */
.card[data-level="ok"]     { border-color: var(--accent); }
.card[data-level="warn"]   { border-color: orange; }
.card[data-level="danger"] { border-color: red; }

/* Computed values */
.progress-bar {
  width: calc(var(--entropy) * 100%);
  transition: width 200ms ease;
}
```

No JavaScript rendering. CSS is the runtime.

---

## K'UHUL π Functions

Pure functions that compute state deltas:

```pi
fn counter.derive(state):
  let e = clamp(state["--entropy"], 0, 1)
  state["--level"] = match e:
    > 0.7  => "danger"
    > 0.35 => "warn"
    _      => "ok"
  return state

fn counter.inc(state):
  state["--count"] += 1
  state["--entropy"] = clamp(state["--entropy"] + 0.05, 0, 1)
  return counter.derive(state)
```

---

## JavaScript (I/O Only)

JS is demoted to I/O bridge:

```javascript
// Apply atomic state to CSS vars
function applyState(state) {
  const root = document.documentElement.style;
  for (const [k, v] of Object.entries(state)) {
    root.setProperty(k, String(v));
  }
}

// Dispatch control vector
async function dispatch(vector) {
  state = await KUHUL_PI.run(vector, state);
  applyState(state);
}

// Event → Control vector (that's it)
btn.onclick = () => dispatch("@increment");
```

---

## Why This Matters

### Serializable
Atomic blocks are JSON. Save, load, sync, version.

### Trainable
RLHF, n-grams, agent learning work on structured blocks.

### Visualizable
State is explicit. Debug by inspection.

### Compressible
SCXQ2 compression works on JSON AST.

### AI-Ready
Unlike JS apps, atomic systems can be understood structurally.

---

## Related Files

| File | Purpose |
|------|---------|
| `mx2lm-guide.md` | Complete system architecture |
| `SHARD-INTEGRATION.md` | GAS shard mesh |
| `GAS-INFRASTRUCTURE-LAYERS.md` | Remote execution |

---

```
STATUS: CANONICAL
VERSION: 1.0.0
GLYPH: MX2⟁☣
```
