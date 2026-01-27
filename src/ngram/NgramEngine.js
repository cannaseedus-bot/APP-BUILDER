// File: /src/ngram/NgramEngine.js
// N-GRAM ENGINE - Processes text into unigram/bigram/trigram atomic blocks

import AtomicBlock from '../atomic/AtomicBlock.js';

export class NgramEngine {
  constructor() {
    this.unigrams = new Map();    // token -> AtomicBlock
    this.bigrams = new Map();     // "token1 token2" -> AtomicBlock
    this.trigrams = new Map();    // "t1 t2 t3" -> AtomicBlock
    this.pentagrams = new Map();  // 5-gram patterns
    this.supagrams = new Map();   // 7-gram patterns/routines
  }

  processText(text) {
    // 1. Tokenize (simplest possible)
    const tokens = text.toLowerCase()
                       .replace(/[^\w\s]/g, ' ')
                       .split(/\s+/)
                       .filter(t => t.length > 0);

    // 2. Create unigram atomic blocks
    const unigramBlocks = tokens.map(token =>
      new AtomicBlock('unigram',
        ['@store', '@recall', '@match'],
        { token, frequency: 1, contexts: [] },
        `Token: ${token}`,
        []
      )
    );

    // 3. Create bigram atomic blocks
    const bigramBlocks = [];
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]} ${tokens[i+1]}`;
      bigramBlocks.push(
        new AtomicBlock('bigram',
          ['@pattern', '@predict_next', '@collocate'],
          {
            pair: [tokens[i], tokens[i+1]],
            probability: 0.5,
            strength: 1.0
          },
          `Connection: ${tokens[i]} → ${tokens[i+1]}`,
          [`unigram_${tokens[i]}`, `unigram_${tokens[i+1]}`]
        )
      );
    }

    // 4. Create trigram atomic blocks
    const trigramBlocks = [];
    for (let i = 0; i < tokens.length - 2; i++) {
      const trigram = `${tokens[i]} ${tokens[i+1]} ${tokens[i+2]}`;
      trigramBlocks.push(
        new AtomicBlock('trigram',
          ['@pattern', '@intent', '@micro_command'],
          {
            sequence: [tokens[i], tokens[i+1], tokens[i+2]],
            probability: 0.6,
            intent: this.detectIntent(tokens.slice(i, i+3))
          },
          `Intent: ${trigram}`,
          []
        )
      );
    }

    // 5. Create pentagram blocks (5-grams)
    const pentagramBlocks = [];
    for (let i = 0; i < tokens.length - 4; i++) {
      const pentagram = tokens.slice(i, i+5).join(' ');
      pentagramBlocks.push(
        new AtomicBlock('pentagram',
          ['@pattern_phrase', '@pipeline', '@routine_hint'],
          {
            sequence: tokens.slice(i, i+5),
            pattern: this.detectPattern(tokens.slice(i, i+5)),
            probability: 0.7
          },
          `Pattern: ${pentagram}`,
          []
        )
      );
    }

    // 6. Create supagram blocks (7-grams)
    const supagramBlocks = [];
    for (let i = 0; i < tokens.length - 6; i++) {
      const supagram = tokens.slice(i, i+7).join(' ');
      supagramBlocks.push(
        new AtomicBlock('supagram',
          ['@routine', '@macro', '@pipeline_full'],
          {
            sequence: tokens.slice(i, i+7),
            routine: this.detectRoutine(tokens.slice(i, i+7)),
            probability: 0.8
          },
          `Routine: ${supagram}`,
          []
        )
      );
    }

    return {
      unigramBlocks,
      bigramBlocks,
      trigramBlocks,
      pentagramBlocks,
      supagramBlocks,
      tokens
    };
  }

  // Store in memory
  storeNgram(atomicBlock) {
    const type = atomicBlock['@type'];
    const id = atomicBlock['@id'];

    switch(type) {
      case 'unigram':
        this.unigrams.set(id, atomicBlock);
        break;
      case 'bigram':
        this.bigrams.set(id, atomicBlock);
        break;
      case 'trigram':
        this.trigrams.set(id, atomicBlock);
        break;
      case 'pentagram':
        this.pentagrams.set(id, atomicBlock);
        break;
      case 'supagram':
        this.supagrams.set(id, atomicBlock);
        break;
    }
  }

  // Detect intent from trigram
  detectIntent(tokens) {
    const pattern = tokens.join(' ').toLowerCase();

    if (pattern.includes('create') || pattern.includes('make') || pattern.includes('forge')) {
      return 'action_create';
    } else if (pattern.includes('delete') || pattern.includes('remove')) {
      return 'action_delete';
    } else if (pattern.includes('update') || pattern.includes('change')) {
      return 'action_update';
    } else if (pattern.includes('get') || pattern.includes('show') || pattern.includes('find')) {
      return 'action_query';
    }

    return 'intent_generic';
  }

  // Detect pattern from pentagram
  detectPattern(tokens) {
    const pattern = tokens.join(' ').toLowerCase();

    if (pattern.includes('doom') && pattern.includes('hud')) {
      return 'doom_hud_pipeline';
    } else if (pattern.includes('hell') && pattern.includes('city')) {
      return 'doom_world_city';
    } else if (pattern.includes('create') && pattern.includes('save')) {
      return 'create_and_persist';
    }

    return 'pattern_generic';
  }

  // Detect routine from supagram
  detectRoutine(tokens) {
    const pattern = tokens.join(' ').toLowerCase();

    if (pattern.includes('forge') && pattern.includes('doom') && pattern.includes('save')) {
      return 'doom_forge_and_save';
    } else if (pattern.includes('drop') && pattern.includes('hell') && pattern.includes('arena')) {
      return 'spawn_city_start_arena';
    }

    return 'routine_generic';
  }

  // Query n-grams
  query(type, filter = {}) {
    let map;
    switch(type) {
      case 'unigram': map = this.unigrams; break;
      case 'bigram': map = this.bigrams; break;
      case 'trigram': map = this.trigrams; break;
      case 'pentagram': map = this.pentagrams; break;
      case 'supagram': map = this.supagrams; break;
      default: return [];
    }

    const results = [];
    for (const [id, block] of map) {
      let matches = true;
      for (const [key, value] of Object.entries(filter)) {
        if (block['@variable'][key] !== value) {
          matches = false;
          break;
        }
      }
      if (matches) {
        results.push(block);
      }
    }

    return results;
  }

  // Get statistics
  getStats() {
    return {
      unigrams: this.unigrams.size,
      bigrams: this.bigrams.size,
      trigrams: this.trigrams.size,
      pentagrams: this.pentagrams.size,
      supagrams: this.supagrams.size,
      total: this.unigrams.size + this.bigrams.size + this.trigrams.size +
             this.pentagrams.size + this.supagrams.size
    };
  }
}

export default NgramEngine;
