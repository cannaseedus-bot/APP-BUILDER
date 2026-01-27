# CODEX - Extracted Code Files Index

This directory contains all code blocks extracted from the README.md and CALL-GRAMS documentation files.

---

## Core System Files

### atomic.css
**Source**: Already extracted
**Description**: Core CSS atomic design system with K'UHUL visual primitives, color tokens, layout utilities, and glass morphism effects.

### atomic.khl
**Source**: Already extracted
**Description**: K'UHUL domain-specific language (DSL) for declarative DOM manipulation and XJSON processing.

### atomic.xjson
**Source**: README.md (lines 753-934)
**Description**: Machine-readable ATOMIC visual cognition model encoding CSS primitives, color system, layout rules, attribute bindings, K'UHUL DOM engine instructions, XCFE control vectors, and visual entropy modes.

---

## Service Worker & Caching (from README.md)

### readme-sw-cache.js
**Source**: README.md (lines 516-521)
**Description**: Service worker cache strategy for offline atomic.css loading with install event handling.

### readme-sw-routing.js
**Source**: README.md (lines 526-529)
**Description**: Service worker fetch routing for cached atomic.css delivery.

---

## C@@L @GRAMS Core Agent System (from CALL-GRAMS-PRACTICAL-RUNTIME.md)

### callgrams-kuhul-agent.js
**Source**: CALL-GRAMS-PRACTICAL-RUNTIME.md (lines 67-242)
**Description**: Base KuhulAgent class - autonomous cognitive agent with perception, decision-making, action execution, and signal propagation. Core building block of the distributed agent network.

### callgrams-glyph-table.js
**Source**: CALL-GRAMS-PRACTICAL-RUNTIME.md (lines 249-279)
**Description**: Glyph-to-weight mapping table. Glyphs are compressed weight carriers encoding semantic primitives (base glyphs, operators, constants, constraints).

### callgrams-event-agent.js
**Source**: CALL-GRAMS-PRACTICAL-RUNTIME.md (lines 293-331)
**Description**: EventAgent class for factual grounding - injects non-derivable facts into the agent network with confidence=1.0 to prevent hallucination.

### callgrams-invariant-agent.js
**Source**: CALL-GRAMS-PRACTICAL-RUNTIME.md (lines 384-446)
**Description**: InvariantAgent class for constraint enforcement - validates signals against logical, physical, and mathematical constraints, blocks invalid signal flow.

### callgrams-mesh-network.js
**Source**: CALL-GRAMS-PRACTICAL-RUNTIME.md (lines 507-534)
**Description**: Mesh network topology builder - creates spatial proximity-based connections between agents (semantic similarity = physical proximity).

### callgrams-force-clustering.js
**Source**: CALL-GRAMS-PRACTICAL-RUNTIME.md (lines 541-585)
**Description**: Force-based clustering algorithm - applies attractive forces between connected agents and repulsive forces between all agents to form emergent semantic clusters.

### callgrams-cluster-detection.js
**Source**: CALL-GRAMS-PRACTICAL-RUNTIME.md (lines 597-629)
**Description**: Cluster detection using depth-first search to find connected components in the agent mesh network.

### callgrams-cluster-collapse.js
**Source**: CALL-GRAMS-PRACTICAL-RUNTIME.md (lines 634-665)
**Description**: Collapses agent clusters to structured data - aggregates activation, events, and role distribution with confidence scoring using tanh.

### callgrams-answer-synthesis.js
**Source**: CALL-GRAMS-PRACTICAL-RUNTIME.md (lines 670-710)
**Description**: Complete answer synthesis pipeline - runs cognitive clock, detects clusters, collapses dominant cluster, synthesizes natural language answer from event facts.

### callgrams-scxq2-serialization.js
**Source**: CALL-GRAMS-PRACTICAL-RUNTIME.md (lines 724-783)
**Description**: SCXQ2 compression and decompression for agent graph serialization - encodes/decodes brain state with Base64 + SCX wrapper format.

### callgrams-brain-state.js
**Source**: CALL-GRAMS-PRACTICAL-RUNTIME.md (lines 787-844)
**Description**: Complete brain state export/import - saves entire agent network to compressed .scx file and restores from snapshot.

### callgrams-cognitive-clock.js
**Source**: CALL-GRAMS-PRACTICAL-RUNTIME.md (lines 853-869)
**Description**: Cognitive clock execution loop - ticks all agents, applies semantic forces, rebuilds mesh network, updates visualizations.

### callgrams-integration-example.js
**Source**: CALL-GRAMS-PRACTICAL-RUNTIME.md (lines 905-967)
**Description**: Complete integration example - spawns pattern/event/invariant agents, builds mesh network, runs cognition, synthesizes answer, exports brain state.

---

## Data Harvesting & Training Pipeline (from CALL-GRAMS-DATA-HARVEST.md)

### callgrams-quick-weight-answer.js
**Source**: CALL-GRAMS-DATA-HARVEST.md (lines 116-155)
**Description**: Quick weight answers using SCXQ2 delta loading - 267× faster inference (150ms vs 40s) by loading tiny weight deltas instead of full models.

### callgrams-finetuned-answer.js
**Source**: CALL-GRAMS-DATA-HARVEST.md (lines 191-244)
**Description**: Finetuned specialist routing - classifies query type (coding/reasoning/creative/factual) and routes to specialized delta for domain-specific accuracy (92% on coding tasks).

### callgrams-training-data.js
**Source**: CALL-GRAMS-DATA-HARVEST.md (lines 261-306)
**Description**: Training data generation from cluster results - converts run results to structured training examples in JSONL format.

### callgrams-rlhf-dataset.js
**Source**: CALL-GRAMS-DATA-HARVEST.md (lines 344-404)
**Description**: RLHF preference pair generation - creates chosen/rejected pairs from high/low accuracy runs for reinforcement learning from human feedback.

### callgrams-meshchain-trace.js
**Source**: CALL-GRAMS-DATA-HARVEST.md (lines 435-467)
**Description**: Meshchain blockchain tracing - walks training provenance chain to track model evolution lineage with full reproducibility.

### callgrams-ensemble-inference.js
**Source**: CALL-GRAMS-DATA-HARVEST.md (lines 488-533)
**Description**: Ensemble inference with multi-delta voting - runs query through multiple specialist deltas and aggregates with weighted consensus for higher accuracy.

### callgrams-harvesting-pipeline.js
**Source**: CALL-GRAMS-DATA-HARVEST.md (lines 552-579)
**Description**: Complete data harvesting pipeline - loads cluster results, extracts training data, RLHF pairs, top deltas, and demonstrates quick inference.

---

## Verification & Geometry System (from CALL-GRAMS-XJSON-COMPLETE-SYSTEM.md)

### callgrams-verification-primitive.js
**Source**: CALL-GRAMS-XJSON-COMPLETE-SYSTEM.md (lines 557-652)
**Description**: VerificationPrimitive class for geometric verification - maps verification sources to 3D primitives (sphere/pyramid/lattice) with trust weight visualization and adaptive morphing.

---

## File Organization by Source

### From README.md (3 files)
- `atomic.xjson` - ATOMIC visual cognition model (XJSON format)
- `readme-sw-cache.js` - Service worker cache strategy
- `readme-sw-routing.js` - Service worker routing

### From CALL-GRAMS-PRACTICAL-RUNTIME.md (12 files)
- `callgrams-kuhul-agent.js` - Base autonomous agent class
- `callgrams-glyph-table.js` - Glyph weight encoding table
- `callgrams-event-agent.js` - Factual grounding agent
- `callgrams-invariant-agent.js` - Constraint enforcement agent
- `callgrams-mesh-network.js` - Network topology builder
- `callgrams-force-clustering.js` - Semantic force simulation
- `callgrams-cluster-detection.js` - Cluster detection algorithm
- `callgrams-cluster-collapse.js` - Cluster to answer collapse
- `callgrams-answer-synthesis.js` - Answer synthesis pipeline
- `callgrams-scxq2-serialization.js` - SCXQ2 compression
- `callgrams-brain-state.js` - Brain state export/import
- `callgrams-cognitive-clock.js` - Cognitive execution loop
- `callgrams-integration-example.js` - Complete working example

### From CALL-GRAMS-DATA-HARVEST.md (7 files)
- `callgrams-quick-weight-answer.js` - Fast delta inference
- `callgrams-finetuned-answer.js` - Specialist routing
- `callgrams-training-data.js` - Training dataset generation
- `callgrams-rlhf-dataset.js` - RLHF preference pairs
- `callgrams-meshchain-trace.js` - Training provenance
- `callgrams-ensemble-inference.js` - Multi-delta voting
- `callgrams-harvesting-pipeline.js` - Complete pipeline

### From CALL-GRAMS-XJSON-COMPLETE-SYSTEM.md (1 file)
- `callgrams-verification-primitive.js` - Geometric verification system

### Already Extracted (2 files)
- `atomic.css` - Atomic design system
- `atomic.khl` - K'UHUL DSL

---

## Total Files: 26

### By Language/Type:
- **JavaScript**: 22 files
- **JSON/XJSON**: 1 file
- **CSS**: 1 file
- **KHL**: 1 file
- **Markdown**: 1 file (this index)

### By Category:
- **Core System**: 3 files (atomic.css, atomic.khl, atomic.xjson)
- **Service Worker**: 2 files
- **Agent System**: 12 files
- **Data Harvesting**: 7 files
- **Verification**: 1 file
- **Documentation**: 1 file (INDEX.md)

---

## Usage Patterns

### Quick Start: Run Agent Network
```javascript
// Load core agent classes
import { KuhulAgent } from './callgrams-kuhul-agent.js';
import { EventAgent } from './callgrams-event-agent.js';
import { synthesizeAnswer } from './callgrams-answer-synthesis.js';

// See callgrams-integration-example.js for complete working demo
```

### Quick Start: Data Harvesting
```javascript
// Load harvesting pipeline
import { exportTrainingDataset } from './callgrams-training-data.js';
import { exportRLHFDataset } from './callgrams-rlhf-dataset.js';
import { quickWeightAnswer } from './callgrams-quick-weight-answer.js';

// See callgrams-harvesting-pipeline.js for complete pipeline
```

### Quick Start: Verification System
```javascript
// Load verification primitive
import { VerificationPrimitive } from './callgrams-verification-primitive.js';

// Create sphere for authoritative source (government, verified records)
const sphere = new VerificationPrimitive(mesh, {
  primitiveType: 'sphere',
  sourceType: 'authoritative',
  mode: 'adaptive'
});
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  ATOMIC VISUAL SYSTEM (atomic.css/khl/xjson)                    │
│  - Design tokens, layout primitives, visual encoding            │
└────────────────┬────────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  C@@L @GRAMS AGENT NETWORK                                       │
│  - KuhulAgent (pattern matching)                                │
│  - EventAgent (factual grounding)                               │
│  - InvariantAgent (constraint enforcement)                      │
│  - VerificationPrimitive (geometric verification)               │
└────────────────┬────────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  COGNITIVE PROCESSING                                            │
│  - Mesh network topology                                         │
│  - Force-based clustering                                        │
│  - Cluster detection & collapse                                  │
│  - Answer synthesis                                              │
└────────────────┬────────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  DATA HARVESTING & TRAINING                                      │
│  - Quick weight deltas (267× faster)                            │
│  - Finetuned specialists (92% accuracy)                         │
│  - Training dataset generation (1000+ examples)                 │
│  - RLHF preference pairs (500+ pairs)                           │
│  - Meshchain provenance tracking                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Performance Metrics

### Agent Execution
- Single agent tick: **0.2ms**
- Network tick (10 agents): **2ms**
- Query processing (10 ticks): **20ms**
- State export: **5ms**
- SCXQ2 compression: **8ms**

### Memory Footprint
- Agent instance: **~1KB**
- Agent with history: **~10KB**
- Network (100 agents): **~1MB**
- Compressed delta: **~50KB** (98.5% reduction)

### Inference Speed
- Traditional model loading: **40 seconds** (50GB)
- Delta loading: **150ms** (50MB) - **267× faster**
- Inference time: **20ms** (agent ticks) vs **2-5 seconds** (traditional)

### Cluster Scaling
- 1 worker: **50 queries/sec**
- 4 workers: **200 queries/sec**
- 16 workers: **800 queries/sec**
- 32 workers: **1600 queries/sec**
- **Near-linear scaling achieved!**

---

## Key Innovations

1. **Meshes as Agents** - WebGL geometry becomes autonomous cognitive processors
2. **Glyph Encoding** - SVG symbols as compressed weight carriers
3. **Verification Primitives** - Geometric shapes encode source trust (sphere/pyramid/lattice)
4. **Three Orthogonal Layers** - Pattern/Event/Invariant for meaning/truth/validity
5. **Adaptive Morphing** - Geometry changes based on trust weights in real-time
6. **Delta Inference** - Load 50MB deltas instead of 50GB models (267× faster)
7. **Training Gold Generation** - Every cluster run produces reusable ML assets
8. **RLHF from Results** - Automatic preference pair creation from accuracy metrics

---

## Next Steps

1. **Run the demo**: Execute `callgrams-integration-example.js`
2. **Integrate with cluster**: Use patterns from harvesting pipeline
3. **Generate training data**: Process queries, export results
4. **Visualize in 3D**: Connect to K'UHUL WebGL engine
5. **Compress with SCXQ2**: Export network states
6. **Train models**: Use cluster results as training gold
7. **Scale up**: Deploy across 32+ workers for 1600 q/sec

---

**C@@L @GRAMS: From theory to running code!** 🌐✨
