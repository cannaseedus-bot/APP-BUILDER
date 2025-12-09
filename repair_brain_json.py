#!/usr/bin/env python3
"""
Repairs and cleans brain JSON files with encoding/syntax issues
"""

import json
import re
from pathlib import Path


def clean_json_string(content: str) -> str:
    """Clean and repair JSON string."""

    # Remove BOM and special characters
    content = content.replace('\ufeff', '')
    content = content.replace('\u200b', '')

    # Fix common JSON syntax errors
    # Fix unescaped quotes in strings
    content = re.sub(r'(?<!\\)"NGRAM_TOKENIZATION_COMPLETE"', r'"NGRAM_TOKENIZATION_COMPLETE\\"', content)

    # Remove trailing commas before closing braces/brackets
    content = re.sub(r',\s*}', '}', content)
    content = re.sub(r',\s*]', ']', content)

    # Fix unicode tensor product symbols that might break JSON
    content = content.replace('⊗', '⊗')  # Normalize
    content = content.replace('⟩', '>')  # Replace quantum ket
    content = content.replace('⟨', '<')  # Replace quantum bra

    return content


def extract_valid_sections(filepath: str) -> dict:
    """Extract valid JSON sections from a file with errors."""

    print(f"🔧 Repairing: {Path(filepath).name}")

    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Clean the content
    content = clean_json_string(content)

    # Try to parse the whole thing
    try:
        data = json.loads(content)
        print(f"   ✓ JSON is valid!")
        return data
    except json.JSONDecodeError as e:
        print(f"   ⚠️  JSON error at line {e.lineno}: {e.msg}")
        print(f"   🔨 Attempting section-by-section extraction...")

        # Extract valid sections
        result = {
            "@manifest": "REPAIRED_BRAIN_ADDON",
            "@note": "Extracted from file with JSON errors",
            "@original_file": str(filepath),
            "@sections": {}
        }

        # Try to extract top-level sections
        lines = content.split('\n')
        current_section = None
        current_lines = []
        brace_depth = 0

        for i, line in enumerate(lines):
            # Track brace depth
            brace_depth += line.count('{') - line.count('}')

            # Check if this is a section header
            if re.match(r'^\s*"[^"]+"\s*:\s*{', line):
                # Save previous section if exists
                if current_section and current_lines:
                    section_json = '\n'.join(current_lines)
                    try:
                        # Wrap in object to parse
                        wrapped = '{' + section_json + '}'
                        section_data = json.loads(wrapped)
                        result["@sections"][current_section] = section_data.get(current_section, {})
                        print(f"   ✓ Extracted section: {current_section}")
                    except:
                        print(f"   ✗ Failed to extract: {current_section}")

                # Start new section
                match = re.match(r'^\s*"([^"]+)"\s*:', line)
                if match:
                    current_section = match.group(1)
                    current_lines = [line]
            elif current_section:
                current_lines.append(line)

        # Save last section
        if current_section and current_lines:
            section_json = '\n'.join(current_lines)
            try:
                wrapped = '{' + section_json + '}'
                section_data = json.loads(wrapped)
                result["@sections"][current_section] = section_data.get(current_section, {})
                print(f"   ✓ Extracted section: {current_section}")
            except:
                print(f"   ✗ Failed to extract: {current_section}")

        print(f"   📦 Extracted {len(result['@sections'])} sections")
        return result


def main():
    """Main repair process."""
    print("🔧 BRAIN JSON REPAIR UTILITY")
    print("="*60)

    # Repair the new brain addon
    addon_path = "/tmp/new-brain-addon.json"

    if Path(addon_path).exists():
        repaired_data = extract_valid_sections(addon_path)

        # Save repaired version
        output_path = "BRAINS-ADD-ON-REPAIRED.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(repaired_data, f, indent=2, ensure_ascii=False)

        size = Path(output_path).stat().st_size / 1024
        print(f"\n✅ Saved repaired JSON: {output_path} ({size:.1f} KB)")
        print(f"   Sections extracted: {len(repaired_data.get('@sections', {}))}")
    else:
        print(f"⚠️  File not found: {addon_path}")

    print("\n" + "="*60)


if __name__ == "__main__":
    main()
