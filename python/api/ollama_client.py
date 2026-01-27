"""
Ollama Client for ASX Runtime
Supports both local Ollama and Ollama Cloud API
"""
import os
from typing import Generator, Optional, Dict, Any, List
from dataclasses import dataclass

try:
    from ollama import Client
except ImportError:
    Client = None


@dataclass
class OllamaConfig:
    """Configuration for Ollama client"""
    host: str = "http://localhost:11434"
    api_key: Optional[str] = None
    use_cloud: bool = False
    default_model: str = "llama3.2"

    @classmethod
    def from_env(cls) -> "OllamaConfig":
        """Create config from environment variables"""
        api_key = os.environ.get("OLLAMA_API_KEY")
        use_cloud = api_key is not None and os.environ.get("OLLAMA_USE_CLOUD", "").lower() == "true"

        return cls(
            host="https://ollama.com" if use_cloud else os.environ.get("OLLAMA_HOST", "http://localhost:11434"),
            api_key=api_key,
            use_cloud=use_cloud,
            default_model=os.environ.get("OLLAMA_MODEL", "llama3.2")
        )


class OllamaClient:
    """
    Unified Ollama client supporting local and cloud models.

    Usage:
        # Local usage
        client = OllamaClient()
        response = client.chat("Why is the sky blue?")

        # Cloud usage
        client = OllamaClient.cloud(api_key="your_key")
        response = client.chat("Why is the sky blue?", model="gpt-oss:120b")

        # Streaming
        for chunk in client.chat_stream("Tell me a story"):
            print(chunk, end="", flush=True)
    """

    def __init__(self, config: Optional[OllamaConfig] = None):
        if Client is None:
            raise ImportError("ollama package not installed. Run: pip install ollama")

        self.config = config or OllamaConfig.from_env()

        headers = {}
        if self.config.api_key:
            headers["Authorization"] = f"Bearer {self.config.api_key}"

        self.client = Client(
            host=self.config.host,
            headers=headers if headers else None
        )

    @classmethod
    def local(cls, host: str = "http://localhost:11434") -> "OllamaClient":
        """Create a client for local Ollama instance"""
        config = OllamaConfig(host=host, use_cloud=False)
        return cls(config)

    @classmethod
    def cloud(cls, api_key: Optional[str] = None) -> "OllamaClient":
        """Create a client for Ollama Cloud API"""
        api_key = api_key or os.environ.get("OLLAMA_API_KEY")
        if not api_key:
            raise ValueError("API key required for cloud access. Set OLLAMA_API_KEY or pass api_key parameter.")

        config = OllamaConfig(
            host="https://ollama.com",
            api_key=api_key,
            use_cloud=True,
            default_model="gpt-oss:120b"
        )
        return cls(config)

    def chat(
        self,
        message: str,
        model: Optional[str] = None,
        system: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Send a chat message and get a response.

        Args:
            message: The user message
            model: Model to use (defaults to config default)
            system: Optional system prompt
            history: Optional conversation history

        Returns:
            The assistant's response text
        """
        model = model or self.config.default_model
        messages = []

        if system:
            messages.append({"role": "system", "content": system})

        if history:
            messages.extend(history)

        messages.append({"role": "user", "content": message})

        response = self.client.chat(model=model, messages=messages, stream=False)
        return response["message"]["content"]

    def chat_stream(
        self,
        message: str,
        model: Optional[str] = None,
        system: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Generator[str, None, None]:
        """
        Send a chat message and stream the response.

        Args:
            message: The user message
            model: Model to use (defaults to config default)
            system: Optional system prompt
            history: Optional conversation history

        Yields:
            Response text chunks
        """
        model = model or self.config.default_model
        messages = []

        if system:
            messages.append({"role": "system", "content": system})

        if history:
            messages.extend(history)

        messages.append({"role": "user", "content": message})

        for part in self.client.chat(model=model, messages=messages, stream=True):
            yield part["message"]["content"]

    def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system: Optional[str] = None
    ) -> str:
        """
        Generate a completion for a prompt.

        Args:
            prompt: The prompt text
            model: Model to use
            system: Optional system prompt

        Returns:
            Generated text
        """
        model = model or self.config.default_model
        response = self.client.generate(
            model=model,
            prompt=prompt,
            system=system,
            stream=False
        )
        return response["response"]

    def generate_stream(
        self,
        prompt: str,
        model: Optional[str] = None,
        system: Optional[str] = None
    ) -> Generator[str, None, None]:
        """
        Generate a streaming completion for a prompt.

        Args:
            prompt: The prompt text
            model: Model to use
            system: Optional system prompt

        Yields:
            Generated text chunks
        """
        model = model or self.config.default_model
        for part in self.client.generate(
            model=model,
            prompt=prompt,
            system=system,
            stream=True
        ):
            yield part["response"]

    def list_models(self) -> List[Dict[str, Any]]:
        """List available models"""
        response = self.client.list()
        return response.get("models", [])

    def pull(self, model: str) -> None:
        """Pull a model from the registry"""
        self.client.pull(model)

    def embeddings(self, text: str, model: str = "nomic-embed-text") -> List[float]:
        """
        Generate embeddings for text.

        Args:
            text: Text to embed
            model: Embedding model to use

        Returns:
            Embedding vector
        """
        response = self.client.embeddings(model=model, prompt=text)
        return response["embedding"]


# Convenience functions for quick usage
def chat(message: str, model: str = "llama3.2", stream: bool = False):
    """Quick chat function using default local client"""
    client = OllamaClient.local()
    if stream:
        return client.chat_stream(message, model=model)
    return client.chat(message, model=model)


def cloud_chat(message: str, model: str = "gpt-oss:120b", stream: bool = False):
    """Quick chat function using cloud API"""
    client = OllamaClient.cloud()
    if stream:
        return client.chat_stream(message, model=model)
    return client.chat(message, model=model)
