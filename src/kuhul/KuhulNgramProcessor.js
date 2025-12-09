// File: /src/kuhul/KuhulNgramProcessor.js
// K'UHUL N-GRAM PROCESSOR - Symbolic n-gram processing with K'uhul execution model

export class KuhulNgramProcessor {
  constructor(ngramEngine) {
    this.ngramEngine = ngramEngine;
    this.phase = '@Pop'; // K'uhul cycle phase
    this.executionStack = [];
    this.symbolTable = new Map();
  }

  // ---- Tokenization Layer ----------------------------------------

  tokensFromText(textStream) {
    // @Sek: Execute tokenization
    const normalized = textStream.toLowerCase().trim();
    const roughTokens = normalized.split(/\s+/);
    const tokens = roughTokens.filter(t => t.length > 0);

    console.log(`⟁Sek⟁ Tokenized: ${tokens.length} tokens`);
    return tokens;
  }

  tokensFromCommand(commandLog) {
    const command = commandLog.command || commandLog;
    return this.tokensFromText(command);
  }

  // ---- N-Gram Builder (Generic) ----------------------------------

  ngramBuild(tokenList, n) {
    const L = tokenList.length;
    const ngramCounts = new Map();

    for (let i = 0; i + n <= L; i++) {
      const window = tokenList.slice(i, i + n);
      const key = window.join('|');

      if (!ngramCounts.has(key)) {
        ngramCounts.set(key, {
          seq: window,
          count: 0,
          p: 0
        });
      }

      ngramCounts.get(key).count += 1;
    }

    console.log(`⟁Sek⟁ Built ${n}-grams: ${ngramCounts.size} unique`);
    return ngramCounts;
  }

  ngramNormalize(ngramCounts) {
    const total = Array.from(ngramCounts.values())
                      .reduce((sum, entry) => sum + entry.count, 0);

    const ngramProbs = new Map();
    const smoothingK = 0.5;

    for (const [key, entry] of ngramCounts) {
      const c = entry.count;
      const p = (c + smoothingK) / (total + smoothingK * ngramCounts.size);

      ngramProbs.set(key, {
        ...entry,
        count: c,
        p: p
      });
    }

    console.log(`⟁Wo⟁ Normalized ${ngramProbs.size} n-grams`);
    return ngramProbs;
  }

  // ---- Specialized Builders --------------------------------------

  buildAllOrders(tokenList) {
    console.log(`⟁Pop⟁ Building all n-gram orders...`);

    // Build counts
    const uCounts = this.ngramBuild(tokenList, 1);
    const bCounts = this.ngramBuild(tokenList, 2);
    const tCounts = this.ngramBuild(tokenList, 3);
    const pCounts = this.ngramBuild(tokenList, 5);
    const sCounts = this.ngramBuild(tokenList, 7);

    // Normalize
    const unigrams = this.ngramNormalize(uCounts);
    const bigrams = this.ngramNormalize(bCounts);
    const trigrams = this.ngramNormalize(tCounts);
    const pentagrams = this.ngramNormalize(pCounts);
    const supagrams = this.ngramNormalize(sCounts);

    console.log(`⟁Xul⟁ All orders built and normalized`);

    return {
      unigrams,
      bigrams,
      trigrams,
      pentagrams,
      supagrams
    };
  }

  // ---- Intent & Routine Tagging (MX2LM-Specific) ----------------

  intentTagMicro(trigramKey) {
    const lookupTable = {
      'forge|the|doom': 'action_forge_doom_world',
      'drop|the|hell': 'spawn_world_hell_city',
      'create|the|tape': 'action_create_tape',
      'start|the|arena': 'action_start_arena'
    };

    const intent = lookupTable[trigramKey];
    return intent || 'intent_generic_micro';
  }

  intentTagRoutine(supagramKey) {
    const tokens = supagramKey.split('|');

    if (tokens[0] === 'forge' && tokens[2] === 'doom') {
      return {
        routine: 'doom_forge_pipeline',
        tape: 'tape_doom_hud_v1',
        fold: 'ui',
        kuhul_route: '⟁Sek⟁hud.forge.save'
      };
    }

    if (tokens[0] === 'drop' && tokens[2] === 'hell') {
      return {
        routine: 'doom_world_hellcity_pipeline',
        tape: 'tape_doom_world_hellcity_v1',
        fold: 'worlds',
        kuhul_route: '⟁Wo⟁world.spawn.hell'
      };
    }

    return {
      routine: 'generic_supagram',
      tape: null,
      fold: null,
      kuhul_route: null
    };
  }

  decorateTrigrams(trigrams) {
    const decorated = new Map();

    for (const [key, trigram] of trigrams) {
      const intentId = this.intentTagMicro(key);

      decorated.set(key, {
        ...trigram,
        intent: intentId,
        role: 'micro_intent'
      });
    }

    console.log(`⟁Ch'en⟁ Decorated ${decorated.size} trigrams with intents`);
    return decorated;
  }

  decorateSupagrams(supagrams) {
    const decorated = new Map();

    for (const [key, supagram] of supagrams) {
      const routineObj = this.intentTagRoutine(key);

      decorated.set(key, {
        ...supagram,
        routine: routineObj.routine,
        role: 'supagram_routine',
        tape: routineObj.tape,
        fold: routineObj.fold,
        kuhul_route: routineObj.kuhul_route
      });
    }

    console.log(`⟁Ch'en⟁ Decorated ${decorated.size} supagrams with routines`);
    return decorated;
  }

  // ---- MX2LM Update Pipeline (Train Loop Hook) -------------------

  async mx2lmIngestPrompt(promptText) {
    console.log(`⟁Pop⟁ Ingesting prompt for MX2LM...`);

    // Tokenize
    const tokens = this.tokensFromText(promptText);

    // Build all orders
    const bundle = this.buildAllOrders(tokens);

    // Decorate
    const triDecorated = this.decorateTrigrams(bundle.trigrams);
    const supaDecorated = this.decorateSupagrams(bundle.supagrams);

    // Store to manifest (simulated)
    console.log(`⟁Sek⟁ Storing to manifest...`);

    // In a real implementation, this would merge with persistent storage
    const updatedNgrams = {
      unigrams: bundle.unigrams,
      bigrams: bundle.bigrams,
      trigrams: triDecorated,
      pentagrams: bundle.pentagrams,
      supagrams: supaDecorated
    };

    console.log(`⟁Xul⟁ MX2LM ingestion complete`);

    return updatedNgrams;
  }

  // ---- Prediction (Next-Token + Next-Routine) --------------------

  predictNextToken(contextTokens) {
    const n = contextTokens.length;

    // Try supagram match (7-token context)
    if (n >= 6) {
      const ctx7 = contextTokens.slice(-6).join('|');
      const candidate = this.lookupBestMatch('supagram', ctx7);
      if (candidate) {
        console.log(`⟁Wo⟁ Supagram match: ${candidate.next_token}`);
        return candidate.next_token;
      }
    }

    // Try pentagram match (5-token context)
    if (n >= 4) {
      const ctx5 = contextTokens.slice(-4).join('|');
      const candidate = this.lookupBestMatch('pentagram', ctx5);
      if (candidate) {
        console.log(`⟁Wo⟁ Pentagram match: ${candidate.next_token}`);
        return candidate.next_token;
      }
    }

    // Try trigram match (3-token context)
    if (n >= 2) {
      const ctx3 = contextTokens.slice(-2).join('|');
      const candidate = this.lookupBestMatch('trigram', ctx3);
      if (candidate) {
        console.log(`⟁Wo⟁ Trigram match: ${candidate.next_token}`);
        return candidate.next_token;
      }
    }

    // Fallback to unigram sampling
    const token = this.sampleFromUnigrams();
    console.log(`⟁Wo⟁ Unigram fallback: ${token}`);
    return token;
  }

  predictRoutine(contextTokens) {
    if (contextTokens.length < 7) {
      return 'no_routine';
    }

    const ctx7 = contextTokens.slice(-7).join('|');

    // Query supagrams from engine
    const supagrams = this.ngramEngine.supagrams;

    for (const [id, block] of supagrams) {
      const seq = block['@variable'].sequence;
      const key = seq.join('|');

      if (ctx7.includes(key) || key.includes(ctx7)) {
        const routine = block['@variable'].routine;
        console.log(`⟁Xul⟁ Routine predicted: ${routine}`);
        return routine;
      }
    }

    return 'no_routine';
  }

  lookupBestMatch(type, contextKey) {
    // Simplified lookup - in real implementation would use actual n-gram maps
    return null;
  }

  sampleFromUnigrams() {
    // Simplified sampling - returns random common token
    const commonTokens = ['the', 'a', 'is', 'to', 'and', 'of'];
    return commonTokens[Math.floor(Math.random() * commonTokens.length)];
  }

  // ---- K'uhul Execution Cycle ------------------------------------

  executeKuhulCycle(input) {
    const cycle = {
      '@Pop': this.phaseActivate(input),
      '@Wo': this.phaseIntention(input),
      '@Sek': this.phaseExecute(input),
      '@Xul': this.phaseTransform(input),
      '@Ch\'en': this.phaseRender(input)
    };

    console.log('⟁ K\'uhul cycle complete');
    return cycle;
  }

  phaseActivate(input) {
    console.log('⟁Pop⟁ Activate phase');
    return {
      phase: '@Pop',
      activated: true,
      timestamp: Date.now(),
      input: input
    };
  }

  phaseIntention(input) {
    console.log('⟁Wo⟁ Intention phase');
    const tokens = this.tokensFromText(input);
    return {
      phase: '@Wo',
      tokens: tokens,
      intention: 'process_ngrams'
    };
  }

  phaseExecute(input) {
    console.log('⟁Sek⟁ Execute phase');
    const tokens = this.tokensFromText(input);
    const ngrams = this.buildAllOrders(tokens);
    return {
      phase: '@Sek',
      executed: true,
      ngrams: {
        unigrams: ngrams.unigrams.size,
        bigrams: ngrams.bigrams.size,
        trigrams: ngrams.trigrams.size
      }
    };
  }

  phaseTransform(input) {
    console.log('⟁Xul⟁ Transform phase');
    return {
      phase: '@Xul',
      transformed: true,
      output: 'ngram_data'
    };
  }

  phaseRender(input) {
    console.log('⟁Ch\'en⟁ Render phase');
    return {
      phase: '@Ch\'en',
      rendered: true,
      complete: true
    };
  }

  // ---- Statistics ------------------------------------------------

  getStats() {
    return {
      engine: 'KuhulNgramProcessor',
      version: '1.0.0',
      phase: this.phase,
      stackSize: this.executionStack.length,
      symbols: this.symbolTable.size
    };
  }
}

export default KuhulNgramProcessor;
