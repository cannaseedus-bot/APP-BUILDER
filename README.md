# APP-BUILDER

**ASX Full-Stack Development Environment** - A cognitive architecture combining atomic blocks, n-gram language models, and K'uhul symbolic execution.

## Overview

APP-BUILDER is a framework for building intelligent applications using:

- **Atomic Block Architecture** - XCFE control/variable/view semantic blocks
- **N-Gram Engine** - Multi-level language processing (unigram through supagram)
- **Micro-Agent Swarm** - Pattern matching and command processing
- **K'uhul Processor** - 5-phase symbolic execution cycle
- **DOM Mask System** - Config-driven UI control without frameworks

## Quick Start

```bash
# Clone and enter repository
git clone <repository-url>
cd APP-BUILDER

# Install dependencies (optional, for cluster features)
npm install

# Start local server
python -m http.server 8000
# or
npx http-server

# Open in browser
open http://localhost:8000
```

## Core Concepts

### Atomic Glyph Language

The system uses a glyph-based control language:

| Symbol | Purpose |
|--------|---------|
| `⟁` | K'UHUL glyph delimiter - atomic control prefix |
| `@` | Control flow prefix (XCFE) |

### Architecture Layers

| Layer | Role | Authority |
|-------|------|-----------|
| HTML | Structure + intent | None (declarative) |
| CSS | Runtime + layout | Visual state |
| config.json | Command AST | Full authority |
| dom-mask.js | Projection layer | Execution only |

### Data Storage Model

1. **IDB (IndexedDB)** - User-owned secrets and local state
2. **Supabase/MX2DB** - Cloud backup and sync (non-authoritative)
3. **config.json** - Public declarative configuration

## Project Structure

```
APP-BUILDER/
├── src/                    # Core source code
│   ├── atomic/            # Atomic block components
│   ├── ngram/             # N-gram processing engine
│   ├── agents/            # Micro-agent implementations
│   ├── pipeline/          # Data orchestration
│   └── kuhul/             # K'uhul processor
├── apps/                   # Application modules
├── packages/               # Shared packages
├── config/                 # Configuration files
├── database/               # Database utilities
├── gas/                    # Google Apps Script integrations
├── python/                 # Python services
├── scripts/                # Build/utility scripts
└── docs/                   # Documentation
```

## Usage

### HTML with Atomic Commands

```html
<button data-cmd="show #panel">Open</button>
<button data-cmd="fetch /api/posts bind #list">Load</button>
<div id="panel" style="display:none"></div>
```

### Atomic CSS Attributes

```html
<div ⟁flex ⟁col ⟁g2>
  <section ⟁p3 ⟁border>Content</section>
</div>
```

### Agent Query Processing

```javascript
import { CognitiveQueryProcessor } from './cluster/callgrams-integration-example.js';

const processor = new CognitiveQueryProcessor();
const result = await processor.processQuery("What is the capital of France?");
// → { answer: 'Paris', confidence: 0.989, activation: 5.678 }
```

## Key Technologies

| Technology | Purpose |
|------------|---------|
| C@@L @GRAMS | Cognitive architecture with autonomous agents |
| SCXQ2 | Compression (98.5% reduction) |
| XCFE | Execution control flow enforcement |
| K'UHUL | 5-stage symbolic execution engine |
| XJSON | Extensible JSON with visual cognition |
| MX2 | Polyglot model integration |

## Performance

| Metric | Traditional | APP-BUILDER |
|--------|-------------|-------------|
| Model load | 40s | 150ms |
| Inference | 2-5s | 20ms |
| Compression | - | 98.5% reduction |
| Scaling | - | Near-linear |

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System design and constraints |
| [Atomic System](docs/ATOMIC-SYSTEM-README.md) | Atomic block reference |
| [Examples](docs/EXAMPLES.md) | Code examples |
| [Plugins](docs/PLUGINS.md) | Plugin development |
| [GAS Infrastructure](docs/GAS-INFRASTRUCTURE-LAYERS.md) | Google Apps Script setup |
| [Local API Setup](docs/LOCAL-REST-API-SETUP.md) | Local development |
| [Design Philosophy](docs/DESIGN-PHILOSOPHY.md) | Design rationale |

## Prerequisites

- Node.js 18+ (for cluster operations)
- Modern browser (for web interfaces)
- Python 3.8+ (optional, for local server)

## What You Can Build

- **Fast inference** - 267x faster using compressed deltas
- **Domain specialists** - 92% accuracy on fine-tuned tasks
- **Training datasets** - Generate high-quality examples
- **RLHF pairs** - Create preference pairs for alignment
- **Mesh networks** - Distributed autonomous agents

## License

See LICENSE file for details.

---

*From theory to production code in cognitive milliseconds*
