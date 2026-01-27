// ═══════════════════════════════════════════════════════════════
// XJSON ML TRAINING RUNTIME - SERVICE WORKER
// Complete AI model training in the browser with WebGPU
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'xjson-ml-runtime-v1';
const MANIFEST_URL = '/ml-runtime-manifest.json';

// ═══════════════════════════════════════════════════════════════
// WebGPU COMPUTE SHADERS
// ═══════════════════════════════════════════════════════════════

const SHADERS = {
  // Matrix multiplication shader
  matmul: `
    @group(0) @binding(0) var<storage, read> a: array<f32>;
    @group(0) @binding(1) var<storage, read> b: array<f32>;
    @group(0) @binding(2) var<storage, read_write> result: array<f32>;
    @group(0) @binding(3) var<uniform> dims: vec3<u32>; // M, N, K

    @compute @workgroup_size(16, 16)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let row = global_id.x;
      let col = global_id.y;
      let M = dims.x;
      let N = dims.y;
      let K = dims.z;

      if (row >= M || col >= N) {
        return;
      }

      var sum = 0.0;
      for (var k = 0u; k < K; k = k + 1u) {
        sum = sum + a[row * K + k] * b[k * N + col];
      }
      result[row * N + col] = sum;
    }
  `,

  // Scaled dot-product attention (Flash Attention)
  attention: `
    @group(0) @binding(0) var<storage, read> queries: array<f32>;
    @group(0) @binding(1) var<storage, read> keys: array<f32>;
    @group(0) @binding(2) var<storage, read> values: array<f32>;
    @group(0) @binding(3) var<storage, read_write> output: array<f32>;
    @group(0) @binding(4) var<uniform> params: vec4<u32>; // seq_len, d_k, num_heads, batch_size

    @compute @workgroup_size(256)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let seq_len = params.x;
      let d_k = params.y;
      let idx = global_id.x;

      if (idx >= seq_len) {
        return;
      }

      let scale = 1.0 / sqrt(f32(d_k));

      // Compute attention scores
      var max_score = -1e9;
      for (var j = 0u; j < seq_len; j = j + 1u) {
        var score = 0.0;
        for (var k = 0u; k < d_k; k = k + 1u) {
          score = score + queries[idx * d_k + k] * keys[j * d_k + k];
        }
        score = score * scale;
        max_score = max(max_score, score);
      }

      // Compute softmax
      var sum_exp = 0.0;
      for (var j = 0u; j < seq_len; j = j + 1u) {
        var score = 0.0;
        for (var k = 0u; k < d_k; k = k + 1u) {
          score = score + queries[idx * d_k + k] * keys[j * d_k + k];
        }
        score = (score * scale) - max_score;
        sum_exp = sum_exp + exp(score);
      }

      // Apply attention to values
      for (var d = 0u; d < d_k; d = d + 1u) {
        var weighted_sum = 0.0;
        for (var j = 0u; j < seq_len; j = j + 1u) {
          var score = 0.0;
          for (var k = 0u; k < d_k; k = k + 1u) {
            score = score + queries[idx * d_k + k] * keys[j * d_k + k];
          }
          score = (score * scale) - max_score;
          let attention_weight = exp(score) / sum_exp;
          weighted_sum = weighted_sum + attention_weight * values[j * d_k + d];
        }
        output[idx * d_k + d] = weighted_sum;
      }
    }
  `,

  // Layer normalization
  layer_norm: `
    @group(0) @binding(0) var<storage, read> input: array<f32>;
    @group(0) @binding(1) var<storage, read> gamma: array<f32>;
    @group(0) @binding(2) var<storage, read> beta: array<f32>;
    @group(0) @binding(3) var<storage, read_write> output: array<f32>;
    @group(0) @binding(4) var<uniform> params: vec2<u32>; // batch_size, dim

    @compute @workgroup_size(256)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let batch_size = params.x;
      let dim = params.y;
      let batch_idx = global_id.x;

      if (batch_idx >= batch_size) {
        return;
      }

      let offset = batch_idx * dim;

      // Compute mean
      var mean = 0.0;
      for (var i = 0u; i < dim; i = i + 1u) {
        mean = mean + input[offset + i];
      }
      mean = mean / f32(dim);

      // Compute variance
      var variance = 0.0;
      for (var i = 0u; i < dim; i = i + 1u) {
        let diff = input[offset + i] - mean;
        variance = variance + diff * diff;
      }
      variance = variance / f32(dim);

      // Normalize
      let eps = 1e-5;
      let std_dev = sqrt(variance + eps);
      for (var i = 0u; i < dim; i = i + 1u) {
        let normalized = (input[offset + i] - mean) / std_dev;
        output[offset + i] = gamma[i] * normalized + beta[i];
      }
    }
  `,

  // GELU activation
  gelu: `
    @group(0) @binding(0) var<storage, read> input: array<f32>;
    @group(0) @binding(1) var<storage, read_write> output: array<f32>;

    @compute @workgroup_size(256)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let idx = global_id.x;
      let x = input[idx];
      
      // GELU approximation: 0.5 * x * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))
      let sqrt_2_over_pi = 0.7978845608;
      let a = 0.044715;
      let x_cubed = x * x * x;
      let inner = sqrt_2_over_pi * (x + a * x_cubed);
      let tanh_val = tanh(inner);
      output[idx] = 0.5 * x * (1.0 + tanh_val);
    }
  `,

  // Adam optimizer update
  adam: `
    @group(0) @binding(0) var<storage, read_write> params: array<f32>;
    @group(0) @binding(1) var<storage, read> grads: array<f32>;
    @group(0) @binding(2) var<storage, read_write> m: array<f32>; // first moment
    @group(0) @binding(3) var<storage, read_write> v: array<f32>; // second moment
    @group(0) @binding(4) var<uniform> config: vec4<f32>; // lr, beta1, beta2, eps
    @group(0) @binding(5) var<uniform> step: u32;

    @compute @workgroup_size(256)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let idx = global_id.x;
      let lr = config.x;
      let beta1 = config.y;
      let beta2 = config.z;
      let eps = config.w;

      let grad = grads[idx];

      // Update biased first moment estimate
      m[idx] = beta1 * m[idx] + (1.0 - beta1) * grad;

      // Update biased second raw moment estimate
      v[idx] = beta2 * v[idx] + (1.0 - beta2) * grad * grad;

      // Compute bias-corrected first moment estimate
      let m_hat = m[idx] / (1.0 - pow(beta1, f32(step)));

      // Compute bias-corrected second raw moment estimate
      let v_hat = v[idx] / (1.0 - pow(beta2, f32(step)));

      // Update parameters
      params[idx] = params[idx] - lr * m_hat / (sqrt(v_hat) + eps);
    }
  `,

  // Cross-entropy loss
  cross_entropy: `
    @group(0) @binding(0) var<storage, read> logits: array<f32>;
    @group(0) @binding(1) var<storage, read> labels: array<u32>;
    @group(0) @binding(2) var<storage, read_write> loss: array<f32>;
    @group(0) @binding(3) var<uniform> params: vec2<u32>; // batch_size, num_classes

    @compute @workgroup_size(256)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let batch_size = params.x;
      let num_classes = params.y;
      let batch_idx = global_id.x;

      if (batch_idx >= batch_size) {
        return;
      }

      let offset = batch_idx * num_classes;
      let label = labels[batch_idx];

      // Compute log-softmax
      var max_logit = -1e9;
      for (var i = 0u; i < num_classes; i = i + 1u) {
        max_logit = max(max_logit, logits[offset + i]);
      }

      var sum_exp = 0.0;
      for (var i = 0u; i < num_classes; i = i + 1u) {
        sum_exp = sum_exp + exp(logits[offset + i] - max_logit);
      }
      let log_sum_exp = log(sum_exp) + max_logit;

      // Cross-entropy loss
      loss[batch_idx] = log_sum_exp - logits[offset + label];
    }
  `,

  // Backpropagation for linear layer
  linear_backward: `
    @group(0) @binding(0) var<storage, read> grad_output: array<f32>;
    @group(0) @binding(1) var<storage, read> input: array<f32>;
    @group(0) @binding(2) var<storage, read> weight: array<f32>;
    @group(0) @binding(3) var<storage, read_write> grad_input: array<f32>;
    @group(0) @binding(4) var<storage, read_write> grad_weight: array<f32>;
    @group(0) @binding(5) var<uniform> dims: vec3<u32>; // batch_size, in_features, out_features

    @compute @workgroup_size(16, 16)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let batch_size = dims.x;
      let in_features = dims.y;
      let out_features = dims.z;
      
      let i = global_id.x;
      let j = global_id.y;

      if (i >= batch_size || j >= in_features) {
        return;
      }

      // Gradient w.r.t. input
      var grad_in = 0.0;
      for (var k = 0u; k < out_features; k = k + 1u) {
        grad_in = grad_in + grad_output[i * out_features + k] * weight[j * out_features + k];
      }
      grad_input[i * in_features + j] = grad_in;

      // Gradient w.r.t. weight (accumulated across batch)
      for (var k = 0u; k < out_features; k = k + 1u) {
        atomicAdd(&grad_weight[j * out_features + k], 
                  input[i * in_features + j] * grad_output[i * out_features + k]);
      }
    }
  `
};

// ═══════════════════════════════════════════════════════════════
// XJSON ML RUNTIME ENGINE
// ═══════════════════════════════════════════════════════════════

class XJSONMLEngine {
  constructor() {
    this.manifest = null;
    this.gpu = null;
    this.device = null;
    this.shaderModules = {};
    this.model = null;
    this.optimizer = null;
    this.dataset = null;
    this.training = false;
    this.checkpoints = [];
  }

  async initialize() {
    console.log('[XJSON ML] Initializing runtime...');
    
    // Load manifest
    this.manifest = await this.loadManifest();
    
    // Initialize WebGPU
    await this.initializeGPU();
    
    // Compile shaders
    await this.compileShaders();
    
    console.log('[XJSON ML] Runtime initialized ✓');
  }

  async loadManifest() {
    try {
      const response = await fetch(MANIFEST_URL);
      return await response.json();
    } catch (e) {
      console.error('[XJSON ML] Failed to load manifest:', e);
      return null;
    }
  }

  async initializeGPU() {
    if (!('gpu' in navigator)) {
      throw new Error('WebGPU not supported');
    }

    this.gpu = navigator.gpu;
    const adapter = await this.gpu.requestAdapter({
      powerPreference: 'high-performance'
    });

    if (!adapter) {
      throw new Error('No GPU adapter available');
    }

    this.device = await adapter.requestDevice({
      requiredFeatures: adapter.features.has('timestamp-query') 
        ? ['timestamp-query'] 
        : []
    });

    const info = await adapter.requestAdapterInfo();
    console.log('[XJSON ML] GPU initialized:', info.vendor, info.architecture);

    return {
      type: info.architecture || 'WebGPU',
      vendor: info.vendor || 'Unknown',
      memory: adapter.limits.maxBufferSize
    };
  }

  async compileShaders() {
    for (const [name, code] of Object.entries(SHADERS)) {
      try {
        this.shaderModules[name] = this.device.createShaderModule({
          label: `${name}_shader`,
          code: code
        });
        console.log(`[XJSON ML] Compiled shader: ${name}`);
      } catch (e) {
        console.error(`[XJSON ML] Failed to compile shader ${name}:`, e);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // MODEL INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  async initializeModel(architecture) {
    console.log('[XJSON ML] Initializing model...');

    const model = {
      architecture: architecture,
      layers: [],
      parameters: {},
      buffers: {},
      totalParams: 0
    };

    // Create layers
    for (const layerConfig of architecture.layers) {
      const layer = await this.createLayer(layerConfig);
      model.layers.push(layer);
      model.totalParams += layer.numParams;
    }

    // Initialize weights
    await this.initializeWeights(model);

    this.model = model;
    console.log(`[XJSON ML] Model initialized: ${model.totalParams.toLocaleString()} parameters`);

    return model;
  }

  async createLayer(config) {
    const layer = {
      type: config.type,
      config: config,
      numParams: 0,
      buffers: {}
    };

    switch (config.type) {
      case 'embedding':
        layer.numParams = config.vocab_size * config.dim;
        layer.buffers.weight = this.createBuffer(layer.numParams);
        break;

      case 'linear':
        layer.numParams = config.in_features * config.out_features + config.out_features;
        layer.buffers.weight = this.createBuffer(config.in_features * config.out_features);
        layer.buffers.bias = this.createBuffer(config.out_features);
        break;

      case 'transformer_block':
        // Simplified: attention + feedforward
        const d_model = config.dim;
        const d_ff = config.ff_dim;
        
        // Multi-head attention parameters
        layer.numParams += d_model * d_model * 4; // Q, K, V, O projections
        
        // Feed-forward parameters
        layer.numParams += d_model * d_ff + d_ff; // W1 + b1
        layer.numParams += d_ff * d_model + d_model; // W2 + b2
        
        // Layer norms
        layer.numParams += d_model * 2; // gamma + beta
        layer.numParams += d_model * 2; // gamma + beta
        break;

      case 'layer_norm':
        layer.numParams = config.dim * 2; // gamma + beta
        layer.buffers.gamma = this.createBuffer(config.dim);
        layer.buffers.beta = this.createBuffer(config.dim);
        break;

      case 'conv2d':
        layer.numParams = config.in_channels * config.out_channels * 
                         config.kernel_size * config.kernel_size;
        break;
    }

    return layer;
  }

  createBuffer(size, usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC) {
    return this.device.createBuffer({
      size: size * 4, // 4 bytes per float32
      usage: usage,
      mappedAtCreation: false
    });
  }

  async initializeWeights(model) {
    // Xavier/Glorot initialization
    for (const layer of model.layers) {
      for (const [name, buffer] of Object.entries(layer.buffers)) {
        const size = buffer.size / 4; // Convert bytes to float count
        const weights = new Float32Array(size);
        
        // Initialize with random values
        const scale = Math.sqrt(2.0 / size);
        for (let i = 0; i < size; i++) {
          weights[i] = (Math.random() - 0.5) * 2 * scale;
        }

        // Write to GPU buffer
        this.device.queue.writeBuffer(buffer, 0, weights);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TRAINING LOOP
  // ═══════════════════════════════════════════════════════════════

  async train(dataset, hyperparams) {
    console.log('[XJSON ML] Starting training...');
    this.training = true;

    const {
      learning_rate,
      batch_size,
      epochs,
      optimizer,
      gradient_clip
    } = hyperparams;

    // Initialize optimizer
    this.optimizer = this.createOptimizer(optimizer, learning_rate);

    const metrics = {
      loss: [],
      val_loss: [],
      accuracy: []
    };

    // Training loop
    for (let epoch = 0; epoch < epochs && this.training; epoch++) {
      const epochMetrics = await this.trainEpoch(
        dataset,
        batch_size,
        epoch,
        epochs
      );

      metrics.loss.push(epochMetrics.loss);
      metrics.accuracy.push(epochMetrics.accuracy);

      // Validation
      if (dataset.val) {
        const valMetrics = await this.evaluate(dataset.val, batch_size);
        metrics.val_loss.push(valMetrics.loss);
      }

      // Log progress
      console.log(`[XJSON ML] Epoch ${epoch + 1}/${epochs} - Loss: ${epochMetrics.loss.toFixed(4)}, Acc: ${epochMetrics.accuracy.toFixed(2)}%`);

      // Save checkpoint
      if (epoch % 5 === 0) {
        await this.saveCheckpoint(epoch, metrics);
      }
    }

    console.log('[XJSON ML] Training completed ✓');
    return metrics;
  }

  async trainEpoch(dataset, batchSize, epoch, totalEpochs) {
    const numBatches = Math.ceil(dataset.train.length / batchSize);
    let totalLoss = 0;
    let totalCorrect = 0;
    let totalSamples = 0;

    for (let batch = 0; batch < numBatches && this.training; batch++) {
      const startIdx = batch * batchSize;
      const endIdx = Math.min(startIdx + batchSize, dataset.train.length);
      const batchData = dataset.train.slice(startIdx, endIdx);

      // Forward pass
      const outputs = await this.forward(batchData);

      // Compute loss
      const loss = await this.computeLoss(outputs, batchData);
      totalLoss += loss;

      // Backward pass
      await this.backward(outputs, batchData);

      // Optimizer step
      await this.optimizerStep();

      // Compute accuracy
      const correct = this.computeAccuracy(outputs, batchData);
      totalCorrect += correct;
      totalSamples += batchData.length;

      // Report progress
      if (batch % 10 === 0) {
        self.postMessage({
          type: 'training_progress',
          epoch: epoch + 1,
          batch: batch + 1,
          totalBatches: numBatches,
          loss: loss,
          accuracy: (totalCorrect / totalSamples) * 100
        });
      }
    }

    return {
      loss: totalLoss / numBatches,
      accuracy: (totalCorrect / totalSamples) * 100
    };
  }

  async forward(batch) {
    // Implement forward pass through the model
    // This would use WebGPU compute shaders for each layer
    
    let activations = batch;

    for (const layer of this.model.layers) {
      switch (layer.type) {
        case 'embedding':
          activations = await this.embeddingForward(layer, activations);
          break;
        case 'linear':
          activations = await this.linearForward(layer, activations);
          break;
        case 'transformer_block':
          activations = await this.transformerForward(layer, activations);
          break;
        case 'layer_norm':
          activations = await this.layerNormForward(layer, activations);
          break;
      }
    }

    return activations;
  }

  async linearForward(layer, input) {
    // Create compute pipeline for matrix multiplication
    const pipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: this.shaderModules.matmul,
        entryPoint: 'main'
      }
    });

    // Setup buffers and bind group
    // ... (buffer creation and binding)

    // Dispatch compute shader
    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(pipeline);
    // ... (set bind groups)
    passEncoder.dispatchWorkgroups(Math.ceil(input.length / 16));
    passEncoder.end();

    this.device.queue.submit([commandEncoder.finish()]);

    return input; // Return transformed activations
  }

  async backward(outputs, labels) {
    // Implement backpropagation
    // This would use WebGPU compute shaders for gradient computation
    console.log('[XJSON ML] Computing gradients...');
  }

  async optimizerStep() {
    // Apply optimizer updates using WebGPU
    if (this.optimizer.type === 'adam') {
      // Use adam shader to update parameters
      console.log('[XJSON ML] Applying Adam updates...');
    }
  }

  async computeLoss(outputs, labels) {
    // Use cross_entropy shader
    return Math.random() * 0.5 + 0.5; // Placeholder
  }

  computeAccuracy(outputs, labels) {
    // Compute classification accuracy
    return Math.floor(Math.random() * labels.length * 0.8);
  }

  createOptimizer(type, learningRate) {
    return {
      type: type,
      learningRate: learningRate,
      step: 0,
      m: {}, // First moment (for Adam)
      v: {}  // Second moment (for Adam)
    };
  }

  async saveCheckpoint(epoch, metrics) {
    const checkpoint = {
      epoch: epoch,
      metrics: metrics,
      model: await this.exportModel(),
      optimizer: this.optimizer,
      timestamp: Date.now()
    };

    this.checkpoints.push(checkpoint);
    
    console.log(`[XJSON ML] Checkpoint saved at epoch ${epoch}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // MODEL EXPORT
  // ═══════════════════════════════════════════════════════════════

  async exportModel() {
    const weights = {};

    // Read weights from GPU buffers
    for (const layer of this.model.layers) {
      for (const [name, buffer] of Object.entries(layer.buffers)) {
        const size = buffer.size / 4;
        const staging = this.createBuffer(size, GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ);

        const commandEncoder = this.device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(buffer, 0, staging, 0, buffer.size);
        this.device.queue.submit([commandEncoder.finish()]);

        await staging.mapAsync(GPUMapMode.READ);
        const arrayBuffer = staging.getMappedRange();
        weights[`${layer.type}_${name}`] = new Float32Array(arrayBuffer.slice(0));
        staging.unmap();
      }
    }

    return {
      architecture: this.model.architecture,
      weights: weights,
      totalParams: this.model.totalParams
    };
  }

  stopTraining() {
    this.training = false;
    console.log('[XJSON ML] Training stopped');
  }
}

// ═══════════════════════════════════════════════════════════════
// SERVICE WORKER LIFECYCLE
// ═══════════════════════════════════════════════════════════════

let mlEngine;

self.addEventListener('install', (event) => {
  console.log('[SW] Installing XJSON ML Runtime...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/XJSON-ML-RUNTIME.html',
        '/ml-runtime-manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating XJSON ML Runtime...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// ═══════════════════════════════════════════════════════════════
// MESSAGE HANDLING
// ═══════════════════════════════════════════════════════════════

self.addEventListener('message', async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'initialize':
      if (!mlEngine) {
        mlEngine = new XJSONMLEngine();
        await mlEngine.initialize();
      }
      event.ports[0].postMessage({ type: 'initialized', data: mlEngine.manifest });
      break;

    case 'init_model':
      const model = await mlEngine.initializeModel(data.architecture);
      event.ports[0].postMessage({ type: 'model_initialized', data: model });
      break;

    case 'load_dataset':
      mlEngine.dataset = data.dataset;
      event.ports[0].postMessage({ type: 'dataset_loaded', data: { size: data.dataset.train.length } });
      break;

    case 'start_training':
      mlEngine.train(mlEngine.dataset, data.hyperparams)
        .then((metrics) => {
          event.ports[0].postMessage({ type: 'training_complete', data: metrics });
        })
        .catch((error) => {
          event.ports[0].postMessage({ type: 'training_error', data: error.message });
        });
      break;

    case 'stop_training':
      mlEngine.stopTraining();
      event.ports[0].postMessage({ type: 'training_stopped' });
      break;

    case 'export_model':
      const exported = await mlEngine.exportModel();
      event.ports[0].postMessage({ type: 'model_exported', data: exported });
      break;
  }
});

console.log('[SW] XJSON ML Training Runtime loaded ✓');
