# 🔗 MX2CMS Integration Guide

**How to use MX2CMS as the Persistent Database for Your Entire Site**

---

## 🎯 Overview

MX2CMS is a **Micro-ASXR Database OS** that provides:
- **ASX-RAM**: Fast in-memory key/value storage
- **MX2DB**: Scoped databases for structured data
- **REST API**: Simple HTTP endpoints for all operations
- **Service Worker**: Runs in browser, no backend required

## 🚀 Quick Start

### 1. Include the Service Worker

Register the MX2CMS service worker from any page:

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/cms/sw.js')
    .then(reg => console.log('MX2CMS active:', reg.scope))
    .catch(err => console.error('MX2CMS failed:', err));
}
```

### 2. Start Using the API

Once registered, all REST endpoints are available:

```javascript
// ASX-RAM: Store user session
await fetch('/ram/set', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'user.session',
    value: { userId: '123', token: 'abc' }
  })
});

// MX2DB: Create a blog post
await fetch('/mx2db/put?scope=posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Post',
    content: 'Hello world!',
    author: 'user123'
  })
});

// CMS: List forum posts
const response = await fetch('/cms/forum/list');
const { items } = await response.json();
console.log('Forum posts:', items);
```

---

## 📡 Complete API Reference

### 🔑 ASX-RAM Endpoints

**Fast volatile key/value storage**

```javascript
// Set a key
POST /ram/set
Body: { "key": "config.theme", "value": "dark" }

// Get a key
GET /ram/get?key=config.theme

// List all keys
GET /ram/list

// Clear all keys
GET /ram/clear
```

### 🗄️ MX2DB Endpoints

**Scoped databases for structured data**

**Available Scopes:**
- `profiles` - User profiles
- `posts` - Forum/blog posts
- `products` - Store items
- `plugins` - Plugin registry
- `models` - AI model configs
- `rlhf` - Training data

```javascript
// Put a record (auto-generates ID if not provided)
POST /mx2db/put?scope=profiles
Body: { "name": "John", "email": "john@example.com" }

// Put with specific ID
POST /mx2db/put?scope=profiles&id=user123
Body: { "name": "John", "email": "john@example.com" }

// Get a record by ID
GET /mx2db/get?scope=profiles&id=user123

// Query all records in a scope
GET /mx2db/query?scope=profiles

// Query with search
GET /mx2db/query?scope=profiles&q=john

// Delete a record
GET /mx2db/delete?scope=profiles&id=user123
```

### 📦 CMS Mode Endpoints

**High-level operations for common CMS patterns**

**Available Modes:**
- `forum` → uses `posts` scope
- `blog` → uses `posts` scope
- `store` → uses `products` scope
- `plugins` → uses `plugins` scope
- `users` → uses `profiles` scope
- `rlhf` → uses `rlhf` scope

```javascript
// List all items in a mode
GET /cms/forum/list

// Create an item
POST /cms/forum/create
Body: { "title": "Hello", "content": "World" }

// Get a specific item
GET /cms/forum/get?id=1

// Update an item
POST /cms/forum/update?id=1
Body: { "title": "Updated Title" }
```

### 🤖 Agent Endpoints

**Multi-agent orchestration**

```javascript
// Profile Manager Agent
GET /agents/profile/get?userId=user123
POST /agents/profile/update
Body: { "id": "user123", "name": "John", "role": "admin" }

// Memory Trainer Agent
POST /agents/memory/train
Body: { "text": "Training data", "score": 0.95 }

// RLHF Reinforcer Agent
POST /agents/rlhf/score
Body: { "id": "rlhf1", "score": 1.0 }
```

### 💚 System Health

```javascript
// Check system status
GET /os/health

Response:
{
  "ok": true,
  "kernel": "AI_POWERED_MICRO_ASXR_CMS",
  "version": "1.0.0",
  "ram_keys": 5,
  "scopes": ["profiles", "posts", "products", "plugins", "models", "rlhf"],
  "ts": 1733876400000
}
```

---

## 💡 Integration Examples

### Example 1: User Authentication System

```javascript
// Store user session in ASX-RAM (fast access)
async function login(username, password) {
  // Validate credentials...
  const token = generateToken();

  // Store in ASX-RAM for fast session checks
  await fetch('/ram/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: `session.${token}`,
      value: { username, loginTime: Date.now() }
    })
  });

  // Store full profile in MX2DB for persistence
  await fetch('/agents/profile/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: username,
      lastLogin: Date.now(),
      token
    })
  });

  return token;
}

// Check if user is logged in
async function checkAuth(token) {
  const res = await fetch(`/ram/get?key=session.${token}`);
  const { value } = await res.json();
  return value !== null;
}
```

### Example 2: Blog System

```javascript
// Create a new blog post
async function createPost(title, content, author) {
  const res = await fetch('/cms/blog/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, author })
  });

  const { record } = await res.json();
  console.log('Created post:', record.id);
  return record;
}

// List all blog posts
async function listPosts() {
  const res = await fetch('/cms/blog/list');
  const { items } = await res.json();
  return items.map(item => item.data);
}

// Display posts on page
async function displayBlog() {
  const posts = await listPosts();
  const container = document.getElementById('blog-posts');

  posts.forEach(post => {
    const article = document.createElement('article');
    article.innerHTML = `
      <h2>${post.title}</h2>
      <p>${post.content}</p>
      <small>By ${post.author}</small>
    `;
    container.appendChild(article);
  });
}
```

### Example 3: E-Commerce Store

```javascript
// Add product to store
async function addProduct(product) {
  const res = await fetch('/mx2db/put?scope=products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });

  return await res.json();
}

// Get all products
async function getProducts() {
  const res = await fetch('/mx2db/query?scope=products');
  const { results } = await res.json();
  return results;
}

// Shopping cart in ASX-RAM (fast)
async function addToCart(productId, quantity) {
  // Get current cart
  const res = await fetch('/ram/get?key=cart.items');
  const { value: cart = [] } = await res.json();

  // Add item
  cart.push({ productId, quantity, addedAt: Date.now() });

  // Save back
  await fetch('/ram/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'cart.items', value: cart })
  });
}
```

### Example 4: Forum with RLHF

```javascript
// Create forum post
async function createForumPost(title, content, author) {
  const res = await fetch('/cms/forum/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, author })
  });

  return await res.json();
}

// User upvotes a post → train AI
async function upvotePost(postId) {
  // Record the upvote
  const res = await fetch('/mx2db/get?scope=posts&id=' + postId);
  const { record } = await res.json();

  // Train memory agent on high-quality content
  await fetch('/agents/memory/train', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: record.data.content,
      score: 1.0 // High score for upvoted content
    })
  });
}
```

### Example 5: Real-Time Config

```javascript
// Store app configuration in ASX-RAM
async function saveConfig(config) {
  await fetch('/ram/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: 'app.config',
      value: config
    })
  });
}

// Load config on app start
async function loadConfig() {
  const res = await fetch('/ram/get?key=app.config');
  const { value } = await res.json();

  if (!value) {
    // Default config
    return {
      theme: 'dark',
      language: 'en',
      notifications: true
    };
  }

  return value;
}

// Apply config to UI
async function initializeApp() {
  const config = await loadConfig();

  document.body.className = config.theme;
  document.documentElement.lang = config.language;

  if (config.notifications) {
    enableNotifications();
  }
}
```

---

## 🔌 Integration with Other Micro-ASXR Systems

### MX2CX (Builder Codex)

```javascript
// MX2CX can store user templates in MX2DB
async function saveTemplate(template) {
  await fetch('/mx2db/put?scope=models', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'template',
      name: template.name,
      code: template.code
    })
  });
}

// Load saved templates
async function loadTemplates() {
  const res = await fetch('/mx2db/query?scope=models&q=template');
  const { results } = await res.json();
  return results;
}
```

### MX2GIT (GitHub Sync)

```javascript
// Store GitHub credentials securely
async function saveGitHubToken(repo, token) {
  await fetch('/ram/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: `github.token.${repo}`,
      value: token
    })
  });
}

// Cache GitHub API responses
async function cacheRepoData(repo, data) {
  await fetch('/mx2db/put?scope=models&id=github_' + repo, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repo,
      data,
      cachedAt: Date.now()
    })
  });
}
```

### MX2LM (Brain Builders)

```javascript
// Store training data
async function saveTrainingData(data) {
  await fetch('/mx2db/put?scope=rlhf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

// Load n-gram data from memory trainer
async function getMemoryStats() {
  const res = await fetch('/mx2db/query?scope=rlhf');
  const { results } = await res.json();

  return {
    totalRecords: results.length,
    avgScore: results.reduce((sum, r) => sum + (r.data.score || 0), 0) / results.length
  };
}
```

---

## 🎨 UI Integration

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App with MX2CMS</title>
</head>
<body>
  <div id="app">
    <h1>Blog Posts</h1>
    <div id="posts"></div>
  </div>

  <script>
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/cms/sw.js');
    }

    // Load and display posts
    async function loadPosts() {
      const res = await fetch('/cms/blog/list');
      const { items } = await res.json();

      const container = document.getElementById('posts');
      items.forEach(item => {
        const post = document.createElement('article');
        post.innerHTML = `
          <h2>${item.data.title}</h2>
          <p>${item.data.content}</p>
        `;
        container.appendChild(post);
      });
    }

    loadPosts();
  </script>
</body>
</html>
```

### React Integration

```jsx
import { useEffect, useState } from 'react';

function BlogPosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/cms/sw.js');
    }

    // Load posts
    fetch('/cms/blog/list')
      .then(res => res.json())
      .then(({ items }) => setPosts(items));
  }, []);

  return (
    <div>
      <h1>Blog Posts</h1>
      {posts.map(item => (
        <article key={item.id}>
          <h2>{item.data.title}</h2>
          <p>{item.data.content}</p>
        </article>
      ))}
    </div>
  );
}
```

### Vue Integration

```vue
<template>
  <div>
    <h1>Blog Posts</h1>
    <article v-for="post in posts" :key="post.id">
      <h2>{{ post.data.title }}</h2>
      <p>{{ post.data.content }}</p>
    </article>
  </div>
</template>

<script>
export default {
  data() {
    return {
      posts: []
    };
  },
  mounted() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/cms/sw.js');
    }

    // Load posts
    fetch('/cms/blog/list')
      .then(res => res.json())
      .then(({ items }) => {
        this.posts = items;
      });
  }
};
</script>
```

---

## 🔒 Security Notes

1. **ASX-RAM is volatile** - Data is lost when service worker restarts
2. **MX2DB is persistent** - Data survives service worker restarts via Map storage
3. **No authentication** - Add your own auth layer if needed
4. **Same-origin only** - All endpoints only work on same domain
5. **Client-side storage** - All data stored in browser, not server

---

## 📊 Performance Tips

1. **Use ASX-RAM for hot data** - Session tokens, configs, active carts
2. **Use MX2DB for persistent data** - User profiles, posts, products
3. **Cache frequently accessed data** - Load once, store in ASX-RAM
4. **Query scopes efficiently** - Use specific scopes to reduce search space
5. **Batch operations** - Group multiple operations together when possible

---

## 🐛 Debugging

### Check if service worker is active

```javascript
navigator.serviceWorker.getRegistration('/cms/').then(reg => {
  if (reg && reg.active) {
    console.log('MX2CMS is active');
  } else {
    console.log('MX2CMS not found');
  }
});
```

### Monitor all requests

```javascript
// In DevTools Console, filter by: /ram/ OR /mx2db/ OR /cms/
console.log('Monitoring MX2CMS requests...');
```

### Check system health

```javascript
fetch('/os/health')
  .then(res => res.json())
  .then(status => console.log('MX2CMS Status:', status));
```

---

## 🚀 Next Steps

1. **Deploy** - Copy `cms/` folder to your web root
2. **Register** - Add service worker registration to your app
3. **Use API** - Start making REST calls to store/retrieve data
4. **Monitor** - Use `/os/health` to check system status
5. **Extend** - Add custom endpoints to `sw.js` as needed

---

**Built with ⚛️ by the ASXR Trinity team**

**Version:** 13.2.0-XCFE-POLYGLOT-ETERNAL
