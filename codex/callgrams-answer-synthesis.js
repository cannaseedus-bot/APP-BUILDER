// Synthesizing Final Answer (from CALL-GRAMS-PRACTICAL-RUNTIME.md)
function synthesizeAnswer(agents, query) {
  // Run the network for N ticks
  for (let i = 0; i < 100; i++) {
    runAgentClock(agents);
    applySemanticForces(agents);
  }

  // Detect clusters
  const clusters = detectClusters(agents);

  // Collapse clusters
  const collapsedClusters = clusters.map(c => collapseCluster(c));

  // Sort by confidence
  collapsedClusters.sort((a, b) => b.confidence - a.confidence);

  // Take strongest cluster
  const strongest = collapsedClusters[0];

  if (!strongest || strongest.events.length === 0) {
    return {
      answer: "Insufficient grounding - no event anchors found",
      confidence: 0,
      explanation: "No factual events in dominant cluster"
    };
  }

  // Synthesize answer from events
  const answer = strongest.events
    .map(e => `${e.entity} ${e.key.replace(/_/g, ' ')} = ${e.value}`)
    .join(', ');

  return {
    answer: answer,
    confidence: strongest.confidence,
    cluster_size: strongest.size,
    roles: strongest.roles,
    explanation: `Answer collapsed from cluster of ${strongest.size} agents with confidence ${strongest.confidence.toFixed(3)}`
  };
}
