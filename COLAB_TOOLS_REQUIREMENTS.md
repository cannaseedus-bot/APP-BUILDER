# K'UHUL Colab Node - Required Tools & Dependencies

## 📋 Core Python Dependencies

### 1. **PyTorch** (`torch`)
- **Purpose**: Neural network training & GPU acceleration
- **K'UHUL Version**: `kuhul_torch_wrapper`
- **Usage**: Model loading, training, GPU utilization
- **Install**: `pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118`

### 2. **Transformers** (`transformers`)
- **Purpose**: Hugging Face model loading & inference
- **K'UHUL Version**: `kuhul_model_loader`
- **Usage**: Load base models (Mistral, Llama, etc.)
- **Install**: `pip install transformers>=4.37.0`

### 3. **PEFT** (`peft`)
- **Purpose**: Parameter-Efficient Fine-Tuning (LoRA/QLoRA)
- **K'UHUL Version**: `kuhul_lora_trainer`
- **Usage**: Apply LoRA adapters to models
- **Install**: `pip install peft>=0.8.0`

### 4. **Accelerate** (`accelerate`)
- **Purpose**: Distributed training & mixed precision
- **K'UHUL Version**: `kuhul_accelerator`
- **Usage**: Training optimization, GPU memory management
- **Install**: `pip install accelerate>=0.27.0`

### 5. **Datasets** (`datasets`)
- **Purpose**: Dataset loading & preprocessing
- **K'UHUL Version**: `kuhul_dataset_loader`
- **Usage**: Load JSONL training data
- **Install**: `pip install datasets>=2.16.0`

### 6. **BitsAndBytes** (`bitsandbytes`)
- **Purpose**: 8-bit/4-bit quantization
- **K'UHUL Version**: `kuhul_quantizer`
- **Usage**: Model quantization for memory efficiency
- **Install**: `pip install bitsandbytes>=0.42.0`

### 7. **WebSockets** (`websockets`)
- **Purpose**: K'UHUL hive communication
- **K'UHUL Version**: `kuhul_ws_client`
- **Usage**: Connect to K'UHUL mesh
- **Install**: `pip install websockets>=12.0`

### 8. **Flask** (`flask`)
- **Purpose**: REST API server on Colab
- **K'UHUL Version**: `kuhul_http_server`
- **Usage**: Expose /kuhul/* endpoints
- **Install**: `pip install flask>=3.0.0`

### 9. **Requests** (`requests`)
- **Purpose**: HTTP client for dataset downloads
- **K'UHUL Version**: `kuhul_http_client`
- **Usage**: Download datasets, model files
- **Install**: `pip install requests>=2.31.0`

### 10. **aiohttp** (`aiohttp`)
- **Purpose**: Async HTTP client
- **K'UHUL Version**: `kuhul_async_http`
- **Usage**: Async API calls, mesh communication
- **Install**: `pip install aiohttp>=3.9.0`

---

## 🛠️ External Tools

### 11. **ngrok**
- **Purpose**: Expose Colab to public URL
- **K'UHUL Version**: `kuhul_tunnel`
- **Usage**: Create HTTPS tunnel for node registration
- **Install**: `pip install pyngrok>=6.0.0`
- **Setup**: Requires ngrok auth token

### 12. **Unsloth** (`unsloth`)
- **Purpose**: 2x faster training, 60% less memory
- **K'UHUL Version**: `kuhul_fast_trainer`
- **Usage**: Optimized QLoRA training
- **Install**: `pip install unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git`

### 13. **TRL** (`trl`)
- **Purpose**: Transformer Reinforcement Learning
- **K'UHUL Version**: `kuhul_rlhf_trainer`
- **Usage**: DPO training, RLHF fine-tuning
- **Install**: `pip install trl>=0.7.10`

### 14. **SVD Weight Compressor**
- **Purpose**: SVG weight geometry compression
- **K'UHUL Version**: `kuhul_svg_compressor`
- **Usage**: Compress weights to SVG format
- **Custom**: Part of K'UHUL system

### 15. **SCXQ2 Compressor**
- **Purpose**: Quantum lattice compression
- **K'UHUL Version**: `kuhul_scxq2`
- **Usage**: 0.00008 compression ratio
- **Custom**: Part of K'UHUL system

---

## 📦 K'UHUL-Specific Tools

### 16. **K'UHUL Trainer Script** (`asx_ultra_trainer_qlora.py`)
- **Purpose**: Custom QLoRA trainer with K'UHUL enhancements
- **Features**: SVG weights, SCXQ2, multi-agent
- **Location**: Should be in Colab workspace

### 17. **K'UHUL Polyglot Bridge** (`kuhul_colab_integration.py`)
- **Purpose**: Browser-to-Colab Python bridge
- **Features**: PI GOAT polyglot integration
- **Location**: APP-BUILDER root

### 18. **Colab Launcher** (`colab_launcher.py`)
- **Purpose**: Main K'UHUL node launcher
- **Features**: Node registration, job handling
- **Location**: APP-BUILDER root

---

## 🎯 Optional Enhancement Tools

### 19. **Hugging Face Hub** (`huggingface_hub`)
- **Purpose**: Model/dataset hosting
- **Usage**: Push trained models to HF Hub
- **Install**: `pip install huggingface_hub>=0.20.0`

### 20. **Weights & Biases** (`wandb`)
- **Purpose**: Training metrics tracking
- **Usage**: Log training progress
- **Install**: `pip install wandb>=0.16.0`

### 21. **TensorBoard** (`tensorboard`)
- **Purpose**: Training visualization
- **Usage**: Monitor training curves
- **Install**: `pip install tensorboard>=2.15.0`

### 22. **SentencePiece** (`sentencepiece`)
- **Purpose**: Tokenization
- **Usage**: Required by some models
- **Install**: `pip install sentencepiece>=0.1.99`

### 23. **Protobuf** (`protobuf`)
- **Purpose**: Model serialization
- **Usage**: Required by transformers
- **Install**: `pip install protobuf>=4.25.0`

---

## 📝 Complete Installation Command

```bash
# Core dependencies
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install transformers>=4.37.0 peft>=0.8.0 accelerate>=0.27.0
pip install datasets>=2.16.0 bitsandbytes>=0.42.0
pip install websockets>=12.0 flask>=3.0.0 requests>=2.31.0 aiohttp>=3.9.0

# Unsloth for 2x faster training
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"

# RLHF & DPO training
pip install trl>=0.7.10

# Utilities
pip install pyngrok>=6.0.0 huggingface_hub>=0.20.0
pip install sentencepiece>=0.1.99 protobuf>=4.25.0

# Optional: Tracking & visualization
pip install wandb>=0.16.0 tensorboard>=2.15.0
```

---

## 🔧 K'UHUL Tool Versions

Each tool has a K'UHUL wrapper that integrates with the ASX Ghost OS:

1. **kuhul_torch_wrapper**: PyTorch with K'UHUL monitoring
2. **kuhul_model_loader**: Model loading with SVG weight support
3. **kuhul_lora_trainer**: LoRA training with SCXQ2 compression
4. **kuhul_accelerator**: Training acceleration with K'UHUL metrics
5. **kuhul_dataset_loader**: Dataset loading with K'UHUL format support
6. **kuhul_quantizer**: Quantization with SVG weight output
7. **kuhul_ws_client**: WebSocket client for K'UHUL mesh
8. **kuhul_http_server**: Flask server with K'UHUL endpoints
9. **kuhul_http_client**: HTTP client with K'UHUL protocol
10. **kuhul_async_http**: Async HTTP with K'UHUL mesh
11. **kuhul_tunnel**: Tunneling with auto-registration
12. **kuhul_fast_trainer**: Unsloth integration with K'UHUL
13. **kuhul_rlhf_trainer**: RLHF/DPO with K'UHUL feedback
14. **kuhul_svg_compressor**: SVG weight geometry compression
15. **kuhul_scxq2**: Quantum lattice compression (0.00008 ratio)

---

## 📊 System Requirements

### Minimum (Free Colab T4):
- GPU: NVIDIA T4 (15GB VRAM)
- RAM: 12GB system memory
- Storage: 78GB
- Runtime: 12 hours max

### Recommended (Colab Pro):
- GPU: NVIDIA A100 (40GB VRAM)
- RAM: 83GB system memory
- Storage: 166GB
- Runtime: 24 hours max

### Optimal (Colab Pro+):
- GPU: NVIDIA A100 (40GB VRAM)
- RAM: 166GB system memory
- Storage: 498GB
- Runtime: Background execution

---

## 🚀 Quick Setup Script

```python
# One-line K'UHUL Colab setup
!wget -q https://raw.githubusercontent.com/cannaseedus-bot/APP-BUILDER/main/colab_launcher.py
!wget -q https://raw.githubusercontent.com/cannaseedus-bot/APP-BUILDER/main/kuhul_colab_integration.py
!pip install -q websockets flask torch transformers peft accelerate datasets bitsandbytes pyngrok

# Initialize K'UHUL node
from colab_launcher import setup_kuhul_colab_node
node = setup_kuhul_colab_node()
```

---

## 🔐 Environment Variables

```bash
# Required for ngrok tunnel
NGROK_AUTH_TOKEN="your_token_here"

# Optional: Hugging Face for model uploads
HF_TOKEN="your_hf_token"

# Optional: Weights & Biases tracking
WANDB_API_KEY="your_wandb_key"

# K'UHUL specific
KUHUL_HIVE_URL="ws://your-hive-url:8765"
KUHUL_NODE_ID="colab_custom_id"
```

---

## 📚 Next Steps

1. Install dependencies using the command above
2. Upload `colab_launcher.py` and `kuhul_colab_integration.py` to Colab
3. Run `setup_kuhul_colab_node()` to initialize
4. Connect via ngrok and register node in K'UHUL OS
5. Submit training jobs from browser

See `kuhul_colab_tools.py` for K'UHUL-wrapped versions of each tool and `colab_requirements.json` for the complete XJSON manifest.
