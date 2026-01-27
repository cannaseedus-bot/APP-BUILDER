// adapters/kuhul-llama-runtime.js
import { LLama } from "node-llama-cpp";

export class KuhulLLamaRuntime extends ModelRuntime {
  async load() {
    this.model = await LLama.loadModel(this.config.modelPath);
    this.ctx = await this.model.createContext();
  }
  async infer(prompt) {
    return await this.ctx.complete(prompt, { temperature: 0.7 });
  }
}
