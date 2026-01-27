"""
ASX Runtime API Server
Powered by Ollama (local and cloud)
"""
import os
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

try:
    from ollama import Client, AsyncClient
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    Client = None
    AsyncClient = None


# Configuration
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_API_KEY = os.environ.get("OLLAMA_API_KEY")
USE_CLOUD = os.environ.get("OLLAMA_USE_CLOUD", "").lower() == "true"
DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")

# Cloud configuration
if USE_CLOUD and OLLAMA_API_KEY:
    OLLAMA_HOST = "https://ollama.com"
    DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "gpt-oss:120b")


# Request/Response models
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: Optional[str] = None
    messages: List[ChatMessage]
    stream: bool = False
    system: Optional[str] = None


class ChatResponse(BaseModel):
    model: str
    message: ChatMessage
    done: bool = True


class GenerateRequest(BaseModel):
    model: Optional[str] = None
    prompt: str
    system: Optional[str] = None
    stream: bool = False


class GenerateResponse(BaseModel):
    model: str
    response: str
    done: bool = True


class EmbeddingRequest(BaseModel):
    model: str = "nomic-embed-text"
    prompt: str


class EmbeddingResponse(BaseModel):
    embedding: List[float]


class ModelInfo(BaseModel):
    name: str
    size: Optional[int] = None
    modified_at: Optional[str] = None


class ModelsResponse(BaseModel):
    models: List[ModelInfo]


# Global client
ollama_client = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize Ollama client on startup"""
    global ollama_client

    if OLLAMA_AVAILABLE:
        headers = {}
        if OLLAMA_API_KEY:
            headers["Authorization"] = f"Bearer {OLLAMA_API_KEY}"

        ollama_client = Client(
            host=OLLAMA_HOST,
            headers=headers if headers else None
        )
        print(f"Ollama client initialized: {OLLAMA_HOST}")
        print(f"Default model: {DEFAULT_MODEL}")
        print(f"Cloud mode: {USE_CLOUD}")
    else:
        print("WARNING: ollama package not installed. Run: pip install ollama")

    yield

    # Cleanup
    ollama_client = None


# Create FastAPI app
app = FastAPI(
    title="ASX Runtime API",
    description="AI-powered API using Ollama (local and cloud)",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def check_ollama():
    """Check if Ollama is available"""
    if not OLLAMA_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Ollama not installed. Run: pip install ollama"
        )
    if ollama_client is None:
        raise HTTPException(
            status_code=503,
            detail="Ollama client not initialized"
        )


@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "name": "ASX Runtime API",
        "version": "2.0.0",
        "ollama_available": OLLAMA_AVAILABLE,
        "ollama_host": OLLAMA_HOST,
        "default_model": DEFAULT_MODEL,
        "cloud_mode": USE_CLOUD
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "ollama": OLLAMA_AVAILABLE}


@app.get("/api/tags", response_model=ModelsResponse)
async def list_models():
    """List available models"""
    check_ollama()

    try:
        response = ollama_client.list()
        models = [
            ModelInfo(
                name=m.get("name", ""),
                size=m.get("size"),
                modified_at=m.get("modified_at")
            )
            for m in response.get("models", [])
        ]
        return ModelsResponse(models=models)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with a model"""
    check_ollama()

    model = request.model or DEFAULT_MODEL
    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    if request.system:
        messages.insert(0, {"role": "system", "content": request.system})

    if request.stream:
        async def generate():
            for part in ollama_client.chat(model=model, messages=messages, stream=True):
                content = part.get("message", {}).get("content", "")
                yield f"data: {content}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")

    try:
        response = ollama_client.chat(model=model, messages=messages, stream=False)
        return ChatResponse(
            model=model,
            message=ChatMessage(
                role="assistant",
                content=response.get("message", {}).get("content", "")
            )
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    """Generate a completion"""
    check_ollama()

    model = request.model or DEFAULT_MODEL

    if request.stream:
        async def stream_generate():
            for part in ollama_client.generate(
                model=model,
                prompt=request.prompt,
                system=request.system,
                stream=True
            ):
                yield f"data: {part.get('response', '')}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(stream_generate(), media_type="text/event-stream")

    try:
        response = ollama_client.generate(
            model=model,
            prompt=request.prompt,
            system=request.system,
            stream=False
        )
        return GenerateResponse(
            model=model,
            response=response.get("response", "")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/embeddings", response_model=EmbeddingResponse)
async def embeddings(request: EmbeddingRequest):
    """Generate embeddings"""
    check_ollama()

    try:
        response = ollama_client.embeddings(
            model=request.model,
            prompt=request.prompt
        )
        return EmbeddingResponse(embedding=response.get("embedding", []))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pull")
async def pull_model(model: str):
    """Pull a model from the registry"""
    check_ollama()

    try:
        ollama_client.pull(model)
        return {"status": "success", "model": model}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Legacy endpoints for backward compatibility
@app.post("/v1/chat/completions")
async def openai_compatible_chat(request: Dict[str, Any]):
    """OpenAI-compatible chat endpoint"""
    check_ollama()

    model = request.get("model", DEFAULT_MODEL)
    messages = request.get("messages", [])
    stream = request.get("stream", False)

    if stream:
        async def stream_response():
            for part in ollama_client.chat(model=model, messages=messages, stream=True):
                content = part.get("message", {}).get("content", "")
                chunk = {
                    "id": "chatcmpl-asx",
                    "object": "chat.completion.chunk",
                    "model": model,
                    "choices": [{
                        "index": 0,
                        "delta": {"content": content},
                        "finish_reason": None
                    }]
                }
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(stream_response(), media_type="text/event-stream")

    try:
        response = ollama_client.chat(model=model, messages=messages, stream=False)
        return {
            "id": "chatcmpl-asx",
            "object": "chat.completion",
            "model": model,
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": response.get("message", {}).get("content", "")
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
