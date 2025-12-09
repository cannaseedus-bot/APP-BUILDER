/**
 * GAS MANIFEST SHARD v1
 * Provides per-user manifest extensions for the ASX/PRIME OS.
 *
 * DEPLOYMENT: Google Apps Script Web App
 * ENDPOINT: https://script.google.com/macros/s/AKfycby_XiNPlU7KxrcXWzIB7eBFf8q1BiTUIbAitjkKi31nJtd3DvFK9k7Z7nIiFwJ4Py48/exec
 *
 * PURPOSE:
 * - Cloud backup for user manifest extensions
 * - Persistent tape storage across devices
 * - User profile and settings sync
 * - Multi-device manifest synchronization
 *
 * ARCHITECTURE:
 * - Primary: User's browser (manifest.json in IndexedDB)
 * - Backup: This GAS shard (Google Sheets persistence)
 * - Use when: Syncing across devices, storing large tapes, backup/restore
 *
 * Routes:
 *   ?action=getManifest    → Return manifest extension JSON
 *   ?action=saveManifest   → Save manifest updates
 *   ?action=listTapes      → List cloud tapes available
 *   ?action=getUserData    → Get profile / settings block
 */

function doGet(e) {
  const action = e.parameter.action || "getManifest";

  try {
    if (action === "getManifest") {
      return outputJSON(getManifestExtension());
    }

    if (action === "saveManifest") {
      const body = JSON.parse(e.parameter.data || "{}");
      saveManifestExtension(body);
      return outputJSON({ ok: true, message: "Manifest saved to cloud" });
    }

    if (action === "listTapes") {
      return outputJSON(listCloudTapes());
    }

    if (action === "getUserData") {
      return outputJSON(getUserData());
    }

    return outputJSON({ error: "Unknown action", availableActions: [
      "getManifest",
      "saveManifest",
      "listTapes",
      "getUserData"
    ]});

  } catch (error) {
    return outputJSON({
      error: error.message,
      stack: error.stack
    });
  }
}

/**
 * Get user's manifest extensions from cloud
 * Returns merged manifest data from Google Sheets
 */
function getManifestExtension() {
  const sheet = getSheet("manifest");
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    // No data, return empty manifest
    return {
      ok: true,
      manifest: {},
      source: "gas_cloud_empty"
    };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();

  const ext = {};
  data.forEach(([key, value]) => {
    if (key) {
      try {
        ext[key] = JSON.parse(value);
      } catch (e) {
        ext[key] = value; // Store as string if not valid JSON
      }
    }
  });

  return {
    ok: true,
    manifest: ext,
    source: "gas_cloud",
    last_updated: new Date().toISOString(),
    entry_count: Object.keys(ext).length
  };
}

/**
 * Save user's manifest extensions to cloud
 * Appends new entries to Google Sheets
 */
function saveManifestExtension(payload) {
  const sheet = getSheet("manifest");

  Object.entries(payload).forEach(([key, value]) => {
    const valueStr = typeof value === 'object' ? JSON.stringify(value) : value;
    sheet.appendRow([
      key,
      valueStr,
      new Date().toISOString() // Timestamp
    ]);
  });

  return {
    ok: true,
    saved: Object.keys(payload).length,
    timestamp: new Date().toISOString()
  };
}

/**
 * List all cloud-stored tapes
 * Returns tape metadata from Google Sheets
 */
function listCloudTapes() {
  const sheet = getSheet("tapes");
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return {
      ok: true,
      tapes: [],
      message: "No cloud tapes stored"
    };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  const tapes = data.map(([id, name, url, size, created]) => ({
    id,
    name,
    url,
    size_kb: size,
    created: created
  }));

  return {
    ok: true,
    tapes: tapes,
    count: tapes.length,
    source: "gas_cloud"
  };
}

/**
 * Get user profile and settings
 * Returns user data from Google Sheets
 */
function getUserData() {
  const sheet = getSheet("users");
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    // No user data, create default
    const defaultUser = {
      user_id: "user_" + Utilities.getUuid().slice(0, 8),
      tier: "free",
      settings: {
        theme: "dark",
        mesh_enabled: true,
        auto_sync: true
      }
    };

    sheet.appendRow([
      defaultUser.user_id,
      defaultUser.tier,
      JSON.stringify(defaultUser.settings),
      new Date().toISOString()
    ]);

    return {
      ok: true,
      profile: defaultUser,
      source: "gas_cloud_created"
    };
  }

  const data = sheet.getRange(2, 1, 1, 4).getValues()[0];

  return {
    ok: true,
    profile: {
      user_id: data[0],
      tier: data[1],
      settings: JSON.parse(data[2]),
      created: data[3]
    },
    source: "gas_cloud"
  };
}

/**
 * Get or create sheet by name
 */
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);

    // Initialize headers based on sheet type
    if (name === "manifest") {
      sheet.appendRow(["Key", "Value", "Timestamp"]);
    } else if (name === "tapes") {
      sheet.appendRow(["ID", "Name", "URL", "Size (KB)", "Created"]);
    } else if (name === "users") {
      sheet.appendRow(["User ID", "Tier", "Settings JSON", "Created"]);
    }
  }

  return sheet;
}

/**
 * Output JSON response
 */
function outputJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Initialize spreadsheet on first run
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("ASX Manifest Shard")
    .addItem("Initialize Sheets", "initializeSheets")
    .addItem("View Stats", "showStats")
    .addToUi();
}

function initializeSheets() {
  getSheet("manifest");
  getSheet("tapes");
  getSheet("users");

  SpreadsheetApp.getUi().alert("ASX Manifest Shard initialized!\n\nSheets created:\n- manifest\n- tapes\n- users");
}

function showStats() {
  const manifestCount = getSheet("manifest").getLastRow() - 1;
  const tapesCount = getSheet("tapes").getLastRow() - 1;
  const usersCount = getSheet("users").getLastRow() - 1;

  SpreadsheetApp.getUi().alert(
    "ASX Manifest Shard Stats\n\n" +
    "Manifest Entries: " + Math.max(0, manifestCount) + "\n" +
    "Cloud Tapes: " + Math.max(0, tapesCount) + "\n" +
    "Users: " + Math.max(0, usersCount)
  );
}
