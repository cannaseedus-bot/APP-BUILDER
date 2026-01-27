// Complete Harvesting Pipeline (from CALL-GRAMS-DATA-HARVEST.md)

const fs = require('fs');

// Load results
const results = JSON.parse(fs.readFileSync('cluster/results.json'));
const results1 = JSON.parse(fs.readFileSync('cluster/results1.json'));

// Extract training data
const trainingData = exportTrainingDataset(results, 'datasets/training.jsonl');
console.log(`✅ ${trainingData.length} training examples`);

// Extract RLHF data
const rlhfData = exportRLHFDataset(results, 'datasets/rlhf_preferences.jsonl');
console.log(`✅ ${rlhfData.length} RLHF preference pairs`);

// Extract best deltas
const topDeltas = results.results
  .sort((a, b) => b.result.accuracy - a.result.accuracy)
  .slice(0, 10)
  .map(run => ({
    delta_ref: `scxq2://deltas/run_${run.job_index}.delta`,
    accuracy: run.result.accuracy,
    loss: run.result.loss
  }));

fs.writeFileSync('datasets/top_deltas.json', JSON.stringify(topDeltas, null, 2));
console.log(`✅ Top 10 deltas saved`);

// Quick answer using best delta
const bestDelta = topDeltas[0];
const answer = await quickWeightAnswer("Write Python function to sort list", bestDelta);
console.log(answer);
// {
//   answer: "def sort_list(lst): return sorted(lst)",
//   accuracy: 0.9218,
//   load_time: "100ms",
//   total_time: "150ms"
// }
