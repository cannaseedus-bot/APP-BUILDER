/**
 * MX2LM.GS — FOREMAN + TWO-BRAIN RUNTIME (GAS SHARD UPDATE)
 *
 * DEPLOYMENT: Google Apps Script Web App
 * ENDPOINT: https://script.google.com/macros/s/AKfycbyiy_fV6DVG2hmJ5HHBcOtliLN_e54tktTOKuj1P9uYZ12vPgLl95wk-zJ89ovDBqMyBA/exec
 *
 * PURPOSE:
 * - Brain #1: Conversational MX2LM (n-gram + crowns)
 * - Brain #2: Micro-Agent / Builder Orchestrator
 * - Foreman over API shard, usage, and external models
 *
 * ARCHITECTURE:
 * This file does NOT define doGet/doPost - it's meant to be called by api.gs or HTML frontends
 * Two-brain runtime enables dual-mode operation: chat interface + builder orchestration
 */

// =======================================================
// GLOBAL CONSTANTS / DEFAULTS
// =======================================================

var MX2LM_DEFAULT_BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbypsqwHCxSrN_oYnDehoX3Wyl-Uj29zytP_6DwKcnTYoS4Jv2iraqn2Iz0k3Vh9UMts/exec";

// QWENF1 / Model references stored in Drive (metadata only here)
var MX2LM_QWENF1_FOLDER_ID = "1DlNkskGibmCfHfG3XzstP4KUkXNy0sEC";
var MX2LM_QWENF1_MODEL_ID   = "1EK4X6V1-WSsbZtBzhnCm4KVnGXzj8iGj";
var MX2LM_QWENF1_OPT_ID     = "1od43CLcg3jqKKtmfyj4DskOOJ5aP6YmV";

// =======================================================
// BOOT / STATE
// =======================================================

function mx2lmInit() {
  var scriptProps = PropertiesService.getScriptProperties();
  var userProps = PropertiesService.getUserProperties();
  var cache = CacheService.getScriptCache();

  var cached = cache.get("mx2lm_foreman_state");
  if (cached) return JSON.parse(cached);

  // Core config
  var config = scriptProps.getProperties();
  if (!config.mx2lmProjectName) {
    scriptProps.setProperties({
      mx2lmProjectName: "MX2LM GAS Foreman",
      mx2lmVersion: "1.0.0",
      mx2lmCreated: new Date().toISOString(),
      mx2lmBackendUrl: MX2LM_DEFAULT_BACKEND_URL
    });
    config = scriptProps.getProperties();
  }

  // Token economy (user-level soft credits)
  var tokenBalance = parseInt(userProps.getProperty("mx2lmTokenBalance") || "100", 10);
  var walletAddress = userProps.getProperty("mx2lmWalletAddress");
  if (!walletAddress) {
    walletAddress = "mx2_" + Utilities.getUuid().replace(/-/g, "").slice(0, 32);
    userProps.setProperty("mx2lmWalletAddress", walletAddress);
  }

  // Crowns (personalities)
  var crowns = JSON.parse(
    scriptProps.getProperty("mx2lmCrowns") || JSON.stringify(mx2lmDefaultCrowns())
  );

  // Micro-agents registry
  var agents = JSON.parse(
    scriptProps.getProperty("mx2lmAgents") || JSON.stringify(mx2lmDefaultAgents())
  );

  // n-gram model (Brain #1)
  var ngramModel = JSON.parse(
    scriptProps.getProperty("mx2lmNgrams") || JSON.stringify(mx2lmBasicNgrams())
  );

  var state = {
    config: config,
    tokenBalance: tokenBalance,
    walletAddress: walletAddress,
    crowns: crowns,
    agents: agents,
    ngramModel: ngramModel
  };

  cache.put("mx2lm_foreman_state", JSON.stringify(state), 300);
  return state;
}

// =======================================================
// DEFAULT CROWNS / AGENTS / NGRAMS
// =======================================================

function mx2lmDefaultCrowns() {
  return {
    mx2lm: {
      id: "mx2lm",
      name: "MX2LM General",
      tokenCost: 0,
      brain: "chat",
      config: { style: "general", temperature: 0.7 }
    },
    developer: {
      id: "developer",
      name: "Developer",
      tokenCost: 10,
      brain: "chat",
      config: { style: "technical", temperature: 0.3 }
    },
    creative: {
      id: "creative",
      name: "Creative Writer",
      tokenCost: 5,
      brain: "chat",
      config: { style: "creative", temperature: 0.9 }
    },
    analyst: {
      id: "analyst",
      name: "Analyst",
      tokenCost: 8,
      brain: "chat",
      config: { style: "analytical", temperature: 0.2 }
    }
  };
}

// Micro-Agent builder / specialist registry (Brain #2)
function mx2lmDefaultAgents() {
  return {
    frontend: {
      id: "frontend",
      label: "Frontend AI Specialist",
      domain: "UI/UX & K'uhul DOM",
      description: "Builds dashboards, HUDs, and Ghost Shells using K'uhul DOM.",
      apiRoute: "/frontend/generate-ui",
      sample: {
        type: "dashboard",
        style: "modern",
        components: ["charts", "navigation"]
      }
    },
    backend: {
      id: "backend",
      label: "Backend AI Specialist",
      domain: "APIs & Data Logic",
      description: "Creates XJSON-powered virtual APIs and routes.",
      apiRoute: "/backend/create-api",
      sample: {
        endpoints: [
          { path: "/users", method: "GET" },
          { path: "/orders", method: "POST" }
        ]
      }
    },
    design: {
      id: "design",
      label: "Design AI Specialist",
      domain: "Visual / 3D Design",
      description: "Builds 3D shells, design systems, and animations.",
      apiRoute: "/design/create-3d",
      sample: {
        type: "product-showcase",
        style: "futuristic",
        elements: ["floating", "animated"]
      }
    },
    api: {
      id: "api",
      label: "API Orchestrator",
      domain: "Provider Marketplace",
      description: "Manages provider registration and marketplace views.",
      apiRoute: "/providers/register",
      sample: {
        name: "Sample API",
        url: "https://example.com/api",
        category: "utility"
      }
    }
  };
}

function mx2lmBasicNgrams() {
  return {
    bigrams: {
      "hello there": 0.9,
      "thank you": 0.8,
      "how are": 0.7,
      "can you": 0.6
    },
    trigrams: {
      "how are you": 0.85,
      "what is the": 0.75,
      "can you help": 0.8,
      "tell me about": 0.7
    },
    responses: {
      greeting: ["Hello!", "Hi there!", "Greetings!", "How can I help?"],
      thanks: ["You're welcome!", "Happy to help!", "Anytime!"],
      help: [
        "I can help with coding, builders, APIs, and UI shells.",
        "What would you like to build or explore?"
      ],
      unknown: [
        "I'm not sure yet — can you rephrase or give more detail?",
        "Let me think about that... what shard or area is this for?"
      ]
    }
  };
}

// =======================================================
// TOKEN ECONOMY
// =======================================================

function mx2lmGetTokenBalance() {
  var s = mx2lmInit();
  return {
    success: true,
    balance: s.tokenBalance,
    wallet: s.walletAddress
  };
}

function mx2lmAddTokens(amount, source) {
  var userProps = PropertiesService.getUserProperties();
  var s = mx2lmInit();

  var amt = parseInt(amount || 0, 10);
  if (isNaN(amt) || amt <= 0) {
    return { success: false, error: "Invalid amount" };
  }

  var newBal = s.tokenBalance + amt;
  userProps.setProperty("mx2lmTokenBalance", String(newBal));

  // Reset cache
  CacheService.getScriptCache().remove("mx2lm_foreman_state");

  // Log usage as a "credit" event
  if (typeof usageLogRequest === "function") {
    usageLogRequest({
      apiKey: "__mx2lm__",
      route: "tokens.add",
      method: "INTERNAL",
      tokens: -amt,
      status: 200
    });
  }

  return {
    success: true,
    added: amt,
    newBalance: newBal,
    source: source || "system"
  };
}

function mx2lmDeductTokens(amount, reason) {
  var userProps = PropertiesService.getUserProperties();
  var s = mx2lmInit();

  var amt = parseInt(amount || 0, 10);
  if (isNaN(amt) || amt <= 0) {
    return { success: false, error: "Invalid amount" };
  }

  if (s.tokenBalance < amt) {
    return { success: false, error: "Insufficient tokens", balance: s.tokenBalance };
  }

  var newBal = s.tokenBalance - amt;
  userProps.setProperty("mx2lmTokenBalance", String(newBal));

  // Reset cache
  CacheService.getScriptCache().remove("mx2lm_foreman_state");

  if (typeof usageLogRequest === "function") {
    usageLogRequest({
      apiKey: "__mx2lm__",
      route: "tokens.deduct",
      method: "INTERNAL",
      tokens: amt,
      status: 200
    });
  }

  return { success: true, deducted: amt, newBalance: newBal, reason: reason || "" };
}

// =======================================================
// BRAIN #1 — CHAT ENGINE
// =======================================================

function mx2lmHandleChat(message, crownId, context) {
  if (!message) {
    return { success: false, error: "Message required" };
  }

  var s = mx2lmInit();
  var crownKey = crownId || "mx2lm";
  var crown = s.crowns[crownKey] || s.crowns.mx2lm;

  // Deduct crown cost from MX2LM tokens
  if (crown.tokenCost && crown.tokenCost > 0) {
    var pay = mx2lmDeductTokens(crown.tokenCost, "crown:" + crownKey);
    if (!pay.success) {
      return {
        success: false,
        error: "Insufficient MX2LM tokens",
        balance: pay.balance
      };
    }
  }

  var brain = crown.brain || "chat";
  var response;

  if (brain === "chat") {
    response = mx2lmChatBrain(message, crown.config || {}, context || {});
  } else {
    response = "Brain [" + brain + "] not implemented yet. Falling back to chat.";
    response += "\n\nYou said: " + message;
  }

  // Log usage
  if (typeof usageLogRequest === "function") {
    usageLogRequest({
      apiKey: "__mx2lm__",
      route: "mx2lm.chat",
      method: "INTERNAL",
      tokens: crown.tokenCost || 0,
      status: 200
    });
  }

  return {
    success: true,
    crown: crown.name,
    response: response,
    tokensUsed: crown.tokenCost || 0,
    remainingTokens: mx2lmInit().tokenBalance,
    timestamp: new Date().toISOString()
  };
}

function mx2lmChatBrain(input, config, context) {
  var s = mx2lmInit();
  var model = s.ngramModel || mx2lmBasicNgrams();
  var words = input.toLowerCase().split(/\s+/);

  // Try n-gram matches (longest first)
  for (var n = 5; n >= 2; n--) {
    for (var i = 0; i <= words.length - n; i++) {
      var gram = words.slice(i, i + n).join(" ");
      var storeKey = n === 2 ? "bigrams" : (n === 3 ? "trigrams" : null);
      if (!storeKey) continue;
      if (model[storeKey] && model[storeKey][gram]) {
        return mx2lmGenerateFromNgram(gram, model);
      }
    }
  }

  // Fallback style-based response
  var style = (config && config.style) || "general";
  switch (style) {
    case "technical":
      return "Technical angle: \"" + input + "\" — we can route this into backend/API builder or MX2LM shards as needed.";
    case "creative":
      return "Creative take: \"" + input + "\" sounds like the seed for a new tape, UI, or Doom HUD. What do you want to shape?";
    case "analytical":
      return "Analytical view: \"" + input + "\" — we can measure it through usage, logs, and builder outputs. Specify the shard (frontend/backend/design/api).";
    default:
      return "You said: \"" + input + "\".\n\nI can connect this to builders (frontend/backend/design/api) or external models. What do you want to build?";
  }
}

function mx2lmGenerateFromNgram(ngram, model) {
  var responses = model.responses || mx2lmBasicNgrams().responses;

  if (/hello|hi|hey/.test(ngram)) {
    return mx2lmRandom(responses.greeting);
  }
  if (/thank/.test(ngram)) {
    return mx2lmRandom(responses.thanks);
  }
  if (/help/.test(ngram)) {
    return mx2lmRandom(responses.help);
  }
  return (
    "Based on \"" + ngram +
    "\", I detect a pattern I'm already familiar with.\n\n" +
    mx2lmRandom(responses.help)
  );
}

function mx2lmUpdateNgramsFromInput(input) {
  var scriptProps = PropertiesService.getScriptProperties();
  var s = mx2lmInit();
  var model = s.ngramModel;

  var words = input.toLowerCase().split(/\s+/);
  for (var i = 0; i < words.length - 1; i++) {
    var bg = words[i] + " " + words[i + 1];
    model.bigrams[bg] = (model.bigrams[bg] || 0) + 0.1;
  }
  for (var j = 0; j < words.length - 2; j++) {
    var tg = words[j] + " " + words[j + 1] + " " + words[j + 2];
    model.trigrams[tg] = (model.trigrams[tg] || 0) + 0.1;
  }

  scriptProps.setProperty("mx2lmNgrams", JSON.stringify(model));
  CacheService.getScriptCache().remove("mx2lm_foreman_state");

  return { success: true };
}

// =======================================================
// BRAIN #2 — MICRO-AGENT / BUILDER ORCHESTRATOR
// =======================================================

function mx2lmRunAgent(agentId, payload) {
  var s = mx2lmInit();
  var agent = s.agents[agentId];

  if (!agent) {
    return { success: false, error: "Unknown agent: " + agentId };
  }

  var tokenCost = 3;
  var pay = mx2lmDeductTokens(tokenCost, "agent:" + agentId);
  if (!pay.success) {
    return {
      success: false,
      error: "Insufficient MX2LM tokens for agent",
      balance: pay.balance
    };
  }

  var result;

  if (agentId === "frontend" && typeof frontendGenerateUI === "function") {
    result = frontendGenerateUI(payload || agent.sample);
  } else if (agentId === "backend" && typeof backendCreateApi === "function") {
    result = backendCreateApi(payload || agent.sample);
  } else if (agentId === "design" && typeof designCreate3D === "function") {
    result = designCreate3D(payload || agent.sample);
  } else if (agentId === "api") {
    if (typeof apiRegisterProvider === "function") {
      result = apiRegisterProvider(payload || agent.sample);
    } else {
      result = { success: false, error: "apiRegisterProvider not available" };
    }
  } else {
    result = mx2lmCallExternalAgent(agent, payload);
  }

  if (typeof usageLogRequest === "function") {
    usageLogRequest({
      apiKey: "__mx2lm__",
      route: "agent." + agentId,
      method: "INTERNAL",
      tokens: tokenCost,
      status: result && result.success ? 200 : 400
    });
  }

  return {
    success: !!(result && result.success),
    agent: agentId,
    detail: result
  };
}

function mx2lmCallExternalAgent(agent, payload) {
  var s = mx2lmInit();
  var url = s.config.mx2lmBackendUrl || MX2LM_DEFAULT_BACKEND_URL;

  var options = {
    method: "post",
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify({
      agent: agent.id,
      route: agent.apiRoute || "",
      payload: payload || agent.sample
    })
  };

  try {
    var resp = UrlFetchApp.fetch(url, options);
    var body = resp.getContentText();
    var parsed;
    try {
      parsed = JSON.parse(body);
    } catch (e2) {
      parsed = null;
    }

    return {
      success: resp.getResponseCode() >= 200 && resp.getResponseCode() < 300,
      status: resp.getResponseCode(),
      bodyRaw: body,
      bodyJson: parsed
    };
  } catch (err) {
    return {
      success: false,
      error: "External agent call failed",
      message: err && err.message ? err.message : String(err)
    };
  }
}

// =======================================================
// QWENF1 / DRIVE MODEL INSPECTION HELPERS
// =======================================================

function mx2lmListQwenFiles() {
  var result = {
    success: true,
    folderId: MX2LM_QWENF1_FOLDER_ID,
    files: []
  };

  try {
    var folder = DriveApp.getFolderById(MX2LM_QWENF1_FOLDER_ID);
    var it = folder.getFiles();
    while (it.hasNext()) {
      var f = it.next();
      result.files.push({
        id: f.getId(),
        name: f.getName(),
        sizeBytes: f.getSize(),
        url: f.getUrl(),
        lastUpdated: f.getLastUpdated()
      });
    }
  } catch (err) {
    result.success = false;
    result.error = err && err.message ? err.message : String(err);
  }

  return result;
}

function mx2lmGetQwenModelMeta() {
  var out = {
    success: true,
    model: null,
    optimizer: null
  };

  try {
    var model = DriveApp.getFileById(MX2LM_QWENF1_MODEL_ID);
    out.model = {
      id: model.getId(),
      name: model.getName(),
      sizeBytes: model.getSize(),
      url: model.getUrl(),
      lastUpdated: model.getLastUpdated()
    };
  } catch (e1) {
    out.model = null;
  }

  try {
    var opt = DriveApp.getFileById(MX2LM_QWENF1_OPT_ID);
    out.optimizer = {
      id: opt.getId(),
      name: opt.getName(),
      sizeBytes: opt.getSize(),
      url: opt.getUrl(),
      lastUpdated: opt.getLastUpdated()
    };
  } catch (e2) {
    out.optimizer = null;
  }

  return out;
}

// =======================================================
// STATUS / INTROSPECTION
// =======================================================

function mx2lmStatus() {
  var s = mx2lmInit();
  return {
    success: true,
    project: s.config.mx2lmProjectName,
    version: s.config.mx2lmVersion,
    tokens: s.tokenBalance,
    wallet: s.walletAddress,
    crowns: Object.keys(s.crowns).length,
    agents: Object.keys(s.agents).length,
    backendUrl: s.config.mx2lmBackendUrl || MX2LM_DEFAULT_BACKEND_URL,
    timestamp: new Date().toISOString()
  };
}

// =======================================================
// UTILS
// =======================================================

function mx2lmRandom(arr) {
  if (!arr || !arr.length) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}
