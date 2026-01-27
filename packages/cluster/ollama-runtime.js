/**
 * Ollama Runtime for ASX Cluster
 * Supports local Ollama and Ollama Cloud API
 */

class OllamaClient {
  constructor(options = {}) {
    this.host = options.host || process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.apiKey = options.apiKey || process.env.OLLAMA_API_KEY;
    this.defaultModel = options.model || 'llama3.2';
    this.useCloud = options.useCloud || false;

    if (this.useCloud && this.apiKey) {
      this.host = 'https://ollama.com';
    }
  }

  static local(host = 'http://localhost:11434') {
    return new OllamaClient({ host, useCloud: false });
  }

  static cloud(apiKey) {
    const key = apiKey || process.env.OLLAMA_API_KEY;
    if (!key) {
      throw new Error('API key required for cloud access. Set OLLAMA_API_KEY or pass apiKey parameter.');
    }
    return new OllamaClient({
      host: 'https://ollama.com',
      apiKey: key,
      useCloud: true,
      model: 'gpt-oss:120b'
    });
  }

  _getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      headers['Authorization'] = 'Bearer ' + this.apiKey;
    }
    return headers;
  }

  async chat(message, options = {}) {
    const model = options.model || this.defaultModel;
    const messages = [];

    if (options.system) {
      messages.push({ role: 'system', content: options.system });
    }
    if (options.history) {
      messages.push(...options.history);
    }
    messages.push({ role: 'user', content: message });

    const response = await fetch(this.host + '/api/chat', {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify({ model, messages, stream: false })
    });

    if (!response.ok) {
      throw new Error('Ollama API error: ' + response.status);
    }

    const data = await response.json();
    return data.message?.content || '';
  }

  async *chatStream(message, options = {}) {
    const model = options.model || this.defaultModel;
    const messages = [];

    if (options.system) {
      messages.push({ role: 'system', content: options.system });
    }
    if (options.history) {
      messages.push(...options.history);
    }
    messages.push({ role: 'user', content: message });

    const response = await fetch(this.host + '/api/chat', {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify({ model, messages, stream: true })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.message?.content) {
            yield data.message.content;
          }
        } catch (e) {}
      }
    }
  }

  async generate(prompt, options = {}) {
    const model = options.model || this.defaultModel;

    const response = await fetch(this.host + '/api/generate', {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify({ model, prompt, system: options.system, stream: false })
    });

    const data = await response.json();
    return data.response || '';
  }

  async listModels() {
    const response = await fetch(this.host + '/api/tags', {
      headers: this._getHeaders()
    });
    const data = await response.json();
    return data.models || [];
  }

  async pull(model) {
    const response = await fetch(this.host + '/api/pull', {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify({ name: model })
    });
    return response.json();
  }

  async embeddings(text, model = 'nomic-embed-text') {
    const response = await fetch(this.host + '/api/embeddings', {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify({ model, prompt: text })
    });
    const data = await response.json();
    return data.embedding || [];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OllamaClient };
}
if (typeof window !== 'undefined') {
  window.OllamaClient = OllamaClient;
}
