#!/usr/bin/env node

/**
 * XJSON ML Runtime - Main Entry Point
 * 
 * This file is the main entry point when the package is imported
 * as a module. For CLI usage, see cli.js
 */

export { startServer } from './server.js';
export { findAvailablePorts, allocateZone } from './lib/port-oracle.js';
export { detectGPU, checkWebGPUSupport } from './lib/gpu-detector.js';
export { checkDependencies, checkEnvironment } from './lib/dependency-checker.js';
export * as ui from './lib/ui.js';

// ═══════════════════════════════════════════════════════════════
// DEFAULT EXPORT (Quick Start)
// ═══════════════════════════════════════════════════════════════

export default async function quickStart(options = {}) {
  const { startServer } = await import('./server.js');
  const { findAvailablePorts } = await import('./lib/port-oracle.js');
  const open = await import('open');

  // Find ports
  const ports = await findAvailablePorts({
    main: options.port || 8080,
    api: 'auto',
    websocket: 'auto'
  });

  // Start server
  const server = await startServer({
    port: ports.main,
    apiPort: ports.api,
    wsPort: ports.websocket,
    dev: options.dev || false
  });

  // Open browser
  if (options.open !== false) {
    await open.default(`http://localhost:${ports.main}`);
  }

  return {
    server,
    ports,
    url: `http://localhost:${ports.main}`
  };
}

// ═══════════════════════════════════════════════════════════════
// STANDALONE EXECUTION
// ═══════════════════════════════════════════════════════════════

if (import.meta.url === `file://${process.argv[1]}`) {
  // If run directly, show help
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🧠 XJSON ML RUNTIME                                          ║
║                                                                ║
║   For CLI usage, run:                                         ║
║   $ xjson-ml --help                                           ║
║                                                                ║
║   For programmatic usage:                                     ║
║   import quickStart from '@xjson/ml-runtime';                 ║
║   const { server, url } = await quickStart();                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
}
