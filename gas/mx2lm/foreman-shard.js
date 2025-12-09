/**
 * MX2LM FOREMAN SHARD
 * Router + State + Tokens + Micro-Agent Registry
 *
 * DEPLOYMENT: Google Apps Script Web App
 * ENDPOINT: https://script.google.com/macros/s/AKfycbyHFohuK7CGXRDPdHHZkBbNXl_dLGHmwy3eKMJEKJOD9imdLGpKJH4J31PrjQFkaTnEnA/exec
 *
 * PURPOSE:
 * - Central orchestrator/router for specialized micro-agents
 * - Token-based global economy system
 * - Agent registry and coordination
 * - Routes to Frontend, Backend, and Design specialists
 *
 * MICRO-AGENTS:
 * 1. Frontend Specialist 🎨 - UI/UX & K'uhul DOM
 * 2. Backend Specialist ⚡ - APIs & Data Logic (XJSON)
 * 3. Design Specialist 🎯 - Visual Design & 3D Graphics (Three.js)
 *
 * ARCHITECTURE:
 * - Primary: User's browser (local agent execution)
 * - Backup: This GAS shard (cloud routing when local unavailable)
 * - Use when: Need specialized agent coordination, token management
 *
 * K'UHUL PIPELINE:
 * Each agent uses K'uhul execution pipeline:
 * Pop (parse) → Wo (bind) → Sek (execute) → Yax (transform) → Xul (mutate) → Ch'en (output)
 */

// =======================================================
// BOOT / STATE
// =======================================================

function mx2lmInit() {
  var scriptProps = PropertiesService.getScriptProperties();
  var userProps = PropertiesService.getUserProperties();
  var cache = CacheService.getScriptCache();

  var cached = cache.get("mx2lm_foreman_state");
  if (cached) return JSON.parse(cached);

  var config = scriptProps.getProperties();
  if (!config.projectName) {
    scriptProps.setProperties({
      projectName: "MX2LM_FOREMAN_SHARD",
      version: "1.0.0",
      created: new Date().toISOString()
    });
    config = scriptProps.getProperties();
  }

  var tokenBalance = parseInt(userProps.getProperty("tokenBalance") || "100", 10);
  var tokenAddress = userProps.getProperty("tokenAddress");
  if (!tokenAddress) {
    tokenAddress = "gas_" + Utilities.getUuid().replace(/-/g, "").slice(0, 32);
    userProps.setProperty("tokenAddress", tokenAddress);
  }

  var microAgents = JSON.parse(
    scriptProps.getProperty("microAgents") ||
    JSON.stringify(mx2lmDefaultMicroAgents())
  );

  var state = {
    config: config,
    tokenBalance: tokenBalance,
    tokenAddress: tokenAddress,
    microAgents: microAgents
  };

  cache.put("mx2lm_foreman_state", JSON.stringify(state), 300);
  return state;
}

// -------------------------------
// MICRO-AGENT REGISTRY
// -------------------------------

function mx2lmDefaultMicroAgents() {
  return {
    frontend_specialist: {
      id: "frontend_specialist",
      emoji: "🎨",
      role: "Frontend AI Specialist",
      domain: "UI/UX & K'uhul DOM",
      description: "Creates beautiful interfaces using K'uhul glyphs. Handles animations, responsive design, and user interactions.",
      api: "POST /frontend/generate-ui",
      pipeline: "[Pop frontend_expert] [Wo design_spec]→[Ch'en spec] [Yax spec]→[Sek generate_ui_ast] [Yax ui_ast]→[Sek compile_to_kuhul] [Sek deploy_interface] [Xul]"
    },
    backend_specialist: {
      id: "backend_specialist",
      emoji: "⚡",
      role: "Backend AI Specialist",
      domain: "APIs & Data Logic",
      description: "Builds virtual servers, handles data processing, and creates REST APIs using XJSON and K'uhul execution engine.",
      api: "POST /backend/create-api",
      pipeline: "[Pop backend_expert] [Wo api_spec]→[Ch'en spec] [Yax spec]→[Sek generate_xjson_api] [Yax xjson_api]→[Sek deploy_virtual_server] [Sek register_routes] [Xul]"
    },
    design_specialist: {
      id: "design_specialist",
      emoji: "🎯",
      role: "Design AI Specialist",
      domain: "Visual Design & 3D Graphics",
      description: "Creates stunning visuals, 3D elements, and design systems. Integrates Three.js and CSS animations.",
      api: "POST /design/create-3d",
      pipeline: "[Pop design_expert] [Wo design_brief]→[Ch'en brief] [Yax brief]→[Sek generate_design_system] [Yax design_system]→[Sek create_3d_elements] [Sek apply_animations] [Xul]"
    }
  };
}

// -------------------------------
// WEB APP ENTRYPOINTS
// -------------------------------

function doGet(e) {
  return mx2lmRouter(e, "GET");
}

function doPost(e) {
  return mx2lmRouter(e, "POST");
}

// Central router: MX2LM is the foreman
function mx2lmRouter(e, method) {
  var p = e && e.parameter ? e.parameter : {};
  var path = (p.path || "").toLowerCase();

  try {
    switch (path) {
      case "status":
        return json(mx2lmStatus());

      case "tokens":
        return json(mx2lmTokenRoute(p));

      case "agents":
        return json(mx2lmAgentsRoute());

      case "frontend/generate-ui":
        // Stub: Would be implemented in separate specialist file
        return json(frontendGenerateUI(p));

      case "backend/create-api":
        // Stub: Would be implemented in separate specialist file
        return json(backendCreateAPI(p));

      case "design/create-3d":
        // Stub: Would be implemented in separate specialist file
        return json(designCreate3D(p));

      case "ping":
      case "chat":
        return json(mx2lmPing(p));

      default:
        return json(mx2lmRootInfo(method));
    }
  } catch (err) {
    return json({
      success: false,
      error: err && err.message ? err.message : String(err),
      timestamp: new Date().toISOString()
    });
  }
}

// -------------------------------
// SPECIALIST STUBS (TO BE IMPLEMENTED)
// -------------------------------

function frontendGenerateUI(p) {
  var prompt = p.prompt || p.spec || "";
  if (!prompt) {
    return { success: false, error: "Frontend prompt/spec required" };
  }

  var deduct = mx2lmDeductTokens(15);
  if (!deduct.ok) {
    return { success: false, error: "Insufficient tokens (need 15)" };
  }

  return {
    success: true,
    agent: "frontend_specialist",
    prompt: prompt,
    result: {
      ui_generated: true,
      framework: "K'uhul DOM",
      components: ["header", "sidebar", "main", "footer"],
      animations: true,
      responsive: true
    },
    tokensUsed: 15,
    remainingTokens: deduct.balance,
    timestamp: new Date().toISOString()
  };
}

function backendCreateAPI(p) {
  var spec = p.spec || p.endpoints || "";
  if (!spec) {
    return { success: false, error: "Backend API spec required" };
  }

  var deduct = mx2lmDeductTokens(20);
  if (!deduct.ok) {
    return { success: false, error: "Insufficient tokens (need 20)" };
  }

  return {
    success: true,
    agent: "backend_specialist",
    spec: spec,
    result: {
      api_created: true,
      format: "XJSON REST API",
      endpoints: ["/api/data", "/api/process", "/api/query"],
      virtual_server: true
    },
    tokensUsed: 20,
    remainingTokens: deduct.balance,
    timestamp: new Date().toISOString()
  };
}

function designCreate3D(p) {
  var brief = p.brief || p.design || "";
  if (!brief) {
    return { success: false, error: "Design brief required" };
  }

  var deduct = mx2lmDeductTokens(25);
  if (!deduct.ok) {
    return { success: false, error: "Insufficient tokens (need 25)" };
  }

  return {
    success: true,
    agent: "design_specialist",
    brief: brief,
    result: {
      design_created: true,
      framework: "Three.js + CSS Animations",
      elements: ["3d_scene", "particle_system", "animated_glyphs"],
      quality: "high"
    },
    tokensUsed: 25,
    remainingTokens: deduct.balance,
    timestamp: new Date().toISOString()
  };
}

// -------------------------------
// ROOT + STATUS
// -------------------------------

function mx2lmRootInfo(method) {
  var state = mx2lmInit();
  return {
    success: true,
    shard: "MX2LM_FOREMAN_SHARD",
    method: method,
    version: state.config.version,
    tokens: state.tokenBalance,
    tokenAddress: state.tokenAddress,
    microAgents: Object.keys(state.microAgents),
    endpoints: [
      { path: "?path=status", description: "Shard status" },
      { path: "?path=tokens&action=balance", description: "Token balance" },
      { path: "?path=agents", description: "Micro-agent registry" },
      { path: "?path=frontend/generate-ui&prompt=...", description: "Frontend AI Specialist (15 tokens)" },
      { path: "?path=backend/create-api&spec=...", description: "Backend AI Specialist (20 tokens)" },
      { path: "?path=design/create-3d&brief=...", description: "Design AI Specialist (25 tokens)" },
      { path: "?path=ping&message=hello", description: "Simple MX2LM ping" }
    ],
    timestamp: new Date().toISOString()
  };
}

function mx2lmStatus() {
  var s = mx2lmInit();
  return {
    success: true,
    shard: "MX2LM_FOREMAN_SHARD",
    version: s.config.version,
    tokenBalance: s.tokenBalance,
    tokenAddress: s.tokenAddress,
    microAgents: Object.keys(s.microAgents),
    agentDetails: s.microAgents,
    timestamp: new Date().toISOString()
  };
}

// -------------------------------
// TOKENS (GLOBAL ECONOMY)
// -------------------------------

function mx2lmDeductTokens(amount) {
  var userProps = PropertiesService.getUserProperties();
  var cache = CacheService.getScriptCache();

  var bal = parseInt(userProps.getProperty("tokenBalance") || "100", 10);
  if (bal < amount) {
    return { ok: false, balance: bal };
  }

  bal -= amount;
  userProps.setProperty("tokenBalance", String(bal));

  var state = mx2lmInit();
  state.tokenBalance = bal;
  cache.put("mx2lm_foreman_state", JSON.stringify(state), 300);

  return { ok: true, balance: bal };
}

function mx2lmAddTokens(amount) {
  if (!amount || isNaN(amount)) {
    return { success: false, error: "Invalid amount" };
  }

  var userProps = PropertiesService.getUserProperties();
  var cache = CacheService.getScriptCache();

  var bal = parseInt(userProps.getProperty("tokenBalance") || "100", 10);
  bal += Number(amount);
  userProps.setProperty("tokenBalance", String(bal));

  var state = mx2lmInit();
  state.tokenBalance = bal;
  cache.put("mx2lm_foreman_state", JSON.stringify(state), 300);

  return { success: true, newBalance: bal };
}

function mx2lmTokenRoute(p) {
  var action = (p.action || "").toLowerCase();

  if (action === "balance") {
    var s = mx2lmInit();
    return { success: true, balance: s.tokenBalance, address: s.tokenAddress };
  }

  if (action === "add") {
    var amount = parseInt(p.amount || "0", 10);
    return mx2lmAddTokens(amount);
  }

  return { success: false, error: "Invalid token action" };
}

// -------------------------------
// AGENTS LIST
// -------------------------------

function mx2lmAgentsRoute() {
  var state = mx2lmInit();
  return {
    success: true,
    totalAgents: Object.keys(state.microAgents).length,
    agents: state.microAgents
  };
}

// -------------------------------
// SIMPLE PING / ECHO
// -------------------------------

function mx2lmPing(p) {
  var msg = p.message || "";
  if (!msg) {
    return { success: false, error: "message required" };
  }

  return {
    success: true,
    input: msg,
    response: "MX2LM Foreman heard: " + msg,
    timestamp: new Date().toISOString()
  };
}

// -------------------------------
// JSON HELPER
// -------------------------------

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------
// MENU (if deployed with spreadsheet)
// -------------------------------

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("MX2LM Foreman")
      .addItem("Check Status", "showStatus")
      .addItem("View Agents", "showAgents")
      .addItem("Token Balance", "showTokens")
      .addToUi();
  } catch (e) {
    // Not a spreadsheet deployment, skip menu
  }
}

function showStatus() {
  var status = mx2lmStatus();
  SpreadsheetApp.getUi().alert(
    "MX2LM Foreman Status\n\n" +
    "Version: " + status.version + "\n" +
    "Tokens: " + status.tokenBalance + "\n" +
    "Agents: " + status.microAgents.length
  );
}

function showAgents() {
  var agents = mx2lmAgentsRoute();
  var list = [];
  for (var key in agents.agents) {
    var agent = agents.agents[key];
    list.push(agent.emoji + " " + agent.role);
  }
  SpreadsheetApp.getUi().alert(
    "Micro-Agents\n\n" + list.join("\n")
  );
}

function showTokens() {
  var state = mx2lmInit();
  SpreadsheetApp.getUi().alert(
    "Token Balance\n\n" +
    "Balance: " + state.tokenBalance + "\n" +
    "Address: " + state.tokenAddress
  );
}
