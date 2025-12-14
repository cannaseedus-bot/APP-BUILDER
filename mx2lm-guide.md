# MX2LM Guide: Shard-Native AST-Driven Operating System

> **"MX2LM can run all abstract syntax as JSON AST inside GAS shards."**

---

## Core Philosophy

MX2LM is a **shard-native, AST-driven operating system** where:

| Component | Role |
|-----------|------|
| **GAS** | Execution fabric / CPU |
| **MX2LM** | Foreman brain / orchestrator |
| **HTML** | Terminal / cockpit shell |
| **JSON AST** | Universal contract / instruction set |
| **Shards** | Modular execution units |

### What This System Is NOT

```
HTML → model → logic   ❌ WRONG
```

### What This System IS

```
HTML (Cockpit)
    ↓
GAS SHARD ROUTER
    ↓
JSON AST EXECUTION
    ↓
MX2LM FOREMAN
    ↓
SPECIALIZED SHARDS
```

---

## System Invariants (Laws)

These are **non-negotiable rules** that define MX2LM:

1. **No monolithic OS file** — Everything is shards
2. **No fake embedding of weights** — Models are external services
3. **No bloated HTML logic** — HTML is a dumb terminal
4. **Everything = shards** — Modular, stateless, JSON-speaking
5. **HTML = terminal / cockpit** — Renders AST, sends prompts
6. **GAS = execution fabric** — Routes, executes, persists
7. **MX2LM = foreman brain** — Decides, routes, learns

---

## Architecture Overview

### The Shard Stack

```
MX2 SYSTEM (Shard-Native)
│
├── mx2lm_foreman.gs        → Brain / Router / Tokens / Agents
│
├── api.gs                  → Public HTTP entry
│   └── routes JSON → shard dispatch
│
├── usage.gs                → Metering / billing
│
├── auth.gs                 → API keys / roles
│
├── mx2lex.gs               → Tokenizer shard
│
├── inference.gs            → External model runner
│
├── frontend.gs             → UI AST generator
│
├── design.gs               → SVG / 3D AST generator
│
├── backend.gs              → Virtual API AST builder
│
├── storage.gs              → Indexed state / Drive / KV
│
└── rlhf.gs                 → Feedback + learning deltas
```

**Key insight:** None of these shards need to know about each other directly. They only speak **JSON AST**.

---

## The JSON AST Contract

Every shard input/output follows this universal contract:

### Request Format

```json
{
  "@ast": "mx2",
  "@intent": "frontend.render",
  "@from": "mx2lm",
  "@context": {
    "user": "abc123",
    "crown": "developer"
  },
  "@payload": {
    "layout": "dashboard",
    "components": ["chat", "weights", "vocab"]
  }
}
```

### Response Format

```json
{
  "@ok": true,
  "@result": {
    "@ast": "dom",
    "nodes": [
      { "type": "panel", "id": "chat" },
      { "type": "grid", "id": "weights" }
    ]
  }
}
```

### Error Response

```json
{
  "@ok": false,
  "@error": {
    "code": "SHARD_UNAVAILABLE",
    "message": "Inference shard offline",
    "fallback": "local"
  }
}
```

**Rule:** No shard ever returns HTML or JS directly. HTML page renders AST.

---

## Canonical Shard Roles

### MX2LM Foreman Shard (Brain #0)

**Role:** System brain, token economy, crowns, agent routing, external model orchestration, n-gram learning, RLHF intake

**Responsibilities:**
- Owns **crowns** (permission system)
- Owns **agent registry**
- Owns **token economy**
- Owns **n-gram memory**
- Routes to: frontend, backend, design, inference shards
- Chooses **which model runs**
- Logs **RLHF traces**

**This shard never renders UI.**

It only:
- Receives JSON
- Emits JSON
- Executes AST logic

Think of it as `/kernel`.

---

### Frontend Shard (Brain #UI)

**Role:** UI builders, Ghost Shell layouts, HUD generation, SVG / DOM AST emission

**This shard does not decide logic** — it **builds surfaces**.

Returns **JSON AST**, not HTML strings.

---

### Inference Shard (Model Execution)

**Role:** External model runner (Qwen-ASX, MX2LM, etc.)

Models are **not** embedded. They are:
- A **model shard**
- Invoked by URL
- Used by inference.gs
- Tokenized by mx2lex.gs

```json
{
  "@intent": "model.infer",
  "model_url": "https://mx2lm.app/Qwen-ASX/model.safetensors",
  "tokens": [...],
  "params": { "temp": 0.7 }
}
```

MX2LM decides **when** this happens.

---

## Micro-ASXR HTML (The Cockpit)

Your Micro-ASXR single-page app should only do:

| Allowed | Not Allowed |
|---------|-------------|
| Render SVG / DOM from AST | Decide logic |
| Maintain IndexedDB | Route agents |
| Proxy REST calls | Touch weights |
| Display model state | Manage tokens |
| Send prompts | Interpret learning |

### Flow

```
HTML → GAS → AST → GAS → AST → HTML
```

That's it.

---

## Tape-Based Navigation

All information is conceptualized as **tapes**:

- The Ghost Shell displays all tapes
- Does **not** navigate away
- Uses API to fetch, render all tapes
- DOM-API, local REST all tapes
- Local REST API becomes routes (they just need defined)

### Tape Structure

```json
{
  "tape_id": "dashboard_main",
  "title": "Main Dashboard",
  "tags": ["core", "ui"],
  "compressed_body": "...",
  "example_blocks": [...],
  "metadata": {
    "version": "1.0.0",
    "updated": "2025-12-14"
  }
}
```

Your JSON brain is just the **tape directory**.

---

## Building Your Own MX2LM System

### Step 1: Create Your Foreman Shard

```javascript
/**
 * MX2LM FOREMAN SHARD TEMPLATE
 * Role: Brain / Router / Tokens / Agents
 *
 * Deploy to: Google Apps Script
 * Access: Web App (Anyone)
 */

function doPost(e) {
  const request = JSON.parse(e.postData.contents);

  // Validate AST contract
  if (!request["@ast"] || !request["@intent"]) {
    return jsonResponse({
      "@ok": false,
      "@error": { "code": "INVALID_AST", "message": "Missing @ast or @intent" }
    });
  }

  // Route based on intent
  const intent = request["@intent"];
  const context = request["@context"] || {};
  const payload = request["@payload"] || {};

  switch (intent.split(".")[0]) {
    case "frontend":
      return routeToFrontend(intent, context, payload);
    case "backend":
      return routeToBackend(intent, context, payload);
    case "inference":
      return routeToInference(intent, context, payload);
    case "rlhf":
      return handleRLHF(intent, context, payload);
    default:
      return jsonResponse({
        "@ok": false,
        "@error": { "code": "UNKNOWN_INTENT", "message": `Unknown intent: ${intent}` }
      });
  }
}

function doGet(e) {
  return jsonResponse({
    "@ok": true,
    "@shard": "mx2lm_foreman",
    "@version": "1.0.0",
    "@status": "online"
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function routeToFrontend(intent, context, payload) {
  // Route to your frontend shard
  // Replace with your deployed frontend shard URL
  const FRONTEND_SHARD = "[YOUR_FRONTEND_SHARD_URL]";

  return jsonResponse({
    "@ok": true,
    "@routed_to": "frontend",
    "@result": { /* AST from frontend shard */ }
  });
}

function routeToBackend(intent, context, payload) {
  return jsonResponse({
    "@ok": true,
    "@routed_to": "backend",
    "@result": { /* AST from backend shard */ }
  });
}

function routeToInference(intent, context, payload) {
  return jsonResponse({
    "@ok": true,
    "@routed_to": "inference",
    "@result": { /* AST from inference shard */ }
  });
}

function handleRLHF(intent, context, payload) {
  // Store feedback for learning
  const sheet = SpreadsheetApp.openById("[YOUR_SHEET_ID]");
  const rlhfSheet = sheet.getSheetByName("RLHF") || sheet.insertSheet("RLHF");

  rlhfSheet.appendRow([
    new Date().toISOString(),
    context.user || "anonymous",
    JSON.stringify(payload)
  ]);

  return jsonResponse({
    "@ok": true,
    "@rlhf": "recorded"
  });
}
```

---

### Step 2: Create Your Frontend Shard

```javascript
/**
 * FRONTEND SHARD TEMPLATE
 * Role: UI AST Generator
 *
 * Returns JSON AST, never HTML strings
 */

function doPost(e) {
  const request = JSON.parse(e.postData.contents);
  const intent = request["@intent"];
  const payload = request["@payload"] || {};

  switch (intent) {
    case "frontend.render":
      return generateLayoutAST(payload);
    case "frontend.component":
      return generateComponentAST(payload);
    default:
      return jsonResponse({
        "@ok": false,
        "@error": { "code": "UNKNOWN_FRONTEND_INTENT" }
      });
  }
}

function generateLayoutAST(payload) {
  const layout = payload.layout || "default";
  const components = payload.components || [];

  // Build DOM AST
  const ast = {
    "@ast": "dom",
    "layout": layout,
    "nodes": components.map(comp => ({
      "type": "panel",
      "id": comp,
      "class": `asx-${comp}`,
      "children": []
    }))
  };

  return jsonResponse({
    "@ok": true,
    "@result": ast
  });
}

function generateComponentAST(payload) {
  const component = payload.component;
  const variant = payload.variant || "default";

  // Component AST library
  const COMPONENTS = {
    "button": {
      "type": "button",
      "class": "asx-btn",
      "variants": {
        "primary": "asx-btn-primary",
        "ghost": "asx-btn-ghost"
      }
    },
    "card": {
      "type": "div",
      "class": "asx-card",
      "children": [
        { "type": "header", "class": "asx-card-header" },
        { "type": "body", "class": "asx-card-body" }
      ]
    }
  };

  const ast = COMPONENTS[component] || { "type": "div", "class": "asx-unknown" };

  return jsonResponse({
    "@ok": true,
    "@result": {
      "@ast": "component",
      "component": ast
    }
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

### Step 3: Create Your HTML Cockpit

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <title>MX2LM Cockpit</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    /* Atomic CSS 4-Block Rule */

    /* BLOCK 1: Universal Layout */
    :root {
      --bg: #020409;
      --panel: #050a14;
      --accent: #00ffd0;
      --text: #f7fafc;
      --text-soft: #a0aec0;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: system-ui, sans-serif; }

    /* BLOCK 2: Atomic Classes */
    .asx-shell { display: grid; min-height: 100vh; }
    .asx-panel { background: var(--panel); border-radius: 12px; padding: 16px; }
    .asx-btn { padding: 8px 16px; background: var(--accent); border: none; border-radius: 8px; cursor: pointer; }

    /* BLOCK 3: Variables as State */
    [data-loading="true"] { opacity: 0.5; pointer-events: none; }
    [data-active="true"] { border-color: var(--accent); }

    /* BLOCK 4: AI/Control Classes */
    .shard-online { color: #10b981; }
    .shard-offline { color: #ef4444; }
  </style>
</head>
<body>
  <div id="app" class="asx-shell">
    <div id="render-target" class="asx-panel">
      <!-- AST renders here -->
    </div>
  </div>

  <script>
    // MX2LM Cockpit Runtime
    const MX2LM = {
      // Your foreman shard URL
      FOREMAN: "[YOUR_FOREMAN_SHARD_URL]",

      // Send AST request to foreman
      async send(intent, payload = {}, context = {}) {
        const request = {
          "@ast": "mx2",
          "@intent": intent,
          "@context": {
            user: this.getUserId(),
            ...context
          },
          "@payload": payload
        };

        try {
          const response = await fetch(this.FOREMAN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request)
          });

          return await response.json();
        } catch (error) {
          return {
            "@ok": false,
            "@error": { "code": "NETWORK_ERROR", "message": error.message }
          };
        }
      },

      // Render AST to DOM
      renderAST(ast, target = document.getElementById("render-target")) {
        if (!ast || !ast.nodes) return;

        target.innerHTML = "";

        ast.nodes.forEach(node => {
          const el = document.createElement(node.type || "div");
          el.id = node.id || "";
          el.className = node.class || "";

          if (node.children) {
            node.children.forEach(child => {
              const childEl = document.createElement(child.type || "div");
              childEl.className = child.class || "";
              el.appendChild(childEl);
            });
          }

          target.appendChild(el);
        });
      },

      // Get user ID from IDB or generate
      getUserId() {
        return localStorage.getItem("mx2_user_id") || this.generateUserId();
      },

      generateUserId() {
        const id = "u_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("mx2_user_id", id);
        return id;
      }
    };

    // Boot sequence
    (async function boot() {
      // Request dashboard layout from MX2LM
      const result = await MX2LM.send("frontend.render", {
        layout: "dashboard",
        components: ["chat", "status", "controls"]
      });

      if (result["@ok"]) {
        MX2LM.renderAST(result["@result"]);
      } else {
        console.error("Boot failed:", result["@error"]);
      }
    })();
  </script>
</body>
</html>
```

---

## Shard Registry Template

Create a `SHARD_REGISTRY.json` to track your deployed shards:

```json
{
  "@registry": "mx2lm_shards",
  "@version": "1.0.0",

  "shards": {
    "foreman": {
      "name": "MX2LM Foreman",
      "url": "[YOUR_FOREMAN_URL]",
      "role": "brain",
      "status": "active",
      "intents": ["*"]
    },
    "frontend": {
      "name": "Frontend Builder",
      "url": "[YOUR_FRONTEND_URL]",
      "role": "ui",
      "status": "active",
      "intents": ["frontend.*"]
    },
    "backend": {
      "name": "Backend Builder",
      "url": "[YOUR_BACKEND_URL]",
      "role": "api",
      "status": "pending",
      "intents": ["backend.*"]
    },
    "inference": {
      "name": "Inference Runner",
      "url": "[YOUR_INFERENCE_URL]",
      "role": "model",
      "status": "pending",
      "intents": ["inference.*", "model.*"]
    },
    "storage": {
      "name": "Storage Manager",
      "url": "[YOUR_STORAGE_URL]",
      "role": "persistence",
      "status": "pending",
      "intents": ["storage.*", "idb.*"]
    },
    "rlhf": {
      "name": "RLHF Collector",
      "url": "[YOUR_RLHF_URL]",
      "role": "learning",
      "status": "pending",
      "intents": ["rlhf.*", "feedback.*"]
    }
  },

  "routing": {
    "default": "foreman",
    "fallback": "local"
  }
}
```

---

## Intent Taxonomy

Standard intents your shards should understand:

### Frontend Intents
- `frontend.render` — Render a layout
- `frontend.component` — Generate component AST
- `frontend.update` — Update existing panel
- `frontend.modal` — Show modal overlay

### Backend Intents
- `backend.route` — Generate API route
- `backend.validate` — Validate request schema
- `backend.transform` — Transform data shape

### Inference Intents
- `inference.run` — Run model inference
- `inference.tokenize` — Tokenize input
- `inference.embed` — Generate embeddings

### Storage Intents
- `storage.get` — Retrieve from storage
- `storage.set` — Store data
- `storage.list` — List stored items
- `storage.delete` — Remove from storage

### RLHF Intents
- `rlhf.feedback` — Submit user feedback
- `rlhf.preference` — Record preference choice
- `rlhf.trace` — Log interaction trace

---

## Deployment Checklist

### For Each Shard:

1. **Create GAS Project**
   - Go to https://script.google.com
   - Create new project
   - Name it clearly (e.g., "MX2LM Foreman Shard")

2. **Implement doPost/doGet**
   - Use templates above
   - Always return JSON AST
   - Never return HTML/JS directly

3. **Deploy as Web App**
   - Deploy → New deployment
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone

4. **Register in SHARD_REGISTRY.json**
   - Add URL to registry
   - Mark status as "active"

5. **Test Contract**
   ```bash
   curl -X POST [SHARD_URL] \
     -H "Content-Type: application/json" \
     -d '{"@ast":"mx2","@intent":"health.check","@payload":{}}'
   ```

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `SHARD-INTEGRATION.md` | Complete shard roster & mesh architecture |
| `gas/README.md` | GAS plugin system details |
| `guides/readme.md` | Atomic guide philosophy |
| `BRAINS-CATALOG.md` | Brain file architecture |

---

## Final Mental Model

You are building:

> **A shard-native, AST-driven operating system where GAS is the CPU, MX2LM is the brain, and HTML is a terminal.**

- No frameworks
- No fake bundling
- No monoliths

Just **JSON → execution → JSON**.

---

```
STATUS: CANONICAL
VERSION: 1.0.0
ARCHITECTURE: Shard-Native AST-Driven
EXECUTION: GAS Fabric
BRAIN: MX2LM Foreman
SHELL: Micro-ASXR HTML
```
