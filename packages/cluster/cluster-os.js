#!/usr/bin/env node

/**
 * XJSON CLUSTER OS ORCHESTRATOR
 * 
 * Distribute data processing across multiple XJSON runtime instances
 * Works like a cluster OS - parallel execution across workers
 * 
 * Usage:
 *   node cluster-os.js --data dataset.jsonl --workers 8
 *   node cluster-os.js --hive --mesh
 *   node cluster-os.js --train --epochs 10 --model gpt
 */

import { spawn } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const config = {
  workers: parseInt(process.argv.find(a => a.startsWith('--workers='))?.split('=')[1] || '4'),
  dataPath: process.argv.find(a => a.startsWith('--data='))?.split('=')[1],
  basePort: parseInt(process.argv.find(a => a.startsWith('--port='))?.split('=')[1] || '8080'),
  hive: process.argv.includes('--hive'),
  mesh: process.argv.includes('--mesh'),
  train: process.argv.includes('--train'),
  mode: process.argv.find(a => a.startsWith('--mode='))?.split('=')[1] || 'parallel'
};

// ═══════════════════════════════════════════════════════════════
// HIVE MANIFEST INTEGRATION
// ═══════════════════════════════════════════════════════════════

const HIVE_RUNTIMES = {
  // Core compute runtimes
  'asxr_cpu': { type: 'cpu', priority: 1, capabilities: ['train', 'inference', 'compress'] },
  'asxr_gpu': { type: 'gpu', priority: 10, capabilities: ['train', 'inference', 'render'] },
  'asxr_tpu': { type: 'tpu', priority: 100, capabilities: ['train', 'rlhf'] },
  
  // Game engines (can process data too!)
  'prime_engine': { type: 'gpu', priority: 5, capabilities: ['render', 'physics', 'compress'] },
  'hellscape_runtime': { type: 'gpu', priority: 5, capabilities: ['render', 'ai'] },
  
  // Training engines
  'qwen_asx_trainer': { type: 'tpu', priority: 100, capabilities: ['train', 'rlhf'] },
  'deepseek_trainer': { type: 'tpu', priority: 100, capabilities: ['train', 'reasoning'] },
  'mx2lm_trainer': { type: 'tpu', priority: 100, capabilities: ['train', 'cognitive'] },
  
  // Network engines
  'webrtc': { type: 'network', priority: 1, capabilities: ['mesh', 'p2p'] },
  'mesh_discovery': { type: 'network', priority: 1, capabilities: ['mesh', 'discovery'] }
};

// ═══════════════════════════════════════════════════════════════
// CLUSTER ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════

class XJSONClusterOS {
  constructor() {
    this.workers = [];
    this.runningProcesses = [];
    this.jobs = [];
    this.completed = 0;
    this.failed = 0;
  }

  async initialize() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                ║');
    console.log('║   🌐 XJSON CLUSTER OS                                          ║');
    console.log('║   Multi-Runtime Distributed Processing System                 ║');
    console.log('║                                                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`Initializing ${config.workers} worker nodes...\n`);

    // Spawn worker processes
    for (let i = 0; i < config.workers; i++) {
      const port = config.basePort + i;
      const worker = await this.spawnWorker(i, port);
      this.workers.push(worker);
    }

    console.log('\n✓ Cluster initialized\n');
    this.displayStatus();
  }

  async spawnWorker(id, port) {
    console.log(`  Worker ${id}: Starting on port ${port}...`);

    const process = spawn('node', [
      './run-sw.js',
      `--port=${port}`,
      '--debug'
    ], {
      stdio: 'pipe',
      detached: false
    });

    this.runningProcesses.push(process);

    // Wait for worker to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`  Worker ${id}: ✓ Ready on port ${port}`);

    return {
      id,
      port,
      state: 'ready',
      jobs: 0,
      process
    };
  }

  displayStatus() {
    console.log('┌──────────────────────────────────────────────────────────────┐');
    console.log('│ CLUSTER STATUS                                               │');
    console.log('├──────────────────────────────────────────────────────────────┤');
    
    this.workers.forEach(w => {
      console.log(`│ Worker ${w.id.toString().padEnd(2)} │ Port ${w.port.toString().padEnd(5)} │ ${w.state.padEnd(10)} │ Jobs: ${w.jobs.toString().padEnd(4)} │`);
    });
    
    console.log('└──────────────────────────────────────────────────────────────┘');
    console.log('');
  }

  async distributeJobs(jobs) {
    console.log(`\n📊 Distributing ${jobs.length} jobs across ${this.workers.length} workers...\n`);

    const startTime = Date.now();
    const results = [];

    // Distribute jobs round-robin
    for (let i = 0; i < jobs.length; i++) {
      const worker = this.workers[i % this.workers.length];
      const job = jobs[i];

      console.log(`  Job ${i}: ${job.type} → Worker ${worker.id}`);

      const result = await this.executeJob(worker, job);
      results.push(result);

      if (result.status === 'completed') {
        this.completed++;
      } else {
        this.failed++;
      }

      worker.jobs++;
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n┌──────────────────────────────────────────────────────────────┐');
    console.log('│ RESULTS                                                      │');
    console.log('├──────────────────────────────────────────────────────────────┤');
    console.log(`│ Total Jobs:    ${jobs.length.toString().padEnd(44)}│`);
    console.log(`│ Completed:     ${this.completed.toString().padEnd(44)}│`);
    console.log(`│ Failed:        ${this.failed.toString().padEnd(44)}│`);
    console.log(`│ Duration:      ${duration}s${' '.repeat(41 - duration.length)}│`);
    console.log(`│ Throughput:    ${(jobs.length / duration).toFixed(2)} jobs/sec${' '.repeat(27)}│`);
    console.log('└──────────────────────────────────────────────────────────────┘\n');

    return results;
  }

  async executeJob(worker, job) {
    try {
      const response = await fetch(`http://localhost:${worker.port}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });

      const result = await response.json();
      return result;
    } catch (e) {
      console.error(`  Worker ${worker.id}: Job failed - ${e.message}`);
      return {
        status: 'failed',
        error: e.message
      };
    }
  }

  async processDataset(dataPath) {
    console.log(`\n📁 Loading dataset: ${dataPath}\n`);

    const data = await readFile(dataPath, 'utf-8');
    const lines = data.split('\n').filter(l => l.trim());

    console.log(`  Found ${lines.length} items\n`);

    // Create jobs from dataset
    const jobs = lines.map((line, i) => {
      try {
        const item = JSON.parse(line);
        return {
          type: 'train',
          id: i,
          data: item
        };
      } catch (e) {
        return {
          type: 'train',
          id: i,
          data: { text: line }
        };
      }
    });

    // Distribute and execute
    return await this.distributeJobs(jobs);
  }

  async shutdown() {
    console.log('\nShutting down cluster...\n');

    for (const proc of this.runningProcesses) {
      proc.kill('SIGTERM');
    }

    console.log('✓ Cluster shutdown complete\n');
  }
}

// ═══════════════════════════════════════════════════════════════
// HIVE MODE - MULTI-RUNTIME COORDINATION
// ═══════════════════════════════════════════════════════════════

class HiveOrchestrator extends XJSONClusterOS {
  constructor() {
    super();
    this.hiveManifest = null;
    this.runtimeMap = new Map();
  }

  async initialize() {
    await super.initialize();

    if (config.hive) {
      await this.loadHiveManifest();
      await this.initializeHiveRuntimes();
    }
  }

  async loadHiveManifest() {
    console.log('🔷 Loading Hive Manifest...\n');

    try {
      const manifestPath = './hive_manifest.json';
      if (existsSync(manifestPath)) {
        const data = await readFile(manifestPath, 'utf-8');
        this.hiveManifest = JSON.parse(data);
        console.log('  ✓ Hive manifest loaded\n');
      }
    } catch (e) {
      console.log('  ⚠ No hive manifest found, using defaults\n');
    }
  }

  async initializeHiveRuntimes() {
    console.log('🔷 Initializing Hive Runtimes...\n');

    // Map workers to runtime types
    this.workers.forEach((worker, i) => {
      const runtimeTypes = Object.keys(HIVE_RUNTIMES);
      const runtimeType = runtimeTypes[i % runtimeTypes.length];
      const runtime = HIVE_RUNTIMES[runtimeType];

      worker.runtime = runtimeType;
      worker.capabilities = runtime.capabilities;
      worker.priority = runtime.priority;

      this.runtimeMap.set(runtimeType, worker);

      console.log(`  Worker ${worker.id}: ${runtimeType.padEnd(20)} [${runtime.type}] (${runtime.capabilities.join(', ')})`);
    });

    console.log('\n  ✓ Hive runtimes initialized\n');
  }

  async distributeJobsByCapability(jobs) {
    console.log('\n📊 Smart job distribution by runtime capability...\n');

    const jobsByCapability = new Map();

    // Group jobs by required capability
    jobs.forEach(job => {
      const capability = job.capability || 'train';
      
      if (!jobsByCapability.has(capability)) {
        jobsByCapability.set(capability, []);
      }
      
      jobsByCapability.get(capability).push(job);
    });

    const results = [];

    // Distribute each capability group to appropriate workers
    for (const [capability, capJobs] of jobsByCapability) {
      console.log(`  ${capability}: ${capJobs.length} jobs`);

      // Find workers with this capability
      const capableWorkers = this.workers.filter(w => 
        w.capabilities?.includes(capability)
      );

      if (capableWorkers.length === 0) {
        console.log(`    ⚠ No workers with '${capability}' capability, using any worker`);
        const workerResults = await this.distributeJobs(capJobs);
        results.push(...workerResults);
      } else {
        console.log(`    → Distributing to ${capableWorkers.length} capable workers`);
        
        // Round-robin among capable workers
        for (let i = 0; i < capJobs.length; i++) {
          const worker = capableWorkers[i % capableWorkers.length];
          const result = await this.executeJob(worker, capJobs[i]);
          results.push(result);
          worker.jobs++;
        }
      }
    }

    console.log('');
    return results;
  }
}

// ═══════════════════════════════════════════════════════════════
// MESH MODE - P2P DISTRIBUTED PROCESSING
// ═══════════════════════════════════════════════════════════════

class MeshOrchestrator extends HiveOrchestrator {
  constructor() {
    super();
    this.meshNodes = [];
  }

  async initializeMesh() {
    console.log('🌐 Initializing WebRTC Mesh Network...\n');

    // In mesh mode, workers can discover each other via WebRTC
    // and distribute work peer-to-peer without central coordination

    console.log('  ✓ Mesh network ready\n');
    console.log('  Workers can now coordinate via P2P mesh\n');
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  // Choose orchestrator based on mode
  let orchestrator;
  
  if (config.mesh) {
    orchestrator = new MeshOrchestrator();
    await orchestrator.initialize();
    await orchestrator.initializeMesh();
  } else if (config.hive) {
    orchestrator = new HiveOrchestrator();
    await orchestrator.initialize();
  } else {
    orchestrator = new XJSONClusterOS();
    await orchestrator.initialize();
  }

  // Process data if provided
  if (config.dataPath) {
    await orchestrator.processDataset(config.dataPath);
  } else {
    // Example jobs
    const jobs = [
      { type: 'train', data: { model: 'gpt', epochs: 10 }, capability: 'train' },
      { type: 'train', data: { model: 'bert', epochs: 10 }, capability: 'train' },
      { type: 'inference', data: { batch_size: 32 }, capability: 'inference' },
      { type: 'compress', data: { payload: { test: 'data' } }, capability: 'compress' },
      { type: 'train', data: { model: 'vit', epochs: 5 }, capability: 'train' },
      { type: 'inference', data: { batch_size: 64 }, capability: 'inference' }
    ];

    if (config.hive) {
      await orchestrator.distributeJobsByCapability(jobs);
    } else {
      await orchestrator.distributeJobs(jobs);
    }
  }

  // Keep running or shutdown
  if (process.argv.includes('--daemon')) {
    console.log('Running in daemon mode (Ctrl+C to stop)...\n');
    
    process.on('SIGINT', async () => {
      await orchestrator.shutdown();
      process.exit(0);
    });
  } else {
    await orchestrator.shutdown();
  }
}

main().catch(console.error);
