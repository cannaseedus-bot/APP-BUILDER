// Force-Based Clustering (from CALL-GRAMS-PRACTICAL-RUNTIME.md)
function applySemanticForces(agents) {
  agents.forEach(agent => {
    let fx = 0, fy = 0, fz = 0;

    // Attraction to highly connected neighbors
    agent.neighbors.forEach(neighbor => {
      const dx = neighbor.mesh.position[0] - agent.mesh.position[0];
      const dy = neighbor.mesh.position[1] - agent.mesh.position[1];
      const dz = neighbor.mesh.position[2] - agent.mesh.position[2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

      // Attractive force proportional to signal strength
      const strength = neighbor.state.activation;
      const force = strength * 0.001;

      fx += (dx / dist) * force;
      fy += (dy / dist) * force;
      fz += (dz / dist) * force;
    });

    // Repulsion from all other agents
    agents.forEach(other => {
      if (other === agent) return;

      const dx = agent.mesh.position[0] - other.mesh.position[0];
      const dy = agent.mesh.position[1] - other.mesh.position[1];
      const dz = agent.mesh.position[2] - other.mesh.position[2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

      if (dist < 0.1) return;  // Avoid division by zero

      // Repulsive force
      const force = 0.1 / (dist * dist);

      fx += (dx / dist) * force;
      fy += (dy / dist) * force;
      fz += (dz / dist) * force;
    });

    // Apply forces
    agent.mesh.position[0] += fx;
    agent.mesh.position[1] += fy;
    agent.mesh.position[2] += fz;
  });
}

// Result: Clusters form automatically. Highly connected agents condense into spatial clusters.
