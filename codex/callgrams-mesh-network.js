// Mesh Network Topology - Automatic Clustering (from CALL-GRAMS-PRACTICAL-RUNTIME.md)

/**
 * Proximity = Similarity in Semantic Space
 * Agents that exchange high-frequency signals should be spatially close.
 */

function linkAgents(agents, radius = 3.0) {
  // Clear existing connections
  agents.forEach(a => a.neighbors.clear());

  // Build mesh network based on spatial proximity
  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      const a = agents[i];
      const b = agents[j];

      // Calculate Euclidean distance
      const dx = a.mesh.position[0] - b.mesh.position[0];
      const dy = a.mesh.position[1] - b.mesh.position[1];
      const dz = a.mesh.position[2] - b.mesh.position[2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

      // Connect if within radius
      if (dist < radius) {
        a.neighbors.add(b);
        b.neighbors.add(a);
      }
    }
  }

  console.log(`Mesh network built: ${agents.length} agents`);
}
