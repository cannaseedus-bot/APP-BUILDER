// adapters/janus-runtime.js

export class JanusRuntime {
    constructor(config = {}) {
        this.port = config.port || 7001;
    }

    async load() {
        // Assume user launched Janus with:
        // python inference.py --port 7001
        console.log("JANUS runtime assuming external process running.");
    }

    async infer(prompt) {
        const res = await fetch(`http://localhost:${this.port}/janus`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });
        const json = await res.json();
        return json.result;
    }
}
