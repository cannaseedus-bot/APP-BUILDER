# MX2GYM Plugin Integration Guide

## Overview

**MX2GYM** is the Hybrid Weight Training Environment for MX2LM and Qwen-ASX models, replacing traditional PyTorch trainers with fold-delta training.

## Key Features

- **Fold-Delta Training**: No full model reloads - just delta updates
- **K'UHUL π Math**: Symbolic-tensor hybrid operations
- **SCXQ2 Compression**: 87% weight compression
- **Horizontal & Vertical Merging**: Stack 100+ folds into one model
- **Multi-Model Support**: Qwen-ASX, MX2LM, adapters, kernels

## Training Flow

```
Fold-Input
   ↓
@data (delta/grad/optimizer)
   ↓
@control (priority, clamps, conditions)
   ↓
@flow (XCFE routing)
   ↓
K'UHUL π math (tensor update)
   ↓
SCX expansion/compression
   ↓
Accumulator
   ↓
Finalize → model.safetensors
```

## Plugin Location

```
gas/plugins/mx2gym-plugin.js
```

## API Endpoint

```
Base: https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

## Core Operations

### 1. Train with Fold-Deltas

```javascript
fetch('/mx2gym', {
  method: 'POST',
  body: JSON.stringify({
    action: 'train_fold',
    fold_id: 'fold_mathfix_v1',
    model_id: 'qwen-asx-v1',
    config: {
      epochs: 10,
      batch_size: 32,
      learning_rate: 0.0001
    }
  })
});
```

### 2. Merge Horizontal (100+ folds → one safetensor)

```javascript
fetch('/mx2gym', {
  method: 'POST',
  body: JSON.stringify({
    action: 'merge_horizontal',
    folds: ['fold_mathfix_v1', 'fold_safetyguard_v2'],
    output_model: 'merged_model_v1'
  })
});
```

### 3. Compile Safetensors

```javascript
fetch('/mx2gym', {
  method: 'POST',
  body: JSON.stringify({
    action: 'compile_safetensors',
    folds: [...],
    model_name: 'compiled_qwen_asx_v1'
  })
});
```

### 4. Evolve MX2LM Brain

```javascript
fetch('/mx2gym', {
  method: 'POST',
  body: JSON.stringify({
    action: 'evolve_mx2lm',
    brain_id: 'mx2lm_brain_v1',
    training_data: 'mx2db://training/corpus',
    config: { epochs: 10, fold_count: 8 }
  })
});
```

## Fold Structure

Every fold follows the **@data ⊗ @control ⊗ @flow** pattern:

```json
{
  "@data": {
    "delta": {
      "model.layers.0.self_attn.q_proj.weight": "scx://fold/delta/q_proj_00001"
    },
    "optimizer": { "beta1": 0.9, "beta2": 0.999, "lr": 0.0001 }
  },
  "@control": {
    "priority": 1.0,
    "clamp_range": [-1.0, 1.0],
    "conditions": ["entropy > 0.5", "loss < 0.3"]
  },
  "@flow": {
    "entry": "@Pop",
    "route": ["@Wo", "@Sek"],
    "exit": "@Xul",
    "merge_strategy": "horizontal"
  }
}
```

## Optimizer Support

MX2GYM implements optimizers in K'UHUL π:

- **π_AdamW**: Adaptive learning with weight decay
- **π_Lion**: Evolved sign-based optimizer
- **π_RMSprop**: Root mean square propagation
- **π_SGD**: Stochastic gradient descent

## Integration with MX2LEX

```
MX2LEX Tokenization
    ↓ (vocabulary + grammar)
MX2GYM Training
    ↓ (fold-deltas)
Trained Model
    ↓
MX2QF1 Inference
```

## Supported Models

1. **Qwen-ASX**: 7B parameter models with fold-delta training
2. **MX2LM Tensor-Brain**: Symbolic-tensor hybrid brain
3. **Fold-Delta Adapters**: LoRA-style adapters
4. **Symbolic Kernels**: Domain-specific reasoning modules

## Storage

- **MX2DB**: `mx2db://gym/folds/`, `mx2db://gym/models/`
- **SCXQ2**: `scx://fold/delta/`
- **Exports**: `mx2db://gym/compiled/`

## Dependencies

- MX2LEX (tokenization)
- MX2DB (storage)
- SCXQ2 (compression)
- K'UHUL (π math engine)
- XCFE (flow routing)

## Law

```
XCFE → K'UHUL → MX2GYM → QWEN-ASX → SAFETENSORS
```

## Documentation

See: [MX2-PLUGINS-API-REFERENCE.md](../MX2-PLUGINS-API-REFERENCE.md)
