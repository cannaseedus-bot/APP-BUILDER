import { ClineJavaRuntime } from "./adapters/cline-java-runtime.js";
import { JanusRuntime } from "./adapters/janus-runtime.js";
import { LlamaRuntime } from "./adapters/llama-runtime.js";
import { KuhulRuntime } from "./adapters/kuhul-runtime.js";
import { QwenRuntime } from "./adapters/qwen-runtime.js";
import { OllamaRuntime } from "./adapters/ollama-runtime.js";

export class LEGION_FUSION {
    constructor(config) {
        this.models = {
            cline: new ClineJavaRuntime(config.cline),
            janus: new JanusRuntime(config.janus),
            llama: new LlamaRuntime(config.llama),
            kuhul: new KuhulRuntime(config.kuhul),
            qwen: new QwenRuntime(config.qwen),
            ollama: new OllamaRuntime(config.ollama)
        };
    }

    async load() {
        for (const key in this.models) {
            await this.models[key].load();
        }
    }

    async run(prompt) {
        const outputs = {};

        for (const k in this.models) {
            try {
                outputs[k] = await this.models[k].infer(prompt);
            } catch (e) {
                outputs[k] = "[error or offline]";
            }
        }

        return this.consensus(outputs);
    }

    consensus(outputs) {
        // We can plug SCXQ2 + FusionMath here later
        return Object.values(outputs)
            .filter(s => typeof s === "string" && s.length > 0)
            .sort((a,b)=>a.length-b.length)[0];
    }
}
