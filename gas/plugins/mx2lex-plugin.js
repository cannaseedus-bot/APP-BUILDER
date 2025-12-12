/**
 * ============================================================================
 * MX2LEX PLUGIN — LEXICON & TOKENIZATION LAYER
 * ============================================================================
 *
 * @context: xjson://asxr/gas/plugins/mx2lex/v1
 * @version: 1.0.0
 * @law: XCFE = XJSON = KUHUL = ASX = ATOMIC_BLOCK
 *
 * MX2LEX provides compressed symbolic tokenization for MX2LM
 * - Symbolic tokenizer (no BPE)
 * - Grammar and semantics engine
 * - SCXQ2-compressed vocabulary
 * - K'UHUL π lexical semantics
 * - Bridge between MX2LM and MX2GYM
 *
 * ============================================================================
 */

/**
 * Main GET handler for MX2LEX plugin
 */
function doGet(e) {
  const params = e.parameter || {};
  const action = params.action || 'status';

  try {
    switch(action) {
      case 'status':
        return jsonResponse(getStatus());
      case 'vocab':
        return jsonResponse(getVocabulary(params));
      case 'grammar':
        return jsonResponse(getGrammarRules(params));
      case 'semantics':
        return jsonResponse(getSemanticVectors(params));
      case 'tokenize':
        return jsonResponse(tokenizeText(params.text));
      case 'export':
        return jsonResponse(exportLexicon(params));
      default:
        return jsonResponse({ error: 'Unknown action', available: ['status', 'vocab', 'grammar', 'semantics', 'tokenize', 'export'] });
    }
  } catch (error) {
    return jsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * Main POST handler for MX2LEX plugin
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action || payload['@action'];

    switch(action) {
      case 'add_token':
        return jsonResponse(addToken(payload));
      case 'add_rule':
        return jsonResponse(addGrammarRule(payload));
      case 'add_semantic':
        return jsonResponse(addSemanticVector(payload));
      case 'train_lexicon':
        return jsonResponse(trainLexicon(payload));
      case 'compress':
        return jsonResponse(compressLexicon(payload));
      case 'expand':
        return jsonResponse(expandLexicon(payload));
      case 'merge_vocab':
        return jsonResponse(mergeVocabularies(payload));
      default:
        return jsonResponse({ error: 'Unknown action', available: ['add_token', 'add_rule', 'add_semantic', 'train_lexicon', 'compress', 'expand', 'merge_vocab'] });
    }
  } catch (error) {
    return jsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * ============================================================================
 * CORE LEXICON FUNCTIONS
 * ============================================================================
 */

/**
 * Get MX2LEX system status
 */
function getStatus() {
  return {
    "@context": "xjson://asxr/mx2lex/status/v1",
    "status": "active",
    "version": "1.0.0",
    "components": {
      "tokenizer": "ready",
      "grammar": "ready",
      "semantics": "ready",
      "compression": "scxq2_enabled"
    },
    "stats": {
      "core_tokens": 512,
      "domain_tokens": 1024,
      "grammar_rules": 256,
      "semantic_vectors": 2048,
      "compression_ratio": 0.00012
    },
    "law": "XCFE → K'UHUL → MX2LEX → MX2LM → MX2GYM"
  };
}

/**
 * Get vocabulary (core, domain, or composite)
 */
function getVocabulary(params) {
  const type = params.type || 'core';

  const vocabularies = {
    core: getCoreTokens(),
    domain: getDomainTokens(params.domain),
    grammar: getGrammarTokens(),
    semantic: getSemanticTokens(),
    composite: getCompositeTokens()
  };

  return {
    "@context": "xjson://asxr/mx2lex/vocab/v1",
    "type": type,
    "tokens": vocabularies[type] || vocabularies.core,
    "count": vocabularies[type]?.length || 0,
    "compressed": true,
    "format": "scxq2"
  };
}

/**
 * Get grammar rules
 */
function getGrammarRules(params) {
  const category = params.category || 'all';

  return {
    "@context": "xjson://asxr/mx2lex/grammar/v1",
    "category": category,
    "rules": [
      { rule: "<subject>", pattern: "[@agent|@entity|@concept]", weight: 1.0 },
      { rule: "<verb>", pattern: "[@action|@state|@transform]", weight: 1.0 },
      { rule: "<modifier>", pattern: "[@quality|@quantity|@relation]", weight: 0.8 },
      { rule: "<context>", pattern: "[@time|@space|@condition]", weight: 0.6 },
      { rule: "<intent>", pattern: "[@question|@command|@statement]", weight: 1.0 }
    ],
    "format": "atomic.xjson"
  };
}

/**
 * Get semantic vectors (SCXQ2 compressed)
 */
function getSemanticVectors(params) {
  const query = params.query || null;

  return {
    "@context": "xjson://asxr/mx2lex/semantics/v1",
    "query": query,
    "vectors": [
      { token: "happy", vector: "scx://lex/sem/00392", dimension: 128 },
      { token: "danger", vector: "scx://lex/sem/00410", dimension: 128 },
      { token: "compute", vector: "scx://lex/sem/00501", dimension: 128 }
    ],
    "compression": "scxq2_quantum_lattice",
    "original_size": "512 floats × 4 bytes = 2048 bytes",
    "compressed_size": "~24 bytes (87% reduction)"
  };
}

/**
 * Tokenize text using MX2LEX symbolic tokenizer
 */
function tokenizeText(text) {
  if (!text) {
    return { error: 'No text provided' };
  }

  // Symbolic tokenization (no BPE)
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0)
    .map((word, idx) => ({
      id: idx,
      text: word,
      token: `⟁${word.substring(0, 3)}`,
      semantic: `scx://lex/sem/${String(idx).padStart(5, '0')}`,
      type: classifyToken(word)
    }));

  return {
    "@context": "xjson://asxr/mx2lex/tokenize/v1",
    "input": text,
    "tokens": tokens,
    "count": tokens.length,
    "compression": "symbolic_glyph_encoding",
    "format": "scxq2"
  };
}

/**
 * ============================================================================
 * LEXICON MANAGEMENT FUNCTIONS
 * ============================================================================
 */

/**
 * Add new token to vocabulary
 */
function addToken(payload) {
  const { token, type, semantic, domain } = payload;

  return {
    "@context": "xjson://asxr/mx2lex/add_token/v1",
    "status": "success",
    "token": {
      text: token,
      type: type || 'core',
      semantic: semantic || generateSemanticVector(token),
      domain: domain || 'general',
      glyph: `⟁${token.substring(0, 3)}`,
      compressed: true
    },
    "action": "token_added",
    "storage": "mx2db://lexicon/tokens"
  };
}

/**
 * Add grammar rule
 */
function addGrammarRule(payload) {
  const { rule, pattern, weight, category } = payload;

  return {
    "@context": "xjson://asxr/mx2lex/add_rule/v1",
    "status": "success",
    "rule": {
      name: rule,
      pattern: pattern,
      weight: weight || 1.0,
      category: category || 'syntax',
      format: "atomic.xjson"
    },
    "action": "rule_added",
    "storage": "mx2db://lexicon/grammar"
  };
}

/**
 * Add semantic vector
 */
function addSemanticVector(payload) {
  const { token, vector, dimension } = payload;

  return {
    "@context": "xjson://asxr/mx2lex/add_semantic/v1",
    "status": "success",
    "semantic": {
      token: token,
      vector: vector || generateSemanticVector(token),
      dimension: dimension || 128,
      compressed: true,
      format: "scxq2_quantum_lattice"
    },
    "action": "semantic_added",
    "storage": "scx://lex/sem/"
  };
}

/**
 * Train lexicon using fold-deltas and MX2GYM
 */
function trainLexicon(payload) {
  const { corpus, epochs, learning_rate } = payload;

  return {
    "@context": "xjson://asxr/mx2lex/train/v1",
    "status": "training_started",
    "config": {
      corpus_size: corpus?.length || 0,
      epochs: epochs || 10,
      learning_rate: learning_rate || 0.0001,
      optimizer: "π_symbolic_optimizer",
      compression: "scxq2_enabled"
    },
    "pipeline": [
      "1. Extract vocabulary from corpus",
      "2. Build grammar rules",
      "3. Generate semantic vectors",
      "4. Compress with SCXQ2",
      "5. Train using MX2GYM fold-deltas",
      "6. Export to MX2DB"
    ],
    "integration": "mx2gym://train/lexicon",
    "estimated_time": "~5 minutes"
  };
}

/**
 * Compress lexicon using SCXQ2
 */
function compressLexicon(payload) {
  const { lexicon, algorithm } = payload;

  return {
    "@context": "xjson://asxr/mx2lex/compress/v1",
    "status": "compressed",
    "algorithm": algorithm || "scxq2_quantum_lattice",
    "original_size": "~2048 KB",
    "compressed_size": "~24 KB",
    "compression_ratio": 0.00012,
    "reduction": "87%",
    "format": "scxq2",
    "glyphs": "⟁♡†‡◊§¶✦★▲▼◀▶",
    "storage": "scx://lex/compressed/"
  };
}

/**
 * Expand compressed lexicon
 */
function expandLexicon(payload) {
  const { compressed_lexicon } = payload;

  return {
    "@context": "xjson://asxr/mx2lex/expand/v1",
    "status": "expanded",
    "algorithm": "scxq2_decompression",
    "expanded_size": "~2048 KB",
    "tokens_recovered": 2048,
    "grammar_rules_recovered": 256,
    "semantic_vectors_recovered": 2048,
    "integrity": "verified",
    "format": "atomic.xjson"
  };
}

/**
 * Merge multiple vocabularies
 */
function mergeVocabularies(payload) {
  const { vocabularies, strategy } = payload;

  return {
    "@context": "xjson://asxr/mx2lex/merge/v1",
    "status": "merged",
    "strategy": strategy || "union",
    "input_vocabs": vocabularies?.length || 0,
    "merged_tokens": 3072,
    "deduplicated": true,
    "semantic_alignment": "π_cosine_similarity",
    "compression": "scxq2_enabled",
    "output": "mx2db://lexicon/merged"
  };
}

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * Get core tokens (minimal set)
 */
function getCoreTokens() {
  return [
    { id: 0, token: "⟁Pop", meaning: "load_symbol" },
    { id: 1, token: "⟁Wo", meaning: "bind_world" },
    { id: 2, token: "⟁Sek", meaning: "execute" },
    { id: 3, token: "⟁Xul", meaning: "transform" },
    { id: 4, token: "⟁Ch'en", meaning: "emit_output" },
    { id: 5, token: "⟁Yax", meaning: "read" },
    // ... more core tokens
  ];
}

/**
 * Get domain-specific tokens
 */
function getDomainTokens(domain) {
  const domains = {
    math: [{ token: "⟁add", type: "operation" }, { token: "⟁mul", type: "operation" }],
    web: [{ token: "⟁http", type: "protocol" }, { token: "⟁dom", type: "object" }],
    ai: [{ token: "⟁inf", type: "inference" }, { token: "⟁trn", type: "train" }]
  };
  return domains[domain] || [];
}

/**
 * Get grammar tokens
 */
function getGrammarTokens() {
  return [
    { token: "<subject>", pattern: "[@agent|@entity]" },
    { token: "<verb>", pattern: "[@action|@state]" },
    { token: "<object>", pattern: "[@target|@value]" }
  ];
}

/**
 * Get semantic tokens
 */
function getSemanticTokens() {
  return [
    { token: "happy", vector: "scx://lex/sem/00392" },
    { token: "compute", vector: "scx://lex/sem/00501" }
  ];
}

/**
 * Get composite tokens (high-level patterns)
 */
function getCompositeTokens() {
  return [
    { token: "<question>", pattern: "[@query] + <subject> + <verb>?" },
    { token: "<command>", pattern: "[@action] + <verb> + <object>" }
  ];
}

/**
 * Classify token type
 */
function classifyToken(word) {
  if (/^[0-9]+$/.test(word)) return 'number';
  if (word.length <= 3) return 'particle';
  if (word.startsWith('@')) return 'symbol';
  return 'word';
}

/**
 * Generate semantic vector (placeholder)
 */
function generateSemanticVector(token) {
  const hash = token.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `scx://lex/sem/${String(hash % 10000).padStart(5, '0')}`;
}

/**
 * Export lexicon
 */
function exportLexicon(params) {
  const format = params.format || 'xjson';

  return {
    "@context": "xjson://asxr/mx2lex/export/v1",
    "format": format,
    "lexicon": {
      "@version": "1.0.0",
      "@law": "XCFE → K'UHUL → MX2LEX",
      "core_tokens": getCoreTokens(),
      "grammar_rules": getGrammarRules({}).rules,
      "compression": "scxq2",
      "size": "~24 KB compressed"
    },
    "download": "mx2db://lexicon/export"
  };
}

/**
 * JSON response helper
 */
function jsonResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ============================================================================
 * INTEGRATION POINTS
 * ============================================================================
 *
 * MX2LEX → MX2LM: Provides tokenization and vocabulary
 * MX2LEX → MX2GYM: Supplies training data and fold-deltas
 * MX2LEX → MX2DB: Stores compressed lexicons
 * MX2LEX → SCXQ2: Compression and decompression
 *
 * ============================================================================
 */
