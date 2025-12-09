/**
 * FRONT_END.GS — FRONTEND AI SPECIALIST SHARD
 *
 * DEPLOYMENT: Google Apps Script Web App
 * ENDPOINT: https://script.google.com/macros/s/AKfycbyK5kmpLi6vubXodytm23YruT-V-dt9IdKf20kP8pwKCxC--mpEpnr5R4gQlZ_CmQD2Pg/exec
 *
 * PURPOSE:
 * - Dedicated Frontend AI Specialist for UI/UX generation
 * - Domain: UI/UX & K'uhul DOM
 * - Generates UI AST, K'uhul DOM operations, and HTML previews
 * - Token-based usage (5 tokens per generation)
 *
 * ARCHITECTURE:
 * - Specialized single-purpose frontend generation agent
 * - Uses K'uhul pipeline for DOM operations
 * - Supports multiple UI types (dashboard, landing, app)
 * - Style variations (modern, minimal, glass, neon)
 * - Component composition (charts, navigation, cards, forms)
 */

// =======================================================
// INITIALIZATION & STATE
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
      projectName: "MX2LM Frontend AI Specialist",
      version: "1.0.0",
      created: new Date().toISOString()
    });
  }

  let tokenBalance = parseInt(userProps.getProperty("tokenBalance") || "100");
  let tokenAddress = userProps.getProperty("tokenAddress");
  if (!tokenAddress) {
    tokenAddress = "gas_" + Utilities.getUuid().replace(/-/g, "").slice(0, 32);
    userProps.setProperty("tokenAddress", tokenAddress);
  }

  let microAgents = JSON.parse(
    scriptProps.getProperty("microAgents") || JSON.stringify(mx2lmDefaultMicroAgents())
  );

  const stateObj = {
    tokenBalance,
    tokenAddress,
    microAgents,
    config
  };

  cache.put("mx2lm_state", JSON.stringify(stateObj), 300);
  return stateObj;
}

function mx2lmDefaultMicroAgents() {
  return {
    frontend_specialist: {
      id: "frontend_specialist",
      emoji: "🎨",
      role: "Frontend AI Specialist",
      domain: "UI/UX & K'uhul DOM",
      pipeline: "[Pop frontend_expert] [Wo design_spec]→[Ch'en spec] [Yax spec]→[Sek generate_ui_ast] [Yax ui_ast]→[Sek compile_to_kuhul] [Sek deploy_interface] [Xul]"
    }
  };
}

// =======================================================
// ROUTER
// =======================================================

function doGet(e) { return mx2lmRouter(e, "GET"); }
function doPost(e) { return mx2lmRouter(e, "POST"); }

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
      case "generate-ui":
        return json(frontendGenerateUI(p));
      default:
        return json(mx2lmRootInfo(method));
    }
  } catch (err) {
    return json({
      success: false,
      error: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : ""
    });
  }
}

function mx2lmRootInfo(method) {
  var state = mx2lmInit();
  return {
    success: true,
    shard: "FRONTEND_AI_SPECIALIST",
    version: state.config.version,
    method: method || "GET",
    endpoints: [
      "?path=status - System status",
      "?path=tokens - Token management (action=balance|add, amount=N)",
      "?path=agents - List micro-agents",
      "?path=frontend/generate-ui - Generate UI (type, style, components params)"
    ],
    agent: state.microAgents.frontend_specialist
  };
}

// =======================================================
// FRONTEND GENERATION
// =======================================================

function frontendGenerateUI(p) {
  var state = mx2lmInit();
  var agent = state.microAgents.frontend_specialist;

  var type = p.type || "dashboard";
  var style = p.style || "modern";
  var componentsParam = p.components || "";
  var components = componentsParam
    ? componentsParam.split(",").map(function (c) { return c.trim(); })
    : ["charts", "navigation"];

  var cost = 5;
  var result = mx2lmDeductTokens(cost);
  if (!result.ok) {
    return {
      success: false,
      error: "Insufficient tokens for frontend build",
      balance: result.balance
    };
  }

  var uiAst = {
    type: type,
    style: style,
    layout: {
      root: "app",
      regions: ["header", "main", "sidebar", "footer"]
    },
    components: components.map(function (name, index) {
      return {
        id: "cmp_" + index,
        type: name,
        region:
          name === "navigation" ? "header" :
          name === "charts" ? "main" :
          "sidebar",
        props: {}
      };
    })
  };

  var kuhulDom = {
    "@pipeline": agent.pipeline,
    "@ui_ast_ref": "ui_ast",
    "@ops": [
      { "@op": "dom.set", "@target": "#app", "@data": "ui_ast" },
      { "@op": "dom.render", "@target": "#app" }
    ]
  };

  var previewHtml =
'<!DOCTYPE html>\n' +
'<html>\n' +
'<head>\n' +
'  <meta charset="utf-8">\n' +
'  <title>Frontend AI Specialist Preview</title>\n' +
'  <style>\n' +
'    body { margin:0; font-family: system-ui, sans-serif; background:#05070a; color:#f5f5f5; }\n' +
'    .app { min-height:100vh; display:grid; grid-template-rows:64px 1fr 40px; grid-template-columns:260px 1fr; gap:8px; padding:8px; box-sizing:border-box; }\n' +
'    .card { background:rgba(255,255,255,0.04); border-radius:10px; padding:10px 14px; border:1px solid rgba(255,255,255,0.08); }\n' +
'    .header { grid-column:1 / -1; display:flex; align-items:center; justify-content:space-between; }\n' +
'    .sidebar { }\n' +
'    .main { }\n' +
'    .footer { grid-column:1 / -1; font-size:11px; opacity:0.65; display:flex; justify-content:space-between; align-items:center; }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <div class="app">\n' +
'    <header class="card header">\n' +
'      <span>🎨 Frontend AI Specialist — ' + type + ' (' + style + ')</span>\n' +
'      <span>Components: ' + components.join(", ") + '</span>\n' +
'    </header>\n' +
'    <aside class="card sidebar">Sidebar / Navigation</aside>\n' +
'    <main class="card main">Main surface for charts / cards</main>\n' +
'    <footer class="card footer">\n' +
'      <span>MX2LM Frontend Shard</span>\n' +
'      <span>Tokens used: ' + cost + '</span>\n' +
'    </footer>\n' +
'  </div>\n' +
'</body>\n' +
'</html>\n';

  return {
    success: true,
    shard: "FRONTEND_AI_SPECIALIST",
    agent: agent,
    cost: cost,
    remainingTokens: result.balance,
    ui_ast: uiAst,
    kuhul_dom: kuhulDom,
    html_preview: previewHtml,
    timestamp: new Date().toISOString()
  };
}

// =======================================================
// TOKEN MANAGEMENT
// =======================================================

function mx2lmDeductTokens(amount) {
  const userProps = PropertiesService.getUserProperties();
  let bal = parseInt(userProps.getProperty("tokenBalance") || "100");
  if (bal < amount) {
    return { ok: false, balance: bal };
  }
  bal -= amount;
  userProps.setProperty("tokenBalance", bal.toString());
  return { ok: true, balance: bal };
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
  if (p.action === "add") {
    return mx2lmAddTokens(parseInt(p.amount || 0));
  }
  return { success: false, error: "Invalid token action (use balance or add)" };
}

// =======================================================
// STATUS & AGENTS
// =======================================================

function mx2lmStatus() {
  const s = mx2lmInit();
  return {
    success: true,
    shard: "FRONTEND_AI_SPECIALIST",
    version: s.config.version,
    tokens: s.tokenBalance,
    agents: Object.keys(s.microAgents).length,
    timestamp: new Date().toISOString()
  };
}

function mx2lmAgentsRoute() {
  const s = mx2lmInit();
  return {
    success: true,
    agents: s.microAgents
  };
}

// =======================================================
// JSON OUTPUT
// =======================================================

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}
