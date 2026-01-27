// Verification Primitive - Geometric Verification (from CALL-GRAMS-XJSON-COMPLETE-SYSTEM.md)

class VerificationPrimitive extends KuhulAgent {
  constructor(mesh, config) {
    super(mesh, {
      role: config.role || 'verification',
      glyphs: config.glyphs || []
    });

    this.primitive = config.primitive;  // sphere, pyramid, lattice, etc.
    this.source = config.source;         // gov_record, news, social, etc.
    this.trustWeight = 0.5;
    this.coherence = 0.5;
  }

  tick() {
    // Update based on incoming verification data
    if (this.memory.short.length > 0) {
      const latestSignal = this.memory.short[this.memory.short.length - 1];

      // Update trust weight
      this.trustWeight = this.calculateTrust(latestSignal);

      // Update coherence
      this.coherence = this.calculateCoherence();

      // Morph primitive if adaptive geometry enabled
      if (this.mode === 'adaptive') {
        this.morphPrimitive();
      }

      // Update visual
      this.updateVisual();
    }

    super.tick();
  }

  calculateTrust(signal) {
    // Source reputation + cross-consistency + temporal validity
    return (signal.source_score * 0.4) +
           (signal.cross_consistency * 0.3) +
           (signal.time_validity * 0.3);
  }

  calculateCoherence() {
    // Agreement with other primitives
    let agreement = 0;
    let count = 0;

    this.neighbors.forEach(neighbor => {
      if (neighbor instanceof VerificationPrimitive) {
        const diff = Math.abs(this.trustWeight - neighbor.trustWeight);
        agreement += (1 - diff);
        count++;
      }
    });

    return count > 0 ? agreement / count : 0.5;
  }

  morphPrimitive() {
    // Adaptive geometry: morph based on trust shifts
    if (this.primitive === 'sphere' && this.trustWeight < 0.7) {
      // Sphere → ellipsoid (uncertainty)
      this.mesh.scale.z = 1 + (0.7 - this.trustWeight);
    } else if (this.primitive === 'pyramid' && this.coherence > 0.8) {
      // Pyramid → prism (expanded reasoning)
      this.mesh.geometry = this.createPrism();
    }
  }

  updateVisual() {
    // Map trust to color
    const trustColor = {
      r: 1.0 - this.trustWeight,  // Red decreases as trust increases
      g: this.trustWeight,         // Green increases as trust increases
      b: this.coherence * 0.5
    };

    this.mesh.material.color.setRGB(trustColor.r, trustColor.g, trustColor.b);

    // Map coherence to opacity
    this.mesh.material.opacity = 0.5 + (this.coherence * 0.5);
  }

  exportSymbolicState() {
    // Phase 6: Quantum Compression
    return {
      primitive: this.primitive,
      source: this.source,
      trust: this.trustWeight,
      coherence: this.coherence,
      compressed: `⚛⟁${this.primitive.toUpperCase()}⟁TRUST:${this.trustWeight.toFixed(2)}⟁SCXQ2⟁`
    };
  }
}
