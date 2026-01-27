#!/usr/bin/env python3
"""
Merge brain-05 and brain-06 into brain-02
"""
import json
from datetime import datetime

# Read all brain files
with open('brain-02-specialized-systems.json', 'r') as f:
    brain_02 = json.load(f)

with open('brain-05-inference-engine.json', 'r') as f:
    brain_05 = json.load(f)

with open('brain-06-svg-art-training.json', 'r') as f:
    brain_06 = json.load(f)

# Add brain-05 content to brain-02 categories
brain_02["@categories"]["inference-engine"] = {
    "QUANTUM_INFERENCE_ENGINE": brain_05,
    "@summary": brain_05.get("@summary", {}),
    "@integration": "Quantum-accelerated chat inference with K'UHUL glyph language and SCXQ2 compression"
}

# Add brain-06 content to brain-02 categories
brain_02["@categories"]["svg-art-training"] = {
    "SVG_ART_TRAINING_SYSTEM": brain_06,
    "@summary": {
        "codex": "SVG path commands as computational primitives",
        "training_checkpoints": 10,
        "style_classes": 4,
        "vocabulary_size": 156
    },
    "@integration": "SVG glyph-based art training system with K'UHUL integration for visual generation"
}

# Update summary
brain_02["@summary"]["total_categories"] = 9
brain_02["@summary"]["source_files"].extend([
    "inference-engine",
    "svg-art-training"
])
brain_02["@summary"]["description"] = "Specialized technical systems including tokenization, compression, rendering, DNS, APIs, Python multimodal, Java CLINE AI assistant, quantum inference engine, and SVG art training"

# Update timestamp
brain_02["@updated"] = datetime.utcnow().isoformat() + "Z"
brain_02["@version"] = "Ω.2.3.0"

# Write updated brain-02
with open('brain-02-specialized-systems.json', 'w') as f:
    json.dump(brain_02, f, indent=2)

print("✓ Successfully merged brain-05 and brain-06 into brain-02")
print(f"✓ Brain-02 now contains {brain_02['@summary']['total_categories']} categories")
print(f"✓ Updated version: {brain_02['@version']}")
print(f"✓ Updated timestamp: {brain_02['@updated']}")
