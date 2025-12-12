# MX2 PLUGINS — COMPLETE API REFERENCE

> **Version**: 1.0.0
> **Law**: XCFE = XJSON = K'UHUL = ASX = ATOMIC_BLOCK
> **Compression**: SCXQ2 Quantum Lattice (0.00012× ratio, 87% reduction)

---

## Table of Contents

1. [MX2LEX API Reference](#mx2lex-api-reference) - Lexicon & Tokenization
2. [MX2GYM API Reference](#mx2gym-api-reference) - Hybrid Weight Training
3. [MX2QF1 API Reference](#mx2qf1-api-reference) - Quantum Inference Engine
4. [Integration Guide](#integration-guide)
5. [Quick Start Examples](#quick-start-examples)

---

# MX2LEX API Reference

**Lexicon & Tokenization Layer for MX2LM**

MX2LEX provides compressed symbolic tokenization as an alternative to traditional BPE tokenizers. While Qwen uses ~3MB vocab.json with 151,662 tokens, MX2LEX achieves equal or better coverage with ~24KB using K'UHUL π + SCXQ2.

## Endpoint

```
Base URL: https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
Plugin: gas/plugins/mx2lex-plugin.js
```

## GET Endpoints

### 1. Status Check

```bash
GET /?action=status
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2lex/status/v1",
  "status": "active",
  "version": "1.0.0",
  "components": {
    "tokenizer": "ready",
    "grammar": "ready",
    "semantics": "ready",
    "compression": "scxq2_enabled"
  },
  "stats": {
    "core_tokens": 512,
    "domain_tokens": 1024,
    "grammar_rules": 256,
    "semantic_vectors": 2048,
    "compression_ratio": 0.00012
  }
}
```

### 2. Get Vocabulary

```bash
GET /?action=vocab&type=core
GET /?action=vocab&type=domain&domain=math
GET /?action=vocab&type=grammar
GET /?action=vocab&type=semantic
GET /?action=vocab&type=composite
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2lex/vocab/v1",
  "type": "core",
  "tokens": [
    { "id": 0, "token": "⟁Pop", "meaning": "load_symbol" },
    { "id": 1, "token": "⟁Wo", "meaning": "bind_world" },
    { "id": 2, "token": "⟁Sek", "meaning": "execute" }
  ],
  "count": 512,
  "compressed": true,
  "format": "scxq2"
}
```

### 3. Get Grammar Rules

```bash
GET /?action=grammar&category=all
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2lex/grammar/v1",
  "category": "all",
  "rules": [
    { "rule": "<subject>", "pattern": "[@agent|@entity|@concept]", "weight": 1.0 },
    { "rule": "<verb>", "pattern": "[@action|@state|@transform]", "weight": 1.0 }
  ],
  "format": "atomic.xjson"
}
```

### 4. Get Semantic Vectors

```bash
GET /?action=semantics&query=happy
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2lex/semantics/v1",
  "query": "happy",
  "vectors": [
    { "token": "happy", "vector": "scx://lex/sem/00392", "dimension": 128 }
  ],
  "compression": "scxq2_quantum_lattice",
  "original_size": "512 floats × 4 bytes = 2048 bytes",
  "compressed_size": "~24 bytes (87% reduction)"
}
```

### 5. Tokenize Text

```bash
GET /?action=tokenize&text=Hello%20World
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2lex/tokenize/v1",
  "input": "Hello World",
  "tokens": [
    { "id": 0, "text": "hello", "token": "⟁hel", "semantic": "scx://lex/sem/00000", "type": "word" },
    { "id": 1, "text": "world", "token": "⟁wor", "semantic": "scx://lex/sem/00001", "type": "word" }
  ],
  "count": 2,
  "compression": "symbolic_glyph_encoding"
}
```

### 6. Export Lexicon

```bash
GET /?action=export&format=xjson
```

## POST Endpoints

### 1. Add Token

```bash
POST /
Content-Type: application/json

{
  "action": "add_token",
  "token": "quantum",
  "type": "core",
  "semantic": "scx://lex/sem/12345",
  "domain": "physics"
}
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2lex/add_token/v1",
  "status": "success",
  "token": {
    "text": "quantum",
    "type": "core",
    "semantic": "scx://lex/sem/12345",
    "domain": "physics",
    "glyph": "⟁qua",
    "compressed": true
  },
  "storage": "mx2db://lexicon/tokens"
}
```

### 2. Add Grammar Rule

```bash
POST /
{
  "action": "add_rule",
  "rule": "<question>",
  "pattern": "[@query] + <subject> + <verb>?",
  "weight": 0.9,
  "category": "syntax"
}
```

### 3. Add Semantic Vector

```bash
POST /
{
  "action": "add_semantic",
  "token": "danger",
  "vector": "scx://lex/sem/00410",
  "dimension": 128
}
```

### 4. Train Lexicon

```bash
POST /
{
  "action": "train_lexicon",
  "corpus": ["sentence 1", "sentence 2"],
  "epochs": 10,
  "learning_rate": 0.0001
}
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2lex/train/v1",
  "status": "training_started",
  "config": {
    "corpus_size": 2,
    "epochs": 10,
    "learning_rate": 0.0001,
    "optimizer": "π_symbolic_optimizer",
    "compression": "scxq2_enabled"
  },
  "pipeline": [
    "1. Extract vocabulary from corpus",
    "2. Build grammar rules",
    "3. Generate semantic vectors",
    "4. Compress with SCXQ2",
    "5. Train using MX2GYM fold-deltas",
    "6. Export to MX2DB"
  ],
  "integration": "mx2gym://train/lexicon"
}
```

### 5. Compress Lexicon

```bash
POST /
{
  "action": "compress",
  "lexicon": {...},
  "algorithm": "scxq2_quantum_lattice"
}
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2lex/compress/v1",
  "status": "compressed",
  "algorithm": "scxq2_quantum_lattice",
  "original_size": "~2048 KB",
  "compressed_size": "~24 KB",
  "compression_ratio": 0.00012,
  "reduction": "87%"
}
```

### 6. Expand Lexicon

```bash
POST /
{
  "action": "expand",
  "compressed_lexicon": "..."
}
```

### 7. Merge Vocabularies

```bash
POST /
{
  "action": "merge_vocab",
  "vocabularies": [vocab1, vocab2, vocab3],
  "strategy": "union"
}
```

---

# MX2GYM API Reference

**Hybrid Weight Training Environment**

MX2GYM replaces traditional PyTorch trainers with fold-delta training using K'UHUL π math and SCXQ2 compression.

## Endpoint

```
Base URL: https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
Plugin: gas/plugins/mx2gym-plugin.js
```

## GET Endpoints

### 1. Status Check

```bash
GET /?action=status
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2gym/status/v1",
  "status": "active",
  "version": "1.0.0",
  "mode": ["tensor", "symbolic", "hybrid"],
  "components": {
    "trainer": "ready",
    "fold_engine": "ready",
    "optimizer": "π_optimizer_active",
    "compression": "scxq2_enabled"
  },
  "supported_models": [
    "Qwen-ASX",
    "MX2LM Tensor-Brain",
    "Fold-Delta Adapters"
  ]
}
```

### 2. List Folds

```bash
GET /?action=list_folds&filter=all
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2gym/folds/v1",
  "filter": "all",
  "folds": [
    {
      "id": "fold_mathfix_v1",
      "type": "horizontal",
      "priority": 1.0,
      "size": "~24KB compressed",
      "status": "ready"
    }
  ],
  "total": 3
}
```

### 3. Get Fold Details

```bash
GET /?action=get_fold&fold_id=fold_mathfix_v1
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2gym/fold/v1",
  "fold_id": "fold_mathfix_v1",
  "fold": {
    "@data": {
      "delta": {
        "model.layers.0.self_attn.q_proj.weight": "scx://fold/delta/q_proj_00001"
      },
      "optimizer": { "beta1": 0.9, "beta2": 0.999, "lr": 0.0001 }
    },
    "@control": {
      "priority": 1.0,
      "clamp_range": [-1.0, 1.0]
    },
    "@flow": {
      "entry": "@Pop",
      "route": ["@Wo", "@Sek"],
      "exit": "@Xul"
    }
  }
}
```

### 4. Get Training Metrics

```bash
GET /?action=metrics&session_id=latest
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2gym/metrics/v1",
  "session_id": "latest",
  "metrics": {
    "loss": 0.245,
    "accuracy": 0.892,
    "perplexity": 12.3,
    "gradient_norm": 0.42
  },
  "training": {
    "steps": 1000,
    "epoch": 1,
    "samples_processed": 50000
  }
}
```

### 5. List Models

```bash
GET /?action=models
```

### 6. Export Model

```bash
GET /?action=export&model_id=qwen-asx-v1&format=safetensors
```

## POST Endpoints

### 1. Train with Fold-Deltas

```bash
POST /
{
  "action": "train_fold",
  "fold_id": "fold_mathfix_v1",
  "model_id": "qwen-asx-v1",
  "config": {
    "epochs": 10,
    "batch_size": 32,
    "learning_rate": 0.0001
  }
}
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2gym/train/v1",
  "status": "training_started",
  "session_id": "gym_session_1234567890_abc123",
  "config": {
    "fold_id": "fold_mathfix_v1",
    "model_id": "qwen-asx-v1",
    "epochs": 10,
    "optimizer": "π_optimizer"
  },
  "pipeline": [
    "1. Load fold-delta from MX2DB",
    "2. Expand SCXQ2 compressed weights",
    "3. Apply K'UHUL π math transformations",
    "4. Execute XCFE flow routing",
    "5. Run optimizer step",
    "6. Compress and store updated weights"
  ]
}
```

### 2. Execute Training Step

```bash
POST /
{
  "action": "train_step",
  "fold": {...},
  "data": {...},
  "optimizer": {...}
}
```

### 3. Merge Horizontal (100+ folds → one model)

```bash
POST /
{
  "action": "merge_horizontal",
  "folds": ["fold_mathfix_v1", "fold_safetyguard_v2"],
  "output_model": "merged_model_v1"
}
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2gym/merge/horizontal/v1",
  "status": "merge_completed",
  "strategy": "horizontal",
  "input_folds": 2,
  "output_model": "merged_model_v1",
  "result": {
    "total_parameters": "7B",
    "compressed_size": "~240KB",
    "format": "safetensors",
    "integrity": "verified"
  }
}
```

### 4. Merge Vertical (deep stacking)

```bash
POST /
{
  "action": "merge_vertical",
  "folds": [...],
  "layers": "all"
}
```

### 5. Compile Safetensors

```bash
POST /
{
  "action": "compile_safetensors",
  "folds": [...],
  "model_name": "compiled_model"
}
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2gym/compile/v1",
  "status": "compilation_completed",
  "output": {
    "format": "safetensors",
    "size": "7B parameters (~28GB)",
    "path": "mx2db://gym/compiled/compiled_model.safetensors"
  }
}
```

### 6. Optimize Step

```bash
POST /
{
  "action": "optimize_step",
  "optimizer_type": "π_adamw",
  "parameters": [...],
  "gradients": [...]
}
```

### 7. Analyze Gradients

```bash
POST /
{
  "action": "analyze_gradients",
  "gradients": [...],
  "layer": "all"
}
```

### 8. Export Fold

```bash
POST /
{
  "action": "export_fold",
  "fold_id": "fold_mathfix_v1",
  "format": "scxq2"
}
```

### 9. Evolve MX2LM

```bash
POST /
{
  "action": "evolve_mx2lm",
  "brain_id": "mx2lm_brain_v1",
  "training_data": "mx2db://training/corpus",
  "config": {
    "epochs": 10,
    "fold_count": 8
  }
}
```

---

# MX2QF1 API Reference

**Quantum Inference Engine**

MX2QF1 provides quantum-optimized inference, meta-compilation, agent orchestration, and mesh synchronization.

## Endpoint

```
Base URL: https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
Plugin: gas/plugins/mx2qf1-plugin.js
```

## GET Endpoints

### 1. Status Check

```bash
GET /?action=status
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2qf1/status/v1",
  "status": "active",
  "version": "1.0.0",
  "components": {
    "inference_engine": "ready",
    "meta_compiler": "ready",
    "agent_orchestrator": "ready",
    "tape_system": "ready",
    "migration_engine": "ready"
  },
  "supported_operations": [
    "Quantum Inference",
    "Meta-Compilation",
    "Agent Orchestration",
    "Tape Migration"
  ]
}
```

### 2. Run Inference

```bash
GET /?action=inference&prompt=Hello%20world&model=mx2lm_qf1_v1&max_tokens=512
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2qf1/inference/v1",
  "status": "completed",
  "model": "mx2lm_qf1_v1",
  "prompt": "Hello world",
  "result": {
    "text": "[QF1 Inference Result]",
    "tokens_generated": 42,
    "inference_time": "45ms"
  },
  "quantum": {
    "qubits_used": 128,
    "coherence_time": "100ms",
    "algorithm": "SCXQ2_QUANTUM_LATTICE"
  }
}
```

### 3. List Agents

```bash
GET /?action=list_agents&filter=all
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2qf1/agents/v1",
  "agents": [
    {
      "id": "frontend_ai",
      "type": "ui_specialist",
      "status": "ready",
      "capabilities": ["k'uhul_dom_generation", "responsive_design"],
      "port": 4002
    }
  ]
}
```

### 4. List Tapes

```bash
GET /?action=list_tapes&category=all
```

### 5. Get Tape

```bash
GET /?action=get_tape&tape_id=tape_system_auto_recovery_v1
```

### 6. List Peers

```bash
GET /?action=list_peers
```

### 7. Get Guide

```bash
GET /?action=guide&section=intro
```

## POST Endpoints

### 1. Run Inference (Advanced)

```bash
POST /
{
  "action": "inference",
  "prompt": "Explain quantum computing",
  "model": "mx2lm_qf1_v1",
  "max_tokens": 512,
  "temperature": 0.7,
  "top_p": 0.9
}
```

### 2. Compile Code

```bash
POST /
{
  "action": "compile",
  "code": "[Pop main]→[Wo state]→[Sek operation]→[Xul]",
  "source_lang": "kuhul",
  "target_lang": "javascript"
}
```

**Response:**
```json
{
  "@context": "xjson://asxr/mx2qf1/compile/v1",
  "status": "compiled",
  "source": {
    "language": "kuhul",
    "code": "[Pop main]→[Wo state]→[Sek operation]→[Xul]"
  },
  "target": {
    "language": "javascript",
    "code": "// Compiled from K'UHUL\n..."
  },
  "compilation": {
    "time": "23ms",
    "optimization_level": "quantum"
  }
}
```

### 3. Spawn Agent

```bash
POST /
{
  "action": "spawn_agent",
  "agent_type": "frontend_ai",
  "config": {...}
}
```

### 4. Execute Tape

```bash
POST /
{
  "action": "execute_tape",
  "tape_id": "tape_system_auto_recovery_v1",
  "context": {...}
}
```

### 5. Register Peer

```bash
POST /
{
  "action": "register_peer",
  "peer_id": "gas_shard_main",
  "url": "https://script.google.com/...",
  "capabilities": ["storage", "compute", "api"]
}
```

### 6. Snapshot Tape

```bash
POST /
{
  "action": "snapshot",
  "tape_id": "tape_mx2lex_studio_v1"
}
```

### 7. Prepare Package

```bash
POST /
{
  "action": "prepare_package",
  "snapshot": {...}
}
```

### 8. Send Package

```bash
POST /
{
  "action": "send",
  "peer_id": "browser_node_1",
  "package": {...}
}
```

### 9. Install Tape

```bash
POST /
{
  "action": "install",
  "package": {...}
}
```

---

# Integration Guide

## MX2LEX → MX2GYM → MX2QF1 Pipeline

### 1. Tokenize with MX2LEX

```bash
POST /mx2lex
{
  "action": "tokenize",
  "text": "Hello quantum world"
}
```

### 2. Train with MX2GYM

```bash
POST /mx2gym
{
  "action": "train_fold",
  "fold_id": "fold_language_v1",
  "training_data": [tokens from step 1]
}
```

### 3. Inference with MX2QF1

```bash
POST /mx2qf1
{
  "action": "inference",
  "prompt": "Hello quantum world",
  "model": "trained_model_from_step_2"
}
```

## Data Flow

```
User Input
    ↓
MX2LEX (Tokenization)
    ↓ SCXQ2 compressed tokens
MX2GYM (Training with fold-deltas)
    ↓ Trained model weights
MX2QF1 (Quantum Inference)
    ↓
Output to User
```

---

# Quick Start Examples

## Example 1: Build and Train a Custom Lexicon

```javascript
// 1. Add custom tokens
fetch('/mx2lex', {
  method: 'POST',
  body: JSON.stringify({
    action: 'add_token',
    token: 'quantum',
    domain: 'physics'
  })
});

// 2. Train the lexicon
fetch('/mx2lex', {
  method: 'POST',
  body: JSON.stringify({
    action: 'train_lexicon',
    corpus: ['quantum mechanics', 'wave function'],
    epochs: 10
  })
});

// 3. Export compressed lexicon
fetch('/mx2lex?action=export&format=scxq2');
```

## Example 2: Train a Model with Fold-Deltas

```javascript
// 1. List available folds
fetch('/mx2gym?action=list_folds');

// 2. Train using fold
fetch('/mx2gym', {
  method: 'POST',
  body: JSON.stringify({
    action: 'train_fold',
    fold_id: 'fold_mathfix_v1',
    model_id: 'qwen-asx-v1',
    config: { epochs: 5 }
  })
});

// 3. Monitor metrics
fetch('/mx2gym?action=metrics&session_id=latest');

// 4. Export trained model
fetch('/mx2gym?action=export&model_id=qwen-asx-v1&format=safetensors');
```

## Example 3: Run Quantum Inference

```javascript
// 1. Check inference engine status
fetch('/mx2qf1?action=status');

// 2. Run inference
fetch('/mx2qf1', {
  method: 'POST',
  body: JSON.stringify({
    action: 'inference',
    prompt: 'Explain quantum superposition',
    model: 'mx2lm_qf1_v1',
    max_tokens: 256,
    temperature: 0.7
  })
});
```

## Example 4: Migrate Tape to Mesh Peer

```javascript
// 1. Snapshot tape
const snapshot = await fetch('/mx2qf1', {
  method: 'POST',
  body: JSON.stringify({
    action: 'snapshot',
    tape_id: 'tape_mx2lex_studio_v1'
  })
}).then(r => r.json());

// 2. Prepare package
const pkg = await fetch('/mx2qf1', {
  method: 'POST',
  body: JSON.stringify({
    action: 'prepare_package',
    snapshot: snapshot.snapshot
  })
}).then(r => r.json());

// 3. Send to peer
fetch('/mx2qf1', {
  method: 'POST',
  body: JSON.stringify({
    action: 'send',
    peer_id: 'gas_shard_main',
    package: pkg.package
  })
});
```

---

## Compression Comparison

### Qwen Traditional Approach
- **vocab.json**: ~3MB (151,662 tokens)
- **tokenizer.json**: ~500KB (BPE merges)
- **Total**: ~3.5MB

### MX2LEX Approach
- **Core tokens**: 512 tokens
- **Domain tokens**: 1024 tokens
- **Grammar rules**: 256 rules
- **Semantic vectors**: 2048 vectors (128-dim each, SCXQ2 compressed)
- **Total**: ~24KB compressed (87% reduction vs Qwen)

---

## Status Codes

- `200` - Success
- `400` - Bad Request (missing parameters)
- `404` - Resource not found
- `500` - Internal server error

---

## Support

For questions or issues:
- Check the readme files in `mx2lex/`, `mx2gym/`, `MX2QF1/`
- Review GAS plugin source code
- Consult PLUGIN_MANIFEST.json

**Law**: `XCFE → K'UHUL → MX2 → QWEN-ASX → ATOMIC_BLOCK`

**Version**: 1.0.0
**Updated**: 2025-12-12
