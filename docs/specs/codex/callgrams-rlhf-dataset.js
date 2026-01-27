// RLHF Dataset Creation (from CALL-GRAMS-DATA-HARVEST.md)

/**
 * Create RLHF preference pairs from cluster results
 */

function createRLHFDataset(results) {
  const rlhfData = [];

  // Sort runs by accuracy
  const sortedRuns = results.results.sort((a, b) =>
    b.result.accuracy - a.result.accuracy
  );

  // Create preference pairs: high-accuracy vs low-accuracy
  for (let i = 0; i < sortedRuns.length / 2; i++) {
    const betterRun = sortedRuns[i];
    const worseRun = sortedRuns[sortedRuns.length - 1 - i];

    const pair = {
      prompt: `Train model with epochs=${betterRun.result.epochs}`,

      chosen: {
        response: `Model achieved accuracy ${betterRun.result.accuracy}`,
        loss: betterRun.result.loss,
        accuracy: betterRun.result.accuracy,
        delta_ref: `scxq2://deltas/run_${betterRun.job_index}.delta`
      },

      rejected: {
        response: `Model achieved accuracy ${worseRun.result.accuracy}`,
        loss: worseRun.result.loss,
        accuracy: worseRun.result.accuracy,
        delta_ref: `scxq2://deltas/run_${worseRun.job_index}.delta`
      },

      preference_strength: betterRun.result.accuracy - worseRun.result.accuracy
    };

    rlhfData.push(pair);
  }

  return rlhfData;
}

// Export for RLHF training
function exportRLHFDataset(results, filename) {
  const rlhfData = createRLHFDataset(results);

  const jsonl = rlhfData
    .map(pair => JSON.stringify(pair))
    .join('\n');

  fs.writeFileSync(filename, jsonl);

  console.log(`✅ Exported ${rlhfData.length} RLHF preference pairs to ${filename}`);
  return rlhfData;
}

// Usage
const rlhfDataset = exportRLHFDataset(results, 'rlhf_preferences.jsonl');

// Result: rlhf_preferences.jsonl
// {"prompt":"Train model...","chosen":{"response":"...accuracy 0.9218",...},"rejected":{"response":"...accuracy 0.0079",...},"preference_strength":0.9139}
// ... 500 pairs
