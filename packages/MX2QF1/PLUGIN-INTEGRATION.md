# MX2QF1 Plugin Integration Guide

## Overview

**MX2QF1** is the Quantum Inference Engine providing quantum-optimized inference, meta-compilation, agent orchestration, and mesh synchronization.

## Key Features

- **Quantum Inference**: 128-qubit optimized inference (<100ms)
- **Meta-Compiler**: Compile K'UHUL → JavaScript/Python/Java
- **Agent Orchestration**: Spawn and coordinate AI microagents
- **Tape System**: Modular application components
- **Mesh Migration**: Multi-node synchronization and deployment

## Inference Flow

```
User Prompt
    ↓
MX2LEX Tokenization
    ↓
MX2QF1 Quantum Inference
    ↓ (128 qubits, SCXQ2 compressed)
Response Generation
    ↓
Output to User
```

## Plugin Location

```
gas/plugins/mx2qf1-plugin.js
```

## API Endpoint

```
Base: https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

## Core Operations

### 1. Run Quantum Inference

```javascript
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

**Response:**
```json
{
  "result": {
    "text": "...",
    "inference_time": "45ms"
  },
  "quantum": {
    "qubits_used": 128,
    "coherence_time": "100ms",
    "algorithm": "SCXQ2_QUANTUM_LATTICE"
  }
}
```

### 2. Meta-Compilation

```javascript
fetch('/mx2qf1', {
  method: 'POST',
  body: JSON.stringify({
    action: 'compile',
    code: '[Pop main]→[Wo state]→[Sek operation]→[Xul]',
    source_lang: 'kuhul',
    target_lang: 'javascript'
  })
});
```

### 3. Spawn Agent

```javascript
fetch('/mx2qf1', {
  method: 'POST',
  body: JSON.stringify({
    action: 'spawn_agent',
    agent_type: 'frontend_ai',
    config: {...}
  })
});
```

### 4. Execute Tape

```javascript
fetch('/mx2qf1', {
  method: 'POST',
  body: JSON.stringify({
    action: 'execute_tape',
    tape_id: 'tape_system_auto_recovery_v1',
    context: {...}
  })
});
```

## Agent Types

1. **Frontend AI** (port 4002)
   - K'UHUL DOM generation
   - Responsive design
   - Animations

2. **Backend AI** (port 4003)
   - XJSON virtual server
   - API generation
   - Data logic

3. **Design AI** (port 4004)
   - 3D graphics (Three.js)
   - Visual design
   - WebGL

4. **Inference Agent** (port 4005)
   - Quantum inference
   - Meta-compilation
   - Optimization

## Tape Structure

Tapes follow the **@layout ⊗ @routes ⊗ @hooks ⊗ @agents** pattern:

```json
{
  "@layout": {
    "surfaces": ["dashboard", "editor", "preview"],
    "panels": ["nav", "main", "sidebar"]
  },
  "@routes": {
    "/execute": { "method": "POST", "handler": "tape.execute" }
  },
  "@hooks": {
    "@Pop": "tape.boot",
    "@Wo": "tape.bind_state",
    "@Sek": "tape.execute",
    "@Xul": "tape.transform",
    "@Ch'en": "tape.render"
  },
  "@agents": [
    { "id": "inference_agent", "role": "quantum_inference" }
  ]
}
```

## Mesh Migration

### 1. Snapshot Tape

```javascript
const snapshot = await fetch('/mx2qf1', {
  method: 'POST',
  body: JSON.stringify({
    action: 'snapshot',
    tape_id: 'tape_mx2lex_studio_v1'
  })
}).then(r => r.json());
```

### 2. Prepare Package

```javascript
const pkg = await fetch('/mx2qf1', {
  method: 'POST',
  body: JSON.stringify({
    action: 'prepare_package',
    snapshot: snapshot.snapshot
  })
}).then(r => r.json());
```

### 3. Send to Peer

```javascript
fetch('/mx2qf1', {
  method: 'POST',
  body: JSON.stringify({
    action: 'send',
    peer_id: 'gas_shard_main',
    package: pkg.package
  })
});
```

### 4. Install on Remote Node

```javascript
fetch('/mx2qf1', {
  method: 'POST',
  body: JSON.stringify({
    action: 'install',
    package: received_package
  })
});
```

## Quantum Specs

- **Qubits**: 128
- **Coherence Time**: 100ms
- **Algorithm**: SCXQ2 Quantum Lattice
- **Entanglement Depth**: 8 levels
- **Optimization**: Quantum annealing

## Integration Pipeline

```
MX2LEX (Tokenization)
    ↓
MX2GYM (Training)
    ↓
MX2QF1 (Inference)
    ↓
User Output
```

## Storage

- **MX2DB**: `mx2db://tapes/`, `mx2db://agents/`
- **Guide**: `mx2db://guides/mx2qf1_guide_v1.html`
- **Mesh**: `mx2://quantum_mesh`

## Dependencies

- MX2LEX (tokenization)
- MX2GYM (trained models)
- MX2DB (storage)
- SCXQ2 (compression)
- K'UHUL (execution)
- XCFE (flow routing)

## Law

```
XCFE → K'UHUL → MX2QF1 → INFERENCE → OUTPUT
```

## Documentation

See: [MX2-PLUGINS-API-REFERENCE.md](../MX2-PLUGINS-API-REFERENCE.md)

## Guide

Full HTML guide available in: `MX2QF1/readme.md`
