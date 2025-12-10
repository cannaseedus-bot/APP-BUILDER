/* ============================================================
   ASX-RIG PUBLIC RUNTIME v3.0 • ASXR Trinity Client Layer
   Universal runtime for all ASXR Trinity applications
   ============================================================ */

window.ASX = {
    API: window.location.origin,
    logBuffer: [],
    agents: {
        mx2lm: { status: 'idle', color: '#ffd000' },
        cline: { status: 'idle', color: '#16f2aa' },
        qwen: { status: 'idle', color: '#00eaff' },
        janus: { status: 'idle', color: '#ff3366' }
    },

    /* ---------------------------------------------
       INITIALIZATION
       --------------------------------------------- */
    setAPI(url) {
        console.log("🔗 ASX API bound:", url);
        this.API = url;
        localStorage.setItem("ASX_API", url);
    },

    init() {
        const stored = localStorage.getItem("ASX_API");
        if (stored) this.API = stored;

        console.log("⚛️ ASX Runtime Loaded →", this.API);
        console.log("📦 ASXR Trinity • Micro-ASXR Ecosystem");

        this.registerServiceWorkers();
        this.mountHUD();
        this.mountBasher();
        this.checkHealth();
    },

    /* ---------------------------------------------
       SERVICE WORKER REGISTRATION
       --------------------------------------------- */
    async registerServiceWorkers() {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Workers not supported');
            return;
        }

        const workers = [
            '/cms/sw.js',    // MX2CMS Database OS
            '/mx2cx/sw.js',  // Builder Codex
        ];

        for (const sw of workers) {
            try {
                await navigator.serviceWorker.register(sw);
                console.log(`✓ Registered: ${sw}`);
            } catch (e) {
                console.warn(`✖ Failed to register ${sw}:`, e);
            }
        }
    },

    /* ---------------------------------------------
       UNIVERSAL FETCH WRAPPER
       --------------------------------------------- */
    async call(path, body = {}, method = "POST") {
        try {
            const options = {
                method,
                headers: { "Content-Type": "application/json" }
            };

            if (method !== "GET") {
                options.body = JSON.stringify(body);
            }

            const res = await fetch(`${this.API}${path}`, options);
            return await res.json();
        } catch (err) {
            console.error("ASX API Error:", err);
            return { ok: false, error: String(err) };
        }
    },

    /* ---------------------------------------------
       HEALTH CHECK
       --------------------------------------------- */
    async checkHealth() {
        try {
            const res = await fetch('/os/health');
            if (res.ok) {
                const data = await res.json();
                console.log('✓ MX2CMS Health:', data);
                return data;
            }
        } catch (e) {
            console.warn('MX2CMS health check failed:', e);
        }
        return { ok: false };
    },

    /* ---------------------------------------------
       MX2CMS DATABASE OPERATIONS
       --------------------------------------------- */
    async dbPut(scope, data) {
        return await fetch(`/mx2db/put?scope=${scope}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json());
    },

    async dbQuery(scope, filter = {}) {
        return await fetch(`/mx2db/query?scope=${scope}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filter)
        }).then(r => r.json());
    },

    async ramSet(key, value) {
        return await fetch('/ram/set', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value })
        }).then(r => r.json());
    },

    async ramGet(key) {
        return await fetch(`/ram/get?key=${key}`).then(r => r.json());
    },

    /* ---------------------------------------------
       TAPE/PROJECT MANAGEMENT
       --------------------------------------------- */
    async loadTapes() {
        const res = await this.call("/api/studio/list-projects", {}, "GET");
        if (!res.ok) return [];

        const el = document.querySelector("[data-tapes]");
        if (el) {
            el.innerHTML = res.projects.map(p => `
                <div class="tape-item">
                    <span class="tape-icon">📼</span>
                    <strong>${p.name}</strong>
                    <span class="tape-type">${p.type}</span>
                </div>
            `).join("");
        }

        return res.projects;
    },

    /* ---------------------------------------------
       MULTI-AGENT HUD
       --------------------------------------------- */
    mountHUD() {
        const hud = document.querySelector("[data-hud]");
        if (!hud) return;

        hud.innerHTML = Object.entries(this.agents).map(([name, agent]) => `
            <div class="hud-agent" data-agent="${name}">
                <span class="agent-name">${name.toUpperCase()}</span>
                <span class="agent-status" style="color: ${agent.color}">●</span>
            </div>
        `).join("");
    },

    updateAgentStatus(agent, status) {
        this.agents[agent].status = status;
        const el = document.querySelector(`[data-agent="${agent}"] .agent-status`);
        if (el) {
            el.style.opacity = status === 'active' ? '1' : '0.3';
        }
    },

    /* ---------------------------------------------
       BASHER TERMINAL (Ghost Shell Style)
       --------------------------------------------- */
    mountBasher() {
        const b = document.querySelector("[data-basher]");
        if (!b) return;

        b.innerHTML = `
            <div class="basher-window">
                <div class="basher-header">
                    <span>ASXR BASHER v3.0</span>
                    <span class="basher-status">●</span>
                </div>
                <div class="basher-log" id="basher-log"></div>
                <div class="basher-input-line">
                    <span class="basher-prompt">$</span>
                    <input id="basher-input" placeholder="Enter command..." />
                </div>
            </div>
        `;

        const input = document.getElementById("basher-input");
        const log = document.getElementById("basher-log");

        input.addEventListener("keydown", async (e) => {
            if (e.key !== "Enter") return;

            const cmd = e.target.value.trim();
            if (!cmd) return;

            // Add command to log
            this.basherLog(`> ${cmd}`, 'command');

            // Execute command
            try {
                const result = await this.executeBasherCommand(cmd);
                this.basherLog(result, 'output');
            } catch (err) {
                this.basherLog(`Error: ${err}`, 'error');
            }

            e.target.value = "";
        });
    },

    basherLog(msg, type = 'info') {
        const log = document.getElementById('basher-log');
        if (!log) return;

        const line = document.createElement('div');
        line.className = `basher-line basher-${type}`;
        line.textContent = msg;
        log.appendChild(line);
        log.scrollTop = log.scrollHeight;
    },

    async executeBasherCommand(cmd) {
        const parts = cmd.split(' ');
        const [command, ...args] = parts;

        switch (command) {
            case 'help':
                return 'Commands: help, status, ram, db, clear, studio, health';

            case 'status':
                const health = await this.checkHealth();
                return JSON.stringify(health, null, 2);

            case 'ram':
                if (args[0] === 'get' && args[1]) {
                    const res = await this.ramGet(args[1]);
                    return JSON.stringify(res, null, 2);
                }
                if (args[0] === 'set' && args[1] && args[2]) {
                    const res = await this.ramSet(args[1], args[2]);
                    return JSON.stringify(res, null, 2);
                }
                return 'Usage: ram get <key> | ram set <key> <value>';

            case 'db':
                if (args[0] === 'query' && args[1]) {
                    const res = await this.dbQuery(args[1]);
                    return JSON.stringify(res, null, 2);
                }
                return 'Usage: db query <scope>';

            case 'clear':
                document.getElementById('basher-log').innerHTML = '';
                return '';

            case 'studio':
                const tapes = await this.loadTapes();
                return `Found ${tapes.length} studios`;

            case 'health':
                return await this.checkHealth().then(h => JSON.stringify(h, null, 2));

            default:
                return `Unknown command: ${command}. Type 'help' for commands.`;
        }
    },

    /* ---------------------------------------------
       XJSON JOB EXECUTION
       --------------------------------------------- */
    async runXJSONJob(job, input = {}) {
        return await this.call('/api/xjson/run-job', { job, input });
    },

    /* ---------------------------------------------
       STUDIO OPERATIONS
       --------------------------------------------- */
    async createStudio(name, description, type) {
        return await this.call('/api/studio/create', { name, description, type });
    },

    async importGithub(repoUrl, projectName = null) {
        return await this.call('/api/studio/import-github', {
            repo_url: repoUrl,
            project_name: projectName
        });
    }
};

/* ---------------------------------------------
   AUTO-INITIALIZE ON DOM READY
   --------------------------------------------- */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.ASX.init());
} else {
    window.ASX.init();
}
