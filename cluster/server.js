/**
 * XJSON ML Runtime Server
 * Auto-starts service worker and provides API endpoints
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import { watch } from 'chokidar';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════
// SERVER STATE
// ═══════════════════════════════════════════════════════════════

const state = {
  training: false,
  model: null,
  dataset: null,
  metrics: {
    epoch: 0,
    loss: 0,
    accuracy: 0
  },
  gpu: {
    available: false,
    vendor: null,
    utilization: 0
  },
  serviceWorker: {
    registered: false,
    active: false
  }
};

// ═══════════════════════════════════════════════════════════════
// SERVER SETUP
// ═══════════════════════════════════════════════════════════════

export async function startServer(options = {}) {
  const {
    port = 8080,
    apiPort = 8081,
    wsPort = 8082,
    dev = false
  } = options;

  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  // CORS for development
  if (dev) {
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // ROUTES
  // ═══════════════════════════════════════════════════════════════

  // Main page
  app.get('/', async (req, res) => {
    try {
      const html = await fs.readFile(
        path.join(__dirname, 'public', 'XJSON-ML-RUNTIME.html'),
        'utf-8'
      );
      res.send(html);
    } catch (e) {
      res.status(500).send('Error loading runtime');
    }
  });

  // Service worker
  app.get('/sw.js', async (req, res) => {
    try {
      const sw = await fs.readFile(
        path.join(__dirname, 'public', 'ml-runtime-sw.js'),
        'utf-8'
      );
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Service-Worker-Allowed', '/');
      res.send(sw);
    } catch (e) {
      res.status(500).send('Error loading service worker');
    }
  });

  // Manifest
  app.get('/manifest.json', async (req, res) => {
    try {
      const manifest = await fs.readFile(
        path.join(__dirname, 'public', 'ml-runtime-manifest.json'),
        'utf-8'
      );
      res.setHeader('Content-Type', 'application/json');
      res.send(manifest);
    } catch (e) {
      res.status(500).json({ error: 'Error loading manifest' });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // API ENDPOINTS
  // ═══════════════════════════════════════════════════════════════

  // Ping (health check)
  app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Status
  app.get('/api/status', (req, res) => {
    res.json({
      training: state.training,
      model: state.model,
      gpu: state.gpu,
      training: state.metrics,
      serviceWorker: state.serviceWorker
    });
  });

  // Service worker registration
  app.post('/api/sw/register', (req, res) => {
    state.serviceWorker.registered = true;
    res.json({ status: 'registered' });
  });

  app.post('/api/sw/activate', (req, res) => {
    state.serviceWorker.active = true;
    res.json({ status: 'active' });
  });

  // GPU info
  app.get('/api/gpu', async (req, res) => {
    // This would be populated by client-side WebGPU detection
    res.json(state.gpu);
  });

  // Start training
  app.post('/api/train', async (req, res) => {
    const { model, dataset, hyperparams } = req.body;

    try {
      state.training = true;
      state.model = model;
      state.dataset = dataset;

      // Broadcast to WebSocket clients
      broadcastToClients({
        type: 'training_started',
        model: model
      });

      res.json({ 
        status: 'started',
        model: model 
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Stop training
  app.post('/api/train/stop', (req, res) => {
    state.training = false;

    broadcastToClients({
      type: 'training_stopped'
    });

    res.json({ status: 'stopped' });
  });

  // Training metrics
  app.post('/api/metrics', (req, res) => {
    const { epoch, loss, accuracy, gpu_util } = req.body;

    state.metrics = {
      epoch,
      loss,
      accuracy
    };

    state.gpu.utilization = gpu_util;

    // Broadcast to WebSocket clients
    broadcastToClients({
      type: 'metrics_update',
      data: state.metrics
    });

    res.json({ status: 'updated' });
  });

  // Export model
  app.post('/api/export', async (req, res) => {
    const { format, output } = req.body;

    try {
      // This would trigger actual export via service worker
      const result = {
        format: format,
        path: output,
        size: '100 MB'
      };

      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Load dataset
  app.post('/api/dataset/load', async (req, res) => {
    const { path: datasetPath } = req.body;

    try {
      const data = await fs.readFile(datasetPath, 'utf-8');
      const lines = data.split('\n').filter(l => l.trim());
      
      state.dataset = {
        path: datasetPath,
        size: lines.length
      };

      res.json({
        status: 'loaded',
        size: lines.length
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // List models
  app.get('/api/models', async (req, res) => {
    const models = [
      { id: 'gpt', name: 'GPT-style Transformer', params: '85M' },
      { id: 'bert', name: 'BERT Encoder', params: '110M' },
      { id: 'vit', name: 'Vision Transformer', params: '86M' },
      { id: 'lstm', name: 'LSTM Network', params: '5M' },
      { id: 'cnn', name: 'CNN ResNet', params: '25M' },
      { id: 'vae', name: 'VAE', params: '1.5M' },
      { id: 'gan', name: 'GAN', params: '2M' }
    ];

    res.json(models);
  });

  // ═══════════════════════════════════════════════════════════════
  // WEBSOCKET SERVER
  // ═══════════════════════════════════════════════════════════════

  const wss = new WebSocketServer({ port: wsPort });
  const clients = new Set();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`WebSocket client connected (${clients.size} total)`);

    // Send current state
    ws.send(JSON.stringify({
      type: 'state',
      data: state
    }));

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`WebSocket client disconnected (${clients.size} total)`);
    });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleWebSocketMessage(data, ws);
      } catch (e) {
        console.error('WebSocket error:', e);
      }
    });
  });

  function broadcastToClients(message) {
    const payload = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === 1) { // OPEN
        client.send(payload);
      }
    });
  }

  function handleWebSocketMessage(data, ws) {
    switch (data.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      
      case 'get_state':
        ws.send(JSON.stringify({ type: 'state', data: state }));
        break;
      
      case 'training_update':
        state.metrics = data.metrics;
        broadcastToClients({ type: 'metrics_update', data: data.metrics });
        break;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HOT RELOAD (Development)
  // ═══════════════════════════════════════════════════════════════

  if (dev) {
    const watcher = watch([
      path.join(__dirname, 'public'),
      path.join(__dirname, 'lib')
    ], {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    watcher.on('change', (filePath) => {
      console.log(`File changed: ${filePath}`);
      broadcastToClients({
        type: 'reload',
        file: filePath
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // AUTO SERVICE WORKER REGISTRATION
  // ═══════════════════════════════════════════════════════════════

  // Inject service worker registration script
  app.use((req, res, next) => {
    if (req.path === '/' || req.path.endsWith('.html')) {
      const originalSend = res.send;
      res.send = function(data) {
        if (typeof data === 'string' && data.includes('</body>')) {
          // Inject auto-registration script
          const script = `
<script>
// Auto-register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✓ Service Worker registered:', registration.scope);
      
      // Notify server
      await fetch('/api/sw/register', { method: 'POST' });
      
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
      });
      
      if (registration.active) {
        await fetch('/api/sw/activate', { method: 'POST' });
      }
    } catch (e) {
      console.error('Service Worker registration failed:', e);
    }
  });
}
</script>`;
          data = data.replace('</body>', script + '</body>');
        }
        return originalSend.call(this, data);
      };
    }
    next();
  });

  // ═══════════════════════════════════════════════════════════════
  // START SERVER
  // ═══════════════════════════════════════════════════════════════

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🧠 XJSON ML RUNTIME                                          ║
║                                                                ║
║   Server:      http://localhost:${port.toString().padEnd(41)}║
║   API:         http://localhost:${apiPort.toString().padEnd(41)}║
║   WebSocket:   ws://localhost:${wsPort.toString().padEnd(43)}║
║                                                                ║
║   Service Worker: Auto-registering...                         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);
      
      resolve(server);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// STANDALONE EXECUTION
// ═══════════════════════════════════════════════════════════════

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer({
    port: process.env.PORT || 8080,
    dev: process.argv.includes('--dev')
  });
}
