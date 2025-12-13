// The Complete Cognitive Clock (from CALL-GRAMS-PRACTICAL-RUNTIME.md)

function runAgentClock(agents, frameCount) {
  // 1. Each agent executes locally
  agents.forEach(agent => agent.tick());

  // 2. Apply semantic forces (clustering)
  if (frameCount % 10 === 0) {
    applySemanticForces(agents);
  }

  // 3. Rebuild mesh network (every 100 frames)
  if (frameCount % 100 === 0) {
    linkAgents(agents, 3.0);
  }

  // 4. Update visualization
  updateVisuals(agents);
}

function updateVisuals(agents) {
  agents.forEach(agent => {
    const mesh = agent.mesh;

    // Map activation to visual properties
    const activation = Math.tanh(agent.state.activation);

    // Update color based on role and activation
    const roleColors = {
      'pattern': [0.09, 0.95, 0.67],   // Green
      'event': [1.0, 0.2, 0.2],         // Red
      'invariant': [0.4, 0.4, 1.0],     // Blue
      'translator': [1.0, 0.8, 0.2],    // Yellow
      'output': [0.9, 0.4, 1.0]         // Purple
    };

    const baseColor = roleColors[agent.role] || [0.5, 0.5, 0.5];
    const brightness = 0.5 + (activation * 0.5);

    // This affects mesh rendering
    mesh.activationLevel = activation;
    mesh.baseColor = baseColor;
    mesh.brightness = brightness;
  });
}
