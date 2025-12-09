#!/usr/bin/env python3
"""
MX2LM Checkpoint Manager - ASXR Trinity Compatible
Manages model checkpoints with XJSON metadata and n-gram integration

Features:
- XJSON-formatted checkpoint metadata
- N-gram statistics tracking
- RLHF score integration
- ASX RAM state snapshots
- Quantum compression support
- XCFE state vectors
"""

import os
import json
from dataclasses import dataclass, asdict, field
from typing import Any, Dict, Optional, List
from pathlib import Path
from datetime import datetime

try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️  PyTorch not available - running in metadata-only mode")


@dataclass
class ASXRAMSnapshot:
    """ASX RAM cognitive memory snapshot"""
    ngrams_count: int = 0
    bigrams_count: int = 0
    trigrams_count: int = 0
    quadragrams_count: int = 0
    pentagrams_count: int = 0
    supagrams_count: int = 0
    glyphgrams_count: int = 0
    quantum_count: int = 0
    total_patterns: int = 0
    memory_utilization: float = 0.0


@dataclass
class RLHFMetrics:
    """RLHF training metrics"""
    quality_score: float = 0.0
    safety_score: float = 0.0
    novelty_score: float = 0.0
    consensus_score: float = 0.0
    training_ready: bool = False
    feedback_count: int = 0


@dataclass
class XCFEVectors:
    """XCFE control/flow/variable vectors for polyglot execution"""
    # Control flow vectors
    control_state: Dict[str, Any] = field(default_factory=dict)
    flow_state: Dict[str, Any] = field(default_factory=dict)
    variable_state: Dict[str, Any] = field(default_factory=dict)

    # Polyglot language state
    language_active: str = "KUHUL"  # KUHUL|JAVASCRIPT|JAVA|PYTHON|NONE
    runtime_version: str = "v1.0"
    execution_stack: List[Dict[str, Any]] = field(default_factory=list)
    memory_usage: Dict[str, int] = field(default_factory=dict)

    # KUHUL pipeline state (Pop → Wo → Sek → Xul → Ch'en)
    pipeline_stage: str = "idle"  # idle|pop|wo|sek|xul|chen
    pipeline_result: Any = None


@dataclass
class PolyglotRuntimeState:
    """State of embedded polyglot language runtimes"""
    kuhul_active: bool = True
    javascript_loaded: bool = False
    java_loaded: bool = False
    python_loaded: bool = False

    # Seal visualization states
    seal_kuhul_glow: float = 1.0  # 0.0-1.0
    seal_javascript_glow: float = 0.0
    seal_java_glow: float = 0.0
    seal_python_glow: float = 0.0

    # Glyph compression stats
    glyph_compression_ratio: float = 0.0001
    glyphs_expanded: int = 0
    glyphs_compressed: int = 0


@dataclass
class CheckpointMeta:
    """MX2LM Checkpoint Metadata - XJSON Compatible"""
    # Core training metadata
    step: int
    epoch: int
    loss: float
    best: bool = False
    tag: str = ""

    # ASXR Trinity integration
    asxr_version: str = "3.2.0"
    agent_id: str = "agent.mx2lm.trainer"
    tape_id: str = "tape_system_training_v1"

    # Timestamps
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())

    # ASX RAM snapshot
    asx_ram: Optional[ASXRAMSnapshot] = None

    # RLHF metrics
    rlhf: Optional[RLHFMetrics] = None

    # XCFE vectors
    xcfe: Optional[XCFEVectors] = None

    # Polyglot runtime state
    polyglot: Optional[PolyglotRuntimeState] = None

    # Additional metadata
    extra: Optional[Dict[str, Any]] = None

    # Model info
    model_name: str = "mx2lm"
    model_params: int = 0

    # Training info
    learning_rate: float = 0.0
    batch_size: int = 0
    gradient_norm: float = 0.0

    def to_xjson(self) -> Dict[str, Any]:
        """Convert to XJSON format with XCFE + KUHUL polyglot support"""
        return {
            "@context": "xjson://asxr/mx2lm/checkpoint/v1",
            "@v": self.asxr_version,
            "@agent": self.agent_id,
            "@tape": self.tape_id,
            "law": "XCFE_GOVERNS → KUHUL_EXECUTES → POLYGLOT_DISPATCHES → ASX = XCFE = XJSON = KUHUL = AST",
            "@quantum_state": "|XCFE⟩⊗|KUHUL⟩⊗|MX2LM⟩⊗|POLYGLOT⟩⊗|ETERNAL⟩",

            "training": {
                "step": self.step,
                "epoch": self.epoch,
                "loss": self.loss,
                "best": self.best,
                "tag": self.tag,
                "learning_rate": self.learning_rate,
                "batch_size": self.batch_size,
                "gradient_norm": self.gradient_norm
            },

            "model": {
                "name": self.model_name,
                "parameters": self.model_params
            },

            "asx_ram": asdict(self.asx_ram) if self.asx_ram else None,
            "rlhf": asdict(self.rlhf) if self.rlhf else None,
            "xcfe": asdict(self.xcfe) if self.xcfe else None,
            "polyglot": asdict(self.polyglot) if self.polyglot else None,

            "kuhul_pipeline": {
                "@law": "POP → WO → SEK → XUL → CH'EN",
                "@stage": self.xcfe.pipeline_stage if self.xcfe else "idle",
                "@glyphs": ["⟁Pop", "⟁Wo", "⟁Sek", "⟁Xul", "⟁Chen"]
            },

            "timestamps": {
                "created_at": self.created_at,
                "updated_at": self.updated_at
            },

            "extra": self.extra or {}
        }


class MX2LMCheckpointManager:
    """
    Enhanced checkpoint manager for MX2LM with ASXR integration

    Features:
    - XJSON-formatted metadata
    - ASX RAM state tracking
    - RLHF metrics logging
    - XCFE vector snapshots
    - Quantum compression support
    - Multi-format exports
    """

    def __init__(self, checkpoint_dir: str, compress: bool = False):
        self.checkpoint_dir = Path(checkpoint_dir)
        self.compress = compress
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)

        # ASXR integration
        self.ram_dir = self.checkpoint_dir / "asx_ram"
        self.rlhf_dir = self.checkpoint_dir / "rlhf"
        self.xcfe_dir = self.checkpoint_dir / "xcfe"

        self.ram_dir.mkdir(exist_ok=True)
        self.rlhf_dir.mkdir(exist_ok=True)
        self.xcfe_dir.mkdir(exist_ok=True)

    def save_checkpoint(
        self,
        model,
        optimizer,
        meta: CheckpointMeta,
        save_full_model: bool = True
    ) -> str:
        """Save checkpoint with XJSON metadata"""

        if not TORCH_AVAILABLE:
            print("⚠️  PyTorch not available - saving metadata only")
            return self._save_metadata_only(meta)

        # Generate checkpoint filename
        ckpt_name = f"step_{meta.step:08d}.pt"
        ckpt_path = self.checkpoint_dir / ckpt_name

        # Prepare payload
        payload = {
            "model": model.state_dict(),
            "optimizer": optimizer.state_dict() if optimizer is not None else None,
            "meta": meta.to_xjson(),
            "checkpoint_manager_version": "2.0.0"
        }

        # Save checkpoint
        torch.save(payload, ckpt_path)
        print(f"💾 Saved checkpoint: {ckpt_path}")

        # Save XJSON metadata separately
        meta_path = self.checkpoint_dir / f"step_{meta.step:08d}.xjson"
        with open(meta_path, 'w', encoding='utf-8') as f:
            json.dump(meta.to_xjson(), f, indent=2)

        # Update last checkpoint
        self._save_last(meta)

        # Save best checkpoint if applicable
        if meta.best:
            self._save_best(payload, meta)

        # Save ASX RAM snapshot
        if meta.asx_ram:
            self._save_ram_snapshot(meta)

        # Save RLHF metrics
        if meta.rlhf:
            self._save_rlhf_metrics(meta)

        # Save XCFE vectors
        if meta.xcfe:
            self._save_xcfe_vectors(meta)

        return str(ckpt_path)

    def _save_metadata_only(self, meta: CheckpointMeta) -> str:
        """Save metadata when PyTorch is not available"""
        meta_path = self.checkpoint_dir / f"step_{meta.step:08d}.xjson"
        with open(meta_path, 'w', encoding='utf-8') as f:
            json.dump(meta.to_xjson(), f, indent=2)

        self._save_last(meta)
        return str(meta_path)

    def _save_last(self, meta: CheckpointMeta):
        """Update last.json with latest checkpoint"""
        last_path = self.checkpoint_dir / "last.json"
        with open(last_path, 'w', encoding='utf-8') as f:
            json.dump(meta.to_xjson(), f, indent=2)

    def _save_best(self, payload: Dict, meta: CheckpointMeta):
        """Save best checkpoint"""
        if TORCH_AVAILABLE:
            best_path = self.checkpoint_dir / "best.pt"
            torch.save(payload, best_path)
            print(f"🌟 Saved best checkpoint (loss={meta.loss:.4f})")

        best_json = self.checkpoint_dir / "best.json"
        with open(best_json, 'w', encoding='utf-8') as f:
            json.dump(meta.to_xjson(), f, indent=2)

    def _save_ram_snapshot(self, meta: CheckpointMeta):
        """Save ASX RAM snapshot"""
        if not meta.asx_ram:
            return

        snapshot_path = self.ram_dir / f"step_{meta.step:08d}.json"
        snapshot_data = {
            "@context": "xjson://asxr/ram/snapshot/v1",
            "step": meta.step,
            "timestamp": meta.updated_at,
            "snapshot": asdict(meta.asx_ram)
        }

        with open(snapshot_path, 'w', encoding='utf-8') as f:
            json.dump(snapshot_data, f, indent=2)

    def _save_rlhf_metrics(self, meta: CheckpointMeta):
        """Save RLHF metrics"""
        if not meta.rlhf:
            return

        metrics_path = self.rlhf_dir / f"step_{meta.step:08d}.json"
        metrics_data = {
            "@context": "xjson://asxr/rlhf/metrics/v1",
            "step": meta.step,
            "timestamp": meta.updated_at,
            "metrics": asdict(meta.rlhf)
        }

        with open(metrics_path, 'w', encoding='utf-8') as f:
            json.dump(metrics_data, f, indent=2)

    def _save_xcfe_vectors(self, meta: CheckpointMeta):
        """Save XCFE state vectors"""
        if not meta.xcfe:
            return

        vectors_path = self.xcfe_dir / f"step_{meta.step:08d}.json"
        vectors_data = {
            "@context": "xjson://asxr/xcfe/vectors/v1",
            "step": meta.step,
            "timestamp": meta.updated_at,
            "vectors": asdict(meta.xcfe)
        }

        with open(vectors_path, 'w', encoding='utf-8') as f:
            json.dump(vectors_data, f, indent=2)

    def load_checkpoint(
        self,
        model,
        optimizer,
        checkpoint_path: str,
        map_location: str = "cpu"
    ) -> CheckpointMeta:
        """Load checkpoint and return metadata"""

        if not TORCH_AVAILABLE:
            raise RuntimeError("PyTorch is required to load checkpoints")

        payload = torch.load(checkpoint_path, map_location=map_location)

        # Load model weights
        model.load_state_dict(payload["model"])

        # Load optimizer state
        if optimizer is not None and payload.get("optimizer") is not None:
            optimizer.load_state_dict(payload["optimizer"])

        # Parse metadata
        meta_dict = payload.get("meta", {})

        # Reconstruct CheckpointMeta from XJSON
        return self._parse_xjson_meta(meta_dict)

    def _parse_xjson_meta(self, xjson_data: Dict) -> CheckpointMeta:
        """Parse XJSON metadata back to CheckpointMeta"""

        training = xjson_data.get("training", {})
        model = xjson_data.get("model", {})
        timestamps = xjson_data.get("timestamps", {})

        # Reconstruct ASX RAM snapshot
        asx_ram = None
        if xjson_data.get("asx_ram"):
            asx_ram = ASXRAMSnapshot(**xjson_data["asx_ram"])

        # Reconstruct RLHF metrics
        rlhf = None
        if xjson_data.get("rlhf"):
            rlhf = RLHFMetrics(**xjson_data["rlhf"])

        # Reconstruct XCFE vectors
        xcfe = None
        if xjson_data.get("xcfe"):
            xcfe = XCFEVectors(**xjson_data["xcfe"])

        # Reconstruct Polyglot runtime state
        polyglot = None
        if xjson_data.get("polyglot"):
            polyglot = PolyglotRuntimeState(**xjson_data["polyglot"])

        return CheckpointMeta(
            step=training.get("step", 0),
            epoch=training.get("epoch", 0),
            loss=training.get("loss", 0.0),
            best=training.get("best", False),
            tag=training.get("tag", ""),
            asxr_version=xjson_data.get("@v", "3.2.0"),
            agent_id=xjson_data.get("@agent", "agent.mx2lm.trainer"),
            tape_id=xjson_data.get("@tape", "tape_system_training_v1"),
            created_at=timestamps.get("created_at", ""),
            updated_at=timestamps.get("updated_at", ""),
            asx_ram=asx_ram,
            rlhf=rlhf,
            xcfe=xcfe,
            polyglot=polyglot,
            model_name=model.get("name", "mx2lm"),
            model_params=model.get("parameters", 0),
            learning_rate=training.get("learning_rate", 0.0),
            batch_size=training.get("batch_size", 0),
            gradient_norm=training.get("gradient_norm", 0.0),
            extra=xjson_data.get("extra", {})
        )

    def load_best_or_last(
        self,
        model=None,
        optimizer=None,
        map_location: str = "cpu"
    ) -> Optional[CheckpointMeta]:
        """Try to load best checkpoint, fallback to last"""

        # Try best.pt first
        best_path = self.checkpoint_dir / "best.pt"
        if best_path.exists() and TORCH_AVAILABLE and model is not None:
            print(f"📂 Loading best checkpoint: {best_path}")
            return self.load_checkpoint(model, optimizer, str(best_path), map_location)

        # Try best.json (metadata only)
        best_json = self.checkpoint_dir / "best.json"
        if best_json.exists():
            with open(best_json, 'r', encoding='utf-8') as f:
                meta_dict = json.load(f)
            return self._parse_xjson_meta(meta_dict)

        # Try last.json
        last_json = self.checkpoint_dir / "last.json"
        if last_json.exists():
            with open(last_json, 'r', encoding='utf-8') as f:
                meta_dict = json.load(f)
            return self._parse_xjson_meta(meta_dict)

        return None

    def list_checkpoints(self) -> List[Dict[str, Any]]:
        """List all available checkpoints"""
        checkpoints = []

        for xjson_file in sorted(self.checkpoint_dir.glob("step_*.xjson")):
            with open(xjson_file, 'r', encoding='utf-8') as f:
                meta = json.load(f)
                checkpoints.append({
                    "path": str(xjson_file),
                    "step": meta.get("training", {}).get("step", 0),
                    "loss": meta.get("training", {}).get("loss", 0.0),
                    "best": meta.get("training", {}).get("best", False)
                })

        return checkpoints

    def export_to_asxr_format(self, checkpoint_path: str, output_dir: str):
        """Export checkpoint to ASXR-compatible format"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        # Load metadata
        if checkpoint_path.endswith('.xjson'):
            with open(checkpoint_path, 'r', encoding='utf-8') as f:
                meta = json.load(f)
        else:
            # Load from .pt file
            if not TORCH_AVAILABLE:
                raise RuntimeError("PyTorch required to read .pt files")
            payload = torch.load(checkpoint_path, map_location='cpu')
            meta = payload.get("meta", {})

        # Export to ASXR format
        asxr_export = {
            "@context": "xjson://asxr/export/v1",
            "@v": "3.2.0",
            "law": "ASX = XCFE = XJSON = KUHUL = AST",
            "checkpoint": meta,
            "export_timestamp": datetime.now().isoformat()
        }

        export_file = output_path / "checkpoint_export.xjson"
        with open(export_file, 'w', encoding='utf-8') as f:
            json.dump(asxr_export, f, indent=2)

        print(f"📤 Exported to ASXR format: {export_file}")
        return str(export_file)


# Helper functions for backward compatibility
def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def save_checkpoint(model, optimizer, meta: CheckpointMeta, out_dir: str) -> str:
    """Legacy function - use MX2LMCheckpointManager instead"""
    manager = MX2LMCheckpointManager(out_dir)
    return manager.save_checkpoint(model, optimizer, meta)


def load_checkpoint(model, optimizer, ckpt_path: str, map_location: str = "cpu") -> CheckpointMeta:
    """Legacy function - use MX2LMCheckpointManager instead"""
    manager = MX2LMCheckpointManager(Path(ckpt_path).parent)
    return manager.load_checkpoint(model, optimizer, ckpt_path, map_location)


def load_best_or_last(model, optimizer, ckpt_dir: str, map_location: str = "cpu") -> Optional[CheckpointMeta]:
    """Legacy function - use MX2LMCheckpointManager instead"""
    manager = MX2LMCheckpointManager(ckpt_dir)
    return manager.load_best_or_last(model, optimizer, map_location)


if __name__ == "__main__":
    print("=" * 70)
    print("MX2LM Checkpoint Manager - ASXR Trinity Compatible")
    print("=" * 70)
    print()
    print("Usage:")
    print("  from checkpoint_manager import MX2LMCheckpointManager, CheckpointMeta")
    print()
    print("  manager = MX2LMCheckpointManager('./checkpoints')")
    print("  meta = CheckpointMeta(step=1000, epoch=1, loss=0.5, best=True)")
    print("  manager.save_checkpoint(model, optimizer, meta)")
    print()
    print("Features:")
    print("  ✅ XJSON-formatted metadata")
    print("  ✅ ASX RAM state tracking")
    print("  ✅ RLHF metrics integration")
    print("  ✅ XCFE vector snapshots")
    print("  ✅ Multi-format exports")
    print()
