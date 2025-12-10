# ⚛️ MX2GIT Micro-ASXR

**Version:** 1.0.0
**Type:** Standalone Micro-ASXR Operating System
**Role:** GitHub ↔ ASX-RAM Synchronization Engine

---

## 🌟 Overview

MX2GIT is a **standalone Micro-ASXR** - a complete, self-contained operating system for GitHub synchronization that runs entirely in the browser. It provides:

- **Secure GitHub Token Storage** - ASX-RAM encrypted storage
- **Bidirectional Sync** - Pull from / Push to GitHub
- **Full Repository Cloning** - Download entire repos to ASX-RAM
- **Agent-Driven Operations** - `agent.git.sync` handles all GitHub ops
- **KUHUL ⊗ XJSON ⊗ XCFE Governance** - Full ASXR architecture
- **Zero Backend** - Pure service worker + Cache API
- **Portable** - Plug into any ASXR/PRIME/CMS instance

---

## 🏗️ Architecture

### Micro-ASXR Stack

```
┌─────────────────────────────────────────┐
│         MX2GIT MICRO-ASXR v1.0          │
├─────────────────────────────────────────┤
│  Service Worker Kernel (sw.js)         │
│  ├─ GitHub API Client                  │
│  ├─ ASX-RAM VFS                        │
│  └─ HTTP API Router                    │
├─────────────────────────────────────────┤
│  Agents                                 │
│  └─ agent.git.sync                     │
│     ├─ pull()                          │
│     ├─ push()                          │
│     ├─ clone()                         │
│     └─ import()                        │
├─────────────────────────────────────────┤
│  ASX-RAM Virtual Filesystem             │
│  ├─ /usr/secrets/github_token.json     │
│  ├─ /projects/*                        │
│  └─ /tmp/*                             │
├─────────────────────────────────────────┤
│  HTTP API Surface                       │
│  ├─ POST /api/mx2git/save-credentials  │
│  ├─ POST /api/mx2git/pull              │
│  ├─ POST /api/mx2git/push              │
│  ├─ POST /api/mx2git/clone             │
│  ├─ POST /api/mx2git/import-github     │
│  └─ GET  /api/mx2git/projects          │
└─────────────────────────────────────────┘
```

### KUHUL Pipeline Integration

All GitHub operations flow through enhanced KUHUL pipeline:

```
CREDENTIALS → POP → WO → SEK → XUL → CH'EN
```

**Example: Pull Operation**
```
⟁Pop github_request
⟁Wo credentials
⟁Sek fetch_api
⟁Sek decode_content
⟁Sek write_vfs
⟁Xul response
```

### ASX-RAM Storage

Virtual filesystem paths:

```
/usr/secrets/github_token.json  - Encrypted GitHub token
/projects/repo-name/            - Cloned repositories
/projects/repo-name/manifest.json - Project metadata
/tmp/                           - Temporary files
```

---

## 🚀 Quick Start

### 1. Deploy MX2GIT

```bash
# Serve the mx2git directory
cd mx2git
python -m http.server 8000
```

Navigate to `http://localhost:8000`

The service worker will auto-install and bootstrap the MX2GIT kernel.

### 2. Save GitHub Token

1. Generate a Personal Access Token: https://github.com/settings/tokens
2. Required scopes: `repo`, `read:org`
3. Open MX2GIT dashboard → Import GitHub
4. Paste token and click "Save Token"
5. Token is encrypted and stored in ASX-RAM at `/usr/secrets/github_token.json`

### 3. Import Repository

**Option A: Register Only**
```
1. Enter repository URL (e.g., https://github.com/user/repo.git)
2. Click "Import Repository"
3. Creates project manifest in ASX-RAM
```

**Option B: Full Clone**
```
1. Enter repository URL
2. Click "Clone Full Repo"
3. Downloads all files to ASX-RAM
4. Creates project with file manifests
```

---

## 📡 API Reference

### Save GitHub Token

```javascript
POST /api/mx2git/save-credentials

Request:
{
  "token": "ghp_xxxxxxxxxxxxxxxxxxxx"
}

Response:
{
  "ok": true,
  "saved": {
    "token": "***"  // Hidden for security
  }
}
```

### Pull File from GitHub

```javascript
POST /api/mx2git/pull

Request:
{
  "repo": "owner/repo",
  "branch": "main",
  "path": "README.md",
  "vfsPath": "/projects/my-repo/README.md"
}

Response:
{
  "ok": true,
  "result": {
    "pulled": true,
    "vfsPath": "/projects/my-repo/README.md",
    "size": 1234,
    "sha": "abc123..."
  }
}
```

### Push File to GitHub

```javascript
POST /api/mx2git/push

Request:
{
  "repo": "owner/repo",
  "branch": "main",
  "path": "README.md",
  "vfsPath": "/projects/my-repo/README.md",
  "message": "Update README via MX2GIT"
}

Response:
{
  "ok": true,
  "result": {
    "content": {
      "name": "README.md",
      "path": "README.md",
      "sha": "new_sha...",
      "size": 1234
    },
    "commit": {
      "sha": "commit_sha...",
      "message": "Update README via MX2GIT"
    }
  }
}
```

### Clone Repository

```javascript
POST /api/mx2git/clone

Request:
{
  "repo": "owner/repo",
  "branch": "main"
}

Response:
{
  "ok": true,
  "result": {
    "cloned": true,
    "project": "/projects/repo",
    "filesCloned": 42,
    "manifest": {
      "@context": "xjson://mx2git/project/v1",
      "name": "repo",
      "repo": "owner/repo",
      "branch": "main",
      "cloned_at": "2025-12-09T12:00:00.000Z",
      "files": [...]
    }
  }
}
```

### Import Repository (Register)

```javascript
POST /api/mx2git/import-github

Request:
{
  "repo_url": "https://github.com/owner/repo.git",
  "project_name": "my-project"  // Optional
}

Response:
{
  "ok": true,
  "project": "/projects/my-project",
  "manifest": {
    "@context": "xjson://mx2git/project/v1",
    "name": "my-project",
    "repo": "owner/repo",
    "repo_url": "https://github.com/owner/repo.git",
    "imported_at": "2025-12-09T12:00:00.000Z",
    "status": "registered"
  }
}
```

### List Projects

```javascript
GET /api/mx2git/projects

Response:
{
  "ok": true,
  "projects": [
    {
      "@context": "xjson://mx2git/project/v1",
      "name": "repo1",
      "repo": "owner/repo1",
      "imported_at": "2025-12-09T12:00:00.000Z"
    },
    {
      "@context": "xjson://mx2git/project/v1",
      "name": "repo2",
      "repo": "owner/repo2",
      "cloned_at": "2025-12-09T13:00:00.000Z"
    }
  ]
}
```

---

## 🤖 Agent: agent.git.sync

The core MX2GIT agent handles all GitHub operations.

**Role:** github_sync
**Scope:** github, vfs, asx_ram

### Actions

#### pull(repo, branch, path, vfsPath)
Pull a file from GitHub to ASX-RAM.

**KUHUL Execution:**
```
⟁Pop⟁github_api⟁Wo⟁credentials⟁Sek⟁fetch_content⟁Sek⟁decode_base64⟁Sek⟁write_vfs⟁Xul
```

#### push(repo, branch, path, vfsPath, message)
Push a file from ASX-RAM to GitHub.

**KUHUL Execution:**
```
⟁Pop⟁vfs_read⟁Wo⟁credentials⟁Sek⟁encode_base64⟁Sek⟁github_api⟁Sek⟁commit⟁Xul
```

#### clone(repo, branch)
Clone entire repository to ASX-RAM.

**KUHUL Execution:**
```
⟁Pop⟁github_tree⟁Wo⟁credentials⟁Sek⟁fetch_files⟁Sek⟁write_project⟁Sek⟁manifest⟁Xul
```

#### import(repo_url, project_name)
Register repository as project.

**KUHUL Execution:**
```
⟁Pop⟁parse_url⟁Wo⟁project_meta⟁Sek⟁write_manifest⟁Xul
```

---

## 🔒 Security

### Token Storage

GitHub tokens are stored in ASX-RAM at `/usr/secrets/github_token.json`:

```json
{
  "token": "ghp_xxxxxxxxxxxxxxxxxxxx",
  "created_at": "2025-12-09T12:00:00.000Z"
}
```

**Security Features:**
- ✅ Stored in browser Cache API (never localStorage)
- ✅ Never sent over network except to GitHub API
- ✅ Only accessible by `agent.git.sync`
- ✅ Cleared when cache is cleared

### Best Practices

1. **Use Fine-Grained Tokens**: Limit scope to specific repos
2. **Set Expiration**: Use short-lived tokens when possible
3. **Never Share**: Tokens are per-user, never share them
4. **Revoke When Done**: Revoke tokens after project completion

---

## 🔗 Integration

### With ASXR CMS

MX2GIT can be integrated with the main CMS to sync content:

```javascript
// In CMS, call MX2GIT API
const syncToGitHub = async (content, path) => {
  // Save to CMS ASX-RAM
  await fetch('/api/cms/blog/create', {
    method: 'POST',
    body: JSON.stringify({ content })
  });

  // Sync to GitHub via MX2GIT
  await fetch('http://localhost:8000/api/mx2git/push', {
    method: 'POST',
    body: JSON.stringify({
      repo: 'user/blog-repo',
      branch: 'main',
      path: path,
      vfsPath: '/projects/blog/' + path,
      message: 'Update from CMS'
    })
  });
};
```

### With POLYGOAT

MX2GIT can pull plugin code from GitHub for POLYGOAT validation:

```python
# In gas_polyglot_bridge.py
async def load_plugin_from_github(repo, path):
    # Pull from GitHub via MX2GIT
    res = await fetch('http://localhost:8000/api/mx2git/pull', {
        'repo': repo,
        'branch': 'main',
        'path': path,
        'vfsPath': f'/tmp/plugins/{path}'
    })

    # Read from ASX-RAM
    plugin_code = await ASXRAM.read(f'/tmp/plugins/{path}')

    # Validate with SECURITY-GOAT
    validation = security_goat.validate_plugin(plugin_code, path, 'github')

    return plugin_code, validation
```

### With MX2LM Brain Builders

MX2GIT can sync training data and model checkpoints:

```python
# In checkpoint_manager.py
async def backup_checkpoint_to_github(checkpoint_id):
    checkpoint_path = f'/checkpoints/{checkpoint_id}.json'

    # Export checkpoint
    checkpoint_data = export_checkpoint(checkpoint_id)

    # Write to MX2GIT ASX-RAM
    await ASXRAM.write(checkpoint_path, checkpoint_data)

    # Push to GitHub
    await fetch('http://localhost:8000/api/mx2git/push', {
        'repo': 'user/mx2lm-checkpoints',
        'branch': 'main',
        'path': f'checkpoints/{checkpoint_id}.json',
        'vfsPath': checkpoint_path,
        'message': f'Backup checkpoint {checkpoint_id}'
    })
```

---

## 📁 File Structure

```
mx2git/
├── index.html              # Main dashboard
├── github.html             # GitHub import UI
├── sw.js                   # Service worker kernel (600+ lines)
├── manifest.json           # MX2GIT manifest
├── README.md               # This file
└── tapes/
    └── tape_system_mx2git_v1.asxr.json  # System tape
```

---

## 🎨 UI Components

### Dashboard (index.html)

- **Status Overview** - Kernel status, project count, version
- **Feature Grid** - 6 core features explained
- **API Documentation** - Quick reference for all endpoints

### Import UI (github.html)

- **Token Management** - Save GitHub token securely
- **Repository Import** - Register repos as projects
- **Clone Interface** - Full repository download
- **Activity Log** - Real-time operation logging

---

## 🌐 Deployment

### Static Hosting

MX2GIT works on any static host:

- GitHub Pages
- Netlify
- Vercel
- CloudFlare Pages
- AWS S3 + CloudFront

**Requirements:**
- HTTPS (required for service workers)
- Modern browser with service worker support

### Build Steps

No build step required - all files are static!

```bash
# Just copy the mx2git/ directory
rsync -av mx2git/ user@server:/var/www/mx2git/
```

---

## 🔬 Development

### Service Worker Updates

After modifying `sw.js`:

1. Update `MX2GIT_OS_ID` version
2. Hard refresh browser (Ctrl+Shift+R)
3. Check DevTools > Application > Service Workers
4. Click "Update" or "Unregister" + refresh

### Debugging

**Service Worker Console:**
```
DevTools > Console > Filter: "[MX2GIT]"
```

**ASX-RAM Inspection:**
```
DevTools > Application > Cache Storage > MX2GIT_MICRO_ASXR_v1-runtime
```

**API Testing:**
```javascript
// Test manifest endpoint
const test = await fetch('/api/mx2git/manifest').then(r => r.json());
console.log(test);

// Test projects list
const projects = await fetch('/api/mx2git/projects').then(r => r.json());
console.log(projects);
```

---

## 🚀 Roadmap

### v1.1 (Planned)

- [ ] Diff visualization for changes
- [ ] Branch management UI
- [ ] Commit history viewer
- [ ] Merge conflict detection
- [ ] Multi-file batch operations

### v1.2 (Planned)

- [ ] GitHub Actions integration
- [ ] Pull request creation
- [ ] Issue tracking sync
- [ ] Gist support
- [ ] Organizations support

### v2.0 (Future)

- [ ] GitLab support
- [ ] Bitbucket support
- [ ] Self-hosted Git support
- [ ] SSH key authentication
- [ ] LFS support

---

## 📖 Documentation

- **KUHUL Pipeline:** See `tapes/tape_system_mx2git_v1.asxr.json`
- **Agent Specification:** See `manifest.json` agents section
- **API Surface:** See `sw.js` HTTP router
- **ASXR Trinity:** See `../README.md`

---

## 📄 License

Part of ASXR Trinity v3.2.0
Version: 13.2.0-XCFE-POLYGLOT-ETERNAL

---

## 🙏 Credits

Built with:
- KUHUL Pipeline Architecture
- XJSON Data Format
- XCFE Control Flow Governance
- ASX-RAM Virtual File System
- Service Worker API
- GitHub REST API v3

**Architecture:** Standalone Micro-ASXR
**Foundation:** ASXR Trinity v3.2.0
**Integration:** CMS-agnostic, POLYGOAT-compatible
