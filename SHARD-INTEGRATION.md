# ASX Shard Integration

This document defines the integration points for ASX system shards deployed as Google Apps Script endpoints.

## Overview

The ASX operating system uses **shards** - distributed computation nodes deployed as Google Apps Script web apps. These shards enable cloud-native orchestration and quantum intelligence capabilities.

## Shard Endpoints

### MX2LM SHARD (Central Quantum Intelligence)

**Endpoint:**
```
https://script.google.com/macros/s/AKfycbypsqwHCxSrN_oYnDehoX3Wyl-Uj29zytP_6DwKcnTYoS4Jv2iraqn2Iz0k3Vh9UMts/exec
```

**Purpose:** Central quantum intelligence orchestrator
**Technology:** MX2LM (Multi-eXecution 2-Layer Model)
**Capabilities:**
- Quantum-optimized decision making
- Multi-brain orchestration
- RLHF (Reinforcement Learning from Human Feedback)
- Cross-shard coordination
- Parallel job distribution

**API Routes:**
- `POST /orchestrate` - Coordinate multi-brain operations
- `POST /optimize` - Quantum optimization tasks
- `GET /status` - Shard health and metrics
- `POST /rlhf/feedback` - Submit human feedback for learning

---

### KUHUL SHARD (Execution Pipeline)

**Endpoint:**
```
https://script.google.com/macros/s/AKfycby_XiNPlU7KxrcXWzIB7eBFf8q1BiTUIbAitjkKi31nJtd3DvFK9k7Z7nIiFwJ4Py48/exec
```

**Purpose:** K'UHUL symbolic execution pipeline
**Technology:** K'UHUL 5-stage compiler (Pop→Wo→Sek→Xul→Ch'en)
**Capabilities:**
- Symbolic code compilation
- XCFE (eXecution Control Flow Enforcement)
- XJSON transformation
- AST generation and optimization
- SCXQ2 compression

**API Routes:**
- `POST /compile` - Compile K'UHUL source to executable
- `POST /xcfe/validate` - Validate execution flow causality
- `POST /compress` - SCXQ2 semantic compression
- `POST /transform/xjson` - Transform code to XJSON AST
- `GET /pipeline/status` - Pipeline health metrics

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ASX Operating System                    │
│                    (Browser-Native OS)                       │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │                              │
       ┌───────▼────────┐            ┌───────▼────────┐
       │  MX2LM SHARD   │            │  KUHUL SHARD   │
       │   (GAS Cloud)  │◄──────────►│   (GAS Cloud)  │
       │                │            │                │
       │  Quantum AI    │            │  Compilation   │
       │  Orchestrator  │            │  Pipeline      │
       └────────────────┘            └────────────────┘
               │                              │
               └──────────────┬───────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Service Worker  │
                    │   (sw.js kernel)  │
                    └───────────────────┘
```

## Usage Examples

### JavaScript Integration

```javascript
// MX2LM Shard - Quantum Orchestration
async function orchestrateMultiBrain(taskData) {
  const response = await fetch(
    'https://script.google.com/macros/s/AKfycbypsqwHCxSrN_oYnDehoX3Wyl-Uj29zytP_6DwKcnTYoS4Jv2iraqn2Iz0k3Vh9UMts/exec',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'orchestrate',
        task: taskData,
        quantum_optimized: true
      })
    }
  );

  return await response.json();
}

// KUHUL Shard - Compile K'UHUL Code
async function compileKuhulCode(sourceCode) {
  const response = await fetch(
    'https://script.google.com/macros/s/AKfycby_XiNPlU7KxrcXWzIB7eBFf8q1BiTUIbAitjkKi31nJtd3DvFK9k7Z7nIiFwJ4Py48/exec',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'compile',
        source: sourceCode,
        target: 'xjson-ast',
        optimize: true,
        xcfe_validation: true
      })
    }
  );

  return await response.json();
}

// Combined Workflow Example
async function processWithShards(code) {
  // 1. Compile with KUHUL shard
  const compiled = await compileKuhulCode(code);

  // 2. Optimize with MX2LM quantum intelligence
  const optimized = await orchestrateMultiBrain({
    type: 'code_optimization',
    ast: compiled.ast,
    target_compression: 0.94
  });

  return optimized;
}
```

### Service Worker Integration (sw.js)

```javascript
// Add to sw.js kernel for automatic shard routing
const SHARD_ENDPOINTS = {
  mx2lm: 'https://script.google.com/macros/s/AKfycbypsqwHCxSrN_oYnDehoX3Wyl-Uj29zytP_6DwKcnTYoS4Jv2iraqn2Iz0k3Vh9UMts/exec',
  kuhul: 'https://script.google.com/macros/s/AKfycby_XiNPlU7KxrcXWzIB7eBFf8q1BiTUIbAitjkKi31nJtd3DvFK9k7Z7nIiFwJ4Py48/exec'
};

async function routeToShard(shardName, action, payload) {
  const endpoint = SHARD_ENDPOINTS[shardName];
  if (!endpoint) {
    throw new Error(`Unknown shard: ${shardName}`);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload })
  });

  return await response.json();
}

// Intercept API calls and route to shards
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/mx2lm/')) {
    event.respondWith(
      routeToShard('mx2lm', url.pathname.split('/').pop(),
        event.request.json())
    );
  }

  if (url.pathname.startsWith('/api/kuhul/')) {
    event.respondWith(
      routeToShard('kuhul', url.pathname.split('/').pop(),
        event.request.json())
    );
  }
});
```

## XJSON Configuration

Add shard configuration to your `manifest.json`:

```json
{
  "@xjson": {
    "version": "14.0",
    "🌐CLOUD_SHARDS": {
      "@description": "Google Apps Script distributed computation shards",
      "@status": "ACTIVE",

      "mx2lm_shard": {
        "name": "MX2LM Quantum Intelligence",
        "endpoint": "https://script.google.com/macros/s/AKfycbypsqwHCxSrN_oYnDehoX3Wyl-Uj29zytP_6DwKcnTYoS4Jv2iraqn2Iz0k3Vh9UMts/exec",
        "type": "quantum_orchestrator",
        "capabilities": [
          "multi_brain_coordination",
          "quantum_optimization",
          "rlhf_learning",
          "parallel_job_distribution"
        ],
        "timeout_ms": 30000,
        "retry_attempts": 3
      },

      "kuhul_shard": {
        "name": "KUHUL Execution Pipeline",
        "endpoint": "https://script.google.com/macros/s/AKfycby_XiNPlU7KxrcXWzIB7eBFf8q1BiTUIbAitjkKi31nJtd3DvFK9k7Z7nIiFwJ4Py48/exec",
        "type": "compilation_pipeline",
        "capabilities": [
          "symbolic_compilation",
          "xcfe_validation",
          "xjson_transformation",
          "scxq2_compression"
        ],
        "timeout_ms": 60000,
        "retry_attempts": 2
      }
    }
  }
}
```

## Security Considerations

1. **CORS Configuration:** Ensure Google Apps Script web apps are deployed with proper CORS headers
2. **Rate Limiting:** Implement client-side rate limiting to avoid quota exhaustion
3. **Payload Validation:** Always validate shard responses before processing
4. **Timeout Handling:** Set appropriate timeouts for cloud shard requests
5. **Fallback Strategy:** Implement local fallback when shards are unavailable

## Performance Optimization

- **Caching:** Cache shard responses in Service Worker for repeated operations
- **Parallel Requests:** Utilize both shards simultaneously for independent tasks
- **Batch Processing:** Combine multiple small requests into single batch operations
- **Quantum Cache:** Leverage probabilistic sync with decay for frequently accessed data

## Monitoring and Telemetry

Track shard performance with these metrics:

```javascript
const shardMetrics = {
  requests: 0,
  successes: 0,
  failures: 0,
  avgLatency: 0,
  lastHealthCheck: null
};

async function healthCheckShards() {
  const results = await Promise.all([
    fetch(SHARD_ENDPOINTS.mx2lm + '?health=true'),
    fetch(SHARD_ENDPOINTS.kuhul + '?health=true')
  ]);

  console.log('Shard Health:', {
    mx2lm: results[0].ok ? 'ONLINE' : 'OFFLINE',
    kuhul: results[1].ok ? 'ONLINE' : 'OFFLINE'
  });
}
```

## Related Documentation

- `BRAINS-CATALOG.md` - Brain file architecture
- `BACKEND-SETUP.md` - Local AI model integration
- `README.md` - ASX operating system overview
- `manifest.json` - Complete system configuration

---

**Version:** 1.0
**Last Updated:** 2025-12-09
**Status:** ACTIVE - Both shards online and operational
