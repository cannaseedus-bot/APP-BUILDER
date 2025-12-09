# GAS Plugin System 🔌

**WordPress-Style Modular Google Apps Script Functions**

> **Version**: 1.0.0
> **Architecture**: Plugin-based, Public/Private, CMS-ready
> **Integration**: PI-GOAT Bridge for POLYGOAT compatibility

---

## 🎯 What is the GAS Plugin System?

The **GAS Plugin System** is a WordPress-style architecture for organizing Google Apps Script functions into **modular, reusable plugins** that anyone can add, modify, and share.

### Two Parallel Systems:

1. **PI-GOAT Bridge** (`python/mx2lm/gas_polyglot_bridge.py`)
   - Unified POLYGOAT integration
   - XCFE + KUHUL governance
   - For advanced system developers

2. **GAS Plugin Folder** (`gas/`)
   - WordPress-style modularity
   - Easy to learn and modify
   - For users adding custom functions

---

## 📁 Folder Structure

```
gas/
├── README.md                          (This file)
├── PLUGIN_MANIFEST.json               (Plugin registry)
│
├── core/                              (Core system plugins - merger request required)
│   ├── api-shard.js                  (API routing)
│   ├── manifest-shard.js             (Manifest serving)
│   └── shard-template.js             (Template for new shards)
│
├── agents/                            (AI specialist agents - merger request required)
│   ├── backend-ai-specialist.js      (Backend AI agent)
│   ├── design-ai-specialist.js       (Design AI agent)
│   └── frontend-ai-specialist.js     (Frontend AI agent)
│
├── mx2lm/                             (MX2LM orchestrators - merger request required)
│   ├── crown-foreman.js              (MX2LM crown)
│   ├── foreman-shard.js              (MX2LM foreman)
│   ├── foreman-two-brain.js          (Dual-brain foreman)
│   └── frontend-builder.js           (Full frontend builder)
│
├── functions/                         (Shared utility functions)
│   └── (empty - users can add helper functions)
│
└── plugins/                           (User plugins - fully modifiable)
    ├── examples/
    │   └── rlhf-forum-plugin.js      (Example: RLHF Forum CMS)
    └── (your plugins here)
```

---

## 🚀 Quick Start

### 1. Create a New Plugin

Copy the template:

```bash
cp gas/core/shard-template.js gas/plugins/my-plugin.js
```

### 2. Edit Your Plugin

```javascript
/**
 * My Custom Plugin
 *
 * Plugin Type: Public/Private
 * Modifiable: Yes (user plugin)
 * Author: Your Name
 */

function doGet(e) {
  return HtmlService.createHtmlOutput("<h1>My Plugin</h1>");
}

function doPost(e) {
  const action = e.parameter.action;
  // Your logic here
  return ContentService.createTextOutput(JSON.stringify({
    success: true
  })).setMimeType(ContentService.MimeType.JSON);
}
```

### 3. Deploy to Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Create new project
3. Paste your plugin code
4. Deploy as Web App
5. Copy the endpoint URL

### 4. Register Your Plugin

Edit `PLUGIN_MANIFEST.json`:

```json
{
  "user_plugins": [
    {
      "name": "My Custom Plugin",
      "file": "plugins/my-plugin.js",
      "functions": ["doGet", "doPost"],
      "endpoint": "https://script.google.com/macros/s/YOUR_ENDPOINT/exec",
      "tags": ["user", "custom"],
      "status": "active",
      "modifiable": true,
      "public": true,
      "author": "Your Name",
      "version": "1.0.0",
      "description": "My awesome plugin"
    }
  ]
}
```

---

## 🔐 Public vs Private Plugins

### Public Plugins
- Visible to all users
- Shareable endpoint
- Listed in public registry
- Can be forked by others

```json
{
  "public": true,
  "status": "active"
}
```

### Private Plugins
- Only you can see/use
- Endpoint kept private
- Not listed publicly
- For personal workflows

```json
{
  "public": false,
  "status": "active"
}
```

---

## 🏛️ Plugin Categories

| Category | Modifiable | Purpose |
|----------|-----------|---------|
| **Core** | ❌ No (merger request) | System-critical functions |
| **Agents** | ❌ No (merger request) | AI specialist agents |
| **MX2LM** | ❌ No (merger request) | MX2LM orchestrators |
| **Functions** | ✅ Yes | Shared utilities |
| **Plugins** | ✅ Yes | User custom plugins |

---

## 📦 Mini CMS System (RLHF Forum Example)

The **RLHF Forum Plugin** (`plugins/examples/rlhf-forum-plugin.js`) is actually a **mini CMS** that can be adapted for various use cases:

### CMS Features:
- ✅ **Content Management** (create, read, update, delete)
- ✅ **Category System** (dynamic filtering)
- ✅ **User Management** (authors, permissions)
- ✅ **Search** (full-text search)
- ✅ **Dynamic Pages** (render on demand)
- ✅ **Theming** (atomic CSS with color variables)
- ✅ **Modals** (create/edit forms)

### CMS Adaptations:

#### 1. **Documentation System**
```javascript
const CONFIG = {
  categories: ["Getting Started", "API Reference", "Tutorials", "FAQ"],
  theme: { /* your colors */ }
};
```

#### 2. **Product Catalog**
```javascript
const CONFIG = {
  categories: ["Electronics", "Clothing", "Books", "Food"],
  theme: { /* your colors */ }
};
```

#### 3. **Project Tracker**
```javascript
const CONFIG = {
  categories: ["In Progress", "Completed", "Blocked", "Backlog"],
  theme: { /* your colors */ }
};
```

#### 4. **Knowledge Base**
```javascript
const CONFIG = {
  categories: ["Engineering", "Marketing", "Sales", "Support"],
  theme: { /* your colors */ }
};
```

### To Adapt the CMS:

1. **Copy the template**:
   ```bash
   cp gas/plugins/examples/rlhf-forum-plugin.js gas/plugins/my-cms-plugin.js
   ```

2. **Update CONFIG**:
   ```javascript
   const CONFIG = {
     blogId: "YOUR_BLOG_ID",
     pluginName: "My CMS",
     categories: ["Category1", "Category2"],
     theme: { /* your colors */ }
   };
   ```

3. **Customize rendering**:
   - Change HTML structure
   - Modify CSS theme
   - Add custom fields

4. **Deploy and register** (see Quick Start above)

---

## 🔗 PI-GOAT Bridge Integration

Execute GAS plugins through the POLYGOAT architecture:

```python
from gas_polyglot_bridge import KUHULGASBridge, GASPolyglotDispatcher, GASEndpoint

# Initialize with SECURITY-GOAT enabled (default)
dispatcher = GASPolyglotDispatcher(enable_security=True)

# Register your plugin with code validation
plugin_code = """
function doPost(e) {
    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: processData(e.parameter)
    })).setMimeType(ContentService.MimeType.JSON);
}
"""

dispatcher.register_endpoint(
    endpoint=GASEndpoint(
        name="my-custom-plugin",
        url="https://script.google.com/macros/s/YOUR_ENDPOINT/exec",
        description="My awesome plugin",
        functions=["doGet", "doPost"],
        tags=["user", "custom"],
        public=True,
        author="your_username"
    ),
    plugin_code=plugin_code  # Optional: enables security validation
)

# Execute through enhanced KUHUL pipeline
# Pipeline: SECURITY → POP → WO → SEK → XUL → CH'EN
bridge = KUHULGASBridge(dispatcher)
result = await bridge.execute_through_pipeline(
    code="[Pop my-custom-plugin.doPost]→[Wo params]→[Sek execute]",
    context={
        "action": "getData",
        "id": 123,
        "author": "your_username"
    }
)

# Result includes security validation
print(result["security_validation"]["status"])  # APPROVED, NEEDS_REVIEW, etc.
print(result["security_validation"]["threat_score"])  # 0.0 to 1.0
```

---

## 🔒 SECURITY-GOAT Protection

**PI-GOAT IS ALSO SECURITY-GOAT** - All plugins are automatically validated for malware and security threats.

### Security Validation Process

When you register a plugin with code, SECURITY-GOAT automatically:

1. **Scans for Malware Patterns**:
   - `eval()` execution
   - Dynamic `Function()` constructor
   - XSS vulnerabilities (`innerHTML`)
   - Base64 obfuscation
   - Command execution
   - File system access

2. **Calculates Threat Score** (0.0 to 1.0):
   - **0.0 - 0.3**: SAFE ✅
   - **0.3 - 0.5**: LOW 🟨
   - **0.5 - 0.7**: MEDIUM ⚠️
   - **0.7 - 0.9**: HIGH 🔴
   - **0.9 - 1.0**: CRITICAL 🚨

3. **Determines Status**:
   - **APPROVED**: Safe to execute
   - **NEEDS_REVIEW**: Suspicious but allowed
   - **QUARANTINED**: High threat, requires manual review
   - **REJECTED**: Critical threat, execution blocked

### Security Example

```python
from gas_polyglot_bridge import GASPolyglotDispatcher, GASEndpoint

dispatcher = GASPolyglotDispatcher(enable_security=True)

# Safe plugin - will be APPROVED
safe_plugin = """
function doGet(e) {
    const data = {message: "Hello", timestamp: new Date().toISOString()};
    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}
"""

result = dispatcher.register_endpoint(
    endpoint=GASEndpoint(name="safe-plugin", url="...", author="you"),
    plugin_code=safe_plugin
)
# Output: ✅ APPROVED & Registered: safe-plugin (security score: 0.00)

# Malicious plugin - will be REJECTED
malicious_plugin = """
function doPost(e) {
    eval(e.parameter.code);  // DANGEROUS!
    return ContentService.createTextOutput("executed");
}
"""

result = dispatcher.register_endpoint(
    endpoint=GASEndpoint(name="malicious-plugin", url="...", author="unknown"),
    plugin_code=malicious_plugin
)
# Output: ❌ REJECTED: malicious-plugin - CRITICAL threat detected
#         Threats: 1 found, score: 0.90
```

### Bypassing Security (Not Recommended)

If you need to disable security for testing:

```python
# Disable SECURITY-GOAT
dispatcher = GASPolyglotDispatcher(enable_security=False)
```

**⚠️ Warning**: Only disable security in development environments. Production should always use SECURITY-GOAT.

---

## 📊 Plugin Sorting & Filtering

### By Tag
```javascript
// Filter by tag in PLUGIN_MANIFEST.json
{
  "tags": ["core", "agent", "mx2lm", "user", "rlhf", "forum"]
}
```

### By Status
```javascript
// Status values
{
  "status": "active" | "inactive" | "template" | "deprecated" | "testing"
}
```

### By Visibility
```javascript
// Public or private
{
  "public": true | false
}
```

### By Author
```javascript
{
  "author": "username"
}
```

---

## 🛠️ Plugin Development Best Practices

### 1. **Use XJSON Metadata**
```javascript
function getPluginMeta() {
  return {
    "@context": "xjson://asxr/gas/plugin/v1",
    "name": "My Plugin",
    "version": "1.0.0",
    "author": "Your Name",
    "tags": ["user", "custom"]
  };
}
```

### 2. **Atomic CSS Theming**
```css
:root {
  --plugin-bg: #000;
  --plugin-text: #16f2aa;
  --plugin-border: #0f3d22;
}
```

### 3. **Error Handling**
```javascript
function doPost(e) {
  try {
    // Your logic
    return successResponse(data);
  } catch(error) {
    return errorResponse(error.message);
  }
}
```

### 4. **Rate Limiting**
```javascript
const cache = CacheService.getScriptCache();
const key = `rate_limit_${user}`;
const count = cache.get(key) || 0;
if (count > 100) {
  return errorResponse("Rate limit exceeded");
}
```

---

## 📚 Example Plugins

### Example 1: Simple Data API
```javascript
function doGet(e) {
  const data = {
    message: "Hello from my plugin!",
    timestamp: new Date().toISOString()
  };

  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Example 2: Form Handler
```javascript
function doPost(e) {
  const name = e.parameter.name;
  const email = e.parameter.email;

  // Store in Google Sheets
  const sheet = SpreadsheetApp.openById("SHEET_ID").getActiveSheet();
  sheet.appendRow([name, email, new Date()]);

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: "Form submitted!"
  })).setMimeType(ContentService.MimeType.JSON);
}
```

### Example 3: CMS Page Renderer
```javascript
function doGet(e) {
  const pageId = e.parameter.page || "home";
  const content = getPageContent(pageId);

  return HtmlService.createHtmlOutput(renderPage(content))
    .setTitle(content.title);
}

function getPageContent(pageId) {
  // Fetch from Blogger, Sheets, or database
  return {
    title: "My Page",
    body: "<p>Page content here</p>",
    category: "Documentation"
  };
}
```

---

## 🔄 Updating Core Plugins

Core, Agent, and MX2LM plugins require **merger request** to modify:

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit pull request with:
   - Clear description
   - Test results
   - Breaking changes noted

---

## 🤝 Contributing Plugins

### Share Your Plugin Publicly:

1. Create your plugin in `gas/plugins/`
2. Add to `PLUGIN_MANIFEST.json` with `"public": true`
3. Document usage in comments
4. Submit pull request

### Keep Plugin Private:

1. Create plugin locally
2. Don't commit to repository
3. Deploy to your own GAS account
4. Use private endpoint

---

## 📖 Resources

- **GAS Documentation**: https://developers.google.com/apps-script
- **Blogger API**: https://developers.google.com/blogger
- **ASXR Trinity**: `manifest.json` in root
- **PI-GOAT Bridge**: `python/mx2lm/gas_polyglot_bridge.py`

---

## 🎯 Roadmap

- [ ] Plugin marketplace UI
- [ ] Version management system
- [ ] Dependency resolution
- [ ] Plugin analytics
- [ ] OAuth integration
- [ ] Multi-language support

---

**Built with 🔌 by the ASX Quantum Intelligence Team**

```
立v: 1.0.0-GAS-PLUGIN-SYSTEM
Status: OPERATIONAL
Type: WordPress-style modular
CMS: Built-in mini CMS system
```
