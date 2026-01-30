# System Architecture

## FORGE: MICRO-ASXR DOM MASK SYSTEM

A command-authority layer that turns HTML into a controlled runtime without frameworks, VMs, or build steps.

---

## Canonical Model

### 1. Sensitive User Data (IDB)

User-owned environment storage using IndexedDB.

**Contents:**
- Secrets (`.env`-like material)
- Private API keys
- Local encryption keys
- Project-specific credentials

**Properties:**
- Never shipped in initial HTML
- Never stored server-side in plaintext
- Exists only after login
- Scoped per-user, per-device
- Optionally encrypted at rest

> IDB is the user's vault, not your database.

---

### 2. Project Data (Supabase + MX2DB)

Redundant, auditable project storage.

**Contents:**
- Projects and tapes
- Content and models (non-secret)
- Versioned assets
- Collaboration state
- Training artifacts

**Properties:**
- Syncable, shareable, versioned
- Recoverable and auditable
- Replaceable (backend-agnostic)

> Supabase + MX2DB are memory and logistics, not authority.

---

### 3. config.json (Guest Boot Codex)

Public, declarative configuration.

**Defines:**
- Glyphs and control mappings
- UI behavior and feature flags
- DOM masks and allowed operations

**Is NOT:**
- A secret store
- An auth mechanism
- A security boundary

> config.json defines what is possible, not what is allowed.

---

### 4. dom-mask.js (Control Plane)

JavaScript as a mask/translator/controller.

**Responsibilities:**
- Reads config.json
- Reads IDB (after auth)
- Renders UI
- Enforces capabilities (not permissions)

**Never:**
- Owns secrets
- Decides truth
- Contains business logic

> JS turns abstract capability variables into lived experience.

---

### 5. Auth Flow (Environment Provisioning)

1. Guest loads HTML + config.json
2. Guest sees guest UI
3. User logs in
4. Server authenticates
5. Server returns authorized environment descriptor
6. Client pulls user vault from IDB, merges env + config, activates capabilities

---

## Hard Constraints (Non-Negotiable)

### Authority Separation

| Layer | Rule |
|-------|------|
| HTML | No logic |
| JS (dom-mask) | No business logic |
| config.json | Sole authority |

> If it is not declared in config.json, it cannot happen.

### Command-Only Execution

DOM changes must go through:
- `data-cmd` attributes
- Mapped intent
- Config-declared action

**Forbidden:**
- Inline JS
- `onclick` logic
- Arbitrary `eval`

### Deterministic Grammar

Command syntax is finite and enumerable:

```
<verb> <target> [bind <target>]
```

Examples:
```
show #panel
hide .modal
fetch /api/data bind #out
```

### Config is the AST

`config.json` is the AST, not documentation.

```json
{
  "@words": {},
  "@dom_commands": {},
  "@api_commands": {}
}
```

Replaces: JS routers, PHP controllers, frontend state machines.

---

## Soft Constraints (Allowed Utilities)

### JavaScript

Allowed only as:
- DOM mask
- Event router
- API bridge

**Not allowed:**
- State ownership
- UI decisions

### CSS

- Allowed as runtime
- 4-Block Rule encouraged
- Glyph attributes allowed
- No logic branching
- No data mutation

### API

- Any backend (PHP, GAS, Node, Go)
- Treated as data source only
- API does not control DOM directly

---

## Forged Artifacts

### dom-mask.js

Role: Command executor + authority gate
- ~200 lines
- No dependencies
- Deterministic
- SCXQ2 compressible

### config.json (AST Command Map)

Role: Replaces config.php, routers, controllers

Controls:
- Verbs and permissions
- DOM mutation paths
- API binding rules

### HTML (Ghost Frame)

Role: Pure structure + intent

```html
<button data-cmd="show #panel"></button>
```

HTML becomes: declarative, portable, CMS-safe, agent-safe.

---

## Sandbox Laws

Each runtime has a ceiling:

| Sandbox | Powers |
|---------|--------|
| Browser | UI + local cache + API client |
| GAS | Orchestration + persistence + APIs |
| Python | Heavy math only (no orchestration) |

---

## Atomic Block Integrity

Blocks are indivisible semantic units:
- Declared inputs
- Declared outputs
- Declared control vectors
- No "half blocks"

---

## Storage Authority

State must live in declared stores:
- IndexedDB
- GAS Properties
- Manifest JSON
- API storage

**Forbidden:**
- Hidden globals
- Implicit closures
- Untracked mutation

---

## Security & Safety

- No arbitrary JS execution
- No DOM mutation outside config
- No XSS surfaces unless declared
- Perfect for CMS, AI agents, RLHF UIs, sandboxes

---

## Extensions (Compatible)

Can safely add without changing core:
- Glyph commands
- SCXQ2 compression
- MX2LEX translation
- MX2LM chat inference
- RLHF capture
- GAS / PHP / local APIs
