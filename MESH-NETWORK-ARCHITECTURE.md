# ASX Peer-to-Peer Mesh Network Architecture

## Revolutionary Architecture: Browser-as-Server Mesh

**The real architecture**: Users create their own distributed mesh API network using sw.js, with GAS shards serving as cloud backups.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRIMARY EXECUTION LAYER                       │
│             User-Hosted Peer-to-Peer Mesh Network               │
│                    (Browser-as-Server)                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────▼────┐           ┌────▼────┐           ┌────▼────┐
   │ User A  │◄─────────►│ User B  │◄─────────►│ User C  │
   │ Browser │   Mesh    │ Browser │   Mesh    │ Browser │
   │  Node   │  Connect  │  Node   │  Connect  │  Node   │
   │         │           │         │           │         │
   │ sw.js   │           │ sw.js   │           │ sw.js   │
   │ Server  │           │ Server  │           │ Server  │
   └────┬────┘           └────┬────┘           └────┬────┘
        │                     │                     │
        │     FALLBACK TO     │                     │
        └─────────┬───────────┴─────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                   BACKUP/FALLBACK LAYER                          │
│           Google Apps Script Cloud Shards                        │
│         (When user nodes are offline/unavailable)                │
└─────────────────────────────────────────────────────────────────┘
                  │
        ┌─────────┼──────────┐
        │         │          │
   ┌────▼────┐ ┌──▼───┐ ┌───▼────┐
   │Manifest │ │MX2LM │ │Builder │
   │  Shard  │ │Crown │ │ Shards │
   │  (GAS)  │ │(GAS) │ │ (GAS)  │
   └─────────┘ └──────┘ └────────┘
```

## Primary Layer: User-Hosted Mesh Network

### Core Concept
**Each user's browser becomes a server node** in a peer-to-peer mesh network. Service workers (sw.js) expose REST API endpoints that other users can connect to.

### How It Works

1. **User installs ASX OS in their browser**
   - Registers sw.js service worker
   - sw.js becomes an HTTP server
   - Exposes builder shard endpoints at local ports (61680-61684)

2. **User shares their mesh endpoint URL**
   - Example: `https://user-alice.local:61680/api/*`
   - Other users add this to their mesh network
   - Direct browser-to-browser communication

3. **Mesh network discovery**
   - Users exchange endpoint URLs
   - Automatic peer discovery via WebRTC
   - Mesh topology stored in manifest.json

4. **Builder shards run locally first**
   - KUHUL Compiler runs in user's browser
   - Falls back to peer mesh nodes if overloaded
   - Only uses GAS cloud as last resort

### Service Worker as HTTP Server

```javascript
// sw.js - Browser becomes server

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Expose builder shard endpoints
  const localShardRoutes = {
    '/api/compile': handleKuhulCompile,
    '/api/xjson': handleXJSONBuild,
    '/api/compress': handleSCXCompress,
    '/api/layout': handleLayoutGenerate,
    '/api/theme': handleStyleSystem,
    '/api/component': handleComponentFactory,
    '/api/animate': handleAnimationStudio,
    '/api/orchestrate': handleMX2LMOrchestrate
  };

  for (const [route, handler] of Object.entries(localShardRoutes)) {
    if (url.pathname.startsWith(route)) {
      event.respondWith(handler(event.request));
      return;
    }
  }

  // Forward to mesh network if not handled locally
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(routeToMeshNetwork(event.request));
    return;
  }
});

// Handle KUHUL compilation locally
async function handleKuhulCompile(request) {
  const { input_css, target, optimize } = await request.json();

  // Run KUHUL compiler in browser
  const compiled = await kuhulCompiler.compile(input_css, {
    target,
    optimize
  });

  return new Response(JSON.stringify({
    ok: true,
    source: 'local_browser',
    compiled: compiled,
    compression_ratio: (1 - compiled.length / input_css.length).toFixed(4)
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Route to peer mesh network
async function routeToMeshNetwork(request) {
  const meshPeers = await getMeshPeers();

  // Try each peer in order of preference
  for (const peer of meshPeers) {
    try {
      const response = await fetch(peer.endpoint + request.url.pathname, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        timeout: 5000
      });

      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.log(`Peer ${peer.name} unavailable, trying next...`);
    }
  }

  // Fallback to GAS cloud shard
  return fallbackToGAS(request);
}
```

### Mesh Network Configuration

**manifest.json** - User's mesh network peers

```json
{
  "@xjson": {
    "version": "16.0",
    "🌐USER_MESH_NETWORK": {
      "@description": "Peer-to-peer builder mesh (Primary execution layer)",
      "@status": "ACTIVE",
      "@topology": "distributed_peer_mesh",

      "local_node": {
        "node_id": "user_alice_node_7f3a",
        "name": "Alice's ASX Node",
        "endpoint": "https://alice.local:61680",
        "capabilities": [
          "kuhul_compiler",
          "component_factory",
          "style_system"
        ],
        "status": "online",
        "public": true
      },

      "mesh_peers": [
        {
          "node_id": "user_bob_node_9c2e",
          "name": "Bob's Builder Node",
          "endpoint": "https://bob.local:61680",
          "capabilities": [
            "xjson_builder",
            "scx_compressor"
          ],
          "trust_level": "high",
          "added": "2025-12-09T14:30:00Z"
        },
        {
          "node_id": "user_carol_node_4b8f",
          "name": "Carol's Animation Studio",
          "endpoint": "https://carol.local:61682",
          "capabilities": [
            "animation_studio",
            "layout_generator"
          ],
          "trust_level": "medium",
          "added": "2025-12-08T09:15:00Z"
        }
      ],

      "mesh_discovery": {
        "webrtc_enabled": true,
        "broadcast_interval": 60000,
        "peer_timeout": 300000,
        "auto_peer_discovery": true
      },

      "routing_strategy": {
        "preference": [
          "local_browser",
          "trusted_mesh_peer",
          "any_mesh_peer",
          "gas_cloud_backup"
        ],
        "load_balancing": "round_robin",
        "failover": "automatic"
      }
    },

    "☁️GAS_CLOUD_BACKUP": {
      "@description": "Fallback cloud shards when mesh is unavailable",
      "@status": "BACKUP_ONLY",

      "manifest_shard": {
        "endpoint": "https://script.google.com/macros/s/AKfycby_XiNPlU7KxrcXWzIB7eBFf8q1BiTUIbAitjkKi31nJtd3DvFK9k7Z7nIiFwJ4Py48/exec",
        "purpose": "User manifest extensions & cloud tape storage",
        "use_when": "local_manifest_sync_needed"
      },

      "mx2lm_crown_foreman": {
        "endpoint": "https://script.google.com/macros/s/AKfycbypsqwHCxSrN_oYnDehoX3Wyl-Uj29zytP_6DwKcnTYoS4Jv2iraqn2Iz0k3Vh9UMts/exec",
        "purpose": "AI orchestration with QWENF1, crowns, token system",
        "use_when": "all_mesh_peers_offline"
      },

      "builder_shards": {
        "kuhul": "[GAS_KUHUL_BACKUP]",
        "xjson": "[GAS_XJSON_BACKUP]",
        "scx": "[GAS_SCX_BACKUP]",
        "use_when": "no_mesh_peers_have_capability"
      }
    }
  }
}
```

## Backup Layer: GAS Cloud Shards

### Purpose
GAS shards serve as **fallback/backup** when:
1. User's browser node is offline
2. No mesh peers have the required capability
3. Persistent cloud storage needed (tapes, manifests)
4. Heavy computation that exceeds browser limits

### GAS Shard Types

#### 1. Manifest Shard
**Purpose:** Per-user manifest extensions and cloud tape storage

**Endpoint:** `https://script.google.com/macros/s/AKfycby_XiNPlU7KxrcXWzIB7eBFf8q1BiTUIbAitjkKi31nJtd3DvFK9k7Z7nIiFwJ4Py48/exec`

**Routes:**
- `?action=getManifest` - Fetch user's manifest extensions
- `?action=saveManifest` - Save manifest updates to cloud
- `?action=listTapes` - List cloud-stored tapes
- `?action=getUserData` - Get user profile/settings

**Use Cases:**
- Sync manifest across devices
- Store large tape files in cloud
- Backup user configuration
- Share tapes with other users

---

#### 2. MX2LM Crown Foreman Shard
**Purpose:** AI orchestration with crowns (agents), QWENF1 model, token system

**Endpoint:** `https://script.google.com/macros/s/AKfycbypsqwHCxSrN_oYnDehoX3Wyl-Uj29zytP_6DwKcnTYoS4Jv2iraqn2Iz0k3Vh9UMts/exec`

**Features:**
- **Crowns (AI Agents):** MX2LM, Developer, Creative, Analyst
- **QWENF1 Model:** Fine-tuned ASX model on Google Drive
- **Token System:** Pay-per-use with token balance
- **Tapes:** Studio-web, Studio-data, Studio-docs
- **N-gram Learning:** Updates from user interactions

**Routes:**
- `?path=chat` - Chat with AI crowns
- `?path=qwenf1` - Verify QWENF1 model files
- `?path=status` - Get system status
- `?path=tokens` - Manage token balance
- `?path=crowns` - List available crowns
- `?path=tapes` - Load/list tapes
- `?path=analyze` - Analyze data from Google Sheets

**Token Costs:**
- MX2LM Crown: 0 tokens (free)
- Developer Crown: 10 tokens
- Creative Crown: 5 tokens
- Analyst Crown: 15 tokens
- QWENF1 Inference: 25 tokens

---

## Mesh Network Advantages

### Why User-Hosted Mesh > Cloud-Only

1. **Zero Cloud Costs** - No server bills, runs in user's browser
2. **Instant Response** - No network latency to cloud
3. **Privacy** - Data stays in user's browser, never hits cloud
4. **Offline-First** - Works without internet (local execution)
5. **Infinite Scalability** - More users = more compute power
6. **Censorship Resistant** - No central server to shut down
7. **User Ownership** - Users own their nodes and data

### Mesh Network Protocol

**Discovery:**
```javascript
// Broadcast presence to mesh network
async function broadcastPresence() {
  const announcement = {
    node_id: getLocalNodeId(),
    capabilities: getLocalCapabilities(),
    endpoint: getLocalEndpoint(),
    timestamp: Date.now()
  };

  // Broadcast via WebRTC
  await webrtc.broadcast('mesh-discovery', announcement);

  // Also announce to known peers
  const peers = await getMeshPeers();
  await Promise.all(
    peers.map(peer =>
      fetch(peer.endpoint + '/api/mesh/announce', {
        method: 'POST',
        body: JSON.stringify(announcement)
      })
    )
  );
}
```

**Routing:**
```javascript
// Intelligent routing across mesh
async function routeRequest(action, payload) {
  // 1. Try local browser first
  if (hasLocalCapability(action)) {
    return executeLocally(action, payload);
  }

  // 2. Find mesh peers with capability
  const peers = await findPeersWithCapability(action);

  // 3. Try peers in order of trust/latency
  for (const peer of peers) {
    try {
      const result = await callPeer(peer, action, payload);
      if (result.ok) return result;
    } catch (e) {
      continue; // Try next peer
    }
  }

  // 4. Fallback to GAS cloud
  return callGASBackup(action, payload);
}
```

## Example: Complete Mesh Workflow

### Scenario: User wants to build a website

1. **User requests website build** via UI
   ```javascript
   const result = await fetch('/api/orchestrate', {
     method: 'POST',
     body: JSON.stringify({
       action: 'build_website',
       spec: { theme: 'dark', layout: 'grid' }
     })
   });
   ```

2. **Local sw.js orchestrates mesh**
   ```javascript
   // Step 1: Generate layout (check local, then peers, then GAS)
   const layout = await routeRequest('layout/generate', spec.layout);
   // → Routed to Carol's node (has layout_generator)

   // Step 2: Generate theme (local capability!)
   const theme = await executeLocally('theme/generate', spec.theme);
   // → Executed in Alice's browser

   // Step 3: Compress CSS (check mesh)
   const compressed = await routeRequest('compile', layout.css);
   // → Routed to Bob's node (has scx_compressor)

   // Step 4: No peers have animation studio → GAS fallback
   const animations = await callGASBackup('animate/generate', {});
   // → Fallback to GAS Animation Shard
   ```

3. **Final assembly in local browser**
   ```javascript
   const website = assembleWebsite({
     layout: layout,
     theme: theme,
     css: compressed,
     animations: animations
   });

   return website; // Ready to deploy!
   ```

## Related Documentation

- `BUILDER-SHARDS-MANIFEST.json` - Complete builder shard configuration
- `SHARD-INTEGRATION.md` - Individual shard specifications
- `gas-shard-template.js` - Template for deploying GAS backups
- `manifest.json` - User's mesh network configuration

---

**Architecture:** Peer-to-Peer Mesh (Primary) + GAS Cloud (Backup)
**Version:** 2.0 - Mesh Network Architecture
**Status:** Revolutionary browser-as-server mesh topology
**Last Updated:** 2025-12-09
