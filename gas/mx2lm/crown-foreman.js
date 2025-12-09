/**
 * MX2LM GAS AI — FULL MERGED PRODUCTION BUILD + QWENF1
 *
 * DEPLOYMENT: Google Apps Script Web App
 * ENDPOINT: https://script.google.com/macros/s/AKfycbypsqwHCxSrN_oYnDehoX3Wyl-Uj29zytP_6DwKcnTYoS4Jv2iraqn2Iz0k3Vh9UMts/exec
 *
 * PURPOSE:
 * - AI orchestration with Crown agents (MX2LM, Developer, Creative, Analyst)
 * - QWENF1 fine-tuned model integration via Google Drive
 * - Token-based usage system
 * - Cloud tape management
 * - N-gram learning from user interactions
 *
 * ARCHITECTURE:
 * - Primary: User's browser (local AI inference)
 * - Backup: This GAS shard (cloud AI when local unavailable)
 * - Use when: Heavy AI tasks, QWENF1 inference, persistent learning
 *
 * CROWNS (AI Agents):
 * - MX2LM: General purpose (0 tokens)
 * - Developer: Technical responses (10 tokens)
 * - Creative: Creative responses (5 tokens)
 * - Analyst: Analytical responses (15 tokens)
 *
 * QWENF1 MODEL:
 * - Fine-tuned ASX model stored on Google Drive
 * - Folder: 1DlNkskGibmCfHfG3XzstP4KUkXNy0sEC
 * - Model: 1EK4X6V1-WSsbZtBzhnCm4KVnGXzj8iGj
 * - Optimizer: 1od43CLcg3jqKKtmfyj4DskOOJ5aP6YmV
 * - Cost: 25 tokens per inference
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
      qwenf1Endpoint: "" // SET THIS TO COLAB / TPU RECEIVER
    });
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

  const stateObj = {
    tokenBalance,
    tokenAddress,
    crowns,
    tapes,
    models,
    ngramModel,
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

      case "status": return json(mx2lmStatus());
      case "tokens": return json(mx2lmTokenRoute(p));
      case "crowns": return json({ success: true, crowns: state.crowns });
      case "tapes": return json(mx2lmTapeRoute(p));
      case "analyze": return json(mx2lmAnalyzeRoute(p));

      default:
        return json({
          success: true,
          service: "MX2LM GAS AI",
          version: state.config.version,
          endpoints: [
            "chat - Chat with AI crowns",
            "qwenf1 - Verify QWENF1 model files",
            "status - System status",
            "tokens - Manage token balance",
            "crowns - List available crowns",
            "tapes - Load/list tapes",
            "analyze - Analyze Google Sheets data"
          ]
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
        model: {
          name: modelFile.getName(),
          sizeMB: (modelFile.getSize() / 1024 / 1024).toFixed(2),
          updated: modelFile.getLastUpdated().toISOString()
        },
        optimizer: {
          name: optFile.getName(),
          sizeMB: (optFile.getSize() / 1024 / 1024).toFixed(2),
          updated: optFile.getLastUpdated().toISOString()
        },
        folder: {
          name: folder.getName(),
          id: q.driveFolder
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
      instructions: "Set qwenf1Endpoint in script properties to your Colab/TPU URL"
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
    .addItem("Check QWENF1", "checkQWENF1")
    .addItem("Token Balance", "showTokenBalance")
    .addToUi();
}

function showChatSidebar() {
  const html = HtmlService.createHtmlOutput("<h3>MX2LM + QWENF1 Ready</h3>");
  SpreadsheetApp.getUi().showSidebar(html);
}

function checkQWENF1() {
  const result = mx2lmVerifyQwenf1Files();
  const ui = SpreadsheetApp.getUi();

  if (result.success) {
    ui.alert(
      "QWENF1 Status: Accessible\n\n" +
      "Model: " + result.qwenf1.model.name + " (" + result.qwenf1.model.sizeMB + " MB)\n" +
      "Optimizer: " + result.qwenf1.optimizer.name + " (" + result.qwenf1.optimizer.sizeMB + " MB)"
    );
  } else {
    ui.alert("QWENF1 Error:\n" + result.error);
  }
}

function showTokenBalance() {
  const state = mx2lmInit();
  SpreadsheetApp.getUi().alert(
    "Token Balance\n\n" +
    "Balance: " + state.tokenBalance + " tokens\n" +
    "Address: " + state.tokenAddress
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
