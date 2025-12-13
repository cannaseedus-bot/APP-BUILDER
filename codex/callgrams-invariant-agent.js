// InvariantAgent - Constraint Enforcement (from CALL-GRAMS-PRACTICAL-RUNTIME.md)
class InvariantAgent extends KuhulAgent {
  constructor(mesh, invariant) {
    super(mesh, { role: 'invariant' });

    // Invariant rule
    this.invariant = {
      name: invariant.name,
      rule: invariant.rule,          // Function that returns true/false
      domain: invariant.domain,       // 'physics', 'math', 'logic'
      enforcement: invariant.enforcement || 'hard'  // 'hard' or 'soft'
    };
  }

  validateInvariant() {
    // Check all incoming signals against invariant
    const violations = [];

    this.memory.short.forEach(signal => {
      const isValid = this.invariant.rule(signal);

      if (!isValid) {
        violations.push({
          signal: signal,
          invariant: this.invariant.name,
          timestamp: performance.now()
        });
      }
    });

    if (violations.length > 0) {
      this.blockInvalidFlow(violations);
    }
  }

  blockInvalidFlow(violations) {
    // Emit blocking signal
    const blockSignal = {
      type: 'invariant_violation',
      from: this.id,
      violations: violations,
      strength: -10.0,  // Negative = inhibitory
      invariant: this.invariant.name
    };

    this.neighbors.forEach(neighbor => {
      neighbor.absorb(blockSignal);
    });

    this.log('BLOCK', `Invariant ${this.invariant.name} blocked ${violations.length} violations`);
  }

  absorb(signal) {
    // Invariant agents validate before accepting
    const isValid = this.invariant.rule(signal);

    if (isValid) {
      super.absorb(signal);
    } else {
      this.blockInvalidFlow([{ signal: signal, invariant: this.invariant.name }]);
    }
  }
}
