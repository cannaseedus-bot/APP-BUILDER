// sw.js — AI_POWERED_MICRO_ASXR_CMS SERVICE KERNEL
// ASX = XCFE = XJSON = KUHUL = AST = ATOMIC_BLOCK

/* -------------------------------------------------------------------------
   0. KERNEL META
------------------------------------------------------------------------- */

const ASX_KERNEL_TAG = "AI_POWERED_MICRO_ASXR_CMS";
const ASX_KERNEL_VERSION = "1.0.0";
const CORE_CACHE = "asx-cms-core-v1";
const RUNTIME_CACHE = "asx-cms-runtime-v1";

/* -------------------------------------------------------------------------
   1. IN-MEMORY STATE (ASX-RAM + MX2DB)
------------------------------------------------------------------------- */

// ASX-RAM: volatile key/value store
const ASX_RAM = new Map();

// MX2DB: simple scoped maps for our CMS entities
const MX2DB = {
  profiles: new Map(),   // users
  posts: new Map(),      // forum/blog posts
  products: new Map(),   // store items
  plugins: new Map(),    // plugin registry
  models: new Map(),     // AI models / configs
  rlhf: new Map()        // RLHF traces
};

// Simple ID helper for MX2DB scopes
function mx2dbNextId(scope) {
  const db = MX2DB[scope] || MX2DB.posts;
  let max = 0;
  for (const key of db.keys()) {
    const n = parseInt(key, 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return String(max + 1);
}

/* -------------------------------------------------------------------------
   2. HELPER UTILITIES
------------------------------------------------------------------------- */

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-ASX-Kernel": ASX_KERNEL_TAG,
      "X-ASX-Version": ASX_KERNEL_VERSION,
      ...headers
    }
  });
}

async function readJsonBody(request) {
  try {
    const text = await request.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
}

// Basic upstream mesh proxy (optional / best-effort)
const MESH_UPSTREAMS = {
  // Example: shard names -> base URL
  // "mx2lm_api": "https://api.asxtoken.com/api.php"
};

/**
 * Forward a request to a configured mesh target.
 * /mesh/proxy?target=mx2lm_api&path=/inference
 */
async function handleMeshProxy(url, request) {
  const target = url.searchParams.get("target");
  const path = url.searchParams.get("path") || "/";
  const base = MESH_UPSTREAMS[target];

  if (!base) {
    return jsonResponse(
      { ok: false, error: "UNKNOWN_MESH_TARGET", target },
      400
    );
  }

  const proxyUrl = base.replace(/\/$/, "") + path;

  const init = {
    method: request.method,
    headers: request.headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body
  };

  try {
    const res = await fetch(proxyUrl, init);
    const blob = await res.blob();
    return new Response(blob, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers
    });
  } catch (err) {
    return jsonResponse(
      { ok: false, error: "MESH_PROXY_FAILED", detail: String(err) },
      502
    );
  }
}

/* -------------------------------------------------------------------------
   3. INSTALL / ACTIVATE
------------------------------------------------------------------------- */

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CORE_CACHE)
      .then(cache =>
        cache.addAll([
          "./",
          "./index.html",
          "./manifest.json"
        ]).catch(() => {})
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(k => ![CORE_CACHE, RUNTIME_CACHE].includes(k))
          .map(k => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

/* -------------------------------------------------------------------------
   4. ASX-RAM REST ROUTES
   /ram/get?key=foo
   /ram/set   (POST { key, value })
   /ram/list
   /ram/clear
------------------------------------------------------------------------- */

async function handleRamRoute(url, request) {
  const path = url.pathname.replace(/^\/ram\/?/, "") || "get";

  if (path === "get") {
    const key = url.searchParams.get("key");
    const value = ASX_RAM.has(key) ? ASX_RAM.get(key) : null;
    return jsonResponse({ ok: true, key, value });
  }

  if (path === "set" && request.method === "POST") {
    const body = await readJsonBody(request);
    const key = body.key;
    const value = body.value;
    if (!key) {
      return jsonResponse({ ok: false, error: "MISSING_KEY" }, 400);
    }
    ASX_RAM.set(key, value);
    return jsonResponse({ ok: true, key, value });
  }

  if (path === "list") {
    const entries = [];
    for (const [key, value] of ASX_RAM.entries()) {
      entries.push({ key, value });
    }
    return jsonResponse({ ok: true, entries });
  }

  if (path === "clear") {
    ASX_RAM.clear();
    return jsonResponse({ ok: true, cleared: true });
  }

  return jsonResponse({ ok: false, error: "UNKNOWN_RAM_ROUTE", path }, 404);
}

/* -------------------------------------------------------------------------
   5. MX2DB REST ROUTES
   /mx2db/put?scope=posts&id=123  (POST data)
   /mx2db/get?scope=posts&id=123
   /mx2db/query?scope=posts&q=...
   /mx2db/delete?scope=posts&id=123
------------------------------------------------------------------------- */

async function handleMx2dbRoute(url, request) {
  const path = url.pathname.replace(/^\/mx2db\/?/, "") || "get";
  const scope = url.searchParams.get("scope") || "posts";
  const db = MX2DB[scope];

  if (!db) {
    return jsonResponse({ ok: false, error: "UNKNOWN_SCOPE", scope }, 400);
  }

  if (path === "put" && request.method === "POST") {
    const body = await readJsonBody(request);
    let id = url.searchParams.get("id") || body.id;
    if (!id) {
      id = mx2dbNextId(scope);
    }
    const record = {
      id,
      scope,
      data: body,
      ts: Date.now()
    };
    db.set(id, record);
    return jsonResponse({ ok: true, record });
  }

  if (path === "get") {
    const id = url.searchParams.get("id");
    if (!id) {
      return jsonResponse({ ok: false, error: "MISSING_ID" }, 400);
    }
    const record = db.get(id) || null;
    return jsonResponse({ ok: true, record });
  }

  if (path === "query") {
    const q = (url.searchParams.get("q") || "").toLowerCase();
    const results = [];
    for (const record of db.values()) {
      const haystack = JSON.stringify(record.data || {}).toLowerCase();
      if (!q || haystack.includes(q)) {
        results.push(record);
      }
    }
    return jsonResponse({ ok: true, results, count: results.length });
  }

  if (path === "delete") {
    const id = url.searchParams.get("id");
    if (!id) {
      return jsonResponse({ ok: false, error: "MISSING_ID" }, 400);
    }
    const existed = db.delete(id);
    return jsonResponse({ ok: true, deleted: existed, id });
  }

  return jsonResponse({ ok: false, error: "UNKNOWN_MX2DB_ROUTE", path }, 404);
}

/* -------------------------------------------------------------------------
   6. CMS ROUTES (FORUM, STORE, PLUGINS, BLOG, USERS, RLHF)
   These are thin facades over MX2DB scopes.
------------------------------------------------------------------------- */

async function handleCmsRoute(url, request) {
  const [, , section = ""] = url.pathname.split("/"); // /cms/forum/list → ["", "cms", "forum", "list"]
  const action = url.pathname.split("/")[3] || "list";

  // Map CMS section → MX2DB scope
  const scopeMap = {
    forum: "posts",
    blog: "posts",
    store: "products",
    plugins: "plugins",
    users: "profiles",
    rlhf: "rlhf"
  };
  const scope = scopeMap[section];

  if (!scope) {
    return jsonResponse({ ok: false, error: "UNKNOWN_CMS_SECTION", section }, 404);
  }
  const db = MX2DB[scope];

  if (action === "list") {
    const items = Array.from(db.values());
    return jsonResponse({ ok: true, section, scope, items });
  }

  if (action === "create" && request.method === "POST") {
    const body = await readJsonBody(request);
    const id = mx2dbNextId(scope);
    const record = {
      id,
      scope,
      data: body,
      ts: Date.now()
    };
    db.set(id, record);
    return jsonResponse({ ok: true, section, record });
  }

  if (action === "get") {
    const id = url.searchParams.get("id");
    if (!id) {
      return jsonResponse({ ok: false, error: "MISSING_ID" }, 400);
    }
    const record = db.get(id) || null;
    return jsonResponse({ ok: true, section, record });
  }

  if (action === "update" && request.method === "POST") {
    const id = url.searchParams.get("id");
    const body = await readJsonBody(request);
    if (!id) {
      return jsonResponse({ ok: false, error: "MISSING_ID" }, 400);
    }
    const existing = db.get(id) || { id, scope, data: {} };
    existing.data = { ...existing.data, ...body };
    existing.ts = Date.now();
    db.set(id, existing);
    return jsonResponse({ ok: true, section, record: existing });
  }

  return jsonResponse(
    { ok: false, error: "UNKNOWN_CMS_ACTION", section, action },
    404
  );
}

/* -------------------------------------------------------------------------
   7. AGENT ROUTES
   - /agents/profile/get|update
   - /agents/memory/train
   - /agents/rlhf/score
------------------------------------------------------------------------- */

async function handleAgentsRoute(url, request) {
  const [, , agentName = ""] = url.pathname.split("/"); // /agents/profile/update
  const action = url.pathname.split("/")[3] || "";

  // agent.profile.manager
  if (agentName === "profile") {
    if (action === "get") {
      const userId = url.searchParams.get("userId") || "default";
      const db = MX2DB.profiles;
      const record = db.get(userId) || null;
      return jsonResponse({
        ok: true,
        agent: "agent.profile.manager",
        profile: record
      });
    }

    if (action === "update" && request.method === "POST") {
      const body = await readJsonBody(request);
      const userId = body.id || url.searchParams.get("userId") || "default";
      const db = MX2DB.profiles;
      const existing = db.get(userId) || {
        id: userId,
        scope: "profiles",
        data: {},
        ts: Date.now()
      };
      existing.data = { ...existing.data, ...body };
      existing.ts = Date.now();
      db.set(userId, existing);

      return jsonResponse({
        ok: true,
        agent: "agent.profile.manager",
        profile: existing
      });
    }
  }

  // agent.memory.trainer
  if (agentName === "memory" && action === "train" && request.method === "POST") {
    const body = await readJsonBody(request);
    const text = body.text || "";
    const score = body.score ?? 1;

    const id = mx2dbNextId("rlhf");
    const record = {
      id,
      scope: "rlhf",
      data: { text, score },
      ts: Date.now()
    };
    MX2DB.rlhf.set(id, record);

    // also drop into ASX-RAM n-gram style bucket for quick access
    const key = "rlhf:" + id;
    ASX_RAM.set(key, { text, score, ts: record.ts });

    return jsonResponse({
      ok: true,
      agent: "agent.memory.trainer",
      stored: record
    });
  }

  // agent.rlhf.reinforcer
  if (agentName === "rlhf" && action === "score" && request.method === "POST") {
    const body = await readJsonBody(request);
    const score = body.score ?? 1;
    const id = body.id || mx2dbNextId("rlhf");

    const db = MX2DB.rlhf;
    const existing = db.get(id) || {
      id,
      scope: "rlhf",
      data: {},
      ts: Date.now()
    };

    existing.data = {
      ...existing.data,
      ...(body || {}),
      lastScore: score
    };
    existing.ts = Date.now();
    db.set(id, existing);

    return jsonResponse({
      ok: true,
      agent: "agent.rlhf.reinforcer",
      updated: existing
    });
  }

  return jsonResponse(
    { ok: false, error: "UNKNOWN_AGENT_ROUTE", agentName, action },
    404
  );
}

/* -------------------------------------------------------------------------
   8. TAPES / RLHF / AUX ROUTES
------------------------------------------------------------------------- */

async function handleTapesRoute(url, _request) {
  // Minimal introspection for tapes; real tape data lives in manifest / index.html.
  const tapes = [
    "tape_system_asx_ram_manager_v1.asxr.json",
    "tape_system_user_profile_v1.asxr.json",
    "tape_system_rlhf_visualization_v1.asxr.json",
    "tape_system_memory_heatmap_v1.asxr.json",
    "tape_system_training_cockpit_v1.asxr.json"
  ];
  return jsonResponse({
    ok: true,
    tapes,
    route: url.pathname
  });
}

/* -------------------------------------------------------------------------
   9. FETCH ROUTER
------------------------------------------------------------------------- */

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Only intercept same-origin REST-style paths
  if (url.origin !== self.location.origin) {
    return; // let browser handle cross-origin
  }

  // LOCAL REST MESH
  if (url.pathname.startsWith("/ram/")) {
    event.respondWith(handleRamRoute(url, request));
    return;
  }

  if (url.pathname.startsWith("/mx2db/")) {
    event.respondWith(handleMx2dbRoute(url, request));
    return;
  }

  if (url.pathname.startsWith("/cms/")) {
    event.respondWith(handleCmsRoute(url, request));
    return;
  }

  if (url.pathname.startsWith("/agents/")) {
    event.respondWith(handleAgentsRoute(url, request));
    return;
  }

  if (url.pathname.startsWith("/tapes/")) {
    event.respondWith(handleTapesRoute(url, request));
    return;
  }

  if (url.pathname.startsWith("/mesh/proxy")) {
    event.respondWith(handleMeshProxy(url, request));
    return;
  }

  // HTML navigation: stale-while-revalidate
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, network.clone());
          return network;
        } catch {
          const cache = await caches.open(RUNTIME_CACHE);
          const cached = await cache.match(request);
          if (cached) return cached;
          const core = await caches.open(CORE_CACHE);
          return (await core.match("./index.html")) || Response.error();
        }
      })()
    );
    return;
  }

  // Static assets: cache-first
  if (request.method === "GET") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const network = await fetch(request);
          cache.put(request, network.clone());
          return network;
        } catch {
          return cached || Response.error();
        }
      })()
    );
  }
});

/* -------------------------------------------------------------------------
   10. MESSAGE CHANNEL (ASX-RAM BRIDGE)
   Supports:
   - { type: "ram-store", key, value }
   - { type: "ram-get", key }
------------------------------------------------------------------------- */

self.addEventListener("message", event => {
  const msg = event.data || {};
  if (!msg.type) return;

  if (msg.type === "ram-store") {
    if (msg.key) ASX_RAM.set(msg.key, msg.value);
    return;
  }

  if (msg.type === "ram-get") {
    const value = ASX_RAM.has(msg.key) ? ASX_RAM.get(msg.key) : null;
    if (event.source && typeof event.source.postMessage === "function") {
      event.source.postMessage({
        type: "ram-data",
        key: msg.key,
        value
      });
    }
    return;
  }
});

/* -------------------------------------------------------------------------
   11. HEARTBEAT / HEALTH (OPTIONAL)
   /os/health
------------------------------------------------------------------------- */

async function handleHealthRoute() {
  const status = {
    ok: true,
    kernel: ASX_KERNEL_TAG,
    version: ASX_KERNEL_VERSION,
    ram_keys: ASX_RAM.size,
    scopes: Object.keys(MX2DB),
    ts: Date.now()
  };
  return jsonResponse(status);
}

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.origin === self.location.origin && url.pathname === "/os/health") {
    event.respondWith(handleHealthRoute());
  }
});

console.log('AI_POWERED_MICRO_ASXR_CMS — Service worker kernel booted');
