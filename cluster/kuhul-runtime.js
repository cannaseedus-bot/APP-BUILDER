export class KuhulRuntime extends LlamaRuntime {
    async infer(prompt) {
        return await super.infer("⟁K'UHUL⟁: " + prompt);
    }
}
