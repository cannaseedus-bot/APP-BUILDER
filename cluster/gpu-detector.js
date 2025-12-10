/**
 * GPU Detector
 * Detects WebGPU capabilities and GPU information
 */

import { launch } from 'puppeteer';

// ═══════════════════════════════════════════════════════════════
// GPU DETECTION
// ═══════════════════════════════════════════════════════════════

export async function detectGPU() {
  try {
    // Use puppeteer to detect GPU in headless Chrome
    const browser = await launch({
      headless: true,
      args: [
        '--enable-features=Vulkan,UseSkiaRenderer',
        '--enable-unsafe-webgpu',
        '--use-gl=angle',
        '--use-angle=vulkan'
      ]
    });

    const page = await browser.newPage();

    const gpuInfo = await page.evaluate(async () => {
      if (!('gpu' in navigator)) {
        return {
          webgpu: false,
          vendor: 'Unknown',
          architecture: 'Unknown'
        };
      }

      try {
        const adapter = await navigator.gpu.requestAdapter({
          powerPreference: 'high-performance'
        });

        if (!adapter) {
          return {
            webgpu: false,
            vendor: 'No adapter',
            architecture: 'Unknown'
          };
        }

        const info = await adapter.requestAdapterInfo();
        const limits = adapter.limits;
        const features = Array.from(adapter.features);

        return {
          webgpu: true,
          vendor: info.vendor || 'Unknown',
          architecture: info.architecture || 'Unknown',
          device: info.device || 'Unknown',
          description: info.description || '',
          maxBufferSize: limits.maxBufferSize,
          maxStorageBufferBindingSize: limits.maxStorageBufferBindingSize,
          maxComputeWorkgroupSizeX: limits.maxComputeWorkgroupSizeX,
          maxComputeWorkgroupSizeY: limits.maxComputeWorkgroupSizeY,
          maxComputeWorkgroupSizeZ: limits.maxComputeWorkgroupSizeZ,
          maxComputeWorkgroupsPerDimension: limits.maxComputeWorkgroupsPerDimension,
          features: features
        };
      } catch (e) {
        return {
          webgpu: false,
          error: e.message,
          vendor: 'Error',
          architecture: 'Unknown'
        };
      }
    });

    await browser.close();
    return gpuInfo;

  } catch (e) {
    // Fallback if puppeteer not available
    return {
      webgpu: false,
      vendor: 'Unknown',
      architecture: 'Unknown',
      error: 'Puppeteer not available',
      note: 'Install puppeteer for GPU detection: npm install puppeteer'
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// SIMPLE GPU CHECK (No browser required)
// ═══════════════════════════════════════════════════════════════

export async function checkWebGPUSupport() {
  try {
    const browser = await launch({ headless: true });
    const page = await browser.newPage();

    const supported = await page.evaluate(() => {
      return 'gpu' in navigator;
    });

    await browser.close();
    return supported;

  } catch (e) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// GPU BENCHMARK
// ═══════════════════════════════════════════════════════════════

export async function benchmarkGPU() {
  try {
    const browser = await launch({ headless: true });
    const page = await browser.newPage();

    const benchmark = await page.evaluate(async () => {
      if (!('gpu' in navigator)) {
        return { error: 'WebGPU not supported' };
      }

      const adapter = await navigator.gpu.requestAdapter();
      const device = await adapter.requestDevice();

      // Simple matrix multiplication benchmark
      const size = 1024;
      const workgroupSize = 16;

      // Create buffers
      const bufferA = device.createBuffer({
        size: size * size * 4,
        usage: GPUBufferUsage.STORAGE
      });

      const bufferB = device.createBuffer({
        size: size * size * 4,
        usage: GPUBufferUsage.STORAGE
      });

      const bufferC = device.createBuffer({
        size: size * size * 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
      });

      // Simple shader
      const shaderModule = device.createShaderModule({
        code: `
          @group(0) @binding(0) var<storage, read> a: array<f32>;
          @group(0) @binding(1) var<storage, read> b: array<f32>;
          @group(0) @binding(2) var<storage, read_write> c: array<f32>;

          @compute @workgroup_size(16, 16)
          fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
            let row = global_id.x;
            let col = global_id.y;
            let N = 1024u;
            
            if (row >= N || col >= N) {
              return;
            }

            var sum = 0.0;
            for (var k = 0u; k < N; k = k + 1u) {
              sum = sum + a[row * N + k] * b[k * N + col];
            }
            c[row * N + col] = sum;
          }
        `
      });

      const pipeline = device.createComputePipeline({
        layout: 'auto',
        compute: {
          module: shaderModule,
          entryPoint: 'main'
        }
      });

      // Run benchmark
      const start = performance.now();

      const commandEncoder = device.createCommandEncoder();
      const passEncoder = commandEncoder.beginComputePass();
      passEncoder.setPipeline(pipeline);
      passEncoder.dispatchWorkgroups(
        Math.ceil(size / workgroupSize),
        Math.ceil(size / workgroupSize)
      );
      passEncoder.end();

      device.queue.submit([commandEncoder.finish()]);
      await device.queue.onSubmittedWorkDone();

      const end = performance.now();

      return {
        time: end - start,
        gflops: (2 * size * size * size) / (end - start) / 1e6,
        matrixSize: size
      };
    });

    await browser.close();
    return benchmark;

  } catch (e) {
    return {
      error: e.message
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// GPU MEMORY ESTIMATION
// ═══════════════════════════════════════════════════════════════

export function estimateGPUMemory(modelParams) {
  // Rough estimation: 4 bytes per parameter (float32)
  const baseMemory = modelParams * 4;
  
  // Add memory for:
  // - Gradients (same size as params)
  // - Optimizer state (2x for Adam: m and v)
  // - Activations (varies, assume 2x params)
  const totalMemory = baseMemory * (1 + 1 + 2 + 2);

  return {
    base: baseMemory,
    total: totalMemory,
    formatted: formatBytes(totalMemory)
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// ═══════════════════════════════════════════════════════════════
// GPU RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════

export function getGPURecommendation(modelSize) {
  const recommendations = [
    {
      minParams: 0,
      maxParams: 10_000_000,
      gpu: 'Integrated GPU',
      memory: '2 GB',
      description: 'Sufficient for small models'
    },
    {
      minParams: 10_000_000,
      maxParams: 100_000_000,
      gpu: 'RTX 2060 / AMD RX 5700',
      memory: '6-8 GB',
      description: 'Good for medium models'
    },
    {
      minParams: 100_000_000,
      maxParams: 500_000_000,
      gpu: 'RTX 3080 / AMD RX 6800 XT',
      memory: '10-16 GB',
      description: 'Recommended for large models'
    },
    {
      minParams: 500_000_000,
      maxParams: 2_000_000_000,
      gpu: 'RTX 4090 / AMD RX 7900 XTX',
      memory: '24 GB',
      description: 'Required for very large models'
    },
    {
      minParams: 2_000_000_000,
      maxParams: Infinity,
      gpu: 'A100 / H100',
      memory: '40-80 GB',
      description: 'Required for huge models'
    }
  ];

  return recommendations.find(r => 
    modelSize >= r.minParams && modelSize < r.maxParams
  ) || recommendations[recommendations.length - 1];
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK DETECTION (Without puppeteer)
// ═══════════════════════════════════════════════════════════════

export function detectGPUFallback() {
  // Check Node.js environment variables
  const gpuInfo = {
    webgpu: false,
    vendor: 'Unknown',
    architecture: 'Unknown',
    note: 'Run in browser for accurate GPU detection'
  };

  // Check for NVIDIA GPU
  if (process.platform === 'linux') {
    try {
      const { execSync } = require('child_process');
      const nvidia = execSync('nvidia-smi --query-gpu=name --format=csv,noheader', {
        encoding: 'utf-8',
        stdio: 'pipe'
      }).trim();
      
      if (nvidia) {
        gpuInfo.vendor = 'NVIDIA';
        gpuInfo.device = nvidia;
      }
    } catch (e) {
      // nvidia-smi not available
    }
  }

  return gpuInfo;
}
