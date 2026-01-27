// File: /src/pipeline/DataPipeline.js
// DATA PIPELINE - Orchestrates n-gram processing and agent activation

import NgramEngine from '../ngram/NgramEngine.js';
import MicroAgent from '../agents/MicroAgent.js';
import AtomicBlock from '../atomic/AtomicBlock.js';

export class DataPipeline {
  constructor() {
    this.ngramEngine = new NgramEngine();
    this.agents = [
      new MicroAgent('greeting_agent', ['@pattern_match']),
      new MicroAgent('question_agent', ['@question_detect']),
      new MicroAgent('command_agent', ['@command_detect'])
    ];
    this.atomicBlocks = []; // All created atomic blocks
    this.processingHistory = [];
  }

  async processInput(inputText) {
    console.log(`🔄 Processing: "${inputText}"`);

    const startTime = Date.now();

    // Step 1: N-gram processing
    const ngramResult = this.ngramEngine.processText(inputText);
    console.log(`📊 Created n-grams:`, {
      unigrams: ngramResult.unigramBlocks.length,
      bigrams: ngramResult.bigramBlocks.length,
      trigrams: ngramResult.trigramBlocks.length,
      pentagrams: ngramResult.pentagramBlocks.length,
      supagrams: ngramResult.supagramBlocks.length
    });

    // Store n-gram atomic blocks
    const allNgramBlocks = [
      ...ngramResult.unigramBlocks,
      ...ngramResult.bigramBlocks,
      ...ngramResult.trigramBlocks,
      ...ngramResult.pentagramBlocks,
      ...ngramResult.supagramBlocks
    ];

    allNgramBlocks.forEach(block => {
      this.ngramEngine.storeNgram(block);
      this.atomicBlocks.push(block);
    });

    // Step 2: Activate micro-agents
    const agentResults = [];
    for (const agent of this.agents) {
      const result = agent.activate(inputText, allNgramBlocks);

      if (result) {
        agentResults.push(result);
        this.atomicBlocks.push(result);
        console.log(`🤖 ${agent.name} activated and created atomic block`);
      }
    }

    // Step 3: Synthesize higher-order atomic block
    let synthesisBlock = null;
    if (agentResults.length > 0) {
      synthesisBlock = this.synthesizeAtomicBlock(inputText, agentResults, ngramResult);
      this.atomicBlocks.push(synthesisBlock);
      console.log(`✨ Synthesized block: ${synthesisBlock['@type']}`);
    }

    const processingTime = Date.now() - startTime;

    // Store in history
    this.processingHistory.push({
      timestamp: Date.now(),
      input: inputText,
      ngramCount: allNgramBlocks.length,
      agentCount: agentResults.length,
      processingTime,
      synthesisBlock: synthesisBlock ? synthesisBlock['@id'] : null
    });

    return {
      ngramResult,
      agentResults,
      synthesisBlock,
      processingTime
    };
  }

  synthesizeAtomicBlock(inputText, agentBlocks, ngramResult) {
    // Combine agent results into one block
    const capabilities = agentBlocks.flatMap(b => b['@control']);
    const variables = agentBlocks.reduce((acc, b) => ({
      ...acc,
      ...b['@variable']
    }), {
      originalText: inputText,
      tokenCount: ngramResult.tokens.length,
      ngramCount: {
        unigrams: ngramResult.unigramBlocks.length,
        bigrams: ngramResult.bigramBlocks.length,
        trigrams: ngramResult.trigramBlocks.length,
        pentagrams: ngramResult.pentagramBlocks.length,
        supagrams: ngramResult.supagramBlocks.length
      }
    });

    const links = agentBlocks.flatMap(b => b['@links']);

    return new AtomicBlock(
      'synthesized_input',
      [...new Set(capabilities)], // Remove duplicates
      variables,
      `Input: "${inputText}"`,
      [...new Set(links)]
    );
  }

  // Get all atomic blocks as XJSON
  getSystemState() {
    return {
      '@type': 'system_state',
      '@timestamp': Date.now(),
      '@atomic_blocks': this.atomicBlocks,
      '@ngram_stats': this.ngramEngine.getStats(),
      '@agent_states': this.agents.map(a => a.getStats()),
      '@processing_history': this.processingHistory.slice(-10), // Last 10
      '@total_blocks': this.atomicBlocks.length
    };
  }

  // Query atomic blocks
  queryBlocks(type = null, filter = {}) {
    let results = this.atomicBlocks;

    if (type) {
      results = results.filter(block => block['@type'] === type);
    }

    if (Object.keys(filter).length > 0) {
      results = results.filter(block => {
        for (const [key, value] of Object.entries(filter)) {
          if (block['@variable'][key] !== value) {
            return false;
          }
        }
        return true;
      });
    }

    return results;
  }

  // Export all data as XJSON
  exportXJSON() {
    return JSON.stringify({
      '@context': 'xjson://atomic-system/v1',
      '@timestamp': Date.now(),
      '@version': '1.0.0',
      system_state: this.getSystemState(),
      atomic_blocks: this.atomicBlocks,
      ngram_engine: {
        unigrams: Array.from(this.ngramEngine.unigrams.values()),
        bigrams: Array.from(this.ngramEngine.bigrams.values()),
        trigrams: Array.from(this.ngramEngine.trigrams.values()),
        pentagrams: Array.from(this.ngramEngine.pentagrams.values()),
        supagrams: Array.from(this.ngramEngine.supagrams.values())
      }
    }, null, 2);
  }

  // Clear all data
  clear() {
    this.atomicBlocks = [];
    this.processingHistory = [];
    this.ngramEngine.unigrams.clear();
    this.ngramEngine.bigrams.clear();
    this.ngramEngine.trigrams.clear();
    this.ngramEngine.pentagrams.clear();
    this.ngramEngine.supagrams.clear();
    this.agents.forEach(agent => {
      agent.atomics = [];
      agent.state.successCount = 0;
      agent.state.failureCount = 0;
    });
    console.log('🧹 Pipeline cleared');
  }
}

export default DataPipeline;
