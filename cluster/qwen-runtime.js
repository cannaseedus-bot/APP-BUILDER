// adapters/qwen-runtime.js
import { AutoTokenizer, AutoModelForCausalLM } from "@xenova/transformers";

export class QwenRuntime extends ModelRuntime {
  async load() {
    this.tokenizer = await AutoTokenizer.from_pretrained(this.config.repo);
    this.model = await AutoModelForCausalLM.from_pretrained(this.config.repo);
  }
  async infer(prompt) {
    const tokens = this.tokenizer.encode(prompt);
    const out = await this.model.generate(tokens, this.config.options);
    return this.tokenizer.decode(out);
  }
}
