 import ollama from ollama;

export class OllamaRuntime extends ModelRuntime {
  async infer(prompt) {
    const response = await ollama.generate({
      model this.config.modelName,
      prompt,
    });
    return response.response;
  }
}
