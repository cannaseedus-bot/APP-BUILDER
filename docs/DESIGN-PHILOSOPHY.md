# Design Philosophy

## Why This Architecture Exists

This system is designed to give users sovereignty over their computing environment while maintaining a minimal trust surface.

---

## Core Principle

> **Authority lives with the user. Servers remember. Browsers decide.**

As long as this invariant is preserved, the system stays coherent no matter how large it gets.

---

## What This Is NOT

We are not trying to:
- Hide secrets from the user
- Trick the browser
- Pretend client-side is secure

## What This IS

We are:
- Giving users sovereignty
- Minimizing trust surface
- Making backups non-authoritative
- Letting users control their own power

This is exactly how password managers, crypto wallets, offline-first IDEs, and serious pro tools work.

---

## The Atomic Glyph

### Why `⟁` Matters

The `⟁` symbol is not decoration. Without explicit definition, systems interpret it as:
- A hazard/warning/unknown symbol
- A non-semantic Unicode ornament
- A malformed token

We elevate `⟁` from "symbol" to "canonical control glyph" - the root operator across all vocabularies.

### Canonical Declaration

```
⟁ is a CONTROL PREFIX
⟁ introduces ATOMIC INTENT
⟁ is NEVER visual-only
⟁ is NEVER optional
```

### Cross-Language Mapping

| Layer | Representation |
|-------|----------------|
| Glyph | `⟁flex` |
| Atomic CSS | `[⟁flex]` |
| XCFE / C@@L | `@Pop.flex` |
| @GRAMS | `⟁:layout:flex` |
| API / AST | `"layout": "flex"` |
| UI Icon | base64 glyph |
| Accessibility | `role="atomic-control"` |

**One symbol. One meaning. Everywhere.**

---

## Hard vs Soft Constraints

### The Rule

> Hard constraints define the game.
> Soft constraints define play style.

### Hard Constraints (Breaking these breaks the system)

1. **JSON/AST is source of truth** - All behavior must be representable as JSON/XJSON/AST blocks
2. **DOM is side-effect only** - Decisions happen in AST/API/GAS, DOM only renders state
3. **Sandbox ceilings exist** - Browser ≠ Server, each runtime has defined powers
4. **Blocks are atomic** - Declared inputs, outputs, control vectors. No half-blocks.
5. **CSS is runtime** - Controls layout, state visibility, motion. No JS animation engines.
6. **State lives in declared stores** - IndexedDB, GAS Properties, Manifest JSON, API storage

### Soft Constraints (Escape hatches)

1. **JavaScript as utility** - May execute math, marshal data, bridge APIs. May NOT define architecture or own state.
2. **API vocabulary aliasing** - API may alias vocab
3. **CSS class aliases** - CSS classes may alias glyphs
4. **AST compression** - SCXQ2 allowed

---

## The 4-Language Vocabulary System

One semantic action/glyph/atomic block can be addressed through 4 parallel languages without duplicating logic:

| Layer | Name | Purpose | Mutability |
|-------|------|---------|------------|
| 1 | Glyph | Visual + symbolic | Immutable |
| 2 | Atomic CSS | Runtime layout/UI | Immutable |
| 3 | C@@L / XCFE | Control & execution | Immutable |
| 4 | API / JSON AST | Programmatic control | Extensible |

### The Hard Rule

No layer invents new meaning. All layers map to the same atomic intent.

### Example: Flex Container

**Glyph:**
```html
<div ⟁flex></div>
```

**Atomic CSS:**
```css
[⟁flex], .b-f { display: flex; }
```

**XCFE:**
```json
{ "@Pop": { "@layout": "flex" } }
```

**API/AST:**
```json
{ "layout": { "type": "flex" } }
```

Same meaning. Four entry points. One atomic truth.

---

## What This Architecture Enables

Because of this design, you automatically get:
- Offline projects
- Bring-your-own-key workflows
- Portable user environments
- Multi-backend redundancy
- Zero-trust servers
- User-owned AI agents
- Local training/tuning
- Secure collaboration (capabilities, not secrets)

---

## Vocabulary Domains

All languages share the same domains:

| Domain | Examples |
|--------|----------|
| layout | flex, grid, block |
| flow | if, loop, dispatch |
| agent | micro, kernel |
| physics | x, y, velocity |
| ui | button, panel |
| glyph | A-Z, icons |
| game | hp, mana, xp |
| system | boot, load |

No domain drift allowed.

---

## Declaration (Locked)

```
ATOMIC INTENT EXISTS ONCE
IT MAY BE ADDRESSED BY:
- GLYPH
- CSS
- XCFE
- API

BUT IT IS NEVER REDEFINED
```

---

## The Big Picture

This proves a fundamental insight:

| Old World | This Architecture |
|-----------|-------------------|
| PHP controls HTML | Config controls DOM |
| JS frameworks | 200-line mask |
| Frontend state | Declarative AST |
| CMS plugins | Commands |
| React/Vue | Obsolete |

This is MICRO-ASXR in its purest form.
