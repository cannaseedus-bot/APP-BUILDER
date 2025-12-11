# 🚀 ASX Ghost OS - Complete API Reference

**Quick Reference Cheat Sheet for All REST Endpoints**

> Last Updated: 2025-12-11
> Version: Ω.∞.Ω
> Total Endpoints: 45
> Authentication: Securolink v2 (local/remote modes)

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [OS & System APIs](#os--system-apis)
3. [Database APIs (MX2DB)](#database-apis-mx2db)
4. [CMS & Content APIs](#cms--content-apis)
5. [RLHF APIs (local_rest fold)](#rlhf-apis-local_rest-fold)
6. [Feed & Import APIs](#feed--import-apis)
7. [@Gram Learning APIs](#gram-learning-apis)
8. [Mesh & Coordination APIs](#mesh--coordination-apis)
9. [Runtime & Execution APIs](#runtime--execution-apis)
10. [Tape Management APIs](#tape-management-apis)
11. [ASX-RAM APIs](#asx-ram-apis)
12. [SCXQ2 Compression APIs](#scxq2-compression-apis)

---

## 🔐 Authentication

All `/local/api/*` routes require Securolink authentication.

**Authentication Methods:**
```bash
# API Key (local mode)
-H "x-api-key: dev-admin-key"

# Cookie (remote mode)
-H "Cookie: mx2_securolink=<session_ticket>"

# Bearer JWT (remote mode)
-H "Authorization: Bearer <jwt_token>"
```

**Available Roles:**
- `guest` - Public read access
- `trainer` - Training data access
- `admin` - Full system access

---

## 🖥️ OS & System APIs

### GET `/health`
**Basic health check**
- **Fold:** os
- **Handler:** health_check
- **Auth:** Public
- **Returns:** Kernel status, quantum state, uptime

```bash
curl http://localhost:8080/health
```

### GET `/local/api/health` (extended)
**Extended health check with subsystems**
- **Fold:** os
- **Handler:** health_check_extended
- **Auth:** guest, trainer, admin
- **Returns:** Full system diagnostics

```bash
curl http://localhost:8080/local/api/health
```

### GET `/meta/routes`
**List all available routes**
- **Fold:** os
- **Handler:** meta_routes
- **Auth:** guest, trainer, admin
- **Returns:** Route catalog with handlers

```bash
curl http://localhost:8080/local/api/meta/routes
```

### GET `/os/state`
**Get OS state from ASX-RAM**
- **Fold:** os
- **Handler:** os_state
- **Auth:** Public
- **Returns:** OS state, boot count, active tape

```bash
curl http://localhost:8080/os/state
```

### POST `/basher/run`
**Execute basher commands**
- **Fold:** os
- **Handler:** basher_run
- **Auth:** Public
- **Body:** `{"command": "health"}`

```bash
curl -X POST http://localhost:8080/basher/run \
  -H "content-type: application/json" \
  -d '{"command": "health"}'
```

---

## 💾 Database APIs (MX2DB)

### GET `/db/list` or `/local/api/db/:table`
**List rows from table**
- **Fold:** db
- **Handler:** db_list_rows
- **Auth:** trainer, admin
- **Params:** `table, limit, offset, filter`

```bash
# Old route
curl http://localhost:8080/db/list?table=n_grams&limit=10

# New FOLDS route
curl -H "x-api-key: dev-trainer-key" \
  http://localhost:8080/local/api/db/n_grams?limit=10
```

### GET `/db/get` or `/local/api/db/:table/:id`
**Get single row by ID**
- **Fold:** db
- **Handler:** db_get_row
- **Auth:** trainer, admin
- **Params:** `table, id`

```bash
curl -H "x-api-key: dev-trainer-key" \
  http://localhost:8080/local/api/db/rlhf_traces/trace_123
```

### POST `/db/insert` or `/local/api/db/:table`
**Insert new row**
- **Fold:** db
- **Handler:** db_insert_row
- **Auth:** trainer, admin
- **Body:** Row data

```bash
curl -H "x-api-key: dev-trainer-key" \
  -X POST http://localhost:8080/local/api/db/n_grams \
  -H "content-type: application/json" \
  -d '{"gram": "hello_world", "frequency": 1}'
```

### PUT `/db/update` or `/local/api/db/:table/:id`
**Update existing row**
- **Fold:** db
- **Handler:** db_update_row
- **Auth:** admin
- **Body:** Patch data

```bash
curl -H "x-api-key: dev-admin-key" \
  -X PUT http://localhost:8080/local/api/db/n_grams/gram_123 \
  -H "content-type: application/json" \
  -d '{"frequency": 42}'
```

### DELETE `/db/delete` or `/local/api/db/:table/:id`
**Delete row**
- **Fold:** db
- **Handler:** db_delete_row
- **Auth:** admin
- **Params:** `table, id`

```bash
curl -H "x-api-key: dev-admin-key" \
  -X DELETE http://localhost:8080/local/api/db/n_grams/gram_123
```

---

## 📄 CMS & Content APIs

### GET `/site/page`
**Get page by ID**
- **Fold:** cms
- **Handler:** cms_page_get
- **Auth:** Public
- **Params:** `id` or `page_id`

```bash
curl http://localhost:8080/site/page?id=home
```

### GET `/local/api/cms/page/:slug`
**Get page by slug**
- **Fold:** cms
- **Handler:** cms_get_page
- **Auth:** guest, trainer, admin
- **Params:** `slug`

```bash
curl http://localhost:8080/local/api/cms/page/about
```

### GET `/site/component`
**Get component by ID**
- **Fold:** cms
- **Handler:** cms_component_get
- **Auth:** Public
- **Params:** `id`, `props`

```bash
curl http://localhost:8080/site/component?id=header&props={"theme":"dark"}
```

### GET `/site/tape`
**Get tape content**
- **Fold:** cms
- **Handler:** cms_tape_get
- **Auth:** Public
- **Params:** `id`

```bash
curl http://localhost:8080/site/tape?id=tape_dashboard
```

### GET `/site/asset`
**Get asset**
- **Fold:** cms
- **Handler:** cms_asset_get
- **Auth:** Public
- **Params:** `id`

```bash
curl http://localhost:8080/site/asset?id=logo_svg
```

### GET `/site/map`
**Get site map**
- **Fold:** cms
- **Handler:** cms_site_map
- **Auth:** Public
- **Returns:** All pages, components, assets, tapes

```bash
curl http://localhost:8080/site/map
```

### GET `/site/search`
**Search atomic content**
- **Fold:** cms
- **Handler:** cms_atomic_search
- **Auth:** Public
- **Params:** `q` (query), `type` (filter)

```bash
curl http://localhost:8080/site/search?q=dashboard&type=page
```

### GET `/local/api/cms/feed/:name`
**Get feed/tape by name**
- **Fold:** cms
- **Handler:** cms_get_feed
- **Auth:** guest, trainer, admin
- **Params:** `name`

```bash
curl http://localhost:8080/local/api/cms/feed/blog_rss
```

---

## 🎓 RLHF APIs (local_rest fold)

### GET `/local/api/rlhf/case`
**List RLHF cases**
- **Fold:** local_rest
- **Handler:** cms_rlhf_list
- **Auth:** guest, trainer, admin
- **Params:** `label`, `limit`, `offset`

```bash
curl http://localhost:8080/local/api/rlhf/case?label=Support&limit=10
```

### GET `/local/api/rlhf/case/:id`
**Get specific RLHF case**
- **Fold:** local_rest
- **Handler:** cms_rlhf_get
- **Auth:** guest, trainer, admin
- **Params:** `id`

```bash
curl http://localhost:8080/local/api/rlhf/case/rlhf_001
```

### POST `/local/api/rlhf/case`
**Create new RLHF case**
- **Fold:** local_rest
- **Handler:** cms_rlhf_post
- **Auth:** trainer, admin
- **Body:** `{title, label, author, body}`

```bash
curl -H "x-api-key: dev-trainer-key" \
  -X POST http://localhost:8080/local/api/rlhf/case \
  -H "content-type: application/json" \
  -d '{"title":"Bug Report","label":"Support","body":"Login fails"}'
```

### POST `/local/api/rlhf/score`
**Submit RLHF score**
- **Fold:** local_rest
- **Handler:** cms_rlhf_update_score
- **Auth:** trainer, admin
- **Body:** `{case_id, score}`

```bash
curl -H "x-api-key: dev-trainer-key" \
  -X POST http://localhost:8080/local/api/rlhf/score \
  -H "content-type: application/json" \
  -d '{"case_id":"rlhf_001","score":0.95}'
```

---

## 📡 Feed & Import APIs

### POST `/feed/import`
**Import external feed**
- **Fold:** feed
- **Handler:** feed_import
- **Auth:** admin
- **Body:** `{feed_url, feed_type}`

```bash
curl -H "x-api-key: dev-admin-key" \
  -X POST http://localhost:8080/local/api/feed/import \
  -H "content-type: application/json" \
  -d '{"feed_url":"https://blog.example.com/rss","feed_type":"rss"}'
```

### POST `/feed/sync`
**Sync all feeds**
- **Fold:** feed
- **Handler:** feed_sync
- **Auth:** admin

```bash
curl -H "x-api-key: dev-admin-key" \
  -X POST http://localhost:8080/local/api/feed/sync
```

---

## 🧠 @Gram Learning APIs

### POST `/gram/observe`
**Observe atomic execution**
- **Fold:** gram
- **Handler:** gram_observe
- **Auth:** trainer, admin
- **Body:** `{event_type, event_data, context}`

```bash
curl -H "x-api-key: dev-trainer-key" \
  -X POST http://localhost:8080/local/api/gram/observe \
  -H "content-type: application/json" \
  -d '{"event_type":"block_executing","event_data":{"@type":"math_operation"},"context":{}}'
```

### GET `/gram/analyze`
**Analyze learned patterns**
- **Fold:** gram
- **Handler:** gram_analyze_patterns
- **Auth:** trainer, admin
- **Returns:** Top unigrams, transitions, sequences

```bash
curl -H "x-api-key: dev-trainer-key" \
  http://localhost:8080/local/api/gram/analyze
```

### POST `/gram/suggest`
**Get next block suggestions**
- **Fold:** gram
- **Handler:** gram_suggest_next
- **Auth:** guest, trainer, admin (PUBLIC)
- **Body:** `{current_block, context, max_suggestions}`

```bash
curl -X POST http://localhost:8080/local/api/gram/suggest \
  -H "content-type: application/json" \
  -d '{"current_block":{"@type":"math_operation"},"context":{}}'
```

### POST `/gram/generate`
**Auto-generate macros**
- **Fold:** gram
- **Handler:** gram_auto_generate
- **Auth:** admin
- **Body:** `{generation_type, min_frequency}`

```bash
curl -H "x-api-key: dev-admin-key" \
  -X POST http://localhost:8080/local/api/gram/generate \
  -H "content-type: application/json" \
  -d '{"generation_type":"macro","min_frequency":3}'
```

### POST `/gram/start`
**Start learning loop**
- **Fold:** gram
- **Handler:** gram_learning_loop
- **Auth:** admin
- **Body:** `{interval_ms}` (optional)

```bash
curl -H "x-api-key: dev-admin-key" \
  -X POST http://localhost:8080/local/api/gram/start
```

### GET `/gram/metrics`
**Get learning metrics**
- **Fold:** gram
- **Handler:** gram_get_metrics
- **Auth:** guest, trainer, admin (PUBLIC)
- **Returns:** iterations, observations, patterns, macros, entropy

```bash
curl http://localhost:8080/local/api/gram/metrics
```

### GET `/gram/patterns`
**Get all learned patterns**
- **Fold:** gram
- **Handler:** gram_get_patterns
- **Auth:** trainer, admin
- **Returns:** unigrams, sequences, probabilities

```bash
curl -H "x-api-key: dev-trainer-key" \
  http://localhost:8080/local/api/gram/patterns
```

### GET `/gram/macros`
**Get generated macros**
- **Fold:** gram
- **Handler:** gram_get_macros
- **Auth:** trainer, admin
- **Returns:** All auto-generated macros

```bash
curl -H "x-api-key: dev-trainer-key" \
  http://localhost:8080/local/api/gram/macros
```

---

## 🌐 Mesh & Coordination APIs

### GET `/mesh/ping`
**Mesh health check**
- **Fold:** mesh
- **Handler:** mesh_ping
- **Auth:** guest, trainer, admin (PUBLIC)
- **Returns:** Node status, capabilities

```bash
curl http://localhost:8080/local/api/mesh/ping
```

### POST `/mesh/register`
**Register with mesh network**
- **Fold:** mesh
- **Handler:** mesh_register
- **Auth:** admin
- **Body:** `{mesh_endpoint}`

```bash
curl -H "x-api-key: dev-admin-key" \
  -X POST http://localhost:8080/local/api/mesh/register \
  -H "content-type: application/json" \
  -d '{"mesh_endpoint":"wss://mesh.example.com"}'
```

### GET `/klh/router`
**K'UHUL Language Host router**
- **Fold:** mesh
- **Handler:** klh_router
- **Auth:** Public

```bash
curl http://localhost:8080/klh/router
```

### POST `/hive/exec`
**Execute on hive network**
- **Fold:** mesh
- **Handler:** hive_exec
- **Auth:** Public
- **Body:** Execution payload

```bash
curl -X POST http://localhost:8080/hive/exec \
  -H "content-type: application/json" \
  -d '{"code":"[Pop hello][Wo \"World\"][Xul]"}'
```

---

## ⚙️ Runtime & Execution APIs

### POST `/xjson/compile`
**Compile XJSON to executable**
- **Fold:** runtime
- **Handler:** xjson_compile
- **Auth:** Public
- **Body:** XJSON structure

```bash
curl -X POST http://localhost:8080/xjson/compile \
  -H "content-type: application/json" \
  -d '{"@type":"atomic_block","@data":{"value":42}}'
```

### POST `/xjson/eval`
**Evaluate XJSON expression**
- **Fold:** runtime
- **Handler:** xjson_eval
- **Auth:** Public
- **Body:** XJSON expression

```bash
curl -X POST http://localhost:8080/xjson/eval \
  -H "content-type: application/json" \
  -d '{"@op":"add","@args":[5,10]}'
```

### POST `/scxq2/compress`
**Compress data with SCXQ2**
- **Fold:** runtime
- **Handler:** scx_compress
- **Auth:** Public
- **Body:** Data to compress

```bash
curl -X POST http://localhost:8080/scxq2/compress \
  -H "content-type: application/json" \
  -d '{"data":"hello world hello world"}'
```

### POST `/scxq2/decompress`
**Decompress SCXQ2 data**
- **Fold:** runtime
- **Handler:** scx_decompress
- **Auth:** Public
- **Body:** Compressed data

```bash
curl -X POST http://localhost:8080/scxq2/decompress \
  -H "content-type: application/json" \
  -d '{"compressed":"H3ll0_W0rld_n-gram_compressed"}'
```

---

## 📼 Tape Management APIs

### GET `/tapes/list`
**List all tapes**
- **Fold:** tapes
- **Handler:** tapes_list
- **Auth:** Public
- **Returns:** All registered tapes

```bash
curl http://localhost:8080/tapes/list
```

### POST `/tapes/boot`
**Boot a tape**
- **Fold:** tapes
- **Handler:** tapes_boot
- **Auth:** Public
- **Body:** `{id: "tape_id"}`

```bash
curl -X POST http://localhost:8080/tapes/boot?id=tape_dashboard
```

### GET `/tapes/load`
**Load tape XJSON**
- **Fold:** tapes
- **Handler:** tapes_load
- **Auth:** Public
- **Params:** `id`

```bash
curl http://localhost:8080/tapes/load?id=tape_dashboard
```

---

## 💾 ASX-RAM APIs

### GET `/ram/get`
**Get value from ASX-RAM**
- **Fold:** os
- **Handler:** ram_get
- **Auth:** Public
- **Params:** `key`

```bash
curl http://localhost:8080/ram/get?key=os.state
```

### POST `/ram/set`
**Set value in ASX-RAM**
- **Fold:** os
- **Handler:** ram_set
- **Auth:** Public
- **Body:** `{key, value}`

```bash
curl -X POST http://localhost:8080/ram/set \
  -H "content-type: application/json" \
  -d '{"key":"app.theme","value":"dark"}'
```

### GET `/ram/list`
**List all RAM keys**
- **Fold:** os
- **Handler:** ram_list
- **Auth:** Public
- **Returns:** All keys and count

```bash
curl http://localhost:8080/ram/list
```

---

## 🗄️ SCXQ2 Compression APIs

### POST `/mx2db/put`
**Store data in MX2DB**
- **Fold:** os
- **Handler:** mx2db_put
- **Auth:** Public
- **Body:** Data to store

```bash
curl -X POST http://localhost:8080/mx2db/put?scope=tapes \
  -H "content-type: application/json" \
  -d '{"tape_data":"..."}'
```

### GET `/mx2db/query`
**Query MX2DB**
- **Fold:** os
- **Handler:** mx2db_query
- **Auth:** Public
- **Params:** `scope`, `id`

```bash
curl http://localhost:8080/mx2db/query?scope=tapes&id=tape_123
```

---

## 🎯 Quick Start Examples

### Start the System
```bash
# 1. Start @Gram learning
curl -H "x-api-key: dev-admin-key" \
  -X POST http://localhost:8080/local/api/gram/start

# 2. Check health
curl http://localhost:8080/local/api/health

# 3. List available routes
curl http://localhost:8080/local/api/meta/routes
```

### Create and Score RLHF Case
```bash
# Create case
curl -H "x-api-key: dev-trainer-key" \
  -X POST http://localhost:8080/local/api/rlhf/case \
  -H "content-type: application/json" \
  -d '{"title":"Feature Request","label":"Enhancement","body":"Add dark mode"}'

# Score it
curl -H "x-api-key: dev-trainer-key" \
  -X POST http://localhost:8080/local/api/rlhf/score \
  -H "content-type: application/json" \
  -d '{"case_id":"rlhf_001","score":0.9}'
```

### Use @Gram Suggestions
```bash
# Get suggestions
curl -X POST http://localhost:8080/local/api/gram/suggest \
  -H "content-type: application/json" \
  -d '{"current_block":{"@type":"math_operation"}}'

# View metrics
curl http://localhost:8080/local/api/gram/metrics

# View patterns
curl -H "x-api-key: dev-trainer-key" \
  http://localhost:8080/local/api/gram/patterns
```

---

## 📊 API Summary by Fold

| Fold | Endpoints | Auth Required | Purpose |
|------|-----------|---------------|---------|
| **os** | 11 | Mixed | System operations |
| **db** | 5 | trainer+ | Database CRUD |
| **cms** | 8 | Public/Mixed | Content delivery |
| **local_rest** | 4 | Mixed | RLHF forum |
| **gram** | 8 | Mixed | Self-learning |
| **mesh** | 4 | Mixed | Network coordination |
| **runtime** | 4 | Public | Execution engine |
| **tapes** | 3 | Public | Tape management |
| **feed** | 2 | admin | Feed import |
| **trainer** | 2 | Public | Training jobs |
| **ai** | 1 | Public | AI modules |

**Total:** 45 REST endpoints across 11 folds

---

## 🔒 Security Matrix

| Role | Can Access | Cannot Access |
|------|-----------|---------------|
| **guest** | Health, metrics, suggestions, CMS, public routes | DB writes, admin functions |
| **trainer** | + DB reads, RLHF, patterns, observations | DB deletes, system controls |
| **admin** | Everything | Nothing |

---

## 📚 Additional Resources

- **Architecture:** See [README.md](README.md)
- **Examples:** See [EXAMPLES.md](EXAMPLES.md)
- **K'UHUL Guide:** See sw.khl comments
- **FOLDS Guide:** See sw.js FOLDS object

---

**Last Updated:** 2025-12-11
**Version:** Ω.∞.Ω
**Status:** ✅ Production Ready
