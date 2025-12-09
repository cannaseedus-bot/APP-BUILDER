#!/usr/bin/env python3
"""
ASX N-Gram Builder - XJSON/XCFE/KUHUL Compatible
Generates all n-gram types for ASXR Trinity cognitive memory system

Usage:
  python build_ngrams.py --input ./data --output ./ngrams --all-types
  python build_ngrams.py --input corpus.txt --output ./output --types bigrams trigrams
  python build_ngrams.py --input ./data --output ./ngrams --format xjson
"""

import os
import sys
import json
import argparse
from pathlib import Path
from collections import Counter
from typing import List, Dict, Any, Tuple
import re

class ASXNGramBuilder:
    """
    ASX N-Gram Builder with XJSON/XCFE/KUHUL integration

    Generates cognitive memory patterns for ASXR Trinity OS:
    - Unigrams: Base vocabulary
    - Bigrams: Word pairs
    - Trigrams: Three-word patterns
    - Quadragrams: Four-word sequences
    - Pentagrams: Five-word chains
    - Supagrams: Advanced patterns (6-grams)
    - Glyphgrams: Symbol-level compression
    - Quantum grams: Skip-gram entangled states
    """

    def __init__(self, input_path: str, output_path: str, format_type: str = "json"):
        self.input_path = Path(input_path)
        self.output_path = Path(output_path)
        self.format_type = format_type
        self.corpus = []
        self.tokens = []

        # XJSON metadata
        self.metadata = {
            "@context": "xjson://asxr/ngrams/v1",
            "@v": "1.0.0",
            "@law": "ASX = XCFE = XJSON = KUHUL = AST",
            "generator": "ASX N-Gram Builder",
            "format": format_type
        }

    def load_corpus(self) -> List[str]:
        """Load corpus from file or directory"""
        texts = []

        if self.input_path.is_file():
            texts.append(self._read_file(self.input_path))
        elif self.input_path.is_dir():
            for file_path in self.input_path.rglob('*'):
                if file_path.is_file() and self._is_text_file(file_path):
                    texts.append(self._read_file(file_path))
        else:
            raise ValueError(f"Input path does not exist: {self.input_path}")

        self.corpus = texts
        print(f"✅ Loaded {len(texts)} documents")
        print(f"✅ Total characters: {sum(len(t) for t in texts):,}")

        return texts

    def _is_text_file(self, path: Path) -> bool:
        """Check if file is a text file"""
        valid_extensions = {'.txt', '.jsonl', '.xjson', '.khl', '.scx', '.html', '.md', '.json'}
        return path.suffix.lower() in valid_extensions

    def _read_file(self, path: Path) -> str:
        """Read file with encoding fallback"""
        try:
            return path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            try:
                return path.read_text(encoding='latin-1')
            except Exception as e:
                print(f"⚠️ Warning: Could not read {path}: {e}")
                return ""

    def tokenize(self, text: str) -> List[str]:
        """Tokenize text into words"""
        # Lowercase and remove punctuation
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        # Split and filter
        tokens = [t for t in text.split() if len(t) > 0]
        return tokens

    def generate_unigrams(self) -> List[Dict[str, Any]]:
        """Generate unigrams (single words)"""
        print("\n🔤 Generating unigrams...")

        all_text = ' '.join(self.corpus)
        self.tokens = self.tokenize(all_text)

        counts = Counter(self.tokens)

        results = [
            {"gram": word, "count": count}
            for word, count in counts.most_common()
        ]

        print(f"✅ Generated {len(results):,} unigrams")
        return results

    def generate_bigrams(self) -> List[Dict[str, Any]]:
        """Generate bigrams (word pairs)"""
        print("\n🔤🔤 Generating bigrams...")

        bigrams = []
        for i in range(len(self.tokens) - 1):
            bigram = f"{self.tokens[i]} {self.tokens[i+1]}"
            bigrams.append(bigram)

        counts = Counter(bigrams)

        results = [
            {"gram": gram, "count": count}
            for gram, count in counts.most_common()
        ]

        print(f"✅ Generated {len(results):,} bigrams")
        return results

    def generate_trigrams(self) -> List[Dict[str, Any]]:
        """Generate trigrams (three-word patterns)"""
        print("\n🔤🔤🔤 Generating trigrams...")

        trigrams = []
        for i in range(len(self.tokens) - 2):
            trigram = f"{self.tokens[i]} {self.tokens[i+1]} {self.tokens[i+2]}"
            trigrams.append(trigram)

        counts = Counter(trigrams)

        results = [
            {"gram": gram, "count": count}
            for gram, count in counts.most_common()
        ]

        print(f"✅ Generated {len(results):,} trigrams")
        return results

    def generate_quadragrams(self) -> List[Dict[str, Any]]:
        """Generate quadragrams (four-word sequences)"""
        print("\n🔤🔤🔤🔤 Generating quadragrams...")

        quadragrams = []
        for i in range(len(self.tokens) - 3):
            quadragram = ' '.join(self.tokens[i:i+4])
            quadragrams.append(quadragram)

        counts = Counter(quadragrams)

        results = [
            {"gram": gram, "count": count}
            for gram, count in counts.most_common()
        ]

        print(f"✅ Generated {len(results):,} quadragrams")
        return results

    def generate_pentagrams(self) -> List[Dict[str, Any]]:
        """Generate pentagrams (five-word chains)"""
        print("\n🔤×5 Generating pentagrams...")

        pentagrams = []
        for i in range(len(self.tokens) - 4):
            pentagram = ' '.join(self.tokens[i:i+5])
            pentagrams.append(pentagram)

        counts = Counter(pentagrams)

        results = [
            {"gram": gram, "count": count}
            for gram, count in counts.most_common()
        ]

        print(f"✅ Generated {len(results):,} pentagrams")
        return results

    def generate_supagrams(self) -> List[Dict[str, Any]]:
        """Generate supagrams (6-grams)"""
        print("\n🔤×6 Generating supagrams...")

        supagrams = []
        for i in range(len(self.tokens) - 5):
            supagram = ' '.join(self.tokens[i:i+6])
            supagrams.append(supagram)

        counts = Counter(supagrams)

        results = [
            {"gram": gram, "count": count}
            for gram, count in counts.most_common()
        ]

        print(f"✅ Generated {len(results):,} supagrams")
        return results

    def generate_glyphgrams(self, top_n: int = 1000) -> List[Dict[str, Any]]:
        """Generate glyphgrams (character-level 3-grams)"""
        print("\n🔣 Generating glyphgrams...")

        # Combine all tokens into single string
        full_text = ''.join(self.tokens)

        glyphgrams = []
        for i in range(len(full_text) - 2):
            glyphgram = full_text[i:i+3]
            glyphgrams.append(glyphgram)

        counts = Counter(glyphgrams)

        results = [
            {"gram": gram, "count": count}
            for gram, count in counts.most_common(top_n)
        ]

        print(f"✅ Generated {len(results):,} glyphgrams (top {top_n})")
        return results

    def generate_quantum_grams(self) -> List[Dict[str, Any]]:
        """Generate quantum grams (skip-grams with distance 2)"""
        print("\n⚛️ Generating quantum grams...")

        quantum_grams = []
        for i in range(0, len(self.tokens) - 4, 2):
            # Skip-gram: word at i, i+2, i+4 (skipping intermediate words)
            quantum = f"{self.tokens[i]} {self.tokens[i+2]} {self.tokens[i+4]}"
            quantum_grams.append(quantum)

        counts = Counter(quantum_grams)

        results = [
            {"gram": gram, "count": count}
            for gram, count in counts.most_common()
        ]

        print(f"✅ Generated {len(results):,} quantum grams")
        return results

    def generate_at_grams(self) -> List[Dict[str, Any]]:
        """Generate @grams (special ASXR/XCFE control patterns)"""
        print("\n@ Generating @grams...")

        # Extract @-prefixed patterns
        at_pattern = re.compile(r'@\w+')
        at_grams = []

        for text in self.corpus:
            matches = at_pattern.findall(text)
            at_grams.extend(matches)

        counts = Counter(at_grams)

        results = [
            {"gram": gram, "count": count}
            for gram, count in counts.most_common()
        ]

        print(f"✅ Generated {len(results):,} @grams")
        return results

    def save_ngrams(self, ngrams: List[Dict], gram_type: str):
        """Save n-grams to file"""
        self.output_path.mkdir(parents=True, exist_ok=True)

        if self.format_type == "xjson":
            output = {
                **self.metadata,
                "gram_type": gram_type,
                "count": len(ngrams),
                "grams": ngrams
            }
        else:
            output = ngrams

        output_file = self.output_path / f"{gram_type}.json"

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"💾 Saved to {output_file}")

    def generate_all(self, gram_types: List[str] = None):
        """Generate all n-gram types"""
        # Load corpus
        self.load_corpus()

        # Define generators
        generators = {
            'unigrams': self.generate_unigrams,
            'bigrams': self.generate_bigrams,
            'trigrams': self.generate_trigrams,
            'quadragrams': self.generate_quadragrams,
            'pentagrams': self.generate_pentagrams,
            'supagrams': self.generate_supagrams,
            'glyphgrams': self.generate_glyphgrams,
            'quantum': self.generate_quantum_grams,
            '@grams': self.generate_at_grams,
        }

        # If no types specified, generate all
        if not gram_types or gram_types == ['all']:
            gram_types = list(generators.keys())

        # Generate each type
        for gram_type in gram_types:
            if gram_type in generators:
                ngrams = generators[gram_type]()
                self.save_ngrams(ngrams, gram_type)
            else:
                print(f"⚠️ Warning: Unknown gram type '{gram_type}'")

        print("\n✅ All n-grams generated successfully!")
        print(f"📁 Output directory: {self.output_path}")

    def generate_manifest(self):
        """Generate ASXR manifest for n-grams"""
        manifest = {
            "@context": "xjson://asxr/ngrams/manifest/v1",
            "@v": "1.0.0",
            "n": "ASX N-Gram Manifest",
            "d": "Cognitive memory n-gram stores for ASXR Trinity",
            "law": "ASX = XCFE = XJSON = KUHUL = AST",

            "asx_ram": {
                "type": "volatile_cognitive_memory",
                "backing": "user_store",
                "stores": {
                    "ngrams": str(self.output_path / "unigrams.json"),
                    "@grams": str(self.output_path / "@grams.json"),
                    "quadragrams": str(self.output_path / "quadragrams.json"),
                    "pentagrams": str(self.output_path / "pentagrams.json"),
                    "supagrams": str(self.output_path / "supagrams.json"),
                    "glyphgrams": str(self.output_path / "glyphgrams.json"),
                    "quantum": str(self.output_path / "quantum.json"),
                },
                "learning_mode": "continuous"
            },

            "metadata": {
                "generated_at": str(Path.cwd()),
                "input_path": str(self.input_path),
                "output_path": str(self.output_path),
                "format": self.format_type
            }
        }

        manifest_file = self.output_path / "manifest.json"
        with open(manifest_file, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2)

        print(f"\n📋 Generated manifest: {manifest_file}")


def main():
    parser = argparse.ArgumentParser(
        description="ASX N-Gram Builder - Generate cognitive memory patterns for ASXR Trinity",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate all n-gram types
  python build_ngrams.py --input ./data --output ./ngrams --all-types

  # Generate specific types
  python build_ngrams.py --input corpus.txt --output ./out --types bigrams trigrams

  # Generate with XJSON format
  python build_ngrams.py --input ./data --output ./ngrams --format xjson --all-types

  # Generate with manifest
  python build_ngrams.py --input ./data --output ./ngrams --all-types --manifest

N-Gram Types:
  unigrams      - Single words (base vocabulary)
  bigrams       - Word pairs
  trigrams      - Three-word patterns
  quadragrams   - Four-word sequences
  pentagrams    - Five-word chains
  supagrams     - Six-word advanced patterns
  glyphgrams    - Character-level 3-grams
  quantum       - Skip-grams with distance 2
  @grams        - XCFE control patterns
        """
    )

    parser.add_argument('--input', required=True, help='Input file or directory')
    parser.add_argument('--output', required=True, help='Output directory')
    parser.add_argument('--types', nargs='+', help='N-gram types to generate')
    parser.add_argument('--all-types', action='store_true', help='Generate all n-gram types')
    parser.add_argument('--format', choices=['json', 'xjson'], default='json', help='Output format')
    parser.add_argument('--manifest', action='store_true', help='Generate ASXR manifest')

    args = parser.parse_args()

    # Banner
    print("=" * 70)
    print("🧠 ASX N-Gram Builder - XJSON/XCFE/KUHUL Compatible")
    print("=" * 70)
    print()

    # Build n-grams
    builder = ASXNGramBuilder(args.input, args.output, args.format)

    gram_types = args.types if args.types else ['all'] if args.all_types else ['bigrams']

    builder.generate_all(gram_types)

    # Generate manifest if requested
    if args.manifest:
        builder.generate_manifest()

    print("\n" + "=" * 70)
    print("✅ Done! N-grams ready for ASXR Trinity cognitive memory system")
    print("=" * 70)


if __name__ == "__main__":
    main()
