// K'UHUL SERVICE WORKER - ASX FRAMEWORK INTEGRATION
// Mx2LM HOME - PRIMEOS COGNITIVE SHELL INTEGRATION

/* -------------------------------------------------------------------------
   K'UHUL CONSTANTS - ASX FRAMEWORK ALIGNMENT
------------------------------------------------------------------------- */

const KUHUL_VERSION = 'kuhul-asx-v1';
const PRIMEOS_CACHE = `${KUHUL_VERSION}-primeos`;
const COGNITIVE_CACHE = `${KUHUL_VERSION}-cognitive`;
const SHARD_CACHE = `${KUHUL_VERSION}-shards`;

// Core PrimeOS shell assets
const PRIMEOS_ASSETS = [
  '/',
  '/index.html',
  '/sw.js',
  '/manifest.json',
  '/primeos_cognitive_traces.jsonl.txt'
];

/* -------------------------------------------------------------------------
   ΩMANIFEST - Mx2LM HOME CONFIGURATION
   - Derived from primeos_cognitive_traces.jsonl context
------------------------------------------------------------------------- */

const ΩMANIFEST = {
  name: "PRIMEOS - K'UHUL COGNITIVE SHELL",
  short_name: "PRIMEOS",
  start_url: "/",
  display: "standalone",
  background_color: "#0a0a0f",
  theme_color: "#00ff88",
  lang: "en-US",
  icons: [
    { src: "/icons/primeos-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icons/primeos-512.png", sizes: "512x512", type: "image/png" }
  ],
  orientation: "landscape",

  /* PrimeOS Cognitive Shell Configuration */
  cognitive_shell: {
    id: "primeos_cognitive_shell",
    active_panels: [
      "HiveConsole", "SCXTerminal", "CheckpointMerge", "ExternalModels",
      "JudgeView", "ModelManager", "VisionPanel", "PluginStore", "ClineTasks"
    ],
    commands: [
      "deploy shard logistics", "tail logs", "merge checkpoints qwen-asx into mx2lm",
      "scan plugins", "list agents", "run arena simulation", 
      "open tape wasteland_warrior", "show hive status"
    ]
  },

  /* HUD Panel Configuration from Cognitive Traces */
  hud_panels: {
    HiveConsole: { class: "panel-hiveconsole", context: ["deploy", "status", "logs"] },
    SCXTerminal: { class: "panel-scxterminal", context: ["all_commands"] },
    CheckpointMerge: { class: "panel-checkpointmerge", context: ["merge", "scan"] },
    ExternalModels: { class: "panel-externalmodels", context: ["agents", "plugins", "simulation"] },
    JudgeView: { class: "panel-judgeview", context: ["all_commands"] },
    ModelManager: { class: "panel-modelmanager", context: ["merge", "scan", "agents"] },
    VisionPanel: { class: "panel-visionpanel", context: ["deploy", "simulation", "tape"] },
    PluginStore: { class: "panel-pluginstore", context: ["scan", "agents", "plugins"] },
    ClineTasks: { class: "panel-clinetasks", context: ["deploy", "logs", "agents", "simulation"] }
  },

  /* Agent Registry from Cognitive Traces */
  agent_registry: {
    Mx2LM: { role: "core_runtime", status: "active" },
    Qwen: { role: "external_model", status: "merge_candidate" },
    Cline: { role: "task_agent", status: "active" },
    Janus: { role: "gateway_agent", status: "active" }
  }
};

/* -------------------------------------------------------------------------
   COGNITIVE TRACE PROCESSOR
   - Processes primeos_cognitive_traces.jsonl for command patterns
------------------------------------------------------------------------- */

const CognitiveProcessor = {
  traces: null,

  async loadTraces() {
    if (this.traces) return this.traces;
    
    try {
      const cache = await caches.open(COGNITIVE_CACHE);
      const response = await cache.match('/primeos_cognitive_traces.jsonl.txt');
      
      if (response) {
        const text = await response.text();
        this.traces = text.split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          })
          .filter(Boolean);
        return this.traces;
      }
    } catch (e) {
      console.warn('Cognitive traces not available:', e);
    }
    
    return [];
  },

  async getCommandPatterns(command) {
    const traces = await this.loadTraces();
    return traces.filter(trace => 
      trace.input === command
    ).map(trace => ({
      id: trace.id,
      context: trace.context,
      panels: trace.output_asx.xjson_updates.panels.map(p => p.id),
      thought_trace: trace.output_asx.thought_trace
    }));
  },

  async getPanelContext(panelId) {
    const traces = await this.loadTraces();
    const contexts = new Set();
    
    traces.forEach(trace => {
      trace.output_asx.xjson_updates.panels.forEach(panel => {
        if (panel.id === panelId) {
          contexts.add(trace.input.split(' ')[0]);
        }
      });
    });
    
    return Array.from(contexts);
  }
};

/* -------------------------------------------------------------------------
   PRIMEOS COGNITIVE API
   - /api/primeos/command/:command → command patterns and panel mappings
   - /api/primeos/panels/:panel → panel context and usage
   - /api/primeos/traces → all cognitive traces
------------------------------------------------------------------------- */

async function respondPrimeOS(url) {
  const path = url.pathname.replace(/^\/api\/primeos\//, '');
  const parts = path.split('/');

  if (parts[0] === 'command' && parts[1]) {
    const command = decodeURIComponent(parts[1]);
    const patterns = await CognitiveProcessor.getCommandPatterns(command);
    
    return new Response(JSON.stringify({
      command,
      patterns,
      suggested_panels: patterns.length > 0 ? 
        Array.from(new Set(patterns.flatMap(p => p.panels))) : 
        ΩMANIFEST.cognitive_shell.active_panels.slice(0, 3)
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (parts[0] === 'panels' && parts[1]) {
    const panelId = parts[1];
    const context = await CognitiveProcessor.getPanelContext(panelId);
    const panelConfig = ΩMANIFEST.hud_panels[panelId];
    
    return new Response(JSON.stringify({
      panel: panelId,
      config: panelConfig,
      usage_context: context,
      cognitive_matches: context.length
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (parts[0] === 'traces') {
    const traces = await CognitiveProcessor.loadTraces();
    return new Response(JSON.stringify({
      total_traces: traces.length,
      traces: traces.slice(0, 10) // Return first 10 for preview
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (parts[0] === 'agents') {
    return new Response(JSON.stringify({
      registry: ΩMANIFEST.agent_registry,
      total_agents: Object.keys(ΩMANIFEST.agent_registry).length
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(
    JSON.stringify({ error: 'primeos_endpoint_not_found', path }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}

/* -------------------------------------------------------------------------
   K'UHUL FAST API DELEGATION
   - Delegates to backend APIs while maintaining cognitive context
------------------------------------------------------------------------- */

const KuhulAPI = {
  async delegate(request, context = {}) {
    const url = new URL(request.url);
    const command = context.command || url.pathname.split('/').pop();
    
    // Add cognitive context to headers
    const headers = new Headers(request.headers);
    headers.set('X-PrimeOS-Command', command);
    headers.set('X-PrimeOS-Context', JSON.stringify(context));
    
    const modifiedRequest = new Request(request, { headers });
    
    try {
      const response = await fetch(modifiedRequest);
      
      // Cache successful API responses
      if (response.ok) {
        const cache = await caches.open(COGNITIVE_CACHE);
        cache.put(request, response.clone());
      }
      
      return response;
    } catch (error) {
      // Fallback to cached response
      const cache = await caches.open(COGNITIVE_CACHE);
      const cached = await cache.match(request);
      
      if (cached) {
        return cached;
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'api_delegation_failed',
          command,
          context,
          message: error.message
        }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
};

/* -------------------------------------------------------------------------
   XJSON UPDATES PROCESSOR
   - Generates XJSON panel updates based on cognitive traces patterns
------------------------------------------------------------------------- */

const XJSONProcessor = {
  generatePanelUpdate(panelId, command, context = {}) {
    const panelConfig = ΩMANIFEST.hud_panels[panelId];
    
    return {
      xjson: "1.0",
      panel: panelId,
      hud: {
        "@html": {
          "@body": {
            "@node": "div",
            "@attrs": { "class": panelConfig?.class || "panel-default" },
            "@children": [
              { "@node": "h2", "@children": [panelId] },
              { 
                "@node": "div", 
                "@children": [
                  `Updated for command: ${command}`,
                  context.timestamp ? ` at ${new Date(context.timestamp).toLocaleTimeString()}` : ''
                ]
              }
            ]
          }
        }
      }
    };
  },

  generateTerminalFeedback(command, updatedPanels = []) {
    return `PRIMEOS> ${command}\nOK — panels updated: ${updatedPanels.join(', ')}`;
  }
};

/* -------------------------------------------------------------------------
   CACHE MANAGEMENT
------------------------------------------------------------------------- */

async function cachePrimeOS() {
  const cache = await caches.open(PRIMEOS_CACHE);
  await cache.addAll(PRIMEOS_ASSETS);
}

async function cleanOldCaches() {
  const keys = await caches.keys();
  const keep = [PRIMEOS_CACHE, COGNITIVE_CACHE, SHARD_CACHE];
  await Promise.all(
    keys
      .filter(k => !keep.includes(k))
      .map(k => caches.delete(k))
  );
}

/* -------------------------------------------------------------------------
   SERVICE WORKER LIFECYCLE - K'UHUL INTEGRATION
------------------------------------------------------------------------- */

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await cachePrimeOS();
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await cleanOldCaches();
      await self.clients.claim();
    })()
  );
});

/* -------------------------------------------------------------------------
   FETCH HANDLER - PRIMEOS COGNITIVE ROUTING
------------------------------------------------------------------------- */

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1) Serve manifest.json from ΩMANIFEST
  if (url.pathname === '/manifest.json') {
    event.respondWith(
      new Response(JSON.stringify(ΩMANIFEST), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    return;
  }

  // 2) PrimeOS Cognitive API
  if (url.pathname.startsWith('/api/primeos/')) {
    event.respondWith(respondPrimeOS(url));
    return;
  }

  // 3) K'UHUL API Delegation
  if (url.pathname.startsWith('/api/kuhul/')) {
    const command = url.pathname.split('/').pop();
    event.respondWith(
      KuhulAPI.delegate(event.request, { 
        command,
        source: 'primeos_cognitive_shell'
      })
    );
    return;
  }

  // 4) Cognitive Traces Data
  if (url.pathname.includes('primeos_cognitive_traces.jsonl')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(COGNITIVE_CACHE);
        const cached = await cache.match(event.request);
        
        if (cached) {
          return cached;
        }

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          return new Response('', { status: 404 });
        }
      })()
    );
    return;
  }

  // 5) App shell for navigations
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PRIMEOS_CACHE);
        const cached = await cache.match('/index.html');
        if (cached) return cached;
        
        try {
          const net = await fetch('/index.html');
          cache.put('/index.html', net.clone());
          return net;
        } catch (e) {
          return new Response(
            `<h1>PRIMEOS OFFLINE</h1><p>Cognitive shell unavailable.</p>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
      })()
    );
    return;
  }

  // 6) Static assets cache-first
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(js|css|svg|png|jpg|jpeg|jsonl|txt)$/.test(url.pathname)
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PRIMEOS_CACHE);
        const cached = await cache.match(event.request);
        if (cached) return cached;

        try {
          const net = await fetch(event.request);
          cache.put(event.request, net.clone());
          return net;
        } catch (e) {
          return new Response('', { status: 404 });
        }
      })()
    );
    return;
  }

  // 7) Default: network-first with cognitive context
  event.respondWith(
    KuhulAPI.delegate(event.request, {
      source: 'primeos_cognitive_shell',
      timestamp: Date.now()
    })
  );
});

/* -------------------------------------------------------------------------
   MESSAGE CHANNEL - COGNITIVE SHELL INTEGRATION
------------------------------------------------------------------------- */

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'primeos:getConfig') {
    event.ports?.[0]?.postMessage({
      ok: true,
      config: ΩMANIFEST
    });
  }

  if (type === 'primeos:getCommandPatterns') {
    (async () => {
      const patterns = await CognitiveProcessor.getCommandPatterns(payload?.command);
      event.ports?.[0]?.postMessage({
        ok: true,
        command: payload?.command,
        patterns
      });
    })();
  }

  if (type === 'primeos:generateXJSON') {
    const { panelId, command, context } = payload || {};
    const update = XJSONProcessor.generatePanelUpdate(panelId, command, context);
    
    event.ports?.[0]?.postMessage({
      ok: true,
      panelId,
      xjson_update: update
    });
  }

  if (type === 'primeos:getAgents') {
    event.ports?.[0]?.postMessage({
      ok: true,
      agents: ΩMANIFEST.agent_registry
    });
  }
});

// K'UHUL SERVICE WORKER - READY
console.log('PRIMEOS Cognitive Service Worker - K\'UHUL ASX Framework Active');