# 🧠 XJSON ML RUNTIME - NPX AUTO-LAUNCHER

## **One Command AI Training - Zero Setup**

Train AI models in your browser with a single command. No Python, no Colab, no configuration.

```bash
npx @xjson/ml-runtime
```

That's it. The entire ML training environment launches automatically.

---

## 🚀 INSTANT START

### **Method 1: NPX (Recommended)**
No installation required:

```bash
npx @xjson/ml-runtime
```

### **Method 2: Global Install**
For repeated use:

```bash
npm install -g @xjson/ml-runtime
xjson-ml
```

### **Method 3: Git Bash Shortcut**
Ultra-fast alias:

```bash
npm install -g @xjson/ml-runtime
xml  # Short alias
```

---

## 📦 WHAT IT DOES

When you run `npx @xjson/ml-runtime`, it automatically:

1. ✅ **Detects GPU** - Checks for WebGPU support
2. ✅ **Finds Ports** - Auto-allocates available ports
3. ✅ **Starts Server** - Launches Express server
4. ✅ **Registers Service Worker** - Auto-loads sw.js
5. ✅ **Opens Browser** - Launches training interface
6. ✅ **Displays Status** - Beautiful terminal UI

**Total time: ~2 seconds**

---

## 🎯 COMMANDS

### **Start Runtime**
```bash
# Default (port 8080)
xjson-ml start

# Custom port
xjson-ml start --port 3000

# Development mode (hot reload)
xjson-ml start --dev

# Skip GPU check
xjson-ml start --no-gpu-check
```

### **Train Model**
```bash
# Interactive training
xjson-ml train

# With specific model
xjson-ml train --model gpt

# With dataset
xjson-ml train --dataset ./data.jsonl

# With config file
xjson-ml train --config ./config.json
```

### **Check Status**
```bash
xjson-ml status
```

Output:
```
┌───────────────────────────────────────┐
│                                       │
│  📊 RUNTIME STATUS                    │
│                                       │
│  State:         Training              │
│  GPU:           Available             │
│  Model:         gpt                   │
│  Epoch:         5/10                  │
│  Loss:          0.2341                │
│  Accuracy:      87.23%                │
│  GPU Usage:     78%                   │
│                                       │
└───────────────────────────────────────┘
```

### **GPU Information**
```bash
xjson-ml gpu
```

Output:
```
┌───────────────────────────────────────┐
│                                       │
│  🎮 GPU INFORMATION                   │
│                                       │
│  WebGPU:        ✓ Supported           │
│  Vendor:        NVIDIA                │
│  Architecture:  Ada Lovelace          │
│  Max Memory:    12 GB                 │
│  Compute:       128 units             │
│                                       │
└───────────────────────────────────────┘
```

### **Export Model**
```bash
# Export as XJSON (default)
xjson-ml export

# Export as ONNX
xjson-ml export --format onnx

# Export to specific path
xjson-ml export --format onnx --output ./models/my-model
```

### **Initialize Project**
```bash
# Create new training project
xjson-ml init

# With specific template
xjson-ml init --template bert

# Available templates:
# - gpt
# - bert
# - vit
# - lstm
# - cnn
# - custom
```

---

## 🔧 CONFIGURATION

### **Port Configuration**

The launcher uses an intelligent port oracle that:
- Auto-detects available ports
- Supports XJSON port zones
- Handles multi-instance deployments

```javascript
// Automatic port allocation
{
  "main": "auto",      // Main server (default: 8080)
  "api": "auto",       // API server (default: 8081)
  "websocket": "auto", // WebSocket (default: 8082)
  "shards": {
    "training": "auto",   // Training shard
    "inference": "auto",  // Inference shard
    "export": "auto"      // Export shard
  }
}
```

### **XJSON Port Zones**

Compatible with XJSON DNS zones:

```javascript
{
  "xjson.app": 61680,
  "rig.xjson.app": 61681,
  "hive.xjson.app": 61682,
  "trainer.xjson.app": 61683,
  "prime.xjson.app": 61684,
  "ml.xjson.app": 8080
}
```

---

## 🎨 FEATURES

### **Auto Service Worker Registration**

The server automatically:
1. Serves `/sw.js` with correct MIME type
2. Sets `Service-Worker-Allowed` header
3. Injects registration script into HTML
4. Monitors service worker status
5. Reports activation via API

```javascript
// Automatic injection
if ('serviceWorker' in navigator) {
  const registration = await navigator.serviceWorker.register('/sw.js');
  // Auto-registered! ✓
}
```

### **WebSocket Live Updates**

Real-time training metrics via WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:8082');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'metrics_update') {
    console.log('Loss:', data.data.loss);
    console.log('Accuracy:', data.data.accuracy);
  }
};
```

### **Hot Reload (Dev Mode)**

In development mode (`--dev`), the server watches for file changes:

```bash
xjson-ml start --dev
```

Any change to:
- `public/` files
- `lib/` modules
- Service worker

Triggers automatic browser reload.

### **Beautiful Terminal UI**

ASCII art banners, progress bars, and status displays:

```
██╗  ██╗     ██╗███████╗ ██████╗ ███╗   ██╗
╚██╗██╔╝     ██║██╔════╝██╔═══██╗████╗  ██║
 ╚███╔╝█████╗██║███████╗██║   ██║██╔██╗ ██║
 ██╔██╗╚════╝██║╚════██║██║   ██║██║╚██╗██║
██╔╝ ██╗     ██║███████║╚██████╔╝██║ ╚████║
╚═╝  ╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝

███╗   ███╗██╗         ██████╗ ██╗   ██╗███╗   ██╗████████╗██╗███╗   ███╗███████╗
████╗ ████║██║         ██╔══██╗██║   ██║████╗  ██║╚══██╔══╝██║████╗ ████║██╔════╝
██╔████╔██║██║         ██████╔╝██║   ██║██╔██╗ ██║   ██║   ██║██╔████╔██║█████╗  
██║╚██╔╝██║██║         ██╔══██╗██║   ██║██║╚██╗██║   ██║   ██║██║╚██╔╝██║██╔══╝  
██║ ╚═╝ ██║███████╗    ██║  ██║╚██████╔╝██║ ╚████║   ██║   ██║██║ ╚═╝ ██║███████╗
╚═╝     ╚═╝╚══════╝    ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝
```

---

## 🛠️ API ENDPOINTS

The launcher provides a REST API:

### **Health Check**
```bash
GET /api/ping
```

Response:
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

### **Status**
```bash
GET /api/status
```

Response:
```json
{
  "training": true,
  "model": {
    "name": "gpt",
    "params": 85000000
  },
  "gpu": {
    "available": true,
    "vendor": "NVIDIA",
    "utilization": 78
  },
  "metrics": {
    "epoch": 5,
    "loss": 0.2341,
    "accuracy": 87.23
  }
}
```

### **Start Training**
```bash
POST /api/train
Content-Type: application/json

{
  "model": "gpt",
  "dataset": "./data.jsonl",
  "hyperparams": {
    "learning_rate": 0.0001,
    "batch_size": 32,
    "epochs": 10
  }
}
```

### **Update Metrics**
```bash
POST /api/metrics
Content-Type: application/json

{
  "epoch": 5,
  "loss": 0.2341,
  "accuracy": 87.23,
  "gpu_util": 78
}
```

### **Export Model**
```bash
POST /api/export
Content-Type: application/json

{
  "format": "onnx",
  "output": "./exported-model"
}
```

---

## 📁 PROJECT STRUCTURE

```
@xjson/ml-runtime/
├── package.json          # NPM configuration
├── cli.js               # CLI entry point
├── server.js            # Express server
├── lib/
│   ├── port-oracle.js   # Port detection
│   ├── gpu-detector.js  # GPU capabilities
│   ├── ui.js            # Terminal UI
│   └── dependency-checker.js
├── public/
│   ├── XJSON-ML-RUNTIME.html
│   ├── ml-runtime-sw.js
│   └── ml-runtime-manifest.json
└── README.md
```

---

## 🌐 GIT BASH USAGE

### **Installation**
```bash
# In Git Bash
npm install -g @xjson/ml-runtime
```

### **Launch**
```bash
# Full command
xjson-ml start

# Short alias
xml

# With options
xml --port 3000 --dev
```

### **Git Bash Aliases**

Add to `.bashrc`:

```bash
# XJSON ML aliases
alias xml='xjson-ml'
alias xmltrain='xjson-ml train'
alias xmlstatus='xjson-ml status'
alias xmlgpu='xjson-ml gpu'
```

Then:
```bash
xml              # Start runtime
xmltrain         # Start training
xmlstatus        # Check status
xmlgpu           # GPU info
```

---

## 🔥 QUICK EXAMPLES

### **Example 1: Train GPT on Custom Dataset**

```bash
# Create dataset
echo '{"text": "Hello world"}' > data.jsonl
echo '{"text": "AI is amazing"}' >> data.jsonl

# Start training
xjson-ml train --model gpt --dataset data.jsonl
```

### **Example 2: Multi-Instance Training**

```bash
# Terminal 1: GPT training
xjson-ml start --port 8080

# Terminal 2: BERT training
xjson-ml start --port 8090

# Terminal 3: ViT training
xjson-ml start --port 8100
```

Each instance gets its own port range automatically!

### **Example 3: Development Workflow**

```bash
# Start in dev mode
xjson-ml start --dev

# Edit files in public/
# Browser auto-reloads

# Monitor in another terminal
xjson-ml status
```

### **Example 4: Export and Deploy**

```bash
# Train model
xjson-ml train --model bert --epochs 10

# Export when done
xjson-ml export --format onnx --output ./bert-model

# Deploy to production
cp -r bert-model /var/www/models/
```

---

## 🎯 ENVIRONMENT VARIABLES

```bash
# Custom port
export PORT=3000
xjson-ml start

# Skip browser open
export XJSON_NO_BROWSER=1
xjson-ml start

# Custom data directory
export XJSON_DATA_DIR=./training-data
xjson-ml train
```

---

## 🐛 TROUBLESHOOTING

### **Port Already in Use**
The launcher auto-detects available ports. If you see:
```
⚠ Port 8080 in use (will auto-detect alternative)
```

It will automatically use the next available port.

### **Service Worker Not Registered**
If service worker fails to register:

1. Check browser console (F12)
2. Ensure HTTPS or localhost
3. Clear browser cache
4. Restart server

### **GPU Not Detected**
If WebGPU is not available:

```bash
# Check GPU capabilities
xjson-ml gpu
```

To enable WebGPU:
1. Update browser to latest version
2. Enable WebGPU flag: `chrome://flags/#enable-unsafe-webgpu`
3. Restart browser

### **Dependencies Missing**
If you see dependency errors:

```bash
# Install all dependencies
cd node_modules/@xjson/ml-runtime
npm install
```

---

## 📚 ADVANCED USAGE

### **Custom Server Configuration**

Create `server.config.js`:

```javascript
export default {
  port: 8080,
  apiPort: 8081,
  wsPort: 8082,
  cors: {
    enabled: true,
    origins: ['*']
  },
  ssl: {
    enabled: false,
    cert: './cert.pem',
    key: './key.pem'
  },
  rateLimit: {
    enabled: true,
    max: 1000,
    windowMs: 60000
  }
};
```

Then:
```bash
xjson-ml start --config server.config.js
```

### **Programmatic Usage**

```javascript
import { startServer } from '@xjson/ml-runtime/server.js';

const server = await startServer({
  port: 8080,
  dev: true
});

console.log('Server started!');
```

### **Custom Port Zones**

```javascript
import { allocateZone } from '@xjson/ml-runtime/lib/port-oracle.js';

const port = await allocateZone('trainer.xjson.app');
console.log('Allocated port:', port);
```

---

## 🚢 DEPLOYMENT

### **Docker**

```dockerfile
FROM node:18
WORKDIR /app
RUN npm install -g @xjson/ml-runtime
EXPOSE 8080
CMD ["xjson-ml", "start"]
```

```bash
docker build -t xjson-ml .
docker run -p 8080:8080 xjson-ml
```

### **PM2**

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start xjson-ml -- start

# Monitor
pm2 logs xjson-ml

# Auto-restart on reboot
pm2 startup
pm2 save
```

### **Systemd Service**

Create `/etc/systemd/system/xjson-ml.service`:

```ini
[Unit]
Description=XJSON ML Runtime
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/xjson-ml
ExecStart=/usr/bin/xjson-ml start
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable xjson-ml
sudo systemctl start xjson-ml
```

---

## 📄 LICENSE

MIT License - Train any model, anywhere, forever free.

---

## 🙏 ACKNOWLEDGMENTS

Built on:
- Express.js - Server framework
- WebSocket - Real-time communication
- Chalk - Terminal colors
- Ora - Spinners
- Boxen - Terminal boxes
- Commander - CLI framework

---

**Made with 🧠 by the XJSON community**

**Train AI models with a single command. No setup. No complexity. Just results.**

```bash
npx @xjson/ml-runtime
```
