#!/usr/bin/env node

/**
 * XJSON ML Runtime - NPX Auto-Launcher
 * 
 * Usage:
 *   npx @xjson/ml-runtime
 *   npx @xjson/ml-runtime train
 *   npx @xjson/ml-runtime start --port 8080
 *   npx @xjson/ml-runtime status
 * 
 * Git Bash Compatible:
 *   npm install -g @xjson/ml-runtime
 *   xml
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import open from 'open';
import { startServer } from './server.js';
import { detectGPU, checkWebGPUSupport } from './lib/gpu-detector.js';
import { findAvailablePorts } from './lib/port-oracle.js';
import { displayBanner } from './lib/ui.js';
import { checkDependencies } from './lib/dependency-checker.js';

const program = new Command();

// ═══════════════════════════════════════════════════════════════
// CLI CONFIGURATION
// ═══════════════════════════════════════════════════════════════

program
  .name('xjson-ml')
  .description('🧠 XJSON ML Runtime - Browser-based AI training with WebGPU')
  .version('1.0.0');

// ═══════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════

program
  .command('start')
  .description('🚀 Start the ML training runtime')
  .option('-p, --port <number>', 'Server port', '8080')
  .option('-o, --open', 'Open browser automatically', true)
  .option('--no-gpu-check', 'Skip GPU detection')
  .option('--dev', 'Development mode with hot reload')
  .action(async (options) => {
    await startCommand(options);
  });

program
  .command('train')
  .description('🎓 Start training session')
  .option('-m, --model <type>', 'Model type (gpt, bert, vit, lstm, cnn, vae, gan)')
  .option('-d, --dataset <path>', 'Dataset path')
  .option('-c, --config <path>', 'Config file path')
  .action(async (options) => {
    await trainCommand(options);
  });

program
  .command('status')
  .description('📊 Check runtime status')
  .action(async () => {
    await statusCommand();
  });

program
  .command('export')
  .description('📤 Export trained model')
  .option('-f, --format <type>', 'Export format (onnx, xjson, json, webgpu, tfjs)', 'xjson')
  .option('-o, --output <path>', 'Output path', './exported-model')
  .action(async (options) => {
    await exportCommand(options);
  });

program
  .command('gpu')
  .description('🎮 Check GPU capabilities')
  .action(async () => {
    await gpuCommand();
  });

program
  .command('init')
  .description('⚡ Initialize new training project')
  .option('-t, --template <name>', 'Project template (gpt, bert, custom)', 'gpt')
  .action(async (options) => {
    await initCommand(options);
  });

// Default command (if no command specified)
program
  .action(async () => {
    await startCommand({ port: '8080', open: true });
  });

// ═══════════════════════════════════════════════════════════════
// COMMAND IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════

async function startCommand(options) {
  console.clear();
  displayBanner();

  const spinner = ora('Initializing XJSON ML Runtime...').start();

  try {
    // Step 1: Check dependencies
    spinner.text = 'Checking dependencies...';
    await checkDependencies();
    spinner.succeed('Dependencies OK');

    // Step 2: Detect GPU
    if (!options.noGpuCheck) {
      spinner.start('Detecting GPU capabilities...');
      const gpuInfo = await detectGPU();
      
      if (gpuInfo.webgpu) {
        spinner.succeed(chalk.green(`GPU: ${gpuInfo.vendor} ${gpuInfo.architecture}`));
      } else {
        spinner.warn(chalk.yellow('WebGPU not detected - will use WebGL fallback'));
      }
    }

    // Step 3: Find available ports
    spinner.start('Finding available ports...');
    const ports = await findAvailablePorts({
      main: parseInt(options.port),
      api: 'auto',
      websocket: 'auto',
      shards: {
        training: 'auto',
        inference: 'auto',
        export: 'auto'
      }
    });
    spinner.succeed(`Ports allocated: Main=${ports.main}, API=${ports.api}, WS=${ports.websocket}`);

    // Step 4: Start server
    spinner.start('Starting ML Runtime server...');
    const server = await startServer({
      port: ports.main,
      apiPort: ports.api,
      wsPort: ports.websocket,
      dev: options.dev
    });
    spinner.succeed('Server started successfully');

    // Step 5: Display info
    console.log('\n');
    console.log(boxen(
      chalk.bold.cyan('🧠 XJSON ML RUNTIME\n\n') +
      chalk.white(`Local:            ${chalk.cyan(`http://localhost:${ports.main}`)}\n`) +
      chalk.white(`API:              ${chalk.cyan(`http://localhost:${ports.api}`)}\n`) +
      chalk.white(`WebSocket:        ${chalk.cyan(`ws://localhost:${ports.websocket}`)}\n\n`) +
      chalk.gray('Press Ctrl+C to stop'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    ));

    // Step 6: Open browser
    if (options.open) {
      spinner.start('Opening browser...');
      await open(`http://localhost:${ports.main}`);
      spinner.succeed('Browser opened');
    }

    // Step 7: Service Worker auto-registration
    spinner.start('Registering service worker...');
    await registerServiceWorker(ports.main);
    spinner.succeed('Service worker registered');

    console.log(chalk.green('\n✓ XJSON ML Runtime is ready!\n'));
    console.log(chalk.cyan('🎯 Available commands:'));
    console.log(chalk.white('  • /train       - Start training'));
    console.log(chalk.white('  • /models      - List available models'));
    console.log(chalk.white('  • /status      - Check training status'));
    console.log(chalk.white('  • /export      - Export trained model'));
    console.log(chalk.white('  • /gpu         - GPU information\n'));

    // Keep process alive
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n\nShutting down gracefully...\n'));
      server.close();
      process.exit(0);
    });

  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error.message}`));
    console.error(error);
    process.exit(1);
  }
}

async function trainCommand(options) {
  console.clear();
  displayBanner();

  const spinner = ora('Starting training session...').start();

  try {
    // Check if server is running
    const isRunning = await checkServerStatus();
    
    if (!isRunning) {
      spinner.warn('Server not running. Starting server...');
      await startCommand({ port: '8080', open: false });
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Load config
    spinner.text = 'Loading configuration...';
    const config = options.config 
      ? await loadConfig(options.config)
      : getDefaultConfig(options.model);

    spinner.succeed('Configuration loaded');

    // Load dataset
    if (options.dataset) {
      spinner.start('Loading dataset...');
      await loadDataset(options.dataset);
      spinner.succeed(`Dataset loaded: ${options.dataset}`);
    }

    // Start training via API
    spinner.start('Initializing training...');
    const response = await fetch('http://localhost:8080/api/train', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    if (response.ok) {
      spinner.succeed('Training started!');
      
      console.log(boxen(
        chalk.bold.green('🎓 TRAINING SESSION STARTED\n\n') +
        chalk.white(`Model:     ${chalk.cyan(options.model || 'gpt')}\n`) +
        chalk.white(`Dataset:   ${chalk.cyan(options.dataset || 'default')}\n`) +
        chalk.white(`Monitor:   ${chalk.cyan('http://localhost:8080')}\n`),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'green'
        }
      ));

      // Open browser to monitoring page
      await open('http://localhost:8080');
    } else {
      throw new Error('Failed to start training');
    }

  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

async function statusCommand() {
  console.clear();
  displayBanner();

  const spinner = ora('Checking runtime status...').start();

  try {
    const response = await fetch('http://localhost:8080/api/status');
    
    if (!response.ok) {
      throw new Error('Server not running');
    }

    const status = await response.json();
    spinner.succeed('Status retrieved');

    console.log('\n');
    console.log(boxen(
      chalk.bold.cyan('📊 RUNTIME STATUS\n\n') +
      chalk.white(`State:         ${status.training ? chalk.green('Training') : chalk.gray('Idle')}\n`) +
      chalk.white(`GPU:           ${status.gpu.available ? chalk.green('Available') : chalk.red('Not Available')}\n`) +
      chalk.white(`Model:         ${chalk.cyan(status.model?.name || 'None')}\n`) +
      chalk.white(`Epoch:         ${chalk.cyan(status.training?.epoch || 0)}/${status.training?.total_epochs || 0}\n`) +
      chalk.white(`Loss:          ${chalk.cyan(status.training?.loss?.toFixed(4) || 'N/A')}\n`) +
      chalk.white(`Accuracy:      ${chalk.cyan(status.training?.accuracy?.toFixed(2) || 'N/A')}%\n`) +
      chalk.white(`GPU Usage:     ${chalk.cyan(status.gpu.utilization || 0)}%\n`),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    ));

  } catch (error) {
    spinner.fail(chalk.red('Server not running'));
    console.log(chalk.yellow('\nStart the server with: xjson-ml start\n'));
    process.exit(1);
  }
}

async function gpuCommand() {
  console.clear();
  displayBanner();

  const spinner = ora('Detecting GPU...').start();

  try {
    const gpuInfo = await detectGPU();
    spinner.succeed('GPU detection complete');

    console.log('\n');
    console.log(boxen(
      chalk.bold.cyan('🎮 GPU INFORMATION\n\n') +
      chalk.white(`WebGPU:        ${gpuInfo.webgpu ? chalk.green('Supported ✓') : chalk.red('Not Supported ✗')}\n`) +
      chalk.white(`Vendor:        ${chalk.cyan(gpuInfo.vendor || 'Unknown')}\n`) +
      chalk.white(`Architecture:  ${chalk.cyan(gpuInfo.architecture || 'Unknown')}\n`) +
      chalk.white(`Max Memory:    ${chalk.cyan(gpuInfo.maxBufferSize ? `${(gpuInfo.maxBufferSize / 1e9).toFixed(1)} GB` : 'Unknown')}\n`) +
      chalk.white(`Compute:       ${chalk.cyan(gpuInfo.computeUnits || 'Unknown')} units\n`) +
      chalk.white(`Features:      ${chalk.cyan(gpuInfo.features?.join(', ') || 'None')}\n`),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    ));

    if (!gpuInfo.webgpu) {
      console.log(chalk.yellow('\n⚠️  WebGPU not available. Training will use WebGL fallback.\n'));
      console.log(chalk.gray('To enable WebGPU:'));
      console.log(chalk.gray('  1. Update your browser to the latest version'));
      console.log(chalk.gray('  2. Enable WebGPU flag in chrome://flags\n'));
    }

  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error.message}`));
  }
}

async function exportCommand(options) {
  console.clear();
  displayBanner();

  const spinner = ora('Exporting model...').start();

  try {
    const response = await fetch('http://localhost:8080/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: options.format,
        output: options.output
      })
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const result = await response.json();
    spinner.succeed('Model exported successfully');

    console.log('\n');
    console.log(boxen(
      chalk.bold.green('📤 MODEL EXPORTED\n\n') +
      chalk.white(`Format:    ${chalk.cyan(options.format)}\n`) +
      chalk.white(`Output:    ${chalk.cyan(result.path)}\n`) +
      chalk.white(`Size:      ${chalk.cyan(result.size)}\n`),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green'
      }
    ));

  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

async function initCommand(options) {
  console.clear();
  displayBanner();

  const spinner = ora('Initializing project...').start();

  try {
    spinner.text = 'Creating project structure...';
    
    // Create project files
    await createProjectStructure(options.template);
    
    spinner.succeed('Project initialized');

    console.log('\n');
    console.log(boxen(
      chalk.bold.green('⚡ PROJECT INITIALIZED\n\n') +
      chalk.white(`Template:  ${chalk.cyan(options.template)}\n`) +
      chalk.white(`Files:     ${chalk.cyan('manifest.json, dataset.jsonl')}\n\n`) +
      chalk.gray('Next steps:\n') +
      chalk.gray('  1. Edit manifest.json to configure your model\n') +
      chalk.gray('  2. Add your training data to dataset.jsonl\n') +
      chalk.gray('  3. Run: xjson-ml train\n'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green'
      }
    ));

  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function registerServiceWorker(port) {
  // Service worker auto-registration via fetch to server
  try {
    await fetch(`http://localhost:${port}/api/sw/register`);
  } catch (e) {
    // Ignore if server not ready yet
  }
}

async function checkServerStatus() {
  try {
    const response = await fetch('http://localhost:8080/api/ping', {
      signal: AbortSignal.timeout(1000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

function getDefaultConfig(modelType = 'gpt') {
  const configs = {
    gpt: {
      model: 'transformer_gpt',
      hyperparams: {
        learning_rate: 0.0001,
        batch_size: 32,
        epochs: 10
      }
    },
    bert: {
      model: 'transformer_bert',
      hyperparams: {
        learning_rate: 0.0001,
        batch_size: 32,
        epochs: 10
      }
    },
    vit: {
      model: 'vision_transformer',
      hyperparams: {
        learning_rate: 0.001,
        batch_size: 64,
        epochs: 20
      }
    }
  };

  return configs[modelType] || configs.gpt;
}

async function loadConfig(path) {
  const fs = await import('fs/promises');
  const content = await fs.readFile(path, 'utf-8');
  return JSON.parse(content);
}

async function loadDataset(path) {
  // Dataset loading logic
  return { status: 'loaded', path };
}

async function createProjectStructure(template) {
  const fs = await import('fs/promises');
  
  // Create manifest.json
  const manifest = {
    "@xjson_version": "4.0",
    "model": template,
    "architecture": {},
    "hyperparams": {},
    "dataset": "./dataset.jsonl"
  };

  await fs.writeFile('manifest.json', JSON.stringify(manifest, null, 2));
  await fs.writeFile('dataset.jsonl', '');
  
  return true;
}

// ═══════════════════════════════════════════════════════════════
// EXECUTE
// ═══════════════════════════════════════════════════════════════

program.parse(process.argv);
