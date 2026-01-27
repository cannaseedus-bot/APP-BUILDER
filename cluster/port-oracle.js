/**
 * XJSON Port Oracle
 * Automatically detects and allocates available ports
 * Based on KUHUL-NPX v3 port detection system
 */

import portfinder from 'portfinder';

// ═══════════════════════════════════════════════════════════════
// PORT ORACLE
// ═══════════════════════════════════════════════════════════════

export async function findAvailablePorts(config = {}) {
  const {
    main = 8080,
    api = 'auto',
    websocket = 'auto',
    shards = {}
  } = config;

  const ports = {
    main: await findPort(main),
    api: null,
    websocket: null,
    shards: {}
  };

  // Find API port
  if (api === 'auto') {
    ports.api = await findPort(ports.main + 1);
  } else {
    ports.api = await findPort(api);
  }

  // Find WebSocket port
  if (websocket === 'auto') {
    ports.websocket = await findPort(ports.api + 1);
  } else {
    ports.websocket = await findPort(websocket);
  }

  // Find shard ports
  let nextPort = ports.websocket + 1;
  for (const [shardName, shardPort] of Object.entries(shards)) {
    if (shardPort === 'auto') {
      ports.shards[shardName] = await findPort(nextPort);
      nextPort = ports.shards[shardName] + 1;
    } else {
      ports.shards[shardName] = await findPort(shardPort);
    }
  }

  return ports;
}

async function findPort(startPort) {
  portfinder.basePort = startPort;
  return await portfinder.getPortPromise();
}

// ═══════════════════════════════════════════════════════════════
// PORT REGISTRY (Multi-instance support)
// ═══════════════════════════════════════════════════════════════

const portRegistry = new Map();

export function registerPorts(instanceId, ports) {
  portRegistry.set(instanceId, {
    ports,
    timestamp: Date.now()
  });
}

export function getRegisteredPorts(instanceId) {
  return portRegistry.get(instanceId)?.ports;
}

export function getAllInstances() {
  return Array.from(portRegistry.entries()).map(([id, data]) => ({
    id,
    ...data
  }));
}

// ═══════════════════════════════════════════════════════════════
// PORT HEALTH CHECK
// ═══════════════════════════════════════════════════════════════

export async function checkPortHealth(port) {
  const net = await import('net');
  
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve({ available: false, inUse: true });
      } else {
        resolve({ available: false, error: err.message });
      }
    });

    server.once('listening', () => {
      server.close();
      resolve({ available: true });
    });

    server.listen(port);
  });
}

// ═══════════════════════════════════════════════════════════════
// SMART PORT ALLOCATION
// ═══════════════════════════════════════════════════════════════

export async function smartAllocate(preferred = [8080, 3000, 5000]) {
  for (const port of preferred) {
    const health = await checkPortHealth(port);
    if (health.available) {
      return port;
    }
  }

  // Fall back to auto-detection
  return await findPort(8080);
}

// ═══════════════════════════════════════════════════════════════
// PORT RANGE SCANNER
// ═══════════════════════════════════════════════════════════════

export async function scanPortRange(start, end) {
  const available = [];
  
  for (let port = start; port <= end; port++) {
    const health = await checkPortHealth(port);
    if (health.available) {
      available.push(port);
    }
  }

  return available;
}

// ═══════════════════════════════════════════════════════════════
// XJSON PORT ZONES (DNS-like system)
// ═══════════════════════════════════════════════════════════════

export const PORT_ZONES = {
  'xjson.app': {
    default: 61680,
    range: [61680, 61699]
  },
  'rig.xjson.app': {
    default: 61681,
    range: [61681, 61681]
  },
  'hive.xjson.app': {
    default: 61682,
    range: [61682, 61682]
  },
  'trainer.xjson.app': {
    default: 61683,
    range: [61683, 61683]
  },
  'prime.xjson.app': {
    default: 61684,
    range: [61684, 61684]
  },
  'ml.xjson.app': {
    default: 8080,
    range: [8080, 8089]
  }
};

export async function allocateZone(zone) {
  const config = PORT_ZONES[zone];
  if (!config) {
    throw new Error(`Unknown port zone: ${zone}`);
  }

  // Try default first
  const defaultHealth = await checkPortHealth(config.default);
  if (defaultHealth.available) {
    return config.default;
  }

  // Scan range
  const [start, end] = config.range;
  const available = await scanPortRange(start, end);
  
  if (available.length > 0) {
    return available[0];
  }

  throw new Error(`No available ports in zone: ${zone}`);
}
