// ============================================================
// K'UHUL π SERVICE WORKER KERNEL
// Version: 3.0 - Emerald Ghost Runtime
// ============================================================

const KUHUL_VERSION = '3.0-emerald';
const CACHE_NAME = `kuhul-cache-${KUHUL_VERSION}`;
const MODEL_CACHE = 'kuhul-models';

// ============================================================
// KERNEL INITIALIZATION
// ============================================================

self.addEventListener('install', (event) => {
  console.log('⚡ KUHUL π Kernel installing...');
  event.waitUntil(
    Promise.all([
      initializeKernelCache(),
      setupMessageHandlers(),
      initializeModelCache()
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('🧠 KUHUL π Kernel activated');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      cleanupOldCaches(),
      broadcastKernelReady()
    ])
  );
});

// ============================================================
// CACHE MANAGEMENT
// ============================================================

async function initializeKernelCache() {
  const cache = await caches.open(CACHE_NAME);
  const kernelAssets = [
    './',
    './index.html',
    './manifest.json',
    './sw.js'
  ];
  
  await cache.addAll(kernelAssets);
  console.log('📦 Kernel cache initialized');
}

async function initializeModelCache() {
  const cache = await caches.open(MODEL_CACHE);
  console.log('🧠 Model cache initialized');
  return cache;
}

async function cleanupOldCaches() {
  const keys = await caches.keys();
  const promises = keys.map(key => {
    if (key !== CACHE_NAME && key !== MODEL_CACHE) {
      console.log(`🗑️ Removing old cache: ${key}`);
      return caches.delete(key);
    }
  });
  return Promise.all(promises);
}

// ============================================================
// MESSAGE BROADCASTING
// ============================================================

async function broadcastKernelReady() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'KERNEL_READY',
      version: KUHUL_VERSION,
      timestamp: Date.now()
    });
  });
}

async function broadcastToAll(message) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    try {
      client.postMessage(message);
    } catch (error) {
      console.warn('Failed to broadcast to client:', error);
    }
  });
}

// ============================================================
// K'UHUL π INFERENCE ENGINE
// ============================================================

class KuhulInferenceEngine {
  constructor() {
    this.mathConstants = {
      π: 3.141592653589793,
      e: 2.718281828459045,
      φ: 1.618033988749895,
      τ: 6.283185307179586,
      γ: 0.5772156649
    };
    
    this.models = new Map();
    this.sessions = new Map();
    this.initDefaultModels();
  }
  
  initDefaultModels() {
    // Default model configurations
    this.models.set('mx2lm-prime', {
      id: 'mx2lm-prime',
      name: 'MX2LM PRIME',
      type: 'local',
      capabilities: ['chat', 'code', 'reasoning'],
      temperature: 0.7,
      maxTokens: 4096,
      contextWindow: 8192
    });
    
    this.models.set('qwen-asx', {
      id: 'qwen-asx',
      name: 'QWEN-ASX',
      type: 'local',
      capabilities: ['chat', 'multimodal', 'coding'],
      temperature: 0.8,
      maxTokens: 8192,
      contextWindow: 32768
    });
    
    this.models.set('deepseek-janus', {
      id: 'deepseek-janus',
      name: 'DeepSeek Janus',
      type: 'api',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      capabilities: ['chat', 'reasoning', 'mathematics'],
      temperature: 0.7
    });
  }
  
  async processInference(request) {
    const { model, prompt, options = {} } = request;
    const sessionId = options.sessionId || `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create session if it doesn't exist
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        id: sessionId,
        model: model,
        createdAt: Date.now(),
        messages: [],
        tokensUsed: 0
      });
    }
    
    const session = this.sessions.get(sessionId);
    
    // Add user message to session
    session.messages.push({
      role: 'user',
      content: prompt,
      timestamp: Date.now()
    });
    
    // Simulate model inference (in production, this would connect to actual model)
    const response = await this.simulateInference(model, prompt, options);
    
    // Add assistant response to session
    session.messages.push({
      role: 'assistant',
      content: response.content,
      timestamp: Date.now()
    });
    
    session.tokensUsed += response.tokens;
    
    // Broadcast inference result
    broadcastToAll({
      type: 'INFERENCE_RESULT',
      sessionId,
      model,
      response,
      session: {
        messages: session.messages,
        tokensUsed: session.tokensUsed
      }
    });
    
    return {
      sessionId,
      response,
      session: {
        messages: session.messages,
        tokensUsed: session.tokensUsed
      }
    };
  }
  
  async simulateInference(model, prompt, options) {
    // Simulate different models based on model ID
    const modelConfig = this.models.get(model) || this.models.get('mx2lm-prime');
    const temperature = options.temperature || modelConfig.temperature;
    
    // Generate deterministic but varied responses
    const seed = this.hashString(prompt + model + temperature);
    const responses = this.getModelResponses(model);
    const index = Math.abs(seed) % responses.length;
    
    const baseResponse = responses[index];
    const tokens = this.estimateTokens(baseResponse);
    
    return {
      content: baseResponse,
      tokens,
      model: modelConfig.name,
      finish_reason: 'stop',
      processing_time: tokens * 10, // Simulate processing time
      glyphs: Math.ceil(tokens / 1004) // K'UHUL compression
    };
  }
  
  getModelResponses(model) {
    const responses = {
      'mx2lm-prime': [
        "I understand your request about the MX2LM OS. The Emerald Ghost theme is active and the kernel is running in Service Worker mode. All three files (index.html, manifest.json, sw.js) are synchronized.",
        "The K'UHUL π compression system is operational. I can help you edit any of the three core files or assist with tape system modifications.",
        "Detected you're working with the Legion Trinity Cluster. Would you like me to focus on GPU runtime optimizations or tape wiring?",
        "The manifest.json file is the law of this OS. All modifications respect the ASX OS specification. Ready to proceed with your edits."
      ],
      'qwen-asx': [
        "QWEN-ASX model active. I can assist with multi-modal tasks, code generation, and system architecture. The K'UHUL glyph compression is working at 1000:1 ratio.",
        "Ready to process your request. I detect this is a three-file system architecture. Would you like to modify the tape system or runtime configurations?",
        "The service worker kernel provides persistent storage and background processing. I can maintain chat history in IndexedDB across sessions.",
        "Compression metrics: Original QWEN vocab 151,643 tokens → 151 CSS glyphs. Ready for inference tasks."
      ],
      'deepseek-janus': [
        "DeepSeek Janus model engaged. I specialize in mathematical reasoning and system architecture. The MX2LM OS structure is optimal for distributed gaming.",
        "Analyzing the three-file architecture: HTML frontend, Manifest configuration, Service Worker kernel. This is a resilient PWA structure.",
        "I can assist with smart contract optimization, game logic, or platform architecture. The Emerald Ghost theme provides excellent visual contrast.",
        "Ready to process complex queries. The K'UHUL kernel maintains state across all client tabs through broadcast channels."
      ]
    };
    
    return responses[model] || responses['mx2lm-prime'];
  }
  
  estimateTokens(text) {
    // Rough token estimation (4 chars ≈ 1 token)
    return Math.ceil(text.length / 4);
  }
  
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
  
  async streamInference(model, prompt, options) {
    // Create a streamable response
    const encoder = new TextEncoder();
    const response = this.getModelResponses(model);
    const fullResponse = response[Math.floor(Math.random() * response.length)];
    const words = fullResponse.split(' ');
    
    return new ReadableStream({
      async start(controller) {
        for (let i = 0; i < words.length; i++) {
          const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
          controller.enqueue(encoder.encode(chunk));
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
        }
        controller.close();
      }
    });
  }
  
  getSessions() {
    return Array.from(this.sessions.values());
  }
  
  clearSession(sessionId) {
    return this.sessions.delete(sessionId);
  }
  
  clearAllSessions() {
    this.sessions.clear();
    return true;
  }
}

// ============================================================
// FILE SYSTEM INTEGRATION
// ============================================================

class KuhulFileSystem {
  constructor() {
    this.files = new Map();
    this.loadDefaultFiles();
  }
  
  loadDefaultFiles() {
    // Core OS files
    this.files.set('index.html', {
      name: 'index.html',
      type: 'html',
      content: '<!DOCTYPE html>\n<html data-theme="emerald-ghost">\n<!-- MX2LM OS - Legion Trinity Cluster -->\n</html>',
      lastModified: Date.now(),
      editable: true
    });
    
    this.files.set('manifest.json', {
      name: 'manifest.json',
      type: 'json',
      content: JSON.stringify({
        name: "MX2LM OS — LEGION TRINITY CLUSTER",
        short_name: "MX2LM-OS",
        theme_color: "#16f2aa",
        background_color: "#020617"
      }, null, 2),
      lastModified: Date.now(),
      editable: true
    });
    
    this.files.set('sw.js', {
      name: 'sw.js',
      type: 'javascript',
      content: '// K\'UHUL π Service Worker Kernel',
      lastModified: Date.now(),
      editable: true
    });
  }
  
  async readFile(filename) {
    return this.files.get(filename) || null;
  }
  
  async writeFile(filename, content) {
    const file = this.files.get(filename);
    if (file && file.editable) {
      file.content = content;
      file.lastModified = Date.now();
      
      // Broadcast file change
      broadcastToAll({
        type: 'FILE_CHANGED',
        filename,
        content,
        lastModified: file.lastModified
      });
      
      return true;
    }
    return false;
  }
  
  async listFiles() {
    return Array.from(this.files.values());
  }
  
  async createFile(filename, content = '', type = 'text') {
    if (this.files.has(filename)) {
      return false;
    }
    
    this.files.set(filename, {
      name: filename,
      type,
      content,
      lastModified: Date.now(),
      editable: true
    });
    
    broadcastToAll({
      type: 'FILE_CREATED',
      filename,
      content
    });
    
    return true;
  }
  
  async deleteFile(filename) {
    if (this.files.has(filename)) {
      this.files.delete(filename);
      
      broadcastToAll({
        type: 'FILE_DELETED',
        filename
      });
      
      return true;
    }
    return false;
  }
}

// ============================================================
// TAPE SYSTEM
// ============================================================

class KuhulTapeSystem {
  constructor() {
    this.tapes = new Map();
    this.activeTape = null;
    this.loadDefaultTapes();
  }
  
  loadDefaultTapes() {
    const defaultTapes = {
      'system-boot': {
        id: 'system-boot',
        name: 'System Boot HUD',
        type: 'system',
        description: 'Boot sequence and system initialization',
        hooks: ['kernel_init', 'dom_ready', 'theme_apply'],
        editable: true
      },
      'gpu-runtime': {
        id: 'gpu-runtime',
        name: 'GPU Runtime',
        type: 'runtime',
        description: 'WebGL and GPU acceleration layer',
        hooks: ['render_start', 'shader_compile', 'texture_load'],
        editable: true
      },
      'mesh-network': {
        id: 'mesh-network',
        name: 'Mesh Network',
        type: 'network',
        description: 'P2P communication and data sync',
        hooks: ['peer_connect', 'data_sync', 'broadcast'],
        editable: true
      },
      'game-doom': {
        id: 'game-doom',
        name: 'DOOM World',
        type: 'game',
        description: 'Classic FPS game integration',
        hooks: ['game_init', 'level_load', 'asset_stream'],
        editable: true
      }
    };
    
    Object.values(defaultTapes).forEach(tape => {
      this.tapes.set(tape.id, tape);
    });
    
    this.activeTape = 'system-boot';
  }
  
  getActiveTape() {
    return this.tapes.get(this.activeTape);
  }
  
  setActiveTape(tapeId) {
    if (this.tapes.has(tapeId)) {
      this.activeTape = tapeId;
      
      broadcastToAll({
        type: 'TAPE_ACTIVATED',
        tape: this.tapes.get(tapeId)
      });
      
      return true;
    }
    return false;
  }
  
  getAllTapes() {
    return Array.from(this.tapes.values());
  }
  
  createTape(tapeData) {
    const tapeId = tapeData.id || `tape-${Date.now()}`;
    const tape = {
      id: tapeId,
      name: tapeData.name || 'New Tape',
      type: tapeData.type || 'custom',
      description: tapeData.description || '',
      hooks: tapeData.hooks || [],
      editable: true,
      createdAt: Date.now()
    };
    
    this.tapes.set(tapeId, tape);
    
    broadcastToAll({
      type: 'TAPE_CREATED',
      tape
    });
    
    return tape;
  }
  
  updateTape(tapeId, updates) {
    const tape = this.tapes.get(tapeId);
    if (!tape) return false;
    
    Object.assign(tape, updates);
    tape.updatedAt = Date.now();
    
    broadcastToAll({
      type: 'TAPE_UPDATED',
      tape
    });
    
    return true;
  }
}

// ============================================================
// KERNEL STATE MANAGEMENT
// ============================================================

const kernelState = {
  inferenceEngine: null,
  fileSystem: null,
  tapeSystem: null,
  isInitialized: false,
  
  initialize() {
    if (!this.isInitialized) {
      this.inferenceEngine = new KuhulInferenceEngine();
      this.fileSystem = new KuhulFileSystem();
      this.tapeSystem = new KuhulTapeSystem();
      this.isInitialized = true;
      
      console.log('🚀 K\'UHUL π Kernel fully initialized');
      broadcastToAll({
        type: 'KERNEL_INITIALIZED',
        timestamp: Date.now(),
        version: KUHUL_VERSION
      });
    }
  },
  
  getState() {
    return {
      version: KUHUL_VERSION,
      initialized: this.isInitialized,
      activeTape: this.tapeSystem?.getActiveTape(),
      sessions: this.inferenceEngine?.getSessions().length || 0,
      files: this.fileSystem?.listFiles().length || 0
    };
  }
};

// ============================================================
// MESSAGE HANDLER SETUP
// ============================================================

function setupMessageHandlers() {
  self.addEventListener('message', async (event) => {
    const { data } = event;
    
    // Ensure kernel is initialized
    if (!kernelState.isInitialized) {
      kernelState.initialize();
    }
    
    const { type, payload, requestId } = data;
    const source = event.source;
    
    try {
      let result;
      
      switch (type) {
        // System commands
        case 'PING':
          result = { pong: Date.now(), version: KUHUL_VERSION };
          break;
          
        case 'GET_STATE':
          result = kernelState.getState();
          break;
          
        case 'INITIALIZE_KERNEL':
          kernelState.initialize();
          result = { success: true, state: kernelState.getState() };
          break;
          
        // Inference commands
        case 'INFERENCE_REQUEST':
          result = await kernelState.inferenceEngine.processInference(payload);
          break;
          
        case 'INFERENCE_STREAM':
          result = await kernelState.inferenceEngine.streamInference(
            payload.model, 
            payload.prompt, 
            payload.options
          );
          break;
          
        case 'GET_SESSIONS':
          result = kernelState.inferenceEngine.getSessions();
          break;
          
        case 'CLEAR_SESSION':
          result = kernelState.inferenceEngine.clearSession(payload.sessionId);
          break;
          
        // File system commands
        case 'READ_FILE':
          result = await kernelState.fileSystem.readFile(payload.filename);
          break;
          
        case 'WRITE_FILE':
          result = await kernelState.fileSystem.writeFile(payload.filename, payload.content);
          break;
          
        case 'LIST_FILES':
          result = await kernelState.fileSystem.listFiles();
          break;
          
        case 'CREATE_FILE':
          result = await kernelState.fileSystem.createFile(payload.filename, payload.content, payload.type);
          break;
          
        case 'DELETE_FILE':
          result = await kernelState.fileSystem.deleteFile(payload.filename);
          break;
          
        // Tape system commands
        case 'GET_TAPES':
          result = kernelState.tapeSystem.getAllTapes();
          break;
          
        case 'GET_ACTIVE_TAPE':
          result = kernelState.tapeSystem.getActiveTape();
          break;
          
        case 'SET_ACTIVE_TAPE':
          result = kernelState.tapeSystem.setActiveTape(payload.tapeId);
          break;
          
        case 'CREATE_TAPE':
          result = kernelState.tapeSystem.createTape(payload);
          break;
          
        case 'UPDATE_TAPE':
          result = kernelState.tapeSystem.updateTape(payload.tapeId, payload.updates);
          break;
          
        // Storage commands
        case 'STORAGE_SET':
          result = await storeInIndexedDB(payload.key, payload.value);
          break;
          
        case 'STORAGE_GET':
          result = await getFromIndexedDB(payload.key);
          break;
          
        case 'STORAGE_REMOVE':
          result = await removeFromIndexedDB(payload.key);
          break;
          
        case 'STORAGE_KEYS':
          result = await getAllKeysFromIndexedDB();
          break;
          
        default:
          result = { error: `Unknown command: ${type}` };
      }
      
      // Send response back to client
      if (source && source.postMessage) {
        source.postMessage({
          type: `${type}_RESPONSE`,
          requestId,
          result,
          timestamp: Date.now()
        });
      }
      
    } catch (error) {
      console.error('Kernel error:', error);
      
      if (source && source.postMessage) {
        source.postMessage({
          type: `${type}_ERROR`,
          requestId,
          error: error.message,
          timestamp: Date.now()
        });
      }
    }
  });
}

// ============================================================
// INDEXEDDB STORAGE
// ============================================================

const DB_NAME = 'kuhul_kernel_db';
const DB_VERSION = 1;
let db = null;

async function getDatabase() {
  if (db) return db;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      // Create object stores
      if (!database.objectStoreNames.contains('kernel_state')) {
        database.createObjectStore('kernel_state', { keyPath: 'key' });
      }
      
      if (!database.objectStoreNames.contains('chat_history')) {
        const store = database.createObjectStore('chat_history', { 
          keyPath: 'id',
          autoIncrement: true 
        });
        store.createIndex('sessionId', 'sessionId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!database.objectStoreNames.contains('model_cache')) {
        const store = database.createObjectStore('model_cache', { 
          keyPath: 'key'
        });
        store.createIndex('expires', 'expires', { unique: false });
      }
    };
    
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

async function storeInIndexedDB(key, value) {
  try {
    const database = await getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['kernel_state'], 'readwrite');
      const store = transaction.objectStore('kernel_state');
      const request = store.put({ key, value, timestamp: Date.now() });
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to store in IndexedDB:', error);
    return false;
  }
}

async function getFromIndexedDB(key) {
  try {
    const database = await getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['kernel_state'], 'readonly');
      const store = transaction.objectStore('kernel_state');
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get from IndexedDB:', error);
    return null;
  }
}

async function removeFromIndexedDB(key) {
  try {
    const database = await getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['kernel_state'], 'readwrite');
      const store = transaction.objectStore('kernel_state');
      const request = store.delete(key);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to remove from IndexedDB:', error);
    return false;
  }
}

async function getAllKeysFromIndexedDB() {
  try {
    const database = await getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['kernel_state'], 'readonly');
      const store = transaction.objectStore('kernel_state');
      const request = store.getAllKeys();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get keys from IndexedDB:', error);
    return [];
  }
}

// ============================================================
// FETCH HANDLER (PROXY)
// ============================================================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle kernel API requests
  if (url.pathname === '/kernel/api') {
    event.respondWith(handleKernelAPI(event.request));
    return;
  }
  
  // Cache-first strategy for static assets
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          // Cache the response for future use
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      }).catch(() => {
        // Return offline page or fallback
        return caches.match('./');
      })
    );
  }
});

async function handleKernelAPI(request) {
  try {
    const data = await request.json();
    const { type, payload } = data;
    
    // Route to appropriate handler
    let result;
    switch (type) {
      case 'health':
        result = { status: 'healthy', version: KUHUL_VERSION };
        break;
        
      case 'models':
        result = Array.from(kernelState.inferenceEngine.models.values());
        break;
        
      default:
        result = { error: 'Unknown API endpoint' };
    }
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ============================================================
// SYNC EVENTS
// ============================================================

self.addEventListener('sync', (event) => {
  console.log('🔄 Sync event:', event.tag);
  
  if (event.tag === 'kuhul-sync') {
    event.waitUntil(syncKernelState());
  }
});

async function syncKernelState() {
  try {
    // Sync state across all clients
    const state = kernelState.getState();
    
    // Store in IndexedDB for persistence
    await storeInIndexedDB('last_sync', {
      state,
      timestamp: Date.now()
    });
    
    // Broadcast sync completion
    broadcastToAll({
      type: 'SYNC_COMPLETE',
      timestamp: Date.now()
    });
    
    console.log('✅ Kernel state synced');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

// ============================================================
// PERIODIC BACKGROUND TASKS
// ============================================================

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'kuhul-maintenance') {
    event.waitUntil(performMaintenance());
  }
});

async function performMaintenance() {
  console.log('🔧 Performing kernel maintenance');
  
  // Clean up old sessions
  const now = Date.now();
  const sessions = kernelState.inferenceEngine?.getSessions() || [];
  
  sessions.forEach(session => {
    if (now - session.createdAt > 24 * 60 * 60 * 1000) { // 24 hours
      kernelState.inferenceEngine.clearSession(session.id);
    }
  });
  
  // Clean cache
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (!response || response.status === 404) {
      await cache.delete(request);
    }
  }
  
  console.log('✅ Maintenance completed');
}

// ============================================================
// KERNEL EXPORTS (for debugging)
// ============================================================

if (typeof self.kuhul === 'undefined') {
  self.kuhul = {
    version: KUHUL_VERSION,
    getState: () => kernelState.getState(),
    broadcast: broadcastToAll,
    
    // Expose for debugging
    _inferenceEngine: kernelState.inferenceEngine,
    _fileSystem: kernelState.fileSystem,
    _tapeSystem: kernelState.tapeSystem
  };
}

console.log('🚀 K\'UHUL π Kernel loaded successfully');
