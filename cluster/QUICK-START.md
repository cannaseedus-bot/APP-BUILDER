# 🎯 XJSON ML NPX AUTO-LAUNCHER - COMPLETE GUIDE

## **Git Bash → Browser → AI Training (2 Seconds)**

---

## 🚀 THE ULTIMATE QUICK START

### **Git Bash One-Liner**

```bash
npx @xjson/ml-runtime && curl -s http://localhost:8080/api/ping
```

**What happens:**
1. NPX downloads and starts the runtime (if not cached)
2. Service worker auto-registers at `/sw.js`
3. Server starts on `localhost:8080`
4. Browser opens automatically
5. Training interface loads
6. WebGPU initializes
7. Ready to train!

**Total time: ~2 seconds** (after first download)

---

## 🔥 GIT BASH SPECIFIC FEATURES

### **Installation**

```bash
# Open Git Bash
npm install -g @xjson/ml-runtime

# Verify installation
xjson-ml --version
```

### **Create Aliases**

Add to `~/.bashrc`:

```bash
# XJSON ML Runtime aliases
alias xml='xjson-ml start'
alias xmltrain='xjson-ml train'
alias xmlstatus='xjson-ml status'
alias xmlgpu='xjson-ml gpu'
alias xmlexport='xjson-ml export'
alias xmlinit='xjson-ml init'
```

Reload:
```bash
source ~/.bashrc
```

### **Ultra-Fast Launch**

```bash
# Method 1: Using alias
xml

# Method 2: Full command
xjson-ml

# Method 3: NPX (no install)
npx @xjson/ml-runtime
```

All three automatically:
- ✅ Detect available ports
- ✅ Start Express server
- ✅ Register service worker
- ✅ Open browser
- ✅ Initialize WebGPU

---

## ⚡ AUTOMATIC FEATURES

### **1. Service Worker Auto-Registration**

The server automatically injects this script into `index.html`:

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('✓ Service Worker registered:', registration.scope);
    
    // Notify server
    await fetch('/api/sw/register', { method: 'POST' });
  });
}
```

**You don't need to do anything!** Just run `xjson-ml` and sw.js loads automatically.

### **2. Port Auto-Detection**

Uses the **Port Oracle** system:

```javascript
// Automatically finds available ports
{
  main: 8080,      // Or next available
  api: 8081,       // Or next available
  websocket: 8082, // Or next available
  shards: {
    training: 8083,
    inference: 8084,
    export: 8085
  }
}
```

If port 8080 is busy, it automatically tries 8081, 8082, etc.

### **3. GPU Detection**

Automatically detects:
- WebGPU availability
- GPU vendor (NVIDIA, AMD, Intel, etc.)
- GPU architecture
- Available VRAM
- Compute capabilities

### **4. Hot Reload (Dev Mode)**

```bash
xjson-ml start --dev
```

Automatically reloads browser when you edit:
- `public/XJSON-ML-RUNTIME.html`
- `public/ml-runtime-sw.js`
- `public/ml-runtime-manifest.json`
- Any file in `lib/`

---

## 📁 FILE STRUCTURE

```
@xjson/ml-runtime/
│
├── package.json              # NPM configuration
├── cli.js                   # CLI commands (xjson-ml start, etc.)
├── server.js                # Express server + auto SW registration
├── index.js                 # Programmatic API
│
├── lib/
│   ├── port-oracle.js       # Auto port detection
│   ├── gpu-detector.js      # WebGPU detection
│   ├── ui.js                # Terminal UI
│   └── dependency-checker.js
│
├── public/
│   ├── XJSON-ML-RUNTIME.html   # Main UI
│   ├── ml-runtime-sw.js         # Service worker
│   └── ml-runtime-manifest.json # Configuration
│
├── README.md                # Main documentation
└── INSTALL.md              # Installation guide
```

---

## 🎯 REAL-WORLD WORKFLOW

### **Day-to-Day Training**

```bash
# Morning: Start runtime
xml

# Load your dataset
# (Drag & drop into browser)

# Start training
# (Click "Start Training" in UI)

# Monitor in terminal
xmlstatus

# Evening: Export model
xmlexport --format onnx
```

### **Multi-Model Training**

```bash
# Terminal 1: Train GPT
xml --port 8080

# Terminal 2: Train BERT
xml --port 9000

# Terminal 3: Train ViT
xml --port 10000

# Monitor all
watch -n 1 'curl -s http://localhost:8080/api/status | jq .metrics'
```

### **CI/CD Pipeline**

```bash
# In your GitHub Actions workflow
- name: Train Model
  run: |
    npm install -g @xjson/ml-runtime
    xjson-ml train --model gpt --dataset ./data.jsonl --epochs 10
    xjson-ml export --format onnx --output ./models/
    
- name: Deploy Model
  run: |
    aws s3 cp ./models/ s3://my-bucket/models/ --recursive
```

---

## 🔌 API INTEGRATION

### **JavaScript/Node.js**

```javascript
import quickStart from '@xjson/ml-runtime';

// Start runtime programmatically
const { server, ports, url } = await quickStart({
  port: 8080,
  open: false  // Don't open browser
});

console.log(`Server running at ${url}`);

// Train model via API
const response = await fetch(`${url}/api/train`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt',
    dataset: './data.jsonl',
    hyperparams: {
      learning_rate: 0.0001,
      epochs: 10
    }
  })
});

// Monitor training
const ws = new WebSocket(`ws://localhost:${ports.websocket}`);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Training update:', data);
};
```

### **Python**

```python
import subprocess
import requests
import time

# Start runtime
proc = subprocess.Popen(['xjson-ml', 'start', '--no-open'])
time.sleep(2)  # Wait for startup

# Check status
response = requests.get('http://localhost:8080/api/status')
print(response.json())

# Start training
requests.post('http://localhost:8080/api/train', json={
    'model': 'gpt',
    'dataset': './data.jsonl'
})

# Monitor
while True:
    status = requests.get('http://localhost:8080/api/status').json()
    print(f"Epoch: {status['metrics']['epoch']}, Loss: {status['metrics']['loss']}")
    time.sleep(5)
```

### **Bash Script**

```bash
#!/bin/bash

# Start runtime in background
xjson-ml start --no-open &
RUNTIME_PID=$!

# Wait for startup
sleep 2

# Train model
curl -X POST http://localhost:8080/api/train \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt",
    "dataset": "./data.jsonl",
    "hyperparams": {
      "learning_rate": 0.0001,
      "epochs": 10
    }
  }'

# Monitor training
while true; do
  STATUS=$(curl -s http://localhost:8080/api/status | jq -r '.metrics.loss')
  echo "Loss: $STATUS"
  sleep 5
done

# Cleanup
kill $RUNTIME_PID
```

---

## 🎨 CUSTOMIZATION

### **Custom Port Configuration**

```bash
# Single port
xjson-ml start --port 3000

# All ports via environment
export XJSON_PORT_MAIN=3000
export XJSON_PORT_API=3001
export XJSON_PORT_WS=3002
xjson-ml start
```

### **Custom Model Templates**

Create `templates/my-model.json`:

```json
{
  "name": "My Custom Model",
  "architecture": {
    "input_dim": 512,
    "layers": [
      {"type": "linear", "in": 512, "out": 1024},
      {"type": "relu"},
      {"type": "dropout", "p": 0.1},
      {"type": "linear", "in": 1024, "out": 512}
    ]
  },
  "hyperparams": {
    "learning_rate": 0.0001,
    "batch_size": 32,
    "epochs": 10
  }
}
```

Load:
```bash
xjson-ml train --config ./templates/my-model.json
```

### **Custom Dataset Loaders**

```javascript
// custom-loader.js
export async function loadDataset(path) {
  // Your custom loading logic
  const data = await fetch(path).then(r => r.json());
  return {
    train: data.slice(0, 0.8 * data.length),
    val: data.slice(0.8 * data.length)
  };
}
```

---

## 🐛 DEBUGGING

### **Enable Debug Logging**

```bash
# Verbose output
DEBUG=* xjson-ml start

# Specific module
DEBUG=xjson:server xjson-ml start
DEBUG=xjson:gpu xjson-ml start
```

### **Check Service Worker**

```bash
# Browser DevTools
1. Open http://localhost:8080
2. Press F12
3. Application tab → Service Workers
4. Should see: "Status: activated"
```

### **Check Ports**

```bash
# Linux/Mac
lsof -i :8080

# Windows (PowerShell)
Get-NetTCPConnection -LocalPort 8080

# Git Bash (Windows)
netstat -ano | grep 8080
```

### **Check GPU**

```bash
xjson-ml gpu

# Should show:
# ✓ WebGPU: Supported
# Vendor: NVIDIA
# Architecture: Ada Lovelace
```

---

## 📊 PERFORMANCE TIPS

### **1. Use Mixed Precision**

Auto-enabled by default. To disable:
```bash
xjson-ml train --no-mixed-precision
```

### **2. Increase Batch Size**

```bash
xjson-ml train --batch-size 64
```

### **3. Enable Flash Attention**

Auto-enabled for sequences >512 tokens.

### **4. Use Gradient Checkpointing**

For large models:
```bash
xjson-ml train --gradient-checkpointing
```

---

## 🌍 PRODUCTION DEPLOYMENT

### **Quick Deploy to Cloud**

```bash
# 1. Install on server
ssh user@server 'npm install -g @xjson/ml-runtime'

# 2. Start with PM2
ssh user@server 'pm2 start xjson-ml -- start'

# 3. Save PM2 config
ssh user@server 'pm2 save'

# 4. Setup auto-start
ssh user@server 'pm2 startup'
```

### **Docker One-Liner**

```bash
docker run -d -p 8080:8080 xjson/ml-runtime:latest
```

---

## ✅ VERIFICATION CHECKLIST

After running `xjson-ml`, verify:

```bash
# ✓ Server running
curl http://localhost:8080/api/ping
# Expected: {"status":"ok"}

# ✓ Service worker registered
curl http://localhost:8080/sw.js
# Expected: JavaScript code

# ✓ Manifest loaded
curl http://localhost:8080/manifest.json
# Expected: JSON configuration

# ✓ WebSocket working
wscat -c ws://localhost:8082
# Expected: Connection established

# ✓ GPU detected
xjson-ml gpu
# Expected: GPU information
```

---

## 🎓 LEARNING PATH

### **Beginner (Week 1)**
1. Install: `npm install -g @xjson/ml-runtime`
2. Run: `xjson-ml start`
3. Load sample dataset
4. Train small model (1M params)
5. Export to ONNX

### **Intermediate (Week 2-3)**
1. Train GPT-style model (85M params)
2. Use custom datasets
3. Tune hyperparameters
4. Monitor with WebSocket
5. Deploy to cloud

### **Advanced (Week 4+)**
1. Multi-GPU training
2. Custom architectures
3. Distributed training
4. Production deployment
5. CI/CD integration

---

## 🆘 SUPPORT

### **GitHub Issues**
https://github.com/xjson/ml-runtime/issues

### **Discord Community**
https://discord.gg/xjson

### **Documentation**
https://docs.xjson.org/ml-runtime

---

## 🎉 YOU'RE READY!

```bash
# Open Git Bash and run:
npx @xjson/ml-runtime

# Or with global install:
npm install -g @xjson/ml-runtime
xml

# That's it! Start training AI models! 🧠
```

---

**Made with 🧠 by the XJSON community**

**Train AI models anywhere, anytime, on any device.**

**From Git Bash to production in one command.** 🚀
