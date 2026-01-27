/**
 * UI Utilities
 * Beautiful terminal displays for XJSON ML Runtime
 */

import chalk from 'chalk';
import boxen from 'boxen';

// ═══════════════════════════════════════════════════════════════
// ASCII ART BANNER
// ═══════════════════════════════════════════════════════════════

export function displayBanner() {
  const banner = `
██╗  ██╗     ██╗███████╗ ██████╗ ███╗   ██╗
╚██╗██╔╝     ██║██╔════╝██╔═══██╗████╗  ██║
 ╚███╔╝█████╗██║███████╗██║   ██║██╔██╗ ██║
 ██╔██╗╚════╝██║╚════██║██║   ██║██║╚██╗██║
██╔╝ ██╗     ██║███████║╚██████╔╝██║ ╚████║
╚═╝  ╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝
                                             
███╗   ███╗██╗         ██████╗ ██╗   ██╗███╗   ██╗████████╗██╗███╗   ███╗███████╗
████╗ ████║██║         ██╔══██╗██║   ██║████╗  ██║╚══██╔══╝██║████╗ ████║██╔════╝
██╔████╔██║██║         ██████╔╝██║   ██║██╔██╗ ██║   ██║   ██║██╔████╔██║█████╗  
██║╚██╔╝██║██║         ██╔══██╗██║   ██║██║╚██╗██║   ██║   ██║██║╚██╔╝██║██╔══╝  
██║ ╚═╝ ██║███████╗    ██║  ██║╚██████╔╝██║ ╚████║   ██║   ██║██║ ╚═╝ ██║███████╗
╚═╝     ╚═╝╚══════╝    ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝
  `;

  console.log(chalk.cyan(banner));
  console.log(chalk.gray('                     Browser-Based AI Training with WebGPU'));
  console.log(chalk.gray('                     Version 1.0.0 | MIT License\n'));
}

// ═══════════════════════════════════════════════════════════════
// COMPACT BANNER (for smaller terminals)
// ═══════════════════════════════════════════════════════════════

export function displayCompactBanner() {
  console.log('\n');
  console.log(boxen(
    chalk.bold.cyan('🧠 XJSON ML RUNTIME\n') +
    chalk.gray('Browser-Based AI Training'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));
}

// ═══════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════

export function progressBar(current, total, width = 40) {
  const percentage = (current / total) * 100;
  const filled = Math.round((width * current) / total);
  const empty = width - filled;

  const bar = 
    chalk.cyan('█'.repeat(filled)) +
    chalk.gray('░'.repeat(empty));

  return `[${bar}] ${percentage.toFixed(1)}%`;
}

// ═══════════════════════════════════════════════════════════════
// TABLE DISPLAY
// ═══════════════════════════════════════════════════════════════

export function displayTable(headers, rows) {
  const columnWidths = headers.map((header, i) => {
    const maxRowWidth = Math.max(...rows.map(row => 
      String(row[i] || '').length
    ));
    return Math.max(header.length, maxRowWidth);
  });

  // Header
  const headerRow = headers.map((header, i) => 
    chalk.bold.cyan(header.padEnd(columnWidths[i]))
  ).join('  ');

  console.log(headerRow);
  console.log(chalk.gray('─'.repeat(headerRow.length)));

  // Rows
  rows.forEach(row => {
    const rowStr = row.map((cell, i) => 
      String(cell || '').padEnd(columnWidths[i])
    ).join('  ');
    console.log(rowStr);
  });
}

// ═══════════════════════════════════════════════════════════════
// STATUS INDICATORS
// ═══════════════════════════════════════════════════════════════

export const status = {
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  waiting: (msg) => console.log(chalk.gray('◌'), msg),
  running: (msg) => console.log(chalk.cyan('●'), msg)
};

// ═══════════════════════════════════════════════════════════════
// METRIC DISPLAY
// ═══════════════════════════════════════════════════════════════

export function displayMetrics(metrics) {
  const box = boxen(
    Object.entries(metrics).map(([key, value]) => {
      const label = chalk.gray(key.padEnd(15));
      const val = chalk.cyan(value);
      return `${label} ${val}`;
    }).join('\n'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      title: chalk.bold('📊 Metrics'),
      titleAlignment: 'center'
    }
  );

  console.log(box);
}

// ═══════════════════════════════════════════════════════════════
// TRAINING PROGRESS
// ═══════════════════════════════════════════════════════════════

export function displayTrainingProgress(state) {
  const {
    epoch,
    totalEpochs,
    batch,
    totalBatches,
    loss,
    accuracy
  } = state;

  console.clear();
  displayCompactBanner();

  console.log(chalk.bold.white('\n📈 Training Progress\n'));

  // Epoch progress
  console.log(chalk.gray('Epoch:'));
  console.log(progressBar(epoch, totalEpochs));
  console.log(chalk.gray(`${epoch}/${totalEpochs}\n`));

  // Batch progress
  console.log(chalk.gray('Batch:'));
  console.log(progressBar(batch, totalBatches));
  console.log(chalk.gray(`${batch}/${totalBatches}\n`));

  // Metrics
  displayMetrics({
    'Loss': loss.toFixed(4),
    'Accuracy': accuracy.toFixed(2) + '%',
    'Status': chalk.green('Training...')
  });
}

// ═══════════════════════════════════════════════════════════════
// GPU INFO DISPLAY
// ═══════════════════════════════════════════════════════════════

export function displayGPUInfo(gpuInfo) {
  const supported = gpuInfo.webgpu 
    ? chalk.green('✓ Supported')
    : chalk.red('✗ Not Supported');

  console.log(boxen(
    chalk.bold.cyan('🎮 GPU Information\n\n') +
    chalk.white(`WebGPU:        ${supported}\n`) +
    chalk.white(`Vendor:        ${chalk.cyan(gpuInfo.vendor || 'Unknown')}\n`) +
    chalk.white(`Architecture:  ${chalk.cyan(gpuInfo.architecture || 'Unknown')}\n`) +
    chalk.white(`Device:        ${chalk.cyan(gpuInfo.device || 'Unknown')}\n`) +
    (gpuInfo.maxBufferSize 
      ? chalk.white(`Max Memory:    ${chalk.cyan(formatBytes(gpuInfo.maxBufferSize))}\n`)
      : ''
    ),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// ═══════════════════════════════════════════════════════════════
// HELP TEXT
// ═══════════════════════════════════════════════════════════════

export function displayHelp() {
  console.log(chalk.bold.cyan('\n🧠 XJSON ML RUNTIME - Commands\n'));

  const commands = [
    ['xjson-ml start', 'Start the ML training runtime'],
    ['xjson-ml train', 'Start training session'],
    ['xjson-ml status', 'Check runtime status'],
    ['xjson-ml export', 'Export trained model'],
    ['xjson-ml gpu', 'Check GPU capabilities'],
    ['xjson-ml init', 'Initialize new training project'],
    ['', ''],
    ['Options:', ''],
    ['--port <number>', 'Server port (default: 8080)'],
    ['--open', 'Open browser automatically'],
    ['--dev', 'Development mode with hot reload'],
    ['--no-gpu-check', 'Skip GPU detection']
  ];

  displayTable(
    ['Command', 'Description'],
    commands
  );

  console.log('\n');
}

// ═══════════════════════════════════════════════════════════════
// WELCOME MESSAGE
// ═══════════════════════════════════════════════════════════════

export function displayWelcome() {
  console.clear();
  displayBanner();

  console.log(boxen(
    chalk.white('Welcome to XJSON ML Runtime!\n\n') +
    chalk.gray('Train AI models in your browser with WebGPU.\n') +
    chalk.gray('No Python, no Colab, no setup required.\n\n') +
    chalk.cyan('Get started:\n') +
    chalk.white('  $ xjson-ml start\n\n') +
    chalk.gray('For help:\n') +
    chalk.white('  $ xjson-ml --help'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan'
    }
  ));
}

// ═══════════════════════════════════════════════════════════════
// ERROR DISPLAY
// ═══════════════════════════════════════════════════════════════

export function displayError(error) {
  console.log('\n');
  console.log(boxen(
    chalk.bold.red('✗ ERROR\n\n') +
    chalk.white(error.message || error),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'red'
    }
  ));
  console.log('\n');
}
