// adapters/cline-runtime.js
import { invoke } from "../cline-main/core/invokeLLM.js";

export class ClineRuntime extends ModelRuntime {
  async infer(prompt) {
    return await invoke(prompt, this.config.provider);
  }
}
