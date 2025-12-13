// ============================================================
// K'UHUL π SERVICE WORKER KERNEL - MX2LM GHOST OS INTEGRATION
// Version: 3.2.1-emerald-ghost
// XJSON Context: xjson://asxr/mx2lm/ghost_os/v1
// ============================================================

// Import manifest
importScripts('./manifest.json');

const KUHUL_VERSION = '3.2.1-emerald-ghost';
const CACHE_NAME = `mx2lm-cache-${KUHUL_VERSION}`;
const MODEL_CACHE = 'mx2lm-models';

// Global kernel state
let manifest = null;
let kernelState = null;

// ============================================================
// KERNEL BOOT SEQUENCE
// ============================================================

self.addEventListener('install', (event) => {
  console.log('⚡ MX2LM Ghost OS Kernel installing...');
  event.waitUntil(
    Promise.all([
      loadManifest(),
      initializeKernelCache(),
      setupRuntimeMode(),
      registerXCFEVectors()
    ]).then(() => {
      console.log('✅ Kernel installation complete');
      return self.skipWaiting();
    }).catch(error => {
      console.error('❌ Kernel installation failed:', error);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🧠 MX2LM Ghost OS Kernel activated');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      cleanupOldCaches(),
      initializeKernelState(),
      broadcastKernelReady()
    ])
  );
});

// ============================================================
// MANIFEST LOADING & VALIDATION
// ============================================================

async function loadManifest() {
  try {
    const response = await fetch('./manifest.json');
    manifest = await response.json();
    
    // Validate manifest structure
    if (!manifest['@context']?.includes('asxr/mx2lm/ghost_os')) {
      throw new Error('Invalid manifest: Missing MX2LM Ghost OS context');
    }
    
    console.log('📜 Manifest loaded:', manifest.name, 'v' + manifest['@v']);
    return manifest;
  } catch (error) {
    console.error('Failed to load manifest:', error);
    
    // Fallback manifest
    manifest = {
      '@context': 'xjson://asxr/mx2lm/ghost_os/v1',
      '@v': '3.2.1',
      name: 'MX2LM OS (Fallback)',
      runtime_modes: {
        stealth: { default: true }
      }
    };
    
    return manifest;
  }
}

function getRuntimeMode() {
  // Default to stealth mode
  return manifest?.runtime_modes?.stealth?.default ? 'stealth' : 'safe';
}

async function setupRuntimeMode() {
  const mode = getRuntimeMode();
  console.log(`⚙️ Runtime mode: ${mode}`);
  
  // Apply runtime constraints
  if (mode === 'stealth') {
    // Disable certain APIs in stealth mode
    self.addEventListener('fetch', applyStealthConstraints);
  }
  
  return mode;
}

function applyStealthConstraints(event) {
  const url = new URL(event.request.url);
  
  // Block external requests in stealth mode
  if (manifest?.runtime_modes?.stealth?.constraints?.external_requests === false) {
    if (!url.hostname.includes(location.hostname) && 
        !url.hostname.includes('localhost')) {
      event.respondWith(new Response('', { status: 403 }));
      return;
    }
  }
}

// ============================================================
// XCFE VECTOR REGISTRATION
// ============================================================

async function registerXCFEVectors() {
  if (!manifest?.xcfe?.control_vectors) {
    console.log('⚠️ No XCFE vectors defined in manifest');
    return;
  }
  
  const vectors = manifest.xcfe.control_vectors;
  console.log('🎮 Registering XCFE vectors:', vectors);
  
  // Create XCFE engine
  self.xcfe = {
    vectors: new Map(),
    state: new Map(),
    
    register(vector, handler) {
      this.vectors.set(vector, handler);
    },
    
    async dispatch(vector, data) {
      const handler = this.vectors.get(vector);
      if (handler) {
        return handler(data);
      }
      console.warn(`No handler for XCFE vector: ${vector}`);
      return null;
    },
    
    setState(key, value) {
      this.state.set(key, value);
      this.broadcastState();
    },
    
    broadcastState() {
      broadcastToAll({
        type: 'XCFE_STATE_UPDATE',
        state: Object.fromEntries(this.state)
      });
    }
  };
  
  // Register default vectors
  vectors.forEach(vector => {
    switch(vector) {
      case '@if_then_else':
        self.xcfe.register('@if_then_else', handleIfThenElse);
        break;
      case '@loop':
        self.xcfe.register('@loop', handleLoop);
        break;
      case '@dispatch':
        self.xcfe.register('@dispatch', handleDispatch);
        break;
      case '@microagent':
        self.xcfe.register('@microagent', handleMicroagent);
        break;
    }
  });
  
  // Initialize variable vectors
  if (manifest.xcfe.variable_vectors) {
    manifest.xcfe.variable_vectors.forEach(variable => {
      self.xcfe.setState(variable.replace('@', ''), null);
    });
  }
}

// XCFE Vector Handlers
async function handleIfThenElse(data) {
  const { condition, then, otherwise } = data;
  const result = await evaluateCondition(condition);
  return result ? then : otherwise;
}

async function handleLoop(data) {
  const { count, action } = data;
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(await executeAction(action, i));
  }
  return results;
}

async function handleDispatch(data) {
  const { target, payload } = data;
  
  // Dispatch based on target
  switch(target) {
    case 'tape':
      return await dispatchToTape(payload);
    case 'panel':
      return await dispatchToPanel(payload);
    case 'mesh':
      return await dispatchToMesh(payload);
    default:
      return await kernelState?.handleDispatch?.(target, payload) || null;
  }
}

async function handleMicroagent(data) {
  const { id, role, task } = data;
  
  // Create microagent instance
  const agent = {
    id,
    role,
    task,
    status: 'pending',
    createdAt: Date.now()
  };
  
  // Store in kernel state
  if (kernelState?.agents) {
    kernelState.agents.set(id, agent);
  }
  
  // Execute task
  try {
    agent.status = 'running';
    const result = await executeTask(task);
    agent.status = 'completed';
    agent.result = result;
    agent.completedAt = Date.now();
    
    // Update XCFE state
    self.xcfe.setState('agent_status', agent.status);
    self.xcfe.setState('task_completion', 'complete');
    
    return result;
  } catch (error) {
    agent.status = 'failed';
    agent.error = error.message;
    throw error;
  }
}

// ============================================================
// TAPE SYSTEM INTEGRATION
// ============================================================

class MX2LMTapeSystem {
  constructor() {
    this.tapes = new Map();
    this.activeTape = null;
    this.panels = new Map();
    this.loadFromManifest();
  }
  
  loadFromManifest() {
    // Load panels
    if (manifest?.panels) {
      Object.entries(manifest.panels).forEach(([id, panel]) => {
        this.panels.set(id, {
          id,
          ...panel,
          state: 'inactive'
        });
      });
    }
    
    // Load tapes
    if (manifest?.tapes) {
      Object.entries(manifest.tapes).forEach(([id, tape]) => {
        this.tapes.set(id, {
          id,
          ...tape,
          state: 'loaded',
          activatedAt: null
        });
      });
      
      // Set default tape
      const defaultTape = Object.values(manifest.tapes).find(t => t.type === 'dashboard');
      if (defaultTape) {
        this.setActiveTape(defaultTape.id);
      }
    }
  }
  
  getActiveTape() {
    return this.activeTape ? this.tapes.get(this.activeTape) : null;
  }
  
  setActiveTape(tapeId) {
    if (!this.tapes.has(tapeId)) {
      throw new Error(`Tape not found: ${tapeId}`);
    }
    
    const previousTape = this.activeTape;
    this.activeTape = tapeId;
    
    const tape = this.tapes.get(tapeId);
    tape.state = 'active';
    tape.activatedAt = Date.now();
    
    // Deactivate previous tape
    if (previousTape && previousTape !== tapeId) {
      const prev = this.tapes.get(previousTape);
      prev.state = 'loaded';
    }
    
    // Activate panels for this tape
    this.activatePanels(tape.panels || []);
    
    // Broadcast tape change
    broadcastToAll({
      type: 'TAPE_ACTIVATED',
      tape: this.serializeTape(tape),
      previousTape
    });
    
    return tape;
  }
  
  activatePanels(panelIds) {
    // Deactivate all panels first
    this.panels.forEach(panel => {
      panel.state = 'inactive';
    });
    
    // Activate specified panels
    panelIds.forEach(panelId => {
      const panel = this.panels.get(panelId);
      if (panel) {
        panel.state = 'active';
        panel.activatedAt = Date.now();
      }
    });
    
    // Broadcast panel state
    broadcastToAll({
      type: 'PANELS_UPDATED',
      panels: Array.from(this.panels.values()).map(p => ({
        id: p.id,
        state: p.state,
        label: p.label
      }))
    });
  }
  
  serializeTape(tape) {
    return {
      id: tape.id,
      type: tape.type,
      label: tape.label,
      description: tape.description,
      panels: tape.panels || [],
      ghost: tape.ghost || false,
      layout: tape.layout
    };
  }
  
  getAllTapes() {
    return Array.from(this.tapes.values()).map(t => this.serializeTape(t));
  }
  
  createTape(tapeData) {
    const tapeId = tapeData.id || `tape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const tape = {
      id: tapeId,
      type: tapeData.type || 'custom',
      label: tapeData.label || 'New Tape',
      description: tapeData.description || '',
      panels: tapeData.panels || [],
      ghost: tapeData.ghost !== false,
      layout: tapeData.layout || 'default',
      state: 'loaded',
      createdAt: Date.now(),
      custom: true
    };
    
    this.tapes.set(tapeId, tape);
    
    broadcastToAll({
      type: 'TAPE_CREATED',
      tape: this.serializeTape(tape)
    });
    
    return tape;
  }
  
  async dispatchToTape(tapeId, action, payload) {
    const tape = this.tapes.get(tapeId);
    if (!tape) {
      throw new Error(`Tape not found: ${tapeId}`);
    }
    
    switch(action) {
      case 'activate':
        return this.setActiveTape(tapeId);
      
      case 'configure':
        Object.assign(tape, payload);
        tape.updatedAt = Date.now();
        broadcastToAll({
          type: 'TAPE_UPDATED',
          tape: this.serializeTape(tape)
        });
        return tape;
      
      case 'execute':
        // Tape-specific execution logic
        return await this.executeTapeCommand(tape, payload);
      
      default:
        throw new Error(`Unknown tape action: ${action}`);
    }
  }
  
  async executeTapeCommand(tape, command) {
    switch(tape.type) {
      case 'dashboard':
        return await this.executeDashboardCommand(tape, command);
      case 'studio':
        return await this.executeStudioCommand(tape, command);
      default:
        return { executed: true, tape: tape.id, command };
    }
  }
  
  async executeDashboardCommand(tape, command) {
    const { action, data } = command;
    
    switch(action) {
      case 'refresh':
        // Refresh dashboard data
        return {
          success: true,
          message: 'Dashboard refreshed',
          timestamp: Date.now()
        };
      
      case 'toggle_panel':
        // Toggle panel visibility
        return this.togglePanel(data.panelId, data.visible);
      
      default:
        return { executed: false, error: 'Unknown dashboard command' };
    }
  }
  
  async executeStudioCommand(tape, command) {
    const { studio, action, data } = command;
    
    switch(action) {
      case 'open_file':
        return await kernelState?.fileSystem?.readFile(data.filename) || null;
      
      case 'save_file':
        return await kernelState?.fileSystem?.writeFile(data.filename, data.content);
      
      case 'render_preview':
        // Generate preview for studio
        return {
          preview: 'data:image/svg+xml,...',
          timestamp: Date.now()
        };
      
      default:
        return { executed: false, error: 'Unknown studio command' };
    }
  }
  
  togglePanel(panelId, visible) {
    const panel = this.panels.get(panelId);
    if (!panel) return false;
    
    panel.state = visible ? 'active' : 'inactive';
    panel.updatedAt = Date.now();
    
    broadcastToAll({
      type: 'PANEL_TOGGLED',
      panelId,
      state: panel.state
    });
    
    return true;
  }
}

// ============================================================
// MESH NETWORK INTEGRATION
// ============================================================

class MX2LMMeshNetwork {
  constructor() {
    this.zones = new Map();
    this.connections = new Map();
    this.peers = new Set();
    this.loadFromManifest();
  }
  
  loadFromManifest() {
    if (manifest?.api?.mesh?.zones) {
      manifest.api.mesh.zones.forEach(zone => {
        this.zones.set(zone, {
          zone,
          active: false,
          connections: 0
        });
      });
    }
  }
  
  connectToZone(zone) {
    const zoneInfo = this.zones.get(zone);
    if (!zoneInfo) {
      throw new Error(`Unknown mesh zone: ${zone}`);
    }
    
    zoneInfo.active = true;
    zoneInfo.connections++;
    zoneInfo.connectedAt = Date.now();
    
    // Create connection
    const connectionId = `conn-${Date.now()}-${zone}`;
    const connection = {
      id: connectionId,
      zone,
      state: 'connected',
      connectedAt: Date.now(),
      messages: []
    };
    
    this.connections.set(connectionId, connection);
    
    // Broadcast connection
    broadcastToAll({
      type: 'MESH_CONNECTED',
      zone,
      connectionId
    });
    
    return connectionId;
  }
  
  disconnectFromZone(zone) {
    const zoneInfo = this.zones.get(zone);
    if (!zoneInfo) return false;
    
    zoneInfo.active = false;
    
    // Close all connections for this zone
    this.connections.forEach((conn, id) => {
      if (conn.zone === zone) {
        conn.state = 'disconnected';
        conn.disconnectedAt = Date.now();
      }
    });
    
    broadcastToAll({
      type: 'MESH_DISCONNECTED',
      zone
    });
    
    return true;
  }
  
  sendMessage(zone, message) {
    const zoneInfo = this.zones.get(zone);
    if (!zoneInfo?.active) {
      throw new Error(`Zone not active: ${zone}`);
    }
    
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      zone,
      message,
      timestamp: Date.now(),
      direction: 'outgoing'
    };
    
    // Store message
    this.connections.forEach(conn => {
      if (conn.zone === zone) {
        conn.messages.push(msg);
      }
    });
    
    // Broadcast message
    broadcastToAll({
      type: 'MESH_MESSAGE',
      ...msg
    });
    
    return msg.id;
  }
  
  getZoneStatus() {
    return Array.from(this.zones.values()).map(zone => ({
      zone: zone.zone,
      active: zone.active,
      connections: zone.connections
    }));
  }
  
  async dispatchToMesh(payload) {
    const { zone, action, data } = payload;
    
    switch(action) {
      case 'connect':
        return this.connectToZone(zone);
      
      case 'disconnect':
        return this.disconnectFromZone(zone);
      
      case 'send':
        return this.sendMessage(zone, data);
      
      case 'status':
        return this.getZoneStatus();
      
      default:
        throw new Error(`Unknown mesh action: ${action}`);
    }
  }
}

// ============================================================
// KERNEL STATE MANAGEMENT (Enhanced)
// ============================================================

async function initializeKernelState() {
  kernelState = {
    // Core systems
    tapeSystem: new MX2LMTapeSystem(),
    meshNetwork: new MX2LMMeshNetwork(),
    inferenceEngine: null,
    fileSystem: null,
    
    // RWLF system
    rlhf: {
      enabled: manifest?.rlhf?.enabled || false,
      mode: manifest?.rlhf?.mode || 'session',
      scores: new Map(),
      feedback: []
    },
    
    // ASX RAM
    asxRam: {
      volatile: manifest?.asx_ram?.volatile !== false,
      encrypted: manifest?.asx_ram?.encrypted !== false,
      data: new Map()
    },
    
    // Microagents
    agents: new Map(),
    
    // XCFE state
    xcfeState: new Map(),
    
    // Initialization timestamp
    initializedAt: Date.now(),
    version: KUHUL_VERSION,
    manifestVersion: manifest?.['@v']
  };
  
  // Initialize inference engine
  kernelState.inferenceEngine = createInferenceEngine();
  
  // Initialize file system
  kernelState.fileSystem = createFileSystem();
  
  console.log('🚀 MX2LM Ghost OS Kernel fully initialized');
  
  // Broadcast initialization
  broadcastToAll({
    type: 'KERNEL_INITIALIZED',
    timestamp: kernelState.initializedAt,
    version: KUHUL_VERSION,
    manifestVersion: manifest?.['@v'],
    runtimeMode: getRuntimeMode(),
    quantumState: manifest?.['@quantum_state']
  });
  
  return kernelState;
}

function createInferenceEngine() {
  // Create inference engine based on manifest
  return {
    models: new Map([
      ['mx2lm-prime', {
        id: 'mx2lm-prime',
        name: 'MX2LM PRIME',
        type: 'local',
        capabilities: ['chat', 'code', 'reasoning', 'os_control'],
        temperature: 0.7,
        contextWindow: 8192
      }],
      ['kuhul-ghost', {
        id: 'kuhul-ghost',
        name: 'K\'UHUL Ghost',
        type: 'local',
        capabilities: ['compression', 'encoding', 'mathematics'],
        temperature: 0.5,
        contextWindow: 4096
      }]
    ]),
    
    async process(prompt, options = {}) {
      const model = this.models.get(options.model || 'mx2lm-prime');
      if (!model) {
        throw new Error(`Model not found: ${options.model}`);
      }
      
      // Process with model
      return await this.simulateInference(model, prompt, options);
    },
    
    async simulateInference(model, prompt, options) {
      // Enhanced simulation with MX2LM context
      const responses = [
        `MX2LM Ghost OS v${manifest?.['@v'] || '3.2.1'} response: ${prompt}`,
        `K'UHUL π inference active. Runtime: ${getRuntimeMode()}. ${prompt}`,
        `Tape system integrated. Active tape: ${kernelState.tapeSystem.getActiveTape()?.label}. ${prompt}`,
        `XCFE vectors ready. ${prompt}`
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      const tokens = Math.ceil(response.length / 4);
      
      return {
        content: response,
        tokens,
        model: model.name,
        glyphs: Math.ceil(tokens / 1004),
        finish_reason: 'stop',
        processing_time: tokens * 8,
        metadata: {
          runtime: getRuntimeMode(),
          tape: kernelState.tapeSystem.getActiveTape()?.id
        }
      };
    }
  };
}

function createFileSystem() {
  return {
    files: new Map(),
    
    async readFile(filename) {
      return this.files.get(filename) || null;
    },
    
    async writeFile(filename, content) {
      const file = {
        name: filename,
        content,
        type: filename.split('.').pop(),
        lastModified: Date.now(),
        editable: true
      };
      
      this.files.set(filename, file);
      
      broadcastToAll({
        type: 'FILE_CHANGED',
        filename,
        content,
        lastModified: file.lastModified
      });
      
      return true;
    },
    
    async listFiles() {
      return Array.from(this.files.values());
    }
  };
}

// ============================================================
// CACHE MANAGEMENT
// ============================================================

async function initializeKernelCache() {
  const cache = await caches.open(CACHE_NAME);
  
  // Cache manifest-specified assets
  const assets = [
    './',
    './index.html',
    './manifest.json',
    './sw.js'
  ];
  
  // Add atomic CSS if specified
  if (manifest?.styles?.atomic_css) {
    assets.push(manifest.styles.atomic_css);
  }
  
  // Add icons
  if (manifest?.icons) {
    manifest.icons.forEach(icon => {
      if (icon.src) assets.push(icon.src);
    });
  }
  
  await cache.addAll(assets);
  console.log('📦 Kernel cache initialized with', assets.length, 'assets');
}

async function cleanupOldCaches() {
  const keys = await caches.keys();
  const promises = keys.map(key => {
    if (key !== CACHE_NAME && key !== MODEL_CACHE && !key.includes('mx2lm-cache-')) {
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
      manifestVersion: manifest?.['@v'],
      quantumState: manifest?.['@quantum_state'],
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
// MESSAGE HANDLER (Enhanced with Manifest Integration)
// ============================================================

function setupMessageHandlers() {
  self.addEventListener('message', async (event) => {
    const { data, source } = event;
    const { type, payload, requestId } = data;
    
    try {
      let result;
      
      switch(type) {
        // System commands
        case 'PING':
          result = {
            pong: Date.now(),
            version: KUHUL_VERSION,
            manifest: manifest?.name,
            quantumState: manifest?.['@quantum_state']
          };
          break;
          
        case 'GET_STATE':
          result = {
            kernel: {
              version: KUHUL_VERSION,
              initializedAt: kernelState?.initializedAt,
              runtimeMode: getRuntimeMode()
            },
            manifest: {
              name: manifest?.name,
              version: manifest?.['@v'],
              law: manifest?.law
            },
            tape: kernelState?.tapeSystem?.getActiveTape(),
            mesh: kernelState?.meshNetwork?.getZoneStatus()
          };
          break;
          
        // Tape system commands
        case 'GET_TAPES':
          result = kernelState?.tapeSystem?.getAllTapes() || [];
          break;
          
        case 'GET_ACTIVE_TAPE':
          result = kernelState?.tapeSystem?.getActiveTape();
          break;
          
        case 'SET_ACTIVE_TAPE':
          result = kernelState?.tapeSystem?.setActiveTape(payload.tapeId);
          break;
          
        case 'CREATE_TAPE':
          result = kernelState?.tapeSystem?.createTape(payload);
          break;
          
        case 'DISPATCH_TO_TAPE':
          result = await kernelState?.tapeSystem?.dispatchToTape(
            payload.tapeId,
            payload.action,
            payload.data
          );
          break;
          
        // Mesh network commands
        case 'MESH_CONNECT':
          result = kernelState?.meshNetwork?.connectToZone(payload.zone);
          break;
          
        case 'MESH_DISCONNECT':
          result = kernelState?.meshNetwork?.disconnectFromZone(payload.zone);
          break;
          
        case 'MESH_SEND':
          result = kernelState?.meshNetwork?.sendMessage(payload.zone, payload.message);
          break;
          
        case 'MESH_STATUS':
          result = kernelState?.meshNetwork?.getZoneStatus();
          break;
          
        // XCFE commands
        case 'XCFE_DISPATCH':
          if (self.xcfe) {
            result = await self.xcfe.dispatch(payload.vector, payload.data);
          } else {
            result = { error: 'XCFE not initialized' };
          }
          break;
          
        case 'XCFE_GET_STATE':
          if (self.xcfe) {
            result = Object.fromEntries(self.xcfe.state);
          } else {
            result = {};
          }
          break;
          
        // Inference commands
        case 'INFERENCE':
          result = await kernelState?.inferenceEngine?.process(payload.prompt, payload.options);
          break;
          
        // File system commands
        case 'READ_FILE':
          result = await kernelState?.fileSystem?.readFile(payload.filename);
          break;
          
        case 'WRITE_FILE':
          result = await kernelState?.fileSystem?.writeFile(payload.filename, payload.content);
          break;
          
        // RWLF commands
        case 'RLHF_SUBMIT':
          if (kernelState?.rlhf?.enabled) {
            kernelState.rlhf.feedback.push({
              ...payload,
              timestamp: Date.now()
            });
            result = { success: true, feedbackId: kernelState.rlhf.feedback.length - 1 };
          } else {
            result = { error: 'RLHF disabled' };
          }
          break;
          
        // ASX RAM commands
        case 'ASX_RAM_SET':
          if (kernelState?.asxRam) {
            kernelState.asxRam.data.set(payload.key, {
              value: payload.value,
              timestamp: Date.now()
            });
            result = true;
          } else {
            result = false;
          }
          break;
          
        case 'ASX_RAM_GET':
          if (kernelState?.asxRam) {
            const entry = kernelState.asxRam.data.get(payload.key);
            result = entry?.value || null;
          } else {
            result = null;
          }
          break;
          
        // Manifest commands
        case 'GET_MANIFEST':
          result = manifest;
          break;
          
        case 'UPDATE_MANIFEST':
          // Only allow certain updates
          if (payload.section === 'runtime_modes') {
            // Runtime mode updates
            result = { success: true, updated: payload.section };
          } else {
            result = { error: 'Cannot update that section' };
          }
          break;
          
        default:
          result = { error: `Unknown command: ${type}` };
      }
      
      // Send response
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
// FETCH HANDLER (Enhanced with Local REST API)
// ============================================================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle local REST API (from manifest)
  if (manifest?.api?.local_rest?.routes) {
    const routes = manifest.api.local_rest.routes;
    
    for (const [route, path] of Object.entries(routes)) {
      if (url.pathname === path) {
        event.respondWith(handleLocalAPI(route, event.request));
        return;
      }
    }
  }
  
  // Handle mesh zones
  if (manifest?.api?.mesh?.zones) {
    const zones = manifest.api.mesh.zones;
    for (const zone of zones) {
      const zonePrefix = zone.replace('://', '');
      if (url.pathname.startsWith(`/${zonePrefix}/`)) {
        event.respondWith(handleMeshRequest(zone, url, event.request));
        return;
      }
    }
  }
  
  // Default: cache-first strategy
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          // Cache the response
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      }).catch(() => {
        // Fallback to offline page
        return caches.match('./');
      })
    );
  }
});

async function handleLocalAPI(route, request) {
  try {
    let result;
    
    switch(route) {
      case 'orchestrate':
        const data = await request.json();
        result = await handleOrchestration(data);
        break;
        
      case 'tapes':
        result = kernelState?.tapeSystem?.getAllTapes() || [];
        break;
        
      case 'manifest':
        result = manifest;
        break;
        
      case 'chat':
        const chatData = await request.json();
        result = await kernelState?.inferenceEngine?.process(
          chatData.prompt,
          chatData.options
        );
        break;
        
      default:
        result = { error: 'Unknown API route' };
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

async function handleOrchestration(data) {
  // Orchestrate multiple systems
  const { actions } = data;
  const results = [];
  
  for (const action of actions) {
    try {
      switch(action.type) {
        case 'tape':
          const tapeResult = await kernelState.tapeSystem.dispatchToTape(
            action.tapeId,
            action.action,
            action.data
          );
          results.push({ type: 'tape', result: tapeResult });
          break;
          
        case 'mesh':
          const meshResult = await kernelState.meshNetwork.dispatchToMesh(action);
          results.push({ type: 'mesh', result: meshResult });
          break;
          
        case 'inference':
          const inferenceResult = await kernelState.inferenceEngine.process(
            action.prompt,
            action.options
          );
          results.push({ type: 'inference', result: inferenceResult });
          break;
          
        default:
          results.push({ type: action.type, error: 'Unknown action type' });
      }
    } catch (error) {
      results.push({ type: action.type, error: error.message });
    }
  }
  
  return { results, timestamp: Date.now() };
}

async function handleMeshRequest(zone, url, request) {
  // Handle mesh zone requests
  const path = url.pathname.split('/').slice(2).join('/');
  
  return new Response(JSON.stringify({
    zone,
    path,
    method: request.method,
    timestamp: Date.now(),
    status: 'routed'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// ============================================================
// SYNC & PERIODIC TASKS
// ============================================================

self.addEventListener('sync', (event) => {
  console.log('🔄 Sync event:', event.tag);
  
  if (event.tag === 'mx2lm-sync') {
    event.waitUntil(syncKernelState());
  }
});

async function syncKernelState() {
  try {
    // Sync across all connected clients
    const state = {
      kernel: KUHUL_VERSION,
      manifest: manifest?.['@v'],
      tape: kernelState?.tapeSystem?.getActiveTape()?.id,
      runtime: getRuntimeMode()
    };
    
    // Broadcast sync
    broadcastToAll({
      type: 'SYNC_COMPLETE',
      state,
      timestamp: Date.now()
    });
    
    console.log('✅ Kernel state synced');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'mx2lm-maintenance') {
    event.waitUntil(performMaintenance());
  }
});

async function performMaintenance() {
  console.log('🔧 Performing MX2LM maintenance');
  
  // Clean up old data
  if (kernelState?.asxRam?.volatile) {
    const now = Date.now();
    kernelState.asxRam.data.forEach((value, key) => {
      if (now - value.timestamp > 3600000) { // 1 hour
        kernelState.asxRam.data.delete(key);
      }
    });
  }
  
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
// UTILITY FUNCTIONS
// ============================================================

async function evaluateCondition(condition) {
  // Simple condition evaluation
  if (typeof condition === 'boolean') return condition;
  if (typeof condition === 'function') return await condition();
  return Boolean(condition);
}

async function executeAction(action, index) {
  if (typeof action === 'function') {
    return await action(index);
  }
  return action;
}

async function executeTask(task) {
  if (typeof task === 'function') {
    return await task();
  }
  
  // Handle task objects
  if (task.type === 'dispatch') {
    return await handleDispatch(task);
  }
  
  return task;
}

async function dispatchToTape(payload) {
  return await kernelState?.tapeSystem?.dispatchToTape(
    payload.tapeId,
    payload.action,
    payload.data
  );
}

async function dispatchToPanel(payload) {
  // Panel dispatch logic
  const { panelId, action, data } = payload;
  
  switch(action) {
    case 'activate':
      return kernelState?.tapeSystem?.activatePanels([panelId]);
    
    case 'deactivate':
      // Deactivate specific panel
      return true;
    
    default:
      throw new Error(`Unknown panel action: ${action}`);
  }
}

async function dispatchToMesh(payload) {
  return await kernelState?.meshNetwork?.dispatchToMesh(payload);
}

// ============================================================
// KERNEL EXPORTS (Debugging)
// ============================================================

if (typeof self.mx2lm === 'undefined') {
  self.mx2lm = {
    version: KUHUL_VERSION,
    manifest: () => manifest,
    state: () => kernelState,
    tape: () => kernelState?.tapeSystem,
    mesh: () => kernelState?.meshNetwork,
    xcfe: () => self.xcfe,
    
    // Debug methods
    _debug: {
      reloadManifest: loadManifest,
      resetKernel: initializeKernelState,
      forceSync: syncKernelState
    }
  };
}

console.log('🚀 MX2LM Ghost OS Kernel loaded successfully');
console.log('📜 Manifest:', manifest?.name, 'v' + manifest?.['@v']);
console.log('🎮 XCFE Law:', manifest?.law);
console.log('🌌 Quantum State:', manifest?.['@quantum_state']);
