/* =========================================================================
   ASXR TRINITY MULTI-AGENT OS SERVICE WORKER v3.2.0
   =========================================================================
   - ASXR Browser VM Runtime (CPU / GPU / TPU)
   - XJSON + Tapes as first-class programs
   - ASX RAM (n-grams → glyphgrams)
   - RLHF visualization
   - Memory heatmap UI
   - Training cockpit
   - User-backed persistent storage
   ========================================================================= */

'use strict';

/* -------------------------------------------------------------------------
   1. OS IDENTIFIERS & CACHES
------------------------------------------------------------------------- */

const ASXR_OS_ID = 'ASXR_TRINITY_MULTIAGENT_OS_v3_2_0';
const ASXR_KERNEL_CACHE = `${ASXR_OS_ID}-kernel`;
const ASXR_TAPES_CACHE  = `${ASXR_OS_ID}-tapes`;
const ASXR_RUNTIME_CACHE = `${ASXR_OS_ID}-runtime`;

/* -------------------------------------------------------------------------
   2. CORE ASSETS (FULL MERGED)
------------------------------------------------------------------------- */

const ASXR_CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  '/atomic.css',
  '/atomic.xjson',

  '/tapes/example.asxr.json',
  '/tapes/tape_system_auto_recovery_v1.asxr.json',
  '/tapes/tape_system_trinity_runtime_v1.asxr.json',
  '/tapes/tape_system_asx_ram_manager_v1.asxr.json',
  '/tapes/tape_system_user_profile_v1.asxr.json',
  '/tapes/tape_system_rlhf_visualizer_v1.asxr.json',
  '/tapes/tape_system_memory_heatmap_v1.asxr.json',
  '/tapes/tape_system_training_cockpit_v1.asxr.json'
];

/* -------------------------------------------------------------------------
   3. TRINITY MANIFEST (Injected to Clients)
------------------------------------------------------------------------- */

const ASXR_TRINITY_MANIFEST = {
  "@context": "xjson://asxr/trinity/os/v3",
  "@v": "3.2.0",
  "n": "ASXR TRINITY MULTI-AGENT OS",
  "d": "Browser-native Trinity OS with Multi-Tapes, Multi-Agents, ASX RAM, RLHF, User Profiles, and Training Cockpit.",
  "law": "ASX = XCFE = XJSON = KUHUL = AST",

  "runtime": {
    "cpu": { "id": "asxr_cpu_runtime", "mode": "browser_vm", "status": "active" },
    "gpu": { "id": "asxr_gpu_runtime", "mode": "webgl_webgpu", "status": "ready" },
    "tpu": { "id": "asxr_tpu_runtime", "mode": "trainer_node", "status": "standby" }
  },

  "asx_ram": {
    "type": "volatile_cognitive_memory",
    "backing": "user_store",
    "stores": {
      "ngrams": "/usr/ram/ngrams.json",
      "@grams": "/usr/ram/@grams.json",
      "quadragrams": "/usr/ram/quadragrams.json",
      "pentagrams": "/usr/ram/pentagrams.json",
      "supagrams": "/usr/ram/supagrams.json",
      "glyphgrams": "/usr/ram/glyphgrams.json",
      "reinforcement": "/usr/ram/reinforcement.json",
      "agent_experience": "/usr/ram/agent_experience.json"
    },
    "learning_mode": "continuous"
  },

  "user_backing": {
    "enabled": true,
    "mount": "/usr",
    "agent_data_pattern": "MX2LM://<agent_id>/DATA/"
  },

  "vfs": {
    "mounts": {
      "/sys":  { "type": "ro",  "driver": "scx_sys" },
      "/tapes":{ "type": "ro",  "driver": "tape_cache" },
      "/usr":  { "type": "rw",  "driver": "usr_store" },
      "/tmp":  { "type": "vol", "driver": "mem" }
    }
  },

  "tapes": {
    "tape_system_auto_recovery_v1": {
      "id": "tape_system_auto_recovery_v1",
      "role": "system_recovery",
      "entry": "/tapes/tape_system_auto_recovery_v1.asxr.json",
      "agents": ["agent.repair", "agent.diagnostics"],
      "shards": ["cpu", "tpu"],
      "boot": true
    },

    "tape_system_trinity_runtime_v1": {
      "id": "tape_system_trinity_runtime_v1",
      "role": "trinity_orchestrator",
      "entry": "/tapes/tape_system_trinity_runtime_v1.asxr.json",
      "agents": ["agent.trinity", "agent.metrics"],
      "shards": ["cpu", "gpu", "tpu"],
      "boot": true
    },

    "tape_system_asx_ram_manager_v1": {
      "id": "tape_system_asx_ram_manager_v1",
      "role": "ram_manager",
      "entry": "/tapes/tape_system_asx_ram_manager_v1.asxr.json",
      "agents": ["agent.memory.trainer", "agent.rlhf.reinforcer"],
      "shards": ["cpu"],
      "boot": true
    },

    "tape_system_user_profile_v1": {
      "id": "tape_system_user_profile_v1",
      "role": "user_profile",
      "entry": "/tapes/tape_system_user_profile_v1.asxr.json",
      "agents": ["agent.profile.manager"],
      "shards": ["cpu"],
      "boot": true
    },

    "tape_system_rlhf_visualizer_v1": {
      "id": "tape_system_rlhf_visualizer_v1",
      "role": "rlhf_visualization",
      "entry": "/tapes/tape_system_rlhf_visualizer_v1.asxr.json",
      "agents": ["agent.rlhf.visualizer"],
      "shards": ["cpu", "gpu"],
      "boot": false
    },

    "tape_system_memory_heatmap_v1": {
      "id": "tape_system_memory_heatmap_v1",
      "role": "memory_heatmap_ui",
      "entry": "/tapes/tape_system_memory_heatmap_v1.asxr.json",
      "agents": ["agent.memory.heatmap", "agent.ui"],
      "shards": ["cpu", "gpu"],
      "boot": false
    },

    "tape_system_training_cockpit_v1": {
      "id": "tape_system_training_cockpit_v1",
      "role": "training_cockpit",
      "entry": "/tapes/tape_system_training_cockpit_v1.asxr.json",
      "agents": ["agent.cockpit.trainer", "agent.rlhf.visualizer", "agent.memory.heatmap", "agent.metrics"],
      "shards": ["cpu", "gpu", "tpu"],
      "boot": true
    },

    "tape_example_app": {
      "id": "tape_example_app",
      "role": "demo_ui",
      "entry": "/tapes/example.asxr.json",
      "agents": ["agent.ui", "agent.docs", "agent.builder"],
      "shards": ["cpu"],
      "boot": false
    }
  },

  "agents": {
    "agent.ui":               { "role": "ui_runtime",            "default_tape": "tape_example_app" },
    "agent.docs":             { "role": "documentation",         "default_tape": "tape_example_app" },
    "agent.builder":          { "role": "tape_builder",          "default_tape": "tape_example_app" },

    "agent.trinity":          { "role": "runtime_orchestrator",  "default_tape": "tape_system_trinity_runtime_v1" },
    "agent.metrics":          { "role": "telemetry",             "default_tape": "tape_system_trinity_runtime_v1" },

    "agent.repair":           { "role": "recovery_exec",         "default_tape": "tape_system_auto_recovery_v1" },
    "agent.diagnostics":      { "role": "health_check",          "default_tape": "tape_system_auto_recovery_v1" },

    "agent.memory.trainer":   { "role": "asx_ram_trainer",       "default_tape": "tape_system_asx_ram_manager_v1" },
    "agent.rlhf.reinforcer":  { "role": "reinforcement_engine",  "default_tape": "tape_system_asx_ram_manager_v1" },

    "agent.profile.manager":  { "role": "user_profile_api",      "default_tape": "tape_system_user_profile_v1" },

    "agent.rlhf.visualizer":  { "role": "rlhf_visualization",    "default_tape": "tape_system_rlhf_visualizer_v1" },
    "agent.memory.heatmap":   { "role": "memory_heatmap_ui",     "default_tape": "tape_system_memory_heatmap_v1" },

    "agent.cockpit.trainer":  { "role": "training_cockpit",      "default_tape": "tape_system_training_cockpit_v1" }
  },

  "xcfe": {
    "control_vectors": [
      "@control.nav",
      "@control.layout",
      "@control.state",
      "@control.runtime",
      "@control.learning",
      "@control.memory",
      "@control.cockpit",
      "@control.visualization"
    ],
    "flow_vectors": [
      "@flow.scroll",
      "@flow.transition",
      "@flow.data",
      "@flow.runtime",
      "@flow.reinforcement",
      "@flow.telemetry"
    ],
    "variable_vectors": [
      "@variable.state",
      "@variable.metrics",
      "@variable.entropy",
      "@variable.innovation",
      "@variable.training_progress"
    ]
  },

  "boot_sequence": [
    "kernel.init",
    "runtime.mount_cpu",
    "runtime.mount_gpu",
    "runtime.mount_tpu",
    "vfs.mount",
    "user_store.mount",
    "asx_ram.mount",
    "tapes.preload",
    "agents.bootstrap",
    "tapes.autoboot",
    "asxr.ready"
  ]
};

/* -------------------------------------------------------------------------
   4. KERNEL PROCESS MANAGER (K'UHUL-LIKE EXECUTION)
------------------------------------------------------------------------- */

const ASXRKernel = {
  processes: new Map(),

  async spawn(pid, code, context = {}) {
    const proc = {
      pid,
      code,
      context,
      status: 'running',
      createdAt: Date.now(),
      memory: new Map()
    };
    this.processes.set(pid, proc);

    try {
      const result = await this.execute(code, context);
      proc.status = 'completed';
      proc.result = result;
      return { pid, result };
    } catch (e) {
      proc.status = 'error';
      proc.error = e;
      throw e;
    }
  },

  kill(pid) {
    const p = this.processes.get(pid);
    if (!p) return false;
    p.status = 'terminated';
    this.processes.delete(pid);
    return true;
  },

  status(pid) {
    const p = this.processes.get(pid);
    if (!p) return null;
    return {
      pid: p.pid,
      status: p.status,
      runtime_ms: Date.now() - p.createdAt,
      memory_slots: p.memory.size
    };
  },

  async execute(code, context) {
    const sandbox = {
      '⟁Pop': () => null,
      '⟁Wo':  (v) => v,
      '⟁Sek': (fn) => (typeof fn === 'function' ? fn() : fn),
      '⟁Ch\'en': (v) => v,
      '⟁Xul': () => 'complete',
      context
    };

    if (typeof code === 'string' && code.includes('⟁')) {
      const tokens = code.split('⟁').filter(Boolean);
      let result = null;
      for (const t of tokens) {
        const key = t.trim();
        if (sandbox[key]) result = sandbox[key](result);
      }
      return result;
    }

    return code;
  }
};

/* -------------------------------------------------------------------------
   5. XJSON VFS + USER-BACKED ASX RAM
------------------------------------------------------------------------- */

const ASXRVFS = {
  mounts: new Map([
    ['/sys',  { type: 'ro',  driver: 'scx_sys' }],
    ['/tapes',{ type: 'ro',  driver: 'tape_cache' }],
    ['/usr',  { type: 'rw',  driver: 'usr_store' }],
    ['/tmp',  { type: 'vol', driver: 'mem' }]
  ]),

  async read(path) {
    const mount = this._mountFor(path);
    if (!mount) throw new Error(`No mount for ${path}`);
    const cache = await caches.open(
      mount.driver === 'tape_cache'
        ? ASXR_TAPES_CACHE
        : ASXR_RUNTIME_CACHE
    );

    const res = await cache.match(path);
    if (!res) throw new Error(`File not found: ${path}`);
    const data = await res.text();
    return data.startsWith('scx:') ? this.scxDecompress(data) : data;
  },

  async write(path, data) {
    const mount = this._mountFor(path);
    if (!mount || mount.type === 'ro') throw new Error(`Cannot write to ${path}`);
    const compressed = await this.scxCompress(data);
    const cache = await caches.open(ASXR_RUNTIME_CACHE);
    await cache.put(path, new Response(compressed));
    return { path, size: data.length, compressed: compressed.length };
  },

  async list(prefix) {
    const cache = await caches.open(ASXR_TAPES_CACHE);
    const keys = await cache.keys();
    return keys.map(r => new URL(r.url).pathname).filter(p => p.startsWith(prefix));
  },

  _mountFor(path) {
    for (const [mp, cfg] of this.mounts) {
      if (path.startsWith(mp)) return cfg;
    }
    return null;
  },

  async scxCompress(data) {
    return `scx:${btoa(unescape(encodeURIComponent(data)))}`;
  },

  async scxDecompress(data) {
    return decodeURIComponent(escape(atob(data.slice(4))));
  }
};

/* -------------------------------------------------------------------------
   6. TAPE REGISTRY + AUTOLOADER
------------------------------------------------------------------------- */

const TapeRegistry = {
  tapes: new Map(),

  async preloadFromManifest() {
    const entries = Object.values(ASXR_TRINITY_MANIFEST.tapes || {});
    const cache = await caches.open(ASXR_TAPES_CACHE);

    for (const t of entries) {
      try {
        const res = await fetch(t.entry);
        await cache.put(t.entry, res.clone());
        const xjson = await res.json();
        this.tapes.set(t.id, { ...t, xjson });
      } catch (e) {
        console.warn('[TapeRegistry] preload failed:', t.id);
      }
    }
  },

  list() {
    return Array.from(this.tapes.values());
  },

  get(id) {
    return this.tapes.get(id);
  }
};

/* -------------------------------------------------------------------------
   7. AGENT SWARM
------------------------------------------------------------------------- */

const AgentSwarm = {
  agents: new Map(),

  bootstrapFromManifest() {
    const list = ASXR_TRINITY_MANIFEST.agents || {};
    for (const [id, meta] of Object.entries(list)) {
      this.agents.set(id, {
        agentId: id,
        role: meta.role,
        tapeId: meta.default_tape,
        state: { status: 'idle', createdAt: Date.now() }
      });
    }
  },

  forTape(id) {
    return [...this.agents.values()].filter(a => a.tapeId === id);
  },

  get(id) {
    return this.agents.get(id);
  },

  async spawnForTape(tapeId, role, config = {}) {
    const agentId = `agent.${role}.${Date.now()}`;
    const agent = { agentId, tapeId, role, config, state: { status: 'active' } };
    this.agents.set(agentId, agent);
    await ASXRKernel.spawn(`proc_${agentId}`, `⟁Pop⟁spawn⟁Wo⟁${agentId}⟁Sek⟁agent_init⟁Xul`, { agent });
    return agent;
  },

  async runAction(agentId, action, payload = {}) {
    const agent = this.get(agentId);
    const pid = `proc_action_${agentId}_${Date.now()}`;
    return ASXRKernel.spawn(pid, `⟁Pop⟁act⟁Wo⟁${agentId}⟁Sek⟁${action}⟁Xul`, { agent, payload });
  }
};

/* -------------------------------------------------------------------------
   8. API ROUTER (ASXR + PROFILE + RLHF + MEMORY)
------------------------------------------------------------------------- */

async function respondASXR(url, request) {
  const path = url.pathname.replace(/^\/api\/asxr\//, '');
  const parts = path.split('/').filter(Boolean);

  /* STATUS */
  if (parts[0] === 'status') {
    return new Response(JSON.stringify({
      os: ASXR_OS_ID,
      processes: ASXRKernel.processes.size,
      tapes: TapeRegistry.list(),
      agents: [...AgentSwarm.agents.values()]
    }), { headers: { 'Content-Type': 'application/json' }});
  }

  /* PROFILE MANAGER */
  if (parts[0] === 'profile') {
    if (request.method === 'GET') {
      try {
        const data = await ASXRVFS.read('/usr/profile.json');
        return new Response(data, { headers: { 'Content-Type': 'application/json' }});
      } catch {
        return new Response(JSON.stringify({ user: null, settings: {}, created: null }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (request.method === 'POST') {
      const body = await request.json();
      await ASXRVFS.write('/usr/profile.json', JSON.stringify(body));
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(
      JSON.stringify({ error: 'method_not_allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  /* RLHF METRICS */
  if (parts[0] === 'rlhf' && parts[1] === 'metrics') {
    try {
      const reinforcement = await ASXRVFS.read('/usr/ram/reinforcement.json');
      const experience = await ASXRVFS.read('/usr/ram/agent_experience.json');

      return new Response(
        JSON.stringify({
          reinforcement: JSON.parse(reinforcement),
          experience: JSON.parse(experience)
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'rlhf_data_missing' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  /* MEMORY HEATMAP */
  if (parts[0] === 'memory' && parts[1] === 'heatmap') {
    try {
      const ngrams = JSON.parse(await ASXRVFS.read('/usr/ram/ngrams.json'));
      const supagrams = JSON.parse(await ASXRVFS.read('/usr/ram/supagrams.json'));
      const glyphgrams = JSON.parse(await ASXRVFS.read('/usr/ram/glyphgrams.json'));

      const summary = {
        ngrams_count: Object.keys(ngrams || {}).length,
        supagrams_count: Object.keys(supagrams || {}).length,
        glyphgrams_count: Object.keys(glyphgrams || {}).length
      };

      return new Response(
        JSON.stringify({ summary, ngrams, supagrams, glyphgrams }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'memory_data_missing' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  /* TAPES */
  if (parts[0] === 'tapes') {
    return new Response(JSON.stringify(TapeRegistry.list()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /* AGENTS */
  if (parts[0] === 'agents') {
    return new Response(JSON.stringify([...AgentSwarm.agents.values()]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /* KERNEL */
  if (parts[0] === 'kernel' && parts[1] === 'spawn') {
    const body = await request.json();
    const result = await ASXRKernel.spawn(body.pid, body.code, body.context);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'not_found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

/* -------------------------------------------------------------------------
   9. SERVICE WORKER LIFECYCLE
------------------------------------------------------------------------- */

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(ASXR_KERNEL_CACHE);
    await cache.addAll(ASXR_CORE_ASSETS);

    await TapeRegistry.preloadFromManifest();
    AgentSwarm.bootstrapFromManifest();

    /* AUTO-BOOT ALL boot:true TAPES */
    for (const tape of Object.values(ASXR_TRINITY_MANIFEST.tapes || {})) {
      if (tape.boot === true) {
        await ASXRKernel.spawn(
          `boot_${tape.id}`,
          `⟁Pop⟁boot⟁Wo⟁${tape.id}⟁Sek⟁execute⟁Xul`,
          { tape }
        );
      }
    }

    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !k.startsWith(ASXR_OS_ID)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/asxr/')) {
    event.respondWith(respondASXR(url, event.request));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(caches.open(ASXR_KERNEL_CACHE).then(c => c.match('/index.html')));
    return;
  }

  event.respondWith(fetch(event.request).catch(async () => {
    const cache = await caches.open(ASXR_KERNEL_CACHE);
    return cache.match(event.request);
  }));
});

console.log('✅ ASXR TRINITY OS v3.2.0 BOOTED');
