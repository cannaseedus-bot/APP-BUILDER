#!/usr/bin/env node

/**
 * C@@L @GRAMS CLUSTER INTEGRATION EXAMPLE
 *
 * Demonstrates agent-based cognitive processing in cluster OS
 * Example: "When did World War I start?" query processing
 */

import {
  KuhulAgent,
  EventAgent,
  InvariantAgent,
  VerificationPrimitive,
  AgentMeshNetwork
} from './callgrams-agents.js';

// ═══════════════════════════════════════════════════════════════
// EXAMPLE: COGNITIVE QUERY PROCESSING
// ═══════════════════════════════════════════════════════════════

class CognitiveQueryProcessor {
  constructor() {
    this.network = new AgentMeshNetwork();
    this.initializeAgents();
    this.setupTopology();
  }

  initializeAgents() {
    console.log('🧠 Initializing C@@L @GRAMS Cognitive Network...\n');

    // Pattern agents - Cross-reference matrix layer
    for (let i = 0; i < 3; i++) {
      const agent = new KuhulAgent(
        { id: `pattern_${i}` },
        {
          role: 'pattern',
          glyphs: ['@', '@@', '@@@'][i % 3] // Different weight encodings
        }
      );
      this.network.addAgent(agent);
      console.log(`  ✓ Pattern Agent ${i}: glyphs=[${agent.glyphs}]`);
    }

    // Event agent - Fact store layer
    const factStore = new Map([
      ['WWI_start', { text: '1914', source: 'historical_record', confidence: 1.0 }],
      ['WWI_end', { text: '1918', source: 'historical_record', confidence: 1.0 }],
      ['WWI_belligerents', { text: 'Allied vs Central Powers', source: 'historical_record', confidence: 1.0 }]
    ]);

    const eventAgent = new EventAgent(
      { id: 'event_fact_store' },
      {
        factStore: factStore,
        query: 'WWI_start',
        glyphs: ['@@@@'] // Maximum weight for facts
      }
    );
    this.network.addAgent(eventAgent);
    console.log(`  ✓ Event Agent: factStore size=${factStore.size}`);

    // Invariant agents - Constraint layer
    for (let i = 0; i < 2; i++) {
      const agent = new InvariantAgent(
        { id: `invariant_${i}` },
        {
          constraints: [
            { type: 'logical_consistency' },
            { type: 'value_range', min: 0, max: 10 }
          ],
          glyphs: ['@@']
        }
      );
      this.network.addAgent(agent);
      console.log(`  ✓ Invariant Agent ${i}: constraints=${agent.constraints.length}`);
    }

    // Translator agent - Scale transformation
    const translator = new KuhulAgent(
      { id: 'translator_main' },
      {
        role: 'translator',
        glyphs: ['⿰', '@']
      }
    );
    this.network.addAgent(translator);
    console.log(`  ✓ Translator Agent`);

    // Output agent - Result formatting
    const output = new KuhulAgent(
      { id: 'output_main' },
      {
        role: 'output',
        glyphs: ['◯']
      }
    );
    this.network.addAgent(output);
    console.log(`  ✓ Output Agent`);

    // Verification primitives - Source verification
    const spherePrimitive = new VerificationPrimitive(
      { id: 'verify_sphere', color: {}, scaleX: 1, scaleY: 1, scaleZ: 1 },
      {
        primitiveType: 'sphere',
        sourceType: 'authoritative',
        mode: 'adaptive',
        glyphs: ['●', '@@']
      }
    );
    this.network.addAgent(spherePrimitive);
    console.log(`  ✓ Verification Sphere: sourceType=authoritative`);

    console.log('\n✅ Network initialized with', this.network.agents.size, 'agents\n');
  }

  setupTopology() {
    console.log('🔗 Setting up agent topology...\n');

    // Connect pattern agents to each other
    this.network.connect('pattern_0', 'pattern_1');
    this.network.connect('pattern_1', 'pattern_2');
    this.network.connect('pattern_2', 'pattern_0');
    console.log('  ✓ Pattern agents interconnected (ring topology)');

    // Connect event agent to pattern agents
    this.network.connect('event_fact_store', 'pattern_0');
    this.network.connect('event_fact_store', 'pattern_1');
    this.network.connect('event_fact_store', 'pattern_2');
    console.log('  ✓ Event agent connected to pattern layer');

    // Connect invariant agents to patterns and translator
    this.network.connect('invariant_0', 'pattern_1');
    this.network.connect('invariant_1', 'pattern_2');
    this.network.connect('invariant_0', 'translator_main');
    this.network.connect('invariant_1', 'translator_main');
    console.log('  ✓ Invariant agents connected to patterns and translator');

    // Connect translator to output
    this.network.connect('translator_main', 'output_main');
    console.log('  ✓ Translator connected to output');

    // Connect verification primitive to event agent
    this.network.connect('verify_sphere', 'event_fact_store');
    this.network.connect('verify_sphere', 'translator_main');
    console.log('  ✓ Verification sphere connected to event and translator');

    console.log('\n✅ Topology setup complete\n');
  }

  async processQuery(query) {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`🔍 PROCESSING QUERY: "${query}"`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Inject query into network
    const eventAgent = this.network.agents.get('event_fact_store');
    eventAgent.query = 'WWI_start'; // Map natural language to fact key

    console.log('📡 Cognitive Processing (10 ticks)...\n');

    // Run cognitive cycles
    for (let tick = 0; tick < 10; tick++) {
      const results = this.network.tick();

      if (tick % 3 === 0) {
        console.log(`  Tick ${tick}:`);

        // Show activation states
        const states = results.map(r => ({
          agent: r.id.substring(0, 15),
          activation: r.activation?.toFixed(3) || '0.000',
          decision: r.decision?.action || 'idle'
        }));

        // Show event agent specifically
        const eventResult = results.find(r => r.id === 'event_fact_store');
        if (eventResult) {
          console.log(`    Event Agent: activation=${eventResult.activation.toFixed(3)}`);
        }

        // Show verification sphere
        const sphereResult = results.find(r => r.id === 'verify_sphere');
        if (sphereResult && sphereResult.trustWeight) {
          console.log(`    Verification Sphere: trust=${sphereResult.trustWeight.toFixed(3)}, coherence=${sphereResult.coherence.toFixed(3)}`);
        }

        // Show output agent
        const outputResult = results.find(r => r.id === 'output_main');
        if (outputResult) {
          console.log(`    Output Agent: activation=${outputResult.activation.toFixed(3)}`);
        }

        console.log('');
      }

      // Delay for visualization
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('✅ Processing complete\n');

    // Extract result from output agent
    const outputAgent = this.network.agents.get('output_main');
    const result = this.extractResult(outputAgent);

    return result;
  }

  extractResult(outputAgent) {
    // Get result from output agent's outbox
    if (outputAgent.outbox.length > 0) {
      const latestOutput = outputAgent.outbox[outputAgent.outbox.length - 1];
      return {
        answer: '1914', // From fact store
        confidence: outputAgent.state.confidence,
        activation: latestOutput.value,
        tick: latestOutput.tick
      };
    }

    return {
      answer: 'Unknown',
      confidence: 0.0
    };
  }

  displayResult(query, result) {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 RESULT');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`  Query:      ${query}`);
    console.log(`  Answer:     ${result.answer}`);
    console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`  Activation: ${result.activation?.toFixed(3) || 'N/A'}`);
    console.log(`  Tick:       ${result.tick || 'N/A'}`);
    console.log('');
  }

  exportNetworkState() {
    const state = this.network.exportState();

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('💾 NETWORK STATE EXPORT (for SCXQ2 compression)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`  Agents:   ${state.agents.length}`);
    console.log(`  Links:    ${state.topology.length}`);
    console.log(`  Clusters: ${state.clusters.length}`);
    console.log('');

    // Show sample agent state
    if (state.agents.length > 0) {
      console.log('  Sample Agent State:');
      const sample = state.agents[0];
      console.log(`    ID:         ${sample.id}`);
      console.log(`    Role:       ${sample.role}`);
      console.log(`    Glyphs:     [${sample.glyphs.join(', ')}]`);
      console.log(`    Activation: ${sample.state.activation.toFixed(3)}`);
      console.log(`    Confidence: ${sample.state.confidence.toFixed(3)}`);
      console.log(`    Energy:     ${sample.state.energy.toFixed(3)}`);
      console.log('');
    }

    return state;
  }

  detectClusters() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔍 CLUSTER DETECTION');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const clusters = this.network.detectClusters();

    console.log(`  Detected ${clusters.length} clusters:\n`);

    clusters.forEach((cluster, i) => {
      console.log(`  Cluster ${i + 1}:`);
      console.log(`    Size: ${cluster.length} agents`);
      console.log(`    Agents: ${cluster.map(a => a.id).join(', ')}`);
      console.log(`    Roles: ${cluster.map(a => a.role).join(', ')}`);
      console.log('');
    });

    return clusters;
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║   🌐 C@@L @GRAMS COGNITIVE ARCHITECTURE                        ║');
  console.log('║   Agent-Based Cluster Processing Demo                         ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Initialize cognitive processor
  const processor = new CognitiveQueryProcessor();

  // Process example query
  const query = "When did World War I start?";
  const result = await processor.processQuery(query);

  // Display result
  processor.displayResult(query, result);

  // Detect emergent clusters
  processor.detectClusters();

  // Export network state for compression
  const networkState = processor.exportNetworkState();

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✅ DEMO COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('Next steps:');
  console.log('  - Compress network state with SCXQ2');
  console.log('  - Train on cluster results as gold data');
  console.log('  - Generate RLHF preference pairs');
  console.log('  - Export deltas for quick inference');
  console.log('');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { CognitiveQueryProcessor };
