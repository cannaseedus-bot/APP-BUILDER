#!/usr/bin/env python3
"""
K'UHUL → SAFETENSORS EXPORTER v1

Converts K'UHUL training deltas (JSON + SCXQ2) into standard model.safetensors
for deployment with HuggingFace, vLLM, Ollama, etc.

Usage:
    python kuhul_export_safetensors.py \\
        --base qwen-base/model.safetensors \\
        --delta kuhul_delta_run001.json \\
        --out asx-qwen-kuhul-merged.safetensors

Delta JSON Format:
    {
      "@version": "kuhul_delta.v1",
      "@context": "xjson://kuhul/delta/v1",
      "base_model": "Qwen-7B",
      "apply_mode": "add",
      "scale": 0.1,
      "layers": [
        {
          "name": "model.layers.0.self_attn.q_proj.weight",
          "encoding": "raw",
          "shape": [4096, 4096],
          "data": "kuhul://blob/l0_qproj_delta"
        }
      ]
    }

Apply Modes:
    - "add": T_new = T_base + scale * ΔT
    - "replace": T_new = ΔT
    - "scale_add": T_new = (1-α)*T_base + α*(T_base + ΔT)

Encodings:
    - "raw": Direct tensor data (v1)
    - "scxq2": SCXQ2 compressed (v2, requires K'UHUL π engine)
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional

try:
    import torch
    from safetensors.torch import load_file, save_file
except ImportError:
    print("ERROR: Required dependencies not found.")
    print("Install with: pip install torch safetensors")
    sys.exit(1)


# ============================================================================
# K'UHUL / SCXQ2 DECODE HOOKS
# ============================================================================

def decode_kuhul_blob(
    ref: str,
    shape: List[int],
    encoding: str,
    quant: Optional[str] = None,
    blob_dir: Path = Path("blobs")
) -> torch.Tensor:
    """
    Decode K'UHUL delta blob into tensor.

    Args:
        ref: kuhul:// or scxq2:// reference
        shape: Expected tensor shape
        encoding: "raw" | "scxq2"
        quant: Quantization format (e.g., "int4")
        blob_dir: Directory containing blob files

    Returns:
        Decoded tensor with specified shape

    v1: Supports "raw" encoding (direct .pt/.npy files)
    v2: Will support "scxq2" encoding via K'UHUL π engine
    """
    if encoding == "raw":
        # v1: Load from sidecar .pt or .npy file
        # Convention: kuhul://blob/foo -> ./blobs/foo.pt
        if ref.startswith("kuhul://blob/"):
            fname = blob_dir / (ref.split("/")[-1] + ".pt")
            if not fname.exists():
                raise FileNotFoundError(f"Delta blob not found: {fname}")

            delta = torch.load(fname)

            # Ensure shape matches
            if list(delta.shape) != list(shape):
                delta = delta.reshape(shape)

            return delta

        elif ref.startswith("file://"):
            # Direct file reference
            fpath = Path(ref.replace("file://", ""))
            if not fpath.exists():
                raise FileNotFoundError(f"Delta file not found: {fpath}")

            if fpath.suffix == ".pt":
                delta = torch.load(fpath)
            elif fpath.suffix == ".npy":
                import numpy as np
                delta = torch.from_numpy(np.load(fpath))
            else:
                raise ValueError(f"Unsupported file format: {fpath.suffix}")

            if list(delta.shape) != list(shape):
                delta = delta.reshape(shape)

            return delta

        else:
            raise ValueError(f"Unsupported ref format: {ref}")

    elif encoding == "scxq2":
        # v2: SCXQ2 decompression via K'UHUL π engine
        # TODO: Integrate with K'UHUL π SCXQ2 decompressor
        #
        # Expected flow:
        # 1. Load SCXQ2 compressed block from ref
        # 2. Decompress using π math layer:
        #    - int4 → float16/32
        #    - quantum lattice expansion
        #    - SVG geometry reconstruction
        # 3. Return full-precision tensor

        raise NotImplementedError(
            "SCXQ2 decoding requires K'UHUL π engine integration.\n"
            "Coming in v2 - contact ASX team for early access."
        )

    else:
        raise ValueError(f"Unknown encoding: {encoding}")


def validate_delta_manifest(delta: Dict[str, Any]) -> None:
    """Validate K'UHUL delta manifest schema."""
    required_fields = ["@version", "base_model", "layers"]
    for field in required_fields:
        if field not in delta:
            raise ValueError(f"Missing required field: {field}")

    if delta["@version"] != "kuhul_delta.v1":
        raise ValueError(f"Unsupported delta version: {delta['@version']}")

    apply_mode = delta.get("apply_mode", "add")
    if apply_mode not in ["add", "replace", "scale_add"]:
        raise ValueError(f"Invalid apply_mode: {apply_mode}")

    for i, layer in enumerate(delta["layers"]):
        required_layer_fields = ["name", "shape"]
        for field in required_layer_fields:
            if field not in layer:
                raise ValueError(f"Layer {i} missing required field: {field}")


# ============================================================================
# DELTA APPLICATION
# ============================================================================

def apply_delta_to_tensor(
    base_tensor: torch.Tensor,
    delta_tensor: torch.Tensor,
    apply_mode: str,
    scale: float
) -> torch.Tensor:
    """
    Apply delta to base tensor using specified mode.

    Args:
        base_tensor: Original model weights
        delta_tensor: K'UHUL training delta
        apply_mode: "add" | "replace" | "scale_add"
        scale: Scaling factor for delta

    Returns:
        Updated tensor
    """
    if apply_mode == "add":
        # Standard LoRA-style addition
        return base_tensor + scale * delta_tensor

    elif apply_mode == "replace":
        # Full replacement (for completely retrained layers)
        return delta_tensor

    elif apply_mode == "scale_add":
        # Weighted blend between base and updated
        alpha = scale
        return (1.0 - alpha) * base_tensor + alpha * (base_tensor + delta_tensor)

    else:
        raise ValueError(f"Unknown apply_mode: {apply_mode}")


# ============================================================================
# EXPORTER CORE
# ============================================================================

def apply_kuhul_delta(
    base_path: str,
    delta_manifest_path: str,
    output_path: str,
    blob_dir: str = "blobs",
    verbose: bool = True
) -> Dict[str, Any]:
    """
    Apply K'UHUL delta to base model and export to safetensors.

    Args:
        base_path: Path to base model.safetensors
        delta_manifest_path: Path to K'UHUL delta manifest JSON
        output_path: Path to output model.safetensors
        blob_dir: Directory containing delta blob files
        verbose: Print progress messages

    Returns:
        Export statistics and metadata
    """
    blob_path = Path(blob_dir)

    # 1) Load base weights
    if verbose:
        print(f"[1/4] Loading base model: {base_path}")

    weights = load_file(base_path)  # dict[str, torch.Tensor]
    if verbose:
        print(f"      Loaded {len(weights)} tensors")

    # 2) Load delta manifest
    if verbose:
        print(f"[2/4] Loading K'UHUL delta manifest: {delta_manifest_path}")

    with open(delta_manifest_path, "r", encoding="utf-8") as f:
        delta = json.load(f)

    validate_delta_manifest(delta)

    apply_mode = delta.get("apply_mode", "add")
    global_scale = float(delta.get("scale", 1.0))
    base_model = delta.get("base_model", "Unknown")

    if verbose:
        print(f"      Base model: {base_model}")
        print(f"      Apply mode: {apply_mode}")
        print(f"      Global scale: {global_scale}")
        print(f"      Delta layers: {len(delta['layers'])}")

    # Clone all weights
    updated = {name: tensor.clone() for name, tensor in weights.items()}

    # 3) Apply per-layer deltas
    if verbose:
        print(f"[3/4] Applying deltas to {len(delta['layers'])} layers...")

    stats = {
        "applied": 0,
        "skipped": 0,
        "total_params_updated": 0,
        "layers": []
    }

    for layer_idx, layer in enumerate(delta["layers"]):
        name = layer["name"]
        encoding = layer.get("encoding", "raw")
        quant = layer.get("quant")
        shape = layer["shape"]
        ref = layer.get("data") or layer.get("ref")
        layer_scale = float(layer.get("scale", 1.0)) * global_scale

        if name not in updated:
            if verbose:
                print(f"      [WARN] Layer {name} not found in base model, skipping")
            stats["skipped"] += 1
            continue

        base_tensor = updated[name]
        if list(base_tensor.shape) != list(shape):
            raise ValueError(
                f"Shape mismatch for {name}: "
                f"base {list(base_tensor.shape)} vs delta {shape}"
            )

        if verbose:
            print(f"      [{layer_idx+1}/{len(delta['layers'])}] {name}")
            print(f"         encoding={encoding}, scale={layer_scale:.4f}")

        # Decode K'UHUL delta
        delta_tensor = decode_kuhul_blob(
            ref=ref,
            shape=shape,
            encoding=encoding,
            quant=quant,
            blob_dir=blob_path
        )

        # Apply delta
        new_tensor = apply_delta_to_tensor(
            base_tensor=base_tensor,
            delta_tensor=delta_tensor,
            apply_mode=apply_mode,
            scale=layer_scale
        )

        updated[name] = new_tensor

        # Track stats
        params_updated = new_tensor.numel()
        stats["applied"] += 1
        stats["total_params_updated"] += params_updated
        stats["layers"].append({
            "name": name,
            "shape": shape,
            "params": params_updated,
            "encoding": encoding
        })

    # 4) Save updated model
    if verbose:
        print(f"[4/4] Saving merged model to: {output_path}")

    save_file(updated, output_path)

    if verbose:
        print(f"\n✅ Export complete!")
        print(f"   Applied: {stats['applied']} layers")
        print(f"   Skipped: {stats['skipped']} layers")
        print(f"   Updated: {stats['total_params_updated']:,} parameters")

    return {
        "base_model": base_model,
        "output_path": output_path,
        "apply_mode": apply_mode,
        "global_scale": global_scale,
        "stats": stats,
        "kuhul_version": delta["@version"]
    }


# ============================================================================
# CLI
# ============================================================================

def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="K'UHUL → Safetensors Exporter v1",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # Basic export
    python kuhul_export_safetensors.py \\
        --base qwen-base/model.safetensors \\
        --delta kuhul_delta_run001.json \\
        --out asx-qwen-merged.safetensors

    # With custom blob directory
    python kuhul_export_safetensors.py \\
        --base qwen-base/model.safetensors \\
        --delta kuhul_delta_run001.json \\
        --out asx-qwen-merged.safetensors \\
        --blobs ./cluster/deltas

Delta Manifest Format:
    {
      "@version": "kuhul_delta.v1",
      "base_model": "Qwen-7B",
      "apply_mode": "add",
      "scale": 0.1,
      "layers": [...]
    }

For more info: https://github.com/cannaseedus-bot/APP-BUILDER
        """
    )

    parser.add_argument(
        "--base",
        required=True,
        help="Path to base model.safetensors"
    )
    parser.add_argument(
        "--delta",
        required=True,
        help="Path to K'UHUL delta manifest JSON"
    )
    parser.add_argument(
        "--out",
        required=True,
        help="Path to output model.safetensors"
    )
    parser.add_argument(
        "--blobs",
        default="blobs",
        help="Directory containing delta blob files (default: ./blobs)"
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress progress messages"
    )
    parser.add_argument(
        "--stats",
        help="Optional path to save export statistics JSON"
    )

    args = parser.parse_args()

    try:
        result = apply_kuhul_delta(
            base_path=args.base,
            delta_manifest_path=args.delta,
            output_path=args.out,
            blob_dir=args.blobs,
            verbose=not args.quiet
        )

        if args.stats:
            with open(args.stats, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2)
            if not args.quiet:
                print(f"\n📊 Export stats saved to: {args.stats}")

    except Exception as e:
        print(f"\n❌ Export failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
