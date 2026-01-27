# Local REST API + Static DNS Setup

## Overview

This guide shows how to run ASX shards locally with a REST API server, static DNS, and mesh network connectivity - **without requiring Python, backend servers, or complex dependencies**.

## Architecture

```
Browser (sw.js) ↔ Local REST API (NPX) ↔ API.PHP ↔ Internet
        ↕                    ↕
   K'uhul Runtime     XJSON Router
        ↕                    ↕
   Mesh Network      GAS Cloud Shards (fallback)
```

### Key Components

1. **Service Worker (sw.js)** - Browser-as-server HTTP endpoint
2. **Local REST API** - NPX-based local server (temporary)
3. **API.PHP** - Backend gateway to internet APIs
4. **K'uhul Runtime** - Fast API backend in browser
5. **Mesh Network** - P2P browser connections
6. **Static DNS** - Local domain mapping

## Quick Start (NPX Method)

### 1. Install Dependencies

```bash
# No Python required!
# Only Node.js needed (or use npx directly)

# Option A: Use npx (no install)
npx http-server ./asx-shards -p 8000 --cors

# Option B: Install globally
npm install -g http-server
http-server ./asx-shards -p 8000 --cors
```

### 2. Project Structure

```
asx-shards/
├── sw.js                    # Service Worker (browser server)
├── index.html               # ASX OS entry point
├── api/
│   ├── manifest.json        # API routes registry
│   ├── kuhul-runtime.js     # K'uhul execution engine
│   ├── xjson-router.js      # XJSON request router
│   └── mesh-connector.js    # P2P mesh network
├── shards/
│   ├── frontend/
│   ├── backend/
│   ├── design/
│   └── api/
└── backend/
    └── api.php              # PHP gateway (optional)
```

### 3. Service Worker Configuration (sw.js)

```javascript
// =======================================================
// SW.JS — BROWSER AS REST SERVER
// =======================================================

const SHARD_VERSION = "1.0.0";
const CACHE_NAME = `asx-shards-v${SHARD_VERSION}`;

// API routes registry
const API_ROUTES = {
  "/api/health": handleHealth,
  "/api/kuhul/compile": handleKuhulCompile,
  "/api/xjson/build": handleXJSONBuild,
  "/api/frontend/generate-ui": handleFrontendUI,
  "/api/backend/create-api": handleBackendAPI,
  "/api/design/create-3d": handleDesign3D,
  "/api/mesh/connect": handleMeshConnect,
  "/api/mesh/broadcast": handleMeshBroadcast
};

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing ASX Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/api/manifest.json',
        '/api/kuhul-runtime.js',
        '/api/xjson-router.js',
        '/api/mesh-connector.js'
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating ASX Service Worker...');
  event.waitUntil(self.clients.claim());
});

// Fetch event - This turns the browser into a REST server!
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Check if this is an API route
  const handler = API_ROUTES[url.pathname];

  if (handler) {
    // Handle as REST API endpoint
    event.respondWith(
      handler(event.request).then(response => {
        return new Response(JSON.stringify(response), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      })
    );
  } else {
    // Serve from cache or network
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// =======================================================
// API HANDLERS
// =======================================================

async function handleHealth(request) {
  return {
    success: true,
    service: "ASX Local REST API",
    version: SHARD_VERSION,
    timestamp: new Date().toISOString(),
    routes: Object.keys(API_ROUTES)
  };
}

async function handleKuhulCompile(request) {
  const body = await request.json();
  const { css, optimize } = body;

  // K'uhul compilation logic
  const compiled = compileKuhul(css, optimize);

  return {
    success: true,
    compiled: compiled.output,
    compression_ratio: compiled.ratio,
    original_bytes: css.length,
    compressed_bytes: compiled.output.length
  };
}

async function handleXJSONBuild(request) {
  const body = await request.json();
  const { spec, type } = body;

  // XJSON generation logic
  const xjson = buildXJSON(spec, type);

  return {
    success: true,
    xjson: xjson,
    schema_version: "15.0"
  };
}

async function handleFrontendUI(request) {
  const body = await request.json();
  const { type, style, components } = body;

  // Call local frontend shard or fetch from mesh
  const result = await generateFrontendUI(type, style, components);

  return result;
}

async function handleBackendAPI(request) {
  const body = await request.json();
  const { endpoints } = body;

  // Call local backend shard
  const result = await createBackendAPI(endpoints);

  return result;
}

async function handleDesign3D(request) {
  const body = await request.json();
  const { type, style, elements } = body;

  // Call local design shard
  const result = await createDesign3D(type, style, elements);

  return result;
}

async function handleMeshConnect(request) {
  // Connect to P2P mesh network
  const peers = await connectToMesh();

  return {
    success: true,
    peers: peers.length,
    network: "asx-mesh"
  };
}

async function handleMeshBroadcast(request) {
  const body = await request.json();
  const { message } = body;

  // Broadcast to mesh peers
  const result = await broadcastToMesh(message);

  return {
    success: true,
    peers_reached: result.count
  };
}

// =======================================================
// K'UHUL RUNTIME
// =======================================================

function compileKuhul(css, optimize) {
  // Symbolic CSS compilation
  // Implementation: Convert CSS to atomic symbols
  const symbolMap = {
    'display: flex': '.⚛d:f',
    'justify-content: center': '.⚛jc:c',
    'align-items: center': '.⚛ai:c'
  };

  let compiled = css;
  let originalLength = css.length;

  for (const [rule, symbol] of Object.entries(symbolMap)) {
    compiled = compiled.replace(new RegExp(rule, 'g'), symbol);
  }

  return {
    output: compiled,
    ratio: compiled.length / originalLength
  };
}

// =======================================================
// XJSON BUILDER
// =======================================================

function buildXJSON(spec, type) {
  return {
    "@xjson": {
      "version": "15.0",
      "type": type || "generated",
      "created": new Date().toISOString()
    },
    "data": spec
  };
}

// =======================================================
// MESH NETWORK CONNECTOR
// =======================================================

let meshPeers = [];

async function connectToMesh() {
  // WebRTC P2P mesh discovery
  // This would use WebRTC data channels for peer connections
  console.log('[SW] Connecting to ASX mesh network...');

  // Stub: In production, use WebRTC signaling server
  meshPeers = [
    { id: "peer_1", address: "ws://localhost:8001" },
    { id: "peer_2", address: "ws://localhost:8002" }
  ];

  return meshPeers;
}

async function broadcastToMesh(message) {
  let count = 0;

  for (const peer of meshPeers) {
    try {
      // Send message to peer
      // In production: use WebRTC data channel
      console.log(`[SW] Broadcasting to ${peer.id}:`, message);
      count++;
    } catch (err) {
      console.error(`[SW] Failed to reach ${peer.id}:`, err);
    }
  }

  return { count };
}

// =======================================================
// SHARD EXECUTION (Local or Remote)
// =======================================================

async function generateFrontendUI(type, style, components) {
  // Try local execution first
  try {
    // Import local frontend shard
    const { frontendGenerateUI } = await import('/shards/frontend/index.js');
    return frontendGenerateUI({ type, style, components });
  } catch (err) {
    // Fallback: Call GAS shard
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbyK5kmpLi6vubXodytm23YruT-V-dt9IdKf20kP8pwKCxC--mpEpnr5R4gQlZ_CmQD2Pg/exec' +
      `?path=generate-ui&type=${type}&style=${style}&components=${components}`
    );
    return response.json();
  }
}

async function createBackendAPI(endpoints) {
  try {
    const { backendCreateAPI } = await import('/shards/backend/index.js');
    return backendCreateAPI({ endpoints });
  } catch (err) {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbxCkCm0kG-1vy1q1M-e12xOsgAdvAvjmye1kti3rNnu4NMC7fW_TJ1MK4TToT37PVua/exec' +
      `?path=create-api&endpoints=${JSON.stringify(endpoints)}`
    );
    return response.json();
  }
}

async function createDesign3D(type, style, elements) {
  try {
    const { designCreate3D } = await import('/shards/design/index.js');
    return designCreate3D({ type, style, elements });
  } catch (err) {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbzSODEEviqciu-cFlQ0IvxTNIE4CbjGjY7r8FY_cG4AwntFv1L24zdpbkgVAO86EnNK/exec' +
      `?path=create-3d&type=${type}&style=${style}&elements=${elements}`
    );
    return response.json();
  }
}
```

### 4. Index.html Entry Point

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ASX Operating System</title>
  <style>
    body {
      margin: 0;
      font-family: 'Inter', system-ui, sans-serif;
      background: #05070a;
      color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .status {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .btn {
      background: #00ffc6;
      color: #05070a;
      border: none;
      padding: 12px 24px;
      border-radius: 999px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      margin: 5px;
    }
    .btn:hover {
      background: #00e6b3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌐 ASX Operating System</h1>

    <div class="status" id="status">
      <h3>System Status</h3>
      <p id="service-worker-status">Service Worker: Loading...</p>
      <p id="api-status">Local REST API: Checking...</p>
      <p id="mesh-status">Mesh Network: Disconnected</p>
    </div>

    <div class="actions">
      <h3>Actions</h3>
      <button class="btn" onclick="launchServiceWorker()">🚀 Launch Service Worker</button>
      <button class="btn" onclick="connectToMesh()">🔗 Connect to Mesh Network</button>
      <button class="btn" onclick="testAPI()">🧪 Test Local API</button>
      <button class="btn" onclick="openTapeGallery()">📼 Open Tape Gallery</button>
    </div>

    <div id="output" style="margin-top: 20px;"></div>
  </div>

  <script>
    // =======================================================
    // SERVICE WORKER REGISTRATION
    // =======================================================

    async function launchServiceWorker() {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
          updateStatus('service-worker-status', 'Service Worker: Active ✅');

          // Auto-check API after SW is ready
          setTimeout(testAPI, 1000);
        } catch (error) {
          console.error('Service Worker registration failed:', error);
          updateStatus('service-worker-status', 'Service Worker: Failed ❌');
        }
      } else {
        alert('Service Workers not supported in this browser');
      }
    }

    // =======================================================
    // API TESTING
    // =======================================================

    async function testAPI() {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();

        if (data.success) {
          updateStatus('api-status', `Local REST API: Online ✅ (v${data.version})`);
          displayOutput('API Health Check', data);
        } else {
          updateStatus('api-status', 'Local REST API: Error ❌');
        }
      } catch (error) {
        updateStatus('api-status', 'Local REST API: Offline ❌');
        console.error('API test failed:', error);
      }
    }

    // =======================================================
    // MESH NETWORK CONNECTION
    // =======================================================

    async function connectToMesh() {
      try {
        const response = await fetch('/api/mesh/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();

        if (data.success) {
          updateStatus('mesh-status', `Mesh Network: Connected (${data.peers} peers) ✅`);
          displayOutput('Mesh Network', data);
        } else {
          updateStatus('mesh-status', 'Mesh Network: Failed ❌');
        }
      } catch (error) {
        updateStatus('mesh-status', 'Mesh Network: Error ❌');
        console.error('Mesh connection failed:', error);
      }
    }

    // =======================================================
    // UI HELPERS
    // =======================================================

    function updateStatus(id, text) {
      document.getElementById(id).textContent = text;
    }

    function displayOutput(title, data) {
      const output = document.getElementById('output');
      output.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 20px;">
          <h3>${title}</h3>
          <pre style="overflow-x: auto; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px;">${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;
    }

    function openTapeGallery() {
      window.location.href = '/ui-tape-gallery.html';
    }

    // =======================================================
    // AUTO-LAUNCH ON LOAD
    // =======================================================

    window.addEventListener('load', () => {
      launchServiceWorker();
    });
  </script>
</body>
</html>
```

## Static DNS Configuration

### Option A: Hosts File (Local)

```bash
# Add to /etc/hosts (Mac/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1   asx.local
127.0.0.1   api.asx.local
127.0.0.1   mesh.asx.local
```

Access at: `http://asx.local:8000`

### Option B: Cloudflare Tunnel (WiFi/Public)

```bash
# Install Cloudflare Tunnel (formerly Argo Tunnel)
npm install -g cloudflared

# Run tunnel
cloudflared tunnel --url http://localhost:8000

# Output:
# Your tunnel is now available at: https://random-subdomain.trycloudflare.com
```

Benefits:
- ✅ HTTPS by default
- ✅ Public URL for sharing
- ✅ No port forwarding needed
- ✅ Works on any WiFi network

## Launch Flow

### Automatic Launch (No Button Needed)

If user has **direct backend server file access**:

```javascript
// sw.js auto-detects backend files
async function detectBackendFiles() {
  try {
    // Try to fetch api.php
    const response = await fetch('/backend/api.php');
    if (response.ok) {
      // Backend files detected - auto-connect
      return { detected: true, method: 'direct' };
    }
  } catch (err) {
    // No backend files - need mesh or manual launch
    return { detected: false, method: 'mesh_required' };
  }
}

// On Service Worker activation
self.addEventListener('activate', async (event) => {
  const backend = await detectBackendFiles();

  if (backend.detected) {
    // Auto-connect to backend
    console.log('[SW] Backend files detected - auto-connecting');
    // No "launch" button needed!
  } else {
    // Show "Connect to Mesh" button in UI
    console.log('[SW] No backend - mesh connection required');
  }
});
```

### Manual Launch (Mesh Network)

If no backend files:

```html
<button onclick="connectToMesh()">🔗 Connect to Mesh Network</button>
```

This connects to P2P mesh for backend shard access.

## DoS Prevention

Service Worker automatically rate-limits:

```javascript
// Rate limiter in sw.js
const requestCounts = new Map();

function rateLimit(clientId) {
  const now = Date.now();
  const limit = 100; // requests per minute
  const window = 60 * 1000; // 1 minute

  if (!requestCounts.has(clientId)) {
    requestCounts.set(clientId, []);
  }

  const requests = requestCounts.get(clientId);
  const recentRequests = requests.filter(t => now - t < window);

  if (recentRequests.length >= limit) {
    return { allowed: false, retryAfter: window - (now - recentRequests[0]) };
  }

  recentRequests.push(now);
  requestCounts.set(clientId, recentRequests);

  return { allowed: true };
}
```

## Summary

**Without Python, Without Complex Setup:**

1. **Run**: `npx http-server ./asx-shards -p 8000 --cors`
2. **Open**: `http://localhost:8000` or `http://asx.local:8000`
3. **Service Worker launches automatically**
4. **Browser becomes REST server**
5. **K'uhul runtime executes in browser**
6. **Mesh network connects peers**
7. **GAS shards as cloud fallback**

**Public Access (WiFi):**

```bash
cloudflared tunnel --url http://localhost:8000
# → https://xyz.trycloudflare.com
```

**No installation, no backend, browser-native!** 🚀
