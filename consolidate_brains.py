#!/usr/bin/env python3
"""
Brain Consolidation Script
Consolidates multiple brain JSON files into 2 organized brains:
- Brain 1: Core Architecture & Governance (XCFE, Kuhul, ASX, Laws)
- Brain 2: Specialized Systems (Tokenization, Compression, DNS, API, SVG 3D)
"""

import json
import glob
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime


class BrainConsolidator:
    """Consolidates brain pattern files into organized structures."""

    def __init__(self):
        self.brain_files = []
        self.core_brain = {
            "@manifest": "CORE_ARCHITECTURE_GOVERNANCE_BRAIN",
            "@version": "Ω.2.0.0",
            "@created": datetime.now().isoformat(),
            "@law": "ASX = XCFE = XJSON = KUHUL = AST",
            "@purpose": "Core architectural laws, governance, and execution models",
            "@categories": {}
        }
        self.specialized_brain = {
            "@manifest": "SPECIALIZED_SYSTEMS_BRAIN",
            "@version": "Ω.2.0.0",
            "@created": datetime.now().isoformat(),
            "@law": "ASX = XCFE = XJSON = KUHUL = AST",
            "@purpose": "Specialized systems: tokenization, compression, DNS, API, rendering",
            "@categories": {}
        }

        # Keywords to categorize content
        self.core_keywords = [
            "xcfe", "kuhul", "law", "omega", "execution", "governance",
            "control_vectors", "pipeline", "causality", "@Pop", "@Wo",
            "@Sek", "@Xul", "@Ch'en", "identity", "equivalence"
        ]

        self.specialized_keywords = [
            "tokenization", "compression", "ngram", "svg", "3d", "dns",
            "hive", "api", "dom", "checkpoint", "delta", "quantization",
            "rendering", "animation", "physics", "quadrant", "css"
        ]

    def load_brain_files(self):
        """Load all brain JSON files."""
        print("📂 Loading brain files...")

        # Find all brain JSON files
        brain_patterns = [
            "brains*.json",
            "BRAINS*.JSON",
            "BRAINS*.json"
        ]

        for pattern in brain_patterns:
            files = glob.glob(pattern)
            self.brain_files.extend(files)

        # Also add the new brain addon from tmp
        if Path("/tmp/new-brain-addon.json").exists():
            self.brain_files.append("/tmp/new-brain-addon.json")

        print(f"   Found {len(self.brain_files)} brain files")
        for f in self.brain_files:
            size = Path(f).stat().st_size / 1024
            print(f"   - {Path(f).name} ({size:.1f} KB)")

    def categorize_content(self, key: str, content: Any) -> str:
        """Determine if content belongs to core or specialized brain."""
        key_lower = str(key).lower()
        content_str = json.dumps(content).lower() if content else ""

        # Count keyword matches
        core_score = sum(1 for kw in self.core_keywords if kw in key_lower or kw in content_str)
        specialized_score = sum(1 for kw in self.specialized_keywords if kw in key_lower or kw in content_str)

        # Core brain takes priority for governance/law content
        if any(kw in key_lower for kw in ["law", "xcfe", "governance", "kuhul", "execution", "pipeline"]):
            return "core"

        # Specialized brain for technical implementations
        if any(kw in key_lower for kw in ["tokenization", "compression", "3d", "svg", "checkpoint", "dns"]):
            return "specialized"

        # Default based on score
        return "core" if core_score >= specialized_score else "specialized"

    def process_brain_file(self, filepath: str):
        """Process a single brain file and categorize its content."""
        print(f"\n🧠 Processing: {Path(filepath).name}")

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Extract filename as category
            filename = Path(filepath).stem

            # Process top-level keys
            for key, value in data.items():
                if key.startswith("@"):
                    # Metadata - keep at root level
                    continue

                # Categorize this section
                category = self.categorize_content(key, value)

                if category == "core":
                    if filename not in self.core_brain["@categories"]:
                        self.core_brain["@categories"][filename] = {}
                    self.core_brain["@categories"][filename][key] = value
                    print(f"   ✓ {key} → CORE brain")
                else:
                    if filename not in self.specialized_brain["@categories"]:
                        self.specialized_brain["@categories"][filename] = {}
                    self.specialized_brain["@categories"][filename][key] = value
                    print(f"   ✓ {key} → SPECIALIZED brain")

        except json.JSONDecodeError as e:
            print(f"   ⚠️  JSON decode error: {e}")
        except Exception as e:
            print(f"   ⚠️  Error: {e}")

    def clean_and_organize(self):
        """Clean up and organize the consolidated brains."""
        print("\n🧹 Cleaning and organizing brains...")

        # Add metadata summaries
        self.core_brain["@summary"] = {
            "total_categories": len(self.core_brain["@categories"]),
            "source_files": list(self.core_brain["@categories"].keys()),
            "description": "Core architectural patterns, governance laws, execution models, and foundational rules"
        }

        self.specialized_brain["@summary"] = {
            "total_categories": len(self.specialized_brain["@categories"]),
            "source_files": list(self.specialized_brain["@categories"].keys()),
            "description": "Specialized technical systems including tokenization, compression, rendering, DNS, and APIs"
        }

        print(f"   ✓ Core brain: {len(self.core_brain['@categories'])} source files")
        print(f"   ✓ Specialized brain: {len(self.specialized_brain['@categories'])} source files")

    def save_brains(self):
        """Save the consolidated brains to files."""
        print("\n💾 Saving consolidated brains...")

        # Save core brain
        core_path = "brain-01-core-architecture.json"
        with open(core_path, 'w', encoding='utf-8') as f:
            json.dump(self.core_brain, f, indent=2, ensure_ascii=False)
        core_size = Path(core_path).stat().st_size / 1024
        print(f"   ✓ {core_path} ({core_size:.1f} KB)")

        # Save specialized brain
        specialized_path = "brain-02-specialized-systems.json"
        with open(specialized_path, 'w', encoding='utf-8') as f:
            json.dump(self.specialized_brain, f, indent=2, ensure_ascii=False)
        specialized_size = Path(specialized_path).stat().st_size / 1024
        print(f"   ✓ {specialized_path} ({specialized_size:.1f} KB)")

        return core_path, specialized_path

    def generate_report(self, core_path: str, specialized_path: str):
        """Generate a consolidation report."""
        print("\n" + "="*60)
        print("📊 BRAIN CONSOLIDATION REPORT")
        print("="*60)

        core_size = Path(core_path).stat().st_size / 1024
        specialized_size = Path(specialized_path).stat().st_size / 1024
        total_original = sum(Path(f).stat().st_size for f in self.brain_files if Path(f).exists())
        total_new = (core_size + specialized_size) * 1024

        print(f"\n📥 INPUT:")
        print(f"   Files processed: {len(self.brain_files)}")
        print(f"   Total size: {total_original/1024:.1f} KB")

        print(f"\n📤 OUTPUT:")
        print(f"   Brain 1 (Core): {core_path} ({core_size:.1f} KB)")
        print(f"   Brain 2 (Specialized): {specialized_path} ({specialized_size:.1f} KB)")
        print(f"   Total size: {total_new/1024:.1f} KB")

        print(f"\n📈 ORGANIZATION:")
        print(f"   Core brain categories: {len(self.core_brain['@categories'])}")
        print(f"   Specialized brain categories: {len(self.specialized_brain['@categories'])}")

        print(f"\n✅ CONSOLIDATION COMPLETE")
        print("="*60)

    def run(self):
        """Run the full consolidation process."""
        print("\n🚀 BRAIN CONSOLIDATION PROCESS")
        print("="*60)

        self.load_brain_files()

        for brain_file in self.brain_files:
            if Path(brain_file).exists():
                self.process_brain_file(brain_file)

        self.clean_and_organize()
        core_path, specialized_path = self.save_brains()
        self.generate_report(core_path, specialized_path)

        return core_path, specialized_path


def main():
    """Main entry point."""
    consolidator = BrainConsolidator()
    core_path, specialized_path = consolidator.run()

    print(f"\n🎯 Next steps:")
    print(f"   1. Review {core_path}")
    print(f"   2. Review {specialized_path}")
    print(f"   3. Continue refining the other 3 brains in the same fashion")


if __name__ == "__main__":
    main()
