// Collapsing Clusters to Answers (from CALL-GRAMS-PRACTICAL-RUNTIME.md)
function collapseCluster(cluster) {
  let totalActivation = 0;
  let events = [];
  let roles = {};

  cluster.forEach(agent => {
    totalActivation += agent.state.activation;

    // Collect events
    if (agent.role === 'event') {
      events.push(agent.event);
    }

    // Count role distribution
    roles[agent.role] = (roles[agent.role] || 0) + 1;
  });

  // Calculate confidence using tanh (bounded 0-1)
  const confidence = Math.tanh(totalActivation / cluster.length);

  return {
    size: cluster.length,
    activation: totalActivation,
    confidence: confidence,
    events: events,
    roles: roles,
    dominant_role: Object.keys(roles).reduce((a, b) =>
      roles[a] > roles[b] ? a : b
    )
  };
}
