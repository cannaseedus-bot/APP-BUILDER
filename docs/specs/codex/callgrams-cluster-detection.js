// Cluster Detection (from CALL-GRAMS-PRACTICAL-RUNTIME.md)
function detectClusters(agents) {
  const clusters = [];
  const visited = new Set();

  for (const agent of agents) {
    if (visited.has(agent)) continue;

    // Depth-first search to find connected component
    const cluster = [];
    const stack = [agent];

    while (stack.length) {
      const a = stack.pop();
      if (visited.has(a)) continue;

      visited.add(a);
      cluster.push(a);

      a.neighbors.forEach(n => {
        if (!visited.has(n)) {
          stack.push(n);
        }
      });
    }

    clusters.push(cluster);
  }

  console.log(`Detected ${clusters.length} clusters`);
  return clusters;
}
