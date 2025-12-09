/* =====================================================================
   ASXR MICRO SUPER CMS Ω — SERVICE WORKER
   KUHUL ⊗ XJSON ⊗ XCFE ⊗ ASX-RAM CMS BACKEND
   ===================================================================== */

'use strict';

/* ---------------------------------------------------------------------
   1. OS / CACHE / MANIFEST
------------------------------------------------------------------------ */

const CMS_OS_ID          = 'ASXR_MICRO_SUPER_CMS_OMEGA_v1';
const CMS_KERNEL_CACHE   = `${CMS_OS_ID}-kernel`;
const CMS_RAM_CACHE      = `${CMS_OS_ID}-ram`;
const CMS_SHELL_ASSETS   = [
  '/',
  '/index.html',
  '/atomic.css',
  '/tapes/asxr_micro_super_cms_v1.asxr.json'
];

/** Micro CMS brain (same structure you defined, slightly compact) */
const CMS_MANIFEST = {
  '@context': 'xjson://asxr/micro/cms/omega',
  '@v': '1.0.0',
  n: 'ASXR_MICRO_SUPER_CMS_OMEGA',
  d: 'All-in-one Micro-ASXR CMS OS with Forum, Store, Plugins, Blog, Users, RLHF, Training, and ASX-RAM-native memory.',
  '@law': 'ASX = XCFE = XJSON = KUHUL = AST',
  role: 'unified_cms_os',
  modes: {
    forum:   { label: 'Classic Forum',      route: '/forum'   },
    store:   { label: 'Marketplace',        route: '/store'   },
    plugins: { label: 'Plugin Directory',   route: '/plugins' },
    blog:    { label: 'Blog System',        route: '/blog'    },
    users:   { label: 'User Management',    route: '/users'   },
    rlhf:    { label: 'RLHF Training',      route: '/rlhf'    }
  },
  asx_ram: {
    users:        '/usr/ram/users.json',
    forum:        '/usr/ram/forum.json',
    store:        '/usr/ram/store.json',
    plugins:      '/usr/ram/plugins.json',
    blog:         '/usr/ram/blog.json',
    rlhf:         '/usr/ram/rlhf.json',
    ngrams:       '/usr/ram/ngrams.json',
    quadragrams:  '/usr/ram/quadragrams.json',
    pentagrams:   '/usr/ram/pentagrams.json',
    supagrams:    '/usr/ram/supagrams.json',
    glyphgrams:   '/usr/ram/glyphgrams.json'
  },
  agents: {
    'agent.profile.manager': {
      role: 'user_control',
      scope: ['users']
    },
    'agent.memory.trainer': {
      role: 'memory_writer',
      scope: ['ngrams', 'glyphgrams']
    },
    'agent.rlhf.reinforcer': {
      role: 'reward_adjuster',
      scope: ['rlhf']
    }
  }
};

/* Helper: resolve ASX-RAM path for a mode */
function cmsRamPathForMode(mode) {
  const map = CMS_MANIFEST.asx_ram || {};
  switch (mode) {
    case 'forum':   return map.forum;
    case 'store':   return map.store;
    case 'plugins': return map.plugins;
    case 'blog':    return map.blog;
    case 'users':   return map.users;
    case 'rlhf':    return map.rlhf;
    default:        return null;
  }
}

/* ---------------------------------------------------------------------
   2. ASX-RAM (Virtual FS over Cache API)
------------------------------------------------------------------------ */

const ASX_RAM = {
  async readJSON(path) {
    const cache = await caches.open(CMS_RAM_CACHE);
    const res = await cache.match(path);
    if (!res) return null;
    try {
      const txt = await res.text();
      return JSON.parse(txt);
    } catch {
      return null;
    }
  },

  async writeJSON(path, data) {
    const cache = await caches.open(CMS_RAM_CACHE);
    const body = JSON.stringify(data || {}, null, 2);
    await cache.put(path, new Response(body, {
      headers: { 'Content-Type': 'application/json' }
    }));
    return { path, size: body.length };
  },

  async ensureArray(path) {
    let data = await this.readJSON(path);
    if (!Array.isArray(data)) data = [];
    await this.writeJSON(path, data);
    return data;
  }
};

/* ---------------------------------------------------------------------
   3. MICRO KUHUL KERNEL (SYMBOLIC / PROCESS LITE)
------------------------------------------------------------------------ */

const MicroKernel = {
  processes: new Map(),

  spawn(op, context) {
    const pid = `${op}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const proc = {
      pid,
      op,
      context: context || {},
      createdAt: Date.now(),
      status: 'running'
    };
    this.processes.set(pid, proc);
    // In this micro kernel, we just mark as complete immediately
    proc.status = 'completed';
    return proc;
  },

  snapshot() {
    return Array.from(this.processes.values()).map(p => ({
      pid: p.pid,
      op: p.op,
      status: p.status,
      runtime_ms: Date.now() - p.createdAt
    }));
  }
};

/* ---------------------------------------------------------------------
   4. CMS OPERATIONS (LIST / CREATE / UPDATE / DELETE)
------------------------------------------------------------------------ */

const CMSOps = {
  async list(mode) {
    const path = cmsRamPathForMode(mode);
    if (!path) throw new Error(`unknown_mode:${mode}`);
    const data = await ASX_RAM.ensureArray(path);
    return data;
  },

  async create(mode, payload) {
    const path = cmsRamPathForMode(mode);
    if (!path) throw new Error(`unknown_mode:${mode}`);
    const data = await ASX_RAM.ensureArray(path);

    const id = payload.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const record = Object.assign({}, payload, {
      id,
      mode,
      created_at: payload.created_at || now,
      updated_at: now
    });

    data.push(record);
    await ASX_RAM.writeJSON(path, data);
    return record;
  },

  async update(mode, payload) {
    const path = cmsRamPathForMode(mode);
    if (!path) throw new Error(`unknown_mode:${mode}`);
    const data = await ASX_RAM.ensureArray(path);
    if (!payload.id) throw new Error('missing_id');

    const idx = data.findIndex(r => r.id === payload.id);
    if (idx === -1) throw new Error('not_found');

    const now = new Date().toISOString();
    data[idx] = Object.assign({}, data[idx], payload, {
      updated_at: now
    });

    await ASX_RAM.writeJSON(path, data);
    return data[idx];
  },

  async remove(mode, payload) {
    const path = cmsRamPathForMode(mode);
    if (!path) throw new Error(`unknown_mode:${mode}`);
    const data = await ASX_RAM.ensureArray(path);
    if (!payload.id) throw new Error('missing_id');

    const before = data.length;
    const filtered = data.filter(r => r.id !== payload.id);
    await ASX_RAM.writeJSON(path, filtered);
    return { deleted: before - filtered.length };
  }
};

/* ---------------------------------------------------------------------
   5. RLHF + MEMORY + AGENTS (MICRO ASXR STYLE)
------------------------------------------------------------------------ */

const MicroAgents = {
  async run(agentId, action, payload) {
    const agent = (CMS_MANIFEST.agents || {})[agentId];
    if (!agent) throw new Error(`unknown_agent:${agentId}`);

    // Very small, symbolic behavior
    if (agentId === 'agent.profile.manager') {
      if (action === 'upsert_profile') {
        const path = CMS_MANIFEST.asx_ram.users;
        const list = await ASX_RAM.ensureArray(path);
        const id = payload.id || crypto.randomUUID();
        const now = new Date().toISOString();

        const idx = list.findIndex(u => u.id === id);
        const base = { id, created_at: now };
        const merged = Object.assign(base, list[idx] || {}, payload, {
          updated_at: now
        });

        if (idx === -1) list.push(merged);
        else list[idx] = merged;
        await ASX_RAM.writeJSON(path, list);
        return merged;
      }
    }

    if (agentId === 'agent.memory.trainer') {
      if (action === 'record_ngrams') {
        const path = CMS_MANIFEST.asx_ram.ngrams;
        const list = await ASX_RAM.ensureArray(path);
        list.push({
          ts: Date.now(),
          tokens: payload.tokens || [],
          source: payload.source || 'unknown'
        });
        await ASX_RAM.writeJSON(path, list);
        return { ok: true, count: list.length };
      }
      if (action === 'record_glyphgram') {
        const path = CMS_MANIFEST.asx_ram.glyphgrams;
        const list = await ASX_RAM.ensureArray(path);
        list.push({
          ts: Date.now(),
          glyphs: payload.glyphs || [],
          context: payload.context || {}
        });
        await ASX_RAM.writeJSON(path, list);
        return { ok: true, count: list.length };
      }
    }

    if (agentId === 'agent.rlhf.reinforcer') {
      if (action === 'apply_reward') {
        const path = CMS_MANIFEST.asx_ram.rlhf;
        const list = await ASX_RAM.ensureArray(path);
        list.push({
          ts: Date.now(),
          case_id: payload.case_id || null,
          delta: payload.delta || 0,
          meta: payload.meta || {}
        });
        await ASX_RAM.writeJSON(path, list);
        return { ok: true, reward_count: list.length };
      }
    }

    // Fallback: echo context
    return { agentId, action, payload, note: 'no-op handler used' };
  }
};

/* ---------------------------------------------------------------------
   6. API ROUTERS
------------------------------------------------------------------------ */

async function handleCmsApi(url, req) {
  // /api/cms/:mode/:action
  const parts = url.pathname.replace(/^\/api\/cms\//, '').split('/').filter(Boolean);
  const mode = parts[0];
  const action = parts[1] || 'list';

  try {
    let body = {};
    if (req.method === 'POST' || req.method === 'PUT') {
      try { body = await req.json(); } catch { body = {}; }
    }

    MicroKernel.spawn(`cms_${mode}_${action}`, { mode, body });

    let data;
    if (action === 'list' && req.method === 'GET') {
      data = await CMSOps.list(mode);
    } else if (action === 'create' && req.method === 'POST') {
      data = await CMSOps.create(mode, body);
    } else if (action === 'update' && req.method === 'POST') {
      data = await CMSOps.update(mode, body);
    } else if (action === 'delete' && req.method === 'POST') {
      data = await CMSOps.remove(mode, body);
    } else {
      return jsonResponse({ error: 'unsupported_action', mode, action }, 400);
    }

    return jsonResponse({ ok: true, mode, action, data });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message || 'cms_error', mode }, 500);
  }
}

async function handleRlhfApi(url, req) {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }
  try {
    const body = await req.json();

    MicroKernel.spawn('rlhf_reward', body);

    const res = await MicroAgents.run('agent.rlhf.reinforcer', 'apply_reward', {
      case_id: body.case_id || null,
      delta: body.delta || 0,
      meta: body.meta || {}
    });

    return jsonResponse({ ok: true, res });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message || 'rlhf_error' }, 500);
  }
}

async function handleAgentApi(url, req) {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }
  try {
    const body = await req.json();
    const { agentId, action, payload } = body;

    MicroKernel.spawn(`agent_${agentId}_${action}`, body);

    const res = await MicroAgents.run(agentId, action, payload || {});
    return jsonResponse({ ok: true, res });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message || 'agent_error' }, 500);
  }
}

/* Small helper */
function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/* ---------------------------------------------------------------------
   7. SERVICE WORKER LIFECYCLE
------------------------------------------------------------------------ */

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CMS_KERNEL_CACHE);
    await cache.addAll(CMS_SHELL_ASSETS);
    // Seed empty ASX-RAM files
    const ram = CMS_MANIFEST.asx_ram || {};
    const paths = Object.values(ram);
    for (const p of paths) {
      const existing = await ASX_RAM.readJSON(p);
      if (existing === null) {
        await ASX_RAM.writeJSON(p, Array.isArray(existing) ? existing : []);
      }
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => !k.startsWith(CMS_OS_ID))
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

/* ---------------------------------------------------------------------
   8. FETCH ROUTING
------------------------------------------------------------------------ */

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // CMS APIs
  if (url.pathname.startsWith('/api/cms/')) {
    event.respondWith(handleCmsApi(url, event.request));
    return;
  }

  if (url.pathname === '/api/rlhf/reward') {
    event.respondWith(handleRlhfApi(url, event.request));
    return;
  }

  if (url.pathname === '/api/agents/action') {
    event.respondWith(handleAgentApi(url, event.request));
    return;
  }

  // Expose CMS manifest (optional utility)
  if (url.pathname === '/api/cms/manifest') {
    event.respondWith(jsonResponse({ ok: true, manifest: CMS_MANIFEST }));
    return;
  }

  // ASX-RAM VFS direct reads: /usr/ram/*
  if (url.pathname.startsWith('/usr/ram/')) {
    event.respondWith((async () => {
      const data = await ASX_RAM.readJSON(url.pathname);
      if (data === null) {
        return jsonResponse({ error: 'ram_not_found', path: url.pathname }, 404);
      }
      return jsonResponse(data);
    })());
    return;
  }

  // App shell (navigation)
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CMS_KERNEL_CACHE);
      const cached = await cache.match('/index.html');
      if (cached) return cached;
      try {
        const net = await fetch('/index.html');
        await cache.put('/index.html', net.clone());
        return net;
      } catch {
        return new Response(
          `<h1>ASXR MICRO SUPER CMS</h1><p>Offline shell unavailable.</p>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }
    })());
    return;
  }

  // Default: network first, fallback to kernel cache
  event.respondWith((async () => {
    try {
      return await fetch(event.request);
    } catch {
      const cache = await caches.open(CMS_KERNEL_CACHE);
      const cached = await cache.match(event.request);
      return cached || new Response('ASXR CMS: no route', { status: 503 });
    }
  })());
});

/* ---------------------------------------------------------------------
   9. MESSAGE CHANNEL (OPTIONAL CONTROL FROM UI)
------------------------------------------------------------------------ */

self.addEventListener('message', event => {
  const { type, payload } = event.data || {};
  const port = event.ports && event.ports[0];
  if (!port) return;

  if (type === 'CMS:status') {
    port.postMessage({
      ok: true,
      os: CMS_OS_ID,
      manifest: CMS_MANIFEST,
      processes: MicroKernel.snapshot()
    });
  }

  if (type === 'CMS:list_ram') {
    (async () => {
      const entries = {};
      const ram = CMS_MANIFEST.asx_ram || {};
      for (const [k, p] of Object.entries(ram)) {
        entries[k] = await ASX_RAM.readJSON(p);
      }
      port.postMessage({ ok: true, entries });
    })();
  }
});

console.log('ASXR MICRO SUPER CMS Ω — service worker booted');
