// ⚛️ MX2CX Builder Codex - Service Worker Mesh Kernel v1.0.0
// Micro-ASXR Operating System: Builder Research & Chat Inference
// KUHUL ⊗ XJSON ⊗ XCFE ⊗ ASX-RAM

const MX2CX_OS_ID = 'MX2CX_MICRO_ASXR_v1';
const CACHE_NAME = `${MX2CX_OS_ID}-runtime`;
const MANIFEST_URL = '/mx2cx/manifest.json';

// ═══════════════════════════════════════════════════════════════════
// 🔧 ASX-RAM: Virtual Key/Value Store over Cache API
// ═══════════════════════════════════════════════════════════════════

const ASXRAM = {
  namespace: 'builder_codex',

  _cacheKey(key) {
    return `asxram://${this.namespace}/${key}`;
  },

  async write(key, value, ttl = null) {
    const cache = await caches.open(CACHE_NAME);
    const data = {
      value,
      timestamp: Date.now(),
      ttl,
    };
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
    await cache.put(this._cacheKey(key), response);
    return true;
  },

  async read(key) {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(this._cacheKey(key));
    if (!response) return null;

    const data = await response.json();
    if (data.ttl && Date.now() - data.timestamp > data.ttl) {
      await this.delete(key);
      return null;
    }
    return data.value;
  },

  async delete(key) {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(this._cacheKey(key));
    return true;
  },

  async keys() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    return requests
      .map(req => req.url)
      .filter(url => url.includes(`asxram://${this.namespace}/`))
      .map(url => url.split('/').pop());
  },
};

// ═══════════════════════════════════════════════════════════════════
// 🌐 REST Mesh Proxy: Local API → Mesh API Bridge
// ═══════════════════════════════════════════════════════════════════

const RestMeshProxy = {
  async getConfig() {
    const override = await ASXRAM.read('builder.mesh_base');
    const defaultBase = 'https://api.asxtoken.com';
    return {
      mesh_base: override || defaultBase,
      shard: 'builder_codex',
    };
  },

  async proxy(endpoint, method, body = null) {
    const config = await this.getConfig();
    const url = `${config.mesh_base}${endpoint}`;

    console.log(`[MX2CX] 🔗 Mesh Proxy: ${method} ${url}`);

    const headers = {
      'Content-Type': 'application/json',
      'X-ASX-Shard': config.shard,
      'X-ASX-Mode': 'builder',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      });

      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.error('[MX2CX] ❌ Mesh Proxy Error:', error);
      return {
        ok: false,
        status: 500,
        error: error.message,
      };
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
// 🤖 Builder Chat Agent: XJSON/KUHUL/XCFE/AST Knowledge Base
// ═══════════════════════════════════════════════════════════════════

const BuilderChatAgent = {
  knowledgeBase: {
    xjson: {
      name: 'XJSON',
      description: 'Extensible JSON format with semantic metadata',
      keys: ['@context', '@v', '@law', '@entity', 'n', 'd'],
      examples: {
        basic: `{
  "@context": "xjson://asxr/manifest/v1",
  "@v": "1.0.0",
  "n": "My ASXR App",
  "d": "Description of the app"
}`,
        law: `{
  "@law": "SYNC = XCFE → KUHUL → ASX-RAM → XJSON"
}`,
      },
    },
    kuhul: {
      name: "K'UHUL Pipeline",
      description: 'Enhanced 6-stage execution pipeline',
      stages: ['SECURITY', 'POP', 'WO', 'SEK', 'XUL', "CH'EN"],
      flow: 'SECURITY → POP → WO → SEK → XUL → CH'EN',
      examples: {
        github_pull: '⟁Pop⟁github_api⟁Wo⟁credentials⟁Sek⟁fetch_content⟁Sek⟁decode_base64⟁Sek⟁write_vfs⟁Xul',
        cms_query: '⟁Pop⟁query⟁Wo⟁database⟁Sek⟁filter⟁Xul⟁response',
      },
    },
    xcfe: {
      name: 'XCFE',
      description: 'eXecution Control Flow Enforcement',
      vectors: ['@control', '@flow', '@view', '@variable'],
      examples: {
        control: `{
  "@control": {
    "@control.auth": "token_security_control",
    "@control.rate": "api_rate_limiter"
  }
}`,
        flow: `{
  "@flow": {
    "@flow.push": "vfs → encode → github",
    "@flow.pull": "github → decode → vfs"
  }
}`,
      },
    },
    ast: {
      name: 'JSON AST',
      description: 'JSON Abstract Syntax Tree for code generation',
      structure: 'Hierarchical tree of nodes representing code structure',
      nodes: ['Program', 'Statement', 'Expression', 'Identifier', 'Literal'],
      examples: {
        simple: `{
  "type": "Program",
  "body": [
    {
      "type": "ExpressionStatement",
      "expression": {
        "type": "CallExpression",
        "callee": { "type": "Identifier", "name": "console.log" },
        "arguments": [{ "type": "Literal", "value": "Hello" }]
      }
    }
  ]
}`,
      },
    },
    atomic: {
      name: 'Atomic ASX Blocks',
      description: 'Utility-first CSS framework for ASXR interfaces',
      classes: [
        'flex', 'grid', 'p-*', 'm-*', 'bg-*', 'text-*',
        'w-*', 'h-*', 'rounded-*', 'shadow-*'
      ],
      examples: {
        card: '<div class="bg-panel rounded-lg shadow-md p-4">Card Content</div>',
        button: '<button class="bg-gold text-dark px-4 py-2 rounded-md hover:bg-gold-light">Click Me</button>',
        layout: '<div class="flex flex-col gap-4"><div class="grid grid-cols-3 gap-2">Items</div></div>',
      },
    },
  },

  async answer(question) {
    const q = question.toLowerCase();
    const results = [];

    // Search knowledge base
    for (const [key, topic] of Object.entries(this.knowledgeBase)) {
      if (q.includes(key) || q.includes(topic.name.toLowerCase())) {
        results.push({
          topic: topic.name,
          description: topic.description,
          details: topic,
        });
      }
    }

    // Keyword matching
    if (q.includes('pipeline') || q.includes('stage') || q.includes('execution')) {
      results.push(this.knowledgeBase.kuhul);
    }
    if (q.includes('control') || q.includes('flow') || q.includes('enforcement')) {
      results.push(this.knowledgeBase.xcfe);
    }
    if (q.includes('json') || q.includes('format') || q.includes('metadata')) {
      results.push(this.knowledgeBase.xjson);
    }
    if (q.includes('css') || q.includes('style') || q.includes('class')) {
      results.push(this.knowledgeBase.atomic);
    }
    if (q.includes('ast') || q.includes('tree') || q.includes('syntax')) {
      results.push(this.knowledgeBase.ast);
    }

    // General questions
    if (q.includes('what is') || q.includes('explain') || q.includes('how')) {
      if (results.length === 0) {
        return {
          answer: 'I can help you understand XJSON, K\'UHUL Pipeline, XCFE, JSON AST, and Atomic ASX Blocks. Try asking about a specific topic!',
          suggestions: [
            'What is XJSON?',
            'Explain K\'UHUL pipeline',
            'How does XCFE work?',
            'Show me JSON AST example',
            'What are Atomic ASX blocks?',
          ],
        };
      }
    }

    if (results.length > 0) {
      // Deduplicate
      const unique = Array.from(new Map(results.map(r => [r.name, r])).values());
      return {
        answer: unique.map(r => `**${r.name}**: ${r.description}`).join('\n\n'),
        topics: unique,
        examples: unique.flatMap(r => Object.entries(r.examples || {}).map(([k, v]) => ({ topic: r.name, example: k, code: v }))),
      };
    }

    return {
      answer: 'I\'m the Builder Codex AI assistant. I can answer questions about XJSON, K\'UHUL Pipeline, XCFE, JSON AST, and Atomic ASX Blocks.',
      suggestions: [
        'What is XJSON?',
        'Explain K\'UHUL pipeline stages',
        'Show XCFE control flow example',
        'What is JSON AST?',
        'How to use Atomic CSS classes?',
      ],
    };
  },
};

// ═══════════════════════════════════════════════════════════════════
// 🛣️ HTTP API Router
// ═══════════════════════════════════════════════════════════════════

const APIRouter = {
  routes: {
    'GET /api/builder/manifest': async () => {
      const response = await fetch(MANIFEST_URL);
      const manifest = await response.json();
      return { ok: true, manifest };
    },

    'POST /api/builder/research': async (body) => {
      const result = await RestMeshProxy.proxy('/builder/research', 'POST', body);
      await ASXRAM.write('builder.last_query', body.query);
      return result;
    },

    'POST /api/builder/template/build': async (body) => {
      const result = await RestMeshProxy.proxy('/builder/template/build', 'POST', body);
      return result;
    },

    'POST /api/builder/template/stack': async (body) => {
      const result = await RestMeshProxy.proxy('/builder/template/stack', 'POST', body);
      await ASXRAM.write('builder.last_stack', body.stack);
      return result;
    },

    'POST /api/builder/agent/create': async (body) => {
      const result = await RestMeshProxy.proxy('/builder/agent/create', 'POST', body);
      await ASXRAM.write('builder.agent_state', body);
      return result;
    },

    'GET /api/rlhf/metrics': async () => {
      const cached = await ASXRAM.read('builder.rlhf.metrics.cache');
      if (cached) {
        console.log('[MX2CX] 📦 RLHF metrics from cache');
        return { ok: true, data: cached, source: 'cache' };
      }

      const result = await RestMeshProxy.proxy('/rlhf/metrics', 'GET');
      if (result.ok) {
        await ASXRAM.write('builder.rlhf.metrics.cache', result.data, 600000); // 10 min TTL
      }
      return result;
    },

    'POST /api/builder/chat': async (body) => {
      const { question } = body;
      console.log('[MX2CX] 💬 Chat question:', question);

      // Use local knowledge base
      const answer = await BuilderChatAgent.answer(question);

      return {
        ok: true,
        response: answer.answer,
        suggestions: answer.suggestions || [],
        topics: answer.topics || [],
        examples: answer.examples || [],
        timestamp: new Date().toISOString(),
      };
    },

    'POST /api/builder/mesh/override': async (body) => {
      const { mesh_base } = body;
      await ASXRAM.write('builder.mesh_base', mesh_base);
      console.log('[MX2CX] 🔧 Mesh base overridden:', mesh_base);
      return { ok: true, mesh_base };
    },

    'GET /api/builder/mesh/config': async () => {
      const config = await RestMeshProxy.getConfig();
      return { ok: true, config };
    },
  },

  async handle(request) {
    const url = new URL(request.url);
    const method = request.method;
    const routeKey = `${method} ${url.pathname}`;

    console.log('[MX2CX] 🛣️  Route:', routeKey);

    const handler = this.routes[routeKey];
    if (!handler) {
      return new Response(JSON.stringify({ ok: false, error: 'Route not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      let body = null;
      if (method === 'POST') {
        body = await request.json();
      }

      const result = await handler(body);

      return new Response(JSON.stringify(result), {
        status: result.ok ? 200 : 500,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[MX2CX] ❌ Route error:', error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
// 🔄 Service Worker Lifecycle
// ═══════════════════════════════════════════════════════════════════

self.addEventListener('install', (event) => {
  console.log('[MX2CX] ⚙️  Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[MX2CX] 📦 Cache opened:', CACHE_NAME);
      return cache.addAll([
        '/mx2cx/',
        '/mx2cx/index.html',
        '/mx2cx/manifest.json',
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[MX2CX] ✅ Service worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('MX2CX_')) {
            console.log('[MX2CX] 🗑️  Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API routes
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(APIRouter.handle(event.request));
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

console.log('[MX2CX] 🚀 Builder Codex Mesh Kernel v1.0.0 loaded');
