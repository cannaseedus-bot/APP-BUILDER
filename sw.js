/* ============================================================
   sw.js — JavaScript Bridge to K'UHUL Kernel
   ASX Ghost OS - Service Worker Implementation

   Loads sw.khl ROM cartridge and executes it
   ============================================================ */

const CACHE_NAME = 'asx-ghost-os-v1';
let manifest = null;
let ASX_RAM = new Map();
let MX2DB = {
  n_grams: new Map(),
  supagrams: new Map(),
  rlhf_traces: new Map(),
  agent_state: new Map(),
  training_history: new Map(),
  tapes: new Map()
};

/* ============================================================
   K'UHUL ROM PARSER
   Extracts JSON AST from sw.khl
   ============================================================ */
function parseKuhlRom(khlSource) {
  // Extract manifest_ast JSON block from K'UHUL source
  // Pattern: ⟁Wo⟁ manifest_ast { ... }
  const manifestMatch = khlSource.match(/⟁Wo⟁\s+manifest_ast\s+(\{[\s\S]*?\n  \})\s*\n/);

  if (!manifestMatch) {
    console.error('⟁ Failed to extract manifest_ast from sw.khl');
    return null;
  }

  try {
    const manifestJson = manifestMatch[1];
    const manifest = JSON.parse(manifestJson);
    console.log('⟁ Manifest AST extracted from ROM:', manifest.n);
    return manifest;
  } catch (e) {
    console.error('⟁ Failed to parse manifest_ast JSON:', e);
    return null;
  }
}

/* ============================================================
   SERVICE WORKER LIFECYCLE
   ============================================================ */

self.addEventListener('install', (event) => {
  console.log('⟁ K\'UHUL Kernel installing...');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', async (event) => {
  console.log('⟁ K\'UHUL Kernel activating...');

  event.waitUntil(
    (async () => {
      try {
        // Load sw.khl ROM cartridge
        const khlResponse = await fetch('/sw.khl');
        const khlSource = await khlResponse.text();
        console.log('⟁ sw.khl ROM loaded:', khlSource.length, 'bytes');

        // Parse manifest AST from K'UHUL ROM
        manifest = parseKuhlRom(khlSource);

        if (!manifest) {
          console.error('⟁ KERNEL PANIC: Failed to load manifest from ROM');
          return;
        }

        console.log('⟁ Manifest loaded:', manifest.n);
        console.log('⟁ Law:', manifest.atomic_law);
        console.log('⟁ Quantum State:', manifest.quantum_state);

        // Initialize ASX-RAM stores from manifest
        if (manifest.asx_ram && manifest.asx_ram.keys) {
          Object.keys(manifest.asx_ram.keys).forEach(category => {
            manifest.asx_ram.keys[category].forEach(key => {
              ASX_RAM.set(key, null);
            });
          });
        }

        // Set initial OS state
        ASX_RAM.set('os.boot.count', (ASX_RAM.get('os.boot.count') || 0) + 1);
        ASX_RAM.set('os.state', 'active');
        ASX_RAM.set('os.kernel', 'sw.khl Ω.∞.Ω');
        ASX_RAM.set('tapes.registry', Object.keys(manifest.tapes || {}));

        console.log('⟁ ASX-RAM initialized:', ASX_RAM.size, 'keys');
        console.log('⟁ MX2DB tables:', Object.keys(MX2DB).length);
        console.log('⟁ Tapes registered:', Object.keys(manifest.tapes || {}).length);
        console.log('⟁ K\'UHUL Folds active:', Object.keys(manifest.kuhul_folds || {}).length);

        return self.clients.claim();
      } catch (error) {
        console.error('⟁ KERNEL PANIC during activation:', error);
      }
    })()
  );
});

/* ============================================================
   FETCH HANDLER - REST MESH ROUTER
   ============================================================ */

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Check if this is a REST mesh route
  const route = manifest?.rest_mesh?.routes?.[url.pathname];

  if (route) {
    event.respondWith(handleRestMeshRoute(url, event.request, route));
  } else {
    event.respondWith(handleStaticAsset(event.request));
  }
});

/* ============================================================
   REST MESH ROUTE HANDLERS
   ============================================================ */

async function handleRestMeshRoute(url, request, route) {
  const handler = route.handler;
  let result;

  try {
    switch (handler) {
      // OS Handlers
      case 'health_check':
        result = {
          ok: true,
          kernel: 'sw.khl Ω.∞.Ω',
          law: manifest.atomic_law,
          quantum_state: manifest.quantum_state,
          folds_active: Object.keys(manifest.kuhul_folds || {}).length,
          tapes_registered: Object.keys(manifest.tapes || {}).length,
          ram_keys: ASX_RAM.size,
          uptime: performance.now()
        };
        break;

      case 'os_state':
        result = {
          ok: true,
          state: ASX_RAM.get('os.state'),
          boot_count: ASX_RAM.get('os.boot.count'),
          active_tape: ASX_RAM.get('os.active_tape'),
          kernel: ASX_RAM.get('os.kernel')
        };
        break;

      // Tape Handlers
      case 'tapes_list':
        result = {
          ok: true,
          tapes: Object.keys(manifest.tapes || {}).map(id => ({
            id,
            label: manifest.tapes[id].label,
            role: manifest.tapes[id].role,
            boot: manifest.tapes[id].boot || false
          }))
        };
        break;

      case 'tapes_boot':
        const tapeId = url.searchParams.get('id');
        if (tapeId && manifest.tapes && manifest.tapes[tapeId]) {
          ASX_RAM.set('os.active_tape', tapeId);
          ASX_RAM.set('tapes.active_id', tapeId);
          result = {
            ok: true,
            message: `Tape ${tapeId} booted`,
            tape: manifest.tapes[tapeId]
          };
        } else {
          result = { ok: false, error: 'Tape not found', tape_id: tapeId };
        }
        break;

      case 'tapes_load':
        const loadId = url.searchParams.get('id');
        if (loadId && manifest.tapes && manifest.tapes[loadId]) {
          const tape = manifest.tapes[loadId];
          // Fetch the actual tape XJSON file
          try {
            const tapeResponse = await fetch(tape.entry);
            const tapeXjson = await tapeResponse.json();
            result = {
              ok: true,
              tape: tapeXjson
            };
          } catch (e) {
            result = { ok: false, error: 'Failed to load tape XJSON', message: e.message };
          }
        } else {
          result = { ok: false, error: 'Tape not found' };
        }
        break;

      // ASX-RAM Handlers
      case 'ram_get':
        const getKey = url.searchParams.get('key');
        result = {
          ok: true,
          key: getKey,
          value: ASX_RAM.get(getKey)
        };
        break;

      case 'ram_set':
        if (request.method === 'POST') {
          const body = await request.json();
          ASX_RAM.set(body.key, body.value);
          result = { ok: true, key: body.key, value: body.value };
        } else {
          result = { ok: false, error: 'POST required' };
        }
        break;

      case 'ram_list':
        result = {
          ok: true,
          keys: Array.from(ASX_RAM.keys()),
          count: ASX_RAM.size
        };
        break;

      // MX2DB Handlers
      case 'mx2db_put':
        if (request.method === 'POST') {
          const scope = url.searchParams.get('scope') || 'tapes';
          const body = await request.json();
          const id = url.searchParams.get('id') || `${scope}_${Date.now()}`;

          if (MX2DB[scope]) {
            MX2DB[scope].set(id, {
              id,
              scope,
              data: body,
              timestamp: Date.now()
            });
            result = { ok: true, id, scope };
          } else {
            result = { ok: false, error: 'Invalid scope' };
          }
        } else {
          result = { ok: false, error: 'POST required' };
        }
        break;

      case 'mx2db_query':
        const queryScope = url.searchParams.get('scope') || 'tapes';
        const queryId = url.searchParams.get('id');

        if (MX2DB[queryScope]) {
          if (queryId) {
            result = {
              ok: true,
              data: MX2DB[queryScope].get(queryId) || null
            };
          } else {
            result = {
              ok: true,
              data: Array.from(MX2DB[queryScope].values())
            };
          }
        } else {
          result = { ok: false, error: 'Invalid scope' };
        }
        break;

      // Basher Handler
      case 'basher_run':
        if (request.method === 'POST') {
          const body = await request.json();
          result = await executeBasherCommand(body.command);
        } else {
          result = { ok: false, error: 'POST required' };
        }
        break;

      // Runtime Handlers (Stubs)
      case 'xjson_compile':
        result = { ok: true, message: 'XJSON compiler stub' };
        break;

      case 'xjson_eval':
        result = { ok: true, message: 'XJSON eval stub' };
        break;

      case 'scx_compress':
        result = { ok: true, message: 'SCXQ2 compress stub' };
        break;

      case 'scx_decompress':
        result = { ok: true, message: 'SCXQ2 decompress stub' };
        break;

      // Trainer Handlers (Stubs)
      case 'trainer_start':
        result = { ok: true, message: 'Trainer start stub' };
        break;

      case 'trainer_status':
        result = { ok: true, message: 'Trainer status stub' };
        break;

      default:
        result = { ok: false, error: 'Handler not implemented', handler };
    }

    return new Response(JSON.stringify(result, null, 2), {
      status: result.ok ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        'X-Kernel': 'sw.khl Ω.∞.Ω',
        'X-Law': manifest?.atomic_law || 'ASX'
      }
    });
  } catch (error) {
    console.error('⟁ REST mesh error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/* ============================================================
   BASHER COMMAND EXECUTOR
   ============================================================ */

async function executeBasherCommand(command) {
  if (!command) return { ok: false, error: 'No command provided' };

  const parts = command.trim().split(' ');
  const cmd = parts[0];
  const args = parts.slice(1);

  try {
    switch (cmd) {
      case 'tapes.list':
        return {
          ok: true,
          tapes: Object.keys(manifest?.tapes || {}).map(id => ({
            id,
            label: manifest.tapes[id].label,
            role: manifest.tapes[id].role
          }))
        };

      case 'tapes.boot':
        if (args[0] && manifest?.tapes && manifest.tapes[args[0]]) {
          ASX_RAM.set('os.active_tape', args[0]);
          ASX_RAM.set('tapes.active_id', args[0]);
          return { ok: true, message: `Booted ${args[0]}` };
        }
        return { ok: false, error: 'Tape not found' };

      case 'folds.tree':
        return {
          ok: true,
          folds: manifest?.kuhul_folds || {}
        };

      case 'mesh.status':
        return {
          ok: true,
          routes: Object.keys(manifest?.rest_mesh?.routes || {})
        };

      case 'ram.get':
        return {
          ok: true,
          key: args[0],
          value: ASX_RAM.get(args[0])
        };

      case 'ram.set':
        if (args.length >= 2) {
          const key = args[0];
          const value = args.slice(1).join(' ');
          ASX_RAM.set(key, value);
          return { ok: true, key, value };
        }
        return { ok: false, error: 'Usage: ram.set <key> <value>' };

      case 'ram.list':
        return {
          ok: true,
          keys: Array.from(ASX_RAM.keys()),
          count: ASX_RAM.size
        };

      case 'health':
        return {
          ok: true,
          kernel: 'sw.khl Ω.∞.Ω',
          law: manifest?.atomic_law,
          uptime: performance.now(),
          ram_keys: ASX_RAM.size,
          tapes: Object.keys(manifest?.tapes || {}).length
        };

      case 'runtime.reload':
        // Signal clients to reload
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({ type: 'reload' });
        });
        return { ok: true, message: 'Reload signal sent' };

      default:
        return { ok: false, error: `Unknown command: ${cmd}` };
    }
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/* ============================================================
   STATIC ASSET HANDLER (Cache-First Strategy)
   ============================================================ */

async function handleStaticAsset(request) {
  try {
    // Cache-first strategy
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch from network
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('⟁ Static asset error:', error);
    return new Response('Network error', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/* ============================================================
   MESSAGE HANDLER (Client Communication)
   ============================================================ */

self.addEventListener('message', (event) => {
  console.log('⟁ Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('⟁ sw.js loaded - K\'UHUL Kernel bridge ready');
