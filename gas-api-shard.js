/**
 * API.GS — GAS API SHARD
 *
 * DEPLOYMENT: Google Apps Script Web App
 * ENDPOINT: https://script.google.com/macros/s/AKfycbxobM8hJAp29aX__-CCK3vvjCOeqML73nkG50jUQa_XzIJr3QT0o7ciYmuddLrRNPyqoA/exec
 *
 * PURPOSE:
 * - Virtual REST Server + Provider Marketplace
 * - Dynamic route registration/unregistration at runtime
 * - User-defined API offerings (Provider Registry)
 * - API proxy/gateway for calling registered providers
 * - Foundation for API economy and user-owned endpoints
 *
 * ARCHITECTURE:
 * - Pure infrastructure layer (NOT a specialist agent)
 * - Enables users to register and monetize their own APIs
 * - Routes traffic to user APIs with metering potential
 * - Combines multiple APIs into orchestrated products
 * - True decentralized API marketplace
 *
 * SIGNIFICANCE:
 * This transforms the ASX ecosystem from:
 *   "Collection of tools" → "Platform economy"
 * Users can now:
 *   - Define & host their own APIs
 *   - Sell API access with token pricing
 *   - Chain APIs together
 *   - Create API products
 */

// =======================================================
// SHARD BOOT / STATE
// =======================================================

function apiShardInit() {
  var scriptProps = PropertiesService.getScriptProperties();
  var cache = CacheService.getScriptCache();

  var cached = cache.get("api_shard_state");
  if (cached) return JSON.parse(cached);

  var config = scriptProps.getProperties();
  if (!config.apiShardName) {
    scriptProps.setProperties({
      apiShardName: "GAS_API_SHARD",
      version: "1.1.0",
      created: new Date().toISOString()
    });
    config = scriptProps.getProperties();
  }

  var routes = JSON.parse(
    scriptProps.getProperty("apiRoutes") || JSON.stringify(apiDefaultRoutes())
  );

  var providers = JSON.parse(
    scriptProps.getProperty("apiProviders") || JSON.stringify({})
  );

  var state = {
    config: config,
    routes: routes,
    providers: providers
  };

  cache.put("api_shard_state", JSON.stringify(state), 300);
  return state;
}

// =======================================================
// DEFAULT ROUTES
// =======================================================

function apiDefaultRoutes() {
  return {
    "/health":        { method: "GET",  handler: "apiHealth" },
    "/echo":          { method: "GET",  handler: "apiEcho" },
    "/routes":        { method: "GET",  handler: "apiListRoutes" },
    "/register":      { method: "POST", handler: "apiRegisterRoute" },
    "/unregister":    { method: "POST", handler: "apiUnregisterRoute" },

    // Provider marketplace
    "/providers":          { method: "GET",  handler: "apiListProviders" },
    "/providers/register": { method: "POST", handler: "apiRegisterProvider" },
    "/providers/call":     { method: "POST", handler: "apiCallProvider" }
  };
}

// =======================================================
// WEB APP ENTRYPOINTS
// =======================================================

function doGet(e) {
  return apiShardRouter(e, "GET");
}

function doPost(e) {
  return apiShardRouter(e, "POST");
}

// =======================================================
// CORE ROUTER
// =======================================================

function apiShardRouter(e, method) {
  var p = e && e.parameter ? e.parameter : {};
  var path = p.route || p.path || p.endpoint || "/";

  // Normalize path
  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  try {
    var state = apiShardInit();
    var route = state.routes[path];

    if (!route) {
      return apiJson({
        success: false,
        error: "Route not found",
        path: path,
        available: Object.keys(state.routes)
      });
    }

    if (route.method !== method) {
      return apiJson({
        success: false,
        error: "Invalid method for route",
        required: route.method,
        received: method
      });
    }

    var handlerName = route.handler;
    if (typeof this[handlerName] !== "function") {
      return apiJson({
        success: false,
        error: "Handler not implemented",
        handler: handlerName
      });
    }

    // Execute handler with (params, rawEvent)
    var result = this[handlerName](p, e);
    return apiJson(result);

  } catch (err) {
    return apiJson({
      success: false,
      error: err && err.message ? err.message : String(err),
      timestamp: new Date().toISOString()
    });
  }
}

// =======================================================
// CORE API HANDLERS
// =======================================================

function apiHealth() {
  var state = apiShardInit();
  return {
    success: true,
    shard: state.config.apiShardName,
    version: state.config.version,
    status: "operational",
    routes: Object.keys(state.routes),
    providersCount: Object.keys(state.providers).length,
    timestamp: new Date().toISOString()
  };
}

function apiEcho(p) {
  return {
    success: true,
    input: p,
    message: "API Shard Echo Response",
    timestamp: new Date().toISOString()
  };
}

function apiListRoutes() {
  var state = apiShardInit();
  return {
    success: true,
    routes: state.routes
  };
}

// =======================================================
// ROUTE REGISTRATION (INTERNAL HANDLERS)
// =======================================================

function apiRegisterRoute(p) {
  var path = p.path;
  var method = (p.method || "GET").toUpperCase();
  var handler = p.handler;

  if (!path || !handler) {
    return {
      success: false,
      error: "path and handler are required"
    };
  }

  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  var scriptProps = PropertiesService.getScriptProperties();
  var state = apiShardInit();

  state.routes[path] = {
    method: method,
    handler: handler
  };

  scriptProps.setProperty("apiRoutes", JSON.stringify(state.routes));
  CacheService.getScriptCache().remove("api_shard_state");

  return {
    success: true,
    message: "Route registered",
    path: path,
    method: method,
    handler: handler
  };
}

function apiUnregisterRoute(p) {
  var path = p.path;
  if (!path) {
    return {
      success: false,
      error: "path is required"
    };
  }

  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  var scriptProps = PropertiesService.getScriptProperties();
  var state = apiShardInit();

  if (!state.routes[path]) {
    return {
      success: false,
      error: "Route not found"
    };
  }

  delete state.routes[path];

  scriptProps.setProperty("apiRoutes", JSON.stringify(state.routes));
  CacheService.getScriptCache().remove("api_shard_state");

  return {
    success: true,
    message: "Route removed",
    path: path
  };
}

// =======================================================
// PROVIDER REGISTRY (USER API OFFERINGS)
// =======================================================

// List all providers (public view)
function apiListProviders() {
  var state = apiShardInit();
  return {
    success: true,
    providers: state.providers
  };
}

// Register / update a provider (user API offering)
function apiRegisterProvider(p, e) {
  var id = p.id || "";
  var name = p.name || "";
  var url = p.url || "";
  var category = p.category || "general";
  var description = p.description || "";
  var priceTokens = parseInt(p.priceTokens || "0", 10);
  var isPublic = (String(p.public || "true").toLowerCase() === "true");

  if (!name || !url) {
    return {
      success: false,
      error: "name and url are required"
    };
  }

  // Normalize URL
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  // Owner is the current GAS user (may be blank if not granted)
  var ownerEmail = "";
  try {
    ownerEmail = Session.getActiveUser().getEmail() || "";
  } catch (e2) {
    ownerEmail = "";
  }

  var scriptProps = PropertiesService.getScriptProperties();
  var state = apiShardInit();
  var providers = state.providers || {};

  if (!id) {
    id = "prov_" + Utilities.getUuid().replace(/-/g, "").slice(0, 12);
  }

  providers[id] = {
    id: id,
    name: name,
    url: url,
    category: category,
    description: description,
    priceTokens: isNaN(priceTokens) ? 0 : priceTokens,
    public: isPublic,
    owner: ownerEmail,
    updated: new Date().toISOString()
  };

  scriptProps.setProperty("apiProviders", JSON.stringify(providers));
  CacheService.getScriptCache().remove("api_shard_state");

  return {
    success: true,
    message: "Provider registered/updated",
    provider: providers[id]
  };
}

// Proxy call to a provider API
function apiCallProvider(p, e) {
  var providerId = p.providerId || p.id;
  if (!providerId) {
    return {
      success: false,
      error: "providerId (or id) is required"
    };
  }

  var state = apiShardInit();
  var provider = state.providers[providerId];

  if (!provider) {
    return {
      success: false,
      error: "Provider not found",
      providerId: providerId
    };
  }

  var url = provider.url;
  var method = (p.method || "GET").toUpperCase();

  // Optional body as JSON string
  var rawBody = p.body || "";
  var payload = null;
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch (err) {
      // treat as raw string
      payload = rawBody;
    }
  }

  var options = {
    method: method,
    muteHttpExceptions: true
  };

  if (method === "POST" || method === "PUT" || method === "PATCH") {
    if (payload && typeof payload === "object") {
      options.contentType = "application/json";
      options.payload = JSON.stringify(payload);
    } else if (typeof payload === "string") {
      options.payload = payload;
    }
  }

  // Optional query params passthrough (q_xxx → xxx)
  var queryParams = {};
  for (var key in p) {
    if (key && key.indexOf("q_") === 0 && key.length > 2) {
      queryParams[key.substring(2)] = p[key];
    }
  }
  if (Object.keys(queryParams).length > 0) {
    var sep = url.indexOf("?") === -1 ? "?" : "&";
    url += sep + Object.keys(queryParams)
      .map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(queryParams[k]);
      })
      .join("&");
  }

  var responseBody = "";
  var responseCode = 0;
  var headers = {};

  try {
    var resp = UrlFetchApp.fetch(url, options);
    responseCode = resp.getResponseCode();
    headers = resp.getAllHeaders() || {};
    responseBody = resp.getContentText();
  } catch (err) {
    return {
      success: false,
      error: "Provider call failed",
      providerId: providerId,
      providerUrl: provider.url,
      message: err && err.message ? err.message : String(err)
    };
  }

  // Try to parse JSON body
  var parsed = null;
  try {
    parsed = JSON.parse(responseBody);
  } catch (e2) {
    parsed = null;
  }

  return {
    success: true,
    providerId: providerId,
    provider: {
      id: provider.id,
      name: provider.name,
      category: provider.category,
      priceTokens: provider.priceTokens,
      public: provider.public,
      owner: provider.owner
    },
    httpStatus: responseCode,
    headers: headers,
    bodyRaw: responseBody,
    bodyJson: parsed,
    timestamp: new Date().toISOString()
  };
}

// =======================================================
// EXAMPLE LOCAL HANDLERS (Optional: for quick tests)
// =======================================================

function apiSampleUsers() {
  return {
    success: true,
    users: [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    ]
  };
}

function apiSampleOrders() {
  return {
    success: true,
    orders: [
      { id: 1001, status: "processing" },
      { id: 1002, status: "complete" }
    ]
  };
}

// =======================================================
// JSON OUTPUT HELPER
// =======================================================

function apiJson(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}
