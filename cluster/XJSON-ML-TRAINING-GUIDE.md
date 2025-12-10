# 🎓 XJSON ML RUNTIME - ADVANCED TRAINING GUIDE

## **Master AI Model Training in the Browser**

This guide covers advanced techniques, real-world examples, and optimization strategies for training production-grade AI models with the XJSON ML Runtime.

---

## 📑 TABLE OF CONTENTS

1. [Training Fundamentals](#training-fundamentals)
2. [Hyperparameter Tuning](#hyperparameter-tuning)
3. [Model Architecture Design](#model-architecture-design)
4. [Dataset Preparation](#dataset-preparation)
5. [Training Optimization](#training-optimization)
6. [Debugging & Troubleshooting](#debugging--troubleshooting)
7. [Production Deployment](#production-deployment)
8. [Real-World Examples](#real-world-examples)

---

## 🎯 TRAINING FUNDAMENTALS

### **The Training Loop**

```
┌─────────────────────────────────────┐
│                                     │
│  1. Forward Pass                    │
│     - Input → Model → Predictions   │
│                                     │
│  2. Loss Computation                │
│     - Compare predictions to labels │
│                                     │
│  3. Backward Pass                   │
│     - Compute gradients             │
│                                     │
│  4. Optimizer Step                  │
│     - Update weights                │
│                                     │
└─────────────────────────────────────┘
```

### **Key Concepts**

#### **1. Learning Rate**
The most important hyperparameter.

```javascript
// Too high: model diverges
learning_rate: 0.1  // ❌ Too high for most models

// Good: stable learning
learning_rate: 0.0001  // ✅ Safe default

// Too low: training too slow
learning_rate: 0.000001  // ❌ Will take forever
```

**Rule of thumb**: Start with `0.0001` and adjust based on loss curve.

#### **2. Batch Size**
Number of samples processed together.

```javascript
// Small batch: noisy gradients, slow
batch_size: 8  // Good for small datasets

// Medium batch: balanced
batch_size: 32  // ✅ Recommended default

// Large batch: fast but requires more memory
batch_size: 128  // Good for large datasets
```

**Trade-offs**:
- Larger batch = faster training but more memory
- Smaller batch = less memory but noisier gradients

#### **3. Epochs**
Number of complete passes through the dataset.

```javascript
// Quick test
epochs: 3

// Standard training
epochs: 10  // ✅ Recommended

// Extensive training
epochs: 100  // For large models
```

**Rule of thumb**: Stop when validation loss plateaus.

---

## 🎛️ HYPERPARAMETER TUNING

### **The Grid Search Approach**

```javascript
const hyperparameters = {
  learning_rate: [0.001, 0.0001, 0.00001],
  batch_size: [16, 32, 64],
  optimizer: ['adam', 'adamw', 'sgd'],
  weight_decay: [0, 0.01, 0.1]
};

// Try all combinations
for (const lr of hyperparameters.learning_rate) {
  for (const bs of hyperparameters.batch_size) {
    for (const opt of hyperparameters.optimizer) {
      await trainModel({ 
        learning_rate: lr, 
        batch_size: bs,
        optimizer: opt 
      });
    }
  }
}
```

### **The One-Cycle Learning Rate Schedule**

Best practice for fast convergence:

```javascript
{
  "lr_schedule": {
    "type": "one_cycle",
    "max_lr": 0.001,
    "total_steps": 10000,
    "pct_start": 0.3,  // Warmup for 30% of training
    "anneal_strategy": "cos"
  }
}
```

**Benefits**:
- Faster convergence
- Better final accuracy
- Avoids plateaus

### **Warmup Steps**

Essential for stable training:

```javascript
{
  "warmup_steps": 1000,  // Gradually increase LR
  "learning_rate": 0.0001
}
```

**Why warmup?**
- Prevents early instability
- Allows model to "settle in"
- Critical for large models

---

## 🏗️ MODEL ARCHITECTURE DESIGN

### **Scaling Laws**

**Parameters vs Performance**:
```
10M params   → 70% accuracy
100M params  → 85% accuracy
1B params    → 92% accuracy
10B params   → 95% accuracy
```

**Compute budget**:
```javascript
// Small: Fast training, good for prototyping
{
  "num_layers": 6,
  "dim": 512,
  "num_heads": 8
}

// Medium: Balanced (Recommended)
{
  "num_layers": 12,
  "dim": 768,
  "num_heads": 12
}

// Large: High quality, slow training
{
  "num_layers": 24,
  "dim": 1024,
  "num_heads": 16
}
```

### **Architecture Patterns**

#### **Residual Connections**
Essential for deep networks:

```json
{
  "type": "residual_block",
  "layers": [
    {"type": "linear", "in": 768, "out": 3072},
    {"type": "gelu"},
    {"type": "linear", "in": 3072, "out": 768}
  ],
  "connection": "add"  // Input + Output
}
```

**Why?** Prevents vanishing gradients in deep models.

#### **Layer Normalization**
Stabilizes training:

```json
{
  "type": "layer_norm",
  "dim": 768,
  "eps": 1e-5
}
```

**When to use**:
- After each transformer block
- Before residual connections
- In deep networks

#### **Dropout**
Prevents overfitting:

```json
{
  "type": "dropout",
  "p": 0.1  // Drop 10% of activations
}
```

**Guidelines**:
- 0.1 for large datasets
- 0.2-0.3 for small datasets
- 0.5 for very small datasets

---

## 📊 DATASET PREPARATION

### **Data Quality Checklist**

✅ **Clean**:
- Remove duplicates
- Fix typos and errors
- Consistent formatting

✅ **Balanced**:
- Equal samples per class (for classification)
- Diverse examples

✅ **Representative**:
- Covers all use cases
- Includes edge cases

✅ **Sufficient**:
```
Classification:  1K+ samples per class
Generation:      10K+ samples
Fine-tuning:     100+ high-quality samples
```

### **Data Augmentation**

#### **For Text**:
```javascript
// Synonym replacement
"The quick brown fox" → "The fast brown fox"

// Back-translation
English → French → English

// Random insertion
"The fox jumps" → "The quick fox jumps"

// Random deletion
"The quick brown fox" → "The quick fox"
```

#### **For Images**:
```javascript
{
  "augmentation": {
    "random_crop": true,
    "random_flip": true,
    "color_jitter": {
      "brightness": 0.2,
      "contrast": 0.2,
      "saturation": 0.2
    },
    "random_rotation": 15
  }
}
```

### **Train/Val/Test Split**

Standard splits:
```javascript
{
  "train": 0.8,   // 80% for training
  "val": 0.1,     // 10% for validation
  "test": 0.1     // 10% for final testing
}
```

**Important**: Never touch test set during training!

---

## ⚡ TRAINING OPTIMIZATION

### **1. Mixed Precision Training**

**2x faster, 2x less memory**:

```javascript
{
  "mixed_precision": {
    "enabled": true,
    "compute_dtype": "float16",  // Fast computation
    "storage_dtype": "float32"   // Accurate storage
  }
}
```

**When to use**: Always (unless you have issues).

**Loss scaling**:
```javascript
{
  "loss_scale": "dynamic",  // Prevents underflow
  "init_scale": 65536,
  "growth_interval": 2000
}
```

### **2. Gradient Accumulation**

Train bigger models:

```javascript
{
  "gradient_accumulation": {
    "enabled": true,
    "accumulation_steps": 4  // Simulate 4x larger batch
  }
}
```

**Example**:
```
batch_size: 32
accumulation_steps: 4
Effective batch size: 128
```

**Benefits**:
- Train models that don't fit in memory
- Simulate large batch sizes
- More stable gradients

### **3. Flash Attention**

**4x faster, 10x less memory**:

```javascript
{
  "flash_attention": {
    "enabled": true,
    "block_size": 128
  }
}
```

**Comparison**:
```
Standard Attention:
- Sequence length: 2048
- Memory: 8 GB
- Time: 100ms

Flash Attention:
- Sequence length: 2048
- Memory: 0.8 GB
- Time: 25ms
```

### **4. Gradient Checkpointing**

Train 3x larger models:

```javascript
{
  "gradient_checkpointing": {
    "enabled": true,
    "checkpoint_every_n_layers": 2
  }
}
```

**Trade-off**: 30% slower, but 3x less memory.

### **5. Model Parallelism**

Split model across multiple GPUs:

```javascript
{
  "model_parallelism": {
    "enabled": true,
    "num_partitions": 4,
    "partition_strategy": "layer"
  }
}
```

### **Performance Tips**

#### **Maximize GPU Utilization**
```javascript
// Check GPU usage
while (training) {
  const gpuUtil = getGPUUtilization();
  if (gpuUtil < 80%) {
    // Increase batch size
    batch_size *= 1.5;
  }
}
```

#### **Optimal Batch Size**
```javascript
// Binary search for max batch size
let batchSize = 32;
while (true) {
  try {
    await trainStep(batchSize);
    batchSize *= 2;  // Try larger
  } catch (OutOfMemoryError) {
    batchSize /= 2;  // Too large, go back
    break;
  }
}
```

---

## 🐛 DEBUGGING & TROUBLESHOOTING

### **Loss Not Decreasing**

**Symptom**: Loss stays constant or increases.

**Solutions**:
1. **Check learning rate**:
   ```javascript
   // Try 10x lower
   learning_rate: 0.00001  // Instead of 0.0001
   ```

2. **Check data**:
   ```javascript
   // Verify labels are correct
   console.log(dataset[0]);
   ```

3. **Check gradients**:
   ```javascript
   // Gradient norm should be 0.1-10
   const gradNorm = computeGradientNorm();
   console.log('Gradient norm:', gradNorm);
   ```

4. **Add warmup**:
   ```javascript
   warmup_steps: 1000
   ```

### **Model Overfitting**

**Symptom**: Training loss decreases, validation loss increases.

**Solutions**:
1. **Add dropout**:
   ```javascript
   dropout: 0.2
   ```

2. **Add weight decay**:
   ```javascript
   weight_decay: 0.01
   ```

3. **More data**:
   - Get more training samples
   - Use data augmentation

4. **Smaller model**:
   ```javascript
   num_layers: 6  // Instead of 12
   ```

### **Training Too Slow**

**Symptom**: Takes hours per epoch.

**Solutions**:
1. **Enable mixed precision**:
   ```javascript
   mixed_precision: true
   ```

2. **Increase batch size**:
   ```javascript
   batch_size: 64  // Instead of 32
   ```

3. **Enable Flash Attention**:
   ```javascript
   flash_attention: true
   ```

4. **Use gradient accumulation**:
   ```javascript
   accumulation_steps: 4
   ```

### **Out of Memory**

**Symptom**: GPU memory error.

**Solutions**:
1. **Reduce batch size**:
   ```javascript
   batch_size: 16  // Instead of 32
   ```

2. **Enable gradient checkpointing**:
   ```javascript
   gradient_checkpointing: true
   ```

3. **Use mixed precision**:
   ```javascript
   mixed_precision: true
   ```

4. **Reduce model size**:
   ```javascript
   num_layers: 6,
   dim: 512
   ```

### **NaN Loss**

**Symptom**: Loss becomes NaN.

**Solutions**:
1. **Reduce learning rate**:
   ```javascript
   learning_rate: 0.00001
   ```

2. **Add gradient clipping**:
   ```javascript
   gradient_clip: 1.0
   ```

3. **Check for bad data**:
   ```javascript
   // Remove NaN/Inf values
   dataset = dataset.filter(x => isFinite(x));
   ```

---

## 🚀 PRODUCTION DEPLOYMENT

### **Model Optimization**

#### **1. Quantization**
Reduce model size by 4x:

```javascript
{
  "quantization": {
    "enabled": true,
    "method": "dynamic",
    "dtype": "int8"
  }
}
```

**Results**:
```
Original:     400 MB
Quantized:    100 MB
Accuracy:     -0.5%
Speed:        2x faster
```

#### **2. Pruning**
Remove unnecessary weights:

```javascript
{
  "pruning": {
    "enabled": true,
    "method": "magnitude",
    "sparsity": 0.5  // Remove 50% of weights
  }
}
```

**Results**:
```
Original:     85M params
Pruned:       42.5M params
Accuracy:     -1%
Speed:        1.8x faster
```

#### **3. Knowledge Distillation**
Train a smaller student model:

```javascript
{
  "distillation": {
    "enabled": true,
    "teacher_model": "gpt-large",
    "temperature": 2.0,
    "alpha": 0.5
  }
}
```

**Results**:
```
Teacher:      350M params, 92% accuracy
Student:      85M params, 90% accuracy
Speedup:      4x faster
```

### **Inference Optimization**

#### **Batch Inference**
Process multiple inputs together:

```javascript
// Slow: one at a time
for (const input of inputs) {
  await model.predict(input);
}

// Fast: batched
await model.predict(inputs);  // All at once
```

#### **ONNX Runtime**
2-3x faster inference:

```javascript
// Export to ONNX
await exportModel('onnx');

// Load in ONNX Runtime
const session = await ort.InferenceSession.create('model.onnx');
const output = await session.run(input);
```

---

## 💡 REAL-WORLD EXAMPLES

### **Example 1: Fine-tune GPT for Code Completion**

**Goal**: Autocomplete Python code.

#### **1. Prepare Dataset**
```python
# collect_code.py
import os
import json

code_samples = []
for root, dirs, files in os.walk('./my_project'):
    for file in files:
        if file.endswith('.py'):
            with open(os.path.join(root, file)) as f:
                code = f.read()
                code_samples.append({'text': code})

with open('code_dataset.jsonl', 'w') as f:
    for sample in code_samples:
        f.write(json.dumps(sample) + '\n')
```

#### **2. Configure Model**
```javascript
{
  "model": "transformer_gpt",
  "architecture": {
    "vocab_size": 50000,
    "max_seq_length": 1024,
    "num_layers": 6,
    "num_heads": 12,
    "dim": 768
  },
  "hyperparams": {
    "learning_rate": 0.00001,  // Low LR for fine-tuning
    "batch_size": 16,
    "epochs": 3,
    "warmup_steps": 500
  }
}
```

#### **3. Train**
```javascript
// Load model
const model = await loadPretrainedModel('gpt-small');

// Load dataset
const dataset = await loadDataset('code_dataset.jsonl');

// Fine-tune
await train(model, dataset, {
  learning_rate: 0.00001,
  epochs: 3,
  batch_size: 16,
  gradient_accumulation: 4
});

// Export
await exportModel('xjson', {
  iconic: true,
  compress: true
});
```

#### **4. Deploy**
```javascript
// Load in production
const model = await loadModel('code-autocomplete.xjson');

// Predict
const context = "def fibonacci(n):";
const completion = await model.generate(context, {
  max_length: 50,
  temperature: 0.7
});
// Output: "\n    if n <= 1:\n        return n\n    ..."
```

---

### **Example 2: Train Image Classifier (Dog Breeds)**

**Goal**: Classify 120 dog breeds.

#### **1. Prepare Dataset**
```
dataset/
├── train/
│   ├── beagle/
│   │   ├── img1.jpg
│   │   ├── img2.jpg
│   ├── labrador/
│   │   ├── img1.jpg
│   │   ├── img2.jpg
└── val/
    ├── beagle/
    ├── labrador/
```

#### **2. Configure Model**
```javascript
{
  "model": "vision_transformer",
  "architecture": {
    "image_size": 224,
    "patch_size": 16,
    "num_layers": 12,
    "num_heads": 12,
    "dim": 768,
    "num_classes": 120
  },
  "hyperparams": {
    "learning_rate": 0.001,
    "batch_size": 64,
    "epochs": 20,
    "augmentation": {
      "random_crop": true,
      "random_flip": true,
      "color_jitter": 0.2
    }
  }
}
```

#### **3. Train**
```javascript
// Load dataset
const dataset = await loadImageDataset('./dataset', {
  image_size: 224,
  augmentation: true
});

// Create model
const model = await createModel('vision_transformer', {
  num_classes: 120
});

// Train
await train(model, dataset, {
  learning_rate: 0.001,
  epochs: 20,
  batch_size: 64,
  mixed_precision: true
});

// Evaluate
const testAccuracy = await evaluate(model, dataset.test);
console.log('Test accuracy:', testAccuracy);
```

#### **4. Deploy**
```javascript
// Export to ONNX
await exportModel('onnx', {
  optimize: true,
  quantize: 'int8'
});

// Deploy to mobile
// ... (use ONNX Runtime Mobile)
```

---

### **Example 3: Build a Chatbot (Customer Service)**

**Goal**: Answer customer questions about products.

#### **1. Prepare Dataset**
```jsonl
{"input": "What's your return policy?", "output": "You can return items within 30 days for a full refund."}
{"input": "How long does shipping take?", "output": "Standard shipping takes 3-5 business days."}
{"input": "Do you offer expedited shipping?", "output": "Yes, expedited shipping takes 1-2 business days."}
```

#### **2. Configure Model**
```javascript
{
  "model": "transformer_bert",
  "architecture": {
    "vocab_size": 30000,
    "max_seq_length": 512,
    "num_layers": 6,
    "num_heads": 8,
    "dim": 512
  },
  "task": "sequence_to_sequence"
}
```

#### **3. Train**
```javascript
// Load dataset
const dataset = await loadDataset('customer_qa.jsonl');

// Create model
const model = await createModel('transformer_bert');

// Train
await train(model, dataset, {
  learning_rate: 0.0001,
  epochs: 10,
  batch_size: 32
});
```

#### **4. Deploy**
```javascript
// Create chatbot endpoint
const chatbot = {
  async respond(question) {
    const input = tokenize(question);
    const output = await model.generate(input);
    return decode(output);
  }
};

// Use in production
const answer = await chatbot.respond("What's your return policy?");
console.log(answer);
// Output: "You can return items within 30 days for a full refund."
```

---

## 📈 BEST PRACTICES SUMMARY

### **✅ DO**

1. **Start with a small model** and scale up
2. **Use validation set** to prevent overfitting
3. **Save checkpoints** regularly
4. **Monitor metrics** (loss, accuracy, GPU usage)
5. **Use mixed precision** for faster training
6. **Visualize** loss curves and gradients
7. **Test on held-out data** before deployment

### **❌ DON'T**

1. **Don't skip warmup** for large models
2. **Don't use test set** during training
3. **Don't ignore validation loss** (overfitting warning)
4. **Don't train for too long** (diminishing returns)
5. **Don't forget to normalize** inputs
6. **Don't use single-precision** when mixed precision works
7. **Don't deploy without evaluation**

---

## 🎓 FURTHER LEARNING

### **Papers to Read**
1. "Attention Is All You Need" (Transformers)
2. "BERT: Pre-training of Deep Bidirectional Transformers"
3. "Flash Attention: Fast and Memory-Efficient Exact Attention"
4. "An Image is Worth 16x16 Words" (Vision Transformer)
5. "Mixed Precision Training"

### **Courses**
1. Stanford CS231n (Computer Vision)
2. Stanford CS224n (NLP)
3. Fast.ai Deep Learning Course
4. DeepLearning.AI Specialization

### **Experiment!**
The best way to learn is to train models:
- Try different architectures
- Compare optimizers
- Tune hyperparameters
- Break things and fix them

---

## 💬 COMMUNITY

Join our community:
- **Discord**: Share experiments and get help
- **GitHub**: Contribute examples and improvements
- **Forum**: Deep technical discussions

---

**Happy Training! 🚀**

**Remember**: Every expert was once a beginner. Start simple, experiment often, and you'll master AI training in no time.
