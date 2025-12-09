# GAS Infrastructure Layers - Complete Platform Economy Stack

## Overview

The ASX platform now has a complete infrastructure stack with **5 foundational GAS shards** that enable:

1. **Auth** - API keys + per-route access control
2. **Usage** - Request metering + billing
3. **Market** - API marketplace UI + discovery
4. **API** - Virtual REST server + provider registry (updated with auth/usage integration)
5. **MX2LM** - Foreman + Two-Brain Runtime (updated)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER REQUEST                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  API.GS (Shard #17) - Virtual REST Server + Router          │
│  - Routes requests to correct handlers                       │
│  - Integrates with auth, usage, market layers                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  AUTH.GS (Shard #18) - API Keys + Access Control            │
│  - Validates API keys                                         │
│  - Checks route/method permissions                            │
│  - Rate limiting (requests per minute)                        │
└────────────────────────┬────────────────────────────────────┘
                         │ (if authorized)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  USAGE.GS (Shard #19) - Request Metering + Billing          │
│  - Logs every request                                         │
│  - Tracks tokens consumed                                     │
│  - Per-route statistics                                       │
│  - Cost estimation                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  SPECIALIST SHARDS or PROVIDER APIs                          │
│  - Frontend Specialist (Shard #14)                            │
│  - Design Specialist (Shard #15)                              │
│  - Backend Specialist (Shard #16)                             │
│  - User-registered Provider APIs                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  MARKET.GS (Shard #20) - API Marketplace                     │
│  - Provider listing + discovery                               │
│  - Featured APIs                                               │
│  - Search + filtering                                          │
│  - Rating system                                               │
└─────────────────────────────────────────────────────────────┘
```

## Shard #18: Auth Shard

### Endpoint
```
https://script.google.com/macros/s/AKfycbyoh-Dqnplqf9Bv4kqOYn4jKBg0kGKIGymWr95LD4w2_ahh4iI-orWscRmmHdht-q7g/exec
```

### Purpose
- API key generation and management
- Per-route access control
- Rate limiting
- Permission scopes

### API Key Model

```javascript
{
  "key": "key_abc123...",
  "label": "My Frontend API Key",
  "owner": "user@example.com",
  "active": true,
  "scopes": ["*"],  // or ["/frontend/generate-ui:POST", "/design/create-3d:GET"]
  "rateLimitPerMinute": 100,
  "created": "2025-12-09T12:00:00.000Z",
  "lastUsed": "2025-12-09T14:30:00.000Z"
}
```

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/create-key` | POST | Create new API key with scopes |
| `/list-keys` | GET | List all API keys for user |
| `/revoke-key` | POST | Deactivate API key |
| `/activate-key` | POST | Reactivate API key |
| `/check-access` | POST | Validate key + route access |

### Example: Create API Key

```javascript
// Request
POST ?route=create-key
{
  "label": "Frontend Builder Key",
  "scopes": "/frontend/generate-ui:POST,/design/create-3d:POST",
  "rateLimitPerMinute": 50
}

// Response
{
  "success": true,
  "key": "key_f3a8b2c1d9e4a7b6...",
  "record": {
    "key": "key_f3a8b2c1d9e4a7b6...",
    "label": "Frontend Builder Key",
    "owner": "user@example.com",
    "active": true,
    "scopes": ["/frontend/generate-ui:POST", "/design/create-3d:POST"],
    "rateLimitPerMinute": 50,
    "created": "2025-12-09T12:00:00.000Z",
    "lastUsed": null
  }
}
```

### Scope Patterns

- `"*"` - Wildcard (all routes and methods)
- `"/frontend/generate-ui:POST"` - Specific route + method
- `"/frontend/generate-ui:*"` - Route with any method
- Multiple scopes: `["/path1:GET", "/path2:POST"]`

### Rate Limiting

```javascript
// Per API key
{
  "rateLimitPerMinute": 100  // Max 100 requests/minute
}

// Cache-based tracking
// Resets every minute
// Returns 429 Too Many Requests if exceeded
```

## Shard #19: Usage Shard

### Endpoint
```
https://script.google.com/macros/s/AKfycbwRIt8OiKhll-xLzvVGh5iZ22_TkJV3QMdzNmpa2eXJLo3iDtYSlrg6H_EP7EyoLo50CA/exec
```

### Purpose
- Log every request
- Track tokens consumed per route
- Per-key statistics
- Cost estimation and billing

### Usage Model

```javascript
{
  "key_abc123": {
    "totalRequests": 1523,
    "totalTokensCharged": 3840,
    "perRoute": {
      "/frontend/generate-ui:POST": {
        "count": 856,
        "tokens": 1710,
        "last": "2025-12-09T14:30:00.000Z",
        "lastStatus": 200
      },
      "/design/create-3d:POST": {
        "count": 667,
        "tokens": 2130,
        "last": "2025-12-09T14:28:00.000Z",
        "lastStatus": 200
      }
    },
    "lastSeen": "2025-12-09T14:30:00.000Z"
  }
}
```

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/log-request` | POST | Log single request |
| `/stats/:apiKey` | GET | Get stats for specific key |
| `/all-stats` | GET | Get stats for all keys |
| `/estimate-cost` | GET | Estimate cost based on usage |
| `/reset` | POST | Reset all usage stats |

### Example: Log Request

```javascript
// Called by api.gs after each request
usageLogRequest({
  apiKey: "key_abc123",
  route: "/frontend/generate-ui",
  method: "POST",
  tokens: 5,
  status: 200
});

// Response
{
  "success": true,
  "key": "key_abc123",
  "routeKey": "/frontend/generate-ui:POST",
  "status": 200
}
```

### Example: Get Stats

```javascript
// Request
GET ?apiKey=key_abc123

// Response
{
  "success": true,
  "key": "key_abc123",
  "stats": {
    "totalRequests": 1523,
    "totalTokensCharged": 3840,
    "perRoute": {
      "/frontend/generate-ui:POST": {
        "count": 856,
        "tokens": 1710,
        "last": "2025-12-09T14:30:00.000Z",
        "lastStatus": 200
      },
      "/design/create-3d:POST": {
        "count": 667,
        "tokens": 2130,
        "last": "2025-12-09T14:28:00.000Z",
        "lastStatus": 200
      }
    },
    "lastSeen": "2025-12-09T14:30:00.000Z"
  }
}
```

### Cost Estimation

```javascript
// Request
GET ?apiKey=key_abc123&pricePerToken=0.01

// Response
{
  "success": true,
  "key": "key_abc123",
  "estimatedCost": 38.40,  // $38.40
  "totalTokens": 3840,
  "pricePerToken": 0.01
}
```

## Shard #20: Market Shard

### Endpoint
```
https://script.google.com/macros/s/AKfycbwdAF9BDnxOqhsfyai9xMk2bOcI7iZITBu1ekqB3oBtxRgBfH0kGawFZ7M1PJHgxduz/exec
```

### Purpose
- API marketplace UI + discovery
- Featured providers
- Search and filtering
- Rating system
- Tags and categorization

### Market Meta Model

```javascript
{
  "provider_id": {
    "featured": true,
    "tags": ["analytics", "ai", "frontend"],
    "ratingSum": 47,
    "ratingCount": 10,
    "lastUpdated": "2025-12-09T14:30:00.000Z"
  }
}
```

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/list-public` | GET | List all public providers |
| `/get/:id` | GET | Get specific provider details |
| `/set-featured` | POST | Mark provider as featured |
| `/set-tags` | POST | Set provider tags |
| `/rate` | POST | Rate a provider (1-5 stars) |
| `/featured` | GET | List featured providers |
| `/search` | GET | Search providers by query |

### Example: List Featured

```javascript
// Request
GET ?route=featured

// Response
{
  "success": true,
  "featured": [
    {
      "provider": {
        "id": "frontend_specialist",
        "name": "Frontend AI Specialist",
        "category": "ui_generation",
        "priceTokens": 5,
        "public": true,
        "baseUrl": "https://script.google.com/..."
      },
      "meta": {
        "featured": true,
        "tags": ["ui", "frontend", "kuhul"],
        "ratingSum": 47,
        "ratingCount": 10
      }
    }
  ]
}
```

### Example: Search

```javascript
// Request
GET ?query=frontend

// Response
{
  "success": true,
  "query": "frontend",
  "results": [
    {
      "provider": {
        "id": "frontend_specialist",
        "name": "Frontend AI Specialist",
        ...
      },
      "meta": {
        "featured": true,
        "tags": ["ui", "frontend", "kuhul"],
        "ratingSum": 47,
        "ratingCount": 10
      }
    }
  ]
}
```

### Example: Rate Provider

```javascript
// Request
POST ?route=rate
{
  "providerId": "frontend_specialist",
  "score": 5
}

// Response
{
  "success": true,
  "providerId": "frontend_specialist",
  "rating": {
    "average": 4.7,  // 47/10 = 4.7 stars
    "count": 10
  }
}
```

## Updated Shard #17: API Shard (Production Build)

### Endpoint
```
https://script.google.com/macros/s/AKfycbzm_x-pqDeYzUYIqI3S-I4JImzIKcfRcsS_YKy5SMUQqomjY-ykYkSw0q2r5GL877cV4A/exec
```

### Updates
- ✅ Integrated with auth.gs (API key validation)
- ✅ Integrated with usage.gs (request logging)
- ✅ Integrated with market.gs (provider passthrough)
- ✅ Full production router

### Request Flow

```javascript
// 1. User makes request
POST /api?route=frontend/generate-ui&apiKey=key_abc123
{
  "type": "dashboard",
  "style": "modern"
}

// 2. API shard validates API key
const authCheck = authCheckAccessFromParams(params, "/frontend/generate-ui", "POST");
if (!authCheck.allowed) {
  return { success: false, error: authCheck.reason };
}

// 3. API shard routes to handler
const result = frontendGenerateUI(params);

// 4. API shard logs usage
usageLogRequest({
  apiKey: params.apiKey,
  route: "/frontend/generate-ui",
  method: "POST",
  tokens: 5,
  status: result.success ? 200 : 400
});

// 5. Return result
return result;
```

## Updated MX2LM Foreman (Two-Brain Runtime)

### Endpoint
```
https://script.google.com/macros/s/AKfycbyiy_fV6DVG2hmJ5HHBcOtliLN_e54tktTOKuj1P9uYZ12vPgLl95wk-zJ89ovDBqMyBA/exec
```

### Two-Brain Architecture

**Brain #1: Conversational MX2LM**
- N-gram based chat
- Crown personalities (General, Developer, Creative, Analyst)
- Learning from user interactions

**Brain #2: Micro-Agent Orchestrator**
- Routes to specialist shards (Frontend, Backend, Design, API)
- Token-based billing
- External agent calls

### Example: Chat with MX2LM

```javascript
mx2lmHandleChat("Create a dashboard", "developer");

// Response
{
  "success": true,
  "crown": "Developer",
  "response": "Technical angle: \"Create a dashboard\" — we can route this into backend/API builder or MX2LM shards as needed.",
  "tokensUsed": 10,
  "remainingTokens": 90,
  "timestamp": "2025-12-09T14:30:00.000Z"
}
```

### Example: Run Agent

```javascript
mx2lmRunAgent("frontend", {
  type: "dashboard",
  style: "modern",
  components: ["charts", "navigation"]
});

// Response
{
  "success": true,
  "agent": "frontend",
  "detail": {
    "success": true,
    "ui_ast": {...},
    "kuhul_dom": {...},
    "html_preview": "<!DOCTYPE html>..."
  }
}
```

## Integration Pattern

### API.GS Router Integration

```javascript
function apiRouter(e, method) {
  const params = e.parameter || {};
  const path = (params.route || "").toLowerCase();

  // 1. AUTH CHECK
  const authCheck = authCheckAccessFromParams(params, path, method);
  if (!authCheck.allowed) {
    // Log denied request
    usageLogRequest({
      apiKey: params.apiKey || "__public__",
      route: path,
      method: method,
      tokens: 0,
      status: 401
    });

    return apiJson({
      success: false,
      error: authCheck.reason
    });
  }

  // 2. ROUTE TO HANDLER
  let result;
  let tokensUsed = 0;

  switch (path) {
    case "frontend/generate-ui":
      result = frontendGenerateUI(params);
      tokensUsed = 5;
      break;

    case "design/create-3d":
      result = designCreate3D(params);
      tokensUsed = 9;
      break;

    // ...more routes
  }

  // 3. LOG USAGE
  usageLogRequest({
    apiKey: params.apiKey || "__public__",
    route: path,
    method: method,
    tokens: tokensUsed,
    status: result.success ? 200 : 400
  });

  return apiJson(result);
}
```

## Complete Platform Stack

### Infrastructure Layers (Bottom → Top)

1. **Auth Layer** (Shard #18) - Who can access what
2. **Usage Layer** (Shard #19) - What they accessed and cost
3. **API Layer** (Shard #17) - Routes requests
4. **Specialist Layer** (Shards #14-16) - Does the work
5. **Market Layer** (Shard #20) - Discovers and lists
6. **Orchestration Layer** (MX2LM Foreman) - Coordinates everything

### User Journey

```
User → API Key → Auth Check → Route to Shard → Usage Log → Response → Market Rating
```

## Deployment Checklist

- [ ] Deploy auth.gs (Shard #18)
- [ ] Deploy usage.gs (Shard #19)
- [ ] Deploy market.gs (Shard #20)
- [ ] Update api.gs with auth/usage integration
- [ ] Update MX2LM foreman with two-brain runtime
- [ ] Test full flow: API key → Request → Auth → Usage → Response
- [ ] Set up initial API keys
- [ ] Register specialist shards as providers
- [ ] Feature top providers in market
- [ ] Monitor usage stats

## Summary

**This completes the platform economy infrastructure:**

- ✅ **Authentication** - API keys + access control
- ✅ **Metering** - Request logging + token tracking
- ✅ **Billing** - Usage-based cost estimation
- ✅ **Marketplace** - Provider discovery + ratings
- ✅ **Routing** - Unified API gateway
- ✅ **Orchestration** - Two-brain MX2LM coordination

**Result**: Fully functional, user-owned API marketplace with auth, usage tracking, and billing - all on GAS! 🚀
