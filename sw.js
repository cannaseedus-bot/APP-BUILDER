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
  tapes: new Map(),
  feed_entries: new Map()
};

/* ============================================================
   FOLDS - JavaScript Runtime Modules
   Each fold orchestrates K'UHUL kernel execution
   ============================================================ */

const FOLDS = {
  "local_rest": {
    mount: "/local/api",
    description: "Local REST API fold for CMS OS, RLHF, and MX2DB",
    version: "1.0.0",

    routes: {
      "GET /rlhf/case":      "cms_rlhf_list",
      "GET /rlhf/case/:id":  "cms_rlhf_get",
      "POST /rlhf/case":     "cms_rlhf_post",
      "POST /rlhf/score":    "cms_rlhf_update_score",

      "GET /cms/page/:slug": "cms_get_page",
      "GET /cms/feed/:name": "cms_get_feed",

      "GET /db/:table":          "db_list_rows",
      "GET /db/:table/:id":      "db_get_row",
      "POST /db/:table":         "db_insert_row",
      "PUT /db/:table/:id":      "db_update_row",
      "DELETE /db/:table/:id":   "db_delete_row",

      "GET /health":         "health_check_extended",
      "GET /meta/routes":    "meta_routes",

      "POST /feed/import":   "feed_import",
      "POST /feed/sync":     "feed_sync",

      "GET /mesh/ping":      "mesh_ping",
      "POST /mesh/register": "mesh_register"
    },

    /**
     * Main fold dispatch logic
     * Bridges REST requests to K'UHUL kernel execution
     */
    async dispatch(request) {
      // request = { method, path, query, body, headers, auth, params }
      const handler = request.handler;

      // Build payload for K'UHUL kernel
      const payload = {
        '@route': handler,
        '@query': { ...request.query, ...request.params },
        '@body': request.body
      };

      const kernelResp = await self.__KUHUL_KERNEL_EXEC__(payload, 'local_rest_fold');

      return {
        status: kernelResp.status || 200,
        body: JSON.parse(kernelResp.body || '{"ok":false,"error":"invalid_kernel_response"}')
      };
    }
  }
};

/* ============================================================
   FOLD ROUTE PARSER HELPERS
   Pattern matching for REST routes
   ============================================================ */

/**
 * Parse fold route and extract parameters
 * @param {Object} fold - Fold object with routes
 * @param {string} method - HTTP method
 * @param {string} path - Request path (without fold mount)
 * @returns {Object|null} - { handler, params } or null
 */
function parseFoldRoute(fold, method, path) {
  for (const key of Object.keys(fold.routes)) {
    const [m, pattern] = key.split(' ');

    if (m !== method) continue;

    const match = matchPattern(pattern, path);
    if (match) {
      return {
        handler: fold.routes[key],
        params: match
      };
    }
  }
  return null;
}

/**
 * Match URL pattern with actual path
 * Supports :param syntax for path parameters
 * @param {string} pattern - Route pattern (e.g., "/db/:table/:id")
 * @param {string} actual - Actual path (e.g., "/db/users/123")
 * @returns {Object|null} - Extracted params or null
 */
function matchPattern(pattern, actual) {
  const p = pattern.split('/').filter(Boolean);
  const a = actual.split('/').filter(Boolean);

  if (p.length !== a.length) return null;

  const params = {};

  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) {
      params[p[i].slice(1)] = a[i];
    } else if (p[i] !== a[i]) {
      return null;
    }
  }
  return params;
}

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

    // Extract CMS RLHF Database from ATOMIC_BLOCK_DATABASE_RLHF
    const rlhfDbMatch = khlSource.match(/⟁ ATOMIC_BLOCK_DATABASE_RLHF ⟁\s*\n\s*@shard_id:\s*"([^"]+)"[\s\S]*?@sample_data:\s*(\[[^\]]*\{[\s\S]*?\}\s*\])/);

    if (rlhfDbMatch) {
      try {
        const sampleDataJson = rlhfDbMatch[2];
        const sampleData = JSON.parse(sampleDataJson);

        // Extract categories
        const categoriesMatch = khlSource.match(/@categories:\s*(\[[^\]]*\])/);
        const categories = categoriesMatch ? JSON.parse(categoriesMatch[1]) : [];

        manifest.cms_rlhf = {
          shard_id: rlhfDbMatch[1],
          sample_data: sampleData,
          categories: categories
        };

        console.log('⟁ CMS RLHF Database extracted:', sampleData.length, 'cases');
      } catch (e) {
        console.warn('⟁ Failed to parse CMS RLHF database:', e);
      }
    }

    // Extract Site Content from ATOMIC_BLOCK_SITE_CONTENT
    const siteContentMatch = khlSource.match(/⟁ ATOMIC_BLOCK_SITE_CONTENT ⟁\s*\n\s*@shard_id:\s*"([^"]+)"[\s\S]*?@pages:\s*(\{[\s\S]*?\n\s{4}\})/);

    if (siteContentMatch) {
      try {
        // Extract pages section
        const pagesStart = khlSource.indexOf('@pages: {', khlSource.indexOf('ATOMIC_BLOCK_SITE_CONTENT'));
        const pagesEnd = khlSource.indexOf('\n    }\n\n    /* ==================================================', pagesStart);
        const pagesJson = khlSource.substring(pagesStart + 8, pagesEnd + 6);
        const pages = JSON.parse(pagesJson);

        // Extract components section
        const componentsStart = khlSource.indexOf('@components: {', pagesEnd);
        const componentsEnd = khlSource.indexOf('\n    }\n\n    /* ==================================================', componentsStart);
        const componentsJson = khlSource.substring(componentsStart + 13, componentsEnd + 6);
        const components = JSON.parse(componentsJson);

        // Extract assets section
        const assetsStart = khlSource.indexOf('@assets: {', componentsEnd);
        const assetsEnd = khlSource.indexOf('\n    }\n\n    /* ==================================================', assetsStart);
        const assetsJson = khlSource.substring(assetsStart + 9, assetsEnd + 6);
        const assets = JSON.parse(assetsJson);

        // Extract tapes_rest section
        const tapesRestStart = khlSource.indexOf('@tapes_rest: {', assetsEnd);
        const tapesRestEnd = khlSource.indexOf('\n    }\n\n  ⟁ Xul ⟁', tapesRestStart);
        const tapesRestJson = khlSource.substring(tapesRestStart + 13, tapesRestEnd + 6);
        const tapesRest = JSON.parse(tapesRestJson);

        manifest.site_content = {
          shard_id: siteContentMatch[1],
          pages: pages,
          components: components,
          assets: assets,
          tapes_rest: tapesRest
        };

        console.log('⟁ Site Content Database extracted:', {
          pages: Object.keys(pages).length,
          components: Object.keys(components).length,
          assets: Object.keys(assets).length,
          tapes: Object.keys(tapesRest).length
        });
      } catch (e) {
        console.warn('⟁ Failed to parse Site Content database:', e);
      }
    }

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
  const path = url.pathname;
  const method = event.request.method;

  // Local REST API bypass (FOLDS architecture)
  if (path.startsWith('/local/api')) {
    event.respondWith(handleLocalRestApi(event.request));
    return;
  }

  // RLHF Forum CMS shard routes
  if (path.startsWith('/cms/rlhf/')) {
    event.respondWith(handleCmsRlhfRequest(event.request));
    return;
  }

  // Check if this is a REST mesh route
  const route = manifest?.rest_mesh?.routes?.[path];

  if (route) {
    event.respondWith(handleRestMeshRoute(url, event.request, route));
  } else {
    event.respondWith(handleStaticAsset(event.request));
  }
});

/* ============================================================
   LOCAL REST API HANDLER (FOLDS Architecture)
   ============================================================ */

async function handleLocalRestApi(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  try {
    const fold = FOLDS["local_rest"];

    // Remove fold mount from path for pattern matching
    const relativePath = path.replace(fold.mount, '');

    // Parse route and extract parameters
    const parsed = parseFoldRoute(fold, method, relativePath);

    if (!parsed) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Route not found',
        path: path,
        method: method,
        available_routes: Object.keys(fold.routes)
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'X-Fold': 'local_rest',
          'X-Kernel': 'sw.khl Ω.∞.Ω'
        }
      });
    }

    // Parse request body if present
    let reqBody = null;
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      try {
        reqBody = await request.json();
      } catch (e) {
        reqBody = null;
      }
    }

    // Build REST request object
    const restRequest = {
      method: method,
      path: path,
      query: Object.fromEntries(url.searchParams),
      body: reqBody,
      headers: Object.fromEntries(request.headers),
      auth: {}, // Future: SecuroLink/JWT validation goes here
      params: parsed.params,
      handler: parsed.handler
    };

    // Dispatch to fold
    const response = await fold.dispatch(restRequest);

    return new Response(JSON.stringify(response.body, null, 2), {
      status: response.status || 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Fold': 'local_rest',
        'X-Handler': parsed.handler,
        'X-Kernel': 'sw.khl Ω.∞.Ω',
        'X-Law': manifest?.atomic_law || 'ASX'
      }
    });

  } catch (error) {
    console.error('⟁ Local REST API error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: error.message,
      stack: error.stack,
      path: path,
      method: method
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Fold': 'local_rest'
      }
    });
  }
}

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
   CMS RLHF FORUM HANDLER
   ============================================================ */

async function handleCmsRlhfRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const query = Object.fromEntries(url.searchParams.entries());

  let body = null;
  if (method === 'POST') {
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  const payload = {
    '@kernel': 'kuhul',
    '@app': 'cms_rlhf_forum_v2',
    '@route': mapPathToRlhfRoute(path, method),
    '@method': method,
    '@query': query,
    '@body': body
  };

  const kernelResult = await self.__KUHUL_KERNEL_EXEC__(payload, 'sw.js');

  return new Response(kernelResult.body || JSON.stringify({ status: 'error' }), {
    status: kernelResult.status || 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

function mapPathToRlhfRoute(path, method) {
  if (method === 'GET' && path === '/cms/rlhf/list') return 'cms_rlhf_list';
  if (method === 'GET' && path === '/cms/rlhf/get') return 'cms_rlhf_get';
  if (method === 'GET' && path === '/cms/rlhf/search') return 'cms_rlhf_search';
  if (method === 'GET' && path === '/cms/rlhf/stats') return 'cms_rlhf_stats';
  if (method === 'POST' && path === '/cms/rlhf/post') return 'cms_rlhf_post';
  if (method === 'POST' && path === '/cms/rlhf/update_score') return 'cms_rlhf_update_score';
  return 'cms_rlhf_list'; // default fallback
}

/* ============================================================
   K'UHUL KERNEL EXECUTOR
   Bridge to C@@L BLOCK functions in sw.khl ROM
   ============================================================ */

self.__KUHUL_KERNEL_EXEC__ = async function(payload, caller) {
  const route = payload['@route'];
  const query = payload['@query'] || {};
  const body = payload['@body'] || {};

  console.log('⟁ K\'UHUL EXEC:', route, 'from', caller);

  try {
    let result;

    switch (route) {
      // CMS RLHF Routes
      case 'cms_rlhf_list': {
        const label = query.label || null;
        const limit = parseInt(query.limit) || 50;
        const offset = parseInt(query.offset) || 0;

        // Simulate C@@L BLOCK execution: cms_rlhf_list
        // In real implementation, this would execute the K'UHUL code
        // For now, we directly access the embedded manifest data

        const allCases = manifest?.cms_rlhf?.sample_data || [];
        let filteredCases = allCases;

        if (label) {
          filteredCases = allCases.filter(c => c.label === label);
        }

        const paginated = filteredCases.slice(offset, offset + limit);

        result = {
          ok: true,
          mode: 'list',
          shard: 'cms_rlhf_forum_v2',
          items: paginated,
          total: filteredCases.length
        };
        break;
      }

      case 'cms_rlhf_get': {
        const caseId = query.id;
        const allCases = manifest?.cms_rlhf?.sample_data || [];
        const found = allCases.find(c => c.case_id === caseId);

        if (found) {
          result = {
            ok: true,
            mode: 'get',
            item: found
          };
        } else {
          result = {
            ok: false,
            error: 'Case not found',
            case_id: caseId
          };
        }
        break;
      }

      case 'cms_rlhf_post': {
        // Create new RLHF case
        const newCase = {
          case_id: `rlhf_${Date.now()}`,
          title: body.title || 'Untitled',
          label: body.label || 'General Discussion',
          author: body.author || 'anonymous',
          body: body.body || '',
          snippet: (body.body || '').substring(0, 150),
          created_at: Date.now(),
          updated_at: Date.now(),
          comment_count: 0,
          score: 0,
          metadata: body.metadata || {}
        };

        // Store in MX2DB
        MX2DB.rlhf_traces.set(newCase.case_id, newCase);

        result = {
          ok: true,
          mode: 'post',
          case_id: newCase.case_id,
          message: 'RLHF case created'
        };
        break;
      }

      case 'cms_rlhf_search': {
        const searchQuery = query.q || '';
        const allCases = manifest?.cms_rlhf?.sample_data || [];

        // Simple tokenization and search
        const tokens = searchQuery.toLowerCase().split(/\s+/);
        const matches = allCases.filter(c => {
          const searchText = `${c.title} ${c.body} ${c.label}`.toLowerCase();
          return tokens.some(token => searchText.includes(token));
        });

        result = {
          ok: true,
          mode: 'search',
          query: searchQuery,
          items: matches,
          count: matches.length
        };
        break;
      }

      case 'cms_rlhf_stats': {
        const allCases = manifest?.cms_rlhf?.sample_data || [];
        const categories = manifest?.cms_rlhf?.categories || [];

        const categoryStats = {};
        categories.forEach(cat => {
          categoryStats[cat] = allCases.filter(c => c.label === cat).length;
        });

        result = {
          ok: true,
          mode: 'stats',
          total_cases: allCases.length,
          categories: categoryStats,
          avg_score: allCases.reduce((sum, c) => sum + (c.score || 0), 0) / allCases.length
        };
        break;
      }

      case 'cms_rlhf_update_score': {
        const caseId = body.case_id;
        const newScore = body.score;

        // Try to find in MX2DB first
        const stored = MX2DB.rlhf_traces.get(caseId);
        if (stored) {
          stored.score = newScore;
          stored.updated_at = Date.now();
          MX2DB.rlhf_traces.set(caseId, stored);

          result = {
            ok: true,
            mode: 'update_score',
            case_id: caseId,
            new_score: newScore
          };
        } else {
          result = {
            ok: false,
            error: 'Case not found in MX2DB',
            case_id: caseId
          };
        }
        break;
      }

      // SITE CONTENT Routes
      case 'cms_page_get': {
        const pageId = query.id || query.page_id;
        const pages = manifest?.site_content?.pages || {};
        const pageData = pages[pageId];

        if (!pageData) {
          result = {
            ok: false,
            error: 'Page not found',
            page_id: pageId,
            available: Object.keys(pages)
          };
        } else {
          result = {
            ok: true,
            mode: 'page',
            '@id': pageData['@id'],
            '@type': pageData['@type'],
            '@control': pageData['@control'],
            '@variable': pageData['@variable'],
            content: pageData['@content'],
            route: pageData['@route']
          };
        }
        break;
      }

      case 'cms_component_get': {
        const componentId = query.id || query.component_id;
        const props = query.props ? JSON.parse(query.props) : {};
        const components = manifest?.site_content?.components || {};
        const componentData = components[componentId];

        if (!componentData) {
          result = {
            ok: false,
            error: 'Component not found',
            component_id: componentId,
            available: Object.keys(components)
          };
        } else {
          result = {
            ok: true,
            mode: 'component',
            '@id': componentData['@id'],
            '@type': componentData['@type'],
            '@control': componentData['@control'],
            '@variable': {...componentData['@variable'], ...props},
            content: componentData['@content'],
            route: componentData['@route']
          };
        }
        break;
      }

      case 'cms_tape_get': {
        const tapeId = query.id || query.tape_id;
        const tapeManifest = manifest?.tapes?.[tapeId];
        const tapeRest = manifest?.site_content?.tapes_rest?.[tapeId];

        if (!tapeManifest) {
          result = {
            ok: false,
            error: 'Tape not found',
            tape_id: tapeId,
            available: Object.keys(manifest?.tapes || {})
          };
        } else {
          result = {
            ok: true,
            mode: 'tape',
            '@id': tapeManifest.id,
            '@type': 'tape',
            '@control': tapeRest ? tapeRest['@control'] : ['@boot', '@execute'],
            '@variable': {
              label: tapeManifest.label,
              role: tapeManifest.role,
              entry: tapeManifest.entry,
              boot: tapeManifest.boot,
              agents: tapeManifest.agents,
              shards: tapeManifest.shards,
              ...(tapeRest ? tapeRest['@variable'] : {})
            },
            route: tapeRest ? tapeRest['@route'] : `/site/tape/${tapeId}`,
            manifest: tapeManifest
          };
        }
        break;
      }

      case 'cms_asset_get': {
        const assetId = query.id || query.asset_id;
        const assets = manifest?.site_content?.assets || {};
        const assetData = assets[assetId];

        if (!assetData) {
          result = {
            ok: false,
            error: 'Asset not found',
            asset_id: assetId,
            available: Object.keys(assets)
          };
        } else {
          result = {
            ok: true,
            mode: 'asset',
            '@id': assetData['@id'],
            '@type': assetData['@type'],
            '@control': assetData['@control'],
            '@variable': assetData['@variable'],
            content: assetData['@content'],
            mime: assetData['@variable'].mime,
            cache_duration: assetData['@variable'].cache_duration || 3600
          };
        }
        break;
      }

      case 'cms_site_map': {
        const pages = manifest?.site_content?.pages || {};
        const components = manifest?.site_content?.components || {};
        const assets = manifest?.site_content?.assets || {};
        const tapesRest = manifest?.site_content?.tapes_rest || {};

        const pageRoutes = Object.keys(pages).map(id => ({
          id: id,
          route: pages[id]['@route'],
          title: pages[id]['@variable'].title
        }));

        const componentRoutes = Object.keys(components).map(id => ({
          id: id,
          route: components[id]['@route']
        }));

        const tapeRoutes = Object.keys(tapesRest).map(id => ({
          id: id,
          route: tapesRest[id]['@route']
        }));

        result = {
          ok: true,
          mode: 'site_map',
          pages: pageRoutes,
          components: componentRoutes,
          assets: Object.keys(assets),
          tapes: tapeRoutes,
          total_routes: pageRoutes.length + componentRoutes.length + tapeRoutes.length + Object.keys(assets).length
        };
        break;
      }

      case 'cms_atomic_search': {
        const searchQuery = query.q || '';
        const typeFilter = query.type || null;
        const queryLower = searchQuery.toLowerCase();
        const results = [];

        // Search pages
        if (!typeFilter || typeFilter === 'page') {
          const pages = manifest?.site_content?.pages || {};
          Object.values(pages).forEach(page => {
            const searchable = `${page['@variable'].title} ${page['@variable'].description || ''}`;
            if (searchable.toLowerCase().includes(queryLower)) {
              results.push({
                type: 'page',
                id: page['@id'],
                route: page['@route'],
                title: page['@variable'].title,
                description: page['@variable'].description
              });
            }
          });
        }

        // Search components
        if (!typeFilter || typeFilter === 'component') {
          const components = manifest?.site_content?.components || {};
          Object.values(components).forEach(component => {
            if (component['@id'].includes(queryLower)) {
              results.push({
                type: 'component',
                id: component['@id'],
                route: component['@route']
              });
            }
          });
        }

        // Search tapes
        if (!typeFilter || typeFilter === 'tape') {
          const tapes = manifest?.tapes || {};
          Object.values(tapes).forEach(tape => {
            if (tape.label.toLowerCase().includes(queryLower) || tape.role.toLowerCase().includes(queryLower)) {
              results.push({
                type: 'tape',
                id: tape.id,
                label: tape.label,
                role: tape.role
              });
            }
          });
        }

        result = {
          ok: true,
          mode: 'search',
          query: searchQuery,
          results: results,
          count: results.length
        };
        break;
      }

      // LOCAL REST API Fold Aliases
      case 'cms_get_page': {
        // Alias for cms_page_get - supports slug-based lookup
        const slug = query.slug || query.id || query.page_id;
        const pages = manifest?.site_content?.pages || {};

        // Try direct lookup first, then search by slug
        let pageData = pages[slug];
        if (!pageData) {
          // Search by slug in @route
          pageData = Object.values(pages).find(p =>
            p['@route'] === `/${slug}` ||
            p['@route'] === slug ||
            p['@id'] === slug
          );
        }

        if (!pageData) {
          result = {
            ok: false,
            error: 'Page not found',
            slug: slug,
            available: Object.keys(pages)
          };
        } else {
          result = {
            ok: true,
            mode: 'page',
            '@id': pageData['@id'],
            '@type': pageData['@type'],
            '@control': pageData['@control'],
            '@variable': pageData['@variable'],
            content: pageData['@content'],
            route: pageData['@route']
          };
        }
        break;
      }

      case 'cms_get_feed': {
        // Get feed/tape content by name
        const feedName = query.name || query.feed_name;
        const tapes = manifest?.site_content?.tapes_rest || {};

        let feedData = tapes[feedName];
        if (!feedData) {
          // Try searching by label
          feedData = Object.values(manifest?.tapes || {}).find(t =>
            t.label === feedName ||
            t.id === feedName
          );
        }

        if (!feedData) {
          result = {
            ok: false,
            error: 'Feed not found',
            feed_name: feedName,
            available: Object.keys(tapes)
          };
        } else {
          result = {
            ok: true,
            mode: 'feed',
            feed_name: feedName,
            feed_data: feedData
          };
        }
        break;
      }

      // GENERIC MX2DB REST API Routes
      case 'db_list_rows': {
        const table = query.table || query.table_name;
        const limit = parseInt(query.limit) || 100;
        const offset = parseInt(query.offset) || 0;

        // Query MX2DB table
        const dbTable = MX2DB[table];
        if (!dbTable) {
          result = {
            ok: false,
            error: 'Table not found',
            table: table,
            available: Object.keys(MX2DB)
          };
        } else {
          const allRows = Array.from(dbTable.values());
          const rows = allRows.slice(offset, offset + limit);

          result = {
            ok: true,
            mode: 'db_list',
            table: table,
            rows: rows,
            count: rows.length,
            total: allRows.length,
            limit: limit,
            offset: offset
          };
        }
        break;
      }

      case 'db_get_row': {
        const table = query.table || query.table_name;
        const id = query.id || query.row_id;

        const dbTable = MX2DB[table];
        if (!dbTable) {
          result = {
            ok: false,
            error: 'Table not found',
            table: table
          };
        } else {
          const row = dbTable.get(id);
          if (!row) {
            result = {
              ok: false,
              error: 'Row not found',
              table: table,
              id: id
            };
          } else {
            result = {
              ok: true,
              mode: 'db_get',
              table: table,
              row: row
            };
          }
        }
        break;
      }

      case 'db_insert_row': {
        const table = body.table || body.table_name;
        const data = body.data || body;

        const dbTable = MX2DB[table];
        if (!dbTable) {
          result = {
            ok: false,
            error: 'Table not found',
            table: table
          };
        } else {
          const id = `${table}_${Date.now()}`;
          const enriched = {
            ...data,
            id: id,
            created_at: Date.now(),
            updated_at: Date.now()
          };

          dbTable.set(id, enriched);

          result = {
            ok: true,
            mode: 'db_insert',
            table: table,
            row: enriched,
            id: id
          };
        }
        break;
      }

      case 'db_update_row': {
        const table = body.table || body.table_name;
        const id = body.id || body.row_id;
        const patch = body.patch || body.data;

        const dbTable = MX2DB[table];
        if (!dbTable) {
          result = {
            ok: false,
            error: 'Table not found',
            table: table
          };
        } else {
          const existing = dbTable.get(id);
          if (!existing) {
            result = {
              ok: false,
              error: 'Row not found',
              table: table,
              id: id
            };
          } else {
            const updated = {
              ...existing,
              ...patch,
              updated_at: Date.now()
            };

            dbTable.set(id, updated);

            result = {
              ok: true,
              mode: 'db_update',
              table: table,
              row: updated
            };
          }
        }
        break;
      }

      case 'db_delete_row': {
        const table = body.table || body.table_name || query.table;
        const id = body.id || body.row_id || query.id;

        const dbTable = MX2DB[table];
        if (!dbTable) {
          result = {
            ok: false,
            error: 'Table not found',
            table: table
          };
        } else {
          const deleted = dbTable.delete(id);
          if (!deleted) {
            result = {
              ok: false,
              error: 'Row not found',
              table: table,
              id: id
            };
          } else {
            result = {
              ok: true,
              mode: 'db_delete',
              table: table,
              id: id,
              deleted: true
            };
          }
        }
        break;
      }

      // HEALTH & META Routes
      case 'health_check_extended': {
        const folds = Object.keys(manifest?.kuhul_folds || {});
        const tapes = Object.keys(manifest?.tapes || {});

        result = {
          ok: true,
          kernel: 'sw.khl Ω.∞.Ω',
          law: manifest?.atomic_law,
          quantum_state: manifest?.quantum_state,
          status: 'active',
          subsystems: {
            folds: folds.length,
            tapes: tapes.length,
            os_state: ASX_RAM.get('os.state'),
            boot_count: ASX_RAM.get('os.boot.count')
          },
          uptime: performance.now(),
          timestamp: Date.now()
        };
        break;
      }

      case 'meta_routes': {
        const routes = manifest?.rest_mesh?.routes || {};
        const routeCatalog = Object.keys(routes).map(path => ({
          path: path,
          fold: routes[path].fold,
          handler: routes[path].handler,
          method: 'GET/POST/PUT/DELETE'
        }));

        result = {
          ok: true,
          mode: 'meta_routes',
          mount: manifest?.rest_mesh?.base || '/',
          routes: routeCatalog,
          count: routeCatalog.length
        };
        break;
      }

      // FEED IMPORTER Routes
      case 'feed_import': {
        const feedUrl = query.url || body.feed_url;
        const feedType = query.type || body.feed_type || 'rss';

        // Fetch and parse feed (simplified implementation)
        try {
          const response = await fetch(feedUrl);
          const feedXml = await response.text();

          // Parse based on type (basic implementation)
          const entries = [];
          // In real implementation, parse XML to extract entries
          // For now, return placeholder

          result = {
            ok: true,
            mode: 'feed_import',
            feed_url: feedUrl,
            feed_type: feedType,
            entries_found: entries.length,
            entries_imported: 0,
            message: 'Feed import stub - implement XML parsing'
          };
        } catch (error) {
          result = {
            ok: false,
            error: 'Feed import failed',
            feed_url: feedUrl,
            message: error.message
          };
        }
        break;
      }

      case 'feed_sync': {
        const feeds = manifest?.feeds || [];

        result = {
          ok: true,
          mode: 'feed_sync',
          feeds_synced: feeds.length,
          results: [],
          timestamp: Date.now(),
          message: 'Feed sync stub - implement batch import'
        };
        break;
      }

      // MESH COORDINATION Routes
      case 'mesh_ping': {
        result = {
          ok: true,
          mode: 'mesh_ping',
          node_id: 'local_browser_node',
          kernel: 'sw.khl Ω.∞.Ω',
          quantum_state: manifest?.quantum_state,
          os_state: ASX_RAM.get('os.state'),
          role: 'API_RUNTIME',
          capabilities: [
            'cms_delivery',
            'rlhf_storage',
            'mx2db_query',
            'feed_import',
            'offline_operation'
          ],
          timestamp: Date.now()
        };
        break;
      }

      case 'mesh_register': {
        const endpoint = query.endpoint || body.mesh_endpoint;

        result = {
          ok: true,
          mode: 'mesh_register',
          registered: true,
          mesh_endpoint: endpoint,
          node_id: 'local_browser_node',
          message: 'Mesh registration stub - implement network coordination'
        };
        break;
      }

      default:
        result = {
          ok: false,
          error: 'Unknown K\'UHUL route',
          route: route
        };
    }

    return {
      status: result.ok ? 200 : 400,
      body: JSON.stringify(result, null, 2)
    };

  } catch (error) {
    console.error('⟁ K\'UHUL EXEC ERROR:', error);
    return {
      status: 500,
      body: JSON.stringify({
        ok: false,
        error: error.message,
        stack: error.stack
      })
    };
  }
};

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
