/**
 * C@@L @GRAMS AUTONOMOUS AGENTS
 *
 * Runtime agent implementation for cluster-based cognitive architecture
 * Meshes as autonomous agents with glyph-weight execution
 *
 * Architecture:
 * - KuhulAgent: Base autonomous agent (pattern/event/invariant/translator/output)
 * - EventAgent: Factual injection and grounding
 * - InvariantAgent: Constraint enforcement and logic verification
 * - VerificationPrimitive: Geometric verification (sphere/pyramid/lattice)
 */

// ═══════════════════════════════════════════════════════════════
// GLYPH TABLE - C@@L @GRAMS WEIGHT ENCODING
// ═══════════════════════════════════════════════════════════════

const GLYPH_TABLE = {
  '@': { base: 1.0, semantic: 'basic_weight' },
  '@@': { base: 2.0, semantic: 'medium_weight' },
  '@@@': { base: 3.0, semantic: 'strong_weight' },
  '@@@@': { base: 4.0, semantic: 'maximum_weight' },
  '⟁': { base: 0.5, semantic: 'kuhul_marker' },
  '◯': { base: 1.5, semantic: 'completion_marker' },
  '⿰': { base: 2.5, semantic: 'stack_operator' },
  '⿱': { base: 1.2, semantic: 'vertical_compose' },
  '△': { base: 1.8, semantic: 'pyramid_primitive' },
  '◆': { base: 1.6, semantic: 'lattice_primitive' },
  '●': { base: 2.0, semantic: 'sphere_primitive' }
};

// ═══════════════════════════════════════════════════════════════
// BASE KUHUL AGENT - AUTONOMOUS COGNITIVE AGENT
// ═══════════════════════════════════════════════════════════════

class KuhulAgent {
  constructor(mesh, config = {}) {
    this.id = mesh?.id || `agent_${Date.now()}_${Math.random()}`;
    this.mesh = mesh;
    this.role = config.role || 'pattern'; // pattern, event, invariant, translator, output

    this.state = {
      activation: 0,
      energy: 1.0,
      confidence: 0.5,
      stress: 0.0
    };

    this.glyphs = config.glyphs || [];
    this.neighbors = new Set();
    this.inbox = [];
    this.outbox = [];

    this.tick_count = 0;
    this.history = [];
  }

  // Decode glyphs to weight values
  decodeGlyphs() {
    let weight = 0;
    for (const glyph of this.glyphs) {
      const entry = GLYPH_TABLE[glyph];
      if (entry) {
        weight += entry.base;
      }
    }
    return weight;
  }

  // Main execution loop - called each cognitive cycle
  tick() {
    this.tick_count++;

    // 1. Perceive environment
    const percept = this.perceive();

    // 2. Make decision
    const decision = this.decide(percept);

    // 3. Execute action
    this.act(decision);

    // 4. Update state
    this.updateState(percept, decision);

    // 5. Communicate
    this.communicate();

    return {
      id: this.id,
      tick: this.tick_count,
      activation: this.state.activation,
      decision: decision
    };
  }

  perceive() {
    // Gather signals from neighbors
    const signals = [];

    for (const neighbor of this.neighbors) {
      if (neighbor.state) {
        signals.push({
          source: neighbor.id,
          activation: neighbor.state.activation,
          role: neighbor.role
        });
      }
    }

    // Process inbox messages
    const messages = this.inbox.splice(0);

    // Decode glyph weights
    const glyphWeight = this.decodeGlyphs();

    return {
      signals,
      messages,
      glyphWeight,
      timestamp: Date.now()
    };
  }

  decide(percept) {
    // Decision logic based on role
    switch(this.role) {
      case 'pattern':
        return this.decidePattern(percept);
      case 'event':
        return this.decideEvent(percept);
      case 'invariant':
        return this.decideInvariant(percept);
      case 'translator':
        return this.decideTranslator(percept);
      case 'output':
        return this.decideOutput(percept);
      default:
        return { action: 'idle', value: 0 };
    }
  }

  decidePattern(percept) {
    // Pattern agents aggregate signals
    const totalActivation = percept.signals.reduce((sum, s) => sum + s.activation, 0);
    const avgActivation = percept.signals.length > 0 ? totalActivation / percept.signals.length : 0;

    return {
      action: 'propagate',
      value: avgActivation * percept.glyphWeight,
      confidence: this.state.confidence
    };
  }

  decideEvent(percept) {
    // Event agents inject factual grounding
    return {
      action: 'ground',
      value: 1.0, // Binary: fact present or not
      source: 'event_store'
    };
  }

  decideInvariant(percept) {
    // Invariant agents enforce constraints
    const constraint_satisfied = this.checkConstraints(percept);

    return {
      action: 'constrain',
      value: constraint_satisfied ? 1.0 : -1.0,
      constraint: 'logical_consistency'
    };
  }

  decideTranslator(percept) {
    // Translator agents transform representations
    return {
      action: 'translate',
      value: percept.glyphWeight,
      scale: this.determineScale(percept)
    };
  }

  decideOutput(percept) {
    // Output agents format results
    const aggregated = percept.messages.reduce((sum, m) => sum + (m.value || 0), 0);

    return {
      action: 'emit',
      value: aggregated,
      format: 'glyph_encoded'
    };
  }

  act(decision) {
    switch(decision.action) {
      case 'propagate':
        this.state.activation = decision.value;
        break;
      case 'ground':
        this.state.activation = decision.value;
        this.state.confidence = 1.0; // High confidence for facts
        break;
      case 'constrain':
        if (decision.value < 0) {
          this.state.stress += 0.1; // Constraint violation increases stress
        }
        break;
      case 'translate':
        this.state.activation = decision.value;
        break;
      case 'emit':
        this.emit(decision.value);
        break;
    }

    // Update mesh if present
    if (this.mesh) {
      this.mesh.pulse = this.state.activation;
      this.mesh.stress = this.state.stress;
    }
  }

  updateState(percept, decision) {
    // Energy decay
    this.state.energy *= 0.99;

    // Stress decay
    this.state.stress *= 0.95;

    // Confidence adaptation
    if (percept.signals.length > 0) {
      this.state.confidence += 0.01;
      this.state.confidence = Math.min(this.state.confidence, 1.0);
    }

    // Record history
    this.history.push({
      tick: this.tick_count,
      activation: this.state.activation,
      decision: decision.action
    });

    // Limit history size
    if (this.history.length > 100) {
      this.history.shift();
    }
  }

  communicate() {
    // Broadcast activation to neighbors
    if (this.state.activation > 0.1) {
      for (const neighbor of this.neighbors) {
        if (neighbor.inbox) {
          neighbor.inbox.push({
            from: this.id,
            value: this.state.activation,
            role: this.role,
            tick: this.tick_count
          });
        }
      }
    }
  }

  emit(value) {
    this.outbox.push({
      value: value,
      timestamp: Date.now(),
      tick: this.tick_count
    });
  }

  absorb(signal) {
    this.inbox.push(signal);
  }

  checkConstraints(percept) {
    // Basic logical consistency check
    // In full implementation, this would check semantic constraints
    return this.state.activation >= 0 && this.state.activation <= 10.0;
  }

  determineScale(percept) {
    // Scale selection based on signal strength
    if (percept.glyphWeight > 3.0) {
      return 'macro';
    } else if (percept.glyphWeight > 1.0) {
      return 'meso';
    } else {
      return 'micro';
    }
  }

  // Export agent state for SCXQ2 compression
  exportState() {
    return {
      id: this.id,
      role: this.role,
      glyphs: this.glyphs,
      state: this.state,
      tick_count: this.tick_count,
      neighbors: Array.from(this.neighbors).map(n => n.id)
    };
  }

  // Import compressed state
  importState(stateData) {
    this.state = stateData.state;
    this.tick_count = stateData.tick_count;
    this.glyphs = stateData.glyphs;
  }
}

// ═══════════════════════════════════════════════════════════════
// EVENT AGENT - FACTUAL GROUNDING
// ═══════════════════════════════════════════════════════════════

class EventAgent extends KuhulAgent {
  constructor(mesh, config = {}) {
    config.role = 'event';
    super(mesh, config);

    this.factStore = config.factStore || new Map();
    this.query = config.query || null;
  }

  perceive() {
    const basePercept = super.perceive();

    // Check fact store for relevant facts
    const facts = this.retrieveFacts(this.query);

    return {
      ...basePercept,
      facts: facts,
      factCount: facts.length
    };
  }

  retrieveFacts(query) {
    if (!query) return [];

    const relevantFacts = [];

    for (const [key, fact] of this.factStore) {
      if (key.includes(query) || fact.text?.includes(query)) {
        relevantFacts.push(fact);
      }
    }

    return relevantFacts;
  }

  decideEvent(percept) {
    // Inject facts as high-confidence signals
    if (percept.facts.length > 0) {
      return {
        action: 'ground',
        value: 1.0,
        facts: percept.facts,
        confidence: 1.0 // Facts have certainty
      };
    } else {
      return {
        action: 'search',
        value: 0.0,
        confidence: 0.0
      };
    }
  }

  act(decision) {
    super.act(decision);

    if (decision.action === 'ground' && decision.facts) {
      // Broadcast facts to network
      for (const neighbor of this.neighbors) {
        if (neighbor.inbox) {
          neighbor.inbox.push({
            from: this.id,
            type: 'fact',
            facts: decision.facts,
            confidence: 1.0
          });
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// INVARIANT AGENT - CONSTRAINT ENFORCEMENT
// ═══════════════════════════════════════════════════════════════

class InvariantAgent extends KuhulAgent {
  constructor(mesh, config = {}) {
    config.role = 'invariant';
    super(mesh, config);

    this.constraints = config.constraints || [];
  }

  checkConstraints(percept) {
    // Check all constraints
    for (const constraint of this.constraints) {
      if (!this.evaluateConstraint(constraint, percept)) {
        return false;
      }
    }
    return true;
  }

  evaluateConstraint(constraint, percept) {
    switch(constraint.type) {
      case 'logical_consistency':
        // No contradictions in signals
        return this.checkLogicalConsistency(percept.signals);

      case 'value_range':
        // Values within bounds
        return this.state.activation >= constraint.min &&
               this.state.activation <= constraint.max;

      case 'temporal_ordering':
        // Events in correct sequence
        return this.checkTemporalOrder(percept.messages);

      default:
        return true;
    }
  }

  checkLogicalConsistency(signals) {
    // Simple consistency: no conflicting high-confidence signals
    const highConfidence = signals.filter(s => s.confidence > 0.8);

    if (highConfidence.length < 2) return true;

    // Check for conflicts (simplified)
    const activations = highConfidence.map(s => s.activation);
    const variance = this.calculateVariance(activations);

    return variance < 2.0; // Low variance = consistent
  }

  checkTemporalOrder(messages) {
    // Check messages are in increasing time order
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].tick < messages[i-1].tick) {
        return false;
      }
    }
    return true;
  }

  calculateVariance(values) {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  }

  decideInvariant(percept) {
    const allSatisfied = this.checkConstraints(percept);

    if (!allSatisfied) {
      // Find violated constraints
      const violations = this.constraints.filter(c =>
        !this.evaluateConstraint(c, percept)
      );

      return {
        action: 'constrain',
        value: -1.0,
        violations: violations,
        suppress: true
      };
    }

    return {
      action: 'constrain',
      value: 1.0,
      satisfied: true
    };
  }

  act(decision) {
    super.act(decision);

    if (decision.suppress) {
      // Suppress propagation of invalid signals
      this.state.activation = 0;

      // Alert network of constraint violation
      for (const neighbor of this.neighbors) {
        if (neighbor.inbox) {
          neighbor.inbox.push({
            from: this.id,
            type: 'constraint_violation',
            violations: decision.violations
          });
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION PRIMITIVE - GEOMETRIC VERIFICATION
// ═══════════════════════════════════════════════════════════════

class VerificationPrimitive extends KuhulAgent {
  constructor(mesh, config = {}) {
    config.role = 'verification';
    super(mesh, config);

    this.primitiveType = config.primitiveType || 'sphere'; // sphere, pyramid, lattice
    this.sourceType = config.sourceType || 'authoritative'; // authoritative, structured, distributed
    this.trustWeight = 1.0;
    this.coherence = 0.5;
    this.mode = config.mode || 'static'; // static, adaptive
  }

  perceive() {
    const basePercept = super.perceive();

    // Calculate trust weight based on source signals
    const trustSignals = basePercept.signals.filter(s => s.role === 'event');
    const avgTrust = trustSignals.length > 0
      ? trustSignals.reduce((sum, s) => sum + s.activation, 0) / trustSignals.length
      : 0.5;

    return {
      ...basePercept,
      trustWeight: avgTrust,
      sourceSignals: trustSignals
    };
  }

  decide(percept) {
    // Calculate trust based on primitive type and sources
    this.trustWeight = this.calculateTrust(percept);
    this.coherence = this.calculateCoherence(percept);

    return {
      action: 'verify',
      trustWeight: this.trustWeight,
      coherence: this.coherence,
      primitiveType: this.primitiveType
    };
  }

  calculateTrust(percept) {
    switch(this.primitiveType) {
      case 'sphere':
        // Sphere = authoritative source (government, official)
        // High base trust
        return percept.sourceSignals.length > 0
          ? Math.max(...percept.sourceSignals.map(s => s.activation))
          : 0.9;

      case 'pyramid':
        // Pyramid = structured source (news, institutions)
        // Medium base trust, weighted average
        return percept.sourceSignals.length > 0
          ? percept.sourceSignals.reduce((sum, s) => sum + s.activation, 0) / percept.sourceSignals.length
          : 0.7;

      case 'lattice':
        // Lattice = distributed source (social, crowdsourced)
        // Trust emerges from consensus
        return this.calculateConsensus(percept.sourceSignals);

      default:
        return 0.5;
    }
  }

  calculateConsensus(signals) {
    if (signals.length === 0) return 0.3;

    // Consensus = low variance + high agreement
    const values = signals.map(s => s.activation);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

    const agreement = 1.0 / (1.0 + variance); // High agreement = low variance
    const strength = mean; // Average activation

    return (agreement + strength) / 2.0;
  }

  calculateCoherence(percept) {
    // Coherence = consistency of signals over time
    if (this.history.length < 2) return 0.5;

    const recentActivations = this.history.slice(-10).map(h => h.activation);
    const variance = this.calculateVarianceArray(recentActivations);

    return 1.0 / (1.0 + variance);
  }

  calculateVarianceArray(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  act(decision) {
    super.act(decision);

    // Morph primitive geometry if in adaptive mode
    if (this.mode === 'adaptive') {
      this.morphPrimitive();
    }

    // Update visual properties
    this.updateVisual();
  }

  morphPrimitive() {
    if (!this.mesh) return;

    switch(this.primitiveType) {
      case 'sphere':
        // Sphere can become ellipsoid based on trust asymmetry
        this.mesh.scaleX = 1.0;
        this.mesh.scaleY = this.trustWeight;
        this.mesh.scaleZ = this.coherence;
        break;

      case 'pyramid':
        // Pyramid height reflects trust strength
        this.mesh.scaleY = this.trustWeight * 1.5;
        break;

      case 'lattice':
        // Lattice density reflects consensus
        this.mesh.density = this.trustWeight;
        break;
    }
  }

  updateVisual() {
    if (!this.mesh) return;

    // Color based on trust weight
    const trustColor = {
      r: 1.0 - this.trustWeight, // Red = low trust
      g: this.trustWeight,        // Green = high trust
      b: this.coherence * 0.5     // Blue = coherence
    };

    this.mesh.color = trustColor;
    this.mesh.opacity = 0.3 + (this.coherence * 0.7); // Opacity = coherence
  }

  tick() {
    const result = super.tick();

    return {
      ...result,
      trustWeight: this.trustWeight,
      coherence: this.coherence,
      primitiveType: this.primitiveType,
      visual: this.mesh ? {
        color: this.mesh.color,
        opacity: this.mesh.opacity,
        scale: {
          x: this.mesh.scaleX,
          y: this.mesh.scaleY,
          z: this.mesh.scaleZ
        }
      } : null
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// MESH NETWORK - AGENT TOPOLOGY
// ═══════════════════════════════════════════════════════════════

class AgentMeshNetwork {
  constructor() {
    this.agents = new Map();
    this.topology = new Map(); // agent_id -> [neighbor_ids]
    this.clusters = [];
  }

  addAgent(agent) {
    this.agents.set(agent.id, agent);
    this.topology.set(agent.id, []);
  }

  connect(agent1_id, agent2_id) {
    const agent1 = this.agents.get(agent1_id);
    const agent2 = this.agents.get(agent2_id);

    if (agent1 && agent2) {
      agent1.neighbors.add(agent2);
      agent2.neighbors.add(agent1);

      this.topology.get(agent1_id).push(agent2_id);
      this.topology.get(agent2_id).push(agent1_id);
    }
  }

  tick() {
    // Execute all agents in parallel
    const results = [];

    for (const agent of this.agents.values()) {
      results.push(agent.tick());
    }

    return results;
  }

  detectClusters() {
    // Simple clustering: agents with similar roles and high activation
    const clusters = new Map();

    for (const agent of this.agents.values()) {
      const key = `${agent.role}_${Math.floor(agent.state.activation)}`;

      if (!clusters.has(key)) {
        clusters.set(key, []);
      }

      clusters.get(key).push(agent);
    }

    this.clusters = Array.from(clusters.values()).filter(c => c.length > 1);
    return this.clusters;
  }

  exportState() {
    return {
      agents: Array.from(this.agents.values()).map(a => a.exportState()),
      topology: Array.from(this.topology.entries()),
      clusters: this.clusters.map(c => c.map(a => a.id))
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export {
  KuhulAgent,
  EventAgent,
  InvariantAgent,
  VerificationPrimitive,
  AgentMeshNetwork,
  GLYPH_TABLE
};
