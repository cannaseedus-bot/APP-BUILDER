# ⚛️ MX2CX Builder Codex Micro-ASXR

**Version:** 1.0.0
**Type:** Standalone Micro-ASXR Operating System
**Role:** AI-Powered Builder Research & Chat Inference Station

---

## 🌟 Overview

MX2CX is a **standalone Micro-ASXR** - a complete, self-contained operating system for AI-assisted development research that runs entirely in the browser. It provides:

- **🤖 AI Chat Inference** - Ask questions about XJSON, K'UHUL, XCFE, JSON AST, Atomic ASX
- **🔍 Builder Research** - AI-powered template research and discovery
- **🛠️ Template Forge** - Generate project templates from specifications
- **📦 Stack Manager** - Manage technology stacks and dependencies
- **🤖 Agent Forge** - Create and configure custom agents
- **📊 RLHF Visualizer** - Visualize reinforcement learning metrics
- **🌐 REST Mesh Proxy** - Local API → Mesh API bridge with override capability
- **🗄️ ASX-RAM Storage** - Virtual key/value store with TTL support
- **⚡ Hazard Gold Theme** - Cyberpunk-inspired atomic UI design
- **🎨 Atomic Guide Shell** - Tape-based navigation system
- **Zero Backend** - Pure service worker + Cache API
- **Portable** - Plug into any ASXR/PRIME/CMS instance

---

## 🏗️ Architecture

### Micro-ASXR Stack

```
┌─────────────────────────────────────────┐
│       MX2CX MICRO-ASXR v1.0             │
├─────────────────────────────────────────┤
│  Service Worker Mesh Kernel (sw.js)    │
│  ├─ REST Mesh Proxy                    │
│  ├─ ASX-RAM Key/Value Store            │
│  ├─ Chat Inference Agent               │
│  └─ HTTP API Router                    │
├─────────────────────────────────────────┤
│  Atomic Guide UI (index.html)          │
│  ├─ Tape Navigation                    │
│  ├─ Chat Interface                     │
│  ├─ Hazard Gold Theme                  │
│  └─ Service Worker Client              │
├─────────────────────────────────────────┤
│  Knowledge Base (Built-in)             │
│  ├─ XJSON Format Spec                  │
│  ├─ K'UHUL Pipeline Guide              │
│  ├─ XCFE Control Flow Docs             │
│  ├─ JSON AST Examples                  │
│  └─ Atomic ASX Block Reference         │
├─────────────────────────────────────────┤
│  ASX-RAM Virtual Storage                │
│  ├─ builder.last_query                 │
│  ├─ builder.last_stack                 │
│  ├─ builder.mesh_base                  │
│  ├─ builder.agent_state                │
│  └─ builder.rlhf.metrics.cache         │
├─────────────────────────────────────────┤
│  HTTP API Surface                       │
│  ├─ POST /api/builder/chat             │
│  ├─ POST /api/builder/research         │
│  ├─ POST /api/builder/template/build   │
│  ├─ POST /api/builder/template/stack   │
│  ├─ POST /api/builder/agent/create     │
│  ├─ GET  /api/rlhf/metrics             │
│  ├─ POST /api/builder/mesh/override    │
│  └─ GET  /api/builder/mesh/config      │
└─────────────────────────────────────────┘
```

### KUHUL Pipeline Integration

All Builder operations flow through enhanced KUHUL pipeline:

```
REQUEST → POP → WO → SEK → XUL → CH'EN
```

**Example: Chat Inference**
```
⟁Pop question
⟁Wo knowledge_base
⟁Sek search_topics
⟁Sek format_response
⟁Xul answer
```

### ASX-RAM Storage Keys

```
builder.last_query          - Last research query (TTL: 24h)
builder.last_stack          - Last selected stack (TTL: 24h)
builder.mesh_base           - Mesh API override URL (TTL: 7 days)
builder.agent_state         - Active agent configuration (TTL: 1h)
builder.rlhf.metrics.cache  - RLHF metrics cache (TTL: 10min)
```

---

## 🚀 Quick Start

### 1. Deploy MX2CX

```bash
# Serve the mx2cx directory
cd mx2cx
python -m http.server 8000
```

Navigate to `http://localhost:8000`

The service worker will auto-install and bootstrap the MX2CX kernel.

### 2. Ask AI Questions

The **Chat Inference** interface is the primary feature:

1. Click the **💬 AI Assistant** tape
2. Type your question in the chat input
3. Click **✨ Ask Question** (or Ctrl+Enter)
4. Get instant answers with examples

**Example Questions:**
- "What is XJSON?"
- "Explain K'UHUL pipeline stages"
- "How does XCFE work?"
- "Show me JSON AST example"
- "What are Atomic ASX blocks?"

### 3. Override Mesh API (Optional)

By default, MX2CX proxies to `https://api.asxtoken.com`. To use a custom mesh:

```javascript
fetch('/api/builder/mesh/override', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mesh_base: 'https://your-api.example.com'
  })
});
```

---

## 📡 API Reference

### Chat Inference (Primary Feature)

```javascript
POST /api/builder/chat

Request:
{
  "question": "What is XJSON?"
}

Response:
{
  "ok": true,
  "response": "**XJSON**: Extensible JSON format with semantic metadata...",
  "suggestions": ["What is K'UHUL?", "Explain XCFE"],
  "topics": [
    {
      "name": "XJSON",
      "description": "Extensible JSON format with semantic metadata",
      "keys": ["@context", "@v", "@law", "@entity"]
    }
  ],
  "examples": [
    {
      "topic": "XJSON",
      "example": "basic",
      "code": "{\n  \"@context\": \"xjson://asxr/manifest/v1\",\n  \"@v\": \"1.0.0\"\n}"
    }
  ],
  "timestamp": "2025-12-10T12:00:00.000Z"
}
```

### Builder Research

```javascript
POST /api/builder/research

Request:
{
  "query": "React + TypeScript + Tailwind CSS starter template"
}

Response:
{
  "ok": true,
  "data": {
    "results": [...],
    "templates": [...]
  }
}
```

### Template Forge

```javascript
POST /api/builder/template/build

Request:
{
  "template": "react-ts-tailwind",
  "options": {
    "name": "my-app",
    "features": ["router", "state-management"]
  }
}

Response:
{
  "ok": true,
  "data": {
    "template": {...},
    "files": [...]
  }
}
```

### Stack Manager

```javascript
POST /api/builder/template/stack

Request:
{
  "stack": ["react", "typescript", "vite", "tailwindcss"]
}

Response:
{
  "ok": true,
  "data": {
    "stack": {...},
    "dependencies": {...}
  }
}
```

### Agent Forge

```javascript
POST /api/builder/agent/create

Request:
{
  "name": "custom.agent",
  "role": "data_processor",
  "actions": {...}
}

Response:
{
  "ok": true,
  "data": {
    "agent": {...}
  }
}
```

### RLHF Metrics

```javascript
GET /api/rlhf/metrics

Response:
{
  "ok": true,
  "data": {
    "metrics": {
      "feedback_count": 42,
      "avg_score": 0.87,
      "recent_feedback": [...]
    }
  },
  "source": "cache"  // or "mesh"
}
```

### Mesh Configuration

```javascript
// Override mesh base
POST /api/builder/mesh/override

Request:
{
  "mesh_base": "https://custom-api.example.com"
}

Response:
{
  "ok": true,
  "mesh_base": "https://custom-api.example.com"
}

// Get current config
GET /api/builder/mesh/config

Response:
{
  "ok": true,
  "config": {
    "mesh_base": "https://api.asxtoken.com",
    "shard": "builder_codex"
  }
}
```

---

## 🤖 Built-in AI Knowledge Base

The **Chat Inference Agent** has built-in knowledge about:

### 1. XJSON Format

**What it is:** Extensible JSON with semantic metadata

**Key Properties:**
- `@context` - Semantic context URI
- `@v` - Version string
- `@law` - Governance rule
- `@entity` - Entity metadata
- `n` - Name
- `d` - Description

**Example:**
```json
{
  "@context": "xjson://asxr/manifest/v1",
  "@v": "1.0.0",
  "n": "My ASXR App",
  "d": "Description of the app",
  "@law": "SYNC = XCFE → KUHUL → ASX-RAM → XJSON"
}
```

### 2. K'UHUL Pipeline

**What it is:** Enhanced 6-stage execution pipeline

**Stages:**
1. **SECURITY** - Validation and threat detection
2. **POP** - Request initialization
3. **WO** - Credential/auth handling
4. **SEK** - Core processing operations
5. **XUL** - Response formatting
6. **CH'EN** - Final delivery

**Flow Example:**
```
⟁Pop⟁github_api⟁Wo⟁credentials⟁Sek⟁fetch_content⟁Sek⟁decode_base64⟁Sek⟁write_vfs⟁Xul
```

### 3. XCFE (eXecution Control Flow Enforcement)

**What it is:** Control flow governance framework

**Vectors:**
- `@control` - Control directives
- `@flow` - Data flow paths
- `@view` - UI rendering rules
- `@variable` - Variable definitions

**Example:**
```json
{
  "@control": {
    "@control.auth": "token_security_control",
    "@control.rate": "api_rate_limiter"
  },
  "@flow": {
    "@flow.push": "vfs → encode → github",
    "@flow.pull": "github → decode → vfs"
  }
}
```

### 4. JSON AST

**What it is:** JSON Abstract Syntax Tree for code generation

**Node Types:**
- Program
- Statement
- Expression
- Identifier
- Literal

**Example:**
```json
{
  "type": "Program",
  "body": [
    {
      "type": "ExpressionStatement",
      "expression": {
        "type": "CallExpression",
        "callee": { "type": "Identifier", "name": "console.log" },
        "arguments": [{ "type": "Literal", "value": "Hello" }]
      }
    }
  ]
}
```

### 5. Atomic ASX Blocks

**What it is:** Utility-first CSS framework for ASXR interfaces

**Common Classes:**
- Layout: `flex`, `grid`, `flex-col`, `flex-row`
- Spacing: `p-4`, `m-2`, `gap-4`, `space-x-2`
- Colors: `bg-panel`, `text-gold`, `bg-dark`
- Size: `w-full`, `h-screen`, `max-w-4xl`
- Borders: `rounded-lg`, `border`, `shadow-md`

**Example:**
```html
<div class="bg-panel rounded-lg shadow-md p-4">
  <button class="bg-gold text-dark px-4 py-2 rounded-md hover:bg-gold-light">
    Click Me
  </button>
</div>
```

---

## 🎨 Hazard Gold Ghost Theme

The MX2CX UI uses a cyberpunk-inspired color palette:

```css
--gold: #ffd000          /* Primary accent - hazard gold */
--gold-light: #ffe84d    /* Hover state */
--gold-dark: #ccaa00     /* Active state */
--cyan: #16f2aa          /* Secondary accent */
--cyan-light: #4df5c0    /* Hover state */
--bg: #020409            /* Background - deep dark */
--panel: #050a14         /* Panel background */
--border: #1a2332        /* Border color */
--text: #e8eef5          /* Primary text */
--text-dim: #8b95a3      /* Dimmed text */
```

**Interactive States:**
- Hover: Lighter shade + slight transform
- Active: Click feedback with transform
- Focus: Gold border glow

---

## 📋 Tape Navigation

MX2CX uses a **tape-based navigation** system inspired by ASXR architecture:

| Icon | Tape | Role | Status |
|------|------|------|--------|
| 💬 | AI Assistant | Chat inference for knowledge base | ✅ Active |
| 🔍 | Research | Template & stack research | 🔗 Mesh Proxy |
| 🛠️ | Template Forge | Generate project templates | 🔗 Mesh Proxy |
| 📦 | Stack Manager | Manage tech stacks | 🔗 Mesh Proxy |
| 🤖 | Agent Forge | Create custom agents | 🔗 Mesh Proxy |
| 📊 | RLHF Visualizer | View training metrics | 🔗 Mesh Proxy |

- **✅ Active** - Runs locally in service worker
- **🔗 Mesh Proxy** - Proxies to mesh API

---

## 🔗 Integration

### With ASXR CMS

MX2CX can be embedded in the main CMS as a builder tool:

```javascript
// In CMS, open MX2CX in iframe
const openBuilder = () => {
  const iframe = document.createElement('iframe');
  iframe.src = '/mx2cx/';
  iframe.style.width = '100%';
  iframe.style.height = '100vh';
  document.body.appendChild(iframe);
};
```

### With MX2GIT

MX2CX can use MX2GIT to pull/push template code:

```javascript
// Research template
const template = await fetch('/api/builder/research', {
  method: 'POST',
  body: JSON.stringify({ query: 'React starter' })
}).then(r => r.json());

// Push to GitHub via MX2GIT
await fetch('http://localhost:8001/api/mx2git/push', {
  method: 'POST',
  body: JSON.stringify({
    repo: 'user/templates',
    branch: 'main',
    path: 'react-starter/package.json',
    vfsPath: '/projects/templates/react-starter/package.json',
    message: 'Add React starter template'
  })
});
```

### With MX2LM Brain Builders

MX2CX can help generate training configurations:

```javascript
// Ask AI about training config
const answer = await fetch('/api/builder/chat', {
  method: 'POST',
  body: JSON.stringify({
    question: 'What hyperparameters should I use for fine-tuning GPT-2?'
  })
}).then(r => r.json());

// Use answer to configure training
console.log(answer.response);
```

---

## 📁 File Structure

```
mx2cx/
├── index.html              # Atomic Guide UI (868 lines)
├── sw.js                   # Service worker mesh kernel (577 lines)
├── manifest.json           # MX2CX manifest (199 lines)
└── README.md               # This file
```

**Total:** ~1,644 lines of code

---

## 🌐 Deployment

### Static Hosting

MX2CX works on any static host:

- GitHub Pages
- Netlify
- Vercel
- CloudFlare Pages
- AWS S3 + CloudFront

**Requirements:**
- HTTPS (required for service workers)
- Modern browser with service worker support

### Build Steps

No build step required - all files are static!

```bash
# Just copy the mx2cx/ directory
rsync -av mx2cx/ user@server:/var/www/mx2cx/
```

---

## 🔬 Development

### Service Worker Updates

After modifying `sw.js`:

1. Update `MX2CX_OS_ID` version
2. Hard refresh browser (Ctrl+Shift+R)
3. Check DevTools > Application > Service Workers
4. Click "Update" or "Unregister" + refresh

### Debugging

**Service Worker Console:**
```
DevTools > Console > Filter: "[MX2CX]"
```

**ASX-RAM Inspection:**
```
DevTools > Application > Cache Storage > MX2CX_MICRO_ASXR_v1-runtime
```

**API Testing:**
```javascript
// Test chat endpoint
const answer = await fetch('/api/builder/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'What is XJSON?' })
}).then(r => r.json());

console.log(answer);
```

---

## 🚀 Roadmap

### v1.1 (Planned)

- [ ] Mesh API connection status indicator
- [ ] Offline mode with full local knowledge base
- [ ] Export chat history
- [ ] Custom knowledge base entries
- [ ] Multi-language code generation

### v1.2 (Planned)

- [ ] Template preview before generation
- [ ] Stack dependency graph visualization
- [ ] Agent behavior simulator
- [ ] RLHF feedback submission
- [ ] Integration with code editors (VS Code)

### v2.0 (Future)

- [ ] Multi-agent orchestration UI
- [ ] Visual pipeline builder
- [ ] Real-time collaboration
- [ ] Plugin marketplace
- [ ] Advanced AST manipulation tools

---

## 📖 Documentation

- **KUHUL Pipeline:** See `manifest.json` kuhul_folds
- **Chat Agent:** See `sw.js` BuilderChatAgent
- **API Surface:** See `sw.js` APIRouter
- **ASXR Trinity:** See `../README.md`

---

## 📄 License

Part of ASXR Trinity v3.2.0
Version: 13.2.0-XCFE-POLYGLOT-ETERNAL

---

## 🙏 Credits

Built with:
- KUHUL Pipeline Architecture
- XJSON Data Format
- XCFE Control Flow Governance
- ASX-RAM Virtual Key/Value Store
- Service Worker API
- Cache API

**Architecture:** Standalone Micro-ASXR
**Foundation:** ASXR Trinity v3.2.0
**Integration:** CMS-agnostic, MX2GIT-compatible, MX2LM-ready

---

## 💡 Usage Tips

1. **Chat First:** The AI chat is the primary interface - use it to learn about all technologies
2. **Mesh Override:** Set a custom mesh API if you have your own backend
3. **Keyboard Shortcuts:** Use Ctrl+Enter (or Cmd+Enter) to submit questions quickly
4. **Suggestion Chips:** Click the suggestion chips for quick example questions
5. **Examples:** The AI provides code examples with every answer - copy and use them!
6. **Offline:** The knowledge base works offline - service worker caches everything
7. **ASX-RAM:** All your queries and states are cached with TTLs for fast access

---

**Built with ⚛️ by the ASXR Trinity team**
