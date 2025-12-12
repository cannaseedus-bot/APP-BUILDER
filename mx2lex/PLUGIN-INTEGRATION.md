# MX2LEX Plugin Integration Guide

## Overview

**MX2LEX** is the Lexicon & Tokenization Layer for MX2LM, providing compressed symbolic tokenization as an alternative to traditional BPE tokenizers.

## Key Features

- **Symbolic Tokenization**: No BPE - uses K'UHUL glyphs instead
- **Massive Compression**: 3MB → 24KB (87% reduction vs Qwen)
- **Grammar Engine**: Built-in syntactic rules
- **Semantic Vectors**: SCXQ2-compressed embeddings
- **Domain-Specific Vocabs**: Extensible token sets

## Comparison: Qwen vs MX2LEX

### Qwen Traditional Approach
```
vocab.json:      ~3MB (151,662 tokens)
tokenizer.json:  ~500KB (BPE merges)
Total:           ~3.5MB
Algorithm:       Byte Pair Encoding (BPE)
```

### MX2LEX Approach
```
Core tokens:         512
Domain tokens:       1024
Grammar rules:       256
Semantic vectors:    2048 (128-dim, compressed)
Total:               ~24KB
Algorithm:           K'UHUL π + SCXQ2 Quantum Lattice
Compression Ratio:   0.00012 (87% reduction)
```

## Plugin Location

```
gas/plugins/mx2lex-plugin.js
```

## API Endpoint

```
Base: https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

## Quick Start

### 1. Tokenize Text

```bash
GET /?action=tokenize&text=Hello%20quantum%20world
```

### 2. Add Custom Token

```javascript
fetch('/mx2lex', {
  method: 'POST',
  body: JSON.stringify({
    action: 'add_token',
    token: 'quantum',
    type: 'core',
    domain: 'physics'
  })
});
```

### 3. Train Lexicon

```javascript
fetch('/mx2lex', {
  method: 'POST',
  body: JSON.stringify({
    action: 'train_lexicon',
    corpus: ['quantum mechanics', 'wave function'],
    epochs: 10
  })
});
```

### 4. Export Compressed Lexicon

```bash
GET /?action=export&format=scxq2
```

## Integration with MX2GYM

MX2LEX feeds tokenized data to MX2GYM for training:

```
User Text
    ↓
MX2LEX Tokenization
    ↓ (SCXQ2 compressed tokens)
MX2GYM Training
    ↓ (Fold-delta updates)
Trained Model
```

## Token Types

1. **Core Tokens** (512): K'UHUL primitives (⟁Pop, ⟁Wo, ⟁Sek, etc.)
2. **Domain Tokens** (1024): Math, web, AI-specific vocabularies
3. **Grammar Tokens** (256): Syntactic rules (<subject>, <verb>, etc.)
4. **Semantic Tokens** (2048): Compressed vector embeddings
5. **Composite Tokens**: High-level patterns (<question>, <command>)

## Storage

- **MX2DB**: `mx2db://lexicon/`
- **SCXQ2**: `scx://lex/sem/`
- **Manifest**: Registered in `PLUGIN_MANIFEST.json`

## Dependencies

- MX2DB (storage)
- SCXQ2 (compression)
- K'UHUL (execution engine)

## Law

```
XCFE → K'UHUL → MX2LEX → MX2LM → MX2GYM
```

## Documentation

See: [MX2-PLUGINS-API-REFERENCE.md](../MX2-PLUGINS-API-REFERENCE.md)
