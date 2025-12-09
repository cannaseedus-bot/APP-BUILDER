# ASX Builder Shard Integration

This document defines the ASX builder shard architecture where **each builder gets its own dedicated Google Apps Script cloud endpoint**.

## Architecture Principle

### ONE BUILDER = ONE SHARD

The ASX operating system uses a **distributed builder mesh** where every specialized builder runs as an independent cloud shard. This enables:

- **Horizontal scalability** - Each builder scales independently
- **Specialized optimization** - Each shard optimized for its specific task
- **Fault tolerance** - Failure of one builder doesn't affect others
- **Parallel execution** - Multiple builders work simultaneously
- **MX2LM orchestration** - Central quantum intelligence coordinates all shards

## Complete Builder Shard Roster

### Active Shards (Deployed)

#### 1. KUHUL Compiler Shard ⚡
**Endpoint:** `https://script.google.com/macros/s/AKfycby_XiNPlU7KxrcXWzIB7eBFf8q1BiTUIbAitjkKi31nJtd3DvFK9k7Z7nIiFwJ4Py48/exec`

**Specialization:** Symbolic CSS compression & optimization
**Compression Ratio:** 94%+
**Pipeline:** Pop → Wo → Sek → Xul → Ch'en

**Capabilities:**
- Symbolic CSS compilation
- Atomic class generation
- XCFE validation
- SCXQ2 compression

**API Routes:**
- `POST /compile` - Compile CSS to symbolic atoms
- `POST /optimize` - Optimize existing symbolic CSS
- `POST /validate` - Validate XCFE compliance
- `GET /metrics` - Compression metrics and stats

---

#### 2. MX2LM Orchestrator Shard 🧠
**Endpoint:** `https://script.google.com/macros/s/AKfycbypsqwHCxSrN_oYnDehoX3Wyl-Uj29zytP_6DwKcnTYoS4Jv2iraqn2Iz0k3Vh9UMts/exec`

**Specialization:** Multi-brain quantum orchestration
**Role:** Central coordinator for all builder shards

**Capabilities:**
- Shard coordination
- Quantum optimization
- RLHF learning
- Parallel job distribution
- Load balancing
- Fallback orchestration

**API Routes:**
- `POST /orchestrate` - Coordinate multi-shard operation
- `POST /optimize` - Quantum-optimize task distribution
- `POST /rlhf/feedback` - Submit human feedback
- `GET /mesh/status` - Health status of all shards
- `POST /route` - Intelligently route request to best shard

---

### Pending Deployment (7 Builder Shards)

#### 3. XJSON Builder Shard 📄
**Endpoint:** `[DEPLOY_XJSON_BUILDER_SHARD]`

**Specialization:** Structured data & API generation

**Capabilities:**
- XJSON schema generation
- API endpoint scaffolding
- Data validation rules
- Type inference
- Documentation generation

**API Routes:**
- `POST /generate/schema` - Generate XJSON schema from examples
- `POST /generate/api` - Scaffold REST API endpoints
- `POST /validate` - Validate XJSON structure
- `POST /transform` - Transform JSON to XJSON
- `GET /documentation` - Generate API documentation

---

#### 4. SCX Compressor Shard 🌀
**Endpoint:** `[DEPLOY_SCX_COMPRESSOR_SHARD]`

**Specialization:** Multi-algorithm semantic compression

**Algorithms:** SCXQ2, dictionary, symbolic, huffman, quantum-optimized

**Capabilities:**
- SCXQ2 semantic compression (65-85% for JSON)
- Dictionary compression (40-70% for text)
- Symbolic pattern replacement (87-94% for CSS)
- Huffman encoding
- Quantum compression optimization

**API Routes:**
- `POST /compress` - Compress data with specified algorithm
- `POST /decompress` - Decompress SCXQ2 data
- `POST /analyze` - Analyze compression potential
- `POST /optimize` - Auto-select best compression algorithm
- `GET /algorithms` - List available compression algorithms

---

#### 5. ASX Runtime Shard 🚀
**Endpoint:** `[DEPLOY_ASX_RUNTIME_SHARD]`

**Specialization:** Browser OS kernel services

**Capabilities:**
- Service worker orchestration
- Virtual file system (XJSON VFS)
- Process scheduling
- REST mesh networking
- Port management (61680-61684)
- Trust stamp security

**API Routes:**
- `POST /kernel/boot` - Boot ASX OS kernel
- `POST /process/spawn` - Spawn new process
- `POST /fs/mount` - Mount virtual file system
- `POST /network/mesh` - Join REST mesh
- `GET /kernel/status` - Kernel health and metrics

---

#### 6. Layout Generator Shard 📐
**Endpoint:** `[DEPLOY_LAYOUT_GENERATOR_SHARD]`

**Specialization:** Responsive grid systems

**Layout Systems:** CSS Grid, Flexbox, Masonry, Holy Grail, Sidebar, Dashboard

**Capabilities:**
- Responsive grid generation
- Flexbox layout optimization
- Breakpoint calculation
- Golden ratio layouts
- Accessibility compliance
- Mobile-first design

**API Routes:**
- `POST /generate/grid` - Generate CSS Grid layout
- `POST /generate/flexbox` - Generate Flexbox layout
- `POST /optimize/breakpoints` - Calculate optimal breakpoints
- `POST /analyze/layout` - Analyze layout accessibility
- `GET /templates` - List layout templates

---

#### 7. Style System Shard 🎨
**Endpoint:** `[DEPLOY_STYLE_SYSTEM_SHARD]`

**Specialization:** Design tokens & theming

**Design Systems:** Material, Fluent, Carbon, Tailwind-inspired, Custom

**Capabilities:**
- Design token generation
- Theme system creation
- Color palette optimization
- Typography scales
- CSS custom properties
- Dark mode generation

**API Routes:**
- `POST /generate/tokens` - Generate design tokens
- `POST /generate/theme` - Generate complete theme
- `POST /generate/palette` - Generate color palette
- `POST /generate/typography` - Generate typography scale
- `POST /convert/tokens` - Convert tokens between formats

**Token Categories:** colors, typography, spacing, shadows, borders, animations, breakpoints

---

#### 8. Component Factory Shard 🧱
**Endpoint:** `[DEPLOY_COMPONENT_FACTORY_SHARD]`

**Specialization:** Reusable UI components

**Component Library:** buttons, forms, modals, cards, navigation, data tables, charts, dashboards

**Capabilities:**
- Component scaffolding
- Atomic composition (atoms → molecules → organisms)
- Variant generation
- Accessibility patterns
- Event handler templates
- Component documentation

**API Routes:**
- `POST /generate/component` - Generate UI component
- `POST /generate/variants` - Generate component variants
- `POST /compose/atomic` - Compose atomic components
- `POST /analyze/accessibility` - Analyze component a11y
- `GET /library` - List component library

---

#### 9. Animation Studio Shard ✨
**Endpoint:** `[DEPLOY_ANIMATION_STUDIO_SHARD]`

**Specialization:** CSS animations & motion design

**Animation Types:** entrance, exit, micro-interactions, loading states, scroll-triggered, gesture-based, data visualizations

**Capabilities:**
- Keyframe generation
- Transition optimization
- Easing function library
- Scroll animations
- Gesture animations
- Performance optimization

**API Routes:**
- `POST /generate/keyframes` - Generate CSS keyframes
- `POST /generate/transition` - Generate CSS transitions
- `POST /optimize/performance` - Optimize animation performance
- `POST /generate/scroll` - Generate scroll-triggered animations
- `GET /easing` - List easing functions

**Easing Library:** ease-in-out, cubic-bezier, spring, bounce, elastic, custom curves

---

## Mesh Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ASX Operating System                         │
│                   (Browser-Native OS Core)                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                   ┌───────────▼───────────┐
                   │   MX2LM ORCHESTRATOR  │
                   │   (Quantum AI Brain)  │
                   │  Coordinates All 8    │
                   │   Builder Shards      │
                   └─────────┬─────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
     ┌─────▼─────┐     ┌─────▼─────┐    ┌─────▼─────┐
     │  KUHUL    │     │  XJSON    │    │   SCX     │
     │ Compiler  │     │  Builder  │    │Compressor │
     │  Shard    │     │   Shard   │    │   Shard   │
     └───────────┘     └───────────┘    └───────────┘
           │                 │                 │
           └─────────────────┼─────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
     ┌─────▼─────┐     ┌─────▼─────┐    ┌─────▼─────┐
     │   ASX     │     │  Layout   │    │   Style   │
     │  Runtime  │     │ Generator │    │  System   │
     │   Shard   │     │   Shard   │    │   Shard   │
     └───────────┘     └───────────┘    └───────────┘
           │                 │                 │
           └─────────────────┼─────────────────┘
                             │
                   ┌─────────▼─────────┐
                   │   Component       │
                   │   Factory         │
                   │   Shard           │
                   └─────────┬─────────┘
                             │
                   ┌─────────▼─────────┐
                   │   Animation       │
                   │   Studio          │
                   │   Shard           │
                   └───────────────────┘
                             │
                   ┌─────────▼─────────┐
                   │  Service Worker   │
                   │   (sw.js kernel)  │
                   │  Local Execution  │
                   └───────────────────┘
```

## Usage Examples

### Multi-Shard Workflow: Build Complete App

```javascript
// Example: Build entire web application using multiple shards

async function buildCompleteApp(spec) {
  // 1. MX2LM orchestrates the entire workflow
  const workflow = await fetch('https://.../mx2lm/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'orchestrate',
      workflow: {
        // Step 1: Generate layout (Layout Generator Shard)
        layout: {
          shard: 'layout_generator',
          action: 'generate/grid',
          config: spec.layout
        },
        // Step 2: Generate design tokens (Style System Shard)
        tokens: {
          shard: 'style_system',
          action: 'generate/tokens',
          config: spec.theme
        },
        // Step 3: Generate components (Component Factory Shard)
        components: {
          shard: 'component_factory',
          action: 'generate/component',
          config: spec.components
        },
        // Step 4: Compress CSS (KUHUL Compiler Shard)
        compress: {
          shard: 'kuhul_compiler',
          action: 'compile',
          target: 'symbolic_atoms'
        },
        // Step 5: Add animations (Animation Studio Shard)
        animations: {
          shard: 'animation_studio',
          action: 'generate/keyframes',
          config: spec.animations
        },
        // Step 6: Generate API layer (XJSON Builder Shard)
        api: {
          shard: 'xjson_builder',
          action: 'generate/api',
          config: spec.api
        },
        // Step 7: Deploy to ASX OS (ASX Runtime Shard)
        deploy: {
          shard: 'asx_runtime',
          action: 'kernel/boot',
          config: { ports: [61680, 61681, 61682] }
        }
      }
    })
  });

  return await workflow.json();
}
```

### Individual Shard Usage

```javascript
// KUHUL Compiler Shard - Compress CSS
async function compressCSS(css) {
  const response = await fetch('https://.../kuhul/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'compile',
      input_css: css,
      target: 'symbolic_atoms',
      optimize: true
    })
  });

  return await response.json();
}

// Style System Shard - Generate Theme
async function generateTheme(colors) {
  const response = await fetch('https://.../style_system/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'generate/theme',
      base_colors: colors,
      dark_mode: true,
      a11y_compliant: true
    })
  });

  return await response.json();
}

// Component Factory Shard - Generate Button Variants
async function generateButtons() {
  const response = await fetch('https://.../component_factory/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'generate/variants',
      component: 'button',
      variants: ['primary', 'secondary', 'ghost', 'danger'],
      sizes: ['sm', 'md', 'lg']
    })
  });

  return await response.json();
}
```

## Service Worker Shard Router

Add to `sw.js` for automatic shard routing:

```javascript
const BUILDER_SHARDS = {
  kuhul: 'https://script.google.com/macros/s/AKfycby_XiNPlU.../exec',
  xjson: 'https://script.google.com/macros/s/[XJSON_SHARD]/exec',
  scx: 'https://script.google.com/macros/s/[SCX_SHARD]/exec',
  asx: 'https://script.google.com/macros/s/[ASX_SHARD]/exec',
  layout: 'https://script.google.com/macros/s/[LAYOUT_SHARD]/exec',
  style: 'https://script.google.com/macros/s/[STYLE_SHARD]/exec',
  component: 'https://script.google.com/macros/s/[COMPONENT_SHARD]/exec',
  animation: 'https://script.google.com/macros/s/[ANIMATION_SHARD]/exec',
  mx2lm: 'https://script.google.com/macros/s/AKfycbypsqw.../exec'
};

async function routeToBuilderShard(builder, action, payload) {
  const endpoint = BUILDER_SHARDS[builder];
  if (!endpoint) {
    console.warn(`Shard ${builder} not deployed, using local fallback`);
    return localFallback(builder, action, payload);
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
      timeout: 30000
    });

    return await response.json();
  } catch (error) {
    console.error(`Shard ${builder} failed, falling back to local`);
    return localFallback(builder, action, payload);
  }
}

// Auto-route API calls to appropriate shards
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  const shardRoutes = {
    '/api/compile': 'kuhul',
    '/api/xjson': 'xjson',
    '/api/compress': 'scx',
    '/api/runtime': 'asx',
    '/api/layout': 'layout',
    '/api/theme': 'style',
    '/api/component': 'component',
    '/api/animate': 'animation',
    '/api/orchestrate': 'mx2lm'
  };

  for (const [route, shard] of Object.entries(shardRoutes)) {
    if (url.pathname.startsWith(route)) {
      event.respondWith(
        event.request.json().then(payload =>
          routeToBuilderShard(shard, payload.action, payload)
        )
      );
      return;
    }
  }
});
```

## Deployment Guide

### Deploy a New Builder Shard to Google Apps Script

1. **Create New GAS Project**
   - Go to https://script.google.com
   - New Project → Name it (e.g., "ASX KUHUL Compiler Shard")

2. **Implement doPost Handler**
   ```javascript
   function doPost(e) {
     const request = JSON.parse(e.postData.contents);
     const action = request.action;

     // Route to builder-specific logic
     switch(action) {
       case 'compile':
         return compileCSS(request);
       case 'optimize':
         return optimizeCode(request);
       default:
         return error('Unknown action');
     }
   }
   ```

3. **Deploy as Web App**
   - Deploy → New deployment
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Deploy

4. **Copy URL to Manifest**
   - Copy deployment URL
   - Update `BUILDER-SHARDS-MANIFEST.json`
   - Update `sw.js` BUILDER_SHARDS object

5. **Test**
   ```bash
   curl -X POST [YOUR_SHARD_URL] \
     -H "Content-Type: application/json" \
     -d '{"action":"compile","input_css":"display:flex"}'
   ```

## Related Documentation

- `BUILDER-SHARDS-MANIFEST.json` - Complete shard configuration
- `BRAINS-CATALOG.md` - Brain file architecture
- `BACKEND-SETUP.md` - Local AI model integration
- `manifest.json` - ASX OS system configuration

---

**Version:** 2.0 (Builder-per-Shard Architecture)
**Last Updated:** 2025-12-09
**Active Shards:** 2/9 (KUHUL, MX2LM)
**Pending Deployment:** 7 builder shards
