# ASX Backend Model Setup Guide

## 🎯 Overview

Your ASX system is configured to integrate with **11 AI models** hosted on your PHP backend. This guide will help you download, configure, and activate these models.

### Backend Infrastructure

```
API Gateway:     https://api.asxtoken.com/api.php
Backend Base:    https://backend.refluxedpc.com/models/
Status:          ✅ PHP API Configured | ⏳ Models Awaiting Download
```

---

## 📊 Model Inventory

### Critical Priority (Download First)
| Model | Type | Size | Context | Quantum |
|-------|------|------|---------|---------|
| **Janus Pro** | Quantum LLM | ~7GB | 256K | ✅ |
| **MX2 Inference** | Inference Engine | ~10GB | 512K | ✅ |
| **K'UHUL Quantum** | Quantum Engine | ~12GB | 1024K | ✅ |

### High Priority
| Model | Type | Size | Context | Quantum |
|-------|------|------|---------|---------|
| **DeepSeek R1** | Reasoning LLM | ~14GB | 128K | ✅ |
| **DeepSeek Coder** | Code LLM | ~6GB | 64K | ✅ |
| **Cline Agent** | Agentic LLM | ~8GB | 128K | ✅ |

### Medium Priority
| Model | Type | Size | Context | Quantum |
|-------|------|------|---------|---------|
| **Llama 3** | General LLM | ~4GB | 8K | ❌ |
| **CodeLlama** | Code LLM | ~3.5GB | 16K | ❌ |
| **Qwen Coder** | Coding LLM | ~4GB | 32K | ❌ |
| **Janus Flow** | Streaming LLM | ~2GB | 32K | ❌ |

### Low Priority
| Model | Type | Size | Context | Quantum |
|-------|------|------|---------|---------|
| **Mistral** | Efficient LLM | ~3GB | 32K | ❌ |

**Total Storage Required**: ~74GB (all models)

---

## 🚀 Quick Start Setup

### Step 1: Verify Backend Structure

```bash
# Your backend should have this structure:
backend.refluxedpc.com/models/
├── deepseek-r1/
│   ├── chat.php
│   ├── stream.php
│   ├── info.php
│   └── [model files - TO BE ADDED]
├── deepseek-coder/
│   ├── chat.php
│   ├── stream.php
│   ├── info.php
│   └── [model files - TO BE ADDED]
├── janus-pro/
│   ├── chat.php
│   ├── stream.php
│   ├── info.php
│   └── [model files - TO BE ADDED]
... (and so on for all 11 models)
```

### Step 2: Download Model Files

#### Option A: HuggingFace Download (Recommended)

```bash
# Install HuggingFace CLI
pip install huggingface-hub

# Login to HuggingFace
huggingface-cli login

# Download models (examples)
# DeepSeek R1
huggingface-cli download deepseek-ai/DeepSeek-R1 --local-dir /path/to/backend/models/deepseek-r1/

# DeepSeek Coder
huggingface-cli download deepseek-ai/deepseek-coder-33b-instruct --local-dir /path/to/backend/models/deepseek-coder/

# Llama 3
huggingface-cli download meta-llama/Meta-Llama-3-8B-Instruct --local-dir /path/to/backend/models/llama3/

# CodeLlama
huggingface-cli download codellama/CodeLlama-13b-Instruct-hf --local-dir /path/to/backend/models/codellama/

# Mistral
huggingface-cli download mistralai/Mistral-7B-Instruct-v0.2 --local-dir /path/to/backend/models/mistral/

# Qwen Coder
huggingface-cli download Qwen/Qwen2.5-Coder-32B-Instruct --local-dir /path/to/backend/models/qwen-coder/
```

#### Option B: Manual Download

Visit HuggingFace and download manually:

1. **DeepSeek R1**: https://huggingface.co/deepseek-ai/DeepSeek-R1
2. **DeepSeek Coder**: https://huggingface.co/deepseek-ai/deepseek-coder-33b-instruct
3. **Llama 3**: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
4. **CodeLlama**: https://huggingface.co/codellama/CodeLlama-13b-Instruct-hf
5. **Mistral**: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
6. **Qwen Coder**: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct

### Step 3: MX2LM Native Models

For MX2LM-specific models (Janus Pro, Janus Flow, Cline Agent, MX2 Inference, K'UHUL Quantum), you'll need to:

1. Train them using your training infrastructure
2. Or use placeholder/fine-tuned versions of open models
3. Configure them according to ASX specs

**Placeholder Configuration** (until custom models are trained):

```bash
# Janus Pro → Use Llama 3 as base
ln -s /path/to/backend/models/llama3 /path/to/backend/models/janus-pro/base

# Janus Flow → Use Mistral as base
ln -s /path/to/backend/models/mistral /path/to/backend/models/janus-flow/base

# Cline Agent → Use DeepSeek R1 as base
ln -s /path/to/backend/models/deepseek-r1 /path/to/backend/models/cline-agent/base

# MX2 Inference → Use DeepSeek R1 as base
ln -s /path/to/backend/models/deepseek-r1 /path/to/backend/models/mx2-inference/base

# K'UHUL Quantum → Use DeepSeek R1 as base
ln -s /path/to/backend/models/deepseek-r1 /path/to/backend/models/kuhul-quantum/base
```

---

## 🔧 PHP Endpoint Configuration

### Template: chat.php

Each model folder needs a `chat.php` file. Here's a template:

```php
<?php
// Chat endpoint for [MODEL_NAME]
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Load model configuration
$modelPath = __DIR__ . '/';
$modelName = basename(__DIR__);

// Parse request
$input = json_decode(file_get_contents('php://input'), true);
$message = $input['message'] ?? $_GET['message'] ?? '';

if (empty($message)) {
    echo json_encode(['error' => 'Message required']);
    exit;
}

// TODO: Initialize model inference
// This will depend on your inference framework (llama.cpp, vLLM, etc.)

// Example using llama.cpp (you'll need to adapt this)
$command = sprintf(
    'cd %s && ./llama-cli -m model.gguf -p %s --temp 0.7 --top-k 40 --top-p 0.9',
    escapeshellarg($modelPath),
    escapeshellarg($message)
);

$output = shell_exec($command);

echo json_encode([
    'model' => $modelName,
    'message' => $message,
    'response' => trim($output),
    'timestamp' => time(),
    'backend' => 'refluxedpc'
]);
?>
```

### Template: stream.php

```php
<?php
// Streaming endpoint for [MODEL_NAME]
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('Access-Control-Allow-Origin: *');

$modelPath = __DIR__ . '/';
$input = json_decode(file_get_contents('php://input'), true);
$message = $input['message'] ?? $_GET['message'] ?? '';

// Stream response in chunks
// TODO: Implement streaming inference

// Example streaming output
for ($i = 0; $i < 10; $i++) {
    echo "data: " . json_encode(['chunk' => "Token $i"]) . "\n\n";
    ob_flush();
    flush();
    usleep(100000); // 100ms delay
}

echo "data: [DONE]\n\n";
?>
```

### Template: info.php

```php
<?php
// Model information endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$modelPath = __DIR__ . '/';
$modelName = basename(__DIR__);

// Check if model files exist
$modelExists = file_exists($modelPath . 'model.gguf') ||
               file_exists($modelPath . 'pytorch_model.bin');

echo json_encode([
    'model' => $modelName,
    'backend_path' => $modelPath,
    'status' => $modelExists ? 'ready' : 'not_downloaded',
    'model_files_found' => $modelExists,
    'capabilities' => [
        'chat' => true,
        'streaming' => true,
        'batch' => false
    ],
    'endpoints' => [
        'chat' => $modelName . '/chat.php',
        'stream' => $modelName . '/stream.php',
        'info' => $modelName . '/info.php'
    ],
    'timestamp' => time()
]);
?>
```

---

## 🧪 Testing Backend Models

### 1. Test API Gateway

```bash
# Check if API gateway is responding
curl https://api.asxtoken.com/api.php

# List all models
curl https://api.asxtoken.com/api.php?route=models.list

# Check backend health
curl https://api.asxtoken.com/api.php?route=backend.status
```

### 2. Test Individual Models

```bash
# Test Janus Pro
curl "https://api.asxtoken.com/api.php?route=chat&model=janus-pro&message=Hello"

# Test DeepSeek R1
curl "https://api.asxtoken.com/api.php?route=chat&model=deepseek-r1&message=Explain+quantum+computing"

# Test with streaming
curl "https://api.asxtoken.com/api.php?route=chat&model=deepseek-coder&message=Write+a+function&stream=true"
```

### 3. Test from ASX Frontend

```javascript
// In browser console or ASX app
fetch('/__api__/backendChat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'janus-pro',
    message: 'Hello from ASX!'
  })
}).then(r => r.json()).then(console.log);
```

---

## 🔄 Inference Framework Options

### Option 1: llama.cpp (Recommended for CPU)

```bash
# Install llama.cpp
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# Convert model to GGUF format
python convert.py /path/to/model --outfile model.gguf

# Quantize for efficiency
./quantize model.gguf model-q4.gguf Q4_K_M

# Run inference
./llama-cli -m model-q4.gguf -p "Your prompt here"
```

### Option 2: vLLM (Recommended for GPU)

```bash
# Install vLLM
pip install vllm

# Start vLLM server
python -m vllm.entrypoints.openai.api_server \
  --model /path/to/model \
  --port 8000

# Use in PHP
curl http://localhost:8000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "model-name", "prompt": "Hello"}'
```

### Option 3: Ollama (Easiest Setup)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull deepseek-r1
ollama pull llama3
ollama pull codellama

# Run inference
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1",
  "prompt": "Explain AI"
}'
```

---

## 📦 Recommended Setup Path

### Phase 1: Basic Setup (1-2 hours)
1. Install llama.cpp or Ollama
2. Download **Llama 3** (4GB) - fastest to set up
3. Configure `llama3/chat.php`, `stream.php`, `info.php`
4. Test with ASX frontend

### Phase 2: Code Models (2-3 hours)
1. Download **CodeLlama** (3.5GB)
2. Download **Qwen Coder** (4GB)
3. Configure PHP endpoints
4. Test code generation

### Phase 3: Advanced Models (4-6 hours)
1. Download **DeepSeek R1** (14GB) - most powerful
2. Download **DeepSeek Coder** (6GB)
3. Configure for quantum enhancement
4. Test complex reasoning

### Phase 4: MX2LM Native (Custom Development)
1. Fine-tune Janus Pro from Llama 3 base
2. Train K'UHUL Quantum model
3. Deploy MX2 Inference engine
4. Integrate with ASX quantum features

---

## 🐛 Troubleshooting

### Problem: Models not responding

```bash
# Check if model files exist
ls -lh /path/to/backend/models/*/

# Check PHP error logs
tail -f /var/log/apache2/error.log

# Test direct PHP execution
php /path/to/backend/models/janus-pro/chat.php
```

### Problem: Out of memory

```bash
# Use quantized models (Q4_K_M recommended)
./quantize model.gguf model-q4.gguf Q4_K_M

# Or use smaller models first:
# - Llama 3 8B instead of 70B
# - Mistral 7B
# - CodeLlama 7B/13B instead of 34B
```

### Problem: Slow inference

```bash
# Enable GPU acceleration (if available)
./llama-cli -m model.gguf -ngl 32 # Offload 32 layers to GPU

# Use vLLM for production (much faster)
pip install vllm
python -m vllm.entrypoints.openai.api_server --model model-name
```

---

## 📈 Performance Optimization

### For Production Use

1. **Use vLLM or TensorRT-LLM** for GPU inference
2. **Enable batch processing** via MX2 Inference
3. **Set up model quantization** (Q4_K_M or Q5_K_M)
4. **Configure caching** in PHP endpoints
5. **Use Redis** for response caching
6. **Enable CDN** for API responses

### Expected Performance (with GPU)

| Model | Tokens/sec | Latency | RAM |
|-------|------------|---------|-----|
| Llama 3 8B | 50-100 | 100ms | 8GB |
| DeepSeek R1 | 30-60 | 150ms | 16GB |
| DeepSeek Coder | 40-80 | 120ms | 12GB |

---

## 🔐 Security Considerations

1. **API Rate Limiting**: Add to api.php
2. **Authentication**: Implement API keys
3. **Input Sanitization**: Escape all prompts
4. **CORS Configuration**: Restrict origins
5. **Model Access Control**: User permissions
6. **Logging**: Track all requests

---

## 📞 Next Steps

1. ✅ **Download at least one model** (recommend Llama 3 to start)
2. ✅ **Configure PHP endpoints** for that model
3. ✅ **Test via API gateway**
4. ✅ **Integrate with ASX frontend**
5. ✅ **Expand to more models** as needed

---

## 🆘 Support

If you encounter issues:

1. Check the PHP error logs
2. Verify model files are in correct locations
3. Test endpoints directly (not through ASX first)
4. Ensure inference framework is working standalone
5. Review BACKEND-SETUP.md for detailed steps

---

**Status**: Backend configured ✅ | Models awaiting download ⏳

**Next Action**: Download your first model and test the chat endpoint!

```bash
# Quick test command (once model is downloaded):
curl "https://api.asxtoken.com/api.php?route=chat&model=llama3&message=Hello+World"
```
