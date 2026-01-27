import llama from "node-llama-cpp";

export class LlamaRuntime {
    constructor(cfg) {
        this.modelPath = cfg.modelPath;
        this.temp = cfg.temp || 0.8;
    }

    async load() {
        this.model = await llama.loadModel({ modelPath: this.modelPath });
        this.ctx = await this.model.createContext({});
    }

    async infer(prompt) {
        return await this.ctx.complete(prompt, { temperature: this.temp });
    }
}
