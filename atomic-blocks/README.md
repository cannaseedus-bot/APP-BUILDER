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
├── gram-kernel.pi         # SCX-Enhanced @GRAM Learning Kernel
├── gram-kernel-full.pi    # Complete Self-Learning @GRAM Kernel
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
├── pi-compression/        # π-Compressed Glyph Encoding Library
│   ├── pi-glyph-schema.json  # Complete glyph category definitions
│   └── core.pi               # π-encoding, vector math, wavelets
└── examples/              # Complete working examples & studio templates
    ├── counter-app/
    ├── black-code-editor/      # CANONICAL REFERENCE
    ├── quantum-fusion-engine/  # K'UHUL ⇄ C@@L ⇄ MX2LM Unification
    ├── entropy-processor/      # Entropy visualization UI
    ├── css-runtime/            # CSS Runtime controller
    ├── atomic-portal/          # API command portal
    ├── qwen-compression/       # K'UHUL π QWEN vocab compression
    └── kuhul-svg3d/            # π-SVG-3D Glyph Streaming
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

## 🧠 @GRAM Kernel — Self-Learning Engine

The **@GRAM Kernel** (`gram-kernel.pi`, `gram-kernel-full.pi`) provides adaptive learning for the Atomic system:

### Capabilities

| Feature | Description |
|---------|-------------|
| **Pattern Observation** | Tracks every atomic block execution |
| **N-gram Learning** | Unigrams, bigrams, and sequence patterns |
| **Transition Probabilities** | Predicts likely next blocks |
| **Auto-Macro Generation** | Creates macros from frequent sequences |
| **Workflow Optimization** | Identifies inefficient patterns |
| **Error Pattern Fixes** | Auto-generates fixes for common errors |
| **Continuous Learning** | Self-improving learning loop |

### Core Functions

| Function | Purpose |
|----------|---------|
| `gram_observe` | Observe and record block events |
| `gram_analyze_patterns` | Analyze frequency patterns |
| `gram_suggest_next` | Suggest next blocks based on probabilities |
| `gram_auto_generate` | Generate macros, optimizations, fixes |
| `gram_learning_loop` | Continuous self-improvement |
| `atomic_execute_with_learning` | Execute blocks with observation |

### SCX Compression Learning

The kernel also includes SCX-specific learning (`gram-kernel.pi`):

```pi
[Pop gram_observe_scx]
  // Extract SCX patterns from element
  [Wo el]→[Sek get_attributes]→[Ch'en attrs]
  [Wo attrs]→[Sek filter [Sek starts_with "⟁"]]→[Ch'en scx_attrs]

  // Calculate compression ratio
  // Each SCX token ≈ 5-10 bytes vs 50-200 bytes in CSS
```

### Storage Schema

```
gram.ngrams.unigrams.{type}     → count
gram.ngrams.bigrams.{t1}_{t2}   → count
gram.transitions.{type}         → {next_type: count, ...}
gram.probabilities.{type}       → [[next, prob], ...]
gram.macros                     → [macro_blocks...]
gram.metrics.entropy            → float (decreases as system learns)
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/gram/start-learning` | POST | Start learning loop |
| `/gram/suggestions` | POST | Get next block suggestions |
| `/execute/with-learning` | POST | Execute with observation |
| `/gram/metrics` | GET | Get learning metrics |
| `/gram/report` | GET | Get learning report |

---

## 🔢 K'UHUL π QWEN Compression

The **QWEN Compression** (`examples/qwen-compression/`) demonstrates 1000x vocabulary compression using mathematical encoding:

| Feature | Implementation |
|---------|----------------|
| **1000x Compression** | 151,643 tokens → 151 CSS/SVG glyphs |
| **Mathematical Encoding** | π, e, φ, τ as encoding bases |
| **CSS Runtime** | All state via CSS variables |
| **AGL Glyphs** | Semantic icons via `data-g` attributes |
| **K'UHUL π Functions** | Pure computation in `core.pi` |
| **sw.js Only** | JavaScript demoted to I/O bridge |

### Compression Ratios

| Original | Compressed | Ratio |
|----------|------------|-------|
| 16GB model | 16MB | 1000x |
| 3MB vocab.json | 3KB CSS | 1000x |
| 151,643 tokens | 151 glyphs | 1004:1 |

### Mathematical Encoding Formula

```
token_encoding = constant × (token_id / constant)

Examples:
  Token 0 (!)        → π×0
  Token 31 (@)       → π×9.87
  Token 151643 (EOT) → τ×24135
```

### Files

```
qwen-compression/
├── index.html         # Structure + embedded Atomic Block
├── compression.css    # CSS Runtime (state → rendering)
├── glyphs.css         # AGL icon system via data-g
├── sw.js              # Service Worker (I/O only)
└── core.pi            # K'UHUL π pure functions
```

### Control Vectors

| Vector | K'UHUL π Function | Purpose |
|--------|-------------------|---------|
| `@compress` | `compression.execute` | Execute full compression |
| `@generate_css` | `compression.generate_css` | Generate CSS glyph definitions |
| `@show_encoding` | `compression.show_encoding` | Display math encoding table |
| `@export` | `compression.export` | Export compressed format |

---

## 🎬 K'UHUL π-SVG-3D Glyph Streaming

The **π-SVG-3D** (`examples/kuhul-svg3d/`) demonstrates real-time vector glyph streaming with 1000x compression:

| Feature | Implementation |
|---------|----------------|
| **π-Compressed Glyphs** | Binary format with π-magic header (0xCF 0x80) |
| **SVG-3D Rendering** | Vector graphics with 3D transformations |
| **Bézier Interpolation** | Cubic and quadratic curve rendering |
| **Delta Encoding** | Efficient frame-to-frame compression |
| **Motion Prediction** | π-weighted extrapolation for smooth playback |
| **Wavelet Transform** | Haar decomposition for signal compression |
| **CSS Runtime** | All state via CSS variables |

### π-Glyph Categories

| Category | Range | Examples |
|----------|-------|----------|
| **flow** | 0-31 | → ← ↑ ↓ ⟁ ⇄ ↻ ⊛ |
| **value** | 32-63 | ∅ ⊤ ⊥ ∞ ℘ Σ Δ Ω |
| **action** | 64-95 | ⚡ 🔄 💾 📤 🎯 🔗 ⚙ |
| **control** | 96-127 | Pop Wo Ch'en Sek Xul @state |
| **svg** | 128-191 | M L C Q A Z H V S T |
| **math** | 192-223 | + - * / ^ √ ∫ ∂ sin cos |
| **stream** | 224-247 | ⏵ ⏸ ⏹ ⏪ ⏩ 🔁 📊 🌊 |
| **special** | 248-255 | π-MAGIC π-EOF π-SYNC π-KEY |

### Binary Stream Format

```
Header:
  [0xCF 0x80]     π-Magic bytes
  [uint8]         Version
  [uint8]         Flags
  [uint16]        Frame count
  [uint32]        Glyph table offset

Frame:
  [float32]       Timestamp (π-units)
  [uint16]        Glyph count
  [glyph[]]       Encoded glyphs

Glyph:
  [uint8]         Glyph ID
  [int16]         X delta
  [int16]         Y delta
  [int16]         Z delta
  [uint8]         Scale (π-encoded)
  [uint8]         Rotation (π-encoded)
```

### Mathematical Encoding

```
Position:   x' = x / π → decode: x = x' × π
Scale:      s' = s × 40 → decode: s = s' / 40
Rotation:   r' = r mod 256 → decode: r = (r' / 256) × τ
Timestamp:  t' = frame / fps / π → decode: t = t' × π
```

### Files

```
kuhul-svg3d/
├── index.html         # Structure + embedded Atomic Block
├── pi-stream.css      # CSS Runtime (stream state → rendering)
├── glyphs.css         # AGL icon system via data-g
└── sw.js              # Service Worker with K'UHUL π functions
```

### Control Vectors

| Vector | K'UHUL π Function | Purpose |
|--------|-------------------|---------|
| `@init` | `stream.init` | Initialize streaming engine |
| `@play` | `stream.play` | Start playback |
| `@pause` | `stream.pause` | Pause playback |
| `@stop` | `stream.stop` | Stop and reset |
| `@render_frame` | `svg3d.render_frame` | Render single frame |
| `@export` | `svg3d.export_svg` | Export to SVG file |
| `@benchmark` | `stream.benchmark` | Performance benchmark |

### Core π Functions

| Function | Purpose |
|----------|---------|
| `pi.encode` | Encode value using π/e/φ/τ |
| `pi.decode` | Decode π-encoded value |
| `vector.magnitude` | Vector length calculation |
| `bezier.cubic` | Cubic Bézier interpolation |
| `bezier.quadratic` | Quadratic Bézier interpolation |
| `wavelet.haar_decompose` | Haar wavelet decomposition |
| `motion.predict` | Motion prediction with π-weighting |
| `delta.encode_frame` | Delta encode frame |
| `glyph.encode` | Encode glyph to binary format |

---

## 📐 π-Compression Library

The **π-Compression Library** (`pi-compression/`) provides the core mathematical functions:

### pi-glyph-schema.json

Complete glyph category definitions with:
- 8 categories (256 total glyphs)
- π-encoding formulas for each glyph
- Binary encoding specification
- SVG-3D coordinate system definition

### core.pi Functions

```pi
// Encode value using π-compression
[Pop pi.encode]
  [Wo @value]→[Ch'en value]
  [Wo @constant "π"]→[Ch'en constant]
  [Wo (/ value [Sek get constant [Sek pi.constants]])]→[Ch'en encoded]
  [Wo { "formula": [Sek str constant "×" encoded] }]→[Xul return]
[Xul]

// Cubic Bézier interpolation
[Pop bezier.cubic]
  [Wo @t]→[Ch'en t]
  [Wo @p0 @p1 @p2 @p3]→[Ch'en control_points]
  // B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
  ...
[Xul]

// Haar wavelet decomposition
[Pop wavelet.haar_decompose]
  [Wo @data]→[Ch'en data]
  // Low-pass: averages, High-pass: differences
  ...
[Xul]
```

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
