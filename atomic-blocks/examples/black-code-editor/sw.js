/**
 * MX2 SERVICE WORKER
 * THE ONLY JAVASCRIPT RUNTIME
 *
 * sw.js is the ONLY place where JavaScript lives.
 * It handles:
 * - I/O (fetch, IDB, postMessage)
 * - Event bridging (DOM events → control vectors)
 * - State → CSS variable application
 * - GAS shard communication
 *
 * IT DOES NOT:
 * - Own state (Atomic Block owns state)
 * - Render UI (CSS owns rendering)
 * - Compute logic (K'UHUL π owns computation)
 */

const CACHE_NAME = 'mx2-forge-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/atomic-glyph.css',
  '/glyphs.css'
];

// ============================================
// SERVICE WORKER LIFECYCLE
// ============================================

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});


// ============================================
// MESSAGE HANDLER (from main thread)
// ============================================

self.addEventListener('message', async (event) => {
  const { type, atomicBlock, state, control, params } = event.data;
  const client = await self.clients.get(event.source.id);

  switch (type) {
    case 'BOOT':
      await handleBoot(client, atomicBlock, state);
      break;

    case 'DISPATCH':
      await handleDispatch(client, atomicBlock, state, control, params);
      break;
  }
});


// ============================================
// BOOT HANDLER
// ============================================

async function handleBoot(client, atomicBlock, state) {
  // Restore state from IDB if available
  const savedState = await idbGet('editor_state');
  const mergedState = { ...state, ...(savedState || {}) };

  // Derive computed values
  const derivedState = await runPi('editor.derive', mergedState);

  // Apply state to client
  applyState(client, derivedState, atomicBlock);

  // Check shard status
  const shardStatus = await checkShards(atomicBlock['@mx2lex']?.api || {});
  const finalState = { ...derivedState, ...shardStatus };

  applyState(client, finalState, atomicBlock);
}


// ============================================
// DISPATCH HANDLER
// ============================================

async function handleDispatch(client, atomicBlock, state, control, params) {
  const controlDef = atomicBlock['@control']?.[control];
  if (!controlDef) {
    console.warn(`Unknown control: ${control}`);
    return;
  }

  let newState = { ...state };

  // Run K'UHUL π function if defined
  if (controlDef['@pi']) {
    newState = await runPi(controlDef['@pi'], newState, params);
  }

  // Run I/O operation if defined
  if (controlDef['@io']) {
    await runIO(controlDef['@io'], controlDef['@key'], newState);
  }

  // Call GAS shard if defined
  if (controlDef['@gas']) {
    const gasResult = await callGAS(controlDef['@gas'], newState, atomicBlock);
    if (gasResult) {
      newState = { ...newState, ...gasResult };
    }
  }

  // Run follow-up control if defined
  if (controlDef['@then']) {
    await handleDispatch(client, atomicBlock, newState, controlDef['@then'], params);
    return;
  }

  // Derive computed values
  newState = await runPi('editor.derive', newState);

  // Apply state to client
  applyState(client, newState, atomicBlock);
}


// ============================================
// K'UHUL π RUNTIME (Pure Functions)
// ============================================

const PI_FUNCTIONS = {
  'editor.derive': (state) => {
    // Compute level from entropy
    const e = clamp(parseFloat(state['--entropy']) || 0, 0, 1);
    const level = e > 0.7 ? 'danger' : e > 0.35 ? 'warn' : 'ok';
    return { ...state, '--level': level };
  },

  'editor.select_tape': (state, params) => {
    return { ...state, '--active-tape': params.target, '--mode': 'acting' };
  },

  'editor.select_file': (state, params) => {
    return { ...state, '--active-file': params.file, '--mode': 'acting' };
  },

  'editor.toggle_sidebar': (state) => {
    const collapsed = parseInt(state['--sidebar-collapsed']) || 0;
    return { ...state, '--sidebar-collapsed': collapsed ? 0 : 1 };
  },

  'editor.theme_cycle': (state) => {
    const themes = ['dark-glass', 'light-clean', 'neon-purple'];
    const current = state['--theme'] || 'dark-glass';
    const idx = themes.indexOf(current);
    const next = themes[(idx + 1) % themes.length];
    return { ...state, '--theme': next };
  },

  'editor.apply_theme': (state, params) => {
    return { ...state, '--theme': params.theme };
  },

  'editor.save': (state) => {
    return { ...state, '--mode': 'saving', '--file-modified': 0 };
  },

  'editor.run': (state) => {
    const e = clamp((parseFloat(state['--entropy']) || 0) + 0.15, 0, 1);
    return { ...state, '--mode': 'running', '--entropy': e };
  },

  'editor.format': (state) => {
    return { ...state, '--mode': 'acting' };
  },

  'preview.refresh': (state) => {
    return { ...state, '--mode': 'acting' };
  },

  'preview.toggle_responsive': (state) => {
    return { ...state, '--mode': 'acting' };
  },

  'ast.set_mode': (state, params) => {
    return { ...state, '--ast-mode': params.astMode };
  },

  'terminal.exec': (state, params) => {
    console.log('Terminal command:', params.command);
    return { ...state, '--mode': 'acting' };
  },

  'settings.update': (state, params) => {
    const key = `--${params.setting}`;
    return { ...state, [key]: params.value };
  },

  'settings.toggle': (state, params) => {
    const key = `--${params.setting}`;
    const current = parseInt(state[key]) || 0;
    return { ...state, [key]: current ? 0 : 1 };
  },

  'shards.update_status': (state, params) => {
    return { ...state, ...params };
  }
};

async function runPi(fnName, state, params = {}) {
  const fn = PI_FUNCTIONS[fnName];
  if (!fn) {
    console.warn(`Unknown π function: ${fnName}`);
    return state;
  }
  return fn(state, params);
}


// ============================================
// I/O OPERATIONS
// ============================================

async function runIO(op, key, state) {
  switch (op) {
    case 'idb.put':
      await idbPut(key, state);
      break;
    case 'idb.get':
      return await idbGet(key);
  }
}


// ============================================
// GAS SHARD COMMUNICATION
// ============================================

async function callGAS(intent, state, atomicBlock) {
  const api = atomicBlock['@mx2lex']?.api || {};
  const [shard] = intent.split('.');
  const url = api[shard];

  if (!url) {
    console.warn(`No API URL for shard: ${shard}`);
    return null;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        '@ast': 'mx2',
        '@intent': intent,
        '@payload': state
      })
    });

    const result = await response.json();
    return result['@ok'] ? result['@result'] : null;
  } catch (error) {
    console.error(`GAS call failed: ${intent}`, error);
    return null;
  }
}

async function checkShards(api) {
  const status = {};

  for (const [shard, url] of Object.entries(api)) {
    try {
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      status[`--shard-${shard}`] = data['@ok'] ? 'online' : 'offline';
    } catch {
      status[`--shard-${shard}`] = 'offline';
    }
  }

  return status;
}


// ============================================
// STATE → CSS APPLICATION
// ============================================

function applyState(client, state, atomicBlock) {
  if (!client) return;

  // Send state as CSS vars
  client.postMessage({
    type: 'APPLY_STATE',
    state: state
  });

  // Build attribute map from @css.attrs
  const cssConfig = atomicBlock['@css'] || {};
  const attrs = {};

  if (cssConfig.attrs) {
    for (const [selector, attrMap] of Object.entries(cssConfig.attrs)) {
      attrs[selector] = {};
      for (const [attr, varName] of Object.entries(attrMap)) {
        attrs[selector][attr] = state[varName] ?? '';
      }
    }
  }

  if (Object.keys(attrs).length > 0) {
    client.postMessage({
      type: 'APPLY_ATTRS',
      attrs: attrs
    });
  }

  // Build text content map from @css.text
  const text = {};
  if (cssConfig.text) {
    for (const [selector, varName] of Object.entries(cssConfig.text)) {
      text[selector] = String(state[varName] ?? '');
    }
  }

  if (Object.keys(text).length > 0) {
    client.postMessage({
      type: 'APPLY_TEXT',
      text: text
    });
  }
}


// ============================================
// INDEXED DB HELPERS
// ============================================

const DB_NAME = 'mx2_forge';
const DB_VERSION = 1;
const STORE_NAME = 'state';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function idbPut(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(value, key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}


// ============================================
// UTILITIES
// ============================================

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
