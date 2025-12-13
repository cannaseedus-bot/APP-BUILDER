// KuhulAgent - Base Autonomous Agent Class (from CALL-GRAMS-PRACTICAL-RUNTIME.md)
class KuhulAgent {
  constructor(mesh, config = {}) {
    // --- IDENTITY ---
    this.id = mesh.id;
    this.mesh = mesh;  // Visual coupling

    // --- ROLE ---
    this.role = config.role || 'pattern';
    // Roles: pattern | event | invariant | translator | router | output

    // --- STATE ---
    this.state = {
      activation: 0,      // Current activation level
      entropy: Math.random(),
      confidence: 0.5,
      energy: 1.0,
      lastTick: performance.now()
    };

    // --- MEMORY ---
    this.memory = {
      short: [],          // Recent signals (working memory)
      long: []            // Persistent patterns (long-term memory)
    };

    // --- GLYPH ENCODING ---
    this.glyphs = config.glyphs || [];  // Compressed weight storage

    // --- CONNECTIVITY ---
    this.neighbors = new Set();         // Mesh network topology
    this.ports = {
      in: [],
      out: []
    };
  }

  // ========== GLYPH-WEIGHT DECODING ==========

  decodeGlyphs() {
    // Glyphs are compressed weight carriers
    // Each glyph maps to a base weight value
    let weight = 0;
    for (const glyph of this.glyphs) {
      weight += GLYPH_TABLE[glyph]?.base || 0;
    }
    return weight;
  }

  // ========== PERCEPTION ==========

  perceive(signal) {
    // Local weight affects signal processing
    const localWeight = this.decodeGlyphs();

    // Update activation based on weighted signal
    this.state.activation += signal.strength * localWeight;

    // Decay energy
    this.state.energy -= 0.01;

    // Store in short-term memory
    this.memory.short.push(signal);

    // Limit memory size
    if (this.memory.short.length > 10) {
      this.memory.short.shift();
    }
  }

  // ========== DECISION MAKING ==========

  decide() {
    // Local rule - no global brain
    // Each agent decides independently

    if (this.state.activation > 1.0) {
      return 'emit';    // Threshold reached, propagate
    }

    if (this.state.energy < 0.2) {
      return 'idle';    // Low energy, rest
    }

    if (this.role === 'event' && this.memory.short.length > 0) {
      return 'ground';  // Event agents inject facts
    }

    if (this.role === 'invariant') {
      return 'check';   // Invariant agents validate
    }

    return 'propagate'; // Default: continue flow
  }

  // ========== ACTION ==========

  act(decision) {
    switch (decision) {
      case 'emit':
        this.emit();
        this.state.activation *= 0.5;  // Reset after emission
        break;

      case 'ground':
        this.injectEvent();
        break;

      case 'check':
        this.validateInvariant();
        break;

      case 'propagate':
        this.emit();
        this.state.activation *= 0.8;  // Partial decay
        break;

      case 'idle':
        this.state.energy += 0.05;     // Recover energy
        break;
    }
  }

  // ========== SIGNAL EMISSION ==========

  emit() {
    const signal = {
      from: this.id,
      type: this.role,
      strength: this.state.activation,
      glyphs: this.glyphs,
      timestamp: performance.now(),
      confidence: this.state.confidence
    };

    // Propagate to all neighbors (mesh network)
    this.neighbors.forEach(neighbor => {
      neighbor.absorb(signal);
    });

    // Visual feedback
    this.mesh.pulse = this.state.activation;
  }

  // ========== SIGNAL ABSORPTION ==========

  absorb(signal) {
    this.perceive(signal);
  }

  // ========== TICK (COGNITIVE CLOCK) ==========

  tick() {
    // Execute one cognitive cycle
    const decision = this.decide();
    this.act(decision);

    // Visual coupling - state affects appearance
    this.mesh.pulse = this.state.activation;
    this.mesh.rotation[1] += this.state.activation * 0.01;

    // Update color based on activation
    const activation = Math.tanh(this.state.activation);
    this.updateVisualState(activation);
  }

  updateVisualState(activation) {
    // Map activation to visual properties
    // High activation = brighter, faster rotation
    const hue = (activation * 180) + 180;  // 180-360 degrees
    const brightness = 0.5 + (activation * 0.5);

    // This affects the mesh's rendered appearance
    this.mesh.activationLevel = activation;
  }
}
