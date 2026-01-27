/**
 * MX2⟁☣ Service Worker
 *
 * THE ONLY PLACE WHERE JAVASCRIPT LIVES
 *
 * Responsibilities:
 * - Fetch interception
 * - Cache management
 * - IDB bridge
 * - GAS shard routing
 * - State ↔ CSS var bridging
 *
 * NOT Responsibilities:
 * - UI rendering (CSS does this)
 * - State ownership (Atomic Blocks do this)
 * - Business logic (K'UHUL π does this)
 */

const CACHE_NAME = 'mx2-atomic-v1';
const IDB_NAME = 'mx2-state';
const IDB_VERSION = 1;

// ============================================
// INDEXED DB OPERATIONS
// ============================================

let db = null;

async function openDB() {
  if (db) return db;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains('state')) {
        database.createObjectStore('state');
      }
    };
  });
}

async function idbGet(key) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('state', 'readonly');
    const store = tx.objectStore('state');
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function idbPut(key, value) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('state', 'readwrite');
    const store = tx.objectStore('state');
    const request = store.put(value, key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============================================
// STATE ↔ CSS BRIDGING
// ============================================

function applyStateToCSS(state, client) {
  // Send state to client for CSS var application
  client.postMessage({
    type: 'APPLY_STATE',
    state: state
  });
}

function applyAttrsToDOM(attrs, client) {
  // Send data-* attrs to client for DOM application
  client.postMessage({
    type: 'APPLY_ATTRS',
    attrs: attrs
  });
}

// ============================================
// K'UHUL π BRIDGE
// ============================================

// K'UHUL π runtime loaded from core.pi
// This is a minimal JS interpreter for π functions
const PI_RUNTIME = {
  functions: {},

  register(name, fn) {
    this.functions[name] = fn;
  },

  async run(fnName, state, ...args) {
    const fn = this.functions[fnName];
    if (!fn) {
      console.warn(`π function not found: ${fnName}`);
      return state;
    }
    return fn(state, ...args);
  }
};

// Register core π functions (compiled from core.pi)
PI_RUNTIME.register('counter.inc', (state) => {
  state['--mode'] = 'acting';
  state['--count'] = (state['--count'] || 0) + 1;
  state['--entropy'] = Math.min(1, (state['--entropy'] || 0) + 0.05);
  return PI_RUNTIME.functions['counter.derive'](state);
});

PI_RUNTIME.register('counter.dec', (state) => {
  state['--mode'] = 'acting';
  state['--count'] = (state['--count'] || 0) - 1;
  state['--entropy'] = Math.max(0, (state['--entropy'] || 0) - 0.05);
  return PI_RUNTIME.functions['counter.derive'](state);
});

PI_RUNTIME.register('counter.derive', (state) => {
  const e = Math.max(0, Math.min(1, state['--entropy'] || 0));
  state['--level'] = e > 0.7 ? 'danger' : e > 0.35 ? 'warn' : 'ok';
  return state;
});

PI_RUNTIME.register('counter.reset', (state) => {
  state['--count'] = 0;
  state['--mode'] = 'idle';
  state['--entropy'] = 0.10;
  return PI_RUNTIME.functions['counter.derive'](state);
});

// ============================================
// GAS SHARD ROUTING
// ============================================

const SHARDS = {
  foreman: '[YOUR_FOREMAN_SHARD_URL]',
  frontend: '[YOUR_FRONTEND_SHARD_URL]',
  storage: '[YOUR_STORAGE_SHARD_URL]',
  inference: '[YOUR_INFERENCE_SHARD_URL]'
};

async function routeToShard(shardName, intent, payload) {
  const url = SHARDS[shardName];
  if (!url || url.startsWith('[')) {
    console.warn(`Shard not configured: ${shardName}`);
    return { '@ok': false, '@error': 'SHARD_NOT_CONFIGURED' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        '@ast': 'mx2',
        '@intent': intent,
        '@payload': payload
      })
    });
    return response.json();
  } catch (error) {
    return { '@ok': false, '@error': error.message };
  }
}

// ============================================
// CONTROL VECTOR DISPATCH
// ============================================

async function dispatch(control, state, params = {}) {
  // Parse control vector
  if (control['@pi']) {
    // K'UHUL π function
    return PI_RUNTIME.run(control['@pi'], state, ...Object.values(params));
  }

  if (control['@io']) {
    // I/O operation
    switch (control['@io']) {
      case 'idb.get':
        const loaded = await idbGet(control['@key']);
        return loaded || state;
      case 'idb.put':
        await idbPut(control['@key'], state);
        return state;
    }
  }

  if (control['@gas']) {
    // GAS shard call
    const result = await routeToShard(
      control['@shard'] || 'foreman',
      control['@gas'],
      { state, ...params }
    );
    if (result['@ok'] && result['@state']) {
      return { ...state, ...result['@state'] };
    }
    return state;
  }

  return state;
}

// ============================================
// MESSAGE HANDLING FROM CLIENT
// ============================================

self.addEventListener('message', async (event) => {
  const { type, control, state, params, atomicBlock } = event.data;
  const client = event.source;

  switch (type) {
    case 'DISPATCH':
      // Execute control vector
      const controlDef = atomicBlock['@control'][control];
      if (controlDef) {
        const newState = await dispatch(controlDef, state, params);
        applyStateToCSS(newState, client);

        // Apply data-* attrs if defined
        if (atomicBlock['@css']?.attrs) {
          const attrs = {};
          for (const [selector, mapping] of Object.entries(atomicBlock['@css'].attrs)) {
            attrs[selector] = {};
            for (const [attr, varName] of Object.entries(mapping)) {
              attrs[selector][attr] = newState[varName];
            }
          }
          applyAttrsToDOM(attrs, client);
        }
      }
      break;

    case 'BOOT':
      // Execute @flow.@boot sequence
      let bootState = state;
      const bootFlow = atomicBlock['@flow']?.['@boot'] || [];
      for (const controlName of bootFlow) {
        const controlDef = atomicBlock['@control'][controlName];
        if (controlDef) {
          bootState = await dispatch(controlDef, bootState, {});
        }
      }
      applyStateToCSS(bootState, client);
      break;

    case 'LOAD_ATOMIC':
      // Load atomic block from URL or cache
      // Return to client for reference
      client.postMessage({
        type: 'ATOMIC_LOADED',
        atomicBlock: atomicBlock
      });
      break;
  }
});

// ============================================
// FETCH INTERCEPTION
// ============================================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Route /api/* to GAS shards
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRoute(event.request, url));
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    })
  );
});

async function handleAPIRoute(request, url) {
  // Parse route and map to shard
  const path = url.pathname.replace('/api/', '');
  const segments = path.split('/');
  const shardName = segments[0];
  const intent = segments.slice(1).join('.');

  let payload = {};
  if (request.method === 'POST') {
    payload = await request.json();
  }

  const result = await routeToShard(shardName, intent, payload);

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// ============================================
// INSTALL & ACTIVATE
// ============================================

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});
