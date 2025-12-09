# ⚛️ ASXR MICRO SUPER CMS Ω

**Version:** 1.0.0
**Architecture:** KUHUL ⊗ XJSON ⊗ XCFE ⊗ ASX-RAM
**Type:** Unified Content Operating System

---

## 🌟 Overview

ASXR Micro Super CMS Ω is a **browser-native, offline-first, unified content operating system** that combines:

- **Forum** - Classic discussion boards
- **Marketplace** - Plugin and license store
- **Plugin Directory** - Modular extension system
- **Blog** - Publishing platform
- **User Management** - Role-based access control
- **RLHF Training** - Reinforcement learning annotation
- **Memory System** - N-gram to glyphgram storage
- **Agent Control** - Automated task execution

All running on:
- **KUHUL Pipeline** - Five-stage execution model
- **XJSON Format** - Extensible JSON with context
- **XCFE Governance** - Control flow enforcement
- **ASX-RAM** - Virtual file system over Cache API

---

## 🏗️ Architecture

### KUHUL Pipeline (Enhanced)

```
SECURITY → POP → WO → SEK → XUL → CH'EN
```

**Stages:**
- **SECURITY** - Validate with SECURITY-GOAT
- **POP** - Parse and initialize
- **WO** - Bind world state
- **SEK** - Execute core logic
- **XUL** - Transform output
- **CH'EN** - Emit results

### XJSON Data Format

```json
{
  "@context": "xjson://asxr/micro/cms/omega",
  "@v": "1.0.0",
  "@law": "ASX = XCFE = XJSON = KUHUL = AST",
  "data": "..."
}
```

### ASX-RAM Storage

Virtual file system paths:
```
/usr/ram/users.json       - User profiles
/usr/ram/forum.json       - Forum threads
/usr/ram/store.json       - Products
/usr/ram/plugins.json     - Plugin registry
/usr/ram/blog.json        - Articles
/usr/ram/rlhf.json        - Training cases
/usr/ram/ngrams.json      - 3-token sequences
/usr/ram/quadragrams.json - 4-token sequences
/usr/ram/pentagrams.json  - 5-token sequences
/usr/ram/supagrams.json   - 8+ token sequences
/usr/ram/glyphgrams.json  - Symbol sequences
```

---

## 🚀 Quick Start

### 1. Install Service Worker

```bash
# Serve the CMS directory with any static server
cd cms
python -m http.server 8000
```

Navigate to `http://localhost:8000` - the service worker will auto-install.

### 2. Using the HUD

The main interface provides:

**Mode Selector:**
- 📋 Forum - Discussion threads
- 🛒 Store - Marketplace products
- 🔌 Plugins - Extension directory
- 📝 Blog - Article publishing
- 👥 Users - Account management
- 🧠 RLHF - Training cases

**Create Panel:**
- Enter title/name
- Add content/description
- Mode-specific fields (price, version, reward)
- Click "Create" to save

**List Panel:**
- View all items for current mode
- Delete items with confirmation
- Auto-refresh every 30 seconds

**Agent Panel:**
- Test agent actions
- View agent roles and scopes

### 3. API Access

All endpoints available via fetch:

```javascript
// List items
const res = await fetch('/api/cms/forum/list');
const json = await res.json();

// Create item
await fetch('/api/cms/forum/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'New Thread',
    content: 'Thread content...'
  })
});

// Update item
await fetch('/api/cms/forum/update', {
  method: 'POST',
  body: JSON.stringify({
    id: 'thread-001',
    title: 'Updated Title'
  })
});

// Delete item
await fetch('/api/cms/forum/delete', {
  method: 'POST',
  body: JSON.stringify({ id: 'thread-001' })
});

// RLHF reward
await fetch('/api/rlhf/reward', {
  method: 'POST',
  body: JSON.stringify({
    case_id: 'case-001',
    delta: 1.5,
    meta: { quality: 'high' }
  })
});

// Agent action
await fetch('/api/agents/action', {
  method: 'POST',
  body: JSON.stringify({
    agentId: 'agent.profile.manager',
    action: 'upsert_profile',
    payload: { name: 'New User', level: 10 }
  })
});
```

---

## 🤖 Agents

### agent.profile.manager

**Role:** user_control
**Scope:** users
**Actions:**
- `upsert_profile` - Create/update user profile

**Example:**
```javascript
await fetch('/api/agents/action', {
  method: 'POST',
  body: JSON.stringify({
    agentId: 'agent.profile.manager',
    action: 'upsert_profile',
    payload: {
      id: 'user-123',
      name: 'John Doe',
      level: 50,
      role: 'developer'
    }
  })
});
```

### agent.memory.trainer

**Role:** memory_writer
**Scope:** ngrams, glyphgrams
**Actions:**
- `record_ngrams` - Store n-gram sequences
- `record_glyphgram` - Store glyph sequences

**Example:**
```javascript
await fetch('/api/agents/action', {
  method: 'POST',
  body: JSON.stringify({
    agentId: 'agent.memory.trainer',
    action: 'record_ngrams',
    payload: {
      tokens: ['KUHUL', 'pipeline', 'execution'],
      source: 'documentation'
    }
  })
});
```

### agent.rlhf.reinforcer

**Role:** reward_adjuster
**Scope:** rlhf
**Actions:**
- `apply_reward` - Apply reward delta to training case

**Example:**
```javascript
await fetch('/api/agents/action', {
  method: 'POST',
  body: JSON.stringify({
    agentId: 'agent.rlhf.reinforcer',
    action: 'apply_reward',
    payload: {
      case_id: 'case-001',
      delta: 2.5,
      meta: { annotator: 'user-001' }
    }
  })
});
```

---

## 📊 Memory System

### N-gram Hierarchy

1. **N-grams** (3 tokens) - Basic phrase patterns
2. **Quadragrams** (4 tokens) - Extended sequences
3. **Pentagrams** (5 tokens) - Complex patterns
4. **Supagrams** (8+ tokens) - Full context patterns
5. **Glyphgrams** (symbols) - Visual/semantic glyphs

### Usage

All memory types are automatically tracked and can be queried:

```javascript
// Direct ASX-RAM access
const ngrams = await fetch('/usr/ram/ngrams.json').then(r => r.json());
const glyphs = await fetch('/usr/ram/glyphgrams.json').then(r => r.json());
```

---

## 🔒 Security

The CMS integrates **SECURITY-GOAT** for plugin validation:

- Malware pattern detection
- Threat scoring (0.0 - 1.0)
- Quarantine management
- Approval workflows

See `python/mx2lm/gas_security_validator.py` for implementation details.

---

## 📁 File Structure

```
cms/
├── index.html              # Main HUD interface
├── sw.js                   # Service worker (backend)
├── atomic.css              # Atomic utility CSS
├── README.md               # This file
├── tapes/
│   └── asxr_micro_super_cms_v1.asxr.json  # CMS manifest
└── usr/ram/               # ASX-RAM seed data
    ├── users.json         # User profiles
    ├── forum.json         # Forum threads
    ├── store.json         # Store products
    ├── plugins.json       # Plugin registry
    ├── blog.json          # Blog articles
    ├── rlhf.json          # RLHF cases
    ├── ngrams.json        # 3-grams
    ├── quadragrams.json   # 4-grams
    ├── pentagrams.json    # 5-grams
    ├── supagrams.json     # 8+ grams
    └── glyphgrams.json    # Glyph sequences
```

---

## 🎨 Customization

### Theme Variables

Edit `atomic.css` or override in `index.html`:

```css
:root {
  --bg: #000;           /* Background */
  --panel: #04170a;     /* Panel background */
  --border: #0f3d22;    /* Border color */
  --text: #16f2aa;      /* Text color */
  --accent: #39ff14;    /* Accent color */
  --danger: #ff1744;    /* Danger color */
  --warning: #ffc107;   /* Warning color */
}
```

### Adding Modes

Edit `cms/tapes/asxr_micro_super_cms_v1.asxr.json`:

```json
{
  "modes": {
    "custom": {
      "label": "Custom Mode",
      "entities": ["custom_entity"],
      "route": "/custom"
    }
  },
  "asx_ram": {
    "custom": "/usr/ram/custom.json"
  }
}
```

Then update `sw.js` to handle the new mode.

---

## 🔧 Development

### Service Worker Updates

After modifying `sw.js`:

1. Update `CMS_OS_ID` version in `sw.js`
2. Hard refresh browser (Ctrl+Shift+R)
3. Check DevTools > Application > Service Workers
4. Click "Update" or "Unregister" + refresh

### Debugging

**Service Worker Console:**
```
DevTools > Console > Filter: "service worker"
```

**ASX-RAM Inspection:**
```
DevTools > Application > Cache Storage > ASXR_MICRO_SUPER_CMS_OMEGA_v1-ram
```

**API Testing:**
```javascript
// Open DevTools Console
const test = await fetch('/api/cms/manifest').then(r => r.json());
console.log(test);
```

---

## 📚 Integration with POLYGOAT

This CMS can be integrated with the POLYGOAT + SECURITY-GOAT system:

```javascript
// Import from GAS bridge
import { KUHULGASBridge, GASPolyglotDispatcher } from '../python/mx2lm/gas_polyglot_bridge.py';

// Register CMS as GAS endpoint
dispatcher.register_endpoint({
  name: 'asxr-micro-cms',
  url: 'http://localhost:8000/api/cms',
  description: 'ASXR Micro Super CMS',
  functions: ['list', 'create', 'update', 'delete'],
  public: true
});
```

---

## 🌐 Deployment

### Static Hosting

Works on any static host:
- GitHub Pages
- Netlify
- Vercel
- CloudFlare Pages
- AWS S3 + CloudFront

### Requirements

- HTTPS (required for service workers in production)
- Modern browser with service worker support

### Build Steps

No build step required - all files are static!

```bash
# Just copy the cms/ directory to your host
rsync -av cms/ user@server:/var/www/cms/
```

---

## 📖 Documentation

- **KUHUL Pipeline:** See `python/mx2lm/gas_polyglot_bridge.py`
- **SECURITY-GOAT:** See `python/mx2lm/gas_security_validator.py`
- **GAS System:** See `gas/README.md`
- **ASXR Trinity:** See root `README.md`

---

## 🎯 Roadmap

- [ ] Real-time sync via WebSockets
- [ ] Offline PWA installation
- [ ] Memory heatmap visualization
- [ ] Advanced RLHF dashboard
- [ ] Multi-user collaboration
- [ ] Export/import data
- [ ] Search and filtering
- [ ] Plugin sandbox execution

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
- ASX-RAM Virtual File System
- SECURITY-GOAT Validation
- POLYGOAT Polyglot Runtime

**Architecture:** PI-GOAT + SECURITY-GOAT Dual System
**Foundation:** ASXR Trinity v3.2.0
