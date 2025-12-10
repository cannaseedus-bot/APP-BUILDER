// adapters/cline-java-runtime.js

import { spawn } from "child_process";

export class ClineJavaRuntime {
    constructor(config = {}) {
        this.config = {
            jarPath: config.jarPath || "./cline-jars",
            port: config.port || 8088
        };

        this.proc = null;
    }

    async load() {
        return new Promise((resolve, reject) => {
            this.proc = spawn("java", [
                "-classpath",
                `${this.config.jarPath}/*`,
                "Main",
                this.config.port
            ]);

            this.proc.stdout.on("data", d => {
                const out = d.toString();
                console.log("[CLINE-JAVA]", out);
                if (out.includes("Cline Java API Ready")) resolve(true);
            });

            this.proc.stderr.on("data", d => console.error("[CLINE ERR]", d.toString()));
        });
    }

    async infer(prompt) {
        const res = await fetch(`http://localhost:${this.config.port}/v1/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });
        const json = await res.json();
        return json.response;
    }

    shutdown() {
        if (this.proc) this.proc.kill();
    }
}
