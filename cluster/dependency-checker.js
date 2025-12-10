/**
 * Dependency Checker
 * Verifies all required dependencies are available
 */

import chalk from 'chalk';

// ═══════════════════════════════════════════════════════════════
// DEPENDENCY CHECK
// ═══════════════════════════════════════════════════════════════

export async function checkDependencies() {
  const dependencies = [
    { name: 'express', package: 'express' },
    { name: 'ws', package: 'ws' },
    { name: 'chalk', package: 'chalk' },
    { name: 'ora', package: 'ora' },
    { name: 'boxen', package: 'boxen' },
    { name: 'commander', package: 'commander' },
    { name: 'open', package: 'open' },
    { name: 'portfinder', package: 'portfinder' },
    { name: 'node-fetch', package: 'node-fetch' }
  ];

  const missing = [];
  const available = [];

  for (const dep of dependencies) {
    try {
      await import(dep.package);
      available.push(dep.name);
    } catch (e) {
      missing.push(dep.name);
    }
  }

  if (missing.length > 0) {
    console.error(chalk.red('\n✗ Missing dependencies:'));
    missing.forEach(dep => console.error(chalk.red(`  - ${dep}`)));
    console.error(chalk.yellow('\nInstall them with:'));
    console.error(chalk.white('  npm install'));
    throw new Error('Missing dependencies');
  }

  return { available, missing };
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM CHECK
// ═══════════════════════════════════════════════════════════════

export async function checkSystem() {
  const checks = {
    node: checkNodeVersion(),
    npm: await checkNPM(),
    browser: await checkBrowser()
  };

  return checks;
}

function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);

  return {
    version,
    supported: major >= 18,
    requirement: '>=18.0.0'
  };
}

async function checkNPM() {
  try {
    const { execSync } = await import('child_process');
    const version = execSync('npm --version', { encoding: 'utf-8' }).trim();
    return {
      available: true,
      version
    };
  } catch (e) {
    return {
      available: false,
      error: e.message
    };
  }
}

async function checkBrowser() {
  // Check if we can launch a browser
  try {
    const open = await import('open');
    return {
      available: true
    };
  } catch (e) {
    return {
      available: false,
      error: e.message
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// PORT CHECK
// ═══════════════════════════════════════════════════════════════

export async function checkPort(port) {
  const net = await import('net');

  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      resolve({
        available: false,
        inUse: err.code === 'EADDRINUSE'
      });
    });

    server.once('listening', () => {
      server.close();
      resolve({
        available: true
      });
    });

    server.listen(port);
  });
}

// ═══════════════════════════════════════════════════════════════
// FULL ENVIRONMENT CHECK
// ═══════════════════════════════════════════════════════════════

export async function checkEnvironment() {
  console.log(chalk.cyan('🔍 Checking environment...\n'));

  // Node.js version
  const nodeCheck = checkNodeVersion();
  if (nodeCheck.supported) {
    console.log(chalk.green(`✓ Node.js ${nodeCheck.version}`));
  } else {
    console.log(chalk.red(`✗ Node.js ${nodeCheck.version} (requires ${nodeCheck.requirement})`));
    throw new Error('Unsupported Node.js version');
  }

  // Dependencies
  try {
    await checkDependencies();
    console.log(chalk.green('✓ All dependencies installed'));
  } catch (e) {
    throw e;
  }

  // Default port
  const portCheck = await checkPort(8080);
  if (portCheck.available) {
    console.log(chalk.green('✓ Port 8080 available'));
  } else {
    console.log(chalk.yellow('⚠ Port 8080 in use (will auto-detect alternative)'));
  }

  console.log(chalk.green('\n✓ Environment ready\n'));
}
