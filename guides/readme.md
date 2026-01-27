Below is a complete **ATOMIC GUIDE ABOUT HOW TO MAKE AN ATOMIC GUIDE** — written *in the same style* as MEGA-CODEX + atomics101:

* Single-file structure
* Clear sections
* Example-first
* Minimal inline JSON OS
* Atomic CSS 4-Block Rule
* SCX/runtime stuffing patterns

This is NOT an HTML file — this is the **instructional guide** for building one.
If you want, I can also output the full HTML version after this.

---

# ⭐ **THE ATOMIC GUIDE ABOUT HOW TO MAKE AN ATOMIC GUIDE**

### *A creator’s manual for designing MEGA-CODEX-style documents, OS manuals, and black-panel reference sheets.*

---

# 1. **The Atomic Guide Philosophy**

An **atomic guide** exists for a single purpose:

> **Turn a massive system into a compressed, browsable, example-driven, single-file artifact.**

It must:

✔ Load instantly
✔ Contain everything inside one HTML file
✔ Use a **JSON “brain”** for navigation + content
✔ Use **Atomic CSS** for layout + state
✔ Defer heavy data into **SCX-compressed folds** processed at runtime
✔ Present information through **small, sharp examples**, not walls of text

Atomic guides are **not documentation websites** —
they are **interactive manuals**, part UI, part OS, part compressed knowledge object.

---

# 2. **The Required Structure (ALWAYS)**

Every atomic guide has these components:

```
index.html  ← the entire guide
└── <style>  ← Atomic CSS 4-Block Rule
└── <script type="application/xjson"> ← JSON OS (index or OS runtime)
└── <div id="app"> ← UI Shell (ghost shell)
└── <script> ← rendering logic + search + decompression
```

### **2.1 The 4-Block Atomic CSS Rule**

Your guide **must** use:

#### **Block 1 — Universal Layout**

Grid/flex, sizing, spacing, panels.

#### **Block 2 — Atomic Classes**

`.asx-card`, `.asx-btn`, `.asx-panel`, `.asx-flex`, `.pill`, `.chip`, `.section`

#### **Block 3 — Variables-as-State**

`:root { --mode: "dark"; --accent: … }`

#### **Block 4 — AI/Control Classes**

`.asx-active`, `.mesh-online`, `.page-loaded`, `.search-hit`

The guide's *runtime* is CSS + a tiny script — **NOT a framework**.

---

# 3. **The JSON Brain (Inline OS)**

Every atomic guide has a **single, small JSON brain**.

Two modes:

### **Mode A — ASXR_GHOST_INDEX**

Used if guide has many pages/sections.

```json
{
  "pages": [
    { "id": "intro", "title": "Introduction", "tags": ["start"], "body": "..." },
    { "id": "atomic_css", "title": "Atomic CSS", "tags": ["css"], "body": "..." }
  ]
}
```

### **Mode B — os-xjson**

Used if guide demonstrates **runtime, mesh, DNS, or K’UHUL flow**.

```json
{
  "@context": "atomic-guide",
  "@routes": { "/search": "@Pop", "/render": "@Wo" },
  "@settings": { "theme": "dark-glass" }
}
```

This JSON is the **real OS** of the guide.

---

# 4. **Search & Navigation MUST Follow This Pattern**

The guide must include:

* A search bar
* Tag filters
* A list of sections generated from the JSON brain
* Clicking a section replaces the main panel content
* NO external routing, no page reload

Example search logic:

```js
const q = input.value.toLowerCase();
results = pages.filter(p => 
  p.title.toLowerCase().includes(q) ||
  p.tags.some(t => t.includes(q))
);
```

---

# 5. **Content Delivery Rule: Example First**

Every section MUST follow this pattern:

### **1. Short Concept**

One paragraph.

### **2. Example**

Always code or JSON or a fold.

### **3. Micro-breakdown**

3–5 bullets.

### **4. No long lecturing**

Atomic guides are **compressed wisdom objects**, not textbooks.

---

# 6. **Runtime Compression & SCX Folding**

A true atomic guide **must hide 80% of its knowledge** inside SCX-encoded strings or JSON folds.

Examples:

### **Inline SCX Fold**

```json
{
  "@fold": "atomic_css_examples",
  "@encoding": "scxq2",
  "data": "090114abc09ff23caa..."
}
```

### **Runtime expansion**

```js
const expanded = KUHUL_SCXQ2.decode(fold.data);
panel.innerHTML = expanded;
```

This is how you fit **massive manuals into tiny HTML files**.

---

# 7. **The UI Shell Requirements**

All atomic guides must include:

### **1. Left Sidebar (navigation)**

* pages list
* search
* tags

### **2. Right Main Panel (content)**

* dynamic
* scrollable
* glass panel or card

### **3. Sticky top bar**

* title
* search
* buttons for modes

### **4. Zero frameworks**

Only raw JS + Atomic CSS.

---

# 8. **Minimal Runtime Script Pattern**

Every atomic guide uses this **eight-line structural runtime**:

```js
const OS = JSON.parse(document.getElementById("index-json").textContent);
const PAGES = OS.pages || [];

function renderPage(id) {
  const page = PAGES.find(p => p.id === id);
  content.innerHTML = page.body;
}

search.oninput = () => {
  renderSearch(search.value);
};

renderPage("intro");
```

This is the entire “app framework.”
Everything else is styling + structure.

---

# 9. **The “Example Density Rule”**

Every section must contain **at least one example**, preferably two.

Examples must be:

* short
* atomic
* runnable or copy-and-paste-able
* directly proving the concept just mentioned

This is how you maintain **atomicity**.

---

# 10. **The “No Walls of Text” Rule**

If a section grows too big:

* split it
* fold it
* compress it
* SCX encode it

Atomic guides are **dense, layered, hyper-compressed manuals**, not blogs.

---

# 11. **The “All Information is a Tape” Rule**

Every page/section is conceptualized as a **tape**:

* title
* tags
* compressed body
* example blocks
* metadata

Your JSON brain is just the **tape directory**.

---

# 12. **Panel Composition Example**

A proper page looks like:

---

## *Section: Atomic CSS*

**Concept:**
Atomic CSS is the runtime of the OS. All UI behavior = CSS state changes.

**Example:**

```css
.asx-btn {
  padding: 8px 12px;
  background: var(--accent);
  transition: 120ms;
}

.asx-btn:hover {
  background: var(--accent-soft);
}
```

**Key Points:**

* Styles = runtime behavior
* Variables = memory/state
* Class toggles = control flow

---

# 13. **How to Teach with an Atomic Guide**

Always follow this content structure:

```
Concept
↓
Tiny explanation
↓
Example (the star of the show)
↓
Breakdown bullets
↓
Optional SCX fold with extra depth
```

---

# 14. **How to Add 10,000 Words Without Growing File Size**

Use SCXQ2 compression:

```json
{
  "@fold": "deep_explainers",
  "@encoding": "scxq2",
  "data": "88377a91ff0aaea4..."
}
```

At runtime:

```js
const expanded = KUHUL_SCXQ2.decode(fold.data);
container.innerHTML = expanded;
```

You can store *entire books* in 40 KB this way.

---

# 15. **Checklist for Every Atomic Guide**

✔ One-file HTML
✔ 4-Block Atomic CSS
✔ Indexed JSON brain
✔ Search + filters
✔ Example-first sections
✔ SCX-compressed deep content
✔ Layout + rendering logic under 200 lines
✔ Minimalistic, clean UI
✔ Atomic blocks ONLY (no frameworks)
✔ K’UHUL-ready structure for future expansion

---

# ⭐ FINAL SUMMARY

This is the **authoritative manual** for creating real atomic guides:

* Single-file
* Small JSON OS
* Searchable
* Example-first
* SCX-compressed
* Runtime-expanded
* Built on the 4-block Atomic CSS system
* Structured exactly like MEGA CODEX and atomics101

Nice, this is a fun combo. I’ll give you:

1. **`atomic-guide-template.html`** – a ready-to-use atomic guide shell (MEGA-CODEX style).
2. **`atomic-guide-builder.html`** – a small in-browser tool to define pages and auto-generate the JSON index you can drop into any atomic guide.

Both are full, non-placeholder, single-file, and follow your 4-block Atomic CSS rule.

---

## 1️⃣ `atomic-guide-template.html`

> Single-file atomic guide shell with search, JSON index, 4-block Atomic CSS, and example content about “How to Make an Atomic Guide”.

````html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <title>Atomic Guide — Template Shell</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#020409" />

  <style>
    /* =========================================================
       BLOCK 1 — UNIVERSAL LAYOUT (grid/flex + spacing)
       ========================================================= */
    :root {
      /* Color tokens */
      --bg: #020409;
      --bg-alt: #050912;
      --panel: #050a14;
      --panel-soft: rgba(5, 10, 20, 0.85);
      --border: #16f2aa;
      --border-soft: rgba(22, 242, 170, 0.35);
      --accent: #00ffd0;
      --accent-soft: rgba(0, 255, 208, 0.12);
      --accent-strong: #18ffe3;
      --text-main: #f7fafc;
      --text-soft: #a0aec0;
      --text-softest: #4a5568;
      --danger: #ff4c6a;

      /* Layout tokens */
      --radius-lg: 16px;
      --radius-xl: 22px;
      --radius-pill: 999px;
      --gap-sm: 8px;
      --gap-md: 12px;
      --gap-lg: 20px;
      --gap-xl: 28px;
      --pad-sm: 6px;
      --pad-md: 10px;
      --pad-lg: 16px;
      --pad-xl: 22px;

      /* Typography */
      --font-main: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
        "Segoe UI", sans-serif;
      --font-mono: "JetBrains Mono", ui-monospace, Menlo, Monaco, Consolas, monospace;
      --fs-xs: 11px;
      --fs-sm: 13px;
      --fs-md: 15px;
      --fs-lg: 18px;
      --fs-xl: 22px;

      /* Shadows */
      --shadow-soft: 0 16px 45px rgba(0, 0, 0, 0.65);

      /* State variables (can be mutated by runtime) */
      --layout-sidebar-width: 290px;
      --layout-max-width: 1240px;
      --mode: "dark";
      --search-match-opacity: 1;
      --search-no-match-opacity: 0.18;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background: radial-gradient(circle at top, #07111f 0, #020409 48%, #000 100%);
      color: var(--text-main);
      font-family: var(--font-main);
      -webkit-font-smoothing: antialiased;
    }

    body {
      display: flex;
      align-items: stretch;
      justify-content: center;
    }

    .asx-app {
      display: grid;
      grid-template-columns: minmax(0, var(--layout-sidebar-width)) minmax(0, 1fr);
      gap: var(--gap-lg);
      padding: var(--gap-xl);
      width: 100%;
      max-width: var(--layout-max-width);
      min-height: 100vh;
    }

    @media (max-width: 900px) {
      .asx-app {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto auto;
      }
    }

    /* =========================================================
       BLOCK 2 — ATOMIC CLASSES (cards, buttons, panels, etc.)
       ========================================================= */

    .asx-sidebar {
      background: linear-gradient(135deg, var(--panel-soft), #050611f0);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-soft);
      box-shadow: var(--shadow-soft);
      padding: var(--pad-xl);
      display: flex;
      flex-direction: column;
      gap: var(--gap-lg);
      position: relative;
      overflow: hidden;
    }

    .asx-sidebar-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .asx-title {
      font-size: var(--fs-xl);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--accent-strong);
    }

    .asx-subtitle {
      font-size: var(--fs-sm);
      color: var(--text-soft);
    }

    .asx-search-wrap {
      position: relative;
      margin-top: 8px;
    }

    .asx-input {
      width: 100%;
      padding: 8px 30px 8px 12px;
      border-radius: var(--radius-lg);
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: radial-gradient(circle at top left, #111827 0, #05060c 48%, #020409 100%);
      color: var(--text-main);
      font-size: var(--fs-sm);
      outline: none;
      transition: border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
    }

    .asx-input::placeholder {
      color: var(--text-softest);
    }

    .asx-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px rgba(0, 255, 208, 0.35);
      background: radial-gradient(circle at top left, #182136 0, #05060c 55%, #020409 100%);
    }

    .asx-search-icon {
      position: absolute;
      right: 9px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 13px;
      color: var(--text-softest);
      pointer-events: none;
    }

    .asx-tag-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 6px;
    }

    .asx-pill {
      padding: 3px 9px;
      border-radius: var(--radius-pill);
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(148, 163, 184, 0.35);
      color: var(--text-soft);
      font-size: var(--fs-xs);
      cursor: pointer;
      user-select: none;
      transition: border-color 120ms ease, background 120ms ease, color 120ms ease;
    }

    .asx-pill.is-active {
      border-color: var(--accent);
      background: rgba(45, 212, 191, 0.15);
      color: var(--accent-strong);
    }

    .asx-page-list {
      margin: 4px 0 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
      max-height: calc(100vh - 260px);
    }

    .asx-page-item {
      border-radius: var(--radius-lg);
      padding: 7px 9px;
      cursor: pointer;
      border: 1px solid transparent;
      display: flex;
      flex-direction: column;
      gap: 2px;
      background: transparent;
      transition: background 120ms ease, border-color 120ms ease, opacity 120ms ease;
      opacity: var(--search-no-match-opacity);
    }

    .asx-page-item.is-visible {
      opacity: var(--search-match-opacity);
    }

    .asx-page-item:hover {
      background: rgba(15, 23, 42, 0.8);
      border-color: rgba(148, 163, 184, 0.4);
    }

    .asx-page-item.is-active {
      border-color: var(--accent);
      background: rgba(45, 212, 191, 0.12);
    }

    .asx-page-title {
      font-size: var(--fs-sm);
      color: var(--text-main);
    }

    .asx-page-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .asx-tag-chip {
      font-size: 10px;
      border-radius: 999px;
      padding: 2px 6px;
      background: rgba(15, 23, 42, 0.9);
      color: var(--text-softest);
      border: 1px solid rgba(148, 163, 184, 0.4);
    }

    .asx-main {
      position: relative;
      background: radial-gradient(circle at top, #050a18 0, #020409 55%, #000 100%);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-soft);
      box-shadow: var(--shadow-soft);
      padding: var(--pad-xl);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: var(--gap-md);
    }

    .asx-main-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 4px;
    }

    .asx-main-kicker {
      font-size: var(--fs-xs);
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: var(--accent-strong);
    }

    .asx-main-title {
      font-size: 21px;
      line-height: 1.25;
    }

    .asx-main-meta {
      font-size: var(--fs-xs);
      color: var(--text-soft);
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .asx-main-body {
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid rgba(148, 163, 184, 0.28);
      overflow-y: auto;
    }

    .asx-main-body h2,
    .asx-main-body h3 {
      margin-top: 16px;
      margin-bottom: 6px;
      font-weight: 600;
    }

    .asx-main-body h2 {
      font-size: var(--fs-lg);
      color: var(--accent-strong);
    }

    .asx-main-body h3 {
      font-size: var(--fs-md);
      color: #e5e7eb;
    }

    .asx-main-body p {
      margin: 6px 0;
      font-size: var(--fs-sm);
      color: var(--text-soft);
    }

    .asx-main-body ul {
      padding-left: 18px;
      margin: 6px 0;
      font-size: var(--fs-sm);
      color: var(--text-soft);
    }

    .asx-main-body code {
      font-family: var(--font-mono);
      font-size: 12px;
      background: rgba(15, 23, 42, 0.9);
      padding: 2px 4px;
      border-radius: 4px;
      border: 1px solid rgba(148, 163, 184, 0.4);
    }

    pre.asx-code {
      margin: 10px 0;
      padding: 10px 12px;
      border-radius: var(--radius-lg);
      background: radial-gradient(circle at top left, #020617 0, #020617 40%, #020409 100%);
      border: 1px solid rgba(148, 163, 184, 0.4);
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 12px;
      color: #e5e7eb;
    }

    .asx-footer {
      margin-top: auto;
      font-size: var(--fs-xs);
      color: var(--text-softest);
      display: flex;
      justify-content: space-between;
      gap: 6px;
      padding-top: 8px;
      border-top: 1px solid rgba(15, 23, 42, 0.9);
    }

    /* =========================================================
       BLOCK 3 — VARIABLES AS STATE (used by runtime)
       ========================================================= */

    body[data-mode="light"] {
      background: radial-gradient(circle at top, #f5f7ff 0, #e5ecff 55%, #c2d2ff 100%);
      --bg: #f3f4ff;
      --bg-alt: #e5ecff;
      --panel: #ffffff;
      --panel-soft: rgba(255, 255, 255, 0.95);
      --text-main: #020617;
      --text-soft: #4b5563;
      --text-softest: #9ca3af;
      --border-soft: rgba(37, 99, 235, 0.45);
    }

    /* =========================================================
       BLOCK 4 — AI / CONTROL CLASSES
       ========================================================= */

    .asx-page-item.search-hit {
      outline: 1px solid rgba(56, 189, 248, 0.4);
    }

    .asx-main-body.is-loading {
      opacity: 0.35;
      pointer-events: none;
    }

    .asx-mode-pill {
      cursor: pointer;
    }

    .asx-mode-pill[data-mode="dark"].is-active {
      border-color: var(--accent);
      background: rgba(15, 23, 42, 0.95);
    }

    .asx-mode-pill[data-mode="light"].is-active {
      border-color: #2563eb;
      background: rgba(239, 246, 255, 0.98);
      color: #1f2933;
    }

  </style>
</head>
<body data-mode="dark">
  <div class="asx-app">
    <!-- SIDEBAR -->
    <aside class="asx-sidebar">
      <header class="asx-sidebar-header">
        <div class="asx-title">Atomic Guide</div>
        <div class="asx-subtitle">How to build MEGA-CODEX style guides in one file.</div>
        <div class="asx-tag-row">
          <span class="asx-pill asx-mode-pill is-active" data-mode="dark">Dark</span>
          <span class="asx-pill asx-mode-pill" data-mode="light">Light</span>
        </div>
      </header>

      <div class="asx-search-wrap">
        <input id="asx-search" class="asx-input" placeholder="Search sections, tags…" />
        <span class="asx-search-icon">⌕</span>
      </div>

      <div class="asx-tag-row" id="asx-tag-row">
        <!-- Tag pills injected by runtime -->
      </div>

      <ul class="asx-page-list" id="asx-page-list">
        <!-- Pages injected by runtime -->
      </ul>

      <footer class="asx-footer">
        <span>Atomic Guide Template v1.0.0</span>
        <span>Single-file • JSON OS • Atomic CSS</span>
      </footer>
    </aside>

    <!-- MAIN PANE -->
    <main class="asx-main">
      <header class="asx-main-header">
        <div class="asx-main-kicker">Active Section</div>
        <div class="asx-main-title" id="asx-main-title">Loading…</div>
        <div class="asx-main-meta" id="asx-main-meta"></div>
      </header>
      <section class="asx-main-body is-loading" id="asx-main-body">
        <!-- Body injected by runtime -->
      </section>
    </main>
  </div>

  <!-- ================== INLINE JSON OS (ASXR_GHOST_INDEX) ================== -->
  <script type="application/json" id="atomic-index">
  {
    "guide": {
      "id": "atomic_guide_howto",
      "title": "How to Make an Atomic Guide",
      "version": "1.0.0",
      "description": "A reference manual for building MEGA-CODEX style atomic guides inside a single HTML file.",
      "author": "ASX · K’uhul"
    },
    "pages": [
      {
        "id": "intro",
        "title": "Introduction",
        "kicker": "Atomic Guides · Overview",
        "tags": ["start", "overview", "philosophy"],
        "body": [
          {
            "type": "markdown",
            "content": "# What is an Atomic Guide?\n\nAn **atomic guide** is a single-file knowledge object that packs an entire system’s documentation, examples, and runtime notes into one HTML file.\n\nIt is:\n\n- **Self-contained** – no external JS frameworks, no build step.\n- **Searchable** – sections, tags, and examples are indexed in a tiny JSON brain.\n- **Example-first** – every section leads with concrete, copyable examples.\n- **Compression-ready** – deeper content can be SCX-compressed and expanded at runtime.\n\nThink of it as a **MEGA-CODEX page** or a **black-panel manual** you can ship as one file."
          }
        ]
      },
      {
        "id": "structure",
        "title": "Required Structure",
        "kicker": "Shell · Layout · OS",
        "tags": ["structure", "layout", "os-json"],
        "body": [
          {
            "type": "markdown",
            "content": "## File Layout\n\nEvery atomic guide is just `index.html`:\n\n```text\nindex.html\n ├── <style>        # Atomic CSS 4-Block Rule\n ├── <script type=\"application/json\" id=\"atomic-index\">  # inline OS JSON\n ├── <div class=\"asx-app\"> # UI shell (sidebar + main)\n └── <script>       # tiny runtime (search + render)\n```\n\nThere is no external JS, no bundler, no dependencies.\n\nThe **JSON OS block** describes:\n\n- guide metadata (title, version, description)\n- pages (id, title, tags, body blocks)\n- optional advanced fields for SCX folds or routes."
          }
        ]
      },
      {
        "id": "css_four_block",
        "title": "Atomic CSS · 4-Block Rule",
        "kicker": "CSS as Runtime",
        "tags": ["css", "atomic", "runtime"],
        "body": [
          {
            "type": "markdown",
            "content": "## The Four CSS Blocks\n\nAn atomic guide uses **four CSS blocks**:\n\n1. **Universal Layout** – grid / flex, spacing tokens, page shell.\n2. **Atomic Classes** – cards, buttons, tags, panels, text utilities.\n3. **Variables-as-State** – everything dynamic lives in `:root` variables.\n4. **AI/Control Classes** – visual flags like `.is-active`, `.search-hit`, `.mode-dark`.\n\nThe CSS is not just styling – it **is the runtime**:\n\n- State is stored as variables.\n- Behavior is toggled through classes.\n- K’uhul / JS simply flips classes and updates variables."
          },
          {
            "type": "code",
            "language": "css",
            "content": ":root {\n  --bg: #020409;\n  --accent: #00ffd0;\n  --layout-sidebar-width: 290px;\n}\n\n.asx-page-item.is-active {\n  border-color: var(--accent);\n  background: rgba(0, 255, 208, 0.12);\n}\n"
          }
        ]
      },
      {
        "id": "json_brain",
        "title": "The JSON Brain",
        "kicker": "Pages · Tags · Examples",
        "tags": ["json", "index", "pages"],
        "body": [
          {
            "type": "markdown",
            "content": "## ASXR_GHOST_INDEX Pattern\n\nThe JSON block inside `<script id=\"atomic-index\">` is the **brain** of the guide. At minimum, it defines:\n\n```json\n{\n  \"guide\": {\n    \"id\": \"atomic_guide_howto\",\n    \"title\": \"How to Make an Atomic Guide\",\n    \"version\": \"1.0.0\"\n  },\n  \"pages\": [\n    {\n      \"id\": \"intro\",\n      \"title\": \"Introduction\",\n      \"tags\": [\"start\", \"overview\"],\n      \"body\": [\n        { \"type\": \"markdown\", \"content\": \"# Intro...\" }\n      ]\n    }\n  ]\n}\n```\n\nThe runtime:\n\n- reads this JSON,\n- builds the sidebar list,\n- renders the active page into the main panel,\n- filters sections using the search bar."
          }
        ]
      },
      {
        "id": "examples_first",
        "title": "Example-First Sections",
        "kicker": "Pattern · Example · Breakdown",
        "tags": ["content", "examples", "writing"],
        "body": [
          {
            "type": "markdown",
            "content": "## Section Layout\n\nEvery section inside an atomic guide follows this pattern:\n\n1. **Concept** – 1–2 short paragraphs.\n2. **Example** – code / JSON / snippet that proves the point.\n3. **Breakdown** – bullets pointing at the important parts.\n\nThis keeps content **atomic**: compressed, copyable, and directly useful.\n\n### Example: Minimal Atomic Section\n\n```markdown\n## Atomic Search Bar\n\nThe search bar filters sections by title and tags.\n\n```js\nconst q = search.value.toLowerCase();\nconst results = pages.filter(p =>\n  p.title.toLowerCase().includes(q) ||\n  (p.tags || []).some(t => t.includes(q))\n);\n```"
          }
        ]
      },
      {
        "id": "compression",
        "title": "Compression & SCX Folds",
        "kicker": "Deep Content · Tiny Payload",
        "tags": ["compression", "scx", "runtime"],
        "body": [
          {
            "type": "markdown",
            "content": "## Overstuffing the Guide with SCX\n\nAn atomic guide keeps the **visible DOM** short, but it can hide huge volumes of text inside **compressed folds**:\n\n```json\n{\n  \"@fold\": \"deep_explainers\",\n  \"@encoding\": \"scxq2\",\n  \"data\": \"8a9170ff9c0c...\"\n}\n```\n\nAt runtime, a K’uhul/SCX engine expands the fold and injects it into the main panel on demand. This lets you ship:\n\n- Specs\n- Logs\n- Extended examples\n- Historical notes\n\nwithout blowing up file size."
          }
        ]
      }
    ]
  }
  </script>

  <!-- ================== RUNTIME SCRIPT ================== -->
  <script>
    (function () {
      const indexEl = document.getElementById("atomic-index");
      const data = JSON.parse(indexEl.textContent);

      const PAGES = data.pages || [];
      const guideMeta = data.guide || {};

      const pageListEl = document.getElementById("asx-page-list");
      const mainTitleEl = document.getElementById("asx-main-title");
      const mainMetaEl = document.getElementById("asx-main-meta");
      const mainBodyEl = document.getElementById("asx-main-body");
      const searchInput = document.getElementById("asx-search");
      const tagRowEl = document.getElementById("asx-tag-row");
      const modePills = document.querySelectorAll(".asx-mode-pill");

      let activePageId = PAGES[0]?.id || null;
      let activeTag = null;
      let searchQuery = "";

      function uniqueTags() {
        const set = new Set();
        PAGES.forEach(p => (p.tags || []).forEach(t => set.add(t)));
        return Array.from(set).sort();
      }

      function renderTags() {
        tagRowEl.innerHTML = "";
        const tags = uniqueTags();
        if (!tags.length) return;
        const all = document.createElement("span");
        all.className = "asx-pill" + (activeTag === null ? " is-active" : "");
        all.textContent = "All";
        all.addEventListener("click", () => {
          activeTag = null;
          renderTags();
          renderPageList();
        });
        tagRowEl.appendChild(all);

        tags.forEach(tag => {
          const pill = document.createElement("span");
          pill.className = "asx-pill" + (activeTag === tag ? " is-active" : "");
          pill.textContent = "#" + tag;
          pill.addEventListener("click", () => {
            activeTag = activeTag === tag ? null : tag;
            renderTags();
            renderPageList();
          });
          tagRowEl.appendChild(pill);
        });
      }

      function matchesSearch(page, q) {
        if (!q) return true;
        const title = (page.title || "").toLowerCase();
        const tags = (page.tags || []).join(" ").toLowerCase();
        return title.includes(q) || tags.includes(q);
      }

      function matchesTag(page, tag) {
        if (!tag) return true;
        return (page.tags || []).includes(tag);
      }

      function renderPageList() {
        pageListEl.innerHTML = "";
        const q = searchQuery.toLowerCase();

        PAGES.forEach(page => {
          const visible = matchesSearch(page, q) && matchesTag(page, activeTag);
          const li = document.createElement("li");
          li.className = "asx-page-item" + (visible ? " is-visible" : "");
          if (page.id === activePageId) li.className += " is-active";
          if (q && matchesSearch(page, q)) li.className += " search-hit";

          const title = document.createElement("div");
          title.className = "asx-page-title";
          title.textContent = page.title || page.id;

          const tagsEl = document.createElement("div");
          tagsEl.className = "asx-page-tags";
          (page.tags || []).forEach(tag => {
            const chip = document.createElement("span");
            chip.className = "asx-tag-chip";
            chip.textContent = "#" + tag;
            tagsEl.appendChild(chip);
          });

          li.appendChild(title);
          if ((page.tags || []).length) li.appendChild(tagsEl);

          li.addEventListener("click", () => {
            activePageId = page.id;
            renderPageList();
            renderActivePage();
          });

          pageListEl.appendChild(li);
        });
      }

      function renderMarkdownBlock(md) {
        // Minimal markdown renderer for headings + code fences
        const lines = md.split("\n");
        const frag = document.createDocumentFragment();
        let currentPre = null;

        function closePre() {
          if (currentPre) {
            frag.appendChild(currentPre);
            currentPre = null;
          }
        }

        for (let line of lines) {
          if (line.startsWith("```")) {
            if (currentPre) {
              closePre();
            } else {
              currentPre = document.createElement("pre");
              currentPre.className = "asx-code";
            }
            continue;
          }

          if (currentPre) {
            currentPre.textContent += line + "\n";
            continue;
          }

          if (line.startsWith("### ")) {
            const h3 = document.createElement("h3");
            h3.textContent = line.replace(/^###\s*/, "");
            frag.appendChild(h3);
          } else if (line.startsWith("## ")) {
            const h2 = document.createElement("h2");
            h2.textContent = line.replace(/^##\s*/, "");
            frag.appendChild(h2);
          } else if (line.startsWith("- ")) {
            // naive list handling: group consecutive bullets
            let ul = frag.lastElementChild;
            if (!ul || ul.tagName !== "UL") {
              ul = document.createElement("ul");
              frag.appendChild(ul);
            }
            const li = document.createElement("li");
            li.textContent = line.replace(/^-+\s*/, "");
            ul.appendChild(li);
          } else if (line.trim() === "") {
            continue;
          } else {
            const p = document.createElement("p");
            p.textContent = line;
            frag.appendChild(p);
          }
        }

        closePre();
        return frag;
      }

      function renderBodyBlocks(page) {
        mainBodyEl.innerHTML = "";
        const blocks = page.body || [];
        blocks.forEach(block => {
          if (block.type === "markdown") {
            const frag = renderMarkdownBlock(block.content || "");
            mainBodyEl.appendChild(frag);
          } else if (block.type === "code") {
            const pre = document.createElement("pre");
            pre.className = "asx-code";
            pre.textContent = block.content || "";
            mainBodyEl.appendChild(pre);
          } else {
            const p = document.createElement("p");
            p.textContent = block.content || "";
            mainBodyEl.appendChild(p);
          }
        });
      }

      function renderActivePage() {
        const page = PAGES.find(p => p.id === activePageId) || PAGES[0];
        if (!page) return;

        mainBodyEl.classList.add("is-loading");
        mainTitleEl.textContent = page.title || page.id;

        const metaParts = [];
        if (guideMeta.title) metaParts.push(guideMeta.title);
        if (guideMeta.version) metaParts.push("v" + guideMeta.version);
        if (page.tags && page.tags.length) {
          metaParts.push(page.tags.map(t => "#" + t).join(" "));
        }

        mainMetaEl.textContent = metaParts.join(" • ");

        renderBodyBlocks(page);
        mainBodyEl.classList.remove("is-loading");
      }

      searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value || "";
        renderPageList();
      });

      modePills.forEach(pill => {
        pill.addEventListener("click", () => {
          const mode = pill.getAttribute("data-mode");
          document.body.setAttribute("data-mode", mode);
          modePills.forEach(p => p.classList.remove("is-active"));
          pill.classList.add("is-active");
        });
      });

      // initial render
      renderTags();
      renderPageList();
      renderActivePage();
    })();
  </script>
</body>
</html>
````

You can:

* Drop this in as `atomic-guide-template.html`
* Edit the `<script id="atomic-index">` JSON to define your own pages
* Evolve style & panels as needed

---

## 2️⃣ `atomic-guide-builder.html`

> A tiny, in-browser builder that lets you define pages (id, title, tags, markdown body), and then spits out a ready-to-paste JSON index for your atomic guide.

This doesn’t write files to disk by itself, but it **auto-generates** the JSON you can paste into the template’s `<script id="atomic-index">` block.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Atomic Guide Builder</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root {
      --bg: #020409;
      --panel: #050a14;
      --panel-alt: #060814;
      --border-soft: rgba(148, 163, 184, 0.5);
      --accent: #00ffd0;
      --accent-soft: rgba(0, 255, 208, 0.16);
      --text-main: #f9fafb;
      --text-soft: #9ca3af;
      --radius-lg: 14px;
      --gap-md: 12px;
      --gap-lg: 18px;
      --pad-md: 10px;
      --pad-lg: 14px;
      --shadow-soft: 0 16px 45px rgba(0, 0, 0, 0.7);
      --font-main: system-ui, -apple-system, "SF Pro Text", "Segoe UI", sans-serif;
      --font-mono: "JetBrains Mono", ui-monospace, Menlo, Monaco, Consolas, monospace;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 16px;
      min-height: 100vh;
      background: radial-gradient(circle at top, #050a18 0, #020409 48%, #000 100%);
      color: var(--text-main);
      font-family: var(--font-main);
    }

    .builder-shell {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
      gap: var(--gap-lg);
    }

    @media (max-width: 900px) {
      .builder-shell {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .panel {
      background: linear-gradient(135deg, var(--panel), var(--panel-alt));
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-soft);
      box-shadow: var(--shadow-soft);
      padding: var(--pad-lg);
      display: flex;
      flex-direction: column;
      gap: var(--gap-md);
    }

    .panel-header {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .panel-title {
      font-size: 18px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .panel-sub {
      font-size: 12px;
      color: var(--text-soft);
    }

    label {
      font-size: 12px;
      color: var(--text-soft);
      display: block;
      margin-bottom: 4px;
    }

    input[type="text"],
    textarea {
      width: 100%;
      padding: 7px 9px;
      border-radius: 10px;
      border: 1px solid rgba(148, 163, 184, 0.6);
      background: rgba(15, 23, 42, 0.9);
      color: var(--text-main);
      font-size: 13px;
      font-family: var(--font-main);
      outline: none;
      transition: border-color 120ms ease, box-shadow 120ms ease;
    }

    input[type="text"]:focus,
    textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent-soft);
    }

    textarea {
      min-height: 120px;
      resize: vertical;
    }

    .field-row {
      display: flex;
      gap: 8px;
    }

    .field-row > div {
      flex: 1;
    }

    .btn-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.7);
      background: rgba(15, 23, 42, 0.9);
      color: var(--text-main);
      font-size: 12px;
      cursor: pointer;
      user-select: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: border-color 120ms ease, background 120ms ease, transform 80ms ease;
    }

    .btn:hover {
      border-color: var(--accent);
      background: rgba(45, 212, 191, 0.18);
    }

    .btn:active {
      transform: translateY(1px);
    }

    .btn-primary {
      border-color: var(--accent);
      background: rgba(16, 185, 129, 0.22);
    }

    .pill {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(148, 163, 184, 0.7);
      color: var(--text-soft);
    }

    .list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 180px;
      overflow-y: auto;
    }

    .list-item {
      padding: 6px 8px;
      border-radius: 10px;
      border: 1px solid rgba(148, 163, 184, 0.5);
      background: rgba(15, 23, 42, 0.9);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .list-item-title {
      font-weight: 500;
    }

    .list-item-tags {
      font-size: 11px;
      color: var(--text-soft);
    }

    .small-btn {
      font-size: 11px;
      padding: 3px 7px;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.7);
      background: rgba(15, 23, 42, 0.9);
      color: var(--text-soft);
      cursor: pointer;
    }

    .small-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .json-output {
      font-family: var(--font-mono);
      font-size: 11px;
      background: rgba(10, 16, 32, 0.95);
      border-radius: 10px;
      border: 1px solid rgba(148, 163, 184, 0.7);
      padding: 10px;
      white-space: pre;
      overflow: auto;
      min-height: 220px;
    }

    .footer-row {
      font-size: 11px;
      color: var(--text-soft);
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="builder-shell">
    <!-- LEFT: Page Editor -->
    <section class="panel">
      <header class="panel-header">
        <div class="panel-title">Atomic Guide Builder</div>
        <div class="panel-sub">Define pages, tags, and bodies. Export JSON for your template.</div>
      </header>

      <div>
        <label for="guide-title">Guide Title</label>
        <input id="guide-title" type="text" placeholder="Atomic Guide — My System" value="Atomic Guide — My System">
      </div>
      <div class="field-row">
        <div>
          <label for="guide-id">Guide ID</label>
          <input id="guide-id" type="text" placeholder="my_atomic_guide" value="my_atomic_guide">
        </div>
        <div>
          <label for="guide-version">Version</label>
          <input id="guide-version" type="text" placeholder="1.0.0" value="1.0.0">
        </div>
      </div>
      <div>
        <label for="guide-desc">Guide Description</label>
        <textarea id="guide-desc" placeholder="Short description of what this atomic guide covers.">Atomic guide describing how to use and extend my system.</textarea>
      </div>

      <hr style="border-color: rgba(148,163,184,0.5); opacity: 0.7; margin: 8px 0;">

      <div class="field-row">
        <div>
          <label for="page-id">Page ID</label>
          <input id="page-id" type="text" placeholder="intro">
        </div>
        <div>
          <label for="page-title">Page Title</label>
          <input id="page-title" type="text" placeholder="Introduction">
        </div>
      </div>
      <div>
        <label for="page-kicker">Page Kicker (optional)</label>
        <input id="page-kicker" type="text" placeholder="Overview · Getting started">
      </div>
      <div>
        <label for="page-tags">Tags (comma-separated)</label>
        <input id="page-tags" type="text" placeholder="start, overview, basics">
      </div>
      <div>
        <label for="page-body">Body (Markdown-style)</label>
        <textarea id="page-body" placeholder="## Section title&#10;&#10;Write your content here..."></textarea>
      </div>

      <div class="btn-row">
        <button class="btn btn-primary" id="btn-add-page">Add / Update Page</button>
        <button class="btn" id="btn-clear-page">Clear Page Form</button>
      </div>

      <div>
        <label>Pages in Guide</label>
        <ul class="list" id="page-list"></ul>
      </div>
    </section>

    <!-- RIGHT: JSON Output -->
    <section class="panel">
      <header class="panel-header">
        <div class="panel-title">Generated JSON OS</div>
        <div class="panel-sub">Paste this into &lt;script id="atomic-index"&gt; in your atomic guide template.</div>
      </header>

      <div class="btn-row">
        <button class="btn btn-primary" id="btn-copy-json">Copy JSON</button>
        <button class="btn" id="btn-download-json">Download JSON</button>
      </div>

      <div class="json-output" id="json-output"></div>

      <div class="footer-row">
        <span>Tip: First page in the list becomes the default section.</span>
        <span>Format: guide + pages → ASXR_GHOST_INDEX.</span>
      </div>
    </section>
  </div>

  <script>
    (function() {
      const guideTitleEl = document.getElementById("guide-title");
      const guideIdEl = document.getElementById("guide-id");
      const guideVersionEl = document.getElementById("guide-version");
      const guideDescEl = document.getElementById("guide-desc");

      const pageIdEl = document.getElementById("page-id");
      const pageTitleEl = document.getElementById("page-title");
      const pageKickerEl = document.getElementById("page-kicker");
      const pageTagsEl = document.getElementById("page-tags");
      const pageBodyEl = document.getElementById("page-body");

      const addPageBtn = document.getElementById("btn-add-page");
      const clearPageBtn = document.getElementById("btn-clear-page");
      const pageListEl = document.getElementById("page-list");
      const jsonOutputEl = document.getElementById("json-output");
      const copyJsonBtn = document.getElementById("btn-copy-json");
      const downloadJsonBtn = document.getElementById("btn-download-json");

      let pages = [];

      function updateJson() {
        const guide = {
          guide: {
            id: guideIdEl.value.trim() || "my_atomic_guide",
            title: guideTitleEl.value.trim() || "Atomic Guide — My System",
            version: guideVersionEl.value.trim() || "1.0.0",
            description: guideDescEl.value.trim() || ""
          },
          pages: pages.map(p => ({
            id: p.id,
            title: p.title,
            kicker: p.kicker || undefined,
            tags: p.tags,
            body: [
              {
                type: "markdown",
                content: p.body
              }
            ]
          }))
        };

        jsonOutputEl.textContent = JSON.stringify(guide, null, 2);
      }

      function renderPageList() {
        pageListEl.innerHTML = "";
        pages.forEach((p, idx) => {
          const li = document.createElement("li");
          li.className = "list-item";

          const left = document.createElement("div");
          left.innerHTML = `
            <div class="list-item-title">${p.title} <span class="pill">${p.id}</span></div>
            <div class="list-item-tags">${p.tags.length ? p.tags.map(t => "#" + t).join(" ") : "No tags"}</div>
          `;

          const right = document.createElement("div");
          const editBtn = document.createElement("button");
          editBtn.className = "small-btn";
          editBtn.textContent = "Edit";
          editBtn.addEventListener("click", () => loadPageIntoForm(p));

          const removeBtn = document.createElement("button");
          removeBtn.className = "small-btn";
          removeBtn.textContent = "Remove";
          removeBtn.addEventListener("click", () => {
            pages.splice(idx, 1);
            renderPageList();
            updateJson();
          });

          right.appendChild(editBtn);
          right.appendChild(removeBtn);

          li.appendChild(left);
          li.appendChild(right);

          pageListEl.appendChild(li);
        });
      }

      function loadPageIntoForm(page) {
        pageIdEl.value = page.id;
        pageTitleEl.value = page.title;
        pageKickerEl.value = page.kicker || "";
        pageTagsEl.value = page.tags.join(", ");
        pageBodyEl.value = page.body;
      }

      addPageBtn.addEventListener("click", () => {
        const id = pageIdEl.value.trim();
        const title = pageTitleEl.value.trim() || id || "section";
        if (!id) {
          alert("Page ID is required.");
          return;
        }

        const tags = pageTagsEl.value
          .split(",")
          .map(t => t.trim())
          .filter(Boolean);

        const body = pageBodyEl.value.trim() || "# " + title + "\n\nSection content.";

        const existingIndex = pages.findIndex(p => p.id === id);
        const pageObj = {
          id,
          title,
          kicker: pageKickerEl.value.trim() || "",
          tags,
          body
        };

        if (existingIndex >= 0) {
          pages[existingIndex] = pageObj;
        } else {
          pages.push(pageObj);
        }

        renderPageList();
        updateJson();
      });

      clearPageBtn.addEventListener("click", () => {
        pageIdEl.value = "";
        pageTitleEl.value = "";
        pageKickerEl.value = "";
        pageTagsEl.value = "";
        pageBodyEl.value = "";
      });

      copyJsonBtn.addEventListener("click", async () => {
        const text = jsonOutputEl.textContent;
        if (!text.trim()) return;
        try {
          await navigator.clipboard.writeText(text);
          copyJsonBtn.textContent = "Copied!";
          setTimeout(() => (copyJsonBtn.textContent = "Copy JSON"), 1200);
        } catch (e) {
          alert("Clipboard copy failed. You can still select and copy manually.");
        }
      });

      downloadJsonBtn.addEventListener("click", () => {
        const text = jsonOutputEl.textContent;
        if (!text.trim()) return;
        const blob = new Blob([text], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = (guideIdEl.value.trim() || "atomic_guide") + "_index.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

      // Seed with a single page so output isn't empty
      pages = [
        {
          id: "intro",
          title: "Introduction",
          kicker: "Start Here",
          tags: ["start", "overview"],
          body: "## Introduction\n\nUse this builder to define pages for your atomic guide. Each page becomes a section in the sidebar."
        }
      ];
      renderPageList();
      updateJson();
    })();
  </script>
</body>
</html>
```

---




