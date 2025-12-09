/**
 * MX2LM GAS AI — FULL MERGED BUILD
 * MX2LM + QWENF1 + MICRO-AGENT FRONTEND BUILDER
 *
 * DEPLOYMENT: Google Apps Script Web App
 * ENDPOINT: https://script.google.com/macros/s/AKfycbyWBaO1s-y1LZizMkqcB8mHtbWEcgngj4-rwGHCLaC3N-No2pn1OzYOvzdH-c89p6DM/exec
 *
 * PURPOSE:
 * - AI frontend generation with 5 micro-agents
 * - Prompt-to-UI pipeline (describe what you want, get complete frontend)
 * - Layout, Style, Components, Logic, Export agents working together
 * - Integration with MX2LM crowns and QWENF1 model
 *
 * MICRO-AGENTS:
 * 1. Layout Architect - Generates grid structures (header, sidebar, main, footer)
 * 2. Theme Stylist - Creates themes (glass, neon, dark) with color palettes
 * 3. Component Engineer - Builds UI components (cards, buttons, chat, forms)
 * 4. Behavior Engineer - Adds events and state management
 * 5. ASX Export Agent - Exports as HTML + asx-tape.json
 *
 * ARCHITECTURE:
 * - Primary: User's browser (local frontend generation)
 * - Backup: This GAS shard (cloud generation when local unavailable)
 * - Use when: Heavy UI generation, multi-agent coordination needed
 */

// =======================================================
// BOOT / STATE
// =======================================================

function mx2lmInit() {
  const scriptProps = PropertiesService.getScriptProperties();
  const userProps = PropertiesService.getUserProperties();
  const cache = CacheService.getScriptCache();

  let state = cache.get("mx2lm_state");
  if (state) return JSON.parse(state);

  let config = scriptProps.getProperties();
  if (!config.apiKey) {
    scriptProps.setProperties({
      apiKey: Utilities.getUuid(),
      projectName: "MX2LM GAS AI",
      version: "1.0.0",
      created: new Date().toISOString(),
      qwenf1Endpoint: "" // SET THIS TO YOUR COLAB / TPU / ASX RECEIVER URL
    });
    config = scriptProps.getProperties();
  }

  let tokenBalance = parseInt(userProps.getProperty("tokenBalance") || "100");
  let tokenAddress = userProps.getProperty("tokenAddress");
  if (!tokenAddress) {
    tokenAddress = "gas_" + Utilities.getUuid().replace(/-/g, "").slice(0, 32);
    userProps.setProperty("tokenAddress", tokenAddress);
  }

  let crowns = JSON.parse(
    scriptProps.getProperty("crowns") || JSON.stringify(mx2lmDefaultCrowns())
  );

  let tapes = JSON.parse(
    scriptProps.getProperty("tapes") || JSON.stringify(mx2lmDefaultTapes())
  );

  let models = JSON.parse(
    scriptProps.getProperty("models") || JSON.stringify(mx2lmDefaultModels())
  );

  let ngramModel = JSON.parse(
    scriptProps.getProperty("ngramModel") || JSON.stringify(mx2lmBasicNgrams())
  );

  let microAgents = JSON.parse(
    scriptProps.getProperty("microAgents") || JSON.stringify(mx2lmDefaultMicroAgents())
  );

  const stateObj = {
    tokenBalance,
    tokenAddress,
    crowns,
    tapes,
    models,
    ngramModel,
    microAgents,
    config
  };

  cache.put("mx2lm_state", JSON.stringify(stateObj), 300);
  return stateObj;
}

// -------------------------------
// DEFAULT DATA
// -------------------------------

function mx2lmDefaultCrowns() {
  return {
    mx2lm: { name: "MX2LM", tokenCost: 0, config: { style: "general" } },
    developer: { name: "Developer", tokenCost: 10, config: { style: "technical" } },
    creative: { name: "Creative", tokenCost: 5, config: { style: "creative" } },
    analyst: { name: "Analyst", tokenCost: 15, config: { style: "analytical" } }
  };
}

function mx2lmDefaultTapes() {
  return {
    "studio-web": { name: "Web Studio", tokenCost: 50 },
    "studio-data": { name: "Data Studio", tokenCost: 75 },
    "studio-docs": { name: "Docs Studio", tokenCost: 30 }
  };
}

function mx2lmDefaultModels() {
  return {
    qwenf1: {
      id: "qwenf1",
      name: "QWENF1 (ASX Fine-Tuned)",
      type: "external-inference",
      backend: "colab",
      driveFolder: "1DlNkskGibmCfHfG3XzstP4KUkXNy0sEC",
      files: {
        model: "1EK4X6V1-WSsbZtBzhnCm4KVnGXzj8iGj",
        optimizer: "1od43CLcg3jqKKtmfyj4DskOOJ5aP6YmV"
      },
      inputFormat: "json",
      outputFormat: "json",
      tokenCost: 25,
      status: "offline"
    }
  };
}

function mx2lmBasicNgrams() {
  return {
    bigrams: { "hello there": 0.9, "thank you": 0.8 },
    trigrams: { "how are you": 0.85 },
    responses: {
      greeting: ["Hello!", "Hi there!", "Greetings!"],
      thanks: ["You're welcome!", "Anytime!"],
      help: ["How can I help?", "What do you need?"],
      unknown: ["Can you rephrase that?"]
    }
  };
}

function mx2lmDefaultMicroAgents() {
  return {
    layout: {
      id: "layout",
      role: "Layout Architect",
      builds: ["grid", "columns", "dashboards"]
    },
    style: {
      id: "style",
      role: "Theme Stylist",
      builds: ["colors", "fonts", "glass", "neon"]
    },
    components: {
      id: "components",
      role: "Component Engineer",
      builds: ["buttons", "cards", "forms", "chat"]
    },
    logic: {
      id: "logic",
      role: "Behavior Engineer",
      builds: ["events", "state", "routing"]
    },
    exporter: {
      id: "exporter",
      role: "ASX Export Agent",
      builds: ["html", "pwa", "tape", "manifest"]
    }
  };
}

// -------------------------------
// GAS ROUTER
// -------------------------------

function doGet(e) { return mx2lmRouter(e); }
function doPost(e) { return mx2lmRouter(e); }

function mx2lmRouter(e) {
  const state = mx2lmInit();
  const path = (e.parameter.path || "").toLowerCase();
  const p = e.parameter || {};

  try {
    switch (path) {
      case "chat":
        if (p.model === "qwenf1") {
          return json(mx2lmDispatchToQwenf1(p.message));
        }
        return json(mx2lmProcessChat(p.message, p.crown || "mx2lm"));

      case "qwenf1":
        return json(mx2lmVerifyQwenf1Files());

      case "builder":
        return json(mx2lmFrontendBuilder(p));

      case "status":
        return json(mx2lmStatus());

      case "tokens":
        return json(mx2lmTokenRoute(p));

      case "crowns":
        return json({ success: true, crowns: state.crowns });

      case "tapes":
        return json(mx2lmTapeRoute(p));

      case "analyze":
        return json(mx2lmAnalyzeRoute(p));

      default:
        return json({
          success: true,
          service: "MX2LM Frontend Builder",
          version: state.config.version,
          endpoints: [
            "builder - Generate frontend from prompt",
            "chat - Chat with AI crowns",
            "qwenf1 - Verify QWENF1 model files",
            "status - System status",
            "tokens - Manage token balance",
            "crowns - List available crowns",
            "tapes - Load/list tapes",
            "analyze - Analyze Google Sheets data"
          ],
          microAgents: state.microAgents
        });
    }
  } catch (err) {
    return json({ success: false, error: err.message, stack: err.stack });
  }
}

// -------------------------------
// CHAT ENGINE (MX2LM)
// -------------------------------

function mx2lmProcessChat(message, crownId) {
  if (!message) return { success: false, error: "Message required" };

  const state = mx2lmInit();
  const crown = state.crowns[crownId];
  if (!crown) return { success: false, error: "Invalid crown" };

  if (crown.tokenCost > 0 && !mx2lmDeductTokens(crown.tokenCost)) {
    return { success: false, error: "Insufficient tokens" };
  }

  const response = mx2lmGenerateResponse(message, crown.config);
  mx2lmUpdateNgrams(message);

  return {
    success: true,
    response,
    crown: crown.name,
    tokensUsed: crown.tokenCost,
    remainingTokens: mx2lmInit().tokenBalance,
    timestamp: new Date().toISOString()
  };
}

function mx2lmGenerateResponse(input, config) {
  switch (config.style) {
    case "technical":
      return "Technical response: " + input;
    case "creative":
      return "Creative response: " + input;
    case "analytical":
      return "Analytical response: " + input;
    default:
      return "General response: " + input;
  }
}

// -------------------------------
// QWENF1 DRIVE + DISPATCH
// -------------------------------

function mx2lmVerifyQwenf1Files() {
  const state = mx2lmInit();
  const q = state.models.qwenf1;

  try {
    const folder = DriveApp.getFolderById(q.driveFolder);
    const modelFile = DriveApp.getFileById(q.files.model);
    const optFile = DriveApp.getFileById(q.files.optimizer);

    return {
      success: true,
      qwenf1: {
        status: "files_accessible",
        folder: {
          name: folder.getName(),
          id: q.driveFolder
        },
        model: {
          name: modelFile.getName(),
          sizeMB: (modelFile.getSize() / 1024 / 1024).toFixed(2),
          updated: modelFile.getLastUpdated().toISOString()
        },
        optimizer: {
          name: optFile.getName(),
          sizeMB: (optFile.getSize() / 1024 / 1024).toFixed(2),
          updated: optFile.getLastUpdated().toISOString()
        }
      }
    };

  } catch (e) {
    return {
      success: false,
      error: "QWENF1 files not accessible",
      details: e.message
    };
  }
}

function mx2lmDispatchToQwenf1(prompt) {
  const state = mx2lmInit();
  const q = state.models.qwenf1;

  if (!prompt) return { success: false, error: "Prompt required" };
  if (!mx2lmDeductTokens(q.tokenCost)) {
    return { success: false, error: "Insufficient tokens for QWENF1" };
  }

  if (!state.config.qwenf1Endpoint) {
    return {
      success: false,
      error: "QWENF1 endpoint not configured",
      instructions: "Set qwenf1Endpoint in script properties"
    };
  }

  const payload = {
    model: "qwenf1",
    prompt: prompt,
    modelFileId: q.files.model,
    optimizerFileId: q.files.optimizer,
    timestamp: new Date().toISOString()
  };

  try {
    const response = UrlFetchApp.fetch(state.config.qwenf1Endpoint, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    return JSON.parse(response.getContentText());
  } catch (e) {
    return {
      success: false,
      error: "Failed to connect to QWENF1 endpoint",
      details: e.message
    };
  }
}

// -------------------------------
// MICRO-AGENT FRONTEND BUILDER
// -------------------------------

function mx2lmFrontendBuilder(p) {
  const state = mx2lmInit();

  const prompt = p.prompt;
  const crown = p.crown || "mx2lm";
  const tape = p.tape || "studio-web";

  if (!prompt) {
    return { success: false, error: "Builder prompt required" };
  }

  // Token cost for generating a frontend
  const buildCost = 20;
  if (!mx2lmDeductTokens(buildCost)) {
    return { success: false, error: "Insufficient tokens for build" };
  }

  const layout = mx2lmAgentLayout(prompt, state.microAgents.layout);
  const style = mx2lmAgentStyle(prompt, crown, state.microAgents.style);
  const components = mx2lmAgentComponents(prompt, state.microAgents.components);
  const logic = mx2lmAgentLogic(prompt, state.microAgents.logic);
  const files = mx2lmAgentExport(layout, style, components, logic, tape, prompt, state.microAgents.exporter);

  return {
    success: true,
    buildCost,
    layout,
    style,
    components,
    logic,
    files,
    remainingTokens: mx2lmInit().tokenBalance,
    timestamp: new Date().toISOString()
  };
}

function mx2lmAgentLayout(prompt, agent) {
  // Simple heuristic; later can be QWENF1-assisted
  const hasSidebar = /sidebar|nav|menu/i.test(prompt);
  const hasHeader = /header|top bar|navbar/i.test(prompt);

  return {
    agent: agent.id,
    type: "grid",
    structure: {
      header: hasHeader,
      sidebar: hasSidebar,
      main: true,
      footer: true
    }
  };
}

function mx2lmAgentStyle(prompt, crown, agent) {
  let theme = "glass";
  if (/cyber|neon|hologram/i.test(prompt) || crown === "creative") theme = "neon";
  if (/dark|matrix|terminal/i.test(prompt) || crown === "developer") theme = "dark";

  return {
    agent: agent.id,
    theme,
    font: "Inter",
    palette: theme === "neon"
      ? { bg: "#050814", accent: "#39ffb6" }
      : theme === "dark"
      ? { bg: "#050505", accent: "#00bcd4" }
      : { bg: "#05070a", accent: "#00ffc6" }
  };
}

function mx2lmAgentComponents(prompt, agent) {
  const list = ["card", "button"];
  if (/chat/i.test(prompt)) list.push("chat-box");
  if (/dashboard|analytics|metrics/i.test(prompt)) list.push("stat-widget");
  if (/form|input|submit/i.test(prompt)) list.push("form");

  return {
    agent: agent.id,
    components: list
  };
}

function mx2lmAgentLogic(prompt, agent) {
  const events = ["click"];
  const stateVars = ["ready"];

  if (/loading|async|fetch/i.test(prompt)) {
    events.push("load");
    stateVars.push("loading");
  }

  if (/submit|form/i.test(prompt)) {
    events.push("submit");
    stateVars.push("submitting");
  }

  return {
    agent: agent.id,
    events,
    state: stateVars
  };
}

function mx2lmAgentExport(layout, style, components, logic, tape, prompt, agent) {
  const html =
`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ASX Frontend Builder</title>
  <style>
    body {
      margin: 0;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      background: ${style.palette.bg};
      color: #f5f5f5;
    }
    .app-grid {
      min-height: 100vh;
      display: grid;
      grid-template-columns: ${layout.structure.sidebar ? "260px 1fr" : "1fr"};
      grid-template-rows: ${layout.structure.header ? "64px 1fr" : "1fr"} ${layout.structure.footer ? "48px" : "0px"};
      gap: 12px;
      padding: 12px;
      box-sizing: border-box;
    }
    .card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 12px 16px;
      box-sizing: border-box;
    }
    .header { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; }
    .sidebar { }
    .main { }
    .footer { grid-column: 1 / -1; font-size: 12px; opacity: 0.6; display:flex; align-items:center; justify-content:space-between; }
    .btn {
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:8px 14px;
      border-radius:999px;
      border:none;
      cursor:pointer;
      font-size:13px;
      background:${style.palette.accent};
      color:#05070a;
    }
  </style>
</head>
<body>
  <div class="app-grid">
    ${layout.structure.header ? `
    <header class="card header">
      <div>Frontend built by MX2LM Micro-Agents</div>
      <button class="btn" onclick="alert('MX2LM Builder Ready')">Action</button>
    </header>` : ""}

    ${layout.structure.sidebar ? `
    <aside class="card sidebar">
      <h3>Sidebar</h3>
      <p>Components: ${components.components.join(", ")}</p>
    </aside>` : ""}

    <main class="card main">
      <h2>Main Surface</h2>
      <p>This is an auto-built layout for prompt:</p>
      <pre id="prompt-text"></pre>
    </main>

    ${layout.structure.footer ? `
    <footer class="card footer">
      <span>Tape: ${tape}</span>
      <span>Theme: ${style.theme}</span>
    </footer>` : ""}
  </div>

  <script>
    const prompt = ${JSON.stringify(prompt)};
    document.getElementById("prompt-text").textContent = prompt;
  </script>
</body>
</html>`;

  const tapeJson = {
    tape,
    layout,
    style,
    components,
    logic,
    exporter: agent.id,
    prompt: prompt,
    generatedAt: new Date().toISOString()
  };

  return [
    {
      name: "index.html",
      content: html
    },
    {
      name: "asx-tape.json",
      content: JSON.stringify(tapeJson, null, 2)
    }
  ];
}

// -------------------------------
// NGRAM UPDATE
// -------------------------------

function mx2lmUpdateNgrams(input) {
  const state = mx2lmInit();
  const words = input.toLowerCase().split(" ");
  for (let i = 0; i < words.length - 1; i++) {
    const bg = words[i] + " " + words[i + 1];
    state.ngramModel.bigrams[bg] = (state.ngramModel.bigrams[bg] || 0) + 0.1;
  }
  PropertiesService.getScriptProperties()
    .setProperty("ngramModel", JSON.stringify(state.ngramModel));
}

// -------------------------------
// TOKENS
// -------------------------------

function mx2lmDeductTokens(amount) {
  const userProps = PropertiesService.getUserProperties();
  let bal = parseInt(userProps.getProperty("tokenBalance") || "100");
  if (bal < amount) return false;
  bal -= amount;
  userProps.setProperty("tokenBalance", bal.toString());
  return true;
}

function mx2lmAddTokens(amount) {
  const userProps = PropertiesService.getUserProperties();
  let bal = parseInt(userProps.getProperty("tokenBalance") || "100");
  bal += amount;
  userProps.setProperty("tokenBalance", bal.toString());
  return { success: true, newBalance: bal };
}

function mx2lmTokenRoute(p) {
  if (p.action === "balance") {
    const s = mx2lmInit();
    return { success: true, balance: s.tokenBalance, address: s.tokenAddress };
  }
  if (p.action === "add") return mx2lmAddTokens(parseInt(p.amount || 0));
  return { success: false, error: "Invalid token action" };
}

// -------------------------------
// TAPES
// -------------------------------

function mx2lmTapeRoute(p) {
  const state = mx2lmInit();
  if (p.action === "load" && state.tapes[p.tapeId]) {
    return {
      success: true,
      tape: state.tapes[p.tapeId],
      files: mx2lmLoadTapeFiles(p.tapeId)
    };
  }
  return { success: true, tapes: state.tapes };
}

function mx2lmLoadTapeFiles(id) {
  if (id === "studio-web") {
    return [
      { name: "index.html", content: "<h1>Hello Web</h1>" },
      { name: "style.css", content: "body{font-family:sans-serif}" }
    ];
  }
  if (id === "studio-data") {
    return [
      { name: "data.csv", content: "Name,Age,Score\nAlice,25,95\nBob,30,88\nCharlie,22,92" }
    ];
  }
  return [];
}

// -------------------------------
// DATA ANALYSIS
// -------------------------------

function mx2lmAnalyzeRoute(p) {
  if (!p.sheetId) return { success: false, error: "Sheet ID required" };

  try {
    const sheet = SpreadsheetApp.openById(p.sheetId);
    const range = sheet.getRange(p.range || "A1:Z1000");
    const data = range.getValues();

    return {
      success: true,
      rows: data.length,
      columns: data[0].length,
      analysis: {
        totalCells: data.length * data[0].length,
        emptyCells: data.flat().filter(cell => !cell).length
      }
    };
  } catch (e) {
    return {
      success: false,
      error: "Failed to analyze sheet",
      details: e.message
    };
  }
}

// -------------------------------
// STATUS
// -------------------------------

function mx2lmStatus() {
  const s = mx2lmInit();
  return {
    success: true,
    version: s.config.version,
    tokens: s.tokenBalance,
    crowns: Object.keys(s.crowns).length,
    tapes: Object.keys(s.tapes).length,
    models: Object.keys(s.models).length,
    microAgents: Object.keys(s.microAgents).length,
    timestamp: new Date().toISOString()
  };
}

// -------------------------------
// GAS UI MENU
// -------------------------------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("MX2LM AI")
    .addItem("Open Chat", "showChatSidebar")
    .addItem("Test Builder", "testBuilder")
    .addToUi();
}

function showChatSidebar() {
  const html = HtmlService.createHtmlOutput("<h3>MX2LM + QWENF1 + Builder Ready</h3>");
  SpreadsheetApp.getUi().showSidebar(html);
}

function testBuilder() {
  const result = mx2lmFrontendBuilder({
    prompt: "Create a dark dashboard with sidebar and analytics",
    crown: "developer",
    tape: "studio-web"
  });

  SpreadsheetApp.getUi().alert(
    "Frontend Builder Test\n\n" +
    "Success: " + result.success + "\n" +
    "Theme: " + result.style.theme + "\n" +
    "Components: " + result.components.components.join(", ") + "\n" +
    "Files: " + result.files.length
  );
}

// -------------------------------
// JSON OUTPUT
// -------------------------------

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}
