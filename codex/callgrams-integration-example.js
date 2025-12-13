// Complete Integration Example (from CALL-GRAMS-PRACTICAL-RUNTIME.md)

// Initialize engine
const engine = new KuhulWebGLEngine();

// Spawn pattern agents (cross-reference matrix)
const cube1 = engine.createQuantumCube([0, 0, 0], 1.0);
const pattern1 = new KuhulAgent(cube1, {
  role: 'pattern',
  glyphs: ['@', '@@']
});
engine.agents.set(cube1.id, pattern1);

const sphere1 = engine.createNeuralSphere([2, 0, 0], 0.8);
const pattern2 = new KuhulAgent(sphere1, {
  role: 'pattern',
  glyphs: ['@@', '@@@']
});
engine.agents.set(sphere1.id, pattern2);

// Spawn event agents (factual grounding)
engine.spawnEvent({
  entity: 'WWI',
  key: 'start_year',
  value: 1914,
  position: [0, 2, 0]
});

engine.spawnEvent({
  entity: 'Einstein',
  key: 'birth_date',
  value: '1879-03-14',
  position: [2, 2, 0]
});

// Spawn invariant agents (constraint enforcement)
engine.spawnInvariant({
  name: 'Conservation of Energy',
  domain: 'physics',
  rule: (signal) => {
    if (signal.entity === 'perpetual_motion') return false;
    return true;
  }
});

// Build mesh network
engine.linkAgents(3.0);

// Run cognition
for (let i = 0; i < 100; i++) {
  engine.runAgentClock();
}

// Synthesize answer
const result = engine.synthesizeAnswer("When did WWI start?");
console.log(result.answer);
// Output: "WWI start_year = 1914"

// Export brain state
const brainState = engine.exportBrainState();
// Saved to file: brain-state-1234567890.scx

// Later: Import brain state
engine.importBrainState(brainState);
