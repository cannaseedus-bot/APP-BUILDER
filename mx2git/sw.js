/* =========================================================================
   MX2GIT — MICRO-ASXR GITHUB SYNC KERNEL
   =========================================================================
   Role:
   - Secure GitHub token storage in ASX-RAM
   - Pull / Push between GitHub and ASX-RAM
   - Clone repositories as projects
   - Agent-driven git operations
   - /api/mx2git/* HTTP API

   Architecture:
   - Standalone Micro-ASXR (no CMS dependency)
   - Pure service worker kernel
   - ASX-RAM VFS for storage
   - XJSON everywhere
=========================================================================== */

'use strict';

const MX2GIT_OS_ID = 'MX2GIT_MICRO_ASXR_v1';
const MX2GIT_KERNEL_CACHE = `${MX2GIT_OS_ID}-kernel`;
const MX2GIT_RUNTIME_CACHE = `${MX2GIT_OS_ID}-runtime`;

const MX2GIT_CORE_ASSETS = [
  '/',
  '/index.html',
  '/github.html',
  '/manifest.json',
  '/sw.js',
  '/tapes/tape_system_mx2git_v1.asxr.json'
];

/* -------------------------------------------------------------------------
   1. ASX-RAM VFS (Minimal Virtual File System)
------------------------------------------------------------------------- */

const ASXRAM = {
  mounts: new Map([
    ['/usr', { type: 'rw', description: 'System files' }],
    ['/tmp', { type: 'vol', description: 'Temporary storage' }],
    ['/projects', { type: 'rw', description: 'Git repositories' }]
  ]),

  async read(path) {
    const cache = await caches.open(MX2GIT_RUNTIME_CACHE);
    const res = await cache.match(path);
    if (!res) return null;
    try {
      return await res.text();
    } catch {
      return null;
    }
  },

  async write(path, data) {
    const cache = await caches.open(MX2GIT_RUNTIME_CACHE);
    await cache.put(path, new Response(data, {
      headers: { 'Content-Type': 'application/json' }
    }));
    return { path, size: data.length, timestamp: Date.now() };
  },

  async list(prefix) {
    const cache = await caches.open(MX2GIT_RUNTIME_CACHE);
    const keys = await cache.keys();
    return keys
      .map(req => req.url)
      .filter(url => url.includes(prefix))
      .map(url => new URL(url).pathname);
  },

  async delete(path) {
    const cache = await caches.open(MX2GIT_RUNTIME_CACHE);
    return await cache.delete(path);
  }
};

/* -------------------------------------------------------------------------
   2. GITHUB SYNC CORE
------------------------------------------------------------------------- */

const GitHubSync = {
  api: 'https://api.github.com',
  credsPath: '/usr/secrets/github_token.json',
  projectsPath: '/projects',

  async creds() {
    try {
      const raw = await ASXRAM.read(this.credsPath);
      if (!raw) throw new Error('No credentials found');
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  async saveCreds(creds) {
    await ASXRAM.write(this.credsPath, JSON.stringify(creds, null, 2));
    return creds;
  },

  async headers(token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  },

  parseRepoUrl(url) {
    // https://github.com/owner/repo.git -> owner/repo
    const match = url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
    if (!match) throw new Error('Invalid GitHub URL');
    return `${match[1]}/${match[2]}`;
  },

  async pull({ repo, branch, path, vfsPath }) {
    const { token } = await this.creds();
    const [owner, name] = repo.split('/');
    const url = `${this.api}/repos/${owner}/${name}/contents/${path}?ref=${branch}`;

    const res = await fetch(url, { headers: await this.headers(token) });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const json = await res.json();
    const data = decodeURIComponent(escape(atob(json.content)));

    await ASXRAM.write(vfsPath, data);
    return {
      pulled: true,
      vfsPath,
      size: data.length,
      sha: json.sha
    };
  },

  async push({ repo, branch, path, vfsPath, message }) {
    const { token } = await this.creds();
    const [owner, name] = repo.split('/');
    const url = `${this.api}/repos/${owner}/${name}/contents/${path}`;

    const data = await ASXRAM.read(vfsPath);
    if (!data) throw new Error('VFS path not found');

    const encoded = btoa(unescape(encodeURIComponent(data)));

    // Check if file exists to get SHA
    let sha = null;
    try {
      const checkRes = await fetch(url + `?ref=${branch}`, {
        headers: await this.headers(token)
      });
      if (checkRes.ok) {
        const existing = await checkRes.json();
        sha = existing.sha;
      }
    } catch {}

    const body = {
      message: message || `MX2GIT update ${path}`,
      content: encoded,
      branch
    };

    if (sha) body.sha = sha;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        ...(await this.headers(token)),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    return await res.json();
  },

  async clone({ repo, branch = 'main' }) {
    const { token } = await this.creds();
    const [owner, name] = repo.split('/');

    // Get repository tree
    const treeUrl = `${this.api}/repos/${owner}/${name}/git/trees/${branch}?recursive=1`;
    const treeRes = await fetch(treeUrl, { headers: await this.headers(token) });
    if (!treeRes.ok) throw new Error(`GitHub API error: ${treeRes.status}`);

    const tree = await treeRes.json();
    const files = tree.tree.filter(item => item.type === 'blob');

    const projectPath = `${this.projectsPath}/${name}`;
    const manifest = {
      '@context': 'xjson://mx2git/project/v1',
      name,
      repo,
      branch,
      cloned_at: new Date().toISOString(),
      files: []
    };

    // Download each file
    for (const file of files.slice(0, 100)) { // Limit to 100 files for safety
      try {
        const contentUrl = `${this.api}/repos/${owner}/${name}/contents/${file.path}?ref=${branch}`;
        const contentRes = await fetch(contentUrl, { headers: await this.headers(token) });
        const content = await contentRes.json();

        const data = decodeURIComponent(escape(atob(content.content)));
        const vfsPath = `${projectPath}/${file.path}`;

        await ASXRAM.write(vfsPath, data);
        manifest.files.push({
          path: file.path,
          vfsPath,
          size: file.size,
          sha: file.sha
        });
      } catch (e) {
        console.error(`Failed to clone ${file.path}:`, e);
      }
    }

    // Save project manifest
    await ASXRAM.write(`${projectPath}/manifest.json`, JSON.stringify(manifest, null, 2));

    return {
      cloned: true,
      project: projectPath,
      filesCloned: manifest.files.length,
      manifest
    };
  },

  async importGitHub({ repo_url, project_name }) {
    const repo = this.parseRepoUrl(repo_url);
    const name = project_name || repo.split('/')[1];

    const projectPath = `${this.projectsPath}/${name}`;
    const manifest = {
      '@context': 'xjson://mx2git/project/v1',
      name,
      repo,
      repo_url,
      imported_at: new Date().toISOString(),
      status: 'registered'
    };

    await ASXRAM.write(`${projectPath}/manifest.json`, JSON.stringify(manifest, null, 2));

    return {
      ok: true,
      project: projectPath,
      manifest
    };
  },

  async listProjects() {
    const paths = await ASXRAM.list('/projects/');
    const manifestPaths = paths.filter(p => p.endsWith('/manifest.json'));

    const projects = [];
    for (const path of manifestPaths) {
      try {
        const data = await ASXRAM.read(path);
        const manifest = JSON.parse(data);
        projects.push(manifest);
      } catch {}
    }

    return projects;
  }
};

/* -------------------------------------------------------------------------
   3. HTTP API — /api/mx2git/*
------------------------------------------------------------------------- */

async function respondMX2GIT(url, request) {
  const path = url.pathname.replace('/api/mx2git/', '');

  try {
    if (path === 'save-credentials' && request.method === 'POST') {
      const body = await request.json();
      const saved = await GitHubSync.saveCreds(body);
      return json({ ok: true, saved: { token: '***' } });
    }

    if (path === 'pull' && request.method === 'POST') {
      const body = await request.json();
      const result = await GitHubSync.pull(body);
      return json({ ok: true, result });
    }

    if (path === 'push' && request.method === 'POST') {
      const body = await request.json();
      const result = await GitHubSync.push(body);
      return json({ ok: true, result });
    }

    if (path === 'clone' && request.method === 'POST') {
      const body = await request.json();
      const result = await GitHubSync.clone(body);
      return json({ ok: true, result });
    }

    if (path === 'import-github' && request.method === 'POST') {
      const body = await request.json();
      const result = await GitHubSync.importGitHub(body);
      return json(result);
    }

    if (path === 'projects' && request.method === 'GET') {
      const projects = await GitHubSync.listProjects();
      return json({ ok: true, projects });
    }

    if (path === 'manifest') {
      // Return MX2GIT manifest
      const manifestRes = await fetch('/manifest.json');
      return manifestRes;
    }

    return json({ error: 'mx2git_endpoint_not_found', path }, 404);
  } catch (error) {
    return json({
      ok: false,
      error: error.message || 'unknown_error',
      stack: error.stack
    }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/* -------------------------------------------------------------------------
   4. SERVICE WORKER LIFECYCLE
------------------------------------------------------------------------- */

self.addEventListener('install', event => {
  console.log('[MX2GIT] Installing...');
  event.waitUntil((async () => {
    const cache = await caches.open(MX2GIT_KERNEL_CACHE);
    await cache.addAll(MX2GIT_CORE_ASSETS);

    // Initialize ASX-RAM with empty secrets
    const existing = await ASXRAM.read('/usr/secrets/github_token.json');
    if (!existing) {
      await ASXRAM.write('/usr/secrets/github_token.json', JSON.stringify({
        token: null,
        created_at: new Date().toISOString()
      }));
    }

    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  console.log('[MX2GIT] Activating...');
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => !k.startsWith(MX2GIT_OS_ID))
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
    console.log('[MX2GIT] Ready ✅');
  })());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API routes
  if (url.pathname.startsWith('/api/mx2git/')) {
    event.respondWith(respondMX2GIT(url, event.request));
    return;
  }

  // Manifest
  if (url.pathname === '/manifest.json') {
    event.respondWith(caches.match('/manifest.json'));
    return;
  }

  // App shell (navigation)
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(MX2GIT_KERNEL_CACHE);
      const cached = await cache.match('/index.html');
      if (cached) return cached;

      try {
        const net = await fetch('/index.html');
        await cache.put('/index.html', net.clone());
        return net;
      } catch {
        return new Response('<h1>MX2GIT Offline</h1>', {
          headers: { 'Content-Type': 'text/html' }
        });
      }
    })());
    return;
  }

  // Default: network first, fallback to cache
  event.respondWith((async () => {
    try {
      return await fetch(event.request);
    } catch {
      const cache = await caches.open(MX2GIT_KERNEL_CACHE);
      const cached = await cache.match(event.request);
      return cached || new Response('MX2GIT: no route', { status: 503 });
    }
  })());
});

self.addEventListener('message', event => {
  const { type, payload } = event.data || {};
  const port = event.ports && event.ports[0];
  if (!port) return;

  if (type === 'MX2GIT:status') {
    port.postMessage({
      ok: true,
      os: MX2GIT_OS_ID,
      version: '1.0.0',
      ready: true
    });
  }

  if (type === 'MX2GIT:projects') {
    (async () => {
      const projects = await GitHubSync.listProjects();
      port.postMessage({ ok: true, projects });
    })();
  }
});

console.log('[MX2GIT] Service worker loaded');
