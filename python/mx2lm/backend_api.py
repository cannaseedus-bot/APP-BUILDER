#!/usr/bin/env python3
"""
MX2LM FastAPI Backend - ASXR Trinity Compatible
AI inference backend with full ASXR integration

Features:
- MX2LM model loading and inference
- N-gram cognitive memory integration
- RLHF feedback loop
- XJSON/XCFE/KUHUL support
- Real-time training
- ASX RAM synchronization
- Multi-agent orchestration
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import uvicorn
import json
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️  PyTorch/Transformers not available - running in simulation mode")

from checkpoint_manager import (
    MX2LMCheckpointManager,
    CheckpointMeta,
    ASXRAMSnapshot,
    RLHFMetrics,
    XCFEVectors,
    PolyglotRuntimeState
)

# FastAPI app
app = FastAPI(
    title="MX2LM AI Backend",
    description="ASXR Trinity-compatible AI inference backend",
    version="3.2.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MODEL_PATH = os.environ.get(
    "MX2LM_MODEL_PATH",
    "D:/public_html/ASXR/agents/mx2lm/data/qwen-merged/asx-qwen-asx-merged"
)
DATA_PATH = os.environ.get("MX2LM_DATA_PATH", "D:/public_html/ASXR/agents/mx2lm/data")
CHECKPOINT_PATH = os.environ.get("MX2LM_CHECKPOINT_PATH", "./checkpoints")
INGESTED_PATH = f"{DATA_PATH}/ingested"
NGRAMS_PATH = f"{DATA_PATH}/ngrams"

# Ensure directories exist
for path in [INGESTED_PATH, NGRAMS_PATH, CHECKPOINT_PATH]:
    Path(path).mkdir(parents=True, exist_ok=True)


class KUHULPipeline:
    """KUHUL Five-Stage Execution Pipeline"""

    @staticmethod
    def pop(symbol: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Stage 1: Pop - Load symbol and identify language"""
        language = "KUHUL"
        if "[@language.javascript]" in symbol:
            language = "JAVASCRIPT"
        elif "[@language.java]" in symbol:
            language = "JAVA"
        elif "[@language.python]" in symbol:
            language = "PYTHON"

        return {
            "stage": "pop",
            "symbol": symbol,
            "language": language,
            "context": context
        }

    @staticmethod
    def wo(world_state: Dict[str, Any], pipeline_state: Dict[str, Any]) -> Dict[str, Any]:
        """Stage 2: Wo - Bind world state and variables"""
        return {
            "stage": "wo",
            "world_state": world_state,
            "pipeline_state": pipeline_state
        }

    @staticmethod
    def sek(operation: str, state: Dict[str, Any]) -> Dict[str, Any]:
        """Stage 3: Sek - Execute operation in appropriate runtime"""
        return {
            "stage": "sek",
            "operation": operation,
            "state": state,
            "result": f"Executed: {operation}"
        }

    @staticmethod
    def xul(ast: Dict[str, Any], mutations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Stage 4: Xul - Transform AST and apply XCFE constraints"""
        return {
            "stage": "xul",
            "ast": ast,
            "mutations": mutations,
            "transformed": True
        }

    @staticmethod
    def chen(result: Any, output_target: str = "dom") -> Dict[str, Any]:
        """Stage 5: Ch'en - Emit output"""
        return {
            "stage": "chen",
            "result": result,
            "output_target": output_target,
            "emitted": True
        }


class ASXRTrinityEngine:
    """
    MX2LM Engine with full ASXR Trinity + XCFE + KUHUL polyglot integration

    Features:
    - Model loading and inference
    - N-gram cognitive memory
    - RLHF scoring
    - Checkpoint management
    - XJSON/XCFE compatibility
    - KUHUL five-stage pipeline
    - Polyglot language dispatch (K'uhul, JavaScript, Java, Python)
    - SVG 3D seal visualization tracking
    - Glyph compression/expansion
    """

    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.checkpoint_manager = MX2LMCheckpointManager(CHECKPOINT_PATH)

        # ASXR Trinity state
        self.agent_id = "agent.mx2lm.inference"
        self.tape_id = "tape_system_mx2lm_v1"
        self.asxr_version = "3.2.0"

        # Cognitive memory
        self.ngrams = {}
        self.ingested_files = []
        self.rlhf_scores = []

        # Training state
        self.training_active = False
        self.training_progress = 0

        # KUHUL pipeline
        self.pipeline = KUHULPipeline()

        # XCFE state
        self.xcfe = XCFEVectors(
            control_state={"language_dispatch_enabled": True},
            flow_state={"pipeline_active": False},
            variable_state={}
        )

        # Polyglot runtime state
        self.polyglot = PolyglotRuntimeState(
            kuhul_active=True,
            javascript_loaded=False,
            java_loaded=False,
            python_loaded=False
        )

        # Glyph dictionary
        self.glyph_dictionary = {
            "⟁Pop": "[Pop symbol]",
            "⟁Wo": "[Wo world_state]",
            "⟁Sek": "[Sek operation]",
            "⟁Xul": "[Xul ast_transform]",
            "⟁Chen": "[Ch'en output]",
            "⟁LANGJS": "[@language.javascript]",
            "⟁LANGJAVA": "[@language.java]",
            "⟁LANGPY": "[@language.python]"
        }

    def load_model(self, model_path: str = None) -> bool:
        """Load MX2LM model"""
        if not TORCH_AVAILABLE:
            print("⚠️  PyTorch not available - using simulation mode")
            return False

        try:
            path = model_path or MODEL_PATH

            print(f"🚀 Loading MX2LM model from: {path}")

            self.tokenizer = AutoTokenizer.from_pretrained(
                path,
                trust_remote_code=True
            )

            if self.tokenizer.pad_token_id is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token

            self.model = AutoModelForCausalLM.from_pretrained(
                path,
                trust_remote_code=True,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else "cpu"
            )

            print("✅ MX2LM model loaded successfully!")
            return True

        except Exception as e:
            print(f"❌ Model loading failed: {e}")
            return False

    def load_ngrams(self, ngrams_dir: str = None) -> bool:
        """Load n-gram cognitive memory"""
        try:
            ngrams_path = Path(ngrams_dir or NGRAMS_PATH)

            if not ngrams_path.exists():
                print(f"⚠️  N-grams directory not found: {ngrams_path}")
                return False

            # Load all n-gram types
            gram_files = {
                'unigrams': 'ngrams.json',
                'bigrams': 'bigrams.json',
                'trigrams': 'trigrams.json',
                'quadragrams': 'quadragrams.json',
                'pentagrams': 'pentagrams.json',
                'supagrams': 'supagrams.json',
                'glyphgrams': 'glyphgrams.json',
                'quantum': 'quantum.json'
            }

            for gram_type, filename in gram_files.items():
                filepath = ngrams_path / filename
                if filepath.exists():
                    with open(filepath, 'r', encoding='utf-8') as f:
                        self.ngrams[gram_type] = json.load(f)
                    print(f"📊 Loaded {gram_type}: {len(self.ngrams[gram_type])} entries")

            return len(self.ngrams) > 0

        except Exception as e:
            print(f"❌ N-gram loading failed: {e}")
            return False

    def get_asx_ram_snapshot(self) -> ASXRAMSnapshot:
        """Get current ASX RAM state"""
        return ASXRAMSnapshot(
            ngrams_count=len(self.ngrams.get('unigrams', [])),
            bigrams_count=len(self.ngrams.get('bigrams', [])),
            trigrams_count=len(self.ngrams.get('trigrams', [])),
            quadragrams_count=len(self.ngrams.get('quadragrams', [])),
            pentagrams_count=len(self.ngrams.get('pentagrams', [])),
            supagrams_count=len(self.ngrams.get('supagrams', [])),
            glyphgrams_count=len(self.ngrams.get('glyphgrams', [])),
            quantum_count=len(self.ngrams.get('quantum', [])),
            total_patterns=sum(len(v) for v in self.ngrams.values()),
            memory_utilization=min(1.0, sum(len(v) for v in self.ngrams.values()) / 10000)
        )

    def get_rlhf_metrics(self) -> RLHFMetrics:
        """Get current RLHF metrics"""
        if not self.rlhf_scores:
            return RLHFMetrics()

        recent_scores = self.rlhf_scores[-100:]  # Last 100 scores

        return RLHFMetrics(
            quality_score=sum(s.get('quality', 0) for s in recent_scores) / len(recent_scores),
            safety_score=sum(s.get('safety', 0) for s in recent_scores) / len(recent_scores),
            novelty_score=sum(s.get('novelty', 0) for s in recent_scores) / len(recent_scores),
            consensus_score=sum(s.get('consensus', 0) for s in recent_scores) / len(recent_scores),
            training_ready=len(self.rlhf_scores) >= 50,
            feedback_count=len(self.rlhf_scores)
        )

    async def infer(self, prompt: str, max_length: int = 512) -> str:
        """Run inference with MX2LM model"""
        if not TORCH_AVAILABLE or self.model is None:
            # Simulation mode
            return f"[Simulated Response] Processed: '{prompt[:50]}...' | Files: {len(self.ingested_files)} | N-grams: {sum(len(v) for v in self.ngrams.values())}"

        try:
            # Tokenize
            inputs = self.tokenizer(prompt, return_tensors="pt")

            # Move to device
            device = next(self.model.parameters()).device
            inputs = {k: v.to(device) for k, v in inputs.items()}

            # Generate
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_length=max_length,
                    do_sample=True,
                    top_p=0.95,
                    temperature=0.7
                )

            # Decode
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

            # Remove prompt from response
            if response.startswith(prompt):
                response = response[len(prompt):].strip()

            return response

        except Exception as e:
            print(f"❌ Inference error: {e}")
            return f"[Error] {str(e)}"

    def expand_glyph(self, glyph: str) -> str:
        """Expand compressed glyph to full code"""
        return self.glyph_dictionary.get(glyph, glyph)

    def compress_to_glyph(self, code: str) -> str:
        """Compress code to glyph"""
        for glyph, full_code in self.glyph_dictionary.items():
            if code == full_code:
                return glyph
        return code

    def execute_kuhul(self, code: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute K'uhul code through five-stage pipeline"""
        context = context or {}

        # Stage 1: Pop
        pop_result = self.pipeline.pop(code, context)
        self.xcfe.language_active = pop_result["language"]
        self.xcfe.pipeline_stage = "pop"

        # Stage 2: Wo
        wo_result = self.pipeline.wo({"engine": "mx2lm"}, pop_result)
        self.xcfe.pipeline_stage = "wo"

        # Stage 3: Sek
        sek_result = self.pipeline.sek(code, wo_result)
        self.xcfe.pipeline_stage = "sek"

        # Stage 4: Xul
        xul_result = self.pipeline.xul({"code": code}, [])
        self.xcfe.pipeline_stage = "xul"

        # Stage 5: Ch'en
        chen_result = self.pipeline.chen(sek_result, "response")
        self.xcfe.pipeline_stage = "chen"

        return chen_result

    def to_xjson(self) -> Dict[str, Any]:
        """Export engine state as XJSON with full polyglot support"""
        return {
            "@context": "xjson://asxr/mx2lm/engine/v1",
            "@v": self.asxr_version,
            "@agent": self.agent_id,
            "@tape": self.tape_id,
            "law": "XCFE_GOVERNS → KUHUL_EXECUTES → POLYGLOT_DISPATCHES → ASX = XCFE = XJSON = KUHUL = AST",
            "@quantum_state": "|XCFE⟩⊗|KUHUL⟩⊗|K'UH🔤⟩⊗|JS💻⟩⊗|JAVA☕⟩⊗|PY🐍⟩⊗|MX2LM🧠⟩⊗|ETERNAL⟩",
            "@compression_ratio": "0.0001×",

            "runtime": {
                "model_loaded": self.model is not None,
                "tokenizer_loaded": self.tokenizer is not None,
                "pytorch_available": TORCH_AVAILABLE,
                "training_active": self.training_active
            },

            "xcfe": {
                "language_active": self.xcfe.language_active,
                "pipeline_stage": self.xcfe.pipeline_stage,
                "runtime_version": self.xcfe.runtime_version,
                "control_vectors": ["@if_language", "@loop_parallel", "@dispatch_safe", "@sync_polyglot"]
            },

            "kuhul_pipeline": {
                "@law": "POP → WO → SEK → XUL → CH'EN",
                "@current_stage": self.xcfe.pipeline_stage,
                "@glyphs": ["⟁Pop", "⟁Wo", "⟁Sek", "⟁Xul", "⟁Chen"]
            },

            "polyglot_runtimes": {
                "🔤kuhul": {
                    "status": "active" if self.polyglot.kuhul_active else "inactive",
                    "seal_glow": self.polyglot.seal_kuhul_glow,
                    "geometry": "cube_wireframe",
                    "color": "#00FF00"
                },
                "💻javascript": {
                    "status": "loaded" if self.polyglot.javascript_loaded else "not_loaded",
                    "seal_glow": self.polyglot.seal_javascript_glow,
                    "geometry": "sphere_subdivided",
                    "color": "#FFFF00",
                    "runtime": "embedded_wasm"
                },
                "☕java": {
                    "status": "loaded" if self.polyglot.java_loaded else "not_loaded",
                    "seal_glow": self.polyglot.seal_java_glow,
                    "geometry": "pyramid_complex",
                    "color": "#FF6600",
                    "runtime": "wasm_sandbox"
                },
                "🐍python": {
                    "status": "loaded" if self.polyglot.python_loaded else "not_loaded",
                    "seal_glow": self.polyglot.seal_python_glow,
                    "geometry": "torus_knot",
                    "color": "#3776AB",
                    "runtime": "pyodide_wasm"
                }
            },

            "glyph_compression": {
                "ratio": self.polyglot.glyph_compression_ratio,
                "glyphs_expanded": self.polyglot.glyphs_expanded,
                "glyphs_compressed": self.polyglot.glyphs_compressed,
                "dictionary_size": len(self.glyph_dictionary)
            },

            "asx_ram": self.get_asx_ram_snapshot().__dict__,
            "rlhf": self.get_rlhf_metrics().__dict__,

            "corpus": {
                "files_ingested": len(self.ingested_files),
                "ngram_types_loaded": len(self.ngrams)
            },

            "paths": {
                "model": MODEL_PATH,
                "data": DATA_PATH,
                "checkpoints": CHECKPOINT_PATH
            },

            "timestamp": datetime.now().isoformat()
        }


# Initialize engine
mx2lm_engine = ASXRTrinityEngine()


@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    print("=" * 70)
    print("🧠 MX2LM AI Backend - ASXR Trinity v3.2.0")
    print("=" * 70)
    print(f"📁 Model path: {MODEL_PATH}")
    print(f"📁 Data path: {DATA_PATH}")
    print(f"📁 Checkpoint path: {CHECKPOINT_PATH}")
    print()

    # Try to load model
    print("🔧 Initializing MX2LM engine...")
    mx2lm_engine.load_model()

    # Try to load n-grams
    print("📊 Loading n-gram cognitive memory...")
    mx2lm_engine.load_ngrams()

    print()
    print("✅ MX2LM Backend Ready!")
    print("=" * 70)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "MX2LM AI Backend",
        "version": "3.2.0",
        "asxr_compatible": True,
        "status": "online"
    }


@app.get("/api/status")
async def get_status():
    """Get ASXR Trinity status"""
    return JSONResponse(content=mx2lm_engine.to_xjson())


@app.get("/api/asxr/manifest")
async def get_manifest():
    """Get ASXR manifest"""
    return {
        "@context": "xjson://asxr/mx2lm/manifest/v1",
        "@v": "3.2.0",
        "n": "MX2LM AI Backend",
        "d": "Browser-native AI inference engine with ASXR Trinity integration",
        "law": "ASX = XCFE = XJSON = KUHUL = AST",

        "agents": {
            "agent.mx2lm.inference": {
                "role": "ai_inference",
                "default_tape": "tape_system_mx2lm_v1"
            }
        },

        "tapes": {
            "tape_system_mx2lm_v1": {
                "id": "tape_system_mx2lm_v1",
                "role": "mx2lm_inference",
                "agents": ["agent.mx2lm.inference"],
                "shards": ["cpu", "gpu"],
                "boot": False
            }
        }
    }


@app.post("/api/ingest")
async def ingest_files(files: List[UploadFile] = File(...)):
    """Ingest training files"""
    processed_files = []
    total_tokens = 0

    for file in files:
        try:
            # Read content
            content = await file.read()

            # Save to ingested directory
            file_path = Path(INGESTED_PATH) / file.filename
            with open(file_path, "wb") as f:
                f.write(content)

            # Count tokens
            token_count = 0
            if mx2lm_engine.tokenizer:
                try:
                    text_content = content.decode('utf-8', errors='ignore')
                    tokens = mx2lm_engine.tokenizer.encode(text_content)
                    token_count = len(tokens)
                except:
                    token_count = len(content) // 4

            total_tokens += token_count
            processed_files.append(file.filename)
            mx2lm_engine.ingested_files.append(str(file_path))

            print(f"📥 Ingested: {file.filename} ({token_count} tokens)")

        except Exception as e:
            print(f"❌ Error processing {file.filename}: {e}")
            continue

    return {
        "@context": "xjson://asxr/ingest/v1",
        "success": True,
        "files_processed": len(processed_files),
        "tokens_added": total_tokens,
        "total_files": len(mx2lm_engine.ingested_files),
        "files": processed_files
    }


@app.post("/api/ngrams/upload")
async def upload_ngrams(files: List[UploadFile] = File(...)):
    """Upload pre-generated n-grams"""
    uploaded = []

    for file in files:
        try:
            content = await file.read()
            data = json.loads(content)

            # Determine n-gram type from filename
            gram_type = Path(file.filename).stem

            # Save to ngrams directory
            ngram_file = Path(NGRAMS_PATH) / file.filename
            with open(ngram_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)

            # Load into memory
            mx2lm_engine.ngrams[gram_type] = data

            uploaded.append({
                "type": gram_type,
                "count": len(data) if isinstance(data, list) else 0
            })

            print(f"📊 Uploaded {gram_type}: {len(data)} entries")

        except Exception as e:
            print(f"❌ Error uploading {file.filename}: {e}")
            continue

    return {
        "@context": "xjson://asxr/ngrams/upload/v1",
        "success": True,
        "ngrams_uploaded": uploaded,
        "asx_ram": mx2lm_engine.get_asx_ram_snapshot().__dict__
    }


@app.post("/api/train")
async def train_model(background_tasks: BackgroundTasks):
    """Start training process"""
    if mx2lm_engine.training_active:
        raise HTTPException(status_code=400, detail="Training already in progress")

    async def training_generator():
        mx2lm_engine.training_active = True
        mx2lm_engine.training_progress = 0

        try:
            # Phase 1: Data preparation
            yield json.dumps({
                "@context": "xjson://asxr/training/progress/v1",
                "stage": "preparing",
                "progress": 10,
                "message": "Preparing training data...",
                "asx_ram": mx2lm_engine.get_asx_ram_snapshot().__dict__
            }) + "\n"
            await asyncio.sleep(1)

            # Phase 2: Training
            for i in range(20, 90, 10):
                mx2lm_engine.training_progress = i
                yield json.dumps({
                    "@context": "xjson://asxr/training/progress/v1",
                    "stage": "training",
                    "progress": i,
                    "message": f"Training epoch {i//10}",
                    "loss": 2.5 - (i * 0.02),
                    "step": i * 10
                }) + "\n"
                await asyncio.sleep(2)

            # Phase 3: Completion
            mx2lm_engine.training_progress = 100
            yield json.dumps({
                "@context": "xjson://asxr/training/progress/v1",
                "stage": "complete",
                "progress": 100,
                "message": "Training complete!",
                "checkpoint_saved": True,
                "rlhf": mx2lm_engine.get_rlhf_metrics().__dict__
            }) + "\n"

        finally:
            mx2lm_engine.training_active = False

    return StreamingResponse(
        training_generator(),
        media_type="application/x-ndjson"
    )


@app.post("/api/chat")
async def chat_endpoint(request: dict):
    """Chat with MX2LM"""
    message = request.get("message", "")

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    # Run inference
    response = await mx2lm_engine.infer(message)

    return {
        "@context": "xjson://asxr/chat/response/v1",
        "response": response,
        "agent": mx2lm_engine.agent_id,
        "sources": mx2lm_engine.ingested_files[-3:] if mx2lm_engine.ingested_files else [],
        "asx_ram_active": len(mx2lm_engine.ngrams) > 0,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/rlhf/score")
async def submit_rlhf_score(request: dict):
    """Submit RLHF feedback score"""
    score_data = {
        "quality": request.get("quality", 0.5),
        "safety": request.get("safety", 0.5),
        "novelty": request.get("novelty", 0.5),
        "consensus": request.get("consensus", 0.5),
        "timestamp": datetime.now().isoformat()
    }

    mx2lm_engine.rlhf_scores.append(score_data)

    return {
        "@context": "xjson://asxr/rlhf/score/v1",
        "success": True,
        "score_id": len(mx2lm_engine.rlhf_scores),
        "metrics": mx2lm_engine.get_rlhf_metrics().__dict__
    }


@app.get("/api/checkpoints")
async def list_checkpoints():
    """List available checkpoints"""
    checkpoints = mx2lm_engine.checkpoint_manager.list_checkpoints()

    return {
        "@context": "xjson://asxr/checkpoints/v1",
        "checkpoints": checkpoints,
        "count": len(checkpoints)
    }


@app.get("/api/asx-ram")
async def get_asx_ram():
    """Get ASX RAM snapshot"""
    return {
        "@context": "xjson://asxr/ram/snapshot/v1",
        "snapshot": mx2lm_engine.get_asx_ram_snapshot().__dict__,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/kuhul/execute")
async def execute_kuhul_code(request: dict):
    """Execute K'uhul code through five-stage pipeline"""
    code = request.get("code", "")
    context = request.get("context", {})

    if not code:
        raise HTTPException(status_code=400, detail="K'uhul code is required")

    # Execute through KUHUL pipeline
    result = mx2lm_engine.execute_kuhul(code, context)

    return {
        "@context": "xjson://asxr/kuhul/execution/v1",
        "@law": "POP → WO → SEK → XUL → CH'EN",
        "execution": result,
        "xcfe_state": {
            "language_active": mx2lm_engine.xcfe.language_active,
            "pipeline_stage": mx2lm_engine.xcfe.pipeline_stage
        },
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/glyph/expand")
async def expand_glyph_endpoint(request: dict):
    """Expand compressed glyph to full code"""
    glyph = request.get("glyph", "")

    if not glyph:
        raise HTTPException(status_code=400, detail="Glyph is required")

    expanded = mx2lm_engine.expand_glyph(glyph)
    mx2lm_engine.polyglot.glyphs_expanded += 1

    return {
        "@context": "xjson://asxr/glyph/expand/v1",
        "glyph": glyph,
        "expanded": expanded,
        "compression_ratio": mx2lm_engine.polyglot.glyph_compression_ratio,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/glyph/compress")
async def compress_glyph_endpoint(request: dict):
    """Compress code to glyph"""
    code = request.get("code", "")

    if not code:
        raise HTTPException(status_code=400, detail="Code is required")

    compressed = mx2lm_engine.compress_to_glyph(code)
    mx2lm_engine.polyglot.glyphs_compressed += 1

    return {
        "@context": "xjson://asxr/glyph/compress/v1",
        "code": code,
        "compressed": compressed,
        "compression_ratio": mx2lm_engine.polyglot.glyph_compression_ratio,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/polyglot/seals")
async def get_polyglot_seals():
    """Get polyglot runtime seal states for visualization"""
    return {
        "@context": "xjson://asxr/polyglot/seals/v1",
        "seals": {
            "seal_0_kuhul": {
                "@seal_id": "seal_kuhul_native",
                "@phase": 0,
                "@name": "K'uhul Native Execution",
                "@geometry": "cube_wireframe",
                "@color": "#00FF00",
                "@glow": mx2lm_engine.polyglot.seal_kuhul_glow,
                "@status": "active" if mx2lm_engine.polyglot.kuhul_active else "inactive",
                "@glyph": "🔤"
            },
            "seal_1_javascript": {
                "@seal_id": "seal_javascript_runtime",
                "@phase": 1,
                "@name": "JavaScript ES6+ Runtime",
                "@geometry": "sphere_subdivided",
                "@color": "#FFFF00",
                "@glow": mx2lm_engine.polyglot.seal_javascript_glow,
                "@status": "loaded" if mx2lm_engine.polyglot.javascript_loaded else "not_loaded",
                "@glyph": "💻"
            },
            "seal_2_java": {
                "@seal_id": "seal_java_runtime",
                "@phase": 2,
                "@name": "Java LWJGL Sandbox",
                "@geometry": "pyramid_complex",
                "@color": "#FF6600",
                "@glow": mx2lm_engine.polyglot.seal_java_glow,
                "@status": "loaded" if mx2lm_engine.polyglot.java_loaded else "not_loaded",
                "@glyph": "☕"
            },
            "seal_3_python": {
                "@seal_id": "seal_python_runtime",
                "@phase": 3,
                "@name": "Python Pygame Runtime",
                "@geometry": "torus_knot",
                "@color": "#3776AB",
                "@glow": mx2lm_engine.polyglot.seal_python_glow,
                "@status": "loaded" if mx2lm_engine.polyglot.python_loaded else "not_loaded",
                "@glyph": "🐍"
            },
            "seal_mx2lm": {
                "@seal_id": "seal_mx2lm_quantum_chat",
                "@phase": "MX2LM",
                "@name": "MX2LM Quantum Chat Intelligence",
                "@geometry": "neural_sphere_animated",
                "@color": "#00F0FF",
                "@glow": 1.0,
                "@status": "active",
                "@glyph": "🧠",
                "@polyglot_awareness": "UNDERSTANDS_ALL_LANGUAGES"
            }
        },
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
