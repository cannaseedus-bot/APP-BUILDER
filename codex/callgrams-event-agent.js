// EventAgent - Factual Grounding (from CALL-GRAMS-PRACTICAL-RUNTIME.md)
class EventAgent extends KuhulAgent {
  constructor(mesh, event) {
    super(mesh, { role: 'event' });

    // Event payload (non-derivable fact)
    this.event = {
      entity: event.entity,    // "WWI", "Einstein", "Paris"
      key: event.key,          // "start_year", "birth_date", "capital_of"
      value: event.value,      // 1914, "1879-03-14", "France"
      confidence: 1.0          // Events are certain
    };
  }

  emit() {
    // Event agents inject HARD FACTS into the network
    const signal = {
      type: 'event',
      from: this.id,
      entity: this.event.entity,
      key: this.event.key,
      value: this.event.value,
      strength: 10.0,          // High strength (non-negotiable)
      confidence: 1.0
    };

    this.neighbors.forEach(neighbor => {
      neighbor.absorb(signal);
    });

    // Visual feedback - events glow differently
    this.mesh.glow = true;
  }

  injectEvent() {
    // Called when event needs to ground the network
    this.emit();
  }
}
