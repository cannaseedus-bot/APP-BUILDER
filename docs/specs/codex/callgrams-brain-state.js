// Complete Export/Import Brain State (from CALL-GRAMS-PRACTICAL-RUNTIME.md)

function exportBrainState(agents) {
  const snapshot = exportAgentGraph(agents);
  const compressed = scxq2Compress(snapshot);

  // Save to file
  const blob = new Blob([compressed], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `brain-state-${Date.now()}.scx`;
  a.click();

  console.log('EXPORT', `Brain state exported (${compressed.length} bytes)`);

  return compressed;
}

function importBrainState(scxBlob, engine) {
  const snapshot = scxq2Decompress(scxBlob);

  // Clear current state
  engine.clearScene();

  // Rebuild agents
  snapshot.agents.forEach(agentData => {
    // Create mesh
    const mesh = engine.createQuantumCube(
      agentData.position,
      1.0,
      getRoleColor(agentData.role)
    );

    // Create agent
    const agent = new KuhulAgent(mesh, {
      role: agentData.role,
      glyphs: agentData.glyphs
    });

    // Restore state
    agent.state = agentData.state;

    engine.agents.set(agentData.id, agent);
  });

  // Rebuild connections
  snapshot.agents.forEach(agentData => {
    const agent = engine.agents.get(agentData.id);
    agentData.neighbors.forEach(neighborId => {
      const neighbor = engine.agents.get(neighborId);
      if (neighbor) {
        agent.neighbors.add(neighbor);
      }
    });
  });

  console.log('IMPORT', `Brain state imported (${snapshot.agents.length} agents)`);
}
