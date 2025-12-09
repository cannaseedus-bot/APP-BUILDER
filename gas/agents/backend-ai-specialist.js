/**
 * BACK_END.GS — BACKEND AI SPECIALIST SHARD
 *
 * DEPLOYMENT: Google Apps Script Web App
 * ENDPOINT: https://script.google.com/macros/s/AKfycbxCkCm0kG-1vy1q1M-e12xOsgAdvAvjmye1kti3rNnu4NMC7fW_TJ1MK4TToT37PVua/exec
 *
 * PURPOSE:
 * - Dedicated Backend AI Specialist for APIs & Data Logic
 * - Domain: XJSON API Generation, Virtual Server Configuration, Route Registration
 * - Generates: XJSON API specs, virtual server configs, K'uhul route handlers
 * - Token-based usage (7 tokens per API generation)
 *
 * ARCHITECTURE:
 * - Specialized single-purpose backend/API generation agent
 * - Uses K'uhul pipeline for API operations
 * - Generates XJSON-compliant API specifications
 * - Creates virtual server configurations for browser-based execution
 * - Auto-generates route handlers
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
      projectName: "MX2LM Backend AI Specialist",
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
    backend_specialist: {
      id: "backend_specialist",
      emoji: "⚡",
      role: "Backend AI Specialist",
      domain: "APIs & Data Logic",
      pipeline: "[Pop backend_expert] [Wo api_spec]→[Ch'en spec] [Yax spec]→[Sek generate_xjson_api] [Yax xjson_api]→[Sek deploy_virtual_server] [Sek register_routes] [Xul]"
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
      case "backend/create-api":
      case "create-api":
        return json(backendCreateAPI(p));
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
    shard: "BACKEND_AI_SPECIALIST",
    version: state.config.version,
    method: method || "GET",
    endpoints: [
      "?path=status - System status",
      "?path=tokens - Token management (action=balance|add, amount=N)",
      "?path=agents - List micro-agents",
      "?path=backend/create-api - Create API (spec or endpoints params)",
      "?path=create-api - Shorthand for backend/create-api"
    ],
    agent: state.microAgents.backend_specialist
  };
}

// =======================================================
// BACKEND API GENERATION
// =======================================================

function backendCreateAPI(p) {
  var state = mx2lmInit();
  var agent = state.microAgents.backend_specialist;

  var endpoints = [];

  // Prefer JSON spec if provided
  var rawSpec = p.spec || "";
  if (rawSpec) {
    try {
      var parsed = JSON.parse(rawSpec);
      if (parsed && parsed.endpoints) {
        endpoints = parsed.endpoints;
      }
    } catch (e) {
      // ignore; fall through
    }
  }

  // Fallback: endpoints as simple "/users:GET;/orders:POST"
  if (!endpoints.length && p.endpoints) {
    var parts = p.endpoints.split(";");
    endpoints = parts
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s; })
      .map(function (s) {
        var bits = s.split(":");
        return {
          path: bits[0] || "/",
          method: (bits[1] || "GET").toUpperCase()
        };
      });
  }

  // Default example if nothing provided
  if (!endpoints.length) {
    endpoints = [
      { path: "/users", method: "GET" },
      { path: "/orders", method: "POST" }
    ];
  }

  var cost = 7;
  var result = mx2lmDeductTokens(cost);
  if (!result.ok) {
    return {
      success: false,
      error: "Insufficient tokens for backend API build",
      balance: result.balance
    };
  }

  var xjsonApi = {
    "@context": "xjson://api",
    "@description": "Auto-generated XJSON API spec from Backend AI Specialist shard",
    "@routes": endpoints.map(function (ep) {
      var cleanPath = ep.path.replace(/\W+/g, "_").replace(/^_+|_+$/g, "");
      return {
        "@path": ep.path,
        "@method": ep.method,
        "@handler": "handler_" + ep.method.toLowerCase() + "_" + cleanPath,
        "@input": ep.method === "GET" ? "query" : "body",
        "@output": "json"
      };
    })
  };

  var virtualServerConfig = {
    name: "mx2lm_virtual_server",
    engine: "K'uhul Execution Engine",
    routes: xjsonApi["@routes"].map(function (r) {
      return {
        path: r["@path"],
        method: r["@method"],
        handler: r["@handler"]
      };
    })
  };

  return {
    success: true,
    shard: "BACKEND_AI_SPECIALIST",
    agent: agent,
    cost: cost,
    remainingTokens: result.balance,
    xjson_api: xjsonApi,
    virtual_server: virtualServerConfig,
    kuhul_pipeline: agent.pipeline,
    example_api_call: {
      description: "API: POST /backend/create-api",
      body: {
        endpoints: [
          { path: "/users", method: "GET" },
          { path: "/orders", method: "POST" }
        ]
      }
    },
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
    shard: "BACKEND_AI_SPECIALIST",
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
