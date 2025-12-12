# Model Compatibility Notes

## 🔄 SafeTensors Format Compatibility

### Key Insight
**The `model.safetensors` file can be used across different Qwen model variants** if they share the same architecture configuration.

## ✅ What Makes Models Compatible

Models are compatible if they have matching:

1. **Architecture Type**: `Qwen2ForCausalLM`
2. **Hidden Size**: 1024
3. **Number of Layers**: 24
4. **Attention Heads**: 16
5. **Vocabulary Size**: 151662
6. **Max Position Embeddings**: 8192

## 📊 Compatibility Matrix

| Model | Size | Architecture | Compatible? |
|-------|------|--------------|-------------|
| Qwen-ASX | 1.8GB | Qwen2ForCausalLM-1.8B | ✅ Base |
| QwenF1 | 1.84GB | Qwen2ForCausalLM-1.8B | ✅ Compatible |
| Any Qwen-1.8B | ~1.8GB | Qwen2ForCausalLM-1.8B | ✅ Compatible |

### Why They're Compatible

```json
// Qwen-ASX config.json
{
  "architectures": ["Qwen2ForCausalLM"],
  "hidden_size": 1024,
  "num_hidden_layers": 24,
  "num_attention_heads": 16,
  "vocab_size": 151662
}

// QwenF1 config.json
{
  "architectures": ["Qwen2ForCausalLM"],
  "hidden_size": 1024,
  "num_hidden_layers": 24,
  "num_attention_heads": 16,
  "vocab_size": 151662
}

// ✅ Same architecture → SafeTensors are interchangeable!
```

## 🔀 Interchangeable Components

### Model Weights (SafeTensors)
```
✅ Qwen-ASX/model.safetensors CAN be used with QwenF1
✅ QwenF1/model.safetensors CAN be used with Qwen-ASX
✅ Any Qwen-1.8B model.safetensors can be swapped
```

**Why?** SafeTensors format is architecture-agnostic. If layer names and shapes match, they're compatible.

### Tokenizer
```
⚠️  Different tokenizer sizes (Qwen-ASX: 3.9MB, QwenF1: 15.14MB)
✅  But vocab_size is the same (151662)
✅  MX2LEX (44KB) works for BOTH
```

**Recommendation:** Use MX2LEX instead of model-specific tokenizers.

### Config Files
```
⚠️  Use the config.json from the model you're deploying
✅  Or create universal config if architectures match
```

---

## 💡 Practical Examples

### Example 1: Use QwenF1 weights with Qwen-ASX tokenizer
```bash
# Download QwenF1 model
curl -O https://mx2lm.app/QwenF1/model.safetensors

# Use with Qwen-ASX tokenizer (smaller!)
curl -O https://mx2lm.app/Qwen-ASX/vocab.json
curl -O https://mx2lm.app/Qwen-ASX/tokenizer.json

# Or even better: Use MX2LEX (44KB)
curl -X POST /mx2lex -d '{"action":"export"}' > mx2lex.scxq2
```

### Example 2: Use Qwen-ASX weights with QwenF1 training state
```bash
# Start with Qwen-ASX model (stable)
curl -O https://mx2lm.app/Qwen-ASX/model.safetensors

# Continue training with QwenF1 optimizer
curl -O https://mx2lm.app/QwenF1/optimizer.pt

# Use MX2GYM to continue training
curl -X POST /mx2gym -d '{
  "action": "train_fold",
  "model_url": "Qwen-ASX/model.safetensors",
  "optimizer_url": "QwenF1/optimizer.pt",
  "fold_id": "fold_custom_v1"
}'
```

### Example 3: Mix and match checkpoints
```bash
# Use QwenF1 checkpoint-100 weights
curl -O https://mx2lm.app/QwenF1/checkpoint-100/model.safetensors

# With Qwen-ASX configs
curl -O https://mx2lm.app/Qwen-ASX/config.json
curl -O https://mx2lm.app/Qwen-ASX/generation_config.json

# And MX2LEX tokenizer
curl -X POST /mx2lex -d '{"action":"export"}'
```

---

## ⚠️ What's NOT Compatible

### Different Model Sizes
```
❌ Qwen-1.8B model.safetensors ≠ Qwen-7B model.safetensors
❌ Qwen-1.8B tokenizer ≠ Qwen-7B tokenizer
```

### Different Architectures
```
❌ Qwen2ForCausalLM ≠ Qwen1ForCausalLM
❌ QwenForCausalLM ≠ LlamaForCausalLM
```

### Different Vocabulary Sizes
```
❌ vocab_size: 151662 ≠ vocab_size: 32000
```

---

## 🎯 Recommended Combinations

### For Inference (Smallest Download)
```
Model:     QwenF1/model.safetensors (1.84GB)
Config:    Qwen-ASX/config.json (2KB - smaller)
Tokenizer: MX2LEX (44KB)
Total:     1.84GB
```

### For Training (Best State)
```
Model:     QwenF1/checkpoint-375/model.safetensors
Optimizer: QwenF1/optimizer.pt (3.68GB)
Scheduler: QwenF1/scheduler.pt
Tokenizer: MX2LEX (44KB)
Total:     5.52GB
```

### For Production (Most Stable)
```
Model:     Qwen-ASX/model.safetensors (1.8GB)
Config:    Qwen-ASX/config.json
Tokenizer: MX2LEX (44KB)
Total:     1.8GB
```

---

## 🔧 Universal Configuration

### Create a Universal Config
```json
{
  "@context": "xjson://qwen/universal/config/v1",
  "description": "Universal config for all Qwen-1.8B models",

  "architectures": ["Qwen2ForCausalLM"],
  "hidden_size": 1024,
  "num_attention_heads": 16,
  "num_hidden_layers": 24,
  "vocab_size": 151662,
  "max_position_embeddings": 8192,
  "intermediate_size": 2816,
  "rms_norm_eps": 1e-06,

  "compatible_models": [
    "Qwen-ASX",
    "QwenF1",
    "Any Qwen-1.8B variant"
  ],

  "tokenizer": "Use MX2LEX (44KB) for all models",
  "note": "model.safetensors files are interchangeable"
}
```

---

## 📊 Size Savings with Universal Approach

### Traditional Approach (Download Everything)
```
Qwen-ASX:  5.6GB (model + optimizer + tokenizer)
QwenF1:    30GB+ (model + state + checkpoints + tokenizer)
Total:     35.6GB
```

### Universal Approach (Smart Reuse)
```
One model.safetensors:  1.84GB (use for both)
One optimizer.pt:       3.68GB (use for both)
One MX2LEX lexicon:     44KB   (use for both)
Total:                  5.52GB

Savings:                30.08GB (84% reduction!)
```

---

## 🚀 Quick Start with Universal Setup

```bash
# 1. Download one model (QwenF1 has latest weights)
curl -O https://mx2lm.app/QwenF1/model.safetensors

# 2. Download one optimizer (for training)
curl -O https://mx2lm.app/QwenF1/optimizer.pt

# 3. Download one config (Qwen-ASX is smaller)
curl -O https://mx2lm.app/Qwen-ASX/config.json
curl -O https://mx2lm.app/Qwen-ASX/generation_config.json

# 4. Use one tokenizer for everything
curl -X POST /mx2lex -d '{"action":"export"}' > mx2lex.scxq2

# 5. Use with ANY Qwen-1.8B task:
# - Inference (MX2QF1)
# - Training (MX2GYM)
# - Fine-tuning (MX2GYM + fold-deltas)
```

---

## ✅ Benefits of Universal Approach

1. **Storage Savings**: 84% reduction (35.6GB → 5.52GB)
2. **Flexibility**: Mix and match components
3. **Simplicity**: One setup works for all Qwen-1.8B models
4. **Performance**: MX2LEX is faster than any model-specific tokenizer
5. **Maintenance**: Update one component, benefit everywhere

---

## 📚 Summary

**Key Takeaway:** All Qwen-1.8B models share the same architecture, making `model.safetensors` files interchangeable.

**Best Practice:**
- Download ONE model.safetensors (latest from QwenF1)
- Use ONE MX2LEX lexicon (44KB) for all tokenization
- Reuse across Qwen-ASX, QwenF1, and any Qwen-1.8B variant

**Result:** 84% storage savings + faster tokenization + universal compatibility

---

**Law**: `SAFETENSORS_FORMAT → ARCHITECTURE_COMPATIBILITY → UNIVERSAL_REUSE`
