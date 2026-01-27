# ASX Backend Setup Guide

## Overview

ASX Runtime uses **Ollama** as the primary AI backend, supporting both local and cloud deployment.

### Backend Options

| Option | Description | Best For |
|--------|-------------|----------|
| **Ollama Local** | Run models on your machine | Development, privacy |
| **Ollama Cloud** | Cloud-hosted models | Production, larger models |
| **Custom API** | Your own backend | Enterprise deployment |

---

## Quick Start with Ollama

### 1. Install Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

### 2. Pull Models

```bash
# General purpose
ollama pull llama3.2

# Coding
ollama pull codellama
ollama pull qwen2.5-coder

# Reasoning
ollama pull deepseek-r1

# Smaller/faster
ollama pull mistral
ollama pull phi3
```

### 3. Start the Server

```bash
# Ollama runs automatically, or start manually:
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags
```

### 4. Test

```bash
# Quick test
ollama run llama3.2 "Hello, world!"

# API test
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [{"role": "user", "content": "Hello!"}],
  "stream": false
}'
```

---

## Ollama Cloud Setup

For larger models that won't fit locally, use Ollama Cloud.

### 1. Sign In

```bash
ollama signin
```

### 2. Get API Key

1. Go to https://ollama.com/settings/keys
2. Create a new API key
3. Set environment variable:

```bash
export OLLAMA_API_KEY=your_api_key
export OLLAMA_USE_CLOUD=true
```

### 3. Run Cloud Models

```bash
# Pull cloud model
ollama pull gpt-oss:120b-cloud

# Run
ollama run gpt-oss:120b-cloud "Explain quantum computing"
```

### 4. API Access

```python
from ollama import Client
import os

client = Client(
    host="https://ollama.com",
    headers={'Authorization': 'Bearer ' + os.environ.get('OLLAMA_API_KEY')}
)

response = client.chat('gpt-oss:120b', messages=[
    {'role': 'user', 'content': 'Why is the sky blue?'}
])
print(response['message']['content'])
```

---

## ASX Runtime Integration

### Python API Server

Start the ASX API server:

```bash
cd python
pip install -e .
python -m api.app
```

The server runs on `http://localhost:8000` with endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/api/tags` | GET | List models |
| `/api/chat` | POST | Chat with model |
| `/api/generate` | POST | Generate completion |
| `/api/embeddings` | POST | Generate embeddings |
| `/v1/chat/completions` | POST | OpenAI-compatible |

### Environment Variables

```bash
# Local Ollama (default)
export OLLAMA_HOST=http://localhost:11434
export OLLAMA_MODEL=llama3.2

# Cloud Ollama
export OLLAMA_API_KEY=your_key
export OLLAMA_USE_CLOUD=true
export OLLAMA_MODEL=gpt-oss:120b
```

### JavaScript Client

```javascript
// Local
const client = OllamaClient.local();
const response = await client.chat("Hello!");

// Cloud
const cloudClient = OllamaClient.cloud(process.env.OLLAMA_API_KEY);
const response = await cloudClient.chat("Hello!", { model: "gpt-oss:120b" });

// Streaming
for await (const chunk of client.chatStream("Tell me a story")) {
  process.stdout.write(chunk);
}
```

---

## Recommended Models

### For Development

| Model | Size | Context | Use Case |
|-------|------|---------|----------|
| `llama3.2` | 2GB | 128K | General chat |
| `phi3` | 2GB | 4K | Fast responses |
| `mistral` | 4GB | 32K | Balanced |

### For Production

| Model | Size | Context | Use Case |
|-------|------|---------|----------|
| `llama3.2:70b` | 40GB | 128K | Best quality |
| `deepseek-r1` | 14GB | 128K | Reasoning |
| `qwen2.5-coder:32b` | 18GB | 32K | Code generation |

### Cloud Models

| Model | Context | Use Case |
|-------|---------|----------|
| `gpt-oss:120b-cloud` | 256K | Large context |
| `deepseek-r1-cloud` | 256K | Complex reasoning |

---

## Docker Deployment

### With Docker Compose

```yaml
version: '3.8'
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]

  asx-api:
    build: ./python
    ports:
      - "8000:8000"
    environment:
      - OLLAMA_HOST=http://ollama:11434
      - OLLAMA_MODEL=llama3.2
    depends_on:
      - ollama

volumes:
  ollama_data:
```

### Run

```bash
docker-compose up -d

# Pull model into container
docker exec -it ollama ollama pull llama3.2
```

---

## GPU Acceleration

### NVIDIA GPU

```bash
# Install NVIDIA Container Toolkit
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

# Restart Docker
sudo systemctl restart docker

# Run Ollama with GPU
docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 ollama/ollama
```

### Apple Silicon

Ollama automatically uses Metal on Apple Silicon Macs. No additional configuration needed.

---

## Troubleshooting

### Ollama not responding

```bash
# Check if running
pgrep ollama

# Start manually
ollama serve

# Check logs
journalctl -u ollama -f
```

### Out of memory

```bash
# Use smaller model
ollama pull phi3  # 2GB
ollama pull llama3.2  # 2GB

# Or use quantized version
ollama pull llama3.2:q4_0  # Smaller quantization
```

### Slow inference

```bash
# Check GPU is being used
nvidia-smi

# Use GPU layers
OLLAMA_NUM_GPU_LAYERS=35 ollama serve
```

### API connection errors

```bash
# Verify Ollama is accessible
curl http://localhost:11434/api/tags

# Check firewall
sudo ufw allow 11434

# For Docker networking
docker network inspect bridge
```

---

## Performance Tuning

### Memory Settings

```bash
# Limit model memory usage
OLLAMA_MAX_LOADED_MODELS=1 ollama serve

# Set context size
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [{"role": "user", "content": "Hello"}],
  "options": {"num_ctx": 4096}
}'
```

### Batch Processing

```python
from ollama import Client

client = Client()

# Process multiple prompts
prompts = ["Question 1", "Question 2", "Question 3"]
responses = []

for prompt in prompts:
    response = client.chat('llama3.2', messages=[
        {'role': 'user', 'content': prompt}
    ])
    responses.append(response['message']['content'])
```

---

## Security

### API Authentication

For production, add authentication to the ASX API:

```python
# In api/app.py
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.post("/api/chat")
async def chat(request: ChatRequest, token: str = Depends(security)):
    # Validate token
    pass
```

### Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/chat")
@limiter.limit("10/minute")
async def chat(request: ChatRequest):
    pass
```

---

## Next Steps

1. **Install Ollama** and pull a model
2. **Start the ASX API server**
3. **Test with curl or the frontend**
4. **Configure for production** (Docker, GPU, etc.)

For more information:
- Ollama Documentation: https://docs.ollama.com
- Ollama Model Library: https://ollama.com/library
- ASX API Reference: See `API_REFERENCE.md`
