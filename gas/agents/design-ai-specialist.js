/**
 * DESIGN.GS — DESIGN AI SPECIALIST SHARD
 *
 * DEPLOYMENT: Google Apps Script Web App
 * ENDPOINT: https://script.google.com/macros/s/AKfycbzSODEEviqciu-cFlQ0IvxTNIE4CbjGjY7r8FY_cG4AwntFv1L24zdpbkgVAO86EnNK/exec
 *
 * PURPOSE:
 * - Dedicated Design AI Specialist for Visual Design & 3D Graphics
 * - Domain: Design Systems, 3D Scene Generation, Animations
 * - Generates: Design tokens, 3D scenes (Three.js), animation timelines
 * - Token-based usage (9 tokens per 3D design generation)
 *
 * ARCHITECTURE:
 * - Specialized single-purpose design and 3D graphics agent
 * - Uses K'uhul pipeline for design operations
 * - Supports multiple design styles (futuristic, minimal, glass, neon)
 * - 3D scene generation with Three.js specifications
 * - Animation timeline generation
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
      projectName: "MX2LM Design AI Specialist",
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
    design_specialist: {
      id: "design_specialist",
      emoji: "🎯",
      role: "Design AI Specialist",
      domain: "Visual Design & 3D Graphics",
      pipeline: "[Pop design_expert] [Wo design_brief]→[Ch'en brief] [Yax brief]→[Sek generate_design_system] [Yax design_system]→[Sek create_3d_elements] [Sek apply_animations] [Xul]"
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
      case "design/create-3d":
      case "create-3d":
        return json(designCreate3D(p));
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
    shard: "DESIGN_AI_SPECIALIST",
    version: state.config.version,
    method: method || "GET",
    endpoints: [
      "?path=status - System status",
      "?path=tokens - Token management (action=balance|add, amount=N)",
      "?path=agents - List micro-agents",
      "?path=design/create-3d - Create 3D design (type, style, elements params)",
      "?path=create-3d - Shorthand for design/create-3d"
    ],
    agent: state.microAgents.design_specialist
  };
}

// =======================================================
// DESIGN & 3D GENERATION
// =======================================================

function designCreate3D(p) {
  var state = mx2lmInit();
  var agent = state.microAgents.design_specialist;

  var type = p.type || "product-showcase";
  var style = p.style || "futuristic";
  var elementsParam = p.elements || "";
  var elements = elementsParam
    ? elementsParam.split(",").map(function (c) { return c.trim(); })
    : ["floating", "animated"];

  var cost = 9;
  var result = mx2lmDeductTokens(cost);
  if (!result.ok) {
    return {
      success: false,
      error: "Insufficient tokens for 3D design build",
      balance: result.balance
    };
  }

  var designSystem = {
    type: type,
    style: style,
    palette: {
      background: "#02030a",
      primary: "#39ffb6",
      secondary: "#00c9ff",
      accent: "#ff4ef5"
    },
    typography: {
      heading: "Orbitron, system-ui",
      body: "Inter, system-ui"
    }
  };

  var threeScene = {
    scene: {
      camera: {
        type: "perspective",
        fov: 60,
        position: [0, 2, 6]
      },
      lights: [
        { type: "ambient", color: "#ffffff", intensity: 0.4 },
        { type: "directional", color: "#39ffb6", intensity: 1.0, position: [3, 4, 2] }
      ],
      objects: elements.map(function (el, i) {
        return {
          id: "obj_" + i,
          kind: el === "floating" ? "mesh_sphere" : "mesh_box",
          position: [i - 1, 0, 0],
          motion: el === "animated" ? "loop-rotate-y" : "float-y"
        };
      })
    }
  };

  var animations = {
    timeline: "loop",
    tracks: elements.map(function (el, i) {
      return {
        target: "obj_" + i,
        type: el === "animated" ? "rotation" : "position",
        axis: "y",
        range: el === "animated" ? [0, Math.PI * 2] : [0, 0.3],
        duration: 4 + i
      };
    })
  };

  return {
    success: true,
    shard: "DESIGN_AI_SPECIALIST",
    agent: agent,
    cost: cost,
    remainingTokens: result.balance,
    design_system: designSystem,
    three_scene: threeScene,
    animations: animations,
    example_api_call: {
      description: "API: POST /design/create-3d",
      body: {
        type: "product-showcase",
        style: "futuristic",
        elements: ["floating", "animated"]
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
    shard: "DESIGN_AI_SPECIALIST",
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
