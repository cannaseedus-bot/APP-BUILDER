/**
 * RLHF Forum Plugin - Example User Plugin
 *
 * This is an EXAMPLE of how to create a custom GAS plugin.
 * Users can copy this template and modify it for their needs.
 *
 * Plugin Type: Public
 * Modifiable: Yes (user plugin)
 * Status: Example/Template
 *
 * FEATURES:
 * - WordPress-style plugin architecture
 * - Blogger integration for post/comment storage
 * - RLHF training data collection
 * - Green atomic CSS theme
 * - Modular and easy to customize
 *
 * DEPLOYMENT:
 * 1. Copy this file to your Google Apps Script project
 * 2. Deploy as Web App
 * 3. Add endpoint URL to PLUGIN_MANIFEST.json
 * 4. Set public: true/false based on visibility preference
 */

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
  blogId: "YOUR_BLOGGER_BLOG_ID",  // Replace with your Blogger blog ID
  pluginName: "RLHF Forum v2",
  pluginVersion: "1.0.0",
  author: "Your Name",
  public: true,  // Set to false for private plugin

  // RLHF Categories (must match Blogger labels)
  categories: [
    "General Discussion",
    "Prompt Design",
    "Model Feedback",
    "Reward Scores",
    "Training Runs",
    "Safety & Policy",
    "Bug Reports",
    "Feature Requests",
    "Research Notes"
  ],

  // Theme colors
  theme: {
    bg: "#000",
    panel: "#04170a",
    border: "#0f3d22",
    text: "#16f2aa",
    textMuted: "#0aca77",
    hazard: "#ffb300"
  }
};

// ============================================================
// MAIN HANDLERS
// ============================================================

function doGet(e) {
  return HtmlService.createHtmlOutput(renderForumHTML())
    .setTitle(CONFIG.pluginName)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  const action = e.parameter.action || "";

  switch(action) {
    case "create_topic":
      return createTopic(e.parameter);
    case "get_stats":
      return getForumStats();
    case "search":
      return searchTopics(e.parameter.query);
    default:
      return ContentService.createTextOutput(JSON.stringify({
        error: "Unknown action"
      })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// FORUM RENDERING
// ============================================================

function renderForumHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${CONFIG.pluginName}</title>

  <!-- Atomic CSS Theme -->
  <style>
    :root {
      --rlhf-bg: ${CONFIG.theme.bg};
      --rlhf-panel: ${CONFIG.theme.panel};
      --rlhf-border: ${CONFIG.theme.border};
      --rlhf-text: ${CONFIG.theme.text};
      --rlhf-text-muted: ${CONFIG.theme.textMuted};
      --rlhf-hazard: ${CONFIG.theme.hazard};
      --rlhf-glow: 0 0 12px #16f2aa55;
    }

    * {
      box-sizing: border-box;
      font-family: Consolas, Menlo, monospace;
    }

    body {
      background: var(--rlhf-bg);
      color: var(--rlhf-text);
      margin: 0;
      padding: 20px;
    }

    #rlhf-container {
      max-width: 1200px;
      margin: 0 auto;
      background: var(--rlhf-panel);
      border: 1px solid var(--rlhf-border);
      border-radius: 6px;
      box-shadow: var(--rlhf-glow);
      padding: 20px;
    }

    .header {
      border-bottom: 1px solid var(--rlhf-border);
      padding-bottom: 20px;
      margin-bottom: 20px;
    }

    .logo {
      font-size: 28px;
      font-weight: bold;
      color: var(--rlhf-text);
      text-shadow: var(--rlhf-glow);
    }

    .plugin-info {
      font-size: 11px;
      color: var(--rlhf-text-muted);
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }

    .section-header {
      background: #052412;
      color: var(--rlhf-hazard);
      padding: 12px 18px;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0 10px 0;
      border: 1px solid var(--rlhf-border);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--rlhf-panel);
    }

    th {
      background: #031c10;
      color: var(--rlhf-hazard);
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid var(--rlhf-border);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    td {
      padding: 12px 10px;
      border-bottom: 1px solid #0a2d19;
    }

    .topic-title {
      color: var(--rlhf-text);
      text-decoration: none;
      font-size: 16px;
      font-weight: bold;
    }

    .topic-title:hover {
      color: var(--rlhf-hazard);
      text-shadow: 0 0 12px #ffb30055;
    }

    .btn {
      background: #031c10;
      border: 1px solid var(--rlhf-border);
      color: var(--rlhf-text);
      padding: 8px 14px;
      border-radius: 4px;
      cursor: pointer;
      box-shadow: var(--rlhf-glow);
      font-family: inherit;
    }

    .btn:hover {
      background: #083b22;
    }
  </style>
</head>
<body>
  <div id="rlhf-container">
    <div class="header">
      <div class="logo">${CONFIG.pluginName}</div>
      <div class="plugin-info">
        Plugin: ${CONFIG.pluginVersion} · Author: ${CONFIG.author} ·
        Status: ${CONFIG.public ? 'Public' : 'Private'} ·
        Type: User Plugin (Modifiable)
      </div>
    </div>

    <div class="section-header">📊 RLHF Training Cases</div>

    <table>
      <thead>
        <tr>
          <th>Case / Thread</th>
          <th>Category</th>
          <th>Author</th>
          <th>Replies</th>
        </tr>
      </thead>
      <tbody id="topics">
        <tr>
          <td colspan="4" style="text-align:center; color: var(--rlhf-text-muted);">
            Loading RLHF cases...
          </td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 20px; text-align: center;">
      <button class="btn" onclick="createCase()">✚ New RLHF Case</button>
      <button class="btn" onclick="loadTopics()">⟳ Refresh</button>
    </div>
  </div>

  <script>
    // Load topics on page load
    function loadTopics() {
      // In production, fetch from Blogger API or your backend
      document.getElementById('topics').innerHTML = \`
        <tr>
          <td><a class="topic-title" href="#">Example RLHF Case #1</a></td>
          <td>Model Feedback</td>
          <td>trainer_01</td>
          <td>3</td>
        </tr>
        <tr>
          <td><a class="topic-title" href="#">Prompt Design Issue</a></td>
          <td>Prompt Design</td>
          <td>user_42</td>
          <td>7</td>
        </tr>
      \`;
    }

    function createCase() {
      alert('Create new RLHF case - implement modal form here');
    }

    // Load on page ready
    window.addEventListener('load', loadTopics);
  </script>
</body>
</html>
  `;
}

// ============================================================
// RLHF OPERATIONS
// ============================================================

function createTopic(params) {
  // In production: create Blogger post or store in your backend
  const result = {
    success: true,
    topicId: Utilities.getUuid(),
    title: params.title || "Untitled",
    author: params.author || "Anonymous",
    category: params.category || "General Discussion",
    timestamp: new Date().toISOString()
  };

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getForumStats() {
  // In production: fetch real stats from Blogger or backend
  const stats = {
    totalTopics: 42,
    totalReplies: 137,
    activeUsers: 15,
    categoryCounts: {}
  };

  CONFIG.categories.forEach(cat => {
    stats.categoryCounts[cat] = Math.floor(Math.random() * 20);
  });

  return ContentService.createTextOutput(JSON.stringify(stats))
    .setMimeType(ContentService.MimeType.JSON);
}

function searchTopics(query) {
  // In production: search Blogger posts or backend
  return ContentService.createTextOutput(JSON.stringify({
    query: query,
    results: []
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// PLUGIN METADATA (for registry)
// ============================================================

function getPluginMeta() {
  return {
    "@context": "xjson://asxr/gas/plugin/v1",
    "name": CONFIG.pluginName,
    "version": CONFIG.pluginVersion,
    "author": CONFIG.author,
    "public": CONFIG.public,
    "modifiable": true,
    "type": "user_plugin",
    "tags": ["rlhf", "forum", "training", "user"],
    "functions": ["doGet", "doPost", "renderForumHTML", "createTopic", "getForumStats"],
    "dependencies": [],
    "status": "active"
  };
}
