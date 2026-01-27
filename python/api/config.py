"""
Configuration loader for ASX Runtime
Loads from .env and config.yaml
"""
import os
from pathlib import Path
from typing import Any, Dict, Optional
from dataclasses import dataclass, field

try:
    import yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False

try:
    from dotenv import load_dotenv
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False


# Find project root
def find_project_root() -> Path:
    """Find the project root directory"""
    current = Path(__file__).resolve().parent
    while current != current.parent:
        if (current / "config.yaml").exists() or (current / ".env").exists():
            return current
        current = current.parent
    return Path.cwd()


PROJECT_ROOT = find_project_root()


@dataclass
class OllamaConfig:
    """Ollama provider configuration"""
    host: str = "http://localhost:11434"
    model: str = "llama3.2"
    api_key: Optional[str] = None
    use_cloud: bool = False
    cloud_host: str = "https://ollama.com"
    cloud_model: str = "gpt-oss:120b"


@dataclass
class ProviderConfig:
    """Generic provider configuration"""
    enabled: bool = False
    host: str = ""
    api_key: Optional[str] = None
    default_model: str = ""


@dataclass
class RouteConfig:
    """Model route configuration"""
    provider: str = "ollama"
    model: str = "llama3.2"
    fallback: list = field(default_factory=list)


@dataclass
class ServerConfig:
    """Server configuration"""
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 4
    cors_origins: str = "*"
    rate_limit: int = 60
    debug: bool = False


@dataclass
class Config:
    """Main configuration container"""
    ollama: OllamaConfig = field(default_factory=OllamaConfig)
    providers: Dict[str, ProviderConfig] = field(default_factory=dict)
    routes: Dict[str, RouteConfig] = field(default_factory=dict)
    server: ServerConfig = field(default_factory=ServerConfig)

    @classmethod
    def load(cls) -> "Config":
        """Load configuration from .env and config.yaml"""
        # Load .env file
        if DOTENV_AVAILABLE:
            env_file = PROJECT_ROOT / ".env"
            if env_file.exists():
                load_dotenv(env_file)

        # Load config.yaml
        config_data = {}
        if YAML_AVAILABLE:
            config_file = PROJECT_ROOT / "config.yaml"
            if config_file.exists():
                with open(config_file) as f:
                    config_data = yaml.safe_load(f) or {}

        return cls._from_dict(config_data)

    @classmethod
    def _from_dict(cls, data: Dict[str, Any]) -> "Config":
        """Create config from dictionary"""
        config = cls()

        # Load Ollama config
        ollama_data = data.get("providers", {}).get("ollama", {})
        local_data = ollama_data.get("local", {})
        cloud_data = ollama_data.get("cloud", {})

        config.ollama = OllamaConfig(
            host=cls._expand_env(local_data.get("host", os.environ.get("OLLAMA_HOST", "http://localhost:11434"))),
            model=cls._expand_env(local_data.get("default_model", os.environ.get("OLLAMA_MODEL", "llama3.2"))),
            api_key=os.environ.get("OLLAMA_API_KEY"),
            use_cloud=os.environ.get("OLLAMA_USE_CLOUD", "").lower() == "true",
            cloud_host=cloud_data.get("host", "https://ollama.com"),
            cloud_model=cls._expand_env(cloud_data.get("default_model", os.environ.get("OLLAMA_CLOUD_MODEL", "gpt-oss:120b"))),
        )

        # Load other providers
        for name, pdata in data.get("providers", {}).items():
            if name == "ollama":
                continue
            config.providers[name] = ProviderConfig(
                enabled=pdata.get("enabled", False),
                host=cls._expand_env(pdata.get("host", "")),
                api_key=os.environ.get(f"{name.upper()}_API_KEY"),
                default_model=pdata.get("default_model", ""),
            )

        # Load routes
        for name, rdata in data.get("routes", {}).items():
            config.routes[name] = RouteConfig(
                provider=rdata.get("provider", "ollama"),
                model=rdata.get("model", "llama3.2"),
                fallback=rdata.get("fallback", []),
            )

        # Load server config
        server_data = data.get("server", {})
        config.server = ServerConfig(
            host=cls._expand_env(server_data.get("host", os.environ.get("API_HOST", "0.0.0.0"))),
            port=int(os.environ.get("API_PORT", server_data.get("port", 8000))),
            workers=server_data.get("workers", 4),
            cors_origins=os.environ.get("CORS_ORIGINS", server_data.get("cors", {}).get("origins", "*")),
            rate_limit=int(os.environ.get("RATE_LIMIT", 60)),
            debug=os.environ.get("DEBUG", "").lower() == "true",
        )

        return config

    @staticmethod
    def _expand_env(value: Any) -> Any:
        """Expand environment variable references in strings"""
        if not isinstance(value, str):
            return value

        # Handle ${VAR:-default} syntax
        import re
        pattern = r'\$\{([^}:]+)(?::-([^}]*))?\}'

        def replace(match):
            var_name = match.group(1)
            default = match.group(2) or ""
            return os.environ.get(var_name, default)

        return re.sub(pattern, replace, value)

    def get_provider(self, name: str) -> Optional[ProviderConfig]:
        """Get provider configuration by name"""
        return self.providers.get(name)

    def get_route(self, name: str) -> RouteConfig:
        """Get route configuration by name, with fallback to default"""
        return self.routes.get(name, self.routes.get("default", RouteConfig()))

    def get_model_for_task(self, task: str) -> tuple:
        """Get provider and model for a specific task"""
        route = self.get_route(task)

        if route.provider == "ollama":
            if self.ollama.use_cloud:
                return "ollama", self.ollama.cloud_model
            return "ollama", route.model or self.ollama.model

        provider = self.get_provider(route.provider)
        if provider and provider.enabled:
            return route.provider, route.model or provider.default_model

        # Fallback to Ollama
        return "ollama", self.ollama.model


# Global config instance
_config: Optional[Config] = None


def get_config() -> Config:
    """Get the global configuration instance"""
    global _config
    if _config is None:
        _config = Config.load()
    return _config


def reload_config() -> Config:
    """Reload configuration from files"""
    global _config
    _config = Config.load()
    return _config
